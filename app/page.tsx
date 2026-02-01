import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";

export default function Home() {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header avec cadre doré fluorescent */}
        <div className="gold-border-glow glass-card p-8 mb-10 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[100px] -z-10"></div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Tableau de Bord Stratégique</h2>
            <p className="text-emerald-400 font-medium">Bienvenue dans l'écosystème ECODREUM</p>
          </div>
          <button className="bg-gold text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(241,196,15,0.4)]">
            Exporter Data (BI)
          </button>
        </div>

        {/* Ligne des KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total eCo Générés" value="1.24M" change="+12%" />
          <StatCard title="eCoLixir Accumulé" value="3,500" change="+25%" />
          <StatCard title="Clients Actifs" value="8,450" change="Stable" />
          <StatCard title="Revenu Global" value="45.2M" change="+8%" />
        </div>

        {/* Zone de la Phase 3 (Graphiques et Carte) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 min-h-[400px]">
            <h3 className="text-xl font-bold text-gold mb-6">Flux Financier (30 Jours)</h3>
            <div className="flex items-center justify-center h-64 border border-dashed border-white/20 rounded-2xl text-gray-500">
               Graphique Recharts en chargement...
            </div>
          </div>
          <div className="glass-card p-8 min-h-[400px]">
            <h3 className="text-xl font-bold text-emerald-400 mb-6">Géo-Intelligence : Heatmap Burundi</h3>
            <div className="flex items-center justify-center h-64 border border-dashed border-white/20 rounded-2xl text-gray-500">
               Carte Interactive en préparation...
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
