/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ELEMENTS_DATA } from '../data';
import { ChemicalElement, ElementCategory, UserAccount } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  BookOpen, 
  Info, 
  ShieldAlert, 
  Sparkles, 
  User, 
  Wind, 
  HelpCircle, 
  Globe, 
  Trophy, 
  RotateCcw, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Zap, 
  Award,
  Search,
  Check
} from 'lucide-react';
import { REAL_WORLD_USES } from '../realWorldUses';

// Offsets for clustered protons/neutrons inside the atomic nucleus to create a 3D-like ball
const NUCLEON_OFFSETS = [
  { dx: 2, dy: -2 },
  { dx: -3, dy: 3 },
  { dx: 4, dy: 1 },
  { dx: -4, dy: -4 },
  { dx: 1, dy: 5 },
  { dx: -5, dy: 1 },
  { dx: 4, dy: -5 },
  { dx: -1, dy: -6 },
  { dx: 5, dy: -2 },
  { dx: -2, dy: 5 },
  { dx: 6, dy: 2 },
  { dx: -6, dy: -1 },
];

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

// ==========================================
// BROWSER SYNTHESIZER AUDIO EFFECTS (WEB AUDIO API)
// ==========================================
function playPeriodicSound(type: 'click' | 'success' | 'fail' | 'clue' | 'victory', soundEnabled: boolean = true) {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'clue') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'fail') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + i * 0.08);
        g.gain.setValueAtTime(0.08, now + i * 0.08);
        g.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.2);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.25);
      });
    } else if (type === 'victory') {
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760]; // A major arpeggio
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + i * 0.07);
        g.gain.setValueAtTime(0.06, now + i * 0.07);
        g.gain.linearRampToValueAtTime(0, now + i * 0.07 + 0.35);
        o.start(now + i * 0.07);
        o.stop(now + i * 0.07 + 0.35);
      });
    }
  } catch (_) {}
}

interface PeriodicTableProps {
  currentUser?: UserAccount | null;
  theme?: 'dark' | 'light';
}

