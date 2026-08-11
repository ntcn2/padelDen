import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Always refresh the Supabase session cookie so it doesn't expire
  // mid-visit, even on routes that don't require auth.
  const { supabaseResponse, user } = await updateSession(request);

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return supabaseResponse;
  }

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: "/admin/:path*",
};
