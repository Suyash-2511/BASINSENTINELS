import React, { useState } from 'react';
import { Camera, Search, Sparkles, AlertTriangle, Upload, ChevronRight, Terminal, Globe, Cpu, Loader2, ArrowRight } from 'lucide-react';
import { analyzeWaterImage, fetchBasinIntelligence } from '../services/geminiService';

const IntelligencePanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'vision' | 'search'>('vision');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        
        // Extract base64 data (remove prefix)
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        const result = await analyzeWaterImage(base64Data, mimeType);
        setImageResult(result);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefreshIntelligence = async () => {
    setLoading(true);
    setMode('search');
    const result = await fetchBasinIntelligence();
    setSearchResult(result);
    setLoading(false);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] border border-midnight-800 shadow-2xl">
      
      {/* Sidebar / Controls */}
      <div className="md:w-72 bg-midnight-900 border-r border-midnight-800 flex flex-col">
        <div className="p-6 border-b border-midnight-800">
           <div className="flex items-center gap-2.5 text-cyan-400 mb-1">
             <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                <Terminal className="w-4 h-4" />
             </div>
             <span className="font-display font-bold text-lg tracking-wide text-white">AI COMMAND</span>
           </div>
           <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest pl-10">Gemini 3 Pro Active</p>
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1">
          <button 
            onClick={() => setMode('vision')}
            className={`text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${mode === 'vision' ? 'bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.05)]' : 'border-transparent hover:bg-white/5 hover:border-white/5'}`}
          >
            <div className={`p-2 rounded-lg ${mode === 'vision' ? 'bg-cyan-500 text-midnight-950' : 'bg-midnight-800 text-slate-400 group-hover:text-white'}`}>
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-bold ${mode === 'vision' ? 'text-white' : 'text-slate-300'}`}>Visual Diagnostic</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Computer Vision</div>
            </div>
            {mode === 'vision' && <ChevronRight className="w-4 h-4 text-cyan-500 animate-pulse" />}
          </button>

          <button 
            onClick={() => { setMode('search'); handleRefreshIntelligence(); }}
            className={`text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${mode === 'search' ? 'bg-violet-500/5 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.05)]' : 'border-transparent hover:bg-white/5 hover:border-white/5'}`}
          >
             <div className={`p-2 rounded-lg ${mode === 'search' ? 'bg-violet-500 text-white' : 'bg-midnight-800 text-slate-400 group-hover:text-white'}`}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-bold ${mode === 'search' ? 'text-white' : 'text-slate-300'}`}>Basin Intel</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Live Event Scan</div>
            </div>
            {mode === 'search' && <ChevronRight className="w-4 h-4 text-violet-500 animate-pulse" />}
          </button>
        </div>

        <div className="p-6 border-t border-midnight-800 bg-midnight-950/30">
           <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase mb-2">
              <span>System Latency</span>
              <span className="text-emerald-400">24ms</span>
           </div>
           <div className="w-full h-1 bg-midnight-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[60%] animate-pulse"></div>
           </div>
           <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400 font-mono">
              <Cpu className="w-3 h-3" /> Processing Node: APAC-South1
           </div>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 p-0 relative bg-midnight-950/80 flex flex-col">
        
        {/* Decorative Header */}
        <div className="h-10 border-b border-midnight-800 flex items-center px-4 justify-between bg-midnight-900/50">
           <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
           </div>
           <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Output Stream
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://patterns.ibrahimcesar.cloud/bg-grid.png')] opacity-[0.03] pointer-events-none"></div>

          {mode === 'vision' && (
            <div className="h-full flex flex-col gap-6">
               <div className="flex-1 border-2 border-dashed border-midnight-800 rounded-xl bg-midnight-900/30 relative group hover:border-cyan-500/20 hover:bg-midnight-900/50 transition-all">
                  {!selectedImage ? (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-midnight-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-midnight-700 group-hover:border-cyan-500/50 shadow-lg">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <span className="text-slate-300 font-display font-bold text-sm tracking-wide">UPLOAD SENSOR FEED</span>
                      <span className="text-slate-500 text-xs mt-2 font-mono">Supports: JPEG, PNG • Max: 5MB</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col lg:flex-row gap-6">
                       {/* Image Preview */}
                       <div className="lg:w-1/2 relative rounded-lg overflow-hidden border border-slate-700 shadow-xl">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={selectedImage} alt="Analysis Target" className="w-full h-full object-cover" />
                          {loading && (
                            <div className="absolute inset-0 bg-midnight-950/60 backdrop-blur-sm flex items-center justify-center flex-col gap-3">
                              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                              <span className="text-xs font-mono text-cyan-400 animate-pulse">Processing Neural Layers...</span>
                            </div>
                          )}
                       </div>
                       {/* Analysis Text */}
                       <div className="lg:w-1/2 flex flex-col">
                          <h4 className="text-cyan-400 font-mono text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                             <Sparkles className="w-3 h-3" /> Diagnostic Report
                          </h4>
                          <div className="flex-1 bg-midnight-950 p-4 rounded-lg border border-slate-800 overflow-y-auto font-mono text-xs text-slate-300 shadow-inner leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                             {imageResult ? (
                               imageResult.split('\n').map((line, i) => (
                                 <p key={i} className={`mb-2 ${line.startsWith('**') || line.includes(':') ? 'text-cyan-100 font-bold' : ''}`}>
                                   {line}
                                 </p>
                               ))
                             ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                   <p>Waiting for analysis...</p>
                                </div>
                             )}
                          </div>
                          <button onClick={() => setSelectedImage(null)} className="mt-4 text-xs font-mono text-slate-500 hover:text-white flex items-center justify-center gap-2 py-2 border border-slate-800 rounded hover:bg-slate-800 transition-colors">
                             Reset Module
                          </button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}

          {mode === 'search' && (
             <div className="h-full flex flex-col">
                <div className="bg-midnight-950 rounded-xl border border-midnight-800 p-6 flex-1 font-mono text-sm text-slate-300 overflow-y-auto shadow-inner scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
                       <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                       <span className="text-violet-300 font-bold uppercase tracking-wider">Live Intelligence Feed</span>
                       <span className="ml-auto text-xs text-slate-600">{new Date().toLocaleTimeString()}</span>
                    </div>
                    
                    {loading ? (
                      <div className="space-y-4">
                         {[1, 2, 3].map(i => (
                             <div key={i} className="flex gap-3">
                                <div className="mt-1"><Loader2 className="w-3 h-3 text-violet-500 animate-spin" /></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-2 bg-slate-800 rounded w-full animate-pulse"></div>
                                    <div className="h-2 bg-slate-800 rounded w-5/6 animate-pulse"></div>
                                </div>
                             </div>
                         ))}
                      </div>
                    ) : searchResult ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                         <div className="whitespace-pre-wrap leading-7 text-slate-300">
                            {searchResult}
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                         <Search className="w-10 h-10 mb-3 opacity-20" />
                         <p className="uppercase tracking-widest text-xs">Awaiting Query Command</p>
                      </div>
                    )}
                </div>
                {searchResult && (
                   <div className="mt-4 flex justify-end">
                      <button onClick={handleRefreshIntelligence} className="text-xs font-mono text-violet-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-violet-500/10 transition-colors">
                         REFRESH SCAN <ArrowRight className="w-3 h-3" />
                      </button>
                   </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelligencePanel;