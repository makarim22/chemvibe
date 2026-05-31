/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  BookOpen, 
  RotateCw, 
  CheckCircle,
  Award,
  ArrowRight,
  Eye,
  Activity,
  Zap,
  Info,
  ChevronRight,
  ShieldAlert,
  Droplet,
  Beaker,
  Sliders,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'siswa' | 'guru';
  classCode?: string;
  className?: string;
}

interface BufferHydrolysisLabProps {
  currentUser?: UserAccount | null;
}

// Model structures for buffer components
interface BufferSystem {
  id: string;
  name: string;
  type: 'asam' | 'basa';
  componentWeak: string; // e.g. "CH3COOH"
  componentConj: string; // e.g. "CH3COO-"
  ka_kb_text: string;    // e.g. "Ka = 1.8 x 10^-5"
  ka_kb_value: number;   // 1.8e-5
  defaultWeakConc: number; // in M
  defaultConjConc: number; // in M
  description: string;
  realWorldContext: string;
}

const BUFFER_SYSTEMS: BufferSystem[] = [
  {
    id: 'acetate',
    name: 'Penyangga Asetat (Asam Lemah + Basa Konjugasi)',
    type: 'asam',
    componentWeak: 'CH₃COOH (Asam Asetat)',
    componentConj: 'CH₃COO⁻ (Asetat dari CH₃COONa)',
    ka_kb_text: 'Kₐ = 1.8 × 10⁻⁵ (pKₐ = 4.74)',
    ka_kb_value: 1.8e-5,
    defaultWeakConc: 0.1,
    defaultConjConc: 0.1,
    description: 'Sistem penyangga asam klasik di laboratorium. Menjaga pH di area asam lemah (sekitar 4 - 6). Sangat ideal untuk mempelajari efek penambahan ion sejenis.',
    realWorldContext: 'Sering digunakan dalam industri makanan dan kosmetik untuk mengontrol keasaman agar produk stabil dan awet.'
  },
  {
    id: 'carbonate',
    name: 'Penyangga Karbonat (Sistem Penyangga Darah)',
    type: 'asam',
    componentWeak: 'H₂CO₃ (Asam Karbonat)',
    componentConj: 'HCO₃⁻ (Bikarbonat)',
    ka_kb_text: 'Kₐ = 4.3 × 10⁻⁷ (pKₐ = 6.37)',
    ka_kb_value: 4.3e-7,
    defaultWeakConc: 0.0024,
    defaultConjConc: 0.024,
    description: 'Sistem penyangga eksklusif yang mempertahankan pH darah manusia tetap konstan.',
    realWorldContext: 'Menjaga cairan ekstraseluler darah manusia pada pH fisiologis ketat 7.35 - 7.45. Jika pH turun di bawah 7.35 terjadi asidosis, jika di atas 7.45 terjadi alkalosis.'
  },
  {
    id: 'ammonia',
    name: 'Penyangga Amonia (Basa Lemah + Asam Konjugasi)',
    type: 'basa',
    componentWeak: 'NH₃ (Amonia)',
    componentConj: 'NH₄⁺ (Amonium dari NH₄Cl)',
    ka_kb_text: 'K_b = 1.8 × 10⁻⁵ (pK_b = 4.74)',
    ka_kb_value: 1.8e-5,
    defaultWeakConc: 0.1,
    defaultConjConc: 0.1,
    description: 'Sistem penyangga basa yang menjaga kestabilan pH di lingkungan alkalis (sekitar 8 - 10).',
    realWorldContext: 'Digunakan dalam larutan pencuci logam, analisis laboratorium kualitatif kation, dan bahan baku pupuk.'
  },
  {
    id: 'phosphate',
    name: 'Penyangga Fosfat (Sistem Cairan Intraseluler)',
    type: 'asam',
    componentWeak: 'H₂PO₄⁻ (Dihidrogen Fosfat)',
    componentConj: 'HPO₄²⁻ (Monohidrogen Fosfat)',
    ka_kb_text: 'Kₐ = 6.2 × 10⁻⁸ (pKₐ = 7.21)',
    ka_kb_value: 6.2e-8,
    defaultWeakConc: 0.05,
    defaultConjConc: 0.05,
    description: 'Berperan vital sebagai buffer di dalam sitoplasma sel tubuh makhluk hidup.',
    realWorldContext: 'Mempertahankan pH intraseluler tubuh sekitar 7.2 agar metabolisme seluler, kerja enzim ribosom, dan replikasi ADN berjalan optimal.'
  }
];

// Model structures for salt hydrolysis
interface HydrolysisSalt {
  id: string;
  name: string;
  formula: string;
  acidOrigin: string; // e.g. "CH3COOH (Lemah)"
  baseOrigin: string; // e.g. "NaOH (Kuat)"
  type: 'tidak' | 'parsial_basa' | 'parsial_asam' | 'total';
  phType: 'netral' | 'basa' | 'asam' | 'tergantung_ka_kb';
  constantText: string;
  ka_val?: number;
  kb_val?: number;
  defaultMolarity: number;
  reactionEquation: string;
  description: string;
}

