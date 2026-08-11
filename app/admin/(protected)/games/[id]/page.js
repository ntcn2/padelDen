import { notFound } from "next/navigation";
import { getGame } from "@/lib/repositories/games";
import GameForm from "@/components/admin/GameForm";

export default async function EditGamePage({ params }) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">{game.title}</h1>
        </div>
      </div>
      <div className="admin-card">
        <GameForm game={game} />
      </div>
    </>
  );
}
