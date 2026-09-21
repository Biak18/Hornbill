// Local SQLite foundation (docs/ARCHITECTURE.md §5, AGENTS.md §23-24).
// Single connection, opened lazily on first use: UI → Search Service →
// Repository → this database. WAL mode for concurrent read/write. The root
// layout calls `primeDatabase()` before providers mount so a corrupt/unusable
// database renders the "Dictionary unavailable" fallback instead of crashing.
//
// Schema v1:
// - entries: dictionary dataset (JSON columns for nested DATA.md structures;
//   normalized `searchKey` + precomputed `meaningSearch` keep the
//   DictionaryRepository ranking semantics identical to the in-memory
//   implementation without shipping full rows per keystroke).
// - favorites / history: entry-ID references only, offline (ARCHITECTURE §6-7).
// - settings: tiny key-value store for theme + audio preferences.
//
// Seed: the user-contributed DRAFT wordlist (src/mocks/placeholderEntries,
// verificationStatus "draft", provenance preserved per-row in `source`),
// then validated production imports (src/data/production.json, written by
// `node scripts/validate-dictionary.mjs --emit`). Both seed with
// INSERT OR IGNORE on stable ids, so re-imports are idempotent; schema v2
// backfills production rows into existing v1 installs.
// Phase 8 will add FTS over these tables; LIKE prefiltering below is the
// deliberately simple step before it.

import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { placeholderEntries } from "@/mocks/placeholderEntries";
import productionSeedJson from "@/data/production.json";
import { normalizeSearchKey } from "@/utils/normalize";
import type { DictionaryEntry } from "@/types/dictionary";

const DATABASE_NAME = "falam-dictionary.db";
const SCHEMA_VERSION = 2;

function meaningSearchFor(entry: DictionaryEntry): string {
  return entry.definitions
    .map((definition) => normalizeSearchKey(definition.english))
    .join(" ");
}

