import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Public, publishable-key Supabase client. RLS only grants SELECT — there
 * are no write policies for anon/authenticated, so this is read-only in
 * practice. Stateless (no cookies), so it's safe to call at request time or
 * at build time (e.g. generateStaticParams).
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
