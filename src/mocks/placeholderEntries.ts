// SYNTHETIC UI PLACEHOLDERS — NOT REAL FALAM DATA.
//
// These 5 entries exist only so search / entry / favorites / history UI can
// be built before a licensed Falam source is available (ROADMAP.md Phase 0).
//
// - `word` values ("MOCK-FALAM-0X") are deliberately non-linguistic tokens.
//   They must never be presented as Falam vocabulary.
// - `english` values are UI stand-ins, NOT translations.
// - No examples, pronunciation, or audioId: nothing is claimed.
// - Every entry is `verificationStatus: "draft"` with source `ui-placeholder`.
// - NEVER move these into a production dataset, NEVER mark them
//   `reviewed`/`verified`. Delete this file once real data arrives.
// - They live in `src/mocks/` (never `data/verified/`) so the import
//   pipeline (AGENTS.md §33) cannot pick them up as source material.

import type { DictionaryEntry } from "@/types/dictionary";

const PLACEHOLDER_SOURCE = {
  sourceId: "ui-placeholder",
  sourceName: "UI Placeholder (synthetic, not a Falam source)",
  license: "N/A — synthetic test data, do not distribute as linguistic data",
} as const;

function placeholderEntry(
  id: string,
  word: string,
  english: string,
  partOfSpeech: DictionaryEntry["partOfSpeech"],
): DictionaryEntry {
  return {
    id,
    word,
    searchKey: word.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase(),
    partOfSpeech,
    definitions: [{ id: `${id}__sense1`, english }],
    notes: "SYNTHETIC UI PLACEHOLDER — NOT A REAL FALAM WORD.",
    source: { ...PLACEHOLDER_SOURCE },
    verificationStatus: "draft",
  };
}

export const placeholderEntries: DictionaryEntry[] = [
  placeholderEntry(
    "entry_placeholder_01",
    "MOCK-FALAM-01",
    "Placeholder meaning 01 (not a translation)",
    "noun",
  ),
  placeholderEntry(
    "entry_placeholder_02",
    "MOCK-FALAM-02",
    "Placeholder meaning 02 (not a translation)",
    "verb",
  ),
  placeholderEntry(
    "entry_placeholder_03",
    "MOCK-FALAM-03",
    "Placeholder meaning 03 (not a translation)",
    "adjective",
  ),
  placeholderEntry(
    "entry_placeholder_04",
    "MOCK-FALAM-04",
    "Placeholder meaning 04 (not a translation)",
    undefined,
  ),
  placeholderEntry(
    "entry_placeholder_05",
    "MOCK-FALAM-05",
    "Placeholder meaning 05 (not a translation)",
    undefined,
  ),
];
