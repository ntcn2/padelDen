import Link from "next/link";
import { getAllGames } from "@/lib/repositories/games";
import GamesList from "@/components/admin/GamesList";

export default async function AdminGamesPage() {
  const games = await getAllGames();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Ближайшие игры</h1>
          <p className="admin-subtitle">
            Перетаскивайте карточки, чтобы изменить порядок на сайте.
          </p>
        </div>
        <Link href="/admin/games/new" className="admin-btn admin-btn--accent">
          + Добавить игру
        </Link>
      </div>

      <GamesList games={games} />
    </>
  );
}
