// Header — original brand block (Stitch-inspired structure, our identity).
// Eyebrow brand + section title on the left; honest "Offline Ready" badge on
// the right (the dictionary is offline-first per PRD §7). No logo image,
// no avatar, no third-party branding (AGENTS.md §17).

import { StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "./Text";
import { useAppColors } from "@/theme/colors";
import { radius, spacing } from "@/theme";

export function Header({ title }: { title: string }) {
  const colors = useAppColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <Text variant="eyebrow" tone="secondary">
          FALAM DICTIONARY
        </Text>
        <Text variant="greeting">{title}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: colors.surface2 }]}>
        <MaterialIcons name="check-circle" size={14} color={colors.accent} />
        <Text variant="labelSm" tone="accent">
          Offline Ready
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  brand: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  badge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderCurve: "continuous",
    flexDirection: "row",
    flexShrink: 0,
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
});
