"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  Users, Crosshair, ChevronLeft, ChevronRight, Plus, X, 
  Loader2, Lock, Unlock, Calendar, Play, ArrowRight, CheckCircle, FileText, Trash2, ShieldCheck, User
} from "lucide-react";

// --- CONFIGURATION ---
const DEPARTMENTS = [
  { name: "Management", pin: "1111", wakanda: "9991" },
  { name: "Marketing", pin: "2222", wakanda: "9992" },
  { name: "Technique", pin: "0000", wakanda: "9990" },
  { name: "Ressources Humaines", pin: "7777", wakanda: "9997" }
];

// --- COMPOSANT CARTE DE MEMBRE TACTIQUE ---
const MemberCard = ({ member }: { member: any }) => (
    <div className="glass-card p-6 border-2 border-emerald-500/30 bg-gradient-to-br from-black via-emerald-950/20 to-black relative overflow-hidden w-full max-w-sm">
        <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-black font-black text-[8px] uppercase italic">Membre Actif</div>
        <div className="flex gap-4 items-center mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-emerald-500 p-1">
                <div className="w-full h-full rounded-full bg-emerald-900 flex items-center justify-center overflow-hidden">
                    {member.photo ? <img src={member.photo} alt="Avatar" /> : <User size={40} className="text-emerald-500" />}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-black italic uppercase text-white leading-none">{member.full_name}</h3>
                <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">{member.role}</p>
                <div className="mt-2 flex gap-2">
                    {member.skills?.map((s: string) => <span key={s} className="text-[7px] border border-white/20 px-2 py-0.5 rounded uppercase">{s}</span>)}
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div>
                <p className="text-[8px] text-gray-500 uppercase font-black">Niveau d'Aura</p>
                <p className="text-lg font-black text-emerald-400 italic">{member.aura || "BETA"}</p>
            </div>
            <div className="text-right">
                <p className="text-[8px] text-gray-500 uppercase font-black">Contribution PCO</p>
                <p className="text-lg font-black text-gold italic">{member.pco || 1} PTS</p>
            </div>
        </div>
    </div>
);

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
  const [filterStatus, setFilterStatus] = useState('En cours');
  const [loading, setLoading] = useState(true);
  const [customAlert, setCustomAlert] = useState<{show: boolean, msg: string, type: 'error' | 'success'}>({show: false, msg: '', type: 'success'});

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

  const triggerAlert = (msg: string, type: 'error' | 'success' = 'error') => {
    setCustomAlert({ show: true, msg, type });
    setTimeout(() => setCustomAlert({ show: false, msg: '', type: 'error' }), 4000);
  };

  const handlePinSubmit = () => {
    const isManagerCode = wakandaInput === tempDept.pin;
    const isMemberCode = wakandaInput === tempDept.wakanda;

    if (isManagerCode || isMemberCode) {
      setSelectedDept(tempDept.name);
      setAccessMode(isManagerCode ? 'manager' : 'member');
      setIsAuthorized(true);
      setShowPinModal(false);
      setWakandaInput("");
    } else {
      triggerAlert("CODE INCORRECT - ACCÈS REFUSÉ");
      setWakandaInput("");
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (!error) {
        fetchTasks();
        triggerAlert(`MISSION VALIDÉE`, 'success');
    }
  };

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
        
        {customAlert.show && (
            <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[999] px-8 py-4 rounded-2xl border-2 font-black uppercase italic animate-in slide-in-from-top ${customAlert.type === 'error' ? 'bg-red-600 border-white' : 'bg-emerald-600 border-white'}`}>
                <span className="text-sm">{customAlert.msg}</span>
            </div>
        )}

        <div className="flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">HUMAN <span className="text-emerald-500">ENGINE</span></h1>
          {isAuthorized && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black uppercase text-emerald-500 italic">{accessMode} mode</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">
          {!isAuthorized ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DEPARTMENTS.map((dept) => (
                <button key={dept.name} onClick={() => { setTempDept(dept); setShowPinModal(true); }} className="glass-card p-8 border border-white/5 hover:border-emerald-500 group flex flex-col items-center gap-3 transition-all">
                  <Lock className="text-white/20 group-hover:text-emerald-500" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{dept.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col">
               <div className="flex justify-between items-center mb-6">
                 <button onClick={() => { setIsAuthorized(false); setSelectedDept(null); }} className="text-[10px] font-black text-emerald-400 flex items-center gap-2 uppercase italic hover:text-white transition-all">
                   <Unlock size={14} /> Quitter le secteur {selectedDept}
                 </button>
                 <div className="glass-card p-1 flex bg-white/5 border border-white/10 rounded-2xl w-60">
                    <button onClick={() => setView('members')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'members' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}>Équipe</button>
                    <button onClick={() => setView('tasks')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'tasks' ? 'bg-gold text-black' : 'text-gray-400'}`}>Missions</button>
                </div>
               </div>

               {view === 'members' ? (
                 <div className="flex-1 flex flex-wrap gap-6 justify-center items-center py-10">
                    {/* Si mode Manager : Vue d'ensemble */}
                    {accessMode === 'manager' ? (
                        staff.filter(m => m.department === selectedDept).map(m => (
                            <MemberCard key={m.id} member={m} />
                        ))
                    ) : (
                        /* Si mode Membre : Sa propre carte (simulation ici sur le premier membre du dept) */
                        <MemberCard member={staff.find(m => m.department === selectedDept)} />
                    )}
                 </div>
               ) : (
                 <div className="space-y-6">
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                        {['En cours', 'Terminée'].map((status) => (
                            <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filterStatus === status ? 'bg-white/10 text-white' : 'text-gray-500'}`}>{status}</button>
                        ))}
                    </div>
                    <div className="grid gap-3">
                        {tasks.filter(t => t.status === filterStatus).map(task => (
                            <div key={task.id} className="glass-card p-4 border border-white/5 flex justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${task.status === 'En cours' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase italic">{task.title}</h4>
                                        <p className="text-[9px] text-gray-400 uppercase">Agent : {staff.find(s => s.id === task.assigned_to)?.full_name}</p>
                                    </div>
                                </div>
                                {task.status === 'En cours' && (
                                    <button onClick={() => handleUpdateStatus(task.id, 'Terminée')} className="px-4 py-2 bg-emerald-500 text-black font-black text-[9px] uppercase rounded-lg hover:scale-105 transition-all">
                                        Terminer Mission
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* MODAL PIN WAKANDA DOUBLE ACCÈS */}
        {showPinModal && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
                <div className="glass-card p-10 border border-emerald-500/20 flex flex-col items-center gap-6 animate-in zoom-in">
                    <Lock className="text-emerald-500" size={40} />
                    <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Secteur {tempDept?.name}</h2>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3em] mt-2 italic font-black">ENTREZ LE WAKANDA CODE</p>
                    </div>
                    <input type="password" maxLength={4} value={wakandaInput} onChange={(e) => setWakandaInput(e.target.value)} className="bg-white/5 border-b-2 border-emerald-500 w-40 py-4 text-center text-3xl font-black tracking-[0.5em] outline-none text-white" autoFocus onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()} />
                    <p className="text-[8px] text-gray-500 uppercase font-bold italic">Identification Manager ou Membre requise</p>
                    <button onClick={handlePinSubmit} className="w-full py-4 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-xl">VÉRIFIER L'AUTORISATION</button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
