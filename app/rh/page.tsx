"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
// Ajoute "Play" dans la liste ci-dessous
import { Users, Crosshair, ChevronLeft, CheckCircle, Plus, Zap, Star, X, Loader2, Lock, Unlock, Calendar, Filter, Play } from "lucide-react";

const DEPARTMENTS = [
  { name: "Management", pin: "1111" },
  { name: "Marketing", pin: "2222" },
  { name: "Ventes", pin: "3333" },
  { name: "Finances", pin: "4444" },
  { name: "Juridique", pin: "5555" },
  { name: "Relations Publiques", pin: "6666" },
  { name: "Technique", pin: "0000" },
  { name: "Ressources Humaines", pin: "7777" }
];

// --- COMPOSANTS BADGES (Gardés pour la cohérence VIP) ---
const GoldBadge = ({ letter, name }: { letter: string, name: string }) => (
    <div className="relative z-10 flex flex-col items-center">
      <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
        <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#fceabb] via-[#f8b500] to-[#fceabb] p-[2px] shadow-xl">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#bf953f] via-[#fcf6ba] to-[#b38728] flex items-center justify-center">
            <span className="text-4xl font-black text-black/70 italic">{letter}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 glass-card px-4 py-1 border border-gold/30 bg-black/40 rounded-lg text-center">
          <p className="text-gold font-black uppercase text-[10px] tracking-tighter">{name}</p>
      </div>
    </div>
);

