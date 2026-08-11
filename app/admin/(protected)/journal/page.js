import Link from "next/link";
import { getAllPosts, getCategories } from "@/lib/repositories/news";
import NewsList from "@/components/admin/NewsList";
import NewsCategoriesManager from "@/components/admin/NewsCategoriesManager";

export default async function AdminJournalPage() {
  const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);
  const categoriesById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Padel Journal</h1>
          <p className="admin-subtitle">Новости и категории. Табы на сайте формируются автоматически.</p>
        </div>
        <Link href="/admin/journal/new" className="admin-btn admin-btn--accent">
          + Создать новость
        </Link>
      </div>

      <h2 className="admin-section-title">Категории</h2>
      <NewsCategoriesManager categories={categories} />

      <h2 className="admin-section-title" style={{ marginTop: 28 }}>
        Все новости
      </h2>
      <NewsList posts={posts} categoriesById={categoriesById} />
    </>
  );
}
