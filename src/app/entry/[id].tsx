// Entry detail — Stitch "Dictionary Word Detail" structure adapted to real
// data with our identity (no level badges, photos, voice picker, or grammar
// notes — the dataset has none, and missing data is omitted, never invented):
// hero card (meta chips → headword → pronunciation → audio bar) → numbered
// sense cards with example boxes → synonyms/antonyms groups → related words
// → notes → status/source. Only resolved references navigate, never dead.
// Skill rules: scroll position in a shared value (never useState); hero
// motion derives from it via transform/opacity only; PressableScale chips;
// automatic scroll insets; ternary-with-null; strings in Text.

import { useFalamAudio } from "@/audio/audio-manager";
import { AudioButton } from "@/components/AudioButton";
import { BackRow } from "@/components/BackRow";
import { Card, CardBody } from "@/components/Card";
import { EnglishAudioButton } from "@/components/EnglishAudioButton";
import { FalamDownloadButton } from "@/components/FalamDownloadButton";
import { PressableScale } from "@/components/PressableScale";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { WaveBar } from "@/components/WaveBar";
import { dictionaryRepository } from "@/repositories";
import { useAudioSettings } from "@/stores/audio-settings";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { radius, spacing, useAppColors } from "@/theme";
import { useBottomClearance } from "@/hooks/use-bottom-clearance";
import type { DictionaryEntry } from "@/types/dictionary";
import { MaterialIcons } from "@expo/vector-icons";
import { useNetworkState } from "expo-network";
import { useLocalSearchParams, useRouter } from "expo-router";
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
        <Text variant="eyebrow" tone="secondary">
          {title.toUpperCase()}
        </Text>
      </View>
      <View style={styles.chips}>
        {resolved.map((entry) => (
          <PressableScale
            key={entry.id}
            accessibilityLabel={`Open ${entry.word}`}
            onPress={() => onPressEntry(entry.id)}
            style={[styles.chip, { backgroundColor: colors.surface2 }]}
          >
            <Text variant="label">{entry.word}</Text>
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
  const { isConnected } = useNetworkState();
  // Inconclusive connectivity never blocks bundled playback.
  const {
    audio: falamAudio,
    downloading: falamDownloading,
    download: downloadFalam,
  } = useFalamAudio(entry?.audioId, isConnected !== false);
  // No tab bar on this pushed screen — clear the system gesture bar only.
  const bottomClearance = useBottomClearance(false);
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
      <Screen>
        <View style={styles.topPad}>
          <BackRow floating />
        </View>
        <View style={styles.center}>
          <Text variant="label">Entry not found</Text>
          <Text variant="bodySm" tone="secondary">
            It may have been removed from the dataset.
          </Text>
        </View>
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
  // Local playability for the source footer: an id still resolving counts
  // as available (bundled resolution lands in milliseconds); only a settled
  // `unavailable` — or no id at all — reports otherwise.
  const recordingAvailable =
    entry.audioId !== undefined && falamAudio.status !== "unavailable";

  return (
    // No offline banner here: the floating back bar is absolutely positioned
    // at the top and would overlap it. Offline impact on this screen is
    // already explicit per audio control ("Audio unavailable").
    <Screen showOfflineBanner={false}>
      {/* Floating glass back row over the scroll content (BackRow carries
        its own edge padding when floating). Sibling of the ScrollView,
        rendered after it so it paints above on both platforms. */}
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, styles.contentUnderBar, { paddingBottom: bottomClearance }]}
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
                    style={[
                      styles.metaChip,
                      { backgroundColor: colors.surface2 },
                    ]}
                  >
                    <Text variant="labelSm" tone="accent">
                      {(entry.partOfSpeech as string).toUpperCase()}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.metaChip,
                    { backgroundColor: colors.surface2 },
                  ]}
                >
                  <Text variant="labelSm" tone="secondary">
                    {entry.verificationStatus === "draft"
                      ? "Draft"
                      : entry.verificationStatus === "reviewed"
                        ? "Reviewed"
                        : "Verified"}
                  </Text>
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
              <Text variant="wordHero" selectable>
                {entry.word}
              </Text>
              {hasPhonetic ? (
                <Text variant="phonetic" tone="secondary" selectable>
                  {entry.pronunciation as string}
                </Text>
              ) : null}
            </View>
            <View
              style={[styles.audioBar, { backgroundColor: colors.surface2 }]}
            >
              {falamAudio.status === "ready" && falamAudioEnabled ? (
                <AudioButton
                  source={falamAudio.source}
                  onPlayingChange={handlePlayingChange}
                />
              ) : falamAudio.status === "downloadable" &&
                falamAudioEnabled &&
                !falamDownloading ? (
                <FalamDownloadButton onPress={downloadFalam} />
              ) : (
                <View style={styles.audioNote}>
                  <MaterialIcons
                    name="volume-off"
                    size={18}
                    color={colors.muted}
                  />
                  <Text variant="label" tone="secondary" style={styles.audioNoteText}>
                    {!falamAudioEnabled
                      ? "Recordings off — enable in More → Audio"
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
                  <Text variant="label" tone={primary ? "accent" : "secondary"}>
                    {String(index + 1)}
                  </Text>
                </View>
                <Text variant="eyebrow" tone="secondary">
                  {multiSense ? `MEANING ${index + 1}` : "ENGLISH MEANING"}
                </Text>
              </View>
              <CardBody>
                <Text variant="definition" selectable>
                  {sense.english}
                </Text>
                <EnglishAudioButton text={sense.english} />
                {hasExamples ? (
                  <View style={styles.examples}>
                    <View style={styles.examplesLabel}>
                      <MaterialIcons
                        name="format-quote"
                        size={14}
                        color={colors.muted}
                      />
                      <Text variant="labelSm" tone="faint">
                        EXAMPLES
                      </Text>
                    </View>
                    {(sense.examples ?? []).map((example) => (
                      <View
                        key={`${sense.id}-${example.falam}-${example.english}`}
                        style={[
                          styles.example,
                          { backgroundColor: colors.surface2 },
                        ]}
                      >
                        <Text variant="exampleFal" selectable>
                          {example.falam}
                        </Text>
                        {example.english.length > 0 ? (
                          <Text variant="bodySm" tone="secondary">
                            {example.english}
                          </Text>
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
            <Text variant="eyebrow" tone="secondary">
              NOTE
            </Text>
            <CardBody>
              <Text variant="bodySm" tone="secondary" selectable>
                {entry.notes as string}
              </Text>
            </CardBody>
          </Card>
        ) : null}
        <View style={styles.block}>
          <Text variant="eyebrow" tone="secondary">
            STATUS
          </Text>
          <Text variant="bodySm" tone="secondary">
            {entry.verificationStatus === "draft"
              ? "Draft · contributed wordlist, awaiting verification"
              : entry.verificationStatus === "reviewed"
                ? "Reviewed · awaiting final verification"
                : "Verified · reviewed by a knowledgeable speaker"}
          </Text>
        </View>
        <View style={styles.block}>
          <Text variant="eyebrow" tone="secondary">
            SOURCE
          </Text>
          <Text variant="bodySm" tone="faint">
            {`${entry.source?.sourceName ?? "Unknown"} · ${recordingAvailable ? "pronunciation recording available" : "pronunciation recording not available"}`}
          </Text>
        </View>
      </Animated.ScrollView>
      <BackRow floating title={entry.word} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Screen-edge padding for the in-flow back row (floating carries its own).
  topPad: {
    paddingHorizontal: spacing.lg,
  },
  // Clearance for the floating glass bar: bar height (8 + 44 + 5 + 4) plus
  // breathing room, so the hero never starts tucked under the blur.
  contentUnderBar: {
    paddingTop: 72,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  center: {
    alignItems: "center",
    flex: 1,
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
    // Bounded flex item: the copy wraps inside the bar instead of pushing
    // the row (and its icon) past the card edge. minWidth: 0 lets Android
    // measure the text within the remaining space.
    flex: 1,
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  audioNoteText: {
    flexShrink: 1,
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
