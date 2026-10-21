"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/session";
import {
  isOrderStatus,
  updateOrderStatus,
} from "@/lib/admin/store";

export async function setOrderStatus(formData: FormData) {
  const admin = requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !isOrderStatus(status)) {
    throw new Error("Invalid order status update");
  }

  await updateOrderStatus(id, status, admin.name);
  revalidatePath("/ops");
  revalidatePath(`/ops/orders/${id}`);
  redirect(`/ops/orders/${id}?updated=1`);
}
