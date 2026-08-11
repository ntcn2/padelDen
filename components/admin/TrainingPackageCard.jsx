"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTrainingPackage, updateTrainingPackage } from "@/lib/repositories/trainings";
import { PlusIcon, TrashIcon } from "@/components/Icons";

export default function TrainingPackageCard({ pkg }) {
  const [values, setValues] = useState(pkg);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function setTier(index, key, value) {
    setValues((v) => {
      const tiers = [...v.tiers];
      tiers[index] = { ...tiers[index], [key]: value };
      return { ...v, tiers };
    });
  }

  function addTier() {
    setValues((v) => ({
      ...v,
      tiers: [...v.tiers, { sessionsCount: "", oldPrice: "", price: "" }],
    }));
  }

  function removeTier(index) {
    setValues((v) => ({ ...v, tiers: v.tiers.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    setPending(true);
    await updateTrainingPackage(pkg.id, values);
    setPending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Удалить этот пакет?")) return;
    await deleteTrainingPackage(pkg.id);
    router.refresh();
  }

  return (
    <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="admin-field">
        <label>Название пакета (бейдж)</label>
        <input
          className="admin-input"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="admin-field">
        <label>Тарифы</label>
        {values.tiers.map((tier, i) => (
          <div
            key={i}
            className="admin-form__row"
            style={{ gridTemplateColumns: "1fr 1fr 1fr auto", alignItems: "end" }}
          >
            <div className="admin-field">
              <label>Кол-во тренировок</label>
              <input
                type="number"
                className="admin-input"
                value={tier.sessionsCount}
                onChange={(e) => setTier(i, "sessionsCount", e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label>Старая цена, €</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="admin-input"
                value={tier.oldPrice ?? ""}
                onChange={(e) => setTier(i, "oldPrice", e.target.value)}
                placeholder="120"
              />
            </div>
            <div className="admin-field">
              <label>Актуальная цена, €</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="admin-input"
                value={tier.price ?? ""}
                onChange={(e) => setTier(i, "price", e.target.value)}
                placeholder="100"
              />
            </div>
            <button
              type="button"
              className="admin-btn admin-btn--secondary admin-btn--sm"
              onClick={() => removeTier(i)}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-btn admin-btn--secondary admin-btn--sm"
          onClick={addTier}
          style={{ alignSelf: "flex-start", marginTop: 4 }}
        >
          <PlusIcon width={14} height={14} /> Добавить тариф
        </button>
      </div>

      <div className="admin-field">
        <label>Срок действия</label>
        <input
          className="admin-input"
          value={values.validityNote}
          onChange={(e) => set("validityNote", e.target.value)}
        />
      </div>
      <div className="admin-field">
        <label>Дополнительное условие</label>
        <input
          className="admin-input"
          value={values.extraNote}
          onChange={(e) => set("extraNote", e.target.value)}
        />
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
