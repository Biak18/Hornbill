// Bundled fonts (polished system: DM Sans UI, Noto Sans linguistic).
// Loaded async via expo-font; root layout gates the splash screen on this.

import { useFonts } from "expo-font";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  NotoSans_400Regular,
  NotoSans_700Bold,
} from "@expo-google-fonts/noto-sans";

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    NotoSans_400Regular,
    NotoSans_700Bold,
  });
  return loaded;
}
