/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Info, HelpCircle, ArrowRight, RefreshCw, CheckCircle, 
  XCircle, Award, Volume2, VolumeX, Sparkles, BookOpen, Activity, Play, Pause,
  Calculator, Layers, Flame, FileText, ChevronRight, ChevronLeft
} from 'lucide-react';
import { 
  VOLTA_METALS, 
  REDOX_REACTIONS, 
  ELECTROLYTE_REACTIONS, 
  QUIZ_QUESTIONS,
  VoltaMetal,
  RedoxReaction,
  ElectrolyteReaction
} from './ChemistryData';

interface RedoxChallenge {
  id: string;
  reactants: { formula: string; charge: number; atoms: { [elem: string]: number } }[];
  products: { formula: string; charge: number; atoms: { [elem: string]: number } }[];
  correctCoefs: number[];
  flaskFunc: (coefs: number[]) => { bg: string; border: string; desc: string; bubble?: boolean };
}

const REDOX_CHALLENGES: RedoxChallenge[] = [
  {
    id: 'rx-1',
    reactants: [
      { formula: 'MnO₄⁻', charge: -1, atoms: { Mn: 1, O: 4 } },
      { formula: 'Fe²⁺', charge: 2, atoms: { Fe: 1 } },
      { formula: 'H⁺', charge: 1, atoms: { H: 1 } }
    ],
    products: [
      { formula: 'Mn²⁺', charge: 2, atoms: { Mn: 1 } },
      { formula: 'Fe³⁺', charge: 3, atoms: { Fe: 1 } },
      { formula: 'H₂O', charge: 0, atoms: { H: 2, O: 1 } }
    ],
    correctCoefs: [1, 5, 8, 1, 5, 4],
    flaskFunc: (c: number[]) => {
      const r1 = c[0];
      const r2 = c[1];
      const p1 = c[3];
      const p2 = c[4];
      const isBalanced = c[0] === 1 && c[1] === 5 && c[2] === 8 && c[3] === 1 && c[4] === 5 && c[5] === 4;
      if (isBalanced) {
        return {
          bg: 'rgba(236, 72, 153, 0.25)',
          border: 'border-pink-400',
          desc: 'Light Pink (Colorless): Titik ekivalen tercapai sempurna! Seluruh spesi MnO₄⁻ tereduksi habis menjadi kation Mn²⁺ tak berwarna.'
        };
      } else if (r1 > r2 / 5) {
        return {
          bg: 'rgba(168, 85, 247, 0.65)',
          border: 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
          desc: 'Deep Purple: Kepekatan warna ungu permanganat (MnO₄⁻) yang sangat tinggi menyelimuti laboratorium.'
        };
      } else if (p2 > 1) {
        return {
          bg: 'rgba(202, 138, 4, 0.3)',
          border: 'border-yellow-600',
          desc: 'Sepia Yellow-Brown: Akibat pembentukan akumulasi ion Fe³⁺ hasil oksidasi Fe²⁺ tanpa sisa MnO₄⁻.'
        };
      } else {
        return {
          bg: 'rgba(226, 232, 240, 0.1)',
          border: 'border-slate-800',
          desc: 'Translucent Grey: Campuran terlarut encer dengan kepekatan rendah.'
        };
      }
    }
  },
  {
    id: 'rx-2',
    reactants: [
      { formula: 'Cr₂O₇²⁻', charge: -2, atoms: { Cr: 2, O: 7 } },
      { formula: 'C₂O₄²⁻', charge: -2, atoms: { C: 2, O: 4 } },
      { formula: 'H⁺', charge: 1, atoms: { H: 1 } }
    ],
    products: [
      { formula: 'Cr³⁺', charge: 3, atoms: { Cr: 1 } },
      { formula: 'CO₂', charge: 0, atoms: { C: 1, O: 2 } },
      { formula: 'H₂O', charge: 0, atoms: { H: 2, O: 1 } }
    ],
    correctCoefs: [1, 3, 14, 2, 6, 7],
    flaskFunc: (c: number[]) => {
      const r1 = c[0];
      const p1 = c[3];
      const isBalanced = c[0] === 1 && c[1] === 3 && c[2] === 14 && c[3] === 2 && c[4] === 6 && c[5] === 7;
      if (isBalanced) {
        return {
          bg: 'rgba(16, 185, 129, 0.4)',
          border: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
          desc: 'Deep Emerald Green: Kation kromium(III) Cr³⁺ mulia mendominasi seisi labu setelah dikromat tereduksi penuh, dilepaskan gas CO₂.',
          bubble: true
        };
      } else if (r1 > p1 / 2) {
        return {
          bg: 'rgba(249, 115, 22, 0.55)',
          border: 'border-orange-500',
          desc: 'Vaporous Orange: Didominasi warna jingga pekat asam dari ion kalium dikromat Cr₂O₇²⁻ pekat.'
        };
      } else {
        return {
          bg: 'rgba(120, 113, 108, 0.3)',
          border: 'border-stone-600',
          desc: 'Dirty Olive: Campuran hasil reaksi reduksi parsial tak seimbang.',
          bubble: true
        };
      }
    }
  },
  {
    id: 'rx-3',
    reactants: [
      { formula: 'Cl₂', charge: 0, atoms: { Cl: 2 } },
      { formula: 'IO₃⁻', charge: -1, atoms: { I: 1, O: 3 } },
      { formula: 'OH⁻', charge: -1, atoms: { O: 1, H: 1 } }
    ],
    products: [
      { formula: 'Cl⁻', charge: -1, atoms: { Cl: 1 } },
      { formula: 'IO₄⁻', charge: -1, atoms: { I: 1, O: 4 } },
      { formula: 'H₂O', charge: 0, atoms: { H: 2, O: 1 } }
    ],
    correctCoefs: [1, 1, 2, 2, 1, 1],
    flaskFunc: (c: number[]) => {
      const r1 = c[0];
      const isBalanced = c[0] === 1 && c[1] === 1 && c[2] === 2 && c[3] === 2 && c[4] === 1 && c[5] === 1;
      if (isBalanced) {
        return {
          bg: 'rgba(212, 212, 216, 0.12)',
          border: 'border-zinc-500',
          desc: 'Crystal Clear Colorless: Reaksi sempurna melarutkan gas klorin dan menghasilkan campuran garam halida murni jernih.'
        };
      } else if (r1 > 1) {
        return {
          bg: 'rgba(190, 242, 100, 0.22)',
          border: 'border-lime-400',
          desc: 'Yellowish-Lime Haze: Akibat uap gas klorin Cl₂ bebas yang terlarut kental di atas tabung reaksi.'
        };
      } else {
        return {
          bg: 'rgba(244, 244, 245, 0.08)',
          border: 'border-zinc-800',
          desc: 'Clear Alkaline: Larutan tidak berwarna dengan gelembung halogen pasif.'
        };
      }
    }
  }
];

