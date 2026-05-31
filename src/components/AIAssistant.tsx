/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Database, 
  Cpu, 
  RefreshCcw, 
  HelpCircle,
  Flame,
  Zap,
  BookOpen,
  Atom,
  ChevronRight,
  ClipboardCheck,
  Calculator,
  AlertCircle,
  Smile
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export default function AIAssistant({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('chemvibe_ai_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Gagal membaca histori chat AI:", e);
    }
    return [
      {
        role: 'model',
        text: 'Halo! Saya adalah **Asisten Laboratorium Kimia Cerdas AI** Anda di ChemVibe. ☄️\n\nSaya siap membantu Anda memahami konsep kimia eksperimental, menyelesaikan perhitungan stoikiometri, menguraikan rumus ikatan molekul, hingga menganalisis laporan praktikum digital Anda. \n\nSilakan pilih salah satu topik eksplorasi di bawah ini atau ajukan pertanyaan spesifik Anda!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Toolkit Tabs state
  const [activeTab, setActiveTab] = useState<'constants' | 'calculator' | 'prompts'>('prompts');

  // Dilution Calculator state M1 V1 = M2 V2
  const [m1, setM1] = useState<string>('');
  const [v1, setV1] = useState<string>('');
  const [m2, setM2] = useState<string>('');
  const [v2, setV2] = useState<string>('');
  const [calcResult, setCalcResult] = useState<string>('');

  // Persist chat history
  useEffect(() => {
    try {
      localStorage.setItem('chemvibe_ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error("Gagal menyimpan histori chat AI:", e);
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorMsg('');
    const userMsg: ChatMessage = {
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const historyToSend = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await fetch('/api/gemini/chemistry-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text.trim(),
          history: historyToSend
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("Gagal memanggil Asisten AI:", error);
      setErrorMsg(error.message || "Gagal menghubungi asisten virtual. Silakan cek koneksi atau coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat obrolan dengan Asisten AI?")) {
      const defaultState: ChatMessage[] = [
        {
          role: 'model',
          text: 'Halo! Saya adalah **Asisten Laboratorium Kimia Cerdas AI** Anda di ChemVibe. ☄️\n\nSaya siap membantu Anda memahami konsep kimia eksperimental, menyelesaikan perhitungan stoikiometri, menguraikan rumus ikatan molekul, hingga menganalisis laporan praktikum digital Anda. \n\nSilakan pilih salah satu topik eksplorasi di bawah ini atau ajukan pertanyaan spesifik Anda!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(defaultState);
      setErrorMsg('');
    }
  };

  // Dilution calculations
  const calculateDilution = (e: React.FormEvent) => {
    e.preventDefault();
    const parse = (val: string) => val.trim() !== '' ? parseFloat(val) : NaN;
    const nm1 = parse(m1);
    const nv1 = parse(v1);
    const nm2 = parse(m2);
    const nv2 = parse(v2);

    let emptyCount = 0;
    if (isNaN(nm1)) emptyCount++;
    if (isNaN(nv1)) emptyCount++;
    if (isNaN(nm2)) emptyCount++;
    if (isNaN(nv2)) emptyCount++;

    if (emptyCount !== 1) {
      setCalcResult("Kosongkan tepat 1 variabel yang ingin Anda cari nilainya.");
      return;
    }

    if (isNaN(nm1)) {
      // M1 = (M2 * V2) / V1
      const res = (nm2 * nv2) / nv1;
      setCalcResult(`Konsentrasi Awal (M₁) = ${res.toFixed(4)} M`);
    } else if (isNaN(nv1)) {
      // V1 = (M2 * V2) / M1
      const res = (nm2 * nv2) / nm1;
      setCalcResult(`Volume Awal (V₁) = ${res.toFixed(4)} mL`);
    } else if (isNaN(nm2)) {
      // M2 = (M1 * V1) / V2
      const res = (nm1 * nv1) / nv2;
      setCalcResult(`Konsentrasi Akhir (M₂) = ${res.toFixed(4)} M`);
    } else if (isNaN(nv2)) {
      // V2 = (M1 * V1) / M2
      const res = (nm1 * nv1) / nm2;
      setCalcResult(`Volume Akhir (V₂) = ${res.toFixed(4)} mL`);
    }
  };

  const clearDilution = () => {
    setM1('');
    setV1('');
    setM2('');
    setV2('');
    setCalcResult('');
  };

  // Predefined prompts for Indonesian Chemistry Lab
  const PRESET_QUERIES = [
    {
      title: "Geometri Molekul SF₄",
      desc: "Menjelaskan bentuk & hibridisasi belerang tetrafluorida",
      prompt: "Prediksi geometri molekul dan bentuk 3D dari belerang tetrafluorida (SF4) menggunakan landasan teori VSEPR dan hibridisasi!"
    },
    {
      title: "pH Larutan Amonia Buffer",
      desc: "Menghitung derajat keasaman buffer basa",
      prompt: "Bagaimana cara menentukan pH larutan penyangga (buffer) yang dibuat dengan mencampurkan 100 mL larutan NH3 0.1 M (Kb = 1.8e-5) dengan 50 mL NH4Cl 0.1 M? Jelaskan langkah perhitungannya!"
    },
    {
      title: "Kelarutan Ksp AgCl",
      desc: "Efek ion senama pada pengendapan garam",
      prompt: "Bandingkan kelarutan garam AgCl (Ksp AgCl = 1.8e-10) di dalam air murni dengan kelarutannya di dalam larutan NaCl 0.1 M. Jelaskan konsep efek ion senama (common ion effect) yang terjadi!"
    },
    {
      title: "Hukum Elektrolisis Faraday",
      desc: "Berapa gram tembaga yang mengendap?",
      prompt: "Ke dalam larutan CuSO4 dialirkan arus listrik sebesar 5 Ampere selama 30 menit menggunakan elektroda inert. Berapa gram tembaga (Ar Cu = 63.5) yang akan mengendap di katoda sesuai Hukum Faraday I?"
    },
    {
      title: "Kollid Efek Tyndall",
      desc: "Analisis penghamburan berkas cahaya",
      prompt: "Jelaskan mengapa susu atau santan menunjukkan efek Tyndall yang jelas sedangkan larutan gula tidak. Apa perbedaan struktural antara koloid, larutan sejati, dan suspensi kasar?"
    },
    {
      title: "Format Laporan Praktikum",
      desc: "Panduan menyusun jurnal laporan",
      prompt: "Bantu saya menyusun draf outline formal laporan praktikum kimia untuk percobaan 'Titrasi Asam Cuka Perdagangan'. Berikan panduan isi untuk bagian Tujuan, Metode, Analisis Data, dan Kesimpulan."
    }
  ];

  // Helper parser for simple formatting
  const parseMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split by code blocks
    const chunks = text.split(/(```[\s\S]*?```)/g);
    
    const renderInlines = (str: string) => {
      // Find inline code backticks or bold symbols
      const inlineChunks = str.split(/(\*\*.*?\*\*|`.*?`)/g);
      return inlineChunks.map((chunk, idx) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={idx} className="font-extrabold text-teal-300">{chunk.slice(2, -2)}</strong>;
        }
        if (chunk.startsWith('`') && chunk.endsWith('`')) {
          return <code key={idx} className={`px-1.5 py-0.5 rounded font-mono text-xs text-orange-400 border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>{chunk.slice(1, -1)}</code>;
        }
        return chunk;
      });
    };

    return chunks.map((chunk, index) => {
      if (chunk.startsWith('```') && chunk.endsWith('```')) {
        const lines = chunk.split('\n');
        const lang = lines[0].replace('```', '').trim() || 'chemistry';
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={index} className={`my-3 overflow-hidden rounded-xl border ${theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-300 bg-slate-100'}`}>
            <div className={`flex items-center justify-between border-b px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
              <span>{lang} block</span>
              <span className="text-teal-500 animate-pulse">active snippet</span>
            </div>
            <pre className="p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Normal lines processing
      const lines = chunk.split('\n');
      return (
        <div key={index} className="space-y-2 text-xs md:text-sm text-slate-200">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lIdx} className="h-2" />;

            // Headers
            if (trimmed.startsWith('### ')) {
              return <h4 key={lIdx} className="text-sm font-bold text-teal-300 pt-3 flex items-center gap-1.5 font-sans"><Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />{trimmed.slice(4)}</h4>;
            }
            if (trimmed.startsWith('## ')) {
              return <h3 key={lIdx} className="text-base font-extrabold text-teal-400 pt-4 border-b border-slate-800/80 pb-1 mt-2 flex items-center gap-2 font-sans"><Atom className="w-4 h-4 text-teal-500 shrink-0" />{trimmed.slice(3)}</h3>;
            }
            if (trimmed.startsWith('# ')) {
              return <h2 key={lIdx} className="text-lg font-black text-white pt-5 pb-1 flex items-center gap-2 font-sans">{trimmed.slice(2)}</h2>;
            }

            // Unordered bullet
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              return (
                <ul key={lIdx} className="list-disc pl-5 space-y-1 my-1">
                  <li className="marker:text-teal-500">{renderInlines(trimmed.slice(2))}</li>
                </ul>
              );
            }

            // Ordered numerical list
            const numMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
            if (numMatch) {
              return (
                <ol key={lIdx} className="list-decimal pl-5 space-y-1 my-1">
                  <li value={parseInt(numMatch[1])} className="marker:text-teal-500 marker:font-bold">{renderInlines(numMatch[2])}</li>
                </ol>
              );
            }

            return <p key={lIdx} className="leading-relaxed font-sans">{renderInlines(line)}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10" id="ai-smart-chemistry-lab-assistant">
      
      {/* Title block */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center pb-5 border-b border-white/5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-teal-500/15 text-teal-400 border border-teal-500/20 font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              <span>Lab AI Assistant</span>
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight font-sans">Asisten Laboratorium Cerdas ChemVibe</h2>
          </div>
          <p className="text-zinc-400 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Dukung aktivitas pembelajaran sains Anda dengan kecerdasan analitis asisten virtual berbasis model mutakhir Gemini. Formulasikan hipotesis eksperimen, setarakan persamaan kimia, dan pelajari struktur molekuler Anda.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClearHistory}
            className={`px-3.5 py-1.5 border text-xs font-mono font-bold hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}
            title="Bersihkan seluruh riwayat percakapan"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Obrolan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[580px]">
        
        {/* Left Side: Dynamic Chat Panel (8 cols out of 12) */}
        <div className={`lg:col-span-7 xl:col-span-8 flex flex-col border rounded-3xl overflow-hidden shadow-xl min-h-[500px] ${
          theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200'
        }`}>
          {/* Header indicator */}
          <div className={`border-b px-4 py-3 flex items-center justify-between ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <div className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Kecerdasan Buatan Aktif</div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              <span>Gemini 3.5 Flash</span>
            </div>
          </div>

          {/* Messages window screen */}
          <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 max-h-[460px] min-h-[350px]">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3.5 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Profile Icon */}
                <div className={`w-8.5 h-8.5 rounded-xl shrink-0 flex items-center justify-center border font-mono font-black text-xs ${
                  msg.role === 'user' 
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                    : 'bg-zinc-850 border-slate-705 text-amber-400'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-teal-400" /> : <Bot className="w-4 h-4 text-amber-400" />}
                </div>

                {/* Message Bubble box */}
                <div className="space-y-1">
                  <div className={`px-4 py-3 rounded-2xl relative border ${
                    msg.role === 'user' 
                      ? 'bg-teal-600/10 border-teal-500/25 rounded-tr-none' 
                      : 'bg-slate-950/80 border-slate-800 text-slate-100 rounded-tl-none leading-relaxed'
                  }`}>
                    {msg.role === 'model' ? (
                      parseMarkdown(msg.text)
                    ) : (
                      <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    )}
                  </div>
                  <div className={`text-[9px] font-mono text-slate-500 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3.5 max-w-[85%] mr-auto animate-pulse">
                <div className={`w-8.5 h-8.5 rounded-xl shrink-0 border flex items-center justify-center text-amber-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                  <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                </div>
                <div className="space-y-1">
                  <div className={`px-4 py-3 border rounded-2xl rounded-tl-none relative ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-300'}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11px] text-zinc-500 font-mono pl-1.5 leading-none font-bold">Asisten sedang menganalisis reaksi...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner section (if exists) */}
          {errorMsg && (
            <div className="bg-red-500/10 border-y border-red-500/20 px-4 py-2.5 flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <p className="leading-normal font-sans font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Form write input message */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }} 
            className={`p-3 border-t flex gap-2 ${theme === 'dark' ? 'border-slate-800/85 bg-slate-950/55' : 'border-slate-300 bg-slate-100/55'}`}
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Tanyakan rumus senyawa, stoikiometri, atau analisis praktikum Anda..."
              className={`flex-1 border text-xs md:text-sm placeholder-zinc-550 pl-4 pr-3 py-3 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 font-sans ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-teal-500/10 flex items-center justify-center cursor-pointer hover:brightness-110 active:scale-95 duration-100 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Side: Tabbed Lab Toolkit Drawer Panel (4 cols out of 12) */}
        <div className={`lg:col-span-5 xl:col-span-4 flex flex-col border rounded-3xl overflow-hidden shadow-xl min-h-[500px] ${
          theme === 'dark' ? 'bg-slate-900/25 border-slate-800/60' : 'bg-white border-slate-200'
        }`}>
          
          {/* Tab Selection Header buttons */}
          <div className={`grid grid-cols-3 border-b text-center text-xs font-bold select-none cursor-pointer ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === 'prompts' 
                  ? 'text-teal-400 border-b-2 border-teal-500 bg-slate-950/30' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Prompt Lab</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === 'calculator' 
                  ? 'text-teal-400 border-b-2 border-teal-500 bg-slate-950/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Kalkulasi</span>
            </button>
            <button
              onClick={() => setActiveTab('constants')}
              className={`py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === 'constants' 
                  ? 'text-teal-400 border-b-2 border-teal-500 bg-slate-950/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Konstanta</span>
            </button>
          </div>

          <div className="flex-1 p-4 md:p-5 overflow-y-auto max-h-[530px]">
            
            {/* TAB: Prompts Lab template list */}
            {activeTab === 'prompts' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="pb-2 border-b border-slate-800/50">
                  <h4 className="text-xs font-extrabold text-white">Topik Eksplorasi Cepat</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">Gunakan templat prompt di bawah untuk memicu analisis mendalam dari asisten virtual.</p>
                </div>

                <div className="space-y-2.5">
                  {PRESET_QUERIES.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(preset.prompt)}
                      disabled={isLoading}
                      className={`w-full text-left p-3 rounded-2xl border hover:border-teal-500/40 hover:bg-teal-500/2 active:scale-[0.99] transition-all cursor-pointer block group duration-100 disabled:opacity-40 disabled:pointer-events-none ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-teal-300 group-hover:text-teal-200 font-sans">{preset.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 lines-clamp-2 md:line-clamp-none font-sans leading-relaxed">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Chemistry Dilution Solver Calculator helper */}
            {activeTab === 'calculator' && (
              <div className="space-y-4 animate-fade-in">
                <div className="pb-2 border-b border-slate-800/50">
                  <h4 className="text-xs font-extrabold text-white">Kalkulator Pengenceran Larutan</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">Selesaikan hukum pengenceran molar murni M₁ · V₁ = M₂ · V₂ secara akurat.</p>
                </div>

                <form onSubmit={calculateDilution} className="space-y-3 text-xs">
                  <div className={`border p-3.5 rounded-2xl flex flex-wrap justify-center gap-2 font-mono text-[10.5px] ${theme === 'dark' ? 'bg-slate-950/65 border-slate-850 text-slate-400' : 'bg-slate-100/65 border-slate-300 text-slate-600'}`}>
                    <span className="text-teal-400">M₁</span> · <span className="text-teal-400">V₁</span> = <span className="text-teal-400">M₂</span> · <span className="text-teal-400">V₂</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-mono tracking-wider font-bold uppercase text-[9px]">M₁ (Konsentrasi Awal - M)</label>
                      <input
                        type="number"
                        step="any"
                        value={m1}
                        onChange={(e) => setM1(e.target.value)}
                        placeholder="Cari M₁ (kosongkan)"
                        className={`w-full border rounded-xl p-2 focus:outline-none focus:border-teal-500 placeholder-zinc-700 ${theme === 'dark' ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-mono tracking-wider font-bold uppercase text-[9px]">V₁ (Volume Awal - mL)</label>
                      <input
                        type="number"
                        step="any"
                        value={v1}
                        onChange={(e) => setV1(e.target.value)}
                        placeholder="Cari V₁ (kosongkan)"
                        className={`w-full border rounded-xl p-2 focus:outline-none focus:border-teal-500 placeholder-zinc-700 ${theme === 'dark' ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-mono tracking-wider font-bold uppercase text-[9px]">M₂ (Konsentrasi Akhir - M)</label>
                      <input
                        type="number"
                        step="any"
                        value={m2}
                        onChange={(e) => setM2(e.target.value)}
                        placeholder="Cari M₂ (kosongkan)"
                        className={`w-full border rounded-xl p-2 focus:outline-none focus:border-teal-500 placeholder-zinc-700 ${theme === 'dark' ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-mono tracking-wider font-bold uppercase text-[9px]">V₂ (Volume Akhir - mL)</label>
                      <input
                        type="number"
                        step="any"
                        value={v2}
                        onChange={(e) => setV2(e.target.value)}
                        placeholder="Cari V₂ (kosongkan)"
                        className={`w-full border rounded-xl p-2 focus:outline-none focus:border-teal-500 placeholder-zinc-700 ${theme === 'dark' ? 'bg-slate-950 border-slate-850 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={clearDilution}
                      className={`flex-1 py-2 border text-zinc-300 font-bold rounded-xl cursor-pointer hover:bg-slate-850 active:scale-95 transition-all font-mono text-[10px] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}
                    >
                      Reset Formulir
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 font-bold rounded-xl text-slate-950 shadow-md shadow-teal-500/10 cursor-pointer active:scale-95 transition-all text-[11px]"
                    >
                      Hitung Parameter
                    </button>
                  </div>

                  {calcResult && (
                    <div className={`border border-teal-500/30 p-3 rounded-2xl animate-fade-in flex items-center gap-2 text-xs text-teal-300 font-bold font-mono ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                      <ClipboardCheck className="w-4.5 h-4.5 text-teal-400 shrink-0" />
                      <span>{calcResult}</span>
                    </div>
                  )}
                </form>

                {/* Balance assistant hint block */}
                <div className={`mt-5 p-4 rounded-2xl space-y-2 border ${
                  theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h5 className={`text-[11px] font-bold flex items-center gap-1.5 leading-none ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Butuh Penyetaraan Reaksi?</span>
                  </h5>
                  <p className={`text-[10px] leading-relaxed font-sans ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Asisten AI kami sangat pakar menyetarakan reaksi redoks atau reaksi stoiko kompleks. Cukup copy format ini dan diskusikan di samping:
                  </p>
                  <div className={`p-2 rounded-xl font-mono text-[9px] border flex justify-between items-center mt-1 ${
                    theme === 'dark' ? 'bg-slate-950 text-teal-400 border-slate-900' : 'bg-slate-100 text-teal-700 border-slate-200'
                  }`}>
                    <span>"Setarakan reaksi: Fe2+ + MnO4- =&gt; Fe3+ + Mn2+"</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Chemistry standards Constants Reference table */}
            {activeTab === 'constants' && (
              <div className="space-y-4 animate-fade-in">
                <div className="pb-2 border-b border-slate-800/50">
                  <h4 className="text-xs font-extrabold text-white">Daftar Konstanta &amp; Tabel Referensi</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">Referensi konstanta fisik dan konstanta kimia penting untuk kemudahan pengerjaan teori.</p>
                </div>

                <div className="space-y-3 font-mono text-[10.5px]">
                  
                  {/* Item card list */}
                  <div className={`border p-3 rounded-2xl flex justify-between items-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                    <div>
                      <div className="text-[9.5px] text-zinc-500 uppercase leading-none font-bold">Tetapan Gas Ideal (R)</div>
                      <div className="text-slate-100 mt-1 font-bold">0.08206 L · atm / mol · K</div>
                    </div>
                    <span className="text-[10px] text-teal-400 font-bold bg-teal-500/5 px-2 py-0.5 rounded-lg border border-teal-500/10">8.314 J/mol·K</span>
                  </div>

                  <div className={`border p-3 rounded-2xl flex justify-between items-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                    <div>
                      <div className="text-[9.5px] text-zinc-500 uppercase leading-none font-bold">Tetapan Faraday (F)</div>
                      <div className="text-slate-100 mt-1 font-bold">96,485 C / mol elektron</div>
                    </div>
                    <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded-lg border border-indigo-500/10">9.65e4</span>
                  </div>

                  <div className={`border p-3 rounded-2xl flex justify-between items-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                    <div>
                      <div className="text-[9.5px] text-zinc-500 uppercase leading-none font-bold">Bilangan Avogadro (Nₐ)</div>
                      <div className="text-slate-100 mt-1 font-bold">6.022 × 10²³ partikel/mol</div>
                    </div>
                    <span className="text-[9px] text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded-lg border border-amber-500/10">N_A</span>
                  </div>

                  <div className={`border p-3 rounded-2xl flex justify-between items-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                    <div>
                      <div className="text-[9.5px] text-zinc-500 uppercase leading-none font-bold">Hasil Kali Ion Air (K_w)</div>
                      <div className="text-slate-100 mt-1 font-bold">1.0 × 10⁻¹⁴ (pada 25°C)</div>
                    </div>
                    <span className="text-[9px] text-rose-400 font-bold bg-rose-500/5 px-2 py-0.5 rounded-lg border border-rose-500/10">pH 7</span>
                  </div>

                  <div className={`border p-3 rounded-2xl flex justify-between items-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                    <div>
                      <div className="text-[9.5px] text-zinc-500 uppercase leading-none font-bold">Konstanta Planck (h)</div>
                      <div className="text-slate-100 mt-1 font-bold">6.626 × 10⁻³⁴ J · s</div>
                    </div>
                    <span className="text-[9px] text-teal-400 font-bold bg-teal-500/5 px-2 py-0.5 rounded-lg border border-teal-500/10">Quantum</span>
                  </div>

                </div>

                <div className={`p-3.5 border rounded-2xl space-y-1.5 font-sans ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                  <h4 className="text-[11px] font-bold text-white flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Petunjuk Penggunaan Konstanta</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Gunakan konstanta di atas ketika menghitung hukum gas ideal (pV=nRT), perhitungan pengendapan Faraday, termodinamika entalpi ΔG/ΔH, atau energi radiasi elektro-magnetik foton $E=h\nu$.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
