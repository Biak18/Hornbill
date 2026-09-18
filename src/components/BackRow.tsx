// BackRow — custom in-screen back navigation, used instead of the native
// stack header (which stays hidden). Back chevron + optional title +
// optional trailing actions via children (e.g. a save button). Back goes
// to router.back() unless overridden.
//
// `floating` pins the row over scrolling content with a frosted-glass
// background (expo-blur, stable on Android since SDK 55). The blur tint
// follows the stored theme preference via useResolvedScheme — BlurView's
// "default" tint would follow the OS scheme instead and disagree with the
// app surfaces (same mismatch class as the old ThemeProvider bug).

import { radius, spacing, useResolvedScheme } from "@/theme";
import { useAppColors } from "@/theme/colors";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

type BackRowProps = {
  title?: string;
  onPressBack?: () => void;
  backLabel?: string;
  children?: ReactNode;
  floating?: boolean;
};

export function BackRow({
  title,
  onPressBack,
  backLabel = "Go back",
  children,
  floating = false,
}: BackRowProps) {
  const colors = useAppColors();
  const scheme = useResolvedScheme();
  const { back } = useRouter();
  // Absolute positioning ignores Screen's top safe-area padding, so the
  // floating bar must clear the notch/status bar itself. The blur wash
  // still extends underneath it, like a native header.
  const insets = useSafeAreaInsets();
  const hasTitle = title !== undefined && title.length > 0;
  return (
    <View
      style={[
        floating ? styles.floating : null,
        floating
          ? {
              borderBottomColor: colors.line,
              paddingTop: insets.top + spacing.sm,
            }
          : null,
      ]}
    >
      {floating ? (
        <BlurView
          intensity={80}
          tint={scheme === "dark" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.row}>
        <View style={[styles.backCircle, { backgroundColor: colors.surface2 }]}>
          <IconButton
            name="chevron-left"
            size={24}
            color={colors.ink}
            accessibilityLabel={backLabel}
            onPress={onPressBack ?? back}
          />
        </View>
        <View style={styles.titleWrap}>
          {hasTitle ? (
            <Text variant="wordRow" numberOfLines={1}>
              {title as string}
            </Text>
          ) : null}
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlay pinned to the top of the screen's content box. Rendered after
  // the scrollable sibling so it paints above on both platforms.
  // paddingTop is applied dynamically (insets.top + spacing.sm) since the
  // overlay ignores Screen's safe-area padding.
  floating: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    left: 0,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 44,
    marginBottom: 5,
  },
  backCircle: {
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
});
