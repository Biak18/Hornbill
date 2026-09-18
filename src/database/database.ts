// Local SQLite foundation (docs/ARCHITECTURE.md §5, AGENTS.md §23-24).
// Single module-scope connection, created once: UI → Search Service →
// Repository → this database. WAL mode for concurrent read/write.
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
// verificationStatus "draft", provenance preserved per-row in `source`).
// Seeding runs once (user_version gate) with INSERT OR IGNORE, so a future
// Phase 1 verified import can replace the seed without touching callers.
// Phase 8 will add FTS over these tables; LIKE prefiltering below is the
// deliberately simple step before it.

import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { placeholderEntries } from "@/mocks/placeholderEntries";
import { normalizeSearchKey } from "@/utils/normalize";
import type { DictionaryEntry } from "@/types/dictionary";

const DATABASE_NAME = "falam-dictionary.db";
const SCHEMA_VERSION = 1;

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

function seedEntries(db: SQLiteDatabase): void {
  for (const entry of placeholderEntries) {
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

function migrate(db: SQLiteDatabase): void {
  createSchema(db);
  const row = db.getFirstSync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const version = row?.user_version ?? 0;
  if (version < 1) {
    seedEntries(db);
    db.execSync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
  // Future migrations: `if (version < 2) { ... }`, then bump user_version.
}

export const db: SQLiteDatabase = openDatabaseSync(DATABASE_NAME);
migrate(db);

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
