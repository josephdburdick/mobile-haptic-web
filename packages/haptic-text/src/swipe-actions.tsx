import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useWebHaptics } from "web-haptics/react";

export type SwipePosition = "left" | "center" | "right";

export type SwipeActionsProps = {
  children: ReactNode;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  onReveal?: (position: SwipePosition) => void;
  hapticPreset?: string | number | number[];
  className?: string;
  style?: CSSProperties;
  debug?: boolean;
};

const containerBaseStyle: CSSProperties & { containerType?: string } = {
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  containerType: "inline-size",
  scrollbarWidth: "none",
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
  className,
  style,
  debug,
}: SwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<SwipePosition>("center");
  const { trigger } = useWebHaptics({ debug });

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

  const handleScroll = useCallback(() => {
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

  return (
    <div
      ref={containerRef}
      className={className}
      onScroll={handleScroll}
      style={{ ...containerBaseStyle, ...style }}
    >
      <div style={{ ...actionSlotStyle, scrollSnapAlign: "start" }}>
        {leftAction}
      </div>
      <div style={{ width: "100cqw", scrollSnapAlign: "center" }}>
        {children}
      </div>
      <div style={{ ...actionSlotStyle, scrollSnapAlign: "end" }}>
        {rightAction}
      </div>
    </div>
  );
}
