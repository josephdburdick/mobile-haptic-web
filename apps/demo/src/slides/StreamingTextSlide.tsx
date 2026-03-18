import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { HapticStreamingText } from "@j0e/haptic-text/haptic-streaming-text"
import { useHaptics } from "@j0e/haptic-text/use-haptics"

const SOURCE_TEXT =
  "We can add tactile rhythm to live AI output so updates feel intentional instead of noisy. This component throttles haptic triggers to avoid fatigue while still reinforcing each burst of new content."

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
  // iOS can drop feedback when updates fire too quickly.
  const hapticEveryNChars = isIOS ? 4 : 1
  const { trigger, cancel } = useHaptics({ enabled: soundEnabled })
  const stopTimeoutRef = useRef<number | null>(null)
  const lastHapticCharRef = useRef(0)
  const totalStreamMs = useMemo(
    () => Math.ceil(SOURCE_TEXT.length / charsPerTick) * intervalMs,
    [charsPerTick, intervalMs],
  )

  const clearStopTimeout = useCallback(() => {
    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current)
      stopTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setIsPlaying(false)
      clearStopTimeout()
      cancel()
      lastHapticCharRef.current = 0
    }
  }, [cancel, clearStopTimeout, isVisible])

  useEffect(() => {
    return () => {
      clearStopTimeout()
      cancel()
      lastHapticCharRef.current = 0
    }
  }, [cancel, clearStopTimeout])

  const handleStreamChange = useCallback(
    (_visibleText: string, index: number) => {
      if (index <= 0) return
      if (index - lastHapticCharRef.current < hapticEveryNChars) return
      trigger("selection")
      lastHapticCharRef.current = index
    },
    [hapticEveryNChars, trigger],
  )

  const toggle = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      clearStopTimeout()
      cancel()
      lastHapticCharRef.current = 0
      return
    }

    lastHapticCharRef.current = 0
    if (isIOS) {
      clearStopTimeout()
      stopTimeoutRef.current = window.setTimeout(() => {
        setIsPlaying(false)
        stopTimeoutRef.current = null
      }, totalStreamMs + 60)
    }

    setIsPlaying(true)
  }, [
    cancel,
    charsPerTick,
    clearStopTimeout,
    intervalMs,
    isIOS,
    isPlaying,
    totalStreamMs,
  ])

  return (
    <div className="stack">
      <p>
        Simulated token stream with haptics aligned to streamed letters.
      </p>
      <HapticStreamingText
        sourceText={SOURCE_TEXT}
        charsPerTick={charsPerTick}
        hapticEveryNChars={Number.MAX_SAFE_INTEGER}
        intervalMs={intervalMs}
        playing={isPlaying}
        loop={!isIOS}
        enabled={soundEnabled}
        onChange={handleStreamChange}
      />
      <button type="button" className="streamToggle" onClick={toggle}>
        {isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  )
}
