import React, { createContext, PropsWithChildren, useContext } from "react";
import { useColorScheme } from "react-native";

import { AppTheme, themes } from ".";

type ThemePreference = "light" | "dark" | "system";

const ThemeContext = createContext<AppTheme>(themes.light);

type AppThemeProviderProps = PropsWithChildren<{
  preference?: ThemePreference;
}>;

export function AppThemeProvider({
  children,
  preference = "system",
}: AppThemeProviderProps) {
  const systemScheme = useColorScheme();
  const mode = preference === "system" ? systemScheme ?? "light" : preference;

  return (
    <ThemeContext.Provider value={themes[mode]}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
