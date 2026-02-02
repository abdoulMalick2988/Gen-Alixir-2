"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  Users, Lock, Unlock, Plus, X, Loader2, CheckCircle, Trash2, 
  ShieldCheck, User, Star, LayoutGrid, ClipboardList, Briefcase, 
  UserCircle, Target, Zap, Shield, Award, Calendar, AlertTriangle
} from "lucide-react";

// --- CONFIGURATION DÉPARTEMENTS ---
const DEPARTMENTS = [
  { name: "Management", pin: "1111", wakanda: "9991", color: "#fbbf24" },
  { name: "Marketing", pin: "2222", wakanda: "9992", color: "#10b981" },
  { name: "Technique", pin: "0000", wakanda: "9990", color: "#3b82f6" },
  { name: "Finances", pin: "4444", wakanda: "9994", color: "#f87171" },
  { name: "Ressources Humaines", pin: "7777", wakanda: "9997", color: "#a855f7" }
];

// --- COMPOSANTS INTERNES ---

const TacticalBadge = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white/5 border border-white/10 p-2 rounded-lg flex flex-col items-center justify-center min-w-[80px]">
    <div className="flex items-center gap-1 mb-1">
      <Icon size={10} className={color} />
      <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">{label}</span>
    </div>
    <span className="text-xs font-black text-white italic leading-none">{value}</span>
  </div>
);

