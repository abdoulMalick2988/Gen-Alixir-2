"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import { Lock, Fingerprint, Eye, EyeOff, RefreshCcw, Key } from 'lucide-react';

/**
 * COMPOSANT DE SÉCURITÉ WAKANDA
 * Ce composant bloque tout l'écran tant que l'utilisateur n'est pas identifié.
 */
export default function WakandaGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [credentials, setCredentials] = useState({ username: '', pin: '' });
  const [showPin, setShowPin] = useState(false);

  // 1. Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const session = localStorage.getItem('wakanda_session');
    if (session) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  // 2. Procédure de connexion "Wakanda Gate"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // On interroge la table 'partners' créée sur Supabase
      const { data, error: authError } = await supabase
        .from('partners')
        .select('*')
        .eq('username', credentials.username)
        .eq('wakanda_code', credentials.pin)
        .single();

      if (authError || !data) throw new Error("Accès refusé. Identifiants invalides.");

      // Stockage de la session et déblocage
      localStorage.setItem('wakanda_session', JSON.stringify(data));
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ÉCRAN DE VÉRIFICATION INITIALE ---
  if (isChecking) return <div className="h-screen bg-black" />;

  // --- ÉCRAN DE CONNEXION (Style Instagram/SaaS Moderne) ---
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#020202] flex items-center justify-center p-6">
        {/* Effets de lumière en arrière-plan */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-10">
            <div className="inline-flex p-5 bg-white/[0.03] border border-white/10 rounded-[2rem] mb-6">
              <Fingerprint size={40} className="text-emerald-500" />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              ECO<span className="text-emerald-500">DREUM</span> <span className="text-zinc-700">GATE</span>
            </h1>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Accès Partenaire Agréé</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="NOM D'UTILISATEUR"
                className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-bold text-white uppercase outline-none focus:border-emerald-500 transition-all"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>

            <div className="relative space-y-2">
              <input 
                type={showPin ? "text" : "password"} 
                placeholder="CODE WAKANDA"
                className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-[11px] font-bold text-white tracking-[0.3em] outline-none focus:border-emerald-500 transition-all"
                value={credentials.pin}
                onChange={(e) => setCredentials({...credentials, pin: e.target.value})}
              />
              <button 
                type="button" 
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-[10px] text-zinc-600 hover:text-white"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-[9px] font-black text-rose-500 uppercase text-center">{error}</p>}

            <button 
              disabled={loading}
              className="w-full py-5 bg-emerald-500 hover:bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? <RefreshCcw size={16} className="animate-spin" /> : <Key size={16} />}
              {loading ? "Vérification..." : "Entrer dans le périmètre"}
            </button>
          </form>
          
          <p className="mt-8 text-center text-[8px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
            Propulsé par Ecodreum Intelligence • 2024
          </p>
        </div>
      </div>
    );
  }

  // --- SI AUTHENTIFIÉ : ON AFFICHE LE RESTE DU SITE ---
  return <>{children}</>;
}
