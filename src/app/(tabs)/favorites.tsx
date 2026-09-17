// Favorites tab: saved entries with heart markers, available offline.

import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState } from "@/components/empty-state";
import { EntryList } from "@/components/entry-list";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { dictionaryRepository } from "@/repositories";
import { useFavorites } from "@/stores/favorites";
import { spacing } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";

export default function FavoritesScreen() {
  const { push } = useRouter();
  const { favoriteIds } = useFavorites();

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

  const goSearch = useCallback(() => {
    push("/");
  }, [push]);

  return (
    <Screen>
      <View style={styles.titleWrap}>
        <ThemedText variant="pageTitle">Favorites</ThemedText>
      </View>
      {entries.length === 0 ? (
        <EmptyState
          icon="favorite-border"
          title="No saved words"
          copy="Save words from any entry and they will wait for you here."
          actionLabel="Search words"
          onAction={goSearch}
        />
      ) : (
        <EntryList
          entries={entries}
          onPressEntry={handlePressEntry}
          icon="heart"
          showPosTag={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleWrap: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
