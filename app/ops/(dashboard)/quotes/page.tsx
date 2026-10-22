import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";

import { StorageNotice } from "@/components/admin/storage-notice";
import { Card } from "@/components/ui/card";
import {
  formatAdminAmount,
  formatAdminDate,
} from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/admin/session";
import {
  listQuotes,
  StorageNotConfiguredError,
  type AdminQuote,
} from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export default async function OpsQuotesPage() {
  requireAdmin();

  let quotes: AdminQuote[] = [];
  let storageUnavailable = false;

  try {
    quotes = await listQuotes(100);
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      storageUnavailable = true;
    } else {
      throw error;
    }
  }

  const totalValue = quotes.reduce((sum, quote) => sum + quote.amount, 0);

  return (
    <div>
      <Link
        href="/ops"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        返回訂單
      </Link>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Quotes
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          報價紀錄
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          客戶在網站建立的即時報價，會保存在資料層；瀏覽器亦保留最近 10 筆。
        </p>
      </div>

      {storageUnavailable ? (
        <div className="mt-8">
          <StorageNotice />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Card className="p-5 shadow-none">
              <p className="text-xs text-muted-foreground">報價數量</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                {quotes.length}
              </p>
            </Card>
            <Card className="p-5 shadow-none">
              <p className="text-xs text-muted-foreground">估算總額</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                {formatAdminAmount(totalValue)}
              </p>
            </Card>
            <Card className="p-5 shadow-none">
              <p className="text-xs text-muted-foreground">最近報價</p>
              <p className="mt-2 text-sm text-foreground">
                {quotes[0] ? formatAdminDate(quotes[0].createdAt) : "—"}
              </p>
            </Card>
          </div>

          {quotes.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background px-6 py-16 text-center">
              <ReceiptText
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-4 text-sm font-medium text-foreground">
                還沒有報價紀錄
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                在網站輸入字數後，報價會自動出現在這裡。
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-background">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">報價編號</th>
                    <th className="px-4 py-3 font-medium">語言／文件</th>
                    <th className="px-4 py-3 font-medium">字數</th>
                    <th className="px-4 py-3 font-medium">時效</th>
                    <th className="px-4 py-3 font-medium">估算</th>
                    <th className="px-4 py-3 font-medium">建立時間</th>
                    <th className="px-4 py-3 font-medium">有效期至</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quotes.map((quote) => {
                    const expired =
                      new Date(quote.expiresAt).getTime() < Date.now();

                    return (
                      <tr key={quote.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {quote.quoteId}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-foreground">
                            {quote.language}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {quote.documentType}
                          </p>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">
                          {quote.words}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {quote.turnaroundMinutes} 分鐘
                        </td>
                        <td className="px-4 py-3 font-medium tabular-nums text-foreground">
                          {formatAdminAmount(quote.amount, quote.currency)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatAdminDate(quote.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              expired
                                ? "text-xs text-muted-foreground"
                                : "text-xs text-emerald-600 dark:text-emerald-400"
                            }
                          >
                            {expired ? "已過期" : formatAdminDate(quote.expiresAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
