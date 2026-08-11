"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "media";

function categoryToApp(row) {
  return { id: row.id, name: row.name, order: row.sort_order };
}

function photoToApp(row, supabase) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path);
  return {
    id: row.id,
    src: data.publicUrl,
    alt: row.alt || "",
    categoryId: row.category_id,
    order: row.sort_order,
  };
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data.map(categoryToApp);
}

export async function getPhotos(categoryId) {
  const supabase = await createClient();
  let query = supabase.from("gallery_photos").select("*").order("sort_order", { ascending: true });
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((row) => photoToApp(row, supabase));
}

export async function getGalleryData() {
  const supabase = await createClient();
  const [{ data: cats, error: catErr }, { data: photos, error: photoErr }] = await Promise.all([
    supabase.from("gallery_categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("gallery_photos").select("*").order("sort_order", { ascending: true }),
  ]);
  if (catErr) throw catErr;
  if (photoErr) throw photoErr;
  return {
    categories: cats.map(categoryToApp),
    photos: photos.map((row) => photoToApp(row, supabase)),
  };
}

export async function createCategory(name) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("gallery_categories")
    .select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("gallery_categories")
    .insert({ name, sort_order: count ?? 0 })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return categoryToApp(data);
}

export async function renameCategory(id, name) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_categories")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return categoryToApp(data);
}

export async function deleteCategory(id) {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("storage_path")
    .eq("category_id", id);
  if (photos?.length) {
    await supabase.storage.from(BUCKET).remove(photos.map((p) => p.storage_path));
  }
  const { error } = await supabase.from("gallery_categories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function reorderCategories(orderedIds) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("gallery_categories").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

/**
 * `formData` must contain a `categoryId` field and one or more `files`
 * entries (File objects) — Server Actions can receive real File uploads via
 * FormData directly, no client-side base64 conversion needed.
 */
export async function addPhotos(formData) {
  const supabase = await createClient();
  const categoryId = formData.get("categoryId");
  const files = formData.getAll("files").filter((f) => f instanceof File && f.size > 0);
  if (!categoryId || files.length === 0) return [];

  const { count } = await supabase
    .from("gallery_photos")
    .select("id", { count: "exact", head: true });

  const rows = [];
  let i = 0;
  for (const file of files) {
    const path = `gallery/${categoryId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    rows.push({
      category_id: categoryId,
      storage_path: path,
      alt: file.name.replace(/\.[^.]+$/, ""),
      sort_order: (count ?? 0) + i,
    });
    i += 1;
  }

  const { data, error } = await supabase.from("gallery_photos").insert(rows).select();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return data.map((row) => photoToApp(row, supabase));
}

export async function updatePhoto(id, patch) {
  const supabase = await createClient();
  const row = {};
  if (patch.alt !== undefined) row.alt = patch.alt;
  const { data, error } = await supabase
    .from("gallery_photos")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return photoToApp(data, supabase);
}

export async function deletePhoto(id) {
  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("gallery_photos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (photo?.storage_path) {
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
  }
  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function reorderPhotos(categoryId, orderedIds) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("gallery_photos").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function movePhotoToCategory(id, categoryId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_photos")
    .update({ category_id: categoryId })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return photoToApp(data, supabase);
}
