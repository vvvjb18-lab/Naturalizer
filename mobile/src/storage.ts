import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "naturalizer-ops-token";

function webStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export async function readToken() {
  try {
    if (Platform.OS === "web") {
      return webStorage()?.getItem(TOKEN_KEY) ?? null;
    }

    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function writeToken(token: string) {
  if (Platform.OS === "web") {
    webStorage()?.setItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearToken() {
  try {
    if (Platform.OS === "web") {
      webStorage()?.removeItem(TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // A failed delete should not block sign-out in the UI.
  }
}
