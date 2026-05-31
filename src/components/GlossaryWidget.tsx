import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, X, Info, Sparkles, AlertCircle, Bookmark } from 'lucide-react';
import { GLOSSARY_MAP, GlossaryItem } from './GlossaryData';

interface GlossaryWidgetProps {
  activeView: string;
}

// Maps activeView key to reader-friendly indonesian category names
const LAB_NAMES: Record<string, string> = {
  'periodic-table': 'Tabel Periodik Unsur',
  'atom-builder': 'Lab Atom Bohr',
  'bonding-lab': 'Ikatan Kimia',
  'geometry': 'Geometri Molekul',
  'stoichiometry': 'Kalkulator Stoikiometri',
  'titration': 'Titrasi Asam-Basa',
  'volta-lab': 'Sel Volta & Deret Nernst',
  'kinetics-lab': 'Kinetika & Laju Reaksi',
  'equilibrium-lab': 'Kesetimbangan Kimia',
  'thermochemistry-lab': 'Termokimia & Kalor',
  'colligative-lab': 'Sifat Koligatif Larutan',
  'colloid-lab': 'Sistem Kolid & Tyndall',
  'electrolysis-lab': 'Sel Elektrolisis Hukum Faraday',
  'flame-test-lab': 'Uji Nyala Spektrum Emisi',
  'buffer-hydrolysis-lab': 'Penyangga & Hidrolisis',
  'solubility-ksp-lab': 'Kelarutan & Hasil Kali Ksp',
  'organic-lab': 'Kimia Organik & Gugus Fungsi',
  'macromolecule-lab': 'Makromolekul & Polimer'
};

export default function GlossaryWidget({ activeView }: GlossaryWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');

  // Verify if current view supports a specific glossary
  const isLabView = activeView in GLOSSARY_MAP;

  // Auto switch tab when view changes or when search query is entered
  useEffect(() => {
    if (!isLabView) {
      setActiveTab('all');
    } else {
      setActiveTab('current');
    }
  }, [activeView, isLabView]);

  // Handle key listeners for escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered definitions
  const currentTerms = useMemo(() => {
    return GLOSSARY_MAP[activeView] || [];
  }, [activeView]);

  const allTerms = useMemo(() => {
    const list: (GlossaryItem & { originalLab: string })[] = [];
    Object.entries(GLOSSARY_MAP).forEach(([labKey, items]) => {
      items.forEach((item) => {
        list.push({
          ...item,
          originalLab: LAB_NAMES[labKey] || labKey
        });
      });
    });
    return list;
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return activeTab === 'current' ? currentTerms : allTerms;
    }

    if (activeTab === 'current') {
      return currentTerms.filter(
        item => item.term.toLowerCase().includes(query) || item.definition.toLowerCase().includes(query)
      );
    } else {
      return allTerms.filter(
        item => item.term.toLowerCase().includes(query) || item.definition.toLowerCase().includes(query) || item.originalLab.toLowerCase().includes(query)
      );
    }
  }, [searchQuery, activeTab, currentTerms, allTerms]);

  // Render nothing if not in a designated simulator or dashboard view
  const isAllowedView = isLabView || activeView === 'dashboard';
  if (!isAllowedView) return null;

  return (
    <>
      {/* Floating Glossary Button */}
      <div 
        id="unique-glossary-launcher"
        className="fixed bottom-24 left-6 lg:bottom-12 lg:left-10 z-40 pointer-events-auto"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-2 px-4.5 py-3 rounded-full bg-slate-900 border border-slate-800 text-teal-400 font-sans text-xs font-bold transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer hover:border-teal-500/30 group"
          aria-label="Buka Glosarium Istilah Kimia"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-indigo-550/10 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
          <BookOpen className="w-4.5 h-4.5 text-teal-400 group-hover:rotate-6 transition-transform duration-200" />
          <span className="hidden sm:inline font-mono tracking-wide text-teal-300">GLOSARIUM</span>
          {isLabView && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          )}
        </button>
      </div>

      {/* Glossary Drawer / Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop Blur Overlay */}
            <motion:div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Sidebar Slider Draw Panel */}
            <motion:div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 23, stiffness: 220 }}
              className="relative w-full max-w-lg bg-slate-955 border-l border-slate-850 h-full flex flex-col shadow-2xl relative z-10 overflow-hidden"
              id="unique-glossary-panel"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-500 via-sky-400 to-indigo-500" />

              {/* Header Box */}
              <div className="p-5 border-b border-slate-900 bg-slate-950/80 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-505/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      Glosarium Sains
                      <Sparkles className="w-3.5 h-3.5 text-yellow-405" />
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-tight">Dokumentasi & Ensiklopedia Istilah Terpadu</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  aria-label="Tutup Glosarium"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Selector Segment */}
              <div className="px-5 pt-3.5 pb-2.5 bg-slate-950/30 flex items-center justify-between border-b border-slate-900 select-none">
                <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-900">
                  {isLabView && (
                    <button
                      onClick={() => setActiveTab('current')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        activeTab === 'current'
                          ? 'bg-teal-500 text-slate-950 shadow-md'
                          : 'text-slate-405 hover:text-white hover:bg-slate-950/40'
                      }`}
                    >
                      Lab Aktif
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-teal-500 text-slate-950 shadow-md'
                        : 'text-slate-405 hover:text-white hover:bg-slate-950/40'
                    }`}
                  >
                    Semua Istilah ({allTerms.length})
                  </button>
                </div>

                {isLabView && activeTab === 'current' && (
                  <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 max-w-[180px] truncate">
                    {LAB_NAMES[activeView] || activeView}
                  </span>
                )}
              </div>

              {/* Live Search Input Section */}
              <div className="p-4 bg-slate-950/40 border-b border-slate-900">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      activeTab === 'current'
                        ? "Cari istilah di modul lab aktif..."
                        : "Cari ribuan istilah di seantero ChemVibe..."
                    }
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Definitions Scrollable list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="group bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850 hover:border-slate-750 p-4.5 rounded-2xl transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-[13px] font-black text-white font-mono tracking-tight group-hover:text-teal-300 transition-colors">
                          {item.term}
                        </h4>
                        
                        {'originalLab' in item && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300">
                            {item.originalLab}
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                        {item.definition}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                      <AlertCircle className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-350">Tidak ada istilah ditemukan</h5>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed mt-1">
                        Coba bersihkan kata kunci pencarian Anda atau pindah ke tab "Semua Istilah" untuk cakupan kata kunci kimia yang lebih masif.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Educational Tip Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-900 text-[10px] text-slate-400 flex items-start gap-2 max-h-24 select-none shrink-0">
                <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Tips Belajar:</strong> Glosarium bersifat dinamis! Saat menjelajah simulator yang berbeda, glosarium di tab utama akan beralih mempelajari konsep dasar topik praktikum terkait secara otomatis.
                </div>
              </div>
            </motion:div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
