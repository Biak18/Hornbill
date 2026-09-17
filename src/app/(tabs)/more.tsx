// More tab (polished settings): Appearance theme segmented control,
// static dictionary direction, functional audio preference toggles, About.
// Every control performs its action — static rows carry no chevron or press.

import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { useAudioSettings } from "@/stores/audio-settings";
import {
  useThemePreference,
  type ThemePreference,
} from "@/stores/theme-preference";
import { radius, spacing, useAppColors, fontFamily } from "@/theme";

const THEME_OPTIONS: readonly ThemePreference[] = [
  "system",
  "light",
  "dark",
];

function ThemeSegmented() {
  const colors = useAppColors();
  const { preference, setPreference } = useThemePreference();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.paper }]}>
      {THEME_OPTIONS.map((option) => {
        const active = preference === option;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={`${option} theme`}
            accessibilityState={{ selected: active }}
            onPress={() => setPreference(option)}
            style={[
              styles.themeOption,
              active ? { backgroundColor: colors.surface } : null,
            ]}
          >
            <ThemedText
              variant="meta"
              tone={active ? "accent" : "secondary"}
              style={active ? styles.activeOption : null}
            >
              {option === "system"
                ? "System"
                : option === "light"
                  ? "Light"
                  : "Dark"}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  const colors = useAppColors();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: on }}
      onPress={() => onChange(!on)}
      style={[
        styles.toggle,
        { backgroundColor: on ? colors.accentSoft : colors.paperDeep },
      ]}
    >
      <View
        style={[
          styles.knob,
          {
            backgroundColor: on ? colors.accent : colors.muted2,
            alignSelf: on ? "flex-end" : "flex-start",
          },
        ]}
      />
    </Pressable>
  );
}

function SettingRow({
  name,
  detail,
  control,
}: {
  name: string;
  detail: string;
  control?: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <ThemedText variant="bodySm">{name}</ThemedText>
        <ThemedText variant="meta" tone="secondary">
          {detail}
        </ThemedText>
      </View>
      {control}
    </View>
  );
}

export default function MoreScreen() {
  const {
    englishTtsEnabled,
    falamAudioEnabled,
    setEnglishTtsEnabled,
    setFalamAudioEnabled,
  } = useAudioSettings();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText variant="pageTitle">More</ThemedText>
        <ThemedText variant="eyebrow" tone="secondary">
          APPEARANCE
        </ThemedText>
        <SettingRow
          name="Theme"
          detail="Choose how Falam Dictionary looks"
          control={<ThemeSegmented />}
        />
        <ThemedText variant="eyebrow" tone="secondary">
          LANGUAGE
        </ThemedText>
        <SettingRow
          name="Dictionary direction"
          detail="Falam ⇄ English · switch on Search"
        />
        <ThemedText variant="eyebrow" tone="secondary">
          AUDIO
        </ThemedText>
        <SettingRow
          name="English pronunciation"
          detail="Use device voice"
          control={
            <Toggle
              on={englishTtsEnabled}
              onChange={setEnglishTtsEnabled}
              label="English pronunciation enabled"
            />
          }
        />
        <SettingRow
          name="Falam recordings"
          detail="Native-speaker audio when available"
          control={
            <Toggle
              on={falamAudioEnabled}
              onChange={setFalamAudioEnabled}
              label="Falam recordings enabled"
            />
          }
        />
        <ThemedText variant="eyebrow" tone="secondary">
          ABOUT
        </ThemedText>
        <SettingRow
          name="Dictionary information"
          detail="User-contributed words · unverified drafts"
        />
        <SettingRow name="Version" detail="1.0.0 · offline edition" />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  settingRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 57,
    paddingVertical: spacing.sm,
  },
  settingCopy: {
    flex: 1,
    minWidth: 0,
  },
  segmented: {
    borderRadius: 11,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: 2,
    padding: 3,
  },
  themeOption: {
    borderRadius: 8,
    borderCurve: "continuous",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeOption: {
    fontFamily: fontFamily.uiBold,
  },
  toggle: {
    borderRadius: radius.full,
    borderCurve: "continuous",
    height: 25,
    justifyContent: "center",
    paddingHorizontal: 3,
    width: 43,
  },
  knob: {
    borderRadius: radius.full,
    height: 19,
    width: 19,
  },
});
