"use client";
import React from 'react';
import Navbar from '@/components/shared/Navbar';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">
          Gen <span className="text-yellow-500">Alixir</span>
        </h1>
        <p className="text-gray-400 max-w-md text-sm mb-10 leading-relaxed italic">
          L'incubateur numérique décentralisé pour la nouvelle ère technologique africaine.
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <a href="/dashboard" className="bg-yellow-500 text-black font-black py-4 rounded-full uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all">
            Espace Membre
          </a>
          <button className="border border-white/10 text-white font-bold py-4 rounded-full uppercase tracking-widest text-xs">
            Découvrir l'écosystème
          </button>
        </div>
      </div>
    </main>
  );
}
