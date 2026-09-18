// Audio preferences (More → Audio). Real stored settings, consumed by the
// English TTS (Phase 3) and Falam native-audio (Phase 4) engines when they
// land — the toggles flip genuine state today, not mock visuals.
// Persists to SQLite.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readSetting, writeSetting } from "@/database/database";

type AudioSettingsContextValue = {
  englishTtsEnabled: boolean;
  falamAudioEnabled: boolean;
  setEnglishTtsEnabled: (enabled: boolean) => void;
  setFalamAudioEnabled: (enabled: boolean) => void;
};

const AudioSettingsContext =
  createContext<AudioSettingsContextValue | null>(null);

const ENGLISH_TTS_KEY = "englishTtsEnabled";
const FALAM_AUDIO_KEY = "falamAudioEnabled";

function loadFlag(key: string, fallback: boolean): boolean {
  const stored = readSetting(key, fallback ? "1" : "0");
  if (stored === "1") return true;
  if (stored === "0") return false;
  return fallback;
}

export function AudioSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [englishTtsEnabled, setEnglishTtsEnabled] = useState(() =>
    loadFlag(ENGLISH_TTS_KEY, true),
  );
  const [falamAudioEnabled, setFalamAudioEnabled] = useState(() =>
    loadFlag(FALAM_AUDIO_KEY, true),
  );

  const setEnglish = useCallback((enabled: boolean) => {
    writeSetting(ENGLISH_TTS_KEY, enabled ? "1" : "0");
    setEnglishTtsEnabled(enabled);
  }, []);
  const setFalam = useCallback((enabled: boolean) => {
    writeSetting(FALAM_AUDIO_KEY, enabled ? "1" : "0");
    setFalamAudioEnabled(enabled);
  }, []);

  const value = useMemo(
    () => ({
      englishTtsEnabled,
      falamAudioEnabled,
      setEnglishTtsEnabled: setEnglish,
      setFalamAudioEnabled: setFalam,
    }),
    [englishTtsEnabled, falamAudioEnabled, setEnglish, setFalam],
  );

  return (
    <AudioSettingsContext.Provider value={value}>
      {children}
    </AudioSettingsContext.Provider>
  );
}

export function useAudioSettings(): AudioSettingsContextValue {
  const value = useContext(AudioSettingsContext);
  if (value === null) {
    throw new Error(
      "useAudioSettings must be used inside AudioSettingsProvider",
    );
  }
  return value;
}
