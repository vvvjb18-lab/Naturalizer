import type { Metadata } from "next";

import { TrackOrder } from "@/components/track-order";

export const metadata: Metadata = {
  title: "訂單狀態｜Naturalizer",
  description: "輸入追蹤編號查看 Naturalizer 訂單的最新處理狀態。",
  robots: { index: false, follow: false },
};

export default function TrackPage({
  searchParams,
}: {
  searchParams?: { code?: string };
}) {
  return <TrackOrder initialCode={searchParams?.code ?? ""} />;
}
