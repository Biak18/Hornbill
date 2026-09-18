// Entry detail — Stitch "Dictionary Word Detail" structure adapted to real
// data with our identity (no level badges, photos, voice picker, or grammar
// notes — the dataset has none, and missing data is omitted, never invented):
// hero card (meta chips → headword → pronunciation → audio bar) → numbered
// sense cards with example boxes → synonyms/antonyms groups → related words
// → notes → status/source. Only resolved references navigate, never dead.
// Skill rules: scroll position in a shared value (never useState); hero
// motion derives from it via transform/opacity only; PressableScale chips;
// automatic scroll insets; ternary-with-null; strings in ThemedText.

import { getFalamAudioSource } from "@/audio/audio-files";
import { FalamAudioButton } from "@/audio/falam-audio-button";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { Card, CardBody, PressableScale } from "@/components/ui";
import { WaveBars } from "@/components/wave-bars";
import { dictionaryRepository } from "@/repositories";
import { useAudioSettings } from "@/stores/audio-settings";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { radius, spacing, useAppColors } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

function ChipGroup({
  title,
  dotColor,
  ids,
  onPressEntry,
}: {
  title: string;
  dotColor: string;
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
    <Card style={[styles.group, { backgroundColor: colors.paper }]}>
      <View style={styles.groupTitle}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <ThemedText variant="eyebrow" tone="secondary">
          {title.toUpperCase()}
        </ThemedText>
      </View>
      <View style={styles.chips}>
        {resolved.map((entry) => (
          <PressableScale
            key={entry.id}
            accessibilityLabel={`Open ${entry.word}`}
            onPress={() => onPressEntry(entry.id)}
            style={[styles.chip, { backgroundColor: colors.surface2 }]}
          >
            <ThemedText variant="label">{entry.word}</ThemedText>
            <MaterialIcons
              name="arrow-forward"
              size={14}
              color={colors.muted2}
            />
          </PressableScale>
        ))}
      </View>
    </Card>
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
  const [audioPlaying, setAudioPlaying] = useState(false);

  const handlePlayingChange = useCallback((next: boolean) => {
    setAudioPlaying(next);
  }, []);

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
  const hasPhonetic =
    entry.pronunciation !== undefined && entry.pronunciation.length > 0;
  const hasPos =
    entry.partOfSpeech !== undefined && entry.partOfSpeech.length > 0;
  const hasNotes = entry.notes !== undefined && entry.notes.length > 0;
  const audioSource =
    entry.audioId !== undefined
      ? getFalamAudioSource(entry.audioId)
      : undefined;
  const canPlayAudio = audioSource !== undefined && falamAudioEnabled;

  return (
    <Screen>
      {/* Dynamic header title: the headword itself. The layout fallback
        ("Entry") only shows when the entry can't be resolved. */}
      <Stack.Screen options={{ title: entry.word }} />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Animated.View style={heroStyle}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: colors.paper,
                borderColor: colors.line,
                // Native CSS gradient wash, no third-party library.
                experimental_backgroundImage: `linear-gradient(to bottom, ${colors.accentSoft}, ${colors.paper} 70%)`,
              },
            ]}
          >
            <View style={styles.metaRow}>
              <View style={styles.metaChips}>
                {hasPos ? (
                  <View
                    style={[styles.metaChip, { backgroundColor: colors.surface2 }]}
                  >
                    <ThemedText variant="labelSm" tone="accent">
                      {(entry.partOfSpeech as string).toUpperCase()}
                    </ThemedText>
                  </View>
                ) : null}
                <View
                  style={[styles.metaChip, { backgroundColor: colors.surface2 }]}
                >
                  <ThemedText variant="labelSm" tone="secondary">
                    {entry.verificationStatus === "draft"
                      ? "Draft"
                      : entry.verificationStatus === "reviewed"
                        ? "Reviewed"
                        : "Verified"}
                  </ThemedText>
                </View>
              </View>
              <PressableScale
                accessibilityLabel={
                  favorite
                    ? `Remove ${entry.word} from wordbook`
                    : `Save ${entry.word} to wordbook`
                }
                onPress={() => toggleFavorite(entry.id)}
                style={styles.saveButton}
              >
                <MaterialIcons
                  name={favorite ? "star" : "star-border"}
                  size={22}
                  color={favorite ? colors.peach : colors.muted}
                />
              </PressableScale>
            </View>
            <View style={styles.headline}>
              <ThemedText variant="wordHero" selectable>
                {entry.word}
              </ThemedText>
              {hasPhonetic ? (
                <ThemedText variant="phonetic" tone="secondary" selectable>
                  {entry.pronunciation as string}
                </ThemedText>
              ) : null}
            </View>
            <View
              style={[styles.audioBar, { backgroundColor: colors.surface2 }]}
            >
              {canPlayAudio ? (
                <FalamAudioButton
                  source={audioSource as number}
                  onPlayingChange={handlePlayingChange}
                />
              ) : (
                <View style={styles.audioNote}>
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
              <WaveBars color={colors.accent} active={audioPlaying} />
            </View>
          </View>
        </Animated.View>
        {entry.definitions.map((sense, index) => {
          const hasExamples =
            sense.examples !== undefined && sense.examples.length > 0;
          const primary = index === 0;
          return (
            <Card
              key={sense.id}
              style={[
                styles.sense,
                { backgroundColor: colors.paper, borderColor: colors.line },
              ]}
            >
              <View style={styles.senseHead}>
                <View
                  style={[
                    styles.senseNumber,
                    {
                      backgroundColor: primary
                        ? colors.accentSoft
                        : colors.surface2,
                    },
                  ]}
                >
                  <ThemedText
                    variant="label"
                    tone={primary ? "accent" : "secondary"}
                  >
                    {String(index + 1)}
                  </ThemedText>
                </View>
                <ThemedText variant="eyebrow" tone="secondary">
                  {multiSense ? `MEANING ${index + 1}` : "ENGLISH MEANING"}
                </ThemedText>
              </View>
              <CardBody>
                <ThemedText variant="definition" selectable>
                  {sense.english}
                </ThemedText>
                {hasExamples ? (
                  <View style={styles.examples}>
                    <View style={styles.examplesLabel}>
                      <MaterialIcons
                        name="format-quote"
                        size={14}
                        color={colors.muted}
                      />
                      <ThemedText variant="labelSm" tone="faint">
                        EXAMPLES
                      </ThemedText>
                    </View>
                    {(sense.examples ?? []).map((example) => (
                      <View
                        key={`${sense.id}-${example.falam}-${example.english}`}
                        style={[
                          styles.example,
                          { backgroundColor: colors.surface2 },
                        ]}
                      >
                        <ThemedText variant="exampleFal" selectable>
                          {example.falam}
                        </ThemedText>
                        {example.english.length > 0 ? (
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
        {entry.synonyms !== undefined ? (
          <ChipGroup
            title="Synonyms"
            dotColor={colors.accent}
            ids={entry.synonyms}
            onPressEntry={handlePressEntry}
          />
        ) : null}
        {entry.antonyms !== undefined ? (
          <ChipGroup
            title="Antonyms"
            dotColor={colors.peach}
            ids={entry.antonyms}
            onPressEntry={handlePressEntry}
          />
        ) : null}
        {entry.relatedWords !== undefined ? (
          <ChipGroup
            title="Related words"
            dotColor={colors.muted2}
            ids={entry.relatedWords}
            onPressEntry={handlePressEntry}
          />
        ) : null}
        {hasNotes ? (
          <Card
            style={[
              styles.sense,
              { backgroundColor: colors.paper, borderColor: colors.line },
            ]}
          >
            <ThemedText variant="eyebrow" tone="secondary">
              NOTE
            </ThemedText>
            <CardBody>
              <ThemedText variant="bodySm" tone="secondary" selectable>
                {entry.notes as string}
              </ThemedText>
            </CardBody>
          </Card>
        ) : null}
        <View style={styles.block}>
          <ThemedText variant="eyebrow" tone="secondary">
            STATUS
          </ThemedText>
          <ThemedText variant="bodySm" tone="secondary">
            {entry.verificationStatus === "draft"
              ? "Draft · contributed wordlist, awaiting verification"
              : entry.verificationStatus === "reviewed"
                ? "Reviewed · awaiting final verification"
                : "Verified · reviewed by a knowledgeable speaker"}
          </ThemedText>
        </View>
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
  hero: {
    borderRadius: radius.card,
    borderCurve: "continuous",
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    boxShadow: "0 4px 16px rgba(12, 32, 27, 0.08)",
  },
  metaRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaChips: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  metaChip: {
    borderRadius: radius.full,
    borderCurve: "continuous",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  saveButton: {
    padding: spacing.xs,
  },
  headline: {
    gap: spacing.xs,
  },
  audioBar: {
    alignItems: "center",
    borderRadius: radius.card,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    padding: spacing.sm,
    paddingLeft: spacing.md,
  },
  audioNote: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  sense: {
    borderWidth: 1,
    gap: spacing.sm,
  },
  senseHead: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  senseNumber: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  examples: {
    gap: spacing.sm,
  },
  examplesLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  example: {
    borderRadius: radius.card,
    borderCurve: "continuous",
    gap: 2,
    padding: spacing.md,
  },
  group: {
    borderWidth: 1,
    gap: spacing.sm,
  },
  groupTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dot: {
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  block: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
});
