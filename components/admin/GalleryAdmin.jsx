"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPhotos,
  createCategory,
  deleteCategory,
  deletePhoto,
  movePhotoToCategory,
  renameCategory,
  reorderCategories,
  reorderPhotos,
  updatePhoto,
} from "@/lib/repositories/gallery";
import { CloseIcon, PlusIcon, TrashIcon } from "@/components/Icons";

const ALL = "__all__";

export default function GalleryAdmin({ categories, photos }) {
  const [active, setActive] = useState(categories[0]?.id || ALL);
  const [newCatName, setNewCatName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragPhotoId, setDragPhotoId] = useState(null);
  const [catDragId, setCatDragId] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const visiblePhotos =
    active === ALL ? photos : photos.filter((p) => p.categoryId === active);

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    const cat = await createCategory(newCatName.trim());
    setNewCatName("");
    setActive(cat.id);
    router.refresh();
  }

  async function handleRenameCategory(id, currentName) {
    const name = prompt("Новое название таба", currentName);
    if (!name || !name.trim()) return;
    await renameCategory(id, name.trim());
    router.refresh();
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Удалить таб? Фото внутри тоже будут удалены.")) return;
    await deleteCategory(id);
    if (active === id) setActive(ALL);
    router.refresh();
  }

  function handleCategoryDrop(targetId) {
    if (!catDragId || catDragId === targetId) return;
    const ids = categories.map((c) => c.id);
    const from = ids.indexOf(catDragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderCategories(ids);
    setCatDragId(null);
    router.refresh();
  }

  async function handleFiles(fileList) {
    if (active === ALL) {
      alert("Выберите конкретный таб, чтобы загрузить фото в него.");
      return;
    }
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const formData = new FormData();
    formData.set("categoryId", active);
    files.forEach((file) => formData.append("files", file));
    await addPhotos(formData);
    router.refresh();
  }

  async function handleDeletePhoto(id) {
    if (!confirm("Удалить фото?")) return;
    await deletePhoto(id);
    router.refresh();
  }

  async function handleEditAlt(id, currentAlt) {
    const alt = prompt("Alt-текст изображения", currentAlt || "");
    if (alt === null) return;
    await updatePhoto(id, { alt });
    router.refresh();
  }

  async function handleMoveCategory(id, categoryId) {
    await movePhotoToCategory(id, categoryId);
    router.refresh();
  }

  function handlePhotoDrop(targetId) {
    if (!dragPhotoId || dragPhotoId === targetId || active === ALL) return;
    const ids = visiblePhotos.map((p) => p.id);
    const from = ids.indexOf(dragPhotoId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderPhotos(active, ids);
    setDragPhotoId(null);
    router.refresh();
  }

  return (
    <>
      <div className="admin-tabs-manage">
        <button
          type="button"
          className={`admin-tab-chip${active === ALL ? " admin-tab-chip--active" : ""}`}
          onClick={() => setActive(ALL)}
        >
          Все ({photos.length})
        </button>
        {categories.map((cat) => (
          <span
            key={cat.id}
            draggable
            onDragStart={() => setCatDragId(cat.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleCategoryDrop(cat.id)}
            className={`admin-tab-chip${active === cat.id ? " admin-tab-chip--active" : ""}`}
            onClick={() => setActive(cat.id)}
            style={{ cursor: "pointer" }}
          >
            {cat.name} ({photos.filter((p) => p.categoryId === cat.id).length})
            <span
              className="admin-tab-chip__x"
              onClick={(e) => {
                e.stopPropagation();
                handleRenameCategory(cat.id, cat.name);
              }}
              title="Переименовать"
            >
              ✎
            </span>
            <span
              className="admin-tab-chip__x"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(cat.id);
              }}
              title="Удалить таб"
            >
              <CloseIcon width={12} height={12} />
            </span>
          </span>
        ))}
        <input
          className="admin-input"
          style={{ width: 160, padding: "8px 12px" }}
          placeholder="Новый таб…"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
        />
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={handleAddCategory}>
          <PlusIcon width={14} height={14} />
        </button>
      </div>

      {active !== ALL && (
        <div
          className={`admin-dropzone${dragOver ? " admin-dropzone--active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          Перетащите фотографии сюда или нажмите, чтобы выбрать (можно сразу несколько)
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {visiblePhotos.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: 20 }}>
          Пока нет фотографий в этом разделе.
        </div>
      ) : (
        <div className="admin-photo-grid">
          {visiblePhotos.map((photo) => (
            <div
              key={photo.id}
              className="admin-photo"
              draggable={active !== ALL}
              onDragStart={() => setDragPhotoId(photo.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handlePhotoDrop(photo.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.alt} />
              <div className="admin-photo__overlay">
                <select
                  value={photo.categoryId}
                  onChange={(e) => handleMoveCategory(photo.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 11, borderRadius: 6, border: "none", padding: "3px 4px" }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span style={{ display: "flex", gap: 4 }}>
                  <span
                    className="admin-photo__btn"
                    onClick={() => handleEditAlt(photo.id, photo.alt)}
                    title="Alt-текст"
                  >
                    ✎
                  </span>
                  <span
                    className="admin-photo__btn"
                    onClick={() => handleDeletePhoto(photo.id)}
                    title="Удалить"
                  >
                    <TrashIcon width={14} height={14} />
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
