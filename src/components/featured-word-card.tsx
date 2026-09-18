// Featured word card — Stitch "Word of the Day" pattern with honest data:
// a deterministic daily pick from real dictionary entries (day number
// modulo dataset size), never invented content. Star toggles the real
// wordbook favorite; audio plays only when the entry resolves to a bundled
// recording; the example box renders only verified dataset examples.
// Tapping the card opens the full entry.

import { useCallback, useMemo, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Pressable as GesturePressable } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getFalamAudioSource } from "@/audio/audio-files";
import { FalamAudioButton } from "@/audio/falam-audio-button";
import { PosTag } from "./pos-chip";
import { ThemedText } from "./themed-text";
import { WaveBars } from "./wave-bars";
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

export function FeaturedWordCard() {
  const colors = useAppColors();
  const { push } = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { falamAudioEnabled } = useAudioSettings();

  const entry = useMemo(() => pickFeatured(), []);
  const favorite = entry !== undefined && isFavorite(entry.id);

  // Nested-press guard (see LookupRow): star/audio touches mark the time
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
  const audioSource =
    entry.audioId !== undefined
      ? getFalamAudioSource(entry.audioId)
      : undefined;
  const canPlayAudio = audioSource !== undefined && falamAudioEnabled;

  return (
    <GesturePressable
      accessibilityRole="button"
      accessibilityLabel={`Featured word ${entry.word}`}
      onPress={openEntry}
      style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}
    >
      <View style={styles.eyebrowRow}>
        <ThemedText variant="eyebrow" tone="secondary">
          FEATURED WORD
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            favorite
              ? `Remove ${entry.word} from wordbook`
              : `Save ${entry.word} to wordbook`
          }
          accessibilityState={{ selected: favorite }}
          onPress={handleStar}
          onTouchStart={markInnerPress}
          hitSlop={8}
          style={styles.star}
        >
          <MaterialIcons
            name={favorite ? "star" : "star-border"}
            size={22}
            color={favorite ? colors.peach : colors.muted2}
          />
        </Pressable>
      </View>
      <View style={styles.headline}>
        <ThemedText variant="resultQuery" selectable>
          {entry.word}
        </ThemedText>
        {hasPhonetic ? (
          <ThemedText variant="bodySm" tone="secondary" selectable>
            {entry.pronunciation as string}
          </ThemedText>
        ) : null}
        {hasPos ? <PosTag label={entry.partOfSpeech as string} /> : null}
      </View>
      <View style={styles.audioRow}>
        {canPlayAudio ? (
          <View onTouchStart={markInnerPress}>
            <FalamAudioButton source={audioSource as number} />
          </View>
        ) : (
          <View style={[styles.audioNote, { backgroundColor: colors.surface2 }]}>
            <MaterialIcons name="volume-off" size={16} color={colors.muted} />
            <ThemedText variant="labelSm" tone="secondary">
              Audio unavailable
            </ThemedText>
          </View>
        )}
        <WaveBars color={colors.accent} />
      </View>
      {firstSense !== undefined ? (
        <ThemedText variant="definition" selectable>
          {firstSense.english}
        </ThemedText>
      ) : null}
      {firstExample !== undefined ? (
        <View style={[styles.example, { backgroundColor: colors.surface2 }]}>
          <MaterialIcons name="format-quote" size={18} color={colors.accent} />
          <View style={styles.exampleCopy}>
            <ThemedText variant="exampleFal" selectable>
              {firstExample.falam}
            </ThemedText>
            {firstExample.english.length > 0 ? (
              <ThemedText variant="bodySm" tone="secondary">
                {firstExample.english}
              </ThemedText>
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
  star: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
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
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
