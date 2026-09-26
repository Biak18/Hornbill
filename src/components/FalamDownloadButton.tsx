// FalamDownloadButton — explicit tap-to-download for remote recordings.
// Downloads never start on their own (see audio-manager.ts): this pill is
// the only path from `downloadable` to cached. Labeled with what it does so
// users never spend mobile data by surprise.

import { Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/Text";
import { radius, spacing, useAppColors } from "@/theme";

export function FalamDownloadButton({ onPress }: { onPress: () => void }) {
  const colors = useAppColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Download Falam recording for offline listening"
      onPress={onPress}
      style={[
        styles.pill,
        { backgroundColor: colors.surface2, borderColor: colors.line },
      ]}
    >
      <MaterialIcons name="download" size={16} color={colors.muted} />
      <Text variant="labelSm" tone="secondary">
        Download audio
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderCurve: "continuous",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
