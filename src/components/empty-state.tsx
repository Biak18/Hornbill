// Empty state (polished `.empty`): tinted icon tile, title, short copy,
// optional action. Shared by favorites, history, and cleared recents.

import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./themed-text";
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
  return (
    <View style={styles.wrap}>
      <View style={[styles.symbol, { backgroundColor: colors.accentSoft }]}>
        <MaterialIcons name={icon} size={28} color={colors.accent} />
      </View>
      <ThemedText variant="label">{title}</ThemedText>
      <ThemedText variant="bodySm" tone="secondary" style={styles.copy}>
        {copy}
      </ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={[styles.action, { backgroundColor: colors.accentSoft }]}
        >
          <ThemedText variant="label" tone="accent">
            {actionLabel}
          </ThemedText>
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
  },
  symbol: {
    alignItems: "center",
    borderRadius: 22,
    borderCurve: "continuous",
    height: 62,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 62,
  },
  copy: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  action: {
    borderRadius: radius.full,
    borderCurve: "continuous",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
