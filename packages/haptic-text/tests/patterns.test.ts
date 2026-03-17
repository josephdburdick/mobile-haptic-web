import { describe, expect, it } from "vitest";
import { truncateByPattern } from "../src/patterns";

describe("truncateByPattern", () => {
  it("truncates UUID to last segment", () => {
    const value = "123e4567-e89b-12d3-a456-426614174000";
    expect(truncateByPattern(value, "uuid")).toBe("426614174000");
  });

  it("keeps non-UUID unchanged for uuid pattern", () => {
    const value = "not-a-uuid";
    expect(truncateByPattern(value, "uuid")).toBe(value);
  });

  it("masks email local-part when using email pattern", () => {
    expect(truncateByPattern("joe@example.com", "email")).toBe("jo*@example.com");
  });
});
