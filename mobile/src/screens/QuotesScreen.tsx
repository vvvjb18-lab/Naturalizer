import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getQuotes, isUnauthorized } from "../api";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from "../components/ui";
import {
  documentLabels,
  formatDate,
  formatMoney,
  languageLabels,
  rushLabel,
} from "../format";
import { colors, radius } from "../theme";
import type { Quote } from "../types";

export function QuotesScreen({
  token,
  onUnauthorized,
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getQuotes(token, controller.signal);
        setQuotes(result.quotes);
        setTotalValue(result.totalValue);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        if (isUnauthorized(requestError)) {
          onUnauthorized();
          return;
        }
        setError("未能載入報價紀錄，請稍後再試。");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [token, reloadKey, onUnauthorized]);

  async function refresh() {
    setRefreshing(true);

    try {
      const result = await getQuotes(token);
      setQuotes(result.quotes);
      setTotalValue(result.totalValue);
      setError(null);
    } catch (requestError) {
      if (isUnauthorized(requestError)) {
        onUnauthorized();
        return;
      }
      setError("未能更新報價，請稍後再試。");
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
          <Text style={styles.title}>報價</Text>
          <Text style={styles.subtitle}>客戶在網站建立的即時估算</Text>
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

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>報價數量</Text>
          <Text style={styles.summaryValue}>{quotes.length}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>估算總額</Text>
          <Text style={styles.summaryValue}>{formatMoney(totalValue)}</Text>
        </Card>
      </View>

      <View style={styles.listHeading}>
        <Text style={styles.listHeadingText}>最近報價</Text>
        <Text style={styles.listCount}>{quotes.length} 筆</Text>
      </View>
    </View>
  );

  if (loading && quotes.length === 0) {
    return (
      <Screen>
        <View style={styles.padded}>
          {header}
          <LoadingState />
        </View>
      </Screen>
    );
  }

  if (error && quotes.length === 0) {
    return (
      <Screen>
        <View style={styles.padded}>
          {header}
          <ErrorState
            message={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            title="還沒有報價紀錄"
            description="客戶在網站輸入字數後，報價會自動出現在這裡。"
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
        renderItem={({ item }) => <QuoteCard quote={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

function QuoteCard({ quote }: { quote: Quote }) {
  const expired = new Date(quote.expiresAt).getTime() < Date.now();

  return (
    <View style={styles.quoteCard}>
      <View style={styles.quoteTop}>
        <View style={styles.quoteIdWrap}>
          <Text style={styles.quoteId}>{quote.quoteId}</Text>
          <Text style={styles.quoteMeta}>
            {languageLabels[quote.language] ?? quote.language} ·{" "}
            {documentLabels[quote.documentType] ?? quote.documentType}
          </Text>
        </View>
        <Text style={styles.quoteAmount}>{formatMoney(quote.amount)}</Text>
      </View>

      <View style={styles.quoteMetaRow}>
        <Text style={styles.meta}>{quote.words} 字</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.meta}>{rushLabel(quote)}</Text>
      </View>

      <View style={styles.quoteBottom}>
        <Text style={styles.quoteDate}>{formatDate(quote.createdAt)}</Text>
        <Text
          style={[
            styles.expiry,
            expired ? styles.expired : styles.valid,
          ]}
        >
          {expired ? "已過期" : `有效至 ${formatDate(quote.expiresAt)}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 18,
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingBottom: 24,
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
  summaryRow: {
    marginTop: 22,
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  summaryValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  listHeading: {
    marginTop: 24,
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
  quoteCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 15,
  },
  quoteTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  quoteIdWrap: {
    flex: 1,
    gap: 5,
  },
  quoteId: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  quoteMeta: {
    color: colors.textSoft,
    fontSize: 12,
  },
  quoteAmount: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  quoteMetaRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
  },
  dot: {
    color: colors.borderStrong,
    fontSize: 11,
  },
  quoteBottom: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  quoteDate: {
    color: colors.muted,
    fontSize: 10,
  },
  expiry: {
    fontSize: 10,
    fontWeight: "600",
  },
  valid: {
    color: colors.success,
  },
  expired: {
    color: colors.muted,
  },
  pressed: {
    opacity: 0.7,
  },
});
