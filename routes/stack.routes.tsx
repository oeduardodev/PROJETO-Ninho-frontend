import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { useFonts } from "expo-font";
import React from "react";

import Login from "@/app/Login";
import { RootStackParamList } from "@/routes/types/navigation";
import { AppThemeProvider, useAppTheme } from "@/theme/ThemeProvider";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppRoutes() {
  const [fontsLoaded] = useFonts({
    TTRamillas: require("../assets/fonts/tt_ramillas/TT Ramillas Trial Regular.ttf"),
    TTRamillasBold: require("../assets/fonts/tt_ramillas/TT Ramillas Trial Bold.ttf"),
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppThemeProvider>
      <ThemedNavigation />
    </AppThemeProvider>
  );
}

function ThemedNavigation() {
  const theme = useAppTheme();
  const baseTheme =
    theme.mode === "dark" ? NavigationDarkTheme : NavigationLightTheme;

  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
