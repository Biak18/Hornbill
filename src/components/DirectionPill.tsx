// Direction pill — Stitch-inspired language switcher, our labels.
// Full-width tappable pill: source | prominent swap button | target, so the
// control reads as one big switch rather than static text. Tapping anywhere
// on the pill flips the direction with light haptic confirmation.
// Primitives-only props for stable memoization.

import { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text } from "./Text";
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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDirectionChange(falamFirst ? "en-falam" : "falam-en");
  }, [falamFirst, onDirectionChange]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Swap search direction, currently ${sourceLabel} to ${targetLabel}`}
      accessibilityHint="Activates the opposite translation direction"
      onPress={handleSwap}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: colors.paper,
          borderColor: colors.line,
        },
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.side}>
        <Text variant="label" tone="primary" numberOfLines={1}>
          {sourceLabel}
        </Text>
      </View>
      <View style={[styles.swap, { backgroundColor: colors.accentSoft }]}>
        <MaterialIcons name="swap-horiz" size={22} color={colors.accent} />
      </View>
      <View style={styles.side}>
        <Text variant="label" tone="secondary" numberOfLines={1}>
          {targetLabel}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: radius.full,
    borderCurve: "continuous",
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    boxShadow: "0 2px 8px rgba(12, 32, 27, 0.08)",
  },
  pressed: {
    opacity: 0.7,
  },
  side: {
    alignItems: "center",
    flex: 1,
  },
  swap: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
});
