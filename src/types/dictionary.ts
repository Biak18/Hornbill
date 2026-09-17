// Dictionary data model — mirrors docs/DATA.md §2-7.
// The dataset is the core product (AGENTS.md §3). Application code consumes
// these types; it never defines linguistic truth.
//
// Rules enforced by this model:
// - `word` is the authoritative display spelling and is never mutated for
//   search (see `searchKey` below and docs/DATA.md §8).
// - Every sense is a separate `Definition` (docs/DATA.md §3).
// - Uncertain data stays `draft` until human-reviewed (AGENTS.md §6).
// - Missing data is omitted, never invented (AGENTS.md §4, docs/DATA.md §11).

export type VerificationStatus = "draft" | "reviewed" | "verified";

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "particle"
  | "phrase";

export type Definition = {
  id: string;
  english: string;
  examples?: Example[];
};

export type Example = {
  falam: string;
  english: string;
};

export type SourceReference = {
  sourceId: string;
  sourceName: string;
  author?: string;
  reference?: string;
  license?: string;
  url?: string;
  importedAt?: string;
};

export type AudioReference = {
  id: string;
  entryId: string;
  localPath?: string;
  remotePath?: string;
  speakerId?: string;
  verified: boolean;
};

export type DictionaryEntry = {
  /** Stable identifier (e.g. "entry_000001"). Never reused. */
  id: string;
  /** Authoritative original Falam spelling. Display this; never mutate it. */
  word: string;
  /**
   * Normalized internal search representation, derived from `word`
   * (see `normalizeSearchKey`). Never display this as the spelling.
   */
  searchKey: string;
  /** Only when sourced. Omit when unknown — never guess. */
  pronunciation?: string;
  /** Only when known. Omit when unknown — never guess. */
  partOfSpeech?: PartOfSpeech;
  /** One item per distinct sense. Never a comma-joined string. */
  definitions: Definition[];
  /**
   * Related entry IDs (preferred) or display strings. Kept as plain
   * references; ambiguous similarity is never auto-merged (AGENTS.md §34).
   */
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
  notes?: string;
  /** Pointer to `AudioReference.id`. Audio files are never embedded here. */
  audioId?: string;
  source?: SourceReference;
  verificationStatus: VerificationStatus;
  createdAt?: string;
  updatedAt?: string;
};
