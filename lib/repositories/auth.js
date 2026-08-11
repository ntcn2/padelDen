"use server";

import { createAdminSession, destroyAdminSession } from "@/lib/admin/requireAdmin";

// Constant-time comparison to avoid leaking password length/content via
// response-time differences.
function timingSafeEqualStrings(a, b) {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

export async function login(password) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return {
      success: false,
      error: "ADMIN_PASSWORD is not configured on the server.",
    };
  }
  if (!password) {
    return { success: false, error: "Введите пароль" };
  }
  if (!timingSafeEqualStrings(password, adminPassword)) {
    return { success: false, error: "Неверный пароль" };
  }

  await createAdminSession();
  return { success: true };
}

export async function logout() {
  await destroyAdminSession();
}
