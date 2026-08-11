"use client";

import { useRouter } from "next/navigation";
import { createTrainingOption, createTrainingPackage } from "@/lib/repositories/trainings";
import { PlusIcon } from "@/components/Icons";

export function AddOptionButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="admin-btn admin-btn--secondary admin-btn--sm"
      onClick={async () => {
        await createTrainingOption({
          title: "Новая тренировка",
          description: "",
          price: "0 €",
          unit: "тренировка",
        });
        router.refresh();
      }}
    >
      <PlusIcon width={14} height={14} /> Добавить тренировку
    </button>
  );
}

export function AddPackageButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="admin-btn admin-btn--secondary admin-btn--sm"
      onClick={async () => {
        await createTrainingPackage({ title: "Новый пакет" });
        router.refresh();
      }}
    >
      <PlusIcon width={14} height={14} /> Добавить пакет
    </button>
  );
}
