// History tab: recently viewed entries, most-recent-first, capped in store.
// Single honest "Recent" section — no fabricated Today/Yesterday groupings
// or timestamps, since view times are not recorded.
// List is FlashList via EntryList (skill 2.6) with a header row for the
// section label + clear action and an empty state.

import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { EmptyState } from "@/components/empty-state";
import { EntryList } from "@/components/entry-list";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { dictionaryRepository } from "@/repositories";
import { useHistory } from "@/stores/history";
import { spacing } from "@/theme";
import type { DictionaryEntry } from "@/types/dictionary";

export default function HistoryScreen() {
  const { push } = useRouter();
  const { historyIds, clear } = useHistory();

  const entries = useMemo(
    () =>
      historyIds
        .map((id) => dictionaryRepository.getEntryById(id))
        .filter((entry): entry is DictionaryEntry => entry !== undefined),
    [historyIds],
  );
  const hasEntries = entries.length > 0;

  const handlePressEntry = useCallback(
    (id: string) => {
      push({ pathname: "/entry/[id]", params: { id } });
    },
    [push],
  );

  // Stable header identity: rebuilt only when `clear` changes.
  const recentHeader = useMemo(
    () => (
      <View style={styles.sectionLabel}>
        <ThemedText variant="eyebrow" tone="secondary">
          RECENT
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear all history"
          onPress={clear}
          style={styles.clearButton}
        >
          <ThemedText variant="label" tone="accent">
            Clear all
          </ThemedText>
        </Pressable>
      </View>
    ),
    [clear],
  );

  return (
    <Screen>
      <View style={styles.titleWrap}>
        <ThemedText variant="pageTitle">History</ThemedText>
      </View>
      {hasEntries ? (
        <View style={styles.listFlex}>
          <EntryList
            entries={entries}
            onPressEntry={handlePressEntry}
            icon="chevron"
            showPosTag={false}
            ListHeaderComponent={recentHeader}
          />
        </View>
      ) : (
        <EmptyState
          icon="history"
          title="No recent words"
          copy="Your recent searches will appear here."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  listFlex: {
    flex: 1,
  },
  sectionLabel: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
});
