"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Sem 1', value: 4000 },
  { name: 'Sem 2', value: 3000 },
  { name: 'Sem 3', value: 5000 },
  { name: 'Sem 4', value: 4500 },
  { name: 'Sem 5', value: 6500 },
];

export default function MainChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEco" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis hide={true} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2ecc71', borderRadius: '10px' }}
            itemStyle={{ color: '#2ecc71' }}
          />
          <Area type="monotone" dataKey="value" stroke="#2ecc71" strokeWidth={3} fillOpacity={1} fill="url(#colorEco)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
