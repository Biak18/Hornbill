// Card compound components (skill 10.1: compound over polymorphic).
// Card never accepts a raw string child — use CardTitle (text) + CardBody.
// Styling follows skill 9.2: gap for spacing, borderCurve continuous,
// boxShadow string syntax, no scattered hex (colors via props).

import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { radius, spacing } from "@/theme";

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <View style={styles.title}>{children}</View>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <View style={styles.body}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderCurve: "continuous",
    borderRadius: radius.card,
    gap: spacing.sm,
    padding: spacing.md,
    // Skill 9.2: CSS boxShadow string, not legacy shadow objects/elevation.
    boxShadow: "0 2px 12px rgba(12, 32, 27, 0.08)",
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  body: {
    gap: spacing.sm,
  },
});
