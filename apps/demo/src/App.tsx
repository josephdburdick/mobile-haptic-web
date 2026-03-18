import { useEffect, useMemo, useRef, useState } from "react"
import { QrShare } from "./components/QrShare"
import { SlideDots } from "./components/SlideDots"
import { SoundToggle } from "./components/SoundToggle"
import { getSlides } from "./slides/getSlides"

function getCurrentSlideHash(): string {
  return window.location.hash.replace("#", "") || "home"
}

export function App() {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [activeSlideId, setActiveSlideId] = useState("home")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const slides = useMemo(() => getSlides(activeSlideId, soundEnabled), [activeSlideId, soundEnabled])
  const logoSrc = `${import.meta.env.BASE_URL}j0e-logo--solid.svg`

  function scrollToSlide(slideId: string) {
    const rail = railRef.current
    if (!rail) return
    const el = rail.querySelector<HTMLElement>(`[data-slide-id="${slideId}"]`)
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    })
  }

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const initialId = getCurrentSlideHash()
    const initialSlide = rail.querySelector<HTMLElement>(
      `[data-slide-id="${initialId}"]`,
    )
    if (initialSlide) {
      initialSlide.scrollIntoView({
        behavior: "auto",
        inline: "start",
        block: "nearest",
      })
      setActiveSlideId(initialId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!best) return

        const slideId = (best.target as HTMLElement).dataset.slideId
        if (!slideId) return

        setActiveSlideId(slideId)
        if (window.location.hash !== `#${slideId}`) {
          window.history.replaceState(null, "", `#${slideId}`)
        }
      },
      { root: rail, threshold: [0.6, 0.9] },
    )

    const elements = Array.from(
      rail.querySelectorAll<HTMLElement>("[data-slide-id]"),
    )
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <main className="pageShell">
      <a
        href="https://j0e.me"
        target="_blank"
        rel="noreferrer"
        className="siteLogo"
      >
        <img src={logoSrc} alt="j0e" className="siteLogoImg" />
      </a>
      <div className="slidesRail" ref={railRef}>
        {slides.map((slide) => (
          <section key={slide.id} className="slide" data-slide-id={slide.id}>
            <div className="slideInner">
              <p className="slideEyebrow">{slide.title}</p>
              {slide.content}
            </div>
          </section>
        ))}
      </div>
      <SlideDots
        slides={slides}
        activeSlideId={activeSlideId}
        onDotClick={scrollToSlide}
      />
      <QrShare activeSlideId={activeSlideId} />
      <SoundToggle
        enabled={soundEnabled}
        onToggle={() => setSoundEnabled((v) => !v)}
      />
    </main>
  )
}
