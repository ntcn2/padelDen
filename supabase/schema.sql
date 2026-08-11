-- Top Padel Alicante — Supabase schema, RLS policies, Storage bucket,
-- admin sessions. Run this once in Supabase Dashboard → SQL Editor. Safe to
-- re-run top to bottom on a fresh project or an already-migrated one.
--
-- Auth model: NOT Supabase Auth. The admin panel checks a single
-- ADMIN_PASSWORD (app env var) and issues its own random session token,
-- stored (hashed) in admin_sessions below. Every admin read of unpublished
-- content and every mutation runs through requireAdmin() first (which
-- verifies that token against this table) and then through the
-- service_role key from trusted server code — so RLS here only needs to
-- handle PUBLIC READ. There are no write policies for the anon/authenticated
-- roles at all: nobody can write via the API with the publishable key, on
-- purpose. service_role bypasses RLS entirely, which is what makes admin
-- writes (and unpublished reads) possible.

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- =========================================================================
-- 1. ADMIN SESSIONS (server-only table, no Supabase Auth)
-- =========================================================================

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.admin_sessions enable row level security;
-- Intentionally zero policies: not even authenticated/anon SELECT. Only
-- service_role (which bypasses RLS) can read or write this table.

-- =========================================================================
-- 2. TABLES
-- =========================================================================

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  date date,
  day_of_week text default '',
  start_time time,
  end_time time,
  location text default '',
  participants_type text check (participants_type in ('players', 'pairs')),
  participants_count integer,
  courts_count integer,
  price numeric(10, 2),
  extra_text text default '',
  registration_url text default '#',
  photo_url text default '',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.training_options (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text not null default '',
  price numeric(10, 2),
  unit text not null default 'тренировка' check (unit in ('час', 'тренировка')),
  note text default '',
  registration_url text default '#',
  sort_order integer not null default 0
);

-- Safe to re-run on a database created before `description` existed.
alter table public.training_options
  add column if not exists description text not null default '';

create table if not exists public.training_packages (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  tiers jsonb not null default '[]'::jsonb, -- [{ sessionsCount, oldPrice, price }]
  validity_note text default '',
  extra_note text default '',
  registration_url text default '#',
  sort_order integer not null default 0
);

create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.gallery_categories(id) on delete cascade,
  storage_path text not null,
  alt text default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references public.news_categories(id) on delete set null,
  title text not null default '',
  excerpt text default '',
  body text[] not null default '{}',
  cover_image_path text default '',
  extra_image_paths text[] not null default '{}',
  published_at date,
  published boolean not null default false,
  seo_title text default '',
  seo_description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_pages (
  page_key text primary key,
  label text not null,
  path text not null,
  seo_title text default '',
  seo_description text default ''
);

-- keep news_posts.updated_at current on every UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists news_posts_set_updated_at on public.news_posts;
create trigger news_posts_set_updated_at
  before update on public.news_posts
  for each row execute function public.set_updated_at();

-- seed the fixed SEO page registry (safe to re-run)
insert into public.seo_pages (page_key, label, path, seo_title, seo_description)
values
  ('home', 'Главная', '/', 'Top Padel Alicante — падел-клуб в Аликанте',
   'Падел объединяет людей и превращает обычную игру в часть твоей жизни. Турниры, тренировки и игровые встречи в Аликанте.'),
  ('journal', 'Padel Journal', '/news', 'Padel Journal — все статьи | Top Padel Alicante',
   'Советы, разборы форматов турниров, снаряжение и истории сообщества Top Padel Alicante.')
on conflict (page_key) do nothing;

-- =========================================================================
-- 3. ROW LEVEL SECURITY — public read only, no client-side writes
-- =========================================================================

alter table public.games enable row level security;
alter table public.training_options enable row level security;
alter table public.training_packages enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.news_categories enable row level security;
alter table public.news_posts enable row level security;
alter table public.seo_pages enable row level security;

-- CREATE POLICY has no IF NOT EXISTS, so drop-then-create is what makes
-- this block safe to re-run.
drop policy if exists "public read published games" on public.games;
create policy "public read published games" on public.games
  for select using (published);

drop policy if exists "public read training options" on public.training_options;
create policy "public read training options" on public.training_options
  for select using (true);

drop policy if exists "public read training packages" on public.training_packages;
create policy "public read training packages" on public.training_packages
  for select using (true);

drop policy if exists "public read gallery categories" on public.gallery_categories;
create policy "public read gallery categories" on public.gallery_categories
  for select using (true);

drop policy if exists "public read gallery photos" on public.gallery_photos;
create policy "public read gallery photos" on public.gallery_photos
  for select using (true);

drop policy if exists "public read news categories" on public.news_categories;
create policy "public read news categories" on public.news_categories
  for select using (true);

drop policy if exists "public read published news" on public.news_posts;
create policy "public read published news" on public.news_posts
  for select using (published);

drop policy if exists "public read seo pages" on public.seo_pages;
create policy "public read seo pages" on public.seo_pages
  for select using (true);

-- No insert/update/delete policies anywhere on purpose: the anon/publishable
-- key can never write. Only service_role — used exclusively by server code
-- that has already called requireAdmin() — can, because it bypasses RLS.
-- The admin panel's own reads of unpublished rows go through the same
-- service_role client, gated the same way, not via a public policy.

-- =========================================================================
-- 4. STORAGE — single public "media" bucket, read-only via the API
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');

-- No write policies here either — uploads/deletes only happen via
-- service_role from Server Actions, after requireAdmin().

-- =========================================================================
-- 5. GRANTS — table-level privileges (RLS alone isn't enough; Postgres
-- still requires the underlying GRANT for the role). Safe to re-run.
-- =========================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon, authenticated;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- so tables created later (if you extend the schema) inherit the same grants
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;
