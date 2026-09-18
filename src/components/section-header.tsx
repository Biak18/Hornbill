// Section header — Stitch-inspired list section pattern:
// title + count badge on the left, optional text action on the right.
// All props are primitives; count badge renders only for non-negative counts.

import { radius, spacing } from "@/theme";
import { useAppColors } from "@/theme/colors";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

type SectionHeaderProps = {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export const SectionHeader = memo(function SectionHeader({
  title,
  count,
  actionLabel,
  onAction,
}: SectionHeaderProps) {
  const colors = useAppColors();
  const showCount = count !== undefined && count >= 0;
  const showAction =
    actionLabel !== undefined &&
    actionLabel.length > 0 &&
    onAction !== undefined;
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <ThemedText variant="wordRow">{title}</ThemedText>
        {showCount ? (
          <View style={[styles.badge, { backgroundColor: colors.surface2 }]}>
            <ThemedText variant="labelSm" tone="secondary">
              {String(count as number)}
            </ThemedText>
          </View>
        ) : null}
      </View>
      {showAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel as string}
          onPress={onAction}
          style={styles.action}
        >
          <ThemedText variant="label" tone="accent">
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  left: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  badge: {
    borderRadius: radius.full,
    borderCurve: "continuous",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  action: {
    padding: spacing.xs,
  },
});
