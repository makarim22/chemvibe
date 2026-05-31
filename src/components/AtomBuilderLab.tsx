/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Atom, 
  Plus, 
  Minus, 
  RotateCcw, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  Trophy, 
  Zap, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Info, 
  Award,
  Maximize2,
  Lock,
  Unlock,
  Flame
} from 'lucide-react';

// Definitions for the first 18 chemical elements for Bohr modeling and notation matching
interface BuilderElement {
  number: number;
  symbol: string;
  name: string;
  category: string;
  commonNeutrons: number;
  stableIsotopes: number[]; // Valid neutron counts for stability
  summary: string;
  electronegativity: string;
  phase: string;
}

const BUILDER_ELEMENTS: Record<number, BuilderElement> = {
  1: { number: 1, symbol: 'H', name: 'Hydrogen', category: 'Non-Logam', commonNeutrons: 0, stableIsotopes: [0, 1], summary: 'Unsur paling melimpah di alam semesta. Bahan utama pembuatan bintang dan air.', electronegativity: '2.20', phase: 'Gas' },
  2: { number: 2, symbol: 'He', name: 'Helium', category: 'Gas Mulia', commonNeutrons: 2, stableIsotopes: [1, 2], summary: 'Gas mulia yang sangat ringan dan tidak reaktif. Digunakan untuk balon udara dan pendingin super.', electronegativity: 'Tidak Ada / Inert', phase: 'Gas' },
  3: { number: 3, symbol: 'Li', name: 'Lithium', category: 'Logam Alkali', commonNeutrons: 4, stableIsotopes: [3, 4], summary: 'Logam teringan dengan densitas sangat rendah. Bahan utama baterai isi ulang modern.', electronegativity: '0.98', phase: 'Solid' },
  4: { number: 4, symbol: 'Be', name: 'Beryllium', category: 'Alkali Tanah', commonNeutrons: 5, stableIsotopes: [5], summary: 'Logam abu-abu ulet dan kuat. Banyak digunakan di dunia kedirgantaraan karena kestabilan termalnya.', electronegativity: '1.57', phase: 'Solid' },
  5: { number: 5, symbol: 'B', name: 'Boron', category: 'Metaloid', commonNeutrons: 6, stableIsotopes: [5, 6], summary: 'Metaloid penting untuk kaca borosilikat tahan panas tinggi (Pyrex) dan semikonduktor.', electronegativity: '2.04', phase: 'Solid' },
  6: { number: 6, symbol: 'C', name: 'Carbon', category: 'Non-Logam', commonNeutrons: 6, stableIsotopes: [6, 7], summary: 'Tulang punggung dari seluruh senyawa organik dan biosfer kehidupan di bumi.', electronegativity: '2.55', phase: 'Solid' },
  7: { number: 7, symbol: 'N', name: 'Nitrogen', category: 'Non-Logam', commonNeutrons: 7, stableIsotopes: [7, 8], summary: 'Penyusun utama atmosfer bumi (78%). Sangat melimpah dan penting bagi protein.', electronegativity: '3.04', phase: 'Gas' },
  8: { number: 8, symbol: 'O', name: 'Oxygen', category: 'Non-Logam', commonNeutrons: 8, stableIsotopes: [8, 9, 10], summary: 'Bahan pendukung pembakaran dan respirasi seluler dari seluruh makhluk hidup aerobik.', electronegativity: '3.44', phase: 'Gas' },
  9: { number: 9, symbol: 'F', name: 'Fluorine', category: 'Halogen (Non-Logam)', commonNeutrons: 10, stableIsotopes: [10], summary: 'Unsur paling elektronegatif dan sangat reaktif kimiawi. Digunakan dalam pasta gigi.', electronegativity: '3.98', phase: 'Gas' },
  10: { number: 10, symbol: 'Ne', name: 'Neon', category: 'Gas Mulia', commonNeutrons: 10, stableIsotopes: [10, 11, 12], summary: 'Gas berwarna merah jingga menyala ketika dialiri tegangan tinggi. Gas iklan papan reklame.', electronegativity: 'Tidak Ada / Inert', phase: 'Gas' },
  11: { number: 11, symbol: 'Na', name: 'Sodium (Natrium)', category: 'Logam Alkali', commonNeutrons: 12, stableIsotopes: [12], summary: 'Logam alkali lunak reaktif yang meledak jika bereaksi keras dengan molekul air berlebih.', electronegativity: '0.93', phase: 'Solid' },
  12: { number: 12, symbol: 'Mg', name: 'Magnesium', category: 'Alkali Tanah', commonNeutrons: 12, stableIsotopes: [12, 13, 14], summary: 'Logam struktural ringan penting untuk mesin pesawat terbang tinggi serta klorofil tanaman.', electronegativity: '1.31', phase: 'Solid' },
  13: { number: 13, symbol: 'Al', name: 'Aluminium', category: 'Logam Pasca-Transisi', commonNeutrons: 14, stableIsotopes: [14], summary: 'Logam tahan karat ringan yang melimpah di kerak bumi. Digunakan luas untuk kaleng soda.', electronegativity: '1.61', phase: 'Solid' },
  14: { number: 14, symbol: 'Si', name: 'Silicon', category: 'Metaloid', commonNeutrons: 14, stableIsotopes: [14, 15, 16], summary: 'Dasar dari sirkuit mikroprosesor komputer dan silika mineral pembentuk pasir pantai.', electronegativity: '1.90', phase: 'Solid' },
  15: { number: 15, symbol: 'P', name: 'Phosphorus', category: 'Non-Logam', commonNeutrons: 16, stableIsotopes: [16], summary: 'Unsur nonlogam reaktif. Penyusun penting dari rantai molekul materi genetik DNA/RNA.', electronegativity: '2.19', phase: 'Solid' },
  16: { number: 16, symbol: 'S', name: 'Sulfur (Belerang)', category: 'Non-Logam', commonNeutrons: 16, stableIsotopes: [16, 17, 18, 20], summary: 'Berwarna kuning pucat baunya tajam jika dibakar. Penting untuk vulkanisasi ban karet karet.', electronegativity: '2.58', phase: 'Solid' },
  17: { number: 17, symbol: 'Cl', name: 'Chlorine', category: 'Halogen (Non-Logam)', commonNeutrons: 18, stableIsotopes: [18, 20], summary: 'Gas beracun kuning-hijau dengan bau menyengat. Bahan dasar pembersih air kolam renang.', electronegativity: '3.16', phase: 'Gas' },
  18: { number: 18, symbol: 'Ar', name: 'Argon', category: 'Gas Mulia', commonNeutrons: 22, stableIsotopes: [18, 20, 22], summary: 'Gas mulia yang dominan di udara sekunder setelah nitrogen/oksigen. Pelindung pengelasan.', electronegativity: 'Tidak Ada / Inert', phase: 'Gas' }
};

// Bohr shell structures calculation
function calculateBohrShells(electrons: number): number[] {
  if (electrons <= 0) return [];
  const shells: number[] = [];
  let remaining = electrons;

  // Shell 1 (K): Max 2
  const k = Math.min(remaining, 2);
  shells.push(k);
  remaining -= k;

  if (remaining <= 0) return shells;

  // Shell 2 (L): Max 8
  const l = Math.min(remaining, 8);
  shells.push(l);
  remaining -= l;

  if (remaining <= 0) return shells;

  // Shell 3 (M): For first 18 elements, electrons fill up to 8 in the third shell (Argon Z=18 rules)
  const m = Math.min(remaining, 8);
  shells.push(m);
  remaining -= m;

  if (remaining > 0) {
    // Shell 4 (N): Fill the rest
    shells.push(remaining);
  }

  return shells;
}

// Play Sound Synthesis via Web Audio API 
function playAtomSound(type: 'click' | 'decay' | 'success' | 'fail' | 'levelUp', enabled: boolean = true) {
  if (!enabled) return;
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
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'decay') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'fail') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.25);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + i * 0.08);
        g.gain.setValueAtTime(0.06, now + i * 0.08);
        g.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.15);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.15);
      });
    } else if (type === 'levelUp') {
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760]; // A major arpeggio
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + i * 0.07);
        g.gain.setValueAtTime(0.05, now + i * 0.07);
        g.gain.linearRampToValueAtTime(0, now + i * 0.07 + 0.3);
        o.start(now + i * 0.07);
        o.stop(now + i * 0.07 + 0.35);
      });
    }
  } catch (_) {}
}

// Pre-defined missions for the Game Challenge Mode
interface CoreMission {
  id: number;
  title: string;
  instructions: string;
  protons: number;
  neutrons: number;
  electrons: number;
  hint: string;
}

