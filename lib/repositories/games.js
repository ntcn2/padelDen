"use server";

import { revalidatePath } from "next/cache";
import { readJson, writeJson, makeId } from "./_store";

const FILE = "games.json";

function sortByOrder(items) {
  return [...items].sort((a, b) => a.order - b.order);
}

function parseGameDateTime(game) {
  const startTime = (game.time || "").split(/[–-]/)[0].trim() || "00:00";
  return new Date(`${game.date}T${startTime}:00`);
}

export async function getAllGames() {
  const games = await readJson(FILE);
  return sortByOrder(games);
}

export async function getPublishedGames() {
  const games = await getAllGames();
  return games.filter((g) => g.published);
}

export async function getGame(id) {
  const games = await readJson(FILE);
  return games.find((g) => g.id === id) || null;
}

export async function getNextUpcomingGame() {
  const games = await getPublishedGames();
  const now = new Date();
  const upcoming = games
    .filter((g) => parseGameDateTime(g).getTime() >= now.getTime())
    .sort((a, b) => parseGameDateTime(a) - parseGameDateTime(b));
  return upcoming[0] || null;
}

export async function createGame(data) {
  const games = await readJson(FILE);
  const maxOrder = games.reduce((max, g) => Math.max(max, g.order), -1);
  const game = {
    id: makeId("g"),
    title: data.title || "",
    date: data.date || "",
    dayOfWeek: data.dayOfWeek || "",
    time: data.time || "",
    location: data.location || "",
    participantsType: data.participantsType || null,
    participantsCount: data.participantsCount ? Number(data.participantsCount) : null,
    courtsCount: data.courtsCount ? Number(data.courtsCount) : null,
    price: data.price || "",
    extraText: data.extraText || "",
    registrationUrl: data.registrationUrl || "#",
    photo: data.photo || "",
    published: data.published ?? true,
    order: maxOrder + 1,
  };
  games.push(game);
  await writeJson(FILE, games);
  revalidatePath("/");
  revalidatePath("/admin/games");
  return game;
}

export async function updateGame(id, data) {
  const games = await readJson(FILE);
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) throw new Error("Game not found");
  games[index] = {
    ...games[index],
    ...data,
    participantsCount:
      data.participantsCount !== undefined
        ? data.participantsCount
          ? Number(data.participantsCount)
          : null
        : games[index].participantsCount,
    courtsCount:
      data.courtsCount !== undefined
        ? data.courtsCount
          ? Number(data.courtsCount)
          : null
        : games[index].courtsCount,
  };
  await writeJson(FILE, games);
  revalidatePath("/");
  revalidatePath("/admin/games");
  return games[index];
}

export async function deleteGame(id) {
  const games = await readJson(FILE);
  const next = games.filter((g) => g.id !== id);
  await writeJson(FILE, next);
  revalidatePath("/");
  revalidatePath("/admin/games");
}

export async function reorderGames(orderedIds) {
  const games = await readJson(FILE);
  const byId = new Map(games.map((g) => [g.id, g]));
  orderedIds.forEach((id, index) => {
    if (byId.has(id)) byId.get(id).order = index;
  });
  await writeJson(FILE, [...byId.values()]);
  revalidatePath("/");
  revalidatePath("/admin/games");
}
