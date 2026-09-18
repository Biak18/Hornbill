// Word card list — FlashList wrapper shared by search results, recents,
// favorites, and history (virtualizer for every list; stable key extractor;
// renderItem passes primitives so LookupRow memoization holds; a single
// onPress/onToggleFavorite/onRemove instance flows down and rows call back
// with their id). Favorite state is read once here, never inside rows.

import { spacing } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";
import { FlashList } from "@shopify/flash-list";
import {
  useCallback,
  useMemo,
  type ComponentType,
  type ReactElement,
} from "react";
import { StyleSheet, View } from "react-native";
import { LookupRow } from "./lookup-row";

const keyExtractor = (item: DictionaryEntry): string => item.id;

function firstMeaning(entry: DictionaryEntry): string {
  return entry.definitions[0]?.english ?? "";
}

type WordCardListProps = {
  entries: DictionaryEntry[];
  favoriteIds: ReadonlySet<string>;
  showPosTag: boolean;
  showRemove: boolean;
  /** Gap between cards. Defaults to the standard rhythm. */
  gap?: number;
  onPressEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemoveEntry?: (id: string) => void;
  ListHeaderComponent?: ComponentType | ReactElement | null;
  ListEmptyComponent?: ComponentType | ReactElement | null;
};

export function WordCardList({
  entries,
  favoriteIds,
  showPosTag,
  showRemove,
  gap = spacing.sm,
  onPressEntry,
  onToggleFavorite,
  onRemoveEntry,
  ListHeaderComponent,
  ListEmptyComponent,
}: WordCardListProps) {
  const renderItem = useCallback(
    ({ item }: { item: DictionaryEntry }) => (
      <LookupRow
        id={item.id}
        word={item.word}
        phonetic={item.pronunciation}
        meaning={firstMeaning(item)}
        posTag={showPosTag ? item.partOfSpeech : undefined}
        isFavorite={favoriteIds.has(item.id)}
        showRemove={showRemove}
        onPress={onPressEntry}
        onToggleFavorite={onToggleFavorite}
        onRemove={onRemoveEntry}
      />
    ),
    [
      favoriteIds,
      showPosTag,
      showRemove,
      onPressEntry,
      onToggleFavorite,
      onRemoveEntry,
    ],
  );

  // Inter-card spacing. FlashList positions cells absolutely, so `gap` in
  // the content style is ignored — ItemSeparatorComponent is the mechanism
  // that actually separates rows.
  const separatorStyle = useMemo(() => ({ height: gap }), [gap]);
  const renderSeparator = useCallback(
    () => <View style={separatorStyle} />,
    [separatorStyle],
  );

  return (
    <FlashList
      data={entries}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      style={styles.list}
      ItemSeparatorComponent={renderSeparator}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
});