const HYDROLYSIS_SALTS: HydrolysisSalt[] = [
  {
    id: 'nacl',
    name: 'Natrium Klorida (Garam Dapur)',
    formula: 'NaCl',
    acidOrigin: 'HCl (Asam Kuat)',
    baseOrigin: 'NaOH (Basa Kuat)',
    type: 'tidak',
    phType: 'netral',
    constantText: 'Tidak terhidrolisis karena kation Na⁺ dan anion Cl⁻ tidak bereaksi dengan air.',
    defaultMolarity: 0.1,
    reactionEquation: 'NaCl (aq) → Na⁺ (aq) + Cl⁻ (aq) [Tidak bereaksi dengan H₂O]',
    description: 'Kation dari basa kuat dan anion dari asam kuat memiliki afinitas hidrasi yang stabil dan tidak mampu memecah ikatan H-OH air, sehingga pH larutan murni netral (7.0).'
  },
  {
    id: 'ch3coona',
    name: 'Natrium Asetat',
    formula: 'CH₃COONa',
    acidOrigin: 'CH₃COOH (Asam Lemah, Kₐ = 1.8 × 10⁻⁵)',
    baseOrigin: 'NaOH (Basa Kuat)',
    type: 'parsial_basa',
    phType: 'basa',
    constantText: 'K_h = K_w / Kₐ',
    ka_val: 1.8e-5,
    defaultMolarity: 0.1,
    reactionEquation: 'CH₃COO⁻ (aq) + H₂O (l) ⇄ CH₃COOH (aq) + OH⁻ (aq)',
    description: 'Anion basa konjugasi CH₃COO⁻ yang relatif kuat menarik H⁺ dari air, melepaskan ion OH⁻ bebas yang meningkatkan kebasaan sistem (pH > 7.0).'
  },
  {
    id: 'nh4cl',
    name: 'Amonium Klorida',
    formula: 'NH₄Cl',
    acidOrigin: 'HCl (Asam Kuat)',
    baseOrigin: 'NH₃ (Basa Lemah, K_b = 1.8 × 10⁻⁵)',
    type: 'parsial_asam',
    phType: 'asam',
    constantText: 'K_h = K_w / K_b',
    kb_val: 1.8e-5,
    defaultMolarity: 0.1,
    reactionEquation: 'NH₄⁺ (aq) + H₂O (l) ⇄ NH₃ (aq) + H₃O⁺ (aq)',
    description: 'Kation asam konjugasi NH₄⁺ mendonorkan proton ke molekul air menghasilkan ion hidronium (H₃O⁺ / H⁺) bebas, berujung pada penurunan derajat keasaman (pH < 7.0).'
  },
  {
    id: 'ch3coonh4',
    name: 'Amonium Asetat',
    formula: 'CH₃COONH₄',
    acidOrigin: 'CH₃COOH (Lemah, Kₐ = 1.8 × 10⁻⁵)',
    baseOrigin: 'NH₃ (Lemah, K_b = 1.8 × 10⁻⁵)',
    type: 'total',
    phType: 'tergantung_ka_kb',
    constantText: 'K_h = K_w / (Kₐ × K_b)',
    ka_val: 1.8e-5,
    kb_val: 1.8e-5,
    defaultMolarity: 0.1,
    reactionEquation: 'CH₃COO⁻ + NH₄⁺ + H₂O ⇄ CH₃COOH + NH₃ + H⁺ + OH⁻ [Saling mengimbangi]',
    description: 'Kedua ion terhidrolisis bersama secara total. Karena pKₐ (4.74) = pK_b (4.74), kekuatan hidrolisis asam dan basa saling menyeimbangkan sempurna menghasilkan pH ideal mendekati netral (7.0).'
  },
  {
    id: 'nh4cn',
    name: 'Amonium Sianida',
    formula: 'NH₄CN',
    acidOrigin: 'HCN (Sangat Lemah, Kₐ = 6.2 × 10⁻¹⁰)',
    baseOrigin: 'NH₃ (Lemah, K_b = 1.8 × 10⁻⁵)',
    type: 'total',
    phType: 'tergantung_ka_kb',
    constantText: 'K_h = K_w / (Kₐ × K_b)',
    ka_val: 6.2e-10,
    kb_val: 1.8e-5,
    defaultMolarity: 0.1,
    reactionEquation: 'CN⁻ (aq) & NH₄⁺ (aq) terhidrolisis total. Dominasi basa karena K_b NH₃ (1.8e-5) > Kₐ HCN (6.2e-10).',
    description: 'Garam dari asam lemah dan basa lemah terhidrolisis penuh. Karena konstanta basa K_b jauh lebih besar dari Kₐ asam asal, larutan akhir didominasi sifat basa (pH sekitar 9.2).'
  }
];

