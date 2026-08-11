// One-time script: migrates data/*.json (the old mock store) into Supabase,
// uploading every image (external picsum URLs and base64 data: URLs alike)
// into the `media` Storage bucket.
//
// Run with:
//   node --env-file=.env.local scripts/migrate-to-supabase.mjs
//
// Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local.
// Uses service_role (bypasses RLS) — this is the one sanctioned use of it
// outside the running app.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "media";
const DATA_DIR = path.join(process.cwd(), "data");

async function readJson(file) {
  return JSON.parse(await readFile(path.join(DATA_DIR, file), "utf-8"));
}

/** Safe-to-rerun guard: skip a table's migration if it already has rows —
 * avoids duplicating data on a second run after a partial failure. */
async function tableIsEmpty(table) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) {
    console.error(`  ! could not check ${table}: ${error.message}`);
    return false; // fail safe: don't insert if we can't tell
  }
  return (count ?? 0) === 0;
}

/** Fetches an http(s) URL or decodes a data: URL, uploads it, returns the storage path. */
async function migrateImage(srcOrDataUrl, storageFolder, filenameHint = "image") {
  if (!srcOrDataUrl) return "";

  let bytes;
  let contentType = "image/jpeg";
  let ext = "jpg";

  if (srcOrDataUrl.startsWith("data:")) {
    const match = srcOrDataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!match) return "";
    contentType = match[1];
    ext = contentType.split("/")[1] || "jpg";
    bytes = Buffer.from(match[2], "base64");
  } else {
    const res = await fetch(srcOrDataUrl);
    if (!res.ok) {
      console.warn(`  ! could not fetch ${srcOrDataUrl} (${res.status}), skipping`);
      return "";
    }
    contentType = res.headers.get("content-type") || "image/jpeg";
    ext = contentType.split("/")[1] || "jpg";
    bytes = Buffer.from(await res.arrayBuffer());
  }

  const storagePath = `${storageFolder}/${crypto.randomUUID()}-${filenameHint}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType, upsert: false });
  if (error) {
    console.warn(`  ! upload failed for ${storagePath}: ${error.message}`);
    return "";
  }
  return storagePath;
}

async function migrateGames() {
  console.log("Games…");
  if (!(await tableIsEmpty("games"))) {
    console.log("  → games already has rows, skipping (avoids duplicates).");
    return;
  }
  const games = await readJson("games.json");
  for (const g of games) {
    const [startTime, endTime] = (g.time || "").split(/[–-]/).map((s) => s.trim());
    const photoPath = g.photo; // games keep an external URL field, not Storage
    const { error } = await supabase.from("games").insert({
      title: g.title,
      date: g.date || null,
      day_of_week: g.dayOfWeek || "",
      start_time: startTime || null,
      end_time: endTime || null,
      location: g.location || "",
      participants_type: g.participantsType || null,
      participants_count: g.participantsCount ?? null,
      courts_count: g.courtsCount ?? null,
      price: g.price ? Number(String(g.price).replace(/[^\d.]/g, "")) : null,
      extra_text: g.extraText || "",
      registration_url: g.registrationUrl || "#",
      photo_url: photoPath || "",
      published: g.published ?? true,
      sort_order: g.order ?? 0,
    });
    if (error) console.error(`  ! game "${g.title}": ${error.message}`);
    else console.log(`  ✓ ${g.title}`);
  }
}

async function migrateTrainings() {
  console.log("Trainings…");
  const data = await readJson("trainings.json");

  if (!(await tableIsEmpty("training_options"))) {
    console.log("  → training_options already has rows, skipping options.");
  } else {
    for (const o of data.options) {
      const { error } = await supabase.from("training_options").insert({
        title: o.title,
        description: o.description || "",
        price: o.price ? Number(String(o.price).replace(/[^\d.]/g, "")) : null,
        unit: o.unit,
        note: o.note || "",
        registration_url: o.registrationUrl || "#",
        sort_order: o.order ?? 0,
      });
      if (error) console.error(`  ! option "${o.title}": ${error.message}`);
      else console.log(`  ✓ ${o.title}`);
    }
  }

  if (!(await tableIsEmpty("training_packages"))) {
    console.log("  → training_packages already has rows, skipping packages.");
  } else {
    for (const p of data.packages) {
      const { error } = await supabase.from("training_packages").insert({
        title: p.title,
        tiers: p.tiers.map((t) => ({
          sessionsCount: t.sessionsCount,
          oldPrice: t.oldPrice ? Number(String(t.oldPrice).replace(/[^\d.]/g, "")) : null,
          price: t.price ? Number(String(t.price).replace(/[^\d.]/g, "")) : null,
        })),
        validity_note: p.validityNote || "",
        extra_note: p.extraNote || "",
        registration_url: p.registrationUrl || "#",
        sort_order: p.order ?? 0,
      });
      if (error) console.error(`  ! package "${p.title}": ${error.message}`);
      else console.log(`  ✓ ${p.title}`);
    }
  }
}

async function migrateGallery() {
  console.log("Gallery…");
  if (!(await tableIsEmpty("gallery_categories"))) {
    console.log("  → gallery_categories already has rows, skipping gallery entirely.");
    return;
  }
  const data = await readJson("gallery.json");
  const categoryIdMap = new Map();
  for (const c of data.categories) {
    const { data: row, error } = await supabase
      .from("gallery_categories")
      .insert({ name: c.name, sort_order: c.order ?? 0 })
      .select()
      .single();
    if (error) {
      console.error(`  ! category "${c.name}": ${error.message}`);
      continue;
    }
    categoryIdMap.set(c.id, row.id);
    console.log(`  ✓ category ${c.name}`);
  }
  for (const p of data.photos) {
    const newCategoryId = categoryIdMap.get(p.categoryId);
    if (!newCategoryId) continue;
    const storagePath = await migrateImage(p.src, `gallery/${newCategoryId}`, "photo");
    if (!storagePath) continue;
    const { error } = await supabase.from("gallery_photos").insert({
      category_id: newCategoryId,
      storage_path: storagePath,
      alt: p.alt || "",
      sort_order: p.order ?? 0,
    });
    if (error) console.error(`  ! photo ${p.id}: ${error.message}`);
    else console.log(`  ✓ photo ${p.id}`);
  }
}

async function migrateNews() {
  console.log("News…");
  if (!(await tableIsEmpty("news_categories"))) {
    console.log("  → news_categories already has rows, skipping news entirely.");
    return;
  }
  const data = await readJson("news.json");
  const categoryIdMap = new Map();
  for (const c of data.categories) {
    const { data: row, error } = await supabase
      .from("news_categories")
      .insert({ name: c.name, sort_order: c.order ?? 0 })
      .select()
      .single();
    if (error) {
      console.error(`  ! category "${c.name}": ${error.message}`);
      continue;
    }
    categoryIdMap.set(c.id, row.id);
    console.log(`  ✓ category ${c.name}`);
  }
  for (const post of data.posts) {
    const folderId = crypto.randomUUID();
    const coverPath = await migrateImage(post.coverImage, `news/${folderId}`, "cover");
    const extraPaths = [];
    for (const img of post.extraImages || []) {
      const p = await migrateImage(img, `news/${folderId}`, "extra");
      if (p) extraPaths.push(p);
    }
    const { error } = await supabase.from("news_posts").insert({
      slug: post.slug,
      category_id: categoryIdMap.get(post.categoryId) || null,
      title: post.title,
      excerpt: post.excerpt || "",
      body: post.body || [],
      cover_image_path: coverPath,
      extra_image_paths: extraPaths,
      published_at: post.publishedAt || null,
      published: post.published ?? false,
      seo_title: post.seoTitle || post.title,
      seo_description: post.seoDescription || post.excerpt || "",
    });
    if (error) console.error(`  ! post "${post.title}": ${error.message}`);
    else console.log(`  ✓ ${post.title}`);
  }
}

async function migrateSeo() {
  console.log("SEO pages…");
  const pages = await readJson("seo.json");
  for (const p of pages) {
    const { error } = await supabase
      .from("seo_pages")
      .update({ seo_title: p.seoTitle, seo_description: p.seoDescription })
      .eq("page_key", p.pageKey);
    if (error) console.error(`  ! seo "${p.pageKey}": ${error.message}`);
    else console.log(`  ✓ ${p.pageKey}`);
  }
}

console.log("Migrating mock data into Supabase…\n");
await migrateGames();
await migrateTrainings();
await migrateGallery();
await migrateNews();
await migrateSeo();
console.log("\nDone. Check the Supabase table editor to confirm everything looks right.");
