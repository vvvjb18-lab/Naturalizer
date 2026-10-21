import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import {
  hasAdminSession,
  isAdminConfigured,
} from "@/lib/admin/session";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { login } from "./actions";

export const dynamic = "force-dynamic";

export default function OpsLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  if (hasAdminSession()) {
    redirect("/ops");
  }

  const configured = isAdminConfigured();
  const error = searchParams?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-6 py-12">
      <Card className="w-full max-w-sm p-7 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          返回網站
        </Link>

        <div className="mt-8 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Naturalizer Ops
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          商家後台
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          管理報價、訂單和交付狀態。此頁不會出現在公開導覽中。
        </p>

        {!configured ? (
          <div className="mt-6 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            後台尚未設定。請在 `.env.local` 加入
            <code className="mx-1 rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
              ADMIN_USERS
            </code>
            和至少 32 字元的
            <code className="mx-1 rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
              ADMIN_SESSION_SECRET
            </code>
            。
          </div>
        ) : (
          <form action={login} className="mt-6">
            <label
              htmlFor="admin-identifier"
              className="text-sm font-medium text-foreground"
            >
              帳號或 Email
            </label>
            <input
              id="admin-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              autoFocus
              className="mt-2 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="輸入管理員帳號"
            />

            <label
              htmlFor="admin-password"
              className="mt-4 block text-sm font-medium text-foreground"
            >
              密碼
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="輸入後台密碼"
            />

            {error === "invalid" ? (
              <p role="alert" className="mt-3 text-xs text-destructive">
                帳號或密碼不正確，請再試一次。
              </p>
            ) : null}

            <Button type="submit" className="mt-5 w-full">
              登入後台
            </Button>
          </form>
        )}

        <p className="mt-6 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
          只供授權人員使用。所有操作只儲存在伺服器資料層。
        </p>
      </Card>
    </main>
  );
}
