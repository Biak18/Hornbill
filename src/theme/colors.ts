// Polished-system palettes (lake-teal accent, peach warmth) in light + dark.
// Hex values converted from the design's oklch tokens for React Native.
// Hook-only: call `useAppColors()` in components so the theme follows the
// stored preference (system / light / dark, AGENTS.md §22).

import { useColorScheme } from "react-native";
import { useThemePreference } from "@/stores/theme-preference";

export type AppPalette = {
  paper: string;
  paperDeep: string;
  surface: string;
  surface2: string;
  ink: string;
  muted: string;
  muted2: string;
  line: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  peach: string;
  peachSoft: string;
};

const lightPalette: AppPalette = {
  paper: "#EFF7F1",
  paperDeep: "#DEEBE1",
  surface: "#F9FEFB",
  surface2: "#E4F2E7",
  ink: "#0C201B",
  muted: "#5B6F69",
  muted2: "#8B9D98",
  line: "#C9D7CD",
  accent: "#00604E",
  accentStrong: "#004D3D",
  accentSoft: "#BDE5D9",
  peach: "#E09673",
  peachSoft: "#FCDBC8",
};

const darkPalette: AppPalette = {
  paper: "#020F0C",
  paperDeep: "#031712",
  surface: "#041C17",
  surface2: "#09251F",
  ink: "#DDEAE0",
  muted: "#92A7A1",
  muted2: "#687D77",
  line: "#213731",
  accent: "#65BDA8",
  accentStrong: "#87D6C2",
  accentSoft: "#003429",
  peach: "#E7A688",
  peachSoft: "#3D2515",
};

export type ResolvedScheme = "light" | "dark";

// Single source of truth for light/dark: stored preference wins, OS scheme
// is the fallback on "system". Both useAppColors() and the navigator's
// ThemeProvider read this, so nav chrome never disagrees with app surfaces.
export function useResolvedScheme(): ResolvedScheme {
  const systemScheme = useColorScheme();
  const { preference } = useThemePreference();
  if (preference !== "system") {
    return preference;
  }
  return systemScheme === "dark" ? "dark" : "light";
}

export function useAppColors(): AppPalette {
  const scheme = useResolvedScheme();
  return scheme === "dark" ? darkPalette : lightPalette;
}
