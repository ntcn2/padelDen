"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const INTERVAL = 20_000;

// Перезапрашивает данные страницы, пока вкладка открыта. Открытая категория
// и прокрутка сохраняются: router.refresh() не сбрасывает состояние клиента.
export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(tick, INTERVAL);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router]);

  return null;
}
