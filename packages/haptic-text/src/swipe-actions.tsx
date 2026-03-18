import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useHaptics } from "./use-haptics";

export type SwipePosition = "left" | "center" | "right";

export type SwipeActionsProps = {
  children: ReactNode;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  onReveal?: (position: SwipePosition) => void;
  hapticPreset?: string | number | number[];
  enabled?: boolean;
  className?: string;
  style?: CSSProperties;
  debug?: boolean;
};

const containerBaseStyle: CSSProperties & { containerType?: string } = {
  display: "grid",
  // Keep the center track equal to one viewport width so side actions stay hidden until swipe.
  gridTemplateColumns: "auto 100% auto",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  containerType: "inline-size",
  scrollbarWidth: "none",
  touchAction: "pan-x",
  overscrollBehaviorX: "contain",
  WebkitOverflowScrolling: "touch",
};

const actionSlotStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
};

export function SwipeActions({
  children,
  leftAction,
  rightAction,
  onReveal,
  hapticPreset = "medium",
  enabled = true,
  className,
  style,
  debug,
}: SwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<SwipePosition>("center");
  const { trigger } = useHaptics({ enabled, debug });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const centerChild = container.children[1] as HTMLElement;
    if (centerChild) {
      requestAnimationFrame(() => {
        container.scrollLeft = centerChild.offsetLeft;
      });
    }
  }, []);

  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollCenter = container.scrollWidth / 2;
    const viewportCenter = container.clientWidth / 2;
    const current = container.scrollLeft + viewportCenter;
    const dx = current - scrollCenter;

    const threshold = container.clientWidth * 0.05;

    let newPosition: SwipePosition;
    if (dx < -threshold) {
      newPosition = "left";
    } else if (dx > threshold) {
      newPosition = "right";
    } else {
      newPosition = "center";
    }

    if (newPosition !== positionRef.current) {
      positionRef.current = newPosition;
      trigger(hapticPreset);
      onReveal?.(newPosition);
    }
  }, [trigger, hapticPreset, onReveal]);

  const handleScroll = useCallback(() => {
    updatePosition();
  }, [updatePosition]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") {
        updatePosition();
      }
    },
    [updatePosition],
  );

  const handleTouchMove = useCallback(() => {
    updatePosition();
  }, [updatePosition]);

  return (
    <div
      ref={containerRef}
      className={className}
      onScroll={handleScroll}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchMove}
      style={{ ...containerBaseStyle, ...style }}
    >
      <div style={{ ...actionSlotStyle, scrollSnapAlign: "start" }}>
        {leftAction}
      </div>
      <div style={{ width: "100%", minWidth: "100%", scrollSnapAlign: "center" }}>
        {children}
      </div>
      <div style={{ ...actionSlotStyle, scrollSnapAlign: "end" }}>
        {rightAction}
      </div>
    </div>
  );
}
