"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  Users, Lock, Unlock, Plus, X, Loader2, CheckCircle, Trash2, 
  ShieldCheck, User, Star, ArrowRight, Play, LayoutGrid, ClipboardList 
} from "lucide-react";

// --- CONFIGURATION DÉPARTEMENTS ---
const DEPARTMENTS = [
  { name: "Management", pin: "1111", wakanda: "9991" },
  { name: "Marketing", pin: "2222", wakanda: "9992" },
  { name: "Technique", pin: "0000", wakanda: "9990" },
  { name: "Finances", pin: "4444", wakanda: "9994" },
  { name: "Juridique", pin: "5555", wakanda: "9995" },
  { name: "Ventes", pin: "3333", wakanda: "9993" },
  { name: "Relations Publiques", pin: "6666", wakanda: "9996" },
  { name: "Ressources Humaines", pin: "7777", wakanda: "9997" }
];

// --- COMPOSANT CARTE DE MEMBRE TACTIQUE ---
const MemberCard = ({ member }: { member: any }) => {
  const displaySkills = Array.isArray(member.skills) ? member.skills : ["Recrue", "Ecodreum", "Junior"];
  
  return (
    <div className="glass-card p-5 border-2 border-emerald-500/30 bg-gradient-to-br from-black via-emerald-950/10 to-black relative overflow-hidden w-full max-w-[320px] shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-black font-black text-[7px] uppercase italic tracking-tighter">
            ID: {member.id?.split('-')[0] || "NEW"}
        </div>
        
        <div className="flex gap-4 items-center mb-5">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500 p-1 bg-black overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    {member.photo ? (
                        <img src={member.photo} alt={member.full_name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-500">
                            <User size={30} />
                        </div>
                    )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-1 border border-black shadow-lg">
                    <Star size={8} fill="black" />
                </div>
            </div>
            
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black italic uppercase text-white leading-none truncate">{member.full_name}</h3>
                <p className="text-emerald-400 font-bold text-[9px] uppercase tracking-widest mt-1">{member.role || "Agent"}</p>
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <p className="text-[7px] text-gray-500 uppercase font-black mb-1.5 tracking-widest italic">Spécialités Tactiques</p>
                <div className="flex flex-wrap gap-1.5">
                    {displaySkills.slice(0, 3).map((skill: string, i: number) => (
                        <span key={i} className="text-[8px] font-black bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 rounded text-emerald-100 uppercase italic">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                    <p className="text-[7px] text-gray-400 uppercase font-black mb-1">Aura Level</p>
                    <p className="text-sm font-black text-emerald-400 italic leading-none">{member.aura || "BETA"}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                    <p className="text-[7px] text-gray-400 uppercase font-black mb-1">Total PCO</p>
                    <p className="text-sm font-black text-gold italic leading-none">{member.pco || 1} PTS</p>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- CALENDRIER TACTIQUE ---
const TacticalCalendar = ({ onSelect }: { onSelect: (date: string) => void }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const padding = firstDay === 0 ? 6 : firstDay - 1;

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-3">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase text-emerald-500 italic">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-1">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1 hover:bg-white/10 rounded text-white">‹</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1 hover:bg-white/10 rounded text-white">›</button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-black text-gray-500 mb-2">
                {['L','M','M','J','V','S','D'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: padding }).map((_, i) => <div key={i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => (
                    <button key={i} onClick={() => onSelect(`${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${i+1}`)} className="h-7 text-[9px] font-bold text-white bg-white/5 hover:bg-emerald-500 hover:text-black rounded transition-all">
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function RHPage() {
  const [view, setView] = useState<'members' | 'tasks'>('members');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessMode, setAccessMode] = useState<'manager' | 'member'>('manager');
  const [wakandaInput, setWakandaInput] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [tempDept, setTempDept] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', deadline: '' });
  const [customAlert, setCustomAlert] = useState({show: false, msg: '', type: 'success'});

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { if (isAuthorized && selectedDept) fetchTasks(); }, [isAuthorized, selectedDept]);

  async function fetchStaff() {
    const { data } = await supabase.from('staff').select('*').order('pco', { ascending: false });
    if (data) setStaff(data);
    setLoading(false);
  }

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').eq('department', selectedDept).order('created_at', { ascending: false });
    if (data) setTasks(data);
  }

  const handlePinSubmit = () => {
    const isManager = wakandaInput === tempDept.pin;
    const isMember = wakandaInput === tempDept.wakanda;

    if (isManager || isMember) {
      setAccessMode(isManager ? 'manager' : 'member');
      setSelectedDept(tempDept.name);
      setIsAuthorized(true);
      setShowPinModal(false);
      setWakandaInput("");
    } else {
      triggerAlert("WAKANDA CODE INCORRECT");
    }
  };

  const triggerAlert = (msg: string, type: 'error' | 'success' = 'error') => {
    setCustomAlert({show: true, msg, type});
    setTimeout(() => setCustomAlert({show: false, msg: '', type: 'error'}), 3000);
  };

  const handleTaskAction = async (taskId: string, action: 'Terminée' | 'Delete') => {
    if (action === 'Delete') {
        if (!confirm("SUPPRIMER CETTE MISSION ?")) return;
        await supabase.from('tasks').delete().eq('id', taskId);
    } else {
        await supabase.from('tasks').update({ status: 'Terminée' }).eq('id', taskId);
    }
    fetchTasks();
    triggerAlert("MISE À JOUR RÉUSSIE", 'success');
  };

  const handleDeploy = async () => {
    if (!newTask.title || !newTask.assigned_to || !newTask.deadline) return triggerAlert("DONNÉES MANQUANTES");
    const { error } = await supabase.from('tasks').insert([{ ...newTask, department: selectedDept, status: 'En cours' }]);
    if (!error) {
        setShowTaskModal(false);
        setNewTask({ title: '', assigned_to: '', deadline: '' });
        fetchTasks();
        triggerAlert("MISSION DÉPLOYÉE", 'success');
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        
        {/* ALERTE ECODREUM */}
        {customAlert.show && (
            <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-xl border-2 font-black uppercase italic shadow-2xl animate-in slide-in-from-top ${customAlert.type === 'error' ? 'bg-red-600 border-white' : 'bg-emerald-600 border-white'}`}>
                <span className="text-xs">{customAlert.msg}</span>
            </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-center shrink-0">
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">HUMAN <span className="text-emerald-500">ENGINE</span></h1>
          {isAuthorized && (
            <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase text-emerald-500">{accessMode} mode</span>
                </div>
                <button onClick={() => { setIsAuthorized(false); setSelectedDept(null); }} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    <Unlock size={16} />
                </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">
          {!isAuthorized ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {DEPARTMENTS.map((dept) => (
                <button key={dept.name} onClick={() => { setTempDept(dept); setShowPinModal(true); }} className="glass-card p-6 border border-white/5 hover:border-emerald-500/50 flex flex-col items-center gap-4 group transition-all">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                    <Lock className="text-white/20 group-hover:text-emerald-500" size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">{dept.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col gap-6">
               <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-xl w-full sm:w-80">
                        <button onClick={() => setView('members')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${view === 'members' ? 'bg-emerald-500 text-black' : 'text-gray-500'}`}>
                            <LayoutGrid size={14} /> Équipe
                        </button>
                        <button onClick={() => setView('tasks')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${view === 'tasks' ? 'bg-gold text-black' : 'text-gray-500'}`}>
                            <ClipboardList size={14} /> Missions
                        </button>
                    </div>
                    {view === 'tasks' && accessMode === 'manager' && (
                        <button onClick={() => setShowTaskModal(true)} className="w-full sm:w-auto px-6 py-2 bg-emerald-500 text-black font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                            <Plus size={16} /> Nouvelle Mission
                        </button>
                    )}
               </div>

               {view === 'members' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center pb-10">
                    {staff.filter(m => m.department === selectedDept).map(m => (
                        <MemberCard key={m.id} member={m} />
                    ))}
                 </div>
               ) : (
                 <div className="space-y-4 pb-10">
                    <div className="grid gap-3">
                        {tasks.map(task => (
                            <div key={task.id} className="glass-card p-4 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${task.status === 'En cours' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-500'}`}></div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase italic text-white leading-tight">{task.title}</h4>
                                        <p className="text-[9px] text-gray-500 uppercase mt-1">Agent : {staff.find(s => s.id === task.assigned_to)?.full_name || "Agent Terrain"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase italic">Délai : {task.deadline}</span>
                                    <div className="flex gap-2">
                                        {task.status === 'En cours' && (
                                            <button onClick={() => handleTaskAction(task.id, 'Terminée')} className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-black transition-all">
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        {accessMode === 'manager' && task.status === 'En cours' && (
                                            <button onClick={() => handleTaskAction(task.id, 'Delete')} className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
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

        {/* MODAL MISSION (MANAGER UNIQUEMENT) */}
        {showTaskModal && (
            <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
                <div className="glass-card w-full max-w-md p-6 border-t-4 border-emerald-500 shadow-2xl animate-in zoom-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-white uppercase italic">Déployer Mission</h2>
                        <button onClick={() => setShowTaskModal(false)} className="text-white/40"><X size={24} /></button>
                    </div>
                    <div className="space-y-4">
                        <input type="text" placeholder="NOM DE L'OPÉRATION" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-emerald-500" value={newTask.title} onChange={(e)=>setNewTask({...newTask, title: e.target.value})} />
                        <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold outline-none appearance-none" onChange={(e)=>setNewTask({...newTask, assigned_to: e.target.value})} value={newTask.assigned_to}>
                            <option value="" className="bg-black">SÉLECTIONNER UN AGENT</option>
                            {staff.filter(m => m.department === selectedDept).map(m => <option key={m.id} value={m.id} className="bg-black">{m.full_name}</option>)}
                        </select>
                        <TacticalCalendar onSelect={(date) => setNewTask({...newTask, deadline: date})} />
                        <button onClick={handleDeploy} className="w-full py-4 bg-emerald-500 text-black font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all">
                            <Play size={16} fill="black" /> Confirmer Déploiement
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL PIN WAKANDA */}
        {showPinModal && (
            <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
                <div className="glass-card p-8 border border-emerald-500/20 flex flex-col items-center gap-6 w-full max-w-sm animate-in zoom-in">
                    <ShieldCheck className="text-emerald-500" size={48} />
                    <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Secteur {tempDept?.name}</h2>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3em] mt-2 italic">Entrez le Wakanda Code</p>
                    </div>
                    <input type="password" maxLength={4} value={wakandaInput} onChange={(e) => setWakandaInput(e.target.value)} className="bg-white/5 border-b-2 border-emerald-500 w-32 py-2 text-center text-4xl font-black tracking-[0.3em] outline-none text-white" autoFocus onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()} />
                    <button onClick={handlePinSubmit} className="w-full py-4 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">Initialiser Connexion</button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
