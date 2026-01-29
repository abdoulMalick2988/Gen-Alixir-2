"use client";
import { useState } from 'react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Rejoindre l'Alchimie</h2>
        <p className="text-gray-500 text-sm mb-8">Votre candidature sera envoyée au Management.</p>
        
        <form className="space-y-4">
          <div>
            <label className="text-xs font-bold text-yellow-500 uppercase">Nom Complet</label>
            <input type="text" className="w-full bg-black border border-white/10 p-3 rounded-xl text-white mt-1 focus:border-yellow-500 outline-none" placeholder="Ex: Malick Thiam" />
          </div>
          <div>
            <label className="text-xs font-bold text-yellow-500 uppercase">Email Professionnel</label>
            <input type="email" className="w-full bg-black border border-white/10 p-3 rounded-xl text-white mt-1 focus:border-yellow-500 outline-none" placeholder="nom@exemple.com" />
          </div>
          <button 
            type="button"
            className="w-full py-4 bg-yellow-500 text-black font-black rounded-xl hover:bg-yellow-400 transition-colors shadow-lg"
            onClick={() => alert("Dossier envoyé à abdoulmalick2977@gmail.com ! En attente de validation.")}
          >
            SOUMETTRE MA CANDIDATURE
          </button>
        </form>
      </div>
    </div>
  );
}
