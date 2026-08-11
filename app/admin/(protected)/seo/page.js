import { getSeoPages } from "@/lib/repositories/seo";
import SeoPageCard from "@/components/admin/SeoPageCard";

export default async function AdminSeoPage() {
  const pages = await getSeoPages();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">SEO</h1>
          <p className="admin-subtitle">
            Title и Description для страниц, которые реально существуют на сайте.
            Остальные разделы («Турниры», «Тренировки» и т.д.) пока живут как
            блоки на главной странице — добавим им отдельный SEO, когда они
            станут отдельными страницами.
          </p>
        </div>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
        {pages.map((page) => (
          <SeoPageCard key={page.pageKey} page={page} />
        ))}
      </div>
    </>
  );
}
