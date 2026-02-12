import React, { useEffect, useRef, useState } from 'react';
import { MonitoringNode, RiskLevel } from '../types';
import L from 'leaflet';
import { Activity, History, Layers, CloudRain, Map as MapIcon, Globe, AlertOctagon, X, Cloud, Navigation, Siren, Radio, Send, Loader2 } from 'lucide-react';

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
  // Default to terrain as requested
  const [activeBaseLayer, setActiveBaseLayer] = useState<'dark' | 'satellite' | 'street' | 'terrain' | 'contour'>('terrain');
  const [showRainfall, setShowRainfall] = useState(false);
  const [showClouds, setShowClouds] = useState(false);
  const [showRiskZones, setShowRiskZones] = useState(true); // Default to true for early warning context
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [alertBroadcasted, setAlertBroadcasted] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Identify Critical Nodes for Early Warning System
  const criticalNodes = nodes.filter(n => n.riskLevel === RiskLevel.CRITICAL || n.riskLevel === RiskLevel.HIGH);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return '#10B981'; // Emerald 500
      case RiskLevel.MODERATE: return '#F59E0B'; // Amber 500
      case RiskLevel.HIGH: return '#F97316'; // Orange 500 (Updated)
      case RiskLevel.CRITICAL: return '#EF4444'; // Red 500 (Updated)
      default: return '#0EA5E9'; // Cyan 500 (Azure)
    }
  };

  const calculateRisk = (score: number): RiskLevel => {
      if (score >= 80) return RiskLevel.LOW;
      if (score >= 60) return RiskLevel.MODERATE;
      if (score >= 40) return RiskLevel.HIGH;
      return RiskLevel.CRITICAL;
  };

  // Helper to determine if current map is "light" themed
  const isLightMap = ['street', 'terrain', 'contour'].includes(activeBaseLayer);

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

    const contourLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap, SRTM | &copy; OpenTopoMap',
      maxZoom: 17
    });

    baseLayersRef.current = {
      dark: darkLayer,
      satellite: satelliteLayer,
      street: streetLayer,
      terrain: terrainLayer,
      contour: contourLayer
    };

    // 2. Initialize Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      layers: [terrainLayer], // Default to Terrain
      scrollWheelZoom: false
    });

    L.control.attribution({ prefix: false }).addAttribution('Basin Sentinels').addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 3. Define Simulated Overlays
    
    // Rainfall Simulation (Blue/Purple circles)
    const rainfallGroup = L.layerGroup();
    L.circle([19.9322, 73.5306], { radius: 3000, color: 'transparent', fillColor: '#0EA5E9', fillOpacity: 0.2 }).addTo(rainfallGroup);
    L.circle([19.95, 73.55], { radius: 4500, color: 'transparent', fillColor: '#0EA5E9', fillOpacity: 0.15 }).addTo(rainfallGroup);
    L.circle([20.0, 73.7], { radius: 6000, color: 'transparent', fillColor: '#6366f1', fillOpacity: 0.1 }).addTo(rainfallGroup);

    // Cloud Simulation (White/Gray patches)
    const cloudsGroup = L.layerGroup();
    L.circle([19.98, 73.6], { radius: 5000, color: 'transparent', fillColor: '#f8fafc', fillOpacity: 0.15 }).addTo(cloudsGroup);
    L.circle([20.02, 73.75], { radius: 4000, color: 'transparent', fillColor: '#cbd5e1', fillOpacity: 0.2 }).addTo(cloudsGroup);

    // Risk Zone Heatmap Simulation (Red zones)
    const riskGroup = L.layerGroup();
    // Only add circles for critical/high nodes
    nodes.filter(n => n.riskLevel === RiskLevel.CRITICAL).forEach(n => {
         L.circle([n.coordinates.lat, n.coordinates.lng], { 
             radius: 800, 
             color: 'transparent', 
             fillColor: '#EF4444', // Red 500
             fillOpacity: 0.35 
         }).addTo(riskGroup);
    });

    overlaysRef.current = {
      rainfall: rainfallGroup,
      clouds: cloudsGroup,
      riskZones: riskGroup
    };

    // Add risk zones by default
    if (showRiskZones) riskGroup.addTo(map);

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
      const defaultZIndex = isSelected ? 1000 : (displayRisk === RiskLevel.CRITICAL ? 500 : 0);
      
      // Marker Size
      const size = isSelected ? 24 : 14;

      // Pulse Animation Logic (Smoother)
      let ringsHtml = '';
      
      if (node.riskLevel === RiskLevel.CRITICAL || node.riskLevel === RiskLevel.HIGH) {
         // Critical: Single ring, longer duration for subtler effect
         ringsHtml = `
            <div class="absolute inset-0 rounded-full animate-soft-ripple" style="background-color: ${color}; animation-duration: 4s;"></div>
         `;
      } else if (isSelected) {
         // Selected: Single gentle ring
         ringsHtml = `
            <div class="absolute inset-0 rounded-full animate-soft-ripple" style="background-color: ${color}; animation-duration: 4s; opacity: 0.3"></div>
         `;
      }

      // The Pin/Dot itself
      // Enhanced hover scale to 125 (was 110) for better tactile feel
      const pinHtml = `
          <div class="relative z-10 w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-500 ease-out hover:scale-125 active:scale-95" style="background-color: ${isSelected ? color : (isLightMap ? '#fff' : '#0f172a')}; border-color: ${isSelected ? '#fff' : color};">
             ${isSelected ? `<div class="w-2 h-2 bg-white rounded-full"></div>` : ''}
             ${node.riskLevel === RiskLevel.CRITICAL ? `<div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>` : ''}
          </div>
      `;

      // Structure
      const iconHtml = `
        <div class="relative w-full h-full flex items-center justify-center group">
            <!-- Pulsing Rings Container -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] flex items-center justify-center pointer-events-none">
                ${ringsHtml}
            </div>
            <!-- Pin Container -->
            <div style="width: ${size}px; height: ${size}px;" class="transition-all duration-500">
                ${pinHtml}
            </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-marker-icon',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const tooltipContent = `
        <div class="flex flex-col gap-1 min-w-[120px] origin-bottom">
           <div class="flex items-center justify-between border-b border-slate-700/10 pb-1 mb-1">
               <span class="font-bold ${isLightMap ? 'text-slate-900' : 'text-white'} text-xs font-display tracking-wide uppercase">${node.name}</span>
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
        marker.setZIndexOffset(defaultZIndex);
        
        if (marker.getTooltip()) {
            marker.setTooltipContent(tooltipContent);
             // Update tooltip style based on theme
             const tooltipEl = marker.getTooltip()?.getElement();
             if (tooltipEl) {
                // Clear old classes and add new ones
                tooltipEl.className = 'leaflet-tooltip leaflet-zoom-animated leaflet-tooltip-top'; // reset basic leaflet classes
                if (isLightMap) {
                    tooltipEl.classList.add('bg-white/60', 'backdrop-blur-xl', 'border', 'border-white/50', 'px-3', 'py-2', 'rounded-lg', 'shadow-xl', 'text-slate-900');
                } else {
                    tooltipEl.classList.add('bg-midnight-900/90', 'backdrop-blur-md', 'border', 'border-slate-700', 'px-3', 'py-2', 'rounded-lg', 'shadow-2xl', 'text-slate-200');
                }
             }
        } else {
             marker.bindTooltip(tooltipContent, {
              direction: 'top',
              offset: [0, -22], // Increased offset for larger hover scale
              className: isLightMap 
                ? 'bg-white/60 backdrop-blur-xl border border-white/50 px-3 py-2 rounded-lg shadow-xl text-slate-900'
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
            map.flyTo([node.coordinates.lat, node.coordinates.lng], 15, { duration: 1.2, easeLinearity: 0.1 }); // Faster flyTo
        });

        marker.on('mouseover', function() {
           this.setZIndexOffset(2000);
        });
        
        marker.on('mouseout', function() {
           this.setZIndexOffset(defaultZIndex);
        });

        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -22], // Increased offset
          opacity: 0, // Start invisible, handled by CSS
          className: isLightMap 
            ? 'bg-white/60 backdrop-blur-xl border border-white/50 px-3 py-2 rounded-lg shadow-xl text-slate-900'
            : 'bg-midnight-900/90 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-lg shadow-2xl text-slate-200'
        });

        // Elegant Tooltip Entrance
        marker.on('tooltipopen', (e) => {
             const tooltipEl = e.tooltip.getElement();
             if (tooltipEl) {
                 // Remove any potential lingering exit classes
                 tooltipEl.classList.remove('tooltip-exit-active');
                 
                 // Initial State
                 tooltipEl.classList.add('tooltip-initial');
                 
                 // Force Reflow
                 // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                 tooltipEl.offsetHeight; 
                 
                 // Active State
                 tooltipEl.classList.add('tooltip-enter-active');
                 tooltipEl.classList.remove('tooltip-initial');
             }
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

  const glassPanelClass = isLightMap 
      ? "bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg shadow-slate-200/50"
      : "bg-midnight-950/90 backdrop-blur-md border border-slate-700/50 shadow-lg";

  const textPrimary = isLightMap ? "text-slate-900" : "text-white";
  const textSecondary = isLightMap ? "text-slate-500" : "text-slate-400";
  const buttonHover = isLightMap ? "hover:bg-white/40 text-slate-600" : "hover:bg-white/5 text-slate-400";

  // Alert Panel Theme Classes
  const alertPanelClass = isLightMap 
    ? "bg-red-50/80 backdrop-blur-xl border-red-200/50 shadow-xl shadow-red-500/10"
    : "bg-red-950/90 border-red-900 shadow-2xl shadow-red-900/20";

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    // Simulate network delay for effect
    setTimeout(() => {
        setIsBroadcasting(false);
        setAlertBroadcasted(true);
    }, 2000);
  };

  return (
    <div className={`relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl group border ${isLightMap ? 'border-white/50 glass-panel' : 'border-midnight-800 bg-midnight-950'}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 z-[401]"></div>
      
      {/* View Mode Indicator (Top Left) */}
      <div className="absolute top-6 left-6 z-[400] pointer-events-none">
         <div className={`${glassPanelClass} px-4 py-2.5 rounded-xl inline-flex items-center gap-3 ring-1 ring-black/5`}>
            <Activity className="w-4 h-4 text-cyan-500" />
            <h3 className={`text-xs font-mono font-bold ${textPrimary} uppercase tracking-widest flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${viewMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-violet-500'}`}></span>
              {viewMode === 'live' ? 'LIVE MONITOR' : 'HISTORICAL DATA'}
            </h3>
         </div>
      </div>

      {/* Top Right Controls Group */}
      <div className="absolute top-6 right-6 z-[400] flex gap-3">
         
         {/* Layer Switcher Toggle */}
         <div className="relative">
            <button 
                onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${glassPanelClass} ${isLayerMenuOpen ? (isLightMap ? 'bg-white/80 text-cyan-600 ring-2 ring-cyan-100' : 'bg-cyan-500/20 text-cyan-400') : buttonHover}`}
            >
                {isLayerMenuOpen ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </button>
            
            {/* Dropdown Menu */}
            {isLayerMenuOpen && (
              <div className={`absolute top-12 right-0 w-64 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right flex flex-col gap-4 ${glassPanelClass}`}>
                  
                  {/* Base Layers */}
                  <div>
                    <h4 className={`text-[10px] font-mono uppercase tracking-widest ${textSecondary} mb-3 font-bold`}>Base Map</h4>
                    <div className="space-y-2">
                       {['dark', 'street', 'satellite', 'terrain', 'contour'].map((layer) => (
                           <button 
                              key={layer}
                              onClick={() => setActiveBaseLayer(layer as any)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all uppercase ${activeBaseLayer === layer ? 'bg-cyan-50/80 text-cyan-700 border border-cyan-100' : `hover:bg-slate-50/50 ${textSecondary} border border-transparent`}`}
                           >
                              <div className={`w-6 h-6 rounded border border-slate-300 bg-${layer === 'dark' ? 'slate-950' : layer === 'satellite' ? 'emerald-900' : 'slate-200'}`}></div>
                              {layer}
                           </button>
                       ))}
                    </div>
                  </div>

                  <div className={`h-px ${isLightMap ? 'bg-slate-200/50' : 'bg-slate-800'}`}></div>

                  {/* Overlays */}
                  <div>
                    <h4 className={`text-[10px] font-mono uppercase tracking-widest ${textSecondary} mb-3 font-bold`}>Data Layers</h4>
                    <div className="space-y-2">
                       <button 
                          onClick={() => setShowRiskZones(!showRiskZones)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border ${showRiskZones ? 'bg-red-50/80 text-red-700 border-red-100' : `hover:bg-slate-50/50 ${textSecondary} border-transparent`}`}
                       >
                          <div className="flex items-center gap-2">
                             <AlertOctagon className="w-4 h-4" /> Risk Heatmap
                          </div>
                          <div className={`w-2 h-2 rounded-full ${showRiskZones ? 'bg-red-500 shadow-[0_0_8px_#EF4444]' : 'bg-slate-300'}`}></div>
                       </button>

                       <button 
                          onClick={() => setShowRainfall(!showRainfall)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border ${showRainfall ? 'bg-blue-50/80 text-blue-700 border-blue-100' : `hover:bg-slate-50/50 ${textSecondary} border-transparent`}`}
                       >
                          <div className="flex items-center gap-2">
                             <CloudRain className="w-4 h-4" /> Rainfall Sim
                          </div>
                          <div className={`w-2 h-2 rounded-full ${showRainfall ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-300'}`}></div>
                       </button>
                    </div>
                  </div>

              </div>
            )}
         </div>

         {/* View Mode Toggle */}
         <div className={`${glassPanelClass} p-1.5 rounded-xl flex`}>
            <button 
                onClick={() => setViewMode('live')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${viewMode === 'live' ? (isLightMap ? 'bg-white shadow-sm text-slate-900 ring-1 ring-black/5' : 'bg-slate-800 text-white') : textSecondary}`}
            >
                LIVE
            </button>
            <button 
                onClick={() => setViewMode('historical')}
                className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${viewMode === 'historical' ? (isLightMap ? 'bg-white shadow-sm text-slate-900 ring-1 ring-black/5' : 'bg-slate-800 text-white') : textSecondary}`}
            >
                5Y
            </button>
         </div>
      </div>

      {/* --- EARLY WARNING SYSTEM --- */}
      {criticalNodes.length > 0 && (
         <div className={`absolute bottom-6 left-6 z-[400] w-[340px] animate-in slide-in-from-bottom-6 duration-700`}>
             <div className={`backdrop-blur-xl border rounded-2xl overflow-hidden flex flex-col ${alertPanelClass}`}>
                 {/* Header */}
                 <div className={`px-5 py-3.5 flex items-center justify-between border-b ${isLightMap ? 'border-red-100/50 bg-red-600/90' : 'border-red-800 bg-red-900'}`}>
                    <div className="flex items-center gap-2.5 text-white">
                       <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm animate-pulse">
                           <Siren className="w-4 h-4" />
                       </div>
                       <div>
                           <span className="font-display font-bold text-sm tracking-wide block leading-none">EARLY WARNING</span>
                           <span className="text-[10px] opacity-80 font-mono">PROTOCOL ACTIVE</span>
                       </div>
                    </div>
                     <div className="h-2 w-2 rounded-full bg-white animate-ping"></div>
                 </div>
                 
                 {/* Content */}
                 <div className="p-5">
                    <div className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center justify-between ${isLightMap ? 'text-red-800' : 'text-red-200'}`}>
                        <span>{criticalNodes.length} Critical Vectors</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-current opacity-60">LIVE</span>
                    </div>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto mb-5 pr-1 scrollbar-thin scrollbar-thumb-red-300/50">
                        {criticalNodes.map(node => (
                           <div key={node.id} onClick={() => onSelectNode(node)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all group ${isLightMap ? 'bg-white/60 border-red-100 hover:border-red-300 hover:shadow-sm' : 'bg-red-900/20 border-red-800/50 hover:bg-red-900/40 hover:border-red-700'}`}>
                              <div className="flex items-center gap-3">
                                 <AlertOctagon className={`w-4 h-4 ${isLightMap ? 'text-red-500' : 'text-red-400'}`} />
                                 <span className={`text-xs font-bold ${isLightMap ? 'text-slate-700' : 'text-red-100'}`}>{node.name}</span>
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isLightMap ? 'bg-red-50 text-red-700' : 'bg-red-950 text-red-300'}`}>
                                 QS: {node.qualityScore}
                              </span>
                           </div>
                        ))}
                    </div>

                    {!alertBroadcasted ? (
                        <button 
                            onClick={handleBroadcast}
                            disabled={isBroadcasting}
                            className={`w-full py-3 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${isLightMap ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50'} ${isBroadcasting ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            {isBroadcasting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> ESTABLISHING UPLINK...
                                </>
                            ) : (
                                <>
                                    <Radio className="w-4 h-4" /> BROADCAST ALERT
                                </>
                            )}
                        </button>
                    ) : (
                         <div className={`w-full py-3 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-2 border shadow-inner animate-in fade-in zoom-in ${isLightMap ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-900/20 border-emerald-800 text-emerald-400'}`}>
                           <Send className="w-4 h-4" /> ALERTS DISPATCHED
                        </div>
                    )}
                 </div>
             </div>
         </div>
      )}

      <div ref={mapContainerRef} className={`w-full h-full outline-none ${isLightMap ? 'bg-slate-50' : 'bg-midnight-950'}`} />
      
      {/* Grid overlay lines for 'tech' feel - Only show on dark mode */}
      {!isLightMap && (
        <div className="absolute inset-0 pointer-events-none z-[399] opacity-20 bg-[url('https://patterns.ibrahimcesar.cloud/bg-grid.png')] bg-repeat"></div>
      )}
    </div>
  );
};

export default BasinMap;