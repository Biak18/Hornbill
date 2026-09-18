// More tab — grouped settings cards. Original design, Papago-like clarity.
// Skill rules:
// - Card compound components (skill 10.1); gap spacing, borderCurve,
//   boxShadow strings (skill 9.2).
// - Toggle knob positions with transform translateX (GPU-only, skill 3.1) —
//   never alignSelf/layout swaps. State is boolean ground truth; the
//   derived offset is computed during render (skill 6.1).
// - ScrollView root uses contentInsetAdjustmentBehavior automatic (9.4).
// - Ternary-with-null; strings in Text.

import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
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

const KNOB_ON_X = 18;

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
              active
                ? [
                    styles.themeActive,
                    { backgroundColor: colors.surface },
                  ]
                : null,
            ]}
          >
            <Text
              variant="meta"
              tone={active ? "accent" : "secondary"}
              style={active ? styles.activeOption : null}
            >
              {option === "system"
                ? "System"
                : option === "light"
                  ? "Light"
                  : "Dark"}
            </Text>
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
            // GPU-only transform positioning (no layout recalculation).
            transform: [{ translateX: on ? KNOB_ON_X : 0 }],
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
        <Text variant="bodySm">{name}</Text>
        <Text variant="meta" tone="secondary">
          {detail}
        </Text>
      </View>
      {control !== undefined ? control : null}
    </View>
  );
}

export default function MoreScreen() {
  const colors = useAppColors();
  const {
    englishTtsEnabled,
    falamAudioEnabled,
    setEnglishTtsEnabled,
    setFalamAudioEnabled,
  } = useAudioSettings();

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Text variant="pageTitle">More</Text>
        <Card style={{ backgroundColor: colors.surface }}>
          <Text variant="eyebrow" tone="secondary">
            APPEARANCE
          </Text>
          <SettingRow
            name="Theme"
            detail="Choose how Falam Dictionary looks"
            control={<ThemeSegmented />}
          />
        </Card>
        <Card style={{ backgroundColor: colors.surface }}>
          <Text variant="eyebrow" tone="secondary">
            LANGUAGE
          </Text>
          <SettingRow
            name="Dictionary direction"
            detail="Falam ⇄ English · switch on Search"
          />
        </Card>
        <Card style={{ backgroundColor: colors.surface }}>
          <Text variant="eyebrow" tone="secondary">
            AUDIO
          </Text>
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
        </Card>
        <Card style={{ backgroundColor: colors.surface }}>
          <Text variant="eyebrow" tone="secondary">
            ABOUT
          </Text>
          <SettingRow
            name="Dictionary information"
            detail="User-contributed words · unverified drafts"
          />
          <SettingRow name="Version" detail="1.0.0 · offline edition" />
        </Card>
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
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 57,
    paddingVertical: spacing.sm,
  },
  settingCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
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
  themeActive: {
    boxShadow: "0 1px 4px rgba(12, 32, 27, 0.12)",
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
