import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { RootStackParamList } from "@/routes/types/navigation";
import { AppTheme } from "@/theme";
import { useAppTheme } from "@/theme/ThemeProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function Home(_props: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ninho</Text>
      <Text style={styles.description}></Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.heading1,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    textAlign: "center",
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  button: {
    minWidth: 180,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    ...theme.typography.label,
    color: theme.colors.textOnPrimary,
  },
});
