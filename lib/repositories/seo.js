"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function toApp(row) {
  if (!row) return null;
  return {
    pageKey: row.page_key,
    label: row.label,
    path: row.path,
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
  };
}

export async function getSeoPages() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("seo_pages").select("*").order("page_key");
  if (error) throw error;
  return data.map(toApp);
}

export async function getSeoPage(pageKey) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seo_pages")
    .select("*")
    .eq("page_key", pageKey)
    .maybeSingle();
  if (error) throw error;
  return toApp(data);
}

export async function updateSeoPage(pageKey, patch) {
  const supabase = await createClient();
  const row = {};
  if (patch.seoTitle !== undefined) row.seo_title = patch.seoTitle;
  if (patch.seoDescription !== undefined) row.seo_description = patch.seoDescription;
  const { data, error } = await supabase
    .from("seo_pages")
    .update(row)
    .eq("page_key", pageKey)
    .select()
    .single();
  if (error) throw error;
  revalidatePath(data.path);
  revalidatePath("/admin/seo");
  return toApp(data);
}
