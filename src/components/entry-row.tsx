// Dictionary result row — Papago-inspired clean row, original design.
// Skill rules applied:
// - memo on primitives only (skill 2.5); single stable onPress at list root,
//   row calls it with its id via a hoisted useCallback (skill 2.2).
// - No inline style objects: border color comes from a memoized style
//   (skill 2.1); pressed feedback is opacity via Pressable state (GPU-cheap).
// - gesture-handler Pressable inside lists for gesture coordination (9.9).
// - Ternary-with-null conditionals only (skill 1.1); all strings in Text (1.2).

import { memo, useCallback, useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Pressable } from "react-native-gesture-handler";
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

  // Hoisted callback: stable per (onPress, id), no inline closure in render.
  const handlePress = useCallback(() => {
    onPress(id);
  }, [onPress, id]);

  // Stable row style: no inline { borderTopColor } object per render.
  const rowStyle: StyleProp<ViewStyle> = useMemo(
    () => [styles.row, { borderTopColor: colors.line }],
    [colors.line],
  );

  const hasPosTag = posTag !== undefined && posTag.length > 0;
  const hasMeta = meta !== undefined && meta.length > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={word}
      onPress={handlePress}
      style={({ pressed }) => [rowStyle, pressed ? styles.pressed : null]}
    >
      <View style={styles.copy}>
        <ThemedText variant="wordRow" selectable>
          {word}
        </ThemedText>
        <ThemedText variant="meaning" tone="secondary" numberOfLines={2}>
          {meaning}
        </ThemedText>
        {hasPosTag ? <PosTag label={posTag as string} /> : null}
        {hasMeta ? (
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
    gap: 2,
  },
});
