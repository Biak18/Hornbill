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
import { OfflineBanner } from "./OfflineBanner";

export function Screen({
  children,
  style,
  showOfflineBanner = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /**
   * In-flow offline banner above the content. Disable only when top chrome
   * is absolutely positioned and would overlap it (entry hero's floating
   * back bar) — that screen already surfaces offline-relevant audio states.
   */
  showOfflineBanner?: boolean;
}) {
  const colors = useAppColors();
  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.screen, { backgroundColor: colors.surface }, style]}
    >
      {showOfflineBanner ? <OfflineBanner /> : null}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
