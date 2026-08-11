import Link from "next/link";
import { ArrowUpRight } from "./Icons";
import Reveal from "./Reveal";
import ArticleGrid from "./ArticleGrid";
import { getCategories, getPublishedPosts } from "@/lib/repositories/news";

export default async function Articles() {
  const [categories, posts] = await Promise.all([
    getCategories(),
    getPublishedPosts(),
  ]);

  return (
    <section className="articles" id="articles">
      <div className="articles__inner">
        <div className="section-header">
          <Reveal>
            <p className="eyebrow">Padel Journal</p>
            <h2 className="section-title">
              Играть — хорошо.
              <br />
              <span className="section-title--muted">
                Понимать игру —
                <br />
                еще лучше.
              </span>
            </h2>
          </Reveal>
          <Reveal as="p" className="section-subtitle" delay={140}>
            Советы, разборы, новости и всё,
            <br />
            что помогает играть увереннее.
          </Reveal>
        </div>

        <ArticleGrid categories={categories} posts={posts} />

        <Link className="link-arrow" href="/news">
          Смотреть все материалы
          <ArrowUpRight />
        </Link>
      </div>
    </section>
  );
}
