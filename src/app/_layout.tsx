// Root layout: fonts gate the splash screen, then providers + root stack.
// Tabs live in "(tabs)"; entry detail pushes above them. Static header
// chrome is configured here exactly once — the only exception is the entry
// title, which is the headword itself and set dynamically in entry/[id].

import { AudioSettingsProvider } from "@/stores/audio-settings";
import { FavoritesProvider } from "@/stores/favorites";
import { HistoryProvider } from "@/stores/history";
import { ThemePreferenceProvider } from "@/stores/theme-preference";
import { useAppColors, useAppFonts, useResolvedScheme } from "@/theme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const colors = useAppColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="entry/[id]" options={{ title: "Entry" }} />
      </Stack>
    </View>
  );
}

// ThemePreferenceProvider sits outermost so the resolved scheme is
// available to ThemeProvider: nav chrome (headers, tab bar) follows the
// same stored preference as app surfaces instead of the raw OS scheme.
function AppChrome() {
  const scheme = useResolvedScheme();
  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={styles.root}>
        <AudioSettingsProvider>
          <FavoritesProvider>
            <HistoryProvider>
              <RootStack />
            </HistoryProvider>
          </FavoritesProvider>
        </AudioSettingsProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

export default function RootLayout() {
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
    <ThemePreferenceProvider>
      <AppChrome />
    </ThemePreferenceProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
