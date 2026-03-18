import { useState } from "react";
import { useHaptics } from "./use-haptics";

export type HapticRadioOption = {
  id: string;
  label: string;
  hapticPreset: string | number | number[];
};

export type HapticRadioGroupProps = {
  name: string;
  options: HapticRadioOption[];
  defaultOptionId?: string;
  enabled?: boolean;
  debug?: boolean;
};

export function HapticRadioGroup({
  name,
  options,
  defaultOptionId,
  enabled = true,
  debug,
}: HapticRadioGroupProps) {
  const [selectedId, setSelectedId] = useState(defaultOptionId ?? options[0]?.id ?? "");
  const { trigger } = useHaptics({ enabled, debug });

  return (
    <fieldset
      style={{
        border: "1px solid var(--border, hsl(217.2 32.6% 17.5%))",
        borderRadius: "8px",
        padding: "1rem",
        display: "grid",
        gap: "0.5rem"
      }}
    >
      <legend
        style={{
          padding: "0 0.4rem",
          fontSize: "0.78rem",
          color: "var(--muted, hsl(215 20.2% 65.1%))",
          letterSpacing: "0.04em"
        }}
      >
        Haptic presets
      </legend>
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <label
            key={option.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              cursor: "pointer",
              fontSize: "0.9rem",
              padding: "0.5rem 0.7rem",
              borderRadius: "6px",
              border: `1px solid ${isSelected ? "var(--fg, hsl(210 40% 98%))" : "var(--border, hsl(217.2 32.6% 17.5%))"}`,
              background: isSelected ? "hsla(210, 40%, 98%, 0.08)" : "transparent",
              transition: "background 120ms ease, border-color 120ms ease"
            }}
          >
            <input
              type="radio"
              name={name}
              checked={isSelected}
              onChange={() => {
                setSelectedId(option.id);
                trigger(option.hapticPreset);
              }}
              style={{ display: "none" }}
            />
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: `2px solid ${isSelected ? "var(--fg, hsl(210 40% 98%))" : "var(--muted, hsl(215 20.2% 65.1%))"}`,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                transition: "border-color 120ms ease"
              }}
            >
              {isSelected && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--fg, hsl(210 40% 98%))"
                  }}
                />
              )}
            </span>
            <span style={{ color: isSelected ? "var(--fg, hsl(210 40% 98%))" : "var(--muted, hsl(215 20.2% 65.1%))" }}>
              {option.label}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
