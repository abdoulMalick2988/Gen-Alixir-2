"use client";
import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-white/40 backdrop-blur-md border-b border-gray-100/50 transition-all duration-300">
      {/* Logo texte intégralement Noir */}
      <div className="font-black text-2xl tracking-tighter text-black">
        GEN ALIXIR
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_10px_#10b981]"></div>
        <span className="text-[10px] font-bold text-black uppercase tracking-widest">Opérationnel</span>
      </div>
    </nav>
  );
}
