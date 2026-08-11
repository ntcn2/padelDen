"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * The visible admin UI only ever asks for a password (unchanged UX). Under
 * the hood this is real Supabase Auth email+password sign-in against a
 * single fixed admin email, so we get real sessions, refresh tokens, and
 * RLS-aware requests instead of a hand-rolled cookie.
 */
export async function login(password) {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    return {
      success: false,
      error: "ADMIN_EMAIL is not configured on the server.",
    };
  }
  if (!password) {
    return { success: false, error: "Введите пароль" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: "Неверный пароль" };
  }
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
