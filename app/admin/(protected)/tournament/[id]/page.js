import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournament } from "@/lib/repositories/tournament";
import TournamentEditor from "@/components/admin/TournamentEditor";

export default async function AdminTournamentPage({ params }) {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) notFound();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <Link href="/admin/tournament" className="admin-subtitle">
            ← Все турниры
          </Link>
          <h1 className="admin-title">Редактирование турнира</h1>
          <p className="admin-subtitle">
            Всё сохраняется само и сразу видно на{" "}
            <a href={`/tournament/${tournament.id}`} target="_blank" rel="noopener noreferrer">
              <u>странице турнира</u>
            </a>
            .
          </p>
        </div>
      </div>

      <TournamentEditor tournament={tournament} />
    </>
  );
}
