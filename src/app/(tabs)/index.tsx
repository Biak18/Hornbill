// Search home — language-first, Papago-inspired but original.
// UX: direction pill → big search field → tone chips → results.
// Skill rules:
// - Lists: results AND recents both render through EntryList (FlashList,
//   skill 2.6); no ScrollView+FlatList nesting, no full-dataset state.
// - State is minimal ground truth (query, direction); results/recent/count
//   are derived during render (skill 6.1).
// - Ternary-with-null conditionals; all strings inside ThemedText.
// - Styling: gap, borderCurve continuous, boxShadow strings (skill 9.2);
//   hero uses native experimental_backgroundImage gradient (no new dep).

import { EmptyState } from "@/components/empty-state";
import { EntryList } from "@/components/entry-list";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui";
import { dictionaryRepository } from "@/repositories";
import { searchDictionary, type SearchDirection } from "@/services/search";
import { useHistory } from "@/stores/history";
import { radius, spacing, useAppColors } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

const DIACRITICS = ["â", "ē", "ī", "ō", "ū"] as const;
const SEARCH_LIMIT = 20;
const RECENT_LIMIT = 5;

const DIRECTIONS: readonly { value: SearchDirection; label: string }[] = [
  { value: "falam-en", label: "Falam → English" },
  { value: "en-falam", label: "English → Falam" },
];

export default function SearchScreen() {
  const colors = useAppColors();
  const { push } = useRouter();
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<SearchDirection>("falam-en");
  const { historyIds, clear } = useHistory();
  const inputRef = useRef<TextInput>(null);

  // Derived: search results from ground-truth query+direction (no sync effects).
  const { results, errorMessage } = useMemo(() => {
    try {
      return {
        results: searchDictionary(query, {
          repository: dictionaryRepository,
          limit: SEARCH_LIMIT,
          direction,
        }),
        errorMessage: null as string | null,
      };
    } catch {
      return {
        results: [] as DictionaryEntry[],
        errorMessage: "Search failed. Try again.",
      };
    }
  }, [query, direction]);

  const recentEntries = useMemo(
    () =>
      historyIds
        .map((id) => dictionaryRepository.getEntryById(id))
        .filter((entry): entry is DictionaryEntry => entry !== undefined)
        .slice(0, RECENT_LIMIT),
    [historyIds],
  );

  const handlePressEntry = useCallback(
    (id: string) => {
      push({ pathname: "/entry/[id]", params: { id } });
    },
    [push],
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  const appendDiacritic = useCallback((mark: string) => {
    setQuery((prev) => prev + mark);
    inputRef.current?.focus();
  }, []);

  const trimmed = query.trim();
  const isBlank = trimmed.length === 0;
  const searchingEnglish = direction === "en-falam";
  const hasQuery = query.length > 0;
  const hasRecent = recentEntries.length > 0;

  return (
    <Screen>
      <View style={styles.topBlock}>
        <View style={styles.greeting}>
          <ThemedText variant="eyebrow" tone="secondary">
            FALAM DICTIONARY
          </ThemedText>
          <ThemedText variant="greeting">Look up a word</ThemedText>
        </View>
        <View style={[styles.segmented, { backgroundColor: colors.paper }]}>
          {DIRECTIONS.map((option) => {
            const active = direction === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityLabel={`Search ${option.label}`}
                accessibilityState={{ selected: active }}
                onPress={() => setDirection(option.value)}
                style={[
                  styles.directionOption,
                  active
                    ? [
                        styles.directionActive,
                        { backgroundColor: colors.surface },
                      ]
                    : null,
                ]}
              >
                <ThemedText
                  variant="label"
                  tone={active ? "accent" : "secondary"}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <View
          style={[
            styles.searchField,
            {
              backgroundColor: colors.surface,
              borderColor: colors.line,
            },
          ]}
        >
          <MaterialIcons name="search" size={22} color={colors.accent} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder={
              searchingEnglish
                ? "Search an English meaning"
                : "Search a Falam word"
            }
            placeholderTextColor={colors.muted2 as string}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Search the dictionary"
            style={[styles.input, { color: colors.ink }]}
          />
          {hasQuery ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={clearQuery}
              style={styles.clearSearch}
            >
              <MaterialIcons name="close" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        {searchingEnglish ? null : (
          <View style={styles.diacriticRow}>
            <ThemedText variant="labelSm" tone="faint">
              Tones:
            </ThemedText>
            {DIACRITICS.map((mark) => (
              <PressableScale
                key={mark}
                accessibilityLabel={`Insert ${mark}`}
                onPress={() => appendDiacritic(mark)}
                style={styles.diacriticKey}
              >
                <ThemedText variant="body" tone="accent">
                  {mark}
                </ThemedText>
              </PressableScale>
            ))}
          </View>
        )}
      </View>
      <View style={styles.body}>
        {errorMessage !== null ? (
          <View style={styles.state}>
            <ThemedText variant="label">{errorMessage}</ThemedText>
          </View>
        ) : !isBlank ? (
          <View style={styles.resultsWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to search home"
              onPress={clearQuery}
              style={styles.backline}
            >
              <MaterialIcons name="arrow-back" size={18} color={colors.muted} />
              <ThemedText variant="bodySm" tone="secondary">
                Search
              </ThemedText>
            </Pressable>
            <ThemedText variant="resultQuery" selectable>
              {trimmed}
            </ThemedText>
            <ThemedText variant="bodySm" tone="secondary">
              {`${results.length} result${results.length === 1 ? "" : "s"} in the local dictionary`}
            </ThemedText>
            {results.length === 0 ? (
              <ThemedText variant="bodySm" tone="secondary">
                Check the spelling or try a shorter prefix.
              </ThemedText>
            ) : (
              <View style={styles.listFlex}>
                <EntryList
                  entries={results}
                  onPressEntry={handlePressEntry}
                  icon="arrow"
                  showPosTag
                />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.listFlex}>
            <EntryList
              entries={recentEntries}
              onPressEntry={handlePressEntry}
              icon="chevron"
              showPosTag={false}
              ListHeaderComponent={
                <View style={styles.sectionLabel}>
                  <ThemedText variant="eyebrow" tone="secondary">
                    RECENT
                  </ThemedText>
                  {hasRecent ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Clear recent searches"
                      onPress={clear}
                      style={styles.clearButton}
                    >
                      <ThemedText variant="label" tone="accent">
                        Clear
                      </ThemedText>
                    </Pressable>
                  ) : null}
                </View>
              }
              ListEmptyComponent={
                <EmptyState
                  icon="history"
                  title="No recent words"
                  copy="Your recent searches will appear here."
                />
              }
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBlock: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  greeting: {
    gap: 2,
    paddingBottom: spacing.xs,
  },
  segmented: {
    borderRadius: 11,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: 2,
    padding: 3,
  },
  directionOption: {
    alignItems: "center",
    borderRadius: 8,
    borderCurve: "continuous",
    flex: 1,
    paddingVertical: spacing.sm,
  },
  directionActive: {
    boxShadow: "0 1px 4px rgba(12, 32, 27, 0.12)",
  },
  searchField: {
    alignItems: "center",
    borderRadius: radius.input,
    borderCurve: "continuous",
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 62,
    paddingHorizontal: spacing.md,
    boxShadow: "0 2px 12px rgba(12, 32, 27, 0.08)",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  clearSearch: {
    padding: spacing.xs,
  },
  diacriticRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  diacriticKey: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  body: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  listFlex: {
    flex: 1,
  },
  resultsWrap: {
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  backline: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionLabel: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  state: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
});
