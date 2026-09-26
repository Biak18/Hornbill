// FeaturedCard — Stitch "Word of the Day" pattern with honest data:
// a deterministic daily pick from real dictionary entries (day number
// modulo dataset size), never invented content. Star toggles the real
// wordbook favorite; audio plays only when the entry resolves to a bundled
// recording; the example box renders only verified dataset examples.
// Tapping the card opens the full entry.

import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Pressable as GesturePressable } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { useNetworkState } from "expo-network";
import { useRouter } from "expo-router";
import { useFalamAudio } from "@/audio/audio-manager";
import { AudioButton } from "./AudioButton";
import { Chip } from "./Chip";
import { FalamDownloadButton } from "./FalamDownloadButton";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { WaveBar } from "./WaveBar";
import { dictionaryRepository } from "@/repositories";
import { useAudioSettings } from "@/stores/audio-settings";
import { useFavorites } from "@/stores/favorites";
import { radius, spacing, useAppColors } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";

const DAY_MS = 86_400_000;

function pickFeatured(): DictionaryEntry | undefined {
  const entries = dictionaryRepository.getAllEntries();
  if (entries.length === 0) {
    return undefined;
  }
  const dayNumber = Math.floor(Date.now() / DAY_MS);
  return entries[dayNumber % entries.length];
}

export function FeaturedCard() {
  const colors = useAppColors();
  const { push } = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { falamAudioEnabled } = useAudioSettings();

  const entry = useMemo(() => pickFeatured(), []);
  const favorite = entry !== undefined && isFavorite(entry.id);
  const [audioPlaying, setAudioPlaying] = useState(false);
  // Manager resolution (bundled → cached → honest unavailability), before
  // the early return below. Inconclusive connectivity never blocks bundled
  // playback.
  const { isConnected } = useNetworkState();
  const {
    audio: falamAudio,
    downloading: falamDownloading,
    download: downloadFalam,
  } = useFalamAudio(entry?.audioId, isConnected !== false);

  const handlePlayingChange = useCallback((next: boolean) => {
    setAudioPlaying(next);
  }, []);

  // Nested-press guard (see WordCard): star/audio touches mark the time
  // at touch-down so the card ignores the press they consume.
  const innerPressAt = useRef(0);
  const markInnerPress = useCallback(() => {
    innerPressAt.current = Date.now();
  }, []);

  const openEntry = useCallback(() => {
    if (Date.now() - innerPressAt.current < 350) {
      return;
    }
    if (entry !== undefined) {
      push({ pathname: "/entry/[id]", params: { id: entry.id } });
    }
  }, [entry, push]);

  const handleStar = useCallback(() => {
    if (entry !== undefined) {
      toggleFavorite(entry.id);
    }
  }, [entry, toggleFavorite]);

  const cardStyle = useMemo(
    () => [
      styles.card,
      { backgroundColor: colors.paper, borderColor: colors.line },
    ],
    [colors.paper, colors.line],
  );

  if (entry === undefined) {
    return null;
  }

  const firstSense = entry.definitions[0];
  const firstExample = firstSense?.examples?.[0];
  const hasPhonetic =
    entry.pronunciation !== undefined && entry.pronunciation.length > 0;
  const hasPos =
    entry.partOfSpeech !== undefined && entry.partOfSpeech.length > 0;

  return (
    <GesturePressable
      accessibilityRole="button"
      accessibilityLabel={`Featured word ${entry.word}`}
      onPress={openEntry}
      style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}
    >
      <View style={styles.eyebrowRow}>
        <Text variant="eyebrow" tone="secondary">
          FEATURED WORD
        </Text>
        <IconButton
          name={favorite ? "star" : "star-border"}
          accessibilityLabel={
            favorite
              ? `Remove ${entry.word} from wordbook`
              : `Save ${entry.word} to wordbook`
          }
          selected={favorite}
          onPress={handleStar}
          onTouchStart={markInnerPress}
        />
      </View>
      <View style={styles.headline}>
        <Text variant="resultQuery" selectable>
          {entry.word}
        </Text>
        {hasPhonetic ? (
          <Text variant="bodySm" tone="secondary" selectable>
            {entry.pronunciation as string}
          </Text>
        ) : null}
        {hasPos ? <Chip label={entry.partOfSpeech as string} /> : null}
      </View>
      <View style={styles.audioRow}>
        {falamAudio.status === "ready" && falamAudioEnabled ? (
          <View onTouchStart={markInnerPress}>
            <AudioButton
              source={falamAudio.source}
              onPlayingChange={handlePlayingChange}
            />
          </View>
        ) : falamAudio.status === "downloadable" &&
          falamAudioEnabled &&
          !falamDownloading ? (
          <View onTouchStart={markInnerPress}>
            <FalamDownloadButton onPress={downloadFalam} />
          </View>
        ) : (
          <View style={[styles.audioNote, { backgroundColor: colors.surface2 }]}>
            <MaterialIcons name="volume-off" size={16} color={colors.muted} />
            <Text variant="labelSm" tone="secondary" style={styles.audioNoteText}>
              {!falamAudioEnabled
                ? "Recordings off"
                : falamDownloading || falamAudio.status === "checking"
                  ? "Preparing audio…"
                  : falamAudio.status === "unavailable" &&
                      falamAudio.reason === "offline"
                    ? "Unavailable offline"
                    : "Audio unavailable"}
            </Text>
          </View>
        )}
        <WaveBar color={colors.accent} active={audioPlaying} />
      </View>
      {firstSense !== undefined ? (
        <Text variant="definition" selectable>
          {firstSense.english}
        </Text>
      ) : null}
      {firstExample !== undefined ? (
        <View style={[styles.example, { backgroundColor: colors.surface2 }]}>
          <MaterialIcons name="format-quote" size={18} color={colors.accent} />
          <View style={styles.exampleCopy}>
            <Text variant="exampleFal" selectable>
              {firstExample.falam}
            </Text>
            {firstExample.english.length > 0 ? (
              <Text variant="bodySm" tone="secondary">
                {firstExample.english}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </GesturePressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    boxShadow: "0 2px 12px rgba(12, 32, 27, 0.08)",
  },
  pressed: {
    opacity: 0.7,
  },
  eyebrowRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headline: {
    gap: spacing.xs,
  },
  audioRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  audioNote: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    // Same bounded-flex fix as the entry audio bar: copy wraps instead of
    // pushing the row past the card edge.
    flex: 1,
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  audioNoteText: {
    flexShrink: 1,
  },
  example: {
    borderRadius: radius.card,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  exampleCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
