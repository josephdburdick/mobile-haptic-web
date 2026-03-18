type SlideNavItem = {
  id: string
  title: string
}

type SlideDotsProps = {
  slides: SlideNavItem[]
  activeSlideId: string
  onDotClick: (id: string) => void
}

export function SlideDots({
  slides,
  activeSlideId,
  onDotClick,
}: SlideDotsProps) {
  return (
    <nav className="slideDots" aria-label="Slide navigation">
      {slides.map((slide) => (
        <button
          key={slide.id}
          className="slideDot"
          data-active={slide.id === activeSlideId}
          onClick={() => onDotClick(slide.id)}
          aria-label={slide.title}
          type="button"
        />
      ))}
    </nav>
  )
}
