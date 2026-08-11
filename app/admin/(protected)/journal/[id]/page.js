import { notFound } from "next/navigation";
import { getCategories, getPostForAdmin } from "@/lib/repositories/news";
import NewsForm from "@/components/admin/NewsForm";

export default async function EditPostPage({ params }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getPostForAdmin(id), getCategories()]);
  if (!post) notFound();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">{post.title}</h1>
        </div>
      </div>
      <div className="admin-card">
        <NewsForm post={post} categories={categories} />
      </div>
    </>
  );
}
