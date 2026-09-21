// OfflineBanner — small non-blocking offline indicator (docs/Design.md §17).
// Peach-soft background, wifi-off icon, ink title + muted supporting copy.
// Renders nothing while online (or while connectivity is still unknown, so
// it never flashes on launch). Rendered in-flow at the top of `Screen`, so
// it pushes content down instead of covering it. Purely informational:
// local search keeps working underneath it.

import { radius, spacing, useAppColors } from "@/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useNetworkState } from "expo-network";
import { StyleSheet, View } from "react-native";
import { Text } from "./Text";

export function OfflineBanner() {
  const colors = useAppColors();
  const networkState = useNetworkState();
  // Definitive offline only: undefined (initial) and captive-portal ambiguity
  // stay silent rather than crying wolf.
  if (networkState.isConnected !== false) {
    return null;
  }
  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel="Offline mode. Local dictionary is ready. Remote audio may be unavailable."
      style={[
        styles.banner,
        { backgroundColor: colors.peachSoft, borderColor: colors.peach },
      ]}
    >
      <MaterialIcons name="wifi-off" size={18} color={colors.ink} />
      <View style={styles.copy}>
        <Text variant="labelSm">Offline mode</Text>
        <Text variant="meta" tone="secondary">
          Local dictionary is ready. Remote audio may be unavailable.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: radius.card,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  copy: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
});
