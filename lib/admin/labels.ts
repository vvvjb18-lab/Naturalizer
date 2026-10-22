import type { OrderStatus } from "@/lib/admin/store";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "新訂單",
  quoted: "已報價",
  confirmed: "已確認",
  in_progress: "處理中",
  delivered: "已交付",
  cancelled: "已取消",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
  quoted:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  confirmed:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-300",
  in_progress:
    "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-300",
  delivered:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  cancelled:
    "border-border bg-muted text-muted-foreground",
};

export function formatAdminDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatAdminAmount(amount: number, currency = "HKD") {
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
