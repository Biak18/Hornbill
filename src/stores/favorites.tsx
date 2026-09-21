// Favorites store (PRD.md §5: no account for basic feature).
// References entry IDs only, works offline, and persists to SQLite so the
// wordbook survives restarts. The hook API is unchanged from session-only.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  deleteFavorite,
  insertFavorite,
  loadFavoritesWithTimes,
  type FavoriteItem,
} from "@/database/user-data";

export type FavoriteEntry = FavoriteItem;

type FavoritesContextValue = {
  favoriteIds: ReadonlySet<string>;
  /** Entries with save times, in the order they were saved. */
  favoriteEntries: readonly FavoriteEntry[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<readonly FavoriteEntry[]>(() =>
    loadFavoritesWithTimes(),
  );
  const favoriteIds = useMemo(
    () => new Set(entries.map((entry) => entry.entryId)),
    [entries],
  );

  const toggleFavorite = useCallback((id: string) => {
    setEntries((prev) => {
      // Writes are idempotent by key, so state-updater retries cannot
      // corrupt the table (dev StrictMode double-invokes updaters).
      if (prev.some((entry) => entry.entryId === id)) {
        deleteFavorite(id);
        return prev.filter((entry) => entry.entryId !== id);
      }
      insertFavorite(id);
      // Same UTC ISO shape as the SQL default for consistent formatting.
      return [...prev, { entryId: id, savedAt: new Date().toISOString() }];
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  );

  const value = useMemo(
    () => ({ favoriteIds, favoriteEntries: entries, isFavorite, toggleFavorite }),
    [favoriteIds, entries, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const value = useContext(FavoritesContext);
  if (value === null) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return value;
}
