import React, { useState, useEffect, useCallback } from 'react';
import { CrowdZone, RiskLevel } from '../types';
import { Users, AlertTriangle, TrendingUp, TrendingDown, Move, Plane, Wifi, Battery, Loader2, RefreshCw, Sparkles, BrainCircuit } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateCrowdInsight } from '../services/geminiService';

interface CrowdDashboardProps {
  zone: CrowdZone | null;
}

const mockFlowData = [
  { time: '10:00', flow: 120 },
  { time: '10:15', flow: 145 },
  { time: '10:30', flow: 180 },
  { time: '10:45', flow: 210 },
  { time: '11:00', flow: 195 },
  { time: '11:15', flow: 230 },
];

const CrowdDashboard: React.FC<CrowdDashboardProps> = ({ zone }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchInsight = useCallback(async () => {
    if (!zone) return;
    
    setLoading(true);
    // Keep previous insight visible while loading new one for better UX, 
    // unless it was an error state.
    if (insight.startsWith("Unable") || !insight) setInsight('');
    
    try {
        const result = await generateCrowdInsight(zone);
        setInsight(result);
    } catch (error) {
        console.error("Failed to fetch insight", error);
        setInsight("Unable to generate prediction. Check connection.");
    } finally {
        setLoading(false);
    }
  }, [zone]);

  // Initial fetch when zone changes
  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  if (!zone) return null;

  const getRiskColorClass = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW: return 'text-emerald-700 border-emerald-200 bg-emerald-50/50 ring-emerald-100';
      case RiskLevel.MODERATE: return 'text-amber-700 border-amber-200 bg-amber-50/50 ring-amber-100';
      case RiskLevel.HIGH: return 'text-rose-700 border-rose-200 bg-rose-50/50 ring-rose-100';
      case RiskLevel.CRITICAL: return 'text-red-700 border-red-200 bg-red-50/50 ring-red-100';
      default: return 'text-cyan-700 border-cyan-200 bg-cyan-50/50 ring-cyan-100';
    }
  };

  return (
    <div className="glass-panel p-0 rounded-2xl flex flex-col animate-in slide-in-from-right duration-500 shadow-xl relative overflow-hidden h-full bg-white/70 border-white/60">
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-100 relative bg-white/30 backdrop-blur-md">
        <div className="flex justify-between items-start">
          <div>
             <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-none">{zone.name}</h2>
             <div className="flex items-center gap-2 mt-2">
                <Plane className="w-3 h-3 text-cyan-600" />
                <span className="text-[11px] font-mono text-slate-500">Source: Drone-{zone.droneId}</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200">
                   <Wifi className="w-2.5 h-2.5" /> Signal 98%
                </span>
             </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full border ring-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${getRiskColorClass(zone.riskLevel)}`}>
            {zone.riskLevel} Density
          </div>
        </div>

        <div className="mt-6 flex gap-4">
           <div className="flex-1 p-3 bg-white/60 rounded-lg border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1 font-bold">Headcount Est.</span>
              <div className="flex items-baseline gap-1">
                 <Users className="w-4 h-4 text-slate-400" />
                 <span className="text-2xl font-mono font-bold text-slate-900">{zone.headcount.toLocaleString()}</span>
              </div>
           </div>
           <div className="flex-1 p-3 bg-white/60 rounded-lg border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1 font-bold">Capacity Load</span>
              <div className="flex items-baseline gap-1">
                 <span className={`text-2xl font-mono font-bold ${zone.occupancy > 80 ? 'text-red-500' : 'text-emerald-500'}`}>{zone.occupancy}%</span>
                 <div className="h-1.5 flex-1 bg-slate-100 rounded-full ml-2 overflow-hidden">
                    <div className={`h-full rounded-full ${zone.occupancy > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${zone.occupancy}%`}}></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50/30">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-400 font-bold">
                <Move className="w-3 h-3" /> Flow Rate
             </div>
             <div className="text-xl font-bold font-mono text-slate-800 flex items-center gap-2">
                {zone.flowRate} <span className="text-xs font-normal text-slate-400">ppl/min</span>
                {zone.trend === 'increasing' ? <TrendingUp className="w-4 h-4 text-rose-500" /> : <TrendingDown className="w-4 h-4 text-emerald-500" />}
             </div>
          </div>
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-400 font-bold">
                <Battery className="w-3 h-3" /> Drone Battery
             </div>
             <div className="text-xl font-bold font-mono text-emerald-600">
                74%
             </div>
          </div>
      </div>

      {/* Flow Chart */}
      <div className="flex-1 p-6 pt-0 relative min-h-[180px] bg-slate-50/30">
         <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-4 font-bold">Influx Trend (Last Hour)</h4>
         <ResponsiveContainer width="100%" height={140}>
           <AreaChart data={mockFlowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
             <defs>
               <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                 <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
             <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 9, fontFamily: 'JetBrains Mono'}} axisLine={false} tickLine={false} />
             <YAxis tick={{fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748b'}} axisLine={false} tickLine={false} />
             <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', backdropFilter: 'blur(4px)', borderRadius: '8px' }}
                itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
             />
             <Area type="monotone" dataKey="flow" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFlow)" />
           </AreaChart>
         </ResponsiveContainer>
      </div>

      {/* AI Insight Section */}
      <div className={`p-5 m-3 mt-0 rounded-xl border transition-colors duration-500 backdrop-blur-sm relative overflow-hidden group ${zone.riskLevel === RiskLevel.CRITICAL || zone.riskLevel === RiskLevel.HIGH ? 'bg-amber-50/60 border-amber-100/60' : 'bg-emerald-50/60 border-emerald-100/60'}`}>
         
         <div className="flex items-start gap-3 relative z-10">
             <div className={`p-1.5 rounded-full shadow-sm ring-1 ring-inset ring-black/5 ${zone.riskLevel === RiskLevel.CRITICAL || zone.riskLevel === RiskLevel.HIGH ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                <BrainCircuit className="w-4 h-4" />
             </div>
             <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h5 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${zone.riskLevel === RiskLevel.CRITICAL || zone.riskLevel === RiskLevel.HIGH ? 'text-amber-800' : 'text-emerald-800'}`}>
                        Gemini Crowd Prediction
                        <Sparkles className="w-3 h-3 opacity-60" />
                    </h5>
                    <button 
                        onClick={fetchInsight}
                        disabled={loading}
                        className={`p-1 rounded-md transition-all ${loading ? 'opacity-50' : 'hover:bg-black/5 active:scale-95'}`}
                        title="Refresh Prediction"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                
                <p className={`text-xs leading-relaxed font-medium min-h-[40px] animate-in fade-in duration-700 ${zone.riskLevel === RiskLevel.CRITICAL || zone.riskLevel === RiskLevel.HIGH ? 'text-amber-900' : 'text-emerald-900'}`}>
                   {loading ? (
                       <span className="flex items-center gap-2 opacity-70">
                           Synthesizing behavior patterns...
                       </span>
                   ) : (
                       insight || "Initializing predictive models..."
                   )}
                </p>
             </div>
         </div>
      </div>

    </div>
  );
};

export default CrowdDashboard;