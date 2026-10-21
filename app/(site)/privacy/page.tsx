import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "私隱政策 / Privacy Policy | Naturalizer",
  description:
    "Naturalizer 如何收集、使用、保留及刪除客戶的個人資料與學術稿件。",
};

export default function PrivacyPage() {
  return <LegalPage document="privacy" />;
}
