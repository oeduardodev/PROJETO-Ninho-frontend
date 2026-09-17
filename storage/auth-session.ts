import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { AuthSession } from "@/types/auth";

const SESSION_KEY = "ninho.auth.session";

export async function getStoredSession(): Promise<AuthSession | null> {
  const value =
    Platform.OS === "web"
      ? globalThis.localStorage?.getItem(SESSION_KEY)
      : await SecureStore.getItemAsync(SESSION_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    await clearStoredSession();
    return null;
  }
}

export async function saveStoredSession(session: AuthSession): Promise<void> {
  const value = JSON.stringify(session);
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(SESSION_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function clearStoredSession(): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
