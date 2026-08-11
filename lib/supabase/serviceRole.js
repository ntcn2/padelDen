import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * service_role client — bypasses RLS entirely.
 *
 * Used by every admin read/write of unpublished or mutable data (via
 * lib/admin/requireAdmin.js and the repository functions it gates), and by
 * the one-time data migration script (scripts/migrate-to-supabase.mjs).
 * Never call this without an immediately preceding requireAdmin() check —
 * it has no RLS to fall back on.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (from Supabase Dashboard → Settings → API) — only needed for migration/admin-bootstrap scripts, never for the running app."
    );
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
