// SQLite dictionary repository (docs/ARCHITECTURE.md §2/§5).
// Implements the same `DictionaryRepository` interface as the in-memory
// version, so UI, search service, and stores are untouched by the swap.
//
// Query shape (deliberately simple pre-Phase-8 step):
// - SQL prefilters candidates with LIKE + LIMIT so full rows never cross
//   per keystroke; the indexed `searchKey` column serves prefix matches.
// - Final exact → prefix → substring ranking + pagination reuse the shared
//   helpers, keeping results byte-identical to the in-memory implementation.
// - LIKE wildcards in user input are escaped; all values are bound params.
// Phase 8 replaces the substring prefilter with FTS (enabled in the build
// by default); the interface stays the same.

import type { SQLiteDatabase } from "expo-sqlite";
import type {
  Definition,
  DictionaryEntry,
  SourceReference,
  VerificationStatus,
} from "@/types/dictionary";
import {
  bestMeaningRank,
  paginate,
  rankText,
  type DictionaryRepository,
  type SearchEntriesOptions,
} from "./dictionary-repository";

// Bounded candidate sets: ranking/slicing in JS stays cheap while SQL
// ORDER BY puts exact/prefix rows first, so LIMIT cannot cut a better rank.
const CANDIDATE_LIMIT = 200;
const MEANING_CANDIDATE_LIMIT = 500;

const ENTRY_COLUMNS = [
  "id",
  "word",
  "searchKey",
  "pronunciation",
  "partOfSpeech",
  "definitions",
  "synonyms",
  "antonyms",
  "relatedWords",
  "notes",
  "audioId",
  "source",
  "verificationStatus",
  "createdAt",
  "updatedAt",
].join(", ");

