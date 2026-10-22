import {
  getBearerAdmin,
  mobileJson,
  mobilePreflight,
  mobileUnauthorized,
} from "@/lib/admin/mobile-api";
import {
  getOrder,
  isOrderStatus,
  listOrderEvents,
  StorageNotConfiguredError,
  updateOrderStatus,
} from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return mobilePreflight();
}

async function loadOrder(id: string) {
  const order = await getOrder(id);
  if (!order) return null;
  const events = await listOrderEvents(id);
  return { order, events };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = getBearerAdmin(request);
  if (!admin) return mobileUnauthorized();

  try {
    const payload = await loadOrder(params.id);
    if (!payload) {
      return mobileJson({ ok: false, error: "order_not_found" }, 404);
    }

    return mobileJson({
      ok: true,
      order: payload.order,
      events: payload.events,
    });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return mobileJson({ ok: false, error: "storage_not_configured" }, 503);
    }

    console.error("Mobile order detail failed", error);
    return mobileJson({ ok: false, error: "order_unavailable" }, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = getBearerAdmin(request);
  if (!admin) return mobileUnauthorized();

  let body: { status?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mobileJson({ ok: false, error: "invalid_json" }, 400);
  }

  const status = typeof body.status === "string" ? body.status : "";
  if (!isOrderStatus(status)) {
    return mobileJson({ ok: false, error: "invalid_status" }, 422);
  }

  try {
    await updateOrderStatus(params.id, status, admin.name);
    const payload = await loadOrder(params.id);

    if (!payload) {
      return mobileJson({ ok: false, error: "order_not_found" }, 404);
    }

    return mobileJson({
      ok: true,
      order: payload.order,
      events: payload.events,
    });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return mobileJson({ ok: false, error: "storage_not_configured" }, 503);
    }

    if (error instanceof Error && error.message === "Order not found") {
      return mobileJson({ ok: false, error: "order_not_found" }, 404);
    }

    console.error("Mobile order update failed", error);
    return mobileJson({ ok: false, error: "order_update_failed" }, 500);
  }
}
