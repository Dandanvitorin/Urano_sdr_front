import { TeamList } from "@/components/team/TeamList";

export default function TeamPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Equipe</h1>
        <TeamList />
      </div>
    </div>
  );
}
