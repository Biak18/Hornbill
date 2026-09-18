// Appearance preference: system / light / dark (More → Appearance).
// Persists to SQLite. `useAppColors()` reads this, falling back to the OS
// scheme on "system".

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readSetting, writeSetting } from "@/database/database";

export type ThemePreference = "system" | "light" | "dark";

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

const THEME_KEY = "themePreference";

function loadPreference(): ThemePreference {
  const stored = readSetting(THEME_KEY, "system");
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function ThemePreferenceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preference, setPreference] =
    useState<ThemePreference>(loadPreference);

  const set = useCallback((next: ThemePreference) => {
    writeSetting(THEME_KEY, next);
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
