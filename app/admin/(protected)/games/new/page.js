import GameForm from "@/components/admin/GameForm";

export default function NewGamePage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Новая игра</h1>
        </div>
      </div>
      <div className="admin-card">
        <GameForm />
      </div>
    </>
  );
}
