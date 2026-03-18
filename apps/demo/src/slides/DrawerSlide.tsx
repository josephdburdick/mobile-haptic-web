import { useEffect, useRef, useState } from "react"
import { Drawer } from "vaul"
import { useHaptics } from "@j0e/haptic-text/use-haptics"

const SNAP_POINTS = [0.25, 0.5, 0.85] as const

const SNAP_LABELS: Record<(typeof SNAP_POINTS)[number], string> = {
  0.25: "Peek",
  0.5: "Half",
  0.85: "Full",
}

const SNAP_HAPTICS: Record<(typeof SNAP_POINTS)[number], string> = {
  0.25: "light",
  0.5: "medium",
  0.85: "heavy",
}

type DrawerSlideProps = { soundEnabled?: boolean }

export function DrawerSlide({ soundEnabled }: DrawerSlideProps) {
  const [snap, setSnap] = useState<(typeof SNAP_POINTS)[number] | null>(SNAP_POINTS[1])
  const [open, setOpen] = useState(false)
  const { trigger } = useHaptics({ debug: soundEnabled })
  const prevSnapRef = useRef(snap)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (snap !== prevSnapRef.current && typeof snap === "number") {
      trigger(SNAP_HAPTICS[snap] ?? "selection")
    }
    prevSnapRef.current = snap
  }, [snap, trigger])

  const statusText =
    !open
      ? "Status: closed"
      : snap === null
        ? "Status: open (no snap point)"
        : `Status: open at ${SNAP_LABELS[snap]} (${Math.round(snap * 100)}%)`

  const setVaulSnapPoint = (nextSnap: string | number | null) => {
    if (nextSnap === null) {
      setSnap(null)
      return
    }

    if (
      typeof nextSnap === "number" &&
      SNAP_POINTS.includes(nextSnap as (typeof SNAP_POINTS)[number])
    ) {
      setSnap(nextSnap as (typeof SNAP_POINTS)[number])
    }
  }

  return (
    <div className="stack">
      <p>
        Use the button to open the Vaul drawer, then drag it on mobile to each
        snap point and feel different haptic intensity.
      </p>
      <Drawer.Root
        snapPoints={[...SNAP_POINTS]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setVaulSnapPoint}
        open={open}
        onOpenChange={(nextOpen) => {
          // Move focus off the trigger before Vaul applies modal aria-hidden.
          if (nextOpen) {
            const activeElement = document.activeElement
            if (activeElement instanceof HTMLElement) {
              activeElement.blur()
            }
          }
          setOpen(nextOpen)
        }}
        closeThreshold={0.28}
        dismissible
        modal
      >
        <div className="stack">
          <Drawer.Trigger asChild>
            <button type="button" className="streamToggle">
              Open Drawer
            </button>
          </Drawer.Trigger>
          <p className="drawerStatus">{statusText}</p>
        </div>
        <Drawer.Portal>
          <Drawer.Overlay className="drawerOverlay" />
          <Drawer.Content
            className="drawerContent"
            ref={contentRef}
            tabIndex={-1}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              contentRef.current?.focus()
            }}
          >
            <Drawer.Handle className="drawerHandle" />
            <div className="drawerBody">
              <Drawer.Title className="drawerTitle">Haptic Drawer</Drawer.Title>
              <Drawer.Description className="drawerDescription">
                Drag this drawer between snap points. Haptic strength increases as
                you move from Peek to Full.
              </Drawer.Description>
              <div className="drawerSnaps">
                {SNAP_POINTS.map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    className="drawerSnapPill"
                    data-active={snap === pt}
                    onClick={() => setSnap(pt)}
                  >
                    {SNAP_LABELS[pt]} ({Math.round(pt * 100)}%)
                  </button>
                ))}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
