"use client";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction pour les icônes Leaflet qui buggent parfois sur Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function AnalyticsMap() {
  const bujumburaPosition: [number, number] = [-3.3833, 29.3667];

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_30px_rgba(46,204,113,0.1)]">
      <MapContainer 
        center={bujumburaPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; ECODREUM Intelligence'
        />
        {/* Zone de chaleur simulée sur Kinindo / Rohero */}
        <Circle 
          center={bujumburaPosition}
          radius={1000}
          pathOptions={{ fillColor: '#2ecc71', color: '#f1c40f', weight: 1, fillOpacity: 0.2 }}
        />
        <Marker position={bujumburaPosition} icon={customIcon}>
          <Popup className="custom-popup">
            <div className="bg-black text-white p-2 font-sans">
              <strong className="text-emerald-400">Hub Central Bujumbura</strong><br/>
              Flux eCo : Élevé
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay technologique par-dessus la carte */}
      <div className="absolute top-4 right-4 z-[1000] bg-black/60 backdrop-blur-md p-3 rounded-lg border border-gold/30 pointer-events-none">
        <div className="text-[10px] text-gold uppercase tracking-widest mb-1 font-bold">Live Geo-Pulse</div>
        <div className="text-emerald-400 font-mono text-xs">Lat: -3.3833 | Long: 29.3667</div>
      </div>
    </div>
  );
}
