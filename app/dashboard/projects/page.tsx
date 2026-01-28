"use client";

import { useState, useEffect } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Hub des Projets
            </h1>
            <p className="text-gray-400 mt-1">Espace Fondateur : Gérez les initiatives</p>
          </div>
          
          <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20">
            + Nouveau Projet
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-cyan-500 mt-4 font-medium">Initialisation du Hub...</p>
          </div>
        ) : (
          <div className="bg-[#111111] border border-gray-800 rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-xl font-semibold mb-2">Prêt pour le lancement</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Votre structure est prête. Utilisez le bouton ci-dessus pour créer le premier projet de GEN ALIXIR.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
