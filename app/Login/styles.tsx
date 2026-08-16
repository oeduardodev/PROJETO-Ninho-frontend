import { StyleSheet } from "react-native";

import { AppTheme } from "@/theme";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    content: {
      alignSelf: "center",
      maxWidth: theme.sizes.contentMaxWidth,
      width: "100%",
    },
    title: {
      ...theme.typography.display,
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    subTitle: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
      textAlign: "center",
      marginBottom: theme.spacing["2xl"],
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.sm,
    },
    dividerLine: {
      flex: 1,
      height: theme.borderWidths.hairline,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      ...theme.typography.bodySmall,
      marginHorizontal: theme.spacing.md,
      color: theme.colors.textMuted,
    },
    input: {
      height: theme.sizes.controlMd,
      backgroundColor: theme.colors.surface,
      borderWidth: theme.borderWidths.hairline,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      paddingHorizontal: theme.spacing.lg,
      fontFamily: theme.fonts.body,
      marginBottom: theme.spacing.lg,
      fontSize: theme.fontSizes.md,
      color: theme.colors.text,
    },
    primaryButton: { marginTop: theme.spacing.sm },
    logo: {
      alignSelf: "center",
      width: 120,
      height: 120,
    },
    elementTop: {
      position: "absolute",
      top: 0,
      left: 50,
      right: 0,
      height: 260,
      width: "100%",
      resizeMode: "contain",
    },
    elementDown: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 260,
      width: "100%",
      resizeMode: "contain",
    },
    spanPressable: {
      color: theme.colors.primary,
      textDecorationLine: "underline",
      fontFamily: theme.fonts.bodyBold,
    },
    registerText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textMuted,
      textAlign: "center",
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
  });
