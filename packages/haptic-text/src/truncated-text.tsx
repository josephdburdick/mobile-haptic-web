import { useMemo, useState, type MouseEvent } from "react";
import { useWebHaptics } from "web-haptics/react";
import { truncateByPattern, type TruncatePatternName } from "./patterns";

export type TruncatedTextProps = {
  text: string;
  pattern?: TruncatePatternName;
  truncate?: (value: string) => string;
  className?: string;
  enableCopy?: boolean;
  /** "always" shows the copy icon at all times, "expanded" only when text is expanded */
  copyVisibility?: "always" | "expanded";
  hapticPreset?: string | number | number[];
  debug?: boolean;
};

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function TruncatedText({
  text,
  pattern,
  truncate,
  className,
  enableCopy = true,
  copyVisibility = "always",
  hapticPreset = "selection",
  debug,
}: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { trigger } = useWebHaptics({ debug });

  const collapsedText = useMemo(() => {
    if (truncate) return truncate(text);
    if (pattern) return truncateByPattern(text, pattern);
    return text;
  }, [pattern, text, truncate]);

  const displayText = expanded ? text : collapsedText;
  const isTruncated = collapsedText !== text;

  async function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!enableCopy || !navigator.clipboard) return;

    await navigator.clipboard.writeText(text);
    trigger(hapticPreset);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function handleToggle() {
    if (!isTruncated) return;
    setExpanded((current) => !current);
    trigger(hapticPreset);
  }

  return (
    <span
      className={className}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleToggle();
        }
      }}
      role={isTruncated ? "button" : undefined}
      tabIndex={isTruncated ? 0 : undefined}
      aria-label={isTruncated ? "Toggle full text" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        cursor: isTruncated ? "pointer" : "default",
      }}
    >
      <code
        style={{
          fontSize: "clamp(0.78rem, 1.4vw, 0.92rem)",
          wordBreak: "break-all",
          whiteSpace: "pre-wrap",
          background: "none",
          padding: 0,
        }}
      >
        {displayText}
      </code>
      {enableCopy && (copyVisibility === "always" || expanded) ? (
        <button
          onClick={handleCopy}
          type="button"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          style={{
            flexShrink: 0,
            border: "none",
            borderRadius: "4px",
            padding: "0.25rem",
            background: "transparent",
            color: copied ? "hsl(142 76% 56%)" : "currentColor",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: copied ? 1 : 0.5,
            transition: "opacity 120ms ease, color 120ms ease",
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      ) : null}
    </span>
  );
}
