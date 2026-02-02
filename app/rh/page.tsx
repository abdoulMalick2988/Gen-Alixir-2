"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { Users, Crosshair, ChevronLeft, Play, CheckCircle, Plus, Zap, Star, X, Loader2 } from "lucide-react";

const DEPARTMENTS = [
  "Management", "Marketing", "Ventes", "Finances", 
  "Juridique", "Relations Publiques", "Technique", "Ressources Humaines"
];

// --- COMPOSANTS BADGES (Identiques pour garder le look VIP) ---
const GoldBadge = ({ letter, name }: { letter: string, name: string }) => (
  <div className="relative z-10 flex flex-col items-center group">
    <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
      <div className="absolute inset-0 bg-gold/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#fceabb] via-[#f8b500] to-[#fceabb] p-[3px] shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#bf953f] via-[#fcf6ba] to-[#b38728] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <span className="text-4xl md:text-5xl font-black text-black/80 italic drop-shadow-md z-10">{letter}</span>
          <Star className="absolute top-4 right-4 text-black/60 fill-black/60" size={12} />
        </div>
      </div>
    </div>
    <div className="mt-6 glass-card px-6 py-2 border-t-2 border-t-gold/50 bg-black/60 rounded-xl text-center">
        <p className="text-gold font-black uppercase tracking-tighter text-sm leading-none">{name}</p>
        <p className="text-[8px] text-white/40 uppercase font-bold tracking-[0.2em] mt-1 text-nowrap">Directeur de Secteur</p>
    </div>
  </div>
);

const EmeraldBadge = ({ letter }: { letter: string }) => (
  <div className="relative w-14 h-14 md:w-18 md:h-18 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-300 via-emerald-500 to-gray-500 p-[2px] shadow-lg">
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#065f46] via-[#10b981] to-[#064e3b] flex items-center justify-center">
        <span className="text-lg font-black text-white drop-shadow-md italic">{letter}</span>
      </div>
    </div>
    <div className="absolute bottom-1 right-1 w-3 h-3 bg-black rounded-full border border-white/20 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
    </div>
  </div>
);

