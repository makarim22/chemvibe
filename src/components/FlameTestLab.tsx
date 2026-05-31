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
  ShieldAlert
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

interface FlameTestLabProps {
  theme?: 'dark' | 'light';
  currentUser?: UserAccount | null;
}

interface MetalElement {
  id: string;
  name: string;
  symbol: string;
  type: string; // 'IA (Alkali)' or 'IIA (Alkali Tanah)' or 'Transisi'
  flameColorName: string;
  cobaltColorName: string;
  flameColorHex: string; // main glow color
  flameFlameHex: string; // core flame color
  cobaltColorHex: string; // color when looking through cobalt glass
  wavelength: number; // in nm
  frequency: number; // in 10^14 Hz
  energyJ: number; // in 10^-19 Joules
  energyEv: number; // in eV
  electronConfig: string;
  groundState: string;
  excitedState: string;
  description: string;
}

const METAL_SALTS: MetalElement[] = [
  {
    id: 'li',
    name: 'Litium (LiCl)',
    symbol: 'Li',
    type: 'Golongan IA (Alkali)',
    flameColorName: 'Merah Crimson / Tua',
    cobaltColorName: 'Merah Crimson Halus',
    flameColorHex: '#ff003c',
    flameFlameHex: '#ff4d6d',
    cobaltColorHex: '#d90429',
    wavelength: 671,
    frequency: 4.47,
    energyJ: 2.96,
    energyEv: 1.85,
    electronConfig: '[He] 2s¹',
    groundState: '2s¹',
    excitedState: '2p¹',
    description: 'Litium menghasilkan emisi warna merah crimson pekat akibat transisi elektron tunggal dari orbital 2p kembali ke orbital dasar 2s.'
  },
  {
    id: 'na',
    name: 'Natrium (NaCl)',
    symbol: 'Na',
    type: 'Golongan IA (Alkali)',
    flameColorName: 'Kuning Jingga / Emas',
    cobaltColorName: 'Transparan (Kuning terserap)',
    flameColorHex: '#ffcc00',
    flameFlameHex: '#ffe57f',
    cobaltColorHex: '#4d4d4d', // absorbed by blue glass
    wavelength: 589,
    frequency: 5.09,
    energyJ: 3.37,
    energyEv: 2.10,
    electronConfig: '[Ne] 3s¹',
    groundState: '3s¹',
    excitedState: '3p¹',
    description: 'Emisi kuning ganda (doublet D-line 589.0 nm & 589.6 nm) natrium sangat kuat dan sensitif, sering menutupi warna kation lain jika terjadi kontaminasi kawat.'
  },
  {
    id: 'k',
    name: 'Kalium (KCl)',
    symbol: 'K',
    type: 'Golongan IA (Alkali)',
    flameColorName: 'Ungu Muda / Lilac',
    cobaltColorName: 'Merah Muda / Pink-Merah',
    flameColorHex: '#c77dff',
    flameFlameHex: '#e0aaff',
    cobaltColorHex: '#ff4d6d', // visible pink through cobalt blue glass
    wavelength: 404,
    frequency: 7.43,
    energyJ: 4.92,
    energyEv: 3.07,
    electronConfig: '[Ar] 4s¹',
    groundState: '4s¹',
    excitedState: '4p¹',
    description: 'Warna ungu lilac kalium berenergi tinggi sangat lemah. Menggunakan Kaca Kobalt Biru menyerap kontaminasi kuning Na, sehingga emisi merah-pink Kalium terlihat jelas.'
  },
  {
    id: 'ca',
    name: 'Kalsium (CaCl₂)',
    symbol: 'Ca',
    type: 'Golongan IIA (Alkali Tanah)',
    flameColorName: 'Merah Bata (Jingga-Merah)',
    cobaltColorName: 'Hijau Keabu-abuan',
    flameColorHex: '#ff6b35',
    flameFlameHex: '#ff9f1c',
    cobaltColorHex: '#80ed99',
    wavelength: 622,
    frequency: 4.82,
    energyJ: 3.20,
    energyEv: 2.00,
    electronConfig: '[Ar] 4s²',
    groundState: '4s²',
    excitedState: '4s¹ 4p¹',
    description: 'Kalsium mengemisikan spektrum jingga kemerahan (merah bata) yang khas. Sering dijumpai pada kalsium klorida yang dibakar di laboratorium.'
  },
  {
    id: 'sr',
    name: 'Stronsium (SrCl₂)',
    symbol: 'Sr',
    type: 'Golongan IIA (Alkali Tanah)',
    flameColorName: 'Merah Crimson / Terang',
    cobaltColorName: 'Ungu / Violet',
    flameColorHex: '#ee1b24',
    flameFlameHex: '#f15bb5',
    cobaltColorHex: '#9b5de5',
    wavelength: 641,
    frequency: 4.68,
    energyJ: 3.10,
    energyEv: 1.94,
    electronConfig: '[Kr] 5s²',
    groundState: '5s²',
    excitedState: '5s¹ 5p¹',
    description: 'Stronsium memancarkan warna merah crimson terang yang sangat intens, lazim dipakai secara industri sebagai bahan pewarna merah kembang api.'
  },
  {
    id: 'ba',
    name: 'Barium (BaCl₂)',
    symbol: 'Ba',
    type: 'Golongan IIA (Alkali Tanah)',
    flameColorName: 'Hijau Apel / Kuning-Hijau',
    cobaltColorName: 'Hijau Kebiruan',
    flameColorHex: '#a7c957',
    flameFlameHex: '#e9d8a6',
    cobaltColorHex: '#06d6a0',
    wavelength: 554,
    frequency: 5.42,
    energyJ: 3.59,
    energyEv: 2.24,
    electronConfig: '[Xe] 6s²',
    groundState: '6s²',
    excitedState: '6s¹ 6p¹',
    description: 'Barium menghasilkan emisi fasa hijau kekuningan lembut yang kerap disebut "Hijau Apel" pada temperatur pembakaran berudara gas optimal.'
  },
  {
    id: 'cu',
    name: 'Tembaga (CuCl₂ - Bonus)',
    symbol: 'Cu',
    type: 'Logam Transisi (Referensi Kelas XII)',
    flameColorName: 'Hijau-Biru / Sian',
    cobaltColorName: 'Hijau Terang',
    flameColorHex: '#00b4d8',
    flameFlameHex: '#90e0ef',
    cobaltColorHex: '#52b788',
    wavelength: 510,
    frequency: 5.88,
    energyJ: 3.90,
    energyEv: 2.43,
    electronConfig: '[Ar] 3d¹⁰ 4s¹',
    groundState: '4s¹ 3d¹⁰',
    excitedState: '4p¹ 3d¹⁰',
    description: 'Tembaga klorida (halogenida) melepas emisi hijau-biru elektrik yang indah akibat eksitasi kuat dalam lingkungan kaya klorida.'
  }
];

