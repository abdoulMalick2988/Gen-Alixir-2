// On remplace @/components par ../components
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import MainChart from "../components/MainChart";
import LoyaltyChart from "../components/LoyaltyChart";

export default function Home() {
  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Gold Glow */}
        <div className="gold-border-glow glass-card p-8 mb-10 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[100px] -z-10"></div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">ECODREUM BI Engine</h2>
            <p className="text-emerald-400 font-medium uppercase tracking-widest text-sm">Strategic Intelligence Layer</p>
          </div>
          <div className="mt-4 md:mt-0 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-gray-400 text-xs block">Niveau Système</span>
            <span className="text-gold font-bold">ELITE ACCESS</span>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total eCo" value="1.24M" change="+12%" />
          <StatCard title="eCoLixir" value="3,500" change="+25%" />
          <StatCard title="Clients" value="8,450" change="Stable" />
          <StatCard title="Revenue" value="45.2M" change="+8%" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
              Flux Financier Stratégique
            </h3>
            <MainChart />
          </div>
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-gold rounded-full mr-3"></span>
              Segments de Fidélité
            </h3>
            <LoyaltyChart />
          </div>
        </div>
      </main>
    </div>
  );
}
