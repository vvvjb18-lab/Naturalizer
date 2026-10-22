import { NextResponse } from "next/server";

import { sendPushToAdmins, isPushConfigured } from "@/lib/admin/push";
import { getAdminSession } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const admin = getAdminSession();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { ok: false, error: "push_not_configured" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }

  try {
    const result = await sendPushToAdmins({
      title: "Naturalizer Ops",
      body: "即時通知已啟用。新訂單會顯示在這裡。",
      url: "/ops",
      tag: "naturalizer-test",
    });

    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (error) {
    console.error("Test push failed", error);
    return NextResponse.json(
      { ok: false, error: "push_failed" },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}
