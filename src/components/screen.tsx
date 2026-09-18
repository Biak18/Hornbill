// Every screen root. SafeAreaView owns the TOP inset only (notch/status)
// so header chrome never sits under it. Bottom insets are left to the OS:
// the first scrollable/list in each tab uses
// contentInsetAdjustmentBehavior="automatic" (skill 9.4), and NativeTabs
// owns the tab-bar inset — inner scrollables must NOT add manual
// bottom padding or content gets double-padded.

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
      edges={["top"]}
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
