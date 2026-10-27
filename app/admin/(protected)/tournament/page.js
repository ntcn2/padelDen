import { getTournament } from "@/lib/repositories/tournament";
import TournamentEditor from "@/components/admin/TournamentEditor";

export default async function AdminTournamentPage() {
  const cats = await getTournament();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Турнир</h1>
          <p className="admin-subtitle">
            Имена пар, счета, корты и время. Всё сохраняется само и сразу видно на{" "}
            <a href="/tournament" target="_blank" rel="noopener noreferrer">
              <u>странице турнира</u>
            </a>
            .
          </p>
        </div>
      </div>

      <TournamentEditor initialCats={cats} />
    </>
  );
}
