import { defaultPatterns, type HapticInput, type TriggerOptions } from "web-haptics";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useWebHaptics } from "web-haptics/react";

const MAX_VIBRATION_MS = 1000;
const MIN_PULSE_INTERVAL_MS = 16;
const MAX_PULSE_INTERVAL_OFFSET_MS = 184;
const FALLBACK_INTENSITY = 0.5;

type VibrationStep = {
  duration: number;
  intensity?: number;
  delay?: number;
};

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

function clampIntensity(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeDuration(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(MAX_VIBRATION_MS, value);
}

function normalizeDelay(value: number | undefined) {
  if (value == null || !Number.isFinite(value) || value <= 0) return 0;
  return value;
}

function toSteps(input?: HapticInput): VibrationStep[] {
  if (input == null) {
    return [{ duration: 25, intensity: 0.7 }];
  }

  if (typeof input === "number") {
    return [{ duration: normalizeDuration(input) }];
  }

  if (typeof input === "string") {
    const preset = defaultPatterns[input as keyof typeof defaultPatterns];
    return preset ? preset.pattern.map((step) => ({ ...step })) : [];
  }

  if (Array.isArray(input)) {
    if (input.length === 0) return [];

    if (typeof input[0] === "number") {
      const values = input as number[];
      const steps: VibrationStep[] = [];
      for (let i = 0; i < values.length; i += 2) {
        const previousPause = i > 0 ? values[i - 1] : 0;
        steps.push({
          duration: normalizeDuration(values[i] ?? 0),
          ...(previousPause > 0 ? { delay: previousPause } : {}),
        });
      }
      return steps;
    }

    return (input as VibrationStep[]).map((step) => ({ ...step }));
  }

  return input.pattern.map((step) => ({ ...step }));
}

function pulseInterval(intensity: number) {
  return MIN_PULSE_INTERVAL_MS + (1 - intensity) * MAX_PULSE_INTERVAL_OFFSET_MS;
}

let sharedLabel: HTMLLabelElement | null = null;
let refCount = 0;

/**
 * iOS Safari doesn't support the Vibration API. The web-haptics library falls
 * back to a hidden checkbox-switch that triggers the Taptic Engine, but it
 * hides the element with `display:none` which removes it from the rendering
 * tree — so iOS never fires the haptic.
 *
 * We create our own checkbox-switch that is visually hidden but still rendered
 * (off-screen positioning) so the Taptic Engine fires when we `.click()` it.
 *
 * Requires iOS Settings → Sounds & Haptics → System Haptics to be enabled.
 */
function acquireHapticSwitch(): HTMLLabelElement {
  if (!sharedLabel) {
    const id = "haptic-ios-switch";
    const label = document.createElement("label");
    label.setAttribute("for", id);

    Object.assign(label.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "28px",
      height: "18px",
      opacity: "0.01",
      zIndex: "-1",
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("switch", "");
    checkbox.id = id;
    checkbox.style.all = "initial";
    checkbox.style.appearance = "auto";
    checkbox.style.width = "100%";
    checkbox.style.height = "100%";

    label.appendChild(checkbox);
    document.body.appendChild(label);
    sharedLabel = label;
  }
  refCount++;
  return sharedLabel;
}

function releaseHapticSwitch() {
  refCount--;
  if (refCount <= 0 && sharedLabel) {
    sharedLabel.remove();
    sharedLabel = null;
    refCount = 0;
  }
}

export type UseHapticsOptions = {
  debug?: boolean;
};

export function useHaptics(options?: UseHapticsOptions) {
  const webHaptics = useWebHaptics(options);
  const isIOS = useMemo(() => isIOSDevice(), []);
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const runTokenRef = useRef(0);

  const clearPendingFallback = useCallback(() => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    runTokenRef.current += 1;
  }, []);

  useEffect(() => {
    if (!isIOS) return;
    labelRef.current = acquireHapticSwitch();
    return () => {
      releaseHapticSwitch();
      labelRef.current = null;
    };
  }, [isIOS]);

  useEffect(() => clearPendingFallback, [clearPendingFallback]);

  const runIOSPattern = useCallback(
    (input?: HapticInput, opts?: TriggerOptions) => {
      if (!labelRef.current) return;
      const steps = toSteps(input);
      if (steps.length === 0) return;

      clearPendingFallback();
      const baseIntensity = clampIntensity(opts?.intensity ?? FALLBACK_INTENSITY);
      const segments: Array<{ end: number; isOn: boolean; intensity: number }> = [];
      let totalMs = 0;

      for (const step of steps) {
        const delay = normalizeDelay(step.delay);
        if (delay > 0) {
          totalMs += delay;
          segments.push({ end: totalMs, isOn: false, intensity: 0 });
        }

        const duration = normalizeDuration(step.duration);
        if (duration === 0) continue;

        totalMs += duration;
        segments.push({
          end: totalMs,
          isOn: true,
          intensity: clampIntensity(step.intensity ?? baseIntensity),
        });
      }

      if (segments.length === 0 || totalMs === 0) return;

      const token = runTokenRef.current;
      let startAt = 0;
      let lastPulseAt = Number.NEGATIVE_INFINITY;

      const firstSegment = segments[0];
      if (firstSegment.isOn) {
        labelRef.current.click();
        lastPulseAt = 0;
      }

      const tick = (timestamp: number) => {
        if (token !== runTokenRef.current) return;
        if (startAt === 0) startAt = timestamp;

        const elapsed = timestamp - startAt;
        if (elapsed >= totalMs) {
          rafIdRef.current = null;
          return;
        }

        const activeSegment = segments.find((segment) => elapsed < segment.end);
        if (activeSegment?.isOn) {
          const intervalMs = pulseInterval(activeSegment.intensity);
          if (elapsed - lastPulseAt >= intervalMs) {
            labelRef.current?.click();
            lastPulseAt = elapsed;
          }
        }

        rafIdRef.current = window.requestAnimationFrame(tick);
      };

      rafIdRef.current = window.requestAnimationFrame(tick);
    },
    [clearPendingFallback],
  );

  const trigger = useCallback(
    (preset?: HapticInput, opts?: TriggerOptions) => {
      if (isIOS && labelRef.current) {
        runIOSPattern(preset, opts);
      }

      if (!isIOS || options?.debug) {
        webHaptics.trigger(preset, opts);
      }
    },
    [isIOS, options?.debug, runIOSPattern, webHaptics],
  );

  const cancel = useCallback(() => {
    clearPendingFallback();
    if (!isIOS || options?.debug) {
      webHaptics.cancel();
    }
  }, [clearPendingFallback, isIOS, options?.debug, webHaptics]);

  return {
    trigger,
    cancel,
    isSupported: isIOS || webHaptics.isSupported,
  };
}
