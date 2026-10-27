import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AutoRefresh from "@/components/tournament/AutoRefresh";
import TournamentBoard from "@/components/tournament/TournamentBoard";
import { getTournament } from "@/lib/repositories/tournament";

// Счёт меняется во время игр — всегда отдаём свежие данные
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) return {};
  return {
    title: `${tournament.title} — Top Padel Alicante`,
    description: tournament.subtitle || "Сетки, счета и таблица результатов турнира по паделу.",
  };
}

export default async function TournamentPage({ params }) {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) notFound();

  return (
    <main className="page" id="top">
      <Header />

      <section className="news-hero">
        <div className="news-hero__inner">
          <Link href="/tournament" className="link-arrow tb-back">
            ← Все турниры
          </Link>
          <p className="eyebrow">{tournament.archived ? "Архив турниров" : "Турнир по паделу"}</p>
          <h1 className="news-hero__title">{tournament.title}</h1>
          <p className="section-subtitle">
            {tournament.subtitle ||
              "Нажми на категорию, чтобы открыть её сетку. Счёт обновляется сам."}
          </p>
        </div>
      </section>

      <section className="tournament">
        <div className="tournament__inner">
          <TournamentBoard cats={tournament.categories} />
          {tournament.archived ? null : <AutoRefresh />}
        </div>
      </section>

      <Footer />
    </main>
  );
}
