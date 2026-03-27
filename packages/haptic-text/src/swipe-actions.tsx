import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useHaptics } from "./use-haptics";

export type SwipePosition = "left" | "center" | "right";

export type SwipeActionsProps = {
  children: ReactNode;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  onReveal?: (position: SwipePosition) => void;
  /** Resting snap after mount: left / center / right. Default center. */
  initialSnap?: SwipePosition;
  /**
   * When true, briefly scrolls to reveal the left action and back to center on a loop
   * until the user touches the row. Suppresses onReveal/haptics during the animation.
   */
  peekHintUntilInteraction?: boolean;
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
  initialSnap = "center",
  peekHintUntilInteraction = false,
  hapticPreset = "medium",
  enabled = true,
  className,
  style,
  debug,
}: SwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<SwipePosition>(initialSnap);
  const skipScrollDerivedUpdatesRef = useRef(false);
  const { trigger } = useHaptics({ enabled, debug });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const centerChild = container.children[1] as HTMLElement;
    if (!centerChild) return;
    requestAnimationFrame(() => {
      skipScrollDerivedUpdatesRef.current = true;
      let scrollLeft: number;
      if (initialSnap === "left") {
        scrollLeft = 0;
      } else if (initialSnap === "right") {
        scrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      } else {
        scrollLeft = centerChild.offsetLeft;
      }
      container.scrollLeft = scrollLeft;
      positionRef.current = initialSnap;
      requestAnimationFrame(() => {
        skipScrollDerivedUpdatesRef.current = false;
      });
    });
  }, [initialSnap]);

  useEffect(() => {
    if (!peekHintUntilInteraction) return;
    const container = containerRef.current;
    if (!container) return;
    const centerChild = container.children[1] as HTMLElement;
    if (!centerChild) return;

    let cancelled = false;
    let generation = 0;

    const syncPositionFromScroll = () => {
      const scrollCenter = container.scrollWidth / 2;
      const viewportCenter = container.clientWidth / 2;
      const current = container.scrollLeft + viewportCenter;
      const dx = current - scrollCenter;
      const threshold = container.clientWidth * 0.05;
      if (dx < -threshold) {
        positionRef.current = "left";
      } else if (dx > threshold) {
        positionRef.current = "right";
      } else {
        positionRef.current = "center";
      }
    };

    const dismiss = () => {
      if (cancelled) return;
      cancelled = true;
      generation += 1;
      skipScrollDerivedUpdatesRef.current = false;
      syncPositionFromScroll();
    };

    container.addEventListener("pointerdown", dismiss);
    container.addEventListener("touchstart", dismiss, { passive: true });

    const runCycle = () => {
      if (cancelled) return;
      const g = generation;
      skipScrollDerivedUpdatesRef.current = true;
      container.scrollTo({ left: 0, behavior: "smooth" });
      setTimeout(() => {
        if (g !== generation) return;
        container.scrollTo({ left: centerChild.offsetLeft, behavior: "smooth" });
        setTimeout(() => {
          skipScrollDerivedUpdatesRef.current = false;
          if (g !== generation) return;
          syncPositionFromScroll();
          setTimeout(() => {
            if (g !== generation) return;
            runCycle();
          }, 2200);
        }, 480);
      }, 520);
    };

    const startId = setTimeout(() => {
      if (!cancelled) runCycle();
    }, 900);

    return () => {
      cancelled = true;
      generation += 1;
      clearTimeout(startId);
      skipScrollDerivedUpdatesRef.current = false;
      container.removeEventListener("pointerdown", dismiss);
      container.removeEventListener("touchstart", dismiss);
    };
  }, [peekHintUntilInteraction]);

  const updatePosition = useCallback(() => {
    if (skipScrollDerivedUpdatesRef.current) return;
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

  const handleTouchStart = useCallback(() => {
    trigger("selection");
  }, [trigger]);

  return (
    <div
      ref={containerRef}
      className={className}
      onScroll={handleScroll}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchMove}
      onTouchStart={handleTouchStart}
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
