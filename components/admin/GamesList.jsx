"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditIcon, GripIcon, TrashIcon } from "@/components/Icons";
import ReorderableList from "./ReorderableList";
import { deleteGame, reorderGames } from "@/lib/repositories/games";

function metaLine(game) {
  const parts = [`${game.dayOfWeek}, ${game.date}`, game.time, game.location, game.price];
  return parts.filter(Boolean).join(" · ");
}

export default function GamesList({ games }) {
  const router = useRouter();

  async function handleDelete(id) {
    if (!confirm("Удалить эту игру?")) return;
    await deleteGame(id);
    router.refresh();
  }

  if (games.length === 0) {
    return <div className="admin-empty">Пока нет ни одной игры. Добавьте первую.</div>;
  }

  return (
    <ReorderableList
      items={games}
      getId={(g) => g.id}
      onReorder={(ids) => reorderGames(ids)}
      renderRow={(game) => (
        <div className="admin-row">
          <span className="admin-row__drag" title="Перетащите, чтобы изменить порядок">
            <GripIcon width={18} height={18} />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="admin-row__thumb" src={game.photo} alt="" />
          <div className="admin-row__body">
            <div className="admin-row__title">{game.title}</div>
            <div className="admin-row__meta">{metaLine(game)}</div>
          </div>
          <span
            className={`admin-badge ${game.published ? "admin-badge--on" : "admin-badge--off"}`}
          >
            {game.published ? "Опубликовано" : "Черновик"}
          </span>
          <div className="admin-row__actions">
            <Link
              href={`/admin/games/${game.id}`}
              className="admin-btn admin-btn--secondary admin-btn--sm"
            >
              <EditIcon width={14} height={14} />
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--danger admin-btn--sm"
              onClick={() => handleDelete(game.id)}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </div>
        </div>
      )}
    />
  );
}
