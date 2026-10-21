import {
  createHmac,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "nat_ops_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60;

export interface AdminIdentity {
  id: string;
  name: string;
  role: string;
}

interface AdminUser extends AdminIdentity {
  username: string;
  passwordHash: string;
}

function readAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is AdminUser => {
      if (!item || typeof item !== "object") return false;
      const user = item as Record<string, unknown>;
      return (
        typeof user.id === "string" &&
        typeof user.name === "string" &&
        typeof user.username === "string" &&
        typeof user.role === "string" &&
        typeof user.passwordHash === "string"
      );
    });
  } catch {
    return [];
  }
}

export function isAdminConfigured() {
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  if (process.env.ADMIN_SESSION_SECRET.length < 32) return false;

  return readAdminUsers().length > 0;
}

function timingSafeStringEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyPasswordHash(password: string, storedHash: string) {
  const [algorithm, n, r, p, saltHex, hashHex] = storedHash.split(":");
  if (algorithm !== "scrypt" || !n || !r || !p || !saltHex || !hashHex) {
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  const derived = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  });

  return timingSafeEqual(derived, expected);
}

export function verifyAdminCredentials(
  identifier: string,
  password: string
): AdminIdentity | null {
  const users = readAdminUsers();
  const login = identifier.trim().toLowerCase();

  if (users.length > 0) {
    const user = users.find(
      (item) => item.username.toLowerCase() === login
    );
    if (!user || !verifyPasswordHash(password, user.passwordHash)) {
      return null;
    }

    return { id: user.id, name: user.name, role: user.role };
  }

  return null;
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret())
    .update(`naturalizer-admin:${payload}`)
    .digest("base64url");
}

export function createAdminSession(user: AdminIdentity) {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      role: user.role,
      exp,
    })
  ).toString("base64url");
  const token = `${payload}.${sign(payload)}`;

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function getAdminSession(): AdminIdentity | null {
  if (!isAdminConfigured()) return null;

  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;
  if (!timingSafeStringEqual(signature, sign(payload))) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as {
      sub?: unknown;
      name?: unknown;
      role?: unknown;
      exp?: unknown;
    };

    if (
      typeof data.sub !== "string" ||
      typeof data.name !== "string" ||
      typeof data.role !== "string" ||
      typeof data.exp !== "number" ||
      data.exp < Date.now()
    ) {
      return null;
    }

    return { id: data.sub, name: data.name, role: data.role };
  } catch {
    return null;
  }
}

export function hasAdminSession() {
  return Boolean(getAdminSession());
}

export function requireAdmin() {
  const session = getAdminSession();
  if (!session) {
    redirect("/ops/login");
  }
  return session;
}

export function clearAdminSession() {
  cookies().delete(COOKIE_NAME);
}
