import type { Metadata, Viewport } from "next";

import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Naturalizer — Academic writing that still sounds like you",
  description:
    "Naturalizer edits academic drafts for clarity, rhythm, and tone without flattening your voice. Built for students, thesis writers, and researchers.",
  keywords: [
    "academic editing",
    "thesis editing",
    "proofreading",
    "writing clarity",
    "student writing tool",
  ],
  openGraph: {
    title: "Naturalizer — Academic writing that still sounds like you",
    description:
      "Clearer academic writing, still unmistakably yours. Try a free sample on your own paragraph.",
    type: "website",
    siteName: "Naturalizer",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/**
 * Global shell: system font stack, white background, sticky header,
 * and a footer shared by every route.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-md focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
