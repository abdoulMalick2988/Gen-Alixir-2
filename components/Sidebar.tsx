"use client";
import { LayoutDashboard, Users, ShieldCheck, PieChart, Calendar, Settings, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "RH Interne", href: "/rh" },
  { icon: ShieldCheck, label: "Partenaires", href: "/partners" },
  { icon: Users2, label: "Clients", href: "/clients" },
  { icon: PieChart, label: "Mine d'Or Data", href: "/data" },
  { icon: Calendar, label: "Événements", href: "/events" },
  { icon: Settings, label: "Paramètres", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 h-screen bg-transparent border-r border-white/10 p-6 flex flex-col backdrop-blur-xl">
      <div className="mb-12">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-gold text-transparent bg-clip-text">
          ECODREUM
        </h1>
        <p className="text-[10px] text-gold tracking-[0.3em] uppercase font-bold italic">Intelligence Engine</p>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href}>
              <div className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all ${
                isActive 
                ? 'bg-white/10 text-emerald-400 border border-white/10 shadow-[0_0_15px_rgba(46,204,113,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}>
                <item.icon size={20} />
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
