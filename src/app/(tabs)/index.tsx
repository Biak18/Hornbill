// Search home (polished): direction toggle, search field, diacritic keys
// for Falam input, recent lookups. Typing swaps the body to a results view
// with the query title and an honest local count. Both directions search
// the same local dataset — Falam words or English meanings.

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { EmptyState } from "@/components/empty-state";
import { EntryList } from "@/components/entry-list";
import { EntryRow } from "@/components/entry-row";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { dictionaryRepository } from "@/repositories";
import { searchDictionary, type SearchDirection } from "@/services/search";
import { useHistory } from "@/stores/history";
import { radius, spacing, useAppColors } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";

const DIACRITICS = ["â", "ē", "ī", "ō", "ū"] as const;
const SEARCH_LIMIT = 20;
const RECENT_LIMIT = 5;

const DIRECTIONS: readonly { value: SearchDirection; label: string }[] = [
  { value: "falam-en", label: "Falam → English" },
  { value: "en-falam", label: "English → Falam" },
];

function firstMeaning(entry: DictionaryEntry): string {
  return entry.definitions[0]?.english ?? "";
}

export default function SearchScreen() {
  const colors = useAppColors();
  const { push } = useRouter();
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<SearchDirection>("falam-en");
  const { historyIds, clear } = useHistory();
  const inputRef = useRef<TextInput>(null);

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

  let body: ReactNode;
  if (errorMessage !== null) {
    body = (
      <View style={styles.state}>
        <ThemedText variant="label">{errorMessage}</ThemedText>
      </View>
    );
  } else if (!isBlank) {
    body = (
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
          <EntryList
            entries={results}
            onPressEntry={handlePressEntry}
            icon="arrow"
            showPosTag
          />
        )}
      </View>
    );
  } else {
    body = (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionLabel}>
          <ThemedText variant="eyebrow" tone="secondary">
            RECENT
          </ThemedText>
          {recentEntries.length > 0 ? (
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
        {recentEntries.length === 0 ? (
          <EmptyState
            icon="history"
            title="No recent words"
            copy="Your recent searches will appear here."
          />
        ) : (
          <View>
            {recentEntries.map((entry) => (
              <EntryRow
                key={entry.id}
                id={entry.id}
                word={entry.word}
                meaning={firstMeaning(entry)}
                meta={entry.partOfSpeech}
                icon="chevron"
                onPress={handlePressEntry}
              />
            ))}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <Screen>
      <View style={styles.topBlock}>
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
                  active ? { backgroundColor: colors.surface } : null,
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
            { backgroundColor: colors.paper, borderColor: colors.line },
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
          {query.length > 0 ? (
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
              <Pressable
                key={mark}
                accessibilityRole="button"
                accessibilityLabel={`Insert ${mark}`}
                onPress={() => appendDiacritic(mark)}
                style={styles.diacriticKey}
              >
                <ThemedText variant="body" tone="accent">
                  {mark}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <View style={styles.body}>{body}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBlock: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
  searchField: {
    alignItems: "center",
    borderRadius: radius.input,
    borderCurve: "continuous",
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 62,
    paddingHorizontal: spacing.md,
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
    padding: spacing.xs,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  sectionLabel: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
  resultsWrap: {
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backline: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  state: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
});
