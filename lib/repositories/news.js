"use server";

import { revalidatePath } from "next/cache";
import { readJson, writeJson, makeId, slugify } from "./_store";

const FILE = "news.json";

function sortByOrder(items) {
  return [...items].sort((a, b) => a.order - b.order);
}

function sortByDateDesc(items) {
  return [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getCategories() {
  const data = await readJson(FILE);
  return sortByOrder(data.categories);
}

export async function getAllPosts() {
  const data = await readJson(FILE);
  return sortByDateDesc(data.posts);
}

export async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((p) => p.published);
}

export async function getPost(idOrSlug) {
  const data = await readJson(FILE);
  return (
    data.posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null
  );
}

async function uniqueSlug(data, base, excludeId) {
  let slug = slugify(base) || "post";
  let i = 2;
  while (data.posts.some((p) => p.slug === slug && p.id !== excludeId)) {
    slug = `${slugify(base)}-${i}`;
    i += 1;
  }
  return slug;
}

export async function createPost(input) {
  const data = await readJson(FILE);
  const slug = await uniqueSlug(data, input.slug || input.title);
  const post = {
    id: makeId("n"),
    slug,
    categoryId: input.categoryId || data.categories[0]?.id || "",
    title: input.title || "",
    excerpt: input.excerpt || "",
    body: input.body || [],
    coverImage: input.coverImage || "",
    extraImages: input.extraImages || [],
    publishedAt: input.publishedAt || new Date().toISOString().slice(0, 10),
    published: input.published ?? false,
    seoTitle: input.seoTitle || input.title || "",
    seoDescription: input.seoDescription || input.excerpt || "",
  };
  data.posts.push(post);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
  return post;
}

export async function updatePost(id, input) {
  const data = await readJson(FILE);
  const index = data.posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Post not found");
  const current = data.posts[index];
  const slug =
    input.slug && input.slug !== current.slug
      ? await uniqueSlug(data, input.slug, id)
      : current.slug;
  data.posts[index] = { ...current, ...input, slug };
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${current.slug}`);
  revalidatePath(`/news/${slug}`);
  revalidatePath("/admin/journal");
  return data.posts[index];
}

export async function deletePost(id) {
  const data = await readJson(FILE);
  data.posts = data.posts.filter((p) => p.id !== id);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
}

export async function togglePublish(id) {
  const data = await readJson(FILE);
  const post = data.posts.find((p) => p.id === id);
  if (!post) throw new Error("Post not found");
  post.published = !post.published;
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
  return post;
}

export async function createCategory(name) {
  const data = await readJson(FILE);
  const maxOrder = data.categories.reduce((m, c) => Math.max(m, c.order), -1);
  const category = { id: makeId("c"), name, order: maxOrder + 1 };
  data.categories.push(category);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
  return category;
}

export async function renameCategory(id, name) {
  const data = await readJson(FILE);
  const cat = data.categories.find((c) => c.id === id);
  if (!cat) throw new Error("Category not found");
  cat.name = name;
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
  return cat;
}

export async function deleteCategory(id) {
  const data = await readJson(FILE);
  data.categories = data.categories.filter((c) => c.id !== id);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
}

export async function reorderCategories(orderedIds) {
  const data = await readJson(FILE);
  const byId = new Map(data.categories.map((c) => [c.id, c]));
  orderedIds.forEach((id, index) => {
    if (byId.has(id)) byId.get(id).order = index;
  });
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/journal");
}
