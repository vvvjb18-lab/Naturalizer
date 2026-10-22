import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { login } from "../api";
import type { AdminUser } from "../types";
import { PrimaryButton, TextField } from "../components/ui";
import { colors } from "../theme";

export function LoginScreen({
  onAuthenticated,
}: {
  onAuthenticated: (token: string, user: AdminUser) => void;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!identifier.trim() || !password) {
      setError("請輸入帳戶及密碼。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await login(identifier.trim(), password);
      onAuthenticated(result.token, result.user);
    } catch (requestError) {
      const code =
        requestError instanceof Error ? requestError.message : "login_failed";
      setError(
        code === "invalid_credentials"
          ? "帳戶或密碼不正確。"
          : code === "admin_not_configured"
            ? "後台登入尚未設定，請聯絡管理員。"
            : code === "too_many_attempts"
              ? "嘗試次數過多，請 10 分鐘後再試。"
              : "暫時未能登入，請檢查網絡後再試。"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Text style={styles.brandText}>
              Naturalizer<Text style={styles.brandDot}>.</Text>
            </Text>
            <Text style={styles.brandLabel}>OPERATIONS</Text>
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>後台登入</Text>
            <Text style={styles.description}>
              管理訂單、更新處理狀態，並查看最新報價。
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="帳戶"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Username"
              textContentType="username"
              autoComplete="username"
              returnKeyType="next"
            />
            <TextField
              label="密碼"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              textContentType="password"
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={submit}
              error={error}
            />
            <PrimaryButton
              title="登入後台"
              onPress={submit}
              loading={loading}
            />
          </View>

          <Text style={styles.notice}>
            只供授權人員使用。所有狀態更新均會記錄操作者及時間。
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
  },
  brand: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  brandText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  brandDot: {
    color: colors.primary,
  },
  brandLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  intro: {
    marginTop: 72,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1.4,
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 310,
  },
  form: {
    marginTop: 36,
    gap: 18,
  },
  notice: {
    marginTop: "auto",
    paddingTop: 32,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 18,
  },
});
