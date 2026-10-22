import type { OrderStatus } from "@/lib/admin/store";

export const PUBLIC_STAGES = [
  "received",
  "quoted",
  "confirmed",
  "processing",
  "completed",
] as const;

export type PublicStage = (typeof PUBLIC_STAGES)[number] | "cancelled";

export function publicStageFor(status: OrderStatus): PublicStage {
  switch (status) {
    case "new":
      return "received";
    case "quoted":
      return "quoted";
    case "confirmed":
      return "confirmed";
    case "in_progress":
      return "processing";
    case "delivered":
      return "completed";
    case "cancelled":
      return "cancelled";
  }
}

export function publicStageIndex(stage: PublicStage) {
  if (stage === "cancelled") return -1;
  return PUBLIC_STAGES.indexOf(stage);
}
