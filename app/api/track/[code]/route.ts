import { NextResponse } from "next/server";

import {
  getOrderByTrackingCode,
  StorageNotConfiguredError,
} from "@/lib/admin/store";
import {
  isValidTrackingCode,
  normalizeTrackingCode,
} from "@/lib/orders/tracking";
import { publicStageFor } from "@/lib/orders/public-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 40;
const requests = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function rateLimited(key: string) {
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || entry.resetAt < now) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { ok: false, error: "too_many_requests" },
      { status: 429, headers: { "cache-control": "no-store" } }
    );
  }

  const trackingCode = normalizeTrackingCode(params.code);
  if (!isValidTrackingCode(trackingCode)) {
    return NextResponse.json(
      { ok: false, error: "order_not_found" },
      { status: 404, headers: { "cache-control": "no-store" } }
    );
  }

  try {
    const order = await getOrderByTrackingCode(trackingCode);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "order_not_found" },
        { status: 404, headers: { "cache-control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        trackingCode,
        orderId: order.orderId,
        status: order.status,
        stage: publicStageFor(order.status),
        words: order.words,
        rushTier: order.rushTier,
        turnaroundMinutes: order.turnaroundMinutes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt ?? order.createdAt,
      },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: "storage_not_configured" },
        { status: 503, headers: { "cache-control": "no-store" } }
      );
    }

    console.error("Order tracking lookup failed", error);
    return NextResponse.json(
      { ok: false, error: "tracking_unavailable" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}
