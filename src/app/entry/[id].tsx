// Entry detail (polished `.screen-entry`):
// backline + save heart, huge Noto headword, pronunciation, peach-dot POS,
// audio pill (honest unavailable state until the Phase 4 engine lands),
// per-sense meaning blocks with example cards, tappable related chips that
// resolve to real entries, honest source line. Only rendered chips navigate
// — unresolvable references are filtered out, never dead.

import { useCallback, useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { dictionaryRepository } from "@/repositories";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { radius, spacing, useAppColors } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";

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
          <Pressable
            key={entry.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${entry.word}`}
            onPress={() => onPressEntry(entry.id)}
            style={[styles.chip, { borderColor: colors.line }]}
          >
            <ThemedText variant="chip">{entry.word}</ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function EntryScreen() {
  const colors = useAppColors();
  const params = useLocalSearchParams<{ id: string }>();
  const { back, push } = useRouter();
  const rawId = params.id;
  const entry =
    typeof rawId === "string"
      ? dictionaryRepository.getEntryById(rawId)
      : undefined;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { record } = useHistory();

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
        <Stack.Screen options={{ title: "Not found" }} />
        <ThemedText variant="label">Entry not found</ThemedText>
        <ThemedText variant="bodySm" tone="secondary">
          It may have been removed from the dataset.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={back}
          style={styles.backLink}
        >
          <ThemedText variant="label" tone="accent">
            Go back
          </ThemedText>
        </Pressable>
      </Screen>
    );
  }

  const favorite = isFavorite(entry.id);
  const multiSense = entry.definitions.length > 1;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: entry.word }} />
        <View style={styles.topline}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={back}
            style={styles.backline}
          >
            <MaterialIcons name="arrow-back" size={18} color={colors.muted} />
            <ThemedText variant="bodySm" tone="secondary">
              Back
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favorite
                ? `Remove ${entry.word} from favorites`
                : `Save ${entry.word} to favorites`
            }
            accessibilityState={{ selected: favorite }}
            onPress={() => toggleFavorite(entry.id)}
            style={styles.saveButton}
          >
            <MaterialIcons
              name={favorite ? "favorite" : "favorite-border"}
              size={22}
              color={favorite ? colors.peach : colors.muted}
            />
          </Pressable>
        </View>
        <View style={styles.hero}>
          <ThemedText variant="wordHero" selectable>
            {entry.word}
          </ThemedText>
          {entry.pronunciation ? (
            <ThemedText variant="phonetic" tone="secondary" selectable>
              {entry.pronunciation}
            </ThemedText>
          ) : null}
          {entry.partOfSpeech ? (
            <View style={styles.posRow}>
              <View style={[styles.posDot, { backgroundColor: colors.peach }]} />
              <ThemedText variant="label" tone="accent">
                {entry.partOfSpeech}
              </ThemedText>
            </View>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Falam audio unavailable"
              accessibilityState={{ disabled: true }}
              disabled
              style={[styles.audioPill, { backgroundColor: colors.surface2 }]}
            >
              <MaterialIcons
                name="volume-off"
                size={18}
                color={colors.muted}
              />
              <ThemedText variant="label" tone="secondary">
                Audio unavailable
              </ThemedText>
            </Pressable>
          </View>
        </View>
        {entry.definitions.map((sense, index) => (
          <View key={sense.id} style={styles.block}>
            <ThemedText variant="eyebrow" tone="secondary">
              {multiSense ? `MEANING ${index + 1}` : "ENGLISH MEANING"}
            </ThemedText>
            <ThemedText variant="definition" selectable>
              {sense.english}
            </ThemedText>
            {sense.examples ? (
              <View style={styles.examples}>
                {sense.examples.map((example) => (
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
                    <ThemedText variant="bodySm" tone="secondary">
                      {example.english}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}
        <View style={styles.block}>
          <ThemedText variant="eyebrow" tone="secondary">
            STATUS
          </ThemedText>
          <ThemedText variant="bodySm" tone="secondary">
            Draft placeholder · not verified linguistic data
          </ThemedText>
        </View>
        {entry.synonyms ? (
          <ResolvedChips
            title="Synonyms"
            ids={entry.synonyms}
            onPressEntry={handlePressEntry}
          />
        ) : null}
        {entry.relatedWords ? (
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  center: {
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
  backLink: {
    padding: spacing.sm,
  },
  topline: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backline: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  saveButton: {
    padding: spacing.xs,
  },
  hero: {
    gap: spacing.sm,
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
  audioPill: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  block: {
    borderTopColor: "transparent",
    borderTopWidth: 0,
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