export default function BufferHydrolysisLab({ currentUser }: BufferHydrolysisLabProps) {
  // Navigation active sub-tab
  const [activeSubView, setActiveSubView] = useState<'buffer' | 'hydrolysis' | 'quiz'>('buffer');

  // Common State: Beaker Liquid representation
  const [litmusTest, setLitmusTest] = useState<'none' | 'red' | 'blue'>('none');
  const [litmusResultHex, setLitmusResultHex] = useState<string>('#94a3b8'); // default slate-420 paper color
  const [isDipping, setIsDipping] = useState<boolean>(false);
  const [phProbeDipped, setPhProbeDipped] = useState<boolean>(true);

  // 1. --- BUFFER MODE STATES ---
  const [selectedBuffer, setSelectedBuffer] = useState<BufferSystem>(BUFFER_SYSTEMS[0]);
  const [weakConc, setWeakConc] = useState<number>(0.1); // Molalitas/Molaritas komponen lemah
  const [conjConc, setConjConc] = useState<number>(0.1); // Molaritas garam konjugasi
  const [bufferVolume, setBufferVolume] = useState<number>(500); // dalam mL
  const [addedAcidDrops, setAddedAcidDrops] = useState<number>(0); // tetes HCl (1 drop = 0.05 mmol)
  const [addedBaseDrops, setAddedBaseDrops] = useState<number>(0); // tetes NaOH (1 drop = 0.05 mmol)
  const [addedWaterMl, setAddedWaterMl] = useState<number>(0);    // mL air tambahan
  const [controlCompareMode, setControlCompareMode] = useState<boolean>(false); // bandingkan dengan air murni

  // 2. --- HYDROLYSIS MODE STATES ---
  const [selectedSalt, setSelectedSalt] = useState<HydrolysisSalt>(HYDROLYSIS_SALTS[1]); // default CH3COONa
  const [saltMolarity, setSaltMolarity] = useState<number>(0.1);

  // Calculate buffer pH
  const calculateBufferPH = () => {
    const weakType = selectedBuffer.type;
    const Ka_Kb = selectedBuffer.ka_kb_value;

    // Total volume in Liters
    const currentVolL = (bufferVolume + addedWaterMl) / 1000;
    
    // Initial millimoles
    let weakMmol = weakConc * bufferVolume;
    let conjMmol = conjConc * bufferVolume;

    // Added HCl (Strong Acid) adds H+ which converts conjugate base to weak acid
    // and decreases weak base in basic system.
    // 1 drop of 0.1 M HCl / NaOH is approx 0.05 mmol
    const mmolHCl = addedAcidDrops * 0.05;
    const mmolNaOH = addedBaseDrops * 0.05;

    if (weakType === 'asam') {
      // Acidic Buffer: HA / A-
      // Adding HCl: A- + H+ -> HA (conj base decreases, weak acid increases)
      weakMmol += mmolHCl;
      conjMmol -= mmolHCl;
      
      // Adding NaOH: HA + OH- -> A- + H2O (weak acid decreases, conj base increases)
      weakMmol -= mmolNaOH;
      conjMmol += mmolNaOH;
    } else {
      // Basic Buffer: B / BH+
      // Adding HCl: B + H+ -> BH+ (weak base decreases, conj acid increases)
      weakMmol -= mmolHCl;
      conjMmol += mmolHCl;

      // Adding NaOH: BH+ + OH- -> B + H2O (conj acid decreases, weak base increases)
      weakMmol += mmolNaOH;
      conjMmol -= mmolNaOH;
    }

    // Protection to avoid division by zero or negative millimoles
    if (weakMmol <= 0.001) weakMmol = 0.001;
    if (conjMmol <= 0.001) conjMmol = 0.001;

    let pH = 7.0;
    if (weakType === 'asam') {
      const H_plus = Ka_Kb * (weakMmol / conjMmol);
      pH = -Math.log10(H_plus);
    } else {
      // Basic buffer
      const OH_minus = Ka_Kb * (weakMmol / conjMmol);
      const pOH = -Math.log10(OH_minus);
      pH = 14 - pOH;
    }

    // Clamp pH value to realistic chemical boundaries
    if (pH < 0.1) pH = 0.1;
    if (pH > 13.9) pH = 13.9;

    return Number(pH.toFixed(2));
  };

  // Compare System (Pure Water of same initial pH)
  const calculateComparePH = () => {
    // Pure water initially at pH 7.0
    const currentVolL = (bufferVolume + addedWaterMl) / 1000;
    const mmolHCl = addedAcidDrops * 0.05;
    const mmolNaOH = addedBaseDrops * 0.05;

    const netHConc = (mmolHCl - mmolNaOH) / currentVolL / 1000; // in M

    if (netHConc > 1e-7) {
      return Number((-Math.log10(netHConc)).toFixed(2));
    } else if (netHConc < -1e-7) {
      const netOHConc = -netHConc;
      return Number((14 - (-Math.log10(netOHConc))).toFixed(2));
    }
    return 7.0;
  };

  // Calculate Salt Hydrolysis pH
  const calculateHydrolysisPH = () => {
    const Kw = 1e-14;
    const MKey = saltMolarity;

    if (selectedSalt.type === 'tidak') {
      return 7.0;
    }

    if (selectedSalt.type === 'parsial_basa') {
      const Ka = selectedSalt.ka_val || 1.8e-5;
      const Kh = Kw / Ka;
      // OH- = sqrt(Kh * M)
      const OH_minus = Math.sqrt(Kh * MKey);
      const pOH = -Math.log10(OH_minus);
      return Number((14 - pOH).toFixed(2));
    }

    if (selectedSalt.type === 'parsial_asam') {
      const Kb = selectedSalt.kb_val || 1.8e-5;
      const Kh = Kw / Kb;
      // H+ = sqrt(Kh * M)
      const H_plus = Math.sqrt(Kh * MKey);
      return Number((-Math.log10(H_plus)).toFixed(2));
    }

    if (selectedSalt.type === 'total') {
      const Ka = selectedSalt.ka_val || 1.8e-5;
      const Kb = selectedSalt.kb_val || 1.8e-5;
      // For total hydrolysis of weak acid & weak base:
      // H+ = sqrt(Kw * Ka / Kb)
      const H_plus = Math.sqrt((Kw * Ka) / Kb);
      return Number((-Math.log10(H_plus)).toFixed(2));
    }

    return 7.0;
  };

  // Determine current pH depending on view
  const getCurrentPH = () => {
    if (activeSubView === 'buffer') {
      return calculateBufferPH();
    } else if (activeSubView === 'hydrolysis') {
      return calculateHydrolysisPH();
    }
    return 7.0;
  };

  // Litmus color dynamics depending on current pH
  const dipLitmusPaper = (type: 'red' | 'blue') => {
    setLitmusTest(type);
    setIsDipping(true);
    
    // Animate dipping
    setTimeout(() => {
      const currentPh = getCurrentPH();
      if (type === 'red') {
        // Red litmus paper turns blue in alkaline/base (pH > 7.5)
        if (currentPh > 7.5) {
          setLitmusResultHex('#3b82f6'); // blue
        } else {
          setLitmusResultHex('#ef4444'); // stays red
        }
      } else {
        // Blue litmus paper turns red in acidic (pH < 6.5)
        if (currentPh < 6.5) {
          setLitmusResultHex('#ef4444'); // turns red
        } else {
          setLitmusResultHex('#3b82f6'); // stays blue
        }
      }
      setIsDipping(false);
    }, 1200);
  };

  // Helper color map for pH liquid in beaker
  const getLiquidColor = (pH: number) => {
    // Interpolate fluid color from red through green to violet
    if (pH < 3.5) return 'rgba(239, 68, 68, 0.4)'; // bright red
    if (pH < 5.5) return 'rgba(249, 115, 22, 0.4)'; // orange
    if (pH < 6.8) return 'rgba(234, 179, 8, 0.35)'; // yellow
    if (pH < 7.5) return 'rgba(34, 197, 94, 0.25)'; // pastel green
    if (pH < 8.8) return 'rgba(14, 165, 233, 0.35)'; // cyan/sky blue
    if (pH < 10.5) return 'rgba(59, 130, 246, 0.4)'; // intense blue
    return 'rgba(168, 85, 247, 0.45)'; // deep purple
  };

  // Reset actions
  const resetBufferSimulator = () => {
    setAddedAcidDrops(0);
    setAddedBaseDrops(0);
    setAddedWaterMl(0);
    setLitmusTest('none');
    setLitmusResultHex('#94a3b8');
  };

  // --- EMBEDDED EVALUATION MODULE & QUIZ ---
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const QUIZ_QUESTIONS = [
    {
      text: 'Manakah dari campuran senyawa larutan berikut yang paling tepat dan efisien untuk merumuskan sistem larutan penyangga (buffer) bersifat asam?',
      options: [
        'Senyawa asam klorida (HCl) yang dipasangkan dengan natrium klorida (NaCl)',
        'Campuran asam asetat (CH₃COOH) dengan natrium asetat (CH₃COONa)',
        'Natrium hidroksida (NaOH) dengan kalium silikat (K₂SiO₃)',
        'Amonium klorida (NH₄Cl) bercampur rata dengan gas amonia (NH₃)'
      ],
      correct: 1,
      exp: 'Sistem larutan penyangga asam terdiri dari campuran asam lemah (seperti CH₃COOH) dan basa konjugasinya yang bersumber dari garam logam kuatnya (seperti CH₃COONa). Pilihan keempat merupakan penyangga basa.'
    },
    {
      text: 'Apabila larutan penyangga asam ditambahkan sedikit larutan basa kuat (misal ditetesi sedikit NaOH), bagaimanakah cara sistem menstabilkan pH agar tidak naik drastis?',
      options: [
        'Ion Na⁺ dari NaOH bereaksi dengan air menghasilkan asam asetat tambahan',
        'Ion asetat (CH₃COO⁻) mengikat ion hidroksida (OH⁻) menjadi molekul sirkuler',
        'Ion hidroksida (OH⁻) dari basa kuat dinetralkan oleh komponen asam asetat (CH₃COOH) membentuk air dan ion asetat',
        'Komponen asam lemah langsung menguap ke udara atmosfer untuk menghindari kejenuhan gas'
      ],
      correct: 2,
      exp: 'Reaksi penyangga ketika ditambah sedikit basa kuat: CH₃COOH (aq) + OH⁻ (aq) ⇄ CH₃COO⁻ (aq) + H₂O (l). Asam asetat mendonorkan ion H⁺ untuk mengikat kelebihan hidroksida sehingga kuantitas [OH⁻] bebas stabil dan pH tidak bergeser ekstrem.'
    },
    {
      text: 'Garam amonium klorida (NH₄Cl) dilarutkan ke dalam segelas air. Spektra pH menunjukkan nilai di bawah 7.0 (asam). Reaksi hidrolisis kimia apakah yang memicu keasaman garam tersebut?',
      options: [
        'Cl⁻ (aq) + H₂O (l) ⇄ HCl (aq) + OH⁻ (aq)',
        'NH₄⁺ (aq) + H₂O (l) ⇄ NH₃ (aq) + H₃O⁺ (aq)',
        'Garam NH₄Cl menguap melepas ion gas hidrogen teraktifkan',
        'Cl⁻ mengikat atom oksigen bebas'
      ],
      correct: 1,
      exp: 'Amonium klorida terbentuk dari asam kuat (HCl) dan basa lemah (NH₃). Ion amonium (NH₄⁺) sebagai asam konjugat kuat akan mendonorkan H⁺ ke molekul air membentuk ion hidronium H₃O⁺ yang menaikkan tingkat keasaman (pH < 7.0).'
    },
    {
      text: 'Bagaimanakah rumusan kalkulasi teoritis untuk menyatakan konsentrasi ion hidroksida [OH⁻] pada larutan garam parsial basa hasil hidrolisis asal asam lemah, jika molaritas garam adalah M?',
      options: [
        '[OH⁻] = Kw · Ka / M',
        '[OH⁻] = √((Kb · M) / Kw)',
        '[OH⁻] = √((Kw / Ka) · M)',
        '[OH⁻] = Ka · Ca / Cg'
      ],
      correct: 2,
      exp: 'Hidrolisis garam parsial basa (dari asam lemah & basa kuat) melepas OH⁻ ke air dengan ketetapan Kh = Kw/Ka. Maka, rumus konsentrasi ion adalah [OH⁻] = √(Kh · M) = √((Kw / Ka) · M).'
    },
    {
      text: 'Sistem biologis dalam tubuh manusia mempertahankan kestabilan pH menggunakan berbagai mekanisme buffer. Sistem penyangga penyokong pH cairan ekstraseluler darah (sekitar 7.4) utama adalah...',
      options: [
        'H₂PO₄⁻ dan HPO₄²⁻ (Penyangga intrasel)',
        'H₂CO₃ dan HCO₃⁻ (Penyangga karbonat)',
        'Asam sitrat dan natrium sitrat obat mag',
        'Asam laktat murni sisa respirasi anaerob'
      ],
      correct: 1,
      exp: 'Sistem penyangga karbonat (H₂CO₃ / HCO₃⁻) adalah komponen penyangga kunci di dalam aliran darah manusia. Sistem ini sangat sensitif terhadap perubahan kadar gas CO₂ dari hasil pernapasan paru-paru.'
    }
  ];

  const handleOptionSelect = (optionIdx: number) => {
    if (showExplanation) return;
    setSelectedOption(optionIdx);
  };

  const submitQuestionAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === QUIZ_QUESTIONS[currentQuestionIndex].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const proceedToNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setShowExplanation(false);
    setIsQuizFinished(false);
    setQuizStarted(true);
  };

  const saveQuiz成果 = async () => {
    if (!currentUser) {
      alert("Silakan Masuk di menu Auth terlebih dahulu agar skor kuis virtual larutan penyangga ini terarsip.");
      return;
    }
    try {
      const actId = 'buffer_' + Date.now();
      const ref = doc(db, 'users', currentUser.id, 'activities', actId);
      
      await setDoc(ref, {
        id: actId,
        activityType: 'quiz_completed',
        title: 'Buffer & Hidrolisis Kelas XI',
        description: `Menyelesaikan kuis evaluasi Buffer & Hidrolisis Garam SMA XI dengan skor ${Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)}%`,
        timestamp: new Date().toISOString()
      }, { merge: true });

      alert("Laporan skor evaluasi hidrolisis-buffer berhasil dikirim ke database pendidik!");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.id}/activities`);
    }
  };

  return (
    <div className="space-y-6 pt-1 pb-10" id="plasma-buffer-lab-view">
      {/* Upper Title Panel Card */}
      <div className="rounded-2xl glass-panel p-6 border-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-medium">
            <Beaker className="w-3.5 h-3.5 text-cyan-400" />
            Laboratorium pH Digital &amp; Molekular
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Larutan Penyangga &amp; Hidrolisis Garam
          </h2>
          <p className="text-slate-450 text-xs max-w-2xl leading-relaxed">
            Kurikulum Nasional Kimia SMA Kelas XI. Simulasikan kesetimbangan disosiasi lemah, uji fasa penstabil pH buffer, saksikan peruraian kation-anion garam sisa asam-basa, dan kalkulasi pH eksak secara dinamis.
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveSubView('buffer');
              resetBufferSimulator();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'buffer' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Penyangga (Buffer)
          </button>
          <button
            onClick={() => {
              setActiveSubView('hydrolysis');
              resetBufferSimulator();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'hydrolysis' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Hidrolisis Garam
          </button>
          <button
            onClick={() => setActiveSubView('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'quiz' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Uji Kompetensi XI
          </button>
        </div>
      </div>

      {activeSubView !== 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Beaker & Measuring Panel (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border-slate-800/80 flex flex-col items-center justify-between relative min-h-[460px]">
              
              {/* Internal HUD headers */}
              <div className="w-full flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">VIR_METRIC_STAGE</span>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 font-mono block">DERAJAT KEASAMAN (pH)</span>
                  <div className="text-3xl font-black text-cyan-400 font-mono tracking-tight animate-pulse" id="digital-ph-meter">
                    pH {getCurrentPH().toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Dynamic Beaker Frame Visual */}
              <div className="relative w-64 h-64 flex items-end justify-center my-6">
                
                {/* Measuring scale markings on glass */}
                <div className="absolute right-4.5 bottom-8 font-mono text-[9px] text-slate-600 select-none flex flex-col gap-8 text-right pr-1">
                  <span>- 500 mL</span>
                  <span>- 400 mL</span>
                  <span>- 300 mL</span>
                  <span>- 200 mL</span>
                  <span>- 100 mL</span>
                </div>

                {/* pH Probe (Termometer-style pH stick) */}
                {phProbeDipped && (
                  <div className="absolute top-0 left-16 w-3 h-48 bg-gradient-to-b from-slate-700 via-slate-650 to-emerald-500 rounded-full border border-slate-900 shadow-lg z-20 flex flex-col items-center justify-end pb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                )}

                {/* Litmus Paper Assaying animation */}
                {litmusTest !== 'none' && (
                  <div 
                    className={`absolute left-28 w-4 h-32 rounded-t-sm transition-all duration-1000 z-30 shadow-md ${
                      isDipping ? 'bottom-8' : 'bottom-28'
                    }`}
                    style={{
                      backgroundColor: litmusResultHex,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <span className="text-[7.5px] font-black text-white mix-blend-overlay rotate-90 block mt-2 text-center select-none uppercase tracking-widest">
                      LAKMUS
                    </span>
                  </div>
                )}

                {/* Beaker outer outline glass */}
                <div className="absolute inset-x-4 bottom-0 top-4 border-x-4 border-b-6 border-slate-500/40 rounded-b-3xl rounded-t-sm z-10 flex items-end overflow-hidden">
                  
                  {/* Dynamic pH colored fluids with moving dynamic waves */}
                  <div 
                    className="w-full transition-all duration-750 ease-out relative"
                    style={{ 
                      height: `${Math.min(95, ((activeSubView === 'buffer' ? bufferVolume + addedWaterMl : 500) / 600) * 85)}%`,
                      backgroundColor: getLiquidColor(getCurrentPH())
                    }}
                  >
                    {/* Animated white tiny wave ripple crown */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20 animate-pulse" />

                    {/* Simulating floating bouncing chemical compound molecular tokens inside */}
                    <div className="absolute inset-0 pt-6 flex flex-wrap gap-2 items-center justify-center pointer-events-none opacity-45 px-4 overflow-hidden">
                      {activeSubView === 'buffer' ? (
                        <>
                          <span className="px-1 py-0.5 bg-slate-950/80 text-[7.5px] font-mono text-cyan-300 rounded border border-cyan-500/20">{selectedBuffer.componentWeak.split(' ')[0]}</span>
                          <span className="px-1 py-0.5 bg-slate-950/80 text-[7.5px] font-mono text-purple-300 rounded border border-purple-500/20">{selectedBuffer.componentConj.split(' ')[0]}</span>
                          <span className="px-1 py-0.5 bg-slate-950/80 text-[7.5px] font-mono text-emerald-400 rounded">H₂O</span>
                          <span className="px-1 py-0.5 bg-slate-950/80 text-[7.5px] font-mono text-red-400 rounded">H⁺</span>
                        </>
                      ) : (
                        <>
                          <span className="px-1 py-0.5 bg-slate-950/80 text-[7.5px] font-mono text-cyan-300 rounded border border-cyan-500/20">{selectedSalt.formula}</span>
                          <span className="px-1 py-0.5 bg-slate-950/80 text-[7.5px] font-mono text-yellow-300 rounded border border-yellow-500/20">H₂O</span>
                          <span className="px-1 py-0.5 bg-slate-950/80 text-[7.5px] font-mono text-purple-400 rounded">OH⁻</span>
                        </>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* In-app litmus action controls footer */}
              <div className="w-full border-t border-slate-900/60 pt-4 flex justify-between gap-3">
                <span className="text-[10px] text-slate-500 font-mono mt-2">DIP_PROBE_ASSAY:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => dipLitmusPaper('red')}
                    className="px-2.5 py-1.5 bg-rose-950/40 text-rose-400 hover:text-white border border-rose-900/40 text-[10.5px] font-bold rounded-lg cursor-pointer"
                  >
                    Celup Lakmus Merah
                  </button>
                  <button
                    onClick={() => dipLitmusPaper('blue')}
                    className="px-2.5 py-1.5 bg-sky-950/40 text-sky-400 hover:text-white border border-sky-900/40 text-[10.5px] font-bold rounded-lg cursor-pointer"
                  >
                    Celup Lakmus Biru
                  </button>
                  <button
                    onClick={() => {
                      setPhProbeDipped(!phProbeDipped);
                    }}
                    className={`px-2 py-1.5 text-[10px] uppercase font-mono rounded-lg border cursor-pointer ${
                      phProbeDipped ? 'bg-slate-900 text-emerald-400 border-slate-800' : 'bg-slate-950 text-slate-500 border-slate-900'
                    }`}
                  >
                    Stick Meter {phProbeDipped ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Calculation & Adjustment Panel (Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {activeSubView === 'buffer' ? (
              <div className="glass-panel rounded-2xl p-6 border-slate-800/80 space-y-6">
                
                {/* Penyangga Choice Selection Selector */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Sistem Larutan Penyangga</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {BUFFER_SYSTEMS.map(sys => (
                      <button
                        key={sys.id}
                        onClick={() => {
                          setSelectedBuffer(sys);
                          resetBufferSimulator();
                        }}
                        className={`p-2.5 rounded-xl border text-center text-[10.5px] font-semibold transition-all cursor-pointer ${
                          selectedBuffer.id === sys.id
                            ? 'bg-cyan-950/60 border-cyan-500 text-white shadow'
                            : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                        }`}
                      >
                        {sys.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub Description */}
                <div className="p-4 bg-slate-955 bg-slate-950/80 rounded-xl border border-slate-900 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-200">{selectedBuffer.name}</span>
                    <span className="font-mono text-cyan-400 font-bold">{selectedBuffer.ka_kb_text}</span>
                  </div>
                  <p className="text-slate-400 text-[11.5px] leading-relaxed pt-1">{selectedBuffer.description}</p>
                  <p className="text-[10.5px] text-cyan-400/80 italic font-medium pt-1.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    Medis / Tubuh: {selectedBuffer.realWorldContext}
                  </p>
                </div>

                {/* Dynamic sliders controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Slider Acid constituent conc */}
                  <div className="space-y-2 p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">[ {selectedBuffer.componentWeak.split(' ')[0]} ]</span>
                      <span className="font-mono font-black text-white">{weakConc.toFixed(3)} M</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.01" 
                      max="1.0" 
                      step="0.01" 
                      value={weakConc} 
                      onChange={(e) => {
                        setWeakConc(parseFloat(e.target.value));
                        setAddedAcidDrops(0);
                        setAddedBaseDrops(0);
                      }}
                      className="w-full accent-cyan-500 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-500">
                      <span>0.01 M</span>
                      <span>Konsentrasi Komponen Lemah</span>
                      <span>1.00 M</span>
                    </div>
                  </div>

                  {/* Slider Salt constituent conc */}
                  <div className="space-y-2 p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">[ {selectedBuffer.componentConj.split(' ')[0]} ]</span>
                      <span className="font-mono font-black text-white">{conjConc.toFixed(3)} M</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.01" 
                      max="1.0" 
                      step="0.01" 
                      value={conjConc} 
                      onChange={(e) => {
                        setConjConc(parseFloat(e.target.value));
                        setAddedAcidDrops(0);
                        setAddedBaseDrops(0);
                      }}
                      className="w-full accent-cyan-500 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-500">
                      <span>0.01 M</span>
                      <span>Konsentrasi Komponen Konjugasi (Garam)</span>
                      <span>1.00 M</span>
                    </div>
                  </div>

                </div>

                {/* Adding dynamic drop of strong acids / strong base to test buffer strength */}
                <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-xl">
                    <span className="text-xs font-black text-white">INTERVENSI KIMIA: TES TAHAN ASAM &amp; BASA</span>
                    <button 
                      onClick={resetBufferSimulator}
                      className="text-[10px] text-cyan-400 hover:text-white flex items-center gap-1 font-mono font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Buffer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Add HCl drop */}
                    <button
                      onClick={() => {
                        setAddedAcidDrops(prev => prev + 1);
                      }}
                      className="p-3 bg-rose-550 bg-rose-950/30 hover:bg-rose-900/20 border border-rose-900/40 text-[11px] rounded-xl text-left cursor-pointer transition-all duration-150"
                    >
                      <div className="flex justify-between items-center text-rose-400 font-bold mb-1">
                        <span>+ 1 Tetes Asam Kuat</span>
                        <span className="text-[10px] font-mono">HCl 0.1 M</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500">Telah ditambahkan: <span className="text-white font-bold font-mono">{addedAcidDrops} tetes</span></p>
                    </button>

                    {/* Add NaOH drop */}
                    <button
                      onClick={() => {
                        setAddedBaseDrops(prev => prev + 1);
                      }}
                      className="p-3 bg-violet-550 bg-violet-950/30 hover:bg-violet-900/20 border border-violet-900/40 text-[11px] rounded-xl text-left cursor-pointer transition-all duration-150"
                    >
                      <div className="flex justify-between items-center text-violet-400 font-bold mb-1">
                        <span>+ 1 Tetes Basa Kuat</span>
                        <span className="text-[10px] font-mono">NaOH 0.1 M</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500">Telah ditambahkan: <span className="text-white font-bold font-mono">{addedBaseDrops} tetes</span></p>
                    </button>

                    {/* Dilution Ml range input */}
                    <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl flex flex-col justify-between">
                      <span className="text-[10.5px] text-slate-400 block mb-1">Pengenceran Akuades (H₂O)</span>
                      <div className="flex justify-between text-xs font-mono text-white">
                        <span>{addedWaterMl} mL</span>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          step="50"
                          value={addedWaterMl}
                          onChange={(e) => setAddedWaterMl(parseInt(e.target.value))}
                          className="w-24 accent-sky-500 cursor-pointer"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Buffer Action results show contrast compared to normal unbuffered liquid */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-cyan-900/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Hasil pH Buffer Kerja:</span>
                      <p className="text-lg font-black text-cyan-400 font-mono">pH {calculateBufferPH()}</p>
                      <p className="text-[10.5px] text-slate-400 leading-normal pt-1">
                        Sebab Henderson-Hasselbalch: {selectedBuffer.type === 'asam' 
                          ? 'Mio ion asetat menahan ion H⁺ dari eksternal.' 
                          : 'Sistem molekul amonia menangkap proton bebas.'
                        }
                      </p>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l border-slate-900 pt-3 md:pt-0 md:pl-4 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Tanpa Penyangga (Air Murni):</span>
                        <input 
                          type="checkbox" 
                          id="compare-chk" 
                          checked={controlCompareMode} 
                          onChange={() => setControlCompareMode(!controlCompareMode)} 
                          className="w-3.5 h-3.5 accent-cyan-500 cursor-pointer"
                        />
                      </div>
                      
                      {controlCompareMode ? (
                        <>
                          <p className="text-lg font-black text-rose-500 font-mono">pH {calculateComparePH()}</p>
                          <p className="text-[9.5px] text-rose-400 animate-pulse">
                            ⚠️ Pergeseran Ekstrem! Air murni pecah keasaman karena ketiadaan ion penahan.
                          </p>
                        </>
                      ) : (
                        <label htmlFor="compare-chk" className="text-[10.5px] text-slate-500 cursor-pointer italic hover:text-slate-400">
                          Centang untuk membandingkan pergeseran pH dengan air biasa.
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Interactive Henderson-Hasselbalch calculation equation text */}
                  <div className="p-3 bg-slate-900/50 rounded-xl font-mono text-xs text-slate-300">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold text-emerald-400 mb-1">Persamaan Henderson-Hasselbalch MIPA:</span>
                    {selectedBuffer.type === 'asam' ? (
                      <p className="leading-relaxed text-slate-400">
                        pH = pKₐ - log(&alpha;_weak / &alpha;_conj) = {(-Math.log10(selectedBuffer.ka_kb_value)).toFixed(2)} - log({(weakConc * bufferVolume + addedAcidDrops*0.05 - addedBaseDrops*0.05).toFixed(2)} / {(conjConc * bufferVolume - addedAcidDrops*0.05 + addedBaseDrops*0.05).toFixed(2)})
                      </p>
                    ) : (
                      <p className="leading-relaxed text-slate-400">
                        pOH = pK_b - log(&alpha;_weak / &alpha;_conj) = {(-Math.log10(selectedBuffer.ka_kb_value)).toFixed(2)} - log({(weakConc * bufferVolume - addedAcidDrops*0.05 + addedBaseDrops*0.05).toFixed(2)} / {(conjConc * bufferVolume + addedAcidDrops*0.05 - addedBaseDrops*0.05).toFixed(2)}) 
                        <br />
                        pH = 14 - pOH
                      </p>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              /* 2. --- HYDROLYSIS SALTS MODE PANEL --- */
              <div className="glass-panel rounded-2xl p-6 border-slate-800/80 space-y-6">
                
                {/* Salts Selection Row Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Adisi Garam Pembentuk</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {HYDROLYSIS_SALTS.map(salt => (
                      <button
                        key={salt.id}
                        onClick={() => {
                          setSelectedSalt(salt);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                          selectedSalt.id === salt.id
                            ? 'bg-cyan-950/60 border-cyan-500 text-white shadow'
                            : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                        }`}
                      >
                        <span className="block font-sans font-bold">{salt.formula}</span>
                        <span className="text-[8px] opacity-70 block font-normal">{salt.name.split(' (')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Salt Origins & Chemistry Breakdown */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-cyan-400 block">Silsilah Asal Pereaksi</span>
                      <h4 className="text-base font-bold text-white">{selectedSalt.name} ({selectedSalt.formula})</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded bg-slate-900 text-xs font-bold font-mono ${
                      selectedSalt.type === 'tidak' 
                        ? 'text-slate-400 border border-slate-800' 
                        : selectedSalt.type === 'total' 
                          ? 'text-yellow-400 border border-yellow-700/20' 
                          : 'text-emerald-400 border border-emerald-999 border-emerald-800/30'
                    }`}>
                      {selectedSalt.type === 'tidak' && 'Tidak Terhidrolisis'}
                      {selectedSalt.type === 'parsial_basa' && 'Hidrolisis Parsial (Basa)'}
                      {selectedSalt.type === 'parsial_asam' && 'Hidrolisis Parsial (Asam)'}
                      {selectedSalt.type === 'total' && 'Hidrolisis Total'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-900/60 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Asal Logam Asam:</span>
                      <p className="font-semibold text-white">{selectedSalt.acidOrigin}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Asal Kation Basa:</span>
                      <p className="font-semibold text-white">{selectedSalt.baseOrigin}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Sifat Akhir Garam:</span>
                      <p className="font-semibold text-cyan-400 uppercase tracking-widest">{selectedSalt.phType}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Konstanta Kh:</span>
                      <p className="font-mono font-bold text-yellow-400">{selectedSalt.constantText}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 text-[11.5px] font-mono text-slate-300 rounded-lg space-y-1">
                    <span className="text-[8px] text-emerald-400 block uppercase font-bold">Persamaan Hidrolisis Reaktif:</span>
                    <p>{selectedSalt.reactionEquation}</p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{selectedSalt.description}</p>
                </div>

                {/* Salt Molarity range adjust slide */}
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Molaritas Garam Terlarut (M) :</span>
                    <span className="font-mono text-white font-black text-sm">{saltMolarity.toFixed(3)} M</span>
                  </div>

                  <input
                    type="range"
                    min="0.001"
                    max="1.0"
                    step="0.005"
                    value={saltMolarity}
                    onChange={(e) => setSaltMolarity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />

                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>0.001 M</span>
                    <span>Tingkat kejenuhan garam murni ideal dalam bejana klorida</span>
                    <span>1.000 M</span>
                  </div>
                </div>

                {/* Mathematical Theory calculations breakdown */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-500">Formulasi Matematika Hidrolisis Kelas XI</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 bg-slate-900/50 rounded-lg space-y-1">
                      <span className="text-[8.5px] text-slate-400 uppercase block">Kalkulasi Mandiri [H⁺] / [OH⁻]:</span>
                      {selectedSalt.type === 'tidak' && (
                        <p className="text-slate-500">Tidak ada reaksi kesetimbangan hidrolisis gas.</p>
                      )}
                      {selectedSalt.type === 'parsial_basa' && (
                        <p className="text-emerald-400">
                          [OH⁻] = √((Kw/Ka) · M) = √((10⁻¹⁴ / 1.8·10⁻⁵) · {saltMolarity.toFixed(3)})
                        </p>
                      )}
                      {selectedSalt.type === 'parsial_asam' && (
                        <p className="text-rose-400">
                          [H⁺] = √((Kw/Kb) · M) = √((10⁻¹⁴ / 1.8·10⁻⁵) · {saltMolarity.toFixed(3)})
                        </p>
                      )}
                      {selectedSalt.type === 'total' && (
                        <p className="text-yellow-400">
                          [H⁺] = √(Kw · Ka / Kb) = √((10⁻¹⁴ · 1.8·10⁻⁵) / 1.8·10⁻⁵)
                        </p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg space-y-1">
                      <span className="text-[8.5px] text-slate-400 uppercase block">Nilai pH Output Eksak:</span>
                      <p className="text-lg font-black text-cyan-400">pH {calculateHydrolysisPH()}</p>
                      <p className="text-[9.5px] text-slate-500 italic">Disosiasi murni diredam buffer air.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. --- EMBEDDED EVALUATION PRACTICE & QUIZ SYSTEM --- */}
      {activeSubView === 'quiz' && (
        <div className="glass-panel rounded-2xl p-6 border-slate-800 animate-slide-in max-w-4xl mx-auto space-y-6">
          {!quizStarted && !isQuizFinished ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">Latihan &amp; Uji Pemahaman Buffer - Hidrolisis</h3>
              <p className="text-slate-400 text-xs max-w-xl mx-auto leading-relaxed">
                Asah keterampilan akademis kimia garam dan penyangga Anda melalui 5 butir soal evaluasi interaktif standar Ujian Nasional / UTBK SBMPTN Kelas XI. Laporan hasil Anda dapat diserahkan ke guru.
              </p>
              <button
                onClick={() => setQuizStarted(true)}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Mulai Kuis Sekarang
              </button>
            </div>
          ) : isQuizFinished ? (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto rounded-full flex items-center justify-center animate-bounce">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">Evaluasi Virtual Selesai!</h4>
                <p className="text-slate-450 text-xs">Terima kasih telah membuktikan wawasan stoikiometri asam-basa.</p>
              </div>

              {/* Score Display Card */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 max-w-xs mx-auto space-y-1.5">
                <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider block">SKOR PERSENTASE</span>
                <p className="text-5xl font-black text-white font-mono">{Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)} %</p>
                <p className="text-xs text-emerald-400 font-semibold">{quizScore} Benar / {QUIZ_QUESTIONS.length} Soal</p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={restartQuiz}
                  className="px-4 py-2 border border-slate-800 hover:text-white text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Ulangi Kuis
                </button>
                <button
                  onClick={saveQuiz成果}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Kirim Nilai ke Guru (Database)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quiz Header Progress */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                <span className="text-xs font-mono text-slate-500">Soal {currentQuestionIndex + 1} dari {QUIZ_QUESTIONS.length}</span>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/35 px-2.5 py-0.5 rounded-full">
                  Benar: {quizScore}
                </span>
              </div>

              {/* Question text block */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white font-sans leading-snug">
                  {QUIZ_QUESTIONS[currentQuestionIndex].text}
                </h4>

                {/* Option item list buttons */}
                <div className="space-y-2">
                  {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => {
                    let btnStyle = 'border-slate-900 bg-slate-950 hover:border-slate-850 hover:bg-slate-900/20';
                    if (selectedOption === idx) {
                      btnStyle = 'border-cyan-600 bg-cyan-950/30 text-white';
                    }
                    if (showExplanation) {
                      if (idx === QUIZ_QUESTIONS[currentQuestionIndex].correct) {
                        btnStyle = 'border-emerald-600 bg-emerald-950/20 text-emerald-400';
                      } else if (selectedOption === idx) {
                        btnStyle = 'border-rose-600 bg-rose-950/20 text-rose-400';
                      } else {
                        btnStyle = 'border-slate-900 bg-slate-950 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showExplanation}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium cursor-pointer transition-all flex items-start gap-3 disabled:cursor-not-allowed ${btnStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-[10.5px] font-mono flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next step button row */}
              <div className="flex justify-end pt-4 border-t border-slate-900">
                {!showExplanation ? (
                  <button
                    onClick={submitQuestionAnswer}
                    disabled={selectedOption === null}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs disabled:opacity-40 cursor-pointer"
                  >
                    Kirim Jawaban
                  </button>
                ) : (
                  <button
                    onClick={proceedToNextQuestion}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Lanjutkan Soal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Exp detailed panel when showed */}
              {showExplanation && (
                <div className="p-4 bg-slate-950 border border-emerald-900/30 rounded-xl space-y-2 animate-fade-in text-xs leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[9px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Pembahasan Teori Eksak:
                  </div>
                  <p className="text-slate-300 font-sans">{QUIZ_QUESTIONS[currentQuestionIndex].exp}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
