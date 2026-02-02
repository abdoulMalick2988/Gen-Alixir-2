"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Elite', value: 400 },
  { name: 'Gold', value: 300 },
  { name: 'Silver', value: 300 },
  { name: 'Karibu', value: 200 },
];

const COLORS = ['#f1c40f', '#2ecc71', '#bdc3c7', '#27ae60'];

export default function LoyaltyChart() {
  return (
    <div className="w-full h-full min-h-[150px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"  /* Crée le vide au centre */
            outerRadius="85%"  /* Empêche de coller aux bords */
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.COLORS.length]} stroke="rgba(0,0,0,0.2)" />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', fontSize: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