export default function VoltaLab() {
  // Navigation Section State
  const [activeSection, setActiveSection] = useState<'redox' | 'volta' | 'electrolysis' | 'theory' | 'quiz'>('redox');

  // Interactive Play State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [tickCount, setTickCount] = useState<number>(0);

  // Tick generator for SVG animations
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTickCount(prev => (prev + 1) % 120);
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // ==========================================
  // MODULE 1: REAKSI REDOKS (REDOX) STATES
  // ==========================================
  const [activeRedoxIdx, setActiveRedoxIdx] = useState<number>(0);
  const [redoxStepIdx, setRedoxStepIdx] = useState<number>(0);
  const [isBiloksOpen, setIsBiloksOpen] = useState<boolean>(false);

  // Challenge mode extra states
  const [redoxMode, setRedoxMode] = useState<'stepper' | 'challenge'>('stepper');
  const [userCoefs, setUserCoefs] = useState<number[]>([1, 1, 1, 1, 1, 1]);
  const [challengeSubmitted, setChallengeSubmitted] = useState<boolean>(false);
  const [challengeSuccess, setChallengeSuccess] = useState<boolean>(false);

  useEffect(() => {
    setUserCoefs([1, 1, 1, 1, 1, 1]);
    setChallengeSubmitted(false);
    setChallengeSuccess(false);
  }, [activeRedoxIdx]);

  const activeRedox = REDOX_REACTIONS[activeRedoxIdx];

  const currentChallenge = REDOX_CHALLENGES[activeRedoxIdx];

  // Net charge left
  const chargeLeft = currentChallenge.reactants.reduce((sum, sp, idx) => {
    return sum + (userCoefs[idx] * sp.charge);
  }, 0);

  // Net charge right
  const chargeRight = currentChallenge.products.reduce((sum, sp, idx) => {
    return sum + (userCoefs[idx + 3] * sp.charge);
  }, 0);

  // Atom counts left
  const atomsLeft: { [elem: string]: number } = {};
  currentChallenge.reactants.forEach((sp, idx) => {
    const factor = userCoefs[idx];
    Object.entries(sp.atoms).forEach(([elem, count]) => {
      atomsLeft[elem] = (atomsLeft[elem] || 0) + (count * factor);
    });
  });

  // Atom counts right
  const atomsRight: { [elem: string]: number } = {};
  currentChallenge.products.forEach((sp, idx) => {
    const factor = userCoefs[idx + 3];
    Object.entries(sp.atoms).forEach(([elem, count]) => {
      atomsRight[elem] = (atomsRight[elem] || 0) + (count * factor);
    });
  });

  // Get all unique elements in the reaction
  const allElements = Array.from(new Set([
    ...Object.keys(atomsLeft),
    ...Object.keys(atomsRight)
  ]));

  // Is totally balanced?
  const isAllAtomsBalanced = allElements.every(elem => (atomsLeft[elem] || 0) === (atomsRight[elem] || 0));
  const isChargeBalanced = chargeLeft === chargeRight;
  const isChallengeCorrect = isAllAtomsBalanced && isChargeBalanced;

  // Flask details
  const flaskInfo = currentChallenge.flaskFunc(userCoefs);

  const handleCheckChallenge = () => {
    setChallengeSubmitted(true);
    if (isChallengeCorrect) {
      setChallengeSuccess(true);
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'redox_challenge_completed',
          labId: 'volta',
          title: 'Tantangan Redoks Interaktif',
          description: `Berhasil menyeimbangkan reaksi ${activeRedox.reactantStr} secara mandiri dengan koefisien: ${userCoefs.join(', ')}`,
          score: { earned: 5, total: 5 }
        }
      }));
    } else {
      setChallengeSuccess(false);
    }
  };

  const handleNextRedoxStep = () => {
    if (redoxStepIdx < activeRedox.steps.length - 1) {
      setRedoxStepIdx(prev => prev + 1);
    } else {
      // Dispatch completion activity
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'redox_completed',
          labId: 'volta',
          title: 'Penyetaraan Redoks',
          description: `Berhasil menyelesaikan langkah demi langkah penyetaraan reaksi ${activeRedox.reactantStr}`,
          score: { earned: 1, total: 1 }
        }
      }));
    }
  };

  // ==========================================
  // MODULE 2: SEL VOLTA STATES & SOUND
  // ==========================================
  const [leftMetalId, setLeftMetalId] = useState<string>('Zn');
  const [rightMetalId, setRightMetalId] = useState<string>('Cu');
  const [isNernstActive, setIsNernstActive] = useState<boolean>(false);
  const [leftConc, setLeftConc] = useState<number>(1.0);
  const [rightConc, setRightConc] = useState<number>(1.0);
  const [temperature, setTemperature] = useState<number>(298.15);

  const leftMetal = VOLTA_METALS.find(m => m.id === leftMetalId) || VOLTA_METALS[2];
  const rightMetal = VOLTA_METALS.find(m => m.id === rightMetalId) || VOLTA_METALS[6];

  const isLeftAnode = leftMetal.e0 < rightMetal.e0;
  const anode = isLeftAnode ? leftMetal : rightMetal;
  const cathode = isLeftAnode ? rightMetal : leftMetal;
  const anodeConc = isLeftAnode ? leftConc : rightConc;
  const cathodeConc = isLeftAnode ? rightConc : leftConc;

  const e0Cell = cathode.e0 - anode.e0;
  const gcd = (a: number, b: number): number => (!b ? a : gcd(b, a % b));
  const valencyLCM = (anode.valency * cathode.valency) / gcd(anode.valency, cathode.valency);
  const nTransferred = valencyLCM;
  const anodePower = nTransferred / anode.valency;
  const cathodePower = nTransferred / cathode.valency;
  const Q = Math.pow(anodeConc, anodePower) / Math.pow(cathodeConc, cathodePower);

  const rGasConstant = 8.314;
  const faradayConstant = 96485;
  const nernstFactor = (rGasConstant * temperature) / (nTransferred * faradayConstant);
  const actualPotVal = isNernstActive ? e0Cell - nernstFactor * Math.log(Q) : e0Cell;
  const isSpontaneous = actualPotVal > 0;

  // Dispatch state updates to window for adaptive feedback
  useEffect(() => {
    (window as any).chemvibe_latest_state = {
      lab: 'volta-lab',
      timestamp: Date.now(),
      data: {
        isLeftAnode,
        anode: { symbol: anode?.symbol, e0: anode?.e0, valency: anode?.valency },
        cathode: { symbol: cathode?.symbol, e0: cathode?.e0, valency: cathode?.valency },
        actualPotVal,
        isNernstActive,
        leftMetalId,
        rightMetalId,
        leftConc,
        rightConc,
        temperature
      }
    };
    window.dispatchEvent(new CustomEvent('chemvibe_state_change', {
      detail: { lab: 'volta-lab' }
    }));
  }, [isLeftAnode, anode, cathode, actualPotVal, isNernstActive, leftMetalId, rightMetalId, leftConc, rightConc, temperature]);

  // Audio Sonification Synthesis
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const buzzGainNodeRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  const toggleVoltaAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    if (nextState) {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
      } catch (e) {
        console.error("Audio Context Init Error:", e);
      }
    } else {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(() => {});
      }
    }
  };

  useEffect(() => {
    return () => {
      if (osc1Ref.current) { try { osc1Ref.current.stop(); } catch(_) {} }
      if (osc2Ref.current) { try { osc2Ref.current.stop(); } catch(_) {} }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isAudioEnabled || !isPlaying || actualPotVal <= 0 || activeSection !== 'volta') {
      if (buzzGainNodeRef.current && audioContextRef.current) {
        buzzGainNodeRef.current.gain.setTargetAtTime(0.001, audioContextRef.current.currentTime, 0.1);
      }
      return;
    }

    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (!buzzGainNodeRef.current) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();

        const baseFreq = 52 + actualPotVal * 22;
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq * 2 + 0.3, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
        buzzGainNodeRef.current = gainNode;
      }

      const baseFreq = 52 + actualPotVal * 22;
      if (osc1Ref.current) osc1Ref.current.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.1);
      if (osc2Ref.current) osc2Ref.current.frequency.setTargetAtTime(baseFreq * 2 + 0.3, ctx.currentTime, 0.1);
      if (buzzGainNodeRef.current) {
        const targetGain = Math.min(0.08, 0.03 + (actualPotVal * 0.025));
        buzzGainNodeRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.1);
      }
    } catch (e) {
      console.error("Audio Update Error:", e);
    }
  }, [isAudioEnabled, isPlaying, actualPotVal, activeSection]);

  const handleResetVolta = () => {
    setLeftMetalId('Zn');
    setRightMetalId('Cu');
    setLeftConc(1.0);
    setRightConc(1.0);
    setIsNernstActive(false);
  };

  // ==========================================
  // MODULE 3: SEL ELEKTROLISIS (ELECTROLYSIS) STATES
  // ==========================================
  const [activeElectrolyteIdx, setActiveElectrolyteIdx] = useState<number>(0);
  const [currentAmp, setCurrentAmp] = useState<number>(5.0);
  const [timeSec, setTimeSec] = useState<number>(965);

  const activeElectrolyte = ELECTROLYTE_REACTIONS[activeElectrolyteIdx];

  // Faraday Calculator math
  const cathodeEqWeight = activeElectrolyte.cathodeAr / activeElectrolyte.cathodeValency;
  const cathodeDepositedMass = (cathodeEqWeight * currentAmp * timeSec) / 96500;

  // Gas volume calculations at STP (22.4 L per mole)
  // moles of e- = (I * t) / 96500
  // oxygen (anode valency = 4): moles product = moles e- / 4. Volume = moles * 22.4
  // hydrogen (cathode valency = 2): moles product = moles e- / 2. Volume = moles * 22.4
  // chlorine (anode valency = 2): moles product = moles e- / 2. Volume = moles * 22.4
  const totalElectronmoles = (currentAmp * timeSec) / 96500;
  const anodeGasVolumeSTP = (totalElectronmoles / activeElectrolyte.anodeValency) * 22.4;
  const cathodeGasVolumeSTP = (totalElectronmoles / activeElectrolyte.cathodeValency) * 22.4;

  const handleComputeFaraday = () => {
    window.dispatchEvent(new CustomEvent('chemvibe_activity', {
      detail: {
        activityType: 'faraday_completed',
        labId: 'volta',
        title: 'Kalkulasi Hukum Faraday',
        description: `Melakukan simulasi hukum Faraday elektrolisis ${activeElectrolyte.name} menghasilkan deposit/gas teoritis`,
        score: { earned: 1, total: 1 }
      }
    }));
  };

  // ==========================================
  // MODULE 5: QUIZ STATES
  // ==========================================
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  const handleSubmittingAnswer = () => {
    if (selectedAnswer === null) return;
    setHasSubmittedAnswer(true);
    if (selectedAnswer === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswer(null);
    setHasSubmittedAnswer(false);
    if (currentQuizIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setShowQuizResult(true);
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          labId: 'volta',
          title: 'Kuis Elektrokimia',
          description: `Telah lulus evaluasi elektrokimia (Redoks, Volta & Elektrolisis) dengan skor ${score}/${QUIZ_QUESTIONS.length}`,
          score: { earned: score, total: QUIZ_QUESTIONS.length }
        }
      }));
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setHasSubmittedAnswer(false);
    setScore(0);
    setShowQuizResult(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-teal-400" />
            Laboratorium Elektrokimia &amp; Sel Elektrolisis
          </h2>
          <p className="text-zinc-400 text-sm">
            Eksplorasi modul Reaksi Redoks, Sel Volta (Galvani) dengan Persamaan Nernst, Hukum Faraday Sel Elektrolisis, dan kuis uji kemampuan.
          </p>
        </div>

        {/* TOP COMPONENT DIVISION NAVIGATION BAR */}
        <div className="flex flex-wrap bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1">
          <button 
            onClick={() => { setActiveSection('redox'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'redox' ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reaksi Redoks
          </button>
          <button 
            onClick={() => { setActiveSection('volta'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'volta' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sel Volta (Galvani)
          </button>
          <button 
            onClick={() => { setActiveSection('electrolysis'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'electrolysis' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sel Elektrolisis
          </button>
          <button 
            onClick={() => { setActiveSection('theory'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'theory' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Teori Kelas XII
          </button>
          <button 
            onClick={() => { setActiveSection('quiz'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'quiz' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Kuis Evaluasi
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: REAKSI REDOKS (REDOX) VISUAL EXPLORER */}
      {/* ======================================================== */}
      {activeSection === 'redox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Reaction selection & Biloks Cheat-sheet */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">PILIH REAKSI REDOKS</span>
              <div className="flex flex-col gap-2.5">
                {REDOX_REACTIONS.map((rx, idx) => (
                  <button
                    key={rx.id}
                    onClick={() => {
                      setActiveRedoxIdx(idx);
                      setRedoxStepIdx(0);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeRedoxIdx === idx 
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-400' 
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-300 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-mono tracking-wider uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {rx.type === 'acidic' ? 'Suasana Asam' : 'Suasana Basa'}
                      </span>
                    </div>
                    <span>{rx.reactantStr} ➔ {rx.productStr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Biloks Reference Cheat Sheet */}
            <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-3">
              <button
                onClick={() => setIsBiloksOpen(!isBiloksOpen)}
                className="w-full flex justify-between items-center text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono cursor-pointer hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-400" />
                  Aturan Penentuan Biloks
                </span>
                <span className="text-teal-400 font-bold">{isBiloksOpen ? 'Sembunyikan' : 'Buka Panduan'}</span>
              </button>

              {isBiloksOpen && (
                <div className="text-[10.5px] text-zinc-400 space-y-2.5 pt-2 border-t border-zinc-850 animate-fade-in leading-relaxed font-sans">
                  <p>Berikut ringkasan praktis menentukan bilangan oksidasi (Biloks) unsur SMA kelas XII:</p>
                  <ul className="list-disc pl-4 space-y-1.5 text-zinc-500">
                    <li><strong className="text-zinc-300">Unsur Bebas</strong> (O₂, Fe, Na) = <span className="text-teal-400 font-bold">0</span>.</li>
                    <li><strong className="text-zinc-300">Fluorin (F)</strong> dalam senyawa selalu = <span className="text-teal-400 font-bold">-1</span>.</li>
                    <li><strong className="text-zinc-300">Logam Alkali IA</strong> = <span className="text-teal-300 font-semibold">+1</span>; <strong className="text-zinc-300">Alkali Tanah IIA</strong> = <span className="text-teal-305 font-semibold">+2</span>.</li>
                    <li><strong className="text-zinc-300">Hidrogen (H)</strong> umumnya = <span className="text-teal-400 font-semibold">+1</span> (Kecuali hidrida logam = -1).</li>
                    <li><strong className="text-zinc-300">Oksigen (O)</strong> umumnya = <span className="text-red-400 font-semibold">-2</span> (Kecuali peroksida = -1, superoksida = -0.5, OF₂ = +2).</li>
                    <li><strong className="text-zinc-300">Jumlah Biloks Netral</strong> = <span className="text-teal-400 font-bold">0</span>; <strong className="text-zinc-300">Ion Poliatom</strong> = Muatan Ionnya.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Main workspace container (right panel) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Sub-navigation tabs */}
            <div className="flex bg-slate-950 p-1 border border-zinc-850 rounded-xl w-max">
              <button
                type="button"
                onClick={() => setRedoxMode('stepper')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  redoxMode === 'stepper' 
                    ? 'bg-slate-800 text-white border border-slate-700/30' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                Mode Panduan Stepper
              </button>
              <button
                type="button"
                onClick={() => setRedoxMode('challenge')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  redoxMode === 'challenge' 
                    ? 'bg-slate-800 text-white border border-slate-700/30' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Simulator Penyetaraan Mandiri
              </button>
            </div>

            {/* Stepper mode content */}
            {redoxMode === 'stepper' ? (
              <div className="glass-panel border-white/5 bg-slate-900/45 rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-black uppercase tracking-widest block">MODUL ANIMASI STEPPER PENYETARAAN</span>
                    <h3 className="text-lg font-bold text-white font-sans mt-0.5">Metode Setengah Reaksi (Ion-Elektron)</h3>
                  </div>
                  <div className="flex items-center bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1 font-mono text-xs text-zinc-400 font-bold">
                    LANGKAH {redoxStepIdx + 1} / {activeRedox.steps.length}
                  </div>
                </div>

                {/* Step indicator bar */}
                <div className="flex gap-1">
                  {activeRedox.steps.map((_, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setRedoxStepIdx(idx)}
                      className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all duration-305 ${
                        idx === redoxStepIdx 
                          ? 'bg-teal-500 shadow-md shadow-teal-500/20' 
                          : idx < redoxStepIdx 
                            ? 'bg-teal-900/80' 
                            : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>

                {/* Active Step Details */}
                <div className="space-y-4 p-5 bg-zinc-950/60 rounded-xl border border-zinc-900/80">
                  <span className="text-[9.5px] font-semibold tracking-wider text-teal-400 font-mono block uppercase bg-teal-500/5 py-0.5 px-2 rounded-md w-max border border-teal-500/15">
                    Langkah {redoxStepIdx + 1}: {activeRedox.steps[redoxStepIdx].title}
                  </span>
                  
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
                    {activeRedox.steps[redoxStepIdx].description}
                  </p>

                  <div className="bg-zinc-950 p-4.5 rounded-lg border border-zinc-900 font-mono text-white text-xs sm:text-sm text-center leading-relaxed whitespace-pre-line shadow-inner max-w-full overflow-x-auto">
                    {activeRedox.steps[redoxStepIdx].equation}
                  </div>
                </div>

                {/* Navigator Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    disabled={redoxStepIdx === 0}
                    onClick={() => setRedoxStepIdx(prev => prev - 1)}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 rounded-xl text-xs font-bold font-sans flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Kembali
                  </button>

                  {redoxStepIdx < activeRedox.steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextRedoxStep}
                      className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-xl text-xs font-black font-sans flex items-center gap-1.5 shadow-md shadow-teal-500/10 transition-all cursor-pointer animate-pulse"
                    >
                      <span>Langkah Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-tight font-sans flex items-center gap-1.5 animate-bounce">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Reaksi Berhasil Disetarakan!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Challenge mode content */
              <div className="glass-panel border-white/5 bg-slate-900/45 rounded-2xl p-6 space-y-6">
                <div className="p-4 bg-teal-500/5 rounded-xl border border-teal-500/15 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-teal-300 font-mono uppercase tracking-wide">Tantangan Kuantitatif Redoks</h4>
                    <p className="text-[11px] text-zinc-400 leading-normal">
                      Uji kemampuan Anda menyetarakan reaksi elektrokimia secara mandiri! Atur nilai koefisien reaktan dan produk menggunakan kontrol <code className="text-teal-400 px-1 bg-slate-950 border border-zinc-805 rounded font-bold font-mono">+</code> / <code className="text-teal-400 px-1 bg-slate-950 border border-zinc-805 rounded font-bold font-mono">-</code>. Amati transformasi warna larutan dalam labu kimia secara real-time!
                    </p>
                  </div>
                </div>

                {/* Main Equation Layout */}
                <div className="bg-zinc-950/80 rounded-2xl p-6 border border-zinc-900 shadow-md">
                  <h5 className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-4 text-center">Setarakan Persamaan Redoks Berikut:</h5>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 py-8 bg-zinc-950 rounded-xl border border-zinc-900/60 shadow-inner relative overflow-hidden">
                    
                    {/* Reactants Section */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {currentChallenge.reactants.map((sp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {idx > 0 && <span className="text-lg font-bold text-zinc-500 font-sans">+</span>}
                          <div className="flex flex-col items-center gap-1.5 p-2 px-3 rounded-lg bg-slate-900/40 border border-slate-850">
                            {/* Coefficient Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...userCoefs];
                                  if (next[idx] > 1) {
                                    next[idx]--;
                                    setUserCoefs(next);
                                    setChallengeSubmitted(false);
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-805 text-zinc-450 font-bold text-xs bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-black font-mono text-teal-400 brightness-110 bg-zinc-950 py-0.5 border border-zinc-850 rounded">
                                {userCoefs[idx]}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...userCoefs];
                                  if (next[idx] < 30) {
                                    next[idx]++;
                                    setUserCoefs(next);
                                    setChallengeSubmitted(false);
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-805 text-zinc-450 font-bold text-xs bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-black text-white font-sans tracking-wide">{sp.formula}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reaction Arrow */}
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-6 h-6 animate-pulse hidden md:block text-zinc-500" />
                      <span className="text-[10px] font-mono mt-1 uppercase font-bold tracking-widest text-zinc-500">Reaksi</span>
                      <div className="w-0.5 h-6 bg-zinc-800 md:hidden" />
                    </div>

                    {/* Products Section */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {currentChallenge.products.map((sp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {idx > 0 && <span className="text-lg font-bold text-zinc-500 font-sans">+</span>}
                          <div className="flex flex-col items-center gap-1.5 p-2 px-3 rounded-lg bg-slate-900/40 border border-slate-850">
                            {/* Coefficient Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...userCoefs];
                                  if (next[idx + 3] > 1) {
                                    next[idx + 3]--;
                                    setUserCoefs(next);
                                    setChallengeSubmitted(false);
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-805 text-zinc-450 font-bold text-xs bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-black font-mono text-teal-400 brightness-110 bg-zinc-950 py-0.5 border border-zinc-850 rounded">
                                {userCoefs[idx + 3]}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...userCoefs];
                                  if (next[idx + 3] < 30) {
                                    next[idx + 3]++;
                                    setUserCoefs(next);
                                    setChallengeSubmitted(false);
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-805 text-zinc-450 font-bold text-xs bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-black text-white font-sans tracking-wide">{sp.formula}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Realtime qualitative observation flask & Inspection metrics divided into grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Qualitative Beaker Visualizer Flask (4 cols) */}
                  <div className="md:col-span-4 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-5 flex flex-col items-center justify-between text-center min-h-[280px]">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">Qualitative Flask Simulator</span>
                    
                    {/* Flask Graphic */}
                    <div className="relative w-28 h-36 flex items-end justify-center mb-2 mt-4 font-sans">
                      {/* Glass outline */}
                      <div className="absolute inset-0 border-2 border-zinc-700/55 rounded-b-3xl rounded-t-xl overflow-hidden before:absolute before:inset-x-6 before:top-0 before:h-12 before:border-l-2 before:border-r-2 before:border-zinc-700/55">
                        {/* Flask liquid */}
                        <div 
                          style={{ 
                            height: '55%', 
                            backgroundColor: flaskInfo.bg 
                          }}
                          className={`absolute bottom-0 inset-x-0 rounded-b-2xl transition-all duration-300 flex items-center justify-center blur-[1px] ${flaskInfo.border}`}
                        >
                          {/* Liquid Surface */}
                          <div className="absolute top-0 inset-x-0 h-1 bg-white/20" />
                          
                          {/* Ascending bubbles if matched */}
                          {flaskInfo.bubble && (
                            <div className="absolute inset-x-0 bottom-0 top-1 overflow-hidden pointer-events-none">
                              <div className="absolute w-1 h-1 bg-white/40 rounded-full bottom-0 left-1/4 animate-bubble-1" />
                              <div className="absolute w-1.5 h-1.5 bg-white/40 rounded-full bottom-0 left-1/2 animate-bubble-2" />
                              <div className="absolute w-1 h-1 bg-white/40 rounded-full bottom-0 left-3/4 animate-bubble-3" />
                            </div>
                          )}
                        </div>
                        {/* Faint reflections */}
                        <div className="absolute top-6 left-1/4 w-0.5 h-20 bg-white/10 rounded-full rotate-6" />
                      </div>
                      {/* Flask top neck ring */}
                      <div className="absolute top-0 w-8 h-1 bg-zinc-650 rounded" />
                    </div>

                    <div className="space-y-1 mt-2">
                      <span className="text-white text-xs font-bold leading-snug block">Kualitatif Larutan:</span>
                      <p className="text-[10px] text-zinc-405 leading-relaxed bg-zinc-950 px-2 py-1.5 rounded-lg border border-zinc-900 text-center font-sans">
                        {flaskInfo.desc}
                      </p>
                    </div>
                  </div>

                  {/* Verification Dashboard: Elements & Charges (8 cols) */}
                  <div className="md:col-span-8 flex flex-col gap-4">
                    
                    {/* 1. Atom Mass Balance Card */}
                    <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 space-y-3 flex-1">
                      <h6 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex justify-between items-center">
                        <span>Verifikasi Kesetaraan Atom</span>
                        <span className={`text-[9px] font-mono px-1.5 rounded ${isAllAtomsBalanced ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10' : 'text-zinc-505 bg-zinc-950 text-zinc-450'}`}>
                          {isAllAtomsBalanced ? 'ATOM SETARA' : 'BELUM SETARA'}
                        </span>
                      </h6>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {allElements.map(elem => {
                          const left = atomsLeft[elem] || 0;
                          const right = atomsRight[elem] || 0;
                          const match = left === right;
                          return (
                            <div key={elem} className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${match ? 'bg-emerald-400 shadow-md shadow-emerald-400/20' : 'bg-red-400'}`} />
                                <span className="text-xs font-mono font-black text-white">{elem}</span>
                              </div>
                              <div className="text-[11px] font-mono font-bold text-zinc-400">
                                <span className={match ? 'text-emerald-400' : 'text-red-450'}>{left}</span>
                                <span className="text-zinc-600 mx-1">➔</span>
                                <span className={match ? 'text-emerald-400' : 'text-red-450'}>{right}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Charge Balance Card */}
                    <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 space-y-3">
                      <h6 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex justify-between items-center">
                        <span>Verifikasi Kesetaraan Muat</span>
                        <span className={`text-[9px] font-mono px-1.5 rounded ${isChargeBalanced ? 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10' : 'text-zinc-505 bg-zinc-950 text-zinc-450'}`}>
                          {isChargeBalanced ? 'MUATAN SETARA' : 'BELUM SETARA'}
                        </span>
                      </h6>

                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center justify-between text-xs font-mono">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-[8px] text-zinc-505 font-bold uppercase text-zinc-500">Muatan Kiri</span>
                          <span className={`text-sm font-black ${isChargeBalanced ? 'text-teal-400' : 'text-zinc-400'}`}>
                            {chargeLeft > 0 ? `+${chargeLeft}` : chargeLeft}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          {isChargeBalanced ? (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded font-bold font-sans">⚖️ Balanced</span>
                          ) : (
                            <span className="text-[9px] bg-zinc-900 text-zinc-500 px-2 py-0.5 border border-zinc-800 rounded font-sans">⚠️ Unbalanced</span>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[8px] text-zinc-550 font-bold uppercase text-zinc-500">Muatan Kanan</span>
                          <span className={`text-sm font-black ${isChargeBalanced ? 'text-teal-400' : 'text-zinc-400'}`}>
                            {chargeRight > 0 ? `+${chargeRight}` : chargeRight}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Checking section and status alerts */}
                <div className="pt-4 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUserCoefs([1, 1, 1, 1, 1, 1]);
                        setChallengeSubmitted(false);
                        setChallengeSuccess(false);
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Atur Ulang
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckChallenge}
                    className={`px-5 py-2 rounded-xl text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
                      isChallengeCorrect 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10' 
                        : 'bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-teal-500/10'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> 
                    {isChallengeCorrect ? 'PENYETARAAN SEMPURNA! VALIDASI' : 'PERIKSA HASIL PENYETARAAN'}
                  </button>
                </div>

                {/* Success Announcement Details banner */}
                {challengeSubmitted && (
                  <div className={`p-4 rounded-xl border ${
                    challengeSuccess 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                      : 'bg-red-500/10 border-red-500/20 text-red-355'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      {challengeSuccess ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-405 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider font-mono">
                          {challengeSuccess ? 'SELAMAT! PENYETARAAN REAKSI TEPAT' : 'Penyetaraan Belum Sempurna'}
                        </h5>
                        <p className="text-[10.5px] leading-relaxed text-zinc-400 font-sans">
                          {challengeSuccess 
                            ? `Luar biasa! Konfigurasi koefisien stoichiometric Anda benar. Semua spesi setara secara kuantitatif.`
                            : `Rasio koefisien ${userCoefs.slice(0, 3).join(' : ')} ➔ ${userCoefs.slice(3).join(' : ')} belum setara secara atom atau muatan. Coba lagi!`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: SEL VOLTA (GALVANI) INTERACTIVE SIMULATOR */}
      {/* ======================================================== */}
      {activeSection === 'volta' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">KOMPONEN ELEKTRODA</span>
                <button 
                  onClick={handleResetVolta}
                  className="p-1 px-2 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800 rounded bg-zinc-950/40 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Left Beaker Configuration */}
              <div className="space-y-2 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/80">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-teal-400">Bejana Kiri (Elektroda A)</span>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                    isLeftAnode ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
                  }`}>
                    {isLeftAnode ? 'ANODA (-)' : 'KATODA (+)'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1 uppercase font-mono">Bahan Logam</label>
                    <select
                      value={leftMetalId}
                      onChange={(e) => {
                        if (e.target.value === rightMetalId) setRightMetalId(leftMetalId);
                        setLeftMetalId(e.target.value);
                      }}
                      className="w-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      {VOLTA_METALS.map(m => (
                        <option key={m.id} value={m.id}>{m.symbol} ({m.name})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1 uppercase font-mono">Potensial E°</label>
                    <span className="text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 h-9 flex items-center justify-center rounded-lg text-zinc-300">
                      {leftMetal.e0 > 0 ? `+${leftMetal.e0.toFixed(2)}` : leftMetal.e0.toFixed(2)}V
                    </span>
                  </div>
                </div>

                {isNernstActive && (
                  <div className="pt-2 border-t border-zinc-900/60 transition-all space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500">Molaritas [{leftMetal.symbol}ⁿ⁺]</span>
                      <span className="font-mono text-zinc-350 font-bold">{leftConc.toFixed(2)} M</span>
                    </div>
                    <input 
                      type="range" min="0.01" max="2.00" step="0.01" value={leftConc}
                      onChange={(e) => setLeftConc(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                  </div>
                )}
              </div>

              {/* Right Beaker Configuration */}
              <div className="space-y-2 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/80">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-teal-400">Bejana Kanan (Elektroda B)</span>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                    !isLeftAnode ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
                  }`}>
                    {!isLeftAnode ? 'ANODA (-)' : 'KATODA (+)'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1 uppercase font-mono">Bahan Logam</label>
                    <select
                      value={rightMetalId}
                      onChange={(e) => {
                        if (e.target.value === leftMetalId) setLeftMetalId(rightMetalId);
                        setRightMetalId(e.target.value);
                      }}
                      className="w-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      {VOLTA_METALS.map(m => (
                        <option key={m.id} value={m.id}>{m.symbol} ({m.name})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1 uppercase font-mono">Potensial E°</label>
                    <span className="text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 h-9 flex items-center justify-center rounded-lg text-zinc-300">
                      {rightMetal.e0 > 0 ? `+${rightMetal.e0.toFixed(2)}` : rightMetal.e0.toFixed(2)}V
                    </span>
                  </div>
                </div>

                {isNernstActive && (
                  <div className="pt-2 border-t border-zinc-900/60 transition-all space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500">Molaritas [{rightMetal.symbol}ⁿ⁺]</span>
                      <span className="font-mono text-zinc-350 font-bold">{rightConc.toFixed(2)} M</span>
                    </div>
                    <input 
                      type="range" min="0.01" max="2.00" step="0.01" value={rightConc}
                      onChange={(e) => setRightConc(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sonification details card */}
            <div className="space-y-2 bg-amber-950/10 p-4.5 rounded-2xl border border-amber-500/10">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-sans">
                <Volume2 className="w-4 h-4 text-amber-400 font-medium" />
                Audio Sonifikasi Hum
              </span>
              <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                Suara dengung akustik berdering dinamis mengikuti beda potensial aktual E<sub>sel</sub> Volta secara langsung.
              </p>
            </div>

            {/* Nernst Equation slider card */}
            <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center shadow-sm">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">PERSAMAAN NERNST</span>
                <button 
                  onClick={() => {
                    setIsNernstActive(!isNernstActive);
                    if (!isNernstActive) {
                      setLeftConc(0.01);
                      setRightConc(1.50);
                    } else {
                      setLeftConc(1.0);
                      setRightConc(1.0);
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                    isNernstActive ? 'bg-amber-500/15 border-amber-500/35 text-amber-400' : 'bg-slate-950 border-slate-800 text-zinc-550'
                  }`}
                >
                  {isNernstActive ? 'Larutan Aktif' : 'Atur Konsentrasi'}
                </button>
              </div>

              {isNernstActive ? (
                <div className="space-y-3.5 pt-2 animate-fade-in text-xs text-zinc-300">
                  <div className="bg-zinc-950 py-2.5 text-center text-[10.5px] font-mono text-teal-400 rounded-lg border border-zinc-900 space-y-1 leading-normal select-all">
                    <div>E_sel = {e0Cell.toFixed(2)}V - [RT/nF] ln(Q)</div>
                    <div className="text-zinc-500 text-[9.5px]">E_aktual = {actualPotVal.toFixed(3)} V</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 font-sans">Temperatur (Kelvin)</span>
                      <span className="font-mono text-zinc-350">{temperature.toFixed(1)} K ({(temperature - 273.15).toFixed(1)}°C)</span>
                    </div>
                    <input 
                      type="range" min="100" max="400" step="5" value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic leading-relaxed">
                  Dalam kondisi laboratorium standar, semua konsentrasi adalah <strong className="text-zinc-400">1.0 M</strong> pada suhu <strong className="text-zinc-400">298.15 K (25°C)</strong>.
                </p>
              )}
            </div>
          </div>

          {/* Core SVG Canvas & Calculations */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              {/* Header icons bar */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">VISUALISASI APPARATUS SEL GALVANI</span>
                <div className="flex gap-2">
                  <button 
                    onClick={toggleVoltaAudio}
                    className={`p-1 px-2 border rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                      isAudioEnabled ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse' : 'bg-zinc-950/60 border-zinc-850 text-zinc-500'
                    }`}
                  >
                    {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{isAudioEnabled ? 'Buzz: On' : 'Sintesis Audio'}</span>
                  </button>

                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 px-2 border border-zinc-850 bg-zinc-950/60 text-[10px] flex items-center gap-1 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3 h-3 text-yellow-400" /> : <Play className="w-3 h-3 text-green-400" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
                    isSpontaneous ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {isSpontaneous ? 'SPONTAN' : 'NON-SPONTAN'}
                  </span>
                </div>
              </div>

              {/* SVG screen */}
              <div className="w-full bg-zinc-950/90 rounded-xl border border-zinc-900/60 p-2 overflow-hidden relative">
                <svg className="w-full max-w-[640px] aspect-[16/9] mx-auto" viewBox="0 0 640 360">
                  <defs>
                    {/* Metallic plate textures */}
                    <linearGradient id="v-left-g" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={leftMetal.electrodeColor} />
                      <stop offset="60%" stopColor="#ffffff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor={leftMetal.electrodeColor} />
                    </linearGradient>
                    <linearGradient id="v-right-g" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={rightMetal.electrodeColor} />
                      <stop offset="60%" stopColor="#ffffff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor={rightMetal.electrodeColor} />
                    </linearGradient>

                    {/* Solutions shading */}
                    <linearGradient id="v-left-l" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={leftMetal.solutionColor} />
                      <stop offset="100%" stopColor={leftMetal.solutionColor} stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="v-right-l" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={rightMetal.solutionColor} />
                      <stop offset="100%" stopColor={rightMetal.solutionColor} stopOpacity="0.05" />
                    </linearGradient>

                    <filter id="glow-eff" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Supporting wooden shelf */}
                  <line x1="60" y1="310" x2="580" y2="310" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

                  {/* left beaker */}
                  <g>
                    <rect x="75" y="150" width="150" height="130" rx="8" fill="url(#v-left-l)" />
                    <rect x="75" y="150" width="150" height="130" rx="8" fill={leftMetal.solutionColor} />
                    <path d="M 70,140 L 70,270 A 15,15 0 0,0 85,285 L 215,285 A 15,15 0 0,0 230,270 L 230,140" fill="none" stroke="#475569" strokeWidth="4" />
                    <text x="150" y="268" fill="#64748b" fontSize="10.5" fontWeight="black" textAnchor="middle">
                      {leftMetal.symbol}SO₄ ({leftConc.toFixed(1)}M)
                    </text>
                  </g>

                  {/* right beaker */}
                  <g>
                    <rect x="415" y="150" width="150" height="130" rx="8" fill="url(#v-right-l)" />
                    <rect x="415" y="150" width="150" height="130" rx="8" fill={rightMetal.solutionColor} />
                    <path d="M 410,140 L 410,270 A 15,15 0 0,0 425,285 L 555,285 A 15,15 0 0,0 570,270 L 570,140" fill="none" stroke="#475569" strokeWidth="4" />
                    <text x="490" y="268" fill="#64748b" fontSize="10.5" fontWeight="black" textAnchor="middle">
                      {rightMetal.symbol}SO₄ ({rightConc.toFixed(1)}M)
                    </text>
                  </g>

                  {/* left plate */}
                  <rect x="130" y="90" width="30" height="140" rx="3" fill="url(#v-left-g)" stroke="#334155" />
                  <text x="145" y="80" fill="white" fontSize="14" fontWeight="black" textAnchor="middle">{leftMetal.symbol}</text>
                  <text x="145" y="130" fill="rgba(0,0,0,0.4)" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {isLeftAnode ? '-' : '+'}
                  </text>

                  {/* right plate */}
                  <rect x="480" y="90" width="30" height="140" rx="3" fill="url(#v-right-g)" stroke="#334155" />
                  <text x="495" y="80" fill="white" fontSize="14" fontWeight="black" textAnchor="middle">{rightMetal.symbol}</text>
                  <text x="495" y="130" fill="rgba(0,0,0,0.4)" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {!isLeftAnode ? '-' : '+'}
                  </text>

                  {/* digital Voltmeter center */}
                  <g>
                    <rect x="250" y="20" width="140" height="85" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="3" />
                    <rect x="268" y="32" width="104" height="40" rx="6" fill="#020617" stroke="#1e293b" />
                    <text x="320" y="58" fill={isSpontaneous ? '#10b981' : '#ef4444'} fontSize="19" fontWeight="black" fontFamily="monospace" textAnchor="middle" filter="url(#glow-eff)">
                      {isPlaying ? `${actualPotVal > 0 ? '+' : ''}${actualPotVal.toFixed(3)} V` : 'OFF'}
                    </text>
                    <text x="320" y="90" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle">VOLTA ANALYTICAL</text>
                  </g>

                  {/* wires */}
                  <path d="M 145,90 Q 145,45 250,45" fill="none" stroke="#ef4444" strokeWidth="3" />
                  <path d="M 390,45 Q 495,45 495,90" fill="none" stroke="#3b82f6" strokeWidth="3" />

                  {/* moving electrons */}
                  {isPlaying && isSpontaneous && (() => {
                    const loops = [0, 8, 16, 24, 32];
                    return loops.map(l => {
                      const percentage = ((tickCount * 1.5 + l) % 60) / 60;
                      let ex = 0, ey = 0;

                      if (isLeftAnode) {
                        // left -> voltmeter -> right
                        if (percentage < 0.5) {
                          const t = percentage / 0.5;
                          ex = 145 + (250 - 145) * t;
                          ey = 90 - (90 - 45) * Math.sin(t * Math.PI / 2);
                        } else {
                          const t = (percentage - 0.5) / 0.5;
                          ex = 390 + (495 - 390) * t;
                          ey = 45 + (90 - 45) * Math.sin(t * Math.PI / 2);
                        }
                      } else {
                        // right -> voltmeter -> left
                        if (percentage < 0.5) {
                          const t = percentage / 0.5;
                          ex = 495 - (495 - 390) * t;
                          ey = 90 - (90 - 45) * Math.sin(t * Math.PI / 2);
                        } else {
                          const t = (percentage - 0.5) / 0.5;
                          ex = 250 - (250 - 145) * t;
                          ey = 45 + (90 - 45) * Math.sin(t * Math.PI / 2);
                        }
                      }

                      return (
                        <g key={l} filter="url(#glow-eff)">
                          <circle cx={ex} cy={ey} r="4.5" fill="#eab308" />
                          <text x={ex} y={ey + 2.5} fill="black" fontSize="7.5" fontWeight="black" textAnchor="middle">e</text>
                        </g>
                      );
                    });
                  })()}

                  {/* salt bridge U-tube */}
                  <g>
                    <path d="M 200,210 L 200,120 A 40,40 0 0,1 440,120 L 440,210" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="square" opacity="0.9" />
                    <text x="320" y="145" fill="#475569" fontSize="8" fontWeight="black" textAnchor="middle">JEMBATAN GARAM (KNO₃)</text>
                  </g>

                  {/* Close-up reactions overlays */}
                  <g filter="url(#glow-eff)" opacity="0.9">
                    {/* Oxidation indicator */}
                    <rect x={isLeftAnode ? "72" : "412"} y="95" width="60" height="24" rx="4" fill="#ef4444" fillOpacity="0.2" stroke="#f87171" strokeWidth="1" />
                    <text x={isLeftAnode ? "102" : "442"} y="110" fill="white" fontSize="8" fontWeight="black" textAnchor="middle">OKSIDASI</text>

                    {/* Reduction indicator */}
                    <rect x={!isLeftAnode ? "108" : "448"} y="95" width="60" height="24" rx="4" fill="#10b981" fillOpacity="0.2" stroke="#34d399" strokeWidth="1" />
                    <text x={!isLeftAnode ? "138" : "478"} y="110" fill="white" fontSize="8" fontWeight="black" textAnchor="middle">REDUKSI</text>
                  </g>
                </svg>
              </div>

              {/* Chemical formulas & positions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 leading-normal space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Setengah Reaksi Bilik</span>
                  <div className="space-y-1.5 text-xs text-zinc-400 font-sans">
                    <div className="flex justify-between">
                      <strong className="text-red-400">Anoda Oksidasi (-):</strong>
                      <span className="font-mono">{anode.symbol} ➔ {anode.symbol}<sup>{anode.valency === 1 ? '+' : `${anode.valency}+`}</sup> + {anode.valency}e⁻</span>
                    </div>
                    <div className="flex justify-between">
                      <strong className="text-emerald-400">Katoda Reduksi (+):</strong>
                      <span className="font-mono">{cathode.symbol}<sup>{cathode.valency === 1 ? '+' : `${cathode.valency}+`}</sup> + {cathode.valency}e⁻ ➔ {cathode.symbol}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 leading-normal space-y-1.5 font-sans justify-center">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Skema Notasi Sel Galvani</span>
                  <div className="bg-zinc-950 p-2 text-center font-mono text-[11px] text-yellow-405 text-yellow-500 rounded border border-zinc-900.5">
                    {anode.symbol} │ {anode.symbol}<sup>{anode.valency === 1 ? '+' : `${anode.valency}+`}</sup> ║ {cathode.symbol}<sup>{cathode.valency === 1 ? '+' : `${cathode.valency}+`}</sup> │ {cathode.symbol}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: SEL ELEKTROLISIS (ELECTROLYSIS) & FARADAY */}
      {/* ======================================================== */}
      {activeSection === 'electrolysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in font-sans">
          {/* Beaker setup, select reaction and Faraday calculations input */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">SIFAT &amp; ELEKTROLIT STRUKTUR</span>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold block mb-1 uppercase font-mono">Pilih Media Larutan/Lelehan</label>
                <select
                  value={activeElectrolyteIdx}
                  onChange={(e) => setActiveElectrolyteIdx(parseInt(e.target.value))}
                  className="w-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  {ELECTROLYTE_REACTIONS.map((er, idx) => (
                    <option key={er.id} value={idx}>{er.name}</option>
                  ))}
                </select>
              </div>

              <p className="text-[10.5px] text-zinc-400 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900 font-sans leading-relaxed italic">
                {activeElectrolyte.explanation}
              </p>
            </div>

            {/* Hukum Faraday 1st Law interactive widget calculator */}
            <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-teal-400" />
                  Kalkulator Hukum Faraday I
                </span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                {/* Current slider */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Kuat Arus Listrik (I)</span>
                    <span className="font-mono text-teal-400 font-bold">{currentAmp.toFixed(1)} Ampere</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="15.0" step="0.5" value={currentAmp}
                    onChange={(e) => { setCurrentAmp(parseFloat(e.target.value)); handleComputeFaraday(); }}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Time input */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Durasi Waktu Elektrolisis (t)</span>
                    <span className="font-mono text-teal-400 font-bold">{timeSec} detik ({(timeSec / 60).toFixed(1)} mnt)</span>
                  </div>
                  <input 
                    type="range" min="30" max="7200" step="30" value={timeSec}
                    onChange={(e) => { setTimeSec(parseInt(e.target.value)); handleComputeFaraday(); }}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Faraday result display */}
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 text-[11px] font-mono leading-relaxed text-zinc-350 space-y-2">
                  <div className="text-center font-bold text-teal-400 uppercase tracking-wider text-[9.5px] border-b border-zinc-900 pb-1">HASIL PENIMBANGAN TEORITIS</div>
                  
                  {activeElectrolyte.cathodeDeposit !== 'none' ? (
                    <div className="flex justify-between">
                      <span>Massa Deposited Katoda (w):</span>
                      <strong className="text-teal-300">{cathodeDepositedMass.toFixed(3)} gram</strong>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Volume Gas Katoda (STP):</span>
                      <strong className="text-teal-300">{cathodeGasVolumeSTP.toFixed(3)} Liter</strong>
                    </div>
                  )}

                  {activeElectrolyte.anodeBubbles ? (
                    <div className="flex justify-between">
                      <span>Volume Gas Anoda (STP):</span>
                      <strong className="text-teal-300">{anodeGasVolumeSTP.toFixed(3)} Liter</strong>
                    </div>
                  ) : activeElectrolyte.anodeDeposit === 'dissolve' ? (
                    <div className="flex justify-between">
                      <span>Massa Anoda Cu Terkikis:</span>
                      <strong className="text-red-400">-{cathodeDepositedMass.toFixed(3)} gram</strong>
                    </div>
                  ) : null}

                  <div className="text-[8.5px] text-zinc-550 italic leading-snug border-t border-zinc-900 pt-1">
                    *Persamaan: w = e · I · t / 96500. Di mana e = Ar / valensi ion tereaksi.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive SVG Electrolysis animation screen */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">APPARATUS SEL ELEKTROLISIS INTERAKTIF</span>
                <span className="bg-amber-500/10 border border-amber-550/30 text-amber-400 font-bold text-[9.5px] font-mono px-2 py-0.5 rounded uppercase">
                  SUMBER ARUS SEARAH (DC SOURCE)
                </span>
              </div>

              {/* Animated visualizer canvas */}
              <div className="w-full bg-zinc-950/90 rounded-xl border border-zinc-900 p-2 overflow-hidden relative">
                <svg className="w-full max-w-[620px] aspect-[16/9] mx-auto" viewBox="0 0 620 350">
                  <defs>
                    <linearGradient id="solid-pt" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="60%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                    <linearGradient id="solid-cu" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#b87333" />
                      <stop offset="60%" stopColor="#fdba74" />
                      <stop offset="100%" stopColor="#9a3412" />
                    </linearGradient>
                    <linearGradient id="liq-color" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={activeElectrolyte.solutionColor} />
                      <stop offset="100%" stopColor={activeElectrolyte.solutionColor} stopOpacity="0.05" />
                    </linearGradient>

                    <filter id="liq-glow" x="-25%" y="-25%" width="150%" height="150%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Glass cabinet container beaker */}
                  <g>
                    {/* Beaker back liquid tint */}
                    <rect x="140" y="120" width="340" height="170" rx="14" fill="url(#liq-color)" />
                    <rect x="140" y="120" width="340" height="170" rx="14" fill={activeElectrolyte.solutionColor} />
                    {/* Glass body outer ring */}
                    <path d="M 130,100 L 130,285 A 20,20 0 0,0 150,305 L 470,305 A 20,20 0 0,0 490,285 L 490,100" fill="none" stroke="#64748b" strokeWidth="5" />
                  </g>

                  {/* Left Electrode: Cathode (-) */}
                  <g>
                    <rect 
                      x="210" y="70" width="24" height="180" rx="3.5" 
                      fill={activeElectrolyte.cathodeDeposit === 'copper' ? 'url(#solid-cu)' : 'url(#solid-pt)'} 
                      stroke="#1e293b" 
                    />
                    {/* Deposition shimmering overlay */}
                    {activeElectrolyte.cathodeDeposit === 'copper' && isPlaying && (
                      <rect x="207" y="110" width="30" height="145" rx="4" fill="#ea580c" opacity="0.35" filter="url(#liq-glow)" />
                    )}
                    {activeElectrolyte.cathodeDeposit === 'silver' && isPlaying && (
                      <rect x="207" y="110" width="30" height="145" rx="4" fill="#f1f5f9" opacity="0.45" filter="url(#liq-glow)" />
                    )}
                    <text x="222" y="60" fill="white" fontSize="11" fontWeight="black" textAnchor="middle">KATODA (-)</text>
                    <text x="222" y="115" fill="black" fontSize="9" fontWeight="900" textAnchor="middle">Reduksi</text>
                  </g>

                  {/* Right Electrode: Anode (+) */}
                  <g>
                    <rect 
                      x="386" y="70" width="24" height="180" rx="3.5" 
                      fill={activeElectrolyte.anodeMaterial === 'Cu' ? 'url(#solid-cu)' : 'url(#solid-pt)'} 
                      stroke="#1e293b" 
                    />
                    {/* Dissolving active anode visual feedback */}
                    {activeElectrolyte.anodeDeposit === 'dissolve' && isPlaying && (
                      <line x1="384" y1="130" x2="411" y2="240" stroke="#b87333" strokeDasharray="3,3" strokeWidth="2.5" />
                    )}
                    <text x="398" y="60" fill="white" fontSize="11" fontWeight="black" textAnchor="middle">ANODA (+)</text>
                    <text x="398" y="115" fill="black" fontSize="9" fontWeight="900" textAnchor="middle">Oksidasi</text>
                  </g>

                  {/* DC Power adapter / Battery center */}
                  <g>
                    <rect x="260" y="12" width="100" height="52" rx="8" fill="#c2410c" stroke="#334155" strokeWidth="2" />
                    {/* LCD panel */}
                    <rect x="272" y="20" width="76" height="22" rx="4" fill="#020617" />
                    <text x="310" y="34" fill="#f97316" fontSize="10.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">DC POWER</text>
                    {/* Live values */}
                    <text x="310" y="58" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">
                      {currentAmp.toFixed(1)} A ON
                    </text>
                  </g>

                  {/* connecting wire path */}
                  <path d="M 222,70 L 222,38 L 260,38" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  <path d="M 410,38 L 398,38 L 398,70" fill="none" stroke="#3b82f6" strokeWidth="2.5" />

                  {/* Moving cathode bubbles representing H2 or metallic deposit */}
                  {isPlaying && activeElectrolyte.cathodeBubbles && (() => {
                    const bubbleCount = [0, 1, 2, 3, 4, 5];
                    return bubbleCount.map(b => {
                      const bubbleY = 240 - ((tickCount * 2.5 + b * 22) % 130);
                      const bubbleX = 205 - (Math.sin(bubbleY * 0.1) * 4);
                      return (
                        <circle key={`cb-${b}`} cx={bubbleX} cy={bubbleY} r="3" fill="#cbd5e1" opacity="0.6" filter="url(#liq-glow)" />
                      );
                    });
                  })()}

                  {/* Moving anode bubbles representing O2 or Cl2 */}
                  {isPlaying && activeElectrolyte.anodeBubbles && (() => {
                    const bubbleCount = [0, 1, 2, 3, 4, 5];
                    return bubbleCount.map(b => {
                      const bubbleY = 240 - ((tickCount * 2.2 + b * 26) % 130);
                      const bubbleX = 415 + (Math.sin(bubbleY * 0.1) * 4);
                      return (
                        <circle key={`ab-${b}`} cx={bubbleX} cy={bubbleY} r="3.5" fill="#fef08a" opacity="0.6" filter="url(#liq-glow)" />
                      );
                    });
                  })()}

                  {/* Moving electrons representing battery current injection */}
                  {isPlaying && (() => {
                    const loops = [0, 10, 20, 30];
                    return loops.map(l => {
                      const pct = ((tickCount * 1.5 + l) % 60) / 60;
                      let ex = 0, ey = 38;
                      // Flow: Anode (Positive wire) -> battery -> Cathode (Negative wire)
                      // Wire right has Anode->Battery
                      if (pct < 0.5) {
                        const t = pct / 0.5;
                        ex = 398;
                        ey = 70 - t * 32;
                      } else {
                        const t = (pct - 0.5) / 0.5;
                        ex = 260 - t * 38;
                        ey = 38;
                      }
                      return (
                        <circle key={`el-${l}`} cx={ex} cy={ey} r="3" fill="#fbbf24" filter="url(#liq-glow)" />
                      );
                    });
                  })()}

                  {/* Static formulas pointers inside liquid */}
                  <g>
                    {/* Cathode chemical reaction text */}
                    <rect x="150" y="270" width="130" height="24" rx="4" fill="#020617" fillOpacity="0.75" stroke="#10b981" strokeWidth="1" />
                    <text x="215" y="285" fill="#10b981" fontSize="8" fontWeight="black" textAnchor="middle">{activeElectrolyte.cathodeReaction}</text>

                    {/* Anode chemical reaction text */}
                    <rect x="340" y="270" width="130" height="24" rx="4" fill="#020617" fillOpacity="0.75" stroke="#f59e0b" strokeWidth="1" />
                    <text x="405" y="285" fill="#f59e0b" fontSize="8" fontWeight="black" textAnchor="middle">{activeElectrolyte.anodeReaction}</text>
                  </g>
                </svg>
              </div>

              {/* Chemical reaction specs box */}
              <div className="p-4.5 bg-zinc-950 rounded-xl border border-zinc-900 leading-normal space-y-2.5">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Spesifikasi Hasil Elektrolisis</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <strong className="text-teal-400 block font-sans">Hasil di Katoda (-) [REDUKSI]:</strong>
                    <p className="text-zinc-400 font-medium">{activeElectrolyte.cathodeProduct}</p>
                    <code className="bg-zinc-900 border border-zinc-900 p-1 rounded font-mono text-white text-[10px] block mt-1">
                      {activeElectrolyte.cathodeReaction}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-amber-400 block font-sans">Hasil di Anoda (+) [OKSIDASI]:</strong>
                    <p className="text-zinc-400 font-medium">{activeElectrolyte.anodeProduct}</p>
                    <code className="bg-zinc-900 border border-zinc-900 p-1 rounded font-mono text-white text-[10px] block mt-1">
                      {activeElectrolyte.anodeReaction}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: LANDASAN TEORI (CURRICULUM EDUCATION GUIDE) */}
      {/* ======================================================== */}
      {activeSection === 'theory' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in font-sans">
          <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" /> Landasan Teori Elektrokimia (Materi XII SMA)
              </h3>
              <p className="text-zinc-400 text-sm mt-1">
                Elektrokimia mendalami hubungan timbal balik antara perubahan reaksi energi kimia (redoks) dengan aliran arus sirkuit luar listrik sejenis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="border border-zinc-850 bg-zinc-950/40 p-5 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wide font-mono flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  1. REAKSI REDOKS
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed leading-normal">
                  Redoks tersusun atas setengah reaksi reduksi (penerimaan elektron) dan oksidasi (pelepasan elektron). Menyetarakan reaksi redoks SMA kurikulum XII menggunakan dua pilar: metode perubahan biloks (PBO) atau setengah-reaksi ion-elektron.
                </p>
              </div>

              <div className="border border-zinc-850 bg-zinc-950/40 p-5 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wide font-mono flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  2. SEL VOLTA (GALVANI)
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed leading-normal">
                  Sel Volta mereaksikan spesi kimia secara SPONTAN (E<sub>sel</sub> &gt; 0) menghasilkan arus listrik luar. Notasi ringkasnya ditulis: <strong>Anoda │ Ion Anoda ║ Ion Katoda │ Katoda</strong>. Selisih potensial standar dirumuskan E°<sub>sel</sub> = E°<sub>katoda</sub> - E°<sub>anoda</sub>.
                </p>
              </div>

              <div className="border border-zinc-850 bg-zinc-950/40 p-5 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wide font-mono flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-teal-400" />
                  3. SEL ELEKTROLISIS
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed leading-normal">
                  Mereaksikan perubahan kimia NON-SPONTAN menggunakan pasokan/pompa listrik searah DC eksternal. Katoda bermuatan negatif (tempat mereduksi kation) sedangkan Anoda bermuatan positif (oksidasi anion/elektroda logam aktif).
                </p>
              </div>
            </div>

            <div className="p-4.5 bg-zinc-950 rounded-xl border border-zinc-900 text-xs text-zinc-400 space-y-2.5">
              <span className="font-mono text-teal-400 text-[10px] font-bold block uppercase tracking-wider">HUKUM FARADAY I &amp; II</span>
              <p className="leading-relaxed leading-normal">
                Hukum Faraday I menyatakan massa zat hasil elektrolisis ($w$) sebanding dengan jumlah muatan listrik ($Q = I \cdot t$) yang dialirkan. Dirumuskan:
              </p>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-mono text-white text-xs">
                {"w = [e · I · t] / 96500 = [Ar/valensi * I · t] / 96500"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: KUIS EVALUASI (10 INDONESIAN CHEMISTRY Qs) */}
      {/* ======================================================== */}
      {activeSection === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in font-sans">
          <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-6 md:p-8">
            {!showQuizResult ? (
              <div className="space-y-6">
                {/* Status progress bar */}
                <div className="flex justify-between items-center pb-3 border-b border-zinc-850">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-black text-white">Uji Pemahaman Elektrokimia Lengkap</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 font-bold">
                    Soal {currentQuizIndex + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                </div>

                <div className="h-1 bg-zinc-900 rounded-full w-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${((currentQuizIndex) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                {/* Question body */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white tracking-tight leading-relaxed">
                    {QUIZ_QUESTIONS[currentQuizIndex].question}
                  </h3>

                  <div className="flex flex-col gap-2.5">
                    {QUIZ_QUESTIONS[currentQuizIndex].options.map((opt, idx) => {
                      let optionStyle = "border-zinc-850 bg-zinc-950/45 text-zinc-300 hover:border-zinc-700";
                      
                      if (selectedAnswer === idx) {
                        optionStyle = "border-teal-500 bg-teal-500/10 text-white font-extrabold";
                      }
                      
                      if (hasSubmittedAnswer) {
                        const isCorrect = idx === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer;
                        const isMineSelected = idx === selectedAnswer;

                        if (isCorrect) {
                          optionStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-450 font-black";
                        } else if (isMineSelected) {
                          optionStyle = "border-red-500 bg-red-500/15 text-red-400";
                        } else {
                          optionStyle = "border-zinc-900 bg-zinc-950/20 text-zinc-650 opacity-40";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasSubmittedAnswer}
                          onClick={() => setSelectedAnswer(idx)}
                          className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                        >
                          <span className="font-mono font-bold bg-zinc-900/85 px-2 py-0.5 rounded text-[10px] shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer and answers indicators actions */}
                <div className="pt-2 flex justify-between items-center">
                  <div>
                    {hasSubmittedAnswer && (
                      <span className="text-xs font-bold">
                        {selectedAnswer === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Jawaban Benar!
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Jawaban Salah.
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {!hasSubmittedAnswer ? (
                    <button
                      disabled={selectedAnswer === null}
                      onClick={handleSubmittingAnswer}
                      className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-zinc-800 disabled:text-zinc-650 font-black text-slate-950 rounded-xl text-xs transition duration-250 cursor-pointer uppercase tracking-tight"
                    >
                      Kirim Jawaban
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuizQuestion}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 border border-zinc-800 hover:border-zinc-700"
                    >
                      <span>{currentQuizIndex < QUIZ_QUESTIONS.length - 1 ? 'Lanjut' : 'Lihat Hasil'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Explanation text */}
                {hasSubmittedAnswer && (
                  <div className="p-4 bg-zinc-950/80 border border-zinc-900/60 text-xs rounded-xl text-zinc-400 leading-relaxed font-sans mt-2 animate-fade-in space-y-1">
                    <strong className="text-teal-400 font-mono text-[9.5px] uppercase block">REDUX_SPEC EXPLANATION_LOG:</strong>
                    <p>{QUIZ_QUESTIONS[currentQuizIndex].explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Result presentation block */
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center text-yellow-500">
                  <Award className="w-10 h-10 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">Evaluasi Elektrokimia Selesai!</h3>
                  <p className="text-xs text-zinc-400">Anda telah menyentuh seluruh silabus materi kurikulum elektrokimia nasional kelas XII.</p>
                </div>

                <div className="bg-zinc-950 max-w-xs mx-auto p-4 rounded-xl border border-zinc-900/80 leading-normal">
                  <span className="text-[10px] text-zinc-500 block leading-none font-mono">PERSENTASE KETEPATAN (SCORE)</span>
                  <span className="text-3xl font-black text-teal-400 block mt-2.5 leading-none font-mono">
                    {Math.round((score / QUIZ_QUESTIONS.length) * 100)}%
                  </span>
                  <span className="text-xs text-zinc-500 block mt-2 leading-relaxed">
                    Menjawab {score} dari {QUIZ_QUESTIONS.length} pertanyaan dengan benar.
                  </span>
                </div>

                <button 
                  onClick={handleRestartQuiz}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs transition duration-200 cursor-pointer uppercase tracking-tight"
                >
                  Ulangi Quiz Elektrokimia
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
