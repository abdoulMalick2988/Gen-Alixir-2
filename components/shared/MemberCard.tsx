export default function MemberCard({ user }: any) {
  return (
    <div className="p-6 rounded-3xl bg-zinc-900 border border-yellow-500/30 shadow-xl shadow-yellow-500/5">
      <h2 className="text-xl font-bold text-yellow-500">{user.name}</h2>
      <p className="text-gray-400 text-sm uppercase">{user.role}</p>
      <div className="mt-4 flex justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase">Points PCO</p>
          <p className="text-2xl font-black">{user.pco_points}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase">Aura</p>
          <p className="text-lg italic text-yellow-200">{user.aura_level}</p>
        </div>
      </div>
    </div>
  );
}