const MemberCard = ({ member }: { member: any }) => {
  const skills = Array.isArray(member?.skills) ? member.skills : ["Agent", "Actif"];
  
  return (
    <div className="group relative w-full max-w-[320px] perspective-1000">
      <div className="glass-card p-5 border-2 border-emerald-500/20 bg-gradient-to-b from-black via-emerald-950/5 to-black rounded-2xl transition-all duration-500 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
        {/* Header Carte */}
        <div className="flex justify-between items-start mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl rotate-3 border-2 border-emerald-500 p-1 bg-black overflow-hidden group-hover:rotate-0 transition-transform">
              {member?.photo ? (
                <img src={member.photo} alt="pfp" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <User className="m-auto text-emerald-900 w-full h-full" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-1 rounded-md shadow-lg">
              <Shield size={12} fill="black" />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">Status: Online</span>
            <h3 className="text-lg font-black text-white uppercase italic leading-none mt-1 truncate max-w-[150px]">{member?.full_name || "Unknown"}</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{member?.role || "Agent"}</p>
          </div>
        </div>

        {/* Skills Tactiques */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {skills.slice(0, 3).map((s: string, i: number) => (
            <span key={i} className="text-[7px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300 uppercase tracking-widest italic">
              {s}
            </span>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
          <TacticalBadge label="Aura Power" value={member?.aura || "1.0"} icon={Zap} color="text-emerald-400" />
          <TacticalBadge label="Crédits PCO" value={`${member?.pco || 0} PTS`} icon={Award} color="text-gold" />
        </div>
      </div>
    </div>
  );
};

export default function RHPage() {
  // --- ÉTATS ---
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- FORMULAIRE MISSION ---
  const [missionForm, setMissionForm] = useState({ title: '', assigned_to: '', deadline: '' });

  // --- EFFETS ---
  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (isAuthorized && selectedDept) fetchTasks();
  }, [isAuthorized, selectedDept]);

  // --- ACTIONS ---
  async function fetchStaff() {
    try {
      const { data, error } = await supabase.from('staff').select('*').order('pco', { ascending: false });
      if (error) throw error;
      setStaff(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function fetchTasks() {
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('department', selectedDept).order('created_at', { ascending: false });
      if (error) throw error;
      setTasks(data || []);
    } catch (e) { console.error(e); }
  }

  const handleAuth = () => {
    const targetCode = accessMode === 'manager' ? tempDept.pin : tempDept.wakanda;
    if (wakandaInput === targetCode) {
      setSelectedDept(tempDept.name);
      setIsAuthorized(true);
      setShowPinModal(false);
      setWakandaInput("");
    } else {
      triggerError("CODE D'ACCÈS INVALIDE");
    }
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const deployMission = async () => {
    if (!missionForm.title || !missionForm.assigned_to) return triggerError("DONNÉES MANQUANTES");
    
    // Sécurité : Vérifier si la colonne deadline existe ou utiliser created_at par défaut
    const payload = {
        title: missionForm.title,
        assigned_to: missionForm.assigned_to,
        department: selectedDept,
        status: 'En cours',
        deadline: missionForm.deadline || new Date().toISOString().split('T')[0]
    };

    const { error } = await supabase.from('tasks').insert([payload]);
    if (error) {
        console.error(error);
        triggerError("ERREUR DE DÉPLOIEMENT");
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
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Initialisation Système...</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative">
        
        {/* NOTIFICATION D'ERREUR TACTIQUE */}
        {errorMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-red-600 border-2 border-white px-8 py-4 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-in slide-in-from-top">
            <AlertTriangle size={20} className="text-white" />
            <span className="text-xs font-black uppercase italic tracking-wider">{errorMsg}</span>
          </div>
        )}

        {/* HEADER BAR */}
        <header className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Users size={20} className="text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Human <span className="text-emerald-500">Engine</span></h1>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Intelligence Division • Ecodreum v2.6</p>
            </div>
          </div>

          {isAuthorized && (
            <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col items-end">
                  <span className="text-[7px] text-gray-500 font-black uppercase">Secteur Connecté</span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase italic">{selectedDept}</span>
               </div>
               <button onClick={() => { setIsAuthorized(false); setSelectedDept(null); }} className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg">
                  <Unlock size={18} />
               </button>
            </div>
          )}
        </header>

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1 overflow-y-auto custom-scroll pr-2">
          {!isAuthorized ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-10">
              {DEPARTMENTS.map((dept) => (
                <button 
                  key={dept.name} 
                  onClick={() => { setTempDept(dept); setShowPinModal(true); }}
                  className="group relative h-40 glass-card border border-white/5 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-full flex flex-col items-center justify-center gap-4">
                    <div className="p-4 rounded-full bg-white/5 group-hover:bg-emerald-500/20 transition-all">
                      <Lock size={24} className="text-white/20 group-hover:text-emerald-500" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{dept.name}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8 h-full">
              {/* NAVIGATION INTERNE */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setView('members')} className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all ${view === 'members' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-white'}`}>
                    <LayoutGrid size={14} /> Effectifs
                  </button>
                  <button onClick={() => setView('tasks')} className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all ${view === 'tasks' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gray-500 hover:text-white'}`}>
                    <ClipboardList size={14} /> Missions
                  </button>
                </div>

                {view === 'tasks' && accessMode === 'manager' && (
                  <button onClick={() => setShowNewTask(true)} className="w-full sm:w-auto px-6 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all">
                    <Plus size={16} /> Déployer une Opération
                  </button>
                )}
              </div>

              {/* GRILLE DES MEMBRES */}
              {view === 'members' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center pb-20">
                  {staff.filter(m => m.department === selectedDept).map(m => (
                    <MemberCard key={m.id} member={m} />
                  ))}
                  {staff.filter(m => m.department === selectedDept).length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-20">
                      <Users size={60} className="mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-[0.5em]">Aucun Agent Détecté dans ce Secteur</p>
                    </div>
                  )}
                </div>
              ) : (
                /* LISTE DES MISSIONS */
                <div className="grid gap-4 pb-20 max-w-4xl mx-auto w-full">
                  {tasks.map(task => (
                    <div key={task.id} className="glass-card p-5 border border-white/5 hover:bg-white/5 transition-all group">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 w-2 h-2 rounded-full ${task.status === 'En cours' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-gray-600'}`} />
                          <div>
                            <h4 className="font-black text-sm uppercase italic text-white tracking-tight">{task.title}</h4>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[8px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <User size={10} /> {staff.find(s => s.id === task.assigned_to)?.full_name || "Agent Terrain"}
                                </span>
                                <span className="text-[8px] font-bold text-emerald-500/80 uppercase flex items-center gap-1">
                                    <Calendar size={10} /> {task.deadline}
                                </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                          {task.status === 'En cours' ? (
                            <button onClick={() => completeTask(task.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg font-black text-[9px] uppercase hover:bg-emerald-500 hover:text-black transition-all">
                              <CheckCircle size={14} /> Valider Objectif
                            </button>
                          ) : (
                            <span className="px-4 py-2 bg-white/5 text-gray-500 rounded-lg font-black text-[8px] uppercase italic">Opération Terminée</span>
                          )}
                          {accessMode === 'manager' && (
                            <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL AUTHENTIFICATION (SWITCH INCLUS) */}
        {showPinModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4">
            <div className="glass-card w-full max-w-sm p-8 border border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.1)] animate-in zoom-in duration-300">
              <div className="text-center mb-8">
                <ShieldCheck className="mx-auto text-emerald-500 mb-4" size={40} />
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Secteur {tempDept?.name}</h2>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 italic">Vérification de l'Habilitation</p>
              </div>

              {/* LE SWITCH MODE MANAGER / MEMBRE */}
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 mb-8">
                <button onClick={() => setAccessMode('member')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all ${accessMode === 'member' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' : 'text-gray-500 hover:text-white'}`}>
                  <UserCircle size={16} /> Membre
                </button>
                <button onClick={() => setAccessMode('manager')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all ${accessMode === 'manager' ? 'bg-gold text-black shadow-lg shadow-gold/30' : 'text-gray-500 hover:text-white'}`}>
                  <Briefcase size={16} /> Manager
                </button>
              </div>

              <div className="relative mb-8">
                <input 
                  type="password" 
                  maxLength={4}
                  value={wakandaInput}
                  onChange={(e) => setWakandaInput(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-emerald-500 text-center text-5xl font-black tracking-[0.4em] text-white py-4 outline-none focus:border-white transition-all"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
                <p className="text-[7px] text-gray-600 uppercase font-black text-center mt-4 tracking-widest">Saisissez votre Wakanda Code à 4 chiffres</p>
              </div>

              <button onClick={handleAuth} className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-xs rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                Initialiser Connexion
              </button>
              
              <button onClick={() => setShowPinModal(false)} className="w-full mt-4 py-2 text-[8px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* MODAL NOUVELLE MISSION */}
        {showNewTask && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            <div className="glass-card w-full max-w-md p-8 border-t-4 border-emerald-500 animate-in slide-in-from-bottom duration-300">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Déploiement Opérationnel</h3>
                  <button onClick={() => setShowNewTask(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
               </div>

               <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-emerald-500 uppercase ml-2">Intitulé de l'Opération</label>
                    <input 
                      type="text" 
                      placeholder="NOM DE LA MISSION..." 
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-black text-xs uppercase outline-none focus:border-emerald-500"
                      value={missionForm.title}
                      onChange={(e) => setMissionForm({...missionForm, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-emerald-500 uppercase ml-2">Agent de Terrain</label>
                    <select 
                      className="w-full bg-[#111] border border-white/10 p-4 rounded-xl text-white font-black text-xs uppercase outline-none appearance-none focus:border-emerald-500"
                      value={missionForm.assigned_to}
                      onChange={(e) => setMissionForm({...missionForm, assigned_to: e.target.value})}
                    >
                      <option value="">Sélectionner un Agent</option>
                      {staff.filter(m => m.department === selectedDept).map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-emerald-500 uppercase ml-2">Échéance Tactique</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-black text-xs uppercase outline-none focus:border-emerald-500"
                      value={missionForm.deadline}
                      onChange={(e) => setMissionForm({...missionForm, deadline: e.target.value})}
                    />
                  </div>

                  <button onClick={deployMission} className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all mt-4">
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
