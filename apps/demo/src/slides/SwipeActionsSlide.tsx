import { useRef, useState } from "react"
import { SwipeActions, type SwipePosition } from "@j0e/haptic-text/swipe-actions"

const POSITION_LABELS: Record<SwipePosition, string> = {
  left: "← delete revealed",
  center: "⊙ centered",
  right: "archive revealed →",
}

type LogEntry = { id: number; row: string; message: string }

const ROWS = [
  { label: "Notification from Alex", detail: "Just now" },
  { label: "Meeting reminder", detail: "2:00 PM" },
  { label: "New comment on your post", detail: "5 min ago" },
]

type SwipeActionsSlideProps = { soundEnabled?: boolean }

export function SwipeActionsSlide({ soundEnabled }: SwipeActionsSlideProps) {
  const [log, setLog] = useState<LogEntry[]>([])
  const nextIdRef = useRef(0)

  function addLog(row: string, position: SwipePosition) {
    const id = nextIdRef.current
    nextIdRef.current += 1
    setLog((prev) => [{ id, row, message: POSITION_LABELS[position] }, ...prev].slice(0, 6))
  }

  return (
    <div className="stack">
      <p>
        Swipe rows left or right to reveal actions. Android vibrates at each
        snap point. iOS fires a haptic pulse on touch, with audio cues at
        transitions — Safari restricts haptics to tap-driven events.
      </p>

      <div className="swipeList">
        {ROWS.map((row, i) => (
          <SwipeActions
            key={i}
            className="swipeRow"
            leftAction={
              <button
                type="button"
                className="swipeAction swipeActionDelete"
                onClick={() => addLog(row.label, "left")}
              >
                ✕
              </button>
            }
            rightAction={
              <button
                type="button"
                className="swipeAction swipeActionArchive"
                onClick={() => addLog(row.label, "right")}
              >
                ✓
              </button>
            }
            onReveal={(pos) => addLog(row.label, pos)}
            debug={soundEnabled}
          >
            <div className="swipeContent">
              <span className="swipeContentLabel">{row.label}</span>
              <span className="swipeContentDetail">{row.detail}</span>
            </div>
          </SwipeActions>
        ))}
      </div>

      <div className="swipeLog">
        {log.length === 0 ? (
          <span className="swipeLogEmpty">Swipe a row to see events</span>
        ) : (
          log.map((entry) => (
            <p key={entry.id} className="swipeLogEntry">
              <span className="swipeLogRow">{entry.row}</span>{" "}
              {entry.message}
            </p>
          ))
        )}
      </div>
    </div>
  )
}
