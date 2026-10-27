"use client";

import { useEffect, useRef, useState } from "react";
import TournamentBoard from "@/components/tournament/TournamentBoard";
import { saveTournament } from "@/lib/repositories/tournament";

const SAVE_DELAY = 700;

const STATUS_TEXT = {
  pending: "Есть несохранённые изменения…",
  saving: "Сохраняем…",
  saved: "Сохранено — на сайте уже видно",
};

// Название, описание, архив и категории турнира. Сохраняется весь турнир
// целиком с небольшой задержкой после последней правки.
export default function TournamentEditor({ tournament }) {
  const [data, setData] = useState({
    title: tournament.title,
    subtitle: tournament.subtitle,
    archived: tournament.archived,
    categories: tournament.categories,
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const timer = useRef(null);
  const latest = useRef(data);

  useEffect(() => {
    const warn = (e) => {
      if (timer.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  function update(patch) {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setData(next);
    setStatus("pending");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      timer.current = null;
      setStatus("saving");
      try {
        await saveTournament(tournament.id, latest.current);
        if (!timer.current) setStatus("saved");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Не удалось сохранить");
      }
    }, SAVE_DELAY);
  }

  return (
    <>
      {status !== "idle" ? (
        <p className={`tb-save-status${status === "error" ? " tb-save-status--error" : ""}`}>
          {status === "error" ? `Ошибка сохранения: ${error}` : STATUS_TEXT[status]}
        </p>
      ) : null}

      <div className="admin-card tb-editor-card">
        <div className="admin-form">
          <div className="admin-field">
            <label htmlFor="tb-title">Название турнира</label>
            <input
              id="tb-title"
              className="admin-input"
              value={data.title}
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="tb-subtitle">Описание</label>
            <textarea
              id="tb-subtitle"
              className="admin-textarea"
              rows={2}
              value={data.subtitle}
              placeholder="Например: Осенний турнир клуба, 31 октября — 10 ноября"
              onChange={(e) => update({ subtitle: e.target.value })}
            />
            <span className="admin-field__hint">Показывается под названием на сайте.</span>
          </div>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={data.archived}
              onChange={(e) => update({ archived: e.target.checked })}
            />
            В архиве
          </label>
        </div>
      </div>

      <TournamentBoard
        cats={data.categories}
        editable
        onChange={(categories) => update({ categories })}
      />
    </>
  );
}
