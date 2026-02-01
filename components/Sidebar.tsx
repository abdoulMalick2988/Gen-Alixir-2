import { LayoutDashboard, Users, ShieldCheck, PieChart, Calendar, Settings } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "RH Interne", active: false },
  { icon: ShieldCheck, label: "Partenaires", active: false },
  { icon: PieChart, label: "Mine d'Or Data", active: false },
  { icon: Calendar, label: "Événements", active: false },
  { icon: Settings, label: "Paramètres", active: false },
];

export default function Sidebar() {
  return (
    <div className="w-72 h-screen glass-card rounded-none border-y-0 border-l-0 border-r border-white/10 p-6 flex flex-col">
      <div className="mb-12">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-gold text-transparent bg-clip-text">
          ECODREUM
        </h1>
        <p className="text-[10px] text-gold tracking-[0.3em] uppercase">Intelligence Engine</p>
      </div>
      <nav className="space-y-4">
        {navItems.map((item) => (
          <div key={item.label} className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all ${item.active ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <item.icon size={22} />
            <span className="font-semibold">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
