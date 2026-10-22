import {
  getBearerAdmin,
  mobileJson,
  mobilePreflight,
  mobileUnauthorized,
} from "@/lib/admin/mobile-api";
import {
  isOrderStatus,
  listOrders,
  StorageNotConfiguredError,
} from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return mobilePreflight();
}

export async function GET(request: Request) {
  const admin = getBearerAdmin(request);
  if (!admin) return mobileUnauthorized();

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const statusParam = url.searchParams.get("status") ?? "";
  const status = isOrderStatus(statusParam) ? statusParam : null;

  try {
    const orders = await listOrders(300);
    const filtered = orders.filter((order) => {
      if (status && order.status !== status) return false;
      if (!query) return true;

      return [
        order.orderId,
        order.name,
        order.contact,
        order.referral,
        order.notes,
        order.documentType,
        order.language,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return mobileJson({
      ok: true,
      orders: filtered,
      stats: {
        total: orders.length,
        newCount: orders.filter((order) => order.status === "new").length,
        activeCount: orders.filter(
          (order) =>
            order.status === "confirmed" || order.status === "in_progress"
        ).length,
        deliveredCount: orders.filter(
          (order) => order.status === "delivered"
        ).length,
        totalValue: orders
          .filter((order) => order.status !== "cancelled")
          .reduce((sum, order) => sum + order.quote, 0),
      },
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return mobileJson({ ok: false, error: "storage_not_configured" }, 503);
    }

    console.error("Mobile order list failed", error);
    return mobileJson({ ok: false, error: "orders_unavailable" }, 500);
  }
}
