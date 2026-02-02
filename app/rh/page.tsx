"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { Users, Crosshair, ChevronLeft, CheckCircle, Plus, X, Loader2, Lock, Unlock, Calendar, Play, ArrowRight } from "lucide-react";

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

// --- COMPOSANTS BADGES ---
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
  const [filterStatus, setFilterStatus] = useState('En cours');
  const [loading, setLoading] = useState(true);
  
  // États Mission & Alertes
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskStep, setTaskStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', deadline: '' });
  const [customAlert, setCustomAlert] = useState<{show: boolean, msg: string, type: 'error' | 'success'}>({show: false, msg: '', type: 'success'});

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { if (isAuthorized && selectedDept) fetchTasks(); }, [isAuthorized, selectedDept]);

  const triggerAlert = (msg: string, type: 'error' | 'success' = 'error') => {
    setCustomAlert({ show: true, msg, type });
    setTimeout(() => setCustomAlert({ show: false, msg: '', type: 'error' }), 4000);
  };

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
      triggerAlert("WAKANDA CODE INCORRECT");
      setWakandaInput("");
    }
  };

  const handleDeployTask = async () => {
    setIsDeploying(true);
    const { error } = await supabase.from('tasks').insert([{ ...newTask, department: selectedDept, status: 'En cours' }]);
    if (!error) {
        setShowTaskModal(false);
        setTaskStep(1);
        setNewTask({ title: '', assigned_to: '', deadline: '' });
        fetchTasks();
        triggerAlert("MISSION DÉPLOYÉE AVEC SUCCÈS", 'success');
    } else {
        triggerAlert("ERREUR LORS DU DÉPLOIEMENT");
    }
    setIsDeploying(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        
        {/* ALERTES ECODREUM */}
        {customAlert.show && (
            <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 rounded-2xl border-2 font-black uppercase italic tracking-tighter animate-in slide-in-from-top duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${customAlert.type === 'error' ? 'bg-red-600 border-white' : 'bg-emerald-600 border-white'}`}>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] opacity-80">ECODREUM INDIQUE :</span>
                    <span className="text-sm">{customAlert.msg}</span>
                </div>
            </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter">HUMAN <span className="text-emerald-500">ENGINE</span></h1>
          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-80">
            <button onClick={() => setView('members')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'members' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}>Collaborateurs</button>
            <button onClick={() => setView('tasks')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'tasks' ? 'bg-gold !text-black' : 'text-gray-400'}`}>Missions</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">
          {!isAuthorized ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DEPARTMENTS.map((dept) => (
                <button key={dept.name} onClick={() => { setTempDept(dept); setShowPinModal(true); }} className="glass-card p-8 border border-white/5 hover:border-gold/50 group flex flex-col items-center gap-3 transition-all">
                  <Lock className="text-gold/30 group-hover:text-gold" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{dept.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col">
               <div className="flex justify-between items-center mb-6">
                 <button onClick={() => { setIsAuthorized(false); setSelectedDept(null); }} className="text-[10px] font-black text-emerald-400 flex items-center gap-2 uppercase">
                   <Unlock size={14} /> Quitter Secteur {selectedDept}
                 </button>
                 {view === 'tasks' && (
                    <button onClick={() => {setTaskStep(1); setShowTaskModal(true);}} className="bg-black border-2 border-emerald-500 px-6 py-2 rounded-xl font-black text-emerald-500 uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Plus size={16} strokeWidth={3} /> Ajouter Mission
                    </button>
                 )}
               </div>

               {view === 'members' ? (
                 <div className="flex-1 relative flex items-center justify-center min-h-[500px]">
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
                           <div key={member.id} style={{ transform: `translate(${x}px, ${y}px)` }} className="absolute flex flex-col items-center z-20">
                             <EmeraldBadge letter={member.full_name.charAt(0)} />
                             <p className="text-[8px] font-black uppercase mt-2 text-gray-400">{member.full_name}</p>
                           </div>
                         );
                       })}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                        {['En cours', 'Terminée', 'Annulée'].map((status) => (
                            <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filterStatus === status ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500'}`}>{status}</button>
                        ))}
                    </div>

                    <div className="grid gap-3">
                        {tasks.filter(t => t.status === filterStatus).map(task => (
                            <div key={task.id} className="glass-card p-4 border border-white/5 flex justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${task.status === 'En cours' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-500'}`}></div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase italic">{task.title}</h4>
                                        <p className="text-[9px] text-gray-500 uppercase">Agent : {staff.find(s => s.id === task.assigned_to)?.full_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Délai : {task.deadline}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* MODAL MISSION 2 ÉTAPES */}
        {showTaskModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4 backdrop-blur-3xl">
                <div className="glass-card w-full max-w-md p-8 border-t-4 border-t-emerald-500 animate-in zoom-in duration-200 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Étape {taskStep} / 2</p>
                            <h2 className="text-xl font-black text-white uppercase italic">Déploiement Mission</h2>
                        </div>
                        <button onClick={() => setShowTaskModal(false)}><X className="text-white/50" /></button>
                    </div>

                    {taskStep === 1 ? (
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Nom de l'Opération</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 text-white font-bold" value={newTask.title} onChange={(e)=>setNewTask({...newTask, title: e.target.value})} placeholder="INTITULÉ..."/>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Agent de Terrain</label>
                                <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none text-white appearance-none font-bold" onChange={(e)=>setNewTask({...newTask, assigned_to: e.target.value})} value={newTask.assigned_to}>
                                    <option value="">SÉLECTIONNER UN AGENT...</option>
                                    {staff.filter(m => m.department === selectedDept).map(m => (
                                        <option key={m.id} value={m.id} className="bg-black text-white">{m.full_name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={() => (newTask.title && newTask.assigned_to) ? setTaskStep(2) : triggerAlert("REMPLISSEZ TOUS LES CHAMPS")}
                                className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg"
                            >
                                Continuer <ArrowRight size={18} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-4">
                                <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Cible : {newTask.title}</p>
                                <p className="text-[10px] font-black text-white/70 uppercase italic">Opérateur : {staff.find(s => s.id === newTask.assigned_to)?.full_name}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-emerald-500 uppercase mb-4 block">Échéance Tactique (Dès demain)</label>
                                <input 
                                    type="date" 
                                    min={minDate}
                                    className="w-full bg-white/10 border-2 border-emerald-500 p-6 rounded-2xl text-white text-xl font-black scheme-dark outline-none transition-all" 
                                    onChange={(e)=>setNewTask({...newTask, deadline: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setTaskStep(1)} className="flex-1 py-5 bg-white/5 text-white font-black uppercase text-[10px] rounded-2xl border border-white/10">Précédent</button>
                                <button 
                                    onClick={handleDeployTask} 
                                    disabled={isDeploying || !newTask.deadline}
                                    className="flex-[2] py-5 bg-emerald-500 text-black font-black uppercase text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {isDeploying ? <Loader2 className="animate-spin" /> : <><Play size={18} fill="black" /> Confirmer Mission</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* MODAL PIN WAKANDA */}
        {showPinModal && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
                <div className="glass-card p-10 border border-emerald-500/20 flex flex-col items-center gap-6 animate-in zoom-in">
                    <Lock className="text-emerald-500" size={40} />
                    <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Secteur {tempDept?.name}</h2>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3em] mt-2 italic">Entrez le WAKANDA Code</p>
                    </div>
                    <input type="password" maxLength={4} value={wakandaInput} onChange={(e) => setWakandaInput(e.target.value)} className="bg-white/5 border-b-2 border-emerald-500 w-40 py-4 text-center text-3xl font-black tracking-[0.5em] outline-none text-white" autoFocus onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()} />
                    <button onClick={handlePinSubmit} className="w-full py-4 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-xl font-bold px-10">VÉRIFIER L'AUTORISATION</button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
