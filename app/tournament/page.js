import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AutoRefresh from "@/components/tournament/AutoRefresh";
import TournamentBoard from "@/components/tournament/TournamentBoard";
import { getTournament } from "@/lib/repositories/tournament";

export const metadata = {
  title: "Турнир — Top Padel Alicante",
  description: "Сетки, счета и таблица результатов турнира по паделу в Аликанте.",
};

// Счёт меняется во время игр — всегда отдаём свежие данные
export const dynamic = "force-dynamic";

export default async function TournamentPage() {
  const cats = await getTournament();

  return (
    <main className="page" id="top">
      <Header />

      <section className="news-hero">
        <div className="news-hero__inner">
          <p className="eyebrow">Турнир по паделу</p>
          <h1 className="news-hero__title">Выбирай, кто сегодня играет</h1>
          <p className="section-subtitle">
            Семь категорий, в каждой верхняя и нижняя сетка. Нажми на категорию,
            чтобы открыть её сетку. Счёт обновляется сам.
          </p>
        </div>
      </section>

      <section className="tournament">
        <div className="tournament__inner">
          <TournamentBoard cats={cats} />
          <AutoRefresh />
        </div>
      </section>

      <Footer />
    </main>
  );
}
