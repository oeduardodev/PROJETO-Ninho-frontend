import { StyleSheet } from "react-native";

import { getAuthStyles } from "@/styles/auth";
import type { AppTheme } from "@/theme";

export function createStyles(theme: AppTheme) {
  const sharedStyles = getAuthStyles(theme);

  return StyleSheet.create({
    ...sharedStyles,
  });
}
