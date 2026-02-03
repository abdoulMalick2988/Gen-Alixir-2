"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from "../lib/supabase";
import { Lock, Fingerprint, Eye, EyeOff, RefreshCcw, Key } from 'lucide-react';

// Création d'un contexte pour partager les infos de l'utilisateur partout
const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export default function WakandaGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ username: '', pin: '' });
  const [showPin, setShowPin] = useState(false);

  // Vérification au chargement : Est-il déjà connecté ?
  useEffect(() => {
    const savedSession = localStorage.getItem('wakanda_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
    setIsChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // On cherche le partenaire dans la table 'partners'
      const { data, error: authError } = await supabase
        .from('partners')
        .select('*')
        .eq('username', credentials.username)
        .eq('wakanda_code', credentials.pin)
        .single();

      if (authError || !data) throw new Error("Accès refusé. Identifiants invalides.");

      // On enregistre pour les prochaines visites
      localStorage.setItem('wakanda_session', JSON.stringify(data));
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) return <div className="h-screen bg-black" />;

  // SI PAS CONNECTÉ : ON AFFICHE L'ÉCRAN DE VERROUILLAGE
  if (!user) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <Fingerprint size={50} className="text-emerald-500 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">ECODREUM INTEL</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
            <input 
              className="w-full bg-black/50 border border-white/5 rounded-xl px-6 py-4 text-xs font-bold text-white uppercase outline-none focus:border-emerald-500"
              placeholder="UTILISATEUR"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
            <div className="relative">
              <input 
                type={showPin ? "text" : "password"} 
                className="w-full bg-black/50 border border-white/5 rounded-xl px-6 py-4 text-xs font-bold text-white tracking-[0.3em] outline-none focus:border-emerald-500"
                placeholder="CODE WAKANDA"
                value={credentials.pin}
                onChange={(e) => setCredentials({...credentials, pin: e.target.value})}
              />
            </div>
            {error && <p className="text-[10px] text-rose-500 font-bold uppercase text-center">{error}</p>}
            <button className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-xl hover:bg-white transition-all">
              {loading ? "VÉRIFICATION..." : "DÉVERROUILLER"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // SI CONNECTÉ : ON "LIBÈRE" LE RESTE DU SITE
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
