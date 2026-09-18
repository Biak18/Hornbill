// WaveBar — audio glyph used beside audio controls (Stitch
// detail/wordbook pattern). Bars pulse while `active` (driven by the real
// player status from the adjacent audio button) and rest flat otherwise.
// GPU-only: per-bar scaleY on the UI thread via Reanimated; staggered with
// withDelay. Color comes from props (no theme read per instance).

import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const BAR_HEIGHTS = [6, 12, 18, 10] as const;
const BAR_DELAYS = [0, 120, 240, 360] as const;

type AnimatedBarProps = {
  color: string;
  height: number;
  delay: number;
  active: boolean;
};

const AnimatedBar = memo(function AnimatedBar({
  color,
  height,
  delay,
  active,
}: AnimatedBarProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.set(
        withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(0.35, { duration: 280 }),
              withTiming(1.3, { duration: 280 }),
            ),
            -1,
            true,
          ),
        ),
      );
    } else {
      cancelAnimation(scale);
      scale.set(withTiming(1, { duration: 150 }));
    }
  }, [active, delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.get() }],
  }));

  return (
    <Animated.View
      style={[styles.bar, { backgroundColor: color, height }, animatedStyle]}
    />
  );
});

export const WaveBar = memo(function WaveBar({
  color,
  active = false,
}: {
  color: string;
  active?: boolean;
}) {
  return (
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.wrap}
    >
      {BAR_HEIGHTS.map((height, index) => (
        <AnimatedBar
          key={index}
          color={color}
          height={height}
          delay={BAR_DELAYS[index] ?? 0}
          active={active}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  bar: {
    borderRadius: 9999,
    borderCurve: "continuous",
    width: 3,
  },
});
