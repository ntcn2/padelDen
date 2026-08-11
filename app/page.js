import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Schedule from "@/components/Schedule";
import Pricing from "@/components/Pricing";
import Gallery from "@/components/Gallery";
import Articles from "@/components/Articles";
import Community from "@/components/Community";
import Footer from "@/components/Footer";
import { getNextUpcomingGame, getPublishedGames } from "@/lib/repositories/games";
import { getGalleryData } from "@/lib/repositories/gallery";
import { getSeoPage } from "@/lib/repositories/seo";

export async function generateMetadata() {
  const seo = await getSeoPage("home");
  if (!seo) return {};
  return { title: seo.seoTitle, description: seo.seoDescription };
}

export default async function Home() {
  const [games, nextGame, gallery] = await Promise.all([
    getPublishedGames(),
    getNextUpcomingGame(),
    getGalleryData(),
  ]);

  return (
    <main className="page" id="top">
      <Header />
      <Hero nextGame={nextGame} />
      <Schedule games={games} />
      <Pricing />
      <Gallery categories={gallery.categories} photos={gallery.photos} />
      <Articles />
      <Community />
      <Footer />
    </main>
  );
}
