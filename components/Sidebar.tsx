import { LayoutDashboard, Users, ShieldCheck, PieChart, Calendar, Settings } from "lucide-react";
import Link from "next/link"; // Import indispensable pour la navigation
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "RH Interne", href: "/rh" },
  { icon: ShieldCheck, label: "Partenaires", href: "/partners" },
  { icon: Contact2, label: "Clients", href: "/clients" },
  { icon: PieChart, label: "Mine d'Or Data", href: "/data" },
  { icon: Calendar, label: "Événements", href: "/events" },
  { icon: Settings, label: "Paramètres", href: "/settings" },
];

export default function Sidebar() {
  return (
    <div className="w-72 h-screen glass-card rounded-none border-y-0 border-l-0 border-r border-white/10 p-6 flex flex-col">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-gold text-transparent bg-clip-text">
          ECODREUM
        </h1>
        <p className="text-[10px] text-gold tracking-[0.3em] uppercase font-bold">Intelligence Engine</p>
      </div>
      <nav className="space-y-4">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all text-gray-400 hover:text-white hover:bg-white/5 mb-2">
              <item.icon size={22} />
              <span className="font-semibold">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
