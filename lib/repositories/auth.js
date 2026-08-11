"use server";

import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, expectedAdminToken } from "@/lib/authToken";

export async function login(password) {
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: "Неверный пароль" };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE_NAME, expectedAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { success: true };
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE_NAME);
}