function createSchema(db: SQLiteDatabase): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY NOT NULL,
      word TEXT NOT NULL,
      searchKey TEXT NOT NULL,
      pronunciation TEXT,
      partOfSpeech TEXT,
      definitions TEXT NOT NULL,
      synonyms TEXT,
      antonyms TEXT,
      relatedWords TEXT,
      notes TEXT,
      audioId TEXT,
      source TEXT,
      verificationStatus TEXT NOT NULL,
      meaningSearch TEXT NOT NULL,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_entries_searchKey ON entries(searchKey);
    CREATE TABLE IF NOT EXISTS favorites (
      entryId TEXT PRIMARY KEY NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS history (
      entryId TEXT PRIMARY KEY NOT NULL,
      viewedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

function seedEntries(
  db: SQLiteDatabase,
  entries: readonly DictionaryEntry[],
): void {
  for (const entry of entries) {
    db.runSync(
      `INSERT OR IGNORE INTO entries
        (id, word, searchKey, pronunciation, partOfSpeech, definitions,
         synonyms, antonyms, relatedWords, notes, audioId, source,
         verificationStatus, meaningSearch, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      entry.id,
      entry.word,
      entry.searchKey ?? normalizeSearchKey(entry.word),
      entry.pronunciation ?? null,
      entry.partOfSpeech ?? null,
      JSON.stringify(entry.definitions),
      entry.synonyms !== undefined ? JSON.stringify(entry.synonyms) : null,
      entry.antonyms !== undefined ? JSON.stringify(entry.antonyms) : null,
      entry.relatedWords !== undefined
        ? JSON.stringify(entry.relatedWords)
        : null,
      entry.notes ?? null,
      entry.audioId ?? null,
      entry.source !== undefined ? JSON.stringify(entry.source) : null,
      entry.verificationStatus,
      meaningSearchFor(entry),
      entry.createdAt ?? null,
      entry.updatedAt ?? null,
    );
  }
}

/**
 * Runtime guard for the validated production JSON. JSON imports widen
 * literals to `string`, so the file cannot be assigned to DictionaryEntry[]
 * directly — this predicate re-checks every field the app touches
 * (validators + tsc enforce the shape at import/build time; this only
 * prevents a malformed bundled row from crashing the seed). Skipped rows are
 * logged, never silently fixed.
 */
const SEED_PARTS_OF_SPEECH = new Set([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
  "particle",
  "phrase",
]);

const SEED_VERIFICATION_STATUSES = new Set(["draft", "reviewed", "verified"]);

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.length > 0)
  );
}

function isSeedableDefinition(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false;
  const sense = value as Record<string, unknown>;
  if (typeof sense.id !== "string" || typeof sense.english !== "string") {
    return false;
  }
  if (sense.examples === undefined) return true;
  return (
    Array.isArray(sense.examples) &&
    sense.examples.every((example) => {
      if (example === null || typeof example !== "object") return false;
      const ex = example as Record<string, unknown>;
      return (
        typeof ex.falam === "string" &&
        (ex.english === undefined || typeof ex.english === "string")
      );
    })
  );
}

function isSeedableRow(value: unknown): value is DictionaryEntry {
  if (value === null || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || row.id.length === 0) return false;
  if (typeof row.word !== "string" || row.word.length === 0) return false;
  if (typeof row.searchKey !== "string") return false;
  if (
    typeof row.verificationStatus !== "string" ||
    !SEED_VERIFICATION_STATUSES.has(row.verificationStatus)
  ) {
    return false;
  }
  if (
    row.partOfSpeech !== undefined &&
    (typeof row.partOfSpeech !== "string" ||
      !SEED_PARTS_OF_SPEECH.has(row.partOfSpeech))
  ) {
    return false;
  }
  if (!Array.isArray(row.definitions) || row.definitions.length === 0) {
    return false;
  }
  if (!row.definitions.every(isSeedableDefinition)) return false;
  for (const field of ["synonyms", "antonyms", "relatedWords"]) {
    if (row[field] !== undefined && !isStringArray(row[field])) return false;
  }
  for (const field of ["pronunciation", "notes", "audioId"]) {
    if (row[field] !== undefined && typeof row[field] !== "string") {
      return false;
    }
  }
  if (row.source !== undefined) {
    if (row.source === null || typeof row.source !== "object") return false;
    const source = row.source as Record<string, unknown>;
    if (
      typeof source.sourceId !== "string" ||
      typeof source.sourceName !== "string"
    ) {
      return false;
    }
  }
  return true;
}

const productionSeed: unknown = productionSeedJson;

const productionEntries: DictionaryEntry[] = (
  Array.isArray(productionSeed) ? productionSeed : []
).filter(isSeedableRow);

if (
  Array.isArray(productionSeed) &&
  productionEntries.length !== productionSeed.length
) {
  console.warn(
    `[database] skipped ${productionSeed.length - productionEntries.length} malformed production rows`,
  );
}

function migrate(db: SQLiteDatabase): void {
  createSchema(db);
  const row = db.getFirstSync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const version = row?.user_version ?? 0;
  if (version < 1) {
    seedEntries(db, placeholderEntries);
  }
  if (version < 2) {
    // Validated production imports (INSERT OR IGNORE by stable id, so
    // re-imports are idempotent). Existing v1 installs gain these rows.
    seedEntries(db, productionEntries);
  }
  if (version < SCHEMA_VERSION) {
    db.execSync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
  // Future migrations: `if (version < 3) { ... }`, then bump user_version.
}

let cachedDb: SQLiteDatabase | null = null;
let initError: Error | null = null;

/**
 * Open + migrate on first use, then reuse the single connection. Failures
 * are cached and rethrown so every caller sees the same error — and nothing
 * throws at import time, which lets the root layout gate on `primeDatabase`
 * instead of crashing before first render.
 */
function ensureDb(): SQLiteDatabase {
  if (cachedDb !== null) return cachedDb;
  if (initError !== null) throw initError;
  try {
    const fresh = openDatabaseSync(DATABASE_NAME);
    migrate(fresh);
    cachedDb = fresh;
    return fresh;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    throw initError;
  }
}

/**
 * Lazily-initialized database handle. Behaves exactly like the previous
 * module-scope connection for all callers (repositories, user data,
 * settings) — property access triggers `ensureDb()` on first use.
 */
export const db: SQLiteDatabase = new Proxy({} as SQLiteDatabase, {
  get(_target, property) {
    const real = ensureDb();
    const value = Reflect.get(real, property, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/**
 * Attempt database init now (idempotent). Returns the failure instead of
 * throwing, so the root layout can render the "Dictionary unavailable"
 * fallback screen (docs/Design.md §18) instead of redboxing on import.
 * Call once from the root layout before any provider touches the database.
 */
export function primeDatabase(): Error | null {
  try {
    ensureDb();
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

/** Read a settings value, falling back when the key was never written. */
export function readSetting(key: string, fallback: string): string {
  const row = db.getFirstSync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    key,
  );
  return row?.value ?? fallback;
}

/** Persist a settings value (INSERT OR REPLACE: one row per key). */
export function writeSetting(key: string, value: string): void {
  db.runSync("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [
    key,
    value,
  ]);
}
