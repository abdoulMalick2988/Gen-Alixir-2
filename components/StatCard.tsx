export default function StatCard({ title, value, change }: any) {
  return (
    <div className="glass-card p-3 flex flex-col justify-center border-l-4 border-l-emerald-500 h-20">
      <p className="text-[10px] font-bold text-emerald-header uppercase tracking-tighter mb-1">
        {title}
      </p>
      <div className="flex items-end justify-between">
        <h4 className="text-lg font-black text-white">{value}</h4>
        <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
          {change}
        </span>
      </div>
    </div>
  );
}
