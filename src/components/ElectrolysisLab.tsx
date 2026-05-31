/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Info, HelpCircle, RefreshCw, CheckCircle, 
  XCircle, Award, Volume2, VolumeX, Sparkles, BookOpen, Activity, Play, Pause,
  Calculator, Layers, Flame, FileText, ChevronRight, ChevronLeft, Droplets, Grid, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define the Electrolyte interface
interface Electrolyte {
  id: string;
  name: string;
  formula: string;
  phase: 'aqueous' | 'molten';
  color: string; // normal color of solution
  reactedColor?: string; // color near electrodes when reacted
  pHIndicatorColor?: string; // color near cathode when base active (for NaCl)
  starchIndicatorColor?: string; // color near anode when starch active (for KI)
  cathodeReaction: string;
  anodeReactionPt: string; // reaction if anode is Pt/C (inert)
  anodeReactionActive: string; // reaction if anode is Cu/Ag/etc (active)
  cathodeProduct: string;
  anodeProductPt: string;
  anodeProductActive: string;
  cathodeBubbles: boolean;
  anodeBubblesPt: boolean;
  anodeBubblesActive: boolean;
  cathodeDepositType: 'copper' | 'silver' | 'none' | 'sodium';
  anodeDepositTypePt: 'none' | 'iodine';
  cathodeAr: number;
  cathodeValency: number;
  anodeArPt: number;
  anodeValencyPt: number;
  anodeArCu: number;
  anodeValencyCu: number;
  anodeArAg: number;
  anodeValencyAg: number;
  description: string;
}

const ELECTROLYTES: Electrolyte[] = [
  {
    id: 'CuSO4',
    name: 'Tembaga(II) Sulfat',
    formula: 'CuSO₄ (aq)',
    phase: 'aqueous',
    color: 'rgba(56, 189, 248, 0.25)', // pale blue
    reactedColor: 'rgba(14, 116, 144, 0.4)', // deep cyan blue
    cathodeReaction: 'Cu²⁺(aq) + 2e⁻ → Cu(s)',
    anodeReactionPt: '2H₂O(l) → O₂(g) + 4H⁺(aq) + 4e⁻',
    anodeReactionActive: 'Cu(s) → Cu²⁺(aq) + 2e⁻',
    cathodeProduct: 'Endapan Tembaga (Cu)',
    anodeProductPt: 'Gas Oksigen (O₂)',
    anodeProductActive: 'Anoda Cu Larut (Cu²⁺)',
    cathodeBubbles: false,
    anodeBubblesPt: true,
    anodeBubblesActive: false,
    cathodeDepositType: 'copper',
    anodeDepositTypePt: 'none',
    cathodeAr: 63.5,
    cathodeValency: 2,
    anodeArPt: 16, // for O2 calculations
    anodeValencyPt: 2,
    anodeArCu: 63.5,
    anodeValencyCu: 2,
    anodeArAg: 108,
    anodeValencyAg: 1,
    description: 'Sistem klasik untuk pemurnian dan elektroplating (penyepuhan) tembaga. Ion Cu²⁺ ditarik kuat ke katoda dan tereduksi menjadi logam tembaga merah bata.'
  },
  {
    id: 'NaCl',
    name: 'Natrium Klorida (Air Garam)',
    formula: 'NaCl (aq)',
    phase: 'aqueous',
    color: 'rgba(241, 245, 249, 0.08)', // crystal clear
    reactedColor: 'rgba(241, 245, 249, 0.1)',
    pHIndicatorColor: 'rgba(236, 72, 153, 0.35)', // pink phenolphthalein color
    cathodeReaction: '2H₂O(l) + 2e⁻ → H₂(g) + 2OH⁻(aq)',
    anodeReactionPt: '2Cl⁻(aq) → Cl₂(g) + 2e⁻',
    anodeReactionActive: 'Cu(s) → Cu²⁺(aq) + 2e⁻', // if using Cu anode
    cathodeProduct: 'Gas Hidrogen (H₂) & Ion OH⁻ (Basa)',
    anodeProductPt: 'Gas Klorin (Cl₂)',
    anodeProductActive: 'Anoda Cu Larut (Cu²⁺)',
    cathodeBubbles: true,
    anodeBubblesPt: true,
    anodeBubblesActive: false,
    cathodeDepositType: 'none',
    anodeDepositTypePt: 'none',
    cathodeAr: 1, // for H
    cathodeValency: 1,
    anodeArPt: 35.5, // for Cl
    anodeValencyPt: 1,
    anodeArCu: 63.5,
    anodeValencyCu: 2,
    anodeArAg: 108,
    anodeValencyAg: 1,
    description: 'Menghasilkan gas hidrogen di katoda dari reduksi air karena E° reduksi air lebih tinggi daripada Na⁺. Gas klorin yang berwarna kuning-kehijauan terbentuk di anoda platina.'
  },
  {
    id: 'AgNO3',
    name: 'Perak Nitrat',
    formula: 'AgNO₃ (aq)',
    phase: 'aqueous',
    color: 'rgba(241, 245, 249, 0.04)', // clear
    reactedColor: 'rgba(241, 245, 249, 0.06)',
    cathodeReaction: 'Ag⁺(aq) + e⁻ → Ag(s)',
    anodeReactionPt: '2H₂O(l) → O₂(g) + 4H⁺(aq) + 4e⁻',
    anodeReactionActive: 'Ag(s) → Ag⁺(aq) + e⁻', // Active silver anode
    cathodeProduct: 'Endapan Perak (Ag)',
    anodeProductPt: 'Gas Oksigen (O₂)',
    anodeProductActive: 'Anoda Ag Larut (Ag⁺)',
    cathodeBubbles: false,
    anodeBubblesPt: true,
    anodeBubblesActive: false,
    cathodeDepositType: 'silver',
    anodeDepositTypePt: 'none',
    cathodeAr: 108,
    cathodeValency: 1,
    anodeArPt: 16,
    anodeValencyPt: 2,
    anodeArCu: 63.5,
    anodeValencyCu: 2,
    anodeArAg: 108,
    anodeValencyAg: 1,
    description: 'Digunakan secara luas dalam industri penyepuhan perak (silver plating) untuk melapisi sendok besi atau perhiasan dengan lapisan logam perak murni yang mengkilap.'
  },
  {
    id: 'KI',
    name: 'Kalium Iodida',
    formula: 'KI (aq)',
    phase: 'aqueous',
    color: 'rgba(241, 245, 249, 0.05)', // clear
    reactedColor: 'rgba(217, 119, 6, 0.25)', // brown iodine
    starchIndicatorColor: 'rgba(30, 27, 75, 0.65)', // dark indigo/black
    cathodeReaction: '2H₂O(l) + 2e⁻ → H₂(g) + 2OH⁻(aq)',
    anodeReactionPt: '2I⁻(aq) → I₂(aq) + 2e⁻',
    anodeReactionActive: 'Cu(s) → Cu²⁺(aq) + 2e⁻',
    cathodeProduct: 'Gas Hidrogen (H₂) & Ion OH⁻',
    anodeProductPt: 'Iodium (I₂ / Cokelat)',
    anodeProductActive: 'Anoda Cu Larut (Cu²⁺)',
    cathodeBubbles: true,
    anodeBubblesPt: false, // I2 dissolved in KI yields triiodide, no bubbles!
    anodeBubblesActive: false,
    cathodeDepositType: 'none',
    anodeDepositTypePt: 'iodine',
    cathodeAr: 1,
    cathodeValency: 1,
    anodeArPt: 127, // iodine
    anodeValencyPt: 1,
    anodeArCu: 63.5,
    anodeValencyCu: 2,
    anodeArAg: 108,
    anodeValencyAg: 1,
    description: 'Kasus unik di mana reduksi air menghasilkan hidrogen di katoda, sedangkan di anoda terjadi oksidasi ion iodida menghasilkan I₂ cair berwarna kecokelatan yang akan melarut sebagai ion triiodida.'
  },
  {
    id: 'H2SO4',
    name: 'Asam Sulfat (Elektrolisis Air)',
    formula: 'H₂SO₄ (aq)',
    phase: 'aqueous',
    color: 'rgba(147, 197, 253, 0.12)', // pale watery blue
    reactedColor: 'rgba(147, 197, 253, 0.15)',
    cathodeReaction: '2H⁺(aq) + 2e⁻ → H₂(g)',
    anodeReactionPt: '2H₂O(l) → O₂(g) + 4H⁺(aq) + 4e⁻',
    anodeReactionActive: 'Cu(s) → Cu²⁺(aq) + 2e⁻',
    cathodeProduct: 'Gas Hidrogen (H₂)',
    anodeProductPt: 'Gas Oksigen (O₂)',
    anodeProductActive: 'Anoda Cu Larut',
    cathodeBubbles: true,
    anodeBubblesPt: true,
    anodeBubblesActive: false,
    cathodeDepositType: 'none',
    anodeDepositTypePt: 'none',
    cathodeAr: 1.008,
    cathodeValency: 1,
    anodeArPt: 16,
    anodeValencyPt: 2,
    anodeArCu: 63.5,
    anodeValencyCu: 2,
    anodeArAg: 108,
    anodeValencyAg: 1,
    description: 'Model pemisahan air (water splitting) murni. Asam sulfat bertindak sebagai elektrolit kuat peningkat konduktivitas. Rasio gas Hidrogen di katoda dibanding Oksigen di anoda adalah tepat 2:1.'
  },
  {
    id: 'NaCl_molten',
    name: 'Lelehan Natrium Klorida (Suhu Tinggi)',
    formula: 'NaCl (l) [≥ 801 °C]',
    phase: 'molten',
    color: 'rgba(251, 146, 60, 0.25)', // glowing orange liquid
    reactedColor: 'rgba(249, 115, 22, 0.4)',
    cathodeReaction: 'Na⁺(l) + e⁻ → Na(l)',
    anodeReactionPt: '2Cl⁻(l) → Cl₂(g) + 2e⁻',
    anodeReactionActive: 'Fe(s) → Fe²⁺(l) + 2e⁻',
    cathodeProduct: 'Logam Natrium Cair (Na)',
    anodeProductPt: 'Gas Klorin (Cl₂)',
    anodeProductActive: 'Anoda Fe Larut',
    cathodeBubbles: false,
    anodeBubblesPt: true,
    anodeBubblesActive: false,
    cathodeDepositType: 'sodium',
    anodeDepositTypePt: 'none',
    cathodeAr: 23,
    cathodeValency: 1,
    anodeArPt: 35.5,
    anodeValencyPt: 1,
    anodeArCu: 56, // Fe is used instead as molten container active electrode
    anodeValencyCu: 2,
    anodeArAg: 108,
    anodeValencyAg: 1,
    description: 'Sistem bebas air (lelehan murni) pada temperatur ekstrem. Tanpa air untuk bersaing, kation logam Na⁺ langsung tereduksi di katoda menghasilkan tetesan logam natrium cair.'
  }
];

