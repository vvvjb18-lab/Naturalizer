import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Naturalizer Ops",
  robots: { index: false, follow: false },
};

export default function OpsRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
