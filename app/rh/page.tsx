"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { Users, Crosshair, Phone, Mail, ChevronRight, Play, CheckCircle, Plus, Zap, Loader2 } from "lucide-react";

export default function RHPage() {
  const [view, setView] = useState<'members' | 'tasks'>('members');
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('staff').select('*').order('full_name');
        if (data) setStaff(data);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#020504] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <Loader2 className="w-full h-full text-emerald-500 animate-spin opacity-20" size={48} />
            <Zap className="absolute text-emerald-400 animate-pulse" size={32} />
          </div>
          <p className="text-emerald-500 font-black tracking-[0.4em] text-[10px] uppercase animate-pulse">Initialisation du Scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">HUMAN <span className="text-emerald-500">ENGINE</span></h1>
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-bold italic">Système Tactique v2</p>
          </div>

          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-full md:w-80 shadow-2xl">
            <button 
              onClick={() => setView('members')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all duration-300 ${view === 'members' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
            >
              <Users size={16} />
              <span className="text-[10px] font-black uppercase">Armée</span>
            </button>
            <button 
              onClick={() => setView('tasks')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all duration-300 ${view === 'tasks' ? 'bg-gold text-black' : 'text-gray-400'}`}
            >
              <Crosshair size={16} />
              <span className="text-[10px] font-black uppercase">Missions</span>
            </button>
          </div>
        </div>

        {/* CONTENU */}
        <div className="flex-1 overflow-y-auto pr-2">
          {view === 'members' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
              {staff.map((member) => (
                <div key={member.id} className="glass-card p-5 border-t-2 border-t-emerald-500/30 relative group hover:scale-[1.01] transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-emerald-500">
                      {member.full_name?.charAt(0)}
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] text-emerald-500 font-black uppercase">Efficacité</p>
                       <p className="text-xl font-black italic">{member.performance_score}%</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-black tracking-tight uppercase">{member.full_name}</h3>
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">{member.role} • {member.department}</p>
                  <div className="border-t border-white/5 pt-4 mb-4 text-[10px] text-gray-400">
                    <div className="flex items-center"><Mail size={12} className="mr-2 text-emerald-500" /> {member.email}</div>
                  </div>
                  <button className="w-full py-2.5 bg-emerald-500/5 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                    Scanner Profil
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pb-20">
               <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-l-gold bg-gold/5">
                  <div>
                    <h3 className="text-xl font-black text-gold italic uppercase">Opérations Actives</h3>
                    <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em]">Déploiement tactique</p>
                  </div>
                  <button className="bg-gold text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center shadow-lg active:scale-95 transition-all">
                    <Plus size={16} className="mr-2" /> Nouvelle Mission
                  </button>
               </div>
               {/* Carte Mission Factice */}
               <div className="glass-card p-5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <Play size={18} className="text-emerald-500 ml-1" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">Mission Tactique Alpha</h4>
                      <p className="text-[9px] text-emerald-500 font-bold uppercase">Statut: En cours</p>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-emerald-500 text-black rounded-xl text-[9px] font-black uppercase transition-all">
                    Rapport IA
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* BTN IA */}
        <button className="fixed bottom-6 right-6 bg-gradient-to-br from-emerald-500 to-gold p-4 rounded-2xl shadow-2xl flex items-center space-x-3 hover:scale-110 transition-all z-50">
           <CheckCircle size={20} className="text-black" />
           <div className="pr-2 text-black text-left">
              <p className="text-[8px] font-black uppercase leading-none opacity-60">IA Engine</p>
              <p className="text-[10px] font-black uppercase italic">Générer Rapport</p>
           </div>
        </button>
      </main>
    </div>
  );
}
