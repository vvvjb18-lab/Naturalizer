import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "服務條款 / Terms of Service | Naturalizer",
  description:
    "Naturalizer 的服務範圍、報價、交付、修改、退款、學術誠信及責任條款。",
};

export default function TermsPage() {
  return <LegalPage document="terms" />;
}
