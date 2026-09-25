// Bottom clearance for scrollable content (docs/Design.md §22: respect
// safe-area insets, never compress content under chrome).
//
// Two platform facts drive this hook:
// - contentInsetAdjustmentBehavior="automatic" is iOS-only. On Android the
//   native tab bar and the system gesture bar overlay scroll content, so
//   list ends slide underneath them with zero clearance.
// - NativeTabs exposes no tab-bar measurement API, so the bar allowance is
//   a constant estimate (Material3 nav bar / iOS tab bar ≈ 80).
// The result is trailing scroll space only — it never shrinks content —
// with roughly a rhythm gap left visible above the chrome.
import { spacing } from "@/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NATIVE_TAB_BAR_HEIGHT = 20;

export function useBottomClearance(belowTabBar = true): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + spacing.md + (belowTabBar ? NATIVE_TAB_BAR_HEIGHT : 0);
}
