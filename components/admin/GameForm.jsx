"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame, deleteGame, updateGame } from "@/lib/repositories/games";
import { TrashIcon } from "@/components/Icons";

const DEFAULTS = {
  title: "",
  date: "",
  dayOfWeek: "",
  startTime: "",
  endTime: "",
  location: "",
  participantsType: "",
  participantsCount: "",
  courtsCount: "",
  price: "",
  extraText: "",
  registrationUrl: "#",
  published: true,
};

export default function GameForm({ game }) {
  const [values, setValues] = useState(
    game
      ? {
          ...DEFAULTS,
          ...game,
          participantsType: game.participantsType || "",
          participantsCount: game.participantsCount ?? "",
          courtsCount: game.courtsCount ?? "",
        }
      : DEFAULTS
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(game?.photo || "");
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoRemoved(false);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhotoFile(null);
    setPhotoPreview("");
    setPhotoRemoved(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("date", values.date);
    formData.set("dayOfWeek", values.dayOfWeek);
    formData.set("startTime", values.startTime);
    formData.set("endTime", values.endTime);
    formData.set("location", values.location);
    formData.set("participantsType", values.participantsType);
    formData.set("participantsCount", values.participantsCount);
    formData.set("courtsCount", values.courtsCount);
    formData.set("price", values.price);
    formData.set("extraText", values.extraText);
    formData.set("registrationUrl", values.registrationUrl);
    if (values.published) formData.set("published", "on");
    if (photoFile) formData.set("photo", photoFile);
    if (photoRemoved) formData.set("photoRemove", "1");

    try {
      if (game) {
        await updateGame(game.id, formData);
      } else {
        await createGame(formData);
      }
    } catch (err) {
      setError(`Не удалось сохранить игру: ${err.message || err}`);
      setPending(false);
      return;
    }
    setPending(false);
    router.push("/admin/games");
    router.refresh();
  }

  async function handleDelete() {
    if (!game || !confirm("Удалить эту игру?")) return;
    await deleteGame(game.id);
    router.push("/admin/games");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label>Название игры</label>
        <input
          className="admin-input"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Mexicano"
          required
        />
      </div>

      <div className="admin-form__row">
        <div className="admin-field">
          <label>Дата</label>
          <input
            type="date"
            className="admin-input"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>
        <div className="admin-field">
          <label>День недели</label>
          <input
            className="admin-input"
            value={values.dayOfWeek}
            onChange={(e) => set("dayOfWeek", e.target.value)}
            placeholder="Среда"
          />
        </div>
      </div>

      <div className="admin-form__row">
        <div className="admin-field">
          <label>Время начала</label>
          <input
            type="time"
            className="admin-input"
            value={values.startTime}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label>Время окончания</label>
          <input
            type="time"
            className="admin-input"
            value={values.endTime}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </div>
      </div>

      <div className="admin-form__row">
        <div className="admin-field">
          <label>Место</label>
          <input
            className="admin-input"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Padel Indoor Alicante"
          />
        </div>
        <div className="admin-field">
          <label>Цена, €</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="admin-input"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="15"
          />
        </div>
      </div>

      <div className="admin-form__row">
        <div className="admin-field">
          <label>Игроков или пар</label>
          <select
            className="admin-select"
            value={values.participantsType}
            onChange={(e) => set("participantsType", e.target.value)}
          >
            <option value="">Не показывать</option>
            <option value="players">Игроки</option>
            <option value="pairs">Пары</option>
          </select>
        </div>
        <div className="admin-field">
          <label>Количество</label>
          <input
            type="number"
            min="0"
            className="admin-input"
            value={values.participantsCount}
            onChange={(e) => set("participantsCount", e.target.value)}
            disabled={!values.participantsType}
          />
        </div>
      </div>

      <div className="admin-form__row">
        <div className="admin-field">
          <label>Количество кортов</label>
          <input
            type="number"
            min="0"
            className="admin-input"
            value={values.courtsCount}
            onChange={(e) => set("courtsCount", e.target.value)}
            placeholder="Необязательно"
          />
        </div>
      </div>

      <div className="admin-field">
        <label>Дополнительный текст</label>
        <input
          className="admin-input"
          value={values.extraText}
          onChange={(e) => set("extraText", e.target.value)}
          placeholder="Необязательно"
        />
      </div>

      <div className="admin-field">
        <label>Ссылка на регистрацию</label>
        <input
          className="admin-input"
          value={values.registrationUrl}
          onChange={(e) => set("registrationUrl", e.target.value)}
        />
      </div>

      <div className="admin-field">
        <label>Фото</label>
        {photoPreview && (
          <div style={{ position: "relative", width: 96 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt=""
              style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10, marginTop: 6 }}
            />
            <button
              type="button"
              onClick={removePhoto}
              className="admin-photo__btn"
              style={{ position: "absolute", top: 4, right: 4 }}
            >
              <TrashIcon width={12} height={12} />
            </button>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        Опубликовано на сайте
      </label>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-form__actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={pending}>
          {pending ? "Сохраняем…" : game ? "Сохранить" : "Добавить игру"}
        </button>
        {game && (
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={handleDelete}
          >
            Удалить
          </button>
        )}
      </div>
    </form>
  );
}
