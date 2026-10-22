"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Keeps the order and quote lists current while the dashboard is open. */
export function OpsAutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/ops" && pathname !== "/ops/quotes") return;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, 15_000);

    return () => window.clearInterval(timer);
  }, [pathname, router]);

  return null;
}
