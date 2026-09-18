// History tab — Stitch recent-lookups pattern with honest data:
// Header + section header (count + Clear All) + word cards with star
// and per-item remove. Single "Recent" section — no fabricated
// Today/Yesterday groupings or timestamps, since view times are recorded.

import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { WordList } from "@/components/WordList";
import { dictionaryRepository } from "@/repositories";
import { useFavorites } from "@/stores/favorites";
import { useHistory } from "@/stores/history";
import { spacing } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";

export default function HistoryScreen() {
  const { push } = useRouter();
  const { historyIds, clear, remove } = useHistory();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const entries = useMemo(
    () =>
      historyIds
        .map((id) => dictionaryRepository.getEntryById(id))
        .filter((entry): entry is DictionaryEntry => entry !== undefined),
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

  const handleRemove = useCallback(
    (id: string) => {
      remove(id);
    },
    [remove],
  );

  const listHeader = useMemo(
    () => (
      <SectionHeader
        title="Recent"
        count={entries.length}
        actionLabel="Clear all"
        onAction={clear}
      />
    ),
    [entries.length, clear],
  );

  return (
    <Screen>
      <View style={styles.topBlock}>
        <Header title="History" />
      </View>
      {entries.length === 0 ? (
        <EmptyState
          icon="history"
          title="No recent words"
          copy="Your recent searches will appear here."
        />
      ) : (
        <View style={styles.listFlex}>
          <WordList
            entries={entries}
            favoriteIds={favoriteIds}
            showPosTag={false}
            showRemove
            onPressEntry={handlePressEntry}
            onToggleFavorite={handleToggleFavorite}
            onRemoveEntry={handleRemove}
            ListHeaderComponent={listHeader}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  listFlex: {
    flex: 1,
    paddingTop: spacing.sm,
  },
});
