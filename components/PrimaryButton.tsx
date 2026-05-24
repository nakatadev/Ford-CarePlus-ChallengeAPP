import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  label: string;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
};

export function PrimaryButton({ label, icon, onPress, disabled, variant = "primary", style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={variant === "primary" ? "#FFFFFF" : colors.ford}
        />
      ) : null}
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.ford,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16
  },
  secondary: {
    backgroundColor: "#EEF5FB",
    borderColor: "#B9D8F2",
    borderWidth: 1
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700"
  },
  secondaryLabel: {
    color: colors.ford
  }
});
