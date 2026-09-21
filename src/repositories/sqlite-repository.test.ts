// SQLite row-mapping tests (src/repositories/sqlite-repository.ts).
// Covers only the pure `mapRowToEntry` boundary: JSON columns expand back
// into DATA.md structures, NULL columns stay omitted (never invented).

import { describe, expect, it } from "vitest";
import { mapRowToEntry } from "./sqlite-repository";

describe("mapRowToEntry", () => {
  it("expands JSON columns and preserves the display spelling", () => {
    const entry = mapRowToEntry({
      id: "entry_1",
      word: "MOCK-Ṭha",
      searchKey: "mock-ṭha",
      pronunciation: "mock-tʰa",
      partOfSpeech: "adjective",
      definitions: JSON.stringify([
        { id: "entry_1__sense1", english: "mock good" },
      ]),
      synonyms: JSON.stringify(["entry_2"]),
      antonyms: null,
      relatedWords: JSON.stringify(["entry_3"]),
      notes: "mock note",
      audioId: "000007",
      source: JSON.stringify({ sourceId: "s", sourceName: "Mock source" }),
      verificationStatus: "reviewed",
      createdAt: null,
      updatedAt: null,
    });
    expect(entry.word).toBe("MOCK-Ṭha");
    expect(entry.searchKey).toBe("mock-ṭha");
    expect(entry.definitions).toEqual([
      { id: "entry_1__sense1", english: "mock good" },
    ]);
    expect(entry.synonyms).toEqual(["entry_2"]);
    expect(entry.antonyms).toBeUndefined();
    expect(entry.source?.sourceName).toBe("Mock source");
    expect(entry.verificationStatus).toBe("reviewed");
  });

  it("omits every NULL column instead of inventing values", () => {
    const entry = mapRowToEntry({
      id: "entry_2",
      word: "MOCK-nu",
      searchKey: "mock-nu",
      pronunciation: null,
      partOfSpeech: null,
      definitions: JSON.stringify([{ id: "entry_2__sense1", english: "mock" }]),
      synonyms: null,
      antonyms: null,
      relatedWords: null,
      notes: null,
      audioId: null,
      source: null,
      verificationStatus: "draft",
      createdAt: null,
      updatedAt: null,
    });
    expect(entry.pronunciation).toBeUndefined();
    expect(entry.partOfSpeech).toBeUndefined();
    expect(entry.synonyms).toBeUndefined();
    expect(entry.source).toBeUndefined();
    expect("pronunciation" in entry).toBe(false);
  });
});
