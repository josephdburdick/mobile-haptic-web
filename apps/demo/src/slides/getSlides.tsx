import type { Slide } from "./slideTypes"
import { DrawerSlide } from "./DrawerSlide"
import { GoodbyeSlide } from "./GoodbyeSlide"
import { HapticRadioSlide } from "./HapticRadioSlide"
import { HomeSlide } from "./HomeSlide"
import { OrientationSlide } from "./OrientationSlide"
import { StreamingTextSlide } from "./StreamingTextSlide"
import { TruncatedTextSlide } from "./TruncatedTextSlide"

export function getSlides(activeSlideId: string): Slide[] {
  return [
    {
      id: "home",
      title: "Home",
      content: <HomeSlide />,
    },
    {
      id: "truncated-text",
      title: "TruncatedText",
      content: <TruncatedTextSlide />,
    },
    {
      id: "haptic-radio",
      title: "Radio Presets",
      content: <HapticRadioSlide />,
    },
    {
      id: "snap-drawer",
      title: "Snap Drawer",
      content: <DrawerSlide />,
    },
    {
      id: "orientation",
      title: "Orientation",
      content: <OrientationSlide />,
    },
    {
      id: "streaming-text",
      title: "AI Streaming Text",
      content: <StreamingTextSlide isVisible={activeSlideId === "streaming-text"} />,
    },
    {
      id: "goodbye",
      title: "Fin",
      content: <GoodbyeSlide />,
    },
  ]
}
