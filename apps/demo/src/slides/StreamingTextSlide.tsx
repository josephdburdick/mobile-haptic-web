import { useCallback, useEffect, useState } from "react"
import { HapticStreamingText } from "@j0e/haptic-text/haptic-streaming-text"

type StreamingTextSlideProps = {
  isVisible: boolean
  soundEnabled?: boolean
}

function isIOSDevice() {
  if (typeof navigator === "undefined") return false
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  )
}

export function StreamingTextSlide({ isVisible, soundEnabled }: StreamingTextSlideProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const isIOS = isIOSDevice()
  const charsPerTick = isIOS ? 2 : 1
  const intervalMs = isIOS ? 60 : 30
  // iOS can drop feedback if triggers are fired too quickly from timer-driven updates.
  const hapticEveryNChars = isIOS ? 4 : 1

  useEffect(() => {
    if (!isVisible) setIsPlaying(false)
  }, [isVisible])

  const toggle = useCallback(() => setIsPlaying((v) => !v), [])

  return (
    <div className="stack">
      <p>
        Simulated token stream with haptics aligned to streamed letters.
      </p>
      <HapticStreamingText
        sourceText="We can add tactile rhythm to live AI output so updates feel intentional instead of noisy. This component throttles haptic triggers to avoid fatigue while still reinforcing each burst of new content."
        charsPerTick={charsPerTick}
        hapticEveryNChars={hapticEveryNChars}
        intervalMs={intervalMs}
        playing={isPlaying}
        debug={soundEnabled}
      />
      <button type="button" className="streamToggle" onClick={toggle}>
        {isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  )
}
