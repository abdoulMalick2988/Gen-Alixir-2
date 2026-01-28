"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les projets depuis l'API que tu as déjà créée
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Hub des Projets
            </h1>
            <p className="text-gray-400">Gérez et rejoignez les initiatives Gen Alixir</p>
          </div>
          
          {/* Le bouton n'apparaît que pour toi (FOUNDER) */}
          {session?.user?.role === "FOUNDER" && (
            <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              + Nouveau Projet
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-cyan-500 animate-pulse">Chargement des données...</div>
        ) : projects.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-10 text-center">
            <p className="text-gray-500 mb-4">Aucun projet actif pour le moment.</p>
            <p className="text-sm text-cyan-400/60">En tant que Fondateur, lancez la première initiative !</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Ici s'afficheront les cartes des projets une fois créés */}
          </div>
        )}
      </div>
    </div>
  );
}
