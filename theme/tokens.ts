import { Platform, ViewStyle } from "react-native";

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
} as const;

export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const sizes = {
  controlSm: 40,
  controlMd: 50,
  controlLg: 56,
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  contentMaxWidth: 480,
} as const;

export const borderWidths = {
  none: 0,
  hairline: 1,
  strong: 2,
} as const;

export const opacity = {
  pressed: 0.82,
  disabled: 0.5,
  subtle: 0.72,
} as const;

export const shadows = {
  none: {},
  sm: Platform.select<ViewStyle>({
    android: { elevation: 2 },
    default: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
  }),
  md: Platform.select<ViewStyle>({
    android: { elevation: 5 },
    default: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
    },
  }),
} as const;