const LOCAL_QUIZ_QUESTIONS = [
  {
    id: 'lq-1',
    question: 'Kation manakah berikut ini yang AKAN tereduksi menghasilkan logamnya di katoda dalam bentuk larutan berair?',
    options: [
      'Al³⁺ dari Larutan AlCl₃',
      'Na⁺ dari Larutan Na₂SO₄',
      'Ag⁺ dari Larutan AgNO₃',
      'Mg²⁺ dari Larutan MgSO₄'
    ],
    correctAnswer: 2,
    explanation: 'Dalam bentuk larutan berair, kation dari golongan IA (Na⁺), IIA (Mg²⁺), dan Al³⁺ memiliki potensial reduksi standar yang jauh lebih rendah daripada air. Akibatnya, air yang akan tereduksi menjadi gas H₂. Sedangkan Ag⁺ berpotensial reduksi positif (E° = +0.80V) sehingga mudah tereduksi langsung menjadi logam perak (Ag).'
  },
  {
    id: 'lq-2',
    question: 'Jika larutan CuSO₄ dielektrolisis menggunakan anoda Tembaga (Cu) aktif (bukan logam inert), reaksi yang terjadi di anoda adalah...',
    options: [
      '2H₂O(l) → O₂(g) + 4H⁺(aq) + 4e⁻',
      'Cu(s) → Cu²⁺(aq) + 2e⁻',
      '2SO₄²⁻(aq) → S₂O₈²⁻(aq) + 2e⁻',
      'Cu²⁺(aq) + 2e⁻ → Cu(s)'
    ],
    correctAnswer: 1,
    explanation: 'Ketika sel elektrolisis menggunakan elektroda aktif (non-inert) di anoda (seperti Cu), logam anoda itu sendiri yang akan lebih mudah teroksidasi dibandingkan molekul air atau anion asam oksi. Reaksinya adalah oksidasi logam tembaga: Cu(s) → Cu²⁺(aq) + 2e⁻.'
  },
  {
    id: 'lq-3',
    question: 'Berapakah waktu (detik) yang diperlukan untuk mengendapkan 3,175 gram tembaga (Cu, Ar=63,5) di katoda bila dialirkan arus stabil sebesar 10 Amper pada larutan CuSO₄?',
    options: [
      '965 detik',
      '482,5 detik',
      '1930 detik',
      '9650 detik'
    ],
    correctAnswer: 0,
    explanation: 'W = (e * I * t) / 96,500. Di sini, W = 3,175 g. Cu²⁺ bervalensi 2, maka e = Ar/valensi = 63,5 / 2 = 31,75. Sehingga: 3,175 = (31,75 * 10 * t) / 96,500 => 3,175 = 317,5 * t / 96,500 => t = 3,175 * 96,500 / 317,5 = 965 detik.'
  },
  {
    id: 'lq-4',
    question: 'Dua buah sel elektrolisis disusun secara seri. Sel pertama berisi larutan AgNO₃ dan sel kedua berisi larutan CuSO₄. Jika pada sel pertama dibebaskan 1,08 gram logam Perak (Ar Ag=108), berapakah massa Tembaga (Ar Cu=63,5) yang mengendap pada sel kedua?',
    options: [
      '0,635 gram',
      '0,3175 gram',
      '1,27 gram',
      '0,1587 gram'
    ],
    correctAnswer: 1,
    explanation: 'Menurut Hukum Faraday II untuk sel seri: W₁/W₂ = e₁ / e₂. Sel 1 (Perak): e₁ = 108 / 1 = 108. Sel 2 (Tembaga): e₂ = 63,5 / 2 = 31,75. Maka: 1,08 / W₂ = 108 / 31,75 => W₂ = 1,08 * 31,75 / 108 = 0,3175 gram.'
  },
  {
    id: 'lq-5',
    question: 'Pada elektrolisis larutan KI (Kalium Iodida) dengan elektroda platina ditetesi indikator amilum, bagian anoda berubah warnanya menjadi ungu tua/hitam kecokelatan. Hal ini membuktikan bahwa...',
    options: [
      'Air teroksidasi menghasilkan ion OH⁻ pekat',
      'Kation Kalium mengendap di kutub positif',
      'Terbentuk molekul Iodium (I₂) bebas yang bereaksi dengan amilum',
      'Amilum teroksidasi mengeluarkan gas ozon'
    ],
    correctAnswer: 2,
    explanation: 'Pada anoda Pt larutan KI, amonium halogenida (ion Iodida I⁻) dioksidasi menjadi Iodium bebas (I₂): 2I⁻(aq) → I₂(aq) + 2e⁻. Iodium cair bereaksi spesifik dengan indikator amilum (starch) menghasilkan kompleks warna hitam kecokelatan hingga ungu tua pekat.'
  }
];