const MISSIONS: CoreMission[] = [
  { id: 1, title: "Membangun Hidrogen-1", instructions: "Buat atom Hidrogen-1 (¹H) netral yang stabil.", protons: 1, neutrons: 0, electrons: 1, hint: "Hidrogen memiliki nomor atom 1 (1 proton). Karena netral, jumlah elektron harus sama dengan proton!" },
  { id: 2, title: "Isotop Helium-4", instructions: "Bangun atom Helium-4 (⁴He) netral yang stabil.", protons: 2, neutrons: 2, electrons: 2, hint: "Helium memiliki 2 proton. Helium-4 berarti total massa proton + neutron = 4." },
  { id: 3, title: "Kation Litium-7 Ionik", instructions: "Buat kation Litium-7 bermuatan positif (+1).", protons: 3, neutrons: 4, electrons: 2, hint: "Litium memiliki nomor atom 3. Kation +1 berarti ia kehilangan 1 elektron dari kondisi netralnya." },
  { id: 4, title: "Karbon-12 Organik", instructions: "Buat atom Karbon-12 (¹²C) netral yang stabil.", protons: 6, neutrons: 6, electrons: 6, hint: "Karbon memiliki nomor atom 6. Isotope yang paling umum memiliki jumlah neutron yang sama." },
  { id: 5, title: "Anion Oksigen-16 Stabil", instructions: "Konstruksikan anion Oksigen-16 bermuatan negatif (-2).", protons: 8, neutrons: 8, electrons: 10, hint: "Oksigen memiliki 8 proton. Anion bermuatan -2 berarti ia mengikat 2 elektron tambahan daripada protonnya." },
  { id: 6, title: "Kation Natrium-23 Eksplosif", instructions: "Buat kation Natrium-23 bermuatan positif (+1).", protons: 11, neutrons: 12, electrons: 10, hint: "Natrium memiliki nomor atom 11, massa 23 (12 neutron). Bermuatan +1 berarti ia kehilangan elektron kulit terluarnya." },
  { id: 7, title: "Stabilitas Gas Neon-20", instructions: "Bangun atom Neon-20 (²⁰Ne) netral dengan kulit elektron penuh (Gas Mulia).", protons: 10, neutrons: 10, electrons: 10, hint: "Neon memiliki 10 proton and 10 neutron. Karena gas mulia netral, buat jumlah proton dan elektron seimbang." }
];

interface QuantumBadge {
  id: number;
  name: string;
  missionName: string;
  description: string;
  rewardPoints: number;
  colorClass: string;
  glowClass: string;
  iconName: 'zap' | 'atom' | 'plus' | 'sparkles' | 'minus' | 'flame' | 'trophy';
}

const BADGES_DATA: QuantumBadge[] = [
  {
    id: 1,
    name: "Lencana Deuteron",
    missionName: "Hidrogen-1",
    description: "Memicu fusi partikel pertama untuk membentuk isotop Deuteron stabil.",
    rewardPoints: 100,
    colorClass: "from-emerald-500 to-teal-400 text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
    glowClass: "shadow-emerald-500/20 border-emerald-500/30",
    iconName: "zap"
  },
  {
    id: 2,
    name: "Lencana Inti Alpha",
    missionName: "Helium-4",
    description: "Berhasil menyintesis nukleus Helium-4 berkerapatan muatan tinggi.",
    rewardPoints: 100,
    colorClass: "from-blue-500 to-cyan-400 text-blue-405 border-blue-500/25 bg-blue-500/10",
    glowClass: "shadow-blue-500/20 border-blue-500/30",
    iconName: "atom"
  },
  {
    id: 3,
    name: "Lencana Kation Litium",
    missionName: "Litium-7 Ionik",
    description: "Membentuk kation alkali reaktif dengan lonjakan ionisasi elektron pertama.",
    rewardPoints: 105,
    colorClass: "from-indigo-500 to-purple-400 text-indigo-400 border-indigo-500/25 bg-indigo-500/10",
    glowClass: "shadow-indigo-500/20 border-indigo-500/30",
    iconName: "plus"
  },
  {
    id: 4,
    name: "Lencana Makro Karbon",
    missionName: "Karbon-12 Organik",
    description: "Menyusun struktur dasar allotrop karbon organik pemicu rantai kehidupan.",
    rewardPoints: 110,
    colorClass: "from-amber-500 to-orange-450 text-amber-400 border-amber-500/25 bg-amber-500/10",
    glowClass: "shadow-amber-500/20 border-amber-500/30",
    iconName: "sparkles"
  },
  {
    id: 5,
    name: "Lencana Oktaf Elektron",
    missionName: "Anion Oksigen-16",
    description: "Menjinakkan afinitas elektron oksigen untuk melengkapi kulit oktaf valensi.",
    rewardPoints: 115,
    colorClass: "from-pink-500 to-rose-450 text-pink-400 border-pink-500/25 bg-pink-500/10",
    glowClass: "shadow-pink-500/20 border-pink-500/30",
    iconName: "minus"
  },
  {
    id: 6,
    name: "Lencana Plasma Natrium",
    missionName: "Kation Natrium-23",
    description: "Menghasilkan kation natrium energetik eksplosif terhadap air.",
    rewardPoints: 120,
    colorClass: "from-orange-500 to-red-400 text-orange-450 border-orange-500/25 bg-orange-500/10",
    glowClass: "shadow-orange-500/20 border-orange-500/30",
    iconName: "flame"
  },
  {
    id: 7,
    name: "Lencana Gas Mulia",
    missionName: "Stabilitas Gas Neon",
    description: "Mencapai kestabilan sejati dari konfigurasi oktet gas mulia inert penuh.",
    rewardPoints: 130,
    colorClass: "from-purple-500 to-fuchsia-400 text-purple-400 border-purple-500/25 bg-purple-500/10",
    glowClass: "shadow-purple-500/20 border-purple-500/30",
    iconName: "trophy"
  }
];

const getBadgeName = (id: number): string => {
  const badge = BADGES_DATA.find(b => b.id === id);
  return badge ? badge.name : `Lencana Misi #${id}`;
};

const renderBadgeIcon = (iconName: 'zap' | 'atom' | 'plus' | 'sparkles' | 'minus' | 'flame' | 'trophy', sizeClass = "w-5 h-5") => {
  switch (iconName) {
    case 'zap': return <Zap className={sizeClass} />;
    case 'atom': return <Atom className={sizeClass} />;
    case 'plus': return <Plus className={sizeClass} />;
    case 'sparkles': return <Sparkles className={sizeClass} />;
    case 'minus': return <Minus className={sizeClass} />;
    case 'flame': return <Flame className={sizeClass} />;
    case 'trophy': return <Trophy className={sizeClass} />;
  }
};

import { UserAccount } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AtomBuilderLabProps {
  isGuruMode?: boolean;
  currentUser?: UserAccount | null;
}

