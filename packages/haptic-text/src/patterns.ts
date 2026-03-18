export type TruncatePatternName = "uuid" | "email";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function truncateByPattern(text: string, pattern: TruncatePatternName): string {
  if (!text) {
    return text;
  }

  if (pattern === "uuid") {
    if (!UUID_REGEX.test(text)) {
      return text;
    }
    const segments = text.split("-");
    const first = segments[0];
    const last = segments[segments.length - 1];
    if (!first || !last) return text;
    return `${first}…${last.slice(-6)}`;
  }

  if (pattern === "email") {
    if (!EMAIL_REGEX.test(text)) {
      return text;
    }

    const [local, domain] = text.split("@");
    if (!local || !domain) {
      return text;
    }

    const visible = local.slice(0, 2);
    return `${visible}…@${domain}`;
  }

  return text;
}
