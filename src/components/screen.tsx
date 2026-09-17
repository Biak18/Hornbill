// Every screen root. SafeAreaView (react-native-safe-area-context) owns
// notch/status/navigation insets on all platforms, so inner scrollables
// must NOT also adjust insets — leave their default behavior alone or
// content gets double-padded.

import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppColors } from "@/theme/colors";

export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useAppColors();
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.screen, { backgroundColor: colors.surface }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
