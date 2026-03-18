import { useCallback, useEffect, useState } from "react"
import { HapticStreamingText } from "@j0e/haptic-text/haptic-streaming-text"

type StreamingTextSlideProps = {
  isVisible: boolean
}

export function StreamingTextSlide({ isVisible }: StreamingTextSlideProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const charsPerTick = 1
  const intervalMs = 30
  const hapticEveryNChars = 1

  useEffect(() => {
    if (!isVisible) setIsPlaying(false)
  }, [isVisible])

  const toggle = useCallback(() => setIsPlaying((v) => !v), [])

  return (
    <div className="stack">
      <p>
        Simulated token stream with haptics aligned to each streamed letter.
      </p>
      <HapticStreamingText
        sourceText="We can add tactile rhythm to live AI output so updates feel intentional instead of noisy. This component throttles haptic triggers to avoid fatigue while still reinforcing each burst of new content."
        charsPerTick={charsPerTick}
        hapticEveryNChars={hapticEveryNChars}
        intervalMs={intervalMs}
        playing={isPlaying}
      />
      <button type="button" className="streamToggle" onClick={toggle}>
        {isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  )
}
