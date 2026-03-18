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
      id: "orientation",
      title: "Orientation",
      content: <OrientationSlide />,
    },
    {
      id: "truncated-text",
      title: "TruncatedText",
      content: <TruncatedTextSlide soundEnabled={soundEnabled} />,
    },
    {
      id: "haptic-radio",
      title: "Radio Presets",
      content: <HapticRadioSlide soundEnabled={soundEnabled} />,
    },
    {
      id: "swipe-actions",
      title: "Swipe Actions",
      content: <SwipeActionsSlide soundEnabled={soundEnabled} />,
    },
    {
      id: "snap-drawer",
      title: "Snap Drawer",
      content: <DrawerSlide soundEnabled={soundEnabled} />,
    },
    {
      id: "streaming-text",
      title: "AI Streaming Text",
      content: <StreamingTextSlide isVisible={activeSlideId === "streaming-text"} soundEnabled={soundEnabled} />,
    },
    {
      id: "goodbye",
      title: "Fin",
      content: <GoodbyeSlide />,
    },
  ]
}
