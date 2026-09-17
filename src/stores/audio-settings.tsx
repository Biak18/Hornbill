// Audio preferences (More → Audio). Real stored settings, consumed by the
// English TTS (Phase 3) and Falam native-audio (Phase 4) engines when they
// land — the toggles flip genuine state today, not mock visuals.
// Session-only; persistence moves to SQLite later.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AudioSettingsContextValue = {
  englishTtsEnabled: boolean;
  falamAudioEnabled: boolean;
  setEnglishTtsEnabled: (enabled: boolean) => void;
  setFalamAudioEnabled: (enabled: boolean) => void;
};

const AudioSettingsContext =
  createContext<AudioSettingsContextValue | null>(null);

export function AudioSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [englishTtsEnabled, setEnglishTtsEnabled] = useState(true);
  const [falamAudioEnabled, setFalamAudioEnabled] = useState(true);

  const setEnglish = useCallback((enabled: boolean) => {
    setEnglishTtsEnabled(enabled);
  }, []);
  const setFalam = useCallback((enabled: boolean) => {
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
