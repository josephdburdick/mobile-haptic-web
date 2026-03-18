import { HapticRadioGroup } from "@j0e/haptic-text/haptic-radio-group"

export function HapticRadioSlide() {
  return (
    <div className="stack">
      <p>
        Each option fires a different haptic preset so you can feel the difference.
      </p>
      <HapticRadioGroup
        name="haptic-preset"
        options={[
          {
            id: "selection",
            label: "Selection (8 ms)",
            hapticPreset: "selection",
          },
          { id: "light", label: "Light (15 ms)", hapticPreset: "light" },
          { id: "medium", label: "Medium (25 ms)", hapticPreset: "medium" },
          { id: "heavy", label: "Heavy (35 ms)", hapticPreset: "heavy" },
          {
            id: "success",
            label: "Success (2 pulses)",
            hapticPreset: "success",
          },
        ]}
      />
    </div>
  )
}
