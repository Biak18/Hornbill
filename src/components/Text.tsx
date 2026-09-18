// Single text primitive: `variant` picks a polished-system ramp size,
// `tone` picks a palette color. Screens never touch fontSize or hex values.

import { Text as RNText, type TextProps } from "react-native";
import { useAppColors, type AppPalette } from "@/theme/colors";
import { type } from "@/theme/typography";

export type TextTone =
  | "primary"
  | "secondary"
  | "faint"
  | "accent"
  | "peach"
  | "onAccent";

const toneKey: Record<TextTone, keyof AppPalette> = {
  primary: "ink",
  secondary: "muted",
  faint: "muted2",
  accent: "accent",
  peach: "peach",
  onAccent: "surface",
};

export function Text({
  variant = "body",
  tone = "primary",
  style,
  ...props
}: TextProps & { variant?: keyof typeof type; tone?: TextTone }) {
  const colors = useAppColors();
  return (
    <RNText
      style={[type[variant], { color: colors[toneKey[tone]] }, style]}
      {...props}
    />
  );
}
