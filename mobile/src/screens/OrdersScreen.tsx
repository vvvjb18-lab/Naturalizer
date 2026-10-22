import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getOrders, isUnauthorized } from "../api";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  StatusPill,
} from "../components/ui";
import {
  documentLabels,
  formatDate,
  formatMoney,
  referralLabels,
  rushLabel,
} from "../format";
import { colors, orderStatuses, radius, statusMeta } from "../theme";
import type { Order, OrderStats, OrderStatus } from "../types";

const emptyStats: OrderStats = {
  total: 0,
  newCount: 0,
  activeCount: 0,
  deliveredCount: 0,
  totalValue: 0,
};

export function OrdersScreen({
  token,
  onOpenOrder,
  onUnauthorized,
}: {
  token: string;
  onOpenOrder: (order: Order) => void;
  onUnauthorized: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>(emptyStats);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getOrders(token, {
          q: query.trim(),
          status,
          signal: controller.signal,
        });
        setOrders(result.orders);
        setStats(result.stats);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        if (isUnauthorized(requestError)) {
          onUnauthorized();
          return;
        }
        setError("請檢查網絡連線，或稍後再試。");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, status, reloadKey, token, onUnauthorized]);

  async function refresh() {
    setRefreshing(true);
    setError(null);

    try {
      const result = await getOrders(token, {
        q: query.trim(),
        status,
      });
      setOrders(result.orders);
      setStats(result.stats);
    } catch (requestError) {
      if (isUnauthorized(requestError)) {
        onUnauthorized();
        return;
      }
      setError("未能更新訂單，請稍後再試。");
    } finally {
      setRefreshing(false);
    }
  }

  const header = (
    <View>
      <View style={styles.brandRow}>
        <Text style={styles.brand}>
          Naturalizer<Text style={styles.brandDot}>.</Text>
        </Text>
        <Text style={styles.brandLabel}>OPERATIONS</Text>
      </View>

      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>訂單</Text>
          <Text style={styles.subtitle}>最新訂單與處理狀態</Text>
        </View>
        <Pressable
          accessibilityLabel="重新整理"
          onPress={() => setReloadKey((value) => value + 1)}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="refresh" size={19} color={colors.textSoft} />
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="全部" value={String(stats.total)} />
        <StatCard label="待處理" value={String(stats.newCount)} emphasis />
        <StatCard label="進行中" value={String(stats.activeCount)} />
        <StatCard label="已交付" value={String(stats.deliveredCount)} />
      </View>

      <View style={styles.valueBanner}>
        <Text style={styles.valueLabel}>未取消訂單總額</Text>
        <Text style={styles.valueAmount}>{formatMoney(stats.totalValue)}</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={17} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="搜尋訂單、客戶、備註…"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <Ionicons name="close-circle" size={17} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <FilterChip
          label="全部"
          active={status === null}
          onPress={() => setStatus(null)}
        />
        {orderStatuses.map((item) => (
          <FilterChip
            key={item}
            label={statusMeta[item].label}
            active={status === item}
            onPress={() => setStatus(item)}
          />
        ))}
      </ScrollView>

      <View style={styles.listHeading}>
        <Text style={styles.listHeadingText}>訂單列表</Text>
        <Text style={styles.listCount}>{orders.length} 張</Text>
      </View>
    </View>
  );

  return (
    <Screen>
      {loading && orders.length === 0 ? (
        <View style={styles.loadingWrap}>
          {header}
          <LoadingState />
        </View>
      ) : error && orders.length === 0 ? (
        <View style={styles.loadingWrap}>
          {header}
          <ErrorState
            message={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <EmptyState
              title="沒有符合條件的訂單"
              description={
                query || status
                  ? "試試更短的關鍵字，或清除篩選條件。"
                  : "客戶提交訂單後，會自動出現在這裡。"
              }
            />
          }
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => onOpenOrder(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

function StatCard({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={[styles.statCard, emphasis && styles.statCardEmphasis]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, emphasis && styles.statValueEmphasis]}>
        {value}
      </Text>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const referral = referralLabels[order.referral] ?? order.referral;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}
    >
      <View style={styles.orderTop}>
        <View style={styles.orderTitleWrap}>
          <Text style={styles.orderId}>{order.orderId}</Text>
          <Text style={styles.orderName}>{order.name}</Text>
        </View>
        <StatusPill status={order.status} compact />
      </View>

      <View style={styles.orderMetaRow}>
        <Text style={styles.orderMeta}>{order.words} 字</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.orderMeta}>{rushLabel(order)}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.orderMeta}>
          {documentLabels[order.documentType] ?? order.documentType}
        </Text>
      </View>

      <View style={styles.orderBottom}>
        <View style={styles.orderSubMeta}>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          {referral ? (
            <Text style={styles.referral}>來源：{referral}</Text>
          ) : null}
        </View>
        <Text style={styles.amount}>{formatMoney(order.quote)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  loadingWrap: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    paddingTop: 10,
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
  brandLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.8,
  },
  titleRow: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  },
  statCardEmphasis: {
    backgroundColor: colors.primarySoft,
    borderColor: "#244a7e",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  statValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  statValueEmphasis: {
    color: colors.primary,
  },
  valueBanner: {
    marginTop: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  valueAmount: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  searchWrap: {
    marginTop: 20,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  filters: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: "700",
  },
  listHeading: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listHeadingText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  listCount: {
    color: colors.muted,
    fontSize: 11,
  },
  separator: {
    height: 10,
  },
  orderCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 15,
  },
  orderTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  orderTitleWrap: {
    flex: 1,
    gap: 5,
  },
  orderId: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  orderName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  orderMetaRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },
  orderMeta: {
    color: colors.muted,
    fontSize: 11,
  },
  dot: {
    color: colors.borderStrong,
    fontSize: 11,
  },
  orderBottom: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  orderSubMeta: {
    flex: 1,
    gap: 4,
  },
  orderDate: {
    color: colors.muted,
    fontSize: 10,
  },
  referral: {
    color: colors.textSoft,
    fontSize: 10,
  },
  amount: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  pressed: {
    opacity: 0.72,
  },
});
