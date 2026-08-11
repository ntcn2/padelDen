"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function optionToApp(row) {
  return {
    id: row.id,
    title: row.title || "",
    description: row.description || "",
    price: row.price === null ? null : Number(row.price),
    unit: row.unit || "тренировка",
    note: row.note || "",
    registrationUrl: row.registration_url || "#",
    order: row.sort_order,
  };
}

function optionToRow(data) {
  const row = {};
  if (data.title !== undefined) row.title = data.title;
  if (data.description !== undefined) row.description = data.description;
  if (data.price !== undefined)
    row.price = data.price === "" || data.price === null ? null : Number(data.price);
  if (data.unit !== undefined) row.unit = data.unit;
  if (data.note !== undefined) row.note = data.note;
  if (data.registrationUrl !== undefined) row.registration_url = data.registrationUrl;
  return row;
}

function packageToApp(row) {
  return {
    id: row.id,
    title: row.title || "",
    tiers: (row.tiers || []).map((t) => ({
      sessionsCount: t.sessionsCount ?? t.sessions_count ?? "",
      oldPrice: t.oldPrice ?? t.old_price ?? "",
      price: t.price ?? "",
    })),
    validityNote: row.validity_note || "",
    extraNote: row.extra_note || "",
    registrationUrl: row.registration_url || "#",
    order: row.sort_order,
  };
}

function packageToRow(data) {
  const row = {};
  if (data.title !== undefined) row.title = data.title;
  if (data.tiers !== undefined) row.tiers = data.tiers;
  if (data.validityNote !== undefined) row.validity_note = data.validityNote;
  if (data.extraNote !== undefined) row.extra_note = data.extraNote;
  if (data.registrationUrl !== undefined) row.registration_url = data.registrationUrl;
  return row;
}

export async function getTrainingOptions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_options")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data.map(optionToApp);
}

export async function getTrainingPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_packages")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data.map(packageToApp);
}

export async function updateTrainingOption(id, patch) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_options")
    .update(optionToRow(patch))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  return optionToApp(data);
}

export async function createTrainingOption(patch) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("training_options")
    .select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("training_options")
    .insert({ ...optionToRow(patch), sort_order: count ?? 0 })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  return optionToApp(data);
}

export async function deleteTrainingOption(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("training_options").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/pricing");
}

export async function updateTrainingPackage(id, patch) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_packages")
    .update(packageToRow(patch))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  return packageToApp(data);
}

export async function createTrainingPackage(patch) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("training_packages")
    .select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("training_packages")
    .insert({
      ...packageToRow(patch),
      tiers: patch.tiers || [{ sessionsCount: 4, oldPrice: "", price: "" }],
      sort_order: count ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  return packageToApp(data);
}

export async function deleteTrainingPackage(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("training_packages").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/pricing");
}
