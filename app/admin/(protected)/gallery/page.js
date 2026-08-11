import { getGalleryData } from "@/lib/repositories/gallery";
import GalleryAdmin from "@/components/admin/GalleryAdmin";

export default async function AdminGalleryPage() {
  const { categories, photos } = await getGalleryData();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Галерея</h1>
          <p className="admin-subtitle">
            Табы, фото и их порядок — так же, как на сайте. Таб «Все» собирается
            автоматически.
          </p>
        </div>
      </div>

      <GalleryAdmin categories={categories} photos={photos} />
    </>
  );
}
