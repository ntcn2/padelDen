import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * service_role client — bypasses RLS entirely.
 *
 * DO NOT import this from admin repository/action code or anything reachable
 * from a request made by an end user. It exists only for:
 *   1. the one-time data migration script (scripts/migrate-to-supabase.mjs)
 *   2. the one-time admin bootstrap script (scripts/create-admin-user.mjs)
 *   3. future trusted server-to-server integrations (e.g. a Telegram bot
 *      running as its own backend process)
 *
 * Every admin CRUD path in this app goes through lib/supabase/server.js
 * instead, which runs as the logged-in user and is gated by RLS.
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
