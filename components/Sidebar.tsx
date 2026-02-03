"use client";

import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, Users, ShieldCheck, PieChart, 
  Calendar, Settings, Users2, Sun, Moon 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "../components/ThemeProvider"; // Import du moteur qu'on a créé

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
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Évite le décalage visuel au chargement
  useEffect(() => setMounted(true), []);

  return (
    <div className="w-72 h-screen flex flex-col p-6 rounded-none border-y-0 border-l-0 transition-colors duration-300 bg-zinc-50 border-zinc-200 dark:bg-[#050505] dark:border-white/10 dark:glass-card">
      
      {/* HEADER LOGO */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-amber-500 dark:from-emerald-400 dark:to-gold text-transparent bg-clip-text transition-all">
          ECODREUM
        </h1>
        <p className="text-[10px] text-amber-600 dark:text-gold tracking-[0.3em] uppercase font-bold italic">
          Intelligence Engine
        </p>
      </div>
      
      {/* NAVIGATION */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href}>
              <div className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all ${
                isActive 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm dark:bg-white/10 dark:text-emerald-400 dark:border-white/10 dark:shadow-[0_0_15px_rgba(46,204,113,0.1)] border' 
                : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10'
              }`}>
                <item.icon size={20} />
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER : BOUTON DARK/LIGHT MODE */}
      <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-white/10">
        {mounted && (
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-amber-500" />
            ) : (
              <Moon size={20} className="text-blue-500" />
            )}
            <span className="font-semibold text-sm uppercase tracking-widest text-[10px]">
              Mode {theme === "dark" ? "Clair" : "Sombre"}
            </span>
          </button>
        )}
      </div>

    </div>
  );
}
