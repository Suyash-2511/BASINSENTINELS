import React, { useState, useEffect } from 'react';
import { RiskLevel, MonitoringNode, CrowdZone } from './types';
import BasinMap from './components/BasinMap';
import Dashboard from './components/Dashboard';
import CrowdMap from './components/CrowdMap';
import CrowdDashboard from './components/CrowdDashboard';
import IntelligencePanel from './components/IntelligencePanel';
import { Shield, Users, ChevronDown, Activity, AlertTriangle, Calendar, Hexagon, Waves, Map as MapIcon, Crosshair, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

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

// Professional "Orbital Drop" Logo
const SentinelLogo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-900 transition-all duration-500 hover:drop-shadow-glow">
    <defs>
      <linearGradient id="logoGradient" x1="21" y1="6" x2="21" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    
    {/* Central Drop */}
    <path d="M21 6C21 6 10 18 10 25C10 31.0751 14.9249 36 21 36C27.0751 36 32 31.0751 32 25C32 18 21 6 21 6Z" 
          fill="url(#logoGradient)" />
          
    {/* Sensor Node (Pulse) */}
    <circle cx="21" cy="28" r="2.5" fill="white" fillOpacity="0.95" className="animate-pulse" />
    
    {/* Orbital Ring Segment (Monitoring) */}
    <path d="M37 25C37 33.8366 29.8366 41 21 41C12.1634 41 5 33.8366 5 25" 
          stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.3" />
    
    {/* Upper Tech Accents */}
    <path d="M35 15L37 13" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
    <path d="M7 15L5 13" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
  </svg>
);

