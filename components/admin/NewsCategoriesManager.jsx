"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
} from "@/lib/repositories/news";
import { CloseIcon, PlusIcon } from "@/components/Icons";

export default function NewsCategoriesManager({ categories }) {
  const [newName, setNewName] = useState("");
  const [dragId, setDragId] = useState(null);
  const router = useRouter();

  async function handleAdd() {
    if (!newName.trim()) return;
    await createCategory(newName.trim());
    setNewName("");
    router.refresh();
  }

  async function handleRename(id, current) {
    const name = prompt("Новое название категории", current);
    if (!name || !name.trim()) return;
    await renameCategory(id, name.trim());
    router.refresh();
  }

  async function handleDelete(id) {
    if (!confirm("Удалить категорию? У новостей в ней останется ссылка на неё.")) return;
    await deleteCategory(id);
    router.refresh();
  }

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const ids = categories.map((c) => c.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderCategories(ids);
    setDragId(null);
    router.refresh();
  }

  return (
    <div className="admin-tabs-manage">
      {categories.map((cat) => (
        <span
          key={cat.id}
          draggable
          onDragStart={() => setDragId(cat.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(cat.id)}
          className="admin-tab-chip"
        >
          {cat.name}
          <span className="admin-tab-chip__x" onClick={() => handleRename(cat.id, cat.name)} title="Переименовать">
            ✎
          </span>
          <span className="admin-tab-chip__x" onClick={() => handleDelete(cat.id)} title="Удалить">
            <CloseIcon width={12} height={12} />
          </span>
        </span>
      ))}
      <input
        className="admin-input"
        style={{ width: 160, padding: "8px 12px" }}
        placeholder="Новая категория…"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <button type="button" className="admin-btn admin-btn--secondary admin-btn--sm" onClick={handleAdd}>
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  );
}
