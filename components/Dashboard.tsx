import React from 'react';
import { MonitoringNode, RiskLevel } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Activity, Droplets, Wind, AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface DashboardProps {
  node: MonitoringNode | null;
  mode: 'authority' | 'public';
}

const mockHistoryData = [
  { time: '06:00', value: 65 },
  { time: '08:00', value: 68 },
  { time: '10:00', value: 72 },
  { time: '12:00', value: 55 },
  { time: '14:00', value: 48 },
  { time: '16:00', value: 42 },
  { time: '18:00', value: 45 },
];

const Dashboard: React.FC<DashboardProps> = ({ node, mode }) => {
  if (!node) {
    return (
      <div className="glass-panel h-[600px] flex flex-col items-center justify-center text-slate-400 p-8 text-center rounded-2xl border-dashed border border-slate-800">
        <div className="w-20 h-20 rounded-full bg-slate-900/80 flex items-center justify-center mb-6 border border-slate-800">
           <MapPin className="w-8 h-8 opacity-50 text-cyan-500" />
        </div>
        <h3 className="text-xl font-display text-white font-bold">Select Monitoring Node</h3>
        <p className="text-sm mt-2 max-w-xs font-mono text-slate-500">Initiate localized diagnostic by selecting a marker on the basin map.</p>
      </div>
    );
  }

  const getStatusColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case RiskLevel.MODERATE: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case RiskLevel.HIGH: return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case RiskLevel.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    }
  };

  const getTrendIcon = (trend: string) => {
     if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
     if (trend === 'degrading') return <TrendingDown className="w-4 h-4 text-rose-400" />;
     return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="glass-panel p-0 rounded-2xl flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl relative overflow-hidden group">
      
      {/* Top Banner Status */}
      <div className="p-6 pb-4 border-b border-white/5 relative bg-midnight-900/40">
        {/* Decorative Glow */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${node.riskLevel === RiskLevel.CRITICAL ? 'bg-red-500/20' : 'bg-cyan-500/10'} rounded-full blur-[60px] pointer-events-none transition-colors duration-500`}></div>

        <div className="flex justify-between items-start relative z-10">
          <div>
             <h2 className="text-2xl font-display font-bold text-white tracking-tight leading-none">{node.name}</h2>
             <p className="text-[11px] font-mono text-cyan-500/70 mt-1.5 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{node.coordinates.lat.toFixed(4)}, {node.coordinates.lng.toFixed(4)}</span>
             </p>
          </div>
          <div className={`px-3 py-1.5 rounded-md border ${getStatusColor(node.riskLevel)} text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md`}>
            {node.riskLevel} Risk
          </div>
        </div>
        
        <div className="mt-6 flex items-end gap-3">
           <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">Composite Score</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-5xl font-mono font-bold text-white tracking-tighter">{node.qualityScore}</span>
                 <span className="text-sm text-slate-500 font-medium">/100</span>
              </div>
           </div>
           <div className="h-10 w-px bg-slate-800 mx-2"></div>
           <div className="pb-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">24h Change</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-rose-400">
                 <TrendingDown className="w-4 h-4" /> 12%
              </div>
           </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="p-6 bg-midnight-950/30">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 font-semibold">Real-time Parameters</h4>
        <div className="grid grid-cols-2 gap-3">
            {[
                { label: 'pH Level', value: node.ph, unit: '', icon: Droplets },
                { label: 'Dissolved O2', value: node.do, unit: 'mg/L', icon: Wind },
                { label: 'BOD', value: node.bod, unit: 'mg/L', icon: Activity },
                { label: 'Turbidity', value: node.turbidity, unit: 'NTU', icon: Droplets },
            ].map((metric, idx) => (
                <div key={idx} className="bg-midnight-900/60 p-3 rounded-lg border border-slate-800 hover:border-cyan-500/20 hover:bg-midnight-800/80 transition-all group/card">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase mb-1.5">
                        <metric.icon className="w-3 h-3 text-cyan-500 group-hover/card:text-cyan-400" /> 
                        {metric.label}
                    </div>
                    <div className="text-lg font-bold font-mono text-white group-hover/card:text-cyan-50 flex items-baseline gap-1">
                        {metric.value} <span className="text-[10px] text-slate-500 font-normal">{metric.unit}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-0 relative h-48 w-full bg-midnight-950/30">
         <div className="h-px w-full bg-slate-800/50 mb-4"></div>
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={mockHistoryData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
             <defs>
               <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                 <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
             <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 10, fontFamily: 'JetBrains Mono'}} axisLine={false} tickLine={false} />
             <YAxis tick={{fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#64748b'}} axisLine={false} tickLine={false} />
             <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#22d3ee' }}
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
             />
             <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
           </AreaChart>
         </ResponsiveContainer>
      </div>

      {/* AI Prediction Footer */}
      <div className={`p-5 m-2 mt-0 rounded-xl border ${node.prediction.trend === 'degrading' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'} backdrop-blur-sm relative overflow-hidden`}>
         {/* Striped background overlay */}
         <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_11px)]"></div>
         
        <div className="flex items-start gap-3 relative z-10">
          <div className={`p-1.5 rounded-full ${node.prediction.trend === 'degrading' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h5 className={`font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 ${node.prediction.trend === 'degrading' ? 'text-rose-400' : 'text-emerald-400'}`}>
              AI Forecast: {node.prediction.trend}
              {getTrendIcon(node.prediction.trend)}
            </h5>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed font-light">
              {mode === 'authority' 
                ? `Algorithmic model confidence 94%. Downstream effluent impact expected within 4 hours. Recommend initiating localized protocol.`
                : node.prediction.trend === 'degrading' 
                  ? "Water quality is predicted to drop significantly. Please avoid direct contact or consumption in this area until further notice."
                  : "Water quality is predicted to remain stable. Safe for standard public activities."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;