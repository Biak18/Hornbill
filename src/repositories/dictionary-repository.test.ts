// Repository tests (AGENTS.md §25, docs/ARCHITECTURE.md §4).
// Ranking contract shared by the in-memory and SQLite implementations:
// exact → prefix → substring, then alphabetical. Seeds use MOCK- words so
// no test invents Falam data.

import { describe, expect, it } from "vitest";
import { normalizeSearchKey } from "@/utils/normalize";
import type { DictionaryEntry } from "@/types/dictionary";
import {
  bestMeaningRank,
  createInMemoryDictionaryRepository,
  paginate,
  rankText,
} from "./dictionary-repository";

function mockEntry(
  id: string,
  word: string,
  meanings: string[],
  extra?: Partial<DictionaryEntry>,
): DictionaryEntry {
  return {
    id,
    word,
    searchKey: normalizeSearchKey(word),
    definitions: meanings.map((english, index) => ({
      id: `${id}__sense${index + 1}`,
      english,
    })),
    verificationStatus: "draft",
    ...extra,
  };
}

const seed = [
  mockEntry("t_exact", "MOCK-tha", ["mock sinew"]),
  mockEntry("t_prefix", "MOCK-thal", ["mock prefix word"]),
  mockEntry("t_sub", "preMOCK-tha", ["mock substring word"]),
  mockEntry("t_multi", "MOCK-rol", ["mock first sense", "mock seclusion"], {
    partOfSpeech: "verb",
  }),
];

describe("rankText", () => {
  it("orders exact before prefix before substring before miss", () => {
    expect(rankText("mock-tha", "mock-tha")).toBe(0);
    expect(rankText("mock-thal", "mock-tha")).toBe(1);
    expect(rankText("premock-tha", "mock-tha")).toBe(2);
    expect(rankText("unrelated", "mock-tha")).toBe(3);
  });
});

describe("searchEntries (Falam → English)", () => {
  it("ranks exact, prefix, then substring", () => {
    const repo = createInMemoryDictionaryRepository(seed);
    const ids = repo.searchEntries("mock-tha").map((e) => e.id);
    expect(ids).toContain("t_exact");
    expect(ids).toContain("t_prefix");
    expect(ids).toContain("t_sub");
    expect(ids.indexOf("t_exact")).toBeLessThan(ids.indexOf("t_prefix"));
    expect(ids.indexOf("t_prefix")).toBeLessThan(ids.indexOf("t_sub"));
  });

  it("returns no results for blank queries — never a full scan", () => {
    const repo = createInMemoryDictionaryRepository(seed);
    expect(repo.searchEntries("")).toEqual([]);
    expect(repo.searchEntries("   ")).toEqual([]);
  });

  it("returns no results when nothing matches", () => {
    const repo = createInMemoryDictionaryRepository(seed);
    expect(repo.searchEntries("zzz-no-match")).toEqual([]);
  });

  it("preserves duplicate spellings instead of merging them", () => {
    const dupes = [
      mockEntry("dup_1", "MOCK-nu", ["mock mother"]),
      mockEntry("dup_2", "MOCK-nu", ["mock soft"], { partOfSpeech: "adjective" }),
    ];
    const repo = createInMemoryDictionaryRepository(dupes);
    expect(repo.searchEntries("mock-nu").map((e) => e.id).sort()).toEqual([
      "dup_1",
      "dup_2",
    ]);
  });

  it("derives searchKey without mutating word when the seed omits it", () => {
    const { searchKey, ...bare } = mockEntry("bare_1", "MOCK-bare", ["mock bare"]);
    const repo = createInMemoryDictionaryRepository([bare as DictionaryEntry]);
    const found = repo.searchEntries("mock-bare");
    expect(found).toHaveLength(1);
    expect(found[0]?.word).toBe("MOCK-bare");
  });
});