export default function RHPage() {
  const [view, setView] = useState<'members' | 'tasks'>('members');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', priority: 'Normale' });

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('staff').select('*');
      if (data) setStaff(data);
      setTimeout(() => setLoading(false), 800);
    }
    fetchData();
  }, []);

  const handleDeployTask = async () => {
    if (!newTask.title || !newTask.assigned_to) {
        alert("⚠️ Données incomplètes pour le déploiement.");
        return;
    }
    setIsDeploying(true);
    const { error } = await supabase.from('tasks').insert([
        { ...newTask, department: selectedDept, status: 'À faire' }
    ]);
    if (!error) {
        setShowModal(false);
        setNewTask({ title: '', assigned_to: '', priority: 'Normale' });
        alert("✅ MISSION ENREGISTRÉE DANS LE SYSTÈME");
    }
    setIsDeploying(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" size={40} /></div>;

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">HUMAN <span className="text-emerald-500 font-bold">ENGINE</span></h1>
          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-full md:w-80 shadow-2xl">
            <button onClick={() => setView('members')} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${view === 'members' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400'}`}>
              <Users size={16} /><span className="text-[10px] font-black uppercase">Collaborateurs</span>
            </button>
            <button onClick={() => setView('tasks')} className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl transition-all ${view === 'tasks' ? 'bg-gold text-black shadow-lg shadow-gold/30' : 'text-gray-400'}`}>
              <Crosshair size={16} /><span className="text-[10px] font-black uppercase">Missions</span>
            </button>
          </div>
        </div>

        {/* ZONE DE CONTENU */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scroll">
          {view === 'members' ? (
            <>
              {!selectedDept ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {DEPARTMENTS.map((dept) => (
                    <button key={dept} onClick={() => setSelectedDept(dept)} className="glass-card p-8 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform"><Users className="text-emerald-500" size={20} /></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{dept}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col min-h-[650px] relative animate-in zoom-in duration-300">
                  <button onClick={() => setSelectedDept(null)} className="flex items-center text-xs font-bold text-emerald-500 mb-4 z-50 hover:translate-x-[-4px] transition-transform"><ChevronLeft size={16} /> Retour</button>
                  
                  <div className="flex-1 flex items-center justify-center relative">
                    {staff.filter(m => m.department === selectedDept && (m.role.toLowerCase().includes('chef') || m.role.toLowerCase().includes('ceo'))).map((chef) => (
                      <GoldBadge key={chef.id} letter={chef.full_name.charAt(0)} name={chef.full_name} />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                       {staff.filter(m => m.department === selectedDept && !m.role.toLowerCase().includes('chef') && !m.role.toLowerCase().includes('ceo')).map((member, index, array) => {
                         const angle = (index / array.length) * (2 * Math.PI);
                         const radius = 240; 
                         const x = Math.cos(angle) * radius;
                         const y = Math.sin(angle) * radius;
                         return (
                           <div key={member.id} style={{ transform: `translate(${x}px, ${y}px)` }} className="absolute flex flex-col items-center group cursor-pointer z-20">
                             <EmeraldBadge letter={member.full_name.charAt(0)} />
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-12 bg-black/90 p-2 rounded border border-emerald-500/30 w-32 text-center pointer-events-none">
                               <p className="text-[8px] font-black uppercase tracking-tighter">{member.full_name}</p>
                               <p className="text-[7px] text-emerald-400 uppercase font-bold">{member.role}</p>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                    <div className="absolute w-[480px] h-[480px] border border-white/5 rounded-full border-dashed animate-[spin_100s_linear_infinite] pointer-events-none opacity-40"></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 pb-20 animate-in fade-in duration-500">
               <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-l-gold bg-gold/5">
                  <div>
                    <h3 className="text-xl font-black text-gold italic uppercase leading-none mb-2">Centre de Commandement</h3>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedDept ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                            {selectedDept ? `Secteur Connecté : ${selectedDept}` : "Alerte : Aucun secteur sélectionné"}
                        </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        if (!selectedDept) {
                            alert("❌ ACTION BLOQUÉE : Veuillez d'abord sélectionner un département dans l'onglet 'Collaborateurs' pour pouvoir assigner une mission à un membre précis.");
                            setView('members'); // Redirige automatiquement vers les collaborateurs
                        } else {
                            setShowModal(true);
                        }
                    }}
                    className="bg-gold text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center shadow-lg hover:scale-105 transition-all"
                  >
                    <Plus size={16} className="mr-2" /> Ajouter une Mission
                  </button>
               </div>

               {/* Liste des missions (Placeholder) */}
               <div className="glass-card p-5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-500 font-black italic">!</div>
                    <div><h4 className="font-black text-sm uppercase italic">Mission en attente</h4><p className="text-[9px] text-gray-500 font-black uppercase">Sélectionnez un département pour voir les missions actives</p></div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* MODAL (Ajouter une Mission) */}
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="glass-card w-full max-w-md border-t-4 border-t-gold p-8 relative animate-in zoom-in duration-300">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
              <h2 className="text-xl font-black italic text-gold uppercase mb-6 tracking-tighter underline decoration-gold/30">Ajouter une Mission : {selectedDept}</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Intitulé de la Mission</label>
                  <input type="text" placeholder="Entrez l'objectif..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none transition-all mt-1" onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Agent Responsable</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-gold outline-none mt-1 text-white appearance-none" onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}>
                    <option value="" className="bg-black">-- Choisir un collaborateur --</option>
                    {staff.filter(m => m.department === selectedDept).map(m => (
                      <option key={m.id} value={m.id} className="bg-black">{m.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase">Annuler</button>
                  <button onClick={handleDeployTask} disabled={isDeploying} className="flex-1 py-3 bg-gold text-black rounded-xl text-[10px] font-black uppercase shadow-lg shadow-gold/20 flex items-center justify-center">
                    {isDeploying ? <Loader2 className="animate-spin" size={16} /> : "Confirmer la Mission"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BTN IA */}
        <button className="fixed bottom-6 right-6 bg-gradient-to-br from-emerald-500 to-gold p-4 rounded-2xl shadow-2xl flex items-center space-x-3 hover:scale-110 transition-all z-50">
           <CheckCircle size={20} className="text-black" />
           <div className="pr-2 text-black text-left">
              <p className="text-[8px] font-black uppercase leading-none opacity-60">IA Engine</p>
              <p className="text-[10px] font-black uppercase italic tracking-tighter">Générer Rapport PDF</p>
           </div>
        </button>
      </main>
    </div>
  );
}
