import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (publishable/anon key — safe to expose).
 * Not on the critical path today (all reads/writes go through Server
 * Components/Actions), kept for parity and any future client-side use
 * (e.g. realtime subscriptions).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
