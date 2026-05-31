/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Settings, 
  HelpCircle, 
  Award, 
  Info, 
  Sparkles, 
  CheckCircle, 
  ChevronRight, 
  Zap, 
  Gauge, 
  Search, 
  AlertTriangle, 
  RotateCcw,
  Sliders,
  Filter,
  TrendingUp,
  Compass,
  Layers,
  ShieldCheck,
  Check,
  X,
  Droplet,
  Beaker,
  TestTube,
  Activity,
  ArrowRight,
  BookOpen,
  Wine,
  Hammer,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';

interface AcidBaseIntroLabProps {
  currentUser: UserAccount | null;
  theme?: 'dark' | 'light';
}

// ==========================================
// DATA STRUCTURES
// ==========================================

// Natural Indicators list
interface NaturalIndicator {
  id: string;
  name: string;
  source: string;
  latinName: string;
  pigment: string;
  extractColor: string; // Tailwind representation of initial extract color
  extractColorHex: string; // Specific color styling
  acidDescription: string;
  baseDescription: string;
  bgColor: string;
  pHColors: {
    pH1_2: { bg: string; text: string; hex: string; label: string };
    pH3_4: { bg: string; text: string; hex: string; label: string };
    pH5_6: { bg: string; text: string; hex: string; label: string };
    pH7_8: { bg: string; text: string; hex: string; label: string };
    pH9_10: { bg: string; text: string; hex: string; label: string };
    pH11_12: { bg: string; text: string; hex: string; label: string };
    pH13_14: { bg: string; text: string; hex: string; label: string };
  };
}

