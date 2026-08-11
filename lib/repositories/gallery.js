"use server";

import { revalidatePath } from "next/cache";
import { readJson, writeJson, makeId } from "./_store";

const FILE = "gallery.json";

function sortByOrder(items) {
  return [...items].sort((a, b) => a.order - b.order);
}

export async function getCategories() {
  const data = await readJson(FILE);
  return sortByOrder(data.categories);
}

export async function getPhotos(categoryId) {
  const data = await readJson(FILE);
  const photos = categoryId
    ? data.photos.filter((p) => p.categoryId === categoryId)
    : data.photos;
  return sortByOrder(photos);
}

export async function getGalleryData() {
  const data = await readJson(FILE);
  return {
    categories: sortByOrder(data.categories),
    photos: sortByOrder(data.photos),
  };
}

export async function createCategory(name) {
  const data = await readJson(FILE);
  const maxOrder = data.categories.reduce((m, c) => Math.max(m, c.order), -1);
  const category = { id: makeId("c"), name, order: maxOrder + 1 };
  data.categories.push(category);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return category;
}

export async function renameCategory(id, name) {
  const data = await readJson(FILE);
  const cat = data.categories.find((c) => c.id === id);
  if (!cat) throw new Error("Category not found");
  cat.name = name;
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return cat;
}

export async function deleteCategory(id) {
  const data = await readJson(FILE);
  data.categories = data.categories.filter((c) => c.id !== id);
  data.photos = data.photos.filter((p) => p.categoryId !== id);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function reorderCategories(orderedIds) {
  const data = await readJson(FILE);
  const byId = new Map(data.categories.map((c) => [c.id, c]));
  orderedIds.forEach((id, index) => {
    if (byId.has(id)) byId.get(id).order = index;
  });
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function addPhotos(categoryId, photos) {
  const data = await readJson(FILE);
  const maxOrder = data.photos.reduce((m, p) => Math.max(m, p.order), -1);
  const created = photos.map((p, i) => ({
    id: makeId("ph"),
    src: p.src,
    alt: p.alt || "",
    categoryId,
    order: maxOrder + 1 + i,
  }));
  data.photos.push(...created);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return created;
}

export async function updatePhoto(id, patch) {
  const data = await readJson(FILE);
  const photo = data.photos.find((p) => p.id === id);
  if (!photo) throw new Error("Photo not found");
  Object.assign(photo, patch);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return photo;
}

export async function deletePhoto(id) {
  const data = await readJson(FILE);
  data.photos = data.photos.filter((p) => p.id !== id);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function reorderPhotos(categoryId, orderedIds) {
  const data = await readJson(FILE);
  const byId = new Map(data.photos.map((p) => [p.id, p]));
  orderedIds.forEach((id, index) => {
    if (byId.has(id)) byId.get(id).order = index;
  });
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function movePhotoToCategory(id, categoryId) {
  const data = await readJson(FILE);
  const photo = data.photos.find((p) => p.id === id);
  if (!photo) throw new Error("Photo not found");
  photo.categoryId = categoryId;
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return photo;
}
