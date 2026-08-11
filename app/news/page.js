import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleGrid from "@/components/ArticleGrid";
import { getCategories, getPublishedPosts } from "@/lib/repositories/news";
import { getSeoPage } from "@/lib/repositories/seo";

export async function generateMetadata() {
  const seo = await getSeoPage("journal");
  if (!seo) return {};
  return { title: seo.seoTitle, description: seo.seoDescription };
}

export default async function NewsPage() {
  const [categories, posts] = await Promise.all([
    getCategories(),
    getPublishedPosts(),
  ]);

  return (
    <main className="page" id="top">
      <Header />

      <section className="news-hero">
        <div className="news-hero__inner">
          <p className="eyebrow">Padel Journal</p>
          <h1 className="news-hero__title">Все статьи и новости</h1>
          <p className="section-subtitle">
            Советы, разборы форматов, снаряжение и истории сообщества — всё,
            что помогает играть увереннее.
          </p>
        </div>
      </section>

      <section className="articles">
        <div className="articles__inner">
          <ArticleGrid categories={categories} posts={posts} showAllLink={false} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
