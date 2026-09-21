// Normalization tests (docs/DATA.md §8, AGENTS.md §9-10).
// The search key must fold case/width/whitespace WITHOUT touching Falam
// spelling semantics: diacritics (ṭ, ā) survive and stay distinctive.

import { describe, expect, it } from "vitest";
import { isBlankQuery, normalizeSearchKey } from "./normalize";

describe("normalizeSearchKey", () => {
  it("lowercases, trims, and collapses whitespace", () => {
    expect(normalizeSearchKey("  BiakInn   Hmun  ")).toBe("biakinn hmun");
  });

  it("folds Unicode compatibility variants (NFKC)", () => {
    // Fullwidth latin used by some keyboards/IMEs.
    expect(normalizeSearchKey("ｎｕ")).toBe("nu");
    expect(normalizeSearchKey("ﬁ")).toBe("fi");
  });

  it("preserves Falam diacritics instead of stripping them", () => {
    expect(normalizeSearchKey("ṬHA")).toBe("ṭha");
    expect(normalizeSearchKey("nâm")).toBe("nâm");
  });

  it("keeps look-alike spellings distinct for search", () => {
    // tha (sinew) vs ṭha (good) are different words — normalization must
    // never merge them.
    expect(normalizeSearchKey("tha")).not.toBe(normalizeSearchKey("ṭha"));
    expect(normalizeSearchKey("pa")).not.toBe(normalizeSearchKey("paa"));
  });

  it("handles empty input", () => {
    expect(normalizeSearchKey("")).toBe("");
    expect(normalizeSearchKey("   ")).toBe("");
  });
});

describe("isBlankQuery", () => {
  it("detects empty and whitespace-only queries", () => {
    expect(isBlankQuery("")).toBe(true);
    expect(isBlankQuery("   ")).toBe(true);
    expect(isBlankQuery(" \t\n ")).toBe(true);
  });

  it("accepts real queries", () => {
    expect(isBlankQuery("nu")).toBe(false);
    expect(isBlankQuery(" ṭ ")).toBe(false);
  });
});
