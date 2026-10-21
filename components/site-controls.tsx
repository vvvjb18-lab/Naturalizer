"use client";

import { Languages, Moon, Sun } from "lucide-react";

import { useSite } from "@/components/providers";

/** Compact language switch showing the language you will switch to. */
export function LanguageToggle() {
  const { locale, copy, toggleLocale } = useSite();
  const label =
    locale === "zh" ? copy.common.switchToEnglish : copy.common.switchToChinese;

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={label}
      title={label}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Languages
        className="hidden h-3.5 w-3.5 sm:block"
        aria-hidden="true"
      />
      <span>{locale === "zh" ? "EN" : "中"}</span>
    </button>
  );
}

/** Icon-only theme switch; the label announces the next state, not the current one. */
export function ThemeToggle() {
  const { theme, copy, toggleTheme } = useSite();
  const isDark = theme === "dark";
  const label = isDark ? copy.common.switchToLight : copy.common.switchToDark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
