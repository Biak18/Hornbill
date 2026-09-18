// IconButton — generic 44px touch-target icon button used for
// star/remove/close actions inside cards. Keeps a11y labels with the
// caller and styling minimal so cards stay lightweight.

import { Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppColors } from "@/theme/colors";

type IconButtonProps = {
  name: keyof typeof MaterialIcons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  onTouchStart?: () => void;
  selected?: boolean;
  size?: number;
};

export function IconButton({
  name,
  accessibilityLabel,
  onPress,
  onTouchStart,
  selected,
  size = 22,
}: IconButtonProps) {
  const colors = useAppColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected !== undefined ? { selected } : undefined}
      onPress={onPress}
      onTouchStart={onTouchStart}
      hitSlop={8}
      style={styles.button}
    >
      <MaterialIcons
        name={name}
        size={size}
        color={selected ? colors.peach : colors.muted2}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});
