import Sidebar from "../../components/Sidebar";

export default function RHPage() {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-emerald-400">RH Interne</h1>
        <div className="mt-8 glass-card p-6 border border-white/10">
          <p className="text-gray-400">Gestion des agents ECODREUM et performances terrain.</p>
          <div className="mt-4 p-4 bg-white/5 rounded-lg italic text-sm">Chargement de l'annuaire agents...</div>
        </div>
      </main>
    </div>
  );
}
