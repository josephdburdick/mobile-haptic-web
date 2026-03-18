import type { Slide } from "./slideTypes"
import { DrawerSlide } from "./DrawerSlide"
import { GoodbyeSlide } from "./GoodbyeSlide"
import { HapticRadioSlide } from "./HapticRadioSlide"
import { HomeSlide } from "./HomeSlide"
import { OrientationSlide } from "./OrientationSlide"
import { StreamingTextSlide } from "./StreamingTextSlide"
import { SwipeActionsSlide } from "./SwipeActionsSlide"
import { TruncatedTextSlide } from "./TruncatedTextSlide"

export function getSlides(activeSlideId: string, soundEnabled: boolean): Slide[] {
  return [
    {
      id: "home",
      title: "Home",
      content: <HomeSlide />,
    },
    {
      id: "truncated-text",
      title: "TruncatedText",
      content: <TruncatedTextSlide debug={soundEnabled} />,
    },
    {
      id: "haptic-radio",
      title: "Radio Presets",
      content: <HapticRadioSlide debug={soundEnabled} />,
    },
    {
      id: "swipe-actions",
      title: "Swipe Actions",
      content: <SwipeActionsSlide debug={soundEnabled} />,
    },
    {
      id: "snap-drawer",
      title: "Snap Drawer",
      content: <DrawerSlide debug={soundEnabled} />,
    },
    {
      id: "orientation",
      title: "Orientation",
      content: <OrientationSlide />,
    },
    {
      id: "streaming-text",
      title: "AI Streaming Text",
      content: <StreamingTextSlide isVisible={activeSlideId === "streaming-text"} debug={soundEnabled} />,
    },
    {
      id: "goodbye",
      title: "Fin",
      content: <GoodbyeSlide />,
    },
  ]
}
