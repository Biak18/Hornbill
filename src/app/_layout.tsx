// Root layout: fonts gate the splash screen, then providers + root stack.
// Tabs live in "(tabs)"; entry detail pushes above them. All header chrome
// is configured here exactly once — screens stay plain Views and never
// touch Stack.Screen.

import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { AudioSettingsProvider } from "@/stores/audio-settings";
import { FavoritesProvider } from "@/stores/favorites";
import { HistoryProvider } from "@/stores/history";
import { ThemePreferenceProvider } from "@/stores/theme-preference";
import { useAppColors, useAppFonts } from "@/theme";

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const colors = useAppColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="entry/[id]" options={{ title: "Entry" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ThemePreferenceProvider>
        <AudioSettingsProvider>
          <FavoritesProvider>
            <HistoryProvider>
              <RootStack />
            </HistoryProvider>
          </FavoritesProvider>
        </AudioSettingsProvider>
      </ThemePreferenceProvider>
    </ThemeProvider>
  );
}
