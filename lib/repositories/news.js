"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStaticClient } from "@/lib/supabase/client";

const BUCKET = "media";

function slugify(text) {
  const map = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return text
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function publicUrl(supabase, path) {
  if (!path) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function categoryToApp(row) {
  return { id: row.id, name: row.name, order: row.sort_order };
}

function postToApp(row, supabase) {
  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    title: row.title || "",
    excerpt: row.excerpt || "",
    body: row.body || [],
    coverImage: publicUrl(supabase, row.cover_image_path),
    coverImagePath: row.cover_image_path || "",
    extraImages: (row.extra_image_paths || []).map((p) => publicUrl(supabase, p)),
    extraImagePaths: row.extra_image_paths || [],
    publishedAt: row.published_at || "",
    published: row.published,
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
  };
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data.map(categoryToApp);
}

export async function getAllPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => postToApp(row, supabase));
}

// Build-time only (generateStaticParams runs without a request, so it can't
// use the cookie-bound server client). Cookie-free, anon-key reads only.
export async function getPublishedSlugs() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select("slug")
    .eq("published", true);
  if (error) throw error;
  return data.map((row) => row.slug);
}

export async function getPublishedPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => postToApp(row, supabase));
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPost(idOrSlug) {
  const supabase = await createClient();
  const column = UUID_RE.test(idOrSlug) ? "id" : "slug";
  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq(column, idOrSlug)
    .maybeSingle();
  if (error) throw error;
  return postToApp(data, supabase);
}

async function uniqueSlug(supabase, base, excludeId) {
  let slug = slugify(base) || "post";
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from("news_posts").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    slug = `${slugify(base)}-${i}`;
    i += 1;
  }
}

async function uploadImage(supabase, postFolderId, file) {
  const path = `news/${postFolderId}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

/**
 * `formData` fields: title, slug, categoryId, excerpt, body (newline-separated
 * paragraphs), publishedAt, published ("on"|""), seoTitle, seoDescription,
 * coverImage (File, optional), extraImages (File[], optional — appended).
 */
export async function createPost(formData) {
  const supabase = await createClient();
  const title = formData.get("title") || "";
  const slug = await uniqueSlug(supabase, formData.get("slug") || title);
  const folderId = crypto.randomUUID();

  const coverFile = formData.get("coverImage");
  const coverPath =
    coverFile instanceof File && coverFile.size > 0
      ? await uploadImage(supabase, folderId, coverFile)
      : "";

  const extraFiles = formData.getAll("extraImages").filter((f) => f instanceof File && f.size > 0);
  const extraPaths = [];
  for (const file of extraFiles) {
    extraPaths.push(await uploadImage(supabase, folderId, file));
  }

  const body = String(formData.get("body") || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from("news_posts")
    .insert({
      slug,
      category_id: formData.get("categoryId") || null,
      title,
      excerpt: formData.get("excerpt") || "",
      body,
      cover_image_path: coverPath,
      extra_image_paths: extraPaths,
      published_at: formData.get("publishedAt") || null,
      published: formData.get("published") === "on",
      seo_title: formData.get("seoTitle") || title,
      seo_description: formData.get("seoDescription") || formData.get("excerpt") || "",
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
  return postToApp(data, supabase);
}

/**
 * Additional formData fields for update: keepExtraImagePaths (JSON array of
 * existing paths to retain — any previously-stored path missing from this
 * list is deleted from Storage).
 */
export async function updatePost(id, formData) {
  const supabase = await createClient();
  const { data: current, error: fetchError } = await supabase
    .from("news_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const title = formData.get("title") || current.title;
  const rawSlug = formData.get("slug") || "";
  const slug =
    rawSlug && rawSlug !== current.slug
      ? await uniqueSlug(supabase, rawSlug, id)
      : current.slug;

  const folderId = current.cover_image_path?.split("/")[1] || crypto.randomUUID();

  const coverFile = formData.get("coverImage");
  let coverPath = current.cover_image_path;
  if (coverFile instanceof File && coverFile.size > 0) {
    if (current.cover_image_path) {
      await supabase.storage.from(BUCKET).remove([current.cover_image_path]);
    }
    coverPath = await uploadImage(supabase, folderId, coverFile);
  } else if (formData.get("coverImageRemove") === "1") {
    if (current.cover_image_path) {
      await supabase.storage.from(BUCKET).remove([current.cover_image_path]);
    }
    coverPath = "";
  }

  const keepPaths = JSON.parse(formData.get("keepExtraImagePaths") || "[]");
  const removedPaths = (current.extra_image_paths || []).filter((p) => !keepPaths.includes(p));
  if (removedPaths.length) {
    await supabase.storage.from(BUCKET).remove(removedPaths);
  }
  const newFiles = formData.getAll("extraImages").filter((f) => f instanceof File && f.size > 0);
  const newPaths = [];
  for (const file of newFiles) {
    newPaths.push(await uploadImage(supabase, folderId, file));
  }
  const extraPaths = [...keepPaths, ...newPaths];

  const body = String(formData.get("body") || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from("news_posts")
    .update({
      slug,
      category_id: formData.get("categoryId") || current.category_id,
      title,
      excerpt: formData.get("excerpt") ?? current.excerpt,
      body,
      cover_image_path: coverPath,
      extra_image_paths: extraPaths,
      published_at: formData.get("publishedAt") || current.published_at,
      published: formData.get("published") === "on",
      seo_title: formData.get("seoTitle") || title,
      seo_description: formData.get("seoDescription") ?? current.seo_description,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${current.slug}`);
  revalidatePath(`/news/${slug}`);
  revalidatePath("/admin/journal");
  return postToApp(data, supabase);
}

export async function deletePost(id) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("news_posts")
    .select("cover_image_path, extra_image_paths")
    .eq("id", id)
    .maybeSingle();
  const paths = [post?.cover_image_path, ...(post?.extra_image_paths || [])].filter(Boolean);
  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
  const { error } = await supabase.from("news_posts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
}

export async function togglePublish(id) {
  const supabase = await createClient();
  const { data: current, error: fetchError } = await supabase
    .from("news_posts")
    .select("published")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;
  const { data, error } = await supabase
    .from("news_posts")
    .update({ published: !current.published })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
  return postToApp(data, supabase);
}

export async function createCategory(name) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("news_categories")
    .select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("news_categories")
    .insert({ name, sort_order: count ?? 0 })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
  return categoryToApp(data);
}

export async function renameCategory(id, name) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_categories")
    .update({ name })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
  return categoryToApp(data);
}

export async function deleteCategory(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("news_categories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
}

export async function reorderCategories(orderedIds) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("news_categories").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
}
