// Dictionary result row (polished `.word-row` / `.result-item`): flat
// full-width row, hairline top border, bold Noto headword, muted gloss,
// optional POS tag or meta line, trailing icon.
// Memoized on primitives only: inline objects would break memoization.

import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PosTag } from "./pos-chip";
import { ThemedText } from "./themed-text";
import { useAppColors } from "@/theme/colors";
import { spacing } from "@/theme";

export type RowIcon = "chevron" | "heart" | "arrow";

const ICON_NAME = {
  chevron: "chevron-right",
  heart: "favorite",
  arrow: "call-made",
} as const;

type EntryRowProps = {
  id: string;
  word: string;
  meaning: string;
  posTag?: string;
  meta?: string;
  icon: RowIcon;
  onPress: (id: string) => void;
};

export const EntryRow = memo(function EntryRow({
  id,
  word,
  meaning,
  posTag,
  meta,
  icon,
  onPress,
}: EntryRowProps) {
  const colors = useAppColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={word}
      onPress={() => onPress(id)}
      style={({ pressed }) => [
        styles.row,
        { borderTopColor: colors.line },
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.copy}>
        <ThemedText variant="wordRow" selectable>
          {word}
        </ThemedText>
        <ThemedText variant="meaning" tone="secondary" numberOfLines={2}>
          {meaning}
        </ThemedText>
        {posTag ? <PosTag label={posTag} /> : null}
        {meta ? (
          <ThemedText variant="meta" tone="faint">
            {meta}
          </ThemedText>
        ) : null}
      </View>
      <MaterialIcons name={ICON_NAME[icon]} size={20} color={colors.muted2} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
});
