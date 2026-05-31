/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Thermometer, 
  Sparkles, 
  RefreshCw, 
  Beaker, 
  Award, 
  Info, 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  GraduationCap, 
  Zap,
  ChevronRight,
  Gauge,
  Scissors,
  Check,
  Volume2,
  VolumeX,
  GaugeCircle
} from 'lucide-react';

// ==========================================
// BROWSER SYNTHESIZER AUDIO EFFECTS (WEB AUDIO API)
// ==========================================
function playLabSound(type: 'cut' | 'snap' | 'pour' | 'stir' | 'success') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'cut') {
      // Crisp energy shear cutting sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.14);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'snap') {
      // Satisfying molecular snapping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'pour') {
      // Warm rushing waterfall sound for liquids/solids pouring
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.6);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'stir') {
      // Short humming spin cycle pulse
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(190, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      // Upbeat major scale triad for lab success
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + i * 0.09);
        g.gain.setValueAtTime(0.12, now + i * 0.09);
        g.gain.linearRampToValueAtTime(0, now + i * 0.09 + 0.28);
        o.start(now + i * 0.09);
        o.stop(now + i * 0.09 + 0.28);
      });
    }
  } catch (err) {
    // Fail silently in environments without active sound support
  }
}

// ==========================================
// STRUCTURAL & CHEMICAL INTERACTIVE CONSTANTS
// ==========================================
interface Reaction {
  id: string;
  name: string;
  equation: string;
  type: 'exothermic' | 'endothermic';
  enthalpy: number; // kJ/mol
  reactantBonds: { bond: string; count: number; energy: number }[];
  productBonds: { bond: string; count: number; energy: number }[];
  explanation: string;
}

const THERMO_REACTIONS: Reaction[] = [
  {
    id: 'ch4_combustion',
    name: 'Pembakaran Gas Metana (CH₄)',
    equation: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O',
    type: 'exothermic',
    enthalpy: -802,
    reactantBonds: [
      { bond: 'C-H', count: 4, energy: 413 },
      { bond: 'O=O', count: 2, energy: 495 }
    ],
    productBonds: [
      { bond: 'C=O', count: 2, energy: 799 },
      { bond: 'O-H', count: 4, energy: 463 }
    ],
    explanation: 'Pembakaran metana melepaskan panas kuat. Energi yang dikeluarkan saat merakit ikatan kokoh molekul gas buang (C=O dan O-H) jauh mengungguli suplai penyerapan energi pemisah awal.'
  },
  {
    id: 'h2_synthesis',
    name: 'Sintesis Hidrogen Klorida (HCl)',
    equation: 'H₂ + Cl₂ → 2 HCl',
    type: 'exothermic',
    enthalpy: -184,
    reactantBonds: [
      { bond: 'H-H', count: 1, energy: 436 },
      { bond: 'Cl-Cl', count: 1, energy: 242 }
    ],
    productBonds: [
      { bond: 'H-Cl', count: 2, energy: 431 }
    ],
    explanation: 'Lisis ikatan rintisan H-H dan Cl-Cl menuntut panas sedang sebesar 678 kJ/mol. Ketika sepasang jembatan H-Cl stabil mengkristal, sistem mengeluarkan neto kalor 862 kJ/mol ke air.'
  },
  {
    id: 'n2_synthesis',
    name: 'Sintesis Amonia (Haber-Bosch)',
    equation: 'N₂ + 3 H₂ → 2 NH₃',
    type: 'exothermic',
    enthalpy: -92,
    reactantBonds: [
      { bond: 'N≡N', count: 1, energy: 941 },
      { bond: 'H-H', count: 3, energy: 436 }
    ],
    productBonds: [
      { bond: 'N-H', count: 6, energy: 391 }
    ],
    explanation: 'Memotong rahim tangguh nitrogen rangkap tiga N≡N adalah salah satu langkah terpadat (941 kJ/mol), namun perakitan bauran 6 ikatan N-H baru sukses melepaskan neto energi pembentuk.'
  }
];

