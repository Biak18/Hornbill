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
  loadHistoryIds,
  recordHistoryEntry,
} from "@/database/user-data";

const MAX_HISTORY = 50;

type HistoryContextValue = {
  historyIds: readonly string[];
  record: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [historyIds, setHistoryIds] = useState<readonly string[]>(
    () => loadHistoryIds(),
  );

  const record = useCallback((id: string) => {
    // Idempotent write-then-prune in SQL mirrors the capped state update.
    recordHistoryEntry(id);
    setHistoryIds((prev) =>
      [id, ...prev.filter((existing) => existing !== id)].slice(0, MAX_HISTORY),
    );
  }, []);

  const clear = useCallback(() => {
    clearHistory();
    setHistoryIds([]);
  }, []);

  const remove = useCallback((id: string) => {
    deleteHistoryEntry(id);
    setHistoryIds((prev) => prev.filter((existing) => existing !== id));
  }, []);

  const value = useMemo(
    () => ({ historyIds, record, remove, clear }),
    [historyIds, record, remove, clear],
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
