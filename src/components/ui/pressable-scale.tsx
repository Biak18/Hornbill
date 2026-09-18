// PressableScale — skill-compliant press feedback.
// - GPU-only: animates transform (scale) + opacity, never layout (skill 3.1).
// - Ground truth: `pressed` shared value is 0/1 state; visuals are derived
//   via useDerivedValue + interpolate (skill 6.1/7.1, 3.2).
// - UI-thread press state via GestureDetector Tap (skill 3.3); JS callback
//   runs via scheduleOnRN. Uses .get()/.set() for React Compiler compat (skill 8.2).
// - Children are ReactNode (compound-friendly, skill 10.1) — never a raw
//   string; callers wrap text in ThemedText.

import { useMemo, type ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import Animated, {
  interpolate,
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

  // Stable gesture identity: rebuilding the Tap object every render would
  // detach/re-attach it in GestureDetector (and could drop a tap that is
  // in progress when the parent re-renders, e.g. per keystroke).
  // Every callback carries an explicit 'worklet' directive so all of them
  // run on the UI thread — a mix of worklet/non-worklet callbacks makes
  // gesture-handler throw. `scheduleOnRN` (not deprecated `runOnJS`) hops
  // the press through to the JS thread.
  const tap = useMemo(() => {
    const base = Gesture.Tap()
      .onBegin(() => {
        "worklet";
        pressed.set(withTiming(1, { duration: 90 }));
      })
      .onFinalize(() => {
        "worklet";
        pressed.set(withTiming(0, { duration: 140 }));
      });
    return onPress !== undefined
      ? base.onEnd(() => {
          "worklet";
          scheduleOnRN(onPress);
        })
      : base;
  }, [onPress, pressed]);

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
