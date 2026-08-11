"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, deletePost, updatePost } from "@/lib/repositories/news";
import { TrashIcon } from "@/components/Icons";

const DEFAULTS = {
  title: "",
  slug: "",
  categoryId: "",
  excerpt: "",
  body: "",
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
  // Existing images (already in Storage): { path, url }. Removing one just
  // drops it from this list — the actual Storage delete happens server-side
  // by diffing against what's kept.
  const [existingExtra, setExistingExtra] = useState(
    post
      ? (post.extraImagePaths || []).map((path, i) => ({ path, url: post.extraImages[i] }))
      : []
  );
  const [newExtraFiles, setNewExtraFiles] = useState([]); // File[]
  const [coverFile, setCoverFile] = useState(null); // File | null (new selection)
  const [coverPreview, setCoverPreview] = useState(post?.coverImage || "");
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverRemoved(false);
    setCoverPreview(URL.createObjectURL(file));
  }

  function removeCover() {
    setCoverFile(null);
    setCoverPreview("");
    setCoverRemoved(true);
  }

  function handleExtraChange(e) {
    const files = Array.from(e.target.files || []);
    setNewExtraFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removeExistingExtra(path) {
    setExistingExtra((prev) => prev.filter((img) => img.path !== path));
  }

  function removeNewExtra(index) {
    setNewExtraFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);

    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("slug", values.slug);
    formData.set("categoryId", values.categoryId);
    formData.set("excerpt", values.excerpt);
    formData.set("body", values.body);
    formData.set("publishedAt", values.publishedAt);
    if (values.published) formData.set("published", "on");
    formData.set("seoTitle", values.seoTitle);
    formData.set("seoDescription", values.seoDescription);
    if (coverFile) formData.set("coverImage", coverFile);
    if (coverRemoved) formData.set("coverImageRemove", "1");
    newExtraFiles.forEach((file) => formData.append("extraImages", file));
    formData.set("keepExtraImagePaths", JSON.stringify(existingExtra.map((img) => img.path)));

    if (post) {
      await updatePost(post.id, formData);
    } else {
      await createPost(formData);
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
        {coverPreview && (
          <div style={{ position: "relative", width: 160 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview}
              alt=""
              style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 10 }}
            />
            <button
              type="button"
              onClick={removeCover}
              className="admin-photo__btn"
              style={{ position: "absolute", top: 4, right: 4 }}
            >
              <TrashIcon width={12} height={12} />
            </button>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleCoverChange} />
      </div>

      <div className="admin-field">
        <label>Дополнительные изображения</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {existingExtra.map((img) => (
            <div key={img.path} style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => removeExistingExtra(img.path)}
                className="admin-photo__btn"
                style={{ position: "absolute", top: 4, right: 4 }}
              >
                <TrashIcon width={12} height={12} />
              </button>
            </div>
          ))}
          {newExtraFiles.map((file, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt=""
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
              />
              <button
                type="button"
                onClick={() => removeNewExtra(i)}
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
