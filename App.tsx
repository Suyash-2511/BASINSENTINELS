import React, { useState, useEffect } from 'react';
import { RiskLevel, MonitoringNode, CrowdZone } from './types';
import BasinMap from './components/BasinMap';
import Dashboard from './components/Dashboard';
import CrowdMap from './components/CrowdMap';
import CrowdDashboard from './components/CrowdDashboard';
import IntelligencePanel from './components/IntelligencePanel';
import { Shield, Users, ChevronDown, Activity, AlertTriangle, Calendar, Hexagon, Waves, Map as MapIcon, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_NODES: MonitoringNode[] = [
  {
    id: '1', name: 'Trimbakeshwar Source', coordinates: { lat: 19.9322, lng: 73.5306 },
    ph: 7.1, do: 8.8, bod: 1.2, turbidity: 2, qualityScore: 95, historicalAverage: 96, riskLevel: RiskLevel.LOW,
    prediction: { score: 94, trend: 'stable', next6Hrs: RiskLevel.LOW }
  },
  {
    id: '2', name: 'Gangapur Reservoir', coordinates: { lat: 20.0298, lng: 73.6641 },
    ph: 7.3, do: 7.9, bod: 2.5, turbidity: 8, qualityScore: 88, historicalAverage: 90, riskLevel: RiskLevel.LOW,
    prediction: { score: 85, trend: 'stable', next6Hrs: RiskLevel.LOW }
  },
  {
    id: '3', name: 'Ganga Ghat', coordinates: { lat: 20.00729176079296, lng: 73.79249057371942 },
    ph: 6.8, do: 4.2, bod: 9.5, turbidity: 48, qualityScore: 45, historicalAverage: 65, riskLevel: RiskLevel.CRITICAL,
    prediction: { score: 40, trend: 'degrading', next6Hrs: RiskLevel.CRITICAL }
  },
  {
    id: '4', name: 'Someshwar Falls', coordinates: { lat: 20.029362732172437, lng: 73.72333977534281 },
    ph: 7.2, do: 6.8, bod: 4.5, turbidity: 18, qualityScore: 74, historicalAverage: 78, riskLevel: RiskLevel.MODERATE,
    prediction: { score: 70, trend: 'degrading', next6Hrs: RiskLevel.MODERATE }
  },
  {
    id: '5', name: 'Goda Park', coordinates: { lat: 20.009321296134083, lng: 73.78244621166205 },
    ph: 7.1, do: 6.4, bod: 5.2, turbidity: 25, qualityScore: 68, historicalAverage: 72, riskLevel: RiskLevel.MODERATE,
    prediction: { score: 65, trend: 'degrading', next6Hrs: RiskLevel.MODERATE }
  },
  {
    id: '6', name: 'Ramkund (Panchavati)', coordinates: { lat: 20.008185630454562, lng: 73.79198282777092 },
    ph: 6.9, do: 5.5, bod: 6.8, turbidity: 40, qualityScore: 58, historicalAverage: 62, riskLevel: RiskLevel.HIGH,
    prediction: { score: 50, trend: 'degrading', next6Hrs: RiskLevel.CRITICAL }
  },
  {
    id: '7', name: 'Kapila Sangam', coordinates: { lat: 19.989462727479534, lng: 73.82278363000695 },
    ph: 6.5, do: 4.8, bod: 8.5, turbidity: 55, qualityScore: 45, historicalAverage: 55, riskLevel: RiskLevel.CRITICAL,
    prediction: { score: 42, trend: 'degrading', next6Hrs: RiskLevel.CRITICAL }
  },
  {
    id: '8', name: 'Tapovan', coordinates: { lat: 19.999661081301987, lng: 73.81244345421507 },
    ph: 6.6, do: 4.2, bod: 9.0, turbidity: 60, qualityScore: 42, historicalAverage: 48, riskLevel: RiskLevel.CRITICAL,
    prediction: { score: 40, trend: 'stable', next6Hrs: RiskLevel.CRITICAL }
  },
  {
    id: '9', name: 'Dasak Bridge', coordinates: { lat: 19.989556819469687, lng: 73.84571202363831 },
    ph: 6.3, do: 3.5, bod: 12.0, turbidity: 70, qualityScore: 35, historicalAverage: 40, riskLevel: RiskLevel.CRITICAL,
    prediction: { score: 32, trend: 'degrading', next6Hrs: RiskLevel.CRITICAL }
  }
];

const MOCK_CROWD_ZONES: CrowdZone[] = [
  {
    id: 'cz1', name: 'Ramkund Main Ghat', coordinates: { lat: 20.0082, lng: 73.7920 },
    radius: 150, occupancy: 92, headcount: 12500, flowRate: 210, riskLevel: RiskLevel.CRITICAL,
    trend: 'increasing', droneId: 'A1', nextEvent: 'Evening Aarti'
  },
  {
    id: 'cz2', name: 'Sardar Chowk', coordinates: { lat: 20.0060, lng: 73.7905 },
    radius: 120, occupancy: 78, headcount: 4500, flowRate: 150, riskLevel: RiskLevel.HIGH,
    trend: 'stable', droneId: 'A2', nextEvent: 'None'
  },
  {
    id: 'cz3', name: 'Tapovan Parking', coordinates: { lat: 19.9997, lng: 73.8124 },
    radius: 250, occupancy: 45, headcount: 3200, flowRate: 80, riskLevel: RiskLevel.MODERATE,
    trend: 'decreasing', droneId: 'B1', nextEvent: 'None'
  },
  {
    id: 'cz4', name: 'Panchavati Approach', coordinates: { lat: 20.0100, lng: 73.7930 },
    radius: 180, occupancy: 65, headcount: 6800, flowRate: 120, riskLevel: RiskLevel.MODERATE,
    trend: 'increasing', droneId: 'A1', nextEvent: 'Procession'
  }
];

const SentinelLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-cyan-400">
    <path d="M20 38C20 38 36 30 36 10V6L20 2L4 6V10C4 30 20 38 20 38Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(34, 211, 238, 0.1)"/>
    <path d="M20 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 26H20.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <path d="M12 16C12 16 14 18 20 18C26 18 28 16 28 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"/>
  </svg>
);

