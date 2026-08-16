import { Platform, TextStyle } from "react-native";

const systemSans = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
});

const systemMono = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
});

export const fontFamilies = {
  brand: "TTRamillas",
  brandBold: "TTRamillasBold",
  body: systemSans,
  mono: systemMono,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  display: 62,
} as const;

export const lineHeights = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 28,
  "2xl": 32,
  "3xl": 40,
  display: 64,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const satisfies Record<string, TextStyle["fontWeight"]>;

export const typography = {
  display: {
    fontFamily: fontFamilies.brand,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    letterSpacing: -4,
  },
  heading1: {
    fontFamily: fontFamilies.brandBold,
    fontSize: fontSizes["3xl"],
    lineHeight: lineHeights["3xl"],
  },
  heading2: {
    fontFamily: fontFamilies.brandBold,
    fontSize: fontSizes["2xl"],
    lineHeight: lineHeights["2xl"],
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
  },
  label: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.semibold,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
  },
} as const satisfies Record<string, TextStyle>;

// Alias temporário para imports antigos.
export const Fonts = fontFamilies;
