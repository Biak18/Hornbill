// Favorites tab — Stitch wordbook pattern with real data only:
// Header + word count + word cards (star removes from wordbook).
// Available offline; empty state links back to search.

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
import { spacing } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";

export default function FavoritesScreen() {
  const { push } = useRouter();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const entries = useMemo(
    () =>
      [...favoriteIds]
        .map((id) => dictionaryRepository.getEntryById(id))
        .filter((entry): entry is DictionaryEntry => entry !== undefined),
    [favoriteIds],
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

  const goSearch = useCallback(() => {
    push("/");
  }, [push]);

  const listHeader = useMemo(
    () => <SectionHeader title="Saved words" count={entries.length} />,
    [entries.length],
  );

  return (
    <Screen>
      <View style={styles.topBlock}>
        <Header title="Wordbook" />
      </View>
      {entries.length === 0 ? (
        <EmptyState
          icon="star-border"
          title="No saved words"
          copy="Save words from any entry and they will wait for you here."
          actionLabel="Search words"
          onAction={goSearch}
        />
      ) : (
        <View style={styles.listFlex}>
          <WordList
            entries={entries}
            favoriteIds={favoriteIds}
            showPosTag
            showRemove={false}
            onPressEntry={handlePressEntry}
            onToggleFavorite={handleToggleFavorite}
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
