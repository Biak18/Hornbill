// Wave bars — small decorative audio glyph used beside audio controls
// (Stitch detail/wordbook pattern). Static bars; the play state itself is
// communicated by the adjacent audio button, so nothing here pretends to
// be a live waveform. Color comes from props (no theme read per instance).

import { memo } from "react";
import { StyleSheet, View } from "react-native";

const BAR_HEIGHTS = [6, 12, 18, 10] as const;

export const WaveBars = memo(function WaveBars({ color }: { color: string }) {
  return (
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.wrap}
    >
      {BAR_HEIGHTS.map((height, index) => (
        <View
          key={index}
          style={[styles.bar, { backgroundColor: color, height }]}
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
