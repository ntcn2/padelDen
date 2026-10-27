import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TournamentCard from "@/components/tournament/TournamentCard";
import { getTournaments } from "@/lib/repositories/tournament";

export const metadata = {
  title: "Турниры — Top Padel Alicante",
  description: "Турниры по паделу в Аликанте: сетки, счета и результаты.",
};

export const dynamic = "force-dynamic";

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  const current = tournaments.filter((t) => !t.archived);
  const archive = tournaments.filter((t) => t.archived);

  return (
    <main className="page" id="top">
      <Header />

      <section className="news-hero">
        <div className="news-hero__inner">
          <p className="eyebrow">Турниры по паделу</p>
          <h1 className="news-hero__title">Турниры</h1>
          <p className="section-subtitle">
            Выбери турнир, чтобы посмотреть категории, сетки и результаты.
          </p>
        </div>
      </section>

      <section className="tournament">
        <div className="tournament__inner">
          {current.length ? (
            <div className="tb-tours">
              {current.map((t) => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          ) : (
            <p className="tb-empty">Новый турнир скоро появится.</p>
          )}

          {archive.length ? (
            <>
              <h2 className="tb-archive-title">Архив</h2>
              <div className="tb-tours">
                {archive.map((t) => <TournamentCard key={t.id} tournament={t} />)}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}
