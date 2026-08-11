"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSeoPage } from "@/lib/repositories/seo";

export default function SeoPageCard({ page }) {
  const [values, setValues] = useState(page);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setPending(true);
    await updateSeoPage(page.pageKey, {
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div className="admin-row__title">{page.label}</div>
        <div className="admin-row__meta">{page.path}</div>
      </div>
      <div className="admin-field">
        <label>SEO Title</label>
        <input
          className="admin-input"
          value={values.seoTitle}
          onChange={(e) => setValues((v) => ({ ...v, seoTitle: e.target.value }))}
        />
      </div>
      <div className="admin-field">
        <label>Meta Description</label>
        <textarea
          className="admin-textarea"
          style={{ minHeight: 70 }}
          value={values.seoDescription}
          onChange={(e) => setValues((v) => ({ ...v, seoDescription: e.target.value }))}
        />
      </div>
      <button
        type="button"
        className="admin-btn admin-btn--primary"
        onClick={handleSave}
        disabled={pending}
        style={{ alignSelf: "flex-start" }}
      >
        {pending ? "Сохраняем…" : "Сохранить"}
      </button>
    </div>
  );
}
