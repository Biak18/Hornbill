// Favorites + history persistence (docs/ARCHITECTURE.md §6-7).
// Entry-ID references only; the dataset itself is never duplicated here.
// All writes are idempotent (INSERT OR IGNORE / REPLACE / DELETE by key),
// so React state-updater retries in dev StrictMode cannot corrupt anything.
// Synchronous reads keep the store providers free of loading states: these
// tables hold at most tens of small rows.

import { db } from "./database";
import { MAX_HISTORY } from "@/constants";

export type FavoriteItem = {
  entryId: string;
  /** UTC ISO timestamp of when the word was saved. */
  savedAt: string;
};

/** Favorites with save times, in the order they were saved. */
export function loadFavoritesWithTimes(): FavoriteItem[] {
  const rows = db.getAllSync<FavoriteItem>(
    "SELECT entryId, createdAt AS savedAt FROM favorites ORDER BY createdAt ASC, rowid ASC",
  );
  return rows;
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

export type HistoryItem = {
  entryId: string;
  /** UTC ISO timestamp of the view (strftime %Y-%m-%dT%H:%M:%fZ). */
  viewedAt: string;
};

/** History entries with view times, most-recent-first, capped. */
export function loadHistoryWithTimes(): HistoryItem[] {
  const rows = db.getAllSync<HistoryItem>(
    "SELECT entryId, viewedAt FROM history ORDER BY viewedAt DESC, rowid DESC LIMIT ?",
    [MAX_HISTORY],
  );
  return rows;
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
