import { useEffect, useState } from "react"

function useOrientation() {
  const query =
    typeof window !== "undefined"
      ? window.matchMedia("(orientation: portrait)")
      : null
  const [isPortrait, setIsPortrait] = useState(query?.matches ?? true)

  useEffect(() => {
    if (!query) return
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches)
    query.addEventListener("change", handler)
    return () => query.removeEventListener("change", handler)
  }, [query])

  return isPortrait ? "portrait" : "landscape"
}

export function OrientationSlide() {
  const orientation = useOrientation()
  const isPortrait = orientation === "portrait"

  return (
    <div className="stack">
      <p>
        This slide detects your device orientation in real-time via{" "}
        <code>matchMedia</code>. Rotate your device to see it change.
      </p>
      <div className="orientationDisplay">
        <div className="orientationIcon" data-orientation={orientation}>
          <div className="orientationPhone">
            <div className="orientationNotch" />
          </div>
        </div>
        <div className="orientationLabel">
          <span className="orientationMode">{orientation}</span>
          <span className="orientationHint">
            {isPortrait
              ? "Rotate to landscape to see the change"
              : "Rotate to portrait to see the change"}
          </span>
        </div>
      </div>
      <div className="orientationContent">
        {isPortrait ? (
          <div className="orientationCard">
            <p className="orientationCardTitle">Portrait layout</p>
            <p>
              Single-column, stacked content optimized for one-handed use. Ideal for
              reading, scrolling feeds, and focused interactions.
            </p>
          </div>
        ) : (
          <div className="orientationCardRow">
            <div className="orientationCard">
              <p className="orientationCardTitle">Panel A</p>
              <p>Side-by-side layout unlocked in landscape.</p>
            </div>
            <div className="orientationCard">
              <p className="orientationCardTitle">Panel B</p>
              <p>More room for detail views or split controls.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
