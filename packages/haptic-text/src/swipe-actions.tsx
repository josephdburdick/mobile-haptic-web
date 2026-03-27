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
   * until the user performs a real swipe gesture. Suppresses onReveal/haptics during
   * the animation.
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
    let wheelLogCount = 0;
    let scrollLogCount = 0;
    let cycleLogCount = 0;
    let debugId = 0;

    const emitDebug = (
      hypothesisId: "H1" | "H2" | "H3" | "H4" | "H5",
      location: string,
      message: string,
      data: Record<string, unknown>,
    ) => {
      debugId += 1;
      fetch("http://127.0.0.1:7375/ingest/681f4d44-69f4-4fad-b542-31d3d1a8a36b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "54278c",
        },
        body: JSON.stringify({
          sessionId: "54278c",
          runId: "pre-fix",
          hypothesisId,
          id: `swipe-actions-${Date.now()}-${debugId}`,
          location,
          message,
          data,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };

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

    const dismiss = (reason: "wheel" | "gesture-scroll") => {
      if (cancelled) return;
      // #region agent log
      emitDebug("H3", "swipe-actions.tsx:dismiss", "Dismiss auto peek", {
        reason,
        generationBefore: generation,
        scrollLeft: container.scrollLeft,
      });
      // #endregion
      cancelled = true;
      generation += 1;
      skipScrollDerivedUpdatesRef.current = false;
      syncPositionFromScroll();
    };

    let trackingUserGesture = false;
    let gestureStartScrollLeft = 0;
    const userSwipeThresholdPx = 8;

    const startTracking = () => {
      trackingUserGesture = true;
      gestureStartScrollLeft = container.scrollLeft;
      // #region agent log
      emitDebug("H2", "swipe-actions.tsx:startTracking", "Start user gesture tracking", {
        gestureStartScrollLeft,
      });
      // #endregion
    };

    const stopTracking = () => {
      trackingUserGesture = false;
    };

    const maybeDismissOnUserScroll = () => {
      if (!trackingUserGesture || cancelled) return;
      if (scrollLogCount < 6) {
        scrollLogCount += 1;
        // #region agent log
        emitDebug("H2", "swipe-actions.tsx:maybeDismissOnUserScroll", "Gesture scroll observed", {
          trackingUserGesture,
          scrollLeft: container.scrollLeft,
          gestureStartScrollLeft,
          delta: Math.abs(container.scrollLeft - gestureStartScrollLeft),
          userSwipeThresholdPx,
        });
        // #endregion
      }
      if (Math.abs(container.scrollLeft - gestureStartScrollLeft) >= userSwipeThresholdPx) {
        dismiss("gesture-scroll");
      }
    };

    const maybeDismissOnWheel = (event: WheelEvent) => {
      if (cancelled) return;
      const hasHorizontalIntent = Math.abs(event.deltaX) >= 1;
      const shiftWheelHorizontal = event.shiftKey && Math.abs(event.deltaY) >= 1;
      if (wheelLogCount < 6) {
        wheelLogCount += 1;
        // #region agent log
        emitDebug("H1", "swipe-actions.tsx:maybeDismissOnWheel", "Wheel input observed", {
          deltaX: event.deltaX,
          deltaY: event.deltaY,
          shiftKey: event.shiftKey,
          hasHorizontalIntent,
          shiftWheelHorizontal,
        });
        // #endregion
      }
      if (hasHorizontalIntent || shiftWheelHorizontal) {
        dismiss("wheel");
      }
    };

    container.addEventListener("pointerdown", startTracking);
    container.addEventListener("pointerup", stopTracking);
    container.addEventListener("pointercancel", stopTracking);
    container.addEventListener("touchstart", startTracking, { passive: true });
    container.addEventListener("touchend", stopTracking);
    container.addEventListener("touchcancel", stopTracking);
    container.addEventListener("scroll", maybeDismissOnUserScroll, { passive: true });
    container.addEventListener("wheel", maybeDismissOnWheel, { passive: true });

    const runCycle = () => {
      if (cancelled) return;
      const g = generation;
      if (cycleLogCount < 6) {
        cycleLogCount += 1;
        // #region agent log
        emitDebug("H4", "swipe-actions.tsx:runCycle", "Auto peek cycle start", {
          generation,
          cancelled,
          scrollLeft: container.scrollLeft,
        });
        // #endregion
      }
      skipScrollDerivedUpdatesRef.current = true;
      container.scrollTo({ left: 0, behavior: "smooth" });
      setTimeout(() => {
        if (g !== generation) {
          // #region agent log
          emitDebug("H4", "swipe-actions.tsx:runCycle-left-timeout", "Abort left timeout due generation change", {
            cycleGeneration: g,
            generation,
          });
          // #endregion
          return;
        }
        container.scrollTo({ left: centerChild.offsetLeft, behavior: "smooth" });
        setTimeout(() => {
          skipScrollDerivedUpdatesRef.current = false;
          if (g !== generation) {
            // #region agent log
            emitDebug("H4", "swipe-actions.tsx:runCycle-center-timeout", "Abort center timeout due generation change", {
              cycleGeneration: g,
              generation,
            });
            // #endregion
            return;
          }
          syncPositionFromScroll();
          setTimeout(() => {
            if (g !== generation) {
              // #region agent log
              emitDebug("H4", "swipe-actions.tsx:runCycle-repeat-timeout", "Abort repeat timeout due generation change", {
                cycleGeneration: g,
                generation,
              });
              // #endregion
              return;
            }
            runCycle();
          }, 2200);
        }, 480);
      }, 520);
    };

    // #region agent log
    emitDebug("H5", "swipe-actions.tsx:effect-init", "Peek hint effect initialized", {
      initialSnap,
      peekHintUntilInteraction,
      startScrollLeft: container.scrollLeft,
    });
    // #endregion

    const startId = setTimeout(() => {
      if (!cancelled) runCycle();
    }, 900);

    return () => {
      cancelled = true;
      generation += 1;
      clearTimeout(startId);
      skipScrollDerivedUpdatesRef.current = false;
      container.removeEventListener("pointerdown", startTracking);
      container.removeEventListener("pointerup", stopTracking);
      container.removeEventListener("pointercancel", stopTracking);
      container.removeEventListener("touchstart", startTracking);
      container.removeEventListener("touchend", stopTracking);
      container.removeEventListener("touchcancel", stopTracking);
      container.removeEventListener("scroll", maybeDismissOnUserScroll);
      container.removeEventListener("wheel", maybeDismissOnWheel);
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
