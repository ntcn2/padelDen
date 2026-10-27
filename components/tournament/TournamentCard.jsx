import Link from "next/link";
import { champion, teamNames, tournamentSummary } from "@/lib/tournament";

// Карточка турнира в списке на /tournament
export default function TournamentCard({ tournament }) {
  const { played, total } = tournamentSummary(tournament.categories);
  const champs = tournament.categories
    .map((cat) => {
      const t = champion(cat, "up");
      return t === null ? null : `${cat.name}: ${teamNames(cat, t).filter(Boolean).join(" / ")}`;
    })
    .filter(Boolean);

  return (
    <Link
      href={`/tournament/${tournament.id}`}
      className={`tb-tour${tournament.archived ? " tb-tour--archived" : ""}`}
    >
      <span className="tb-tour__top">
        <span className="tb-tour__status">{tournament.archived ? "Архив" : "Идёт"}</span>
        <span className="tb-tour__arrow">↗</span>
      </span>

      <span className="tb-tour__title">{tournament.title || "Турнир"}</span>
      {tournament.subtitle ? <span className="tb-tour__subtitle">{tournament.subtitle}</span> : null}

      <span className="tb-tour__cats">
        {tournament.categories.map((cat, i) => (
          <span key={i}>{cat.name}</span>
        ))}
      </span>

      <span className="tb-tour__bottom">
        <span className="tb-tour__big">
          {played}
          <small>/{total}</small>
        </span>
        <span className="tb-tour__sub">
          {champs.length ? `🏆 ${champs.length} из ${tournament.categories.length} категорий завершены` : "матчей сыграно"}
        </span>
      </span>
    </Link>
  );
}