type EntryRow = {
  id: string;
  word: string;
  searchKey: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  definitions: string;
  synonyms: string | null;
  antonyms: string | null;
  relatedWords: string | null;
  notes: string | null;
  audioId: string | null;
  source: string | null;
  verificationStatus: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function parseJsonArray<T>(value: string | null): T[] | undefined {
  if (value === null) return undefined;
  return JSON.parse(value) as T[];
}

export function mapRowToEntry(row: EntryRow): DictionaryEntry {
  const synonyms = parseJsonArray<string>(row.synonyms);
  const antonyms = parseJsonArray<string>(row.antonyms);
  const relatedWords = parseJsonArray<string>(row.relatedWords);
  return {
    id: row.id,
    word: row.word,
    searchKey: row.searchKey,
    ...(row.pronunciation !== null
      ? { pronunciation: row.pronunciation }
      : {}),
    ...(row.partOfSpeech !== null
      ? { partOfSpeech: row.partOfSpeech as DictionaryEntry["partOfSpeech"] }
      : {}),
    definitions: JSON.parse(row.definitions) as Definition[],
    ...(synonyms !== undefined ? { synonyms } : {}),
    ...(antonyms !== undefined ? { antonyms } : {}),
    ...(relatedWords !== undefined ? { relatedWords } : {}),
    ...(row.notes !== null ? { notes: row.notes } : {}),
    ...(row.audioId !== null ? { audioId: row.audioId } : {}),
    ...(row.source !== null
      ? { source: JSON.parse(row.source) as SourceReference }
      : {}),
    verificationStatus: row.verificationStatus as VerificationStatus,
    ...(row.createdAt !== null ? { createdAt: row.createdAt } : {}),
    ...(row.updatedAt !== null ? { updatedAt: row.updatedAt } : {}),
  };
}

/** Escape LIKE wildcards so user input matches literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function searchByKey(
  db: SQLiteDatabase,
  normalizedQuery: string,
  options?: SearchEntriesOptions,
): DictionaryEntry[] {
  if (normalizedQuery.length === 0) return [];
  const escaped = escapeLike(normalizedQuery);
  const rows = db.getAllSync<EntryRow>(
    `SELECT ${ENTRY_COLUMNS} FROM entries
     WHERE searchKey LIKE ? ESCAPE '\\'
     ORDER BY
       CASE WHEN searchKey = ? THEN 0
            WHEN searchKey LIKE ? ESCAPE '\\' THEN 1
            ELSE 2 END,
       word
     LIMIT ?`,
    [`%${escaped}%`, normalizedQuery, `${escaped}%`, CANDIDATE_LIMIT],
  );
  const entries = rows.map(mapRowToEntry);
  const matched = entries.filter(
    (entry) => rankText(entry.searchKey, normalizedQuery) < 3,
  );
  matched.sort((a, b) => {
    const rankDiff =
      rankText(a.searchKey, normalizedQuery) -
      rankText(b.searchKey, normalizedQuery);
    if (rankDiff !== 0) return rankDiff;
    return a.word.localeCompare(b.word);
  });
  return paginate(matched, options);
}

function searchByMeaning(
  db: SQLiteDatabase,
  normalizedQuery: string,
  options?: SearchEntriesOptions,
): DictionaryEntry[] {
  if (normalizedQuery.length === 0) return [];
  const rows = db.getAllSync<EntryRow>(
    `SELECT ${ENTRY_COLUMNS} FROM entries
     WHERE meaningSearch LIKE ? ESCAPE '\\'
     ORDER BY word
     LIMIT ?`,
    [`%${escapeLike(normalizedQuery)}%`, MEANING_CANDIDATE_LIMIT],
  );
  const entries = rows.map(mapRowToEntry);
  const matched = entries.filter(
    (entry) => bestMeaningRank(entry, normalizedQuery) < 3,
  );
  matched.sort((a, b) => {
    const rankDiff =
      bestMeaningRank(a, normalizedQuery) - bestMeaningRank(b, normalizedQuery);
    if (rankDiff !== 0) return rankDiff;
    return a.word.localeCompare(b.word);
  });
  return paginate(matched, options);
}

export function createSqliteDictionaryRepository(
  db: SQLiteDatabase,
): DictionaryRepository {
  return {
    getEntryById(id: string) {
      const row = db.getFirstSync<EntryRow>(
        `SELECT ${ENTRY_COLUMNS} FROM entries WHERE id = ?`,
        [id],
      );
      return row === null ? undefined : mapRowToEntry(row);
    },
    getAllEntries() {
      const rows = db.getAllSync<EntryRow>(
        `SELECT ${ENTRY_COLUMNS} FROM entries ORDER BY rowid`,
      );
      return rows.map(mapRowToEntry);
    },
    getEntryCount() {
      const row = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) AS count FROM entries",
      );
      return row?.count ?? 0;
    },
    getEntryByOffset(offset: number) {
      if (!Number.isInteger(offset) || offset < 0) return undefined;
      const row = db.getFirstSync<EntryRow>(
        `SELECT ${ENTRY_COLUMNS} FROM entries ORDER BY rowid LIMIT 1 OFFSET ?`,
        [offset],
      );
      return row === null ? undefined : mapRowToEntry(row);
    },
    getVerificationCounts() {
      const rows = db.getAllSync<{ verificationStatus: string; count: number }>(
        "SELECT verificationStatus, COUNT(*) AS count FROM entries GROUP BY verificationStatus",
      );
      const counts = { verified: 0, reviewed: 0, draft: 0 };
      for (const row of rows) {
        if (row.verificationStatus === "verified") counts.verified = row.count;
        else if (row.verificationStatus === "reviewed")
          counts.reviewed = row.count;
        else counts.draft += row.count;
      }
      return counts;
    },
    getSourceNames() {
      const rows = db.getAllSync<{ source: string | null }>(
        "SELECT source FROM entries ORDER BY rowid",
      );
      const names: string[] = [];
      const seen = new Set<string>();
      for (const row of rows) {
        let name = "Unknown";
        if (row.source !== null) {
          try {
            const parsed = JSON.parse(row.source) as {
              sourceName?: unknown;
            };
            if (
              typeof parsed.sourceName === "string" &&
              parsed.sourceName.length > 0
            ) {
              name = parsed.sourceName;
            }
          } catch {
            // Malformed source JSON counts as Unknown, never crashes.
          }
        }
        if (!seen.has(name)) {
          seen.add(name);
          names.push(name);
        }
      }
      return names;
    },
    searchEntries(normalizedQuery, options) {
      return searchByKey(db, normalizedQuery, options);
    },
    searchEntriesByMeaning(normalizedQuery, options) {
      return searchByMeaning(db, normalizedQuery, options);
    },
  };
}