export default function AtomBuilderLab({ isGuruMode: propIsGuruMode, currentUser }: AtomBuilderLabProps = {}) {
  // Read Guru mode from props or sync with localStorage
  const [localIsGuruMode, setLocalIsGuruMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('chemvibe_role_mode') === 'guru';
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    const handleRoleChange = (e: Event) => {
      const isGuru = (e as CustomEvent).detail?.isGuruMode;
      if (isGuru !== undefined) {
        setLocalIsGuruMode(isGuru);
      }
    };
    window.addEventListener('chemvibe_role_change', handleRoleChange);
    
    // Also periodic backup check
    const interval = setInterval(() => {
      const isGuru = localStorage.getItem('chemvibe_role_mode') === 'guru';
      if (isGuru !== localIsGuruMode) {
        setLocalIsGuruMode(isGuru);
      }
    }, 1000);

    return () => {
      window.removeEventListener('chemvibe_role_change', handleRoleChange);
      clearInterval(interval);
    };
  }, [localIsGuruMode]);

  const isGuruMode = propIsGuruMode !== undefined ? propIsGuruMode : localIsGuruMode;

  const [protons, setProtons] = useState<number>(1);
  const [neutrons, setNeutrons] = useState<number>(0);
  const [electrons, setElectrons] = useState<number>(1);

  // Interface controls toggle
  const [activeTab, setActiveTab] = useState<'sandbox' | 'challenges'>('sandbox');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSymbol, setShowSymbol] = useState<boolean>(true);
  const [showCloud, setShowCloud] = useState<boolean>(false);
  const [nuclearShieldActive, setNuclearShieldActive] = useState<boolean>(true);
  const [orbitSpeed, setOrbitSpeed] = useState<'slow' | 'normal' | 'fast' | 'paused'>('normal');
  const [orbitContrast, setOrbitContrast] = useState<'samar' | 'normal' | 'terang' | 'glow'>('terang');

  // Helper to determine the contrast styling class for each shell ring
  const getOrbitContrastClass = () => {
    switch (orbitContrast) {
      case 'samar':
        return 'border-slate-800/60 border-dashed';
      case 'normal':
        return 'border-slate-700/80 border-dashed bg-slate-950/20';
      case 'terang':
        return 'border-slate-500/80 border-dashed bg-sky-500/[0.015]';
      case 'glow':
        return 'border-sky-400/60 border-dashed bg-sky-400/[0.035] shadow-[0_0_15px_rgba(56,189,248,0.15),inset_0_0_15px_rgba(56,189,248,0.08)]';
      default:
        return 'border-slate-600/70 border-dashed';
    }
  };

  // Helper to determine the orbital spin speed class for each shell ring
  const getOrbitAnimationClass = (shellIdx: number) => {
    if (orbitSpeed === 'paused') return '';
    const speedMapping: Record<string, number[]> = {
      slow: [32, 56, 80, 100],
      normal: [12, 22, 32, 42],
      fast: [5, 10, 15, 20]
    };
    const duration = speedMapping[orbitSpeed][shellIdx] || 22;
    const isClockwise = shellIdx % 2 === 0;
    return isClockwise 
      ? `animate-[spin_${duration}s_linear_infinite]` 
      : `animate-[spin_${duration}s_linear_infinite_reverse]`;
  };

  // Challenge game modes
  const [currentMissionIndex, setCurrentMissionIndex] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('chemvibe_atombuilder_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameFeedback, setGameFeedback] = useState<{ status: 'idle' | 'success' | 'incorrect'; message: string }>({ status: 'idle', message: '' });
  const [completedMissions, setCompletedMissions] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('chemvibe_atombuilder_completed_missions');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Calculate matched element properties
  const matchedElement = BUILDER_ELEMENTS[protons] || null;
  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;

  // Nuclear stability determination
  let isStable = false;
  if (protons === 0) {
    isStable = false;
  } else if (matchedElement) {
    isStable = matchedElement.stableIsotopes.includes(neutrons);
  } else {
    // Falls back to ratio checking if beyond Z=18 (for extension safety)
    const ratio = neutrons / protons;
    isStable = ratio >= 1.0 && ratio <= 1.45;
  }

  // Effect to trigger instability warning or rumble audio for decay
  useEffect(() => {
    if (protons > 0 && !isStable) {
      // Trigger a light rumble warning oscillator sound if audio is enabled
      const bounceTimer = setTimeout(() => {
        playAtomSound('decay', soundEnabled);
      }, 500);
      return () => clearTimeout(bounceTimer);
    }
  }, [protons, neutrons, isStable, soundEnabled]);

  // Dispatch state updates to window for adaptive feedback
  useEffect(() => {
    (window as any).chemvibe_latest_state = {
      lab: 'atom-builder',
      timestamp: Date.now(),
      data: {
        protons,
        neutrons,
        electrons,
        massNumber,
        netCharge,
        isStable
      }
    };
    window.dispatchEvent(new CustomEvent('chemvibe_state_change', {
      detail: { lab: 'atom-builder' }
    }));
  }, [protons, neutrons, electrons, massNumber, netCharge, isStable]);

  // Re-sync local state when currentUser changes (e.g., login/logout)
  useEffect(() => {
    const savedMissions = localStorage.getItem('chemvibe_atombuilder_completed_missions');
    if (savedMissions) {
      try {
        setCompletedMissions(JSON.parse(savedMissions));
      } catch (_) {}
    } else {
      setCompletedMissions([]);
    }

    const savedSc = localStorage.getItem('chemvibe_atombuilder_highscore');
    if (savedSc) {
      setHighScore(parseInt(savedSc, 10) || 0);
    } else {
      setHighScore(0);
    }
  }, [currentUser]);

  const handleReset = () => {
    playAtomSound('click', soundEnabled);
    setProtons(1);
    setNeutrons(0);
    setElectrons(1);
    setGameFeedback({ status: 'idle', message: '' });
  };

  const adjustParticle = (type: 'p' | 'n' | 'e', delta: number) => {
    playAtomSound('click', soundEnabled);
    if (type === 'p') {
      setProtons(prev => Math.max(0, Math.min(18, prev + delta)));
    } else if (type === 'n') {
      setNeutrons(prev => Math.max(0, Math.min(22, prev + delta)));
    } else if (type === 'e') {
      setElectrons(prev => Math.max(0, Math.min(18, prev + delta)));
    }
    setGameFeedback({ status: 'idle', message: '' });
  };

  const handleCheckChallenge = () => {
    const currentMission = MISSIONS[currentMissionIndex];
    if (
      protons === currentMission.protons &&
      neutrons === currentMission.neutrons &&
      electrons === currentMission.electrons
    ) {
      playAtomSound('success', soundEnabled);
      const points = 100;
      const nextScore = gameScore + points;
      setGameScore(nextScore);
      if (nextScore > highScore) {
        setHighScore(nextScore);
        localStorage.setItem('chemvibe_atombuilder_highscore', nextScore.toString());
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.id), {
            atomHighscore: nextScore
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.id}`);
          });

          setDoc(doc(db, 'public_profiles', currentUser.id), {
            atomHighscore: nextScore,
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `public_profiles/${currentUser.id}`);
          });
        }
      }

      // Track completed missions
      let isNewlyCompleted = false;
      let updatedCompleted = [...completedMissions];
      if (!completedMissions.includes(currentMission.id)) {
        isNewlyCompleted = true;
        updatedCompleted.push(currentMission.id);
        setCompletedMissions(updatedCompleted);
        localStorage.setItem('chemvibe_atombuilder_completed_missions', JSON.stringify(updatedCompleted));
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.id), {
            completedMissions: updatedCompleted
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.id}`);
          });

          setDoc(doc(db, 'public_profiles', currentUser.id), {
            completedMissions: updatedCompleted,
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `public_profiles/${currentUser.id}`);
          });
        }
      }

      setGameFeedback({
        status: 'success',
        message: isNewlyCompleted 
          ? `Luar biasa! Lencana Kuantum Baru Terbuka: "${getBadgeName(currentMission.id)}"! (+100 pts)`
          : `Luar biasa! Anda berhasil menyusun ${matchedElement?.name || 'Atom'} dengan tepat! (+100 pts)`
      });

      // Dispatch dynamic chemvibe_activity event
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          title: `Misi #${currentMission.id} Selesai!`,
          description: `Berhasil menyusun ${matchedElement?.name || 'Atom'} dan meraih "${getBadgeName(currentMission.id)}"`,
          score: { earned: 100, total: 100 }
        }
      }));

      // If all 7 are completed now, fire an almighty master event!
      if (isNewlyCompleted && updatedCompleted.length === 7) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('chemvibe_activity', {
            detail: {
              activityType: 'quiz_completed',
              title: `Grandmaster Kuantum!`,
              description: `Selamat! Berhasil melengkapi KOLEKSI LENCANA KUANTUM penuh (7/7)!`,
              score: { earned: 250, total: 250 }
            }
          }));
        }, 1500);
      }

    } else {
      playAtomSound('fail', soundEnabled);
      let errorDesc = "Susunan partikel belum cocok.";
      if (protons !== currentMission.protons) {
        errorDesc += " Nomor atom salah (jumlah Proton tidak tepat).";
      } else if (neutrons !== currentMission.neutrons) {
        errorDesc += " Massa isotop salah (jumlah Neutron tidak tepat).";
      } else if (electrons !== currentMission.electrons) {
        errorDesc += " Muatan ionik salah (jumlah Elektron tidak tepat).";
      }
      setGameFeedback({
        status: 'incorrect',
        message: `Belum Tepat: ${errorDesc} Coba lagi!`
      });
    }
  };

  const handleNextMission = () => {
    playAtomSound('click', soundEnabled);
    const nextIdx = (currentMissionIndex + 1) % MISSIONS.length;
    setCurrentMissionIndex(nextIdx);
    setGameFeedback({ status: 'idle', message: '' });
    
    // Set sandbox numbers to match the target slightly or preserve
    const target = MISSIONS[nextIdx];
    // Give user a clean slate
    setProtons(1);
    setNeutrons(0);
    setElectrons(1);
  };

  // Render Bohr orbit configurations helper
  const bohrShells = calculateBohrShells(electrons);

  // Unified Nucleon cluster coordinates calculation to render mixed interlocked protons & neutrons
  const getNucleonCluster = () => {
    const list: Array<{ x: number; y: number; type: 'p' | 'n'; colorClass: string; label: string }> = [];
    const total = protons + neutrons;
    if (total <= 0) return list;

    // Distribute type assignments fairly
    const types: Array<'p' | 'n'> = [];
    let pLeft = protons;
    let nLeft = neutrons;
    
    // Mix them evenly
    while (pLeft > 0 || nLeft > 0) {
      if (pLeft > 0 && (types.length % 2 === 0 || nLeft === 0)) {
        types.push('p');
        pLeft--;
      } else if (nLeft > 0) {
        types.push('n');
        nLeft--;
      }
    }

    // Generate positions using golden ratio spiral distribution for a perfectly packed spherical clump
    for (let i = 0; i < total; i++) {
      const angle = i * 2.39996; // Golden angle in radians
      // Pack them closely: scale factor grows with square root of index
      const dist = Math.sqrt(i + 0.5) * 11.5; 
      
      const type = types[i];
      const isProton = type === 'p';

      list.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        type,
        colorClass: isProton 
          ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-650 shadow-[inset_2.5px_2.5px_4px_rgba(255,255,255,0.95),inset_-3px_-3px_5px_rgba(0,0,0,0.8),2px_3px_5px_rgba(0,0,0,0.65),0_1.5px_2px_rgba(0,0,0,0.4)]' 
          : 'bg-gradient-to-br from-zinc-100 via-zinc-400 to-zinc-650 shadow-[inset_2.5px_2.5px_4px_rgba(255,255,255,0.7),inset_-3px_-3px_5px_rgba(0,0,0,0.75),2px_3px_5px_rgba(0,0,0,0.65),0_1.5px_2px_rgba(0,0,0,0.4)]',
        label: isProton ? '+' : ''
      });
    }

    // Sort nucleons by distance/Y-coord to render realistic layer overlapping depth!
    // Stacking bottom-to-top (higher Y value rendered on top) allows natural isometric 3D stacking
    return list.sort((a, b) => a.y - b.y);
  };

  // Helper to generate coordinates of remaining particles inside a stock bowl
  const getBowlBalls = (count: number) => {
    const arr = [];
    const visibleCount = Math.min(count, 10);
    
    // Ordered bottom to top so they overlay naturally
    const pileCoordinates = [
      { x: -21, y: 14 }, 
      { x: -7, y: 14 }, 
      { x: 7, y: 14 }, 
      { x: 21, y: 14 },
      
      { x: -14, y: 2 }, 
      { x: 0, y: 2 }, 
      { x: 14, y: 2 },
      
      { x: -7, y: -10 }, 
      { x: 7, y: -10 },
      
      { x: 0, y: -22 }
    ];

    for (let i = 0; i < visibleCount; i++) {
      arr.push(pileCoordinates[i]);
    }
    return arr;
  };

  const activeMission = MISSIONS[currentMissionIndex];

  return (
    <div className="space-y-6">
      {/* APP HEADER DESCRIPTOR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 animate-fade-in">
            <Atom className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-black text-white tracking-tight">Virtual Quantum Atom Builder</h2>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Simulasi Bohr & Isotope
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Bangun atom netral atau ion dengan memanipulasi elektron, proton, dan neutron secara real-time. Pelajari struktur nuklir dan cangkang Bohr.
          </p>
        </div>

        {/* Tab Selection Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Sounds trigger */}
          <button 
            onClick={() => {
              playAtomSound('click', !soundEnabled);
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled 
                ? 'bg-slate-900 border-teal-500/30 text-teal-400 hover:bg-slate-800' 
                : 'bg-slate-950 border-slate-900 text-slate-500'
            }`}
            title={soundEnabled ? "Nonaktifkan Suara" : "Aktifkan Efek Suara"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Module tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 overflow-hidden w-full lg:w-auto lab-tab-container">
            <button
              onClick={() => {
                playAtomSound('click', soundEnabled);
                setActiveTab('sandbox');
              }}
              className={`flex-1 lg:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'sandbox'
                  ? 'bg-slate-850 text-white lab-tab-active'
                  : 'text-slate-400 hover:text-white lab-tab-inactive'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              Eksperimen Bebas
            </button>
            <button
              onClick={() => {
                playAtomSound('click', soundEnabled);
                setActiveTab('challenges');
              }}
              className={`flex-1 lg:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'challenges'
                  ? 'bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-teal-500/20 text-teal-300 border border-teal-500/30 font-extrabold shadow-sm shadow-teal-500/10 lab-challenges-active'
                  : 'text-slate-400 hover:text-white lab-tab-inactive'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Misi Tantangan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INTERACTIVE VISUAL CORE CANVAS WORKSPACE (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between min-h-[460px] overflow-hidden">
            
            {/* Background elements & labels */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">
              <span>MODEL TRANSMISI: BOHR-CLASS Q1</span>
              <span>KAPASITAS KULIT: K=2, L=8, M=8</span>
            </div>

            {/* Top-right Status Panels (Notation & Stability Badge) */}
            <div className="absolute top-4 right-4 flex items-center gap-2.5 z-10">
              {/* Nuclear Notation Box */}
              {showSymbol && (
                <div className="bg-slate-950/95 border border-slate-700/80 p-2.5 py-1.5 rounded-xl flex items-center gap-1 font-sans select-none shadow-xl">
                  {/* Mass number (A) top left */}
                  <div className="flex flex-col items-end text-right text-[10px] leading-none font-extrabold font-mono">
                    <span className="text-teal-400 font-black" title="Nomor Massa (A)">{massNumber}</span>
                    <span className="text-rose-400 border-t border-slate-700 w-full pt-0.5 mt-0.5 pr-0.5 font-black" title="Nomor Atom (Z)">{protons}</span>
                  </div>
                  {/* Symbol */}
                  <span className="text-2xl font-black text-white pl-2 font-sans select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                    {protons === 0 ? '?' : (matchedElement?.symbol || 'X')}
                  </span>
                  {/* Charge (net charge) top right */}
                  {netCharge !== 0 && (
                    <span className="text-[10px] font-mono font-black text-amber-400 align-top self-start pl-0.5 leading-none mt-0.5">
                      {netCharge > 0 ? `+${netCharge}` : netCharge}
                    </span>
                  )}
                </div>
              )}

              {/* Stability Stamp icon */}
              {protons > 0 && (
                <div className={`p-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-mono font-black select-none tracking-wide shadow-md ${
                  isStable 
                    ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)] stability-stamp-stable' 
                    : 'bg-amber-950/90 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse stability-stamp-unstable'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isStable ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'}`} />
                  <span>{isStable ? 'INTI STABIL' : 'TIDAK STABIL'}</span>
                </div>
              )}
            </div>

            {/* CORE ORBITAL SIMULATION MATRIX AREA */}
            <div id="bohr-orbital-matrix" className="flex-1 flex items-center justify-center relative p-8 my-4 select-none bohr-orbital-matrix">
              {/* Radial field gradient backplate */}
              <div className="absolute w-full h-full max-w-[320px] max-h-[320px] rounded-full bg-slate-900/10 shadow-[inset_0_0_80px_rgba(45,212,191,0.03)]" />

              {/* Electron atomic cloud cloud backdrop style */}
              {showCloud && electrons > 0 && (
                <div 
                  className="absolute rounded-full bg-teal-500/5 blur-xl transition-all duration-300"
                  style={{
                    width: `${Math.min(90 + electrons * 12, 280)}px`,
                    height: `${Math.min(90 + electrons * 12, 280)}px`,
                  }}
                />
              )}

              {/* NUCLEUS CENTERPIECE */}
              <div 
                className={`w-32 h-32 rounded-full absolute flex items-center justify-center z-20 ${
                  protons > 0 && !isStable && nuclearShieldActive ? 'animate-bounce-short border-amber-500/15 border border-dashed' : ''
                }`}
              >
                {/* Visual grid boundaries */}
                <div className="absolute w-24 h-24 rounded-full bg-slate-950/70 border border-slate-900/85 backdrop-blur-xs flex items-center justify-center" />
                
                {/* Composite Mixed Spheres (Protons & Neutrons sorted in 3D overlapping stack) */}
                {getNucleonCluster().map((nucleon, i) => (
                  <div 
                    key={`nucleon-${i}`}
                    className={`absolute w-[26px] h-[26px] rounded-full flex items-center justify-center text-[13px] text-white font-sans font-black border border-white/30 border-b-slate-950/40 transform hover:scale-115 active:scale-95 transition-all duration-300 ${nucleon.colorClass}`}
                    style={{ transform: `translate(${nucleon.x}px, ${nucleon.y}px)` }}
                    title={nucleon.type === 'p' ? 'Proton (+)' : 'Neutron (0)'}
                  >
                    {nucleon.label}
                  </div>
                ))}

                {/* Zero particle core filler text */}
                {protons === 0 && neutrons === 0 && (
                  <div className="text-[10px] text-slate-500 font-mono text-center z-10 font-bold max-w-[65px] leading-tight">
                    Nukleus Kosong
                  </div>
                )}
              </div>

              {/* BOHR ELECTRON ENERGY LEVEL RINGS (Shells) */}
              {bohrShells.map((count, shellIdx) => {
                const radius = 62 + shellIdx * 35; // Shell orbit radius steps
                const shellLabel = ['K', 'L', 'M', 'N'][shellIdx] || `N${shellIdx+1}`;
                const animationClass = getOrbitAnimationClass(shellIdx);
                
                return (
                  <div 
                    key={shellIdx} 
                    className={`absolute rounded-full flex items-center justify-center border transition-all duration-500 pointer-events-none ${getOrbitContrastClass()} ${animationClass}`}
                    style={{ 
                      width: `${radius * 2}px`, 
                      height: `${radius * 2}px`
                    }}
                  >
                    {/* Orbit Ring identifier */}
                    <span className="absolute -top-3 text-[8px] font-mono text-sky-400 font-bold tracking-tight bg-slate-950 border border-slate-800/60 px-1 py-0.5 rounded shadow-sm">
                      Shell {shellLabel}
                    </span>

                    {/* Orbiting negative Electrons */}
                    {Array.from({ length: count }).map((_, eIdx) => {
                      const angle = (eIdx / count) * 360;
                      return (
                        <div
                          key={eIdx}
                          className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 absolute border border-white/20 flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1.5px_-1.5px_2px_rgba(0,0,0,0.55),0_0_8px_rgba(59,130,246,0.6)] animate-pulse"
                          style={{
                            // CSS-driven mathematical solar rotation
                            transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
                          }}
                        >
                          <span className="text-[10px] font-black text-white select-none pb-0.5 leading-none">-</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* CONTROL PANEL UTILITY TOGGLES OF SANDBOX (Bottom Bar) */}
            <div className="flex flex-wrap gap-2.5 pt-4 border-t border-slate-900 z-10 text-xs">
              <button
                onClick={() => setShowSymbol(!showSymbol)}
                className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-[10px] transition-all cursor-pointer ${
                  showSymbol 
                    ? 'bg-slate-900 border-teal-500/30 text-teal-400' 
                    : 'bg-slate-950 border-slate-900 text-slate-500'
                }`}
              >
                SIMBOL: {showSymbol ? 'AKTIF' : 'SEMBUNYI'}
              </button>
              <button
                onClick={() => setShowCloud(!showCloud)}
                className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-[10px] transition-all cursor-pointer ${
                  showCloud 
                    ? 'bg-slate-900 border-teal-500/30 text-teal-400' 
                    : 'bg-slate-950 border-slate-900 text-slate-500'
                }`}
              >
                AWAN ELEKTRON: {showCloud ? 'TAMPIL' : 'MATI'}
              </button>
              <button
                onClick={() => setNuclearShieldActive(!nuclearShieldActive)}
                className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-[10px] transition-all cursor-pointer ${
                  nuclearShieldActive 
                    ? 'bg-slate-900 border-teal-500/30 text-teal-400' 
                    : 'bg-slate-950 border-slate-900 text-slate-500'
                }`}
                title="Beri getaran visual jika rasio neutron/proton tidak stabil"
              >
                EFEK RADIOTERMAL: {nuclearShieldActive ? 'ON' : 'OFF'}
              </button>

              {/* Dynamic orbit speed controller */}
              <button
                onClick={() => {
                  playAtomSound('click', soundEnabled);
                  setOrbitSpeed(prev => {
                    if (prev === 'normal') return 'fast';
                    if (prev === 'fast') return 'paused';
                    if (prev === 'paused') return 'slow';
                    return 'normal';
                  });
                }}
                className="px-3 py-1.5 rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 font-mono font-bold text-[10px] bg-slate-900 text-indigo-400 transition-all cursor-pointer"
                title="Ganti kecepatan putaran elektron di kulit atom"
              >
                ORBIT ELEKTRON: {orbitSpeed === 'paused' ? 'DIHENTIKAN' : orbitSpeed === 'slow' ? 'LAMBAT' : orbitSpeed === 'fast' ? 'CEPAT' : 'NORMAL'}
              </button>

              {/* Bohr Orbit Contrast modifier */}
              <button
                onClick={() => {
                  playAtomSound('click', soundEnabled);
                  setOrbitContrast(prev => {
                    if (prev === 'samar') return 'normal';
                    if (prev === 'normal') return 'terang';
                    if (prev === 'terang') return 'glow';
                    return 'samar';
                  });
                }}
                className="px-3 py-1.5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 font-mono font-bold text-[10px] bg-slate-900 text-cyan-400 transition-all cursor-pointer"
                title="Sesuaikan tingkat visibilitas / kontras garis lintasan orbit Bohr"
              >
                KONTRAS ORBIT: {orbitContrast === 'samar' ? 'SAMAR (MIN)' : orbitContrast === 'normal' ? 'NORMAL' : orbitContrast === 'terang' ? 'TERANG' : 'GLOW / BERSINAR'}
              </button>

              <button
                onClick={handleReset}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono font-black text-rose-400 hover:text-white cursor-pointer transition-colors"
                title="Reset seluruh partikel atom ke semula"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>BERSIHKAN</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC BENTO PARTICLE MANIPULATOR CONTROLS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* PROTON PHYSICAL BUCKET */}
            <div className="bg-slate-950/90 p-5 rounded-3xl border border-rose-500/30 flex flex-col items-center justify-between min-h-[225px] relative overflow-hidden group select-none shadow-[0_4px_20px_rgba(239,68,68,0.06)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full pointer-events-none" />
              
              {/* Header Labeling */}
              <div className="w-full flex justify-between items-start z-10">
                <div>
                  <h3 className="text-xs font-black text-rose-400 font-sans tracking-wide uppercase">PROTON (p⁺)</h3>
                  <div className="mt-1">
                    <span className="text-[10px] font-mono text-rose-300 font-extrabold bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-900/40 inline-block shadow-sm">
                      Sisa: {18 - protons}
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-black text-rose-300 font-mono tracking-tight bg-rose-950/60 px-2.5 py-0.5 rounded-xl border border-rose-500/40 shadow-inner">{protons}</span>
              </div>

              {/* INTERACTIVE 3D BOWL CONTROLLER */}
              <div 
                onClick={() => protons < 18 && adjustParticle('p', 1)}
                className="relative w-full h-24 flex items-center justify-center cursor-pointer transform hover:scale-104 transition-all duration-300 mt-2 z-10 group"
                title="Klik untuk mengambil proton (+)"
              >
                {/* Bowl Backside Lip Ellipse */}
                <div className="w-36 h-4 rounded-full bg-orange-950/80 border border-orange-850 absolute bottom-11 z-0 shadow-inner" />
                
                {/* Dynamically stacked balls heap */}
                <div className="absolute w-36 h-16 bottom-[18px] flex items-center justify-center pointer-events-none z-10 overflow-visible">
                  <div className="relative w-full h-full">
                    {getBowlBalls(18 - protons).map((coord, idx) => (
                      <div
                        key={idx}
                        className="absolute w-[18px] h-[18px] rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-650 border border-white/25 border-b-slate-950/40 shadow-[inset_2px_2px_3px_rgba(255,255,255,0.9),inset_-2.5px_-2.5px_4px_rgba(0,0,0,0.7),1.5px_2px_3.5px_rgba(0,0,0,0.55),0_1px_2px_rgba(0,0,0,0.4)]"
                        style={{
                          left: `calc(50% + ${coord.x}px - 9px)`,
                          top: `calc(50% + ${coord.y}px - 9px)`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bowl Front Face */}
                <div className="w-36 h-12 rounded-b-[20px] bg-gradient-to-b from-orange-900 via-orange-950 to-red-950 border border-t-0 border-orange-700 absolute bottom-0 z-20 shadow-xl flex items-center justify-center p-1 group-hover:border-rose-550 transition-colors duration-300">
                  <div className="bg-orange-950/45 px-3 py-1 rounded border border-orange-800/50 shadow-inner">
                    <span className="text-rose-200 font-extrabold tracking-widest text-[11px] font-sans uppercase">Protons</span>
                  </div>
                </div>
              </div>

              {/* Adjusters Side By Side */}
              <div className="flex items-center gap-4 mt-1 z-10 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustParticle('p', -1);
                  }}
                  disabled={protons <= 0}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700/80 text-rose-400 hover:bg-rose-950/50 hover:border-rose-500/50 hover:text-rose-300 active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md"
                  aria-label="Kurangi Proton"
                  title="Kurangi Proton"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustParticle('p', 1);
                  }}
                  disabled={protons >= 18}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700/80 text-rose-400 hover:bg-rose-950/50 hover:border-rose-500/50 hover:text-rose-300 active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md"
                  aria-label="Tambah Proton"
                  title="Tambah Proton"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
                      {/* NEUTRON PHYSICAL BUCKET */}
            <div className="bg-slate-950/90 p-5 rounded-3xl border border-sky-500/30 flex flex-col items-center justify-between min-h-[225px] relative overflow-hidden group select-none shadow-[0_4px_20px_rgba(14,165,233,0.06)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-2xl rounded-full pointer-events-none" />
              
              {/* Header Labeling */}
              <div className="w-full flex justify-between items-start z-10">
                <div>
                  <h3 className="text-xs font-black text-sky-400 font-sans tracking-wide uppercase">NEUTRON (n⁰)</h3>
                  <div className="mt-1">
                    <span className="text-[10px] font-mono text-sky-300 font-extrabold bg-sky-950/50 px-2 py-0.5 rounded-md border border-sky-900/40 inline-block shadow-sm">
                      Sisa: {22 - neutrons}
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-black text-sky-300 font-mono tracking-tight bg-sky-950/60 px-2.5 py-0.5 rounded-xl border border-sky-500/40 shadow-inner">{neutrons}</span>
              </div>

              {/* INTERACTIVE 3D BOWL CONTROLLER */}
              <div 
                onClick={() => neutrons < 22 && adjustParticle('n', 1)}
                className="relative w-full h-24 flex items-center justify-center cursor-pointer transform hover:scale-104 transition-all duration-300 mt-2 z-10 group"
                title="Klik untuk mengambil neutron (0)"
              >
                {/* Bowl Backside Lip Ellipse */}
                <div className="w-36 h-4 rounded-full bg-zinc-800/80 border border-zinc-700 absolute bottom-11 z-0 shadow-inner" />
                
                {/* Dynamically stacked balls heap */}
                <div className="absolute w-36 h-16 bottom-[18px] flex items-center justify-center pointer-events-none z-10 overflow-visible">
                  <div className="relative w-full h-full">
                    {getBowlBalls(22 - neutrons).map((coord, idx) => (
                      <div
                        key={idx}
                        className="absolute w-[18px] h-[18px] rounded-full bg-gradient-to-br from-zinc-100 via-zinc-400 to-zinc-600 border border-white/20 border-b-slate-950/40 shadow-[inset_2px_2px_3px_rgba(255,255,255,0.75),inset_-2.5px_-2.5px_4px_rgba(0,0,0,0.7),1.5px_2px_3.5px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.4)]"
                        style={{
                          left: `calc(50% + ${coord.x}px - 9px)`,
                          top: `calc(50% + ${coord.y}px - 9px)`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bowl Front Face */}
                <div className="w-36 h-12 rounded-b-[20px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 border border-t-0 border-zinc-600 absolute bottom-0 z-20 shadow-xl flex items-center justify-center p-1 group-hover:border-sky-550 transition-colors duration-300">
                  <div className="bg-zinc-900/40 px-3 py-1 rounded border border-zinc-700/50 shadow-inner">
                    <span className="text-zinc-200 font-extrabold tracking-widest text-[11px] font-sans uppercase">Neutrons</span>
                  </div>
                </div>
              </div>

              {/* Adjusters Side By Side */}
              <div className="flex items-center gap-4 mt-1 z-10 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustParticle('n', -1);
                  }}
                  disabled={neutrons <= 0}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700/80 text-sky-450 hover:bg-sky-950/50 hover:border-sky-500/50 hover:text-sky-300 active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md"
                  aria-label="Kurangi Neutron"
                  title="Kurangi Neutron"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustParticle('n', 1);
                  }}
                  disabled={neutrons >= 22}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700/80 text-sky-450 hover:bg-sky-950/50 hover:border-sky-500/50 hover:text-sky-300 active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md"
                  aria-label="Tambah Neutron"
                  title="Tambah Neutron"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* ELECTRON PHYSICAL BUCKET */}
            <div className="bg-slate-950/90 p-5 rounded-3xl border border-teal-500/30 flex flex-col items-center justify-between min-h-[225px] relative overflow-hidden group select-none shadow-[0_4px_20px_rgba(20,184,166,0.06)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-2xl rounded-full pointer-events-none" />
              
              {/* Header Labeling */}
              <div className="w-full flex justify-between items-start z-10">
                <div>
                  <h3 className="text-xs font-black text-cyan-400 font-sans tracking-wide uppercase">ELEKTRON (e⁻)</h3>
                  <div className="mt-1">
                    <span className="text-[10px] font-mono text-cyan-300 font-extrabold bg-teal-950/50 px-2 py-0.5 rounded-md border border-teal-900/40 inline-block shadow-sm">
                      Sisa: {18 - electrons}
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-black text-cyan-300 font-mono tracking-tight bg-cyan-950/60 px-2.5 py-0.5 rounded-xl border border-teal-500/40 shadow-inner">{electrons}</span>
              </div>

              {/* INTERACTIVE 3D BOWL CONTROLLER */}
              <div 
                onClick={() => electrons < 18 && adjustParticle('e', 1)}
                className="relative w-full h-24 flex items-center justify-center cursor-pointer transform hover:scale-104 transition-all duration-300 mt-2 z-10 group"
                title="Klik untuk mengambil elektron (-)"
              >
                {/* Bowl Backside Lip Ellipse */}
                <div className="w-36 h-4 rounded-full bg-blue-900/80 border border-blue-800 absolute bottom-11 z-0 shadow-inner" />
                
                {/* Dynamically stacked balls heap */}
                <div className="absolute w-36 h-16 bottom-[18px] flex items-center justify-center pointer-events-none z-10 overflow-visible">
                  <div className="relative w-full h-full">
                    {getBowlBalls(18 - electrons).map((coord, idx) => (
                      <div
                        key={idx}
                        className="absolute w-[18px] h-[18px] rounded-full bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-700 border border-white/25 border-b-slate-950/45 shadow-[inset_2px_2px_3px_rgba(255,255,255,0.9),inset_-2.5px_-2.5px_4px_rgba(0,0,0,0.65),1.5px_2px_3.5px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.4)]"
                        style={{
                          left: `calc(50% + ${coord.x}px - 9px)`,
                          top: `calc(50% + ${coord.y}px - 9px)`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bowl Front Face */}
                <div className="w-36 h-12 rounded-b-[20px] bg-gradient-to-b from-blue-900 via-blue-950 to-indigo-950 border border-t-0 border-blue-800/80 absolute bottom-0 z-20 shadow-xl flex items-center justify-center p-1 group-hover:border-teal-550 transition-colors duration-300">
                  <div className="bg-blue-950/50 px-3 py-1 rounded border border-blue-900/50 shadow-inner">
                    <span className="text-sky-200 font-extrabold tracking-widest text-[11px] font-sans uppercase">Electrons</span>
                  </div>
                </div>
              </div>

              {/* Adjusters Side By Side */}
              <div className="flex items-center gap-4 mt-1 z-10 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustParticle('e', -1);
                  }}
                  disabled={electrons <= 0}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700/80 text-cyan-400 hover:bg-cyan-950/50 hover:border-cyan-500/50 hover:text-cyan-300 active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md"
                  aria-label="Kurangi Elektron"
                  title="Kurangi Elektron"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    adjustParticle('e', 1);
                  }}
                  disabled={electrons >= 18}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700/80 text-cyan-400 hover:bg-cyan-950/50 hover:border-cyan-500/50 hover:text-cyan-300 active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none transition-all shadow-md"
                  aria-label="Tambah Elektron"
                  title="Tambah Elektron"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: EXPERIMENT DIAGNOSTICS & CHALLENGES CORE INFO (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* RENDER VIEW tab: EXPERIMENT SANDBOX INFO */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              
              {/* ATOM METRICS AND IDENTIFICATION CARD */}
              <div className="glass-panel border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-xs font-mono font-extrabold text-slate-550 uppercase tracking-widest leading-none">ANALISIS QUANTUM ATOM</h3>
                
                {protons > 0 && matchedElement ? (
                  <div className="space-y-5">
                    {/* Element display container */}
                    <div className="flex items-center gap-4 p-4.5 bg-slate-950/70 border border-slate-900 rounded-2xl relative">
                      <div className="absolute right-3.5 top-3.5 text-zinc-700 font-mono text-[10px] font-black">
                        #{matchedElement.number}
                      </div>

                      {/* Chemical Tile (Nuclear Notation format AZX) */}
                      <div className="flex bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 py-2 items-center gap-1.5 select-none shadow-md min-w-[70px] justify-center" title="Notasi Nuklir (AZX)">
                        {/* A / Z stack */}
                        <div className="flex flex-col items-end text-right font-mono text-[9px] leading-none font-black select-none">
                          <span className="text-teal-400" title="Nomor Massa / Mass Number (A)">{massNumber}</span>
                          <span className="text-rose-400 border-t border-slate-800 w-full pt-1 mt-0.5 pr-0.5" title="Nomor Atom / Atomic Number (Z)">{protons}</span>
                        </div>
                        {/* Element Symbol */}
                        <span className="text-2xl font-sans font-black text-white px-0.5 leading-none select-none drop-shadow-[0_1px_2.5px_rgba(0,0,0,0.4)]">
                          {matchedElement.symbol}
                        </span>
                        {/* Net Charge Exponent */}
                        {netCharge !== 0 && (
                          <span className="text-[9px] font-mono font-black text-amber-400 align-top self-start -ml-1.5 leading-none">
                            {netCharge > 0 ? `+${netCharge}` : netCharge}
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-lg font-black text-white tracking-tight">{matchedElement.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-850 px-2 py-0.5 rounded text-[9.5px] font-bold text-slate-400 border border-slate-800 uppercase tracking-wider">
                            {matchedElement.category}
                          </span>
                          <span className="text-[10px] text-zinc-550 font-bold font-mono">({matchedElement.phase})</span>
                        </div>
                      </div>
                    </div>

                    {/* NET CHARGE STATUS BOARD */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400">MUATAN NET (Net Charge)</span>
                        <span className={`font-mono font-extrabold px-1.5 py-0.5 rounded ${
                          netCharge === 0 
                            ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/20' 
                            : netCharge > 0 
                              ? 'text-amber-400 bg-amber-500/5 border border-amber-500/20' 
                              : 'text-sky-400 bg-sky-500/5 border border-sky-500/20'
                        }`}>
                          {netCharge === 0 ? '0 (Atom Netral)' : netCharge > 0 ? `+${netCharge} (Kation)` : `${netCharge} (Anion)`}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-950 rounded-full border border-slate-900 relative overflow-hidden">
                        {/* Center marker */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-slate-700" />
                        {/* Progress slider bar */}
                        <div 
                          className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ${
                            netCharge === 0 
                              ? 'left-1/2 w-0.5 bg-emerald-400' 
                              : netCharge > 0 
                                ? 'left-1/2 bg-amber-500' 
                                : 'right-1/2 bg-sky-400'
                          }`}
                          style={{
                            width: netCharge === 0 ? '0px' : `${Math.min(Math.abs(netCharge) * 10, 50)}%`,
                            left: netCharge < 0 ? `${50 - Math.min(Math.abs(netCharge) * 10, 50)}%` : '50%'
                          }}
                        />
                      </div>
                      <p className="text-[9.5px] text-zinc-550 leading-relaxed font-mono">
                        Elektron kuantum negative (-{electrons}e⁻) mengimbangi Proton positive (+{protons}p⁺) di inti.
                      </p>
                    </div>

                    {/* NUCLEUS STATS GRID */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                        <span className="text-[9.5px] text-slate-550 block font-bold leading-none">MASSA ATOM (A)</span>
                        <span className="text-sm font-black text-slate-200 mt-1 block tracking-tight">
                          {massNumber} <span className="text-[9.5px] font-normal text-slate-500">amu</span>
                        </span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                        <span className="text-[9.5px] text-slate-550 block font-bold leading-none">N / Z RATIO</span>
                        <span className="text-sm font-black text-slate-200 mt-1 block tracking-tight">
                          {protons > 0 ? (neutrons / protons).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>

                    {/* STANDARDIZED NUCLIDE NOTATION INTERACTIVE VISUALIZER ($_Z^A X^{\pm q}$) */}
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3.5 shadow-inner">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-900/40">
                        <span className="text-[10px] font-sans text-teal-400 font-extrabold uppercase tracking-wider block">
                          Visualisasi Notasi Nuklida Standar
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 font-bold">
                          {"_Z^A X^{\\pm q}"}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center py-4.5 bg-slate-905/40 rounded-xl border border-slate-900/50 relative overflow-hidden">
                        {/* Standard Notation Mathematical Representation layout */}
                        <div className="flex items-center font-serif text-slate-200">
                          {/* Left Super/Sub positions for A and Z */}
                          <div className="flex flex-col items-end text-right mr-1.5 select-none font-mono">
                            <span className="text-teal-400 text-sm font-black tracking-tighter" title="Nomor Massa (A) = Proton + Neutron">{massNumber}</span>
                            <span className="text-rose-400 text-sm border-t border-slate-800 w-full pt-1.5 mt-1 pr-0.5 font-black tracking-tighter" title="Nomor Atom (Z) = Jumlah Proton">{protons}</span>
                          </div>
                          
                          {/* Middle Chemical Symbol */}
                          <div className="relative group cursor-help" title={`Simbol Unsur: ${matchedElement.name}`}>
                            <span className="text-5xl font-sans font-black text-white px-2 select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                              {matchedElement.symbol}
                            </span>
                          </div>

                          {/* Right Exponent for charge q */}
                          <div className="h-10 flex items-start select-none font-mono font-black text-amber-400">
                            {netCharge !== 0 ? (
                              <span className="text-sm align-top leading-none animate-pulse">
                                {netCharge > 0 ? `+${netCharge}` : netCharge}
                              </span>
                            ) : (
                              <span className="text-[9px] text-zinc-500 font-bold self-start mt-1 bg-slate-950/40 px-1.5 py-0.5 rounded leading-none border border-slate-850">0</span>
                            )}
                          </div>
                        </div>

                        {/* Interactive annotated guides for students */}
                        <div className="w-full mt-4.5 px-3 grid grid-cols-2 gap-2 text-[9.5px] font-mono text-slate-400">
                          <div className="p-2 bg-slate-950/45 rounded-lg border border-slate-900/60 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                              <span className="text-teal-400 font-extrabold">A = {massNumber}</span>
                            </div>
                            <span className="text-[8.5px] text-slate-500 block leading-tight">Nomor Massa<br />(Proton + Neutron)</span>
                          </div>

                          <div className="p-2 bg-slate-950/45 rounded-lg border border-slate-900/60 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              <span className="text-rose-400 font-extrabold">Z = {protons}</span>
                            </div>
                            <span className="text-[8.5px] text-slate-500 block leading-tight">Nomor Atom<br />(Jumlah Proton)</span>
                          </div>

                          <div className="p-2 bg-slate-950/45 rounded-lg border border-slate-900/60 space-y-0.5 col-span-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span className="text-amber-400 font-extrabold">Muatan (q) = {netCharge > 0 ? `+${netCharge}` : netCharge}</span>
                              </div>
                              <span className="text-[8.5px] text-slate-500">P - E = {protons} - {electrons}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ISOTOPE STABILITY EXPLANATORY WITH DYNAMIC MAP */}
                    <div className="space-y-4">
                      {/* Interactive Zone of Stability Map */}
                      <div className="p-4 bg-slate-950/70 border border-slate-900 rounded-xl space-y-3 shadow-inner">
                        <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                          <span className="text-slate-400 font-extrabold uppercase">Rasio Kestabilan (N/Z)</span>
                          <span className={`font-black text-xs px-2 py-0.5 rounded ${isStable ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                            {protons > 0 ? (neutrons / protons).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        
                        <div className="relative h-6 bg-slate-950 rounded-lg border border-slate-900 overflow-hidden flex items-center px-2 select-none">
                          {/* Underlay Zones representing nuclear decay ratios */}
                          <div className="absolute inset-y-0 left-0 w-[40%] bg-amber-500/10" title="Kekurangan Neutron (Meluruh Beta+)" />
                          <div className="absolute inset-y-0 left-[40%] w-[30%] bg-emerald-500/20 border-x border-emerald-500/15" title="Zona Kestabilan Utama (1.00 - 1.45)" />
                          <div className="absolute inset-y-0 left-[70%] w-[30%] bg-rose-500/10" title="Kelebihan Neutron (Meluruh Beta-)" />
                          
                          <div className="absolute inset-0 flex justify-between px-3 text-[8px] font-mono font-bold text-slate-500 items-center pointer-events-none uppercase tracking-tight">
                            <span>Luruh β⁺</span>
                            <span className="text-emerald-400 font-black">Zona Stabil (1.0-1.45)</span>
                            <span>Luruh β⁻</span>
                          </div>

                          {/* Live slider handle */}
                          {protons > 0 && (
                            <div 
                              className="absolute top-0.5 bottom-0.5 w-[5px] bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all duration-500 rounded-full"
                              style={{
                                left: `${Math.min(Math.max(((neutrons / protons) / 2) * 100, 4), 96)}%`
                              }}
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono leading-tight">
                          {protons === 0 
                            ? "Tambahkan Proton & Neutron untuk mulai memonitor peta gaya inti."
                            : isStable 
                              ? "✓ Jumlah neutron seimbang. Inti kokoh tahan peluruhan."
                              : neutrons / protons < 1.0 
                                ? "⚠ Terlalu sedikit neutron. Gaya tolak antar proton terlalu kuat!"
                                : "⚠ Terlalu banyak neutron. Inti atom kelebihan beban energi massa!"}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border flex gap-3 ${
                        isStable 
                          ? 'bg-emerald-500/[0.03] border-emerald-500/25 text-emerald-400/95' 
                          : 'bg-amber-500/[0.03] border-amber-500/25 text-amber-550'
                      }`}>
                        {isStable ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">Isotop Stabil Aman</h5>
                              <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                                Rasio proton-neutron berada dalam zona keseimbangan stabil. Inti memiliki gaya nuklir kuat yang memadai untuk melekat kokoh tanpa meluruh secara berangsur-angsur.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                            <div className="space-y-1">
                              <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">Radionuklida Tidak Stabil</h5>
                              <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                                Rasio tidak seimbang. Inti atom ini rapuh dan bersifat radioaktif. Ia cenderung mengalami peluruhan alfa/beta atau pembelahan untuk mencapai kesetimbangan stabil kembali.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ELEMENT PROPERTIES DETAIL NOTE */}
                    <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-900 text-xs text-slate-350 space-y-1.5">
                      <span className="text-[9.5px] font-mono text-teal-400 font-extrabold uppercase tracking-wide">Penerapan Dunia Nyata & Karakter</span>
                      <p className="leading-relaxed">
                        {matchedElement.summary}
                      </p>
                      <div className="text-[9.5px] font-mono text-zinc-550 pt-1.5 border-t border-slate-900/60 flex justify-between">
                        <span>Elektronegativitas: {matchedElement.electronegativity}</span>
                        <span>Fasa Std: {matchedElement.phase}</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center border border-slate-850 mx-auto opacity-50">
                      <Atom className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200 p-1">Nukleus Belum Teridentifikasi</p>
                      <p className="text-[11px] text-slate-500 max-w-[210px] mx-auto leading-relaxed">
                        Tambahkan minimal **1 Proton** di panel manipulator bawah untuk mulai mensimulasikan unsur atomik.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* BOHR ORBITAL CONFIGURATION DIAGRAM LEGEND */}
              <div className="bg-slate-950/35 border border-slate-800 rounded-2xl p-4.5 space-y-3 font-mono text-xs text-slate-400">
                <span className="text-[9.5px] font-bold text-slate-550 block tracking-widest uppercase">PENGISIAN SHELL ELEKTRON</span>
                <div className="space-y-1.5">
                  {bohrShells.map((eCount, idx) => {
                    const maxForShell = [2, 8, 8, 32][idx] || 0;
                    const percent = (eCount / maxForShell) * 100;
                    const label = ['K', 'L', 'M', 'N'][idx] || `N${idx+1}`;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>Shell {label} (n = {idx + 1})</span>
                          <span className="text-teal-400 font-bold">{eCount} / {maxForShell} e⁻</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-400 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {bohrShells.length === 0 && (
                    <p className="text-[10px] text-zinc-550 italic">Tambahkan elektron untuk melihat orbit kulit Bohr terisi.</p>
                  )}
                </div>
              </div>

              {/* CURRICULUM INFO CARD */}
              <div className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl flex gap-3 text-xs text-slate-450 leading-relaxed font-sans">
                <Info className="w-4.5 h-4.5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-350 font-bold block mb-0.5">Petunjuk Kurikulum Struktur Atom</strong>
                  Unsur diidentifikasi secara unik berdasarkan **Jumlah Proton** (Nomor Atom, Z). Jumlah massa (A) adalah proton ditambah neutron. Isotop adalah atom dari unsur yang sama dengan jumlah neutron berbeda!
                </div>
              </div>

              {/* DYNAMIC TEACHER GUIDELINE WIDGET IN GURU MODE */}
              {isGuruMode && (
                <div className="p-4 bg-gradient-to-br from-teal-500/10 via-indigo-500/10 to-teal-500/10 border border-teal-500/25 rounded-2xl space-y-3 mt-4 animate-fade-in shadow-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-300 animate-pulse animate-duration-2000" />
                    <span className="text-[10px] font-mono text-teal-300 font-extrabold uppercase tracking-widest block">
                      Analisis Teori Inti &amp; Bohr (Mode Guru)
                    </span>
                  </div>
                  <div className="text-[11.5px] text-slate-300 space-y-2 leading-relaxed">
                    <div className="p-2 bg-slate-950/45 rounded-lg border border-slate-900/60">
                      <strong>Identitas Nuklida:</strong> Unsur saat ini adalah <span className="text-teal-400 font-bold">{matchedElement ? matchedElement.name : "Unsur Hipotetis"} ({matchedElement ? matchedElement.symbol : "X"})</span>. Memiliki nomor atom <span className="text-rose-400 font-bold">Z = {protons}</span> dan nomor massa <span className="text-teal-400 font-bold">A = {massNumber}</span>.
                    </div>
                    {protons > 0 ? (
                      <div className="space-y-1.5">
                        <p>
                          🛡️ <strong>Kestabilan Inti:</strong> {isStable ? (
                            <span className="text-emerald-400 font-bold">Stabil!</span>
                          ) : (
                            <span className="text-amber-400 font-bold">Tidak Stabil!</span>
                          )}{" "}
                          Rasio neutron ke proton (n:p) saat ini adalah <span className="font-mono text-[10.5px] text-white">{(neutrons / protons).toFixed(2)} : 1</span>.
                          {!isStable && (
                            <span> Pada rasio ini, gaya repulsive Coulomb mengalahkan gaya tarik nuklir kuat, memicu ketidakseimbangan energi pengikat inti (bind energy).</span>
                          )}
                        </p>
                        <p>
                          ⚡ <strong>Gaya Coulomb &amp; Muatan:</strong> Muatan bersih atom adalah <span className={`font-bold ${netCharge === 0 ? "text-slate-300" : netCharge > 0 ? "text-rose-400" : "text-amber-400"}`}>{netCharge === 0 ? "0 (Netral)" : netCharge > 0 ? `+${netCharge} (Kation)` : `${netCharge} (Anion)`}</span>. Hubungan muatan dan jari-jari dikendalikan oleh persamaan gaya Coulomb <span className="font-mono text-[10.5px] text-cyan-400">F = k·(q₁·q₂)/r²</span>.
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">Tambahkan minimal 1 Proton ke dalam inti untuk memicu visualisasi dan kalkulasi teori elektrostatika.</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* RENDER VIEW tab: CHALLENGE MISSION CONSOLE */}
          {activeTab === 'challenges' && (
            <div className="space-y-6 animate-fade-in animate-duration-300">
              
              {/* Scoreboard block */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-955/70 p-3 px-4.5 border border-slate-900 rounded-2xl flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-zinc-500 font-extrabold uppercase tracking-widest">SKOR MISI</span>
                  <span className="text-xl font-black text-white mt-1 select-none">{gameScore} pts</span>
                </div>
                <div className="bg-slate-955/70 p-3 px-4.5 border border-slate-900 rounded-2xl flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-zinc-500 font-extrabold uppercase tracking-widest">NILAI TERTINGGI</span>
                  <span className="text-xl font-black text-teal-400 mt-1 select-none">{highScore} pts</span>
                </div>
              </div>

              {/* SISTEM LENCANA KUANTUM (QUANTUM BADGES INTERACTIVE SHELF) */}
              <div className="glass-panel border-slate-700/60 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-slate-800 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                      <Award className="w-5 h-5 animate-pulse text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white tracking-tight">Koleksi Lencana Kuantum (Quantum Badges)</h3>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Selesaikan misi penyusunan atom untuk membebaskan lencana kuantum ini.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="font-mono text-[10px] font-black text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
                      {completedMissions.length} / 7 TERBUKA
                    </span>
                  </div>
                </div>

                {/* Grandmaster Badge Achievement Banner */}
                {completedMissions.length === 7 && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-505/30 flex items-center gap-3 animate-pulse">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h4 className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-300 to-purple-400 uppercase tracking-wider font-mono">
                        Gelar Terbuka: Grandmaster Kuantum
                      </h4>
                      <p className="text-[10px] text-slate-350 leading-relaxed mt-0.5 font-normal">
                        Luar biasa! Anda telah berhasil menyusun ketujuh isotop fundamental dan melengkapi seluruh koleksi lencana ChemVibe!
                      </p>
                    </div>
                  </div>
                )}

                {/* Grid of Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {BADGES_DATA.map((badge) => {
                    const isUnlocked = completedMissions.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={`group relative flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all duration-300 select-none ${
                          isUnlocked 
                            ? `border-slate-800 bg-slate-900/40 shadow-md hover:border-teal-400/45 hover:-translate-y-1`
                            : 'border-slate-900/60 bg-slate-950/20 opacity-40 hover:opacity-70'
                        }`}
                        title={`${badge.name}: ${badge.description}`}
                      >
                        {/* Interactive floating particle/glow backdrop */}
                        {isUnlocked && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                        )}

                        {/* Badge Icon circle */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                          isUnlocked 
                            ? `bg-slate-950 border-slate-750 text-teal-400 shadow-inner group-hover:scale-115`
                            : 'bg-slate-955 border-slate-850 text-slate-700'
                        }`}>
                          {isUnlocked ? (
                            renderBadgeIcon(badge.iconName, "w-4 h-4 text-teal-400")
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-750" />
                          )}
                        </div>

                        {/* Title & Level description */}
                        <div className="mt-3 w-full">
                          <h4 className={`text-[10px] font-bold truncate max-w-full leading-tight ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                            {badge.name}
                          </h4>
                          <span className="text-[8px] font-mono text-zinc-550 block uppercase mt-1 tracking-tight">
                            {isUnlocked ? badge.missionName : 'Lencana Misi'}
                          </span>
                        </div>

                        {/* Inline micro points reward indicator */}
                        <div className={`mt-2.5 px-2 py-0.5 rounded text-[8px] font-mono font-extrabold leading-none ${isUnlocked ? 'bg-teal-500/10 text-teal-400 border border-teal-500/15' : 'bg-slate-950/40 text-slate-700'}`}>
                          +{badge.rewardPoints}pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Mission specifications */}
              <div className="glass-panel border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3.5 border-b border-slate-850">
                  <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded-xl">
                    <Trophy className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-zinc-550 font-black tracking-widest block leading-none">MISI AKTIF #{activeMission.id}</span>
                    <h3 className="text-base font-black text-white tracking-tight mt-1">{activeMission.title}</h3>
                  </div>
                </div>

                <div className="text-sm text-slate-300 bg-slate-950/60 p-4.5 rounded-xl border border-slate-900/80 space-y-3 leading-relaxed">
                  <strong className="text-zinc-400 text-xs block leading-tight font-mono tracking-wider uppercase">TANTANGAN:</strong>
                  <p className="font-sans leading-relaxed text-slate-200">
                    {activeMission.instructions}
                  </p>
                </div>

                {/* Particle requirement analysis table */}
                <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                  <div className="text-[8.5px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex justify-between">
                    <span>SYARAT PENYUSUNAN</span>
                    <span className="text-zinc-500">FORMAT: SAAT INI / TARGET</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className={`p-2 rounded-lg border transition-all duration-300 ${
                      protons === activeMission.protons 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-900/40 border-slate-850 text-rose-400'
                    }`}>
                      <span className="text-[8.5px] text-zinc-500 block leading-tight font-sans font-bold">PROTON</span>
                      <span className="font-extrabold block mt-1">{protons} / {activeMission.protons}</span>
                    </div>
                    <div className={`p-2 rounded-lg border transition-all duration-300 ${
                      neutrons === activeMission.neutrons 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-900/40 border-slate-850 text-sky-400'
                    }`}>
                      <span className="text-[8.5px] text-zinc-500 block leading-tight font-sans font-bold">NEUTRON</span>
                      <span className="font-extrabold block mt-1">{neutrons} / {activeMission.neutrons}</span>
                    </div>
                    <div className={`p-2 rounded-lg border transition-all duration-300 ${
                      electrons === activeMission.electrons 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-900/40 border-slate-850 text-teal-400'
                    }`}>
                      <span className="text-[8.5px] text-zinc-500 block leading-tight font-sans font-bold">ELEKTRON</span>
                      <span className="font-extrabold block mt-1">{electrons} / {activeMission.electrons}</span>
                    </div>
                  </div>
                </div>

                {/* Tips/Hint Accordion helper */}
                <div className="bg-teal-500/[0.02] border border-teal-500/10 p-3.5 rounded-xl text-xs space-y-1.5 text-slate-350">
                  <span className="flex items-center gap-1 font-mono text-[9px] font-extrabold text-teal-450 uppercase tracking-wider leading-none">
                    <HelpCircle className="w-3.5 h-3.5" /> Tips Mengingat
                  </span>
                  <p className="leading-relaxed">
                    {activeMission.hint}
                  </p>
                </div>

                {/* GAME SUBMIT ACTION CONTROLS */}
                {gameFeedback.status === 'idle' ? (
                  <button
                    onClick={handleCheckChallenge}
                    className="w-full flex items-center justify-center p-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-98 cursor-pointer shadow-lg shadow-teal-500/30 transition-all font-sans"
                  >
                    <span>UJI SUSUNAN ATOM</span>
                  </button>
                ) : gameFeedback.status === 'success' ? (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/35 text-center space-y-2">
                      <div className="flex justify-center">
                        <Award className="w-9 h-9 text-emerald-400 animate-bounce" />
                      </div>
                      <h4 className="font-extrabold text-white text-sm">JAWABAN ANDA BENAR!</h4>
                      <p className="text-xs text-slate-300">{gameFeedback.message}</p>
                    </div>

                    <button
                      onClick={handleNextMission}
                      className="w-full flex items-center justify-center p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      <span>LANJUT KE MISI BERIKUTNYA</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/35 text-center space-y-2">
                      <h4 className="font-black text-rose-500 text-sm">BELUM TEPAT</h4>
                      <p className="text-xs text-slate-300">{gameFeedback.message}</p>
                    </div>

                    <button
                      onClick={() => setGameFeedback({ status: 'idle', message: '' })}
                      className="w-full flex items-center justify-center p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <span>Coba Sesuaikan Lagi</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Clear game state button */}
              <div className="bg-slate-950/25 p-4 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                <span className="text-slate-500">Mulai tantangan dari awal?</span>
                <button
                  onClick={() => {
                    playAtomSound('click', soundEnabled);
                    setGameScore(0);
                    setCurrentMissionIndex(0);
                    setGameFeedback({ status: 'idle', message: '' });
                  }}
                  className="px-2.5 py-1 text-[10px] text-slate-400 font-mono font-bold hover:text-white border border-slate-800 hover:border-slate-700 rounded bg-slate-950/60 cursor-pointer"
                >
                  RESET SKOR
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
