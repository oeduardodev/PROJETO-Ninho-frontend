import React, { ReactNode, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

import { AppTheme } from "@/theme";
import { useAppTheme } from "@/theme/ThemeProvider";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDisabled = disabled || loading;
  const indicatorColor = styles[`${variant}Text`].color;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.label, styles[`${variant}Text`], textStyle]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    base: {
      alignItems: "center",
      borderRadius: theme.radii.lg,
      flexDirection: "row",
      gap: theme.spacing.md,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    sm: { height: theme.sizes.controlSm },
    md: { height: theme.sizes.controlMd },
    lg: { height: theme.sizes.controlLg },
    fullWidth: { width: "100%" },
    pressed: { opacity: theme.opacity.pressed },
    disabled: { opacity: theme.opacity.disabled },
    label: {
      ...theme.typography.label,
      flexShrink: 0,
    },
    primary: { backgroundColor: theme.colors.primary },
    primaryText: { color: theme.colors.textOnPrimary },
    secondary: { backgroundColor: theme.colors.primarySoft },
    secondaryText: { color: theme.colors.primary },
    outline: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: theme.borderWidths.hairline,
    },
    outlineText: { color: theme.colors.text },
    ghost: { backgroundColor: "transparent" },
    ghostText: { color: theme.colors.primary },
    danger: { backgroundColor: theme.colors.danger },
    dangerText: { color: theme.colors.textOnPrimary },
  });
}
