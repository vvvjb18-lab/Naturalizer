import type { Metadata, Viewport } from "next";

import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Naturalizer｜中英雙語學術論文自然化 · 人手修訂",
  description:
    "中英雙語學術論文自然化與人手修訂。不足 600 字 HK$65，每 600 字 HK$85，附修改後 Turnitin AI 檢測報告。支援中文、英文及中英雙語稿件。",
  keywords: [
    "學術論文潤色",
    "論文自然化",
    "AI 檢測",
    "Turnitin",
    "academic editing Hong Kong",
    "Chinese English thesis editing",
    "humanize academic writing",
  ],
  openGraph: {
    title: "Naturalizer｜中英雙語學術論文自然化",
    description:
      "人手逐句修訂，保留你的論點與聲音。即時按字數報價，附修改後 Turnitin AI 報告。",
    type: "website",
    locale: "zh_HK",
    alternateLocale: ["en_HK"],
    siteName: "Naturalizer",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Global shell. The inline script applies a saved theme before paint so a
 * dark-mode visitor never sees a white flash while React hydrates.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-HK" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("naturalizer-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
