'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { createClient } from '@supabase/supabase-js';

// ----------------------
// SUPABASE CLIENT
// ----------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ----------------------
// TYPES
// ----------------------
type Employee = {
  id: string;
  gender: 'Homme' | 'Femme' | 'Autre';
  department: string;
  job_level: 'Management' | 'Professionnel' | 'Stagiaire' | 'Contractuel';
  contract_type: 'Permanent' | 'Contractuel';
  hire_date: string;
  exit_date?: string | null;
  manager_id?: string | null;
  location: string;
  status: 'actif' | 'parti' | 'transfere';
};

// ----------------------
// UI HELPERS
// ----------------------
const glass =
  'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl';

const COLORS = ['#22d3ee', '#a78bfa', '#f87171', '#34d399'];

// ----------------------
// PAGE
// ----------------------
export default function RHPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>('Tous');

  // ----------------------
  // DATA FETCH (REALTIME READY)
  // ----------------------
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('employees').select('*');
      setEmployees((data as Employee[]) || []);
    };

    fetchData();

    const channel = supabase
      .channel('employees-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ----------------------
  // FILTERING
  // ----------------------
  const filteredEmployees = useMemo(() => {
    if (departmentFilter === 'Tous') return employees;
    return employees.filter((e) => e.department === departmentFilter);
  }, [employees, departmentFilter]);

  // ----------------------
  // KPIs
  // ----------------------
  const kpis = useMemo(() => {
    const total = filteredEmployees.length;
    const active = filteredEmployees.filter((e) => e.status === 'actif').length;
    const attrition = filteredEmployees.filter((e) => e.status === 'parti').length;
    const transfers = filteredEmployees.filter((e) => e.status === 'transfere').length;

    return {
      total,
      active,
      attrition,
      attritionRate: total ? Math.round((attrition / total) * 100) : 0,
      transfers,
    };
  }, [filteredEmployees]);

  // ----------------------
  // CHART DATA
  // ----------------------
  const genderData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEmployees.forEach((e) => {
      map[e.gender] = (map[e.gender] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredEmployees]);

  const jobLevelData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEmployees.forEach((e) => {
      map[e.job_level] = (map[e.job_level] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredEmployees]);

  const stabilityData = useMemo(() => {
    const now = new Date();
    const buckets = {
      '<1 an': 0,
      '1-2 ans': 0,
      '2-3 ans': 0,
      '3-5 ans': 0,
      '5+ ans': 0,
    };

    filteredEmployees.forEach((e) => {
      const years =
        (now.getTime() - new Date(e.hire_date).getTime()) /
        (1000 * 60 * 60 * 24 * 365);

      if (years < 1) buckets['<1 an']++;
      else if (years < 2) buckets['1-2 ans']++;
      else if (years < 3) buckets['2-3 ans']++;
      else if (years < 5) buckets['3-5 ans']++;
      else buckets['5+ ans']++;
    });

    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [filteredEmployees]);

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-black via-slate-900 to-black text-white">
      {/* HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Dashboard RH Analytics
      </motion.h1>

      {/* FILTER */}
      <select
        className="bg-black border border-white/20 rounded-lg p-2"
        onChange={(e) => setDepartmentFilter(e.target.value)}
      >
        <option value="Tous">Tous les départements</option>
        {[...new Set(employees.map((e) => e.department))].map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPI title="Effectif total" value={kpis.total} />
        <KPI title="Actifs" value={kpis.active} />
        <KPI title="Attrition" value={kpis.attrition} />
        <KPI title="Attrition %" value={`${kpis.attritionRate}%`} />
        <KPI title="Transferts" value={kpis.transfers} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Diversité (Genre)">
          <PieChart width={300} height={300}>
            <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={100}>
              {genderData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Répartition par niveau">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={jobLevelData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Stabilité du personnel">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stabilityData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#34d399" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ----------------------
// COMPONENTS
// ----------------------
function KPI({ title, value }: { title: string; value: number | string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className={`${glass} p-4 text-center`}>
      <p className="text-sm text-white/60">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${glass} p-4`}>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="flex justify-center">{children}</div>
    </div>
  );
}
