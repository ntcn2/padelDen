"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, deletePost, updatePost } from "@/lib/repositories/news";
import { TrashIcon } from "@/components/Icons";

function readAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

const DEFAULTS = {
  title: "",
  slug: "",
  categoryId: "",
  excerpt: "",
  body: "",
  coverImage: "",
  extraImages: [],
  publishedAt: new Date().toISOString().slice(0, 10),
  published: false,
  seoTitle: "",
  seoDescription: "",
};

export default function NewsForm({ post, categories }) {
  const [values, setValues] = useState(
    post
      ? { ...DEFAULTS, ...post, body: (post.body || []).join("\n\n") }
      : { ...DEFAULTS, categoryId: categories[0]?.id || "" }
  );
  const [pending, setPending] = useState(false);
  const router = useRouter();

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    set("coverImage", await readAsDataUrl(file));
  }

  async function handleExtraChange(e) {
    const files = Array.from(e.target.files || []);
    const urls = await Promise.all(files.map(readAsDataUrl));
    setValues((v) => ({ ...v, extraImages: [...v.extraImages, ...urls] }));
  }

  function removeExtra(index) {
    setValues((v) => ({ ...v, extraImages: v.extraImages.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    const payload = {
      ...values,
      body: values.body
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    };
    if (post) {
      await updatePost(post.id, payload);
    } else {
      await createPost(payload);
    }
    setPending(false);
    router.push("/admin/journal");
    router.refresh();
  }

  async function handleDelete() {
    if (!post || !confirm("Удалить эту новость?")) return;
    await deletePost(post.id);
    router.push("/admin/journal");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label>Заголовок</label>
        <input
          className="admin-input"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </div>

      <div className="admin-form__row">
        <div className="admin-field">
          <label>Категория</label>
          <select
            className="admin-select"
            value={values.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label>Дата публикации</label>
          <input
            type="date"
            className="admin-input"
            value={values.publishedAt}
            onChange={(e) => set("publishedAt", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-field">
        <label>Slug (адрес страницы)</label>
        <input
          className="admin-input"
          value={values.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="оставьте пустым — сформируется из заголовка"
        />
        <span className="admin-field__hint">/news/{values.slug || "…"}</span>
      </div>

      <div className="admin-field">
        <label>Короткое описание</label>
        <textarea
          className="admin-textarea"
          style={{ minHeight: 60 }}
          value={values.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
        />
      </div>

      <div className="admin-field">
        <label>Основной текст</label>
        <textarea
          className="admin-textarea"
          style={{ minHeight: 220 }}
          value={values.body}
          onChange={(e) => set("body", e.target.value)}
          placeholder="Разделяйте абзацы пустой строкой"
        />
      </div>

      <div className="admin-field">
        <label>Главное изображение</label>
        {values.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.coverImage}
            alt=""
            style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 10 }}
          />
        )}
        <input type="file" accept="image/*" onChange={handleCoverChange} />
      </div>

      <div className="admin-field">
        <label>Дополнительные изображения</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {values.extraImages.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => removeExtra(i)}
                className="admin-photo__btn"
                style={{ position: "absolute", top: 4, right: 4 }}
              >
                <TrashIcon width={12} height={12} />
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={handleExtraChange} />
      </div>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        Опубликовано на сайте
      </label>

      <h2 className="admin-section-title" style={{ marginTop: 8 }}>
        SEO
      </h2>
      <div className="admin-field">
        <label>SEO Title</label>
        <input
          className="admin-input"
          value={values.seoTitle}
          onChange={(e) => set("seoTitle", e.target.value)}
        />
      </div>
      <div className="admin-field">
        <label>SEO Description</label>
        <textarea
          className="admin-textarea"
          style={{ minHeight: 60 }}
          value={values.seoDescription}
          onChange={(e) => set("seoDescription", e.target.value)}
        />
      </div>

      <div className="admin-form__actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
          {pending ? "Сохраняем…" : post ? "Сохранить" : "Создать новость"}
        </button>
        {post && (
          <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete}>
            Удалить
          </button>
        )}
      </div>
    </form>
  );
}
