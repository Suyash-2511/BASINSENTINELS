import React, { useEffect, useRef, useState } from 'react';
import { CrowdZone, RiskLevel } from '../types';
import L from 'leaflet';
import { Crosshair, Radio, Zap, Target, Layers, Activity } from 'lucide-react';

interface CrowdMapProps {
  zones: CrowdZone[];
  selectedZone: CrowdZone | null;
  onSelectZone: (zone: CrowdZone) => void;
}

const CrowdMap: React.FC<CrowdMapProps> = ({ zones, selectedZone, onSelectZone }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.Layer }>({});

  const getHeatmapColor = (occupancy: number): string => {
    // Gradient logic: Green -> Yellow -> Orange -> Red
    if (occupancy < 40) return '#10B981'; // Emerald 500
    if (occupancy < 70) return '#F59E0B'; // Amber 500
    if (occupancy < 90) return '#F97316'; // Orange 500 (Vibrant)
    return '#EF4444'; // Red 500 (Vibrant)
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Use Esri World Topo for a clean, light terrain view
    const terrainLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19
    });

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      layers: [terrainLayer],
      scrollWheelZoom: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomright' }).addAttribution('Crowd Analytics').addTo(map);

    mapInstanceRef.current = map;

    if (zones.length > 0) {
      const bounds = L.latLngBounds(zones.map(z => [z.coordinates.lat, z.coordinates.lng]));
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 });
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
      const heatmapColor = getHeatmapColor(zone.occupancy);
      
      // Calculate intensity based radius
      // Higher occupancy = larger spread of 'heat'
      // Base radius multiplied by a factor of occupancy to show 'spread'
      const spreadFactor = 1 + (zone.occupancy / 100); 
      const heatRadius = zone.radius * spreadFactor;

      // 1. DYNAMIC HEATMAP LAYER
      // Uses a large, heavily blurred circle to simulate a heat spot.
      // When these overlap (via mix-blend-mode in CSS), they create a density effect.
      
      const heatmapBlob = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
        radius: heatRadius,
        stroke: false,
        fillColor: heatmapColor,
        fillOpacity: 0.7, // High opacity + blur = solid gradients
        className: 'heatmap-blob' // CSS class applies the blur and blend mode
      }).addTo(map);

      // 2. CORE INTENSITY
      // A smaller, brighter core to indicate the center of the crowd mass
      const heatCore = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
        radius: zone.radius * 0.4,
        stroke: false,
        fillColor: heatmapColor,
        fillOpacity: 0.4,
        className: 'heatmap-blob'
      }).addTo(map);

      layersRef.current[`heat-blob-${zone.id}`] = heatmapBlob;
      layersRef.current[`heat-core-${zone.id}`] = heatCore;

      // 3. DRONE MARKER (Interaction Layer)
      // Remains as the interactive element on top of the heat layer
      const droneIconHtml = `
        <div class="relative w-full h-full flex items-center justify-center group cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-110' : 'scale-100 hover:scale-110'}">
          <!-- Drone Icon -->
          <div class="relative z-10 drop-shadow-md">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="${isSelected ? '#0f172a' : '#1e293b'}" stroke="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
          </div>

          <!-- Status Dot -->
          <div class="absolute -top-1 -right-1 w-2 h-2 ${zone.riskLevel === RiskLevel.CRITICAL ? 'bg-red-500 animate-ping' : 'bg-emerald-500'} rounded-full"></div>
        </div>
      `;

      const droneIcon = L.divIcon({
        className: 'custom-drone-icon',
        html: droneIconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
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
    // Updated container to use glass-panel class with transparency
    <div className="relative w-full h-[600px] glass-panel rounded-2xl overflow-hidden shadow-2xl group border border-white/50 bg-white/60">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-amber-500 z-[401]"></div>
      
      {/* HUD Overlay - Light Theme */}
      <div className="absolute inset-0 pointer-events-none z-[400]">
         
         {/* Top Left Status */}
         <div className="absolute top-6 left-6 pointer-events-auto bg-white/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/50 shadow-xl inline-flex items-center gap-4">
             <div className="bg-emerald-100/80 p-2 rounded-lg text-emerald-600">
                <Activity className="w-5 h-5 animate-pulse" />
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-display font-bold text-slate-900 uppercase tracking-widest leading-none">
                  Heatmap Layer
               </span>
               <span className="text-[10px] font-mono font-medium text-slate-500 mt-1">
                  DENSITY VISUALIZATION
               </span>
             </div>
         </div>
         
         {/* Top Right Legend (Updated for Heatmap) */}
         <div className="absolute top-6 right-6 pointer-events-auto flex flex-col gap-3 items-end">
             <div className="bg-white/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/50 shadow-lg flex flex-col gap-2">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-0.5 text-right">Occupancy</span>
                <div className="flex items-center gap-2">
                   <div className="flex flex-col items-center gap-0.5">
                      <div className="w-3 h-3 rounded bg-emerald-400"></div>
                      <span className="text-[8px] font-mono text-slate-500">&lt;40%</span>
                   </div>
                   <div className="flex flex-col items-center gap-0.5">
                      <div className="w-3 h-3 rounded bg-amber-400"></div>
                      <span className="text-[8px] font-mono text-slate-500">70%</span>
                   </div>
                   <div className="flex flex-col items-center gap-0.5">
                      <div className="w-3 h-3 rounded bg-orange-500"></div>
                      <span className="text-[8px] font-mono text-slate-500">90%</span>
                   </div>
                   <div className="flex flex-col items-center gap-0.5">
                      <div className="w-3 h-3 rounded bg-red-500 shadow-sm shadow-red-500/50"></div>
                      <span className="text-[8px] font-mono text-slate-500">&gt;90%</span>
                   </div>
                </div>
             </div>
         </div>
         
         {/* Bottom Center Mode Indicator */}
         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
             <div className="bg-slate-900/90 text-white px-4 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase shadow-2xl border border-slate-700 flex items-center gap-2">
                <Layers className="w-3 h-3 text-amber-400" />
                Crowd Thermal View
             </div>
         </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full bg-slate-50 outline-none" />
      
      {/* Subtle overlay texture for paper/map feel */}
      <div className="absolute inset-0 pointer-events-none z-[399] opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
    </div>
  );
};

export default CrowdMap;