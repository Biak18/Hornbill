// History tab — grouped recents (Today / Yesterday / Earlier) with honest
// view times from the stored UTC timestamps. Rows stay side-effect-free
// WordCards (≤50 rows, so a plain ScrollView replaces the virtualizer here).
// Clear all flips to a muted "Cleared" confirmation briefly — no modal
// (docs/Design.md §15).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { WordCard } from "@/components/WordCard";
import { dictionaryRepository } from "@/repositories";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { spacing } from "@/theme";
import { useBottomClearance } from "@/hooks/use-bottom-clearance";
import type { DictionaryEntry } from "@/types/dictionary";
import {
  formatHistoryDate,
  formatHistoryTime,
  groupHistoryItems,
} from "@/utils/history-groups";

const CLEARED_MS = 2000;

type HistoryRow = {
  entry: DictionaryEntry;
  viewedAt: string;
};

function firstMeaning(entry: DictionaryEntry): string {
  return entry.definitions[0]?.english ?? "";
}

export default function HistoryScreen() {
  const { push } = useRouter();
  const { historyEntries, clear, remove } = useHistory();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [justCleared, setJustCleared] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const rows = useMemo<HistoryRow[]>(
    () =>
      historyEntries
        .map((item) => {
          const entry = dictionaryRepository.getEntryById(item.entryId);
          return entry === undefined
            ? undefined
            : { entry, viewedAt: item.viewedAt };
        })
        .filter((row): row is HistoryRow => row !== undefined),
    [historyEntries],
  );

  const groups = useMemo(() => groupHistoryItems(rows), [rows]);

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

  const handleRemove = useCallback(
    (id: string) => {
      remove(id);
    },
    [remove],
  );

  const handleClear = useCallback(() => {
    clear();
    setJustCleared(true);
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      setJustCleared(false);
    }, CLEARED_MS);
  }, [clear]);

  // The "Cleared" confirmation needs its header visible for a beat after the
  // rows disappear — otherwise it would never paint.
  const showList = rows.length > 0 || justCleared;
  const bottomClearance = useBottomClearance();

  return (
    <Screen>
      <View style={styles.topBlock}>
        <Header title="History" />
      </View>
      {!showList ? (
        <EmptyState
          icon="history"
          title="No recent words"
          copy="Your recent searches will appear here."
        />
      ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.content, { paddingBottom: bottomClearance }]}
        >
          <SectionHeader
            title="Recent"
            count={rows.length}
            actionLabel={rows.length > 0 && !justCleared ? "Clear all" : undefined}
            onAction={rows.length > 0 && !justCleared ? handleClear : undefined}
            statusLabel={justCleared ? "Cleared" : undefined}
          />
          {groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <SectionHeader title={group.title} count={group.items.length} />
              {group.items.map((row) => (
                <WordCard
                  key={row.entry.id}
                  id={row.entry.id}
                  word={row.entry.word}
                  phonetic={row.entry.pronunciation}
                  meaning={firstMeaning(row.entry)}
                  meta={
                    group.title === "Earlier"
                      ? formatHistoryDate(row.viewedAt)
                      : formatHistoryTime(row.viewedAt)
                  }
                  isFavorite={isFavorite(row.entry.id)}
                  showRemove
                  onPress={handlePressEntry}
                  onToggleFavorite={handleToggleFavorite}
                  onRemove={handleRemove}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  group: {
    gap: spacing.sm,
  },
});
