"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const BUCKET = "media";

function publicUrl(supabase, path) {
  if (!path) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// photo_url stores a full public URL rather than a bare storage path (unlike
// news/gallery), so replacing/removing a photo needs to recover the path by
// stripping our own bucket's public-URL prefix — URLs that don't match it
// (old hand-pasted external links) are simply left alone, not deleted.
function storagePathFromUrl(supabase, url) {
  const prefix = publicUrl(supabase, "");
  return url && url.startsWith(prefix) ? url.slice(prefix.length) : "";
}

async function uploadGamePhoto(supabase, gameId, file) {
  const path = `games/${gameId}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return publicUrl(supabase, path);
}

function readFields(formData) {
  return {
    title: formData.get("title") || "",
    date: formData.get("date") || "",
    dayOfWeek: formData.get("dayOfWeek") || "",
    startTime: formData.get("startTime") || "",
    endTime: formData.get("endTime") || "",
    location: formData.get("location") || "",
    participantsType: formData.get("participantsType") || "",
    participantsCount: formData.get("participantsCount") || "",
    courtsCount: formData.get("courtsCount") || "",
    price: formData.get("price") || "",
    extraText: formData.get("extraText") || "",
    registrationUrl: formData.get("registrationUrl") || "",
    published: formData.get("published") === "on",
  };
}

function toApp(row) {
  if (!row) return null;
  const start = row.start_time ? row.start_time.slice(0, 5) : "";
  const end = row.end_time ? row.end_time.slice(0, 5) : "";
  return {
    id: row.id,
    title: row.title || "",
    date: row.date || "",
    dayOfWeek: row.day_of_week || "",
    startTime: start,
    endTime: end,
    time: [start, end].filter(Boolean).join("–"),
    location: row.location || "",
    participantsType: row.participants_type,
    participantsCount: row.participants_count,
    courtsCount: row.courts_count,
    price: row.price === null ? null : Number(row.price),
    extraText: row.extra_text || "",
    registrationUrl: row.registration_url || "#",
    photo: row.photo_url || "",
    published: row.published,
    order: row.sort_order,
  };
}

function toRow(data) {
  const row = {};
  if (data.title !== undefined) row.title = data.title;
  if (data.date !== undefined) row.date = data.date || null;
  if (data.dayOfWeek !== undefined) row.day_of_week = data.dayOfWeek;
  if (data.startTime !== undefined) row.start_time = data.startTime || null;
  if (data.endTime !== undefined) row.end_time = data.endTime || null;
  if (data.location !== undefined) row.location = data.location;
  if (data.participantsType !== undefined)
    row.participants_type = data.participantsType || null;
  if (data.participantsCount !== undefined)
    row.participants_count = data.participantsCount ? Number(data.participantsCount) : null;
  if (data.courtsCount !== undefined)
    row.courts_count = data.courtsCount ? Number(data.courtsCount) : null;
  if (data.price !== undefined)
    row.price = data.price === "" || data.price === null ? null : Number(data.price);
  if (data.extraText !== undefined) row.extra_text = data.extraText;
  if (data.registrationUrl !== undefined) row.registration_url = data.registrationUrl;
  if (data.photo !== undefined) row.photo_url = data.photo;
  if (data.published !== undefined) row.published = data.published;
  return row;
}

function parseGameDateTime(game) {
  return new Date(`${game.date}T${game.startTime || "00:00"}:00`);
}

// Public — anon key, RLS restricts to published rows.
export async function getPublishedGames() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data.map(toApp);
}

export async function getNextUpcomingGame() {
  const games = await getPublishedGames();
  const now = new Date();
  const upcoming = games
    .filter((g) => g.date && parseGameDateTime(g).getTime() >= now.getTime())
    .sort((a, b) => parseGameDateTime(a) - parseGameDateTime(b));
  return upcoming[0] || null;
}

// Admin-only — service role, sees unpublished rows too.
export async function getAllGames() {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data.map(toApp);
}

export async function getGame(id) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("games").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return toApp(data);
}

/**
 * `formData` fields: see readFields() above, plus photo (File, optional)
 * and photoRemove ("1", optional — only meaningful on update).
 */
export async function createGame(formData) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { count } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true });

  const gameId = crypto.randomUUID();
  const photoFile = formData.get("photo");
  const photoUrl =
    photoFile instanceof File && photoFile.size > 0
      ? await uploadGamePhoto(supabase, gameId, photoFile)
      : "";

  const { data: row, error } = await supabase
    .from("games")
    .insert({
      id: gameId,
      ...toRow({ ...readFields(formData), photo: photoUrl }),
      sort_order: count ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/games");
  return toApp(row);
}

export async function updateGame(id, formData) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data: current, error: fetchError } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const photoFile = formData.get("photo");
  let photoUrl = current.photo_url || "";
  if (photoFile instanceof File && photoFile.size > 0) {
    const oldPath = storagePathFromUrl(supabase, current.photo_url);
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    photoUrl = await uploadGamePhoto(supabase, id, photoFile);
  } else if (formData.get("photoRemove") === "1") {
    const oldPath = storagePathFromUrl(supabase, current.photo_url);
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    photoUrl = "";
  }

  const { data: row, error } = await supabase
    .from("games")
    .update(toRow({ ...readFields(formData), photo: photoUrl }))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/games");
  return toApp(row);
}

export async function deleteGame(id) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  const { data: game } = await supabase
    .from("games")
    .select("photo_url")
    .eq("id", id)
    .maybeSingle();
  const oldPath = storagePathFromUrl(supabase, game?.photo_url);
  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/games");
}

export async function reorderGames(orderedIds) {
  await requireAdmin();
  const supabase = createServiceRoleClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("games").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/games");
}
