import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-aware Supabase client for Server Components and Server Actions.
 * Uses the publishable/anon key — every query runs AS the logged-in admin
 * (or as an anonymous visitor), so RLS policies are the real gate, not this
 * client's key. This is what every repository function should use.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — safe to ignore since
            // proxy.js refreshes the session on every request anyway.
          }
        },
      },
    }
  );
}
