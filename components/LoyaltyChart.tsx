"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Karibu', value: 400 },
  { name: 'Silver', value: 300 },
  { name: 'Gold', value: 300 },
  { name: 'Platinum', value: 200 },
  { name: 'Diamond', value: 100 },
];

const COLORS = ['#4ade80', '#2ecc71', '#f1c40f', '#eab308', '#ca8a04'];

export default function LoyaltyChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#666' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
