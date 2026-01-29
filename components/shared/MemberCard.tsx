export default function MemberCard({ user }: any) {
  const isFondateur = user.role === 'Fondateur';
  
  return (
    <div className={`relative w-full max-w-sm p-6 rounded-[2rem] overflow-hidden border ${isFondateur ? 'border-yellow-500/50 bg-zinc-900' : 'border-white/10 bg-zinc-900/50'}`}>
      {/* Effet de brillance pour le Fondateur */}
      {isFondateur && <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-600/20 blur-[80px]"></div>}
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-2xl font-black text-black shadow-lg">
            {user.name[0]}
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Aura Level</span>
            <p className="text-lg font-medium text-white italic">{user.aura_level} ✨</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
        <p className="text-xs text-gray-500 mb-6 uppercase tracking-tighter">{user.role} GEN ALIXIR</p>

        <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">Points PCO</p>
            <p className="text-2xl font-black text-yellow-500">{user.pco_points}<span className="text-xs text-yellow-800">/99</span></p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">Rang</p>
            <p className="text-sm font-bold text-white mt-1">Niveau {Math.floor(user.pco_points / 10)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
