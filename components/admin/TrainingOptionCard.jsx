"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTrainingOption, updateTrainingOption } from "@/lib/repositories/trainings";
import { TrashIcon } from "@/components/Icons";

export default function TrainingOptionCard({ option }) {
  const [values, setValues] = useState(option);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave() {
    setPending(true);
    await updateTrainingOption(option.id, values);
    setPending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Удалить эту тренировку?")) return;
    await deleteTrainingOption(option.id);
    router.refresh();
  }

  return (
    <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="admin-form__row">
        <div className="admin-field">
          <label>Название</label>
          <input
            className="admin-input"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label>Цена</label>
          <input
            className="admin-input"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="30 €"
          />
        </div>
      </div>
      <div className="admin-form__row">
        <div className="admin-field">
          <label>Единица измерения</label>
          <select
            className="admin-select"
            value={values.unit}
            onChange={(e) => set("unit", e.target.value)}
          >
            <option value="час">час</option>
            <option value="тренировка">тренировка</option>
          </select>
        </div>
        <div className="admin-field">
          <label>Дополнительный текст</label>
          <input
            className="admin-input"
            value={values.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="+ стоимость корта"
          />
        </div>
      </div>
      <div className="admin-field">
        <label>Ссылка для записи</label>
        <input
          className="admin-input"
          value={values.registrationUrl}
          onChange={(e) => set("registrationUrl", e.target.value)}
        />
      </div>
      <div className="admin-form__actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          disabled={pending}
        >
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
        <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete}>
          <TrashIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
}
