import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleGrid from "@/components/ArticleGrid";
import { ArrowRight } from "@/components/Icons";
import {
  getCategories,
  getPost,
  getPublishedPosts,
  getPublishedSlugs,
} from "@/lib/repositories/news";

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const [post, categories, allPosts] = await Promise.all([
    getPost(slug),
    getCategories(),
    getPublishedPosts(),
  ]);

  if (!post || !post.published) notFound();

  const categoryName =
    categories.find((c) => c.id === post.categoryId)?.name || "";
  const isDataUrl = post.coverImage?.startsWith("data:");

  return (
    <main className="page" id="top">
      <Header />

      <section className="article-hero">
        <div className="article-hero__inner">
          <Link href="/news" className="link-arrow article-hero__back">
            <ArrowRight style={{ transform: "rotate(180deg)" }} />
            Все новости
          </Link>
          <p className="eyebrow">{categoryName}</p>
          <h1 className="article-hero__title">{post.title}</h1>
        </div>
        {post.coverImage && (
          <div className="article-hero__photo">
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="1200px"
              unoptimized={isDataUrl}
            />
          </div>
        )}
      </section>

      <article className="article-body">
        <div className="article-body__inner">
          {post.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          {post.extraImages?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {post.extraImages.map((src, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/10",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="720px"
                    style={{ objectFit: "cover" }}
                    unoptimized={src.startsWith("data:")}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      <section className="articles">
        <div className="articles__inner">
          <div className="section-header">
            <div>
              <p className="eyebrow">Padel Journal</p>
              <h2 className="section-title">Все новости</h2>
            </div>
          </div>
          <ArticleGrid categories={categories} posts={allPosts} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
