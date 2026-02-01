import { Lock } from "lucide-react";

export default function LockedOverlay({ levelRequired }: { levelRequired: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-black/40 backdrop-blur-xl border border-gold/30">
      <div className="bg-gold/20 p-4 rounded-full mb-4 animate-pulse">
        <Lock className="text-gold" size={40} />
      </div>
      <h3 className="text-xl font-bold text-white uppercase tracking-widest">Données Verrouillées</h3>
      <p className="text-gray-300 text-sm mt-2">Niveau <span className="text-gold font-bold">{levelRequired}</span> requis pour accéder à la BI</p>
      <button className="mt-6 px-6 py-2 bg-gold text-black font-bold rounded-full text-xs hover:scale-105 transition-all">
        S'abonner à l'offre {levelRequired}
      </button>
    </div>
  );
}
