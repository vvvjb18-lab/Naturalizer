import {
  getBearerAdmin,
  mobileJson,
  mobilePreflight,
  mobileUnauthorized,
} from "@/lib/admin/mobile-api";
import {
  listQuotes,
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

  try {
    const quotes = await listQuotes(150);

    return mobileJson({
      ok: true,
      quotes,
      totalValue: quotes.reduce((sum, quote) => sum + quote.amount, 0),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return mobileJson({ ok: false, error: "storage_not_configured" }, 503);
    }

    console.error("Mobile quote list failed", error);
    return mobileJson({ ok: false, error: "quotes_unavailable" }, 500);
  }
}
