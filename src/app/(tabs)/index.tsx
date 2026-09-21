// Search home — Stitch "Translate & Search Home" structure adapted to a
// dictionary-first app with our own identity (no translator, camera, or
// third-party branding per AGENTS.md §16/§17):
// Header → DirectionPill → elevated search card → tone chips →
// featured word + recent lookups (blank) or live results (typing).
// Skill rules: FlashList via WordList; derived-only state; caret-aware
// diacritic insert; stable header/empty identities; gap/boxShadow styling.

import { DirectionPill } from "@/components/DirectionPill";
import { EmptyState } from "@/components/EmptyState";
import { FeaturedCard } from "@/components/FeaturedCard";
import { Header } from "@/components/Header";
import { PressableScale } from "@/components/PressableScale";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { Text } from "@/components/Text";
import { WordList } from "@/components/WordList";
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

const DIACRITICS = ["â", "ā", "ă", "ē", "ī", "ō", "ū", "ṭ"] as const;
const PAGE_SIZE = 20;
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

  // Paged results: page resets to 1 on a new query/direction via the
  // render-adjust pattern (no sync effect), matching this screen's
  // derived-state style. Each page fetches one extra row as a probe for
  // whether another page exists — the repository never reports totals.
  const [paging, setPaging] = useState({
    query: "",
    direction: "falam-en" as SearchDirection,
    page: 1,
  });
  if (paging.query !== query || paging.direction !== direction) {
    setPaging({ query, direction, page: 1 });
  }
  const page =
    paging.query === query && paging.direction === direction
      ? paging.page
      : 1;
  const visibleCount = page * PAGE_SIZE;

  // Derived: search results from ground-truth query+direction+page (no sync effects).
  const { results, errorMessage } = useMemo(() => {
    try {
      return {
        results: searchDictionary(query, {
          repository: dictionaryRepository,
          limit: visibleCount + 1,
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
  }, [query, direction, visibleCount]);

  const hasMore = results.length > visibleCount;
  const displayed = hasMore ? results.slice(0, visibleCount) : results;

  const handleEndReached = useCallback(() => {
    if (hasMore) {
      setPaging((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [hasMore]);

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
        <FeaturedCard />
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
        <Text variant="resultQuery" selectable>
          {query.trim()}
        </Text>
        <Text variant="bodySm" tone="secondary">
          {`${displayed.length} result${displayed.length === 1 ? "" : "s"} in the local dictionary`}
        </Text>
      </View>
    ),
    [query, displayed.length],
  );

  // End-of-results note, only once the user has scrolled past the first
  // page — a 3-row query needs no "end" announcement.
  const resultsFooter = useMemo(() => {
    if (hasMore || displayed.length <= PAGE_SIZE) {
      return null;
    }
    return (
      <View style={styles.endNote}>
        <Text variant="bodySm" tone="faint">
          End of results
        </Text>
      </View>
    );
  }, [hasMore, displayed.length]);

  const trimmed = query.trim();
  const isBlank = trimmed.length === 0;
  const searchingEnglish = direction === "en-falam";
  const hasQuery = query.length > 0;

  return (
    <Screen>
      <View style={styles.topBlock}>
        <Header title="Search" />
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
            <Text variant="labelSm" tone="faint">
              Tones:
            </Text>
            {DIACRITICS.map((mark) => (
              <PressableScale
                key={mark}
                accessibilityLabel={`Insert ${mark}`}
                onPress={() => insertDiacritic(mark)}
                style={styles.diacriticKey}
              >
                <Text variant="body" tone="accent">
                  {mark}
                </Text>
              </PressableScale>
            ))}
          </View>
        )}
      </View>
      <View style={styles.body}>
        {errorMessage !== null ? (
          <View style={styles.state}>
            <Text variant="label">{errorMessage}</Text>
          </View>
        ) : !isBlank ? (
          <View style={styles.listFlex}>
            {displayed.length === 0 ? (
              <View style={styles.state}>
                <Text variant="bodySm" tone="secondary">
                  Check the spelling or try a shorter prefix.
                </Text>
              </View>
            ) : (
              <WordList
                entries={displayed}
                favoriteIds={favoriteIds}
                showPosTag
                showRemove={false}
                onPressEntry={handlePressEntry}
                onToggleFavorite={handleToggleFavorite}
                onEndReached={handleEndReached}
                ListHeaderComponent={resultsHeader}
                ListFooterComponent={resultsFooter}
              />
            )}
          </View>
        ) : (
          <View style={styles.listFlex}>
            <WordList
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
    flexWrap: "wrap",
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
  endNote: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  state: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
});
