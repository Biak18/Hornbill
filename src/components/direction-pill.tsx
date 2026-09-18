// Direction pill — Stitch-inspired language switcher, our labels.
// Centered pill: "Falam" | swap button | "English". The active source side
// is highlighted; tapping swap flips the direction (query is preserved by
// the caller). Primitives-only props for stable memoization.

import { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./themed-text";
import { useAppColors } from "@/theme/colors";
import { radius, spacing } from "@/theme";
import type { SearchDirection } from "@/services/search";

type DirectionPillProps = {
  direction: SearchDirection;
  onDirectionChange: (direction: SearchDirection) => void;
};

export const DirectionPill = memo(function DirectionPill({
  direction,
  onDirectionChange,
}: DirectionPillProps) {
  const colors = useAppColors();
  const falamFirst = direction === "falam-en";
  const sourceLabel = falamFirst ? "Falam" : "English";
  const targetLabel = falamFirst ? "English" : "Falam";

  const handleSwap = useCallback(() => {
    onDirectionChange(falamFirst ? "en-falam" : "falam-en");
  }, [falamFirst, onDirectionChange]);

  return (
    <View style={styles.center}>
      <View style={[styles.pill, { backgroundColor: colors.paper }]}>
        <ThemedText variant="label" tone="primary">
          {sourceLabel}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Swap search direction, currently ${sourceLabel} to ${targetLabel}`}
          onPress={handleSwap}
          style={[styles.swap, { backgroundColor: colors.surface2 }]}
        >
          <MaterialIcons name="swap-horiz" size={18} color={colors.accent} />
        </Pressable>
        <ThemedText variant="label" tone="secondary">
          {targetLabel}
        </ThemedText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
  },
  pill: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    boxShadow: "0 2px 8px rgba(12, 32, 27, 0.08)",
  },
  swap: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
});
