"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from "../lib/supabase";
import { Lock, Fingerprint, Eye, EyeOff, RefreshCcw, Key } from 'lucide-react';

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export default function WakandaGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ username: '', pin: '' });

  useEffect(() => {
    const savedSession = localStorage.getItem('wakanda_session');
    if (savedSession) { setUser(JSON.parse(savedSession)); }
    setIsChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase
        .from('partners')
        .select('*')
        .eq('username', credentials.username)
        .eq('wakanda_code', credentials.pin)
        .single();

      if (authError || !data) throw new Error("Accès refusé. Code Wakanda invalide.");
      localStorage.setItem('wakanda_session', JSON.stringify(data));
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  if (isChecking) return <div className="h-screen bg-black" />;

  if (!user) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <Fingerprint size={60} className="text-emerald-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-black text-white italic mb-8 uppercase tracking-tighter text-center">ECODREUM <span className="text-emerald-500">INTEL</span></h1>
          <form onSubmit={handleLogin} className="space-y-4 bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
            <input 
              className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-5 text-xs font-bold text-white uppercase outline-none focus:border-emerald-500 transition-all"
              placeholder="NOM D'UTILISATEUR"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
            <input 
              type="password"
              className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-5 text-xs font-bold text-white tracking-[0.5em] outline-none focus:border-emerald-500 transition-all"
              placeholder="CODE WAKANDA"
              value={credentials.pin}
              onChange={(e) => setCredentials({...credentials, pin: e.target.value})}
            />
            {error && <p className="text-[10px] text-rose-500 font-black uppercase">{error}</p>}
            <button className="w-full py-5 bg-emerald-500 text-black font-black uppercase text-[11px] rounded-2xl hover:bg-white transition-all shadow-lg shadow-emerald-500/20">
              {loading ? "VÉRIFICATION..." : "DÉVERROUILLER L'ACCÈS"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
