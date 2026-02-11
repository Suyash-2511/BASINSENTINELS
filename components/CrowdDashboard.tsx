import React from 'react';
import { CrowdZone, RiskLevel } from '../types';
import { Users, AlertTriangle, TrendingUp, TrendingDown, Move, Plane, Wifi, Battery } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

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
  if (!zone) return null;

  const getRiskColorClass = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case RiskLevel.MODERATE: return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case RiskLevel.HIGH: return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case RiskLevel.CRITICAL: return 'text-red-500 border-red-500/30 bg-red-500/10';
      default: return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    }
  };

  return (
    <div className="glass-panel p-0 rounded-2xl flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl relative overflow-hidden h-full">
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/5 relative bg-midnight-900/40">
        <div className="flex justify-between items-start">
          <div>
             <h2 className="text-2xl font-display font-bold text-white tracking-tight leading-none">{zone.name}</h2>
             <div className="flex items-center gap-2 mt-2">
                <Plane className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px] font-mono text-cyan-500/70">Source: Drone-{zone.droneId}</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                   <Wifi className="w-2.5 h-2.5" /> Signal 98%
                </span>
             </div>
          </div>
          <div className={`px-3 py-1.5 rounded-md border text-xs font-bold uppercase tracking-wider backdrop-blur-md ${getRiskColorClass(zone.riskLevel)}`}>
            {zone.riskLevel} Density
          </div>
        </div>

        <div className="mt-6 flex gap-4">
           <div className="flex-1 p-3 bg-midnight-950/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Headcount Est.</span>
              <div className="flex items-baseline gap-1">
                 <Users className="w-4 h-4 text-slate-500" />
                 <span className="text-2xl font-mono font-bold text-white">{zone.headcount.toLocaleString()}</span>
              </div>
           </div>
           <div className="flex-1 p-3 bg-midnight-950/50 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Capacity Load</span>
              <div className="flex items-baseline gap-1">
                 <span className={`text-2xl font-mono font-bold ${zone.occupancy > 80 ? 'text-red-400' : 'text-emerald-400'}`}>{zone.occupancy}%</span>
                 <div className="h-1.5 flex-1 bg-slate-800 rounded-full ml-2 overflow-hidden">
                    <div className={`h-full rounded-full ${zone.occupancy > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${zone.occupancy}%`}}></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid grid-cols-2 gap-4 bg-midnight-950/20">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-500">
                <Move className="w-3 h-3" /> Flow Rate
             </div>
             <div className="text-xl font-bold font-mono text-white flex items-center gap-2">
                {zone.flowRate} <span className="text-xs font-normal text-slate-600">ppl/min</span>
                {zone.trend === 'increasing' ? <TrendingUp className="w-4 h-4 text-rose-400" /> : <TrendingDown className="w-4 h-4 text-emerald-400" />}
             </div>
          </div>
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-500">
                <Battery className="w-3 h-3" /> Drone Battery
             </div>
             <div className="text-xl font-bold font-mono text-emerald-400">
                74%
             </div>
          </div>
      </div>

      {/* Flow Chart */}
      <div className="flex-1 p-6 pt-0 relative min-h-[180px] bg-midnight-950/20">
         <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-4 font-semibold">Influx Trend (Last Hour)</h4>
         <ResponsiveContainer width="100%" height={140}>
           <AreaChart data={mockFlowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
             <defs>
               <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                 <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
             <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 9, fontFamily: 'JetBrains Mono'}} axisLine={false} tickLine={false} />
             <YAxis tick={{fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748b'}} axisLine={false} tickLine={false} />
             <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0', fontSize: '12px' }}
                itemStyle={{ color: '#f59e0b' }}
             />
             <Area type="monotone" dataKey="flow" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFlow)" />
           </AreaChart>
         </ResponsiveContainer>
      </div>

      {/* AI Insight */}
      <div className="p-4 bg-midnight-900 border-t border-slate-800">
         <div className="flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
             <div>
                <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">AI Crowd Analytics</h5>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                   Pattern recognition indicates potential choke point forming at {zone.name} North Exit. Recommend deploying ground team Gamma for diversion.
                </p>
             </div>
         </div>
      </div>

    </div>
  );
};

export default CrowdDashboard;