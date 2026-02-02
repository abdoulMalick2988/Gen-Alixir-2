"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { Users, Crosshair, ChevronLeft, CheckCircle, Plus, Zap, Star, X, Loader2, Lock, Unlock } from "lucide-react";

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

// --- COMPOSANTS BADGES VIP ---
const GoldBadge = ({ letter, name }: { letter: string, name: string }) => (
  <div className="relative z-10 flex flex-col items-center group">
    <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
      <div className="absolute inset-0 bg-gold/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#fceabb] via-[#f8b500] to-[#fceabb] p-[3px] shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#bf953f] via-[#fcf6ba] to-[#b38728] flex items-center justify-center relative overflow-hidden">
          <span className="text-4xl md:text-5xl font-black text-black/80 italic z-10">{letter}</span>
          <Star className="absolute top-4 right-4 text-black/60 fill-black/60" size={12} />
        </div>
      </div>
    </div>
    <div className="mt-6 glass-card px-6 py-2 border-t-2 border-t-gold/50 bg-black/60 rounded-xl text-center">
        <p className="text-gold font-black uppercase tracking-tighter text-sm leading-none">{name}</p>
        <p className="text-[8px] text-white/40 uppercase font-bold tracking-[0.2em] mt-1">Chef de Secteur</p>
    </div>
  </div>
);

