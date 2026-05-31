/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
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
  RefreshCw,
  Trash2
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

interface SolubilityKspLabProps {
  theme?: 'dark' | 'light';
  currentUser?: UserAccount | null;
}

interface SolubleSalt {
  id: string;
  name: string;
  formula: string;
  kspValue: number;
  kspText: string;
  moleculesRatio: string; // "1:1", "1:2", "2:1", "1:3"
  cation: { symbol: string; valency: number; colorHex: string; name: string };
  anion: { symbol: string; valency: number; colorHex: string; name: string };
  molarMass: number; // g/mol
  commonIonAgent: string; // e.g. "NaCl"
  commonIonSymbol: string; // e.g. "Cl⁻"
  description: string;
  industrialUse: string;
}

const INSOLUBLE_SALTS: SolubleSalt[] = [
  {
    id: 'agcl',
    name: 'Perak Klorida (Silver Chloride)',
    formula: 'AgCl',
    kspValue: 1.8e-10,
    kspText: '1.8 × 10⁻¹⁰',
    moleculesRatio: '1:1',
    cation: { symbol: 'Ag⁺', valency: 1, colorHex: '#e2e8f0', name: 'Perak' },
    anion: { symbol: 'Cl⁻', valency: 1, colorHex: '#a7f3d0', name: 'Klorida' },
    molarMass: 143.32,
    commonIonAgent: 'NaCl (Natrium Klorida)',
    commonIonSymbol: 'Cl⁻',
    description: 'Senyawa anhidrat putih pekat yang sangat peka terhadap cahaya matahari. Ketika disinari, atom perak akan tereduksi menjadi logam perak bebas kelabu.',
    industrialUse: 'Teknologi kertas foto kuno, elektroda pembanding pH perak klorida, dan bahan pelapis lensa anti-radiasi.'
  },
  {
    id: 'ag2cro4',
    name: 'Perak Kromat (Silver Chromate)',
    formula: 'Ag₂CrO₄',
    kspValue: 1.1e-12,
    kspText: '1.1 × 10⁻¹²',
    moleculesRatio: '2:1',
    cation: { symbol: 'Ag⁺', valency: 1, colorHex: '#e2e8f0', name: 'Perak' },
    anion: { symbol: 'CrO₄²⁻', valency: 2, colorHex: '#f59e0b', name: 'Kromat' },
    molarMass: 331.73,
    commonIonAgent: 'AgNO₃ (Perak Nitrat)',
    commonIonSymbol: 'Ag⁺',
    description: 'Kristal padat berwarna merah cokelat eksotis yang terbentuk tajam. Biasa digunakan sebagai indikator titik akhir penetapan metode Mohr.',
    industrialUse: 'Indikator kualitatif analisis titrasi klorida dalam air sungai oleh laboran kimia analitis.'
  },
  {
    id: 'caf2',
    name: 'Kalsium Fluorida (Fluorite)',
    formula: 'CaF₂',
    kspValue: 3.9e-11,
    kspText: '3.9 × 10⁻¹¹',
    moleculesRatio: '1:2',
    cation: { symbol: 'Ca²⁺', valency: 2, colorHex: '#93c5fd', name: 'Kalsium' },
    anion: { symbol: 'F⁻', valency: 1, colorHex: '#cbd5e1', name: 'Fluorida' },
    molarMass: 78.07,
    commonIonAgent: 'NaF (Natrium Fluorida)',
    commonIonSymbol: 'F⁻',
    description: 'Mineral semi-transparan yang dikenal dengan nama fluorit alami. Memiliki kestabilan termal tinggi dan refraksi optik yang sangat rendah.',
    industrialUse: 'Pembuatan spektrometer ultraungu, industri peleburan alumunium metalurgi, dan kacamata kamera optis beresolusi super tebal.'
  },
  {
    id: 'aloh3',
    name: 'Aluminium Hidroksida',
    formula: 'Al(OH)₃',
    kspValue: 1.3e-33,
    kspText: '1.3 × 10⁻³³',
    moleculesRatio: '1:3',
    cation: { symbol: 'Al³⁺', valency: 3, colorHex: '#c084fc', name: 'Aluminium' },
    anion: { symbol: 'OH⁻', valency: 1, colorHex: '#67e8f9', name: 'Hidroksida' },
    molarMass: 78.0,
    commonIonAgent: 'NaOH (Basa Hidroksil)',
    commonIonSymbol: 'OH⁻',
    description: 'Senyawa gelatinous putih amorf yang kelarutannya sangat bergantung pada tingkat pH air dikarenakan kehadiran ion OH⁻ dari disosiasi.',
    industrialUse: 'Komponen obat sakit maag (antasida) untuk menetralkan asam lambung lamban, koagulan penjernih lumpur air sungai.'
  },
  {
    id: 'pbi2',
    name: 'Timbal(II) Iodida (Golden Rain)',
    formula: 'PbI₂',
    kspValue: 7.1e-9,
    kspText: '7.1 × 10⁻⁹',
    moleculesRatio: '1:2',
    cation: { symbol: 'Pb²⁺', valency: 2, colorHex: '#fca5a5', name: 'Timbal' },
    anion: { symbol: 'I⁻', valency: 1, colorHex: '#facc15', name: 'Iodida' },
    molarMass: 461.0,
    commonIonAgent: 'KI (Kalium Iodida)',
    commonIonSymbol: 'I⁻',
    description: 'Bubuk kuning keemasan berkilauan yang indah. Reaksi pengendapannya sangat termasyhur sebagai praktikum peragaan interaktif pancaran hujan emas "Golden Rain" di laboratorium.',
    industrialUse: 'Filter kaca detektor radiasi nuklir gamma, sensor sinar-X, dan bahan baku pigmen artistik lukisan kuno.'
  }
];

