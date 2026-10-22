import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import {
  deletePushSubscription,
  savePushSubscription,
  StorageNotConfiguredError,
} from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubscriptionBody {
  endpoint?: unknown;
  keys?: {
    p256dh?: unknown;
    auth?: unknown;
  };
}

function noStore(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request) {
  const admin = getAdminSession();
  if (!admin) return noStore({ ok: false, error: "unauthorized" }, 401);

  let body: SubscriptionBody;

  try {
    body = (await request.json()) as SubscriptionBody;
  } catch {
    return noStore({ ok: false, error: "invalid_json" }, 400);
  }

  const endpoint =
    typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  const p256dh =
    typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";

  if (
    !endpoint.startsWith("https://") ||
    endpoint.length > 2000 ||
    !p256dh ||
    !auth
  ) {
    return noStore({ ok: false, error: "invalid_subscription" }, 422);
  }

  try {
    await savePushSubscription({
      endpoint,
      p256dh,
      auth,
      adminId: admin.id,
      userAgent: (request.headers.get("user-agent") ?? "").slice(0, 500),
    });

    return noStore({ ok: true });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return noStore({ ok: false, error: "storage_not_configured" }, 503);
    }

    console.error("Push subscription save failed", error);
    return noStore({ ok: false, error: "subscription_failed" }, 500);
  }
}

export async function DELETE(request: Request) {
  const admin = getAdminSession();
  if (!admin) return noStore({ ok: false, error: "unauthorized" }, 401);

  let body: { endpoint?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return noStore({ ok: false, error: "invalid_json" }, 400);
  }

  const endpoint =
    typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return noStore({ ok: false, error: "missing_endpoint" }, 422);
  }

  try {
    await deletePushSubscription(endpoint);
    return noStore({ ok: true });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return noStore({ ok: false, error: "storage_not_configured" }, 503);
    }

    console.error("Push subscription delete failed", error);
    return noStore({ ok: false, error: "subscription_delete_failed" }, 500);
  }
}
