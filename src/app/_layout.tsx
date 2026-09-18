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
import { StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
      <GestureHandlerRootView style={styles.root}>
        <ThemePreferenceProvider>
          <AudioSettingsProvider>
            <FavoritesProvider>
              <HistoryProvider>
                <RootStack />
              </HistoryProvider>
            </FavoritesProvider>
          </AudioSettingsProvider>
        </ThemePreferenceProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
