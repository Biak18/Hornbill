// Favorites tab: saved entries with heart markers, available offline.
// Header shows an honest count; list is FlashList via EntryList (skill 2.6)
// with native bottom insets (skill 9.4). Empty state offers a search action.

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
        {entries.length > 0 ? (
          <ThemedText variant="bodySm" tone="secondary">
            {`${entries.length} saved ${entries.length === 1 ? "word" : "words"} · available offline`}
          </ThemedText>
        ) : null}
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
        <View style={styles.listFlex}>
          <EntryList
            entries={entries}
            onPressEntry={handlePressEntry}
            icon="heart"
            showPosTag={false}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  listFlex: {
    flex: 1,
  },
});
