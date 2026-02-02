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
    <div className="w-full h-full min-h-[180px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="65%"  /* Ratio interne pour l'effet anneau */
            outerRadius="90%"  /* Ratio externe pour ne pas toucher les bords */
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ 
               backgroundColor: 'rgba(0,0,0,0.85)', 
               border: '1px solid rgba(255,255,255,0.1)', 
               borderRadius: '8px', 
               fontSize: '10px',
               color: '#fff'
             }}
             itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
