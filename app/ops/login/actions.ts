"use server";

import { redirect } from "next/navigation";

import {
  createAdminSession,
  isAdminConfigured,
  verifyAdminCredentials,
} from "@/lib/admin/session";

export async function login(formData: FormData) {
  if (!isAdminConfigured()) {
    redirect("/ops/login?error=config");
  }

  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    redirect("/ops/login?error=invalid");
  }

  const user = verifyAdminCredentials(identifier, password);

  if (!user) {
    redirect("/ops/login?error=invalid");
  }

  createAdminSession(user);
  redirect("/ops");
}
