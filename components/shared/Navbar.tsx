"use client";
import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="font-black text-2xl tracking-tighter text-black">
        GEN <span className="text-[#10b981]">ALIXIR</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Système Opérationnel
        </div>
        <div className="w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]"></div>
      </div>
    </nav>
  );
}
