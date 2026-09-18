// AudioButton — Falam pronunciation button.
// Plays a bundled native-speaker recording via expo-audio; the player is
// owned by this component and released on unmount. Rendered only when the
// entry resolves to a bundled source — never as a dead control.

import { useCallback, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Text } from "@/components/Text";
import { radius, spacing, useAppColors } from "@/theme";

export function AudioButton({
  source,
  onPlayingChange,
}: {
  source: number;
  onPlayingChange?: (playing: boolean) => void;
}) {
  const colors = useAppColors();
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);
  const playing = status.playing === true;

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  const handlePress = useCallback(async () => {
    if (playing) {
      player.pause();
      return;
    }
    // After a finished clip the player rests at the end — play() alone
    // would instantly finish again, so rewind first. Mid-clip pauses
    // resume untouched.
    if (status.didJustFinish) {
      await player.seekTo(0);
    }
    player.play();
  }, [playing, player, status.didJustFinish]);

  const pillStyle: StyleProp<ViewStyle> = useMemo(
    () => [
      styles.pill,
      { backgroundColor: playing ? colors.peach : colors.accent },
    ],
    [playing, colors.peach, colors.accent],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={playing ? "Pause Falam audio" : "Play Falam audio"}
      accessibilityState={{ selected: playing }}
      onPress={handlePress}
      style={pillStyle}
    >
      <MaterialIcons
        name={playing ? "pause" : "volume-up"}
        size={20}
        color={colors.surface}
      />
      <Text variant="label" tone="onAccent">
        {playing ? "Playing…" : "Listen in Falam"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    boxShadow: "0 2px 8px rgba(12, 32, 27, 0.16)",
  },
});