export default function PeriodicTable({ currentUser, theme = 'dark' }: PeriodicTableProps = {}) {
  const [activeTab, setActiveTab] = useState<'explore' | 'game'>('explore');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement | null>(ELEMENTS_DATA[10]); // Defaults to Na (Sodium)
  const [highlightedCategory, setHighlightedCategory] = useState<ElementCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // ==========================================
  // GAME ENGINE STATE
  // ==========================================
  const [correctElement, setCorrectElement] = useState<ChemicalElement | null>(null);
  const [revealedClues, setRevealedClues] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameStreak, setGameStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('chemvibe_periodic_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]); // Array of element symbols
  const [gameStatus, setGameStatus] = useState<'playing' | 'correct' | 'failed'>('playing');

  // Re-sync local highscore when user changes
  useEffect(() => {
    const savedSc = localStorage.getItem('chemvibe_periodic_highscore');
    if (savedSc) {
      setHighScore(parseInt(savedSc, 10) || 0);
    } else {
      setHighScore(0);
    }
  }, [currentUser]);

  // Human readable labels for categories
  const categoryLabels: Record<ElementCategory, { label: string; colorClass: string; textClass: string; hoverBg: string }> = {
    'alkali-metals': { label: 'Logam Alkali', colorClass: 'bg-red-500/10 border-red-500/40 text-red-405 hover:border-red-422 text-red-400', textClass: 'text-red-400', hoverBg: 'hover:bg-red-500/20' },
    'alkaline-earth': { label: 'Alkali Tanah', colorClass: 'bg-orange-500/10 border-orange-500/40 text-orange-405 hover:border-orange-422 text-orange-400', textClass: 'text-orange-400', hoverBg: 'hover:bg-orange-500/20' },
    'transition-metals': { label: 'Logam Transisi', colorClass: 'bg-amber-500/10 border-amber-500/40 text-amber-405 hover:border-amber-422 text-amber-400', textClass: 'text-amber-400', hoverBg: 'hover:bg-amber-500/20' },
    'post-transition': { label: 'Logam Pasca-Transisi', colorClass: 'bg-green-500/10 border-green-500/40 text-green-405 hover:border-green-422 text-green-400', textClass: 'text-green-400', hoverBg: 'hover:bg-green-500/20' },
    'metalloids': { label: 'Metaloid', colorClass: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-405 hover:border-emerald-422 text-emerald-400', textClass: 'text-emerald-400', hoverBg: 'hover:bg-emerald-500/20' },
    'nonmetals': { label: 'Non-Logam', colorClass: 'bg-teal-500/10 border-teal-500/40 text-teal-405 hover:border-teal-422 text-teal-400', textClass: 'text-teal-400', hoverBg: 'hover:bg-teal-500/20' },
    'noble-gases': { label: 'Gas Mulia', colorClass: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-405 hover:border-indigo-422 text-indigo-400', textClass: 'text-indigo-400', hoverBg: 'hover:bg-indigo-500/20' },
    'lanthanides': { label: 'Lantanida', colorClass: 'bg-pink-500/10 border-pink-500/40 text-pink-405 hover:border-pink-422 text-pink-400', textClass: 'text-pink-400', hoverBg: 'hover:bg-pink-500/20' },
    'actinides': { label: 'Aktinida', colorClass: 'bg-purple-500/10 border-purple-500/40 text-purple-405 hover:border-purple-422 text-purple-400', textClass: 'text-purple-400', hoverBg: 'hover:bg-purple-550/20' }
  };

  // Helper for local search filter matching
  const matchesSearch = (element: ChemicalElement) => {
    if (!searchQuery) return true;
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return true;

    // Support multi-term search (e.g. "gas helium" or "logam alkali")
    const terms = cleanQuery.split(/\s+/);

    return terms.every(term => {
      const symbolLower = element.symbol.toLowerCase();
      const nameLower = element.name.toLowerCase();
      const numStr = element.number.toString();
      const categoryLabelLower = categoryLabels[element.category]?.label.toLowerCase() || '';
      const phaseLower = element.phase.toLowerCase();

      // Is exact symbol match (highest precision)
      if (symbolLower === term) return true;
      // Is exact atomic number match
      if (numStr === term) return true;

      // Numeric search
      if (/^\d+$/.test(term)) {
        return numStr.startsWith(term);
      }

      // Short search: require start-of-word or start-of-symbol match to avoid noisy substrings
      if (term.length <= 2) {
        return (
          symbolLower.startsWith(term) ||
          nameLower.startsWith(term) ||
          nameLower.split(/\s+/) .some(word => word.startsWith(term)) ||
          nameLower.split(/\s*\/\s*/).some(part => part.startsWith(term))
        );
      }

      // General string search
      return (
        symbolLower.includes(term) ||
        nameLower.includes(term) ||
        categoryLabelLower.includes(term) ||
        phaseLower.includes(term) ||
        // Only inspect summary description for 3+ character words to avoid letter clutter
        (term.length >= 3 && element.summary.toLowerCase().includes(term))
      );
    });
  };

  // Trigger sound feedback when elements are selected in explore mode
  const selectElementWithSound = (el: ChemicalElement) => {
    setSelectedElement(el);
    playPeriodicSound('click', soundEnabled);
  };

  // Position on classical 18-column periodic table
  const getPosition = (num: number) => {
    if (num === 1) return { row: 1, col: 1 };
    if (num === 2) return { row: 1, col: 18 };
    if (num >= 3 && num <= 10) return { row: 2, col: num - 2 + (num > 4 ? 10 : 0) };
    if (num >= 11 && num <= 18) return { row: 3, col: num - 10 + (num > 12 ? 10 : 0) };
    if (num >= 19 && num <= 36) return { row: 4, col: num - 18 };
    if (num >= 37 && num <= 54) return { row: 5, col: num - 36 };
    if (num >= 55 && num <= 56) return { row: 6, col: num - 54 };
    if (num >= 57 && num <= 71) return { row: 9, col: num - 57 + 4 }; // Lanthanides (row 9, cols 4-18)
    if (num >= 72 && num <= 86) return { row: 6, col: num - 68 };
    if (num >= 87 && num <= 88) return { row: 7, col: num - 86 };
    if (num >= 89 && num <= 103) return { row: 10, col: num - 89 + 4 }; // Actinides (row 10, cols 4-18)
    if (num >= 104 && num <= 118) return { row: 7, col: num - 100 };
    return { row: 1, col: 1 };
  };

  // ==========================================
  // GENERATE GAME RIDDLE
  // ==========================================
  const startNewGameRound = (keepStreak = true) => {
    // Exclude actinide and super heavy synthetic ones for better student intuition by default, but keeping overall potential from most common
    const candidates = ELEMENTS_DATA.filter(el => el.number <= 94); // Up to Plutonium
    const randomChoice = candidates[Math.floor(Math.random() * candidates.length)];
    
    setCorrectElement(randomChoice);
    setRevealedClues(1);
    setLives(3);
    setWrongGuesses([]);
    setGameStatus('playing');
    if (!keepStreak) {
      setGameStreak(0);
    }
  };

  // Initialize first game round
  useEffect(() => {
    startNewGameRound(true);
  }, []);

  const handleMakeGuess = (element: ChemicalElement) => {
    if (!correctElement || gameStatus !== 'playing') return;

    // Check if already guessed
    if (wrongGuesses.includes(element.symbol)) return;

    if (element.number === correctElement.number) {
      // Correct answer!
      playPeriodicSound('success', soundEnabled);
      const pointsEarned = Math.max(20, 100 - (revealedClues - 1) * 20 - wrongGuesses.length * 15);
      const nextScore = gameScore + pointsEarned;
      const nextStreak = gameStreak + 1;
      setGameScore(nextScore);
      setGameStreak(nextStreak);
      setGameStatus('correct');
      setSelectedElement(element); // set details info to correct one on focus

      if (nextScore > highScore) {
        setHighScore(nextScore);
        localStorage.setItem('chemvibe_periodic_highscore', nextScore.toString());
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.id), {
            periodicHighscore: nextScore
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.id}`);
          });

          setDoc(doc(db, 'public_profiles', currentUser.id), {
            periodicHighscore: nextScore,
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `public_profiles/${currentUser.id}`);
          });
        }
      }
    } else {
      // Wrong answer
      playPeriodicSound('fail', soundEnabled);
      setWrongGuesses(prev => [...prev, element.symbol]);
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        setGameStatus('failed');
        setGameStreak(0);
        setSelectedElement(correctElement); // reveal properties in sidebar
      }
    }
  };

  const handleShowNextClue = () => {
    if (revealedClues < 5) {
      setRevealedClues(prev => prev + 1);
      playPeriodicSound('clue', soundEnabled);
    }
  };

  const realWorldInfo = selectedElement ? REAL_WORLD_USES[selectedElement.number] : null;
  const shellCount = selectedElement ? selectedElement.shells.length : 0;
  const maxRadius = 110; 
  const minRadius = 26;
  
  // Dynamic radius based on total number of shells to prevent overflow
  const getRadius = (idx: number) => {
    if (shellCount <= 1) return 55;
    return minRadius + (idx / (shellCount - 1)) * (maxRadius - minRadius);
  };

  const protonCount = selectedElement ? Math.min(selectedElement.number, 6) : 0;
  const neutronCount = selectedElement ? Math.min(selectedElement.number, 6) : 0;

  // Render clues dynamically
  const getClueText = (index: number): { label: string; text: string } => {
    if (!correctElement) return { label: '', text: '' };
    switch (index) {
      case 1:
        return { 
          label: 'Kelompok & Wujud Fisis', 
          text: `Saya tergolong unsur **${categoryLabels[correctElement.category]?.label || correctElement.category}** dan berwujud **${
            correctElement.phase === 'Gas' ? 'Gas' : correctElement.phase === 'Liquid' ? 'Cair' : correctElement.phase === 'Solid' ? 'Padat' : 'Sintetis'
          }** pada suhu kamar.` 
        };
      case 2:
        return {
          label: 'Kimia Elektron',
          text: `Jumlah elektron valensi (kulit luar) saya adalah **${correctElement.valenceElectrons}** elektron. Nomor atom saya merupakan bilangan **${correctElement.number % 2 === 0 ? 'Genap' : 'Ganjil'}**.`
        };
      case 3:
        return {
          label: 'Massa & Konfigurasi Atom',
          text: `Massa atom rata-rata saya berkisar di sekitar **${Math.round(correctElement.weight)} g/mol** dengan konfigurasi subkulit terluar **${correctElement.configuration}**.`
        };
      case 4:
        return {
          label: 'Kegunaan & Dampak Dunia Nyata',
          text: `Aplikasi/Karakteristik: *"${correctElement.summary}"*`
        };
      case 5:
        return {
          label: 'Sejarah / Penemu Unsur',
          text: `Saya pertama kali diidentifikasi atau ditemukan oleh ilmuwan besar **${correctElement.discoveredBy || 'Zaman Purba/Prasejarah'}**.`
        };
      default:
        return { label: '', text: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-white tracking-tight">Interactive Periodic Table</h2>
            <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Materi: Struktur Atom
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Eksplorasi susunan Bohr, konfigurasi subkulit, berat molekul, atau uji pemahaman Anda di teka-teki kimia.
          </p>
        </div>

        {/* Tab & Audio controller */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Audio toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-slate-900 border-teal-500/30 text-teal-400 hover:bg-slate-800' 
                : 'bg-slate-950 border-slate-900 text-slate-500'
            }`}
            title={soundEnabled ? "Matikan Suara" : "Aktifkan Suara"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Mode Tabs */}
          <div className={`flex p-1 rounded-xl border overflow-hidden w-full lg:w-auto ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
            <button
              onClick={() => {
                setActiveTab('explore');
                playPeriodicSound('click', soundEnabled);
              }}
              className={`flex-1 lg:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'explore'
                  ? 'bg-slate-850 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Eksplorasi
            </button>
            <button
              onClick={() => {
                setActiveTab('game');
                playPeriodicSound('click', soundEnabled);
              }}
              className={`flex-1 lg:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'game'
                  ? 'bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/20 text-teal-300 border border-teal-500/30 font-extrabold shadow-sm shadow-teal-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Game Tebak Unsur
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Table Layout Area (Span 2) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Filter/Status Box under explore tab */}
          {activeTab === 'explore' && (
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 px-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}>
              {/* Category Legend Controls */}
              <div className="flex flex-wrap gap-1.5 max-w-full overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase mr-1.5 flex items-center">Kategori:</span>
                {Object.entries(categoryLabels).map(([key, value]) => {
                  const isHighlighted = highlightedCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setHighlightedCategory(isHighlighted ? null : (key as ElementCategory));
                        playPeriodicSound('click', soundEnabled);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all duration-150 cursor-pointer ${
                        isHighlighted 
                          ? `${value.colorClass} ring-1 ring-white/10 scale-102` 
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {value.label}
                    </button>
                  );
                })}
              </div>

              {/* Chemical search input */}
              <div className="relative shrink-0 w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari simbol/nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-lg py-1 pl-8 pr-3 text-xs focus:outline-none focus:border-teal-500 placeholder-slate-650 ${theme === 'dark' ? 'bg-slate-950 border-slate-900 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>
          )}

          {/* GAME SCOREBOARD AND CONTROLS (Only visible in Game Mode) */}
          {activeTab === 'game' && (
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl border border-emerald-500/10 ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-100/40'}`}>
              <div className={`p-2.5 rounded-xl border flex flex-col justify-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-900' : 'bg-slate-100/60 border-slate-300'}`}>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">SKOR GAME</span>
                <span className="text-xl font-black text-white mt-0.5">{gameScore} pts</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex flex-col justify-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-900' : 'bg-slate-100/60 border-slate-300'}`}>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">REKOR BERUNTUN</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-amber-400">{gameStreak}x</span>
                  {gameStreak >= 3 && <Zap className="w-4 h-4 text-amber-400 fill-amber-450 animate-bounce" />}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border flex flex-col justify-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-900' : 'bg-slate-100/60 border-slate-300'}`}>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">SKOR TERTINGGI</span>
                <span className="text-xl font-black text-emerald-400 mt-0.5">{highScore} pts</span>
              </div>
              <div className={`p-2.5 rounded-xl border flex flex-col justify-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-900' : 'bg-slate-100/60 border-slate-300'}`}>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">SISA NYAWA</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < lives ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]' : 'bg-slate-800'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MAIN PERIODIC TABLE GRID VIEW */}
          <div className="glass-panel rounded-2xl p-6 overflow-x-auto border border-slate-800 relative">
            {/* 18-Column grid */}
            <div className="min-w-[620px] grid grid-cols-18 gap-2 relative">
              {ELEMENTS_DATA.map((element) => {
                const pos = getPosition(element.number);
                
                // Highlights and UI conditions
                const isSelected = selectedElement?.number === element.number;
                const isMatchesSearch = activeTab === 'explore' ? matchesSearch(element) : true;
                const isCatMatch = activeTab === 'explore' 
                  ? (highlightedCategory === null || highlightedCategory === element.category) 
                  : true;
                
                const isWrongGuess = activeTab === 'game' && wrongGuesses.includes(element.symbol);
                const isRevealedFailureChoice = activeTab === 'game' && gameStatus === 'failed' && correctElement?.number === element.number;
                const isSolvedCorrectChoice = activeTab === 'game' && gameStatus === 'correct' && correctElement?.number === element.number;

                const configStyle = categoryLabels[element.category];

                // Determine styling based on active mode
                let buttonStyle = '';
                if (activeTab === 'explore') {
                  if (isSelected) {
                    buttonStyle = 'bg-slate-100 border-white text-slate-950 scale-[1.08] z-10 shadow-xl ring-4 ring-teal-500/20';
                  } else if (isMatchesSearch && isCatMatch) {
                    buttonStyle = `${configStyle.colorClass} ${configStyle.hoverBg} hover:scale-[1.1] hover:z-10 hover:border-teal-400/50`;
                  } else {
                    buttonStyle = 'bg-slate-950/10 border-slate-900/40 text-slate-600/40 opacity-20 pointer-events-none';
                  }
                } else {
                  // Game mode styles
                  if (isSolvedCorrectChoice) {
                    buttonStyle = 'bg-emerald-500/25 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/40 scale-[1.08] z-10 animate-pulse';
                  } else if (isRevealedFailureChoice) {
                    buttonStyle = 'bg-amber-500/20 border-amber-400 text-amber-350 scale-[1.08] z-10 ring-4 ring-amber-500/30';
                  } else if (isWrongGuess) {
                    buttonStyle = 'bg-red-950/20 border-red-900/60 text-red-650/40 opacity-35';
                  } else {
                    buttonStyle = `${configStyle.colorClass} ${configStyle.hoverBg} hover:scale-[1.1] hover:z-10 hover:border-teal-400/50`;
                  }
                }

                return (
                  <button
                    key={element.symbol}
                    onClick={() => {
                      if (activeTab === 'game') {
                        handleMakeGuess(element);
                      } else {
                        selectElementWithSound(element);
                      }
                    }}
                    title={`${element.symbol} - ${element.name}`}
                    style={{
                      gridRowStart: pos.row,
                      gridColumnStart: pos.col,
                    }}
                    id={`element-cell-${element.symbol}`}
                    disabled={activeTab === 'explore' && (!isMatchesSearch || !isCatMatch)}
                    className={`relative aspect-square rounded-xl p-1 flex flex-col justify-between cursor-pointer border transition-all duration-300 leading-none group ${buttonStyle}`}
                  >
                    {/* Top line: Atomic number & weights */}
                    <div className="flex justify-between items-center text-[7px] md:text-[8px] font-mono font-bold w-full">
                      <span className={isSelected && activeTab === 'explore' ? 'text-slate-600' : 'text-zinc-500 group-hover:text-zinc-300 transition-colors'}>
                        {element.number}
                      </span>
                      <span className={isSelected && activeTab === 'explore' ? 'text-slate-500' : 'text-zinc-650 group-hover:text-zinc-400 font-normal transition-colors'}>
                        {element.weight.toFixed(0)}
                      </span>
                    </div>

                    {/* Symbol text */}
                    <span className="text-xs md:text-sm font-black font-sans leading-none block w-full text-center py-0.5">
                      {element.symbol}
                    </span>

                    {/* Name */}
                    <span className="text-[6px] md:text-[7.5px] font-medium leading-none max-w-full truncate block w-full text-center px-0.5">
                      {element.name}
                    </span>

                    {/* Small validation dot if wrong */}
                    {isWrongGuess && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500/80 border border-red-300" />
                    )}
                  </button>
                );
              })}

              {/* Group Numbers Indicator bottom row */}
              <div className="col-span-18 grid grid-cols-18 gap-2 border-t border-slate-850 mt-4 pt-2 text-[8px] text-slate-500 font-mono text-center">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 border p-4 rounded-xl text-xs ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900 text-slate-450' : 'bg-slate-100/30 border-slate-300 text-slate-600'}`}>
            <Info className="w-4.5 h-4.5 text-teal-400 shrink-0" />
            <span>
              {activeTab === 'explore' 
                ? "Gunakan kotak pencarian atau klik legenda kelompok di atas untuk menyoroti golongan unsur secara spesifik, seperti Alkali Transisi atau Metaloid."
                : "Klik unsur di tabel periodik berdasarkan petunjuk riddle yang tertera di bagian kanan. Semakin sedikit petunjuk yang Anda minta, skor yang didapatkan semakin tinggi!"
              }
            </span>
          </div>
        </div>

        {/* Detailed element information panel (Span 1) */}
        <div className="glass-panel border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          
          {/* RENDER EXPLORE VIEW SPECIFICATIONS */}
          {activeTab === 'explore' && (
            selectedElement ? (
              <div className="space-y-6">
                {/* Heading element code block style */}
                <div className="flex gap-4 items-center">
                  <div className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center ${categoryLabels[selectedElement.category]?.colorClass || ''}`}>
                    <span className="text-xs font-mono font-black select-none leading-none mb-1">{selectedElement.number}</span>
                    <span className="text-2xl font-black font-sans leading-none select-none">{selectedElement.symbol}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{selectedElement.name}</h3>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 tracking-wider uppercase border text-center ${categoryLabels[selectedElement.category]?.colorClass || ''}`}>
                      {categoryLabels[selectedElement.category]?.label || selectedElement.category}
                    </span>
                  </div>
                </div>

                {/* Shell graphic schematic visualization (BOHR MODEL) */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest leading-none">VISUALISASI ATOM BOHR</h4>
                  <div className={`h-60 rounded-xl border flex items-center justify-center relative overflow-hidden select-none ${theme === 'dark' ? 'bg-slate-950/65 border-slate-900' : 'bg-slate-100/65 border-slate-300'}`}>
                    
                    {/* Clustered Protons & Neutrons in Nucleus */}
                    <div className="absolute w-12 h-12 flex items-center justify-center z-10">
                      {/* Outer boundary of Nucleus core */}
                      <div className="absolute w-8 h-8 rounded-full bg-slate-800/10 border border-slate-700/25 animate-pulse" />
                      
                      {/* Nucleons cluster */}
                      {Array.from({ length: protonCount }).map((_, i) => {
                        const offset = NUCLEON_OFFSETS[i % NUCLEON_OFFSETS.length];
                        return (
                          <div 
                            key={`p-${i}`}
                            className="absolute w-2.5 h-2.5 rounded-full bg-rose-500 flex items-center justify-center text-[6px] text-white font-black shadow-[0_0_4px_rgba(244,63,94,0.6)] z-11 border border-rose-400"
                            style={{ transform: `translate(${offset.dx}px, ${offset.dy}px)` }}
                          >
                            +
                          </div>
                        );
                      })}
                      {Array.from({ length: neutronCount }).map((_, i) => {
                        const offset = NUCLEON_OFFSETS[(i + 3) % NUCLEON_OFFSETS.length];
                        return (
                          <div 
                            key={`n-${i}`}
                            className="absolute w-2.5 h-2.5 rounded-full bg-sky-500/80 shadow-[0_0_4px_rgba(56,189,248,0.4)] z-12 border border-sky-400"
                            style={{ transform: `translate(${offset.dx + 1.5}px, ${offset.dy - 1.5}px)` }}
                          />
                        );
                      })}

                      {/* Element Symbol label inside core */}
                      <div className={`absolute w-7 h-7 rounded-full border flex items-center justify-center z-25 shadow-md ${theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-slate-100/95 border-slate-300'}`}>
                        <span className="text-[10px] font-black text-slate-100">{selectedElement.symbol}</span>
                      </div>
                    </div>

                    {/* Concentric rings representing energy levels (K, L, M, N...) */}
                    {selectedElement.shells.map((count, idx) => {
                      const radius = getRadius(idx);
                      const orbitName = SHELL_NAMES[idx] || `n=${idx+1}`;
                      return (
                        <div 
                          key={idx} 
                          className="box-border border border-dashed border-slate-800/80 rounded-full absolute flex items-center justify-center"
                          style={{ 
                            width: `${radius * 2}px`, 
                            height: `${radius * 2}px`,
                            animation: `spin ${6 + idx * 4}s linear infinite` 
                          }}
                        >
                          {/* Small Orbit Label text overlay */}
                          <span className={`absolute -top-2.5 text-[8px] font-mono text-slate-650 font-bold tracking-tight select-none pointer-events-none px-0.5 rounded leading-none border ${theme === 'dark' ? 'bg-slate-950/70 border-slate-900/40' : 'bg-slate-100/70 border-slate-300'}`}>
                            {orbitName}
                          </span>

                          {/* Orbiting negative-charged electrons */}
                          {Array.from({ length: count }).map((_, eIdx) => {
                            const angle = (eIdx / count) * 360;
                            return (
                              <div
                                key={eIdx}
                                className="w-2.5 h-2.5 rounded-full bg-teal-400 absolute shadow-[0_0_6px_rgba(45,212,191,0.8)] border border-white/20 flex items-center justify-center"
                                style={{
                                    transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
                                }}
                              >
                                <span className="text-[7.5px] font-black text-zinc-950 leading-none mb-0.5 pointer-events-none">-</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bohr Model Structure Legend */}
                  <div className={`border rounded-xl p-3 text-[11px] space-y-2 ${theme === 'dark' ? 'border-slate-900 bg-slate-950/40' : 'border-slate-300 bg-slate-100/40'}`}>
                    <div className="text-[9px] font-mono text-slate-500 font-bold tracking-wider uppercase leading-none">LEGENDA ATOM BOHR</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-350 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[7px] text-white font-black select-none border border-rose-455">+</span>
                        <span>Proton (p⁺)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-sky-500/80 border border-sky-455 select-none" />
                        <span>Neutron (n⁰)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-teal-400 flex items-center justify-center text-[7px] text-zinc-950 font-black select-none border border-white/10">-</span>
                        <span>Elektron (e⁻)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 border-t border-dashed border-slate-700 inline-block h-0" />
                        <span>Kulit Energi</span>
                      </div>
                    </div>
                    
                    {/* Shell quantum numbers layout list */}
                    <div className="border-t border-slate-900 pt-2.5 flex flex-wrap gap-1 mt-1 font-mono justify-center">
                      {selectedElement.shells.map((count, idx) => (
                        <span key={idx} className={`px-1.5 py-0.5 rounded text-[9.5px] border ${theme === 'dark' ? 'bg-slate-950 border-slate-850 text-slate-450' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                          <span className="text-teal-400 font-black">{SHELL_NAMES[idx] || `n=${idx+1}`}</span>: {count}e⁻
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid characteristics list */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <span className="text-[9px] text-slate-500 block">BERAT ATOM</span>
                    <span className="text-slate-200 mt-0.5 block font-bold">{selectedElement.weight.toFixed(4)} g/mol</span>
                  </div>
                  <div className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <span className="text-[9px] text-slate-500 block">KONFIGURASI</span>
                    <span className="text-slate-200 mt-0.5 block font-bold">{selectedElement.configuration}</span>
                  </div>
                  <div className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <span className="text-[9px] text-slate-500 block">ELEKTRONEGATIF</span>
                    <span className="text-slate-200 mt-0.5 block font-bold">
                      {selectedElement.electronegativity ?? 'Tidak Ada / Inert'}
                    </span>
                  </div>
                  <div className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <span className="text-[9px] text-slate-500 block">WUJUD STANDAR</span>
                    <span className="text-slate-200 mt-0.5 block font-bold">{selectedElement.phase}</span>
                  </div>
                </div>

                {/* Real-World Use Card (Aplikasi Dunia Nyata) */}
                {realWorldInfo && (
                  <div className="space-y-2 bg-emerald-500/[0.03] p-3 rounded-lg border border-emerald-500/15 animate-fade-in">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold tracking-wide uppercase leading-none">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Manfaat Praktis Dunia Nyata</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-white block bg-emerald-550/15 border border-emerald-500/25 px-2 py-0.5 rounded-md w-fit mb-1">
                        📍 {realWorldInfo.item}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {realWorldInfo.use}
                      </p>
                    </div>
                  </div>
                )}

                {/* Informative summaries */}
                <div className="space-y-2 bg-teal-500/[0.02] p-3 rounded-lg border border-teal-500/10">
                  <span className="text-[10px] font-bold text-teal-400 tracking-wide block uppercase leading-none">Ringkasan Unsur</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {selectedElement.summary}
                  </p>
                  {selectedElement.discoveredBy && (
                    <p className="text-[10px] text-slate-500 focus:outline-none">
                      Penemu: <span className="text-slate-400">{selectedElement.discoveredBy}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center text-zinc-500 text-xs py-10">
                <HelpCircle className="w-10 h-10 mb-2 opacity-50" />
                Pilih unsur pada tabel untuk deskripsi lanjut.
              </div>
            )
          )}

          {/* RENDER GAME MODE CONSOLE INTERACTIVE CARD */}
          {activeTab === 'game' && correctElement && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-4 rounded-xl border border-teal-500/20 ${theme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-100/60'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-5 h-5 text-teal-400" />
                  <span className="text-xs font-black text-teal-400 uppercase tracking-widest font-mono">RIDDLE DETEKTIF KIMIA</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Pecahkan teka-teki misteri unsur di bawah ini dengan menemukan sel yang cocok pada tabel periodik di sebelah kiri!
                </p>
              </div>

              {/* RENDER DYNAMIC REVEALED HINTS */}
              <div className="space-y-3.5">
                {Array.from({ length: 5 }).map((_, clueIdx) => {
                  const num = clueIdx + 1;
                  const isUnlocked = revealedClues >= num;
                  const clueInfo = getClueText(num);

                  return (
                    <div 
                      key={clueIdx} 
                      className={`relative p-3 rounded-xl border transition-all duration-300 ${
                        isUnlocked 
                          ? 'bg-slate-950/80 border-slate-800' 
                          : 'bg-slate-950/20 border-slate-950/40 opacity-40'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase tracking-widest">
                          Petunjuk #{num}: {isUnlocked ? clueInfo.label : 'Terkunci'}
                        </span>
                        {!isUnlocked && num === revealedClues + 1 && (
                          <button 
                            onClick={handleShowNextClue}
                            className="bg-teal-500/10 hover:bg-teal-500/20 hover:text-white border border-teal-500/20 text-teal-300 text-[9px] font-black px-2 py-0.5 rounded-md cursor-pointer transition-all"
                          >
                            Buka Petunjuk (+20s)
                          </button>
                        )}
                        {!isUnlocked && num > revealedClues + 1 && (
                          <span className="text-[8px] font-mono text-slate-650 font-bold uppercase">Unlock # {num - 1} dulu</span>
                        )}
                      </div>

                      {isUnlocked ? (
                        <p 
                          className="text-xs text-white leading-relaxed font-sans"
                          dangerouslySetInnerHTML={{
                            __html: clueInfo.text
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal-400 font-bold">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em class="text-slate-350 italic">$1</em>')
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 py-1 text-slate-500 text-[11px]">
                          <Zap className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                          <span>Pecahkan teka-teki sebelumnya untuk membuka kunci petunjuk ini.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ACTION ROUND ALERTS */}
              {gameStatus === 'playing' ? (
                <div className={`border border-dashed p-3 rounded-xl text-center text-xs ${theme === 'dark' ? 'bg-slate-955 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                  ⚠️ Salah tebak mengurangi nyawa. Pikirkan matang-matang!
                </div>
              ) : gameStatus === 'correct' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-2 animate-bounce-short">
                  <div className="flex justify-center mb-1">
                    <Award className="w-8 h-8 text-emerald-450" />
                  </div>
                  <h4 className="font-black text-emerald-400 text-sm">JAWABAN BENAR!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Unsur misteri ini adalah <strong>{correctElement.name} ({correctElement.symbol})</strong> dengan nomor atom {correctElement.number}.
                  </p>
                  <button
                    onClick={() => {
                      startNewGameRound(true);
                      playPeriodicSound('click', soundEnabled);
                    }}
                    className="mt-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-black px-4 py-2 rounded-xl cursor-pointer shadow-md inline-flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4 text-slate-950 font-extrabold" />
                    Lanjut Ronde Berikutnya
                  </button>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center space-y-2">
                  <h4 className="font-black text-rose-500 text-sm">GAME OVER!</h4>
                  <p className="text-xs text-slate-350 leading-relaxed mb-1">
                    Kesempatan menebak habis. Unsur yang dimaksud sebenarnya adalah: <strong className="text-white block mt-1 text-sm">{correctElement.name} ({correctElement.symbol}) # {correctElement.number}</strong>
                  </p>
                  <button
                    onClick={() => {
                      startNewGameRound(false);
                      playPeriodicSound('click', soundEnabled);
                    }}
                    className="mt-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer shadow-md inline-flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-white" />
                    Coba Lagi Dari Nol
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
