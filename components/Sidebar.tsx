@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --emerald: #2ecc71;
  --gold: #f1c40f;
  --glass-bg: rgba(255, 255, 255, 0.015); /* Transparence quasi totale */
  --glass-border: rgba(255, 255, 255, 0.08);
}

body {
  /* Simulation du fond de l'image : Labo technologique sombre avec reflets */
  background: 
    radial-gradient(circle at 50% -20%, rgba(241, 196, 15, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 0% 0%, rgba(46, 204, 113, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 100% 100%, rgba(46, 204, 113, 0.05) 0%, transparent 30%),
    linear-gradient(to bottom, #080d0b, #020202);
  background-attachment: fixed;
  color: white;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* L'EFFET VITRE DE LA TABLETTE */
.glass-card {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(40px) saturate(180%); /* Flou très puissant pour l'effet vitre */
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
  border-radius: 32px; /* Coins très arrondis comme sur l'image */
}

/* LE HALO DORÉ AUTOUR DU DASHBOARD (L'effet "Cadre lumineux") */
.gold-border-glow {
  border: 1.5px solid rgba(241, 196, 15, 0.5);
  box-shadow: 
    0 0 20px rgba(241, 196, 15, 0.15),
    inset 0 0 15px rgba(241, 196, 15, 0.05);
}

/* PERSONNALISATION DES BARRES DE DÉFILEMENT (Invisible pour le look tablette) */
::-webkit-scrollbar {
  width: 0px;
}

/* Animation subtile des lueurs de fond */
@keyframes pulseGlow {
  0% { opacity: 0.3; }
  50% { opacity: 0.5; }
  100% { opacity: 0.3; }
}

.bg-glow {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, rgba(46, 204, 113, 0.02) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
  animation: pulseGlow 8s infinite ease-in-out;
}
