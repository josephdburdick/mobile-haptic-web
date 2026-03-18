import { useCallback, useEffect, useRef } from "react";
import { useWebHaptics } from "web-haptics/react";

const isIOS =
  typeof navigator !== "undefined" &&
  /iPhone|iPad|iPod/.test(navigator.userAgent);

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
      top: "-1px",
      left: "-1px",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clipPath: "inset(50%)",
      opacity: "0.01",
      pointerEvents: "none",
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("switch", "");
    checkbox.id = id;

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
  const labelRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    if (!isIOS) return;
    labelRef.current = acquireHapticSwitch();
    return () => {
      releaseHapticSwitch();
      labelRef.current = null;
    };
  }, []);

  const trigger = useCallback(
    (preset?: string | number | number[], opts?: { intensity?: number }) => {
      if (isIOS && labelRef.current) {
        labelRef.current.click();
      }

      if (!isIOS || options?.debug) {
        webHaptics.trigger(preset, opts);
      }
    },
    [webHaptics, options?.debug],
  );

  return {
    trigger,
    cancel: webHaptics.cancel,
    isSupported: isIOS || webHaptics.isSupported,
  };
}
