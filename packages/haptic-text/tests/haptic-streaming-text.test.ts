import { describe, expect, it } from "vitest";
import { shouldTriggerHaptic } from "../src/haptic-streaming-text";

describe("shouldTriggerHaptic", () => {
  it("triggers at evenly divisible character boundaries", () => {
    expect(shouldTriggerHaptic(8, 4)).toBe(true);
    expect(shouldTriggerHaptic(12, 4)).toBe(true);
  });

  it("does not trigger at zero or non-boundary values", () => {
    expect(shouldTriggerHaptic(0, 4)).toBe(false);
    expect(shouldTriggerHaptic(9, 4)).toBe(false);
  });
});
