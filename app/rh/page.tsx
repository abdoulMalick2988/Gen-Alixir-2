"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  Users, Lock, Unlock, Plus, X, Loader2, CheckCircle, Trash2, 
  ShieldCheck, User, Star, LayoutGrid, ClipboardList, Briefcase, 
  UserCircle, Target, Zap, Shield, Award, Calendar, AlertTriangle, ChevronRight
} from "lucide-react";

// --- CONFIGURATION DÉPARTEMENTS ---
const DEPARTMENTS = [
  { name: "Management", pin: "1111", wakanda: "9991" },
  { name: "Marketing", pin: "2222", wakanda: "9992" },
  { name: "Technique", pin: "0000", wakanda: "9990" },
  { name: "Finances", pin: "4444", wakanda: "9994" },
  { name: "Ressources Humaines", pin: "7777", wakanda: "9997" }
];

// --- COMPOSANT CARTE DE MEMBRE (STYLE RPG) ---
const MemberCard = ({ member }: { member: any }) => {
  const skills = Array.isArray(member?.skills) ? member.skills : ["Agent", "Actif"];
  
  return (
    <div className="glass-card p-5 border-2 border-emerald-500/30 bg-black relative overflow-hidden w-full max-w-[310px] animate-in fade-in zoom-in duration-500">
        <div className="absolute top-0 right-0 bg-emerald-500 text-black px-2 py-0.5 text-[8px] font-black italic uppercase">
            Rank: {member?.aura || "1.0"}
        </div>
        
        <div className="flex gap-4 items-center mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-500 p-1 bg-zinc-900 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                {member?.photo ? (
                    <img src={member.photo} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                    <User size={32} className="m-auto mt-2 text-emerald-800" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black italic uppercase text-white leading-none truncate">{member?.full_name || "Agent Inconnu"}</h3>
                <p className="text-emerald-500 font-bold text-[9px] uppercase tracking-widest mt-1">{member?.role || "Opérateur"}</p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 3).map((s: string, i: number) => (
                    <span key={i} className="text-[7px] font-black bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 rounded text-emerald-100 uppercase italic">
                        {s}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                <div className="bg-white/5 p-2 rounded-lg text-center">
                    <p className="text-[7px] text-gray-500 uppercase font-black mb-1">XP / AURA</p>
                    <p className="text-xs font-black text-emerald-400 italic">{member?.aura || "1.0"}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg text-center">
                    <p className="text-[7px] text-gray-500 uppercase font-black mb-1">POINTS PCO</p>
                    <p className="text-xs font-black text-gold italic">{member?.pco || 0} PTS</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default function RHPage() {
  const [view, setView] = useState<'members' | 'tasks'>('members');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessMode, setAccessMode] = useState<'manager' | 'member'>('member'); 
  const [wakandaInput, setWakandaInput] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [tempDept, setTempDept] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [missionForm, setMissionForm] = useState({ title: '', assigned_to: '', deadline: '' });

  // 1. CHARGEMENT INITIAL DES DONNÉES
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: staffData } = await supabase.from('staff').select('*').order('full_name');
    if (staffData) {
        console.log("Agents chargés:", staffData);
        setStaff(staffData);
    }
    setLoading(false);
  }

  // 2. CHARGEMENT DES MISSIONS LORSQUE AUTORISÉ
  useEffect(() => {
    if (isAuthorized && selectedDept) fetchTasks();
  }, [isAuthorized, selectedDept]);

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*').eq('department', selectedDept).order('created_at', { ascending: false });
    if (data) setTasks(data);
  }

  // 3. FILTRAGE SÉCURISÉ DES AGENTS (Important pour éviter l'écran vide)
  const filteredStaff = useMemo(() => {
    if (!selectedDept) return [];
    // On compare en ignorant la casse et les espaces
    return staff.filter(m => m.department?.trim().toLowerCase() === selectedDept.trim().toLowerCase());
  }, [staff, selectedDept]);

  // 4. AUTHENTIFICATION
  const handleAuth = () => {
    const targetCode = accessMode === 'manager' ? tempDept.pin : tempDept.wakanda;
    if (wakandaInput === targetCode) {
      console.log("Connexion réussie au secteur:", tempDept.name);
      setSelectedDept(tempDept.name);
      setIsAuthorized(true);
      setShowPinModal(false);
      setWakandaInput("");
    } else {
      alert("CODE INVALIDE");
      setWakandaInput("");
    }
  };

  // 5. CRÉATION DE MISSION
  const deployMission = async () => {
    if (!missionForm.title || !missionForm.assigned_to) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    const payload = {
        title: missionForm.title,
        assigned_to: missionForm.assigned_to,
        department: selectedDept,
        status: 'En cours',
        deadline: missionForm.deadline || new Date().toISOString().split('T')[0]
    };

    const { error } = await supabase.from('tasks').insert([payload]);
    if (error) {
        console.error("Erreur d'insertion:", error);
        alert("Erreur lors du déploiement");
    } else {
        setShowNewTask(false);
        setMissionForm({ title: '', assigned_to: '', deadline: '' });
        fetchTasks();
    }
  };

  const completeTask = async (id: string) => {
    const { error } = await supabase.from('tasks').update({ status: 'Terminée' }).eq('id', id);
    if (!error) fetchTasks();
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Users size={20} className="text-black" />
                </div>
                <h1 className="text-xl font-black italic uppercase tracking-tighter">HUMAN <span className="text-emerald-500">ENGINE</span></h1>
            </div>
            {isAuthorized && (
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase italic">Secteur: {selectedDept}</div>
                    <button onClick={() => { setIsAuthorized(false); setSelectedDept(null); }} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Unlock size={18} /></button>
                </div>
            )}
        </div>

        {/* ZONE DE CONTENU */}
        <div className="flex-1 overflow-y-auto custom-scroll pr-2">
            {!isAuthorized ? (
                /* ÉCRAN DE SÉLECTION DES DÉPARTEMENTS */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 py-10">
                    {DEPARTMENTS.map((dept) => (
                        <button key={dept.name} onClick={() => { setTempDept(dept); setShowPinModal(true); }} className="glass-card p-6 border border-white/5 hover:border-emerald-500/50 flex flex-col items-center gap-4 group transition-all">
                            <div className="p-4 rounded-full bg-white/5 group-hover:bg-emerald-500/20"><Lock className="text-white/20 group-hover:text-emerald-500" size={24} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{dept.name}</span>
                        </button>
                    ))}
                </div>
            ) : (
                /* ÉCRAN RH CONNECTÉ */
                <div className="flex flex-col gap-6 h-full">
                    {/* SWITCHER VUE */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
                            <button onClick={() => setView('members')} className={`flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all ${view === 'members' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-white'}`}>
                                <LayoutGrid size={14} /> Effectifs
                            </button>
                            <button onClick={() => setView('tasks')} className={`flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all ${view === 'tasks' ? 'bg-gold text-black' : 'text-gray-500 hover:text-white'}`}>
                                <ClipboardList size={14} /> Missions
                            </button>
                        </div>
                        {view === 'tasks' && accessMode === 'manager' && (
                            <button onClick={() => setShowNewTask(true)} className="w-full sm:w-auto px-6 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all">
                                <Plus size={16} /> Nouvelle Mission
                            </button>
                        )}
                    </div>

                    {/* RENDU DES DONNÉES */}
                    <div className="flex-1">
                        {view === 'members' ? (
                            <div className="flex flex-wrap gap-6 justify-center pb-20">
                                {filteredStaff.length > 0 ? (
                                    filteredStaff.map(m => <MemberCard key={m.id} member={m} />)
                                ) : (
                                    <div className="flex flex-col items-center gap-4 mt-20 opacity-30">
                                        <Users size={60} />
                                        <p className="text-xs font-black uppercase tracking-[0.4em]">Aucun agent détecté dans ce secteur</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-3 max-w-4xl mx-auto pb-20">
                                {tasks.map(task => (
                                    <div key={task.id} className="glass-card p-5 border border-white/5 hover:bg-white/5 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${task.status === 'En cours' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                                            <div>
                                                <h4 className="font-black text-sm uppercase italic text-white tracking-tight">{task.title}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[8px] font-bold text-gray-500 uppercase italic flex items-center gap-1"><User size={10} /> {staff.find(s => s.id === task.assigned_to)?.full_name || "Agent"}</span>
                                                    <span className="text-[8px] font-bold text-emerald-500 uppercase italic flex items-center gap-1"><Calendar size={10} /> {task.deadline}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {task.status === 'En cours' && (
                                            <button onClick={() => completeTask(task.id)} className="w-full md:w-auto px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all">Terminer</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* MODAL PIN AVEC SWITCH ROLE */}
        {showPinModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4">
                <div className="glass-card w-full max-w-sm p-8 border border-emerald-500/20 animate-in zoom-in duration-300">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">{tempDept?.name}</h2>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Authentification Requise</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-8">
                        <button onClick={() => setAccessMode('member')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all ${accessMode === 'member' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' : 'text-gray-500'}`}>
                            <UserCircle size={16} /> Membre
                        </button>
                        <button onClick={() => setAccessMode('manager')} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all ${accessMode === 'manager' ? 'bg-gold text-black shadow-lg shadow-gold/30' : 'text-gray-500'}`}>
                            <Briefcase size={16} /> Manager
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <input type="password" maxLength={4} value={wakandaInput} onChange={(e) => setWakandaInput(e.target.value)} className="w-full bg-transparent border-b-2 border-emerald-500 text-center text-5xl font-black tracking-[0.4em] text-white py-4 outline-none" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
                        <p className="text-[7px] text-gray-600 uppercase font-black text-center mt-4 italic">Entrez votre code secret</p>
                    </div>

                    <button onClick={handleAuth} className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Initialiser Connexion</button>
                    <button onClick={() => setShowPinModal(false)} className="w-full mt-4 py-2 text-[8px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">Retour</button>
                </div>
            </div>
        )}

        {/* MODAL NOUVELLE MISSION (CALENDRIER FORCÉ) */}
        {showNewTask && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4">
                <div className="glass-card w-full max-w-md p-8 border-t-4 border-emerald-500 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Déploiement Opérationnel</h3>
                        <button onClick={() => setShowNewTask(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-emerald-500 uppercase ml-2 tracking-widest italic">Intitulé de la mission</label>
                            <input type="text" placeholder="NOM DE L'OPÉRATION..." className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-black text-xs uppercase outline-none focus:border-emerald-500" value={missionForm.title} onChange={(e) => setMissionForm({...missionForm, title: e.target.value})} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-emerald-500 uppercase ml-2 tracking-widest italic">Agent Assigné</label>
                            <select className="w-full bg-[#111] border border-white/10 p-4 rounded-xl text-white font-black text-xs uppercase outline-none appearance-none focus:border-emerald-500" value={missionForm.assigned_to} onChange={(e) => setMissionForm({...missionForm, assigned_to: e.target.value})}>
                                <option value="">Choisir un collaborateur...</option>
                                {filteredStaff.map(m => (
                                    <option key={m.id} value={m.id}>{m.full_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-emerald-500 uppercase ml-2 tracking-widest italic">Échéance Tactique</label>
                            {/* Input date forcé pour VR */}
                            <input type="date" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-black text-xs uppercase outline-none focus:border-emerald-500" value={missionForm.deadline} onChange={(e) => setMissionForm({...missionForm, deadline: e.target.value})} />
                        </div>

                        <button onClick={deployMission} className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mt-4">
                            <Target size={18} /> Lancer l'Opération
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
