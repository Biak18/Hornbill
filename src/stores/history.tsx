// Session-only search/view history (PRD.md §5: stored locally).
// Most-recent-first entry IDs, capped so the list cannot grow unbounded.
// Persistence moves to SQLite later; the hook API stays the same.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const MAX_HISTORY = 50;

type HistoryContextValue = {
  historyIds: readonly string[];
  record: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [historyIds, setHistoryIds] = useState<readonly string[]>([]);

  const record = useCallback((id: string) => {
    setHistoryIds((prev) =>
      [id, ...prev.filter((existing) => existing !== id)].slice(0, MAX_HISTORY),
    );
  }, []);

  const clear = useCallback(() => {
    setHistoryIds([]);
  }, []);

  const remove = useCallback((id: string) => {
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
