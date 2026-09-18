// Lookup row — Stitch wordbook card adapted to our data and theme:
// headword + phonetic, gloss, POS tag, star (wordbook save), optional
// remove, whole card opens the entry. Deliberately no per-row audio
// player: rows stay side-effect-free and lightweight (list-performance
// rule) while audio lives on the entry screen, which owns its player.
// Memoized on primitives only; callbacks hoisted per id; card style
// memoized (no inline objects); ternary-with-null conditionals.

import { memo, useCallback, useMemo, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Pressable as GesturePressable } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { PosTag } from "./pos-chip";
import { ThemedText } from "./themed-text";
import { useAppColors } from "@/theme/colors";
import { radius, spacing } from "@/theme";

type LookupRowProps = {
  id: string;
  word: string;
  phonetic?: string;
  meaning: string;
  posTag?: string;
  isFavorite: boolean;
  showRemove: boolean;
  onPress: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRemove?: (id: string) => void;
};

export const LookupRow = memo(function LookupRow({
  id,
  word,
  phonetic,
  meaning,
  posTag,
  isFavorite,
  showRemove,
  onPress,
  onToggleFavorite,
  onRemove,
}: LookupRowProps) {
  const colors = useAppColors();

  // Nested-press guard: the star/remove buttons sit inside the card press
  // target, and both handlers would otherwise fire on one tap. Inner
  // touches mark the time at touch-down (strictly before any onPress at
  // touch-up), so the card ignores presses that an inner button consumed.
  const innerPressAt = useRef(0);
  const markInnerPress = useCallback(() => {
    innerPressAt.current = Date.now();
  }, []);

  const handlePress = useCallback(() => {
    if (Date.now() - innerPressAt.current < 350) {
      return;
    }
    onPress(id);
  }, [onPress, id]);

  const handleStar = useCallback(() => {
    onToggleFavorite(id);
  }, [onToggleFavorite, id]);

  const handleRemove = useCallback(() => {
    onRemove?.(id);
  }, [onRemove, id]);

  const cardStyle: StyleProp<ViewStyle> = useMemo(
    () => [
      styles.card,
      { backgroundColor: colors.paper, borderColor: colors.line },
    ],
    [colors.paper, colors.line],
  );

  const hasPhonetic = phonetic !== undefined && phonetic.length > 0;
  const hasPosTag = posTag !== undefined && posTag.length > 0;
  const canRemove = showRemove && onRemove !== undefined;

  return (
    <GesturePressable
      accessibilityRole="button"
      accessibilityLabel={word}
      onPress={handlePress}
      style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}
    >
      <View style={styles.top}>
        <View style={styles.copy}>
          <View style={styles.headline}>
            <ThemedText variant="wordRow" selectable>
              {word}
            </ThemedText>
            {hasPhonetic ? (
              <ThemedText variant="meta" tone="faint" numberOfLines={1}>
                {phonetic as string}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText variant="bodySm" tone="secondary" numberOfLines={2}>
            {meaning}
          </ThemedText>
          {hasPosTag ? <PosTag label={posTag as string} /> : null}
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? `Remove ${word} from wordbook` : `Save ${word} to wordbook`
            }
            accessibilityState={{ selected: isFavorite }}
            onPress={handleStar}
            onTouchStart={markInnerPress}
            hitSlop={8}
            style={styles.iconButton}
          >
            <MaterialIcons
              name={isFavorite ? "star" : "star-border"}
              size={22}
              color={isFavorite ? colors.peach : colors.muted2}
            />
          </Pressable>
          {canRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${word} from list`}
              onPress={handleRemove}
              onTouchStart={markInnerPress}
              hitSlop={8}
              style={styles.iconButton}
            >
              <MaterialIcons name="close" size={18} color={colors.muted2} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </GesturePressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: spacing.md,
    boxShadow: "0 2px 8px rgba(12, 32, 27, 0.06)",
  },
  pressed: {
    opacity: 0.7,
  },
  top: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  headline: {
    alignItems: "baseline",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: 2,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});
