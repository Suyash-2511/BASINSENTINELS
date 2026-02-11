import React, { useEffect, useRef, useState } from 'react';
import { CrowdZone, RiskLevel } from '../types';
import L from 'leaflet';
import { Crosshair, Radio, Zap, Target } from 'lucide-react';

interface CrowdMapProps {
  zones: CrowdZone[];
  selectedZone: CrowdZone | null;
  onSelectZone: (zone: CrowdZone) => void;
}

const CrowdMap: React.FC<CrowdMapProps> = ({ zones, selectedZone, onSelectZone }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.Layer }>({});

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return '#10B981';
      case RiskLevel.MODERATE: return '#F59E0B';
      case RiskLevel.HIGH: return '#F43F5E';
      case RiskLevel.CRITICAL: return '#E11D48';
      default: return '#22d3ee';
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Use Satellite view for Drone Ops feel
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri',
      maxZoom: 19
    });

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      layers: [satelliteLayer],
      scrollWheelZoom: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    if (zones.length > 0) {
      const bounds = L.latLngBounds(zones.map(z => [z.coordinates.lat, z.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing layers
    Object.values(layersRef.current).forEach(layer => map.removeLayer(layer));
    layersRef.current = {};

    zones.forEach(zone => {
      const isSelected = selectedZone?.id === zone.id;
      const color = getRiskColor(zone.riskLevel);

      // 1. Crowd Density Circle (Heatmap simulation)
      const circle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
        radius: zone.radius,
        color: 'transparent',
        fillColor: color,
        fillOpacity: isSelected ? 0.4 : 0.2,
      }).addTo(map);
      
      // Add pulsing animation for high risk
      if (zone.riskLevel === RiskLevel.CRITICAL || zone.riskLevel === RiskLevel.HIGH) {
         // This would ideally be a CSS animation on a divIcon, but for L.circle we just change opacity.
         // Let's add a pulsing ring marker instead for the "Alarm" effect.
      }

      layersRef.current[`circle-${zone.id}`] = circle;

      // 2. Drone Marker
      const droneIconHtml = `
        <div class="relative w-full h-full flex items-center justify-center group">
          <div class="absolute inset-0 border border-${isSelected ? 'white' : 'transparent'} rounded-full animate-spin-slow opacity-50"></div>
          
          <!-- Drone Icon -->
          <div class="relative z-10 transform transition-transform duration-300 ${isSelected ? 'scale-125' : 'scale-100'}">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
          </div>

          <!-- Label -->
          <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-midnight-950/80 backdrop-blur px-2 py-0.5 rounded border border-slate-700 text-[9px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             Drone-${zone.droneId}
          </div>
        </div>
      `;

      const droneIcon = L.divIcon({
        className: 'custom-drone-icon',
        html: droneIconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([zone.coordinates.lat, zone.coordinates.lng], { icon: droneIcon });
      
      marker.on('click', () => {
        onSelectZone(zone);
        map.flyTo([zone.coordinates.lat, zone.coordinates.lng], 16, { duration: 1 });
      });

      marker.addTo(map);
      layersRef.current[`marker-${zone.id}`] = marker;
    });

  }, [zones, selectedZone, onSelectZone]);

  return (
    <div className="relative w-full h-[600px] glass-panel rounded-2xl overflow-hidden shadow-2xl group border border-midnight-800">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-amber-500/50 z-[401]"></div>
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[400]">
         {/* Crosshairs */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-white/5 rounded-full flex items-center justify-center opacity-30">
            <div className="w-[1px] h-4 bg-white/20 absolute top-0"></div>
            <div className="w-[1px] h-4 bg-white/20 absolute bottom-0"></div>
            <div className="h-[1px] w-4 bg-white/20 absolute left-0"></div>
            <div className="h-[1px] w-4 bg-white/20 absolute right-0"></div>
         </div>

         {/* Top Left Status */}
         <div className="absolute top-6 left-6 pointer-events-auto bg-midnight-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/50 inline-flex items-center gap-3 shadow-lg">
             <Crosshair className="w-4 h-4 text-emerald-400 animate-pulse" />
             <div className="flex flex-col">
               <span className="text-[10px] font-mono font-bold text-slate-200 uppercase tracking-widest">
                  Drone Surveillance Grid
               </span>
               <span className="text-[9px] font-mono text-emerald-500">
                  LIVE FEED • 3 ACTIVE UNITS
               </span>
             </div>
         </div>
         
         {/* Top Right Legend */}
         <div className="absolute top-6 right-6 pointer-events-auto flex flex-col gap-2 items-end">
             <div className="bg-midnight-950/80 backdrop-blur px-3 py-1.5 rounded border border-red-500/30 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-mono text-red-400 font-bold">CRITICAL DENSITY</span>
             </div>
         </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full bg-midnight-950 outline-none" />
      
      {/* Scan lines effect */}
      <div className="absolute inset-0 pointer-events-none z-[399] opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
    </div>
  );
};

export default CrowdMap;