export default function ElectrolysisLab() {
  const [activeTab, setActiveTab] = useState<'simulasi' | 'kalkulator' | 'teori' | 'quiz'>('simulasi');
  
  // Simulation Settings
  const [selectedEl, setSelectedEl] = useState<Electrolyte>(ELECTROLYTES[0]);
  const [anodeType, setAnodeType] = useState<'Pt' | 'Cu' | 'Ag'>('Pt'); 
  const [cathodeType, setCathodeType] = useState<'Fe' | 'Pt' | 'Cu'>('Fe');
  const [current, setCurrent] = useState<number>(5.0); // Amperes
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(10); // rate of time elapsed
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsed, setElapsed] = useState<number>(0); // in seconds
  const [showIndicator, setShowIndicator] = useState<boolean>(false); // phenolphthalein
  const [showStarch, setShowStarch] = useState<boolean>(false); // starch/amilum

  // Live Calculated Yields (Faraday Law I)
  const [depositedCathode, setDepositedCathode] = useState<number>(0); // grams
  const [anodeGasVolume, setAnodeGasVolume] = useState<number>(0); // Litir STP
  const [cathodeGasVolume, setCathodeGasVolume] = useState<number>(0); // Litir STP

  // Calculator Tool States (Faraday I)
  const [calcTarget, setCalcTarget] = useState<'w' | 't' | 'i'>('w');
  const [calcMetal, setCalcMetal] = useState<string>('Cu');
  const [calcAr, setCalcAr] = useState<number>(63.5);
  const [calcValency, setCalcValency] = useState<number>(2);
  const [calcCurrent, setCalcCurrent] = useState<number>(10);
  const [calcTime, setCalcTime] = useState<number>(965);
  const [calcMassInput, setCalcMassInput] = useState<number>(3.175);
  const [calcResult, setCalcResult] = useState<string>('');
  const [calcSteps, setCalcSteps] = useState<string[]>([]);

  // Calculator F2 (Serial Cells)
  const [f2Cell1Metal, setF2Cell1Metal] = useState<string>('Ag');
  const [f2Cell1Ar, setF2Cell1Ar] = useState<number>(108);
  const [f2Cell1Val, setF2Cell1Val] = useState<number>(1);
  const [f2Cell1Mass, setF2Cell1Mass] = useState<number>(1.08);

  const [f2Cell2Metal, setF2Cell2Metal] = useState<string>('Cu');
  const [f2Cell2Ar, setF2Cell2Ar] = useState<number>(63.5);
  const [f2Cell2Val, setF2Cell2Val] = useState<number>(2);
  const [f2Cell2Result, setF2Cell2Result] = useState<number>(0);

  // Local Quiz States
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizIsAnswered, setQuizIsAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Sound/Vibe settings
  const [muted, setMuted] = useState<boolean>(true);

  // References and Interval timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleContainerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize anode options based on selected electrolyte
  useEffect(() => {
    // Silver electrolyte should support silver anode
    if (selectedEl.id === 'AgNO3') {
      setAnodeType('Ag');
    } else if (selectedEl.id === 'CuSO4') {
      setAnodeType('Cu');
    } else {
      setAnodeType('Pt'); // Rest default to inert Pt
    }
    // Turn off running on change
    setIsRunning(false);
    setElapsed(0);
    setDepositedCathode(0);
    setAnodeGasVolume(0);
    setCathodeGasVolume(0);
  }, [selectedEl]);

  // Handle active simulation math inside requestAnimationFrame or high frequency interval
  useEffect(() => {
    if (isRunning) {
      const intervalMs = 150;
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const nextSeconds = prev + (intervalMs / 1000) * speedMultiplier;
          
          // Calculate Cathode deposited mass
          // w = (e * i * t) / 96500
          // For copper, silver, or sodium
          let cathodeAr = selectedEl.cathodeAr;
          let cathodeVal = selectedEl.cathodeValency;
          let equivalentW = cathodeAr / cathodeVal;
          let calculatedMass = (equivalentW * current * nextSeconds) / 96500;
          
          if (selectedEl.cathodeDepositType === 'none') {
            setDepositedCathode(0);
            // Volume H2 gas in Liters STP (1 mole gas = 22.4 Liter)
            // 2H+ + 2e- -> H2 (mole gas = 0.5 * mole e-)
            // or 2H2O + 2e- -> H2 + 2OH- (mole gas = 0.5 * mole e-)
            let moleElectrons = (current * nextSeconds) / 96500;
            let moleH2 = moleElectrons * 0.5;
            setCathodeGasVolume(moleH2 * 22.4);
          } else {
            setDepositedCathode(calculatedMass);
            setCathodeGasVolume(0);
          }

          // Calculate Anode yield
          let isAnodeInert = anodeType === 'Pt';
          if (isAnodeInert) {
            // Inert: e.g. O2 or Cl2
            let moleElectrons = (current * nextSeconds) / 96500;
            if (selectedEl.id === 'NaCl' || selectedEl.id === 'NaCl_molten') {
              // 2Cl- -> Cl2(g) + 2e- (1 mole Cl2 = 0.5 mole e-)
              let moleCl2 = moleElectrons * 0.5;
              setAnodeGasVolume(moleCl2 * 22.4);
            } else if (selectedEl.id === 'KI') {
              // 2I- -> I2(aq) + 2e- (no gas, liquid turns brown)
              setAnodeGasVolume(0);
            } else {
              // 2H2O -> O2 + 4H+ + 4e- (1 mole O2 = 0.25 mole e-)
              let moleO2 = moleElectrons * 0.25;
              setAnodeGasVolume(moleO2 * 22.4);
            }
          } else {
            // Dissolving active anode, no gas products
            setAnodeGasVolume(0);
          }

          return nextSeconds;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, current, speedMultiplier, selectedEl, anodeType]);

  // Reset function for simulation
  const handleResetSim = () => {
    setIsRunning(false);
    setElapsed(0);
    setDepositedCathode(0);
    setAnodeGasVolume(0);
    setCathodeGasVolume(0);
  };

  // Pre-fill common metal selection for Faraday Calculator I
  useEffect(() => {
    switch (calcMetal) {
      case 'Cu':
        setCalcAr(63.5);
        setCalcValency(2);
        break;
      case 'Ag':
        setCalcAr(108);
        setCalcValency(1);
        break;
      case 'Au':
        setCalcAr(197);
        setCalcValency(3);
        break;
      case 'Zn':
        setCalcAr(65.4);
        setCalcValency(2);
        break;
      case 'Ni':
        setCalcAr(58.7);
        setCalcValency(2);
        break;
      case 'Cr':
        setCalcAr(52);
        setCalcValency(3);
        break;
      case 'Fe':
        setCalcAr(56);
        setCalcValency(2);
        break;
      case 'Al':
        setCalcAr(27);
        setCalcValency(3);
        break;
    }
  }, [calcMetal]);

  // Solve button Faraday I
  const handleCalculateFaradayI = () => {
    const e = calcAr / calcValency;
    if (calcTarget === 'w') {
      const w = (e * calcCurrent * calcTime) / 96500;
      setCalcResult(`${w.toFixed(5)} gram`);
      setCalcSteps([
        `Langkah 1: Tentukan berat ekivalen (e)\n  e = Ar / valensi = ${calcAr} / ${calcValency} = ${e.toFixed(3)}`,
        `Langkah 2: Terapkan rumus Hukum Faraday I\n  W = (e * i * t) / 96500`,
        `Langkah 3: Substitusi nilai yang diketahui\n  W = (${e.toFixed(3)} * ${calcCurrent} A * ${calcTime} s) / 96500`,
        `Langkah 4: Hitung hasil akhir\n  W = ${(e * calcCurrent * calcTime).toFixed(2)} / 96500 = ${w.toFixed(5)} gram`
      ]);
    } else if (calcTarget === 't') {
      const t = (calcMassInput * 96500) / (e * calcCurrent);
      setCalcResult(`${t.toFixed(2)} detik (${(t / 60).toFixed(2)} menit)`);
      setCalcSteps([
        `Langkah 1: Tentukan berat ekivalen (e)\n  e = Ar / valensi = ${calcAr} / ${calcValency} = ${e.toFixed(3)}`,
        `Langkah 2: Susun ulang rumus Hukum Faraday I untuk mencari t\n  t = (W * 96500) / (e * i)`,
        `Langkah 3: Substitusi nilai\n  t = (${calcMassInput} g * 96500) / (${e.toFixed(3)} * ${calcCurrent} A)`,
        `Langkah 4: Hitung hasil akhir\n  t = ${(calcMassInput * 96500).toFixed(1)} / ${(e * calcCurrent).toFixed(3)} = ${t.toFixed(2)} detik`
      ]);
    } else if (calcTarget === 'i') {
      const i = (calcMassInput * 96500) / (e * calcTime);
      setCalcResult(`${i.toFixed(3)} Amper`);
      setCalcSteps([
        `Langkah 1: Tentukan berat ekivalen (e)\n  e = Ar / valensi = ${calcAr} / ${calcValency} = ${e.toFixed(3)}`,
        `Langkah 2: Susun ulang rumus Hukum Faraday I untuk mencari i\n  i = (W * 96500) / (e * t)`,
        `Langkah 3: Substitusi nilai\n  i = (${calcMassInput} g * 96500) / (${e.toFixed(3)} * ${calcTime} s)`,
        `Langkah 4: Hitung hasil arusnya\n  i = ${(calcMassInput * 96500).toFixed(1)} / ${(e * calcTime).toFixed(3)} = ${i.toFixed(3)} Amper`
      ]);
    }
  };

  // Faraday II (Series Cells) calculations
  useEffect(() => {
    const e1 = f2Cell1Ar / f2Cell1Val;
    const e2 = f2Cell2Ar / f2Cell2Val;
    // W1/W2 = e1/e2 => W2 = (W1 * e2) / e1
    const w2 = (f2Cell1Mass * e2) / e1;
    setF2Cell2Result(w2);
  }, [f2Cell1Ar, f2Cell1Val, f2Cell1Mass, f2Cell2Ar, f2Cell2Val]);

  // Pre-fill cell presets in Faraday II
  const applyF2Preset = (cellNum: 1 | 2, symbol: string) => {
    let ar = 108;
    let val = 1;
    if (symbol === 'Cu') { ar = 63.5; val = 2; }
    else if (symbol === 'Ag') { ar = 108; val = 1; }
    else if (symbol === 'Zn') { ar = 65.4; val = 2; }
    else if (symbol === 'Ni') { ar = 58.7; val = 2; }
    else if (symbol === 'Cr') { ar = 52; val = 3; }
    else if (symbol === 'Fe') { ar = 56; val = 2; }

    if (cellNum === 1) {
      setF2Cell1Metal(symbol);
      setF2Cell1Ar(ar);
      setF2Cell1Val(val);
    } else {
      setF2Cell2Metal(symbol);
      setF2Cell2Ar(ar);
      setF2Cell2Val(val);
    }
  };

  // Interactive local quiz action
  const handleQuizAnswer = (optionIdx: number) => {
    if (quizIsAnswered) return;
    setQuizSelectedOption(optionIdx);
    setQuizIsAnswered(true);
    if (optionIdx === LOCAL_QUIZ_QUESTIONS[quizIndex].correctAnswer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setQuizSelectedOption(null);
    setQuizIsAnswered(false);
    if (quizIndex < LOCAL_QUIZ_QUESTIONS.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setQuizSelectedOption(null);
    setQuizIsAnswered(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // Active Anode details
  const isAnodePtInert = anodeType === 'Pt';
  const displayAnodeReaction = isAnodePtInert ? selectedEl.anodeReactionPt : selectedEl.anodeReactionActive;
  const displayAnodeProduct = isAnodePtInert ? selectedEl.anodeProductPt : selectedEl.anodeProductActive;

  // Render Bubbles Helper
  const getBubblingArray = (count: number) => {
    return Array.from({ length: count }, (_, i) => i);
  };

  // Render liquid fill background depending on settings
  const getSolutionBg = () => {
    // If molten salt: orange active glow
    if (selectedEl.phase === 'molten') {
      return 'linear-gradient(180deg, rgba(239, 68, 68, 0.4), rgba(249, 115, 22, 0.3))';
    }
    // Specific compound color adjustments with indicators
    if (selectedEl.id === 'NaCl' && showIndicator && numBubblesActiveAtCathode() > 0) {
      return `linear-gradient(90deg, ${selectedEl.pHIndicatorColor} 25%, ${selectedEl.color} 75%)`;
    }
    if (selectedEl.id === 'KI' && showStarch && (elapsed > 0)) {
      return `linear-gradient(270deg, ${selectedEl.starchIndicatorColor} 20%, ${selectedEl.color} 80%)`;
    }
    if (selectedEl.id === 'KI' && elapsed > 0) {
      return `linear-gradient(270deg, ${selectedEl.reactedColor} 15%, ${selectedEl.color} 85%)`;
    }
    if (selectedEl.id === 'CuSO4' && elapsed > 0) {
      // simulate blue fading very slowly as mass is removed
      const fadeRatio = Math.max(0.05, 1 - depositedCathode / 15.0); // assuming 15g starts dramatic depletion
      return `rgba(56, 189, 248, ${0.1 + 0.15 * fadeRatio})`;
    }
    return selectedEl.color;
  };

  const numBubblesActiveAtCathode = () => {
    if (!isRunning) return 0;
    return selectedEl.cathodeBubbles ? Math.ceil(current * 1.5) : 0;
  };

  const numBubblesActiveAtAnode = () => {
    if (!isRunning) return 0;
    if (anodeType !== 'Pt') return 0;
    return selectedEl.anodeBubblesPt ? Math.ceil(current * 1.5) : 0;
  };

  return (
    <div id="electrolysis-lab-root" className="w-full bg-[#0b1329] min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-x-hidden pt-4 pb-12">
      {/* Premium Dashboard Header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-widest bg-teal-950/40 px-3 py-1 rounded-full border border-teal-500/20 w-fit mb-2">
              <Zap className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              Kimia Kelas XII SMA
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sel Elektrolisis &amp; Hukum Faraday
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Model laboratorium visual cerdas untuk menganalisis reaksi reduksi-oksidasi non-spontan, mengamati endapan plating, serta menghitung massa kuantitatif Hukum Faraday I &amp; II.
            </p>
          </div>

          {/* Quick Stats Banner / Status Indicators */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-slate-500 text-[10px] font-mono leading-none">KONDUKTIVITAS SEL</span>
              <span className={`text-xs font-bold leading-none mt-1 ${isRunning ? 'text-emerald-400' : 'text-amber-400'}`}>
                ● {isRunning ? 'ELEKTROLISIS AKTIF' : 'TERHUBUNG (OFF)'}
              </span>
            </div>
            <button
              onClick={() => setMuted(!muted)}
              className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl transition-all cursor-pointer text-slate-400 text-xs shrink-0 flex items-center justify-center"
              title={muted ? 'Nyalakan Audio' : 'Bisukan Audio'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-900">
          <button
            onClick={() => setActiveTab('simulasi')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'simulasi' 
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Virtual Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('kalkulator')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'kalkulator' 
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span>Kalkulator Faraday</span>
          </button>

          <button
            onClick={() => setActiveTab('teori')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'teori' 
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Panduan Teori</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'quiz' 
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Uji Pemahaman</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* TAB 1: VIRTUAL SIMULATOR */}
          {activeTab === 'simulasi' && (
            <motion.div
              key="simulasi"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Simulation Controls (Span 5) */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* 1. System Selectors Card */}
                <div className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1 uppercase tracking-wider">
                    <Layers className="w-4.5 h-4.5" />
                    <span>Konfigurasi Sel Elektrolisis</span>
                  </div>

                  {/* Program Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Pilih Elektrolit (Larutan/Lelehan)</label>
                    <select
                      value={selectedEl.id}
                      onChange={(e) => {
                        const found = ELECTROLYTES.find(item => item.id === e.target.value);
                        if (found) setSelectedEl(found);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 focus:border-teal-500 outline-none transition-colors cursor-pointer"
                    >
                      {ELECTROLYTES.map((el) => (
                        <option key={el.id} value={el.id}>
                          {el.name} ({el.formula})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Electrode Choice */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Cathode selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        KUTUB (-) KATODA
                      </label>
                      <select
                        value={cathodeType}
                        onChange={(e) => setCathodeType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-lg px-2.5 py-2 cursor-pointer focus:border-blue-500 outline-none"
                      >
                        <option value="Fe">Besi (Fe) [Penyepuhan]</option>
                        <option value="Pt">Platina (Pt) [Inert]</option>
                        <option value="Cu">Tembaga (Cu)</option>
                      </select>
                    </div>

                    {/* Anode selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        KUTUB (+) ANODA
                      </label>
                      {selectedEl.id === 'AgNO3' ? (
                        <select
                          value={anodeType}
                          onChange={(e) => setAnodeType(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-150 text-xs rounded-lg px-2.5 py-2 outline-none"
                        >
                          <option value="Ag">Perak (Ag) [Aktif]</option>
                          <option value="Pt">Platina (Pt) [Inert]</option>
                        </select>
                      ) : selectedEl.id === 'CuSO4' ? (
                        <select
                          value={anodeType}
                          onChange={(e) => setAnodeType(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-150 text-xs rounded-lg px-2.5 py-2 outline-none"
                        >
                          <option value="Cu">Tembaga (Cu) [Aktif]</option>
                          <option value="Pt">Platina (Pt) [Inert]</option>
                        </select>
                      ) : (
                        <select
                          disabled
                          className="w-full bg-slate-950 opacity-60 border border-slate-800 text-slate-400 text-xs rounded-lg px-2.5 py-2 cursor-not-allowed"
                        >
                          <option value="Pt">Platina (Pt) [Inert]</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Compound description */}
                  <p className="bg-slate-950/50 rounded-xl p-3 border border-slate-900 text-xs text-slate-400 leading-relaxed italic">
                    {selectedEl.description}
                  </p>
                </div>

                {/* 2. Electric Parameters Card */}
                <div className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between text-indigo-400 font-bold text-sm mb-1 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <Flame className="w-4.5 h-4.5 text-amber-400" />
                      Arus &amp; Parameter Waktu
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md">
                      E_sel ~ {(1.2 + (selectedEl.id === 'NaCl_molten' ? 4.1 : 1.5)).toFixed(1)} V
                    </span>
                  </div>

                  {/* Arus Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Arus Listrik (i)</span>
                      <span className="text-amber-400 font-mono font-bold text-sm bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20">
                        {current.toFixed(1)} Amper
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="15.0"
                      step="0.5"
                      value={current}
                      onChange={(e) => setCurrent(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer bg-slate-950 h-1.5 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0.5 A [Lemah]</span>
                      <span>15.0 A [Kuat]</span>
                    </div>
                  </div>

                  {/* Speed Multiplier slider */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Simulasi Laju Waktu (Speed)</span>
                      <span className="text-teal-400 font-mono font-bold">
                        {speedMultiplier}x Detik/s
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg">
                      {[1, 5, 20, 100].map((val) => (
                        <button
                          key={val}
                          onClick={() => setSpeedMultiplier(val)}
                          className={`py-1 text-[11px] font-mono rounded cursor-pointer transition-all ${
                            speedMultiplier === val 
                              ? 'bg-teal-500 text-white font-bold shadow-sm' 
                              : 'text-slate-400 hover:bg-slate-900/40'
                          }`}
                        >
                          {val}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chemical Indicators checkbox toggles */}
                  {selectedEl.id === 'NaCl' && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <label className="flex items-center gap-3 bg-slate-950/30 p-2.5 rounded-xl border border-pink-500/10 hover:bg-slate-950/60 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={showIndicator}
                          onChange={(e) => setShowIndicator(e.target.checked)}
                          className="w-4 h-4 accent-pink-500 cursor-pointer"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-pink-400 block">Indikator Fenolftalein (PP)</span>
                          <span className="text-[10px] text-slate-400">Rona merah muda membuktikan reduksi air menghasilkan ion basa OH⁻ di dekat Katoda</span>
                        </div>
                      </label>
                    </div>
                  )}

                  {selectedEl.id === 'KI' && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <label className="flex items-center gap-3 bg-slate-950/30 p-2.5 rounded-xl border border-indigo-505/10 hover:bg-slate-950/60 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={showStarch}
                          onChange={(e) => setShowStarch(e.target.checked)}
                          className="w-4 h-4 accent-indigo-500 cursor-pointer"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-indigo-400 block">Indukator Amilum (Starch)</span>
                          <span className="text-[10px] text-slate-400">Warna anoda berubah biru-gelap menandakan iodium bebas I₂ terbentuk mengikat amilum</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* 3. Action Buttons & Speed Stats */}
                <div className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between leading-none">
                  <div className="text-left w-full sm:w-auto">
                    <span className="text-slate-500 text-[10px] font-mono block">WAKTU ELEKTROLISIS (t)</span>
                    <span className="text-lg font-extrabold text-white font-mono mt-1 block">
                      {elapsed.toFixed(1)} <span className="text-xs font-sans text-slate-400">detik</span>
                    </span>
                    <span className="text-[10px] text-slate-400 italic block mt-0.5">
                      Jumlah Coulombs (Q): {(current * elapsed).toFixed(0)} C
                    </span>
                  </div>

                  <div className="flex gap-2.5 w-full sm:w-auto shrink-0">
                    <button
                      onClick={handleResetSim}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      title="Reset Simulasi"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsRunning(!isRunning)}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-2 transition-all ${
                        isRunning 
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                          : 'bg-teal-500 text-white hover:bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>HENTIKAN SEL</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>ALIRKAN ARUS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Animated SVG Beaker & Live Calculation yields (Span 7) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* Visualizer Card */}
                <div className="glass-panel bg-slate-900/20 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4.5 h-4.5 text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Tampilan Sel Reaktor</span>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-500/20">KATODA: {cathodeType} (-)</span>
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/20">ANODA: {anodeType} (+)</span>
                    </div>
                  </div>

                  {/* SVG BEAKER ANIMATION CONTAINER */}
                  <div className="w-full max-w-[450px] aspect-square relative bg-slate-950/70 border border-slate-900 rounded-xl overflow-hidden p-4 flex items-center justify-center">
                    {/* Heated glow overlay if molten */}
                    {selectedEl.phase === 'molten' && (
                      <div className="absolute inset-0 bg-radial-gradient from-orange-500/10 via-transparent to-transparent pointer-events-none animate-pulse" />
                    )}

                    <svg viewBox="0 0 400 400" className="w-full h-full select-none">
                      {/* Power Supply Box (Top Center) */}
                      <rect x="130" y="20" width="140" height="60" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                      <text x="200" y="40" fill="#e2e8f0" fontSize="10" textAnchor="middle" fontWeight="bold">CATU DAYA (BATERAI)</text>
                      
                      {/* Active timer voltage text inside battery */}
                      <text x="160" y="58" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{current.toFixed(1)} A</text>
                      <text x="240" y="58" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{(1.5 + (selectedEl.id === 'NaCl_molten' ? 4.1 : 1.5)).toFixed(1)} V</text>

                      {/* Electrons flowing wires */}
                      {/* Left wire to cathode */}
                      <path d="M 130 50 L 80 50 L 80 140" fill="none" stroke="#64748b" strokeWidth="3" />
                      {/* Right wire to anode */}
                      <path d="M 270 50 L 320 50 L 320 140" fill="none" stroke="#64748b" strokeWidth="3" fillOpacity="0" />

                      {/* Electron movement animations along the wire (only if running) */}
                      {isRunning && (
                        <>
                          {/* From Anode (+) to Battery, and Battery to Cathode (-) */}
                          {/* Right side electron going UP to Battery */}
                          <circle r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1">
                            <animateMotion 
                              path="M 320 140 L 320 50 L 270 50" 
                              dur={`${Math.max(0.5, 3 - current * 0.2)}s`} 
                              repeatCount="indefinite" 
                            />
                          </circle>
                          {/* Left side electron going DOWN to Cathode */}
                          <circle r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1">
                            <animateMotion 
                              path="M 130 50 L 80 50 L 80 140" 
                              dur={`${Math.max(0.5, 3 - current * 0.2)}s`} 
                              repeatCount="indefinite" 
                            />
                          </circle>
                          <text x="200" y="75" fill="#a855f7" fontSize="9" fontWeight="bold" textAnchor="middle" className="animate-pulse">
                            ALIRAN ELEKTRON (e⁻)
                          </text>
                        </>
                      )}

                      {/* Beaker Outline */}
                      <path d="M 40 120 L 40 370 A 15 15 0 0 0 55 385 L 345 385 A 15 15 0 0 0 360 370 L 360 120" fill="none" stroke="#94a3b8" strokeWidth="5" />
                      <line x1="33" y1="120" x2="47" y2="120" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                      <line x1="353" y1="120" x2="367" y2="120" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />

                      {/* Solution Liquid */}
                      <path 
                        d="M 43 140 L 43 370 A 12 12 0 0 0 55 382 L 345 382 A 12 12 0 0 0 357 370 L 357 140 Z" 
                        fill={getSolutionBg()} 
                        className="transition-all duration-700" 
                      />

                      {/* Heat waves for molten (NaCl_molten) */}
                      {selectedEl.phase === 'molten' && (
                        <>
                          <path d="M 90 130 Q 100 120 110 130" fill="none" stroke="rgba(249,115,22,0.4)" strokeWidth="2">
                            <animate attributeName="d" values="M 90 130 Q 100 120 110 130; M 90 130 Q 80 120 110 130; M 90 130 Q 100 120 110 130" dur="2s" repeatCount="indefinite" />
                          </path>
                          <path d="M 290 135 Q 300 125 310 135" fill="none" stroke="rgba(249,115,22,0.4)" strokeWidth="2">
                            <animate attributeName="d" values="M 290 135 Q 300 125 310 135; M 290 135 Q 280 125 310 135; M 290 135 Q 300 125 310 135" dur="1.8s" repeatCount="indefinite" />
                          </path>
                        </>
                      )}

                      {/* LEFT ELECTRODE: CATHODE (-) */}
                      {/* The metal piece */}
                      <rect x="68" y="110" width="24" height="200" rx="3" fill="#475569" stroke="#334155" strokeWidth="2" />
                      {/* Active plating overlay layer on Cathode */}
                      {selectedEl.cathodeDepositType !== 'none' && depositedCathode > 0 && (
                        <rect 
                          x={64 - Math.min(6, depositedCathode * 12)} 
                          y="130" 
                          width={32 + Math.min(12, depositedCathode * 24)} 
                          height="170" 
                          rx="5" 
                          fill={selectedEl.cathodeDepositType === 'copper' ? '#ea580c' : selectedEl.cathodeDepositType === 'silver' ? '#cbd5e1' : '#e2e8f0'} 
                          opacity={0.55 + Math.min(0.45, depositedCathode * 5)} 
                          className="transition-all"
                        />
                      )}

                      {/* RIGHT ELECTRODE: ANODE (+) */}
                      {/* Active anode dissolving effect */}
                      <rect 
                        x="308" 
                        y="110" 
                        width={anodeType === 'Pt' ? 24 : Math.max(10, 24 - (elapsed * 0.02))} 
                        height="200" 
                        rx="3" 
                        fill={anodeType === 'Pt' ? '#1e293b' : anodeType === 'Cu' ? '#ea580c' : '#ffffff'} 
                        stroke="#334155" 
                        strokeWidth="2" 
                        opacity={anodeType === 'Pt' ? 1.0 : Math.max(0.4, 1 - (elapsed * 0.003))}
                        className="transition-all"
                      />
                      {/* Anode label dissolved particles in CuSO4 */}
                      {anodeType !== 'Pt' && isRunning && (
                        <>
                          <circle cx="285" cy="180" r="4" fill="#06b6d4" opacity="0.8">
                            <animate attributeName="cx" values="305;260" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="180;210" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="290" cy="240" r="4" fill="#06b6d4" opacity="0.8">
                            <animate attributeName="cx" values="305;250" dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="cy" values="240;270" dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9;0" dur="2.5s" repeatCount="indefinite" />
                          </circle>
                        </>
                      )}

                      {/* Interactive Signpost/Labels for Electrodes */}
                      <g transform="translate(80, 290)">
                        <rect x="-35" y="0" width="70" height="18" rx="4" fill="rgba(30,41,59,0.9)" stroke="#1d4ed8" strokeWidth="1" />
                        <text x="0" y="12" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">KATODA (-)</text>
                      </g>

                      <g transform="translate(320, 290)">
                        <rect x="-35" y="0" width="70" height="18" rx="4" fill="rgba(30,41,59,0.9)" stroke="#b91c1c" strokeWidth="1" />
                        <text x="0" y="12" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">ANODA (+)</text>
                      </g>

                      {/* Solution migration arrows (Ions migrating) */}
                      {isRunning && (
                        <>
                          {/* Cations migrating to Cathode (-) on the left */}
                          <g transform="translate(190, 210)">
                            <text x="-40" y="-12" fill="#60a5fa" fontSize="10" fontWeight="bold" textAnchor="middle">
                              {selectedEl.id === 'CuSO4' ? 'Cu²⁺' : selectedEl.id === 'NaCl' || selectedEl.id === 'NaCl_molten' ? 'Na⁺' : selectedEl.id === 'AgNO3' ? 'Ag⁺' : 'H⁺'}
                            </text>
                            <path d="M 0 0 L -40 0" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrow)" />
                            {/* Animated circle */}
                            <circle cx="-15" cy="0" r="5" fill="#3b82f6">
                              <animate attributeName="cx" values="0;-40" dur="2.1s" repeatCount="indefinite" />
                            </circle>
                          </g>

                          {/* Anions migrating to Anode (+) on the right */}
                          <g transform="translate(210, 230)">
                            <text x="40" y="-12" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">
                              {selectedEl.id === 'CuSO4' ? 'SO₄²⁻' : selectedEl.id === 'NaCl' || selectedEl.id === 'NaCl_molten' ? 'Cl⁻' : selectedEl.id === 'AgNO3' ? 'NO₃⁻' : 'I⁻'}
                            </text>
                            <path d="M 0 3 L 40 3" stroke="#f87171" strokeWidth="2" markerEnd="url(#arrow)" fill="none" />
                            {/* Animated circle */}
                            <circle cx="15" cy="3" r="5" fill="#ef4444">
                              <animate attributeName="cx" values="0;40" dur="2.4s" repeatCount="indefinite" />
                            </circle>
                          </g>
                        </>
                      )}

                      {/* Gas Bubbles Cathode (Left) */}
                      {numBubblesActiveAtCathode() > 0 && (
                        <g>
                          {getBubblingArray(numBubblesActiveAtCathode()).map((idx) => {
                            const size = 3 + (idx % 3);
                            const offset = -18 + idx * 4.5;
                            const dur = 1.2 + (idx % 3) * 0.4;
                            return (
                              <circle key={`cat-b-${idx}`} r={size} fill="rgba(255,255,255,0.75)" stroke="none">
                                <animate attributeName="cx" values={`${80 + offset}`} dur={`${dur}s`} repeatCount="indefinite" />
                                <animate attributeName="cy" values="270;145" dur={`${dur}s`} repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;0" dur={`${dur}s`} repeatCount="indefinite" />
                              </circle>
                            );
                          })}
                        </g>
                      )}

                      {/* Gas Bubbles Anode (Right) */}
                      {numBubblesActiveAtAnode() > 0 && (
                        <g>
                          {getBubblingArray(numBubblesActiveAtAnode()).map((idx) => {
                            const size = 2.5 + (idx % 3);
                            const offset = -18 + idx * 4.5;
                            const dur = 1 + (idx % 3) * 0.35;
                            // Chlorine bubbles are slightly yellow, oxygen is white
                            const col = selectedEl.id === 'NaCl' || selectedEl.id === 'NaCl_molten' ? 'rgba(217, 249, 157, 0.7)' : 'rgba(255,255,255,0.75)';
                            return (
                              <circle key={`an-b-${idx}`} r={size} fill={col} stroke="none">
                                <animate attributeName="cx" values={`${320 + offset}`} dur={`${dur}s`} repeatCount="indefinite" />
                                <animate attributeName="cy" values="270;145" dur={`${dur}s`} repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;0" dur={`${dur}s`} repeatCount="indefinite" />
                              </circle>
                            );
                          })}
                        </g>
                      )}

                      {/* Iodine brown clouds near Pt anode */}
                      {selectedEl.id === 'KI' && isRunning && (
                        <g opacity="0.75">
                          <circle cx="320" cy="220" r="15" fill={showStarch ? '#1e1b4b' : '#b45309'} filter="blur(6px)">
                            <animate attributeName="r" values="10;28;10" dur="3s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="320" cy="180" r="12" fill={showStarch ? '#311042' : '#d97706'} filter="blur(5px)">
                            <animate attributeName="r" values="8;24;8" dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
                          </circle>
                        </g>
                      )}

                      {/* Marker definitions */}
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9 z" fill="context-stroke" />
                        </marker>
                      </defs>
                    </svg>

                    {/* Indicator tags overlay inside visualizer */}
                    {selectedEl.id === 'NaCl' && showIndicator && isRunning && (
                      <div className="absolute bottom-6 left-6 bg-pink-900/90 text-pink-300 border border-pink-500/20 px-2 py-1 rounded text-[10px] uppercase font-bold animate-pulse">
                        Ujung Katoda Bersifat BASA (OH⁻)
                      </div>
                    )}
                    {selectedEl.id === 'KI' && showStarch && isRunning && (
                      <div className="absolute bottom-6 right-6 bg-indigo-950/95 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded text-[10px] uppercase font-bold animate-pulse">
                        Kompleks Amilum-Iodi terbentuk
                      </div>
                    )}
                  </div>

                  {/* Reaction Equations Display Banner */}
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs font-mono">
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-blue-900/30">
                      <span className="text-blue-400 font-bold flex items-center gap-1.5 mb-1 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        REDUKSI (KATODA)
                      </span>
                      <p className="text-white text-sm font-semibold">{selectedEl.cathodeReaction}</p>
                      <p className="text-[10px] text-slate-400 mt-2 italic">Hasilkan: {selectedEl.cathodeProduct}</p>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-red-900/30">
                      <span className="text-red-400 font-bold flex items-center gap-1.5 mb-1 text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        OKSIDASI (ANODA)
                      </span>
                      <p className="text-white text-sm font-semibold">{displayAnodeReaction}</p>
                      <p className="text-[10px] text-slate-400 mt-2 italic">Hasilkan: {displayAnodeProduct}</p>
                    </div>
                  </div>
                </div>

                {/* Live Quantitative Yield Results Dashboard */}
                <div className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                  <div className="text-indigo-400 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Hasil Kuantitatif Live (Faraday I)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Yield 1: Cathode Metal Deposit */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-slate-400 leading-none">Massa Endapan Katoda</span>
                      <div className="mt-2 text-2xl font-extrabold text-teal-400 font-mono">
                        {depositedCathode.toFixed(5)} <span className="text-xs font-sans text-slate-400">g</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Sesuai kation {selectedEl.cathodeDepositType !== 'none' ? selectedEl.cathodeDepositType.toUpperCase() : 'GAS'} (Ar={selectedEl.cathodeAr})
                      </span>
                    </div>

                    {/* Yield 2: Cathode Gas Volume */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-slate-400 leading-none">Gas Katoda (STP)</span>
                      <div className="mt-2 text-2xl font-extrabold text-slate-200 font-mono">
                        {cathodeGasVolume.toFixed(5)} <span className="text-xs font-sans text-slate-400">L</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Menampung gas H₂ jika reduksi pelarut air aktif
                      </span>
                    </div>

                    {/* Yield 3: Anode Gas Or Liquid Volume */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-slate-400 leading-none">Yield Anode (STP/Larutan)</span>
                      <div className="mt-2 text-2xl font-extrabold text-amber-500 font-mono">
                        {selectedEl.id === 'KI' && anodeType === 'Pt' ? (
                          <>
                            {((current * elapsed) / 96500 * 0.5).toFixed(5)}{' '}
                            <span className="text-xs font-sans text-slate-405">mol I₂</span>
                          </>
                        ) : (
                          <>
                            {anodeGasVolume.toFixed(5)}{' '}
                            <span className="text-xs font-sans text-slate-405">L</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Keberadaan O₂ atau Cl₂ atau I₂ bebas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: FARADAY CALCULATOR ADVISOR */}
          {activeTab === 'kalkulator' && (
            <motion.div
              key="kalkulator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section A: Faraday's 1st Law Advisor */}
                <div className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-teal-400" />
                      Kalkulator Hukum Faraday I
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Hitung massa endapan, kuat arus, atau durasi waktu elektrolisis berdasarkan rumus logis kuantitatif W = (e · i · t) / 96500.
                    </p>
                  </div>

                  {/* Calculator Objective select */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-xl">
                    <button
                      onClick={() => setCalcTarget('w')}
                      className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        calcTarget === 'w' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Massa (W)
                    </button>
                    <button
                      onClick={() => setCalcTarget('t')}
                      className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        calcTarget === 't' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Waktu (t)
                    </button>
                    <button
                      onClick={() => setCalcTarget('i')}
                      className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                        calcTarget === 'i' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Arus (i)
                    </button>
                  </div>

                  {/* Target Metal parameters preset list */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">Pilih Template Logam</label>
                        <select
                          value={calcMetal}
                          onChange={(e) => setCalcMetal(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-2 text-slate-100"
                        >
                          <option value="Cu">Kation Tembaga (Cu²⁺)</option>
                          <option value="Ag">Kation Perak (Ag⁺)</option>
                          <option value="Au">Kation Emas (Au³⁺)</option>
                          <option value="Zn">Kation Seng (Zn²⁺)</option>
                          <option value="Ni">Kation Nikel (Ni²⁺)</option>
                          <option value="Cr">Kation Kromium (Cr³⁺)</option>
                          <option value="Fe">Kation Besi (Fe²⁺)</option>
                          <option value="Al">Kation Aluminium (Al³⁺)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Ar Logam</label>
                          <input
                            type="number"
                            step="0.1"
                            value={calcAr}
                            onChange={(e) => setCalcAr(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-150 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400">Valensi (n)</label>
                          <input
                            type="number"
                            value={calcValency}
                            onChange={(e) => setCalcValency(parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-150 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic parameter fields depending on target */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      {calcTarget !== 'i' && (
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">Arus Listrik (Amper)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={calcCurrent}
                            onChange={(e) => setCalcCurrent(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                          />
                        </div>
                      )}
                      
                      {calcTarget !== 't' && (
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">Waktu / Durasi (Detik)</label>
                          <input
                            type="number"
                            value={calcTime}
                            onChange={(e) => setCalcTime(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                          />
                        </div>
                      )}

                      {calcTarget !== 'w' && (
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs text-slate-300">Massa Logam Terendap (W - Gram)</label>
                          <input
                            type="number"
                            step="0.001"
                            value={calcMassInput}
                            onChange={(e) => setCalcMassInput(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Solve Action */}
                    <button
                      onClick={handleCalculateFaradayI}
                      className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10 mt-2"
                    >
                      <Activity className="w-4 h-4" />
                      MEMULAI PERHITUNGAN FARADAY I
                    </button>
                  </div>

                  {/* Computation Results */}
                  {calcResult && (
                    <div className="mt-2 bg-slate-950/90 rounded-2xl p-4 border border-teal-500/20">
                      <div className="text-[11px] text-slate-400 tracking-wider">HASIL PERHITUNGAN:</div>
                      <div className="text-2xl font-extrabold text-teal-400 font-mono mt-1">
                        {calcResult}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-left">
                        <span className="text-[10px] text-slate-400 font-bold">ALGORITMA &amp; LANGKAH PENYELESAIAN:</span>
                        {calcSteps.map((step, idx) => (
                          <div key={idx} className="bg-slate-900 border border-slate-950 p-2.5 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section B: Faraday's 2nd Law (Serial Cell Connect) */}
                <div className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-400" />
                      Kalkulator Hukum Faraday II (Dua Sel Seri)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Sifat kelistrikan seri yang ideal membagikan kekuatan muatan Faraday yang sama. Teori menyatakan rasio massa sebanding dengan berat ekivalennya: W₁/W₂ = e₁/e₂.
                    </p>
                  </div>

                  {/* Cell Configurator Split Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Block Cell 1 */}
                    <div className="bg-slate-950/80 p-4 border border-indigo-950 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-indigo-400 block leading-none">SEL 1 (REFERENSI MASSA)</span>
                      
                      {/* Presets buttons */}
                      <div className="flex gap-1">
                        {['Ag', 'Cu', 'Zn'].map((sym) => (
                          <button
                            key={sym}
                            onClick={() => applyF2Preset(1, sym)}
                            className={`flex-1 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                              f2Cell1Metal === sym ? 'bg-indigo-600 font-bold text-white' : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>

                      {/* Manual entries */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Ar₁</label>
                          <input
                            type="number"
                            step="0.1"
                            value={f2Cell1Ar}
                            onChange={(e) => setF2Cell1Ar(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-white text-center font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Valensi₁</label>
                          <input
                            type="number"
                            value={f2Cell1Val}
                            onChange={(e) => setF2Cell1Val(parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-white text-center font-mono"
                          />
                        </div>
                      </div>

                      {/* Mass Reference */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300">W₁ (Massa Endapan 1)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            value={f2Cell1Mass}
                            onChange={(e) => setF2Cell1Mass(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg. px-2 py-1.5 text-xs text-white font-mono"
                          />
                          <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400">gram</span>
                        </div>
                      </div>
                    </div>

                    {/* Block Cell 2 */}
                    <div className="bg-slate-950/80 p-4 border border-rose-950 rounded-xl space-y-3">
                      <span className="text-[10px] font-bold text-rose-400 block leading-none">SEL 2 (TARGET YANG DICARI)</span>
                      
                      {/* Presets buttons */}
                      <div className="flex gap-1">
                        {['Cu', 'Ag', 'Zn', 'Cr'].map((sym) => (
                          <button
                            key={sym}
                            onClick={() => applyF2Preset(2, sym)}
                            className={`flex-1 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                              f2Cell2Metal === sym ? 'bg-rose-600 font-bold text-white' : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>

                      {/* Manual entries */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Ar₂</label>
                          <input
                            type="number"
                            step="0.1"
                            value={f2Cell2Ar}
                            onChange={(e) => setF2Cell2Ar(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-white text-center font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Valensi₂</label>
                          <input
                            type="number"
                            value={f2Cell2Val}
                            onChange={(e) => setF2Cell2Val(parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs text-white text-center font-mono"
                          />
                        </div>
                      </div>

                      {/* Calculated Mass 2 */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300">W₂ (Massa Terendap Sel 2)</label>
                        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-400 font-mono font-extrabold text-center">
                          {f2Cell2Result.toFixed(5)} gram
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Steps breakdown of Faraday II */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs font-mono space-y-1 text-left">
                    <span className="text-[10px] text-slate-400 font-bold">LOGIKA PENYELESAIAN SERI (SEL SEJALUR):</span>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      1. Berat ekivalen Sel 1 (e₁) = {f2Cell1Ar} / {f2Cell1Val} = {(f2Cell1Ar/f2Cell1Val).toFixed(3)}
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      2. Berat ekivalen Sel 2 (e₂) = {f2Cell2Ar} / {f2Cell2Val} = {(f2Cell2Ar/f2Cell2Val).toFixed(3)}
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      3. Substitusi kesebandingan: W₂ = W₁ * (e₂ / e₁)
                    </p>
                    <p className="text-emerald-400 font-bold leading-relaxed pt-2">
                      W₂ = {f2Cell1Mass} * ({(f2Cell2Ar/f2Cell2Val).toFixed(3)} / {(f2Cell1Ar/f2Cell1Val).toFixed(3)}) = {f2Cell2Result.toFixed(5)} gram
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: GUIDE THEORY AND CHEATSHEET */}
          {activeTab === 'teori' && (
            <motion.div
              key="teori"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Rules Dashboard Banner */}
              <div className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Regulasi Mutlak Reaksi Sel Elektrolisis
                </h3>
                <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                  Elektrolisis mengalirkan arus listrik eksternal untuk melangsungkan reaksi redoks non-spontan (potensial sel negatif). Kutub negatif adalah Katoda (Reduksi) dan kutub positif adalah Anoda (Oksidasi). Ikuti peta panduan ilmiah berikut:
                </p>

                {/* Beautiful split table guide */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Cathode Rule */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-blue-900/30">
                    <span className="bg-blue-600/10 text-blue-400 text-[10px] font-bold tracking-wider uppercase border border-blue-500/20 px-3 py-1 rounded-full">
                      REAKSI KATODA (KUTUB SENSITIF NEGATIF - REDUKSI)
                    </span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Reaksi reduksi katoda hanya bergantung pada keadaaan **KATION** penyusunnya saja (tidak dipengaruhi oleh jenis elektroda):
                    </p>
                    
                    <div className="mt-4 space-y-3.5 text-xs">
                      <div className="flex gap-2 text-left">
                        <span className="text-emerald-400 font-bold shrink-0">1.</span>
                        <div>
                          <span className="font-bold text-slate-100">Kation Golongan IA, IIA, Al, Mn (Larutan):</span>
                          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                            Potensial reduksi air lebih besar daripada ion logam tersebut, maka **air yang terreduksi**:
                            <code className="block bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-1.5 text-blue-300 font-mono">
                              2H₂O(l) + 2e⁻ → H₂(g) + 2OH⁻(aq)
                            </code>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-left">
                        <span className="text-emerald-400 font-bold shrink-0">2.</span>
                        <div>
                          <span className="font-bold text-slate-100">Kation Golongan Lain (Cu²⁺, Ag⁺, Zn²⁺, dll / Larutan):</span>
                          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                            Kation logam tersebut terreduksi langsung menjadi endapan padat logam di tubuh katoda:
                            <code className="block bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-1.5 text-blue-300 font-mono">
                              Mⁿ⁺(aq) + n e⁻ → M(s)
                            </code>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-left">
                        <span className="text-emerald-400 font-bold shrink-0">3.</span>
                        <div>
                          <span className="font-bold text-slate-100">Larutan Asam Lunak (H⁺):</span>
                          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                            Mengalami redufsi kation hidrogen melepaskan gas hidrogen murni:
                            <code className="block bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-1.5 text-blue-300 font-mono">
                              2H⁺(aq) + 2e⁻ → H₂(g)
                            </code>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-left">
                        <span className="text-emerald-400 font-bold shrink-0">4.</span>
                        <div>
                          <span className="font-bold text-slate-100">Fase Lelehan / Leburan (Liquid, Tanpa Air):</span>
                          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                            Tidak ada air bersaing, seluruh kation logam murni akan terreduksi langsung terlepas dari kedudukannya di Deret Volta:
                            <code className="block bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-1.5 text-blue-300 font-mono">
                              Mⁿ⁺(l) + n e⁻ → M(l/s)
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Anode Rule */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-red-900/30">
                    <span className="bg-red-600/10 text-red-400 text-[10px] font-bold tracking-wider uppercase border border-red-500/20 px-3 py-1 rounded-full">
                      REAKSI ANODA (KUTUB SENSITIF POSITIF - OKSIDASI)
                    </span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Reaksi oksidasi ditentukan oleh jenis **ELEKTRODA** (Aktif vs Inert) bersama dengan muatan **ANION** larutannya:
                    </p>

                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex gap-2 text-left">
                        <span className="text-amber-500 font-bold shrink-0">A.</span>
                        <div>
                          <span className="font-bold text-slate-100">Elektroda Aktif (Non-Inert, seperti Cu, Ag, Fe, Ni):</span>
                          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                            Logam anoda tersebut langsung teroksidasi dan hancur melarut perlahan membentuk kation:
                            <code className="block bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-1.5 text-red-350 font-mono">
                              M(s) → Mⁿ⁺(aq) + n e⁻
                            </code>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-left border-t border-slate-900 pt-3.5">
                        <span className="text-amber-500 font-bold shrink-0">B.</span>
                        <div>
                          <span className="font-bold text-slate-100">Elektroda Inert (Platina Pt, Aurum Au, Karbon C):</span>
                          <p className="text-slate-400 text-[11px] mt-1 mb-2">
                            Anoda diam tak bereaksi; yang teroksidasi adalah **Anion** atau **Pelarut Air**:
                          </p>
                          <ul className="space-y-2 pl-3.5 text-slate-400 text-[11px] list-disc list-outside leading-relaxed">
                            <li>
                              <strong className="text-slate-200">Sisa Asam Oksi (SO₄²⁻, NO₃⁻, CO₃²⁻):</strong> Air teroksidasi menghasilkan gas O₂ dan larutan asam H⁺.
                              <code className="block bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-1 text-red-350 font-mono">
                                2H₂O(l) → O₂(g) + 4H⁺(aq) + 4e⁻
                              </code>
                            </li>
                            <li>
                              <strong className="text-slate-200">Ion Halida (Cl⁻, Br⁻, I⁻):</strong> Teoksidasi menghasilkan uap unsur bebas halogen.
                              <code className="block bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-1 text-red-350 font-mono">
                                2X⁻(aq) → X₂(g/aq) + 2e⁻
                              </code>
                            </li>
                            <li>
                              <strong className="text-slate-200">Basa Sisa (OH⁻):</strong> Teroksidasi membebaskan air serta gas O₂.
                              <code className="block bg-slate-900 px-2 py-1 rounded border border-slate-800 mt-1 text-red-350 font-mono">
                                4OH⁻(aq) → O₂(g) + 2H₂O(l) + 4e⁻
                              </code>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* General formula guidelines card */}
              <div className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Hukum Kuantitatif Faraday I &amp; II
                </h4>
                <div className="text-xs text-slate-400 leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2">
                    <p className="font-bold text-slate-200">Hukum Faraday I:</p>
                    <p>
                      Massa zat yang dihasilkan pada elektroda selama elektrolisis (W) berbanding lurus dengan muatan listrik (Q) yang dialirkan.
                    </p>
                    <div className="bg-slate-950 p-3 rounded-lg font-mono text-emerald-400 text-sm border border-slate-850">
                      W = e · F = e · i · t / 96500
                    </div>
                    <ul className="list-disc pl-5 space-y-1 mt-2 text-[11px] text-slate-400">
                      <li>W = massa zat terendap (gram)</li>
                      <li>e = berat ekivalen logam (Ar / valensi)</li>
                      <li>i = kuat arus (Amper)</li>
                      <li>t = waktu elektrolisis (detik)</li>
                      <li>96.500 = tetapan Faraday (kuat muatan satu mol elektron)</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-200">Hukum Faraday II:</p>
                    <p>
                      Jika beberapa sel elektrolisis dialiri muatan arus yang sama dalam rangkaian seri, maka massa zat-zat yang mengendap pada masing-masing elektroda berbanding lurus dengan berat ekivalennya.
                    </p>
                    <div className="bg-slate-950 p-3 rounded-lg font-mono text-indigo-400 text-sm border border-slate-850">
                      W₁ / W₂ = e₁ / e₂
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Luar biasa berguna dalam asimilasi industri perakitan pelapis mobil galvanisasi untuk menghemat arus listrik catu daya dengan menghitung kesetaraan depositori.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: INTERACTIVE QUIZ ADVISOR */}
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto"
            >
              <AnimatePresence mode="wait">
                {!quizFinished ? (
                  <motion.div
                    key="quiz-active"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6"
                  >
                    {/* Header score / progress */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block">Uji Mandiri Elektrolisis</span>
                        <h3 className="text-base font-extrabold text-white">Soal {quizIndex + 1} dari {LOCAL_QUIZ_QUESTIONS.length}</h3>
                      </div>
                      <div className="bg-slate-950 border border-emerald-900 p-2 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 block leading-none font-mono">SKOR ANDA</span>
                        <span className="text-sm font-extrabold text-emerald-400 font-mono block mt-1">{quizScore} / {LOCAL_QUIZ_QUESTIONS.length}</span>
                      </div>
                    </div>

                    {/* Question block */}
                    <div className="text-white text-base sm:text-lg font-medium leading-relaxed">
                      {LOCAL_QUIZ_QUESTIONS[quizIndex].question}
                    </div>

                    {/* Answers Options Grid */}
                    <div className="grid grid-cols-1 gap-3">
                      {LOCAL_QUIZ_QUESTIONS[quizIndex].options.map((option, idx) => {
                        let btnStyle = 'bg-slate-950 hover:bg-slate-900/80 border-slate-850 hover:border-slate-750 text-slate-300';
                        
                        if (quizIsAnswered) {
                          if (idx === LOCAL_QUIZ_QUESTIONS[quizIndex].correctAnswer) {
                            btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-250 font-bold';
                          } else if (idx === quizSelectedOption) {
                            btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-250';
                          } else {
                            btnStyle = 'bg-slate-950 opacity-50 border-slate-900 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={quizIsAnswered}
                            onClick={() => handleQuizAnswer(idx)}
                            className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <span className="font-mono bg-slate-900 border border-slate-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-slate-400 shrink-0 font-bold mt-0.5">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-relaxed">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Response Explanations */}
                    {quizIsAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                          quizSelectedOption === LOCAL_QUIZ_QUESTIONS[quizIndex].correctAnswer
                            ? 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-300'
                            : 'bg-rose-950/30 border border-rose-500/10 text-rose-300'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-[11px] tracking-wider uppercase">
                          {quizSelectedOption === LOCAL_QUIZ_QUESTIONS[quizIndex].correctAnswer ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                              <span>JAWABAN BENAR!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-400" />
                              <span>JAWABAN KURANG TEPAT</span>
                            </>
                          )}
                        </div>
                        <p className="mt-1 font-sans text-xs sm:text-sm leading-relaxed text-slate-300">
                          {LOCAL_QUIZ_QUESTIONS[quizIndex].explanation}
                        </p>

                        <button
                          onClick={handleNextQuiz}
                          className="mt-4 w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5 ml-auto transition-colors"
                        >
                          <span>{quizIndex < LOCAL_QUIZ_QUESTIONS.length - 1 ? 'SOAL BERIKUTNYA' : 'LIHAT NILAI AKHIR'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="quiz-result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <Award className="w-8 h-8 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">Latihan Mandiri Selesai!</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                        Anda telah menyelesaikan seluruh modul kuis evaluasi pemahaman materi Sel Elektrolisis &amp; Hukum Faraday dengan baik.
                      </p>
                    </div>

                    {/* Score ring */}
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 inline-block px-10">
                      <span className="text-[10px] text-slate-500 block leading-none font-bold uppercase tracking-widest">NILAI AKHIR</span>
                      <span className="text-4xl font-extrabold text-teal-400 font-mono block mt-2">
                        {((quizScore / LOCAL_QUIZ_QUESTIONS.length) * 100).toFixed(0)} <span className="text-base text-slate-450">/ 100</span>
                      </span>
                      <span className="text-xs text-slate-400 block mt-2">
                        Menjawab benar {quizScore} dari {LOCAL_QUIZ_QUESTIONS.length} Soal
                      </span>
                    </div>

                    <div>
                      <button
                        onClick={handleRestartQuiz}
                        className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold px-8 py-3 rounded-xl text-xs hover:opacity-90 shadow-lg cursor-pointer transition-all inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        ULANGI LATIHAN KUIS
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
