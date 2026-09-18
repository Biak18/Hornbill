// Native tab bar: Search, Favorites, History, More.
// Icons are theme-aware: muted when idle, accent when selected, with the
// wordbook star lighting up peach to match the in-app save stars.

import { useAppColors } from "@/theme";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  const colors = useAppColors();
  return (
    <NativeTabs iconColor={{ default: colors.muted2, selected: colors.accent }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Icon
          sf="star"
          md="star"
          selectedColor={colors.peach}
        />
        <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Icon sf="clock" md="history" />
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Icon sf="ellipsis" md="more_horiz" />
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