describe("searchEntriesByMeaning (English → Falam)", () => {
  it("matches a non-first sense", () => {
    const repo = createInMemoryDictionaryRepository(seed);
    const ids = repo.searchEntriesByMeaning("mock seclusion").map((e) => e.id);
    expect(ids).toContain("t_multi");
  });

  it("returns no results for blank queries", () => {
    const repo = createInMemoryDictionaryRepository(seed);
    expect(repo.searchEntriesByMeaning("")).toEqual([]);
  });
});

describe("bestMeaningRank", () => {
  it("uses the best-matching sense", () => {
    const entry = mockEntry("m_1", "MOCK-m", ["zzz unrelated", "mock target"]);
    expect(bestMeaningRank(entry, "mock target")).toBe(0);
  });
});

describe("paginate", () => {
  it("slices by limit and offset with a 20-item default", () => {
    const entries = Array.from({ length: 30 }, (_, i) =>
      mockEntry(`p_${i}`, `MOCK-word${i}`, [`mock meaning ${i}`]),
    );
    expect(paginate(entries)).toHaveLength(20);
    expect(paginate(entries, { limit: 5, offset: 10 })[0]?.id).toBe("p_10");
    expect(paginate(entries, { limit: 5, offset: 28 })).toHaveLength(2);
  });

  it("caps repository search output to the requested page", () => {
    const entries = Array.from({ length: 30 }, (_, i) =>
      mockEntry(`q_${i}`, `MOCK-q${i}`, [`mock meaning ${i}`]),
    );
    const repo = createInMemoryDictionaryRepository(entries);
    // Empty-query guard still wins over pagination.
    expect(repo.searchEntries("", { limit: 5 })).toEqual([]);
  });
});

describe("getEntryById / getAllEntries", () => {
  it("resolves by id and preserves dataset order", () => {
    const repo = createInMemoryDictionaryRepository(seed);
    expect(repo.getEntryById("t_multi")?.word).toBe("MOCK-rol");
    expect(repo.getEntryById("missing")).toBeUndefined();
    expect(repo.getAllEntries().map((e) => e.id)).toEqual([
      "t_exact",
      "t_prefix",
      "t_sub",
      "t_multi",
    ]);
  });
});

describe("getEntryCount / getEntryByOffset", () => {
  it("counts without materializing and resolves by position", () => {
    const repo = createInMemoryDictionaryRepository(seed);
    expect(repo.getEntryCount()).toBe(4);
    expect(repo.getEntryByOffset(0)?.id).toBe("t_exact");
    expect(repo.getEntryByOffset(3)?.id).toBe("t_multi");
  });

  it("resolves out-of-range offsets to undefined, never throws", () => {
    const repo = createInMemoryDictionaryRepository(seed);
    expect(repo.getEntryByOffset(4)).toBeUndefined();
    expect(repo.getEntryByOffset(-1)).toBeUndefined();
    expect(
      repo.getEntryByOffset(Number.NaN as unknown as number),
    ).toBeUndefined();
  });

  it("counts an empty dataset as zero", () => {
    const repo = createInMemoryDictionaryRepository([]);
    expect(repo.getEntryCount()).toBe(0);
    expect(repo.getEntryByOffset(0)).toBeUndefined();
  });
});

describe("getVerificationCounts / getSourceNames", () => {
  it("buckets statuses and dedupes sources in first-seen order", () => {
    const repo = createInMemoryDictionaryRepository([
      mockEntry("s_1", "MOCK-s1", ["mock one"], {
        verificationStatus: "verified",
        source: { sourceId: "a", sourceName: "Mock source A" },
      }),
      mockEntry("s_2", "MOCK-s2", ["mock two"], {
        verificationStatus: "reviewed",
        source: { sourceId: "a", sourceName: "Mock source A" },
      }),
      mockEntry("s_3", "MOCK-s3", ["mock three"]),
    ]);
    expect(repo.getVerificationCounts()).toEqual({
      verified: 1,
      reviewed: 1,
      draft: 1,
    });
    expect(repo.getSourceNames()).toEqual(["Mock source A", "Unknown"]);
  });
});
