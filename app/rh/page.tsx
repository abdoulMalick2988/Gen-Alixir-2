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
    fetchInitialData();
  }, []);

  // Récupération des données filtrées par département si autorisé
  useEffect(() => {
    if (selectedDept && isAuthorized) {
      fetchDeptData();
    }
  }, [selectedDept, isAuthorized]);

  async function fetchInitialData() {
    const { data: staffData } = await supabase.from('staff').select('*');
    if (staffData) setStaff(staffData);
    setLoading(false);
  }

  async function fetchDeptData() {
    const { data: taskData } = await supabase.from('tasks').select('*').eq('department', selectedDept);
    if (taskData) setTasks(taskData);
  }

  const handlePinSubmit = () => {
    if (wakandaInput === tempDept.pin) {
      setSelectedDept(tempDept.name);
      setIsAuthorized(true);
      setShowPinModal(false);
      setWakandaInput("");
    } else {
      alert("❌ WAKANDA CODE INCORRECT. ACCÈS REFUSÉ.");
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
        fetchDeptData(); // Actualise la liste
        alert("✅ MISSION DÉPLOYÉE");
    }
    setIsDeploying(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" size={40} /></div>;

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        
        {/* HEADER */}
        <div className="flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase italic">HUMAN <span className="text-emerald-500">ENGINE</span></h1>
          <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-80">
            <button onClick={() => setView('members')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'members' ? 'bg-emerald-500 shadow-lg' : 'text-gray-400'}`}>Collaborateurs</button>
            <button onClick={() => setView('tasks')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'tasks' ? 'bg-gold text-black shadow-lg' : 'text-gray-400'}`}>Missions</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!isAuthorized ? (
            /* GRILLE DES DÉPARTEMENTS VERROUILLÉS */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
              {DEPARTMENTS.map((dept) => (
                <button 
                  key={dept.name} 
                  onClick={() => { setTempDept(dept); setShowPinModal(true); }}
                  className="glass-card p-8 border border-white/5 hover:border-gold/50 transition-all group flex flex-col items-center gap-3 relative overflow-hidden"
                >
                  <Lock className="text-gold/30 group-hover:text-gold transition-colors" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{dept.name}</span>
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
          ) : (
            /* VUE AUTORISÉE (SYSTÈME SOLAIRE OU MISSIONS) */
            <div className="h-full flex flex-col animate-in zoom-in duration-300">
               <div className="flex justify-between items-center mb-6">
                  <button onClick={() => { setIsAuthorized(false); setSelectedDept(null); }} className="text-xs font-black text-emerald-500 flex items-center gap-2 hover:underline">
                    <Unlock size={14} /> DÉCONNEXION SECTEUR : {selectedDept}
                  </button>
               </div>

               {view === 'members' ? (
                 <div className="flex-1 relative flex items-center justify-center min-h-[500px]">
                    {/* LE CHEF ET SES SATELLITES (ICI TON CODE DE BADGES PRÉCÉDENT) */}
                    <div className="text-center">
                        <p className="text-gold font-black animate-pulse text-xs uppercase tracking-[0.5em]">Secteur Sécurisé {selectedDept}</p>
                        <p className="text-[10px] text-gray-500 mt-2 italic">Accès restreint au Chef de Département</p>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="glass-card p-6 flex justify-between items-center border-l-4 border-l-gold bg-gold/5">
                        <h3 className="text-xl font-black text-gold italic uppercase">Missions {selectedDept}</h3>
                        <button onClick={() => setShowTaskModal(true)} className="bg-gold text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><Plus size={14}/> Ajouter une Mission</button>
                    </div>
                    {/* LISTE DES MISSIONS RÉELLES */}
                    {tasks.length > 0 ? tasks.map(task => (
                        <div key={task.id} className="glass-card p-4 border border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500"><Zap size={18}/></div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-tight">{task.title}</h4>
                                    <p className="text-[9px] text-gray-500 uppercase">Agent ID: {task.assigned_to}</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black px-3 py-1 bg-white/5 rounded-full border border-white/10">{task.status}</span>
                        </div>
                    )) : (
                        <p className="text-center py-10 text-gray-600 text-[10px] font-black uppercase tracking-widest">Aucune mission active dans ce secteur</p>
                    )}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* MODAL WAKANDA CODE */}
        {showPinModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-xl">
            <div className="glass-card p-10 border-t-4 border-t-gold flex flex-col items-center gap-6 animate-in zoom-in">
              <Lock className="text-gold animate-bounce" size={40} />
              <div className="text-center">
                <h2 className="text-xl font-black text-white uppercase italic">Secteur {tempDept?.name}</h2>
                <p className="text-[10px] text-gold font-bold tracking-[0.3em] uppercase mt-2">Entrez le WAKANDA Code</p>
              </div>
              <input 
                type="password" 
                maxLength={4}
                value={wakandaInput}
                onChange={(e) => setWakandaInput(e.target.value)}
                className="bg-white/5 border-2 border-white/10 rounded-2xl w-40 py-4 text-center text-2xl font-black tracking-[0.5em] focus:border-gold outline-none transition-all"
                autoFocus
              />
              <div className="flex gap-4 w-full">
                <button onClick={() => setShowPinModal(false)} className="flex-1 py-3 text-[10px] font-black uppercase border border-white/10 rounded-xl">Annuler</button>
                <button onClick={handlePinSubmit} className="flex-1 py-3 bg-gold text-black text-[10px] font-black uppercase rounded-xl">Vérifier</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL AJOUT MISSION (Identique au précédent mais simplifié) */}
        {showTaskModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
                <div className="glass-card w-full max-w-md p-8 border-t-4 border-t-gold animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-black text-gold uppercase italic mb-6">Nouvelle Mission : {selectedDept}</h2>
                    <div className="space-y-4">
                        <input type="text" placeholder="Intitulé..." className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-gold" onChange={(e)=>setNewTask({...newTask, title: e.target.value})}/>
                        <select className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none" onChange={(e)=>setNewTask({...newTask, assigned_to: e.target.value})}>
                            <option value="">Choisir un agent de {selectedDept}</option>
                            {staff.filter(m => m.department === selectedDept).map(m => (
                                <option key={m.id} value={m.id} className="bg-black">{m.full_name}</option>
                            ))}
                        </select>
                        <button onClick={handleDeployTask} className="w-full py-4 bg-gold text-black font-black uppercase text-xs rounded-xl shadow-lg">Déployer Mission</button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
