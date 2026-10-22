"use client";

import { Bell, BellRing, Loader2, Send, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DISMISS_KEY = "naturalizer-ops-notification-card-dismissed";

type Busy = "subscribe" | "test" | "unsubscribe" | null;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

export function NotificationSetup({
  vapidPublicKey,
}: {
  vapidPublicKey: string;
}) {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!vapidPublicKey) {
      setSupported(false);
      return;
    }

    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setSupported(false);
      return;
    }

    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

    let active = true;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (active) setSubscribed(Boolean(subscription));
      } catch {
        if (active) setSupported(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [vapidPublicKey]);

  if (!vapidPublicKey || !supported) return null;
  if (dismissed && !subscribed) return null;

  async function subscribe() {
    setBusy("subscribe");
    setMessage(null);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("未取得通知權限，請在瀏覽器設定中允許通知。");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const json = subscription.toJSON();
      const response = await fetch("/api/ops/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      if (!response.ok) throw new Error("Subscribe failed");

      setSubscribed(true);
      setMessage("即時通知已開啟。");
    } catch {
      setMessage("未能開啟通知，請再試一次。");
    } finally {
      setBusy(null);
    }
  }

  async function sendTest() {
    setBusy("test");
    setMessage(null);

    try {
      const response = await fetch("/api/ops/push/test", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        sent?: number;
      };

      if (!response.ok || !data.ok) throw new Error("Test failed");

      setMessage(
        data.sent
          ? "測試通知已發送。"
          : "此裝置尚未登記通知，請重新開啟通知。"
      );
    } catch {
      setMessage("未能發送測試通知。");
    } finally {
      setBusy(null);
    }
  }

  async function unsubscribe() {
    setBusy("unsubscribe");
    setMessage(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/ops/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      setMessage("已關閉此裝置的通知。");
    } catch {
      setMessage("未能關閉通知，請再試一次。");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="mb-5 flex flex-col gap-3 p-4 shadow-none sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {subscribed ? (
            <BellRing className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bell className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {subscribed ? "即時通知已開啟" : "開啟即時通知"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {message ??
              (subscribed
                ? "新訂單會推送到這部裝置。"
                : "有新訂單時即時收到通知，不必一直開著後台。")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        {subscribed ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void sendTest()}
              disabled={busy !== null}
            >
              {busy === "test" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              測試通知
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void unsubscribe()}
              disabled={busy !== null}
            >
              關閉
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              onClick={() => void subscribe()}
              disabled={busy !== null}
            >
              {busy === "subscribe" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bell className="h-3.5 w-3.5" />
              )}
              開啟通知
            </Button>
            <button
              type="button"
              onClick={() => {
                setDismissed(true);
                window.localStorage.setItem(DISMISS_KEY, "1");
              }}
              aria-label="關閉提示"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </Card>
  );
}
