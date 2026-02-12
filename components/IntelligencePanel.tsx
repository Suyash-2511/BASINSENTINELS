import React, { useState, useEffect } from 'react';
import { Camera, Search, Sparkles, AlertTriangle, Upload, ChevronRight, Terminal, Globe, Cpu, Loader2, ArrowRight, FileText, Download, Printer, Users, Eye, Radio } from 'lucide-react';
import { analyzeWaterImage, fetchBasinIntelligence, analyzeCrowdImage, fetchCrowdIntelligence } from '../services/geminiService';

interface IntelligencePanelProps {
  activeModule: 'water' | 'crowd';
}

const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ activeModule }) => {
  const [loading, setLoading] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'vision' | 'search'>('vision');

  // Reset state when module changes
  useEffect(() => {
    setSelectedImage(null);
    setImageResult(null);
    setSearchResult(null);
    setMode('vision');
  }, [activeModule]);

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

        let result = '';
        if (activeModule === 'water') {
            result = await analyzeWaterImage(base64Data, mimeType);
        } else {
            result = await analyzeCrowdImage(base64Data, mimeType);
        }
        
        setImageResult(result);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefreshIntelligence = async () => {
    setLoading(true);
    setMode('search');
    let result = '';
    if (activeModule === 'water') {
        result = await fetchBasinIntelligence();
    } else {
        result = await fetchCrowdIntelligence();
    }
    setSearchResult(result);
    setLoading(false);
  };

  const handleExportPDF = () => {
    if (!selectedImage || !imageResult) return;

    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      const now = new Date().toLocaleString();
      const content = `
        <html>
          <head>
            <title>Basin Sentinels - Diagnostic Report</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; -webkit-print-color-adjust: exact; }
              .header { border-bottom: 2px solid ${activeModule === 'water' ? '#0ea5e9' : '#10b981'}; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
              .brand { font-size: 24px; font-weight: bold; color: #0f172a; letter-spacing: -0.5px; }
              .brand span { color: ${activeModule === 'water' ? '#0ea5e9' : '#10b981'}; }
              .meta { text-align: right; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748b; }
              .image-container { margin-bottom: 30px; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center; background: #f8fafc; }
              .image-container img { max-height: 400px; max-width: 100%; object-fit: contain; }
              .report-body { background: #fff; line-height: 1.6; }
              .section-title { 
                  color: #0f172a; 
                  font-weight: bold; 
                  margin-top: 24px; 
                  margin-bottom: 8px;
                  font-size: 14px; 
                  text-transform: uppercase; 
                  letter-spacing: 0.05em; 
                  border-left: 3px solid ${activeModule === 'water' ? '#0ea5e9' : '#10b981'}; 
                  padding-left: 10px; 
                  background: ${activeModule === 'water' ? '#f0f9ff' : '#ecfdf5'};
                  padding-top: 4px;
                  padding-bottom: 4px;
              }
              p { margin-bottom: 12px; font-size: 14px; color: #334155; }
              .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; text-align: center; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="brand">BASIN<span>SENTINELS</span></div>
              <div class="meta">
                REPORT ID: #${Math.floor(Math.random() * 100000)}<br/>
                GENERATED: ${now}<br/>
                MODULE: ${activeModule === 'water' ? 'WATER QUALITY VISION' : 'CROWD SURVEILLANCE VISION'}
              </div>
            </div>
            
            <div class="image-container">
               <img src="${selectedImage}" />
            </div>

            <div class="report-body">
              ${imageResult.split('\n').map(line => {
                if (line.trim().startsWith('**')) {
                   return `<div class="section-title">${line.replace(/\*\*/g, '').replace(/:/g, '')}</div>`;
                }
                if (line.trim().length === 0) return '';
                return `<p>${line.replace(/\*\*/g, '')}</p>`;
              }).join('')}
            </div>

            <div class="footer">
              Generated by Basin Sentinels AI Diagnostic Engine. <br/>
              This is an automated assessment and should be verified by field personnel.
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const renderAnalysisText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const isHeader = line.trim().startsWith('**');
      if (isHeader) {
        return (
          <h5 key={i} className={`font-bold mt-5 mb-2 uppercase text-[10px] tracking-widest border-l-2 pl-3 py-1 rounded-r ${activeModule === 'water' ? 'text-cyan-800 border-cyan-500 bg-cyan-50/50' : 'text-emerald-800 border-emerald-500 bg-emerald-50/50'}`}>
            {line.replace(/\*\*/g, '')}
          </h5>
        );
      }
      if (line.trim().length === 0) return <br key={i}/>;
      return (
        <p key={i} className="mb-2 text-slate-700 pl-3 text-[11px] leading-relaxed font-medium">
          {line.replace(/\*\*/g, '')}
        </p>
      );
    });
  };

  // Theme Constants
  const themeColor = activeModule === 'water' ? 'cyan' : 'emerald';
  const themeSecondary = activeModule === 'water' ? 'violet' : 'amber';

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] shadow-xl bg-white/60 backdrop-blur-xl border border-white/50">
      
      {/* Sidebar / Controls */}
      <div className="md:w-72 bg-slate-50/40 border-r border-slate-100/50 flex flex-col backdrop-blur-md">
        <div className="p-6 border-b border-slate-100/50">
           <div className={`flex items-center gap-2.5 mb-1 ${activeModule === 'water' ? 'text-cyan-600' : 'text-emerald-600'}`}>
             <div className="p-1.5 rounded bg-white/80 border border-slate-200 shadow-sm backdrop-blur-sm">
                <Terminal className="w-4 h-4" />
             </div>
             <span className="font-display font-bold text-lg tracking-wide text-slate-900">
                {activeModule === 'water' ? 'WATER COMMAND' : 'CROWD COMMAND'}
             </span>
           </div>
           <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest pl-10">Gemini 3 Pro Active</p>
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1">
          <button 
            onClick={() => setMode('vision')}
            className={`text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${mode === 'vision' ? `bg-white/80 border-${themeColor}-200 shadow-sm ring-1 ring-${themeColor}-50 backdrop-blur-sm` : 'border-transparent hover:bg-white/40 hover:border-slate-200'}`}
          >
            <div className={`p-2 rounded-lg ${mode === 'vision' ? `bg-${themeColor}-500 text-white shadow-md shadow-${themeColor}-500/20` : 'bg-slate-200/50 text-slate-500 group-hover:text-slate-700'}`}>
              {activeModule === 'water' ? <Camera className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-bold ${mode === 'vision' ? 'text-slate-900' : 'text-slate-500'}`}>
                 {activeModule === 'water' ? 'Visual Diagnostic' : 'Crowd Vision'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                 {activeModule === 'water' ? 'Quality Analysis' : 'Surveillance Scan'}
              </div>
            </div>
            {mode === 'vision' && <ChevronRight className={`w-4 h-4 text-${themeColor}-500`} />}
          </button>

          <button 
            onClick={() => { setMode('search'); handleRefreshIntelligence(); }}
            className={`text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${mode === 'search' ? `bg-white/80 border-${themeSecondary}-200 shadow-sm ring-1 ring-${themeSecondary}-50 backdrop-blur-sm` : 'border-transparent hover:bg-white/40 hover:border-slate-200'}`}
          >
             <div className={`p-2 rounded-lg ${mode === 'search' ? `bg-${themeSecondary}-500 text-white shadow-md shadow-${themeSecondary}-500/20` : 'bg-slate-200/50 text-slate-500 group-hover:text-slate-700'}`}>
              {activeModule === 'water' ? <Globe className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-bold ${mode === 'search' ? 'text-slate-900' : 'text-slate-500'}`}>
                  {activeModule === 'water' ? 'Basin Intel' : 'Event Monitor'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Live Event Scan</div>
            </div>
            {mode === 'search' && <ChevronRight className={`w-4 h-4 text-${themeSecondary}-500`} />}
          </button>
        </div>

        <div className="p-6 border-t border-slate-100/50 bg-slate-50/40">
           <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase mb-2">
              <span>System Latency</span>
              <span className="text-emerald-600 font-bold">24ms</span>
           </div>
           <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[60%] animate-pulse"></div>
           </div>
           <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400 font-mono">
              <Cpu className="w-3 h-3" /> Processing Node: APAC-South1
           </div>
        </div>
      </div>

      {/* Output Area */}
      <div className="flex-1 p-0 relative bg-white/30 flex flex-col backdrop-blur-sm">
        
        {/* Decorative Header */}
        <div className="h-10 border-b border-slate-100/50 flex items-center px-4 justify-between bg-white/20">
           <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
           </div>
           <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Output Stream
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://patterns.ibrahimcesar.cloud/bg-grid.png')] opacity-[0.03] pointer-events-none invert"></div>

          {mode === 'vision' && (
            <div className="h-full flex flex-col gap-6">
               <div className={`flex-1 border-2 border-dashed border-slate-200/80 rounded-xl bg-white/40 relative group hover:border-${themeColor}-300 hover:bg-${themeColor}-50/20 transition-all backdrop-blur-sm`}>
                  {!selectedImage ? (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                      <div className={`w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-200 group-hover:border-${themeColor}-400 shadow-sm backdrop-blur-sm`}>
                        <Upload className={`w-6 h-6 text-slate-400 group-hover:text-${themeColor}-500 transition-colors`} />
                      </div>
                      <span className="text-slate-700 font-display font-bold text-sm tracking-wide">
                        {activeModule === 'water' ? 'UPLOAD SENSOR FEED' : 'UPLOAD DRONE FEED'}
                      </span>
                      <span className="text-slate-400 text-xs mt-2 font-mono">Supports: JPEG, PNG • Max: 5MB</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col lg:flex-row gap-6">
                       {/* Image Preview */}
                       <div className="lg:w-1/2 relative rounded-lg overflow-hidden border border-slate-200 shadow-sm group/img bg-white/50">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={selectedImage} alt="Analysis Target" className="w-full h-full object-contain bg-slate-50/50" />
                          {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col gap-3">
                              <Loader2 className={`w-10 h-10 text-${themeColor}-600 animate-spin`} />
                              <span className={`text-xs font-mono text-${themeColor}-700 animate-pulse`}>Processing Neural Layers...</span>
                            </div>
                          )}
                          {!loading && (
                             <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur border border-white/20">
                                    Source: Upload
                                </span>
                             </div>
                          )}
                       </div>
                       
                       {/* Analysis Text */}
                       <div className="lg:w-1/2 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-3">
                             <h4 className={`text-${themeColor}-700 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2`}>
                                <Sparkles className="w-3 h-3" /> Diagnostic Report
                             </h4>
                             
                             {imageResult && !loading && (
                                <button 
                                  onClick={handleExportPDF}
                                  className={`text-[10px] flex items-center gap-1.5 text-slate-600 hover:text-${themeColor}-600 font-bold bg-white/80 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:border-${themeColor}-300 transition-all hover:shadow-md active:scale-95 backdrop-blur-sm`}
                                >
                                   <Printer className="w-3 h-3" /> EXPORT PDF
                                </button>
                             )}
                          </div>

                          <div className="flex-1 bg-white/60 p-4 rounded-xl border border-slate-200/80 overflow-y-auto font-mono text-xs text-slate-700 shadow-inner leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent backdrop-blur-sm">
                             {imageResult ? (
                               renderAnalysisText(imageResult)
                             ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                   <p>Waiting for analysis...</p>
                                </div>
                             )}
                          </div>
                          
                          <button onClick={() => setSelectedImage(null)} className="mt-4 text-xs font-mono text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 py-2 border border-slate-200/50 rounded-lg hover:bg-slate-50/50 transition-colors">
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
                <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200/80 p-6 flex-1 font-mono text-sm text-slate-700 overflow-y-auto shadow-inner scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50">
                       <div className={`w-2 h-2 rounded-full bg-${themeSecondary}-500 animate-pulse`}></div>
                       <span className={`text-${themeSecondary}-700 font-bold uppercase tracking-wider`}>Live Intelligence Feed</span>
                       <span className="ml-auto text-xs text-slate-400">{new Date().toLocaleTimeString()}</span>
                    </div>
                    
                    {loading ? (
                      <div className="space-y-4">
                         {[1, 2, 3].map(i => (
                             <div key={i} className="flex gap-3">
                                <div className="mt-1"><Loader2 className={`w-3 h-3 text-${themeSecondary}-500 animate-spin`} /></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-2 bg-slate-200/50 rounded w-full animate-pulse"></div>
                                    <div className="h-2 bg-slate-200/50 rounded w-5/6 animate-pulse"></div>
                                </div>
                             </div>
                         ))}
                      </div>
                    ) : searchResult ? (
                      <div className="prose prose-sm max-w-none text-slate-700">
                         <div className="whitespace-pre-wrap leading-7">
                            {searchResult}
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                         <Search className="w-10 h-10 mb-3 opacity-20" />
                         <p className="uppercase tracking-widest text-xs">Awaiting Query Command</p>
                      </div>
                    )}
                </div>
                {searchResult && (
                   <div className="mt-4 flex justify-end">
                      <button onClick={handleRefreshIntelligence} className={`text-xs font-mono text-${themeSecondary}-600 hover:text-${themeSecondary}-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-${themeSecondary}-50/50 transition-colors`}>
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