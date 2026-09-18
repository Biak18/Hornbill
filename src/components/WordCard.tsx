// WordCard — Stitch wordbook card adapted to our data and theme:
// headword + phonetic, gloss, Chip, star (wordbook save), optional
// remove, whole card opens the entry. Deliberately no per-row audio
// player: rows stay side-effect-free and lightweight (list-performance
// rule) while audio lives on the entry screen, which owns its player.
// Memoized on primitives only; callbacks hoisted per id; card style
// memoized (no inline objects); ternary-with-null conditionals.

import { memo, useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Pressable as GesturePressable } from "react-native-gesture-handler";
import { Chip } from "./Chip";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { useAppColors } from "@/theme/colors";
import { radius, spacing } from "@/theme";

type WordCardProps = {
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

export const WordCard = memo(function WordCard({
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
}: WordCardProps) {
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
            <Text variant="wordRow" selectable>
              {word}
            </Text>
            {hasPhonetic ? (
              <Text variant="meta" tone="faint" numberOfLines={1}>
                {phonetic as string}
              </Text>
            ) : null}
          </View>
          <Text variant="bodySm" tone="secondary" numberOfLines={2}>
            {meaning}
          </Text>
          {hasPosTag ? <Chip label={posTag as string} /> : null}
        </View>
        <View style={styles.actions}>
          <IconButton
            name={isFavorite ? "star" : "star-border"}
            accessibilityLabel={
              isFavorite ? `Remove ${word} from wordbook` : `Save ${word} to wordbook`
            }
            selected={isFavorite}
            onPress={handleStar}
            onTouchStart={markInnerPress}
          />
          {canRemove ? (
            <IconButton
              name="close"
              accessibilityLabel={`Remove ${word} from list`}
              onPress={handleRemove}
              onTouchStart={markInnerPress}
              size={18}
            />
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
});
