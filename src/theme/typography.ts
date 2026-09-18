// Polished-system type ramp: DM Sans for UI, Noto Sans for linguistic
// content (headwords, examples). Sizes only — color comes from `tone`
// in Text (hook-only boundary).

import type { TextStyle } from "react-native";

export const fontFamily = {
  ui: "DMSans_400Regular",
  uiMedium: "DMSans_500Medium",
  uiBold: "DMSans_700Bold",
  ling: "NotoSans_400Regular",
  lingBold: "NotoSans_700Bold",
} as const;

export const type = {
  greeting: {
    fontFamily: fontFamily.uiBold,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -1.3,
  },
  wordHero: {
    fontFamily: fontFamily.lingBold,
    fontSize: 44,
    lineHeight: 43,
    letterSpacing: -3.5,
  },
  pageTitle: {
    fontFamily: fontFamily.uiBold,
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -2.2,
  },
  resultQuery: {
    fontFamily: fontFamily.uiBold,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -1.6,
  },
  definition: {
    fontFamily: fontFamily.ui,
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: -0.4,
  },
  wordRow: {
    fontFamily: fontFamily.lingBold,
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: -0.4,
  },
  meaning: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
  },
  meta: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 16,
  },
  eyebrow: {
    fontFamily: fontFamily.uiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.4,
  },
  body: {
    fontFamily: fontFamily.ui,
    fontSize: 15,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 20,
  },
  exampleFal: {
    fontFamily: fontFamily.ling,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: fontFamily.uiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  labelSm: {
    fontFamily: fontFamily.uiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  phonetic: {
    fontFamily: fontFamily.ui,
    fontSize: 15,
    lineHeight: 22,
  },
  posTag: {
    fontFamily: fontFamily.uiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  chip: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 16,
  },
} as const satisfies Record<string, TextStyle>;
