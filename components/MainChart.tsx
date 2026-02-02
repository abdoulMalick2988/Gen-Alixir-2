"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Sem 1', uv: 4000 },
  { name: 'Sem 2', uv: 3000 },
  { name: 'Sem 3', uv: 2000 },
  { name: 'Sem 4', uv: 2780 },
];

export default function MainChart() {
  return (
    <div className="w-full h-full min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
            itemStyle={{ color: '#2ecc71' }}
          />
          <Area type="monotone" dataKey="uv" stroke="#2ecc71" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