export default function SolubilityKspLab({ currentUser, theme = 'dark' }: SolubilityKspLabProps) {
  const [activeSubView, setActiveSubView] = useState<'ksp-sim' | 'ion-effect' | 'ksp-quiz'>('ksp-sim');

  // --- STATE LAB SIMULATOR ---
  const [selectedSalt, setSelectedSalt] = useState<SolubleSalt>(INSOLUBLE_SALTS[0]);
  const [beakerVolume, setBeakerVolume] = useState<number>(1000); // dalam mL, default 1 Liter (1000 mL)
  const [addedSaltMmol, setAddedSaltMmol] = useState<number>(0.1); // mmol garam yang ditambahkan (0.01 - 5.0)
  const [commonIonConc, setCommonIonConc] = useState<number>(0.0); // Molaritas ion senama tambahan (0.0 - 0.5 M)
  const [phValue, setPhValue] = useState<number>(7.0); // khusus untuk Al(OH)3

  // Reset function
  const handleResetLab = () => {
    setAddedSaltMmol(0.1);
    setCommonIonConc(0.0);
    setPhValue(7.0);
  };

  useEffect(() => {
    handleResetLab();
  }, [selectedSalt]);

  // Calculations for Pure Solubility (s) in pure water in Mole/Liter
  const calculatePureSolubility = (): number => {
    const Ksp = selectedSalt.kspValue;
    const ratio = selectedSalt.moleculesRatio;

    if (ratio === '1:1') {
      // s = sqrt(Ksp)
      return Math.sqrt(Ksp);
    } else if (ratio === '1:2' || ratio === '2:1') {
      // Ksp = 4s^3 -> s = (Ksp / 4)^(1/3)
      return Math.pow(Ksp / 4, 1 / 3);
    } else if (ratio === '1:3') {
      // For Al(OH)3, we check if it is limited by Ksp
      // s = (Ksp / 27)^(1/4)
      return Math.pow(Ksp / 27, 1 / 4);
    }
    return 1e-5;
  };

  // Calculations for Actual Solubility (s) with Common Ion or pH taken into calculation
  const calculateActualSolubility = (): number => {
    const Ksp = selectedSalt.kspValue;
    const ratio = selectedSalt.moleculesRatio;
    
    // special calculation if pH controls Al(OH)3 solubility
    if (selectedSalt.id === 'aloh3') {
      const pOH = 14 - phValue;
      const OH_concentration = Math.pow(10, -pOH);
      // Ksp = [Al3+][OH-]^3 -> [Al3+] = Ksp / [OH-]^3
      // Max possible dissolved Al3+ (solubility s)
      const s_pH = Ksp / Math.pow(OH_concentration, 3);
      return Math.min(10.0, s_pH); // clamp maximum to reasonable value
    }

    if (commonIonConc <= 0) {
      return calculatePureSolubility();
    }

    // Common ion calculation
    // AgCl: [Ag+][Cl- + C] = Ksp -> s * (s + C) = Ksp -> if C >> s, s ~ Ksp / C
    if (ratio === '1:1') {
      // s^2 + C*s - Ksp = 0
      // s = (-C + sqrt(C^2 + 4*Ksp)) / 2
      const s = (-commonIonConc + Math.sqrt(commonIonConc * commonIonConc + 4 * Ksp)) / 2;
      return s;
    } else if (ratio === '2:1') {
      // Ag2CrO4: Ksp = [Ag+]^2 * [CrO4^2-]
      // We added AgNO3, so [Ag+] is increased by commonIonConc
      // [Ag+] = 2s + C, [CrO4^2-] = s
      // Ksp = (2s + C)^2 * s
      // If we approximate C >> 2s: Ksp = C^2 * s -> s ~ Ksp / C^2
      // Let's do fixed point iteration or direct calculation
      let s = Ksp / (commonIonConc * commonIonConc);
      for (let i = 0; i < 5; i++) {
        s = Ksp / Math.pow(2 * s + commonIonConc, 2);
      }
      return s;
    } else if (ratio === '1:2') {
      // CaF2 or PbI2
      // e.g. CaF2 with NaF addition: [F-] is increased by commonIonConc
      // [Ca2+] = s, [F-] = 2s + C. Ksp = s * (2s + C)^2
      // Approximate C >> 2s: s ~ Ksp / C^2
      let s = Ksp / (commonIonConc * commonIonConc);
      for (let i = 0; i < 5; i++) {
        s = Ksp / Math.pow(2 * s + commonIonConc, 2);
      }
      return s;
    }

    return calculatePureSolubility();
  };

  // Calculating current Qsp
  const calculateCurrentQsp = (): number => {
    // Volume in Liters
    const volL = beakerVolume / 1000;
    // Added moles of Salt
    const addedMoles = (addedSaltMmol / 1000); // mmol to moles
    const ratio = selectedSalt.moleculesRatio;

    // Concentrations in M if completely dissolved:
    let cationConc = 0;
    let anionConc = 0;

    if (ratio === '1:1') {
      cationConc = addedMoles / volL;
      anionConc = (addedMoles / volL) + commonIonConc;
      return cationConc * anionConc;
    } else if (ratio === '2:1') {
      // Ag2CrO4: AgNO3 added (Ag+ is commonIon)
      cationConc = (addedMoles * 2 / volL) + commonIonConc;
      anionConc = addedMoles / volL;
      return Math.pow(cationConc, 2) * anionConc;
    } else if (ratio === '1:2') {
      // CaF2, PbI2: commonIon is F- / I-
      cationConc = addedMoles / volL;
      anionConc = (addedMoles * 2 / volL) + commonIonConc;
      return cationConc * Math.pow(anionConc, 2);
    } else if (ratio === '1:3') {
      // Al(OH)3: dependent on pH
      cationConc = addedMoles / volL;
      const pOH = 14 - phValue;
      anionConc = Math.pow(10, -pOH) + (addedMoles * 3 / volL);
      return cationConc * Math.pow(anionConc, 3);
    }

    return 0;
  };

  // Determine precipitation and dissolved moles
  const getPrecipitationStatus = () => {
    const Ksp = selectedSalt.kspValue;
    const Qsp = calculateCurrentQsp();

    // Accuracy margin
    const ratio = Qsp / Ksp;

    if (ratio < 0.95) {
      return {
        label: 'Belum Jenuh (Unsaturated)',
        status: 'unsaturated',
        colorClass: 'text-sky-400',
        bgClass: 'bg-sky-500/10 border-sky-500/20',
        text: 'Jumlah ion terlarut masih di bawah batas tetapan kelarutan. Semua partikel terlarut sempurna tanpa sisa endapan.'
      };
    } else if (ratio >= 0.95 && ratio <= 1.05) {
      return {
        label: 'Tepat Jenuh (Saturated)',
        status: 'saturated',
        colorClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10 border-emerald-500/20',
        text: 'Larutan tepat mencapai batas kesetimbangan dinamik pelarutan maksimal. Tambahan kristal sekecil apa pun akan segera membentuk padatan.'
      };
    } else {
      return {
        label: 'Lewat Jenuh / Terbentuk Endapan (Supersaturated)',
        status: 'precipitated',
        colorClass: 'text-amber-500',
        bgClass: 'bg-amber-500/10 border-amber-500/20',
        text: 'Kehadiran konsentrasi ion melampaui konstanta hasil kali kelarutan (Qsp > Ksp). Logam mengendap kembali menjadi padatan kristal kasar di dasar wadah.'
      };
    }
  };

  // Calculate mass of precipitate (if any) in milligrams (mg)
  const calculatePrecipitateMassMg = (): number => {
    const s_actual = calculateActualSolubility();
    const volL = beakerVolume / 1000;
    const maxDissolvableMoles = s_actual * volL;
    
    const addedMoles = addedSaltMmol / 1000;
    
    if (addedMoles <= maxDissolvableMoles) {
      return 0;
    }

    const pptMoles = addedMoles - maxDissolvableMoles;
    const pptMassG = pptMoles * selectedSalt.molarMass;
    return Number((pptMassG * 1000).toFixed(1)); // in mg
  };

  // --- EMBEDDED EVALUATION MODULE & QUIZ ---
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const KSP_QUIZ_QUESTIONS = [
    {
      text: 'Apabila harga hasil kali kelarutan (Qsp) dari pencampuran dua buah zat ionik di dalam gelas beker bernilai lebih kecil daripada konstanta Ksp-nya (Qsp < Ksp), bagaimanakah status fisik dari larutan tersebut?',
      options: [
        'Larutan tepat jenuh dan siap memancarkan pendaran cahaya ionisasi fluoresensi',
        'Terbentuk endapan suspensi padat kasar yang terakumulasi stabil di dasar wadah',
        'Larutan berstatus belum jenuh sehingga seluruh padatan garam terlarut sempurna menjadi ion-ion bebas',
        'Larutan pecah mengalami hidrolisis total menghasilkan buih gas oksigen'
      ],
      correct: 2,
      exp: 'Sesuai hukum kesetimbangan Kelarutan: Jika Qsp < Ksp, larutan berstatus belum jenuh dan tidak terbentuk endapan sama sekali. Jika Qsp = Ksp, tepat jenuh. Larutan mengendap (lewat jenuh) terjadi hanya jika Qsp > Ksp.'
    },
    {
      text: 'Jika garam Ag₂CrO₄ sukar larut di dalam air, bagaimanakah hubungan matematis penentuan nilai kelarutan (s) senyawa tersebut terhadap nilai konstanta Ksp miliknya?',
      options: [
        's = √(Ksp)',
        's = ³√(Ksp / 4)',
        's = ⁴√(Ksp / 27)',
        's = (Ksp / 108)¹/⁵'
      ],
      correct: 1,
      exp: 'Ag₂CrO₄ mengalami ionisasi: Ag₂CrO₄ ⇄ 2 Ag⁺ + CrO₄²⁻. Jika kelarutan = s, maka [Ag⁺] = 2s, [CrO₄²⁻] = s. Maka Ksp = [Ag⁺]² [CrO₄²⁻] = (2s)²(s) = 4s³. Dengan merumuskan s, diperoleh s = ³√(Ksp / 4).'
    },
    {
      text: 'Mengapakah penambahan senyawa garam klorida terlarut kuat seperti NaCl murni ke dalam larutan jenuh Perak Klorida (AgCl) dapat menurunkan kelarutan AgCl secara drastis di dalam beker?',
      options: [
        'Karena ion natrium (Na⁺) menghancurkan kestabilan struktur muatan ion perak',
        'Ion klorida (Cl⁻) dari NaCl bertindak sebagai ion senama (common ion) yang menggeser kesetimbangan ke arah kiri (pembentukan endapan AgCl)',
        'Klorida dari NaCl menyerap kalor pelarutan sehingga wadah mendingin ekstrem',
        'NaCl mengikat molekul air (hidratasi penuh) sehingga pelarut berkurang'
      ],
      correct: 1,
      exp: 'Prinsip Le Chatelier menyatakan penambahan produk (ion senama Cl⁻) akan menggeser kesetimbangan ke arah reaktan (kiri), yaitu fasa padat AgCl(s). Ini menurunkan kelarutan garam AgCl secara masif.'
    },
    {
      text: 'Tentukan kelarutan teoritis dari senyawa Perak klorida (AgCl) di dalam larutan NaCl yang memiliki konsentrasi 0,01 M. Diketahui nilai Ksp AgCl = 1,8 × 10⁻¹⁰.',
      options: [
        '1.8 × 10⁻⁸ M',
        '1.34 × 10⁻⁵ M',
        '1.8 × 10⁻¹⁰ M',
        '1.8 × 10⁻¹² M'
      ],
      correct: 0,
      exp: 'NaCl menghasilkan ion senama [Cl⁻] = 0.01 M. Karena kelarutan garam AgCl sangat kecil, kita abaikan s pada [Cl⁻] campuran (0.01 + s ≈ 0.01). Ksp = [Ag⁺][Cl⁻] -> 1.8 × 10⁻¹⁰ = (s)(0.01) -> s = 1.8 × 10⁻⁸ M.'
    },
    {
      text: 'Berdasarkan pengaruh pH, bagaimanakah cara menaikkan kelarutan dari senyawa basa logam sukar larut seperti Aluminium Hidroksida [Al(OH)₃] di dalam air?',
      options: [
        'Dengan menaikkan pH larutan menjadi sangat basa kuat (> 12)',
        'Dengan menambahkan garam natrium hidroksida (NaOH) pekat',
        'Dengan menurunkan pH larutan (menambahkan asam), sehingga ion H⁺ mengikat ion OH⁻ menghasilkan air dan memaksa kesetimbangan bergeser ke kanan',
        'Dengan menguapkan seluruh sisa gas amonia di atas piring krus'
      ],
      correct: 2,
      exp: 'Al(OH)₃ berada dalam kesetimbangan: Al(OH)₃ ⇄ Al³⁺ + 3 OH⁻. Jika pH diturunkan (ditambah asam), ion H⁺ akan mengikat ion OH⁻ membentuk air (H₂O). Penurunan drastis [OH⁻] akan menggeser kesetimbangan ke arah kanan (melarutkan garam padat).'
    }
  ];

  const handleOptionSelect = (optionIdx: number) => {
    if (showExplanation) return;
    setSelectedOption(optionIdx);
  };

  const submitQuestionAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === KSP_QUIZ_QUESTIONS[currentQuestionIndex].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const proceedToNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIndex + 1 < KSP_QUIZ_QUESTIONS.length) {
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

  const saveQuizScoreToDB = async () => {
    if (!currentUser) {
      alert("Silakan login terlebih dahulu untuk menyimpan pencapaian evaluasi virtual.");
      return;
    }
    try {
      const actId = 'ksp_' + Date.now();
      const ref = doc(db, 'users', currentUser.id, 'activities', actId);
      
      await setDoc(ref, {
        id: actId,
        activityType: 'quiz_completed',
        title: 'Evaluasi Kelarutan & Ksp XI',
        description: `Menyelesaikan evaluasi virtual Kelarutan & Ksp Kimia XI dengan skor total ${Math.round((quizScore / KSP_QUIZ_QUESTIONS.length) * 100)}%`,
        timestamp: new Date().toISOString()
      }, { merge: true });

      alert("Laporan skor kelarutan & Ksp berhasil dicatat ke sistem database pendidik.");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.id}/activities`);
    }
  };

  // Status for precipitation
  const pptStatus = getPrecipitationStatus();
  const precipitateMg = calculatePrecipitateMassMg();

  return (
    <div className="space-y-6 pt-1 pb-10" id="plasma-solubility-ksp-lab">
      
      {/* Brand Title Panel */}
      <div className="rounded-2xl glass-panel p-6 border-amber-500/15 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Virtual Laboratory Hasil Kali Kelarutan (Ksp)
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Kelarutan &amp; Hasil Kali Kelarutan (Ksp)
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Kurikulum Nasional Kimia SMA Kelas XI. Amati pembentukan endapan tak larut, periksa korelasi nilai Qsp terhadap Ksp, uji anjlokan kelarutan ion senama, serta simulasi pH-dependent metal hidroksida antasida.
          </p>
        </div>

        {/* Navigation subtabs */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setActiveSubView('ksp-sim')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'ksp-sim' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Visualizer Kelarutan
          </button>
          <button
            onClick={() => setActiveSubView('ion-effect')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'ion-effect' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Uji Ion Senama &amp; pH
          </button>
          <button
            onClick={() => {
              setActiveSubView('ksp-quiz');
              setQuizStarted(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'ksp-quiz' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Uji Kompetensi Ksp
          </button>
        </div>
      </div>

      {activeSubView !== 'ksp-quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Beaker Lab Stage (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border-slate-800/80 flex flex-col items-center justify-between relative min-h-[480px]">
              
              {/* Internal HUD Header */}
              <div className="w-full flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">SOLUBILITY_BEAKER_V3</span>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 font-mono block">ION PRODUCT (Qsp)</span>
                  <div className="text-xl font-bold text-amber-400 font-mono tracking-tight">
                    Qsp: {calculateCurrentQsp().toExponential(2)}
                  </div>
                  <span className="text-[8px] font-mono text-slate-500">Ksp: {selectedSalt.kspText}</span>
                </div>
              </div>

              {/* Dynamic Chemistry Beaker Visualizer Container */}
              <div className="relative w-64 h-64 flex items-end justify-center my-6">
                
                {/* Milliliter marks */}
                <div className="absolute right-3.5 bottom-8 font-mono text-[9px] text-slate-600 select-none flex flex-col gap-7 text-right">
                  <span>- 1000 mL</span>
                  <span>- 750 mL</span>
                  <span>- 500 mL</span>
                  <span>- 250 mL</span>
                </div>

                {/* Beaker Outer Frame */}
                <div className="absolute inset-x-4 bottom-0 top-6 border-x-4 border-b-6 border-slate-500/40 rounded-b-3xl rounded-t-sm z-10 flex items-end overflow-hidden">
                  
                  {/* Fluid liquid */}
                  <div 
                    className="w-full transition-all duration-500 ease-out relative"
                    style={{ 
                      height: `${(beakerVolume / 1100) * 85}%`,
                      backgroundColor: 'rgba(56, 189, 248, 0.15)' // pure light blue distilled water
                    }}
                  >
                    {/* Tiny wave ripple header */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 animate-pulse" />

                    {/* Floating Ions inside liquid to represent solubility */}
                    <div className="absolute inset-0 pt-4 flex flex-wrap gap-2 items-center justify-center pointer-events-none opacity-80 px-4 overflow-hidden">
                      {/* Cation items */}
                      {Array.from({ length: 4 }).map((_, i) => (
                        <span 
                          key={`cat-${i}`}
                          className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold animate-bounce transition-all shrink-0"
                          style={{ 
                            backgroundColor: `${selectedSalt.cation.colorHex}22`,
                            borderColor: selectedSalt.cation.colorHex,
                            borderWidth: '1px',
                            color: selectedSalt.cation.colorHex,
                            animationDelay: `${i * 150}ms`
                          }}
                        >
                          {selectedSalt.cation.symbol}
                        </span>
                      ))}

                      {/* Anion items */}
                      {Array.from({ length: 4 }).map((_, i) => (
                        <span 
                          key={`ani-${i}`}
                          className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold animate-pulse transition-all shrink-0"
                          style={{ 
                            backgroundColor: `${selectedSalt.anion.colorHex}22`,
                            borderColor: selectedSalt.anion.colorHex,
                            borderWidth: '1px',
                            color: selectedSalt.anion.colorHex,
                            animationDelay: `${i * 200}ms`
                          }}
                        >
                          {selectedSalt.anion.symbol}
                        </span>
                      ))}

                      {/* Common Ion Agent additions visual if active */}
                      {commonIonConc > 0 && (
                        <span className="px-1 py-0.5 bg-yellow-400/20 border border-yellow-400 text-yellow-300 text-[8px] font-mono rounded shrink-0">
                          {selectedSalt.commonIonSymbol} (Senama)
                        </span>
                      )}
                    </div>

                    {/* Precipitated Solid Block at the bottom of the beaker */}
                    {precipitateMg > 0 && (
                      <div 
                        className="absolute bottom-0 inset-x-0 bg-amber-100/80 border-t border-amber-300/30 text-slate-900 transition-all duration-500 ease-out flex flex-col justify-center items-center py-2"
                        style={{ 
                          height: `${Math.min(32, 4 + Math.log10(precipitateMg) * 8)}%`,
                          background: 'repeating-linear-gradient(45deg, #fef08a, #fef08a 10px, #fde047 10px, #fde047 20px)'
                        }}
                      >
                        <span className="text-[9px] font-black tracking-tight text-amber-950 bg-white/90 px-1 rounded shadow-sm">
                          ENDAPAN: {precipitateMg.toFixed(1)} mg
                        </span>
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Beaker Status & Info HUD */}
              <div className={`w-full p-4 rounded-xl border space-y-1 text-center ${theme === 'dark' ? 'bg-slate-950/60 border-slate-900' : 'bg-slate-100/60 border-slate-300'}`}>
                <span className="text-[9px] font-mono text-slate-500 block uppercase">STATUS PERSYARATAN DISOLUSI:</span>
                <span className={`text-base font-black uppercase tracking-tight block ${pptStatus.colorClass}`}>
                  {pptStatus.label}
                </span>
                <p className="text-[10px] text-slate-450 leading-relaxed font-sans mt-1">
                  {pptStatus.text}
                </p>
              </div>

            </div>
          </div>

          {/* Configuration controls panel (Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {activeSubView === 'ksp-sim' ? (
              /* PANEL A: PENGANTAR KSP DAN VISUALISASI DASAR */
              <div className="glass-panel rounded-2xl p-6 border-slate-800/80 space-y-6">
                
                {/* Salt Choice Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Pilih Campuran Senyawa Sukar Larut</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {INSOLUBLE_SALTS.map(salt => (
                      <button
                        key={salt.id}
                        onClick={() => {
                          setSelectedSalt(salt);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedSalt.id === salt.id
                            ? 'bg-amber-950/50 border-amber-500 text-white shadow-lg'
                            : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                        }`}
                      >
                        <span className="block font-bold text-xs">{salt.formula}</span>
                        <span className="text-[8px] opacity-75 block mt-0.5">{salt.name.split(' (')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub Description */}
                <div className={`p-4 rounded-xl border space-y-3 text-xs ${theme === 'dark' ? 'bg-slate-950/90 border-slate-900' : 'bg-slate-100/90 border-slate-300'}`}>
                  <div className={`flex justify-between items-center p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
                    <span className="font-bold text-slate-100">{selectedSalt.name} ({selectedSalt.formula})</span>
                    <span className="font-mono text-amber-400 font-bold">Ksp = {selectedSalt.kspText}</span>
                  </div>
                  <p className="text-slate-400 text-[11.5px] leading-relaxed font-light">{selectedSalt.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-[11px] border-t border-slate-900/60">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Rasio Ionisasi:</span>
                      <span className="text-white font-semibold font-mono">{selectedSalt.moleculesRatio}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Massa Molar:</span>
                      <span className="text-white font-semibold font-mono">{selectedSalt.molarMass} g/mol</span>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-slate-500 text-[10px] block">Agen Ion Senama:</span>
                      <span className="text-amber-400 font-semibold font-mono">{selectedSalt.commonIonAgent.split(' (')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive sliders */}
                <div className="space-y-4">
                  
                  {/* Slider A: Salt Quantity in mmol */}
                  <div className={`p-4 border rounded-xl space-y-2 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Garam {selectedSalt.formula} Dimasukkan:</span>
                      <span className="font-mono font-black text-amber-400 text-sm">{(addedSaltMmol).toFixed(3)} mmol</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.001" 
                      max="1.500" 
                      step="0.010" 
                      value={addedSaltMmol} 
                      onChange={(e) => setAddedSaltMmol(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-500">
                      <span>0.001 mmol</span>
                      <span>Geser untuk menambah konsentrasi larutan garam</span>
                      <span>1.500 mmol</span>
                    </div>
                  </div>

                  {/* Slider B: Solvent Water Volume in mL */}
                  <div className={`p-4 border rounded-xl space-y-2 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Volume Air Pelarut (Akuades):</span>
                      <span className="font-mono font-black text-white text-sm">{beakerVolume} mL</span>
                    </div>
                    <input 
                      type="range" 
                      min="250" 
                      max="1000" 
                      step="250" 
                      value={beakerVolume} 
                      onChange={(e) => setBeakerVolume(parseInt(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-500">
                      <span>250 mL</span>
                      <span>Ukuran Volume Wadah Bejana Air</span>
                      <span>1000 mL (1 L)</span>
                    </div>
                  </div>

                </div>

                {/* Mathematical Theory & Equation Details for Ksp MIPA XI */}
                <div className={`p-4 border rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-xs font-black text-white">HASIL PERHITUNGAN KIMIA SMA KELAS XI</span>
                    <button 
                      onClick={handleResetLab}
                      className="text-[10px] text-amber-500 hover:text-white flex items-center gap-1 font-mono font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Parameter
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className={`space-y-1 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                      <span className="text-[9px] text-slate-500 font-mono block">Kelarutan Murni (s) dalam H₂O murni:</span>
                      <p className="text-base font-black text-white font-mono">
                        {calculatePureSolubility().toExponential(3)} M
                      </p>
                      <p className="text-[9.5px] text-slate-450 leading-relaxed">
                        Nilai kelarutan molaritas s maksimum yang sanggup larut stabil tanpa ion pengganggu.
                      </p>
                    </div>

                    <div className={`space-y-1 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                      <span className="text-[9px] text-slate-500 font-mono block">Batas Larut Maksimal (Gram):</span>
                      <p className="text-base font-black text-emerald-400 font-mono">
                        {(calculatePureSolubility() * selectedSalt.molarMass * (beakerVolume / 1000) * 1000).toFixed(3)} mg
                      </p>
                      <p className="text-[9.5px] text-slate-450 leading-relaxed">
                        Berat maksimum zat padat garam {selectedSalt.formula} yang mampu dilarutkan dalam air sebanyak {beakerVolume} mL.
                      </p>
                    </div>

                  </div>

                  {/* Henderson formulation for solubility ratio display */}
                  <div className={`font-mono text-xs p-3 rounded-xl leading-relaxed ${theme === 'dark' ? 'bg-slate-900/60 text-slate-300' : 'bg-slate-100/60 text-slate-600'}`}>
                    <span className="text-[8.5px] text-amber-400 uppercase font-black tracking-widest block mb-1">Poli-Formulasi Hasil Kali Kelarutan:</span>
                    {selectedSalt.moleculesRatio === '1:1' && (
                      <p className="text-slate-405 text-[11px]">
                        Ksp = [Ag⁺][Cl⁻] = s² 
                        <br />
                        Kelarutan s = √Ksp = √({selectedSalt.kspText}) = {calculatePureSolubility().toExponential(2)} mol/L
                      </p>
                    )}
                    {selectedSalt.moleculesRatio === '1:2' && (
                      <p className="text-slate-405 text-[11px]">
                        Ksp = [Ca²⁺][F⁻]² = s · (2s)² = 4s³
                        <br />
                        Kelarutan s = ³√(Ksp / 4) = ³√({selectedSalt.kspText} / 4) = {calculatePureSolubility().toExponential(2)} mol/L
                      </p>
                    )}
                    {selectedSalt.moleculesRatio === '2:1' && (
                      <p className="text-slate-405 text-[11px]">
                        Ksp = [Ag⁺]²[CrO₄²⁻] = (2s)² · s = 4s³
                        <br />
                        Kelarutan s = ³√(Ksp / 4) = ³√({selectedSalt.kspText} / 4) = {calculatePureSolubility().toExponential(2)} mol/L
                      </p>
                    )}
                    {selectedSalt.moleculesRatio === '1:3' && (
                      <p className="text-slate-405 text-[11px]">
                        Ksp = [Al³⁺][OH⁻]³ = s · (3s)³ = 27s⁴
                        <br />
                        Kelarutan s = ⁴√(Ksp / 27) = ⁴√({selectedSalt.kspText} / 27) = {calculatePureSolubility().toExponential(2)} mol/L
                      </p>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              /* PANEL B: EFEK ION SENAMA & PH */
              <div className="glass-panel rounded-2xl p-6 border-slate-800/80 space-y-6">
                
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-amber-400 tracking-wider block uppercase">Uji Pengaruh Gangguan Kesetimbangan Kelarutan</span>
                  <h3 className="text-lg font-black text-white">Ion Senama (Common Ion Effect) &amp; Pengaruh pH</h3>
                  <p className="text-xs text-slate-400">
                    Bila ke dalam sistem kesetimbangan garam ditambahkan ion yang sejenis/senama, atau pH larutan diintervensi, kelarutan garam sukar larut akan menurun secara ekstrem untuk mencegah terjadinya overload muatan ionik.
                  </p>
                </div>

                {/* Sub Description */}
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${theme === 'dark' ? 'bg-slate-955 bg-slate-950/80 border-slate-900' : 'bg-slate-100 bg-slate-100/80 border-slate-300'}`}>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-bold">Garam Target: {selectedSalt.formula}</span>
                    <span className="font-mono text-cyan-400 font-bold">Ksp: {selectedSalt.kspText}</span>
                  </div>

                  <div className={`p-3 rounded-lg text-[11.5px] font-mono ${theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedSalt.id !== 'aloh3' ? (
                      <p>
                        Adisi dari garam kuat pendonor ion <span className="text-amber-400 font-bold">{selectedSalt.commonIonSymbol}</span> melalui agen pengion <span className="text-white font-bold">{selectedSalt.commonIonAgent}</span>.
                      </p>
                    ) : (
                      <p>
                        Disosiasi kation Al(OH)₃ sangat bergantung terhadap kadar hidroksil bebas. Kita mengontrol pH di beker untuk melihat anjlokan kelarutan hidroksida logam.
                      </p>
                    )}
                  </div>
                </div>

                {/* Slider Ion Senama / pH control */}
                {selectedSalt.id !== 'aloh3' ? (
                  <div className={`p-4 border rounded-xl space-y-3 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Konsentrasi Ion Senama ({selectedSalt.commonIonSymbol}):</span>
                      <span className="font-mono font-black text-amber-400 text-sm">{commonIonConc.toFixed(3)} M</span>
                    </div>
                    
                    <input 
                      type="range" 
                      min="0.0" 
                      max="0.5" 
                      step="0.01" 
                      value={commonIonConc} 
                      onChange={(e) => setCommonIonConc(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer" 
                    />

                    <div className="flex justify-between text-[8px] font-mono text-slate-500">
                      <span>0.0 M (Air Murni)</span>
                      <span>Molaritas {selectedSalt.commonIonAgent} yang ditambahkan</span>
                      <span>0.5 M (Pekat)</span>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 border rounded-xl space-y-3 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Derajat Keasaman Media (pH Beaker):</span>
                      <span className="font-mono font-black text-cyan-400 text-sm">pH {phValue.toFixed(1)}</span>
                    </div>
                    
                    <input 
                      type="range" 
                      min="4.0" 
                      max="12.0" 
                      step="0.5" 
                      value={phValue} 
                      onChange={(e) => setPhValue(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer" 
                    />

                    <div className="flex justify-between text-[8px] font-mono text-slate-500">
                      <span>pH 4.0 (Sangat Asam)</span>
                      <span>Intervensi pH media cair antasida</span>
                      <span>pH 12.0 (Sangat Basa)</span>
                    </div>
                  </div>
                )}

                {/* Analytical comparisons showing dramatic drop in s */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className={`p-4 rounded-xl border space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="text-[9px] uppercase font-mono text-slate-550 block">Kelarutan dalam Air Murni:</span>
                    <p className="text-lg font-mono font-black text-white">{calculatePureSolubility().toExponential(2)} M</p>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Batas disolusi ideal murni tanpa pengaruh ion luar sejenis.
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border border-amber-900/30 space-y-1 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                    <span className="text-[9px] uppercase font-mono text-amber-500 block">Kelarutan Sesaat Akibat Gangguan:</span>
                    <p className="text-lg font-mono font-black text-amber-400">{calculateActualSolubility().toExponential(2)} M</p>
                    
                    {calculateActualSolubility() < calculatePureSolubility() ? (
                      <p className="text-[9.5px] text-amber-500/90 font-medium animate-pulse">
                        📉 Turun {(calculatePureSolubility() / calculateActualSolubility()).toLocaleString(undefined, {maximumFractionDigits: 0})}× lipat karena pergeseran kesetimbangan!
                      </p>
                    ) : (
                      <p className="text-[9.5px] text-slate-500">
                        Tidak ada efek penekanan konsentrasi ion sejenis saat ini.
                      </p>
                    )}
                  </div>

                </div>

                {/* Theoretical concept highlights */}
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${theme === 'dark' ? 'bg-slate-900/50 border-slate-850' : 'bg-slate-100/50 border-slate-300'}`}>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                    <Info className="w-4 h-4" />
                    Penjelasan MIPA Kelas XI:
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11.5px]">
                    {selectedSalt.id !== 'aloh3' ? (
                      `Keberadaan ion senama ${selectedSalt.commonIonSymbol} dari garam ${selectedSalt.commonIonAgent} meningkatkan jumlah produk secara artificial. Agar kesetimbangan disosiasi tetap konstan memenuhi ketetapan Ksp, sisa kation logam akan dipaksa membentuk endapan padat kembali ke sebelah kiri.`
                    ) : (
                      `Pada kondisi sangat asam (pH rendah), kuantitas OH⁻ di dalam air murni sangat langka karena bereaksi dengan H⁺ pembentuk akuades. Ketiadaan ion hidroksil ini menggeser reaksi ke kanan, membuat Al(OH)₃ sangat melarut mudah. Sebaliknya, pada pH tinggi (basa), kelarutan Al(OH)₃ anjlok hingga hampir tidak larut sama sekali.`
                    )}
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* --- C: QUIZ SUBTABS EVALUATION MODULE --- */}
      {activeSubView === 'ksp-quiz' && (
        <div className="max-w-3xl mx-auto glass-panel rounded-3xl p-8 border-slate-800/80 space-y-8" id="solubility-ksp-quiz-container">
          
          {!quizStarted ? (
            <div className="text-center space-y-6 py-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
                <Award className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Evaluasi Virtual Kelarutan &amp; Ksp</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Uji pemahaman Anda mengenai hasil kali kelarutan, pergeseran kesetimbangan ion senama, dan perhitungan endapan air Kelas XI MIPA.
                </p>
              </div>

              <div className={`p-4 rounded-2xl text-[11.5px] max-w-sm mx-auto space-y-1 text-left border ${theme === 'dark' ? 'bg-slate-950 text-slate-400 border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Jumlah Soal: 5 Pilihan Ganda</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Standar Kurikulum: MIPA Kimia XI, UTBK</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Integrasi: Menyimpan skor ke dabase siswa</p>
              </div>

              <button
                onClick={restartQuiz}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
              >
                Mulai Kuis Sekarang
              </button>
            </div>
          ) : isQuizFinished ? (
            /* Quiz finished state rendering */
            <div className="text-center space-y-6 py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle className="w-9 h-9 text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">KOMPETENSI SELESAI</span>
                <h3 className="text-3xl font-black text-white">
                  Skor Anda: {Math.round((quizScore / KSP_QUIZ_QUESTIONS.length) * 100)} / 100
                </h3>
                <p className="text-sm text-slate-400">
                  Anda menjawab benar <strong className="text-emerald-400">{quizScore}</strong> dari <strong className="text-white">{KSP_QUIZ_QUESTIONS.length}</strong> pertanyaan evaluasi kelarutan.
                </p>
              </div>

              {/* Progress Bar Visualizer */}
              <div className={`w-full max-w-xs mx-auto h-3 rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-1000"
                  style={{ width: `${(quizScore / KSP_QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={restartQuiz}
                  className={`px-5 py-2.5 hover:bg-slate-850 border rounded-xl text-xs font-bold transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'}`}
                >
                  Ulangi Evaluasi
                </button>
                <button
                  onClick={saveQuizScoreToDB}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Kirim Skor ke Database
                </button>
              </div>
            </div>
          ) : (
            /* Active game-play quiz state */
            <div className="space-y-6">
              
              {/* Question Header Status */}
              <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-900 pb-3 font-mono">
                <span>PERTANYAAN {currentQuestionIndex + 1} DARI {KSP_QUIZ_QUESTIONS.length}</span>
                <span className="text-amber-400">BENAR: {quizScore}</span>
              </div>

              {/* Quiz question body text */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white leading-relaxed">
                  {KSP_QUIZ_QUESTIONS[currentQuestionIndex].text}
                </h4>

                {/* Multiple choice options rendering */}
                <div className="space-y-3 pt-2">
                  {KSP_QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      disabled={showExplanation}
                      onClick={() => handleOptionSelect(i)}
                      className={`w-full p-4 rounded-xl text-left text-xs transition-all flex items-start gap-3 border cursor-pointer ${
                        selectedOption === i 
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow' 
                          : 'bg-slate-950/40 border-slate-900/60 text-slate-300 hover:bg-slate-900/30 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action controller footer buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900/60">
                {!showExplanation ? (
                  <button
                    onClick={submitQuestionAnswer}
                    disabled={selectedOption === null}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:scale-100 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Kunci Jawaban
                  </button>
                ) : (
                  <button
                    onClick={proceedToNextQuestion}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Pertanyaan Berikutnya
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              {/* Comprehensive explanation view after submission */}
              {showExplanation && (
                <div className={`p-5 border rounded-2xl animate-fade-in space-y-2 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold font-mono">
                    {selectedOption === KSP_QUIZ_QUESTIONS[currentQuestionIndex].correct ? (
                      <span className="text-emerald-400">✓ JAWABAN ANDA BENAR!</span>
                    ) : (
                      <span className="text-rose-500">✗ JAWABAN ANDA KURANG TEPAT</span>
                    )}
                    <span className="text-slate-600">|</span>
                    <span className="text-amber-400">
                      Kunci Jawaban: {String.fromCharCode(65 + KSP_QUIZ_QUESTIONS[currentQuestionIndex].correct)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1.5 font-light">
                    {KSP_QUIZ_QUESTIONS[currentQuestionIndex].exp}
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
