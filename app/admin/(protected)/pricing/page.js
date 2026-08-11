import { getTrainingOptions, getTrainingPackages } from "@/lib/repositories/trainings";
import TrainingOptionCard from "@/components/admin/TrainingOptionCard";
import TrainingPackageCard from "@/components/admin/TrainingPackageCard";
import { AddOptionButton, AddPackageButton } from "@/components/admin/AddTrainingButtons";

export default async function AdminPricingPage() {
  const [options, packages] = await Promise.all([
    getTrainingOptions(),
    getTrainingPackages(),
  ]);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Цены</h1>
          <p className="admin-subtitle">
            Меняйте цены и условия — изменения сразу появятся на сайте.
          </p>
        </div>
      </div>

      <h2 className="admin-section-title">Тренировки</h2>
      <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        {options.map((option) => (
          <TrainingOptionCard key={option.id} option={option} />
        ))}
      </div>
      <AddOptionButton />

      <h2 className="admin-section-title" style={{ marginTop: 40 }}>
        Пакеты
      </h2>
      <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))" }}>
        {packages.map((pkg) => (
          <TrainingPackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
      <AddPackageButton />
    </>
  );
}
