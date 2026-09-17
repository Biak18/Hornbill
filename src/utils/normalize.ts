// Search normalization (docs/DATA.md §8, AGENTS.md §9-10).
// Produces the internal `searchKey`; the displayed `word` is never mutated.
// Unicode-aware: NFKC normalizes compatibility/diacritic variants before
// case-folding so equivalent inputs match without touching source spelling.

/** Derive the internal search representation for a dictionary word. */
export function normalizeSearchKey(input: string): string {
  return input.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

/** True for empty/whitespace queries. Callers return `[]`, never a full scan. */
export function isBlankQuery(query: string): boolean {
  return normalizeSearchKey(query).length === 0;
}
