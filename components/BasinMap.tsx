import React, { useEffect, useRef, useState } from 'react';
import { MonitoringNode, RiskLevel } from '../types';
import L from 'leaflet';
import { Activity, History, Layers, CloudRain, Map as MapIcon, Globe, AlertOctagon, X, Cloud, Navigation } from 'lucide-react';

interface BasinMapProps {
  nodes: MonitoringNode[];
  selectedNode: MonitoringNode | null;
  onSelectNode: (node: MonitoringNode) => void;
}

const BasinMap: React.FC<BasinMapProps> = ({ nodes, selectedNode, onSelectNode }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  
  // Layer Refs
  const baseLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
  const overlaysRef = useRef<{ rainfall?: L.LayerGroup; riskZones?: L.LayerGroup; clouds?: L.LayerGroup }>({});

  // UI State
  const [viewMode, setViewMode] = useState<'live' | 'historical'>('live');
  const [activeBaseLayer, setActiveBaseLayer] = useState<'dark' | 'satellite' | 'street' | 'terrain'>('dark');
  const [showRainfall, setShowRainfall] = useState(false);
  const [showClouds, setShowClouds] = useState(false);
  const [showRiskZones, setShowRiskZones] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return '#10B981'; // Emerald 500
      case RiskLevel.MODERATE: return '#F59E0B'; // Amber 500
      case RiskLevel.HIGH: return '#F43F5E'; // Rose 500
      case RiskLevel.CRITICAL: return '#E11D48'; // Red 600
      default: return '#22d3ee';
    }
  };

  const calculateRisk = (score: number): RiskLevel => {
      if (score >= 80) return RiskLevel.LOW;
      if (score >= 60) return RiskLevel.MODERATE;
      if (score >= 40) return RiskLevel.HIGH;
      return RiskLevel.CRITICAL;
  };

  // Initialize Map and Layers
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // 1. Define Base Layers
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri',
      maxZoom: 19
    });

    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    });

    const terrainLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri',
      maxZoom: 19
    });

    baseLayersRef.current = {
      dark: darkLayer,
      satellite: satelliteLayer,
      street: streetLayer,
      terrain: terrainLayer
    };

    // 2. Initialize Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      layers: [darkLayer], // Default
      scrollWheelZoom: false
    });

    L.control.attribution({ prefix: false }).addAttribution('Basin Sentinels').addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 3. Define Simulated Overlays
    
    // Rainfall Simulation (Blue/Purple circles)
    const rainfallGroup = L.layerGroup();
    L.circle([19.9322, 73.5306], { radius: 3000, color: 'transparent', fillColor: '#3b82f6', fillOpacity: 0.2 }).addTo(rainfallGroup);
    L.circle([19.95, 73.55], { radius: 4500, color: 'transparent', fillColor: '#3b82f6', fillOpacity: 0.15 }).addTo(rainfallGroup);
    L.circle([20.0, 73.7], { radius: 6000, color: 'transparent', fillColor: '#6366f1', fillOpacity: 0.1 }).addTo(rainfallGroup);

    // Cloud Simulation (White/Gray patches)
    const cloudsGroup = L.layerGroup();
    L.circle([19.98, 73.6], { radius: 5000, color: 'transparent', fillColor: '#f8fafc', fillOpacity: 0.15 }).addTo(cloudsGroup);
    L.circle([20.02, 73.75], { radius: 4000, color: 'transparent', fillColor: '#cbd5e1', fillOpacity: 0.2 }).addTo(cloudsGroup);

    // Risk Zone Heatmap Simulation (Red zones)
    const riskGroup = L.layerGroup();
    L.circle([19.9895, 73.8457], { radius: 1500, color: 'transparent', fillColor: '#ef476f', fillOpacity: 0.3 }).addTo(riskGroup);
    L.circle([19.9996, 73.8124], { radius: 1200, color: 'transparent', fillColor: '#ef476f', fillOpacity: 0.25 }).addTo(riskGroup);

    overlaysRef.current = {
      rainfall: rainfallGroup,
      clouds: cloudsGroup,
      riskZones: riskGroup
    };

    mapInstanceRef.current = map;

    if (nodes.length > 0) {
      const bounds = L.latLngBounds(nodes.map(n => [n.coordinates.lat, n.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run once on mount

  // Handle Base Layer Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(baseLayersRef.current).forEach(layer => map.removeLayer(layer));
    const selectedLayer = baseLayersRef.current[activeBaseLayer];
    if (selectedLayer) {
      map.addLayer(selectedLayer);
    }
  }, [activeBaseLayer]);

  // Handle Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (overlaysRef.current.rainfall) {
      if (showRainfall) map.addLayer(overlaysRef.current.rainfall);
      else map.removeLayer(overlaysRef.current.rainfall);
    }

    if (overlaysRef.current.clouds) {
      if (showClouds) map.addLayer(overlaysRef.current.clouds);
      else map.removeLayer(overlaysRef.current.clouds);
    }

    if (overlaysRef.current.riskZones) {
      if (showRiskZones) map.addLayer(overlaysRef.current.riskZones);
      else map.removeLayer(overlaysRef.current.riskZones);
    }
  }, [showRainfall, showClouds, showRiskZones]);


  // Handle Markers Update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const processedIds = new Set<string>();

    nodes.forEach(node => {
      processedIds.add(node.id);
      const isSelected = selectedNode?.id === node.id;
      
      let displayRisk = node.riskLevel;
      let displayScore = node.qualityScore;
      
      if (viewMode === 'historical') {
          displayScore = node.historicalAverage;
          displayRisk = calculateRisk(displayScore);
      }
      
      const color = getRiskColor(displayRisk);
      const size = isSelected ? 24 : 14;
      const pulseDuration = displayRisk === RiskLevel.CRITICAL || displayRisk === RiskLevel.HIGH ? '1.5s' : '3s';
      
      // Update marker visuals for non-Dark mode visibility
      const isLightMap = activeBaseLayer === 'street' || activeBaseLayer === 'terrain';
      const contrastColor = (activeBaseLayer === 'satellite' || activeBaseLayer === 'dark') ? '#ffffff' : '#020617';
      const bgColor = isLightMap ? '#ffffff' : '#020617';
      
      // For street map, use darker colors for visibility? Or keep neon. Neon works okay on Carto Voyager.
      
      const pulseHtml = `<div class="marker-pulse" style="background-color: ${color}; opacity: ${isSelected ? 0.6 : 0.3}; animation-duration: ${pulseDuration}"></div>`;
      const pinHtml = `
          <div class="relative flex items-center justify-center w-full h-full">
            <div style="
                width: ${size}px; height: ${size}px; 
                background-color: ${isSelected ? (isLightMap ? '#0f172a' : '#fff') : bgColor};
                border: 2px solid ${color};
                border-radius: 50%;
                box-shadow: 0 0 15px ${color};
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex; align-items: center; justify-content: center;
            ">
                ${isSelected ? `<div style="width: 6px; height: 6px; background: ${color}; border-radius: 50%;"></div>` : ''}
            </div>
          </div>
      `;

      const iconHtml = `
        <div class="relative w-full h-full flex items-center justify-center">
          ${pulseHtml}
          ${pinHtml}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: iconHtml,
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      });

      const tooltipContent = `
        <div class="flex flex-col gap-1 min-w-[120px]">
           <div class="flex items-center justify-between border-b border-slate-700/50 pb-1 mb-1">
               <span class="font-bold ${isLightMap ? 'text-slate-800' : 'text-white'} text-xs font-display tracking-wide uppercase">${node.name}</span>
           </div>
           <div class="flex items-center justify-between">
             <span class="text-[9px] uppercase tracking-wider ${isLightMap ? 'text-slate-500' : 'text-slate-400'} font-mono">
               ${viewMode === 'live' ? 'LIVE QS' : '5Y AVG'}
             </span>
             <span style="color:${color}" class="font-bold font-mono text-sm">${displayScore}</span>
           </div>
        </div>
      `;

      if (markersRef.current[node.id]) {
        const marker = markersRef.current[node.id];
        marker.setIcon(customIcon);
        marker.setZIndexOffset(isSelected ? 1000 : 0);
        
        if (marker.getTooltip()) {
            marker.setTooltipContent(tooltipContent);
            // Update tooltip style based on theme
             const tooltipEl = marker.getTooltip()?.getElement();
             if (tooltipEl) {
                if (isLightMap) {
                    tooltipEl.classList.remove('bg-midnight-900/90', 'border-slate-700', 'text-slate-200');
                    tooltipEl.classList.add('bg-white/90', 'border-slate-200', 'text-slate-900');
                } else {
                    tooltipEl.classList.remove('bg-white/90', 'border-slate-200', 'text-slate-900');
                    tooltipEl.classList.add('bg-midnight-900/90', 'border-slate-700', 'text-slate-200');
                }
             }
        } else {
            marker.bindTooltip(tooltipContent, {
              direction: 'top',
              offset: [0, -15],
              className: isLightMap 
                ? 'bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-2 rounded-lg shadow-2xl text-slate-900'
                : 'bg-midnight-900/90 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-lg shadow-2xl text-slate-200'
            });
        }
        
        const curLatLng = marker.getLatLng();
        if (curLatLng.lat !== node.coordinates.lat || curLatLng.lng !== node.coordinates.lng) {
            marker.setLatLng([node.coordinates.lat, node.coordinates.lng]);
        }
      } else {
        const marker = L.marker([node.coordinates.lat, node.coordinates.lng], { icon: customIcon });
        
        marker.on('click', () => {
            onSelectNode(node);
            map.flyTo([node.coordinates.lat, node.coordinates.lng], 15, { duration: 1.2, easeLinearity: 0.25 });
        });
        
        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -15],
          className: isLightMap 
            ? 'bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-2 rounded-lg shadow-2xl text-slate-900'
            : 'bg-midnight-900/90 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-lg shadow-2xl text-slate-200'
        });

        marker.addTo(map);
        markersRef.current[node.id] = marker;
      }
    });

    Object.keys(markersRef.current).forEach(id => {
        if (!processedIds.has(id)) {
            const marker = markersRef.current[id];
            marker.remove();
            delete markersRef.current[id];
        }
    });

  }, [nodes, selectedNode, onSelectNode, viewMode, activeBaseLayer]);

  return (
    <div className="relative w-full h-[600px] glass-panel rounded-2xl overflow-hidden shadow-2xl group border border-midnight-800">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-violet-500/50 z-[401]"></div>
      
      {/* View Mode Indicator (Top Left) */}
      <div className="absolute top-6 left-6 z-[400] pointer-events-none">
         <div className="bg-midnight-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/50 inline-flex items-center gap-3 shadow-lg">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${viewMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-violet-400'}`}></span>
              {viewMode === 'live' ? 'LIVE FEED' : 'HISTORICAL'}
            </h3>
         </div>
      </div>

      {/* Top Right Controls Group */}
      <div className="absolute top-6 right-6 z-[400] flex gap-3">
         
         {/* Layer Switcher Toggle */}
         <div className="relative">
            <button 
                onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-lg backdrop-blur-md border ${isLayerMenuOpen ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-midnight-950/90 text-slate-400 border-slate-700/50 hover:text-white'}`}
            >
                {isLayerMenuOpen ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </button>
            
            {/* Dropdown Menu */}
            {isLayerMenuOpen && (
              <div className="absolute top-12 right-0 w-64 bg-midnight-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right flex flex-col gap-4">
                  
                  {/* Base Layers */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 font-bold">Base Map</h4>
                    <div className="space-y-2">
                       <button 
                          onClick={() => setActiveBaseLayer('dark')}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all ${activeBaseLayer === 'dark' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-slate-400 border border-transparent'}`}
                       >
                          <div className={`w-8 h-8 rounded bg-slate-950 border ${activeBaseLayer === 'dark' ? 'border-cyan-500' : 'border-slate-700'}`}></div>
                          Dark Matter
                       </button>
                       <button 
                          onClick={() => setActiveBaseLayer('street')}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all ${activeBaseLayer === 'street' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-slate-400 border border-transparent'}`}
                       >
                          <div className={`w-8 h-8 rounded bg-slate-200 border ${activeBaseLayer === 'street' ? 'border-cyan-500' : 'border-slate-700'}`}></div>
                          Street Map
                       </button>
                       <button 
                          onClick={() => setActiveBaseLayer('satellite')}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all ${activeBaseLayer === 'satellite' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-slate-400 border border-transparent'}`}
                       >
                          <div className={`w-8 h-8 rounded bg-emerald-900 border ${activeBaseLayer === 'satellite' ? 'border-cyan-500' : 'border-slate-700'}`}></div>
                          Satellite
                       </button>
                       <button 
                          onClick={() => setActiveBaseLayer('terrain')}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all ${activeBaseLayer === 'terrain' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/5 text-slate-400 border border-transparent'}`}
                       >
                          <div className={`w-8 h-8 rounded bg-slate-500 border ${activeBaseLayer === 'terrain' ? 'border-cyan-500' : 'border-slate-700'}`}></div>
                          Topography
                       </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-800"></div>

                  {/* Overlays */}
                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 font-bold">Data Layers</h4>
                    <div className="space-y-2">
                       <button 
                          onClick={() => setShowRainfall(!showRainfall)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border ${showRainfall ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'hover:bg-white/5 text-slate-400 border-transparent'}`}
                       >
                          <div className="flex items-center gap-2">
                             <CloudRain className="w-4 h-4" /> Rainfall Sim
                          </div>
                          <div className={`w-2 h-2 rounded-full ${showRainfall ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-700'}`}></div>
                       </button>

                       <button 
                          onClick={() => setShowClouds(!showClouds)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border ${showClouds ? 'bg-slate-500/10 text-slate-300 border-slate-500/30' : 'hover:bg-white/5 text-slate-400 border-transparent'}`}
                       >
                          <div className="flex items-center gap-2">
                             <Cloud className="w-4 h-4" /> Cloud Cover
                          </div>
                          <div className={`w-2 h-2 rounded-full ${showClouds ? 'bg-slate-400 shadow-[0_0_8px_#cbd5e1]' : 'bg-slate-700'}`}></div>
                       </button>

                       <button 
                          onClick={() => setShowRiskZones(!showRiskZones)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border ${showRiskZones ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'hover:bg-white/5 text-slate-400 border-transparent'}`}
                       >
                          <div className="flex items-center gap-2">
                             <AlertOctagon className="w-4 h-4" /> Risk Heatmap
                          </div>
                          <div className={`w-2 h-2 rounded-full ${showRiskZones ? 'bg-red-400 shadow-[0_0_8px_#f87171]' : 'bg-slate-700'}`}></div>
                       </button>
                    </div>
                  </div>

              </div>
            )}
         </div>

         {/* View Mode Toggle */}
         <div className="bg-midnight-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/50 flex shadow-lg">
            <button 
                onClick={() => setViewMode('live')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${viewMode === 'live' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                title="Live Data"
            >
                LIVE
            </button>
            <button 
                onClick={() => setViewMode('historical')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${viewMode === 'historical' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
                title="5 Year Average"
            >
                5Y
            </button>
         </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full bg-midnight-950 outline-none" />
      
      {/* Grid overlay lines for 'tech' feel - Only show on dark mode */}
      {activeBaseLayer === 'dark' && (
        <div className="absolute inset-0 pointer-events-none z-[399] opacity-20 bg-[url('https://patterns.ibrahimcesar.cloud/bg-grid.png')] bg-repeat"></div>
      )}
    </div>
  );
};

export default BasinMap;