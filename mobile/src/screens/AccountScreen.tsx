import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card, Screen, SectionLabel } from "../components/ui";
import { API_BASE_URL, APP_VERSION } from "../config";
import { colors, radius } from "../theme";
import type { AdminUser } from "../types";

export function AccountScreen({
  user,
  onLogout,
}: {
  user: AdminUser;
  onLogout: () => void;
}) {
  function confirmLogout() {
    Alert.alert("登出後台", "確定要登出這部裝置嗎？", [
      { text: "取消", style: "cancel" },
      { text: "登出", style: "destructive", onPress: onLogout },
    ]);
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>
          Naturalizer<Text style={styles.brandDot}>.</Text>
        </Text>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>帳戶</Text>
          <Text style={styles.subtitle}>登入資訊與應用程式設定</Text>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.trim().charAt(0).toUpperCase() || "N"}
            </Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>
              {user.role === "owner" ? "Owner" : "Editor"} · {user.id}
            </Text>
          </View>
          <View style={styles.securePill}>
            <Ionicons name="lock-closed" size={11} color={colors.success} />
            <Text style={styles.secureText}>已登入</Text>
          </View>
        </Card>

        <Card>
          <SectionLabel>連線</SectionLabel>
          <View style={styles.infoRows}>
            <InfoRow label="API" value={API_BASE_URL} />
            <InfoRow label="版本" value={APP_VERSION} />
            <InfoRow label="工作階段" value="12 小時" />
          </View>
        </Card>

        <Card>
          <SectionLabel>安全</SectionLabel>
          <Text style={styles.securityText}>
            登入憑證儲存在系統安全儲存區。所有狀態更新會記錄你的帳戶名稱及時間；請勿與他人共用登入資料。
          </Text>
        </Card>

        <Pressable
          onPress={confirmLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>登出</Text>
        </Pressable>

        <Text style={styles.footer}>
          Naturalizer Operations · 只供授權人員使用
        </Text>
      </ScrollView>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 12,
  },
  brand: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  brandDot: {
    color: colors.primary,
  },
  titleBlock: {
    marginTop: 22,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1.2,
  },
  subtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  profileText: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  role: {
    color: colors.muted,
    fontSize: 11,
  },
  securePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  secureText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "700",
  },
  infoRows: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  infoValue: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 11,
    textAlign: "right",
  },
  securityText: {
    marginTop: 10,
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 20,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#5b252b",
    backgroundColor: colors.dangerSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.72,
  },
  footer: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 10,
    textAlign: "center",
  },
});
