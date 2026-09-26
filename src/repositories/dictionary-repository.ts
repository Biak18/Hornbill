// Dictionary repository boundary (ARCHITECTURE.md §2, AGENTS.md §23-25).
// UI never touches storage directly: UI → Search Service → Repository → DB.
// This in-memory implementation backs the synthetic placeholders; the
// expo-sqlite implementation later plugs into the same interface with
// indexed/FTS queries, so no UI code changes when real data arrives.

import type { DictionaryEntry } from "@/types/dictionary";
import { normalizeSearchKey } from "@/utils/normalize";

export type SearchEntriesOptions = {
  limit?: number;
  offset?: number;
};

export interface DictionaryRepository {
  getEntryById(id: string): DictionaryEntry | undefined;
  /** All entries in dataset order (read-only). Used for deterministic
   * picks such as the featured word; never for full scans in search. */
  getAllEntries(): readonly DictionaryEntry[];
  /** Total entry count WITHOUT materializing rows — the only size probe
   * that stays cheap at 1M+ entries (AGENTS.md §24). */
  getEntryCount(): number;
  /** Single entry by 0-based dataset position (rowid order). Out-of-range
   * offsets resolve to undefined, never throw. */
  getEntryByOffset(offset: number): DictionaryEntry | undefined;
  /** Verification buckets WITHOUT materializing rows (GROUP BY at the
   * storage layer). Unknown statuses bucket as draft, never crash. */
  getVerificationCounts(): {
    verified: number;
    reviewed: number;
    draft: number;
  };
  /** Distinct source display names in first-seen order ("Unknown" for
   * unsourced entries). Small result by construction. */
  getSourceNames(): string[];
  /**
   * Falam → English: match `normalizedQuery` against entry search keys.
   * `normalizedQuery` must already be normalized (see search service).
   * Ranking: exact → prefix → substring, then alphabetical by `word`.
   */
  searchEntries(
    normalizedQuery: string,
    options?: SearchEntriesOptions,
  ): DictionaryEntry[];
  /**
   * English → Falam: match `normalizedQuery` against English definitions.
   * Best-matching sense decides the entry rank; same ordering as above.
   */
  searchEntriesByMeaning(
    normalizedQuery: string,
    options?: SearchEntriesOptions,
  ): DictionaryEntry[];
}

const DEFAULT_LIMIT = 20;

/** Shared ranking (0 exact, 1 prefix, 2 substring, 3 no match). */
export function rankText(haystack: string, query: string): number {
  if (haystack === query) return 0;
  if (haystack.startsWith(query)) return 1;
  if (haystack.includes(query)) return 2;
  return 3;
}

export function bestMeaningRank(entry: DictionaryEntry, query: string): number {
  let best = 3;
  for (const definition of entry.definitions) {
    const rank = rankText(normalizeSearchKey(definition.english), query);
    if (rank < best) {
      best = rank;
      if (best === 0) break;
    }
  }
  return best;
}

export function paginate(
  entries: DictionaryEntry[],
  options?: SearchEntriesOptions,
): DictionaryEntry[] {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const offset = options?.offset ?? 0;
  return entries.slice(offset, offset + limit);
}

export function createInMemoryDictionaryRepository(
  seed: DictionaryEntry[],
): DictionaryRepository {
  // Defensive: derive searchKey without mutating `word`, in case a future
  // seed omits it. Placeholder seeds already carry one.
  const entries = seed.map((entry) => ({
    ...entry,
    searchKey: entry.searchKey ?? normalizeSearchKey(entry.word),
  }));

  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  return {
    getEntryById(id) {
      return byId.get(id);
    },
    getAllEntries() {
      return entries;
    },
    getEntryCount() {
      return entries.length;
    },
    getEntryByOffset(offset) {
      if (!Number.isInteger(offset) || offset < 0) return undefined;
      return entries[offset];
    },
    getVerificationCounts() {
      const counts = { verified: 0, reviewed: 0, draft: 0 };
      for (const entry of entries) {
        if (entry.verificationStatus === "verified") counts.verified++;
        else if (entry.verificationStatus === "reviewed") counts.reviewed++;
        else counts.draft++;
      }
      return counts;
    },
    getSourceNames() {
      const names: string[] = [];
      const seen = new Set<string>();
      for (const entry of entries) {
        const name = entry.source?.sourceName ?? "Unknown";
        if (!seen.has(name)) {
          seen.add(name);
          names.push(name);
        }
      }
      return names;
    },
    searchEntries(normalizedQuery, options) {
      if (normalizedQuery.length === 0) return [];
      return paginate(
        entries
          .filter(
            (entry) => rankText(entry.searchKey, normalizedQuery) < 3,
          )
          .sort((a, b) => {
            const rankDiff =
              rankText(a.searchKey, normalizedQuery) -
              rankText(b.searchKey, normalizedQuery);
            if (rankDiff !== 0) return rankDiff;
            return a.word.localeCompare(b.word);
          }),
        options,
      );
    },
    searchEntriesByMeaning(normalizedQuery, options) {
      if (normalizedQuery.length === 0) return [];
      return paginate(
        entries
          .filter(
            (entry) => bestMeaningRank(entry, normalizedQuery) < 3,
          )
          .sort((a, b) => {
            const rankDiff =
              bestMeaningRank(a, normalizedQuery) -
              bestMeaningRank(b, normalizedQuery);
            if (rankDiff !== 0) return rankDiff;
            return a.word.localeCompare(b.word);
          }),
        options,
      );
    },
  };
}
