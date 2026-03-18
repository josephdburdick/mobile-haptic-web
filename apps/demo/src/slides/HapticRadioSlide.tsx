import { HapticRadioGroup } from "@j0e/haptic-text/haptic-radio-group"

type HapticRadioSlideProps = { soundEnabled?: boolean }

export function HapticRadioSlide({ soundEnabled }: HapticRadioSlideProps) {
  return (
    <div className="stack">
      <p>
        This curated set focuses on distinct haptic feels from{" "}
        <code>web-haptics</code>. Enable the sound toggle (top-right) to hear
        them on desktop.
      </p>
      <HapticRadioGroup
        name="haptic-preset"
        enabled={soundEnabled}
        options={[
          { id: "selection", label: "Tap (Selection, 8 ms)", hapticPreset: "selection" },
          { id: "medium", label: "Medium (25 ms)", hapticPreset: "medium" },
          { id: "heavy", label: "Heavy (35 ms)", hapticPreset: "heavy" },
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
