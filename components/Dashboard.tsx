import React, { useEffect, useState } from 'react';
import { MonitoringNode, RiskLevel } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Activity, Droplets, Wind, AlertCircle, TrendingDown, TrendingUp, Minus, Sparkles, Loader2 } from 'lucide-react';
import { generateWaterQualityForecast } from '../services/geminiService';

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
  const [aiForecast, setAiForecast] = useState<string>('');
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchForecast = async () => {
      if (node) {
        setLoadingForecast(true);
        // Reset forecast when node changes
        setAiForecast(''); 
        const forecast = await generateWaterQualityForecast(node);
        if (isMounted) {
          setAiForecast(forecast);
          setLoadingForecast(false);
        }
      }
    };

    fetchForecast();

    return () => {
      isMounted = false;
    };
  }, [node]);

  if (!node) {
    return (
      <div className="glass-panel h-[500px] flex flex-col items-center justify-center text-slate-400 p-8 text-center rounded-2xl border-dashed border-2 border-slate-200 bg-white/40">
        <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center mb-6 border border-slate-100 shadow-sm backdrop-blur-sm">
           <MapPin className="w-8 h-8 opacity-40 text-cyan-500" />
        </div>
        <h3 className="text-xl font-display text-slate-700 font-bold">Select Monitoring Node</h3>
        <p className="text-sm mt-2 max-w-xs font-mono text-slate-500">Initiate localized diagnostic by selecting a marker on the basin map.</p>
      </div>
    );
  }

  const getStatusColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW: return 'text-emerald-700 bg-emerald-50/50 border-emerald-200 ring-emerald-100';
      case RiskLevel.MODERATE: return 'text-amber-700 bg-amber-50/50 border-amber-200 ring-amber-100';
      case RiskLevel.HIGH: return 'text-rose-700 bg-rose-50/50 border-rose-200 ring-rose-100';
      case RiskLevel.CRITICAL: return 'text-red-700 bg-red-50/50 border-red-200 ring-red-100';
      default: return 'text-cyan-700 bg-cyan-50/50 border-cyan-200 ring-cyan-100';
    }
  };

  const getTrendIcon = (trend: string) => {
     if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
     if (trend === 'degrading') return <TrendingDown className="w-4 h-4 text-rose-500" />;
     return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="glass-panel p-0 rounded-2xl flex flex-col animate-in slide-in-from-right duration-500 shadow-xl relative overflow-hidden group bg-white/70 border-white/60">
      
      {/* Top Banner Status */}
      <div className="p-6 pb-4 border-b border-slate-100 relative bg-white/30 backdrop-blur-md">
        {/* Decorative Glow */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${node.riskLevel === RiskLevel.CRITICAL ? 'bg-red-500/10' : 'bg-cyan-500/10'} rounded-full blur-[60px] pointer-events-none transition-colors duration-500`}></div>

        <div className="flex justify-between items-start relative z-10">
          <div>
             <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-none drop-shadow-sm">{node.name}</h2>
             <p className="text-[11px] font-mono text-slate-500 mt-1.5 flex items-center gap-2 font-medium">
                <MapPin className="w-3 h-3 text-cyan-600" />
                <span>{node.coordinates.lat.toFixed(4)}, {node.coordinates.lng.toFixed(4)}</span>
             </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full border ring-1 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-sm ${getStatusColor(node.riskLevel)}`}>
            <span className={`w-2 h-2 rounded-full ${node.riskLevel === RiskLevel.CRITICAL ? 'bg-red-500 animate-pulse' : 'bg-current'}`}></span>
            {node.riskLevel} Risk
          </div>
        </div>
        
        <div className="mt-6 flex items-end gap-6">
           <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1 font-bold">Composite Score</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-5xl font-mono font-bold text-slate-900 tracking-tighter">{node.qualityScore}</span>
                 <span className="text-sm text-slate-400 font-medium">/100</span>
              </div>
           </div>
           <div className="h-10 w-px bg-slate-200/50"></div>
           <div className="pb-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1 font-bold">24h Change</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-rose-500 bg-rose-50/50 px-2 py-0.5 rounded-md border border-rose-100">
                 <TrendingDown className="w-4 h-4" /> 12%
              </div>
           </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="p-6 bg-slate-50/30">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3 font-bold flex items-center gap-2">
            <Activity className="w-3 h-3" /> Real-time Parameters
        </h4>
        <div className="grid grid-cols-2 gap-3">
            {[
                { label: 'pH Level', value: node.ph, unit: '', icon: Droplets },
                { label: 'Dissolved O2', value: node.do, unit: 'mg/L', icon: Wind },
                { label: 'BOD', value: node.bod, unit: 'mg/L', icon: Activity },
                { label: 'Turbidity', value: node.turbidity, unit: 'NTU', icon: Droplets },
            ].map((metric, idx) => (
                <div key={idx} className="bg-white/60 p-3 rounded-xl border border-white shadow-sm hover:border-cyan-200 hover:shadow-md hover:bg-white transition-all group/card backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase mb-1.5 font-bold">
                        <metric.icon className="w-3 h-3 text-cyan-600 group-hover/card:text-cyan-500" /> 
                        {metric.label}
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-800 group-hover/card:text-cyan-900 flex items-baseline gap-1">
                        {metric.value} <span className="text-[10px] text-slate-400 font-normal">{metric.unit}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-0 relative h-48 w-full bg-slate-50/30">
         <ResponsiveContainer width="100%" height="100%">
           <AreaChart data={mockHistoryData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
             <defs>
               <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                 <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
             <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 9, fontFamily: 'JetBrains Mono'}} axisLine={false} tickLine={false} />
             <YAxis tick={{fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748b'}} axisLine={false} tickLine={false} />
             <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(8px)', padding: '6px 10px' }}
                itemStyle={{ color: '#0284c7', fontWeight: 'bold' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
             />
             <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
           </AreaChart>
         </ResponsiveContainer>
      </div>

      {/* AI Prediction Footer */}
      <div className={`p-5 m-3 mt-0 rounded-xl border ${node.prediction.trend === 'degrading' ? 'bg-rose-50/60 border-rose-100/60' : 'bg-emerald-50/60 border-emerald-100/60'} backdrop-blur-md relative overflow-hidden transition-colors duration-500 shadow-sm`}>
         
        <div className="flex items-start gap-3 relative z-10">
          <div className={`p-1.5 rounded-full ${node.prediction.trend === 'degrading' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'} ring-1 ring-inset ring-black/5`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h5 className={`font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 ${node.prediction.trend === 'degrading' ? 'text-rose-700' : 'text-emerald-700'}`}>
              Gemini Forecast: {node.prediction.trend}
              {getTrendIcon(node.prediction.trend)}
            </h5>
            
            <div className="mt-1.5 text-xs text-slate-700 leading-relaxed font-medium min-h-[40px]">
              {loadingForecast ? (
                 <div className="flex items-center gap-2 text-slate-500 opacity-70">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="font-mono">Synthesizing realtime metrics...</span>
                 </div>
              ) : (
                 <span className="animate-in fade-in duration-500">{aiForecast || "Forecast model initializing..."}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;