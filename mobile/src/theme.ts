import type { OrderStatus } from "./types";

export const colors = {
  background: "#070b12",
  surface: "#0d1420",
  card: "#121c2b",
  cardRaised: "#172335",
  border: "#253246",
  borderStrong: "#33445d",
  text: "#f4f7fc",
  textSoft: "#c2ccdb",
  muted: "#8e9bb0",
  primary: "#67a3ff",
  primaryPressed: "#4b8ff5",
  primarySoft: "#142744",
  success: "#52d39a",
  successSoft: "#102a22",
  warning: "#f6c35d",
  warningSoft: "#2d2412",
  danger: "#ff7f88",
  dangerSoft: "#2e1519",
  violet: "#b69cff",
  violetSoft: "#231b3d",
  cyan: "#61d4e8",
  cyanSoft: "#102b31",
  white: "#ffffff",
  overlay: "rgba(7, 11, 18, 0.72)",
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const statusMeta: Record<
  OrderStatus,
  { label: string; color: string; background: string }
> = {
  new: {
    label: "新訂單",
    color: "#8fbcff",
    background: "#132846",
  },
  quoted: {
    label: "已報價",
    color: colors.warning,
    background: colors.warningSoft,
  },
  confirmed: {
    label: "已確認",
    color: colors.violet,
    background: colors.violetSoft,
  },
  in_progress: {
    label: "處理中",
    color: colors.cyan,
    background: colors.cyanSoft,
  },
  delivered: {
    label: "已交付",
    color: colors.success,
    background: colors.successSoft,
  },
  cancelled: {
    label: "已取消",
    color: colors.muted,
    background: "#1c2431",
  },
};

export const orderStatuses: OrderStatus[] = [
  "new",
  "quoted",
  "confirmed",
  "in_progress",
  "delivered",
  "cancelled",
];