export default function RHPage() {
  const [view, setView] = useState<'members' | 'tasks'>('members');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [wakandaInput, setWakandaInput] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [tempDept, setTempDept] = useState<any>(null);

  const [staff, setStaff] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('En cours'); // Filtre par défaut
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', deadline: '' });

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { if (isAuthorized && selectedDept) fetchTasks(); }, [isAuthorized, selectedDept]);

  async function fetchStaff() {
    const { data } = await supabase.from('staff').select('*');
    if (data) setStaff(data);
    setLoading(false);
  }

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').eq('department', selectedDept);
    if (data) setTasks(data);
  }

  const handlePinSubmit = () => {
    if (wakandaInput === tempDept.pin) {
      setSelectedDept(tempDept.name);
      setIsAuthorized(true);
      setShowPinModal(false);
      setWakandaInput("");
    } else {
      alert("❌ CODE WAKANDA INCORRECT");
      setWakandaInput("");
    }
  };

  const handleDeployTask = async () => {
    if(!newTask.title || !newTask.assigned_to || !newTask.deadline) return alert("Veuillez remplir tous les champs tactiques.");
    setIsDeploying(true);
    const { error } = await supabase.from('tasks').insert([
        { ...newTask, department: selectedDept, status: 'En cours' }
    ]);
    if (!error) {
        setShowTaskModal(false);
        fetchTasks();
        alert("✅ MISSION DÉPLOYÉE DANS LA TIMELINE");
    }
    setIsDeploying(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        
        {/* HEADER */}
        <div className="flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-black italic uppercase">HUMAN <span className="text-emerald-500">ENGINE</span></h1>
          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-80 shadow-2xl">
            <button onClick={() => setView('members')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'members' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400'}`}>Collaborateurs</button>
            <button onClick={() => setView('tasks')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'tasks' ? 'bg-gold text-black shadow-lg shadow-gold/30' : 'text-gray-400'}`}>Missions</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">
          {!isAuthorized ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DEPARTMENTS.map((dept) => (
                <button key={dept.name} onClick={() => { setTempDept(dept); setShowPinModal(true); }} className="glass-card p-8 border border-white/5 hover:border-gold/50 transition-all group flex flex-col items-center gap-3">
                  <Lock className="text-gold/30 group-hover:text-gold" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{dept.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col animate-in zoom-in duration-300">
               <div className="flex justify-between items-center mb-6">
                 <button onClick={() => { setIsAuthorized(false); setSelectedDept(null); }} className="text-[10px] font-black text-emerald-500 flex items-center gap-2">
                   <Unlock size={14} /> DÉCONNEXION SECTEUR : {selectedDept}
                 </button>
               </div>

               {view === 'members' ? (
                 <div className="flex-1 relative flex items-center justify-center min-h-[500px]">
                    {staff.filter(m => m.department === selectedDept && (m.role.toLowerCase().includes('chef') || m.role.toLowerCase().includes('ceo'))).map((chef) => (
                      <GoldBadge key={chef.id} letter={chef.full_name.charAt(0)} name={chef.full_name} />
                    ))}
                    {/* (Logique des satellites ici...) */}
                 </div>
               ) : (
                 <div className="space-y-6">
                    {/* BARRE DE FILTRES TACTIQUES */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                            {['En cours', 'Terminée', 'Annulée'].map((status) => (
                                <button 
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filterStatus === status ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowTaskModal(true)} className="bg-gold text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                            <Plus size={14}/> Ajouter une Mission
                        </button>
                    </div>

                    {/* LISTE DES MISSIONS FILTRÉES */}
                    <div className="grid gap-3">
                        {tasks.filter(t => t.status === filterStatus).map(task => (
                            <div key={task.id} className="glass-card p-4 border border-white/5 flex flex-col md:flex-row justify-between items-center group hover:border-white/20 transition-all gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {/* VOYANT LUMINEUX DYNAMIQUE */}
                                    <div className="relative">
                                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${
                                            task.status === 'En cours' ? 'bg-emerald-500 shadow-emerald-500' : 
                                            task.status === 'Terminée' ? 'bg-blue-500 shadow-blue-500' : 
                                            'bg-red-600 shadow-red-600'
                                        }`}></div>
                                        {task.status === 'En cours' && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-40"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase italic leading-none">{task.title}</h4>
                                        <p className="text-[9px] text-gray-500 uppercase mt-1">Agent : {staff.find(s => s.id === task.assigned_to)?.full_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar size={12} className="text-gold" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Délai : {new Date(task.deadline).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`text-[8px] font-black px-3 py-1 rounded-full border ${
                                        task.status === 'En cours' ? 'border-emerald-500/30 text-emerald-500' : 
                                        task.status === 'Terminée' ? 'border-blue-500/30 text-blue-500' : 
                                        'border-red-500/30 text-red-600'
                                    }`}>
                                        {task.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* MODAL AJOUT MISSION AVEC DEADLINE */}
        {showTaskModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
                <div className="glass-card w-full max-w-md p-8 border-t-4 border-t-gold animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(241,196,15,0.1)]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-gold uppercase italic tracking-tighter">Injection Tactique</h2>
                        <button onClick={() => setShowTaskModal(false)}><X className="text-gray-500" /></button>
                    </div>
                    
                    <div className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Objectif de la Mission</label>
                            <input type="text" placeholder="Entrez le titre..." className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-gold transition-all text-sm" onChange={(e)=>setNewTask({...newTask, title: e.target.value})}/>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Spécialiste Assigné</label>
                            <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-sm text-white appearance-none" onChange={(e)=>setNewTask({...newTask, assigned_to: e.target.value})}>
                                <option value="">Choisir un collaborateur...</option>
                                {staff.filter(m => m.department === selectedDept).map(m => (
                                    <option key={m.id} value={m.id} className="bg-black text-white">{m.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Date Limite d'Exécution</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={16} />
                                <input type="date" className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-gold text-sm text-white scheme-dark" onChange={(e)=>setNewTask({...newTask, deadline: e.target.value})}/>
                            </div>
                        </div>

                        <button onClick={handleDeployTask} disabled={isDeploying} className="w-full py-4 bg-gold text-black font-black uppercase text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all mt-4">
                            {isDeploying ? <Loader2 className="animate-spin" /> : <><Play size={14}/> Lancer l'Opération</>}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL PIN WAKANDA (Gardé tel quel) */}
        {showPinModal && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
                <div className="glass-card p-10 border border-gold/20 flex flex-col items-center gap-6 animate-in zoom-in duration-300 shadow-[0_0_80px_rgba(241,196,15,0.15)]">
                    <Lock className="text-gold animate-pulse" size={40} />
                    <h2 className="text-xl font-black text-white uppercase italic tracking-[0.2em]">Secteur {tempDept?.name}</h2>
                    <input type="password" maxLength={4} value={wakandaInput} onChange={(e) => setWakandaInput(e.target.value)} className="bg-white/5 border-b-2 border-gold w-40 py-4 text-center text-3xl font-black tracking-[0.5em] focus:outline-none" autoFocus onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()} />
                    <button onClick={handlePinSubmit} className="w-full py-3 bg-gold text-black text-[10px] font-black uppercase rounded-lg">Accéder au Commandement</button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
