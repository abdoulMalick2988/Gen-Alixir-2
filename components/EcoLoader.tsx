"use client";

import React from "react";

interface EcoLoaderProps {
  message?: string;
  subMessage?: string;
}

export default function EcoLoader({ message = "Chargement", subMessage = "Veuillez patienter..." }: EcoLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo + Rotating circles container */}
        <div className="relative w-40 h-40">
          {/* Outer ring 1 - slow, clockwise */}
          <div className="absolute inset-0 eco-ring-outer">
            <svg viewBox="0 0 160 160" className="w-full h-full">
              <defs>
                <linearGradient id="ring1grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
                  <stop offset="50%" stopColor="rgba(212, 175, 55, 0.6)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="76" fill="none" stroke="url(#ring1grad)" strokeWidth="2" strokeDasharray="60 30 20 30" strokeLinecap="round" />
            </svg>
          </div>

          {/* Outer ring 2 - medium, counter-clockwise */}
          <div className="absolute inset-3 eco-ring-middle">
            <svg viewBox="0 0 136 136" className="w-full h-full">
              <defs>
                <linearGradient id="ring2grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(212, 175, 55, 0.7)" />
                  <stop offset="50%" stopColor="rgba(16, 185, 129, 0.5)" />
                  <stop offset="100%" stopColor="rgba(212, 175, 55, 0.1)" />
                </linearGradient>
              </defs>
              <circle cx="68" cy="68" r="64" fill="none" stroke="url(#ring2grad)" strokeWidth="2" strokeDasharray="40 20 15 25" strokeLinecap="round" />
            </svg>
          </div>

          {/* Inner ring 3 - fast, clockwise */}
          <div className="absolute inset-6 eco-ring-inner">
            <svg viewBox="0 0 112 112" className="w-full h-full">
              <defs>
                <linearGradient id="ring3grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.9)" />
                  <stop offset="50%" stopColor="rgba(212, 175, 55, 0.8)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
                </linearGradient>
              </defs>
              <circle cx="56" cy="56" r="52" fill="none" stroke="url(#ring3grad)" strokeWidth="2.5" strokeDasharray="30 15 10 20" strokeLinecap="round" />
            </svg>
          </div>

          {/* Orbiting dots on rings */}
          <div className="absolute inset-0 eco-ring-outer">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div className="absolute inset-3 eco-ring-middle">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          </div>
          <div className="absolute inset-6 eco-ring-inner">
            <div className="absolute top-1/2 right-0 translate-x-0.5 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          </div>

          {/* Center glow backdrop */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-yellow-500/10 blur-md" />

          {/* eCo Logo - center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <span className="text-3xl font-black tracking-tight select-none eco-logo-text">
                <span className="text-emerald-400">e</span>
                <span className="text-white">C</span>
                <span className="text-yellow-400">o</span>
              </span>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-400 tracking-[0.2em] uppercase mb-1.5 eco-text-pulse">
            {message}
          </p>
          <p className="text-xs text-emerald-600/70">{subMessage}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 eco-dot-1" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 eco-dot-2" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 eco-dot-3" />
        </div>
      </div>

      <style jsx>{`
        @keyframes eco-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes eco-spin-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes eco-text-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6)) drop-shadow(0 0 20px rgba(16, 185, 129, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(212, 175, 55, 0.6)) drop-shadow(0 0 30px rgba(212, 175, 55, 0.3));
          }
        }
        @keyframes eco-dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes eco-pulse-text {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .eco-ring-outer {
          animation: eco-spin-cw 4s linear infinite;
        }
        .eco-ring-middle {
          animation: eco-spin-ccw 3s linear infinite;
        }
        .eco-ring-inner {
          animation: eco-spin-cw 2s linear infinite;
        }
        .eco-logo-text {
          animation: eco-text-glow 2.5s ease-in-out infinite;
        }
        .eco-text-pulse {
          animation: eco-pulse-text 2s ease-in-out infinite;
        }
        .eco-dot-1 {
          animation: eco-dot-bounce 1.4s ease-in-out infinite;
        }
        .eco-dot-2 {
          animation: eco-dot-bounce 1.4s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        .eco-dot-3 {
          animation: eco-dot-bounce 1.4s ease-in-out infinite;
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
