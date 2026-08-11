import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_TTL_MS,
  generateSessionToken,
  hashSessionToken,
  isSessionTokenValid,
} from "@/lib/admin/session";

/** Server Action only — creates the DB row and sets the cookie. */
export async function createAdminSession() {
  const token = generateSessionToken();
  const tokenHash = await hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const supabase = createServiceRoleClient();
  // opportunistic cleanup, not required for correctness
  await supabase.from("admin_sessions").delete().lt("expires_at", new Date().toISOString());
  const { error } = await supabase
    .from("admin_sessions")
    .insert({ token_hash: tokenHash, expires_at: expiresAt.toISOString() });
  if (error) throw error;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Server Action only — deletes the DB row and clears the cookie. */
export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = await hashSessionToken(token);
    const supabase = createServiceRoleClient();
    await supabase.from("admin_sessions").delete().eq("token_hash", tokenHash);
  }
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

/**
 * Call at the top of the protected admin layout and every admin
 * read/mutation that uses the service-role client. Redirects to
 * /admin/login when there's no valid session.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isSessionTokenValid(token))) {
    redirect("/admin/login");
  }
}