const NATURAL_INDICATORS: NaturalIndicator[] = [
  {
    id: 'kol-ungu',
    name: 'Kol Ungu',
    source: 'Daun Brassica oleracea L.',
    latinName: 'Brassica oleracea var. capitata f. rubra',
    pigment: 'Antosianin (Anthocyanin)',
    extractColor: 'bg-indigo-700/60 border-indigo-500/50',
    extractColorHex: '#6366f1',
    acidDescription: 'Berwarna merah cerah hingga merah muda karena perubahan struktur kation flavilium dalam suasana asam kuat (pH < 3).',
    baseDescription: 'Berwarna hijau hingga kuning akibat pembentukan kalkon dan deprotonasi penuh antosianin dalam suasana basa kuat (pH > 11).',
    bgColor: 'from-purple-950/20 via-indigo-950/10 to-transparent',
    pHColors: {
      pH1_2: { bg: 'bg-red-600', text: 'text-red-400', hex: '#dc2626', label: 'Merah Terang' },
      pH3_4: { bg: 'bg-pink-500', text: 'text-pink-400', hex: '#ec4899', label: 'Pink Merah Muda' },
      pH5_6: { bg: 'bg-purple-500', text: 'text-purple-400', hex: '#a855f7', label: 'Ungu Violet' },
      pH7_8: { bg: 'bg-indigo-600', text: 'text-indigo-400', hex: '#4f46e5', label: 'Biru Keunguan' },
      pH9_10: { bg: 'bg-teal-500', text: 'text-teal-400', hex: '#14b8a6', label: 'Hijau Toska' },
      pH11_12: { bg: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981', label: 'Hijau Daun' },
      pH13_14: { bg: 'bg-yellow-400', text: 'text-yellow-405', hex: '#facc15', label: 'Kuning Pekat' }
    }
  },
  {
    id: 'kunyit',
    name: 'Kunyit',
    source: 'Rimpang Curcuma longa',
    latinName: 'Curcuma longa L.',
    pigment: 'Kurkumin (Curcumin)',
    extractColor: 'bg-amber-505 border-amber-500/40',
    extractColorHex: '#f59e0b',
    acidDescription: 'Tetap berwarna kuning cerah atau jingga keemasan karena senyawa kurkumin dalam kondisi asam/netral stabil dalam bentuk keto (pH 1-7).',
    baseDescription: 'Berwarna merah bata cokelat tua karena gugus enol kurkumin mengalami deprotonasi berantai dalam suasana basa kuat (pH > 8.5).',
    bgColor: 'from-amber-950/20 via-yellow-950/10 to-transparent',
    pHColors: {
      pH1_2: { bg: 'bg-yellow-400', text: 'text-yellow-400', hex: '#eab308', label: 'Kuning Cerah' },
      pH3_4: { bg: 'bg-amber-400', text: 'text-amber-400', hex: '#fbbf24', label: 'Kuning Kunyit' },
      pH5_6: { bg: 'bg-amber-500', text: 'text-amber-550', hex: '#f59e0b', label: 'Jingga Muda' },
      pH7_8: { bg: 'bg-amber-600', text: 'text-amber-600', hex: '#d97706', label: 'Jingga Jingga' },
      pH9_10: { bg: 'bg-orange-700', text: 'text-orange-500', hex: '#c2410c', label: 'Cokelat Jingga' },
      pH11_12: { bg: 'bg-red-800', text: 'text-red-400', hex: '#991b1b', label: 'Merah Bata' },
      pH13_14: { bg: 'bg-amber-900', text: 'text-amber-955', hex: '#78350f', label: 'Cokelat Gelap' }
    }
  },
  {
    id: 'kembang-sepatu',
    name: 'Kembang Sepatu',
    source: 'Mahkota Bunga Hibiscus',
    latinName: 'Hibiscus rosa-sinensis L.',
    pigment: 'Antosianidin (Cyanidin glucosides)',
    extractColor: 'bg-rose-700/60 border-rose-500/50',
    extractColorHex: '#f43f5e',
    acidDescription: 'Berwarna merah jingga cerah (kation flavilium kaya muatan positif pada cincin benzopiran).',
    baseDescription: 'Berwarna hijau kecokelatan hingga kuning pudar akibat pembentukan basa kinonoid anhidrat yang tidak stabil.',
    bgColor: 'from-rose-950/20 via-pink-950/10 to-transparent',
    pHColors: {
      pH1_2: { bg: 'bg-rose-600', text: 'text-rose-400', hex: '#e11d48', label: 'Merah Crimson' },
      pH3_4: { bg: 'bg-rose-505', text: 'text-rose-405', hex: '#f43f5e', label: 'Merah Pink' },
      pH5_6: { bg: 'bg-pink-600', text: 'text-pink-500', hex: '#db2777', label: 'Merah Jambu' },
      pH7_8: { bg: 'bg-purple-800', text: 'text-purple-400', hex: '#6b21a8', label: 'Ungu Lembut' },
      pH9_10: { bg: 'bg-emerald-650', text: 'text-emerald-450', hex: '#047857', label: 'Hijau Tua' },
      pH11_12: { bg: 'bg-emerald-800', text: 'text-emerald-555', hex: '#065f46', label: 'Hijau Botol' },
      pH13_14: { bg: 'bg-amber-700', text: 'text-amber-500', hex: '#b45309', label: 'Hijau Kekuningan' }
    }
  },
  {
    id: 'bayam-merah',
    name: 'Bayam Merah',
    source: 'Daun Amaranthus tricolor',
    latinName: 'Amaranthus tricolor L.',
    pigment: 'Betasianin (Betacyanin)',
    extractColor: 'bg-pink-700/60 border-pink-500/50',
    extractColorHex: '#db2777',
    acidDescription: 'Menghasilkan warna pink menyala yang sangat stabil pada kisaran asam ekstrem (pH 1-5).',
    baseDescription: 'Berwarna kuning kehijauan pudar karena degradasi gugus betanin dalam basa kuat terionisasi.',
    bgColor: 'from-pink-950/20 via-rose-950/10 to-transparent',
    pHColors: {
      pH1_2: { bg: 'bg-pink-605', text: 'text-pink-400', hex: '#db2777', label: 'Merah Fuchsia' },
      pH3_4: { bg: 'bg-pink-500', text: 'text-pink-400', hex: '#ec4899', label: 'Pink Neon' },
      pH5_6: { bg: 'bg-rose-400', text: 'text-rose-400', hex: '#f43f5e', label: 'Pink Soft' },
      pH7_8: { bg: 'bg-amber-100/30 text-zinc-300', text: 'text-zinc-200', hex: '#4b5563', label: 'Merah Muda Pudar' },
      pH9_10: { bg: 'bg-yellow-600/30 text-yellow-300', text: 'text-yellow-600', hex: '#ca8a04', label: 'Kuning Keruh' },
      pH11_12: { bg: 'bg-yellow-500', text: 'text-yellow-450', hex: '#eab308', label: 'Kuning Kehijauan' },
      pH13_14: { bg: 'bg-lime-600', text: 'text-lime-400', hex: '#65a30d', label: 'Hijau Kekuningan' }
    }
  }
];

// Household Solutions for Testing
interface HouseholdSolution {
  id: string;
  name: string;
  actualPH: number;
  type: 'Asam Kuat' | 'Asam Lemah' | 'Netral' | 'Basa Lemah' | 'Basa Kuat';
  description: string;
  chemicalFormula: string;
}

const HOUSEHOLD_SOLUTIONS: HouseholdSolution[] = [
  { id: 'aki', name: 'Air Aki Mobil', actualPH: 1.0, type: 'Asam Kuat', description: 'Larutan elektrolit asam sulfat encer yang sangat korosif bagi logam dan kulit.', chemicalFormula: 'H₂SO₄' },
  { id: 'jeruk', name: 'Air Perasan Jeruk', actualPH: 3.0, type: 'Asam Lemah', description: 'Mengandung asam sitrat alami pengikat vitamin C, berbau segar dan berasa masam.', chemicalFormula: 'C₆H₈O₇' },
  { id: 'cuka', name: 'Cuka Makan', actualPH: 5.0, type: 'Asam Lemah', description: 'Asam asetat encer (sekitar 3-5% volume) yang biasa digunakan sebagai penyedap bakso.', chemicalFormula: 'CH₃COOH' },
  { id: 'murni', name: 'Air Suling Murni', actualPH: 7.0, type: 'Netral', description: 'Air bebas mineral hasil destilasi bertingkat, memiliki konsentrasi H⁺ dan OH⁻ yang setara.', chemicalFormula: 'H₂O' },
  { id: 'sabun', name: 'Air Sabun Mandi', actualPH: 9.0, type: 'Basa Lemah', description: 'Bahan pembersih bertekstur licin hasil reaksi safonifikasi lemak sawit alami.', chemicalFormula: 'R-COONa' },
  { id: 'mag', name: 'Obat Sakit Mag', actualPH: 11.0, type: 'Basa Lemah', description: 'Mengandung suspensi logam hidroksida penyerap kelebihan asam hidroklorida lambung.', chemicalFormula: 'Mg(OH)₂ / Al(OH)₃' },
  { id: 'deterjen', name: 'Larutan Deterjen', actualPH: 13.0, type: 'Basa Kuat', description: 'Mengandung zat aditif surfaktan alkilbenzena sulfonat berdaya bersih tinggi berkarakter alkalis pekat.', chemicalFormula: 'Na-LAS' }
];

// Quiz list
const ACID_BASE_QUIZ = [
  {
    id: 1,
    question: 'Berdasarkan teori asam-basa Brønsted-Lowry, pada reaksi kesetimbangan: NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq), manakah yang bertindak sebagai pasangan asam-basa konjugasi?',
    options: [
      { text: 'A. H₂O sebagai basa dan NH₄⁺ sebagai asam konjugasinya', correct: false },
      { text: 'B. H₂O sebagai asam dan OH⁻ sebagai basa konjugasinya', correct: true },
      { text: 'C. NH₃ sebagai asam konjugasi dan H₂O sebagai basa', correct: false },
      { text: 'D. NH₄⁺ sebagai basa dan OH⁻ sebagai asam konjugasi', correct: false }
    ],
    feedback: 'Tepat sekali! Asam mendonasikan proton (H⁺) menjadi basa konjugasinya. H₂O melepaskan satu proton menjadi OH⁻, sehingga H₂O (asam) dan OH⁻ kelompok basa konjugasinya.'
  },
  {
    id: 2,
    question: 'Ekstrak kunyit alami memberikan perubahan warna yang mencolok pada kondisi ekstrem. Perubahan warna yang terjadi pada kunyit saat diteteskan ke air sabun atau larutan deterjen yang bersifat alkalis/basa adalah...',
    options: [
      { text: 'A. Tetap berwarna kuning cerah cemerlang', correct: false },
      { text: 'B. Berubah warna menjadi merah bata / cokelat kemerahan', correct: true },
      { text: 'C. Berubah warna menjadi hijau lumut pekat', correct: false },
      { text: 'D. Memudar menjadi bening tidak berwarna', correct: false }
    ],
    feedback: 'Benar! Senyawa kurkumin dalam kunyit memiliki struktur yang berubah dari bentuk keto yang stabil (berwarna kuning) menjadi bentuk enol terdeprotonasi berwarna merah bata pekat dalam kondisi alkalis.'
  },
  {
    id: 3,
    question: 'Menurut konsep Lewis, zat manakah yang bertindak sebagai asam Lewis pada reaksi koordinasi pembentukan senyawa aduk antara BF₃ dengan NH₃?',
    options: [
      { text: 'A. NH₃, karena menerima satu pasangan elektron bebas dari atom B', correct: false },
      { text: 'B. BF₃, karena mendonorkan pasangan elektron bebas hibrida', correct: false },
      { text: 'C. BF₃, karena menerima pasangan elektron bebas dari nitrogen di NH₃ untuk menstabilkan oktet Boron', correct: true },
      { text: 'D. Tidak terjadi pembentukan ikatan koordinat kovalen', correct: false }
    ],
    feedback: 'Luar biasa! Boron pada BF₃ hanya dikelilingi 6 elektron valensi (belum oktet), sehingga ia sangat butuh menerima sepasang elektron (akseptor PEB / Asam Lewis) dari nitrogen di NH₃ (donor PEB / Basa Lewis).'
  },
  {
    id: 4,
    question: 'Manakah di antara tumbuhan berikut yang digolongkan sebagai indikator alami yang paling kaya variasi warnanya, mulai dari merah cerah, ungu, biru, hingga kuning keemasan?',
    options: [
      { text: 'A. Mahkota Bunga Mawar Merah', correct: false },
      { text: 'B. Rimpang Temulawak', correct: false },
      { text: 'C. Ekstrak Daun Pandan Wangi', correct: false },
      { text: 'D. Daun Kol Ungu (Brassica oleracea)', correct: true }
    ],
    feedback: 'Benar! Kol ungu kaya akan pewarna antosianin yang struktur kimianya sangat sensitif terhadap perubahan konsentrasi ion H⁺, menghasilkan rentang spektrum warna paling lengkap dari pH 1 sampai 14.'
  },
  {
    id: 5,
    question: 'Menurut teori asam basa Arrhenius, sifat asam suatu senyawa utamanya ditentukan oleh kemampuan senyawa tersebut saat dilarutkan dalam air untuk menghasilkan...',
    options: [
      { text: 'A. Ion hidroksida (OH⁻) berlimpah', correct: false },
      { text: 'B. Pasangan elektron bebas bersama (PEB)', correct: false },
      { text: 'C. Ion hidronium / hidrogen (H⁺)', correct: true },
      { text: 'D. Gas hidrogen bebas meluap', correct: false }
    ],
    feedback: 'Tepat sekali! Konsep Arrhenius (1884) menetapkan bahwa asam adalah zat yang melepaskan atau meningkatkan ion hidrogen (H⁺) dalam media air murni.'
  }
];

export default function AcidBaseIntroLab({ currentUser, theme = 'dark' }: AcidBaseIntroLabProps) {
  const [activeTab, setActiveTab] = useState<'theory' | 'extractor' | 'scale' | 'phCalc' | 'quiz'>('theory');

  // ==========================================
  // TAB 1: THEORY DISCOVERY
  // ==========================================
  const [theorySubTab, setTheorySubTab] = useState<'arrhenius' | 'bronsted' | 'lewis'>('arrhenius');
  const [arrheniusType, setArrheniusType] = useState<'acid' | 'base'>('acid');
  const [arrheniusStrength, setArrheniusStrength] = useState<'strong' | 'weak'>('strong');
  const [arrheniusAlpha, setArrheniusAlpha] = useState<number>(0.15); // dissociation fraction for weak electrolyte
  const [arrheniusSimState, setArrheniusSimState] = useState<'neutral' | 'dissolved'>('neutral');
  const [bronstedReaction, setBronstedReaction] = useState<'ammonia' | 'acetic'>('ammonia');
  const [bronstedSimState, setBronstedSimState] = useState<'reactants' | 'transferred'>('reactants');
  const [lewisReactionType, setLewisReactionType] = useState<'bf3' | 'hydronium'>('bf3');
  const [lewisSimState, setLewisSimState] = useState<'separate' | 'bond'>('separate');

  // ==========================================
  // TAB 3.5: HIGH SCHOOL pH CALCULATOR
  // ==========================================
  const [calcSolType, setCalcSolType] = useState<'strongAcid' | 'weakAcid' | 'strongBase' | 'weakBase'>('strongAcid');
  const [calcConcentration, setCalcConcentration] = useState<number>(0.1);
  const [calcValence, setCalcValence] = useState<number>(1);
  const [calcPkaPkbSlider, setCalcPkaPkbSlider] = useState<number>(5.0);
  const [calcActivePreset, setCalcActivePreset] = useState<string>('custom');

  // ==========================================
  // TAB 2: NATURAL EXTRACTOR & TESTER STATE
  // ==========================================
  const [selectedIndId, setSelectedIndId] = useState<string>('kol-ungu');
  const [extractorStep, setExtractorStep] = useState<1 | 2 | 3>(1); // 1: Choose source, 2: Mortar grind, 3: Filter & Test
  const [grindingProgress, setGrindingProgress] = useState<number>(0);
  const [isGrinding, setIsGrinding] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [extractionCompleted, setExtractionCompleted] = useState<boolean>(false);
  const [tubePouredStates, setTubePouredStates] = useState<Record<string, 'empty' | 'poured' | 'testing'>>({});
  const [reactionLogs, setReactionLogs] = useState<string[]>(['Laboratorium asam basa alami siap dimulai.']);
  const [activeDropperLiquid, setActiveDropperLiquid] = useState<string | null>(null);

  const activeIndicator = NATURAL_INDICATORS.find(ind => ind.id === selectedIndId) || NATURAL_INDICATORS[0];

  const handleStartGrinding = () => {
    if (grindingProgress >= 100 || isGrinding) return;
    setIsGrinding(true);
    setReactionLogs(prev => ['[Grinding] Mulai menumbuk jaringan sel alami untuk meremukkan dinding sel tumbuhan dan mengeluarkan pigmen...', ...prev]);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGrinding && grindingProgress < 100) {
      timer = setTimeout(() => {
        setGrindingProgress(prev => {
          const next = prev + 25;
          if (next >= 100) {
            setIsGrinding(false);
            setReactionLogs(prevLogs => ['[Grinding Selesai] Jaringan sel hancur sempurna, pigmen vakuola sel telah dilepaskan.', ...prevLogs]);
            return 100;
          }
          return next;
        });
      }, 600);
    }
    return () => clearTimeout(timer);
  }, [isGrinding, grindingProgress]);

  const handleTriggerFiltration = () => {
    if (isFiltering || extractionCompleted) return;
    setIsFiltering(true);
    setReactionLogs(prev => ['[Filter] Menuangkan pelarut air suling hangat dan menyaring ampas kasar melalui kertas saring silika...', ...prev]);
    
    setTimeout(() => {
      setIsFiltering(false);
      setExtractionCompleted(true);
      setExtractorStep(3);
      setReactionLogs(prev => [
        `[Filter Sukses] Berhasil mengekstrak pigmen murni ${activeIndicator.pigment} dalam bentuk filtrat cair yang pekat!`,
        ...prev
      ]);
    }, 2500);
  };

  const handleDropToTube = (solutionId: string) => {
    if (!extractionCompleted) return;
    setTubePouredStates(prev => ({
      ...prev,
      [solutionId]: 'testing'
    }));

    const sol = HOUSEHOLD_SOLUTIONS.find(s => s.id === solutionId);
    if (!sol) return;

    // Determine target pH region for color
    let key: keyof typeof activeIndicator.pHColors = 'pH7_8';
    if (sol.actualPH <= 2) key = 'pH1_2';
    else if (sol.actualPH <= 4) key = 'pH3_4';
    else if (sol.actualPH <= 6) key = 'pH5_6';
    else if (sol.actualPH <= 8) key = 'pH7_8';
    else if (sol.actualPH <= 10) key = 'pH9_10';
    else if (sol.actualPH <= 12) key = 'pH11_12';
    else key = 'pH13_14';

    const colorResult = activeIndicator.pHColors[key];

    setTimeout(() => {
      setTubePouredStates(prev => ({
        ...prev,
        [solutionId]: 'poured'
      }));
      setReactionLogs(prev => [
        `[Reaksi] Filtrat ${activeIndicator.name} bercampur dengan ${sol.name} (pH ${sol.actualPH}). Warna larutan berubah menjadi ${colorResult.label}!`,
        `[Kimiawi] Sifat: ${sol.type}. Zat aktif: ${sol.chemicalFormula}.`,
        ...prev
      ]);
    }, 1200);
  };

  const handleResetExtractor = () => {
    setExtractorStep(1);
    setGrindingProgress(0);
    setIsGrinding(false);
    setIsFiltering(false);
    setExtractionCompleted(false);
    setTubePouredStates({});
    setReactionLogs([`Membuang sisa reagen. Membersihkan peralatan mortar, alu, dan kertas saring.`]);
  };

  useEffect(() => {
    handleResetExtractor();
  }, [selectedIndId]);


  // ==========================================
  // TAB 3: pH COMPARISON SLIDER STATE
  // ==========================================
  const [sliderPH, setSliderPH] = useState<number>(7.0);

  const getPHColorDetails = (indicatorId: string, ph: number) => {
    const ind = NATURAL_INDICATORS.find(i => i.id === indicatorId) || NATURAL_INDICATORS[0];
    let key: keyof typeof ind.pHColors = 'pH7_8';
    if (ph <= 2) key = 'pH1_2';
    else if (ph <= 4) key = 'pH3_4';
    else if (ph <= 6) key = 'pH5_6';
    else if (ph <= 8) key = 'pH7_8';
    else if (ph <= 10) key = 'pH9_10';
    else if (ph <= 12) key = 'pH11_12';
    else key = 'pH13_14';

    return ind.pHColors[key];
  };

  const getLitmusColor = (ph: number) => {
    return ph > 7 ? 'bg-blue-500 shadow-md shadow-blue-500/20' : ph < 7 ? 'bg-red-500 shadow-md shadow-red-500/20' : 'bg-purple-400 shadow-md shadow-purple-400/20';
  };

  const getUniversalIndicatorColor = (ph: number) => {
    if (ph <= 2) return 'bg-red-600';
    if (ph <= 4) return 'bg-orange-500';
    if (ph <= 6) return 'bg-yellow-405';
    if (ph <= 8) return 'bg-green-500';
    if (ph <= 10) return 'bg-teal-500';
    if (ph <= 12) return 'bg-blue-650';
    return 'bg-violet-700';
  };


  // ==========================================
  // TAB 4: QUIZ STATE
  // ==========================================
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  const handleSelectQuizOption = (idx: number) => {
    if (quizAnswered) return;
    setSelectedOptIdx(idx);
  };

  const handleApplyQuizAnswer = () => {
    if (selectedOptIdx === null || quizAnswered) return;
    setQuizAnswered(true);

    const isCorrect = ACID_BASE_QUIZ[quizIdx].options[selectedOptIdx].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 20);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOptIdx(null);
    setQuizAnswered(false);

    if (quizIdx < ACID_BASE_QUIZ.length - 1) {
      setQuizIdx(prev => prev + 1);
    } else {
      setQuizComplete(true);

      // Dispatch Activity to firebase to record stats
      const actEvent = new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          title: 'Asam Basa / Kak XI K13',
          description: `Kuis Teori Asam Basa & Indikator Alami tuntas dengan skor ${quizScore}/100`,
          score: { earned: quizScore, total: 100 }
        }
      });
      window.dispatchEvent(actEvent);
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setSelectedOptIdx(null);
    setQuizAnswered(false);
    setQuizScore(0);
    setQuizComplete(false);
  };

  return (
    <div id="acid-base-root-panel" className={`w-full min-h-[calc(100vh-4rem)] p-4 md:p-8 space-y-6 ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Upper Branding Banner */}
      <div className={`relative p-6 md:p-8 rounded-2xl border overflow-hidden shadow-xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-teal-950/40 via-indigo-950/15 to-slate-900 border-teal-900/30' 
          : 'bg-gradient-to-r from-teal-50 via-indigo-50 to-white border-teal-200'
      }`}>
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-mono font-black uppercase rounded-full">
                Materi Kimia Kelas XI • Dasar &amp; Indikator Alami
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-550/20">
                <Sparkles className="w-3 animate-spin duration-3000" />
                Dunia Pigmen &amp; Ion Hidronium
              </span>
            </div>
            <h1 className="text-2xl md:text-3.5xl font-sans font-bold tracking-tight text-white flex items-center gap-2.5">
              <Droplet className="w-8 h-8 text-teal-450 animate-bounce" />
              Teori Asam Basa &amp; <span className="text-teal-400 font-normal underline decoration-indigo-500/30">Indikator Alami</span>
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Pelajari landasan molekuler 3 Teori Utama (Arrhenius, Brønsted-Lowry, Lewis) dan lakukan ekstraksi visual serta pengujian senyawa pigmen alamiah dalam membedakan asam kuat hingga basa ekstrem.
            </p>
          </div>

          <div className={`flex flex-col gap-2 p-1 rounded-xl border w-full md:w-56 shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
            <button
              onClick={() => setActiveTab('theory')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left ${
                activeTab === 'theory'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-400 border border-teal-555/40'
                  : (theme === 'dark' ? 'text-zinc-455 hover:text-white' : 'text-slate-700 hover:text-slate-900')
              }`}
            >
              1. Teori Dasar
            </button>
            <button
              onClick={() => setActiveTab('extractor')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left ${
                activeTab === 'extractor'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-400 border border-teal-555/40'
                  : (theme === 'dark' ? 'text-zinc-455 hover:text-white' : 'text-slate-700 hover:text-slate-900')
              }`}
            >
              2. Lab Ekstraksi
            </button>
            <button
              onClick={() => setActiveTab('scale')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left ${
                activeTab === 'scale'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-505/20 text-teal-400 border border-teal-555/40'
                  : (theme === 'dark' ? 'text-zinc-455 hover:text-white' : 'text-slate-700 hover:text-slate-900')
              }`}
            >
              3. Spektrum Warna pH
            </button>
            <button
              onClick={() => setActiveTab('phCalc')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left ${
                activeTab === 'phCalc'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-505/20 text-teal-400 border border-teal-555/40'
                  : (theme === 'dark' ? 'text-zinc-455 hover:text-white' : 'text-slate-700 hover:text-slate-900')
              }`}
            >
              4. Kalkulator pH
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left relative ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-400 border border-teal-555/40'
                  : (theme === 'dark' ? 'text-zinc-455 hover:text-white' : 'text-slate-700 hover:text-slate-900')
              }`}
            >
              Pilar Kuis
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          TAB 1: THREE CORE ACID-BASE THEORIES
          ========================================== */}
      {activeTab === 'theory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Theory selector sidebar menu */}
          <div className={`lg:col-span-4 border rounded-2xl p-5 md:p-6 space-y-4 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">Theoretical Base</span>
              <h3 className="text-base font-sans font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-450" />
                Eksplorasi Mode Teori
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Pahami tiga paradigma besar kimia untuk mendefinisikan apa sesungguhnya asam dan basa dalam skala reagen.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Arrhenius */}
              <button
                onClick={() => {
                  setTheorySubTab('arrhenius');
                  setArrheniusSimState('neutral');
                }}
                className={`w-full p-3 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                  theorySubTab === 'arrhenius'
                    ? 'bg-teal-950/20 border-teal-500 text-white'
                    : 'bg-slate-900/20 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span className="text-white text-sm font-sans">I. Teori Arrhenius (1884)</span>
                  <span className="font-mono text-[9px] bg-teal-500/15 text-teal-400 px-1.5 py-0.5 rounded border border-teal-500/20">Media Air</span>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  Asam melepas <strong className="text-teal-400">ion H⁺</strong>, sedangkan Basa melepaskan <strong className="text-indigo-400">ion OH⁻</strong> ketika dilarutkan dalam air pelarut padu.
                </p>
              </button>

              {/* Bronsted-Lowry */}
              <button
                onClick={() => {
                  setTheorySubTab('bronsted');
                  setBronstedSimState('reactants');
                }}
                className={`w-full p-3 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                  theorySubTab === 'bronsted'
                    ? 'bg-teal-950/20 border-teal-500 text-white'
                    : 'bg-slate-900/20 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span className="text-white text-sm font-sans">II. Brønsted-Lowry (1923)</span>
                  <span className="font-mono text-[9px] bg-teal-500/15 text-teal-400 px-1.5 py-0.5 rounded border border-teal-500/20">Transfer Proton</span>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  Simbiosis donor-akseptor kation hidrogen. Asam bertindak sebagai <strong className="text-rose-455">donor proton (H⁺)</strong>; Basa menjadi <strong className="text-cyan-405">akseptor proton</strong>.
                </p>
              </button>

              {/* Lewis */}
              <button
                onClick={() => {
                  setTheorySubTab('lewis');
                  setLewisSimState('separate');
                }}
                className={`w-full p-3 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                  theorySubTab === 'lewis'
                    ? 'bg-teal-950/20 border-teal-500 text-white'
                    : 'bg-slate-900/20 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span className="text-white text-sm font-sans">III. Teori Lewis (1923)</span>
                  <span className="font-mono text-[9px] bg-teal-500/15 text-teal-400 px-1.5 py-0.5 rounded border border-teal-500/20">Pasangan Elektron</span>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  Melepaskan ketergantungan dari atom H. Asam adalah <strong className="text-amber-450">akseptor pasangan elektron</strong>; Basa bekerja mendonasikan pasangan elektron bebas ikatan.
                </p>
              </button>
            </div>
          </div>

          {/* Interactive Simulation Panel */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            <div className={`border rounded-2xl p-5 md:p-6 flex-1 flex flex-col justify-between min-h-[440px] relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-white border-slate-200'
            }`}>
              <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />

              {/* Header inside sim */}
              <div className="flex justify-between items-start border-b border-slate-800/40 pb-3">
                <div>
                  <span className="text-[9px] font-mono text-zinc-550 uppercase">Visualisasi Konsep &amp; Animasi Atomik</span>
                  <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                    {theorySubTab === 'arrhenius' && 'Arrhenius Reaksi Ionisasi Air'}
                    {theorySubTab === 'bronsted' && 'Lompatan Proton Pasangan Konjugasi'}
                    {theorySubTab === 'lewis' && 'Transfer Pasangan Elektron Ikatan Koordinasi'}
                  </h4>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold text-indigo-400 border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                  {theorySubTab.toUpperCase()} ENGINE
                </span>
              </div>
              {theorySubTab === 'arrhenius' && (
                <div className="space-y-4 my-2 w-full">
                  {/* Selector Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-teal-400 uppercase block font-bold">1. Sifat Larutan:</span>
                      <div className={`flex p-1 rounded-xl border gap-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                        <button
                          onClick={() => {
                            setArrheniusType('acid');
                            setArrheniusSimState('neutral');
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-mono font-bold rounded-lg uppercase cursor-pointer transition-all ${
                            arrheniusType === 'acid' ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Asam (H⁺)
                        </button>
                        <button
                          onClick={() => {
                            setArrheniusType('base');
                            setArrheniusSimState('neutral');
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-mono font-bold rounded-lg uppercase cursor-pointer transition-all ${
                            arrheniusType === 'base' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Basa (OH⁻)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-teal-400 uppercase block font-bold">2. Kekuatan Elektrolit:</span>
                      <div className={`flex p-1 rounded-xl border gap-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                        <button
                          onClick={() => {
                            setArrheniusStrength('strong');
                            setArrheniusSimState('neutral');
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-mono font-bold rounded-lg uppercase cursor-pointer transition-all ${
                            arrheniusStrength === 'strong' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Kuat (α=1)
                        </button>
                        <button
                          onClick={() => {
                            setArrheniusStrength('weak');
                            setArrheniusSimState('neutral');
                          }}
                          className={`flex-1 py-1.5 text-[10px] font-mono font-bold rounded-lg uppercase cursor-pointer transition-all ${
                            arrheniusStrength === 'weak' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Lemah (α&lt;1)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <button
                        onClick={() => {
                          setArrheniusSimState(arrheniusSimState === 'dissolved' ? 'neutral' : 'dissolved');
                        }}
                        className={`w-full py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-xl text-xs font-mono font-bold tracking-wider uppercase cursor-pointer transition-all ${
                          arrheniusSimState === 'dissolved' ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''
                        }`}
                      >
                        {arrheniusSimState === 'dissolved' ? 'Reset Air Larutan' : 'Larutkan ke H₂O'}
                      </button>
                    </div>
                  </div>

                  {/* Partial Ionization (Weak) Slider */}
                  {arrheniusStrength === 'weak' && (
                    <div className={`p-3 rounded-xl border space-y-1.5 ${theme === 'dark' ? 'bg-slate-950 border-slate-900/60' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex justify-between items-center text-[10.5px] font-mono">
                        <span className="text-zinc-400">Derajat Ionisasi Larutan Lemah (α):</span>
                        <strong className="text-amber-400">{(arrheniusAlpha * 100).toFixed(0)}%</strong>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.40"
                        step="0.05"
                        value={arrheniusAlpha}
                        onChange={(e) => setArrheniusAlpha(parseFloat(e.target.value))}
                        className={`w-full accent-amber-500 h-1.5 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                      />
                      <p className="text-[9.5px] text-zinc-500 leading-tight">
                        *Ostwald: Hanya sebagian kecil senyawa terurai menjadi H⁺/OH⁻. Sisanya tetap melayang sebagai senyawa utuh terhidrasi.
                      </p>
                    </div>
                  )}

                  {/* Dual Container Layout for Beaker & Equation */}
                  <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    {/* Chemical Equation Box */}
                    <div className={`flex-1 p-4 rounded-2xl border flex flex-col justify-between font-mono text-[11px] space-y-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                      <div>
                        <span className="text-[9px] text-teal-400 font-extrabold uppercase block mb-1">Persamaan Ionisasi Arrhenius:</span>
                        <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850 text-white' : 'bg-slate-100/60 border-slate-300 text-slate-900'}`}>
                          {arrheniusType === 'acid' ? (
                            arrheniusStrength === 'strong' ? (
                              <span>HCl(aq) → H⁺(aq) + Cl⁻(aq) <br/><strong className="text-teal-400 text-[10px] block mt-1">(Ionisasi 100% sempurna)</strong></span>
                            ) : (
                              <span>CH₃COOH(aq) ⇌ H⁺(aq) + CH₃COO⁻(aq) <br/><strong className="text-amber-400 text-[10px] block mt-1">(Reaksi kesetimbangan, tertinggal molekul sisa)</strong></span>
                            )
                          ) : (
                            arrheniusStrength === 'strong' ? (
                              <span>NaOH(aq) → Na⁺(aq) + OH⁻(aq) <br/><strong className="text-indigo-400 text-[10px] block mt-1">(Ionisasi basa lengkap)</strong></span>
                            ) : (
                              <span>NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq) <br/><strong className="text-amber-400 text-[10px] block mt-1">(Amonia mendehidrasi sebagian molekul air)</strong></span>
                            )
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-[10px] text-zinc-400 font-sans leading-normal">
                        <strong className="text-white font-mono uppercase block text-[9px] text-teal-400">Ikhtisar Sains:</strong>
                        {arrheniusType === 'acid' ? (
                          arrheniusStrength === 'strong' ? (
                            <p>HCl melepaskan proton H⁺ secara spontan tanpa hambatan kesetimbangan karena energi hidrasi klorida yang sangat tinggi.</p>
                          ) : (
                            <p>Asam asetat terion kecil. Dengan α = {(arrheniusAlpha * 100).toFixed(0)}%, dari setiap 100 molekul asam, hanya {(arrheniusAlpha * 100).toFixed(0)} molekul yang melepaskan proton H⁺. Sisanya tetap stabil sebagai CH₃COOH.</p>
                          )
                        ) : (
                          arrheniusStrength === 'strong' ? (
                            <p>NaOH melepaskan kation hidroksil OH⁻ utuh di air karena ikatan ionik kristal Na-O sangat peka terhadap gaya dipol pelarut air.</p>
                          ) : (
                            <p>Amonia tidak mengandung OH pada rumusnya, namun menghasilkan OH⁻ tak langsung lewat reaksi pengambilan proton air.</p>
                          )
                        )}
                      </div>
                    </div>

                    {/* Beaker representation */}
                    <div className={`w-full md:w-64 h-64 rounded-2xl border p-4 overflow-hidden flex flex-col justify-end shadow-xl relative shrink-0 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
                      <span className="absolute left-3 top-3 text-[8px] font-mono text-zinc-650">BEAKER ARRHENIUS SHOT</span>
                      
                      {/* Water background */}
                      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-blue-500/10 rounded-b-xl border-t border-blue-500/25 transition-all">
                        {arrheniusSimState === 'neutral' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-mono text-zinc-500 text-center leading-normal">Air Suling Murni (H₂O)<br/>Klik tombol Larutkan!</span>
                          </div>
                        )}
                      </div>

                      {/* Moving particles inside beaker */}
                      <AnimatePresence>
                        {arrheniusSimState === 'neutral' ? (
                          <motion.div
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 20, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute inset-x-0 top-1/4 mx-auto w-40 p-2 border rounded-xl text-center text-xs font-mono ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}
                          >
                            <span className="text-[9px] text-zinc-500 uppercase block mb-0.5">Zat Sebelum Larut:</span>
                            <div className="text-sm font-black text-rose-450">
                              {arrheniusType === 'acid' ? (
                                arrheniusStrength === 'strong' ? 'HCl' : 'CH₃COOH'
                              ) : (
                                arrheniusStrength === 'strong' ? 'NaOH' : 'Gas NH₃'
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          /* Dissolved particles */
                          <div className="absolute inset-0 z-10">
                            {arrheniusType === 'acid' ? (
                              arrheniusStrength === 'strong' ? (
                                <>
                                  {/* Strong Acid Ions (Fully dissociated) */}
                                  <motion.div animate={{ y: [80, 110, 95, 80], x: [40, 60, 30, 40] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 flex flex-col items-center justify-center font-mono text-[9px] font-bold">H⁺</motion.div>
                                  <motion.div animate={{ y: [130, 115, 140, 130], x: [140, 120, 150, 140] }} transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-teal-500/20 border border-teal-505/40 text-teal-400 flex flex-col items-center justify-center font-mono text-[9px] font-bold">H⁺</motion.div>
                                  <motion.div animate={{ y: [110, 130, 90, 110], x: [100, 85, 115, 100] }} transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-teal-500/20 border border-teal-505/40 text-teal-400 flex flex-col items-center justify-center font-mono text-[9px] font-bold">H⁺</motion.div>

                                  <motion.div animate={{ y: [120, 90, 110, 120], x: [70, 90, 65, 70] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 text-zinc-400 flex flex-col items-center justify-center font-mono text-[8px]">Cl⁻</motion.div>
                                  <motion.div animate={{ y: [90, 130, 110, 90], x: [175, 160, 185, 175] }} transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 text-zinc-400 flex flex-col items-center justify-center font-mono text-[8px]">Cl⁻</motion.div>
                                </>
                              ) : (
                                <>
                                  {/* Weak Acid (Mostly undissociated molecules) */}
                                  <motion.div animate={{ y: [100, 120, 105, 100], x: [60, 80, 50, 60] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} className={`absolute w-15 h-8 rounded-xl border border-amber-500/30 text-zinc-350 flex flex-col items-center justify-center font-mono text-[8px] leading-none ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                    <span>CH₃COOH</span>
                                    <span className="text-[6px] text-zinc-500 mt-0.5">Molekul Utuh</span>
                                  </motion.div>
                                  <motion.div animate={{ y: [140, 125, 150, 140], x: [120, 100, 130, 120] }} transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }} className={`absolute w-15 h-8 rounded-xl border border-amber-500/30 text-zinc-350 flex flex-col items-center justify-center font-mono text-[8px] leading-none ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                    <span>CH₃COOH</span>
                                  </motion.div>

                                  {/* Just one tiny dissociated pair */}
                                  <motion.div animate={{ y: [80, 95, 85, 80], x: [140, 160, 135, 140] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }} className="absolute w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-mono text-[9px] font-bold">H⁺</motion.div>
                                  <motion.div animate={{ y: [110, 95, 120, 110], x: [30, 45, 25, 30] }} transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }} className="absolute w-12 h-6 rounded-lg bg-emerald-950/20 border border-slate-800 text-zinc-300 flex items-center justify-center font-mono text-[7px]">CH₃COO⁻</motion.div>
                                </>
                              )
                            ) : (
                              arrheniusStrength === 'strong' ? (
                                <>
                                  {/* Strong Base Ions */}
                                  <motion.div animate={{ y: [85, 115, 100, 85], x: [50, 70, 35, 50] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-505/40 text-indigo-400 flex flex-col items-center justify-center font-mono text-[8px] font-bold">OH⁻</motion.div>
                                  <motion.div animate={{ y: [125, 110, 135, 125], x: [150, 130, 160, 150] }} transition={{ repeat: Infinity, duration: 4.8, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-505/40 text-indigo-400 flex flex-col items-center justify-center font-mono text-[8px] font-bold">OH⁻</motion.div>
                                  <motion.div animate={{ y: [100, 130, 115, 100], x: [100, 120, 95, 100] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-505/40 text-indigo-400 flex flex-col items-center justify-center font-mono text-[8px] font-bold">OH⁻</motion.div>

                                  <motion.div animate={{ y: [130, 95, 115, 130], x: [80, 100, 75, 80] }} transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 text-zinc-400 flex items-center justify-center font-mono text-[8px]">Na⁺</motion.div>
                                  <motion.div animate={{ y: [95, 125, 105, 95], x: [175, 160, 185, 175] }} transition={{ repeat: Infinity, duration: 5.8, ease: 'easeInOut' }} className="absolute w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 text-zinc-400 flex items-center justify-center font-mono text-[8px]">Na⁺</motion.div>
                                </>
                              ) : (
                                <>
                                  {/* Weak Base NH3 (Hydrated/Unprotonated) */}
                                  <motion.div animate={{ y: [95, 115, 100, 95], x: [55, 75, 45, 55] }} transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }} className={`absolute w-12 h-8 rounded-xl border border-indigo-500/35 text-zinc-350 flex flex-col items-center justify-center font-mono text-[8px] leading-tight ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                    <span>NH₃</span>
                                    <span className="text-[6px] text-zinc-550 mt-0.5">molekul</span>
                                  </motion.div>
                                  <motion.div animate={{ y: [135, 115, 145, 135], x: [130, 110, 140, 130] }} transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }} className={`absolute w-12 h-8 rounded-xl border border-indigo-500/35 text-zinc-350 flex flex-col items-center justify-center font-mono text-[8px] leading-tight ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                    <span>NH₃</span>
                                  </motion.div>

                                  {/* Weak Base single dissociation pair */}
                                  <motion.div animate={{ y: [75, 90, 80, 75], x: [135, 155, 125, 135] }} transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }} className="absolute w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-505/40 text-indigo-400 flex items-center justify-center font-mono text-[8px] font-bold">OH⁻</motion.div>
                                  <motion.div animate={{ y: [105, 90, 115, 105], x: [25, 40, 20, 25] }} transition={{ repeat: Infinity, duration: 4.4, ease: 'easeInOut' }} className={`absolute w-10 h-6 border text-teal-400 flex items-center justify-center font-mono text-[7px] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>NH₄⁺</motion.div>
                                </>
                              )
                            )}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. BRONSTED-LOWRY EXPERIMENT PLAYGROUND */}
              {theorySubTab === 'bronsted' && (
                <div className="flex flex-col md:flex-row gap-6 my-6 items-center flex-1 justify-around">
                  
                  <div className="flex flex-col gap-3 w-full md:w-56">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-cyan-405 block uppercase">Reaksi Setimbang:</span>
                      <div className={`font-mono p-2 text-xs rounded-lg border leading-relaxed ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                        NH₃ + H₂O ⇌ <strong className="text-rose-405 font-bold">NH₄⁺</strong> + <strong className="text-cyan-405 font-bold">OH⁻</strong>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl space-y-1.5 border text-[11px] leading-relaxed ${theme === 'dark' ? 'bg-slate-950 border-slate-900 text-zinc-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                      <p>🎓 Air (H₂O) mendermakan atau membuang kation hidroniumnya ke amonia.</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>H₂O bertindak sebagai <strong className="text-rose-450">Donor H⁺ (Asam)</strong></li>
                        <li>NH₃ bertindak sebagai <strong className="text-cyan-405">Akseptor (Basa)</strong></li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setBronstedSimState(bronstedSimState === 'reactants' ? 'transferred' : 'reactants');
                      }}
                      className="py-2.5 bg-gradient-to-r from-teal-500 to-indigo-650 text-slate-950 font-mono font-bold uppercase rounded-lg text-xs cursor-pointer active:scale-98 tracking-wider shadow-md"
                    >
                      {bronstedSimState === 'reactants' ? 'Simulasikan Transfer H⁺' : 'Kembalikan Kondisi'}
                    </button>
                  </div>

                  {/* Visualizing Proton hopping directly in organic structure blocks */}
                  <div className={`relative w-76 h-64 rounded-2xl border p-4 flex flex-col justify-between overflow-hidden ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="absolute right-3 top-3 text-[8px] font-mono text-zinc-650">Skema Orbital Proton</span>

                    <div className="flex-1 flex items-center justify-around relative">
                      
                      {/* Left molecule: NH3 (Base) */}
                      <div className={`flex flex-col items-center relative p-2.5 border rounded-xl w-32 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800/60' : 'bg-slate-100/50 border-slate-300'}`}>
                        <span className="text-[9px] font-mono text-cyan-400 tracking-wider mb-2">
                          {bronstedSimState === 'reactants' ? 'Basa (NH₃)' : 'Asam Konj (NH₄⁺)'}
                        </span>
                        
                        {/* H3 N central visual representation */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 text-white font-mono font-black text-xs flex items-center justify-center">N</span>
                          <span className="text-zinc-500 text-xs font-mono">• •</span>
                          {/* Attached Hydrogen atoms */}
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-[9px] px-1 py-0.5 rounded ${theme === 'dark' ? 'text-zinc-400 bg-slate-950' : 'text-slate-600 bg-slate-100'}`}>H</span>
                            <span className={`text-[9px] px-1 py-0.5 rounded ${theme === 'dark' ? 'text-zinc-400 bg-slate-950' : 'text-slate-600 bg-slate-100'}`}>H</span>
                            <span className={`text-[9px] px-1 py-0.5 rounded ${theme === 'dark' ? 'text-zinc-400 bg-slate-950' : 'text-slate-600 bg-slate-100'}`}>H</span>
                          </div>
                        </div>

                        {/* Position placeholder where proton will jump to */}
                        {bronstedSimState === 'transferred' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 right-2 w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/80 text-rose-400 text-[10px] font-mono flex items-center justify-center font-bold"
                          >
                            H⁺
                          </motion.div>
                        )}
                      </div>

                      {/* Moving proton arrow line */}
                      <div className="w-12 h-0.5 bg-slate-800 relative">
                        {bronstedSimState === 'reactants' && (
                          <motion.div
                            animate={{ x: [0, 24, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 w-2.5 h-2.5 bg-rose-500 rounded-full shadow shadow-rose-500/50"
                          />
                        )}
                        <span className="absolute -top-5 inset-x-0 mx-auto text-center text-[8px] font-mono text-zinc-600">
                          {bronstedSimState === 'reactants' ? 'transfer' : 'stabil'}
                        </span>
                      </div>

                      {/* Right molecule: H2O (Acid) */}
                      <div className={`flex flex-col items-center relative p-2.5 border rounded-xl w-28 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800/60' : 'bg-slate-100/50 border-slate-300'}`}>
                        <span className="text-[9px] font-mono text-rose-400 tracking-wider mb-2">
                          {bronstedSimState === 'reactants' ? 'Asam (H₂O)' : 'Basa Konj (OH⁻)'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 text-white font-mono font-black text-xs flex items-center justify-center">O</span>
                          
                          {bronstedSimState === 'reactants' ? (
                            <div className="flex flex-col gap-0.5">
                              <span className={`text-[9px] px-1 py-0.5 rounded ${theme === 'dark' ? 'text-zinc-400 bg-slate-950' : 'text-slate-600 bg-slate-100'}`}>H</span>
                              {/* The jumping hydrogen */}
                              <motion.span
                                layoutId="jumpingProton"
                                className="text-[9px] text-rose-450 bg-rose-950/40 border border-rose-955/30 px-1 py-0.5 rounded"
                              >
                                H⁺
                              </motion.span>
                            </div>
                          ) : (
                            <span className={`text-[9px] px-1 py-0.5 rounded ${theme === 'dark' ? 'text-zinc-400 bg-slate-950' : 'text-slate-600 bg-slate-100'}`}>H</span>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="text-[10px] font-mono text-zinc-500 text-center leading-normal">
                      {bronstedSimState === 'reactants' 
                        ? 'Klik tombol simulasi di samping kiri untuk mengaktifkan perpindahan satu proton (H⁺) dari vakuola air ke senyawa amonia.' 
                        : 'Amonia sekarang bermuatan positif (+1) membentuk amonium, sedangkan air sisa kehabisan proton membentuk ion alkalis hidroksida OH⁻.'
                      }
                    </div>
                  </div>

                </div>
              )}

              {/* 3. LEWIS EXPERIMENT PLAYGROUND */}
              {theorySubTab === 'lewis' && (
                <div className="flex flex-col md:flex-row gap-6 my-6 items-center flex-1 justify-around">
                  
                  <div className="flex flex-col gap-3 w-full md:w-56">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-amber-500 block uppercase">Pembentukan Adduct:</span>
                      <div className={`font-mono p-2 text-xs rounded-lg border leading-relaxed ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                        BF₃ + NH₃ → <strong className="text-amber-400 font-bold">F₃B←NH₃</strong>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl space-y-1.5 border text-[11px] leading-relaxed ${theme === 'dark' ? 'bg-slate-950 border-slate-900 text-zinc-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                      <p>✨ Boron di BF₃ kehilangan kestabilan oktet (hanya memiliki 6 elektron valensi terluar).</p>
                      <p>Amonia (NH₃) memberikan Pasangan Elektron Bebasnya untuk digunakan bersama.</p>
                    </div>

                    <button
                      onClick={() => {
                        setLewisSimState(lewisSimState === 'separate' ? 'bond' : 'separate');
                      }}
                      className="py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-mono font-bold uppercase rounded-lg text-xs cursor-pointer active:scale-98 tracking-wider shadow-md"
                    >
                      {lewisSimState === 'separate' ? 'Bentuk Ikatan Kovalen Koordinasi' : 'Pisahkan Molekul'}
                    </button>
                  </div>

                  {/* Drawing representation of coordinate covalent bond */}
                  <div className={`relative w-80 h-64 rounded-2xl border p-4 flex flex-col justify-between overflow-hidden ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="absolute right-3 top-3 text-[8px] font-mono text-zinc-650">Lewis Orbital Shell</span>

                    <div className="flex-1 flex items-center justify-center relative">
                      
                      {/* Left: BF3 (Lewis Acid - Empty box) */}
                      <motion.div
                        animate={lewisSimState === 'separate' ? { x: -30 } : { x: -10 }}
                        className={`flex flex-col items-center p-2 rounded-xl border w-32 relative ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-100/40 border-slate-300'}`}
                      >
                        <span className="text-[8px] font-mono text-amber-500 uppercase mb-1">BF₃ (AKSEPTOR PEB)</span>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                          <span className="w-7 h-7 rounded bg-zinc-800 border-2 border-slate-700 flex items-center justify-center">B</span>
                          <span className="text-[10px] text-zinc-550 flex flex-col">
                            <span>F</span>
                            <span>F</span>
                            <span>F</span>
                          </span>
                        </div>
                        
                        {/* Empty orbital pocket slot */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 border border-teal-555/40 border-dashed rounded flex items-center justify-center text-[7px] text-zinc-650 font-mono">
                          Slot
                        </div>
                      </motion.div>

                      {/* Moving coordinate pair arrow/connection */}
                      <div className="relative w-12 z-20 flex items-center justify-center">
                        <AnimatePresence>
                          {lewisSimState === 'separate' ? (
                            <motion.span
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="text-amber-400 font-mono text-xs font-black"
                            >
                              • •
                            </motion.span>
                          ) : (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              className="w-full flex items-center"
                            >
                              <div className="h-0.5 bg-amber-400 flex-1 relative">
                                <span className="absolute -right-1.5 -top-1 text-amber-400 font-mono text-xs">←</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Right: NH3 (Lewis Base - Lone pair) */}
                      <motion.div
                        animate={lewisSimState === 'separate' ? { x: 30 } : { x: 10 }}
                        className={`flex flex-col items-center p-2 rounded-xl border w-32 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-100/40 border-slate-300'}`}
                      >
                        <span className="text-[8px] font-mono text-teal-400 uppercase mb-1">NH₃ (DONOR PEB)</span>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
                          {lewisSimState === 'separate' && (
                            <span className="text-amber-400 font-bold tracking-widest mr-0.5">• •</span>
                          )}
                          <span className="w-7 h-7 rounded bg-zinc-800 border-2 border-slate-700 flex items-center justify-center">N</span>
                          <span className="text-[10px] text-zinc-550 flex flex-col">
                            <span>H</span>
                            <span>H</span>
                            <span>H</span>
                          </span>
                        </div>
                      </motion.div>

                    </div>

                    <div className="text-[10px] font-mono text-zinc-500 text-center leading-normal">
                      {lewisSimState === 'separate'
                        ? 'NH₃ memiliki sepasang elektron bebas tak terikat (titik jingga). Seret atau gabungkan membentuk senyawa adisi kovalen.'
                        : 'Selesai! Ikatan kovalen koordinasi terbentuk dengan amonia bertindak sebagai donor orbital gas (Basa Lewis) dan BF₃ akseptor asam Lewis.'
                      }
                    </div>

                  </div>

                </div>
              )}

              {/* Footer explanation box */}
              <div className={`p-3 border rounded-xl flex items-start gap-2 text-xs mt-2 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900/60 text-zinc-400' : 'bg-slate-100/80 border-slate-300 text-slate-600'}`}>
                <Info className="w-4 h-4 text-teal-450 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h5 className="font-sans font-bold text-white mb-0.5">Penjelasan Konsep Kimia XI</h5>
                  <p className="text-[11px] leading-relaxed">
                    Setiap teori asam basa memiliki limitasi khusus. Teori Arrhenius mengharuskan pelarut berupa air cair; Brønsted-Lowry memperluasnya ke wujud gas melalui pertukaran ion $H^+$; sementara itu, Lewis menyingkirkan elemen hidrogen sepenuhnya dan menyoroti pergerakan sirkulasi subkulit elektron orbital.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: INDIKATOR ALAMI LAB (EXTRACTION & TESTER)
          ========================================== */}
      {activeTab === 'extractor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Plant Source Selection and Mortar controls */}
          <div className={`lg:col-span-5 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/25 border-slate-900' : 'bg-white border-slate-200'}`}>
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">Plant Pigment Harvester</span>
              <h3 className="text-base font-sans font-bold text-white flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-teal-400" />
                1. Pilih Sumber &amp; Ekstraksi
              </h3>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Gunakan mortir dan alu laboratorium untuk menghancurkan sel tumbuhan, saring zat ampas kasar, kemudian ambil senyawa filtrat murni.
              </p>
            </div>

            {/* List of Natural Materials with botanical facts */}
            <div className="grid grid-cols-2 gap-2.5">
              {NATURAL_INDICATORS.map((ind) => {
                const isActive = ind.id === selectedIndId;
                return (
                  <button
                    key={ind.id}
                    onClick={() => {
                      if (isGrinding || isFiltering) return;
                      setSelectedIndId(ind.id);
                    }}
                    disabled={isGrinding || isFiltering}
                    className={`p-3 text-left rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between min-h-[100px] cursor-pointer ${
                      isActive 
                        ? 'border-teal-500 bg-teal-950/20 text-white shadow-md' 
                        : (theme === 'dark' ? 'border-slate-800 bg-slate-900/40 text-slate-350 hover:border-slate-700 hover:bg-slate-900/60' : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200')
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={`text-xs font-sans font-bold block leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{ind.name}</span>
                      <span className="text-[8px] font-mono text-zinc-600 italic">Class XI</span>
                    </div>

                    <div className="space-y-0.5 mt-2">
                      <span className="text-[8.5px] font-mono text-teal-405 block truncate">{ind.latinName}</span>
                      <span className="text-[9px] font-sans text-zinc-500 block truncate">Zat: {ind.pigment}</span>
                    </div>

                    {/* Miniature representation showing its natural pigment hue */}
                    <div className="absolute right-1 bottom-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ind.extractColorHex }} />
                  </button>
                );
              })}
            </div>

            {/* Simulated Extraction Stage (Steps) */}
            <div className={`p-4 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'}`}>
              
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="text-[10px] font-mono text-zinc-450 uppercase">Progres Ekstraksi Pigmen</span>
                <span className="text-[10px] font-mono font-bold text-teal-400">Tahap {extractorStep} dari 3</span>
              </div>

              {/* STEP 1: Chop/Assemble screen */}
              {extractorStep === 1 && (
                <div className="space-y-3">
                  <p className={`text-[11px] leading-normal ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Letakkan lembar/daun dari bahan <strong>{activeIndicator.name}</strong> ke dalam cawan porselen mortir abu-abu.
                  </p>
                  <button
                    onClick={() => setExtractorStep(2)}
                    className="w-full py-2 bg-slate-901 hover:bg-slate-800 text-teal-400 border border-teal-505/30 transition-all font-mono text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    Masukkan ke Lumpang &amp; Alu
                  </button>
                </div>
              )}

              {/* STEP 2: Grinding screen */}
              {extractorStep === 2 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-zinc-550">Lumatkan &amp; Haluskan:</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-800'}`}>{grindingProgress}%</span>
                  </div>

                  {/* Progress bar of grinding */}
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <motion.div 
                      className="h-full bg-gradient-to-r from-teal-505 to-indigo-500"
                      animate={{ width: `${grindingProgress}%` }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleStartGrinding}
                      disabled={isGrinding || grindingProgress >= 100}
                      className={`flex-1 py-2 font-mono text-xs uppercase font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        grindingProgress >= 100 
                          ? 'bg-zinc-800 text-zinc-650 cursor-not-allowed border border-slate-910' 
                          : 'bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-md active:scale-98'
                      }`}
                    >
                      {isGrinding ? 'Menumbuk...' : 'Tumbuk / Gerus'}
                    </button>

                    {grindingProgress >= 100 && (
                      <button
                        onClick={handleTriggerFiltration}
                        disabled={isFiltering}
                        className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-mono text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
                      >
                        {isFiltering ? 'Menyaring...' : 'Saring Filtrat'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Completed Extraction dropper ready! */}
              {extractorStep === 3 && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-teal-950/10 border border-teal-500/20 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-teal-400 font-bold uppercase block">EKSTRAK FILTRAT SIAP</span>
                      <p className={`text-[11px] font-mono ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-700'}`}>Indikator {activeIndicator.name} murni</p>
                    </div>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                      <Droplet className="w-4 h-4 text-teal-400" />
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs font-mono">
                    <button
                      onClick={handleResetExtractor}
                      className={`flex-1 py-1.5 hover:bg-slate-800 border text-zinc-300 rounded-lg cursor-pointer transition-all uppercase text-[10.5px] ${theme === 'dark' ? 'bg-slate-905 border-slate-850' : 'bg-slate-100 border-slate-300'}`}
                    >
                      Bikin Ekstrak Baru
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Reaction Logs panel */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-550 block uppercase">Lembar Data Eksperimen</span>
              <div className={`p-3 rounded-xl border font-mono text-[10.5px] space-y-1 h-[140px] overflow-y-auto block leading-relaxed ${theme === 'dark' ? 'bg-slate-950 border-slate-900 text-zinc-400' : 'bg-white border-slate-200 text-slate-700'}`}>
                {reactionLogs.map((log, idx) => (
                  <div key={idx} className={idx === 0 ? 'text-teal-405 font-bold border-l-2 border-teal-500/50 pl-2' : 'pl-2 text-zinc-550'}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Test tube rack visual simulator */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className={`border rounded-2xl p-6 flex flex-col justify-between space-y-5 flex-1 min-h-[460px] relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/35 border-slate-900' : 'bg-white border-slate-200'}`}>
              <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

              <div className="flex justify-between items-start border-b border-slate-800/40 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-zinc-550 uppercase">SIMULATOR RAK TABUNG REAKSI</span>
                  <h4 className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                    <Wine className="w-4 h-4 text-indigo-400 animate-pulse" />
                    Pengujian dengan Cairan Rumah Tangga
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-500">Filtrat:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-450 border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    {activeIndicator.name}
                  </span>
                </div>
              </div>

              {!extractionCompleted ? (
                /* Prompt to extract first before testing */
                <div className={`flex-1 flex flex-col justify-center items-center text-center p-8 border border-dashed rounded-xl ${theme === 'dark' ? 'border-slate-800 bg-slate-950/20' : 'border-slate-300 bg-slate-100/20'}`}>
                  <HelpCircle className="w-10 h-10 text-zinc-650 mb-3.5" />
                  <h5 className="font-sans font-bold text-white text-sm mb-1">Mulai Ekstraksi Lebih Dulu</h5>
                  <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                    Eksperimen rak tabung reaksi dikunci hingga Anda menyelesaikan tahap "Tumbuk" dan "Saring Filtrat" pada panel sebelah kiri.
                  </p>
                </div>
              ) : (
                /* Interactive test tubes rack representation */
                <div className="flex-1 flex flex-col justify-between space-y-6 pt-2">
                  
                  <div className={`text-[11px] italic leading-relaxed text-center border p-2.5 rounded-xl ${theme === 'dark' ? 'text-zinc-400 bg-slate-950 border-slate-920/20' : 'text-slate-600 bg-slate-100 border-slate-300'}`}>
                    💡 <strong>Cara Pengujian:</strong> Klik tombol <strong className="text-teal-400">"Teteskan Indikator"</strong> di bawah masing-masing tabung reaksi berisi larutan uji untuk mengamati secara langsung warna baru pigmen {activeIndicator.pigment} dalam berbagai rentang pH.
                  </div>

                  {/* The Row of 7 Test Tubes */}
                  <div className={`grid grid-cols-7 gap-3.5 relative py-6 px-3 border rounded-2xl shadow-inner flex-1 items-end min-h-[220px] ${theme === 'dark' ? 'bg-slate-905/30 border-slate-900/60' : 'bg-slate-100/30 border-slate-300'}`}>
                    
                    {HOUSEHOLD_SOLUTIONS.map((sol) => {
                      const tubeState = tubePouredStates[sol.id] || 'empty';
                      
                      // Determine target background color representing the chemical + drops
                      let fluidBg = 'bg-slate-800/15 border-slate-700/20'; // Neutral clear transparency
                      let fluidText = 'text-zinc-600';

                      if (tubeState === 'poured' || tubeState === 'testing') {
                        let k: keyof typeof activeIndicator.pHColors = 'pH7_8';
                        if (sol.actualPH <= 2) k = 'pH1_2';
                        else if (sol.actualPH <= 4) k = 'pH3_4';
                        else if (sol.actualPH <= 6) k = 'pH5_6';
                        else if (sol.actualPH <= 8) k = 'pH7_8';
                        else if (sol.actualPH <= 10) k = 'pH9_10';
                        else if (sol.actualPH <= 12) k = 'pH11_12';
                        else k = 'pH13_14';

                        const matchColor = activeIndicator.pHColors[k];
                        fluidBg = matchColor.bg;
                        fluidText = matchColor.text;
                      }

                      return (
                        <div key={sol.id} className="flex flex-col items-center space-y-3 group relative cursor-help">
                          {/* Tube hover info popup stats */}
                          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 border text-[10px] font-mono leading-normal rounded shadow-xl hidden group-hover:block z-30 pointer-events-none ${theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-100/90 border-slate-300'}`}>
                            <span className="font-bold text-white block truncate">{sol.name}</span>
                            <span className="text-zinc-450 block truncate">Formula: {sol.chemicalFormula}</span>
                            <span className="text-teal-400 font-bold block">pH: {sol.actualPH}</span>
                            <span className="text-rose-455 block truncate">Sifat: {sol.type}</span>
                          </div>

                          <div className="text-[8.5px] font-mono text-zinc-550 font-bold text-center h-7 select-none flex flex-col justify-end leading-tight truncate px-1 max-w-[80px]">
                            <span>{sol.name.split(' ').slice(-1)[0]}</span>
                            <span className="text-zinc-600 text-[7px]" style={{ color: sol.actualPH > 7 ? '#6366f1' : sol.actualPH < 7 ? '#f43f5e' : '#4b5563' }}>
                              pH {sol.actualPH}
                            </span>
                          </div>

                          {/* The 3D Glass Tube Body */}
                          <div className={`w-9 h-32 border-l-2 border-r-2 border-b-4 border-slate-700 rounded-b-2xl relative overflow-hidden flex flex-col justify-end shadow-inner ${theme === 'dark' ? 'bg-slate-900/10' : 'bg-slate-100/10'}`}>
                            {/* Graduation marks */}
                            <div className="absolute right-0.5 top-6 bottom-4 w-1.5 flex flex-col justify-between text-[5px] font-mono text-slate-700 pointer-events-none">
                              <span>-</span>
                              <span>-</span>
                              <span>-</span>
                            </div>

                            {/* Dropping water transition */}
                            {tubeState === 'testing' && (
                              <motion.span
                                initial={{ y: -30, opacity: 0.8 }}
                                animate={{ y: 90, opacity: 0 }}
                                transition={{ duration: 0.9, repeat: Infinity }}
                                className="absolute top-0 inset-x-0 mx-auto w-1 h-3 rounded-full bg-teal-405 z-10 block"
                              />
                            )}

                            {/* Fluid inside */}
                            <motion.div
                              animate={
                                tubeState !== 'empty'
                                  ? { height: '55%' }
                                  : { height: '40%' }
                              }
                              className={`w-full rounded-b-xl transition-colors duration-1000 ${
                                tubeState === 'empty' ? 'bg-sky-400/10 border-t border-sky-455/10' : fluidBg
                              }`}
                            />
                          </div>

                          {/* Trigger Dropping Button */}
                          <button
                            onClick={() => handleDropToTube(sol.id)}
                            disabled={tubeState === 'testing'}
                            className={`px-1.5 py-1 rounded text-[7.5px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                              tubeState === 'poured'
                                ? 'bg-slate-900 text-teal-405 border-slate-800 hover:bg-slate-800'
                                : 'bg-teal-505 text-slate-950 border-teal-555 hover:bg-teal-605'
                            }`}
                          >
                            {tubeState === 'empty' && 'Tetes'}
                            {tubeState === 'testing' && '⏳'}
                            {tubeState === 'poured' && 'Ulang'}
                          </button>
                        </div>
                      );
                    })}

                  </div>

                </div>
              )}

              {/* Theoretical Summary Bottom line card */}
              {extractionCompleted && (
                <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl text-[11px] leading-relaxed text-zinc-455 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5 animate-spin duration-3000" />
                  <div>
                    <h5 className="font-sans font-bold text-white text-xs">Aktivitas Pigmen: {activeIndicator.pigment}</h5>
                    <p className="text-[10.5px]">
                      Kelarutan antosianin di vakuola tanaman {activeIndicator.name} adalah sensor proton kualitatif alami. Struktur kimianya rentan bertransformasi akibat perpindahan ion hidrogen ($H^+$), memunculkan kilasan spektrum visual tersendiri pada pH ekstrem.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 3: pH COLOR SPECTRUM COMPASS (SLIDER)
          ========================================== */}
      {activeTab === 'scale' && (
        <div className={`border rounded-2xl p-5 md:p-8 space-y-8 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-908' : 'bg-slate-100/30 border-slate-300'}`}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-teal-404 font-bold uppercase block tracking-wider">Comparative Scale Spectrum</span>
              <h3 className="text-lg font-sans font-bold text-white flex items-center gap-1.5">
                <Gauge className="w-5 h-5 text-teal-400 animate-pulse" />
                Spektrum Skala Warna pH Indikator
              </h3>
              <p className="text-xs text-zinc-500">
                Geser nilai pH untuk mengamati pergeseran warna serentak dari semua indikator alami (Kelas XI) versus indikator standar laboratorium.
              </p>
            </div>

            {/* pH Value display card */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border shrink-0 select-none ${theme === 'dark' ? 'bg-slate-950 border-slate-910' : 'bg-slate-100 border-slate-300'}`}>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Input pH:</span>
              <span className="text-3xl font-mono font-black text-white px-2 tracking-tighter" style={{ color: sliderPH > 7 ? '#818cf8' : sliderPH < 7 ? '#f43f5e' : '#14b8a6' }}>
                {sliderPH.toFixed(1)}
              </span>
              <span className={`text-[10px] font-bold font-mono uppercase px-2 py-1 rounded ${
                sliderPH > 7 ? 'bg-indigo-950/40 text-indigo-400' : sliderPH < 7 ? 'bg-red-950/40 text-rose-400' : 'bg-teal-950/40 text-teal-405'
              }`}>
                {sliderPH > 7 ? '⚡ BASA' : sliderPH < 7 ? '🔥 ASAM' : '✓ NETRAL'}
              </span>
            </div>
          </div>

          {/* Large Slider control bar */}
          <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center gap-6 ${theme === 'dark' ? 'bg-slate-955 border-slate-905' : 'bg-slate-100 border-slate-300'}`}>
            <div className="text-left w-full md:w-36 shrink-0 font-mono text-xs">
              <span className="text-[10px] text-zinc-550 uppercase font-black block">Atur Nilai H⁺</span>
              <span className="text-zinc-300 font-sans font-bold text-sm leading-normal">Geser pH Slider:</span>
            </div>
            
            <div className="w-full flex-1 flex flex-col space-y-2">
              <input
                type="range"
                min="1.0"
                max="14.0"
                step="0.5"
                value={sliderPH}
                onChange={(e) => setSliderPH(parseFloat(e.target.value))}
                className={`w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-teal-400 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
              />
              {/* Scale numbers under tick */}
              <div className="flex justify-between text-[9px] font-mono text-zinc-550 px-1">
                <span>pH 1 (Asam kuat)</span>
                <span>4</span>
                <span>7 (Netral)</span>
                <span>10</span>
                <span>pH 14 (Basa kuat)</span>
              </div>
            </div>
          </div>

          {/* Grid Side by Side color indicators comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. Universal Indicator standard laboratory representation */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[140px] shadow-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-920' : 'bg-slate-100 border-slate-300'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[8px] font-mono text-zinc-550 uppercase">SINTETIK LABORATORIUM</span>
                  <p className="text-xs font-sans font-bold text-white">Indikator Universal Cair</p>
                </div>
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: getUniversalIndicatorColor(sliderPH) }} />
              </div>
              <div className={`py-4 rounded-xl text-center text-xs font-mono font-bold text-slate-950 ${getUniversalIndicatorColor(sliderPH)} transition-all duration-300`}>
                Warna Spektrum pH: {sliderPH <= 2 ? 'Merah' : sliderPH <= 5 ? 'Oranye' : sliderPH <= 7 ? 'Hijau' : sliderPH <= 11 ? 'Biru' : 'Ungu'}
              </div>
              <p className="text-[10px] text-zinc-550 leading-tight mt-2 italic font-mono">
                Menggunakan campuran metil merah, fenolftalein, dan bromotimol biru untuk mendapatkan gradasi pH linear.
              </p>
            </div>

            {/* 2. Litmus Paper */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[140px] shadow-sm ${theme === 'dark' ? 'bg-slate-950 border-slate-920' : 'bg-slate-100 border-slate-300'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[8px] font-mono text-zinc-550 uppercase">STANDARD LITMUS PAPER</span>
                  <p className="text-xs font-sans font-bold text-white">Kertas Lakmus Merah/Biru</p>
                </div>
                <div className="flex gap-1">
                  <span className={`w-3 h-4 rounded ${sliderPH >= 7.0 ? 'bg-blue-500' : 'bg-red-500'}`} />
                  <span className={`w-3 h-4 rounded ${sliderPH <= 7.0 ? 'bg-red-500' : 'bg-blue-500'}`} />
                </div>
              </div>
              
              <div className="flex gap-3 my-2">
                <div className={`flex-1 py-1 px-2 rounded text-center text-[10px] font-mono text-white ${sliderPH < 7 ? 'bg-red-650' : 'bg-blue-600'} transition-all`}>
                  Lakmus Merah: {sliderPH < 7 ? 'Tetap Merah' : 'Jadi Biru'}
                </div>
                <div className={`flex-1 py-1 px-2 rounded text-center text-[10px] font-mono text-white ${sliderPH > 7 ? 'bg-blue-600' : 'bg-red-650'} transition-all`}>
                  Lakmus Biru: {sliderPH > 7 ? 'Tetap Biru' : 'Jadi Merah'}
                </div>
              </div>

              <p className="text-[10px] text-zinc-550 leading-tight italic font-mono">
                Indikator biner sederhana; sangat baik menentukan kategori biner pH di atas atau di bawah trayek netralitas 7.0.
              </p>
            </div>

            {/* 3-6. Natural Indicators color renders */}
            {NATURAL_INDICATORS.map((ind) => {
              const info = getPHColorDetails(ind.id, sliderPH);
              return (
                <div key={ind.id} className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[140px] transition-all ${theme === 'dark' ? 'bg-slate-950 border-slate-910 hover:border-slate-800' : 'bg-slate-100 border-slate-300 hover:border-slate-400'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase">EKSTRAK ALAMI PIGMEN</span>
                      <p className="text-xs font-sans font-bold text-teal-400">{ind.name}</p>
                    </div>
                    {/* Small dot highlighting its current color */}
                    <div className="w-4.5 h-4.5 rounded-full border border-slate-800 transition-colors duration-500" style={{ backgroundColor: info.hex }} />
                  </div>

                  <div 
                    className="py-3 px-2 rounded-xl text-center text-[11px] font-mono font-bold text-white transition-colors duration-500 shadow-inner"
                    style={{ backgroundColor: info.hex }}
                  >
                    {info.label} ({info.hex})
                  </div>

                  <div className="text-[9.5px] text-zinc-550 leading-tight mt-1.5 font-sans">
                    <strong>Penyebab:</strong> {sliderPH <= 6.5 ? ind.acidDescription.slice(0, 75) + '...' : ind.baseDescription.slice(0, 75) + '...'}
                  </div>
                </div>
              );
            })}

          </div>

          {/* Quick chemistry lesson about litmus & synthetic pH */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${theme === 'dark' ? 'bg-slate-905 border-slate-850/30 text-zinc-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
            <h5 className="font-sans font-bold text-white text-sm mb-1.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-400" />
              Mengapa Trayek Warna Berbeda?
            </h5>
            <p className="text-[11px] text-zinc-450">
              Trayek perubahan warna indikator alami dipengaruhi oleh nilai <strong className="text-teal-405">konstanta disosiasi asam ($pK_a$)</strong> pigmen organik di dalamnya. Contohnya, kurkumin pada kunyit memiliki nilai $pK_a$ sekitar 8.5, sehingga perubahan warna dari kuning cerah ke cokelat merah bata eksklusif berlangsung pada range pH basa tinggi. Sedangkan antosianin kol ungu bertindak sebagai asam poliprotik lemah multipel sehingga sensitif di hampir semua angka pH.
            </p>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 3.5: HIGH SCHOOL pH CALCULATOR
          ========================================== */}
      {activeTab === 'phCalc' && (
        <div id="ph-calc-panel" className={`border rounded-2xl p-5 md:p-8 space-y-6 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}>
          <div className="border-b border-slate-800/60 pb-4">
            <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block mb-1">Materi Stoikiometri Larutan Asam Basa</span>
            <h3 className="text-lg font-sans font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-400" />
              Kalkulator Rumus &amp; Prediksi Warna pH Larutan (Kelas XI)
            </h3>
            <p className="text-xs text-zinc-400 leading-normal max-w-3xl font-sans">
              Gunakan simulator interaktif ini untuk menghitung pH larutan berdasarkan jenis asam/basa (kuat vs lemah), molaritas konsentrasi, valensi, dan nilai tetapan disosiasi ($K_a$ / $K_b$). Bandingkan rumus teoretis dengan hasil warna di lab!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div id="calculator-inputs-card" className={`lg:col-span-12 xl:col-span-5 p-5 rounded-2xl border space-y-5 flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-450 block font-bold uppercase">1. Pilih Preset Larutan Kimia:</label>
                  <select
                    id="preset-solution-picker"
                    value={calcActivePreset}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCalcActivePreset(val);
                      if (val === 'hcl') {
                        setCalcSolType('strongAcid');
                        setCalcConcentration(0.1);
                        setCalcValence(1);
                      } else if (val === 'h2so4') {
                        setCalcSolType('strongAcid');
                        setCalcConcentration(0.05);
                        setCalcValence(2);
                      } else if (val === 'hno3') {
                        setCalcSolType('strongAcid');
                        setCalcConcentration(0.01);
                        setCalcValence(1);
                      } else if (val === 'acetic_standard') {
                        setCalcSolType('weakAcid');
                        setCalcConcentration(0.1);
                        setCalcPkaPkbSlider(4.74);
                      } else if (val === 'formic_acid') {
                        setCalcSolType('weakAcid');
                        setCalcConcentration(0.1);
                        setCalcPkaPkbSlider(3.74);
                      } else if (val === 'naoh_standard') {
                        setCalcSolType('strongBase');
                        setCalcConcentration(0.1);
                        setCalcValence(1);
                      } else if (val === 'baoh2') {
                        setCalcSolType('strongBase');
                        setCalcConcentration(0.05);
                        setCalcValence(2);
                      } else if (val === 'koh_dilute') {
                        setCalcSolType('strongBase');
                        setCalcConcentration(0.01);
                        setCalcValence(1);
                      } else if (val === 'nh3_standard') {
                        setCalcSolType('weakBase');
                        setCalcConcentration(0.1);
                        setCalcPkaPkbSlider(4.74);
                      } else if (val === 'methylamine') {
                        setCalcSolType('weakBase');
                        setCalcConcentration(0.01);
                        setCalcPkaPkbSlider(3.36);
                      }
                    }}
                    className={`w-full border rounded-xl p-2.5 text-xs font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer text-zinc-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  >
                    <option value="custom">-- Kustom / Atur Sendiri --</option>
                    <optgroup label="Asam Kuat (Ionisasi Sempurna)">
                      <option value="hcl">HCl 0.1 M (Asam Lambung)</option>
                      <option value="h2so4">H₂SO₄ 0.05 M (Aki Motor / Divalen)</option>
                      <option value="hno3">HNO₃ 0.01 M (Asam Nitrat Encer)</option>
                    </optgroup>
                    <optgroup label="Asam Lemah (Ionisasi Sebagian)">
                      <option value="acetic_standard">CH₃COOH 0.1 M (Asam Cuka Masak, Ka = 1.8e-5)</option>
                      <option value="formic_acid">HCOOH 0.1 M (Asam Semut, Ka = 1.8e-4)</option>
                    </optgroup>
                    <optgroup label="Basa Kuat (Disosiasi Hidroksil)">
                      <option value="naoh_standard">NaOH 0.1 M (Sodapi / Pembersih Saluran)</option>
                      <option value="baoh2">Ba(OH)₂ 0.05 M (Barium Basa / Divalen)</option>
                      <option value="koh_dilute">KOH 0.01 M (Basa Sabun Encer)</option>
                    </optgroup>
                    <optgroup label="Basa Lemah (Kesetimbangan Amina)">
                      <option value="nh3_standard">NH₃ 0.1 M (Amoniak Cairan Pembersih, Kb = 1.8e-5)</option>
                      <option value="methylamine">CH₃NH₂ 0.01 M (Metilamina Gas Larut, Kb = 4.4e-4)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-450 uppercase block font-bold">2. Tipe Karakter Elektrolit:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="toggle-strong-acid"
                      onClick={() => {
                        setCalcSolType('strongAcid');
                        setCalcActivePreset('custom');
                      }}
                      className={`py-2 px-3 border rounded-xl font-mono text-[10.5px] font-bold text-center transition-all cursor-pointer ${
                        calcSolType === 'strongAcid' ? 'border-red-500 bg-red-950/20 text-red-400' : 'border-slate-850 bg-slate-900/40 text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      Asam Kuat (α=1)
                    </button>
                    <button
                      id="toggle-weak-acid"
                      onClick={() => {
                        setCalcSolType('weakAcid');
                        setCalcActivePreset('custom');
                      }}
                      className={`py-2 px-3 border rounded-xl font-mono text-[10.5px] font-bold text-center transition-all cursor-pointer ${
                        calcSolType === 'weakAcid' ? 'border-amber-500 bg-amber-950/20 text-amber-400' : 'border-slate-850 bg-slate-900/40 text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      Asam Lemah (α&lt;1)
                    </button>
                    <button
                      id="toggle-strong-base"
                      onClick={() => {
                        setCalcSolType('strongBase');
                        setCalcActivePreset('custom');
                      }}
                      className={`py-2 px-3 border rounded-xl font-mono text-[10.5px] font-bold text-center transition-all cursor-pointer ${
                        calcSolType === 'strongBase' ? 'border-indigo-500 bg-indigo-950/20 text-indigo-400' : 'border-slate-850 bg-slate-900/40 text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      Basa Kuat (α=1)
                    </button>
                    <button
                      id="toggle-weak-base"
                      onClick={() => {
                        setCalcSolType('weakBase');
                        setCalcActivePreset('custom');
                      }}
                      className={`py-2 px-3 border rounded-xl font-mono text-[10.5px] font-bold text-center transition-all cursor-pointer ${
                        calcSolType === 'weakBase' ? 'border-teal-500 bg-teal-950/20 text-teal-400' : 'border-slate-850 bg-slate-900/40 text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      Basa Lemah (α&lt;1)
                    </button>
                  </div>
                </div>

                <div className={`space-y-1.5 p-3.5 border rounded-xl ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                  <div className="flex justify-between items-center text-[10.5px] font-mono">
                    <span className="text-zinc-400 font-bold">3. Molaritas Larutan (M) :</span>
                    <strong className="text-teal-400">{calcConcentration.toFixed(4)} M</strong>
                  </div>
                  <input
                    id="concentration-slider"
                    type="range"
                    min="0.0001"
                    max="1.0"
                    step="0.0001"
                    value={calcConcentration}
                    onChange={(e) => {
                      setCalcConcentration(parseFloat(e.target.value));
                      setCalcActivePreset('custom');
                    }}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-teal-400 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}
                  />
                  <div className="flex justify-between text-[8px] font-mono text-zinc-650 leading-tight">
                    <span>Sangat Encer (0.0001 M)</span>
                    <span>Pekat (1.0 M)</span>
                  </div>
                </div>

                {(calcSolType === 'strongAcid' || calcSolType === 'strongBase') ? (
                  <div className={`space-y-1.5 p-3 border rounded-xl ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <div className="flex justify-between items-center text-[10.5px] font-mono">
                      <span className="text-zinc-440 font-bold">4. Jumlah Valensi Ion (a / b) :</span>
                      <strong className="text-rose-400">{calcValence} Ion H⁺/OH⁻</strong>
                    </div>
                    <div className={`flex p-1 rounded-lg gap-1 border ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                      {[1, 2, 3].map((val) => (
                        <button
                          key={val}
                          onClick={() => {
                            setCalcValence(val);
                            setCalcActivePreset('custom');
                          }}
                          className={`flex-1 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-all ${
                            calcValence === val ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20 font-black' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Valensi {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`space-y-1.5 p-3.5 border rounded-xl ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="flex justify-between items-center text-[10.5px] font-mono">
                      <span className="text-zinc-440 font-bold">4. Nilai Tetapan Disosiasi (pKₐ / pK₆) :</span>
                      <strong className="text-amber-400">{calcPkaPkbSlider.toFixed(2)}</strong>
                    </div>
                    <input
                      id="pkapkb-slider"
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.05"
                      value={calcPkaPkbSlider}
                      onChange={(e) => {
                        setCalcPkaPkbSlider(parseFloat(e.target.value));
                        setCalcActivePreset('custom');
                      }}
                      className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}
                    />
                    <div className="flex justify-between text-[8px] font-mono text-zinc-555 leading-none">
                      <span>Kuat/Kecil (pK<sub>a</sub>=1)</span>
                      <span>Sangat Lemah (pK<sub>a</sub>=10)</span>
                    </div>
                    <div className="text-[9px] leading-tight text-zinc-555 mt-1 font-mono">
                      Nilai konstan disosiasi terkonversi: <strong className="text-amber-400 font-bold">K = {(Math.pow(10, -calcPkaPkbSlider)).toExponential(2)}</strong>
                    </div>
                  </div>
                )}
              </div>

              <button
                id="reset-calcs-btn"
                onClick={() => {
                  setCalcSolType('strongAcid');
                  setCalcConcentration(0.1);
                  setCalcValence(1);
                  setCalcActivePreset('custom');
                }}
                className={`w-full py-1.5 border rounded-lg text-xs font-mono transition-colors uppercase cursor-pointer ${theme === 'dark' ? 'border-slate-900 bg-slate-900/20 hover:bg-slate-900 text-zinc-400 hover:text-white' : 'border-slate-300 bg-slate-100/20 hover:bg-slate-200 text-slate-600 hover:text-slate-900'}`}
              >
                Reset Setelan Larutan
              </button>
            </div>

            <div className="lg:col-span-12 xl:col-span-7 flex flex-col md:flex-row gap-4 items-stretch">
              <div id="calculator-blackboard-log" className={`flex-1 border rounded-2xl p-4 md:p-5 flex flex-col justify-between font-mono text-[11px] leading-relaxed relative overflow-hidden shadow-inner space-y-4 ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <span className="absolute right-2 top-2 text-[7.5px] font-medium text-zinc-700 tracking-wider">BOARD PERHITUNGAN XI</span>

                <div className="space-y-3">
                  <div className="border-b border-slate-900 pb-2">
                    <span className="text-[9px] text-zinc-500 uppercase font-black block mb-0.5">Rumus Stoikiometri:</span>
                    <div className="text-[13px] font-black tracking-tight text-white font-mono">
                      {calcSolType === 'strongAcid' && <span>[H⁺] = a · Mₐ</span>}
                      {calcSolType === 'weakAcid' && <span>[H⁺] = √(Kₐ · Mₐ)</span>}
                      {calcSolType === 'strongBase' && <span>[OH⁻] = b · M₆</span>}
                      {calcSolType === 'weakBase' && <span>[OH⁻] = √(K₆ · M₆)</span>}
                    </div>
                  </div>

                  <div className="space-y-4 text-zinc-350 font-mono">
                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-550 block font-bold uppercase">Langkah 1: Analisis Informasi Zat Terlarut</span>
                      <p className="text-zinc-400 leading-tight">
                        {calcSolType === 'strongAcid' && `Asam kuat dengan molaritas Mₐ = ${calcConcentration.toFixed(4)} M dan valensi proton a = ${calcValence}.`}
                        {calcSolType === 'weakAcid' && `Asam lemah dengan molaritas Mₐ = ${calcConcentration.toFixed(4)} M dan tetapan ionisasi K␘ = ${(Math.pow(10, -calcPkaPkbSlider)).toExponential(2)}.`}
                        {calcSolType === 'strongBase' && `Basa kuat dengan molaritas M₆ = ${calcConcentration.toFixed(4)} M dan valensi hidroksil b = ${calcValence}.`}
                        {calcSolType === 'weakBase' && `Basa lemah dengan molaritas M₆ = ${calcConcentration.toFixed(4)} M dan tetapan ionisasi K₆ = ${(Math.pow(10, -calcPkaPkbSlider)).toExponential(2)}.`}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-550 block font-bold uppercase">Langkah 2: Menghitung Konsentrasi Ion Akhir</span>
                      <div className={`p-2 border rounded-lg ${theme === 'dark' ? 'bg-slate-900 border-slate-850/60 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}>
                        {calcSolType === 'strongAcid' && (
                          <span>
                            [H⁺] = {calcValence} × {calcConcentration.toFixed(4)} M <br/>
                            <strong>[H⁺] = {(calcConcentration * calcValence).toExponential(4)} M</strong>
                          </span>
                        )}
                        {calcSolType === 'weakAcid' && (
                          <span>
                            [H⁺] = √({(Math.pow(10, -calcPkaPkbSlider)).toExponential(2)} × {calcConcentration.toFixed(4)}) M<br/>
                            <strong>[H⁺] = {Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration).toExponential(4)} M</strong>
                          </span>
                        )}
                        {calcSolType === 'strongBase' && (
                          <span>
                            [OH⁻] = {calcValence} × {calcConcentration.toFixed(4)} M <br/>
                            <strong>[OH⁻] = {(calcConcentration * calcValence).toExponential(4)} M</strong>
                          </span>
                        )}
                        {calcSolType === 'weakBase' && (
                          <span>
                            [OH⁻] = √({(Math.pow(10, -calcPkaPkbSlider)).toExponential(2)} × {calcConcentration.toFixed(4)}) M<br/>
                            <strong>[OH⁻] = {Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration).toExponential(4)} M</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-zinc-550 block font-bold uppercase">Langkah 3: Menghitung Skala Logaritmik (pH)</span>
                      <p className="text-zinc-400 leading-tight">
                        {calcSolType === 'strongAcid' && (
                          <span>
                            pH = -log([H⁺]) = -log({(calcConcentration * calcValence).toExponential(4)}) <br/>
                            <strong>pH = {-Math.log10(calcConcentration * calcValence) < 0 ? '0.00' : (-Math.log10(calcConcentration * calcValence)).toFixed(2)}</strong>
                          </span>
                        )}
                        {calcSolType === 'weakAcid' && (
                          <span>
                            pH = -log([H⁺]) = -log({Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration).toExponential(4)}) <br/>
                            <strong>pH = {-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration)) < 0 ? '0.00' : (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))).toFixed(2)}</strong>
                          </span>
                        )}
                        {calcSolType === 'strongBase' && (
                          <span>
                            pOH = -log([OH⁻]) = -log({(calcConcentration * calcValence).toExponential(4)}) = {-Math.log10(calcConcentration * calcValence) < 0 ? '0.00' : (-Math.log10(calcConcentration * calcValence)).toFixed(2)} <br/>
                            pH = 14 - pOH = 14 - {-Math.log10(calcConcentration * calcValence) < 0 ? '0.00' : (-Math.log10(calcConcentration * calcValence)).toFixed(2)} <br/>
                            <strong>pH = {(14 - (-Math.log10(calcConcentration * calcValence))).toFixed(2)}</strong>
                          </span>
                        )}
                        {calcSolType === 'weakBase' && (
                          <span>
                            pOH = -log([OH⁻]) = -log({Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration).toExponential(4)}) = {-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration)) < 0 ? '0.00' : (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))).toFixed(2)} <br/>
                            pH = 14 - pOH = 14 - {-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration)) < 0 ? '0.00' : (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))).toFixed(2)} <br/>
                            <strong>pH = {(14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration)))).toFixed(2)}</strong>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {calcConcentration < 1e-6 && (
                  <div className="p-2 border border-blue-900 bg-blue-950/15 text-[9.5px] leading-tight text-zinc-450 rounded animate-pulse font-sans">
                    ⚠️ <strong>Efek Auto-Ionisasi Air:</strong> pH riil tidak pernah melebihi 7/netral pada air murni murni akibat disosiasi molekul air alami ([H⁺]=[OH⁻]=1e-7 M) yang melarutkan proton sisa.
                  </div>
                )}
              </div>

              <div id="calculator-beaker-preview" className={`w-full md:w-52 border rounded-2xl p-4 flex flex-col justify-between items-stretch overflow-hidden relative shrink-0 shadow-lg select-none ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <span className="text-[7.5px] font-mono text-zinc-550 uppercase text-center block tracking-wide mb-1 font-sans">Prediksi Kualitatif Lakmus</span>
                
                <div className="flex-1 flex flex-col items-center justify-center relative min-h-[140px]">
                  <div className={`w-24 h-32 border-l-2 border-r-2 border-b-4 rounded-b-xl relative flex flex-col justify-end overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-slate-900/10' : 'border-slate-300 bg-slate-100/10'}`}>
                    <div className="absolute left-1 inset-y-0 flex flex-col justify-between text-[5px] text-zinc-750 pointer-events-none py-4 font-mono">
                      <span>- 100 mL</span>
                      <span>- 50 mL</span>
                    </div>

                    <div
                      className="w-full h-3/5 border-t border-white/20 transition-all duration-700 relative flex items-center justify-center font-mono"
                      style={{
                        backgroundColor:
                          (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                           calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                           calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                           (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 2
                            ? '#dc262635'
                            : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                               calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                               calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                               (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 4
                            ? '#f9731635'
                            : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                               calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                               calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                               (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 6
                            ? '#eab30835'
                            : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                               calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                               calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                               (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 8
                            ? '#10b98135'
                            : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                               calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                               calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                               (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 11
                            ? '#3b82f635'
                            : '#7c3aed35',
                        borderColor:
                          (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                           calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                           calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                           (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 2
                            ? '#dc262660'
                            : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                               calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                               calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                               (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 4
                            ? '#f9731660'
                            : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                               calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                               calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                               (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 6
                            ? '#eab30860'
                            : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                               calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                               calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                               (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 8
                            ? '#10b98160'
                            : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                               calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                               calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                               (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) <= 11
                            ? '#3b82f660'
                            : '#7c3aed60'
                      }}
                    >
                      <span className="text-[13px] font-mono font-black text-white/55 tracking-tighter">
                        pH {(calcSolType === 'strongAcid' ? Math.max(0, -Math.log10(calcConcentration * calcValence)) :
                             calcSolType === 'weakAcid' ? Math.max(0, -Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                             calcSolType === 'strongBase' ? Math.min(14, (14 - (-Math.log10(calcConcentration * calcValence)))) :
                             Math.min(14, (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration)))))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center font-mono space-y-1 mt-2 border-t border-slate-900 pt-2 text-[10.5px]">
                  <span className="text-[8px] text-zinc-550 block uppercase font-bold">Status Larutan:</span>
                  <div
                    className="font-bold uppercase tracking-wide text-[11px]"
                    style={{
                      color:
                        (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                         calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                         calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                         (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) < 7.0
                          ? '#f43f5e'
                          : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                             calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                             calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                             (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) > 7.0
                          ? '#818cf8'
                          : '#14b8a6'
                    }}
                  >
                    {(calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                      calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                      calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                      (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) < 3.0
                      ? 'Sangat Asam'
                      : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                         calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                         calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                         (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) < 7.0
                      ? 'Asam Lemah / Medium'
                      : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                         calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                         calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                         (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) === 7.0
                      ? 'Netral Murni'
                      : (calcSolType === 'strongAcid' ? (-Math.log10(calcConcentration * calcValence)) :
                         calcSolType === 'weakAcid' ? (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))) :
                         calcSolType === 'strongBase' ? (14 - (-Math.log10(calcConcentration * calcValence))) :
                         (14 - (-Math.log10(Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))))) < 11.0
                      ? 'Basa Lemah'
                      : 'Basa Kuat Ekstrem'}
                  </div>
                  <span className="text-[7.5px] text-zinc-550 block leading-tight font-mono">
                    Konsentrasi ion: <br/><strong> [H⁺] ≈ {(calcSolType === 'strongAcid' ? (calcConcentration * calcValence) :
                                                       calcSolType === 'weakAcid' ? (Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration)) :
                                                       calcSolType === 'strongBase' ? (1e-14 / (calcConcentration * calcValence)) :
                                                       (1e-14 / Math.sqrt(Math.pow(10, -calcPkaPkbSlider) * calcConcentration))).toExponential(2)} M</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: INTEGRATED CHEMISTRY QUIZ
          ========================================== */}
      {activeTab === 'quiz' && (
        <div className={`max-w-2xl mx-auto border rounded-2xl p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/35 border-slate-900' : 'bg-slate-100/35 border-slate-300'}`}>
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-teal-450 uppercase block tracking-wider">Akurasi Pembelajaran Mandiri</span>
              <h3 className="text-base font-sans font-bold text-white flex items-center gap-1.5">
                <Award className="w-5 h-5 text-teal-405" />
                Ujian Pemahaman Asam Basa Dasar XI
              </h3>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Progres Soal:</span>
              <span className="text-sm font-mono font-bold text-white">{quizIdx + 1} / {ACID_BASE_QUIZ.length}</span>
            </div>
          </div>

          {!quizComplete ? (
            /* Active Question Panel */
            <div className="space-y-6">
              
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <span className="text-[10.5px] font-mono text-teal-400 block font-bold mb-1">PERTANYAAN:</span>
                <p className="text-sm font-sans leading-relaxed text-white">
                  {ACID_BASE_QUIZ[quizIdx].question}
                </p>
              </div>

              {/* Options lists with click logic and focus targets */}
              <div className="space-y-3">
                {ACID_BASE_QUIZ[quizIdx].options.map((opt, oIdx) => {
                  const isSelected = selectedOptIdx === oIdx;
                  let optStyle = 'border-slate-800 bg-slate-900/20 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40';

                  if (isSelected) {
                    optStyle = 'border-teal-500 bg-teal-950/20 text-teal-300';
                  }

                  if (quizAnswered) {
                    if (opt.correct) {
                      optStyle = 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold';
                    } else if (isSelected) {
                      optStyle = 'border-red-500 bg-red-950/20 text-red-400';
                    } else {
                      optStyle = 'border-slate-900 bg-slate-950 text-slate-600 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectQuizOption(oIdx)}
                      disabled={quizAnswered}
                      className={`w-full p-3.5 text-left text-xs rounded-xl border transition-all cursor-pointer ${optStyle}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt.text}</span>
                        {quizAnswered && opt.correct && (
                          <CheckCircle className="w-4 h-4 text-emerald-450 shrink-0" />
                        )}
                        {quizAnswered && isSelected && !opt.correct && (
                          <X className="w-4 h-4 text-red-450 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action and feedback footer layout */}
              <div className="pt-2">
                
                {quizAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-teal-955/20 border border-teal-900/30 rounded-xl space-y-1 mb-4 text-xs leading-relaxed"
                  >
                    <span className="font-bold text-teal-400 block font-sans">Penjelasan Kimis:</span>
                    <p className="text-zinc-300">{ACID_BASE_QUIZ[quizIdx].feedback}</p>
                  </motion.div>
                )}

                <div className="flex justify-end gap-3 font-mono">
                  {selectedOptIdx !== null && !quizAnswered && (
                    <button
                      onClick={handleApplyQuizAnswer}
                      className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all active:scale-98"
                    >
                      Kirim Jawaban
                    </button>
                  )}

                  {quizAnswered && (
                    <button
                      onClick={handleNextQuiz}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-xl cursor-pointer transition-all flex items-center gap-1"
                    >
                      {quizIdx === ACID_BASE_QUIZ.length - 1 ? 'Selesaikan Kuis' : 'Soal Berikutnya'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>

            </div>
          ) : (
            /* Completed Score Screen showing graduation outcome */
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center justify-center mx-auto text-teal-400 font-bold">
                <Award className="w-8 h-8 text-teal-400 animate-spin duration-3000" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-sans font-bold text-white">Evaluasi Pembelajaran Selesai!</h4>
                <p className="text-xs text-zinc-500">
                  Anda telah menguji pemahaman teori dasar asam basa maupun perubahan warna zat alamiah.
                </p>
              </div>

              {/* Score ring detail */}
              <div className={`w-44 mx-auto p-4 rounded-2xl border font-mono ${theme === 'dark' ? 'bg-slate-950 border-slate-905' : 'bg-slate-100 border-slate-300'}`}>
                <span className="text-[10px] text-zinc-500 uppercase block">SKOR ANDA:</span>
                <span className="text-4xl font-black text-teal-400">{quizScore} / 100</span>
                <span className="text-[10px] text-zinc-400 block mt-1.5">
                  {quizScore >= 80 ? '👑 EXCELLENT (Master Asam-Basa)' : quizScore >= 60 ? '✨ GOOD JOB (Lulus Kriteria)' : '📚 Perlu Membaca Ulang Teori'}
                </span>
              </div>

              <button
                onClick={resetQuiz}
                className={`px-5 py-2.5 hover:bg-slate-800 text-teal-405 border text-xs font-mono font-bold uppercase rounded-xl cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-905 border-slate-850' : 'bg-slate-100 border-slate-300'}`}
              >
                Ulangi Ujian Kuis
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