export default function App() {
  const [activeModule, setActiveModule] = useState<'water' | 'crowd'>('water');
  const [selectedNode, setSelectedNode] = useState<MonitoringNode | null>(MOCK_NODES[5]); // Default to Ramkund
  const [selectedCrowdZone, setSelectedCrowdZone] = useState<CrowdZone | null>(MOCK_CROWD_ZONES[0]);
  const [viewMode, setViewMode] = useState<'authority' | 'public'>('authority');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950 font-sans text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 pb-20 relative overflow-hidden">
      
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-circuit-pattern opacity-[0.03]"></div>
        <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[128px] animate-blob mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[128px] animate-blob animation-delay-2000 mix-blend-screen"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-midnight-950/80 backdrop-blur-xl border-b border-midnight-800 py-3 shadow-lg' : 'bg-transparent border-b border-transparent py-6'}`}>
        <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative transform transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20"></div>
              <SentinelLogo />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-white leading-none">BASIN<span className="text-cyan-400">SENTINELS</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <p className="text-[10px] text-cyan-500/80 font-mono tracking-widest uppercase font-semibold">System Operational</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-midnight-900/60 p-1.5 rounded-lg border border-midnight-800 backdrop-blur-md">
              <button 
                onClick={() => setViewMode('authority')}
                className={`px-4 py-1.5 rounded-md text-sm font-display font-semibold transition-all flex items-center gap-2 ${viewMode === 'authority' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Shield className="w-4 h-4" /> <span className="hidden sm:inline">AUTHORITY</span>
              </button>
              <button 
                onClick={() => setViewMode('public')}
                className={`px-4 py-1.5 rounded-md text-sm font-display font-semibold transition-all flex items-center gap-2 ${viewMode === 'public' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Users className="w-4 h-4" /> <span className="hidden sm:inline">PUBLIC</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Header Section */}
      <header className="relative pt-40 pb-16 px-6 lg:px-12 z-10">
        <div className="container mx-auto">
          <div className="flex flex-col xl:flex-row justify-between items-end gap-10 mb-16">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-3 mb-6 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm">
                 <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">V.2.4.0 STABLE</span>
                 <div className="h-3 w-px bg-cyan-500/20"></div>
                 <span className="text-[10px] font-mono text-cyan-200/60 tracking-wider uppercase">Godavari River Basin • Nashik Sector</span>
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[0.9] tracking-tight mb-6">
                PREDICTING WATER RISK <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">BEFORE THE CRISIS</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl font-light leading-relaxed">
                 Deploying advanced hydrological sensor fusion and event-aware predictive intelligence to safeguard the Godavari ecosystem.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-4">
                <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="group flex items-center gap-3 px-6 py-3 rounded-lg border border-cyan-500/30 text-cyan-400 text-sm font-mono font-bold hover:bg-cyan-500/10 transition-all">
                  INITIALIZE DIAGNOSTICS <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
               </button>
            </div>
          </div>

          {/* Module Switcher Tab */}
          <div className="mb-8 border-b border-white/5">
             <div className="flex gap-8">
                <button 
                  onClick={() => setActiveModule('water')}
                  className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeModule === 'water' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <span className="flex items-center gap-2"><Waves className="w-4 h-4" /> Water Quality Monitor</span>
                  {activeModule === 'water' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></motion.div>}
                </button>
                <button 
                  onClick={() => setActiveModule('crowd')}
                  className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeModule === 'crowd' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <span className="flex items-center gap-2"><Crosshair className="w-4 h-4" /> Crowd Control Grid</span>
                  {activeModule === 'crowd' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981]"></motion.div>}
                </button>
             </div>
          </div>

          {/* Key Metrics Row - Conditional based on Module */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeModule === 'water' ? (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-cyan-500/70 text-xs font-mono uppercase tracking-wider mb-2">Basin Health Index</div>
                      <div className="text-5xl font-display font-bold text-white group-hover:text-cyan-400 transition-colors">78<span className="text-2xl text-slate-500 ml-1">%</span></div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[78%] rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-amber-500/70 text-xs font-mono uppercase tracking-wider mb-2">Critical Zones</div>
                      <div className="text-5xl font-display font-bold text-white group-hover:text-amber-400 transition-colors">02</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">Ganga Ghat</span>
                     <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">Tapovan</span>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                 <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-emerald-500/70 text-xs font-mono uppercase tracking-wider mb-2">Total Headcount</div>
                      <div className="text-5xl font-display font-bold text-white group-hover:text-emerald-400 transition-colors">27.5<span className="text-2xl text-slate-500 ml-1">k</span></div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%] rounded-full shadow-[0_0_10px_#10b981]"></div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-all group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-rose-500/70 text-xs font-mono uppercase tracking-wider mb-2">Stampede Risk</div>
                      <div className="text-5xl font-display font-bold text-white group-hover:text-rose-400 transition-colors">HIGH</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">Ramkund Sector A</span>
                  </div>
                </motion.div>
              </>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-violet-500/70 text-xs font-mono uppercase tracking-wider mb-2">Next Major Event</div>
                  <div className="text-5xl font-display font-bold text-white group-hover:text-violet-400 transition-colors">14<span className="text-xl font-sans font-normal text-slate-500 ml-1">h</span> 30<span className="text-xl font-sans font-normal text-slate-500 ml-1">m</span></div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-400 font-mono">
                 Kumbh Mela Prep Phase II
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="container mx-auto px-6 lg:px-12 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Map Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {activeModule === 'water' ? (
              <BasinMap 
                nodes={MOCK_NODES} 
                selectedNode={selectedNode} 
                onSelectNode={setSelectedNode} 
              />
            ) : (
              <CrowdMap 
                zones={MOCK_CROWD_ZONES}
                selectedZone={selectedCrowdZone}
                onSelectZone={setSelectedCrowdZone}
              />
            )}
            
            {/* Intelligence Panel (Below Map) */}
            <IntelligencePanel />
          </div>

          {/* Details Column (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Sticky Dashboard Panel */}
            <div className="sticky top-28 space-y-6">
              {activeModule === 'water' ? (
                <Dashboard node={selectedNode} mode={viewMode} />
              ) : (
                <CrowdDashboard zone={selectedCrowdZone} />
              )}
              
              {/* Quick Actions / Legend - Dynamic based on module */}
              <div className="glass-panel p-6 rounded-2xl border border-midnight-800">
                 <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">
                       {activeModule === 'water' ? 'Risk Taxonomy' : 'Density Thresholds'}
                    </h4>
                    <Hexagon className="w-4 h-4 text-slate-600" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm group cursor-default p-2 rounded hover:bg-white/5 transition-colors">
                       <span className="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors font-medium">
                         <span className="w-2.5 h-2.5 rounded-full bg-risk-low shadow-[0_0_10px_#10b981]"></span>
                         {activeModule === 'water' ? 'Safe / Optimal' : 'Normal Flow'}
                       </span>
                       <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                          {activeModule === 'water' ? 'QS > 80' : '< 50% Cap'}
                       </span>
                    </div>
                    <div className="flex items-center justify-between text-sm group cursor-default p-2 rounded hover:bg-white/5 transition-colors">
                       <span className="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors font-medium">
                         <span className="w-2.5 h-2.5 rounded-full bg-risk-moderate shadow-[0_0_10px_#f59e0b]"></span>
                         {activeModule === 'water' ? 'Moderate Risk' : 'High Volume'}
                       </span>
                       <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                          {activeModule === 'water' ? 'QS 60-80' : '50-80% Cap'}
                       </span>
                    </div>
                    <div className="flex items-center justify-between text-sm group cursor-default p-2 rounded hover:bg-white/5 transition-colors">
                       <span className="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors font-medium">
                         <span className="w-2.5 h-2.5 rounded-full bg-risk-critical shadow-[0_0_10px_#e11d48] animate-pulse"></span>
                         {activeModule === 'water' ? 'Critical Failure' : 'Stampede Risk'}
                       </span>
                       <span className="font-mono text-[10px] text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                          {activeModule === 'water' ? 'QS < 40' : '> 90% Cap'}
                       </span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="container mx-auto px-6 lg:px-12 py-10 border-t border-midnight-800/50 mt-12 relative z-10 bg-midnight-950/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
            <SentinelLogo />
            <div>
               <span className="font-display font-bold text-lg tracking-wide block leading-none">BASIN SENTINELS</span>
               <span className="text-[10px] font-mono text-slate-500">INITIATIVE BY NASHIK SMART CITY</span>
            </div>
          </div>
          <div className="flex gap-8 text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">API Access</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Gov Portal</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
          </div>
          <p className="text-slate-600 text-xs font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> SECURE CONNECTION • ENCRYPTED
          </p>
        </div>
      </footer>
    </div>
  );
}