// Search/view history (PRD.md §5: stored locally).
// Most-recent-first entry IDs, capped so the list cannot grow unbounded.
// Persists to SQLite; the hook API is unchanged from session-only.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearHistory,
  deleteHistoryEntry,
  loadHistoryWithTimes,
  recordHistoryEntry,
  type HistoryItem,
} from "@/database/user-data";
import { MAX_HISTORY } from "@/constants";

export type HistoryEntry = HistoryItem;

type HistoryContextValue = {
  /** Entry IDs, most-recent-first (derived for recents/favorites consumers). */
  historyIds: readonly string[];
  /** Entries with view times, most-recent-first (for grouped history). */
  historyEntries: readonly HistoryEntry[];
  record: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<readonly HistoryEntry[]>(() =>
    loadHistoryWithTimes(),
  );
  const historyIds = useMemo(
    () => entries.map((entry) => entry.entryId),
    [entries],
  );

  const record = useCallback((id: string) => {
    // Idempotent write-then-prune in SQL mirrors the capped state update.
    // State timestamp uses the same UTC ISO shape as the SQL default so
    // grouping/formatting treat fresh records like stored ones.
    recordHistoryEntry(id);
    const viewedAt = new Date().toISOString();
    setEntries((prev) =>
      [{ entryId: id, viewedAt }, ...prev.filter((entry) => entry.entryId !== id)].slice(
        0,
        MAX_HISTORY,
      ),
    );
  }, []);

  const clear = useCallback(() => {
    clearHistory();
    setEntries([]);
  }, []);

  const remove = useCallback((id: string) => {
    deleteHistoryEntry(id);
    setEntries((prev) => prev.filter((entry) => entry.entryId !== id));
  }, []);

  const value = useMemo(
    () => ({ historyIds, historyEntries: entries, record, remove, clear }),
    [historyIds, entries, record, remove, clear],
  );

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const value = useContext(HistoryContext);
  if (value === null) {
    throw new Error("useHistory must be used inside HistoryProvider");
  }
  return value;
}
