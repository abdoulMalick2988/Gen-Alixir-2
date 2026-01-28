"use client";

import { useState, useEffect } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", max_members: 10 });

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json(); // On lit la réponse du serveur

      if (res.ok) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        // C'est ICI qu'on va voir la vraie erreur
        alert("ERREUR TECHNIQUE : " + JSON.stringify(data));
      }
    } catch (err) {
      alert("Erreur réseau : " + err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Hub des Projets</h1>
            <p className="text-gray-400 mt-1">Espace Fondateur : Gérez les initiatives</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20"
          >
            + Nouveau Projet
          </button>
        </div>

        {/* Modal de création */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111] border border-gray-800 p-8 rounded-3xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">Lancer un projet</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nom du projet</label>
                  <input 
                    required
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 focus:border-cyan-500 outline-none"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea 
                    required
                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 focus:border-cyan-500 outline-none h-32"
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-lg border border-gray-800 text-gray-400">Annuler</button>
                  <button type="submit" className="flex-1 bg-cyan-600 px-4 py-3 rounded-lg font-bold">Créer</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((p: any) => (
              <div key={p.id} className="bg-[#111] border border-gray-800 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-cyan-400">{p.name}</h3>
                <p className="text-gray-400 mt-2">{p.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span className="bg-gray-800 px-2 py-1 rounded">Statut: {p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
