"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditIcon, TrashIcon } from "@/components/Icons";
import {
  createTournament,
  deleteTournament,
  setTournamentArchived,
} from "@/lib/repositories/tournament";
import { tournamentSummary } from "@/lib/tournament";

export default function TournamentsList({ tournaments }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const id = await createTournament();
      router.push(`/admin/tournament/${id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleArchive(t) {
    await setTournamentArchived(t.id, !t.archived);
    router.refresh();
  }

  async function handleDelete(t) {
    if (!confirm(`Удалить турнир «${t.title}» со всеми сетками и счетами? Это нельзя отменить.`)) return;
    await deleteTournament(t.id);
    router.refresh();
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Турниры</h1>
          <p className="admin-subtitle">
            Текущие турниры показываются на сайте первыми, архивные — ниже, в блоке «Архив». Ненужный турнир можно удалить совсем.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn--accent" onClick={handleCreate} disabled={creating}>
          {creating ? "Создаём…" : "+ Создать турнир"}
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="admin-empty">Пока нет ни одного турнира. Создайте первый.</div>
      ) : (
        <div className="admin-list">
          {tournaments.map((t) => {
            const { played, total } = tournamentSummary(t.categories);
            return (
              <div key={t.id} className="admin-row">
                <div className="admin-row__body">
                  <div className="admin-row__title">{t.title || "Без названия"}</div>
                  <div className="admin-row__meta">
                    {t.categories.length} категорий · {played} из {total} матчей сыграно · создан{" "}
                    {new Date(t.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                <span className={`admin-badge ${t.archived ? "admin-badge--off" : "admin-badge--on"}`}>
                  {t.archived ? "Архив" : "Текущий"}
                </span>
                <div className="admin-row__actions">
                  <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => handleArchive(t)}>
                    {t.archived ? "Вернуть из архива" : "В архив"}
                  </button>
                  <Link href={`/admin/tournament/${t.id}`} className="admin-btn admin-btn--secondary admin-btn--sm">
                    <EditIcon width={14} height={14} /> Открыть
                  </Link>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger admin-btn--sm"
                    onClick={() => handleDelete(t)}
                  >
                    <TrashIcon width={14} height={14} /> Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
