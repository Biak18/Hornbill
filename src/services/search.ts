// Search service (AGENTS.md §25, ARCHITECTURE.md §4).
// All query logic lives here, outside UI components. Screens call
// `searchDictionary` and render the four states (loading / error / empty /
// content) — they never normalize text or touch the repository directly.

import type { DictionaryEntry } from "@/types/dictionary";
import type { DictionaryRepository } from "@/repositories/dictionary-repository";
import { normalizeSearchKey } from "@/utils/normalize";

export type SearchDictionaryOptions = {
  limit?: number;
  offset?: number;
  repository: DictionaryRepository;
};

export function searchDictionary(
  query: string,
  options: SearchDictionaryOptions,
): DictionaryEntry[] {
  const normalized = normalizeSearchKey(query);
  // Blank query → no results. Never a full-table scan: the dataset may grow
  // to 1M+ entries (AGENTS.md §24/28).
  if (normalized.length === 0) return [];
  return options.repository.searchEntries(normalized, {
    limit: options.limit,
    offset: options.offset,
  });
}
