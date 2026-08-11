import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "./Icons";

export default function ArticleCard({ article, categoryName, index }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <Link href={`/news/${article.slug}`} className="article-card">
      {article.coverImage && (
        <Image
          src={article.coverImage}
          alt=""
          fill
          sizes="500px"
          unoptimized={article.coverImage.startsWith("data:")}
          className="article-card__photo"
        />
      )}
      <span className="article-card__number">{num}</span>
      <div className="article-card__body">
        <span className="article-card__category">{categoryName}</span>
        <h3 className="article-card__title">{article.title}</h3>
        <span className="article-card__link">
          Читать статью
          <ArrowUpRight />
        </span>
      </div>
    </Link>
  );
}
