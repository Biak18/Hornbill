// Dictionary dataset summary for the More → Data section (docs/Design.md
// §16). Pure derivation over real entries: totals, verification counts, and
// distinct source names. No linguistic claims — unknown sources report as
// "Unknown" and every status bucket is shown, including zeros.

import type { DictionaryEntry } from "@/types/dictionary";

export type DictionarySummary = {
  total: number;
  verified: number;
  reviewed: number;
  draft: number;
  /** Distinct source names in first-seen order. Never empty. */
  sources: string[];
};

export function summarizeDictionary(
  entries: readonly DictionaryEntry[],
): DictionarySummary {
  let verified = 0;
  let reviewed = 0;
  let draft = 0;
  const sources: string[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (entry.verificationStatus === "verified") verified++;
    else if (entry.verificationStatus === "reviewed") reviewed++;
    else draft++;
    const name = entry.source?.sourceName ?? "Unknown";
    if (!seen.has(name)) {
      seen.add(name);
      sources.push(name);
    }
  }
  return {
    total: entries.length,
    verified,
    reviewed,
    draft,
    sources: sources.length > 0 ? sources : ["Unknown"],
  };
}

/** Compact "0 verified · 0 reviewed · 25 drafts" line for the Data card. */
export function formatVerificationCounts(summary: DictionarySummary): string {
  return `${summary.verified} verified · ${summary.reviewed} reviewed · ${summary.draft} drafts`;
}
