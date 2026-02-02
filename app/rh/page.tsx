"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { Users, Crosshair, Phone, Mail, ChevronRight, Play, CheckCircle } from "lucide-react";

export default function RHPage() {
  const [view, setView] = useState<'members' | 'tasks'>('members');
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('staff').select('*');
      if (data) setStaff(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        
        {/* COMMUTATEUR DE MODE */}
        <div className="flex justify-center shrink-0">
          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-80 shadow-2xl">
            <button 
              onClick={() => setView('members')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${view === 'members' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              <Users size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Membres</span>
            </button>
            <button 
              onClick={() => setView('tasks')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${view === 'tasks' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-400 hover:text-white'}`}
            >
              <Crosshair size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Missions</span>
            </button>
          </div>
        </div>

        {/* CONTENU DYNAMIQUE */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scroll">
          
          {view === 'members' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((member) => (
                <div key={member.id} className="glass-card p-5 border-t-2 border-t-emerald-500/30 relative overflow-hidden group hover:border-emerald-500/60 transition-all">
                  <div className="absolute top-0 right-0 p-2 text-[8px] font-black uppercase text-emerald-500 opacity-20">ID-TACTICAL</div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-gold p-0.5">
                       <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg font-bold">
                         {member.full_name.charAt(0)}
                       </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${member.status === 'En ligne' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {member.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight">{member.full_name}</h3>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">{member.role}</p>
                  
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <div className="flex items-center text-[10px] text-gray-400">
                      <Phone size={12} className="mr-2" /> {member.department}
                    </div>
                    <div className="flex items-center text-[10px] text-gray-400">
                      <Mail size={12} className="mr-2" /> {member.email}
                    </div>
                  </div>

                  <button className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center group-hover:text-emerald-400 transition-colors">
                    Scanner Profil <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* VUE MISSIONS TACTIQUES */
            <div className="flex flex-col gap-4">
               <div className="glass-card p-6 flex justify-between items-center border-l-4 border-l-gold">
                  <div>
                    <h3 className="text-xl font-bold text-gold italic uppercase">Opérations Actives</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Centre de commandement des départements</p>
                  </div>
                  <button className="bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all">
                    + Nouvelle Mission
                  </button>
               </div>

               {/* Exemple de tâche pour le visuel */}
               <div className="glass-card p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <Play size={16} className="text-emerald-400 ml-1" />
                    </div>
                    <div>
                      <h4 className="font-bold">Optimisation SEO Mine d'Or</h4>
                      <p className="text-[10px] text-gray-400 italic">Assigné à: Marie-Claire Keza • Marketing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">URGENT</span>
                    <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all">
                      TERMINER
                    </button>
                  </div>
               </div>
               
               {/* Bouton IA Rapport */}
               <button className="fixed bottom-8 right-8 bg-gradient-to-tr from-emerald-600 to-gold p-4 rounded-2xl shadow-2xl flex items-center space-x-3 hover:scale-105 transition-transform active:scale-95 z-50">
                  <CheckCircle size={20} className="text-white" />
                  <span className="text-xs font-black uppercase text-white tracking-widest">Générer Rapport IA (PDF)</span>
               </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
