// Dataset summary tests (More → Data section). Buckets count exactly what
// the dataset declares — including zeros — and sources deduplicate in
// first-seen order with "Unknown" for unsourced entries.

import { describe, expect, it } from "vitest";
import type { DictionaryEntry } from "@/types/dictionary";
import {
  formatVerificationCounts,
  summarizeDictionary,
} from "./dictionary-stats";

function mockEntry(
  id: string,
  word: string,
  status: DictionaryEntry["verificationStatus"],
  sourceName?: string,
): DictionaryEntry {
  return {
    id,
    word,
    searchKey: word.toLowerCase(),
    definitions: [{ id: `${id}__sense1`, english: `English for ${word}` }],
    ...(sourceName !== undefined
      ? { source: { sourceId: "s", sourceName } }
      : {}),
    verificationStatus: status,
  };
}

describe("summarizeDictionary", () => {
  it("buckets verification statuses including zeros", () => {
    const summary = summarizeDictionary([
      mockEntry("1", "MOCK-a", "draft", "Mock source"),
      mockEntry("2", "MOCK-b", "reviewed", "Mock source"),
      mockEntry("3", "MOCK-c", "draft"),
    ]);
    expect(summary).toEqual({
      total: 3,
      verified: 0,
      reviewed: 1,
      draft: 2,
      sources: ["Mock source", "Unknown"],
    });
  });

  it("summarizes an empty dataset honestly", () => {
    expect(summarizeDictionary([])).toEqual({
      total: 0,
      verified: 0,
      reviewed: 0,
      draft: 0,
      sources: ["Unknown"],
    });
  });

  it("formats the verification line", () => {
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
});