export default function App() {
  const [activeModule, setActiveModule] = useState<'water' | 'crowd'>('water');
  const [selectedNode, setSelectedNode] = useState<MonitoringNode | null>(MOCK_NODES[5]); 
  const [selectedCrowdZone, setSelectedCrowdZone] = useState<CrowdZone | null>(MOCK_CROWD_ZONES[0]);
  const [viewMode, setViewMode] = useState<'authority' | 'public'>('authority');
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  const yRange1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const yRange2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const yRange3 = useTransform(scrollY, [0, 1000], [0, 100]);
  const opacityRange = useTransform(scrollY, [0, 600], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-cyan-500/20 selection:text-cyan-900 pb-20 relative overflow-hidden">
      
      {/* --- Parallax Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-circuit-pattern opacity-[0.04]"></div>
        <motion.div style={{ y: yRange1, opacity: opacityRange }} className="absolute w-full h-full">
            <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-cyan-200/20 rounded-full blur-[130px] mix-blend-multiply"></div>
        </motion.div>
        <motion.div style={{ y: yRange2, opacity: opacityRange }} className="absolute w-full h-full">
             <div className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] bg-indigo-200/20 rounded-full blur-[130px] mix-blend-multiply"></div>
        </motion.div>
        <motion.div style={{ y: yRange3, opacity: opacityRange }} className="absolute w-full h-full">
             <div className="absolute bottom-[-10%] left-[20%] w-[800px] h-[800px] bg-cyan-100/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-xl border-b border-white/50 py-3 shadow-sm' : 'bg-transparent border-b border-transparent py-6'}`}>
        <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative transform transition-transform group-hover:scale-105 duration-300">
              <SentinelLogo />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900 leading-none">
                BASIN<span className="text-cyan-600 font-medium">SENTINELS</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-semibold">Online</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/50 shadow-inner">
              <button 
                onClick={() => setViewMode('authority')}
                className={`px-4 py-1.5 rounded-md text-xs font-display font-bold transition-all flex items-center gap-2 ${viewMode === 'authority' ? 'bg-white text-cyan-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Shield className="w-3.5 h-3.5" /> <span className="hidden sm:inline">AUTHORITY</span>
              </button>
              <button 
                onClick={() => setViewMode('public')}
                className={`px-4 py-1.5 rounded-md text-xs font-display font-bold transition-all flex items-center gap-2 ${viewMode === 'public' ? 'bg-white text-cyan-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Users className="w-3.5 h-3.5" /> <span className="hidden sm:inline">PUBLIC</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-44 pb-20 px-6 lg:px-12 z-10">
        <div className="container mx-auto">
          <div className="flex flex-col xl:flex-row justify-between items-end gap-10 mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-3 mb-8 px-4 py-1.5 rounded-full border border-cyan-200 bg-cyan-50/50 backdrop-blur-md">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                 </div>
                 <span className="text-[10px] font-mono font-bold text-cyan-800 tracking-wider">SYSTEM V.2.4 • NASHIK SECTOR</span>
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-slate-900 leading-[0.9] tracking-tight mb-8">
                PREDICTING RISK <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600">BEFORE CRISIS</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl font-light leading-relaxed">
                 Advanced hydrological sensor fusion and predictive intelligence for the Godavari ecosystem.
              </p>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
                <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="group flex items-center gap-3 px-8 py-4 rounded-full border border-slate-200 bg-white shadow-xl shadow-cyan-900/5 text-slate-800 text-sm font-mono font-bold hover:border-cyan-400 hover:text-cyan-700 transition-all hover:-translate-y-1">
                  INITIALIZE DIAGNOSTICS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </motion.div>
          </div>

          {/* Module Switcher - Floating Segmented Control */}
          <div className="mb-12 flex justify-center lg:justify-start">
             <div className="inline-flex bg-slate-200/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 shadow-inner relative">
                <div 
                  className={`absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-sm transition-all duration-300 ease-out z-0`}
                  style={{
                    left: activeModule === 'water' ? '6px' : '50%',
                    width: 'calc(50% - 9px)',
                    transform: activeModule === 'crowd' ? 'translateX(3px)' : 'translateX(0)'
                  }}
                />
                <button 
                  onClick={() => setActiveModule('water')}
                  className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-3 w-64 justify-center ${activeModule === 'water' ? 'text-cyan-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Waves className={`w-4 h-4 ${activeModule === 'water' ? 'text-cyan-500' : 'text-slate-400'}`} /> 
                  Water Quality
                </button>
                <button 
                  onClick={() => setActiveModule('crowd')}
                  className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-3 w-64 justify-center ${activeModule === 'crowd' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Crosshair className={`w-4 h-4 ${activeModule === 'crowd' ? 'text-emerald-500' : 'text-slate-400'}`} /> 
                  Crowd Grid
                </button>
             </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
            {activeModule === 'water' ? (
              <React.Fragment key="water-metrics">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="glass-panel-hover glass-panel p-6 rounded-2xl group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent opacity-100"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2 font-bold">Basin Health Index</div>
                      <div className="text-5xl font-display font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">78<span className="text-2xl text-slate-400 ml-1">%</span></div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-cyan-500 shadow-sm group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-[78%] rounded-full"></div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: 0.1 }}
                  className="glass-panel-hover glass-panel p-6 rounded-2xl group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-100"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2 font-bold">Critical Zones</div>
                      <div className="text-5xl font-display font-bold text-slate-800 group-hover:text-amber-600 transition-colors">02</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-white text-amber-700 border border-amber-100 shadow-sm">Ganga Ghat</span>
                     <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-white text-amber-700 border border-amber-100 shadow-sm">Tapovan</span>
                  </div>
                </motion.div>
              </React.Fragment>
            ) : (
              <React.Fragment key="crowd-metrics">
                 <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="glass-panel-hover glass-panel p-6 rounded-2xl group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-100"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2 font-bold">Total Headcount</div>
                      <div className="text-5xl font-display font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">27.5<span className="text-2xl text-slate-400 ml-1">k</span></div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 w-[65%] rounded-full"></div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: 0.1 }}
                  className="glass-panel-hover glass-panel p-6 rounded-2xl group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-100"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2 font-bold">Stampede Risk</div>
                      <div className="text-5xl font-display font-bold text-slate-800 group-hover:text-rose-600 transition-colors">HIGH</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-white text-rose-700 border border-rose-100 shadow-sm">Ramkund Sector A</span>
                  </div>
                </motion.div>
              </React.Fragment>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-panel-hover glass-panel p-6 rounded-2xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent opacity-100"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2 font-bold">Next Major Event</div>
                  <div className="text-5xl font-display font-bold text-slate-800 group-hover:text-violet-700 transition-colors">14<span className="text-xl font-sans font-normal text-slate-400 ml-1">h</span> 30<span className="text-xl font-sans font-normal text-slate-400 ml-1">m</span></div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-violet-500 shadow-sm group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-500 font-mono font-medium">
                 Kumbh Mela Prep Phase II
              </div>
            </motion.div>
            </AnimatePresence>
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
            <IntelligencePanel activeModule={activeModule} />
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
              
              {/* Quick Actions / Legend - Water Only */}
              {activeModule === 'water' && (
                <div className="glass-panel p-6 rounded-2xl">
                   <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                      <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
                         Risk Taxonomy
                      </h4>
                      <Hexagon className="w-4 h-4 text-slate-400" />
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm group cursor-default p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <span className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm ring-2 ring-emerald-100"></span>
                           Safe / Optimal
                         </span>
                         <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            QS &gt; 80
                         </span>
                      </div>
                      <div className="flex items-center justify-between text-sm group cursor-default p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <span className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                           <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm ring-2 ring-amber-100"></span>
                           Moderate Risk
                         </span>
                         <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                            QS 60-80
                         </span>
                      </div>
                      <div className="flex items-center justify-between text-sm group cursor-default p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <span className="flex items-center gap-3 text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                           <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm ring-2 ring-red-100 animate-pulse"></span>
                           Critical Failure
                         </span>
                         <span className="font-mono text-[10px] text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                            QS &lt; 40
                         </span>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="container mx-auto px-6 lg:px-12 py-10 border-t border-slate-200/60 mt-12 relative z-10 bg-white/40 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
            <SentinelLogo />
            <div>
               <span className="font-display font-bold text-lg text-slate-900 tracking-wide block leading-none">BASIN SENTINELS</span>
               <span className="text-[10px] font-mono text-slate-500 font-bold">INITIATIVE BY NASHIK SMART CITY</span>
            </div>
          </div>
          <div className="flex gap-8 text-[11px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
            <a href="#" className="hover:text-cyan-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">API Access</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Gov Portal</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Privacy</a>
          </div>
          <p className="text-slate-500 text-xs font-mono flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> SECURE CONNECTION • ENCRYPTED
          </p>
        </div>
      </footer>
    </div>
  );
}