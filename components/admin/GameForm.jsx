"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame, deleteGame, updateGame } from "@/lib/repositories/games";

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
  photo: "",
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
  const [pending, setPending] = useState(false);
  const router = useRouter();

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    if (game) {
      await updateGame(game.id, values);
    } else {
      await createGame(values);
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
        <label>Фото (ссылка на изображение)</label>
        <input
          className="admin-input"
          value={values.photo}
          onChange={(e) => set("photo", e.target.value)}
          placeholder="https://..."
        />
        {values.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.photo}
            alt=""
            style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10, marginTop: 6 }}
          />
        )}
      </div>

      <label className="admin-checkbox">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        Опубликовано на сайте
      </label>

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
