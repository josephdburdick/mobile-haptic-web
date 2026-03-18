import { useState } from "react";
import { useHaptics } from "./use-haptics";

type DrawerSnap = {
  id: string;
  label: string;
  heightPercent: number;
  hapticPreset: string | number | number[];
};

export type HapticSnapDrawerProps = {
  snaps?: DrawerSnap[];
  enabled?: boolean;
};

const defaultSnaps: DrawerSnap[] = [
  { id: "peek", label: "Peek", heightPercent: 22, hapticPreset: "light" },
  { id: "mid", label: "Mid", heightPercent: 52, hapticPreset: "medium" },
  { id: "full", label: "Full", heightPercent: 82, hapticPreset: "rigid" }
];

export function HapticSnapDrawer({
  snaps = defaultSnaps,
  enabled = true,
}: HapticSnapDrawerProps) {
  const [activeId, setActiveId] = useState(snaps[0]?.id ?? "");
  const { trigger } = useHaptics({ enabled });

  const current = snaps.find((item) => item.id === activeId) ?? snaps[0];

  if (!current) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "9 / 14",
        maxHeight: "min(420px, 55dvh)",
        position: "relative",
        border: "1px solid var(--border, hsl(217.2 32.6% 17.5%))",
        borderRadius: "12px",
        overflow: "hidden",
        background: "hsl(222 60% 6%)"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          display: "grid",
          placeItems: "center",
          opacity: 0.4,
          fontSize: "0.8rem",
          color: "var(--muted, hsl(215 20.2% 65.1%))"
        }}
      >
        <p style={{ margin: 0 }}>Content beneath drawer</p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${current.heightPercent}%`,
          background: "hsl(222.2 84% 4.9%)",
          borderTop: "1px solid var(--border, hsl(217.2 32.6% 17.5%))",
          padding: "0.75rem 1rem",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: "0.75rem",
          transition: "height 240ms cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div
          style={{
            width: "36px",
            height: "4px",
            borderRadius: "999px",
            background: "var(--border, hsl(217.2 32.6% 17.5%))",
            justifySelf: "center"
          }}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {snaps.map((snap) => (
            <button
              key={snap.id}
              type="button"
              onClick={() => {
                setActiveId(snap.id);
                trigger(snap.hapticPreset);
              }}
              style={{
                border: "1px solid var(--border, hsl(217.2 32.6% 17.5%))",
                borderRadius: "6px",
                background:
                  snap.id === activeId
                    ? "var(--accent, hsl(217.2 32.6% 17.5%))"
                    : "transparent",
                color: "inherit",
                padding: "0.3rem 0.7rem",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontFamily: "inherit"
              }}
            >
              {snap.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
