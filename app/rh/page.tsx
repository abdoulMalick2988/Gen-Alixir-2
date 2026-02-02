"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { Users, Crosshair, ChevronLeft, CheckCircle, Plus, X, Loader2, Lock, Unlock, Calendar, Play, ArrowRight } from "lucide-react";

// ... (Gardez DEPARTMENTS, GoldBadge et EmeraldBadge identiques)

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
  
  // États de la Mission
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskStep, setTaskStep] = useState(1); // Étape 1 ou 2
  const [isDeploying, setIsDeploying] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', deadline: '' });
  const [customAlert, setCustomAlert] = useState<{show: boolean, msg: string, type: 'error' | 'success'}>({show: false, msg: '', type: 'success'});

  // Calcul de la date de demain pour le min du calendrier
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => { fetchStaff(); }, []);
  useEffect(() => { if (isAuthorized && selectedDept) fetchTasks(); }, [isAuthorized, selectedDept]);

  const triggerAlert = (msg: string, type: 'error' | 'success' = 'error') => {
    setCustomAlert({ show: true, msg, type });
    setTimeout(() => setCustomAlert({ ...customAlert, show: false }), 4000);
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
      triggerAlert("CODE WAKANDA INCORRECT");
      setWakandaInput("");
    }
  };

  const handleDeployTask = async () => {
    setIsDeploying(true);
    const { error } = await supabase.from('tasks').insert([{ ...newTask, department: selectedDept, status: 'En cours' }]);
    if (!error) {
        setShowTaskModal(false);
        setTaskStep(1);
        fetchTasks();
        triggerAlert("MISSION DÉPLOYÉE AVEC SUCCÈS", 'success');
    } else {
        triggerAlert("ERREUR DE LIAISON AU SERVEUR");
    }
    setIsDeploying(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="text-emerald-500 animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        
        {/* ALERTES PERSONNALISÉES ECODREUM */}
        {customAlert.show && (
            <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[500] px-8 py-4 rounded-2xl border font-black uppercase italic tracking-tighter animate-in slide-in-from-top duration-300 shadow-2xl ${customAlert.type === 'error' ? 'bg-red-600/90 border-white' : 'bg-emerald-600/90 border-white'}`}>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] opacity-70">ECODREUM INDIQUE :</span>
                    <span className="text-sm">{customAlert.msg}</span>
                </div>
            </div>
        )}

        {/* ... (Header et Liste des Missions identiques) */}
        
        {/* BOUTON AJOUTER (Partie tasks) */}
        {view === 'tasks' && isAuthorized && (
            <div className="flex justify-end mb-4">
                <button onClick={() => {setTaskStep(1); setShowTaskModal(true);}} className="bg-black border-2 border-emerald-500 px-8 py-3 rounded-xl font-black text-emerald-500 uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Plus size={18} strokeWidth={3} /> Ajouter une Mission
                </button>
            </div>
        )}

        {/* MODAL MISSION EN 2 ÉTAPES */}
        {showTaskModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4 backdrop-blur-3xl">
                <div className="glass-card w-full max-w-md p-8 border-t-4 border-t-emerald-500 animate-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Étape {taskStep} / 2</p>
                            <h2 className="text-xl font-black text-white uppercase italic">Déploiement Opérationnel</h2>
                        </div>
                        <button onClick={() => setShowTaskModal(false)}><X className="text-white opacity-50 hover:opacity-100" /></button>
                    </div>

                    {taskStep === 1 ? (
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Intitulé</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 text-white" value={newTask.title} onChange={(e)=>setNewTask({...newTask, title: e.target.value})} placeholder="Nom de l'opération..."/>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Agent Tactique</label>
                                <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none text-white appearance-none" onChange={(e)=>setNewTask({...newTask, assigned_to: e.target.value})} value={newTask.assigned_to}>
                                    <option value="">-- CHOISIR UN AGENT --</option>
                                    {staff.filter(m => m.department === selectedDept).map(m => (
                                        <option key={m.id} value={m.id} className="bg-black text-white">{m.full_name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={() => (newTask.title && newTask.assigned_to) ? setTaskStep(2) : triggerAlert("REMPLISSEZ LES CHAMPS")}
                                className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all"
                            >
                                Suivant <ArrowRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-4">
                                <p className="text-[10px] font-black text-emerald-500 uppercase">Mission : {newTask.title}</p>
                                <p className="text-[10px] font-black text-white uppercase">Agent : {staff.find(s => s.id === newTask.assigned_to)?.full_name}</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-emerald-500 uppercase mb-4 block">Définir l'échéance (À partir de demain)</label>
                                <input 
                                    type="date" 
                                    min={minDate}
                                    className="w-full bg-white/10 border-2 border-emerald-500 p-6 rounded-2xl text-white text-xl font-black scheme-dark focus:bg-emerald-500 focus:text-black transition-all" 
                                    onChange={(e)=>setNewTask({...newTask, deadline: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setTaskStep(1)} className="flex-1 py-5 bg-white/5 text-white font-black uppercase text-xs rounded-2xl border border-white/10">Retour</button>
                                <button 
                                    onClick={handleDeployTask} 
                                    disabled={isDeploying || !newTask.deadline}
                                    className="flex-[2] py-5 bg-emerald-500 text-black font-black uppercase text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2"
                                >
                                    {isDeploying ? <Loader2 className="animate-spin" /> : <><Play size={18} fill="black" /> Confirmer & Déployer</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* ... (Le reste du modal PIN et de la page reste identique) */}
      </main>
    </div>
  );
}
