"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { CAT_COUNT, normalizeCategory } from "@/lib/tournament";

// Одна строка на категорию (id 0..6), вся сетка хранится в jsonb `data`.

// Public — anon key, таблица читается всеми.
export async function getTournament() {
  const supabase = createClient();
  const { data, error } = await supabase.from("tournament_categories").select("id, data");
  if (error) throw error;
  return Array.from({ length: CAT_COUNT }, (_, i) =>
    normalizeCategory(data.find((row) => row.id === i)?.data, i)
  );
}

export async function saveTournamentCategory(index, category) {
  await requireAdmin();
  if (!Number.isInteger(index) || index < 0 || index >= CAT_COUNT) {
    throw new Error("Неизвестная категория");
  }
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("tournament_categories").upsert({
    id: index,
    data: normalizeCategory(category, index),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  revalidatePath("/tournament");
}
