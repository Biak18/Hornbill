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
  loadFavoriteIds,
} from "@/database/user-data";

type FavoritesContextValue = {
  favoriteIds: ReadonlySet<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(
    () => new Set(loadFavoriteIds()),
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      // Writes are idempotent by key, so state-updater retries cannot
      // corrupt the table (dev StrictMode double-invokes updaters).
      if (next.has(id)) {
        next.delete(id);
        deleteFavorite(id);
      } else {
        next.add(id);
        insertFavorite(id);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  );

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
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
