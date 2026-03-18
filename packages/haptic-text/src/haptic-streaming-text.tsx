import { useEffect, useMemo, useRef, useState } from "react";
import { useHaptics } from "./use-haptics";

export type HapticStreamingTextProps = {
  sourceText: string;
  charsPerTick?: number;
  intervalMs?: number;
  hapticEveryNChars?: number;
  hapticPreset?: string | number | number[];
  loop?: boolean;
  /** When false the streaming timer is paused. Defaults to false. */
  playing?: boolean;
  /** Controls whether haptic effects are emitted. Defaults to true. */
  enabled?: boolean;
  /** Called whenever visible text changes during playback. */
  onChange?: (visibleText: string, index: number) => void;
  debug?: boolean;
};

export function shouldTriggerHaptic(totalChars: number, hapticEveryNChars: number): boolean {
  return totalChars > 0 && totalChars % hapticEveryNChars === 0;
}

export function HapticStreamingText({
  sourceText,
  charsPerTick = 2,
  intervalMs = 55,
  hapticEveryNChars = 8,
  hapticPreset = "selection",
  loop = true,
  playing = false,
  enabled = true,
  onChange,
  debug,
}: HapticStreamingTextProps) {
  const [index, setIndex] = useState(0);
  const lastTriggerCharRef = useRef(0);
  const prevPlayingRef = useRef(playing);
  const { trigger } = useHaptics({ enabled, debug });

  useEffect(() => {
    if (playing && !prevPlayingRef.current) {
      setIndex(0);
      lastTriggerCharRef.current = 0;
    }
    prevPlayingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (current >= sourceText.length) {
          if (loop) {
            lastTriggerCharRef.current = 0;
            return 0;
          }
          return current;
        }
        return Math.min(current + charsPerTick, sourceText.length);
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [charsPerTick, intervalMs, loop, playing, sourceText.length]);

  useEffect(() => {
    if (!shouldTriggerHaptic(index, hapticEveryNChars)) return;
    if (lastTriggerCharRef.current === index) return;

    trigger(hapticPreset);
    lastTriggerCharRef.current = index;
  }, [hapticEveryNChars, hapticPreset, index, trigger]);

  const visibleText = useMemo(() => sourceText.slice(0, index), [index, sourceText]);

  useEffect(() => {
    onChange?.(visibleText, index);
  }, [index, onChange, visibleText]);

  return (
    <div
      style={{
        width: "100%",
        border: "1px solid var(--border, hsl(217.2 32.6% 17.5%))",
        borderRadius: "8px",
        padding: "1rem",
        background: "hsl(222 60% 6%)"
      }}
    >
      <p
        style={{
          minHeight: "6rem",
          lineHeight: 1.65,
          fontSize: "clamp(0.85rem, 1.3vw, 1rem)",
          color: "var(--fg, hsl(210 40% 98%))",
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        }}
      >
        {visibleText}
        <span style={{ opacity: 0.45, fontWeight: 300 }}>|</span>
      </p>
    </div>
  );
}
