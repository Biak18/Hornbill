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
  /**
   * `normalizedQuery` must already be normalized (see search service).
   * Ranking: exact → prefix → substring, then alphabetical by `word`.
   */
  searchEntries(
    normalizedQuery: string,
    options?: SearchEntriesOptions,
  ): DictionaryEntry[];
}

const DEFAULT_LIMIT = 20;

function rankEntry(searchKey: string, query: string): number {
  if (searchKey === query) return 0;
  if (searchKey.startsWith(query)) return 1;
  if (searchKey.includes(query)) return 2;
  return 3;
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
    searchEntries(normalizedQuery, options) {
      if (normalizedQuery.length === 0) return [];
      const limit = options?.limit ?? DEFAULT_LIMIT;
      const offset = options?.offset ?? 0;
      return entries
        .filter((entry) => rankEntry(entry.searchKey, normalizedQuery) < 3)
        .sort((a, b) => {
          const rankDiff =
            rankEntry(a.searchKey, normalizedQuery) -
            rankEntry(b.searchKey, normalizedQuery);
          if (rankDiff !== 0) return rankDiff;
          return a.word.localeCompare(b.word);
        })
        .slice(offset, offset + limit);
    },
  };
}
