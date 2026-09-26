// Verification-line tests (More → Data section). Every bucket prints,
// including zeros, with singular handling for one draft.

import { describe, expect, it } from "vitest";
import { formatVerificationCounts } from "./dictionary-stats";

describe("formatVerificationCounts", () => {
  it("formats every bucket including zeros", () => {
    expect(
      formatVerificationCounts({
        total: 25,
        verified: 0,
        reviewed: 0,
        draft: 25,
        sources: ["Unknown"],
      }),
    ).toBe("0 verified · 0 reviewed · 25 drafts");
  });

  it("uses the singular for one draft", () => {
    expect(
      formatVerificationCounts({
        total: 1,
        verified: 0,
        reviewed: 0,
        draft: 1,
        sources: ["Unknown"],
      }),
    ).toBe("0 verified · 0 reviewed · 1 draft");
  });
});
