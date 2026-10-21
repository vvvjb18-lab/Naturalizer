"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { content, type Locale } from "@/lib/i18n";

type Theme = "light" | "dark";
type Copy = (typeof content)[Locale];

interface SiteContextValue {
  locale: Locale;
  copy: Copy;
  theme: Theme;
  ready: boolean;
  toggleLocale: () => void;
  toggleTheme: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

/**
 * Holds the two global preferences: interface language and colour theme.
 * Both are persisted locally and applied to <html> after mount so the
 * server-rendered page stays stable during hydration.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedLocale = window.localStorage.getItem("naturalizer-locale");
      if (storedLocale === "zh" || storedLocale === "en") {
        setLocale(storedLocale);
      }

      const storedTheme = window.localStorage.getItem("naturalizer-theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initialTheme =
        storedTheme === "dark" || storedTheme === "light"
          ? storedTheme
          : document.documentElement.classList.contains("dark") || prefersDark
            ? "dark"
            : "light";

      setTheme(initialTheme);
    } catch {
      // Storage can be unavailable in strict privacy modes; defaults still work.
    }

    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant-HK" : "en";

    if (ready) {
      try {
        window.localStorage.setItem("naturalizer-locale", locale);
      } catch {
        // Persisting the preference is optional.
      }
    }
  }, [locale, ready]);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = theme;

    if (ready) {
      try {
        window.localStorage.setItem("naturalizer-theme", theme);
      } catch {
        // Persisting the preference is optional.
      }
    }
  }, [theme, ready]);

  const toggleLocale = useCallback(() => {
    setLocale((current) => (current === "zh" ? "en" : "zh"));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<SiteContextValue>(
    () => ({
      locale,
      copy: content[locale],
      theme,
      ready,
      toggleLocale,
      toggleTheme,
    }),
    [locale, theme, ready, toggleLocale, toggleTheme]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);

  if (!context) {
    throw new Error("useSite must be used inside <Providers>");
  }

  return context;
}
