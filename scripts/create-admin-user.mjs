// One-time script: creates the single Supabase Auth admin user and adds
// them to the `admins` allow-list table so RLS lets them write data.
//
// Run with Node's built-in env-file loader (Node 20.6+, no extra deps):
//
//   node --env-file=.env.local scripts/create-admin-user.mjs
//
// Needs in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// ADMIN_EMAIL. Prompts for the password interactively (never pass it as a
// CLI arg — that ends up in your shell history).

import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;

if (!url || !serviceKey || !email) {
  console.error(
    "Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL in .env.local."
  );
  process.exit(1);
}

const rl = readline.createInterface({ input: stdin, output: stdout });
const password = await rl.question(`Пароль для админа (${email}): `);
rl.close();

if (!password || password.length < 8) {
  console.error("Пароль должен быть не короче 8 символов.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

let userId = created?.user?.id;

if (createError) {
  if (createError.message?.includes("already been registered")) {
    console.log("Пользователь уже существует, ищу его id…");
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("Не смог получить список пользователей:", listError.message);
      process.exit(1);
    }
    const existing = list.users.find((u) => u.email === email);
    if (!existing) {
      console.error("Пользователь с таким email не найден.");
      process.exit(1);
    }
    userId = existing.id;
  } else {
    console.error("Ошибка создания пользователя:", createError.message);
    process.exit(1);
  }
} else {
  console.log("Пользователь создан:", userId);
}

const { error: adminError } = await supabase
  .from("admins")
  .upsert({ user_id: userId });

if (adminError) {
  console.error("Не смог добавить в таблицу admins:", adminError.message);
  process.exit(1);
}

console.log("Готово. Этот пользователь теперь администратор сайта.");
