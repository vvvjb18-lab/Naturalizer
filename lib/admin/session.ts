import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "nat_ops_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60;

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.ADMIN_SESSION_SECRET.length >= 32
  );
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return secret;
}

function sign(expires: string) {
  return createHmac("sha256", sessionSecret())
    .update(`naturalizer-admin:${expires}`)
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  return timingSafeEqual(digest(candidate), digest(expected));
}

export function createAdminSession() {
  const expires = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  const token = `${expires}.${sign(expires)}`;

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function hasAdminSession() {
  if (!isAdminConfigured()) return false;

  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [expires, signature, ...rest] = token.split(".");
  if (!expires || !signature || rest.length > 0) return false;
  if (!Number.isFinite(Number(expires)) || Number(expires) < Date.now()) {
    return false;
  }

  return safeEqual(signature, sign(expires));
}

export function requireAdmin() {
  if (!hasAdminSession()) {
    redirect("/ops/login");
  }
}

export function clearAdminSession() {
  cookies().delete(COOKIE_NAME);
}
