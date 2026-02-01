import Sidebar from "../../components/Sidebar";

export default function PartnersPage() {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gold">Réseau Partenaires</h1>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-gold/20">
            <h3 className="font-bold">Kaze Burger</h3>
            <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">Niveau Pro</span>
          </div>
        </div>
      </main>
    </div>
  );
}
