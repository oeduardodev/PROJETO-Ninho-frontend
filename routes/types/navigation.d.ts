import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Comunidade: undefined;
  About: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export type AboutScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "About"
>;

export type ComunidadeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Comunidade"
>;

export {};
