export default function HomePage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
          L'Économie de Demain <br/> <span className="text-yellow-500 text-4xl md:text-6xl italic">Commence Ici.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-400 text-lg mb-10">
          Gen Alixir est l'incubateur numérique décentralisé d'ECODREUM. Nous transformons le talent de la jeunesse africaine en impact économique réel.
        </p>
      </section>

      {/* Section ECODREUM */}
      <section className="py-20 bg-gradient-to-b from-black to-zinc-900 px-6">
        <div className="max-w-4xl mx-auto border border-yellow-500/20 p-8 rounded-3xl bg-white/5 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-yellow-500 mb-4 text-center underline decoration-yellow-500/30">Pourquoi Gen Alixir ?</h2>
          <p className="text-gray-300 leading-relaxed text-center">
            Parce que l'Afrique ne manque pas d'idées, elle manque d'espaces où ces idées comptent. 
            En lien direct avec <strong>ECODREUM</strong>, chaque projet validé devient une part réelle de notre réseau économique continental.
          </p>
        </div>
      </section>
    </main>
  );
}
