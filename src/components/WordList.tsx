// WordList — FlashList wrapper shared by search results, recents,
// favorites, and history (virtualizer for every list; stable key extractor;
// renderItem passes primitives so WordCard memoization holds; a single
// onPress/onToggleFavorite/onRemove instance flows down and rows call back
// with their id). Favorite state is read once here, never inside rows.

import { spacing } from "@/theme";
import { useBottomClearance } from "@/hooks/use-bottom-clearance";
import type { DictionaryEntry } from "@/types/dictionary";
import { FlashList } from "@shopify/flash-list";import {
  useCallback,
  useMemo,
  type ComponentType,
  type ReactElement,
} from "react";
import { StyleSheet, View } from "react-native";
import { WordCard } from "./WordCard";

const keyExtractor = (item: DictionaryEntry): string => item.id;

function firstMeaning(entry: DictionaryEntry): string {
  return entry.definitions[0]?.english ?? "";
}

type WordListProps = {
  entries: DictionaryEntry[];
  favoriteIds: ReadonlySet<string>;
  showPosTag: boolean;
  showRemove: boolean;
  /** Gap between cards. Defaults to the standard rhythm. */
  gap?: number;
  onPressEntry: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemoveEntry?: (id: string) => void;
  /** Per-row metadata line (e.g. saved/viewed time). Omit to hide everywhere. */
  getMeta?: (id: string) => string | undefined;
  ListHeaderComponent?: ComponentType | ReactElement | null;
  ListEmptyComponent?: ComponentType | ReactElement | null;
  /** Infinite scroll: fired near the list end (search results paging). */
  onEndReached?: () => void;
  ListFooterComponent?: ComponentType | ReactElement | null;
};

export function WordList({
  entries,
  favoriteIds,
  showPosTag,
  showRemove,
  gap = spacing.sm,
  onPressEntry,
  onToggleFavorite,
  onRemoveEntry,
  getMeta,
  ListHeaderComponent,
  ListEmptyComponent,
  onEndReached,
  ListFooterComponent,
}: WordListProps) {
  const renderItem = useCallback(
    ({ item }: { item: DictionaryEntry }) => (
      <WordCard
        id={item.id}
        word={item.word}
        phonetic={item.pronunciation}
        meaning={firstMeaning(item)}
        posTag={showPosTag ? item.partOfSpeech : undefined}
        meta={getMeta?.(item.id)}
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
      getMeta,
    ],
  );

  // Trailing clearance so the last card stops above the native tab bar
  // (automatic insets are iOS-only; Android overlays list ends).
  const bottomClearance = useBottomClearance();
  const contentStyle = useMemo(
    () => [styles.content, { paddingBottom: bottomClearance }],
    [bottomClearance],
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
      contentContainerStyle={contentStyle}
      style={styles.list}
      ItemSeparatorComponent={renderSeparator}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
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