const INTRO_TEXTS = [
  {
    title: 'Prinsip Dasar Eksitasi',
    body: 'Dalam keadaan dasar (ground state), elektron menempati tingkat energi terendah yang stabil. Saat dipanaskan dengan api bertenaga tinggi, elektron menyerap energi termal dan melompat ke orbital yang lebih tinggi (keadaan tereksitasi atau excited state).'
  },
  {
    title: 'Emisi Foton Cahaya',
    body: 'Keadaan tereksitasi tidak stabil. Dalam waktu nanodetik, elektron meluruh kembali ke tingkat energi dasar. Energi yang berlebih dibuang dalam bentuk foton cahaya dengan panjang gelombang (λ) yang khas, sebanding dengan delta energi orbital.'
  },
  {
    title: 'Hukum Energi Planck',
    body: 'Kemiripan warna api ditentukan oleh konfigurasi kulit atom. Hubungan kuantitatif energi foton diberikan oleh rumus: E = h·f = (h·c) / λ, di mana h = 6.626 × 10⁻³⁴ J·s dan c = 3.0 × 10⁸ m/s.'
  }
];

export default function FlameTestLab({ currentUser, theme = 'dark' }: FlameTestLabProps) {
  // State variables for simulation setup
  const [bunsenOn, setBunsenOn] = useState<boolean>(true);
  const [flameMode, setFlameMode] = useState<'luminous' | 'non-luminous'>('non-luminous'); // non-luminous is the hot blue flame
  const [wireState, setWireState] = useState<'clean' | 'contaminated' | 'loaded'>('contaminated'); // initially contaminated with sodium (acts realistic!)
  const [selectedSample, setSelectedSample] = useState<MetalElement | null>(null);
  const [activeSampleOnWire, setActiveSampleOnWire] = useState<MetalElement | null>(null);
  const [flameColor, setFlameColor] = useState<string>('#3aa8c1'); // default cyan/blue gas flame
  const [cobaltGlass, setCobaltGlass] = useState<boolean>(false);
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [excitationProgress, setExcitationProgress] = useState<'ground' | 'exciting' | 'emitting'>('ground');
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory' | 'reports'>('simulation');

  // Tasks track list
  const [tasks, setTasks] = useState({
    cleanWire: false,
    adjustFlame: false,
    iaGroupTested: false,
    iiaGroupTested: false,
    useCobaltFilter: false,
    perfectQuiz: false
  });

  const [testedElements, setTestedElements] = useState<string[]>([]);

  // Bohr diagram electron variables
  const [electronRadius, setElectronRadius] = useState<number>(45); // distance from nucleus in pixel

  // Quiz systems
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  const QUIZ_QUESTIONS = [
    {
      text: 'Mengapa sebelum digunakan untuk menguji logam sampel baru, kawat nikrom wajib dicelupkan ke dalam larutan asam klorida pekat (HCl) lalu dipanaskan kembali?',
      options: [
        'Untuk menurunkan titik leleh logam sampel agar cepat menguap pada pembakar',
        'Untuk membersihkan kawat dari zat pengotor sisa (terutama sisa ion Natrium yang memiliki nyala kuning sangat dominan)',
        'Untuk mereaksikan kawat sekunder agar berubah menjadi platina murni',
        'Untuk melunakkan kawat tembaga agar mudah dibentuk melingkar'
      ],
      correct: 1,
      exp: 'Kertas kawat nikrom harus murni bersih. Konsentrasi natrium (Na) di udara & keringat tangan sangat pekat. Pembakaran natrium menghasilkan nyala kuning jingga pekat yang bernilai emisi kuat, sehingga menutupi warna lilac dari Kalium atau kation lain jika kawat terkontaminasi.'
    },
    {
      text: 'Kalium (K) menghasilkan warna nyala ungu (lilac) lembut. Bagaimanakah cara mendominasi visualisasi jika larutan Kalium terkontaminasi oleh Natrium?',
      options: [
        'Membakar pada suhu super dingin menggunakan es batu kering',
        'Melihat warna lidah api dari balik kaca kobalt biru guna menyerap spektrum kuning natrium',
        'Mengencerkan sampel KCl dengan alkohol 96%',
        'Menambahkan indikator fenolftalein (PP) ke atas kawat nikrom'
      ],
      correct: 1,
      exp: 'Kaca kobalt berwarna biru sangat efektif mengabsorpsi cahaya kuning emas dari panjang gelombang natrium (589 nm), sehingga membiarkan emisi warna merah-ungu (lilac) milik kation Kalium menembus filter kaca kearah mata.'
    },
    {
      text: 'Urutan warna nyala ketika unsur Litium (Li), Natrium (Na), dan Kalium (K) dibakar berturut-turut pada nyala Bunsen non-luminous adalah...',
      options: [
        'Hijau, ungu, merah crimson',
        'Merah crimson, kuning emas, ungu lilac',
        'Kuning emas, merah bata, hijau apel',
        'Ungu lilac, merah bata, hijau kebiruan'
      ],
      correct: 1,
      exp: 'Unsur alkali (IA) mengemisikan warna khas: Litium (Crimson Red), Natrium (Kuning/Golden Yellow), Kalium (Ungu Muda/Lilac).'
    },
    {
      text: 'Manakah dari pasangan kation golongan alkali tanah (IIA) berikut yang memancarkan warna nyala "Merah Bata" dan "Hijau Apel" secara berurutan?',
      options: [
        'Kalsium (Ca) dan Barium (Ba)',
        'Stronsium (Sr) dan Kalsium (Ca)',
        'Magnesium (Mg) dan Stronsium (Sr)',
        'Barium (Ba) dan Litium (Li)'
      ],
      correct: 0,
      exp: 'Kalsium (CaCl₂) memancarkan warna merah bata (brick red), sedangkan Barium (BaCl₂) memancarkan warna hijau apel (apple green). Logam Magnesium (Mg) murni terbakar menghasilkan cahaya putih silau ultraviolet (tidak berwarna spektret khas).'
    },
    {
      text: 'Bagaimanakah formulasi fisika kuantum yang menghubungkan antara letak spektra emisi, panjang gelombang (λ), dengan kekuatan energi transisi elektron?',
      options: [
        'Semakin panjang gelombang cahaya yang diemisikan, energinya justru semakin tinggi sebanding kuadrat frekuensi',
        'Panjang gelombang sebanding terbalik dengan energi emisi: E = (h · c) / λ. Panjang gelombang pendek (seperti ungu) menghasilkan energi foton terbesar',
        'Energi foton tidak dipengaruhi oleh frekuensi maupun jenis orbital d',
        'Energi radiasi sebanding dengan konstanta gravitasi Newton dikalikan kelajuan gas'
      ],
      correct: 1,
      exp: 'Sesuai postulat Bohr dan Planck, energi emisi foton berbanding terbalik dengan panjang gelombangnya: E = h·c/λ. Spektra Kalium (Violet, λ ≈ 404 nm) memiliki panjang gelombang paling pendek dan frekuensi tertinggi, sehingga melepas energi foton terbesar dibanding Litium/Natrium.'
    }
  ];

  // Sync checklist with trials
  useEffect(() => {
    // Check Groups IA and IIA testing completion
    const testedList = testedElements;
    const iaElements = ['li', 'na', 'k'];
    const iiaElements = ['ca', 'sr', 'ba'];

    const hasTestedIA = iaElements.every(el => testedList.includes(el));
    const hasTestedIIA = iiaElements.every(el => testedList.includes(el));

    if (hasTestedIA && !tasks.iaGroupTested) {
      setTasks(prev => ({ ...prev, iaGroupTested: true }));
    }
    if (hasTestedIIA && !tasks.iiaGroupTested) {
      setTasks(prev => ({ ...prev, iiaGroupTested: true }));
    }
  }, [testedElements, tasks]);

  // Handle Bunsen Vent adjustment (Collar toggle)
  const toggleFlameVent = () => {
    if (!bunsenOn) return;
    const nextMode = flameMode === 'luminous' ? 'non-luminous' : 'luminous';
    setFlameMode(nextMode);
    
    // Set baseline target flame color
    if (nextMode === 'luminous') {
      setFlameColor('#ff9f1c'); // sooty yellow-orange
    } else {
      setFlameColor('#3aa8c1'); // blue non-luminous
    }

    if (nextMode === 'non-luminous') {
      setTasks(prev => ({ ...prev, adjustFlame: true }));
    }
  };

  // Cleaning Wire in HCl
  const executeCleanWire = () => {
    setIsBurning(true);
    setWireState('clean');
    setActiveSampleOnWire(null);
    setExcitationProgress('ground');
    setElectronRadius(45);

    // Simulate cleaning transition
    setTimeout(() => {
      setIsBurning(false);
      setTasks(prev => ({ ...prev, cleanWire: true }));
    }, 1500);
  };

  // Pick solution sample
  const selectSampleOnWatchGlass = (sample: MetalElement) => {
    if (wireState !== 'clean') {
      alert("HATI-HATI! Kawat nikrom Anda masih kotor atau mengandung sisa residu senyawa sebelumnya. Celupkan terlebih dahulu ke tabung HCl untuk mensterilkannya!");
      return;
    }
    setSelectedSample(sample);
    setWireState('loaded');
    setActiveSampleOnWire(sample);
  };

  // Perform Flame Test Action
  const triggerFlameTest = () => {
    if (!bunsenOn) {
      alert("Nyalakan pembakar Bunsen terlebih dahulu!");
      return;
    }
    if (wireState === 'clean') {
      alert("Kawat nikrom kosong murni. Tidak ada senyawa logam alkali/alkali tanah yang termuat!");
      return;
    }

    setIsBurning(true);
    setExcitationProgress('exciting');
    setElectronRadius(75); // Electron excited to outer shell

    // Multi-phase Bohr electron jump animation simulation
    setTimeout(() => {
      setExcitationProgress('emitting');
      setElectronRadius(45); // electronic decay back to ground orbital

      // Mark element tested
      if (activeSampleOnWire) {
        if (!testedElements.includes(activeSampleOnWire.id)) {
          setTestedElements(prev => [...prev, activeSampleOnWire.id]);
        }
      }
    }, 1200);

    setTimeout(() => {
      setIsBurning(false);
      // Decay state is stable now
    }, 4500);
  };

  // Calculate Cobalt Blue Glass visual shift
  const getSimulatedFlameColor = () => {
    if (!bunsenOn) return 'transparent';
    if (!isBurning) {
      return flameMode === 'luminous' ? '#ff9f1c' : '#22d3ee'; // yellow vs default cyan-blue
    }

    // Active burning chemical sample color
    if (activeSampleOnWire) {
      if (cobaltGlass) {
        return activeSampleOnWire.cobaltColorHex;
      }
      // If we burn under contaminated wire with sodium or normal
      return activeSampleOnWire.flameColorHex;
    }

    // Uncleaned contaminated wire emits Sodium yellow!
    if (wireState === 'contaminated') {
      return cobaltGlass ? '#4d4d4d' : '#ffcc00'; // sodium yellow
    }

    return flameMode === 'luminous' ? '#ffb703' : '#3aa8c1';
  };

  // Trigger Cobalt filter toggle
  const toggleCobaltGlass = () => {
    const nextVal = !cobaltGlass;
    setCobaltGlass(nextVal);
    if (nextVal) {
      setTasks(prev => ({ ...prev, useCobaltFilter: true }));
    }
  };

  // Submit and update user stats in custom reports/Firestore DB
  const saveLabActivity成果 = async () => {
    if (!currentUser) {
      alert("Silakan Masuk/Daftar di menu Auth terlebih dahulu agar laporan kerja virtual Anda dapat diarsipkan secara digital di cloud.");
      return;
    }

    try {
      const actId = 'flametest_' + Date.now();
      const ref = doc(db, 'users', currentUser.id, 'activities', actId);
      
      await setDoc(ref, {
        id: actId,
        activityType: 'quiz_completed',
        title: 'Praktikum Uji Nyala',
        description: `Menyelesaikan eksperimen Uji Nyala Logam IA & IIA XII MIPA dengan skor kuis ${Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)}%`,
        timestamp: new Date().toISOString()
      }, { merge: true });

      alert("Laporan Analitis Uji Nyala berhasil diunggah ke Pendidik! Guru Anda sekarang dapat memeriksa kelengkapan modul praktikum Anda.");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.id}/activities`);
    }
  };

  // Embedded Quiz Logic
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
      const finalScorePercentage = Math.round(((quizScore + (selectedOption === QUIZ_QUESTIONS[currentQuestionIndex].correct ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100);
      if (finalScorePercentage === 100) {
        setTasks(prev => ({ ...prev, perfectQuiz: true }));
      }
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

  return (
    <div className="space-y-6 pt-1 pb-10" id="flame-test-lab-view">
      {/* Banner / Header */}
      <div className="rounded-2xl glass-panel p-6 border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
            <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Laboratorium Fisika-Kimia Modern
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Uji Nyala Kimia Unsur Golongan Utama
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            Materi Pembelajaran Kimia Unsur Kelas XII MIPA. Panaskan senyawa garam alkali (IA) & alkali tanah (IIA) menggunakan kawat nikrom murni, interpretasikan panjang gelombang spektra elektromagnetik Bohr, dan temukan korelasi kuantitatif energi Planck.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'simulation' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Meja Simulasi
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'theory' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Teori Bohr &amp; Tabel IA-IIA
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Laporan &amp; Kuis Kerja
          </button>
        </div>
      </div>

      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Virtual Workbench (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border-slate-800/80 flex flex-col md:flex-row gap-6 relative overflow-hidden" id="simulation-workbench">
              
              {/* Bunsen & Wire Simulator Frame */}
              <div id="flame-burner-viewport" className={`flex-1 rounded-xl border p-4 flex flex-col justify-between items-center h-[340px] relative overflow-hidden flame-burner-viewport ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                  <span className="text-[9.5px] font-mono text-slate-500 tracking-wider">BUNSEN_STAGE_01</span>
                  {wireState === 'contaminated' && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-mono font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 shrink-0" />
                      Kawat Terkontaminasi Na
                    </span>
                  )}
                  {wireState === 'clean' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-555/20 text-emerald-400 text-[9px] font-mono font-bold">
                      Kawat Steril &amp; Bersih
                    </span>
                  )}
                  {wireState === 'loaded' && activeSampleOnWire && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono font-bold">
                      Kawat Bermuatan: {activeSampleOnWire.symbol}
                    </span>
                  )}
                </div>

                {/* Cobalt Glass Filter overlay HUD */}
                {cobaltGlass && (
                  <div className="absolute inset-0 bg-blue-700/30 border-4 border-indigo-650 pointer-events-none z-10 flex items-center justify-center">
                    <span className={`font-mono text-xs font-black text-blue-300 uppercase tracking-widest border border-blue-500/40 px-3 py-1 rounded-full animate-pulse ${theme === 'dark' ? 'bg-slate-900/90' : 'bg-slate-100/90'}`}>
                      Mode Filter Kaca Kobalt Biru Aktif
                    </span>
                  </div>
                )}

                {/* The Bunsen Burner visual construct */}
                <div className="w-full flex-1 flex flex-col justify-end items-center relative">
                  
                  {/* Nichrome wire loop projection */}
                  <div className="absolute top-8 w-full flex flex-col items-center transition-all duration-300 z-10">
                    <div className="relative">
                      {/* Metal Wire handle */}
                      <div className="w-1 h-32 bg-gradient-to-t from-slate-450 to-slate-200 rounded"></div>
                      
                      {/* Red Heat Glow representation */}
                      {isBurning && (
                        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-40 bg-orange-500/30 blur-md rounded-full animate-pulse" />
                      )}

                      {/* Small metal loop loop end */}
                      <div className={`absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        isBurning 
                          ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' 
                          : wireState === 'clean' 
                            ? 'border-slate-500' 
                            : wireState === 'loaded' 
                              ? 'border-cyan-200 bg-cyan-300/40 shadow-[0_0_4px_#38bdf8]' 
                              : 'border-yellow-600 bg-yellow-500/30' // contaminated
                      }`}>
                        {/* Sample Salt particle cluster effect */}
                        {wireState === 'loaded' && activeSampleOnWire && !isBurning && (
                          <span className="absolute inset-0.5 rounded-full bg-white opacity-80 animate-ping" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flame effect */}
                  {bunsenOn && (
                    <div className="absolute top-[110px] w-16 h-36 flex justify-center items-end" id="flame-element-stage">
                      
                      {/* Secondary soft glow */}
                      <div 
                        className="absolute bottom-0 w-24 h-24 rounded-full blur-xl transition-all duration-750"
                        style={{ backgroundColor: getSimulatedFlameColor(), opacity: isBurning ? 0.6 : 0.25 }}
                      />

                      {/* Outer flame */}
                      <div 
                        className="absolute bottom-0 w-16 h-32 rounded-full opacity-60 transition-all duration-500 ease-out"
                        style={{
                          background: `radial-gradient(ellipse at bottom, ${getSimulatedFlameColor()} 15%, transparent 75%)`,
                          transform: isBurning ? 'scale(1.2)' : 'scale(1.0)'
                        }}
                      />

                      {/* Inner core flame */}
                      <div 
                        className="absolute bottom-0 w-8 h-20 rounded-full opacity-90 transition-all duration-500 ease-out"
                        style={{
                          background: `radial-gradient(ellipse at bottom, ${
                            isBurning && activeSampleOnWire ? activeSampleOnWire.flameFlameHex : flameMode === 'non-luminous' ? '#9decff' : '#ffe169'
                          } 25%, transparent 85%)`
                        }}
                      />

                      {/* Animated spark particles */}
                      {isBurning && activeSampleOnWire && (
                        <div className="absolute bottom-12 flex justify-center w-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping absolute -top-8" />
                          <span className="w-1 h-1 rounded-full bg-yellow-300 animate-pulse absolute -top-16 left-2" />
                          <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse absolute -top-12 -left-2" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bunsen Burner Nozzle construct */}
                  <div className="w-14 h-16 bg-gradient-to-r from-slate-700 via-slate-650 to-slate-800 border-t border-slate-600 rounded-t-sm z-20" />
                  
                  {/* Bunsen collar air intake hole */}
                  <div className={`w-12 h-6 border-y flex items-center justify-around z-20 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                    <div className={`w-3 h-3 rounded-full ${flameMode === 'non-luminous' ? 'bg-slate-950' : 'bg-amber-500/20 border border-amber-500/40'}`} />
                    <div className={`w-3 h-3 rounded-full ${flameMode === 'non-luminous' ? 'bg-slate-950' : 'bg-amber-500/20 border border-amber-500/40'}`} />
                  </div>

                  {/* Burner Base support stand */}
                  <div className="w-24 h-4 bg-gradient-to-r from-slate-850 via-slate-800 to-slate-900 rounded-lg z-20 border-b border-slate-950" />
                </div>

                {/* Dashboard Controls overlay on bottom burner card */}
                <div className="w-full flex justify-between items-center mt-3 pt-3 border-t border-slate-900/80">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBunsenOn(!bunsenOn)}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider cursor-pointer ${
                        bunsenOn ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {bunsenOn ? 'Oven Off' : 'Pantik Gas'}
                    </button>
                    <button
                      onClick={toggleFlameVent}
                      disabled={!bunsenOn}
                      className={`px-3 py-1.5 border rounded-lg text-[10.5px] font-mono cursor-pointer disabled:opacity-40 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'}`}
                    >
                      Regulasi Collar ({flameMode === 'luminous' ? 'Kuning / Lubang Tutup' : 'Biru / Lubang Buka'})
                    </button>
                  </div>
                  
                  <button
                    onClick={toggleCobaltGlass}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all ${
                      cobaltGlass ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 hover:bg-indigo-900/30'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Kaca Kobalt Blue
                  </button>
                </div>
              </div>

              {/* Action workshop interface button panel */}
              <div className="w-full md:w-56 flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest mb-1.5">Prosedur Dasar</h3>
                    <p className="text-[10px] text-slate-500 leading-normal mb-3">Ikuti petunjuk praktikum Kelas XII secara akurat untuk memperoleh hasil spektrum yang murni tanpa kontaminasi.</p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Step 1: HCl and Cleaning */}
                    <button
                      onClick={executeCleanWire}
                      className="w-full py-2.5 bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-850 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-between px-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span>Celup HCl &amp; Bakar Bersih</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <div className={`p-3 rounded-xl border border-dashed text-[10.5px] space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                      <span className="font-bold text-slate-300 font-mono text-[9px] uppercase tracking-wider"> HCl Peledak Pembersih:</span>
                      <p className="text-slate-500 leading-tight">Berfungsi mengubah sulfida/oksida logam menjadi garam klorida yang sangat mudah menguap pada temperatur fluks.</p>
                    </div>

                    {/* Step 3: Trigger burning test */}
                    <button
                      onClick={triggerFlameTest}
                      disabled={!bunsenOn || wireState === 'clean'}
                      className={`w-full py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                        wireState === 'loaded' 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10' 
                          : 'bg-slate-900 border border-slate-800 text-slate-500 disabled:opacity-45'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      Uji Pembakaran Nyala!
                    </button>
                    
                    {wireState === 'clean' && (
                      <p className="text-[9.5px] text-amber-500 font-mono text-center leading-normal animate-pulse">
                        ⚠️ Silakan pilih salah satu k sampel garam di bawah kawat siap diuji!
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-3.5 space-y-1">
                  <span className="text-[9.5px] font-mono text-emerald-400 font-bold uppercase block tracking-wider">Hasil Observasi:</span>
                  <div className="space-y-0.5">
                    <p className="text-xs text-white leading-tight font-black">
                      {isBurning 
                        ? (activeSampleOnWire ? activeSampleOnWire.flameColorName : 'Kuning Natrium Kontaminasi')
                        : 'Menunggu pembakaran kawat...'
                      }
                    </p>
                    {isBurning && activeSampleOnWire && (
                      <p className="text-[10px] text-emerald-400 font-mono">
                        Panjang Gelombang: {activeSampleOnWire.wavelength} nm
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Atomic Bohr Electron Transition Visual Area */}
            <div className="glass-panel rounded-2xl p-6 border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-6 relative" id="atomic-bohr-excitation-center">
              
              {/* Bohr animation canvas SVG (col span 5) */}
              <div id="bohr-excitation-viewport" className={`md:col-span-5 rounded-xl border py-6 px-4 flex flex-col items-center justify-center relative overflow-hidden h-[240px] bohr-excitation-viewport ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <span className="absolute top-2 left-2 text-[9px] font-mono text-slate-500 tracking-wider">BOHR_MODEL_TRANSITION</span>
                
                {excitationProgress === 'exciting' && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 text-[8.5px] font-mono font-bold rounded animate-pulse">
                    ABSORBSI ENERGI (Eksitasi)
                  </div>
                )}
                {excitationProgress === 'emitting' && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-550/15 border border-emerald-500/30 text-emerald-400 text-[8.5px] font-mono font-bold rounded animate-pulse">
                    EMISI FOTON (De-eksitasi)
                  </div>
                )}
                {excitationProgress === 'ground' && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[8.5px] font-mono rounded">
                    Ground State (Diam)
                  </div>
                )}

                {/* Bohr Shells SVG */}
                <svg width="200" height="200" viewBox="0 0 200 200" className="relative">
                  {/* Nucleus */}
                  <circle cx="100" cy="100" r="14" fill="url(#nucleus-grad)" />
                  <text x="100" y="104" textAnchor="middle" fill="#fff" className="text-[9px] font-black font-mono">
                    {activeSampleOnWire ? activeSampleOnWire.symbol : 'Nucleus'}
                  </text>

                  {/* Shell n=1 */}
                  <circle cx="100" cy="100" r="30" fill="transparent" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3,3" />
                  <text x="100" y="66" textAnchor="middle" fill="#334155" className="text-[7.5px] font-mono">n=1</text>

                  {/* Shell n=2 */}
                  <circle cx="100" cy="100" r="50" fill="transparent" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x="100" y="46" textAnchor="middle" fill="#334155" className="text-[7.5px] font-mono">n=2</text>

                  {/* Shell n=3 */}
                  <circle cx="100" cy="100" r="75" fill="transparent" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="5,5" />
                  <text x="100" y="21" textAnchor="middle" fill="#334155" className="text-[7.5px] font-mono">n=3</text>

                  {/* Electron trail energy excitation paths vector */}
                  {excitationProgress === 'exciting' && (
                    <path d="M 128 128 L 153 153" stroke="#facc15" strokeWidth="2" strokeDasharray="5,3" fill="none" className="animate-pulse" />
                  )}

                  {/* Valence Electron dot representation */}
                  <circle 
                    cx={100 + (electronRadius * Math.cos(45 * Math.PI / 180))} 
                    cy={100 + (electronRadius * Math.sin(45 * Math.PI / 180))} 
                    r="65" 
                    className="transition-all duration-1000 ease-in-out"
                    fill="url(#electron-grad)" 
                    style={{
                      cx: 100 + (electronRadius * Math.cos(45 * Math.PI / 180)),
                      cy: 100 + (electronRadius * Math.sin(45 * Math.PI / 180)),
                      r: excitationProgress === 'exciting' ? 8 : 5
                    }}
                  />

                  {/* Custom Gradients definitions */}
                  <defs>
                    <radialGradient id="nucleus-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#9f1239" />
                    </radialGradient>
                    <radialGradient id="electron-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#67e8f9" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </radialGradient>
                  </defs>

                  {/* Photon shooting waves */}
                  {excitationProgress === 'emitting' && (
                    <g className="animate-fade-in">
                      <path 
                        d="M 132 135 c 5 5 10 -2 15 5 c 5 5 10 -2 15 5 c 5 5 10 -2 20 8" 
                        fill="none" 
                        stroke={activeSampleOnWire ? activeSampleOnWire.flameColorHex : '#ef4444'} 
                        strokeWidth="2.5" 
                        className="animate-pulse"
                      />
                      <polygon 
                        points="182,153 175,145 178,141" 
                        fill={activeSampleOnWire ? activeSampleOnWire.flameColorHex : '#ef4444'} 
                      />
                    </g>
                  )}
                </svg>
              </div>

              {/* Quantum Equations and properties (col span 7) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-extrabold text-white">Prinsip Planck &amp; Struktur Mekanika Gelombang Bohr</h3>
                  </div>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed">
                    Setiap kation memiliki tingkat energi diskret terisolasi yang stabil. Ketika mengabsorpsi foton panas, elektron dipaksa melakukan <span className="text-white font-semibold">transisi radial</span> ke orbital berenergi tinggi, disusul peluruhan de-eksitasi energetik spontan guna mempertahankan keseimbangan spin:
                  </p>
                </div>

                {/* Spectral display strip */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>SPEKTRUM ELEKTROMAGNETIK EMISI (visible light)</span>
                    <span className="text-white font-bold">{activeSampleOnWire ? `${activeSampleOnWire.wavelength} nm` : 'Tidak aktif'}</span>
                  </div>
                  
                  {/* Continuous visual rainbow bar */}
                  <div className="relative h-6 rounded-lg bg-gradient-to-r from-violet-600 via-blue-500 via-teal-400 via-green-500 via-yellow-400 via-orange-500 to-red-600 overflow-hidden shadow-inner border border-slate-900">
                    {/* Dark mask overlay to highlight current spectral line */}
                    {activeSampleOnWire ? (
                      <div 
                        className="absolute top-0 bottom-0 w-1.5 bg-white border border-slate-950 shadow-[0_0_8px_#ffffff] transition-all duration-1000"
                        style={{ left: `${((671 - activeSampleOnWire.wavelength) / (671 - 404)) * 90 + 5}%` }}
                      />
                    ) : (
                      <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-slate-100/70'}`} />
                    )}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 px-1">
                    <span>400 nm (Ungu)</span>
                    <span>500 nm (Biru)</span>
                    <span>600 nm (Oranye)</span>
                    <span>700 nm (Merah)</span>
                  </div>
                </div>

                {/* Mathematical calculations table */}
                <div className={`grid grid-cols-2 gap-4 border rounded-xl p-4 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Frekuensi Radiasi (f):</span>
                    <p className="text-xs text-white font-mono leading-tight">
                      {activeSampleOnWire 
                        ? <>f = <span className="text-emerald-400 font-bold">{activeSampleOnWire.frequency}</span> × 10¹⁴ Hz</>
                        : 'f = c / λ'
                      }
                    </p>
                    <p className="text-[8.5px] text-slate-500 font-mono italic">Kalkulasi: 3.0×10⁸ m/s ÷ λ</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Energi Foton Cahaya (E):</span>
                    <p className="text-xs text-white font-mono leading-tight">
                      {activeSampleOnWire 
                        ? <>E = <span className="text-yellow-400 font-bold">{activeSampleOnWire.energyJ}</span> × 10⁻¹⁹ J</>
                        : 'E = h · f = h · c / λ'
                      }
                    </p>
                    <p className="text-[9.5px] text-slate-400 font-mono font-bold leading-tight">
                      {activeSampleOnWire ? `≈ ${activeSampleOnWire.energyEv} eV (ElectronVolt)` : ''}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Solution Salts Watch Glass Rack Panel (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border-slate-800/80 space-y-4">
              <div>
                <h3 className="text-sm font-mono font-black text-slate-400 uppercase tracking-widest">
                  Rak Kaca Arloji Sampel
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-normal">
                  Pilih salah satu kristal klorida logam alkali (IA) atau alkali tanah (IIA) untuk diletakkan di atas ujung kawat nikrom murni steril.
                </p>
              </div>

              {/* Sample collection buttons */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {METAL_SALTS.map((salt) => {
                  const isSelected = selectedSample?.id === salt.id;
                  const hasBeenTested = testedElements.includes(salt.id);

                  return (
                    <button
                      key={salt.id}
                      onClick={() => selectSampleOnWatchGlass(salt)}
                      className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 block relative hover:border-slate-700 ${
                        isSelected 
                          ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-555/5' 
                          : 'bg-slate-950/40 border-slate-900 text-slate-350'
                      }`}
                    >
                      {/* Tested badge badge icon */}
                      {hasBeenTested && (
                        <span className="absolute top-2.5 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" title="Kation sudah diuji nyala!" />
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-white font-sans">{salt.name}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                          {salt.symbol}⁺ᵡ
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-900/40 text-[9.5px]">
                        <span className="text-slate-500 font-mono">{salt.type}</span>
                        <span className="font-bold" style={{ color: salt.flameColorHex }}>
                          {salt.flameColorName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Contamination info / tips warning */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1 text-[10.5px]">
                <div className="flex items-center gap-1 text-indigo-400 font-bold uppercase text-[9px] tracking-wider">
                  <Info className="w-3.5 h-3.5" />
                  Tips Laboratorium Kelas XII
                </div>
                <p className="text-slate-400 leading-tight">
                  Jika pembakaran Anda menghasilkan warna kuning pekat meskipun Anda memilih logam lain (seperti Kalium), berarti kawat Anda sedang terakumulasi uap Natrium dari udara atmosfer atau keringat. Lakukan <button onClick={executeCleanWire} className="font-bold underline text-cyan-400 hover:text-cyan-300">Bakar Bersih HCl</button> untuk menetralkannya kembali.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === 'theory' && (
        <div className="space-y-6">
          {/* Main concept cards row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INTRO_TEXTS.map((intro, idx) => (
              <div key={idx} className="glass-panel rounded-2xl p-5 border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-sans font-black text-xs">
                    {idx + 1}
                  </div>
                  <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider">{intro.title}</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{intro.body}</p>
              </div>
            ))}
          </div>

          {/* Reference properties table of alkali and alkaline earth */}
          <div className="glass-panel rounded-2xl p-6 border-slate-800/80 space-y-4">
            <div>
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest">
                Tabel Referensi Logam Golongan Utama (Kelas XII MIPA)
              </h3>
              <p className="text-slate-500 text-xs mt-1">Data empiris terkalibrasi spektrometri dan representasi bilangan kuantum orbital energi elektron.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-850">
                  <tr>
                    <th className="py-3 px-4">Nama Unsur</th>
                    <th className="py-3 px-4">Golongan</th>
                    <th className="py-3 px-4">Susunan Valensi</th>
                    <th className="py-3 px-4">Transisi Terjadi</th>
                    <th className="py-3 px-4">Warna Nyala Langsung</th>
                    <th className="py-3 px-4">Pendar Kaca Kobalt</th>
                    <th className="py-3 px-4">Panjang Gelombang (λ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {METAL_SALTS.map((m) => (
                    <tr key={m.id} className={`transition-all ${theme === 'dark' ? 'hover:bg-slate-900/20' : 'hover:bg-slate-200'}`}>
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.flameColorHex }} />
                        <span>{m.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">{m.type}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-350">{m.electronConfig}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-emerald-400">
                        {m.groundState} → {m.excitedState} → {m.groundState}
                      </td>
                      <td className="py-3.5 px-4 font-bold" style={{ color: m.flameColorHex }}>{m.flameColorName}</td>
                      <td className="py-3.5 px-4" style={{ color: m.cobaltColorHex }}>{m.cobaltColorName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{m.wavelength} nm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Virtual Lab Tasks Verification checklist (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border-slate-800/80 space-y-5">
              <div>
                <h3 className="text-sm font-mono font-black text-white uppercase tracking-widest">
                  Milestone &amp; Buku Laporan Praktikum
                </h3>
                <p className="text-slate-500 text-xs mt-1">Lengkapi seluruh langkah percobaan di meja kawat Bunsen untuk memvalidasi kelayakan riset.</p>
              </div>

              {/* Tasks mapping items list */}
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {tasks.cleanWire ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-800 shrink-0" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${tasks.cleanWire ? 'text-white' : 'text-slate-400'}`}>
                      Kawat Nikrom Steril (HCl)
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal">Bersihkan wire loop dengan mencelupkan ke tabung HCl pekat dan bakar di Bunsen.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {tasks.adjustFlame ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-800 shrink-0" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${tasks.adjustFlame ? 'text-white' : 'text-slate-400'}`}>
                      Calibrate Non-Luminous Flame (Panas Biru)
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal">Putar collar pembakar gas untuk mendapatkan api biru steril bertemperatur tinggi.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {tasks.iaGroupTested ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-800 shrink-0" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${tasks.iaGroupTested ? 'text-white' : 'text-slate-400'}`}>
                      Uji Nyala Golongan Alkali IA (Li, Na, K)
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Kemajuan: {testedElements.filter(e => ['li','na','k'].includes(e)).length} / 3 unsur
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {tasks.iiaGroupTested ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-800 shrink-0" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${tasks.iiaGroupTested ? 'text-white' : 'text-slate-400'}`}>
                      Uji Nyala Golongan Alkali Tanah IIA (Ca, Sr, Ba)
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Kemajuan: {testedElements.filter(e => ['ca','sr','ba'].includes(e)).length} / 3 unsur
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {tasks.useCobaltFilter ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-800 shrink-0" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${tasks.useCobaltFilter ? 'text-white' : 'text-slate-400'}`}>
                      Gunakan Filter Kaca Kobalt
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal">Gunakan kaca kobalt berwarna biru untuk mensortir nyala kuning kontaminasi.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {tasks.perfectQuiz ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-800 shrink-0" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${tasks.perfectQuiz ? 'text-white' : 'text-slate-400'}`}>
                      Kuis Evaluasi Sempurna (100% Benar)
                    </p>
                    <p className="text-[10px] text-slate-500 leading-normal">Jawab seluruh kuis evaluasi uji nyala Kelas XII dengan akurat.</p>
                  </div>
                </div>
              </div>

              {/* Upload cloud report CTA button */}
              <div className="pt-4 border-t border-slate-900">
                <button
                  onClick={saveLabActivity成果}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Kirim Laporan Riset Virtual
                </button>
              </div>
            </div>
          </div>

          {/* Embedded Indonesian Quiz Interface (Span 7) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="glass-panel rounded-2xl p-6 border-slate-800/80 flex-1 flex flex-col justify-between space-y-4" id="quiz-flame-test-element">
              
              {!quizStarted && !isQuizFinished ? (
                <div className="text-center py-10 space-y-6 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Evaluasi Uji Nyala Kimia Kelas XII</h3>
                    <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                      Uji kompetensi teori mekanika kuantum Bohr, panjang gelombang spektra elektromagnetik, unsur alkali (Golongan IA), dan alkali tanah (Golongan IIA).
                    </p>
                  </div>
                  <button
                    onClick={() => setQuizStarted(true)}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold uppercase rounded-xl text-xs transition-all tracking-wider font-mono cursor-pointer mx-auto block"
                  >
                    Mulai Evaluasi Mandiri
                  </button>
                </div>
              ) : isQuizFinished ? (
                <div className="text-center py-8 space-y-6 my-auto">
                  <div className="w-20 h-20 bg-gradient-to-tr from-yellow-500 to-amber-400 rounded-3xl flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-yellow-500/10">
                    <Award className="w-10 h-10 animate-pulse" />
                  </div>
                  
                  <div className="space-y-2.5">
                    <h3 className="text-2xl font-black text-white">Kuis Selesai!</h3>
                    <p className="text-slate-400 text-xs">Evaluasi kemajuan belajar Kimia Unsur Golongan Utama.</p>
                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-mono ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                      <span>Skor Akhir: </span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {quizScore} / {QUIZ_QUESTIONS.length} Benar ({Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={restartQuiz}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Ulangi Kuis
                    </button>
                    <button
                      onClick={() => {
                        setQuizStarted(false);
                        setIsQuizFinished(false);
                      }}
                      className={`px-5 py-2.5 border text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'}`}
                    >
                      Kembali ke Menu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  {/* Progress tracker header info */}
                  <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-500">
                    <span>PERTANYAAN {currentQuestionIndex + 1} DARI {QUIZ_QUESTIONS.length}</span>
                    <span className="text-emerald-450">Skor: {quizScore}</span>
                  </div>

                  {/* Question Title text */}
                  <div className="space-y-4 flex-1 justify-center flex flex-col">
                    <h4 className="text-sm md:text-base font-extrabold text-white leading-relaxed">
                      {QUIZ_QUESTIONS[currentQuestionIndex].text}
                    </h4>

                    {/* Options Mapping display list */}
                    <div className="space-y-2.5 mt-2">
                      {QUIZ_QUESTIONS[currentQuestionIndex].options.map((optionStr, optionIdx) => {
                        const isSelected = selectedOption === optionIdx;
                        const isCorrect = optionIdx === QUIZ_QUESTIONS[currentQuestionIndex].correct;
                        
                        let optionStyle = 'bg-slate-950/40 border-slate-900 text-slate-350 hover:border-slate-800';
                        if (isSelected) {
                          optionStyle = 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300';
                        }
                        if (showExplanation) {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold';
                          } else if (isSelected) {
                            optionStyle = 'bg-rose-500/10 border-rose-500 text-rose-400';
                          } else {
                            optionStyle = 'bg-slate-950/10 border-slate-950 text-slate-600';
                          }
                        }

                        return (
                          <button
                            key={optionIdx}
                            onClick={() => handleOptionSelect(optionIdx)}
                            disabled={showExplanation}
                            className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all duration-150 flex items-center justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{optionStr}</span>
                            <div className="w-5 h-5 rounded-full border border-slate-850 shrink-0 flex items-center justify-center text-[10px] font-mono">
                              {String.fromCharCode(65 + optionIdx)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation panel of high school standards */}
                  {showExplanation && (
                    <div className={`p-4 border rounded-xl space-y-1.5 animate-fade-in ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[10.5px] uppercase tracking-wider">
                        <Info className="w-4 h-4 shrink-0" />
                        Penjelasan Ilmiah Kelas XII:
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {QUIZ_QUESTIONS[currentQuestionIndex].exp}
                      </p>
                    </div>
                  )}

                  {/* Submit actions bottom controls */}
                  <div className="flex justify-end pt-3">
                    {!showExplanation ? (
                      <button
                        onClick={submitQuestionAnswer}
                        disabled={selectedOption === null}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-45 disabled:pointer-events-none text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        Kunci Jawaban
                      </button>
                    ) : (
                      <button
                        onClick={proceedToNextQuestion}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1"
                      >
                        {currentQuestionIndex + 1 === QUIZ_QUESTIONS.length ? 'Selesaikan Evaluasi' : 'Pertanyaan Selanjutnya'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
