// Entry detail — word-first hierarchy: headword → pronunciation → POS →
// audio → meanings → related. Original design, Papago-inspired clarity.
// Skill rules:
// - Scroll position lives in a Reanimated shared value via
//   useAnimatedScrollHandler (skill 4.1 — never useState for scroll).
//   Hero fade/scale derive from it (ground truth + useDerivedValue,
//   skills 6.1/7.1/3.2) and animate transform/opacity only (skill 3.1).
// - Favorite + chips use PressableScale (GestureDetector, UI thread).
// - ScrollView is the content root with contentInsetAdjustmentBehavior
//   automatic (skill 9.4); gap + boxShadow + borderCurve (skill 9.2).
// - Ternary-with-null conditionals; strings inside ThemedText.

import { getFalamAudioSource } from "@/audio/audio-files";
import { FalamAudioButton } from "@/audio/falam-audio-button";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { Card, CardBody, PressableScale } from "@/components/ui";
import { dictionaryRepository } from "@/repositories";
import { useAudioSettings } from "@/stores/audio-settings";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { radius, spacing, useAppColors } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

function ResolvedChips({
  title,
  ids,
  onPressEntry,
}: {
  title: string;
  ids: readonly string[];
  onPressEntry: (id: string) => void;
}) {
  const colors = useAppColors();
  const resolved = useMemo(
    () =>
      ids
        .map((id) => dictionaryRepository.getEntryById(id))
        .filter((entry): entry is DictionaryEntry => entry !== undefined),
    [ids],
  );
  if (resolved.length === 0) {
    return null;
  }
  return (
    <View style={styles.block}>
      <ThemedText variant="eyebrow" tone="secondary">
        {title.toUpperCase()}
      </ThemedText>
      <View style={styles.chips}>
        {resolved.map((entry) => (
          <PressableScale
            key={entry.id}
            accessibilityLabel={`Open ${entry.word}`}
            onPress={() => onPressEntry(entry.id)}
            style={[styles.chip, { borderColor: colors.line }]}
          >
            <ThemedText variant="chip">{entry.word}</ThemedText>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

export default function EntryScreen() {
  const colors = useAppColors();
  const params = useLocalSearchParams<{ id: string }>();
  const { push } = useRouter();
  const rawId = params.id;
  const entry =
    typeof rawId === "string"
      ? dictionaryRepository.getEntryById(rawId)
      : undefined;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { record } = useHistory();
  const { falamAudioEnabled } = useAudioSettings();

  // Scroll ground truth (shared value, never useState) for hero motion.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.set(e.contentOffset.y);
    },
  });
  const heroProgress = useDerivedValue(() =>
    Math.min(Math.max(scrollY.get() / 160, 0), 1),
  );
  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(heroProgress.get(), [0, 1], [1, 0.55]),
    transform: [
      { scale: interpolate(heroProgress.get(), [0, 1], [1, 0.98]) },
      { translateY: interpolate(heroProgress.get(), [0, 1], [0, 8]) },
    ],
  }));

  useEffect(() => {
    if (entry !== undefined) {
      record(entry.id);
    }
  }, [entry, record]);

  const handlePressEntry = useCallback(
    (id: string) => {
      push({ pathname: "/entry/[id]", params: { id } });
    },
    [push],
  );

  if (entry === undefined) {
    return (
      <Screen style={styles.center}>
        <ThemedText variant="label">Entry not found</ThemedText>
        <ThemedText variant="bodySm" tone="secondary">
          It may have been removed from the dataset.
        </ThemedText>
      </Screen>
    );
  }

  const favorite = isFavorite(entry.id);
  const multiSense = entry.definitions.length > 1;
  const audioSource =
    entry.audioId !== undefined
      ? getFalamAudioSource(entry.audioId)
      : undefined;
  const hasPronunciation =
    entry.pronunciation !== undefined && entry.pronunciation.length > 0;
  const hasPos =
    entry.partOfSpeech !== undefined && entry.partOfSpeech.length > 0;
  const canPlayAudio = audioSource !== undefined && falamAudioEnabled;

  return (
    <Screen>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.actionsRow}>
          <PressableScale
            accessibilityLabel={
              favorite
                ? `Remove ${entry.word} from favorites`
                : `Save ${entry.word} to favorites`
            }
            onPress={() => toggleFavorite(entry.id)}
            style={[
              styles.saveButton,
              { backgroundColor: colors.surface2 },
            ]}
          >
            <MaterialIcons
              name={favorite ? "favorite" : "favorite-border"}
              size={22}
              color={favorite ? colors.peach : colors.muted}
            />
          </PressableScale>
        </View>
        <Animated.View style={[styles.heroCard, heroStyle]}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: colors.paper,
                // Skill 9.2: native CSS gradient, no third-party library.
                experimental_backgroundImage: `linear-gradient(to bottom, ${colors.accentSoft}, ${colors.paper} 70%)`,
              },
            ]}
          >
            <ThemedText variant="wordHero" selectable>
              {entry.word}
            </ThemedText>
            {hasPronunciation ? (
              <ThemedText
                variant="phonetic"
                tone="secondary"
                selectable
              >
                {entry.pronunciation as string}
              </ThemedText>
            ) : null}
            {hasPos ? (
              <View style={styles.posRow}>
                <View
                  style={[styles.posDot, { backgroundColor: colors.peach }]}
                />
                <ThemedText variant="label" tone="accent">
                  {entry.partOfSpeech as string}
                </ThemedText>
              </View>
            ) : null}
            <View style={styles.actions}>
              {canPlayAudio ? (
                <FalamAudioButton source={audioSource as number} />
              ) : (
                <View
                  style={[
                    styles.audioNote,
                    { backgroundColor: colors.surface2 },
                  ]}
                >
                  <MaterialIcons
                    name="volume-off"
                    size={18}
                    color={colors.muted}
                  />
                  <ThemedText variant="label" tone="secondary">
                    {!falamAudioEnabled
                      ? "Recordings off — enable in More → Audio"
                      : "Audio unavailable"}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
        {entry.definitions.map((sense, index) => {
          const hasExamples =
            sense.examples !== undefined && sense.examples.length > 0;
          return (
            <Card
              key={sense.id}
              style={[styles.sense, { backgroundColor: colors.surface }]}
            >
              <ThemedText variant="eyebrow" tone="secondary">
                {multiSense ? `MEANING ${index + 1}` : "ENGLISH MEANING"}
              </ThemedText>
              <CardBody>
                <ThemedText variant="definition" selectable>
                  {sense.english}
                </ThemedText>
                {hasExamples ? (
                  <View style={styles.examples}>
                    {(sense.examples ?? []).map((example) => (
                      <View
                        key={`${sense.id}-${example.falam}-${example.english}`}
                        style={[
                          styles.example,
                          { backgroundColor: colors.paper },
                        ]}
                      >
                        <ThemedText variant="exampleFal" selectable>
                          {example.falam}
                        </ThemedText>
                        {example.english ? (
                          <ThemedText variant="bodySm" tone="secondary">
                            {example.english}
                          </ThemedText>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
              </CardBody>
            </Card>
          );
        })}
        <View style={styles.block}>
          <ThemedText variant="eyebrow" tone="secondary">
            STATUS
          </ThemedText>
          <ThemedText variant="bodySm" tone="secondary">
            Draft · contributed wordlist, awaiting verification
          </ThemedText>
        </View>
        {entry.synonyms !== undefined ? (
          <ResolvedChips
            title="Synonyms"
            ids={entry.synonyms}
            onPressEntry={handlePressEntry}
          />
        ) : null}
        {entry.relatedWords !== undefined ? (
          <ResolvedChips
            title="Related words"
            ids={entry.relatedWords}
            onPressEntry={handlePressEntry}
          />
        ) : null}
        <View style={styles.block}>
          <ThemedText variant="eyebrow" tone="secondary">
            SOURCE
          </ThemedText>
          <ThemedText variant="bodySm" tone="faint">
            {`${entry.source?.sourceName ?? "Unknown"} · pronunciation recording not available`}
          </ThemedText>
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  center: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
  actionsRow: {
    alignItems: "flex-end",
  },
  saveButton: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    height: 44,
    justifyContent: "center",
    width: 44,
    boxShadow: "0 2px 8px rgba(12, 32, 27, 0.12)",
  },
  heroCard: {
    borderRadius: radius.card,
    borderCurve: "continuous",
  },
  hero: {
    borderRadius: radius.card,
    borderCurve: "continuous",
    gap: spacing.sm,
    padding: spacing.lg,
    boxShadow: "0 2px 12px rgba(12, 32, 27, 0.08)",
  },
  posRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  posDot: {
    borderRadius: radius.full,
    height: 6,
    width: 6,
  },
  actions: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  audioNote: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  sense: {
    gap: spacing.sm,
  },
  block: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  examples: {
    gap: spacing.sm,
  },
  example: {
    borderRadius: radius.card,
    borderCurve: "continuous",
    gap: spacing.xs,
    padding: spacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.full,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
