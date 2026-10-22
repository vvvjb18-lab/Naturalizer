import {
  createAdminToken,
  isAdminConfigured,
  verifyAdminCredentials,
} from "@/lib/admin/session";
import {
  mobileJson,
  mobilePreflight,
} from "@/lib/admin/mobile-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function rateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }

  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  entry.count += 1;
}

export function OPTIONS() {
  return mobilePreflight();
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return mobileJson({ ok: false, error: "admin_not_configured" }, 503);
  }

  const key = clientKey(request);
  if (rateLimited(key)) {
    return mobileJson({ ok: false, error: "too_many_attempts" }, 429);
  }

  let body: { identifier?: unknown; password?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mobileJson({ ok: false, error: "invalid_json" }, 400);
  }

  const identifier =
    typeof body.identifier === "string" ? body.identifier.trim() : "";
  const password =
    typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    return mobileJson({ ok: false, error: "missing_credentials" }, 422);
  }

  const user = verifyAdminCredentials(identifier, password);

  if (!user) {
    recordFailure(key);
    return mobileJson({ ok: false, error: "invalid_credentials" }, 401);
  }

  attempts.delete(key);

  return mobileJson({
    ok: true,
    token: createAdminToken(user),
    tokenType: "Bearer",
    expiresIn: 12 * 60 * 60,
    user,
  });
}
