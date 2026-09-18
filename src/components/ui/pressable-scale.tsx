// PressableScale — skill-compliant press feedback.
// - GPU-only: animates transform (scale) + opacity, never layout (skill 3.1).
// - Ground truth: `pressed` shared value is 0/1 state; visuals are derived
//   via useDerivedValue + interpolate (skill 6.1/7.1, 3.2).
// - UI-thread press state via GestureDetector Tap (skill 3.3); JS callback
//   runs via runOnJS. Uses .get()/.set() for React Compiler compat (skill 8.2).
// - Children are ReactNode (compound-friendly, skill 10.1) — never a raw
//   string; callers wrap text in ThemedText.

import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type PressableScaleProps = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}: PressableScaleProps) {
  const pressed = useSharedValue(0);

  const tap =
    onPress !== undefined
      ? Gesture.Tap()
          .onBegin(() => {
            pressed.set(withTiming(1, { duration: 90 }));
          })
          .onFinalize(() => {
            pressed.set(withTiming(0, { duration: 140 }));
          })
          .onEnd(() => {
            runOnJS(onPress)();
          })
      : Gesture.Tap()
          .onBegin(() => {
            pressed.set(withTiming(1, { duration: 90 }));
          })
          .onFinalize(() => {
            pressed.set(withTiming(0, { duration: 140 }));
          });

  const scale = useDerivedValue(() =>
    interpolate(pressed.get(), [0, 1], [1, 0.97]),
  );
  const opacity = useDerivedValue(() =>
    interpolate(pressed.get(), [0, 1], [1, 0.82]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: opacity.get(),
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={[styles.base, animatedStyle, style]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 0,
  },
});
