"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ArticleCard from "./ArticleCard";
import { ArrowUpRight } from "./Icons";

export default function ArticleGrid({ categories, posts, showAllLink = true }) {
  const [categoryId, setCategoryId] = useState("all");

  const categoriesById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const visible = useMemo(
    () =>
      categoryId === "all"
        ? posts
        : posts.filter((p) => p.categoryId === categoryId),
    [categoryId, posts]
  );

  return (
    <>
      <div className="articles__filters">
        <div className="tabs">
          <button
            type="button"
            className={`tab${categoryId === "all" ? " tab--active" : ""}`}
            onClick={() => setCategoryId("all")}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`tab${cat.id === categoryId ? " tab--active" : ""}`}
              onClick={() => setCategoryId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {showAllLink && (
          <Link className="link-arrow" href="/news">
            Все материалы
            <ArrowUpRight />
          </Link>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="section-subtitle">Пока нет материалов в этой категории.</p>
      ) : (
        <div className="articles__cards">
          {visible.map((post, index) => (
            <ArticleCard
              key={post.slug}
              article={post}
              categoryName={categoriesById[post.categoryId]}
              index={index}
            />
          ))}
        </div>
      )}
    </>
  );
}
