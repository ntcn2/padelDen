"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { newCategories, normalizeCategories } from "@/lib/tournament";

// Один турнир — одна строка; все его категории с сетками лежат в jsonb
// `categories`. Админ сохраняет турнир целиком, поэтому правки разных
// категорий не перезаписывают друг друга.

const COLUMNS = "id, title, subtitle, archived, categories, created_at";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toApp(row) {
  return {
    id: row.id,
    title: row.title || "",
    subtitle: row.subtitle || "",
    archived: row.archived,
    categories: normalizeCategories(row.categories),
    createdAt: row.created_at,
  };
}

function revalidate(id) {
  revalidatePath("/tournament");
  revalidatePath("/admin/tournament");
  if (id) revalidatePath(`/tournament/${id}`);
}

// Public — anon key, таблица читается всеми.
export async function getTournaments() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toApp);
}

export async function getTournament(id) {
  if (!UUID_RE.test(id)) return null;
  const supabase = createClient();
  const { data, error } = await supabase.from("tournaments").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toApp(data) : null;
}

export async function createTournament() {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("tournaments")
    .insert({ title: "Новый турнир", categories: newCategories() })
    .select("id")
    .single();
  if (error) throw error;
  revalidate();
  return data.id;
}

export async function saveTournament(id, { title, subtitle, archived, categories }) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("tournaments")
    .update({
      title: String(title ?? ""),
      subtitle: String(subtitle ?? ""),
      archived: Boolean(archived),
      categories: normalizeCategories(categories),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  revalidate(id);
}

export async function setTournamentArchived(id, archived) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("tournaments").update({ archived: Boolean(archived) }).eq("id", id);
  if (error) throw error;
  revalidate(id);
}

export async function deleteTournament(id) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw error;
  revalidate(id);
}
