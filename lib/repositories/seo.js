"use server";

import { revalidatePath } from "next/cache";
import { readJson, writeJson } from "./_store";

const FILE = "seo.json";

export async function getSeoPages() {
  return readJson(FILE);
}

export async function getSeoPage(pageKey) {
  const pages = await readJson(FILE);
  return pages.find((p) => p.pageKey === pageKey) || null;
}

export async function updateSeoPage(pageKey, patch) {
  const pages = await readJson(FILE);
  const index = pages.findIndex((p) => p.pageKey === pageKey);
  if (index === -1) throw new Error("Page not found");
  pages[index] = { ...pages[index], ...patch };
  await writeJson(FILE, pages);
  revalidatePath(pages[index].path);
  revalidatePath("/admin/seo");
  return pages[index];
}