// Coordinate Maps layout for interactive SVG Molecular sandbox
interface VisualAtom {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

interface VisualBond {
  id: string;
  type: string;
  from: string;
  to: string;
  style: 'single' | 'double' | 'triple';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const MOLECULAR_LAYOUTS: {
  [key: string]: {
    reactants: { atoms: VisualAtom[]; bonds: VisualBond[] };
    products: { atoms: VisualAtom[]; bonds: VisualBond[] };
  };
} = {
  ch4_combustion: {
    reactants: {
      atoms: [
        { id: 'C_1', label: 'C', x: 110, y: 110, color: 'bg-zinc-800 text-zinc-100 ring-4 ring-zinc-700/40' },
        { id: 'H_1', label: 'H', x: 110, y: 45, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_2', label: 'H', x: 110, y: 175, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_3', label: 'H', x: 45, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_4', label: 'H', x: 175, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'O_1', label: 'O', x: 300, y: 70, color: 'bg-red-500 text-white ring-4 ring-red-500/20' },
        { id: 'O_2', label: 'O', x: 375, y: 70, color: 'bg-red-500 text-white ring-4 ring-red-500/20' },
        { id: 'O_3', label: 'O', x: 300, y: 160, color: 'bg-red-500 text-white ring-4 ring-red-500/20' },
        { id: 'O_4', label: 'O', x: 375, y: 160, color: 'bg-red-500 text-white ring-4 ring-red-500/20' },
      ],
      bonds: [
        { id: 'b_ch1', type: 'C-H', from: 'C_1', to: 'H_1', style: 'single', x1: 110, y1: 110, x2: 110, y2: 60 },
        { id: 'b_ch2', type: 'C-H', from: 'C_1', to: 'H_2', style: 'single', x1: 110, y1: 110, x2: 110, y2: 160 },
        { id: 'b_ch3', type: 'C-H', from: 'C_1', to: 'H_3', style: 'single', x1: 110, y1: 110, x2: 60, y2: 110 },
        { id: 'b_ch4', type: 'C-H', from: 'C_1', to: 'H_4', style: 'single', x1: 110, y1: 110, x2: 160, y2: 110 },
        { id: 'b_oo1', type: 'O=O', from: 'O_1', to: 'O_2', style: 'double', x1: 315, y1: 70, x2: 360, y2: 70 },
        { id: 'b_oo2', type: 'O=O', from: 'O_3', to: 'O_4', style: 'double', x1: 315, y1: 160, x2: 360, y2: 160 },
      ]
    },
    products: {
      atoms: [
        { id: 'C_p1', label: 'C', x: 130, y: 110, color: 'bg-zinc-800 text-zinc-100 ring-4 ring-zinc-700/40' },
        { id: 'O_p1', label: 'O', x: 55, y: 110, color: 'bg-red-500 text-white ring-4 ring-red-500/20' },
        { id: 'O_p2', label: 'O', x: 205, y: 110, color: 'bg-red-500 text-white ring-4 ring-red-500/20' },
        { id: 'O_p3', label: 'O', x: 330, y: 70, color: 'bg-red-500 text-white ring-4 ring-red-500/20' },
        { id: 'H_p1', label: 'H', x: 280, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_p2', label: 'H', x: 380, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'O_p4', label: 'O', x: 470, y: 150, color: 'bg-red-500 text-white ring-4 ring-red-500/20' },
        { id: 'H_p3', label: 'H', x: 420, y: 190, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_p4', label: 'H', x: 520, y: 190, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
      ],
      bonds: [
        { id: 'b_co1', type: 'C=O', from: 'C_p1', to: 'O_p1', style: 'double', x1: 70, y1: 110, x2: 115, y2: 110 },
        { id: 'b_co2', type: 'C=O', from: 'C_p1', to: 'O_p2', style: 'double', x1: 145, y1: 110, x2: 190, y2: 110 },
        { id: 'b_oh1', type: 'O-H', from: 'O_p3', to: 'H_p1', style: 'single', x1: 330, y1: 70, x2: 295, y2: 100 },
        { id: 'b_oh2', type: 'O-H', from: 'O_p3', to: 'H_p2', style: 'single', x1: 330, y1: 70, x2: 365, y2: 100 },
        { id: 'b_oh3', type: 'O-H', from: 'O_p4', to: 'H_p3', style: 'single', x1: 470, y1: 150, x2: 435, y2: 180 },
        { id: 'b_oh4', type: 'O-H', from: 'O_p4', to: 'H_p4', style: 'single', x1: 470, y1: 150, x2: 505, y2: 180 },
      ]
    }
  },
  h2_synthesis: {
    reactants: {
      atoms: [
        { id: 'H_1', label: 'H', x: 120, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_2', label: 'H', x: 195, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'Cl_1', label: 'Cl', x: 330, y: 110, color: 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' },
        { id: 'Cl_2', label: 'Cl', x: 425, y: 110, color: 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' },
      ],
      bonds: [
        { id: 'b_hh1', type: 'H-H', from: 'H_1', to: 'H_2', style: 'single', x1: 135, y1: 110, x2: 180, y2: 110 },
        { id: 'b_clcl1', type: 'Cl-Cl', from: 'Cl_1', to: 'Cl_2', style: 'single', x1: 350, y1: 110, x2: 405, y2: 110 },
      ]
    },
    products: {
      atoms: [
        { id: 'H_p1', label: 'H', x: 110, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'Cl_p1', label: 'Cl', x: 190, y: 110, color: 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' },
        { id: 'H_p2', label: 'H', x: 340, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'Cl_p2', label: 'Cl', x: 420, y: 110, color: 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' },
      ],
      bonds: [
        { id: 'b_hcl1', type: 'H-Cl', from: 'H_p1', to: 'Cl_p1', style: 'single', x1: 125, y1: 110, x2: 175, y2: 110 },
        { id: 'b_hcl2', type: 'H-Cl', from: 'H_p2', to: 'Cl_p2', style: 'single', x1: 355, y1: 110, x2: 405, y2: 110 },
      ]
    }
  },
  n2_synthesis: {
    reactants: {
      atoms: [
        { id: 'N_1', label: 'N', x: 110, y: 110, color: 'bg-indigo-600 text-white ring-4 ring-indigo-500/30' },
        { id: 'N_2', label: 'N', x: 185, y: 110, color: 'bg-indigo-600 text-white ring-4 ring-indigo-500/30' },
        { id: 'H_1', label: 'H', x: 310, y: 60, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_2', label: 'H', x: 380, y: 60, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_3', label: 'H', x: 310, y: 115, color: 'bg-zinc-100 text-zinc-900 border border-zinc-350 shadow' },
        { id: 'H_4', label: 'H', x: 380, y: 115, color: 'bg-zinc-100 text-zinc-900 border border-zinc-350 shadow' },
        { id: 'H_5', label: 'H', x: 310, y: 170, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_6', label: 'H', x: 380, y: 170, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
      ],
      bonds: [
        { id: 'b_nn1', type: 'N≡N', from: 'N_1', to: 'N_2', style: 'triple', x1: 125, y1: 110, x2: 170, y2: 110 },
        { id: 'b_hh1', type: 'H-H', from: 'H_1', to: 'H_2', style: 'single', x1: 325, y1: 60, x2: 365, y2: 60 },
        { id: 'b_hh2', type: 'H-H', from: 'H_3', to: 'H_4', style: 'single', x1: 325, y1: 115, x2: 365, y2: 115 },
        { id: 'b_hh3', type: 'H-H', from: 'H_5', to: 'H_6', style: 'single', x1: 325, y1: 170, x2: 365, y2: 170 },
      ]
    },
    products: {
      atoms: [
        { id: 'N_p1', label: 'N', x: 120, y: 110, color: 'bg-indigo-600 text-white ring-4 ring-indigo-500/30' },
        { id: 'H_p1', label: 'H', x: 60, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_p2', label: 'H', x: 155, y: 60, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_p3', label: 'H', x: 155, y: 160, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'N_p2', label: 'N', x: 360, y: 110, color: 'bg-indigo-600 text-white ring-4 ring-indigo-500/30' },
        { id: 'H_p4', label: 'H', x: 300, y: 110, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_p5', label: 'H', x: 395, y: 60, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
        { id: 'H_p6', label: 'H', x: 395, y: 160, color: 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow' },
      ],
      bonds: [
        { id: 'b_nh1', type: 'N-H', from: 'N_p1', to: 'H_p1', style: 'single', x1: 120, y1: 110, x2: 75, y2: 110 },
        { id: 'b_nh2', type: 'N-H', from: 'N_p1', to: 'H_p2', style: 'single', x1: 120, y1: 110, x2: 140, y2: 75 },
        { id: 'b_nh3', type: 'N-H', from: 'N_p1', to: 'H_p3', style: 'single', x1: 120, y1: 110, x2: 140, y2: 145 },
        { id: 'b_nh4', type: 'N-H', from: 'N_p2', to: 'H_p4', style: 'single', x1: 360, y1: 110, x2: 315, y2: 110 },
        { id: 'b_nh5', type: 'N-H', from: 'N_p2', to: 'H_p5', style: 'single', x1: 360, y1: 110, x2: 380, y2: 75 },
        { id: 'b_nh6', type: 'N-H', from: 'N_p2', to: 'H_p6', style: 'single', x1: 360, y1: 110, x2: 380, y2: 145 },
      ]
    }
  }
};

export default function ThermochemistryLab() {
  const [activeTab, setActiveTab] = useState<'exo_endo' | 'bond_energy' | 'calorimeter'>('exo_endo');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // ==========================================
  // MODULE 1: INTERACTIVE REAGENT SHELF & LIVE DISSOLUTION STATE
  // ==========================================
  const [selectedExoEndoSubstance, setSelectedExoEndoSubstance] = useState<'naoh' | 'nh4no3' | 'cao' | 'kno3'>('naoh');
  const [beakerTemp, setBeakerTemp] = useState<number>(25);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [reactionProgress, setReactionProgress] = useState<number>(0);
  const [waterHeatFlow, setWaterHeatFlow] = useState<'none' | 'out' | 'in'>('none');
  const [tempHistory, setTempHistory] = useState<number[]>([25]);

  const subInfo = {
    naoh: { name: 'Padatan Natrium Hidroksida (NaOH)', type: 'exothermic', deltaH: -44.5, iconClass: 'bg-rose-500', desc: 'Sangat Eksotermik. Melarutkan NaOH melepaskan panas hidrasi yang kuat ke lingkungan.' },
    nh4no3: { name: 'Senyawa Amonium Nitrat (NH₄NO₃)', type: 'endothermic', deltaH: 25.7, iconClass: 'bg-sky-550', desc: 'Sangat Endotermik. Digunakan dalam kantong es instan karena langsung menurunkan suhu air.' },
    cao: { name: 'Kapur Tohor (Kalsium Oksida - CaO)', type: 'exothermic', deltaH: -63.7, iconClass: 'bg-red-500', desc: 'Eksotermik Reaktif. Bereaksi hebat membentuk Ca(OH)₂ dengan pelepasan suhu masif.' },
    kno3: { name: 'Padat Kalium Nitrat (KNO₃)', type: 'endothermic', deltaH: 34.8, iconClass: 'bg-indigo-400', desc: 'Endotermik Ringan. Menyerap energi kinetik molekul air luar untuk memutuskan kisi kristal pelarut.' }
  }[selectedExoEndoSubstance];

  // Live dissolving state ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isReacting) {
      interval = setInterval(() => {
        setReactionProgress(prev => {
          if (prev >= 100) {
            setIsReacting(false);
            setWaterHeatFlow('none');
            if (soundEnabled) playLabSound('success');
            return 100;
          }
          const deltaH = subInfo.deltaH;
          if (subInfo.type === 'exothermic') {
            const swingCap = 25 + Math.abs(deltaH) * 1.05;
            setBeakerTemp(t => {
              const nextT = Math.min(swingCap, t + 1.8);
              setTempHistory(h => [...h, nextT]);
              return nextT;
            });
          } else {
            const swingCap = Math.max(7.5, 25 - deltaH * 0.48);
            setBeakerTemp(t => {
              const nextT = Math.max(swingCap, t - 1.0);
              setTempHistory(h => [...h, nextT]);
              return nextT;
            });
          }
          return prev + 10;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isReacting, selectedExoEndoSubstance, subInfo, soundEnabled]);

  const triggerPourAndReact = () => {
    setIsPouring(true);
    setBeakerTemp(25.0);
    setTempHistory([25.0]);
    setReactionProgress(0);
    if (soundEnabled) playLabSound('pour');
    
    setTimeout(() => {
      setIsPouring(false);
      setIsReacting(true);
      setWaterHeatFlow(subInfo.type === 'exothermic' ? 'out' : 'in');
    }, 1200);
  };

  const resetExoEndoModule = () => {
    setIsPouring(false);
    setIsReacting(false);
    setBeakerTemp(25.0);
    setTempHistory([25.0]);
    setReactionProgress(0);
    setWaterHeatFlow('none');
  };

  // ==========================================
  // MODULE 2: INTERACTIVE MOLECULAR WORKBENCH
  // ==========================================
  const [selectedReactionIndex, setSelectedReactionIndex] = useState<number>(0);
  const curReaction = THERMO_REACTIONS[selectedReactionIndex];

  // Specific snapped IDs sets to make the interactive SVG click-to-cut / click-to-weld incredibly responsive
  const [clickedReactantBonds, setClickedReactantBonds] = useState<string[]>([]);
  const [clickedProductBonds, setClickedProductBonds] = useState<string[]>([]);

  // User broken reactant bond counts, and assembled product bond counts
  const [brokenBonds, setBrokenBonds] = useState<{ [key: string]: number }>({});
  const [formedBonds, setFormedBonds] = useState<{ [key: string]: number }>({});
  const [molecularStep, setMolecularStep] = useState<'idle' | 'breaking' | 'forming' | 'completed'>('idle');

  // Reset Scissors mini-game
  const startScissorsGame = () => {
    const initBroken: { [key: string]: number } = {};
    curReaction.reactantBonds.forEach(b => {
      initBroken[b.bond] = 0;
    });

    const initFormed: { [key: string]: number } = {};
    curReaction.productBonds.forEach(b => {
      initFormed[b.bond] = 0;
    });

    setBrokenBonds(initBroken);
    setFormedBonds(initFormed);
    setClickedReactantBonds([]);
    setClickedProductBonds([]);
    setMolecularStep('breaking');
    if (soundEnabled) playLabSound('snap');
  };

  const processDirectReactantCut = (bondId: string, bondName: string) => {
    if (clickedReactantBonds.includes(bondId)) return;
    
    if (soundEnabled) playLabSound('cut');
    setClickedReactantBonds(prev => [...prev, bondId]);

    const maxCount = curReaction.reactantBonds.find(b => b.bond === bondName)?.count || 9;

    setBrokenBonds(prev => {
      const curCount = prev[bondName] || 0;
      if (curCount >= maxCount) return prev;
      const updated = { ...prev, [bondName]: curCount + 1 };
      
      // Check if all reactant bonds are broken
      const allBroken = curReaction.reactantBonds.every(b => {
        const checkedCount = b.bond === bondName ? curCount + 1 : (prev[b.bond] || 0);
        return checkedCount >= b.count;
      });

      if (allBroken) {
        setTimeout(() => {
          setMolecularStep('forming');
          if (soundEnabled) playLabSound('success');
        }, 600);
      }
      return updated;
    });
  };

  const processDirectProductWeld = (bondId: string, bondName: string) => {
    if (clickedProductBonds.includes(bondId)) return;

    if (soundEnabled) playLabSound('snap');
    setClickedProductBonds(prev => [...prev, bondId]);

    const maxCount = curReaction.productBonds.find(b => b.bond === bondName)?.count || 9;

    setFormedBonds(prev => {
      const curCount = prev[bondName] || 0;
      if (curCount >= maxCount) return prev;
      const updated = { ...prev, [bondName]: curCount + 1 };

      // Check if all product bonds are formed
      const allFormed = curReaction.productBonds.every(b => {
        const checkedCount = b.bond === bondName ? curCount + 1 : (prev[b.bond] || 0);
        return checkedCount >= b.count;
      });

      if (allFormed) {
        setTimeout(() => {
          setMolecularStep('completed');
          if (soundEnabled) playLabSound('success');
        }, 600);
      }
      return updated;
    });
  };

  // Legacy fallback buttons triggers
  const cutBond = (bondName: string, maxCount: number) => {
    // Look up the first matching unclicked visual bond id to cut
    const layout = MOLECULAR_LAYOUTS[curReaction.id];
    if (!layout) return;
    const target = layout.reactants.bonds.find(b => b.type === bondName && !clickedReactantBonds.includes(b.id));
    if (target) {
      processDirectReactantCut(target.id, bondName);
    }
  };

  const assembleBond = (bondName: string, maxCount: number) => {
    // Look up the first matching unclicked visual bond id to weld
    const layout = MOLECULAR_LAYOUTS[curReaction.id];
    if (!layout) return;
    const target = layout.products.bonds.find(b => b.type === bondName && !clickedProductBonds.includes(b.id));
    if (target) {
      processDirectProductWeld(target.id, bondName);
    }
  };

  // Helper calculation totals based on current click arrays
  const curReactantSum = curReaction.reactantBonds.reduce((acc, b) => {
    const clickCount = brokenBonds[b.bond] || 0;
    return acc + (b.energy * clickCount);
  }, 0);

  const curProductSum = curReaction.productBonds.reduce((acc, b) => {
    const clickCount = formedBonds[b.bond] || 0;
    return acc + (b.energy * clickCount);
  }, 0);

  const finalTheoreticalReactantSum = curReaction.reactantBonds.reduce((acc, b) => acc + (b.energy * b.count), 0);
  const finalTheoreticalProductSum = curReaction.productBonds.reduce((acc, b) => acc + (b.energy * b.count), 0);

  // ==========================================
  // MODULE 3: INTERACTIVE CALORIMETER CHEKLIST STATE
  // ==========================================
  const [calorimeterSubstance, setCalorimeterSubstance] = useState<'naoh' | 'nh4no3' | 'urea'>('naoh');
  const [soluteMass, setSoluteMass] = useState<number>(10); // grams
  const [waterVolume, setWaterVolume] = useState<number>(200); // mL (matching grams water)
  
  // Custom lab procedure checkpoints
  const [isLidClosed, setIsLidClosed] = useState<boolean>(true);
  const [stirringRpm, setStirringRpm] = useState<number>(350); // Live RPM Slider [0 - 600]
  const [isReactantDumped, setIsReactantDumped] = useState<boolean>(false);
  const [showPourEffect, setShowPourEffect] = useState<boolean>(false);

  // Auto hum oscillator for stirrer when RPM slider is changed
  useEffect(() => {
    if (stirringRpm > 0 && activeTab === 'calorimeter') {
      const humInterval = setInterval(() => {
        if (soundEnabled && stirringRpm > 0) playLabSound('stir');
      }, Math.max(120, 600 - stirringRpm));
      return () => clearInterval(humInterval);
    }
  }, [stirringRpm, activeTab, soundEnabled]);

  const [calorimeterOutput, setCalorimeterOutput] = useState<{
    tInitial: number;
    tFinal: number;
    deltaT: number;
    qWater: number;
    qWaterKj: number;
    moles: number;
    deltaH: number;
    heatLossPercent: number;
    efficiencyPercent: number;
    isCalculated: boolean;
    splashWarning: boolean;
  }>({
    tInitial: 25.0,
    tFinal: 25.0,
    deltaT: 0,
    qWater: 0,
    qWaterKj: 0,
    moles: 0,
    deltaH: 0,
    heatLossPercent: 0,
    efficiencyPercent: 100,
    isCalculated: false,
    splashWarning: false
  });
  const [isCalorimeterRunning, setIsCalorimeterRunning] = useState<boolean>(false);

  const dumpSolutePaper = () => {
    if (soundEnabled) playLabSound('pour');
    setShowPourEffect(true);
    setTimeout(() => {
      setIsReactantDumped(true);
      setShowPourEffect(false);
    }, 1100);
  };

  const runCalorimeterExperiment = () => {
    if (!isReactantDumped) return;
    setIsCalorimeterRunning(true);
    if (soundEnabled) playLabSound('pour');
    
    // Simulating spinning stir and dissolving progress
    setTimeout(() => {
      const tInitial = 25.0;
      let mw = 40.0;
      let molarHeat = -44.5; // kJ/mol

      if (calorimeterSubstance === 'naoh') {
        mw = 40.0;
        molarHeat = -44.5;
      } else if (calorimeterSubstance === 'nh4no3') {
        mw = 80.04;
        molarHeat = 25.7;
      } else if (calorimeterSubstance === 'urea') {
        mw = 60.06;
        molarHeat = 14.0;
      }

      const moles = soluteMass / mw;
      
      // Calculate heat loss: If lid is left open, 20% of the heating or cooling dissipates
      const heatLossPercent = isLidClosed ? 0.0 : 0.20;
      
      // Calculate stirring rate efficiency factor:
      // 0 RPM: 50% efficiency (extremely slow dissolution, high thermal dissipation)
      // < 200 RPM: 80% efficiency
      // 200 - 450 RPM: 100% (ideal)
      // > 450 RPM: 100% but splash warning (risk of liquid loss, reduces actual solute value slightly!)
      let stirFactor = 1.0;
      let splashWarning = false;
      let actualMassModifier = 1.0;

      if (stirringRpm === 0) {
        stirFactor = 0.50;
      } else if (stirringRpm < 200) {
        stirFactor = 0.82;
      } else if (stirringRpm > 450) {
        stirFactor = 1.0;
        splashWarning = true;
        actualMassModifier = 0.95; // some mass splashed out
      }

      const effectiveMolarHeat = molarHeat * stirFactor;
      const effectiveSoluteMass = soluteMass * actualMassModifier;
      const effectiveMoles = effectiveSoluteMass / mw;

      const totalHeatReleasedKj = -1 * (effectiveMoles * effectiveMolarHeat) * (1 - heatLossPercent);
      const totalHeatReleasedJ = totalHeatReleasedKj * 1000;
      
      const totalMass = waterVolume + effectiveSoluteMass;
      const c = 4.18; 
      const deltaT = totalHeatReleasedJ / (totalMass * c);
      const tFinal = tInitial + deltaT;
      const qWater = totalMass * c * deltaT;

      setCalorimeterOutput({
        tInitial,
        tFinal: parseFloat(tFinal.toFixed(1)),
        deltaT: parseFloat(deltaT.toFixed(1)),
        qWater: Math.round(qWater),
        qWaterKj: parseFloat((qWater / 1000).toFixed(3)),
        moles: parseFloat(effectiveMoles.toFixed(4)),
        deltaH: molarHeat,
        heatLossPercent: heatLossPercent * 100,
        efficiencyPercent: Math.round(stirFactor * 100),
        isCalculated: true,
        splashWarning
      });
      setIsCalorimeterRunning(false);
      if (soundEnabled) playLabSound('success');
    }, 1500);
  };

  const resetInteractiveCalorimeter = () => {
    setIsReactantDumped(false);
    setCalorimeterOutput({
      tInitial: 25.0,
      tFinal: 25.0,
      deltaT: 0,
      qWater: 0,
      qWaterKj: 0,
      moles: 0,
      deltaH: 0,
      heatLossPercent: 0,
      efficiencyPercent: 100,
      isCalculated: false,
      splashWarning: false
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 pb-12">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-white/5 gap-3 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-black uppercase tracking-wider">SIMULATOR TERMOKIMIA</span>
            <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[9px] font-black uppercase tracking-wider">3D HESS WORKBENCH</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Kanal Simulasi Termokimia Interaktif</h2>
          <p className="text-zinc-400 text-xs md:text-sm text-balance">
            Eksplorasi entalpi reaksi ($\Delta H$), pemetaan lisis ikatan melalui gunting 2D molekuler, dan analisis eksperimen calorimeter Styrofoam cup adiaba.
          </p>
        </div>

        {/* Audio Toggle button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            soundEnabled 
              ? 'bg-teal-500/15 border-teal-500/30 text-teal-400' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-550'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>SOUNDS: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>SOUNDS: OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Lab Sub-module Navigation tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-900/60 border border-slate-850 rounded-xl max-w-max">
        <button
          onClick={() => setActiveTab('exo_endo')}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'exo_endo' 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Eksoterm vs Endoterm</span>
        </button>
        <button
          onClick={() => { setActiveTab('bond_energy'); setMolecularStep('idle'); }}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'bond_energy' 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Lisis &amp; Rakit Ikatan (SVG)</span>
        </button>
        <button
          onClick={() => { setActiveTab('calorimeter'); resetInteractiveCalorimeter(); }}
          className={`px-4 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'calorimeter' 
              ? 'bg-amber-500 text-slate-950 shadow-md' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Beaker className="w-4 h-4" />
          <span>Coffee-Cup Kalorimeter</span>
        </button>
      </div>

      {/* --- TAB 1: EKSOTERM VS ENDOTERM LAB --- */}
      {activeTab === 'exo_endo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          <div className="lg:col-span-4 space-y-5">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/30 space-y-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-350 tracking-wider">RAK REAKTAN PADAT</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'naoh', label: '1. NaOH Solid Pellets', desc: 'Eksotermik Kuat' },
                  { id: 'nh4no3', label: '2. NH₄NO₃ Crystals', desc: 'Endotermik Kuat' },
                  { id: 'cao', label: '3. CaO Quicklime Powder', desc: 'Sangat Eksotermik' },
                  { id: 'kno3', label: '4. KNO₃ Solid Crystals', desc: 'Endotermik Ringan' }
                ].map((reag) => (
                  <button
                    key={reag.id}
                    onClick={() => { setSelectedExoEndoSubstance(reag.id as any); resetExoEndoModule(); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                      selectedExoEndoSubstance === reag.id 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' 
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs block font-sans">{reag.label}</span>
                      <span className="text-[10px] font-mono text-zinc-550 block mt-0.5">{reag.desc}</span>
                    </div>
                    {selectedExoEndoSubstance === reag.id && <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />}
                  </button>
                ))}
              </div>

              {/* Informational Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 text-xs text-slate-400 leading-relaxed font-sans space-y-2">
                <p className="font-bold text-amber-450 uppercase text-[10px] font-mono tracking-wider">PREVIEW ENERGI ZAT:</p>
                <p>{subInfo.desc}</p>
                <div className="flex justify-between text-[11px] font-mono text-amber-500">
                  <span>Panas Kelarutan:</span>
                  <span>ΔH_sol = {subInfo.deltaH} kJ/mol</span>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="pt-2 flex gap-2 font-sans">
                <button
                  onClick={triggerPourAndReact}
                  disabled={isReacting || isPouring}
                  className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Zap className="w-4 h-4 animate-bounce" />
                  <span>Tuang Reaktan &amp; Amati</span>
                </button>
                <button
                  onClick={resetExoEndoModule}
                  className="p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-750 cursor-pointer text-center"
                  title="Reset Termometer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Display & Real-time Graph Plotted */}
          <div className="lg:col-span-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Beaker with interactive pouring kinetics */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-805 bg-slate-900/30 flex flex-col justify-between relative overflow-hidden h-[330px]">
                <div className="text-[10px] font-mono text-zinc-500 font-bold tracking-wider mb-2 uppercase flex justify-between">
                  <span>VISUALISASI BEAKER &amp; EFFUSI TERMIS</span>
                  {subInfo.type === 'exothermic' ? (
                    <span className="text-red-400 font-black animate-pulse">▲ PANAS</span>
                  ) : (
                    <span className="text-sky-400 font-black animate-pulse">▼ DINGIN</span>
                  )}
                </div>
                
                {/* Spatula Pouring Animation */}
                {isPouring && (
                  <div className="absolute top-4 left-1/3 animate-bounce z-25 flex flex-col items-center">
                    <div className="w-16 h-3 bg-zinc-300 rounded border border-zinc-400 relative rotate-12 transition-transform">
                      {/* Cascading falling particles */}
                      <div className="absolute top-1 right-2 w-2 h-8 bg-zinc-100 opacity-80 blur-[1px] animate-pulse rounded-full" />
                    </div>
                    <span className="text-[9px] font-mono text-amber-500 font-extrabold block mt-2">DUMPING CRYSTALS...</span>
                  </div>
                )}

                {/* Exothermic Visual Steam / Fire sparks Rising */}
                {isReacting && subInfo.type === 'exothermic' && (
                  <div className="absolute top-[35%] left-[20%] right-[40%] h-24 pointer-events-none z-10 overflow-hidden flex justify-around">
                    <div className="w-0.5 h-16 bg-gradient-to-t from-orange-500/20 to-transparent blur-[2px] animate-pulse rounded" style={{ animationDelay: '0.1s' }} />
                    <div className="w-0.5 h-20 bg-gradient-to-t from-red-500/20 to-transparent blur-[1.5px] animate-bounce rounded" style={{ animationDelay: '0.3s' }} />
                    <div className="w-0.5 h-12 bg-gradient-to-t from-amber-500/10 to-transparent blur-[2px] animate-pulse rounded" style={{ animationDelay: '0.6s' }} />
                  </div>
                )}

                {/* Endothermic Frost crystals Rim / Condensation overlay */}
                {isReacting && subInfo.type === 'endothermic' && (
                  <div className="absolute inset-x-8 bottom-4 top-1/3 pointer-events-none rounded-xl border border-sky-400/30 bg-sky-500/5 blur-[0.5px] z-10 flex flex-col justify-start items-center p-2 text-center">
                    <div className="text-[8px] font-mono text-sky-300 animate-pulse font-black px-1.5 py-0.5 bg-slate-900/80 rounded border border-sky-400/20">
                      ❄️ SUHU TURUN DRAGASTIS (ENDOTERM)
                    </div>
                  </div>
                )}

                {/* Heat translation flow lines labels */}
                {waterHeatFlow === 'out' && (
                  <div className="absolute inset-0 pointer-events-none z-15">
                    <div className="absolute top-[25%] left-[6%] text-red-400 font-bold animate-pulse text-[9px] bg-red-950/70 border border-red-500/30 px-1.5 py-0.5 rounded shadow">
                      KALOR KELUAR SISTEM ➔
                    </div>
                    <div className="absolute bottom-[35%] right-[6%] text-red-400 font-bold animate-pulse text-[9px] bg-red-950/70 border border-red-500/30 px-1.5 py-0.5 rounded shadow">
                      ➔ SUHU AIR MENINGKAT
                    </div>
                  </div>
                )}
                {waterHeatFlow === 'in' && (
                  <div className="absolute inset-0 pointer-events-none z-15">
                    <div className="absolute top-[25%] right-[6%] text-sky-400 font-bold animate-pulse text-[9px] bg-slate-950/80 border border-sky-400/30 px-1.5 py-0.5 rounded shadow">
                      SUHU DISEDOT MASUK SISTEM ➔
                    </div>
                    <div className="absolute bottom-[35%] left-[6%] text-sky-400 font-bold animate-pulse text-[9px] bg-slate-950/80 border border-sky-400/30 px-1.5 py-0.5 rounded shadow">
                      ← KINETIK AIR MELEMAH
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-8 my-auto">
                  
                  {/* Glass Beaker containing water solution */}
                  <div className="relative w-32 h-40 border-4 border-t-0 border-slate-400 rounded-b-2xl bg-zinc-950/10 flex items-end">
                    <div 
                      className={`w-full transition-all duration-[800ms] rounded-b-xl relative overflow-hidden ${
                        isReacting 
                          ? subInfo.type === 'exothermic' 
                            ? 'bg-rose-500/25 h-28 border-t border-rose-450/40 shadow-[inset_0_20px_20px_-10px_rgba(239,68,68,0.2)]' 
                            : 'bg-sky-500/25 h-28 border-t border-sky-400/40 shadow-[inset_0_20px_20px_-10px_rgba(56,189,248,0.25)]'
                          : 'bg-cyan-500/10 h-24 border-t border-cyan-500/25'
                      }`}
                    >
                      {/* Dissolving particles bubbles */}
                      {isReacting && (
                        <div className="absolute inset-0 overflow-hidden">
                          {Array.from({ length: 8 }).map((_, bIdx) => (
                            <div 
                              key={bIdx}
                              className={`absolute rounded-full animate-bounce ${
                                subInfo.type === 'exothermic' ? 'bg-amber-400/80 w-1.5 h-1.5' : 'bg-slate-100/90 w-2 h-2 border border-sky-200/50'
                              }`}
                              style={{ 
                                left: `${bIdx * 12 + 6}%`, 
                                bottom: `${(bIdx * 13) % 45 + 5}px`,
                                animationDuration: `${0.6 + bIdx * 0.12}s`
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-3 text-center">
                        <span className="text-[9px] font-mono text-slate-400 block leading-none">CAIR PELARUT</span>
                        <span className="text-xs font-bold text-slate-100 block mt-0.5 tracking-tight leading-none">
                          {subInfo.name.split(' (')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vertikal analog Thermometer display */}
                  <div className="flex gap-2.5 items-center shrink-0">
                    <div className="w-5 h-36 bg-zinc-950 border border-slate-800 rounded-full relative flex items-end p-0.5">
                      <div 
                        className={`w-full rounded-full transition-all duration-300 ${
                          subInfo.type === 'exothermic' ? 'bg-rose-500 shadow-glow' : 'bg-sky-400 shadow-glow'
                        }`}
                        style={{ height: `${Math.max(12, Math.min(100, (beakerTemp / 80) * 100))}%` }}
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 block leading-none uppercase">SUHU AIR</span>
                      <span className={`text-2xl font-mono font-black block mt-0.5 ${
                        subInfo.type === 'exothermic' ? 'text-rose-450' : 'text-sky-400'
                      }`}>
                        {beakerTemp.toFixed(1)}°C
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 block leading-none mt-1">Mulai: 25.0°C</span>
                    </div>
                  </div>

                </div>

                <div className="w-full bg-slate-950 p-2 text-center rounded-xl border border-slate-900 text-[10px] font-mono text-zinc-500">
                  {isReacting ? (
                    <span className="text-amber-400 animate-pulse font-extrabold uppercase tracking-wide">Kinetics Reaksi Berjalan: {reactionProgress}%</span>
                  ) : isPouring ? (
                    <span className="text-zinc-400 font-bold uppercase">Mencampurkan Bahan Terlarut...</span>
                  ) : (
                    <span>Siap Mengamati Fasa Termis Kelarutan</span>
                  )}
                </div>
              </div>

              {/* Dynamic continuous Line Graph plotted in real-time step by step */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-805 bg-slate-900/30 flex flex-col justify-between h-[330px]">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block font-bold uppercase tracking-wider">KURVA SUHU VS WAKTU REAL-TIME</span>
                  <p className="text-[10.5px] text-zinc-400 mt-1 leading-snug">Menelusuri mutasi suhu (T) terhadap durasi peleburan.</p>
                </div>

                {/* Drawn SVG path plotter */}
                <div className="w-full h-40 border-b border-l border-zinc-900 relative mt-3 bg-zinc-950/20 rounded-sm">
                  <div className="absolute top-1 left-2 text-[8px] font-mono text-zinc-650">Suhu T (°C)</div>
                  <div className="absolute bottom-1 right-2 text-[8px] font-mono text-zinc-650">Kinetik Selesai %</div>

                  {/* Draw gridlines */}
                  <div className="absolute inset-x-0 bottom-1/2 border-t border-zinc-900/30 border-dashed" />
                  <div className="absolute inset-x-0 bottom-[20%] border-t border-zinc-900/30 border-dashed" />
                  <div className="absolute inset-x-0 bottom-[80%] border-t border-zinc-900/30 border-dashed" />

                  {/* SVG line path based on tempHistory state */}
                  <svg className="w-full h-full overflow-visible animate-pulse" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke={subInfo.type === 'exothermic' ? '#f43f5e' : '#38bdf8'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      points={tempHistory.map((temp, index) => {
                        const totalPoints = tempHistory.length;
                        const x = (index / (totalPoints - 1 || 1)) * 100;
                        const mappedY = 95 - ((temp - 5) / 75) * 90;
                        return `${x},${mappedY}`;
                      }).join(' ')}
                    />
                  </svg>
                </div>

                <div className="text-[9.5px] font-mono text-zinc-500 flex justify-between items-center bg-slate-950/40 px-2 py-1.5 rounded border border-slate-900 shadow">
                  <span>PLOTTING SUHU TERMODINAMIS AKHIR:</span>
                  <span className={`font-black ${subInfo.type === 'exothermic' ? 'text-red-400' : 'text-sky-400'}`}>
                    T_f = {beakerTemp.toFixed(1)}°C
                  </span>
                </div>
              </div>

            </div>

            {/* General Explanation Card */}
            <div className="glass-panel p-5 rounded-2xl border border-teal-500/10 bg-slate-900/15 flex gap-4 text-left">
              <GraduationCap className="w-5 h-5 text-teal-400 mt-0.5 shrink-0 animate-bounce" />
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">PEDOMAN AKTIF INSTRUKTUR VIRTUAL</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-0.5">
                  Lakukan simulasi berulang! Pelarutan <strong className="text-amber-400">NaOH pellets</strong> menembus delta termis naik curam karena kalor hidrasi dikeluarkan ke air. Sementara <strong className="text-teal-400">NH₄NO₃</strong> langsung menyedot kandungan kinetik air untuk lisis padatan sehingga air terasa mendingin seketika.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: INTERACTIVE MOLECULAR WORKBENCH (SVG SCISSORS) --- */}
      {activeTab === 'bond_energy' && (
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Reaction Sidepanel Selectors */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 font-bold tracking-wider uppercase block">DAFTAR SIMULASI ENERGI IKATAN RATA-RATA</span>
              <div className="flex flex-col gap-2">
                {THERMO_REACTIONS.map((reac, idx) => {
                  const isCur = selectedReactionIndex === idx;
                  return (
                    <button
                      key={reac.id}
                      onClick={() => { setSelectedReactionIndex(idx); setMolecularStep('idle'); }}
                      className={`p-3.5 rounded-xl text-left border relative transition-all cursor-pointer ${
                        isCur 
                          ? 'bg-amber-500/10 border-amber-500 text-white font-bold shadow-md' 
                          : 'bg-zinc-900/60 border-zinc-850 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold font-sans">{reac.name}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isCur ? 'text-amber-400 rotate-90' : 'text-zinc-650'}`} />
                      </div>
                      <div className="font-mono text-[10px] mt-1 text-zinc-500">{reac.equation}</div>
                    </button>
                  );
                })}
              </div>

              {/* Reset Game button */}
              <button
                onClick={startScissorsGame}
                className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-600 font-black text-slate-950 font-sans text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Scissors className="w-4 h-4 animate-spin" />
                <span>Mulai Game Gunting Ikatan</span>
              </button>
            </div>

            {/* Main Interactive Bond Energy Playground */}
            <div className="lg:col-span-8 space-y-5">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-6">
                
                <div className="pb-4 border-b border-zinc-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-500 font-black tracking-wider uppercase block">PLAYGROUND MOLEKUL</span>
                    <h3 className="text-base font-bold text-white font-sans">{curReaction.name}</h3>
                  </div>
                  <div className="px-3.5 py-1.5 bg-slate-950 font-mono text-xs rounded-xl border border-zinc-900">
                    <span className="text-zinc-500 mr-2 font-black">EQUATION:</span>
                    <span className="text-teal-400 font-bold">{curReaction.equation}</span>
                  </div>
                </div>

                {/* Scissors Mini game core UI switcher */}
                {renderCorporateInteractiveWorkbench()}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- TAB 3: CALORIMETER EXPERIENCE --- */}
      {activeTab === 'calorimeter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left animate-fade-in">
          
          {/* Settings Sidepanel */}
          <div className="lg:col-span-4 space-y-5">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/30 space-y-4">
              <div className="flex items-center gap-2">
                <Beaker className="w-4.5 h-4.5 text-teal-400 animate-bounce" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">ATUR TAKARAN KALORIMETER</span>
              </div>

              {/* Substance chooser */}
              <div className="space-y-1">
                <label className="text-xs font-sans text-slate-400 font-bold block">Senyawa Padat Terlarut :</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'naoh', name: 'NaOH (Natrium Hidroksida)', type: 'Eksoterm Reaktif' },
                    { id: 'nh4no3', name: 'NH₄NO₃ (Amonium Nitrat)', type: 'Endoterm Murni' },
                    { id: 'urea', name: 'Urea [CO(NH₂)₂]', type: 'Endoterm Ringan' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setCalorimeterSubstance(s.id as any); resetInteractiveCalorimeter(); }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        calorimeterSubstance === s.id 
                          ? 'bg-teal-500/10 border-teal-500 text-white shadow' 
                          : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className="text-xs font-bold block">{s.name}</span>
                      <span className="text-[10px] font-mono text-zinc-550 mt-0.5 block">{s.type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weighing scale visual element */}
              <div className="p-3 bg-zinc-950/80 border border-slate-900 rounded-xl space-y-2 text-center text-xs">
                <div className="font-mono text-emerald-400 text-base font-black px-2 py-1 bg-zinc-900 border border-zinc-800 rounded">
                  ⚖️ {soluteMass.toFixed(2)} g
                </div>
                <div className="text-[10px] font-mono text-zinc-500">Massa solid terbaca di timbangan digital</div>
              </div>

              {/* Mass mass weight */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-400 font-semibold">Atur Massa Zat Terlarut :</span>
                  <span className="text-teal-400 font-mono font-bold">{soluteMass} gram</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={soluteMass}
                  onChange={(e) => { setSoluteMass(parseInt(e.target.value)); resetInteractiveCalorimeter(); }}
                  className="w-full accent-teal-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Water volumes to dilute */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-slate-400 font-semibold">Atur Volume Air Pelarut :</span>
                  <span className="text-teal-400 font-mono font-bold">{waterVolume} mL</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="400"
                  step="50"
                  value={waterVolume}
                  onChange={(e) => { setWaterVolume(parseInt(e.target.value)); resetInteractiveCalorimeter(); }}
                  className="w-full accent-teal-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Stirring speed RPM meter slider */}
              <div className="space-y-1 bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                <div className="flex justify-between text-xs font-sans items-center">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <GaugeCircle className="w-3.5 h-3.5 text-amber-500" />
                    Kecepatan Pengaduk (Stir) :
                  </span>
                  <span className={`font-mono font-bold ${stirringRpm > 450 ? 'text-red-400' : 'text-teal-450'}`}>
                    {stirringRpm} RPM
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="50"
                  value={stirringRpm}
                  onChange={(e) => { setStirringRpm(parseInt(e.target.value)); }}
                  className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[8.5px] font-mono text-zinc-650 pt-1">
                  <span>MATI</span>
                  <span>PERLAHAN (150)</span>
                  <span>IDEAL (350)</span>
                  <span>HEBAT (600)</span>
                </div>
              </div>

              {/* Dynamic instruction actions */}
              <div className="p-3.5 rounded-xl bg-slate-950/65 border border-slate-900 text-xs text-slate-400 space-y-2 font-sans">
                <p className="font-bold text-amber-550 uppercase text-[10px] font-mono tracking-wider">HESS PROTOKOL EKSPERIMEN :</p>
                <div className="space-y-1.5 font-mono">
                  <button
                    onClick={dumpSolutePaper}
                    disabled={isReactantDumped || showPourEffect}
                    className={`w-full py-2 px-3 border rounded text-left text-[11px] flex items-center justify-between cursor-pointer transition-all ${
                      isReactantDumped 
                        ? 'bg-teal-950/40 border-teal-500/50 text-teal-400' 
                        : 'bg-slate-900 border-zinc-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <span>1. Tuangkan Padatan Terlarut</span>
                    {isReactantDumped ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 bg-zinc-650 rounded-full animate-pulse" />}
                  </button>

                  <button
                    onClick={() => { if (soundEnabled) playLabSound('snap'); setIsLidClosed(!isLidClosed); }}
                    className={`w-full py-1.5 px-3 border rounded text-left text-[11px] flex items-center justify-between cursor-pointer transition-all ${
                      isLidClosed ? 'bg-teal-950/40 border-teal-500/50 text-teal-400' : 'bg-slate-900 border-zinc-800 text-slate-350 hover:bg-slate-850'
                    }`}
                  >
                    <span>2. Pasang Penutup Adiabatis</span>
                    {isLidClosed ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 bg-red-405 rounded-full" />}
                  </button>
                </div>
              </div>

              <button
                onClick={runCalorimeterExperiment}
                disabled={!isReactantDumped || isCalorimeterRunning}
                className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-black font-sans flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {isCalorimeterRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Mengalkulasi Rekaman Kalor...</span>
                  </>
                ) : (
                  <>
                    <Beaker className="w-4 h-4" />
                    <span>Lakukan Pengukuran</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cup View & Calculation Sheet */}
          <div className="lg:col-span-8 space-y-5">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/30 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Coffee Cup View */}
              <div className="bg-slate-950/65 p-5 rounded-xl border border-slate-900 flex flex-col justify-between items-center text-center relative h-[340px]">
                <div className="text-[10px] font-mono text-zinc-500 block font-bold uppercase tracking-wider">SKEMA ADIABATIS CANGKIR STYROFOAM</div>
                
                <div className="relative my-auto flex flex-col items-center">
                  
                  {/* Weighing paper pouring active cascade */}
                  {showPourEffect && (
                    <div className="absolute -top-12 z-25 flex flex-col items-center animate-bounce">
                      <div className="w-12 h-6 bg-slate-100 rounded-sm skew-y-12 rotate-45 relative border border-slate-300">
                        <div className="absolute top-1 left-2 w-1.5 h-6 bg-zinc-350 rounded-full animate-ping" />
                      </div>
                      <span className="text-[8px] font-mono text-emerald-400 mt-2 block animate-pulse">POURING SOLID GENTLY...</span>
                    </div>
                  )}

                  {/* Styrofoam Lid of calorimeter */}
                  <div 
                    className={`w-28 h-4.5 bg-slate-700 rounded-lg border border-slate-600 z-20 flex justify-center shadow-lg transition-transform duration-500 ${
                      isLidClosed ? 'translate-y-2' : '-translate-y-6'
                    }`}
                  >
                    {/* Thermometer sticking out */}
                    <div className="w-2 h-14 bg-slate-300 -mt-8 rounded relative border border-slate-400">
                      <div className="w-1 h-10 bg-red-500 absolute bottom-0 left-0.5 rounded-sm" />
                    </div>

                    {/* Spinning Stirrer shaft whirring */}
                    <div 
                      className={`w-1.5 h-16 bg-amber-500 absolute left-8 -top-10 border border-amber-600 ${
                        stirringRpm > 0 ? 'animate-bounce' : ''
                      }`}
                    />
                  </div>

                  {/* Cup beaker Styrofoam layout */}
                  <div className="w-32 h-34 bg-slate-100 border-2 border-t-0 border-slate-300 rounded-b-3.5xl flex items-end p-0.5 relative shadow-md">
                    <div className="absolute inset-x-0 bottom-0 bg-teal-500/10 h-22 rounded-b-3.5xl border-t border-teal-500/20 relative flex flex-col items-center justify-end p-2.5 overflow-hidden">
                      
                      {/* Reactant pellets lying inside at bottom */}
                      {isReactantDumped && (
                        <div className="flex flex-wrap gap-1 p-1 absolute bottom-4 inset-x-4 justify-center">
                          <div className={`w-2 h-2 rounded-full ${calorimeterSubstance === 'naoh' ? 'bg-red-400/80' : 'bg-slate-300'} animate-pulse`} />
                          <div className={`w-2 h-2 rounded-full ${calorimeterSubstance === 'naoh' ? 'bg-red-450/80' : 'bg-slate-300'}`} />
                          <div className={`w-2 h-1.5 rounded-full ${calorimeterSubstance === 'naoh' ? 'bg-amber-400/80' : 'bg-slate-300'} animate-ping`} />
                        </div>
                      )}

                      {/* Spinning propeller representation aligned with RPM */}
                      {stirringRpm > 0 && (
                        <div className="absolute inset-0 flex justify-center items-center">
                          <div 
                            className="w-10 h-10 border-2 border-dashed border-teal-400 rounded-full" 
                            style={{ animation: `spin ${Math.max(0.1, 1.5 - (stirringRpm / 400))}s linear infinite` }}
                          />
                        </div>
                      )}

                      <div className="text-[8.5px] text-teal-400 font-mono text-center block z-10 font-bold uppercase tracking-wide">
                        {isReactantDumped ? 'BAHAN TERLARUT + AIR' : 'AIR REAKTAN MURNI'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-900/50 p-2.5 text-[9.5px] font-mono border border-slate-850 rounded">
                  {isLidClosed ? (
                    <span className="text-teal-400 flex items-center justify-center gap-1.5 font-bold">
                      <Check className="w-4 h-4 text-teal-400" /> INSULASI TERMOKAP ADIABATIS TERPASANG (100%)
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold block animate-pulse">
                      ⚠️ KOBOCORAN ENERGI: Tutup dilepas! 20% panas menguap liar!
                    </span>
                  )}
                </div>
              </div>

              {/* Mathematical spreadsheet compute deck */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-wider block">ALGORITMA &amp; KALKULASI DECK</span>
                
                {calorimeterOutput.isCalculated ? (
                  <div className="space-y-4 animate-fade-in text-xs font-mono">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-3">
                      <div>
                        <span className="text-zinc-500 text-[9.5px] block leading-none">TAHAP I: TRANSISI SUHU</span>
                        <div className="grid grid-cols-3 gap-2 text-center mt-1 text-[11px]">
                          <div className="bg-zinc-900 p-1.5 rounded text-slate-400">T_Awal: <span className="text-white block font-bold">{calorimeterOutput.tInitial}°C</span></div>
                          <div className="bg-zinc-900 p-1.5 rounded text-indigo-400">T_Akhir: <span className="text-white block font-bold">{calorimeterOutput.tFinal}°C</span></div>
                          <div className="bg-zinc-900 p-1.5 rounded text-amber-500">ΔT: <span className="text-white block font-bold">{calorimeterOutput.deltaT > 0 ? `+${calorimeterOutput.deltaT}` : calorimeterOutput.deltaT}°C</span></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-900">
                        <span className="text-zinc-500 text-[9.5px] block leading-none">TAHAP II: FORMULA KALOR LARUTAN (q)</span>
                        <div className="space-y-1 mt-1 text-slate-300 leading-snug">
                          <div>q = m_larutan · c · ΔT</div>
                          <div className="text-[10.5px] text-teal-400 leading-tight">
                            q = ({waterVolume + soluteMass}g) · 4.18 J/g°C · ({calorimeterOutput.deltaT}°C)
                            {calorimeterOutput.heatLossPercent > 0 && <span className="text-red-400 block text-[9px] mt-0.5">(*Kerugian Penutup: -{calorimeterOutput.heatLossPercent}% dispersi)</span>}
                            {calorimeterOutput.efficiencyPercent < 100 && <span className="text-yellow-400 block text-[9px] mt-0.5">(*Efisiensi Pengadukan: {calorimeterOutput.efficiencyPercent}% tidak maksimal)</span>}
                          </div>
                          <div className="text-sm font-bold text-white leading-normal mt-1">
                            q = {Math.abs(calorimeterOutput.qWater)} Joule ({Math.abs(calorimeterOutput.qWaterKj)} kJ)
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-900">
                        <span className="text-zinc-500 text-[9.5px] block leading-none">TAHAP III: ENTALPI STANDAR PELARUTAN (ΔH)</span>
                        <div className="space-y-1 mt-1 text-slate-300 leading-normal font-sans">
                          <div className="font-mono">Mol Zat padat (n) = {calorimeterOutput.moles} mol</div>
                          <div className="text-xs font-bold text-teal-400 font-mono mt-1">
                            ΔH_sol = − q / n = {calorimeterOutput.deltaH > 0 ? `+${calorimeterOutput.deltaH}` : calorimeterOutput.deltaH} kJ/mol
                          </div>
                        </div>
                      </div>
                    </div>

                    {calorimeterOutput.splashWarning && (
                      <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-sans leading-snug animate-pulse">
                        ⚠️ <strong>PERINGATAN:</strong> Pengadukan terlalu beringas ({stirringRpm} RPM)! Sedikit larutan terpercik keluar mengurangi akurasi pembacaan molar total!
                      </div>
                    )}

                    <div className="p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl space-y-1 font-sans">
                      <div className="flex items-center gap-1.5 text-teal-350 font-bold text-xs">
                        <Award className="w-4 h-4 text-teal-400" />
                        <span>Kandungan Kalor Reaksi Terpeta</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Data membuktikan {calorimeterSubstance === 'naoh' ? 'NaOH melarut secara Eksotermik (mengeluarkan kalor lisis neto ke lingkungan sehingga T_f naik)' : 'senyawa ini melarut secara Endotermik (menyerap panas lingkungan sehingga wadai mendingin)'}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-slate-850 border-dashed bg-slate-900/10 text-center text-slate-500 flex flex-col items-center justify-center h-[230px] space-y-1.5">
                    <Beaker className="w-8 h-8 text-slate-700 animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400">Kalorimeter Siap Diukur</h4>
                      <p className="text-[10.5px] text-zinc-500 max-w-xs leading-relaxed font-sans">
                        Selesaikan penuangan reaktan, atur RPM pengadukan, lalu klik lakukan pengukuran untuk memvisualisasikan data transisi energi.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );

  // ==========================================
  // MOLECULE SCISSORS SVG WORKBENCH CONSOLE
  // ==========================================
  function renderCorporateInteractiveWorkbench() {
    if (molecularStep === 'idle') {
      return (
        <div className="p-10 border border-dashed border-zinc-805 rounded-2xl text-center space-y-4">
          <Scissors className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Sesi Praktek Pemetaan Lisis Ikatan</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Selamat datang di workbench energi ikatan! Disini kita akan memotong ikatan kovalen reaktan secara visual dengan gunting laser 2D, lalu merakit produk senyawa baru untuk mengukur entalpi bersih reaksi!
            </p>
          </div>
          <button
            onClick={startScissorsGame}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl font-sans text-xs transition shadow-md cursor-pointer inline-block"
          >
            Mulai Pengujian Molekul
          </button>
        </div>
      );
    }

    const layout = MOLECULAR_LAYOUTS[curReaction.id];
    if (!layout) return null;

    if (molecularStep === 'breaking') {
      return (
        <div className="space-y-5 animate-slide-up">
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-xs flex justify-between items-center font-mono">
            <span><strong>Tahap I: Pemutusan Ikatan Reaktan</strong> (Endoterm / Menyerap Energi)</span>
            <span className="bg-red-900/60 px-2 py-0.5 rounded text-[11px] font-bold text-white">ΣDiserap: +{curReactantSum} kJ/mol</span>
          </div>

          <p className="text-xs text-zinc-400 font-sans">
            Gunakan cursor gunting laser dengan <strong>mengklik langsung garis-garis ikatan</strong> di dalam diagram molekul interaktif berikut untuk mematahkannya satu persatu!
          </p>

          {/* Interactive SVG molecular break container */}
          <div className="relative">
            <svg viewBox="0 0 540 210" className="w-full bg-slate-950/90 border border-slate-900 rounded-xl overflow-hidden relative shadow-inner">
              <rect width="100%" height="100%" fill="none" />
              
              {/* Draw Bonds first */}
              {layout.reactants.bonds.map((bond) => {
                const isBroken = clickedReactantBonds.includes(bond.id);
                
                // Calculate offset for double/triple parallel lines
                const dx = bond.x2 - bond.x1;
                const dy = bond.y2 - bond.y1;
                const len = Math.sqrt(dx * dx + dy * dy);
                const px = len > 0 ? (-dy / len) * 4 : 0;
                const py = len > 0 ? (dx / len) * 4 : 0;

                const strokeColor = isBroken ? 'stroke-red-500/10' : 'stroke-orange-400';
                const strokeWidth = '3';
                const dashArray = isBroken ? '4,4' : undefined;

                return (
                  <g key={bond.id} className="group/bond cursor-pointer" onClick={() => processDirectReactantCut(bond.id, bond.type)}>
                    {/* Visual bond lines */}
                    {bond.style === 'single' && (
                      <line x1={bond.x1} y1={bond.y1} x2={bond.x2} y2={bond.y2} strokeWidth={strokeWidth} className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                    )}
                    {bond.style === 'double' && (
                      <>
                        <line x1={bond.x1 + px} y1={bond.y1 + py} x2={bond.x2 + px} y2={bond.y2 + py} strokeWidth="2.5" className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                        <line x1={bond.x1 - px} y1={bond.y1 - py} x2={bond.x2 - px} y2={bond.y2 - py} strokeWidth="2.5" className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                      </>
                    )}
                    {bond.style === 'triple' && (
                      <>
                        <line x1={bond.x1} y1={bond.y1} x2={bond.x2} y2={bond.y2} strokeWidth="2" className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                        <line x1={bond.x1 + px * 1.5} y1={bond.y1 + py * 1.5} x2={bond.x2 + px * 1.5} y2={bond.y2 + py * 1.5} strokeWidth="2" className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                        <line x1={bond.x1 - px * 1.5} y1={bond.y1 - py * 1.5} x2={bond.x2 - px * 1.5} y2={bond.y2 - py * 1.5} strokeWidth="2" className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                      </>
                    )}

                    {/* Cut visual graphic marks if broken */}
                    {isBroken && (
                      <path d={`M ${(bond.x1 + bond.x2)/2 - 8} ${(bond.y1 + bond.y2)/2 - 8} L ${(bond.x1 + bond.x2)/2 + 8} ${(bond.y1 + bond.y2)/2 + 8} M ${(bond.x1 + bond.x2)/2 + 8} ${(bond.y1 + bond.y2)/2 - 8} L ${(bond.x1 + bond.x2)/2 - 8} ${(bond.y1 + bond.y2)/2 + 8}`} stroke="#ef4444" strokeWidth="2.5" />
                    )}

                    {/* Transparent Click Target Overlay */}
                    {!isBroken && (
                      <line 
                        x1={bond.x1} y1={bond.y1} x2={bond.x2} y2={bond.y2} 
                        strokeWidth="16" 
                        stroke="transparent" 
                        className="hover:stroke-yellow-400/25 transition-all text-xs"
                      />
                    )}
                  </g>
                );
              })}

              {/* Draw Atoms as HTML Foreignobject overlays */}
              {layout.reactants.atoms.map((atom) => {
                // Dim atoms if their bonds are cut
                const isN2Reaction = curReaction.id === 'n2_synthesis';
                return (
                  <foreignObject key={atom.id} x={atom.x - 17} y={atom.y - 17} width="34" height="34">
                    <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-mono font-black text-xs select-none shadow-md border border-zinc-900/40 transition-all ${atom.color}`}>
                      {atom.label}
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
            <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded border border-zinc-800 text-[9px] font-mono text-zinc-500">
              💡 Klik langsung garis-garis ikatan kovalen di atas!
            </div>
          </div>

          {/* Sub progress bars fallback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
            {curReaction.reactantBonds.map((rb) => {
              const currentCount = brokenBonds[rb.bond] || 0;
              const isDone = currentCount >= rb.count;
              return (
                <div key={rb.bond} className="bg-slate-950/40 p-3 rounded-xl border border-zinc-850 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-zinc-300">Ikatan {rb.bond}</span>
                    <span className="text-[10px] font-mono block text-red-400/80 mt-0.5">Suhu serap: +{rb.energy} kJ/mol</span>
                  </div>
                  <span className="font-mono bg-zinc-900 px-2.5 py-1 rounded text-zinc-400">
                    {currentCount} / {rb.count} potong
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-3 border-t border-zinc-900/80">
            <span>Dibutuhkan: +{finalTheoreticalReactantSum} kJ secara keseluruhan</span>
            <span className="text-amber-500 animate-pulse font-extrabold font-sans">Selesaikan pemotongan ikatan di atas...</span>
          </div>
        </div>
      );
    }

    if (molecularStep === 'forming') {
      return (
        <div className="space-y-5 animate-slide-up">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex justify-between items-center font-mono">
            <span><strong>Tahap II: Penggabungan Atom Produk</strong> (Eksoterm / Melepas Kalor)</span>
            <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-[11px] font-bold text-white">ΣDilepas: −{curProductSum} kJ/mol</span>
          </div>

          <p className="text-xs text-zinc-400 font-sans">
            Kerja Bagus! Reaktan berhasil dicercah. Sekarang, <strong>klik garis-garis putus putih (Draft Covalent)</strong> di bawah ini untuk mengelasnya menjadi senyawa stabil!
          </p>

          {/* Interactive forming bonds SVG element */}
          <div className="relative">
            <svg viewBox="0 0 540 210" className="w-full bg-slate-950/90 border border-slate-900 rounded-xl overflow-hidden relative shadow-inner">
              <rect width="100%" height="100%" fill="none" />
              
              {/* Product Bonds */}
              {layout.products.bonds.map((bond) => {
                const isFormed = clickedProductBonds.includes(bond.id);
                
                // Calculate offset for double/triple parallel lines
                const dx = bond.x2 - bond.x1;
                const dy = bond.y2 - bond.y1;
                const len = Math.sqrt(dx * dx + dy * dy);
                const px = len > 0 ? (-dy / len) * 4 : 0;
                const py = len > 0 ? (dx / len) * 4 : 0;

                // Formed bonds are thick green lines, drafting bonds are dotted white/amber lines
                const strokeColor = isFormed ? 'stroke-emerald-400' : 'stroke-zinc-700/60';
                const strokeWidth = isFormed ? '4' : '2.5';
                const dashArray = isFormed ? undefined : '5,5';

                return (
                  <g key={bond.id} className="group/bond cursor-pointer" onClick={() => processDirectProductWeld(bond.id, bond.type)}>
                    {/* Visual covalent paths */}
                    {bond.style === 'single' && (
                      <line x1={bond.x1} y1={bond.y1} x2={bond.x2} y2={bond.y2} strokeWidth={strokeWidth} className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                    )}
                    {bond.style === 'double' && (
                      <>
                        <line x1={bond.x1 + px} y1={bond.y1 + py} x2={bond.x2 + px} y2={bond.y2 + py} strokeWidth={isFormed ? '3.5' : '2'} className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                        <line x1={bond.x1 - px} y1={bond.y1 - py} x2={bond.x2 - px} y2={bond.y2 - py} strokeWidth={isFormed ? '3.5' : '2'} className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                      </>
                    )}
                    {bond.style === 'triple' && (
                      <>
                        <line x1={bond.x1} y1={bond.y1} x2={bond.x2} y2={bond.y2} strokeWidth={isFormed ? '3' : '1.5'} className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                        <line x1={bond.x1 + px * 1.5} y1={bond.y1 + py * 1.5} x2={bond.x2 + px * 1.5} y2={bond.y2 + py * 1.5} strokeWidth={isFormed ? '3' : '1.5'} className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                        <line x1={bond.x1 - px * 1.5} y1={bond.y1 - py * 1.5} x2={bond.x2 - px * 1.5} y2={bond.y2 - py * 1.5} strokeWidth={isFormed ? '3' : '1.5'} className={`${strokeColor} transition-all`} strokeDasharray={dashArray} />
                      </>
                    )}

                    {/* Laser welding particle sparkles around center if formed */}
                    {isFormed && (
                      <circle cx={(bond.x1 + bond.x2)/2} cy={(bond.y1 + bond.y2)/2} r="5" className="fill-emerald-400 animate-ping opacity-60 pointer-events-none" />
                    )}

                    {/* Click transparent overlay */}
                    {!isFormed && (
                      <line 
                        x1={bond.x1} y1={bond.y1} x2={bond.x2} y2={bond.y2} 
                        strokeWidth="16" 
                        stroke="transparent" 
                        className="hover:stroke-emerald-400/20 transition-all"
                      />
                    )}
                  </g>
                );
              })}

              {/* Atoms */}
              {layout.products.atoms.map((atom) => (
                <foreignObject key={atom.id} x={atom.x - 17} y={atom.y - 17} width="34" height="34">
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-mono font-black text-xs select-none shadow-md border border-zinc-900/40 transition-all ${atom.color}`}>
                    {atom.label}
                  </div>
                </foreignObject>
              ))}
            </svg>
            <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded border border-zinc-800 text-[9px] font-mono text-zinc-500">
              💡 Las ikatan draf kovalen (putus-putus) diatas!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
            {curReaction.productBonds.map((pb) => {
              const currentCount = formedBonds[pb.bond] || 0;
              return (
                <div key={pb.bond} className="bg-slate-950/40 p-3 rounded-xl border border-zinc-850 flex justify-between items-center text-xs text-sans">
                  <div>
                    <span className="font-bold text-zinc-300">Ikatan {pb.bond}</span>
                    <span className="text-[10px] font-mono block text-emerald-400 mt-0.5">Suhu lepas: −{pb.energy} kJ/mol</span>
                  </div>
                  <span className="font-mono bg-zinc-900 px-2.5 py-1 rounded text-zinc-450">
                    {currentCount} / {pb.count} terpasang
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-3 border-t border-zinc-900/85">
            <span>Dilepas total akhir nanti: −{finalTheoreticalProductSum} kJ</span>
            <span className="text-teal-400 animate-pulse font-extrabold font-sans">Mengelas ikatan produk...</span>
          </div>
        </div>
      );
    }

    if (molecularStep === 'completed') {
      const calculatedGameDeltaH = finalTheoreticalReactantSum - finalTheoreticalProductSum;
      return (
        <div className="p-6 bg-slate-950/60 rounded-2xl border border-zinc-900 space-y-4 animate-scale-up text-center">
          <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <Award className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Neraca Hasil Kalibrasi Molekuler</h4>
            <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
              Siklus Hess berhasil disimulasikan lengkap! Memutus reaktan memerlukan suplai energi kinetik eksternal (+), sementara bentukan produk baru melepaskan pancaran netto energi bebas (−):
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-zinc-850 rounded-xl max-w-sm mx-auto font-mono text-left space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Σ Reaktan (Diserap) :</span>
              <span className="text-red-400 font-bold">+{finalTheoreticalReactantSum} kJ/mol</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Σ Produk (Dilepas) :</span>
              <span className="text-emerald-400 font-bold">−{finalTheoreticalProductSum} kJ/mol</span>
            </div>
            <div className="border-t border-zinc-805 pt-2 flex justify-between text-xs font-black">
              <span className="text-slate-300">Entalpi Reaksi Bersih (ΔH) :</span>
              <span className={calculatedGameDeltaH < 0 ? 'text-rose-400' : 'text-sky-400'}>
                {calculatedGameDeltaH} kJ/mol
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={startScissorsGame}
              className="px-4 py-1.5 border border-zinc-800 hover:bg-slate-900 rounded-lg text-xs font-semibold cursor-pointer text-slate-300"
            >
              Ulangi Simulasi Ini
            </button>
            <button
              onClick={() => setMolecularStep('idle')}
              className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-lg text-xs font-black cursor-pointer shadow"
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
      );
    }
  }
}
