import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getOrder, isUnauthorized, updateOrderStatus } from "../api";
import {
  Card,
  DetailRow,
  ErrorState,
  LoadingState,
  Screen,
  SectionLabel,
  StatusPill,
} from "../components/ui";
import {
  documentLabels,
  formatDate,
  formatMoney,
  languageLabels,
  referralLabels,
  rushLabel,
} from "../format";
import { colors, orderStatuses, radius, statusMeta } from "../theme";
import type { Order, OrderEvent, OrderStatus } from "../types";

export function OrderDetailScreen({
  token,
  orderId,
  onBack,
  onChanged,
  onUnauthorized,
}: {
  token: string;
  orderId: string;
  onBack: () => void;
  onChanged: () => void;
  onUnauthorized: () => void;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<OrderStatus | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const result = await getOrder(token, orderId, signal);
        setOrder(result.order);
        setEvents(result.events);
      } catch (requestError) {
        if ((requestError as Error).name === "AbortError") return;
        if (isUnauthorized(requestError)) {
          onUnauthorized();
          return;
        }
        setError("未能載入訂單詳情，請稍後再試。");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [orderId, token, onUnauthorized]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function changeStatus(status: OrderStatus) {
    if (!order || status === order.status || updating) return;

    setUpdating(status);

    try {
      const result = await updateOrderStatus(token, order.id, status);
      setOrder(result.order);
      setEvents(result.events);
      onChanged();
    } catch (requestError) {
      if (isUnauthorized(requestError)) {
        onUnauthorized();
        return;
      }
      Alert.alert("未能更新狀態", "請檢查網絡後再試。");
    } finally {
      setUpdating(null);
    }
  }

  if (loading && !order) {
    return (
      <Screen>
        <TopBar onBack={onBack} />
        <LoadingState />
      </Screen>
    );
  }

  if (error && !order) {
    return (
      <Screen>
        <TopBar onBack={onBack} />
        <ErrorState message={error} onRetry={() => void load()} />
      </Screen>
    );
  }

  if (!order) return null;

  const referral = referralLabels[order.referral] ?? order.referral;

  return (
    <Screen>
      <TopBar onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.orderId}>{order.orderId}</Text>
            <StatusPill status={order.status} />
          </View>
          <Text style={styles.name}>{order.name}</Text>
          <Text style={styles.amount}>{formatMoney(order.quote)}</Text>
          <Text style={styles.created}>建立於 {formatDate(order.createdAt)}</Text>
        </View>

        <Card>
          <SectionLabel>訂單資料</SectionLabel>
          <View style={styles.rows}>
            <DetailRow
              label="稿件語言"
              value={languageLabels[order.language] ?? order.language}
            />
            <DetailRow
              label="文件類型"
              value={documentLabels[order.documentType] ?? order.documentType}
            />
            <DetailRow label="字數" value={`${order.words.toLocaleString("zh-HK")} 字`} />
            <DetailRow label="時效" value={rushLabel(order)} />
            <DetailRow label="字數費用" value={formatMoney(order.baseAmount)} />
            <DetailRow label="急單附加費" value={formatMoney(order.rushFee)} />
            <DetailRow
              label="估算總額"
              value={formatMoney(order.quote)}
              strong
            />
            <DetailRow label="希望交稿" value={order.deadline || "未指定"} />
            <DetailRow label="如何得知" value={referral || "未提供"} />
            <DetailRow label="聯絡方式" value={order.contact || "未提供"} />
          </View>
        </Card>

        <Card>
          <SectionLabel>更新狀態</SectionLabel>
          <View style={styles.statusGrid}>
            {orderStatuses.map((status) => {
              const active = status === order.status;
              const meta = statusMeta[status];
              const isUpdating = updating === status;

              return (
                <Pressable
                  key={status}
                  disabled={active || Boolean(updating)}
                  onPress={() => void changeStatus(status)}
                  style={({ pressed }) => [
                    styles.statusButton,
                    active && {
                      backgroundColor: meta.background,
                      borderColor: meta.color,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <StatusDot color={meta.color} />
                  <Text
                    style={[
                      styles.statusButtonText,
                      active && { color: meta.color },
                    ]}
                  >
                    {isUpdating ? "更新中…" : meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {order.updatedBy && order.updatedAt ? (
            <Text style={styles.updatedBy}>
              最後由 {order.updatedBy} 更新 · {formatDate(order.updatedAt)}
            </Text>
          ) : null}
        </Card>

        <Card>
          <SectionLabel>客戶備註</SectionLabel>
          <Text style={styles.notes}>
            {order.notes || "沒有備註。"}
          </Text>
        </Card>

        <Card>
          <View style={styles.timelineHeader}>
            <SectionLabel>狀態紀錄</SectionLabel>
            <Text style={styles.eventCount}>{events.length} 次更新</Text>
          </View>
          {events.length === 0 ? (
            <Text style={styles.noEvents}>
              尚無狀態變更紀錄。更新狀態後會顯示操作者和時間。
            </Text>
          ) : (
            <View style={styles.timeline}>
              {events.map((event) => (
                <View key={event.id} style={styles.event}>
                  <View style={styles.timelineDot} />
                  <View style={styles.eventBody}>
                    <Text style={styles.eventTitle}>
                      {event.fromStatus
                        ? `${statusMeta[event.fromStatus].label} → `
                        : "建立訂單 · "}
                      {statusMeta[event.toStatus].label}
                    </Text>
                    <Text style={styles.eventMeta}>
                      {event.actor} · {formatDate(event.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-back" size={21} color={colors.text} />
        <Text style={styles.backText}>返回</Text>
      </Pressable>
      <Text style={styles.topBarTitle}>訂單詳情</Text>
      <View style={styles.backSpacer} />
    </View>
  );
}

function StatusDot({ color }: { color: string }) {
  return <View style={[styles.threadDot, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingBottom: 30,
    gap: 12,
  },
  topBar: {
    height: 48,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    width: 90,
  },
  backText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  topBarTitle: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
  },
  backSpacer: {
    width: 90,
  },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardRaised,
    padding: 18,
    gap: 7,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  orderId: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    flex: 1,
  },
  name: {
    marginTop: 8,
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.9,
  },
  amount: {
    color: colors.textSoft,
    fontSize: 20,
    fontWeight: "700",
  },
  created: {
    color: colors.muted,
    fontSize: 11,
  },
  rows: {
    marginTop: 6,
  },
  statusGrid: {
    marginTop: 13,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    width: "48.5%",
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  statusButtonText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  threadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  updatedBy: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 10,
  },
  notes: {
    marginTop: 12,
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 21,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventCount: {
    color: colors.muted,
    fontSize: 10,
  },
  noEvents: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
  },
  timeline: {
    marginTop: 14,
    gap: 14,
  },
  event: {
    flexDirection: "row",
    gap: 11,
  },
  timelineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 5,
  },
  eventBody: {
    flex: 1,
    gap: 3,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  eventMeta: {
    color: colors.muted,
    fontSize: 10,
  },
  pressed: {
    opacity: 0.7,
  },
});
