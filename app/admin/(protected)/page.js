import Link from "next/link";
import { getAllGames, getPublishedGames } from "@/lib/repositories/games";
import { getAllPosts, getPublishedPosts } from "@/lib/repositories/news";
import { getGalleryData } from "@/lib/repositories/gallery";

export default async function AdminDashboard() {
  const [allGames, publishedGames, allPosts, publishedPosts, gallery] =
    await Promise.all([
      getAllGames(),
      getPublishedGames(),
      getAllPosts(),
      getPublishedPosts(),
      getGalleryData(),
    ]);

  const upcoming = [...publishedGames].slice(0, 3);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-subtitle">Быстрый обзор того, что происходит на сайте.</p>
        </div>
      </div>

      <div className="admin-quick-actions">
        <Link href="/admin/games/new" className="admin-btn admin-btn--accent">
          + Добавить игру
        </Link>
        <Link href="/admin/journal/new" className="admin-btn admin-btn--primary">
          + Создать новость
        </Link>
        <Link href="/admin/gallery" className="admin-btn admin-btn--secondary">
          + Загрузить фотографии
        </Link>
      </div>

      <div className="admin-grid">
        <div className="admin-card admin-stat">
          <span className="admin-stat__value">{publishedGames.length}</span>
          <span className="admin-stat__label">
            опубликованных игр из {allGames.length}
          </span>
        </div>
        <div className="admin-card admin-stat">
          <span className="admin-stat__value">{publishedPosts.length}</span>
          <span className="admin-stat__label">
            опубликованных новостей из {allPosts.length}
          </span>
        </div>
        <div className="admin-card admin-stat">
          <span className="admin-stat__value">{gallery.photos.length}</span>
          <span className="admin-stat__label">
            фото в {gallery.categories.length} категориях
          </span>
        </div>
      </div>

      <h2 className="admin-section-title">Ближайшие игры</h2>
      {upcoming.length === 0 ? (
        <div className="admin-empty">Пока нет опубликованных игр.</div>
      ) : (
        <div className="admin-list">
          {upcoming.map((game) => (
            <Link
              key={game.id}
              href={`/admin/games/${game.id}`}
              className="admin-row"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="admin-row__thumb" src={game.photo} alt="" />
              <div className="admin-row__body">
                <div className="admin-row__title">{game.title}</div>
                <div className="admin-row__meta">
                  {game.dayOfWeek}, {game.date} · {game.time} · {game.price}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
