"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "naturalizer-ops-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

/**
 * Small in-app hint for adding /ops to the home screen. Chrome/Android can
 * trigger the native install prompt; iOS Safari needs the Share-sheet steps.
 */
export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone()) return;

    const mobile =
      /android|iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      (window.navigator.maxTouchPoints > 1 &&
        /macintosh/i.test(window.navigator.userAgent));

    if (!mobile) return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;

    setIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const timer = window.setTimeout(() => setVisible(true), 900);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    window.localStorage.setItem(DISMISS_KEY, "1");
  }

  async function install() {
    if (!deferred) return;

    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="加入主頁提示"
      className="fixed inset-x-3 z-[60] mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur"
      style={{ bottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <img
        src="/ops/icon-192.png"
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-xl border border-border"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          加到手機主頁
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {ios
            ? "用 Safari 開啟，點「分享」→「加入主頁」，即可像 App 一樣使用後台。"
            : deferred
              ? "安裝後可全螢幕開啟，不必每次輸入網址。"
              : "在瀏覽器選單選「安裝應用程式」或「加入主頁」。"}
        </p>
        <div className="mt-3 flex items-center gap-2">
          {deferred ? (
            <button
              type="button"
              onClick={() => void install()}
              className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              立即安裝
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            稍後
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="關閉提示"
        className="-mr-1 -mt-1 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </aside>
  );
}
