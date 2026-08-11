import { getCategories } from "@/lib/repositories/news";
import NewsForm from "@/components/admin/NewsForm";

export default async function NewPostPage() {
  const categories = await getCategories();
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Новая новость</h1>
        </div>
      </div>
      <div className="admin-card">
        <NewsForm categories={categories} />
      </div>
    </>
  );
}
