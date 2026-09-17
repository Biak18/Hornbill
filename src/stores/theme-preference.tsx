// Appearance preference: system / light / dark (More → Appearance).
// Session-only; persistence moves to SQLite later. `useAppColors()` reads
// this, falling back to the OS scheme on "system".

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "system" | "light" | "dark";

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preference, setPreference] = useState<ThemePreference>("system");

  const set = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  const value = useMemo(
    () => ({ preference, setPreference: set }),
    [preference, set],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceContextValue {
  const value = useContext(ThemePreferenceContext);
  if (value === null) {
    throw new Error(
      "useThemePreference must be used inside ThemePreferenceProvider",
    );
  }
  return value;
}
