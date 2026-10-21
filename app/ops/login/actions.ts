"use server";

import { redirect } from "next/navigation";

import {
  createAdminSession,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/admin/session";

export async function login(formData: FormData) {
  if (!isAdminConfigured()) {
    redirect("/ops/login?error=config");
  }

  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    redirect("/ops/login?error=invalid");
  }

  createAdminSession();
  redirect("/ops");
}
