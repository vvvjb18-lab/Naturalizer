import { NextResponse } from "next/server";

import { verifyAdminToken, type AdminIdentity } from "./session";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
};

export function mobileJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      ...CORS_HEADERS,
      "cache-control": "no-store",
    },
  });
}

export function mobilePreflight() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export function getBearerAdmin(request: Request): AdminIdentity | null {
  const header = request.headers.get("authorization") ?? "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;

  return verifyAdminToken(header.slice(7).trim());
}

export function mobileUnauthorized() {
  return mobileJson({ ok: false, error: "unauthorized" }, 401);
}