const EmeraldBadge = ({ letter }: { letter: string }) => (
  <div className="relative w-14 h-14 md:w-18 md:h-18 flex items-center justify-center">
    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-300 via-emerald-500 to-gray-500 p-[2px] shadow-lg">
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#065f46] via-[#10b981] to-[#064e3b] flex items-center justify-center">
        <span className="text-lg font-black text-white italic">{letter}</span>
      </div>
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
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (isAuthorized && selectedDept) fetchTasks();
  }, [isAuthorized, selectedDept]);

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
      alert("❌ CODE INCORRECT");
      setWakandaInput("");
    }
  };

  const handleDeployTask = async () => {
    setIsDeploying(true);
    const { error } = await supabase.from('tasks').insert([
        { ...newTask, department: selectedDept, status: 'En cours' }
    ]);
    if (!error) {
        setShowTaskModal(false);
        fetchTasks();
        alert("✅ MISSION DÉPLOYÉE");
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
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">HUMAN <span className="text-emerald-500">ENGINE</span></h1>
          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-80">
            <button onClick={() => setView('members')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'members' ? 'bg-emerald-500 shadow-lg' : 'text-gray-400'}`}>Collaborateurs</button>
            <button onClick={() => setView('tasks')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'tasks' ? 'bg-gold text-black shadow-lg' : 'text-gray-400'}`}>Missions</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!isAuthorized ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
              {DEPARTMENTS.map((dept) => (
                <button key={dept.name} onClick={() => { setTempDept(dept); setShowPinModal(true); }} className="glass-card p-8 border border-white/5 hover:border-gold/50 transition-all group flex flex-col items-center gap-3">
                  <Lock className="text-gold/30 group-hover:text-gold" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{dept.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col animate-in zoom-in duration-300">
               <button onClick={() => { setIsAuthorized(false); setSelectedDept(null); }} className="text-[10px] font-black text-emerald-500 flex items-center gap-2 mb-4">
                 <Unlock size={14} /> FERMER LE SECTEUR : {selectedDept}
               </button>

               {view === 'members' ? (
                 /* SYSTÈME SOLAIRE RÉACTIVÉ */
                 <div className="flex-1 relative flex items-center justify-center min-h-[550px]">
                    {staff.filter(m => m.department === selectedDept && (m.role.toLowerCase().includes('chef') || m.role.toLowerCase().includes('ceo'))).map((chef) => (
                      <GoldBadge key={chef.id} letter={chef.full_name.charAt(0)} name={chef.full_name} />
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center">
                       {staff.filter(m => m.department === selectedDept && !m.role.toLowerCase().includes('chef') && !m.role.toLowerCase().includes('ceo')).map((member, index, array) => {
                         const angle = (index / array.length) * (2 * Math.PI);
                         const radius = 220; 
                         const x = Math.cos(angle) * radius;
                         const y = Math.sin(angle) * radius;
                         return (
                           <div key={member.id} style={{ transform: `translate(${x}px, ${y}px)` }} className="absolute flex flex-col items-center group cursor-pointer z-20">
                             <EmeraldBadge letter={member.full_name.charAt(0)} />
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-10 bg-black/90 p-2 rounded border border-emerald-500/30 w-32 text-center">
                               <p className="text-[8px] font-black uppercase">{member.full_name}</p>
                               <p className="text-[7px] text-emerald-400 uppercase">{member.role}</p>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                    <div className="absolute w-[440px] h-[440px] border border-white/5 rounded-full border-dashed animate-[spin_60s_linear_infinite] opacity-20"></div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="glass-card p-6 flex justify-between items-center border-l-4 border-l-gold bg-gold/5">
                        <h3 className="text-xl font-black text-gold italic uppercase leading-none">Command Center : {selectedDept}</h3>
                        <button onClick={() => setShowTaskModal(true)} className="bg-gold text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg"><Plus size={14}/> Ajouter Mission</button>
                    </div>
                    {tasks.map(task => (
                        <div key={task.id} className="glass-card p-4 border border-white/5 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-emerald-500"><Zap size={18}/></div>
                                <div><h4 className="font-black text-sm uppercase italic">{task.title}</h4><p className="text-[9px] text-gray-500 uppercase">Agent Assigné : {staff.find(s => s.id === task.assigned_to)?.full_name || 'Inconnu'}</p></div>
                            </div>
                            <span className="text-[9px] font-black px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">{task.status}</span>
                        </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* MODAL WAKANDA PIN */}
        {showPinModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="glass-card p-10 border-t-4 border-t-gold flex flex-col items-center gap-6 animate-in zoom-in duration-300">
              <Lock className="text-gold animate-pulse" size={40} />
              <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Secteur {tempDept?.name}</h2>
              <input type="password" maxLength={4} value={wakandaInput} onChange={(e) => setWakandaInput(e.target.value)} className="bg-white/5 border-2 border-white/10 rounded-2xl w-40 py-4 text-center text-2xl font-black tracking-[0.5em] focus:border-gold outline-none" autoFocus onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()} />
              <div className="flex gap-4 w-full"><button onClick={() => setShowPinModal(false)} className="flex-1 py-3 text-[10px] font-black uppercase border border-white/10 rounded-xl">Annuler</button><button onClick={handlePinSubmit} className="flex-1 py-3 bg-gold text-black text-[10px] font-black uppercase rounded-xl">Accéder</button></div>
            </div>
          </div>
        )}

        {/* MODAL AJOUT MISSION */}
        {showTaskModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                <div className="glass-card w-full max-w-md p-8 border-t-4 border-t-gold animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-black text-gold uppercase italic mb-6 tracking-tighter">Nouvelle Mission : {selectedDept}</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Objectif de la mission..." className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-gold text-sm" onChange={(e)=>setNewTask({...newTask, title: e.target.value})}/>
                        <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none text-sm text-white" onChange={(e)=>setNewTask({...newTask, assigned_to: e.target.value})}>
                            <option value="">Sélectionner l'agent responsable...</option>
                            {staff.filter(m => m.department === selectedDept).map(m => (
                                <option key={m.id} value={m.id} className="bg-black text-white">{m.full_name}</option>
                            ))}
                        </select>
                        <button onClick={handleDeployTask} disabled={isDeploying} className="w-full py-4 bg-gold text-black font-black uppercase text-xs rounded-xl shadow-lg flex items-center justify-center">
                            {isDeploying ? <Loader2 className="animate-spin" /> : "Injecter dans le système"}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
