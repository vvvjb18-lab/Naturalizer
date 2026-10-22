import type { Metadata, Viewport } from "next";

import { PwaRegister } from "@/components/admin/pwa-register";

export const metadata: Metadata = {
  title: "Naturalizer Ops",
  applicationName: "Naturalizer Ops",
  manifest: "/ops/manifest.webmanifest",
  robots: { index: false, follow: false },
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    title: "Naturalizer Ops",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      {
        url: "/ops/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/ops/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/ops/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070b12",
};

export default function OpsRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <PwaRegister />
      {children}
    </>
  );
}
