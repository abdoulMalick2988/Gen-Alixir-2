import { ArrowUpRight } from "lucide-react";

export default function StatCard({ title, value, change }: { title: string, value: string, change: string }) {
  return (
    <div className="glass-card p-6 flex flex-col space-y-2 hover:border-emerald/40 transition-all cursor-default">
      <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</span>
      <div className="flex justify-between items-end">
        <span className="text-3xl font-bold text-white">{value}</span>
        <div className="flex items-center text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
          <ArrowUpRight size={16} className="mr-1" />
          {change}
        </div>
      </div>
    </div>
  );
}
