"use server";

import { revalidatePath } from "next/cache";
import { readJson, writeJson, makeId } from "./_store";

const FILE = "trainings.json";

function sortByOrder(items) {
  return [...items].sort((a, b) => a.order - b.order);
}

export async function getTrainingOptions() {
  const data = await readJson(FILE);
  return sortByOrder(data.options);
}

export async function getTrainingPackages() {
  const data = await readJson(FILE);
  return sortByOrder(data.packages);
}

export async function updateTrainingOption(id, patch) {
  const data = await readJson(FILE);
  const index = data.options.findIndex((o) => o.id === id);
  if (index === -1) throw new Error("Option not found");
  data.options[index] = { ...data.options[index], ...patch };
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  return data.options[index];
}

export async function createTrainingOption(patch) {
  const data = await readJson(FILE);
  const maxOrder = data.options.reduce((m, o) => Math.max(m, o.order), -1);
  const option = {
    id: makeId("t"),
    title: patch.title || "",
    price: patch.price || "",
    unit: patch.unit || "тренировка",
    note: patch.note || "",
    registrationUrl: patch.registrationUrl || "#",
    order: maxOrder + 1,
  };
  data.options.push(option);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  return option;
}

export async function deleteTrainingOption(id) {
  const data = await readJson(FILE);
  data.options = data.options.filter((o) => o.id !== id);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/pricing");
}

export async function updateTrainingPackage(id, patch) {
  const data = await readJson(FILE);
  const index = data.packages.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Package not found");
  data.packages[index] = { ...data.packages[index], ...patch };
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  return data.packages[index];
}

export async function createTrainingPackage(patch) {
  const data = await readJson(FILE);
  const maxOrder = data.packages.reduce((m, p) => Math.max(m, p.order), -1);
  const pkg = {
    id: makeId("p"),
    title: patch.title || "",
    tiers: patch.tiers || [{ sessionsCount: 4, oldPrice: "", price: "" }],
    validityNote: patch.validityNote || "",
    extraNote: patch.extraNote || "",
    registrationUrl: patch.registrationUrl || "#",
    order: maxOrder + 1,
  };
  data.packages.push(pkg);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/pricing");
  return pkg;
}

export async function deleteTrainingPackage(id) {
  const data = await readJson(FILE);
  data.packages = data.packages.filter((p) => p.id !== id);
  await writeJson(FILE, data);
  revalidatePath("/");
  revalidatePath("/admin/pricing");
}
