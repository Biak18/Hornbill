// Dataset summary shapes for the More → Data section. Counts come from
// indexed repository queries (see DictionaryRepository) — this module only
// formats them for display. "Unknown" and zero buckets are shown,
// never hidden.

export type DictionarySummary = {
  total: number;
  verified: number;
  reviewed: number;
  draft: number;
  /** Distinct source names in first-seen order. Never empty. */
  sources: string[];
};

/** Compact "0 verified · 0 reviewed · 25 drafts" line for the Data card. */
export function formatVerificationCounts(summary: DictionarySummary): string {
  const drafts =
    summary.draft === 1 ? "1 draft" : `${summary.draft} drafts`;
  return `${summary.verified} verified · ${summary.reviewed} reviewed · ${drafts}`;
}
