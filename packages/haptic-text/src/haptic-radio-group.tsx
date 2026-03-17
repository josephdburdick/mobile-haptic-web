import { useState } from "react";
import { useWebHaptics } from "web-haptics/react";

export type HapticRadioOption = {
  id: string;
  label: string;
  hapticPreset: string | number | number[];
};

export type HapticRadioGroupProps = {
  name: string;
  options: HapticRadioOption[];
  defaultOptionId?: string;
};

export function HapticRadioGroup({ name, options, defaultOptionId }: HapticRadioGroupProps) {
  const [selectedId, setSelectedId] = useState(defaultOptionId ?? options[0]?.id ?? "");
  const { trigger } = useWebHaptics();

  return (
    <fieldset
      style={{
        border: "1px solid var(--border, hsl(217.2 32.6% 17.5%))",
        borderRadius: "8px",
        padding: "1rem",
        display: "grid",
        gap: "0.7rem"
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
      {options.map((option) => (
        <label
          key={option.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
        >
          <input
            type="radio"
            name={name}
            checked={selectedId === option.id}
            onChange={() => {
              setSelectedId(option.id);
              trigger(option.hapticPreset);
            }}
            style={{ accentColor: "hsl(210 40% 98%)" }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
