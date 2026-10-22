import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { getMe } from "./src/api";
import { BottomTabs, type RootTab } from "./src/components/BottomTabs";
import { clearToken, readToken, writeToken } from "./src/storage";
import { AccountScreen } from "./src/screens/AccountScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OrderDetailScreen } from "./src/screens/OrderDetailScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { QuotesScreen } from "./src/screens/QuotesScreen";
import { colors } from "./src/theme";
import type { AdminUser, Order } from "./src/types";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [tab, setTab] = useState<RootTab>("orders");
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [ordersVersion, setOrdersVersion] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      const storedToken = await readToken();
      if (!storedToken) {
        if (active) setBooting(false);
        return;
      }

      try {
        const result = await getMe(storedToken);
        if (active) {
          setToken(storedToken);
          setUser(result.user);
        }
      } catch {
        await clearToken();
      } finally {
        if (active) setBooting(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
    setDetailOrderId(null);
    setTab("orders");
  }, []);

  const handleAuthenticated = useCallback(
    async (nextToken: string, nextUser: AdminUser) => {
      await writeToken(nextToken);
      setToken(nextToken);
      setUser(nextUser);
      setTab("orders");
    },
    []
  );

  const openOrder = useCallback((order: Order) => {
    setDetailOrderId(order.id);
  }, []);

  const closeOrder = useCallback(() => {
    setDetailOrderId(null);
  }, []);

  const orderChanged = useCallback(() => {
    setOrdersVersion((value) => value + 1);
  }, []);

  const handleUnauthorized = useCallback(() => {
    void signOut();
  }, [signOut]);

  if (booting) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.splash}>
          <Text style={styles.splashBrand}>
            Naturalizer<Text style={styles.splashDot}>.</Text>
          </Text>
          <Text style={styles.splashLabel}>OPERATIONS</Text>
          <ActivityIndicator
            color={colors.primary}
            style={styles.splashLoader}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!token || !user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <LoginScreen onAuthenticated={handleAuthenticated} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.app}>
        {detailOrderId ? (
          <OrderDetailScreen
            token={token}
            orderId={detailOrderId}
            onBack={closeOrder}
            onChanged={orderChanged}
            onUnauthorized={handleUnauthorized}
          />
        ) : (
          <>
            <View style={styles.screenWrap}>
              {tab === "orders" ? (
                <OrdersScreen
                  key={`orders-${ordersVersion}`}
                  token={token}
                  onOpenOrder={openOrder}
                  onUnauthorized={handleUnauthorized}
                />
              ) : null}
              {tab === "quotes" ? (
                <QuotesScreen
                  token={token}
                  onUnauthorized={handleUnauthorized}
                />
              ) : null}
              {tab === "account" ? (
                <AccountScreen user={user} onLogout={() => void signOut()} />
              ) : null}
            </View>
            <BottomTabs active={tab} onChange={setTab} />
          </>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenWrap: {
    flex: 1,
  },
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  splashBrand: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  splashDot: {
    color: colors.primary,
  },
  splashLabel: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2.5,
  },
  splashLoader: {
    marginTop: 30,
  },
});
