"use client";

import { useState } from "react";

/**
 * Generic drag-and-drop reorderable list (native HTML5 DnD, no dependencies).
 * `onReorder(orderedIds)` is called after a drop with the new id order.
 */
export default function ReorderableList({ items, getId, renderRow, onReorder }) {
  const [list, setList] = useState(items);
  const [prevItems, setPrevItems] = useState(items);
  const [dragId, setDragId] = useState(null);

  // Reset local order when the parent passes a new items array, without an
  // effect (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  if (items !== prevItems) {
    setPrevItems(items);
    setList(items);
  }

  function handleDrop(targetId) {
    if (dragId === null || dragId === targetId) return;
    const next = [...list];
    const fromIndex = next.findIndex((item) => getId(item) === dragId);
    const toIndex = next.findIndex((item) => getId(item) === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setList(next);
    onReorder(next.map(getId));
    setDragId(null);
  }

  return (
    <div className="admin-list">
      {list.map((item) => {
        const id = getId(item);
        return (
          <div
            key={id}
            draggable
            onDragStart={() => setDragId(id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(id)}
          >
            {renderRow(item)}
          </div>
        );
      })}
    </div>
  );
}
