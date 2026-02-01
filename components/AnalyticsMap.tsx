"use client";
export default function AnalyticsMap() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] rounded-2xl flex items-center justify-center relative">
       {/* Simulation visuelle de la carte pour le build initial */}
       <div className="absolute inset-0 opacity-30 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/29.9, -3.3,9/800x400?access_token=TOKEN')] bg-cover"></div>
       <div className="z-10 text-center">
         <div className="text-emerald-400 font-bold mb-2">SCANNING BUJUMBURA...</div>
         <div className="flex space-x-2 justify-center">
           <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
           <span className="text-[10px] text-gray-400 uppercase">Hot Zone: Kinindo (High eCo Flow)</span>
         </div>
       </div>
    </div>
  );
}
