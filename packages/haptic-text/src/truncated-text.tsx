import { useMemo, useState, type MouseEvent } from "react";
import { useWebHaptics } from "web-haptics/react";
import { truncateByPattern, type TruncatePatternName } from "./patterns";

export type TruncatedTextProps = {
  text: string;
  pattern?: TruncatePatternName;
  truncate?: (value: string) => string;
  className?: string;
  copyButtonLabel?: string;
  enableCopy?: boolean;
  hapticPreset?: string | number | number[];
};

export function TruncatedText({
  text,
  pattern,
  truncate,
  className,
  copyButtonLabel = "Copy",
  enableCopy = true,
  hapticPreset = "nudge"
}: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { trigger } = useWebHaptics();

  const collapsedText = useMemo(() => {
    if (truncate) return truncate(text);
    if (pattern) return truncateByPattern(text, pattern);
    return text;
  }, [pattern, text, truncate]);

  const displayText = expanded ? text : collapsedText;

  async function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!enableCopy || !navigator.clipboard) return;

    await navigator.clipboard.writeText(text);
    trigger(hapticPreset);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function handleToggle() {
    setExpanded((current) => !current);
    trigger(hapticPreset);
  }

  return (
    <div
      className={className}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleToggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Toggle full text"
      style={{
        padding: "0.85rem 1rem",
        border: "1px solid var(--border, hsl(217.2 32.6% 17.5%))",
        borderRadius: "8px",
        background: "hsl(222 60% 6%)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        transition: "background 120ms ease"
      }}
    >
      <code
        style={{
          flex: 1,
          fontSize: "clamp(0.78rem, 1.4vw, 0.92rem)",
          wordBreak: "break-all",
          whiteSpace: "pre-wrap",
          background: "none",
          padding: 0
        }}
      >
        {displayText}
      </code>
      {expanded && enableCopy ? (
        <button
          onClick={handleCopy}
          type="button"
          style={{
            flexShrink: 0,
            border: "1px solid var(--border, hsl(217.2 32.6% 17.5%))",
            borderRadius: "6px",
            padding: "0.2rem 0.55rem",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontFamily: "inherit"
          }}
        >
          {copied ? "Copied" : copyButtonLabel}
        </button>
      ) : null}
    </div>
  );
}
