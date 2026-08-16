import { Colors } from "./colors";
import { fontFamilies, fontSizes, fontWeights, lineHeights, typography } from "./fonts";
import { borderWidths, opacity, radii, shadows, sizes, spacing } from "./tokens";

function createTheme(mode: keyof typeof Colors) {
  return {
    mode,
    colors: Colors[mode],
    fonts: fontFamilies,
    fontSizes,
    fontWeights,
    lineHeights,
    typography,
    spacing,
    radii,
    sizes,
    borderWidths,
    opacity,
    shadows,
  } as const;
}

export const themes = {
  light: createTheme("light"),
  dark: createTheme("dark"),
} as const;

export type AppTheme = (typeof themes)[keyof typeof themes];

export * from "./colors";
export * from "./fonts";
export * from "./tokens";
