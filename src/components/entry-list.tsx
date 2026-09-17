// Virtualized dictionary list shared by search / favorites / history.
// Stable key extractor and memoized row keep re-renders to changed items.
// No inset adjustment here: the Screen (SafeAreaView) root already owns it.

import { useCallback } from "react";
import { FlatList, StyleSheet } from "react-native";
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
};

export function EntryList({
  entries,
  onPressEntry,
  icon,
  showPosTag,
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
    <FlatList
      data={entries}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
