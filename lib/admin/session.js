import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

/**
 * Portable session core — no next/headers, no next/navigation. Safe to call
 * from Edge middleware (proxy.js) as well as Server Components/Actions.
 */

export const ADMIN_SESSION_COOKIE = "admin_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSessionToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export async function hashSessionToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return toHex(new Uint8Array(digest));
}

export async function isSessionTokenValid(token) {
  if (!token) return false;
  const tokenHash = await hashSessionToken(token);
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("admin_sessions")
    .select("id")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return Boolean(data);
}
