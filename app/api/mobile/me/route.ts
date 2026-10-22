import {
  getBearerAdmin,
  mobileJson,
  mobilePreflight,
  mobileUnauthorized,
} from "@/lib/admin/mobile-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return mobilePreflight();
}

export function GET(request: Request) {
  const admin = getBearerAdmin(request);
  if (!admin) return mobileUnauthorized();

  return mobileJson({ ok: true, user: admin });
}
