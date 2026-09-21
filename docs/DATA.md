# Dictionary Data Specification

## 1. Principle

The dictionary dataset is the core product.

Application code must consume the dataset rather than define linguistic truth.

## 2. Dictionary Entry

```ts
type DictionaryEntry = {
  id: string;
  word: string;
  pronunciation?: string;
  partOfSpeech?: PartOfSpeech;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
  notes?: string;
  audioId?: string;
  source?: SourceReference;
  verificationStatus: VerificationStatus;
  createdAt?: string;
  updatedAt?: string;
};
```

## 3. Definition

```ts
type Definition = {
  id: string;
  english: string;
  examples?: Example[];
};
```

## 4. Example

```ts
type Example = {
  falam: string;
  english: string;
};
```

Examples must be verified.

## 5. Verification

```ts
type VerificationStatus =
  | "draft"
  | "reviewed"
  | "verified";
```

## 6. Source

```ts
type SourceReference = {
  sourceId: string;
  sourceName: string;
  author?: string;
  reference?: string;
  license?: string;
};
```

## 7. Audio

Do not store audio directly inside every dictionary record. Use an ID/reference.

```ts
type AudioReference = {
  id: string;
  entryId: string;
  localPath?: string;
  remotePath?: string;
  speakerId?: string;
  verified: boolean;
};
```

## 8. Search Representation

Preserve the original word and create a separate search representation if necessary.

```text
word     = authoritative original Falam spelling
searchKey = normalized internal search representation
```

Never display searchKey as the authoritative spelling.

## 9. Data Import Pipeline

Source → Raw Import → Parsing → Normalization → Deduplication → Human Review → Verification → Production Dataset

## 10. Deduplication

Potential duplicates should be detected but not automatically merged when linguistic identity is uncertain.

Ambiguous duplicates require human review.

## 11. Missing Data

Missing data is acceptable. Do not invent missing information.

## 12. English Data

Before importing external English data, verify:

- license
- attribution requirements
- commercial-use restrictions
- redistribution restrictions
- caching/storage restrictions
- API terms
- offline usage rights

The project must not assume that API access means permission to redistribute the underlying data.

## 13. Data Quality

Each production entry should ideally have:

- Falam spelling
- English meaning
- part of speech where known
- source
- verification status
- pronunciation where available
- native audio where available

Not every field must be available for every entry.

Accuracy is more important than completeness.

## 14. Import Pipeline

Contributor files live in `data/imports/*.json` (top-level array of entries;
see `data/imports/example.json` for the shape — synthetic MOCK words only,
never real Falam). Validate before anything reaches the app:

```sh
node scripts/validate-dictionary.mjs [--emit src/data/production.json] [--strict] [--allow-verified] <file.json...>
# or: npm run validate:dictionary -- <file.json...>
```

Enforced rules:

- Schema violations (missing id/word/meanings, guessed part of speech,
  rewritten spelling, mismatched searchKey) block the import (exit 1).
- Missing `searchKey` is derived from `word` (normalization, §8) — the only
  field the pipeline ever fills in.
- Imported data is coerced to `verificationStatus: "draft"` unless
  `--allow-verified` is passed after genuine human review.
- Potential duplicates are reported, never merged. Entry ids must be stable:
  reseeding uses INSERT OR IGNORE, so re-importing the same file is
  idempotent; to correct an entry, keep its id.
- Warnings (missing source, untranslated examples, duplicates) fail the run
  only with `--strict`.

`src/data/production.json` (written via `--emit`) seeds SQLite at schema v2
alongside the demo wordlist; a minimal runtime guard skips malformed bundled
rows with a warning.
