// Virtualized dictionary list shared by search / favorites / history.
// Skill 2.6: FlashList (virtualizer) for every list — only visible rows mount.
// - Stable module-scope keyExtractor (skill 2.4: stable references).
// - renderItem passes primitives only; row memoizes on them (skills 2.1/2.5).
// - Single onPressEntry instance flows to rows; rows call with id (skill 2.2).
// - contentInsetAdjustmentBehavior="automatic": OS owns tab-bar/bottom
//   insets natively (skill 9.4); no manual bottom padding here.

import type { ComponentType, ReactElement } from "react";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { EntryRow, type RowIcon } from "./entry-row";
import { spacing } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";

const keyExtractor = (item: DictionaryEntry): string => item.id;

function firstMeaning(entry: DictionaryEntry): string {
  return entry.definitions[0]?.english ?? "";
}

type EntryListProps = {
  entries: DictionaryEntry[];
  onPressEntry: (id: string) => void;
  /** Results show a POS tag + arrow; recents show a meta line + chevron. */
  icon: RowIcon;
  showPosTag: boolean;
  ListHeaderComponent?: ComponentType | ReactElement | null;
  ListEmptyComponent?: ComponentType | ReactElement | null;
};

export function EntryList({
  entries,
  onPressEntry,
  icon,
  showPosTag,
  ListHeaderComponent,
  ListEmptyComponent,
}: EntryListProps) {
  const renderItem = useCallback(
    ({ item }: { item: DictionaryEntry }) => (
      <EntryRow
        id={item.id}
        word={item.word}
        meaning={firstMeaning(item)}
        posTag={showPosTag ? item.partOfSpeech : undefined}
        meta={showPosTag ? undefined : item.partOfSpeech}
        icon={icon}
        onPress={onPressEntry}
      />
    ),
    [icon, onPressEntry, showPosTag],
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
    paddingHorizontal: spacing.md,
  },
});
