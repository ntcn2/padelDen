import { getTournaments } from "@/lib/repositories/tournament";
import TournamentsList from "@/components/admin/TournamentsList";

export default async function AdminTournamentsPage() {
  const tournaments = await getTournaments();

  return <TournamentsList tournaments={tournaments} />;
}
