"use client";
import React from 'react';
import Navbar from '@/components/shared/Navbar';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white bg-gradient-emerald text-black overflow-hidden">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center pt-40 px-6 text-center">
        {/* Logo Gen Alixir Noir et Vert */}
        <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase text-black">
          GEN <span className="text-[#10b981]">ALIXIR</span>
        </h1>
        
        <p className="text-gray-500 max-w-md text-sm mb-12 leading-relaxed font-medium">
          L'incubateur numérique décentralisé. <br/>
          <span className="text-black font-bold">L'excellence technologique africaine commence ici.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <a href="/dashboard" className="btn-emerald text-center uppercase tracking-widest text-xs">
            Espace Membre
          </a>
          <button className="border-2 border-black text-black font-black py-3 px-8 rounded-lg uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all">
            Découvrir l'écosystème
          </button>
        </div>
      </div>

      {/* Décoration minimaliste */}
      <div className="fixed bottom-[-100px] left-[-100px] w-64 h-64 bg-[#10b981] opacity-5 blur-[100px] rounded-full"></div>
    </main>
  );
}
