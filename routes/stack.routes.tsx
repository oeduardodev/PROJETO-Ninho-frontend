import Home from "@/app/Home";
import { RootStackParamList } from "@/routes/types/navigation";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppRoutes() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerBackTitle: "Voltar" }}>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: "Ninho" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
