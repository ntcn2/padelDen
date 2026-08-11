"use client";

import { useState } from "react";

/**
 * Hover-driven accordion: exactly one item is "open" at a time.
 * Defaults to `defaultIndex`; hovering another item opens it and
 * closes the previous one; leaving the whole group reverts to the default.
 */
export function useAccordion(defaultIndex = 0) {
  const [openIndex, setOpenIndex] = useState(defaultIndex);

  return {
    openIndex,
    groupProps: {
      onMouseLeave: () => setOpenIndex(defaultIndex),
    },
    itemProps: (index) => ({
      onMouseEnter: () => setOpenIndex(index),
      "data-open": index === openIndex,
    }),
  };
}
