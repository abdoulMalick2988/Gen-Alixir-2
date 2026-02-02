"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { Users, Crosshair, ChevronLeft, Mail, Play, CheckCircle, Plus, Zap, Loader2, Star } from "lucide-react";

const DEPARTMENTS = [
  "Management", "Marketing", "Ventes", "Finances", 
  "Juridique", "Relations Publiques", "Technique", "Ressources Humaines"
];

export default function RHPage() {
  const [view, setView] = useState<'members' | 'tasks'>('members');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.from('staff').select('*');
        if (data) setStaff(data);
      } catch (err) { console.error(err); }
      finally { setTimeout(() => setLoading(false), 800); }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#020504] items-center justify-center">
        <Zap className="text-emerald-500 animate-pulse" size={48} />
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
          </div>

          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-full md:w-80 shadow-2xl">
            <button onClick={() => setView('members')} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${view === 'members' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}>
              <Users size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Collaborateurs</span>
            </button>
            <button onClick={() => setView('tasks')} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${view === 'tasks' ? 'bg-gold text-black' : 'text-gray-400'}`}>
              <Crosshair size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Missions</span>
            </button>
          </div>
        </div>

        {/* ZONE DE CONTENU */}
        <div className="flex-1 overflow-y-auto pr-2">
          {view === 'members' ? (
            <>
              {!selectedDept ? (
                /* VUE DES DÉPARTEMENTS (ORBITES) */
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {DEPARTMENTS.map((dept) => (
                    <button 
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className="glass-card p-8 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group flex flex-col items-center justify-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="text-emerald-500" size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-center">{dept}</span>
                    </button>
                  ))}
                </div>
              ) : (
                /* VUE SYSTÈME SOLAIRE DU DÉPARTEMENT */
                <div className="h-full flex flex-col">
                  <button onClick={() => setSelectedDept(null)} className="flex items-center text-xs font-bold text-emerald-500 mb-8 hover:underline">
                    <ChevronLeft size={16} /> Retour aux départements
                  </button>
                  
                  <div className="flex-1 relative flex items-center justify-center">
                    {/* CENTRE : CHEF DE DEPARTEMENT (SOLEIL DORE) */}
                    {staff.filter(m => m.department === selectedDept && m.role.toLowerCase().includes('chef' || 'ceo')).map((chef) => (
                      <div key={chef.id} className="relative z-10 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-black border-4 border-gold shadow-[0_0_30px_rgba(241,196,15,0.4)] flex items-center justify-center mb-4">
                          <span className="text-3xl font-black text-gold italic">{chef.full_name.charAt(0)}</span>
                        </div>
                        <p className="text-gold font-black uppercase tracking-tighter text-sm">{chef.full_name}</p>
                        <p className="text-[9px] text-white/50 uppercase font-bold tracking-widest">Chef d'Orbite</p>
                      </div>
                    ))}

                    {/* SATELLITES : COLLABORATEURS (CERCLES VERTS) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                       {staff.filter(m => m.department === selectedDept && !m.role.toLowerCase().includes('chef' || 'ceo')).map((member, index, array) => {
                         const angle = (index / array.length) * (2 * Math.PI);
                         const radius = 220; // Distance du centre
                         const x = Math.cos(angle) * radius;
                         const y = Math.sin(angle) * radius;
                         
                         return (
                           <div 
                             key={member.id}
                             style={{ transform: `translate(${x}px, ${y}px)` }}
                             className="absolute flex flex-col items-center group cursor-pointer"
                           >
                             <div className="w-16 h-16 rounded-full bg-black border-2 border-emerald-500 shadow-[0_0_15px_rgba(46,204,113,0.3)] flex items-center justify-center hover:scale-110 transition-transform">
                               <span className="text-sm font-bold text-emerald-500">{member.full_name.charAt(0)}</span>
                             </div>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-10 bg-black/80 p-2 rounded border border-emerald-500/30 w-32 text-center pointer-events-none">
                               <p className="text-[8px] font-black uppercase">{member.full_name}</p>
                               <p className="text-[7px] text-emerald-400 uppercase">{member.role}</p>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                    {/* Orbite visuelle (Cercle en pointillés) */}
                    <div className="absolute w-[440px] h-[440px] border border-white/5 rounded-full border-dashed animate-[spin_60s_linear_infinite]"></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* VUE MISSIONS (Identique à avant) */
            <div className="space-y-4 pb-20">
               <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-l-gold bg-gold/5">
                  <h3 className="text-xl font-black text-gold italic uppercase leading-none">Missions Stratégiques</h3>
                  <button className="bg-gold text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center shadow-lg active:scale-95 transition-all">
                    <Plus size={16} className="mr-2" /> Injecter Mission
                  </button>
               </div>
               <div className="glass-card p-5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-500"><Zap size={20}/></div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight italic">Scan de Marché v1</h4>
                      <p className="text-[9px] text-emerald-500 font-black uppercase">Statut: Actif</p>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase">Détails</button>
               </div>
            </div>
          )}
        </div>

        {/* BTN IA */}
        <button className="fixed bottom-6 right-6 bg-gradient-to-br from-emerald-500 to-gold p-4 rounded-2xl shadow-2xl flex items-center space-x-3 hover:scale-110 transition-all z-50">
           <CheckCircle size={20} className="text-black" />
           <div className="pr-2 text-black text-left">
              <p className="text-[8px] font-black uppercase leading-none opacity-60">IA Scanner</p>
              <p className="text-[10px] font-black uppercase italic">Rapport Final</p>
           </div>
        </button>
      </main>
    </div>
  );
}
