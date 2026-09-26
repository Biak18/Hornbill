// English TTS abstraction (docs/AUDIO.md §2, docs/ARCHITECTURE.md §8).
// UI components call `speakEnglish` / `stopEnglish` — they never import
// expo-speech directly, so the engine can be replaced later without touching
// screens. Device voice only: Falam pronunciation always uses native-speaker
// recordings, never this module (AGENTS.md §13).

import * as Speech from "expo-speech";

export type SpeakEnglishCallbacks = {
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
};

export type EnglishVoiceStatus = "ready" | "no-engine" | "no-english";

type TTSVoice = Awaited<
  ReturnType<typeof Speech.getAvailableVoicesAsync>
>[number];

let voicesCache: Promise<TTSVoice[]> | null = null;

/**
 * All TTS voices on the device, cached per session so every sense button on
 * an entry shares one native query. Never rejects — a failed query resolves
 * to an empty list and callers treat that as "no-engine".
 */
function getDeviceVoices(): Promise<TTSVoice[]> {
  if (voicesCache === null) {
    voicesCache = Speech.getAvailableVoicesAsync().then(
      (voices) => voices,
      (error: unknown) => {
        if (__DEV__) {
          console.warn("[speakEnglish] voice query failed:", error);
        }
        return [];
      },
    );
  }
  return voicesCache;
}

/**
 * Check whether the device can speak English. Rejects never: an inconclusive
 * query reports "no-engine" and the button shows guidance.
 */
export async function getEnglishVoiceStatus(): Promise<EnglishVoiceStatus> {
  const voices = await getDeviceVoices();
  if (voices.length === 0) return "no-engine";
  const hasEnglish = voices.some((voice) =>
    voice.language.toLowerCase().startsWith("en"),
  );
  return hasEnglish ? "ready" : "no-english";
}

/** First English voice id, if the device has one. Used to pin the utterance
 * to an explicit voice: some OEM engines (Samsung, Xiaomi) ignore a bare
 * language tag but honor an explicit voice identifier. */
async function getEnglishVoiceId(): Promise<string | undefined> {
  const voices = await getDeviceVoices();
  return voices.find((voice) =>
    voice.language.toLowerCase().startsWith("en"),
  )?.identifier;
}

/**
 * Settle quickly: wait for `promise` but give up after `ms` instead of
 * hanging forever. Never rejects. Used for the pre-speak `stop()`, which
 * has been observed to never resolve on some Android devices — awaiting it
 * unconditionally would leave the button permanently dead with no callback.
 */
async function settleQuickly(promise: Promise<void>, ms: number) {
  try {
    await Promise.race([
      promise,
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      }),
    ]);
  } catch {
    // A failed stop must not block the new utterance.
  }
}

/**
 * Speak English text with the device voice.
 * Blank input is a no-op. Interrupts any current utterance first so rapid
 * taps never pile up in the speech queue. Never rejects: failures surface
 * through `onError` (and a dev warning) so callers can render
 * "Audio couldn't be played".
 */
export async function speakEnglish(
  text: string,
  callbacks?: SpeakEnglishCallbacks,
  options?: { explicitVoice?: boolean },
): Promise<void> {
  const trimmed = text.trim();
  if (trimmed.length === 0) return;
  await settleQuickly(Speech.stop(), 500);
  const useVoice = options?.explicitVoice ?? true;
  const voice = useVoice ? await getEnglishVoiceId() : undefined;
  if (__DEV__) {
    console.log("[speakEnglish] attempt:", {
      language: "en-US",
      voice: voice ?? "(language only)",
      text: trimmed.slice(0, 60),
    });
  }
  try {
    Speech.speak(trimmed, {
      // Full BCP-47 tag: strict OEM engines may ignore the bare "en" that
      // Google TTS on emulators accepts.
      language: "en-US",
      ...(voice !== undefined ? { voice } : {}),
      onStart: callbacks?.onStart,
      onDone: callbacks?.onDone,
      onStopped: callbacks?.onStopped,
      onError: (error) => {
        if (__DEV__) {
          console.warn("[speakEnglish] TTS error:", error?.message ?? error);
        }
        callbacks?.onError?.(error);
      },
    });
  } catch (error) {
    // A synchronous throw (unsupported engine, bad state) must surface as a
    // normal speech failure — callers `void` this promise, so an unhandled
    // rejection would otherwise buzz LogBox with no retry UI.
    const failure = error instanceof Error ? error : new Error(String(error));
    if (__DEV__) {
      console.warn("[speakEnglish] TTS error:", failure.message);
    }
    callbacks?.onError?.(failure);
  }
}

/** Interrupt English speech and clear the queue. Safe to call when idle. */
export function stopEnglish(): Promise<void> {
  return Speech.stop();
}
