// Empty state: tinted icon tile, title, short copy, optional action.
// Skill 9.2: gap on parent for spacing (no margin on children);
// borderCurve continuous; boxShadow string syntax for the tile.

import { StyleSheet, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "./Text";
import { useAppColors } from "@/theme/colors";
import { radius, spacing } from "@/theme";

type EmptyStateProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  copy: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  copy,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const colors = useAppColors();
  const hasAction =
    actionLabel !== undefined &&
    actionLabel.length > 0 &&
    onAction !== undefined;
  return (
    <View style={styles.wrap}>
      <View style={[styles.symbol, { backgroundColor: colors.accentSoft }]}>
        <MaterialIcons name={icon} size={28} color={colors.accent} />
      </View>
      <Text variant="label">{title}</Text>
      <Text variant="bodySm" tone="secondary" style={styles.copy}>
        {copy}
      </Text>
      {hasAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel as string}
          onPress={onAction}
          style={[styles.action, { backgroundColor: colors.accentSoft }]}
        >
          <Text variant="label" tone="accent">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  symbol: {
    alignItems: "center",
    borderRadius: 22,
    borderCurve: "continuous",
    height: 62,
    justifyContent: "center",
    width: 62,
    boxShadow: "0 2px 10px rgba(12, 32, 27, 0.10)",
  },
  copy: {
    textAlign: "center",
  },
  action: {
    borderRadius: radius.full,
    borderCurve: "continuous",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
