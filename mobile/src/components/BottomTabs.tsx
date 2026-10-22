import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme";

export type RootTab = "orders" | "quotes" | "account";

const tabs: {
  key: RootTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "orders", label: "訂單", icon: "receipt-outline", activeIcon: "receipt" },
  {
    key: "quotes",
    label: "報價",
    icon: "pricetag-outline",
    activeIcon: "pricetag",
  },
  {
    key: "account",
    label: "帳戶",
    icon: "person-circle-outline",
    activeIcon: "person-circle",
  },
];

export function BottomTabs({
  active,
  onChange,
}: {
  active: RootTab;
  onChange: (tab: RootTab) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.tabPressed,
            ]}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.label,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 5,
  },
  tabPressed: {
    opacity: 0.65,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.primary,
  },
  labelInactive: {
    color: colors.muted,
  },
});
