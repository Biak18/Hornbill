// EnglishAudioButton — device-voice pronunciation for English meanings.
// All speech goes through `speakEnglish()`; this component never imports
// expo-speech directly (docs/ARCHITECTURE.md §8). Visibly labeled as device
// voice so it is never confused with Falam native-speaker recordings.
// Renders nothing when English TTS is disabled in More → Audio.
//
// Failure handling (some Android devices fail silently — no onStart/onError
// at all): the press flips to "Playing…" optimistically, a watchdog flips a
// silent engine to the retry state, and a voice query up front renders
// guidance when the device has no English voice installed.

import {
  getEnglishVoiceStatus,
  speakEnglish,
  stopEnglish,
} from "@/audio/speak-english";
import { Text } from "@/components/Text";
import { useAudioSettings } from "@/stores/audio-settings";
import { radius, spacing, useAppColors } from "@/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

// Silent-engine watchdog: no callback within this long after a press means
// the TTS engine swallowed the utterance — show retry instead of a dead
// "Playing…" pill.
const WATCHDOG_MS = 3000;

export function EnglishAudioButton({ text }: { text: string }) {
  const colors = useAppColors();
  const { englishTtsEnabled } = useAudioSettings();
  const [speaking, setSpeaking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [voiceMissing, setVoiceMissing] = useState(false);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearWatchdog = useCallback(() => {
    if (watchdog.current !== null) {
      clearTimeout(watchdog.current);
      watchdog.current = null;
    }
  }, []);

  // Leaving the entry stops speech so audio never trails into another screen.
  useEffect(() => {
    return () => {
      clearWatchdog();
      void stopEnglish().catch(() => undefined);
    };
  }, [clearWatchdog]);

  // Up-front voice check: explains a dead button ("install an English voice")
  // instead of leaving the user tapping silence.
  useEffect(() => {
    let live = true;
    getEnglishVoiceStatus().then((status) => {
      if (live && status !== "ready") {
        setVoiceMissing(true);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  // One speech attempt with a silence watchdog. First attempt pins an
  // explicit English voice (strict OEM engines need it); if the engine
  // swallows that silently, the fallback retries language-only, which is
  // what Google TTS on emulators accepts. Only after both stay silent do
  // we show the retry state.
  //
  // The fallback goes through a ref (kept current by the effect below):
  // calling the memoized callback from inside itself would freeze the first
  // render's closure (react-hooks/immutability).
  const attemptRunner = useRef<
    ((useExplicitVoice: boolean, isFinal: boolean) => void) | undefined
  >(undefined);
  const runAttempt = useCallback(
    (useExplicitVoice: boolean, isFinal: boolean) => {
      clearWatchdog();
      watchdog.current = setTimeout(() => {
        watchdog.current = null;
        if (!isFinal) {
          attemptRunner.current?.(false, true);
        } else {
          setSpeaking(false);
          setFailed(true);
        }
      }, WATCHDOG_MS);
      void speakEnglish(
        text,
        {
          onStart: () => {
            clearWatchdog();
            setSpeaking(true);
          },
          onDone: () => {
            clearWatchdog();
            setSpeaking(false);
          },
          onStopped: () => {
            clearWatchdog();
            setSpeaking(false);
          },
          onError: () => {
            clearWatchdog();
            setSpeaking(false);
            setFailed(true);
          },
        },
        { explicitVoice: useExplicitVoice },
      );
    },
    [text, clearWatchdog],
  );

  useEffect(() => {
    attemptRunner.current = runAttempt;
  }, [runAttempt]);

  const handlePress = useCallback(() => {
    if (speaking) {
      clearWatchdog();
      void stopEnglish().catch(() => undefined);
      return;
    }
    setFailed(false);
    // Optimistic: the tap always gives instant visual feedback, even if the
    // engine is slow to fire onStart.
    setSpeaking(true);
    runAttempt(true, false);
  }, [speaking, runAttempt, clearWatchdog]);

  if (!englishTtsEnabled) {
    return null;
  }

  if (voiceMissing && !speaking) {
    return (
      <>
        <View
          accessibilityLabel="No English voice installed on this device"
          style={[
            styles.pill,
            { backgroundColor: colors.surface2, borderColor: colors.line },
          ]}
        >
          <MaterialIcons name="volume-off" size={16} color={colors.muted} />
          <Text variant="labelSm" tone="secondary">
            No English voice on this device
          </Text>
        </View>
        <Text variant="meta" tone="faint">
          Enable a TTS engine with English voice data in system Settings →
          Text-to-speech.
        </Text>
      </>
    );
  }

  if (failed && !speaking) {
    return (
      <>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry English audio"
          onPress={handlePress}
          style={[
            styles.pill,
            { backgroundColor: colors.surface2, borderColor: colors.line },
          ]}
        >
          <MaterialIcons name="volume-off" size={16} color={colors.muted} />
          <Text variant="labelSm" tone="secondary">
            Audio couldn&apos;t be played — retry
          </Text>
        </Pressable>
        <Text variant="meta" tone="faint">
          Still silent? Check system Settings → Text-to-speech: an engine with
          English voice data must be enabled.
        </Text>
      </>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        speaking
          ? "Stop English device-voice audio"
          : "Listen to English meaning with device voice"
      }
      accessibilityState={{ selected: speaking }}
      onPress={handlePress}
      style={[
        styles.pill,
        {
          backgroundColor: speaking ? colors.accentSoft : colors.surface2,
          borderColor: speaking ? colors.accent : colors.line,
        },
      ]}
    >
      <MaterialIcons
        name={speaking ? "stop" : "volume-up"}
        size={16}
        color={speaking ? colors.accent : colors.muted}
      />
      <Text variant="labelSm" tone={speaking ? "accent" : "secondary"}>
        {speaking ? "Playing…" : "Listen · device voice"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
