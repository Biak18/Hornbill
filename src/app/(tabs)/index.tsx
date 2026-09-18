// Search home — Stitch "Translate & Search Home" structure adapted to a
// dictionary-first app with our own identity (no translator, camera, or
// third-party branding per AGENTS.md §16/§17):
// AppHeader → DirectionPill → elevated search card → tone chips →
// featured word + recent lookups (blank) or live results (typing).
// Skill rules: FlashList via WordCardList; derived-only state; caret-aware
// diacritic insert; stable header/empty identities; gap/boxShadow styling.

import { AppHeader } from "@/components/app-header";
import { DirectionPill } from "@/components/direction-pill";
import { EmptyState } from "@/components/empty-state";
import { FeaturedWordCard } from "@/components/featured-word-card";
import { Screen } from "@/components/screen";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui";
import { WordCardList } from "@/components/word-card-list";
import { dictionaryRepository } from "@/repositories";
import { searchDictionary, type SearchDirection } from "@/services/search";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { radius, spacing, useAppColors } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputSelectionChangeEvent,
} from "react-native";

const DIACRITICS = ["â", "ē", "ī", "ō", "ū"] as const;
const SEARCH_LIMIT = 20;
const RECENT_LIMIT = 5;

// Module scope: static empty state, identical element identity every render.
const RecentEmpty = (
  <EmptyState
    icon="history"
    title="No recent words"
    copy="Your recent searches will appear here."
  />
);

export default function SearchScreen() {
  const colors = useAppColors();
  const { push } = useRouter();
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<SearchDirection>("falam-en");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const { historyIds, clear, remove } = useHistory();
  const { favoriteIds, toggleFavorite } = useFavorites();
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

  const handleToggleFavorite = useCallback(
    (id: string) => {
      toggleFavorite(id);
    },
    [toggleFavorite],
  );

  const handleRemoveRecent = useCallback(
    (id: string) => {
      remove(id);
    },
    [remove],
  );

  const handleDirectionChange = useCallback((next: SearchDirection) => {
    setDirection(next);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
    setSelection({ start: 0, end: 0 });
    inputRef.current?.focus();
  }, []);

  const handleSelectionChange = useCallback(
    (e: TextInputSelectionChangeEvent) => {
      setSelection(e.nativeEvent.selection);
    },
    [],
  );

  // Insert the tone mark at the caret (replacing any selected range),
  // then park the caret right after it — never blindly appended at the end.
  const insertDiacritic = useCallback(
    (mark: string) => {
      const start = Math.min(selection.start, query.length);
      const end = Math.min(Math.max(selection.end, start), query.length);
      setQuery(query.slice(0, start) + mark + query.slice(end));
      const caret = start + mark.length;
      setSelection({ start: caret, end: caret });
      inputRef.current?.focus();
    },
    [query, selection],
  );

  // Stable header identity: featured card + recents label, rebuilt only
  // when their inputs change so typing never re-renders them.
  const homeHeader = useMemo(
    () => (
      <View style={styles.homeHeader}>
        <FeaturedWordCard />
        <SectionHeader
          title="Recent Lookups"
          count={recentEntries.length}
          actionLabel={recentEntries.length > 0 ? "Clear All" : undefined}
          onAction={recentEntries.length > 0 ? clear : undefined}
        />
      </View>
    ),
    [recentEntries.length, clear],
  );

  const resultsHeader = useMemo(
    () => (
      <View style={styles.resultsMeta}>
        <ThemedText variant="resultQuery" selectable>
          {query.trim()}
        </ThemedText>
        <ThemedText variant="bodySm" tone="secondary">
          {`${results.length} result${results.length === 1 ? "" : "s"} in the local dictionary`}
        </ThemedText>
      </View>
    ),
    [query, results.length],
  );

  const trimmed = query.trim();
  const isBlank = trimmed.length === 0;
  const searchingEnglish = direction === "en-falam";
  const hasQuery = query.length > 0;

  return (
    <Screen>
      <View style={styles.topBlock}>
        <AppHeader title="Search" />
        <DirectionPill
          direction={direction}
          onDirectionChange={handleDirectionChange}
        />
        <View
          style={[
            styles.searchField,
            {
              backgroundColor: colors.paper,
              borderColor: colors.line,
            },
          ]}
        >
          <MaterialIcons name="search" size={22} color={colors.accent} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            selection={selection}
            onSelectionChange={handleSelectionChange}
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
                onPress={() => insertDiacritic(mark)}
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
          <View style={styles.listFlex}>
            {results.length === 0 ? (
              <View style={styles.state}>
                <ThemedText variant="bodySm" tone="secondary">
                  Check the spelling or try a shorter prefix.
                </ThemedText>
              </View>
            ) : (
              <WordCardList
                entries={results}
                favoriteIds={favoriteIds}
                showPosTag
                showRemove={false}
                onPressEntry={handlePressEntry}
                onToggleFavorite={handleToggleFavorite}
                ListHeaderComponent={resultsHeader}
              />
            )}
          </View>
        ) : (
          <View style={styles.listFlex}>
            <WordCardList
              entries={recentEntries}
              favoriteIds={favoriteIds}
              showPosTag={false}
              showRemove
              gap={spacing.sm}
              onPressEntry={handlePressEntry}
              onToggleFavorite={handleToggleFavorite}
              onRemoveEntry={handleRemoveRecent}
              ListHeaderComponent={homeHeader}
              ListEmptyComponent={RecentEmpty}
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
  searchField: {
    alignItems: "center",
    borderRadius: radius.input,
    borderCurve: "continuous",
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 62,
    paddingHorizontal: spacing.md,
    boxShadow: "0 4px 16px rgba(12, 32, 27, 0.08)",
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
  homeHeader: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  resultsMeta: {
    gap: 2,
    paddingBottom: spacing.xs,
  },
  state: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
});
