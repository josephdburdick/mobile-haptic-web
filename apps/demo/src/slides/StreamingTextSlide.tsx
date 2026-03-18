import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { HapticStreamingText } from "@j0e/haptic-text/haptic-streaming-text"
import { useHaptics } from "@j0e/haptic-text/use-haptics"
import type { HapticInput } from "web-haptics"

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

function buildIOSStreamPattern(
  sourceLength: number,
  charsPerTick: number,
  hapticEveryNChars: number,
  intervalMs: number,
): HapticInput {
  const pulseTimes: number[] = []
  let tick = 0
  let index = 0

  while (index < sourceLength) {
    tick += 1
    index = Math.min(index + charsPerTick, sourceLength)
    if (index > 0 && index % hapticEveryNChars === 0) {
      pulseTimes.push(tick * intervalMs)
    }
  }

  return pulseTimes.map((time, pulseIndex) => {
    const previousTime = pulseTimes[pulseIndex - 1] ?? 0
    const gapFromPreviousPulse = pulseIndex === 0 ? time : time - previousTime
    return {
      duration: 8,
      delay: pulseIndex === 0 ? 0 : Math.max(gapFromPreviousPulse - 8, 0),
      intensity: 0.3,
    }
  })
}

export function StreamingTextSlide({ isVisible, soundEnabled }: StreamingTextSlideProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const isIOS = isIOSDevice()
  const charsPerTick = isIOS ? 2 : 1
  const intervalMs = isIOS ? 60 : 30
  // iOS can drop feedback when updates fire too quickly.
  const hapticEveryNChars = isIOS ? 4 : 1
  const { trigger, cancel } = useHaptics({ debug: soundEnabled })
  const stopTimeoutRef = useRef<number | null>(null)
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
    }
  }, [cancel, clearStopTimeout, isVisible])

  useEffect(() => {
    return () => {
      clearStopTimeout()
      cancel()
    }
  }, [cancel, clearStopTimeout])

  const toggle = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      clearStopTimeout()
      cancel()
      return
    }

    if (isIOS) {
      const pattern = buildIOSStreamPattern(
        SOURCE_TEXT.length,
        charsPerTick,
        hapticEveryNChars,
        intervalMs,
      )

      if (Array.isArray(pattern) && pattern.length > 0) {
        trigger(pattern)
      }

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
    hapticEveryNChars,
    intervalMs,
    isIOS,
    isPlaying,
    totalStreamMs,
    trigger,
  ])

  return (
    <div className="stack">
      <p>
        Simulated token stream with feedback aligned to streamed text. Android
        pulses every few characters. iOS fires a haptic on play with audio
        for the stream — timer-driven haptics aren't allowed by Safari.
      </p>
      <HapticStreamingText
        sourceText={SOURCE_TEXT}
        charsPerTick={charsPerTick}
        hapticEveryNChars={isIOS ? Number.MAX_SAFE_INTEGER : hapticEveryNChars}
        intervalMs={intervalMs}
        playing={isPlaying}
        loop={!isIOS}
        debug={soundEnabled}
      />
      <button type="button" className="streamToggle" onClick={toggle}>
        {isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  )
}
