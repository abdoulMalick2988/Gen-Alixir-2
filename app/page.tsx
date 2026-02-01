import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import MainChart from "../components/MainChart";
import LoyaltyChart from "../components/LoyaltyChart";
import LockedOverlay from "../components/LockedOverlay";

export default function Home() {
  // --- MODIFICATION ICI (Ligne 11) ---
  // On ajoute "as string" pour que TypeScript accepte la comparaison plus bas
  const currentPartnerLevel = 'Elite' as string; 

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* HEADER AVEC CADRE DORÉ FLUORESCENT */}
        <div className="gold-border-glow glass-card p-8 mb-10 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[100px] -z-10"></div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">ECODREUM BI Engine</h2>
            <p className="text-emerald-400 font-medium uppercase tracking-widest text-sm italic">Intelligence Panafricaine v1.0</p>
          </div>
          <div className="mt-4 md:mt-0 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-end">
            <span className="text-gray-400 text-[10px] uppercase tracking-tighter">Statut Partenaire</span>
            <span className="text-gold font-bold text-lg">{currentPartnerLevel.toUpperCase()} ACCESS</span>
          </div>
        </div>

        {/* GRILLE DES KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total eCo Générés" value="1.24M" change="+12%" />
          <StatCard title="eCoLixir Accumulé" value="3,500" change="+25%" />
          <StatCard title="Engagement Score" value="78.5%" change="+3.2%" />
          <StatCard title="Revenue (XAF)" value="45.2M" change="+8%" />
        </div>

        {/* ZONE ANALYTIQUE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GRAPHIQUE DE FLUX */}
          <div className="lg:col-span-2 glass-card p-8 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 shadow-[0_0_8px_#2ecc71]"></span>
              Flux Financier Stratégique (30 Jours)
            </h3>
            <MainChart />
          </div>

          {/* ANALYSE DÉMOGRAPHIQUE - LOGIQUE DE VERROUILLAGE */}
          <div className="glass-card p-8 relative overflow-hidden group">
            {currentPartnerLevel !== 'Elite' && <LockedOverlay levelRequired="ELITE" />}
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-gold rounded-full mr-3 shadow-[0_0_8px_#f1c40f]"></span>
              Segments de Fidélité
            </h3>
            <div className={currentPartnerLevel !== 'Elite' ? 'blur-md grayscale opacity-50' : ''}>
                <LoyaltyChart />
            </div>
          </div>

        </div>

        {/* SECTION GÉO-INTELLIGENCE - LOGIQUE DE VERROUILLAGE */}
        <div className="mt-8 glass-card p-8 min-h-[400px] relative overflow-hidden">
           {currentPartnerLevel !== 'Elite' && <LockedOverlay levelRequired="ELITE" />}
           
           <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center">
              <span className="w-4 h-4 bg-emerald-500/20 border border-emerald-500 rounded-sm mr-3"></span>
              Géo-Intelligence : Heatmap Burundi
           </h3>
           <div className={`h-80 bg-emerald-900/5 rounded-3xl border border-white/5 flex flex-col items-center justify-center ${currentPartnerLevel !== 'Elite' ? 'blur-xl' : ''}`}>
              <div className="animate-pulse text-emerald-500 font-mono text-sm uppercase tracking-[0.5em]">
                Scanning Geographical Data...
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
