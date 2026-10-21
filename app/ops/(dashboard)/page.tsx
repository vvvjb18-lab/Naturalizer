import Link from "next/link";
import { ArrowUpRight, ClipboardList, Clock3 } from "lucide-react";

import { StorageNotice } from "@/components/admin/storage-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatAdminAmount,
  formatAdminDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/admin/session";
import {
  listOrders,
  StorageNotConfiguredError,
  type AdminOrder,
} from "@/lib/admin/store";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OpsOrdersPage() {
  requireAdmin();

  let orders: AdminOrder[] = [];
  let storageUnavailable = false;

  try {
    orders = await listOrders(100);
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      storageUnavailable = true;
    } else {
      throw error;
    }
  }

  const newCount = orders.filter((order) => order.status === "new").length;
  const activeCount = orders.filter(
    (order) => order.status === "confirmed" || order.status === "in_progress"
  ).length;
  const deliveredCount = orders.filter(
    (order) => order.status === "delivered"
  ).length;
  const totalValue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.quote, 0);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Ops
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            訂單總覽
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            查看新訂單、處理狀態和客戶資料。
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/ops/quotes">
            查看報價
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {storageUnavailable ? (
        <div className="mt-8">
          <StorageNotice />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "全部訂單", value: orders.length },
              { label: "待處理", value: newCount },
              { label: "進行中", value: activeCount },
              { label: "已交付", value: deliveredCount },
            ].map((stat) => (
              <Card key={stat.label} className="p-5 shadow-none">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background px-5 py-3 text-xs text-muted-foreground">
            <span>未取消訂單總額</span>
            <span className="text-sm font-semibold text-foreground">
              {formatAdminAmount(totalValue)}
            </span>
          </div>

          <section className="mt-8">
            <h2 className="text-sm font-medium text-foreground">最近訂單</h2>

            {orders.length === 0 ? (
              <div className="mt-3 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background px-6 py-16 text-center">
                <ClipboardList
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-4 text-sm font-medium text-foreground">
                  還沒有訂單
                </p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  客戶在網站提交訂單後，會自動出現在這裡。
                </p>
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-background">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">訂單</th>
                      <th className="px-4 py-3 font-medium">客戶</th>
                      <th className="px-4 py-3 font-medium">字數</th>
                      <th className="px-4 py-3 font-medium">金額</th>
                      <th className="px-4 py-3 font-medium">狀態</th>
                      <th className="px-4 py-3 font-medium">建立時間</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-foreground">
                            {order.orderId}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {order.documentType} · {order.language}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-foreground">
                            {order.name}
                          </p>
                          <p className="mt-1 max-w-[180px] truncate text-[11px] text-muted-foreground">
                            {order.contact}
                          </p>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-muted-foreground">
                          {order.words}
                        </td>
                        <td className="px-4 py-3 font-medium tabular-nums text-foreground">
                          {formatAdminAmount(order.quote, order.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2 py-0.5 text-[11px]",
                              ORDER_STATUS_STYLES[order.status]
                            )}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatAdminDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/ops/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            查看
                            <ArrowUpRight
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="mt-5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            所有時間以香港時間顯示。
          </p>
        </>
      )}
    </div>
  );
}
