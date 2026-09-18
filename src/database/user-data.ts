// Favorites + history persistence (docs/ARCHITECTURE.md §6-7).
// Entry-ID references only; the dataset itself is never duplicated here.
// All writes are idempotent (INSERT OR IGNORE / REPLACE / DELETE by key),
// so React state-updater retries in dev StrictMode cannot corrupt anything.
// Synchronous reads keep the store providers free of loading states: these
// tables hold at most tens of small rows.

import { db } from "./database";

const MAX_HISTORY = 50;

/** Favorite IDs in the order they were saved (matches prior Set behavior). */
export function loadFavoriteIds(): string[] {
  const rows = db.getAllSync<{ entryId: string }>(
    "SELECT entryId FROM favorites ORDER BY createdAt ASC, rowid ASC",
  );
  return rows.map((row) => row.entryId);
}

export function insertFavorite(entryId: string): void {
  db.runSync(
    "INSERT OR IGNORE INTO favorites (entryId, createdAt) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))",
    [entryId],
  );
}

export function deleteFavorite(entryId: string): void {
  db.runSync("DELETE FROM favorites WHERE entryId = ?", [entryId]);
}

/** History IDs, most-recent-first, capped (matches prior store behavior). */
export function loadHistoryIds(): string[] {
  const rows = db.getAllSync<{ entryId: string }>(
    "SELECT entryId FROM history ORDER BY viewedAt DESC, rowid DESC LIMIT ?",
    [MAX_HISTORY],
  );
  return rows.map((row) => row.entryId);
}

export function recordHistoryEntry(entryId: string): void {
  db.runSync(
    "INSERT OR REPLACE INTO history (entryId, viewedAt) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))",
    [entryId],
  );
  db.runSync(
    `DELETE FROM history WHERE entryId NOT IN (
       SELECT entryId FROM history ORDER BY viewedAt DESC, rowid DESC LIMIT ?
     )`,
    [MAX_HISTORY],
  );
}

export function deleteHistoryEntry(entryId: string): void {
  db.runSync("DELETE FROM history WHERE entryId = ?", [entryId]);
}

export function clearHistory(): void {
  db.runSync("DELETE FROM history");
}
