"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost, togglePublish } from "@/lib/repositories/news";
import { EditIcon, TrashIcon } from "@/components/Icons";

export default function NewsList({ posts, categoriesById }) {
  const router = useRouter();

  async function handleDelete(id) {
    if (!confirm("Удалить эту новость?")) return;
    await deletePost(id);
    router.refresh();
  }

  async function handleToggle(id) {
    await togglePublish(id);
    router.refresh();
  }

  if (posts.length === 0) {
    return <div className="admin-empty">Пока нет новостей. Создайте первую.</div>;
  }

  return (
    <div className="admin-list">
      {posts.map((post) => (
        <div key={post.id} className="admin-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="admin-row__thumb" src={post.coverImage} alt="" />
          <div className="admin-row__body">
            <div className="admin-row__title">{post.title}</div>
            <div className="admin-row__meta">
              {categoriesById[post.categoryId] || "Без категории"} · {post.publishedAt}
            </div>
          </div>
          <button
            type="button"
            className={`admin-badge ${post.published ? "admin-badge--on" : "admin-badge--off"}`}
            onClick={() => handleToggle(post.id)}
            style={{ cursor: "pointer" }}
          >
            {post.published ? "Опубликовано" : "Черновик"}
          </button>
          <div className="admin-row__actions">
            <Link href={`/admin/journal/${post.id}`} className="admin-btn admin-btn--secondary admin-btn--sm">
              <EditIcon width={14} height={14} />
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--danger admin-btn--sm"
              onClick={() => handleDelete(post.id)}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
