// Chip (polished `.part`): tiny bold accent label on an accent-soft
// pill. Shared by result items and the entry detail header.

import { StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { useAppColors } from "@/theme/colors";
import { radius, spacing } from "@/theme";

export function Chip({ label }: { label: string }) {
  const colors = useAppColors();
  return (
    <View style={[styles.tag, { backgroundColor: colors.accentSoft }]}>
      <Text variant="posTag" tone="accent" style={styles.upper}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    borderRadius: radius.tag,
    borderCurve: "continuous",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  upper: {
    textTransform: "uppercase",
  },
});
