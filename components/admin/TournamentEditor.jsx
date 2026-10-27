"use client";

import { useEffect, useRef, useState } from "react";
import TournamentBoard from "@/components/tournament/TournamentBoard";
import { saveTournamentCategory } from "@/lib/repositories/tournament";

const SAVE_DELAY = 700;

const STATUS_TEXT = {
  pending: "Есть несохранённые изменения…",
  saving: "Сохраняем…",
  saved: "Сохранено — на сайте уже видно",
};

// Та же доска, что на сайте, но с полями ввода. Каждая изменённая категория
// сохраняется в Supabase с небольшой задержкой после последней правки.
export default function TournamentEditor({ initialCats }) {
  const [cats, setCats] = useState(initialCats);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const timers = useRef(new Map());

  useEffect(() => {
    const warn = (e) => {
      if (timers.current.size > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  function handleChange(ci, cat) {
    setCats((prev) => prev.map((c, i) => (i === ci ? cat : c)));
    setStatus("pending");
    clearTimeout(timers.current.get(ci));
    timers.current.set(
      ci,
      setTimeout(async () => {
        timers.current.delete(ci);
        setStatus("saving");
        try {
          await saveTournamentCategory(ci, cat);
          if (timers.current.size === 0) setStatus("saved");
        } catch (err) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Не удалось сохранить");
        }
      }, SAVE_DELAY)
    );
  }

  return (
    <>
      {status !== "idle" ? (
        <p className={`tb-save-status${status === "error" ? " tb-save-status--error" : ""}`}>
          {status === "error" ? `Ошибка сохранения: ${error}` : STATUS_TEXT[status]}
        </p>
      ) : null}
      <TournamentBoard cats={cats} editable onChange={handleChange} />
    </>
  );
}
