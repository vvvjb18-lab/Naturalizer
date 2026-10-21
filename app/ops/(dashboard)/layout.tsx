import Link from "next/link";
import { BarChart3, ExternalLink, LogOut, ReceiptText } from "lucide-react";

import { ThemeToggle } from "@/components/site-controls";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/session";
import { getStorageMode } from "@/lib/admin/store";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

const storageLabels = {
  supabase: "Supabase 已連接",
  local: "本機資料",
  disabled: "資料庫未設定",
} as const;

export default function OpsDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = requireAdmin();
  const storageMode = getStorageMode();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5">
            <Link
              href="/ops"
              className="text-[16px] font-semibold tracking-tight text-foreground"
            >
              Naturalizer<span className="text-primary">.</span>{" "}
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Ops
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/ops"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                訂單
              </Link>
              <Link
                href="/ops/quotes"
                className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
                報價
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] text-muted-foreground sm:inline">
              {session.name}
            </span>
            <span className="hidden rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] text-muted-foreground md:inline">
              {storageLabels[storageMode]}
            </span>
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                查看網站
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                登出
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
