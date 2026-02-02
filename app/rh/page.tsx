"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { Users, Crosshair, Phone, Mail, ChevronRight, Play, CheckCircle, Plus, Zap } from "lucide-react";

export default function RHPage() {
  const [view, setView] = useState<'members' | 'tasks'>('members');
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Simulation d'un scan ultra-rapide pour l'effet visuel
      const { data } = await supabase.from('staff').select('*').order('full_name');
      if (data) setStaff(data);
      
      // Petit délai pour laisser l'animation de scan se terminer proprement
      setTimeout(() => setLoading(false), 800);
    }
    fetchData();
  }, []);

  // ÉCRAN DE CHARGEMENT "SCANNER" (Anti-Lag & Esthétique)
  if (loading) {
    return (
      <div className="flex h-screen bg-[#050a08] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <Zap className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={24} />
          </div>
          <div className="text-center">
            <p className="text-emerald-500 font-black tracking-[0.3em] text-[10px] uppercase mb-2">Cryptage de la liaison...</p>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-[progress_1.5s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 50%; margin-left: 25%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        
        {/* HEADER TACTIQUE AVEC COMMUTATEUR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter">HUMAN ENGINE <span className="text-emerald-500">ECODREUM</span></h1>
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-bold">Système de commandement RH v2.0</p>
          </div>

          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-full md:w-80 shadow-2xl">
            <button 
              onClick={() => setView('members')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all duration-300 ${view === 'members' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              <Users size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Armée</span>
            </button>
            <button 
              onClick={() => setView('tasks')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all duration-300 ${view === 'tasks' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white'}`}
            >
              <Crosshair size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Missions</span>
            </button>
          </div>
        </div>

        {/* ZONE DE CONTENU (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scroll">
          
          {view === 'members' ? (
            /* GRILLE DES MEMBRES D'ÉLITE */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
              {staff.map((member) => (
                <div key={member.id} className="glass-card p-5 border-t-2 border-t-emerald-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-gold/20 border border-white/10 flex items-center justify-center text-2xl font-black text-white italic">
                         {member.full_name.charAt(0)}
                       </div>
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black animate-pulse"></div>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Performance</p>
                       <p className="text-xl font-black italic">{member.performance_score}%</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-black tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{member.full_name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">
                       {member.department}
                    </span>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                       {member.role}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4 mb-4">
                    <div className="flex items-center text-[9px] text-gray-400">
                      <Mail size={12} className="mr-2 text-emerald-500" /> {member.email.split('@')[0]}
                    </div>
                    <div className="flex items-center text-[9px] text-gray-400">
                      <Phone size={12} className="mr-2 text-emerald-500" /> +257 -- ---
                    </div>
                  </div>

                  <button className="w-full py-2.5 bg-emerald-500/5 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center transition-all">
                    Ouvrir Dossier Tactique <ChevronRight size={12} className="ml-2" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* VUE MISSIONS TACTIQUES */
            <div className="space-y-4 pb-20">
               <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-l-gold bg-gold/5">
                  <div>
                    <h3 className="text-xl font-black text-gold italic uppercase leading-none mb-1">Cockpit des Opérations</h3>
                    <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em]">Déploiement en temps réel</p>
                  </div>
                  <button className="w-full md:w-auto bg-gold hover:bg-
