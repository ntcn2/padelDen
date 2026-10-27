import { createClient } from "@/lib/supabase/server";

// Бесплатный проект Supabase засыпает после недели без запросов.
// Vercel Cron (см. vercel.json) дёргает этот маршрут раз в день —
// одного лёгкого запроса к базе хватает, чтобы проект не ставился на паузу.
export const dynamic = "force-dynamic";

export async function GET(req) {
  // Vercel сам подставляет заголовок, если в проекте задан CRON_SECRET
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { error } = await createClient().from("seo_pages").select("page_key").limit(1);
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, at: new Date().toISOString() });
}
