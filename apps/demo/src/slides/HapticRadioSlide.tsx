import { HapticRadioGroup } from "@j0e/haptic-text/haptic-radio-group"

type HapticRadioSlideProps = { debug?: boolean }

export function HapticRadioSlide({ debug }: HapticRadioSlideProps) {
  return (
    <div className="stack">
      <p>
        Each option fires a different haptic preset from{" "}
        <code>web-haptics</code>. Enable the sound toggle (top-right) to hear
        them on desktop.
      </p>
      <HapticRadioGroup
        name="haptic-preset"
        debug={debug}
        options={[
          { id: "selection", label: "Selection (8 ms)", hapticPreset: "selection" },
          { id: "light", label: "Light (15 ms)", hapticPreset: "light" },
          { id: "medium", label: "Medium (25 ms)", hapticPreset: "medium" },
          { id: "heavy", label: "Heavy (35 ms)", hapticPreset: "heavy" },
          { id: "soft", label: "Soft (40 ms)", hapticPreset: "soft" },
          { id: "rigid", label: "Rigid (10 ms)", hapticPreset: "rigid" },
          { id: "success", label: "Success (2 pulses)", hapticPreset: "success" },
          { id: "warning", label: "Warning (2 pulses)", hapticPreset: "warning" },
          { id: "error", label: "Error (3 pulses)", hapticPreset: "error" },
          { id: "nudge", label: "Nudge (strong → soft)", hapticPreset: "nudge" },
          { id: "buzz", label: "Buzz (1 s hold)", hapticPreset: "buzz" },
        ]}
      />
    </div>
  )
}
