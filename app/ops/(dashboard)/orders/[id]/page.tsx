import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";

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
  getOrder,
  ORDER_STATUSES,
  StorageNotConfiguredError,
} from "@/lib/admin/store";
import { cn } from "@/lib/utils";
import { setOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

const languageLabels: Record<string, string> = {
  zh: "中文",
  en: "English",
  bilingual: "中英雙語",
};

const documentLabels: Record<string, string> = {
  essay: "Essay",
  thesis: "畢業論文／章節",
  abstract: "Abstract",
  other: "其他",
};

export default async function OpsOrderPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { updated?: string };
}) {
  requireAdmin();

  let order;

  try {
    order = await getOrder(params.id);
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return (
        <div>
          <Link
            href="/ops"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            返回訂單
          </Link>
          <div className="mt-6">
            <StorageNotice />
          </div>
        </div>
      );
    }

    throw error;
  }

  if (!order) notFound();

  const rows = [
    { label: "訂單編號", value: order.orderId, mono: true },
    { label: "稱呼", value: order.name },
    { label: "聯絡方式", value: order.contact },
    {
      label: "稿件語言",
      value: languageLabels[order.language] ?? order.language,
    },
    {
      label: "文件類型",
      value: documentLabels[order.documentType] ?? order.documentType,
    },
    { label: "字數", value: order.words.toLocaleString("zh-HK") },
    {
      label: "估算金額",
      value: formatAdminAmount(order.quote, order.currency),
    },
    {
      label: "希望交稿日期",
      value: order.deadline || "未指定",
    },
    { label: "建立時間", value: formatAdminDate(order.createdAt) },
    ...(order.updatedBy && order.updatedAt
      ? [
          {
            label: "最後更新",
            value: `${order.updatedBy} · ${formatAdminDate(order.updatedAt)}`,
          },
        ]
      : []),
  ];

  return (
    <div>
      <Link
        href="/ops"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        返回訂單
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Order detail
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {order.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {order.orderId}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex w-fit rounded-full border px-3 py-1 text-xs",
            ORDER_STATUS_STYLES[order.status]
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {searchParams?.updated ? (
        <p
          role="status"
          className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          訂單狀態已更新。
        </p>
      ) : null}

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-6 shadow-none">
          <h2 className="text-sm font-medium text-foreground">訂單資料</h2>
          <dl className="mt-4 divide-y divide-border">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-6 py-3 text-sm"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd
                  className={cn(
                    "max-w-[65%] break-words text-right text-foreground",
                    row.mono && "font-mono text-xs"
                  )}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 border-t border-border pt-5">
            <p className="text-xs font-medium text-muted-foreground">
              客戶備註
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {order.notes || "沒有備註。"}
            </p>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-6 shadow-none">
            <h2 className="text-sm font-medium text-foreground">更新狀態</h2>
            <form action={setOrderStatus} className="mt-4">
              <input type="hidden" name="id" value={order.id} />
              <label
                htmlFor="order-status"
                className="text-xs text-muted-foreground"
              >
                處理狀態
              </label>
              <select
                id="order-status"
                name="status"
                defaultValue={order.status}
                className="mt-2 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <Button type="submit" className="mt-4 w-full">
                儲存狀態
              </Button>
            </form>
          </Card>

          <Card className="p-6 shadow-none">
            <h2 className="text-sm font-medium text-foreground">聯絡客戶</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MessageCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="break-all text-foreground">
                  {order.contact}
                </span>
              </p>
              <p>透過客戶提供的聯絡方式確認稿件、交期和付款。</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
