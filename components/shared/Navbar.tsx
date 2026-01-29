import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 relative">
          {/* Ton logo doré ici */}
          <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-20"></div>
          <img src="/logo-gen-alixir.png" alt="Logo" className="relative z-10" />
        </div>
        <span className="text-xl font-bold tracking-tighter text-white">GEN <span className="text-yellow-500">ALIXIR</span></span>
      </div>

      <Link 
        href="/auth/register" 
        className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)]"
      >
        ESPACE MEMBRE
      </Link>
    </nav>
  );
}
