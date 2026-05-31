/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  Lightbulb, 
  Gauge, 
  Zap, 
  RefreshCw, 
  Award, 
  Info, 
  Sparkles, 
  CheckCircle, 
  ChevronRight, 
  Search, 
  Activity,
  HeartPulse,
  Combine,
  Check,
  X,
  Play,
  Thermometer,
  RotateCcw,
  Timer,
  Compass,
  Droplets,
  ZapOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';

interface GreenChemistryLabProps {
  theme?: 'dark' | 'light';
  currentUser: UserAccount | null;
}

// 12 Principles of Green Chemistry Data
const PRINCIPLES = [
  {
    id: 1,
    title: 'Mencegah Limbah (Prevention)',
    short: 'Mencegah terbentuknya limbah lebih baik daripada mengolahnya setelah terbentuk.',
    description: 'Prioritas utama adalah meminimalkan pembentukan limbah sejak awal rancangan daripada membersihkan atau mengolah limbah setelah proses sintesis selesai.',
    example: 'Menggunakan pelarut ramah lingkungan atau merancang reaksi dengan hasil samping minimal dalam pembuatan obat.',
    icon: Trash2,
    badgeColor: 'from-emerald-500 to-green-600',
    impact: 'Limbah Nol',
    playgroundType: 'prevention'
  },
  {
    id: 2,
    title: 'Ekonomi Atom (Atom Economy)',
    short: 'Memaksimalkan penggabungan semua bahan baku menjadi produk akhir.',
    description: 'Metode sintetis harus dirancang untuk memaksimalkan penggabungan semua bahan yang digunakan dalam proses menjadi produk akhir yang diinginkan. Persentase ekonomi atom yang tinggi berarti efisiensi bahan yang tinggi.',
    equation: 'Atom Economy (%) = (Massa Molar Produk Diinginkan / Massa Molar Semua Reaktan) x 100%',
    example: 'Sintesis catalytic re-routing pada pembuatan Ibuprofen meningkatkan ekonomi atom dari 40% menjadi 77% (bahkan 99% bila asam asetat didaur ulang).',
    icon: Combine,
    badgeColor: 'from-teal-500 to-emerald-600',
    impact: 'Efisiensi Bahan',
    playgroundType: 'atom_economy'
  },
  {
    id: 3,
    title: 'Sintesis Kurang Berbahaya (Less Hazardous)',
    short: 'Menggunakan dan menghasilkan zat dengan toksisitas rendah/nihil.',
    description: 'Di mana pun memungkinkan, metodologi sintetis harus merancang penggunaan dan pembuatan zat yang memiliki sedikit atau tanpa toksisitas terhadap kesehatan manusia dan lingkungan.',
    example: 'Menggantikan formaldehida (karsinogenik) dengan perekat berbasis protein kedelai yang tidak beracun.',
    icon: HeartPulse,
    badgeColor: 'from-green-500 to-cyan-600',
    impact: 'Rendah Toksisitas',
    playgroundType: 'hazard'
  },
  {
    id: 4,
    title: 'Merancang Bahan Kimia Lebih Safer (Safer Chemicals)',
    short: 'Bahan kimia harus didesain efektif namun tidak beracun.',
    description: 'Produk kimia harus dirancang sedemikian rupa untuk mempertahankan efektivitas fungsi yang diinginkan sekaligus secara drastis meminimalkan risiko toksisitasnya.',
    example: 'Merancang pestisida ramah lingkungan yang hanya menargetkan hama tertentu tanpa merusak serangga penyerbuk seperti lebah.',
    icon: Leaf,
    badgeColor: 'from-emerald-600 to-teal-700',
    impact: 'Aman Dikonsumsi',
    playgroundType: 'none'
  },
  {
    id: 5,
    title: 'Pelarut & Bahan Pembantu Lebih Aman (Safer Solvents)',
    short: 'Menghindari pelarut berbahaya, gunakan yang ramah lingkungan.',
    description: 'Penggunaan zat tambahan (misalnya pelarut, agen pemisah, dll.) harus dihindari sebisa mungkin, dan jika terpaksa digunakan, pilihlah alternatif yang tidak berbahaya (seperti air atau pelarut superkritis CO₂).',
    example: 'Dry cleaning menggunakan cairan karbon dioksida (CO₂) superkritis sebagai pengganti perchloroethylene yang mencemari air.',
    icon: Flame,
    badgeColor: 'from-teal-600 to-blue-600',
    impact: 'Bebas Karsinogen',
    playgroundType: 'solvent'
  },
  {
    id: 6,
    title: 'Efisiensi Energi (Design for Energy Efficiency)',
    short: 'Meminimalkan konsumsi energi, lakukan pada suhu dan tekanan ruang.',
    description: 'Persyaratan energi dari proses kimia harus dianalisis dampak lingkungan dan ekonominya, serta diminimalkan. Sintesis kimia didesain pada suhu dan tekanan sekitar (suhu ruang).',
    example: 'Reaksi penyepuhan logam menggunakan energi matahari atau reaksi enzimatis pada suhu berkisar 37°C.',
    icon: Zap,
    badgeColor: 'from-amber-500 to-orange-600',
    impact: 'Hemat Energi',
    playgroundType: 'energy'
  },
  {
    id: 7,
    title: 'Bahan Baku Terbarukan (Renewable Feedstocks)',
    short: 'Mengutamakan bahan mentah dari alam yang dapat diperbarui daripada fosil.',
    description: 'Bahan mentah atau feedstock harus dipilih dari bahan terbarukan, bukan dari bahan yang dapat habis (seperti minyak bumi/tambang) bila memungkinkan secara teknis dan ekonomis.',
    example: 'Membuat plastik biodegradable dari pati singkong atau jagung (PLA) ketimbang menggunakan polimer berbasis petroleum.',
    icon: RefreshCw,
    badgeColor: 'from-green-600 to-emerald-800',
    impact: 'Keberlanjutan',
    playgroundType: 'none'
  },
  {
    id: 8,
    title: 'Mengurangi Produk Turunan (Reduce Derivatives)',
    short: 'Menghindari modifikasi sementara (misalnya gugus pelindung) untuk mencegah limbah.',
    description: 'Derivatisasi yang tidak perlu (penggunaan gugus pelindung, proteksi/deproteksi, modifikasi fisik/kimia sementara) harus diminimalkan atau dihindari karena langkah tambahan tersebut membutuhkan reagen ekstra dan menghasilkan limbah.',
    example: 'Memanfaatkan katalis enzimatis yang bekerja secara spesifik sehingga tidak memerlukan jalur proteksi gugus fungsi.',
    icon: AlertTriangle,
    badgeColor: 'from-cyan-600 to-blue-700',
    impact: 'Langkah Reaksi Ringkas',
    playgroundType: 'none'
  },
  {
    id: 9,
    title: 'Katalisis (Catalysis)',
    short: 'Menggunakan katalis selektif untuk mempercepat reaksi dan mengurangi limbah.',
    description: 'Reagen katalitik (selektif mungkin) jauh lebih unggul daripada reagen stoikiometris. Katalis dapat menghemat energi, waktu, meningkatkan selektivitas, dan dapat digunakan berulang-ulang.',
    example: 'Menggunakan enzim amilase alami untuk memecah pati menjadi gula pada suhu rendah, ketimbang asam kuat stoikiometris.',
    icon: TrendingUp,
    badgeColor: 'from-violet-500 to-indigo-600',
    impact: 'Dapat Dipakai Berulang',
    playgroundType: 'catalysis'
  },
  {
    id: 10,
    title: 'Rancangan Degradasi (Design for Degradation)',
    short: 'Membuat produk yang mudah terurai di alam setelah selesai digunakan.',
    description: 'Produk kimia harus dirancang sedemikian rupa sehingga pada akhir fungsinya, mereka dapat terurai menjadi produk degradasi yang tidak berbahaya dan tidak bertahan lama di lingkungan.',
    example: 'Kantong plastik dari pati singkong yang hancur terurai tanah dalam hitungan minggu tanpa meninggalkan mikroplastik.',
    icon: Lightbulb,
    badgeColor: 'from-green-400 to-emerald-500',
    impact: 'Bebas Sampah Abadi',
    playgroundType: 'degradation'
  },
  {
    id: 11,
    title: 'Analisis Real-time Mencegah Polusi (Real-time Analysis)',
    short: 'Pemantauan proses secara langsung untuk mencegah zat berbahaya terbentuk.',
    description: 'Metodologi analisis perlu dikembangkan lebih lanjut untuk memungkinkan pemantauan dan kontrol dalam-proses secara real-time sebelum terbentuknya zat berbahaya.',
    example: 'Pemasangan sensor elektrokimia otomatis di cerobong pabrik untuk memantau emisi gas dan menghentikan katup jika emisi berbahaya terdeteksi.',
    icon: Gauge,
    badgeColor: 'from-sky-500 to-indigo-600',
    impact: 'Pencegahan Dini',
    playgroundType: 'none'
  },
  {
    id: 12,
    title: 'Mencegah Kecelakaan (Inherently Safer Chemistry)',
    short: 'Memilih wujud zat dan reaksi guna meminimalkan kebakaran dan ledakan.',
    description: 'Zat dan bentuk zat yang digunakan dalam proses kimia harus dipilih sedemikian rupa untuk meminimalkan potensi kecelakaan kimia, termasuk pelepasan gas beracun, ledakan, dan kebakaran.',
    example: 'Menggantikan penggunaan gas klorin (Cl₂) yang sangat beracun dan bertekanan tinggi dengan kalsium hipoklorit padat untuk sanitasi air.',
    icon: ShieldAlert,
    badgeColor: 'from-red-500 to-rose-600',
    impact: 'Bebas Risiko Fatal',
    playgroundType: 'hazard'
  }
];

// Reaction Pathways Simulation Data
interface PathwayOption {
  name: string;
  steps: number;
  feedstock: string;
  solvent: string;
  temperature: number; // °C
  pressure: number; // atm
  usesCatalyst: boolean;
  molarMassDesired: number; // g/mol
  molarMassAllReactants: number; // g/mol
  wasteMassKg: number; // kg per kg product
  toxicByproducts: string[];
  principlesApplied: number[];
  energyConsumedMj: number; // MJ/kg
  gasesReleased: string;
  solutionColor: string; // Tailwind color matching
}

interface ReactionCase {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  targetProduct: string;
  chemicalFormula: string;
  traditional: PathwayOption;
  green: PathwayOption;
}

const REACTION_CASES: ReactionCase[] = [
  {
    id: 'ibuprofen',
    title: 'Sintesis Ibuprofen (Obat Perereda Nyeri)',
    subTitle: 'Perbandingan Sintesis Klasik (Boots) vs Sintesis Ramah Lingkungan (BHC)',
    description: 'Ibuprofen adalah obat anti-inflamasi nonsteroid penting dunia. Rute Boots lama boros atom dan melepas klorida reaktif, sedangkan rute BHC menyederhanakan reaksi dengan bantuan katalis nikel re-usable.',
    targetProduct: 'Ibuprofen',
    chemicalFormula: 'C₁₃H₁₈O₂',
    traditional: {
      name: 'Rute Boots (Klasik)',
      steps: 6,
      feedstock: 'Petrokimia (Non-terbarukan)',
      solvent: 'Kloroform (Karsinogenik / Beracun)',
      temperature: 140,
      pressure: 25,
      usesCatalyst: false,
      molarMassDesired: 206,
      molarMassAllReactants: 515, // Low atom economy (~40%)
      wasteMassKg: 1.50,
      toxicByproducts: ['Asam Asetat Bebas', 'Ion Klorida Pekat', 'Zat Organoklor'],
      principlesApplied: [1],
      energyConsumedMj: 85,
      gasesReleased: 'Aroma gas kloroform menyengat & uap klorida asam',
      solutionColor: 'bg-amber-900 border-amber-600'
    },
    green: {
      name: 'Rute BHC (Hijau)',
      steps: 3,
      feedstock: 'Petrokimia (Optimasi Penuh)',
      solvent: 'Asam Fluorid cair (Didaur ulang total)',
      temperature: 45,
      pressure: 10,
      usesCatalyst: true, // Raney Nickel
      molarMassDesired: 206,
      molarMassAllReactants: 268, // High atom economy (~77%)
      wasteMassKg: 0.30,
      toxicByproducts: ['Kandungan asam asetat didaur ulang terus-menerus'],
      principlesApplied: [1, 2, 6, 8, 9],
      energyConsumedMj: 22,
      gasesReleased: 'Bebas emisi gas luar, semua tertutup rapat',
      solutionColor: 'bg-emerald-850/80 border-emerald-500'
    }
  },
  {
    id: 'bioplastic',
    title: 'Sintesis Plastik Kemasan Serbaguna',
    subTitle: 'Polimer Petroleum Konvensional (PET) vs Polimer Biodegradabel Pati Jagung (PLA)',
    description: 'Kemasan plastik konvensional PET berumur ratusan tahun menyumbat selokan dan laut. Plastik PLA dari asam laktat fermentasi jagung menawarkan sifat padat kokoh namun 100% degradabel oleh tanah.',
    targetProduct: 'Plastik Polimer',
    chemicalFormula: '(C₃H₄O₂)n',
    traditional: {
      name: 'Rute PET (Konvensional)',
      steps: 4,
      feedstock: 'Minyak Bumi mentah (Fosil terbatas)',
      solvent: 'Xilena / Antimon Trioksida berat',
      temperature: 280,
      pressure: 40,
      usesCatalyst: false,
      molarMassDesired: 192,
      molarMassAllReactants: 480, // ~40% AE
      wasteMassKg: 2.10,
      toxicByproducts: ['Etilena Glikol Menguap', 'Residu logam berat antimon'],
      principlesApplied: [],
      energyConsumedMj: 120,
      gasesReleased: 'Uap hidrokarbon hitam aromatik pekat',
      solutionColor: 'bg-zinc-800 border-zinc-500'
    },
    green: {
      name: 'Rute PLA (Kimia Hijau)',
      steps: 2,
      feedstock: 'Pati Jagung / Singkong murni',
      solvent: 'Air murni (Bebas volatile VOC)',
      temperature: 95,
      pressure: 1,
      usesCatalyst: true, // Enzim biokatalis
      molarMassDesired: 72,
      molarMassAllReactants: 80, // ~90% AE
      wasteMassKg: 0.08,
      toxicByproducts: ['Kondensat uap air aman'],
      principlesApplied: [1, 2, 4, 5, 7, 10],
      energyConsumedMj: 36,
      gasesReleased: 'Uap wangi khas adonan kanji berair hangat',
      solutionColor: 'bg-teal-900/60 border-teal-400'
    }
  },
  {
    id: 'ammonia',
    title: 'Produksi Pupuk Amonia Industri',
    subTitle: 'Haber-Bosch Konvensional Hidrogen Fosil vs Haber-Bosch Elektrokatalisis Surya',
    description: 'Amonia menopang separuh pangan dunia. Namun, hidrogen untuk Haber-Bosch saat ini diperoleh dari pembakaran gas alam yang melepaskan CO₂ raksasa. Rute hijau memisahkan air secara nirlimbah.',
    targetProduct: 'Amonia (NH₃)',
    chemicalFormula: 'NH₃',
    traditional: {
      name: 'Haber-Bosch Konvensional',
      steps: 3,
      feedstock: 'Gas Alam Methane (Reforming Gas)',
      solvent: 'Pelarut Karbamat korosif',
      temperature: 450,
      pressure: 200,
      usesCatalyst: true,
      molarMassDesired: 17,
      molarMassAllReactants: 34, // ~50% AE
      wasteMassKg: 1.80,
      toxicByproducts: ['Gas Karbon Dioksida (CO₂)', 'Karbon Monoksida (CO)'],
      principlesApplied: [9],
      energyConsumedMj: 185,
      gasesReleased: 'Emisi gas kumulatif CO₂ gas rumah kaca pekat',
      solutionColor: 'bg-slate-800 border-amber-600'
    },
    green: {
      name: 'Elektrokatalisis Hijau',
      steps: 1,
      feedstock: 'Gas Udara (N₂) + Air Bersih (H₂O)',
      solvent: 'Elektrolit Berbasis Air',
      temperature: 25,
      pressure: 1,
      usesCatalyst: true, // Rutenium Nano Elektrokatalis
      molarMassDesired: 17,
      molarMassAllReactants: 17, // 100% AE
      wasteMassKg: 0.00,
      toxicByproducts: ['Tidak Ada'],
      principlesApplied: [1, 2, 3, 6, 7, 9, 11],
      energyConsumedMj: 28,
      gasesReleased: 'Gas Oksigen murni (O₂) segar terbebas ke udara',
      solutionColor: 'bg-emerald-950/70 border-cyan-400'
    }
  }
];

// Decision challenge questions (Game simulation audit)
const CHALLENGE_QUESTIONS = [
  {
    id: 1,
    title: 'Kasus Seleksi Pelarut Industri Cat Rumah',
    scenario: 'Perusahaan cat ingin merancang formula cat dinding baru. Tim litbang menyodorkan tiga opsi pelumpur pelarut pengikat cat. Manakah keputusan kebijakan terbaik menurut konsep Kimia Hijau?',
    options: [
      {
        text: 'A. Memilih Thinner Toluena sintetis petroleum (Hasil usapan cat cepat kering berkilau tinggi, namun uap gas VOC berdaya karsinogenik mengancam kesehatan pernapasan pekerja).',
        correct: false,
        safety: 20, eco: 15, toxic: 85, energy: 40,
        feedback: 'Kurang aman! Toluena adalah Senyawa Organik Mudah Menguap (VOC) berbahaya. Ini bertentangan tajam dengan Prinsip 5: Pelarut Lebih Aman.'
      },
      {
        text: 'B. Memakai Emulsi Air dengan polimer pati kedelai (100% Bebas VOC karsinogenik, hampir tidak berbau, limbah cair sisa sangat aman diurai di bak penampungan air).',
        correct: true,
        safety: 95, eco: 90, toxic: 5, energy: 85,
        feedback: 'Sempurna! Mengombinasikan air (solvent universal aman) dengan protein bahan alam adalah contoh brilian adaptasi Prinsip 4 & 5 Kimia Hijau!'
      },
      {
        text: 'C. Menggunakan Kloroform Daur Ulang industri komputer (Bisa diperoleh gratis, namun kloroform sangat mudah bocor ke udara bebas merusak sistem perairan).',
        correct: false,
        safety: 35, eco: 50, toxic: 95, energy: 30,
        feedback: 'Salah! Meski berdalih daur ulang, kloroform adalah halogen terklorisasi beracun tinggi yang melanggar ketentuan pencegahan pencemaran.'
      }
    ]
  },
  {
    id: 2,
    title: 'Modifikasi Pelunak Plastik Singkong',
    scenario: 'Anda adalah direktur penelitian sediaan kemasan biodegradable. Pati singkong murni sangat rapuh saat kering, sehingga butuh pemlastis tambahan (plasticizer). Yang mana rute terhijau Anda?',
    options: [
      {
        text: 'A. Memperkuat dengan senyawa Aditif Phthalate (Bahan baku minyak bumi murah, meningkatkan elastisitas, namun persisten beracun tinggi di perairan selokan).',
        correct: false,
        safety: 40, eco: 20, toxic: 90, energy: 35,
        feedback: 'Salah! Phthalate menginterupsi hormon biologi organisme dan merusak status "biodegradable" dari singkong tersebut.'
      },
      {
        text: 'B. Mencampur senyawa Gliserol Nabati kelapa sawit (Bahan non-toksik terbarukan, aman jika tersentuh makanan, dan mudah hancur tuntas oleh bakteri tanah).',
        correct: true,
        safety: 98, eco: 95, toxic: 0, energy: 90,
        feedback: 'Hebat! Gliserol nabati adalah plasticizer ramah pangan yang menghormati Prinsip 7 (Bahan Baku Terbarukan) dan Prinsip 10 (Rancangan Degradasi).'
      },
      {
        text: 'C. Melapisi dengan semprotan Teflon tipis (PTFE) (Kemasan plastik tahan air selamanya namun tidak akan pernah bisa terurai oleh tanah).',
        correct: false,
        safety: 50, eco: 10, toxic: 80, energy: 15,
        feedback: 'Hindari! Teflon adalah senyawa polutan abadi ("forever chemicals") yang mematikan kapabilitas daur hancur tanah.'
      }
    ]
  },
  {
    id: 3,
    title: 'Produksi Serat Pakaian Nylon Berkelanjutan',
    scenario: 'Serat kain nilon dibuat dari asam adipat. Cara produksi klasik mencairkan senyawa dengan asam nitrat panas, mengeluarkan gas N₂O (dinitrogen oksida) yang merusak ozon 300x lipat dibanding CO₂. Solusi Anda?',
    options: [
      {
        text: 'A. Mengalirkan limbah N₂O lewat pipa cerobong asap setinggi 120 meter agar terbawa angin laut menjauh dari area perumahan warga.',
        correct: false,
        safety: 15, eco: 10, toxic: 98, energy: 50,
        feedback: 'Menyedihkan! Cerobong asap tinggi hanya memindahkan polutan tapi tidak menyelesaikan kerusakan ozon di atmosfer bumi.'
      },
      {
        text: 'B. Memasang filter gas bertekanan tinggi setara 10 bar yang menyaring 40% emisi gas rumah kaca namun menyedot energi uap listrik yang besar.',
        correct: false,
        safety: 60, eco: 45, toxic: 60, energy: 10,
        feedback: 'Kurang ideal! Efisiensi energi sangat buruk (Melanggar Prinsip 6: Efisiensi Energi).'
      },
      {
        text: 'C. Mengganti Benzena petroleum dengan Glukosa tanaman didorong biokatalis bakteri usus (Reaksi berjalan pada suhu 37°C bebas emisi gas beracun).',
        correct: true,
        safety: 95, eco: 96, toxic: 4, energy: 92,
        feedback: 'Keputusan brilian! Mengganti rute bahan dari minyak bumi ke glukosa alam berbiokatalis membunuh emisi N₂O langsung dari akar sintesis!'
      }
    ]
  }
];

export default function GreenChemistryLab({ currentUser, theme = 'dark' }: GreenChemistryLabProps) {
  const [activeTab, setActiveTab] = useState<'principles' | 'simulator' | 'challenge' | 'calculator'>('principles');
  
  // Principles state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrinciple, setSelectedPrinciple] = useState<typeof PRINCIPLES[0] | null>(PRINCIPLES[0]);

  // Calculator Tab states
  const [calcProductMass, setCalcProductMass] = useState<number>(92);
  const [calcReactantMass, setCalcReactantMass] = useState<number>(184);
  const [calcSolventHazard, setCalcSolventHazard] = useState<'water' | 'alcohol' | 'halogenated'>('water');
  const [calcWithCatalyst, setCalcWithCatalyst] = useState<boolean>(true);
  const [calcWasteMass, setCalcWasteMass] = useState<number>(12);

  // Mini-Labs Testbench states (Inside Principles interactive sidebar)
  const [catalysisTestActive, setCatalysisTestActive] = useState<boolean>(false);
  const [catalysisSpeed, setCatalysisSpeed] = useState<number>(0);
  const [catalysisTimer, setCatalysisTimer] = useState<number>(10);
  const [isCatalystAdded, setIsCatalystAdded] = useState<boolean>(false);

  const [degradationMaterial, setDegradationMaterial] = useState<'pet' | 'pla'>('pet');
  const [degradationDays, setDegradationDays] = useState<number>(0); // 0 to 180 days

  const [solventEvapActive, setSolventEvapActive] = useState<boolean>(false);
  const [solventType, setSolventType] = useState<'chloroform' | 'supercritic_co2'>('chloroform');
  const [solventAirQuality, setSolventAirQuality] = useState<number>(100);

  // Reaction Simulator state
  const [selectedCaseId, setSelectedCaseId] = useState('ibuprofen');
  const [useGreenRoute, setUseGreenRoute] = useState(false);
  const [reactorState, setReactorState] = useState<'idle' | 'charging' | 'reacting' | 'completed'>('idle');
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [reactorTemperature, setReactorTemperature] = useState<number>(20);
  const [reactorPressure, setReactorPressure] = useState<number>(1);
  const [activeBubbles, setActiveBubbles] = useState<{ id: number; left: number; delay: number; size: number }[]>([]);
  const [reactorLogs, setReactorLogs] = useState<string[]>([
    'Siaga reaktor. Masukkan sediaan reaktan kimia untuk memulai sintesis.'
  ]);

  // Challenge State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeCase = REACTION_CASES.find(c => c.id === selectedCaseId) || REACTION_CASES[0];
  const activePathway = useGreenRoute ? activeCase.green : activeCase.traditional;

  // Calculators
  const calculateAtomEconomy = (desired: number, total: number) => {
    return Math.round((desired / total) * 100);
  };
  const activeAtomEconomy = calculateAtomEconomy(activePathway.molarMassDesired, activePathway.molarMassAllReactants);

  // Effect to trigger bubbles in reactor when reacting
  useEffect(() => {
    if (reactorState === 'reacting') {
      const bubbleCount = useGreenRoute ? 12 : 30; // Traditional has chaotic erratic bubbles
      const newBubbles = Array.from({ length: bubbleCount }).map((_, i) => ({
        id: Math.random() + i,
        left: 10 + Math.random() * 80,
        delay: Math.random() * 2,
        size: useGreenRoute ? (2 + Math.random() * 3) : (4 + Math.random() * 6)
      }));
      setActiveBubbles(newBubbles);
    } else {
      setActiveBubbles([]);
    }
  }, [reactorState, useGreenRoute]);

  // SIMULATOR TRIGGER
  const handleStartSynthesis = () => {
    if (reactorState !== 'idle' && reactorState !== 'completed') return;
    setReactorState('charging');
    setSimulationProgress(0);
    setReactorLogs([
      `[Mulai] Membuka katup sediaan untuk melepaskan bahan: ${activePathway.feedstock}...`,
      `[Pelarut] Mengalirkan zat pelarut sediaan: ${activePathway.solvent}...`
    ]);

    // Stage 1: Charging (1.5 seconds)
    setTimeout(() => {
      setReactorState('reacting');
      setReactorLogs(prev => [
        `[Energi] Menggerakkan pemanas sirkulasi ke suhu target ${activePathway.temperature}°C...`,
        `[Tekanan] Mengatur pompa vakum tekanan sistem ke ${activePathway.pressure} atm...`,
        ...prev
      ]);

      // Stage 2: Reacting & warming up (kinetic process)
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        setSimulationProgress(currentProgress);

        // Interpolate temperature and pressure
        const tempFraction = currentProgress / 100;
        setReactorTemperature(Math.round(20 + tempFraction * (activePathway.temperature - 20)));
        setReactorPressure(parseFloat((1 + tempFraction * (activePathway.pressure - 1)).toFixed(1)));

        // Inject dynamic milestone logs
        if (currentProgress === 30) {
          setReactorLogs(prev => [
            `[Kinetika] Reaktan mengalami tumbukan efektif. ${activePathway.usesCatalyst ? "Katalis aktif mempercepat jalur transisi!" : "Berlangsung tanpa katalis (reaksi lambat)."}`,
            ...prev
          ]);
        }
        if (currentProgress === 65) {
          setReactorLogs(prev => [
            `[Produk Samping] ${useGreenRoute ? "Tidak terbentuk limbah beracun aktif." : "Peringatan: Zat berbahaya terbentuk di klastor samping: " + activePathway.toxicByproducts.join(', ')}`,
            ...prev
          ]);
        }

        if (currentProgress >= 100) {
          clearInterval(interval);
          setReactorState('completed');
          setReactorLogs(prev => [
            `[Selesai] Sintesis ${activeCase.targetProduct} selesai! Massa molar sesuai sasaran.`,
            `[Evaluasi] Ekonomi Atom terhitung ${activeAtomEconomy}% dengan residu E-Factor ${activePathway.wasteMassKg}x`,
            `[Emisi Lingkungan] Gas yang terbuang: ${activePathway.gasesReleased}.`,
            ...prev
          ]);

          // Dispatch audit actions up to leaderboards
          const actEvent = new CustomEvent('chemvibe_activity', {
            detail: {
              activityType: 'lab_simulated',
              title: `Simulasi ${activeCase.targetProduct}`,
              description: `Menjalankan uji sediaan kimia rute ${useGreenRoute ? 'Hijau' : 'Konvensional'} dengan efisiensi ${activeAtomEconomy}%`,
              score: { earned: useGreenRoute ? 20 : 5, total: 20 }
            }
          });
          window.dispatchEvent(actEvent);
        }
      }, 150);
    }, 1500);
  };

  const resetReactor = () => {
    setReactorState('idle');
    setSimulationProgress(0);
    setReactorTemperature(20);
    setReactorPressure(1);
    setReactorLogs(['Beaker dicuci pembilas air superkritis murni. Siap melakukan sintesis reagen baru.']);
  };

  // Principles Testbench triggers
  const triggerCatalysisTest = () => {
    if (catalysisTestActive) return;
    setCatalysisTestActive(true);
    setCatalysisTimer(10);
    let timeLeft = 10;
    const speedMult = isCatalystAdded ? 4 : 1;
    
    const interval = setInterval(() => {
      timeLeft = Math.max(0, timeLeft - (0.5 * speedMult));
      setCatalysisTimer(parseFloat(timeLeft.toFixed(1)));
      setCatalysisSpeed(Math.round(((10 - timeLeft) / 10) * 100));

      if (timeLeft <= 0) {
        clearInterval(interval);
        setCatalysisTestActive(false);
      }
    }, 200);
  };

  const triggerSolventEvap = () => {
    if (solventEvapActive) return;
    setSolventEvapActive(true);
    setSolventAirQuality(100);
    
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      if (solventType === 'chloroform') {
        setSolventAirQuality(prev => Math.max(12, prev - 8));
      } else {
        // supercritical CO2 is captured
        setSolventAirQuality(prev => Math.max(98, prev - 0.2));
      }

      if (tick >= 12) {
        clearInterval(interval);
        setSolventEvapActive(false);
      }
    }, 200);
  };

  // Quiz Handling
  const handleAnswerSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedAnswerIdx(idx);
  };

  const handleApplyAnswer = () => {
    if (selectedAnswerIdx === null || hasAnswered) return;
    setHasAnswered(true);
    const isCorrect = CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 33); // Normalizing to ~100
    }
  };

  const handleNextChallenge = () => {
    setSelectedAnswerIdx(null);
    setHasAnswered(false);
    
    if (currentQuestionIdx < CHALLENGE_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
      // Log quiz completed metric
      const actEvent = new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          title: 'Konsultan Kimia Hijau',
          description: `Lulus ujian sertifikasi keberlanjutan hijau dengan poin audit ${Math.min(100, quizScore + 1)}`,
          score: { earned: Math.min(100, quizScore + 1), total: 100 }
        }
      });
      window.dispatchEvent(actEvent);
    }
  };

  return (
    <div id="green-chemistry-supercharged-lab" className={`w-full min-h-[calc(100vh-4rem)] p-4 md:p-8 space-y-6 text-slate-205 font-sans ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
      
      {/* Premium Dynamic Header */}
      <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-900/40 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 px-3 bg-emerald-550/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-black uppercase rounded-full">
                Materi Kimia Hijau Kelas X
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-teal-350 font-bold bg-teal-950/50 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                Lab Eksperimental V2.0
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Leaf className="w-8 h-8 text-emerald-400 fill-emerald-400/10 animate-bounce" />
              Komparator &amp; Lab <span className="text-emerald-400">Kimia Hijau</span>
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Kaji 12 prinsip dasar penyelamatan bumi. Temukan cara mengurangi dampak korosif reagen, hitung persentase Ekonomi Atom, ukur E-Factor limbah, dan selesaikan tantangan audit industri hijau.
            </p>
          </div>

          <div className={`flex gap-2 p-1.5 rounded-xl border overflow-x-auto self-start md:self-auto ${theme === 'dark' ? 'bg-slate-950/90 border-slate-900' : 'bg-slate-100/90 border-slate-300'}`}>
            <button
              onClick={() => { setActiveTab('principles'); setSelectedPrinciple(PRINCIPLES[0]); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider cursor-pointer ${
                activeTab === 'principles'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-550 text-slate-950 shadow-lg font-extrabold'
                  : 'text-zinc-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              📖 12 Prinsip
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-550 text-slate-950 shadow-lg font-extrabold'
                  : 'text-zinc-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              🧪 Reaktor Simulasi
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-550 text-slate-950 shadow-lg font-extrabold'
                  : 'text-zinc-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              🌿 Kalkulator Atom
            </button>
            <button
              onClick={() => setActiveTab('challenge')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider relative cursor-pointer ${
                activeTab === 'challenge'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-550 text-slate-950 shadow-lg font-extrabold'
                  : 'text-zinc-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              🏆 Audit Kelulusan
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950 animate-ping" />
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          TAB 1: 12 PRINCIPLES & MICRO-EXPERIMENT PLAYGROUND
          ========================================== */}
      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento-styled list of 12 Principles */}
          <div className={`lg:col-span-5 border rounded-2xl p-4 flex flex-col gap-3 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}>
            <div className="space-y-1 pb-2 border-b border-slate-900">
              <span className="text-[9px] font-mono text-emerald-450 uppercase font-black block">Kamus Teori &amp; Konseptual</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                Pilih Prinsip Kimia Hijau
              </h3>
              
              <div className="relative mt-2">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kata kunci prinsip..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 border rounded-xl text-xs placeholder-zinc-650 focus:outline-none focus:border-emerald-500 ${theme === 'dark' ? 'bg-slate-955 border-slate-900 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1.5 scrollbar-thin">
              {PRINCIPLES.filter(p => 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.short.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((p) => {
                const isSelected = selectedPrinciple?.id === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPrinciple(p)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-950/20 border-emerald-555 text-emerald-400 shadow-md' 
                        : 'bg-slate-950/40 border-transparent text-zinc-400 hover:bg-slate-900/30 hover:text-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.badgeColor} flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-sm`}>
                      {p.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate text-white">{p.title}</div>
                      <p className="text-[10px] text-zinc-500 truncate leading-none mt-1">{p.short}</p>
                    </div>
                    <Icon className={`w-4 h-4 shrink-0 transition-opacity ${isSelected ? 'opacity-100 text-teal-400' : 'opacity-20'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded detailed preview window with Live Mini-Experiment Playground */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {selectedPrinciple && (
                <motion.div
                  key={selectedPrinciple.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className={`border rounded-2xl p-5 md:p-6 space-y-5 shadow-xl flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-905 border-slate-900' : 'bg-slate-100 border-slate-300'}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPrinciple.badgeColor} flex items-center justify-center text-slate-950 font-mono font-black text-lg shadow-lg`}>
                        {selectedPrinciple.id}
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-teal-400 font-extrabold uppercase tracking-widest leading-none block">DOKTRIN UTAMA KE-{selectedPrinciple.id}</span>
                        <h2 className="text-lg md:text-xl font-bold font-sans text-white leading-tight mt-1">{selectedPrinciple.title}</h2>
                      </div>
                    </div>

                    <div className="p-3.5 bg-emerald-950/10 rounded-xl border border-emerald-950/25 text-emerald-300 font-mono text-xs md:text-[12.5px] italic leading-relaxed">
                      &ldquo;{selectedPrinciple.short}&rdquo;
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest">Latar Belakang Kimia:</h4>
                      <p className="text-zinc-350 text-xs md:text-sm leading-relaxed">{selectedPrinciple.description}</p>
                    </div>

                    <div className={`p-3.5 rounded-xl border space-y-1.5 shadow-inner ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                      <h4 className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Penerapan Riil di Kehidupan/Sains:
                      </h4>
                      <p className="text-zinc-300 text-xs leading-relaxed font-sans">{selectedPrinciple.example}</p>
                    </div>

                    {/* INTERACTIVE MINI-EXPERIMENT PLAYGROUND INTEGRATION */}
                    {selectedPrinciple.playgroundType !== 'none' && (
                      <div className={`border border-emerald-500/10 rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-100/50'}`}>
                        <div className="p-3 bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border-b border-emerald-500/10 flex justify-between items-center">
                          <span className="text-[10px] font-mono font-black text-emerald-400 uppercase flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            PLAYGROUND MINI-LABORATORIUM PRINSIP KE-{selectedPrinciple.id}
                          </span>
                          <span className="text-[8px] px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/10 font-mono rounded">
                            Interactive Demo
                          </span>
                        </div>

                        {/* PLAYGROUND CONDITIONAL 1: PREVENTION */}
                        {selectedPrinciple.playgroundType === 'prevention' && (
                          <div className="p-4 space-y-3 font-mono text-[11px]">
                            <p className="text-zinc-400 leading-normal">
                              Mari hitung jumlah timbunan limbah sampingan berdasarkan rute yang dipilih. Tekan tombol tindakan di bawah:
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className={`p-3 rounded-lg border border-red-500/20 text-center ${theme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-100/60'}`}>
                                <span className="text-rose-400 font-extrabold block">Rute Lama (Stoikiometri)</span>
                                <div className="text-lg font-black text-rose-500 mt-1">1500 gram</div>
                                <span className="text-[8.5px] text-zinc-500 block mt-1">Limbah garam mengendap berat</span>
                              </div>
                              <div className={`p-3 rounded-lg border border-emerald-555/20 text-center ${theme === 'dark' ? 'bg-slate-905/80' : 'bg-slate-100/80'}`}>
                                <span className="text-emerald-450 font-extrabold block">Rute Baru (Katalis Daur Ulang)</span>
                                <div className="text-lg font-black text-emerald-400 mt-1">12 gram</div>
                                <span className="text-[8.5px] text-zinc-500 block mt-1">Hanya cairan air pengembun</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PLAYGROUND CONDITIONAL 2: ATOM ECONOMY */}
                        {selectedPrinciple.playgroundType === 'atom_economy' && (
                          <div className="p-4 space-y-3 font-mono text-[11px]">
                            <p className="text-zinc-450 leading-relaxed">
                              Tingkatkan Ekonomi Atom dengan memadukan formula! Di bawah adalah rasio atom produk diinginkan dibanding reaktan awal:
                            </p>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between items-center text-[10.5px] mb-1">
                                  <span>Konstruksi Reaksi Adisi (Semua Atom masuk Ke Produk):</span>
                                  <strong className="text-emerald-400">100% Atom Efektif</strong>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                  <div className="h-full bg-emerald-555 w-full" />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center text-[10.5px] mb-1">
                                  <span>Konstruksi Reaksi Substitusi (Banyak Atom Samping dibuang):</span>
                                  <strong className="text-rose-400">35% Atom Efektif</strong>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                  <div className="h-full bg-rose-500 w-[35%]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PLAYGROUND CONDITIONAL 3: INTERACTIVE CATALYSIS */}
                        {selectedPrinciple.playgroundType === 'catalysis' && (
                          <div className="p-4 space-y-4 font-mono text-[11px]">
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-400">Katalisator:</span>
                                <button
                                  onClick={() => setIsCatalystAdded(prev => !prev)}
                                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                                    isCatalystAdded 
                                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' 
                                      : 'bg-slate-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {isCatalystAdded ? '✓ Katalis Enzim Ditambahkan' : '✗ Tanpa Katalis (Stoikiometris)'}
                                </button>
                              </div>

                              <button
                                onClick={triggerCatalysisTest}
                                disabled={catalysisTestActive}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-900 disabled:text-zinc-650 text-slate-950 font-black rounded uppercase cursor-pointer flex items-center gap-1"
                              >
                                <Play className="w-3 h-3 text-slate-950" /> {catalysisTestActive ? 'Mereaksikan...' : 'Mulai Reaksi'}
                              </button>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-900">
                              <div className="flex justify-between text-[10px]">
                                <span>Durasi Reinfusi Reagen:</span>
                                <span className={isCatalystAdded ? "text-emerald-400 font-extrabold animate-pulse" : "text-amber-500"}>
                                  {catalysisTimer} detik {isCatalystAdded ? "(Super Cepat!)" : "(Sangat Lambat)"}
                                </span>
                              </div>
                              <div className={`h-2.5 rounded-full overflow-hidden relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                <div 
                                  className={`h-full transition-all duration-200 ${isCatalystAdded ? 'bg-gradient-to-r from-emerald-500 to-cyan-550' : 'bg-amber-500'}`} 
                                  style={{ width: `${catalysisSpeed}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-zinc-505 block leading-relaxed">
                                {isCatalystAdded 
                                  ? "✓ Katalis menurunkan Energi Aktivasi (Ea), membuat reaksi instan tuntas pada temperatur normal kamar tanpa memakan bahan bakar reaktor!" 
                                  : "✗ Memerlukan waktu tunggu panjang dan pembakaran bahan bakar gas pemanas konstan agar tumbukan reaktan bertunas."}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* PLAYGROUND CONDITIONAL 4: DEGRADATION */}
                        {selectedPrinciple.playgroundType === 'degradation' && (
                          <div className="p-4 space-y-4 font-mono text-[11px]">
                            <div className="flex gap-2 items-center justify-between pb-2 border-b border-slate-900">
                              <span className="text-zinc-400">Pilih Jenis Kemasan:</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => { setDegradationMaterial('pet'); setDegradationDays(0); }}
                                  className={`px-2.5 py-1 rounded text-[9.5px] cursor-pointer ${degradationMaterial === 'pet' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-900 border border-transparent text-zinc-505'}`}
                                >
                                  Plastik Petroleum (PET)
                                </button>
                                <button
                                  onClick={() => { setDegradationMaterial('pla'); setDegradationDays(0); }}
                                  className={`px-2.5 py-1 rounded text-[9.5px] cursor-pointer ${degradationMaterial === 'pla' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-555/40' : 'bg-slate-900 border border-transparent text-zinc-505'}`}
                                >
                                  Bioplastik Kanji (PLA)
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span>Garis Waktu Terendam Tanah:</span>
                                <strong className="text-cyan-400">{degradationDays} Hari</strong>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="180"
                                value={degradationDays}
                                onChange={(e) => setDegradationDays(parseInt(e.target.value))}
                                className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                              />

                              <div className={`p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-100/40'}`}>
                                <div className="text-lg">
                                  {degradationMaterial === 'pet' ? '🧱' : '🌱'}
                                </div>
                                <div className="text-[10px] text-zinc-400 leading-normal">
                                  {degradationMaterial === 'pet' ? (
                                    <span>
                                      Status {degradationDays} Hari: <strong className="text-rose-455">UTUH 100%</strong>. Polimer hidrokarbon rantai karbon panjang tidak sanggup dimakan oleh bakteri/enzim alami tanah. Akan terus berada di sana hingga 400 tahun ke depan.
                                    </span>
                                  ) : (
                                    <span>
                                      Status {degradationDays} Hari: {degradationDays >= 90 ? (
                                        <strong className="text-emerald-400">BAGAN DEGRADASI TUNTAS (99%)</strong>
                                      ) : (
                                        <span>Degradasi sedang berjalan: <strong className="text-teal-400">{Math.round((degradationDays/90)*100)}% Terurai</strong></span>
                                      )}. Rantai polimer asam laktat terpotong hidrolis tanah, terkonversi penuh menjadi karbon organik humus subur.
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PLAYGROUND CONDITIONAL 5: SOLVENT AND HAZARDS */}
                        {selectedPrinciple.playgroundType === 'solvent' && (
                          <div className="p-4 space-y-4 font-mono text-[11px]">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                              <span className="text-zinc-400 font-bold">1. Tentukan Reagen Pelarut:</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSolventType('chloroform')}
                                  className={`px-2 py-1 rounded text-[9.5px] cursor-pointer ${solventType === 'chloroform' ? 'bg-rose-500/20 text-rose-450 border border-rose-500/30' : 'bg-slate-900'}`}
                                >
                                  Kloroform VOC
                                </button>
                                <button
                                  onClick={() => setSolventType('supercritic_co2')}
                                  className={`px-2 py-1 rounded text-[9.5px] cursor-pointer ${solventType === 'supercritic_co2' ? 'bg-cyan-555/20 text-cyan-405 border border-cyan-500/30' : 'bg-slate-900'}`}
                                >
                                  Cairan CO₂ Superkritis
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={triggerSolventEvap}
                                  disabled={solventEvapActive}
                                  className="px-3.5 py-1 bg-teal-500 text-slate-950 font-bold rounded hover:bg-teal-600 disabled:bg-slate-900 disabled:text-zinc-650 cursor-pointer text-[10px] uppercase"
                                >
                                  {solventEvapActive ? 'Menguapkan Cairan...' : 'Uapkan Pelarut'}
                                </button>

                                <span className="text-[10px]">
                                  Kualitas Udara Laboratorium: <strong className={solventAirQuality < 70 ? "text-rose-400 animate-pulse font-black" : "text-emerald-450"}>{solventAirQuality}%</strong>
                                </span>
                              </div>

                              <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                <div 
                                  className={`h-full transition-all duration-300 ${solventAirQuality < 70 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${solventAirQuality}%` }}
                                />
                              </div>

                              <p className="text-[9.5px] text-zinc-505 leading-relaxed">
                                {solventType === 'chloroform' 
                                  ? "⚠️ Peringatan: Pembilasan kloroform melepaskan gas hidrokarbon klorin berkabut bebas ke ruangan yang merusak jaringan paru spesimen hayati." 
                                  : "✓ Sempurna: CO₂ superkritis bertindak sebagai pelarut transisi non-toksik pada dekanter vakum. Pasca reaksi, ia langsung ditransisi kembali ke gas murni padat dan diputar ulang tanpa emisi."}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* PLAYGROUND CONDITIONAL 6: TOXIC HAZARDS */}
                        {selectedPrinciple.playgroundType === 'hazard' && (
                          <div className="p-4 space-y-3 font-mono text-[11px]">
                            <p className="text-zinc-400 leading-normal">
                              Evaluasi risiko bahaya reagen kimia yang digunakan di laboratorium sekolah:
                            </p>
                            <div className="p-3 bg-red-950/20 rounded-xl border border-rose-500/25 space-y-2">
                              <div className="flex items-center gap-2 text-rose-450 font-bold">
                                <ShieldAlert className="w-4 h-4" />
                                🧪 REAGEN KLORIN GAS (BAHAYA TINGGI)
                              </div>
                              <ul className="list-disc list-inside text-[10px] text-zinc-450 space-y-1">
                                <li>Bertekanan tabung ekstrem (Risiko kebisingan pecah tangki)</li>
                                <li>Gas asam korosif pekat yang menusuk mata apabila bocor</li>
                                <li>Butuh peranti APD kelas B berbiaya berat</li>
                              </ul>
                            </div>
                            <div className="p-3 bg-emerald-950/15 rounded-xl border border-emerald-555/20 space-y-2">
                              <div className="flex items-center gap-2 text-emerald-450 font-bold">
                                <CheckCircle className="w-4 h-4" />
                                🧼 KALSIUM HIPOKLORIT PADAT (AMATERASU AMAN)
                              </div>
                              <ul className="list-disc list-inside text-[10px] text-zinc-450 space-y-1">
                                <li>Berwujud padatan butir stabil tak bertekanan</li>
                                <li>Kandungan aktif disinfektan dilepaskan lambat perlahan sesuai volume air</li>
                                <li>Hanya butuh sarung tangan karet standar sekolah</li>
                              </ul>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                  <div className="border-t border-slate-900 pt-4 mt-6 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      Fokus Utama Dampak: <strong className="text-emerald-400">{selectedPrinciple.impact}</strong>
                    </span>
                    <span>Kemdikbud Kurikulum Merdeka</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: HIGHLY INTERACTIVE CHEMISTRY GLASSWARE SIMULATOR
          ========================================== */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          
          {/* Reaction Case Selector Toolbar Grid */}
          <div className={`p-4 border rounded-2xl flex flex-wrap gap-4 items-center justify-between ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
                <Combine className="w-5 h-5 text-emerald-400" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Laboratorium Optimasi Pabrik</h3>
                <p className="text-[10px] text-zinc-500 font-mono">Uji &amp; audit teoretis persentase Ekonomi Atom reaksi.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {REACTION_CASES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedCaseId(item.id);
                    setReactorState('idle');
                    setSimulationProgress(0);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    selectedCaseId === item.id
                      ? 'bg-gradient-to-r from-emerald-555 to-teal-555 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 border border-slate-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  🧪 {item.title.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Side: Parameters and Route Toggle Card */}
            <div className={`lg:col-span-5 flex flex-col justify-between border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-mono text-emerald-450 uppercase font-black block">Spesifikasi Target Senyawa</span>
                  <h2 className="text-lg md:text-xl font-bold font-sans text-white mt-1 leading-tight">{activeCase.title}</h2>
                  <p className="text-[11px] font-mono text-zinc-405 mt-1">Formula Senyawa: <strong className={`px-2 py-0.5 rounded border ${theme === 'dark' ? 'text-white bg-slate-950 border-slate-900' : 'text-slate-900 bg-slate-100 border-slate-300'}`}>{activeCase.chemicalFormula}</strong></p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{activeCase.description}</p>

                {/* Highly Visual Rute Selector Slider Segment */}
                <div className={`p-1 rounded-xl border flex items-center relative ${theme === 'dark' ? 'bg-slate-955 border-slate-900/80' : 'bg-slate-100 border-slate-300'}`}>
                  <button
                    onClick={() => {
                      if (reactorState === 'charging' || reactorState === 'reacting') return;
                      setUseGreenRoute(false);
                      setReactorState('idle');
                    }}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                      !useGreenRoute
                        ? 'bg-gradient-to-r from-rose-950/40 to-rose-900/50 border border-rose-500/30 text-rose-400 font-extrabold'
                        : 'text-zinc-550 hover:text-white'
                    }`}
                  >
                    🚧 Tradisional / Kuno
                  </button>
                  <button
                    onClick={() => {
                      if (reactorState === 'charging' || reactorState === 'reacting') return;
                      setUseGreenRoute(true);
                      setReactorState('idle');
                    }}
                    className={`flex-1 py-2 text-center rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                      useGreenRoute
                        ? 'bg-gradient-to-r from-emerald-950/40 to-emerald-900/40 border border-emerald-500/30 text-emerald-400 font-extrabold'
                        : 'text-zinc-550 hover:text-white'
                    }`}
                  >
                    🌿 Rute Kimia Hijau
                  </button>
                </div>
              </div>

              {/* Operations Stats List */}
              <div className={`rounded-xl border p-4 space-y-3 font-mono text-[11px] ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <h4 className="text-[9px] font-black text-zinc-555 uppercase tracking-widest pb-1 border-b border-slate-900">Operasional Logistik Reaksi:</h4>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500">1. Sediaan Baku:</span>
                  <span className="text-white text-right leading-none truncate max-w-[200px]">{activePathway.feedstock}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500">2. Pelarut / Solvent:</span>
                  <span className="text-amber-400 text-right">{activePathway.solvent}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500">3. Katalis Proses:</span>
                  <span className={`font-bold ${activePathway.usesCatalyst ? "text-emerald-405" : "text-rose-455"}`}>
                    {activePathway.usesCatalyst ? "✓ Katalis Khusus Aktif" : "✗ Tanpa Katalis"}
                  </span>
                </div>
                <div className="flex justify-between items-start py-0.5">
                  <span className="text-zinc-505 shrink-0">4. Residu Polutan:</span>
                  <div className="text-right text-rose-405 space-y-0.5 leading-tight text-[10px]">
                    {activePathway.toxicByproducts.map((t, idx) => (
                      <div key={idx}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action synthesis Button bar */}
              <div className="flex gap-2">
                <button
                  onClick={handleStartSynthesis}
                  disabled={reactorState === 'charging' || reactorState === 'reacting'}
                  className={`flex-1 py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    reactorState === 'charging' || reactorState === 'reacting'
                      ? 'bg-zinc-850 text-zinc-600 cursor-not-allowed border border-zinc-900'
                      : useGreenRoute
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-550 text-slate-105 active:scale-98 hover:opacity-90 shadow-emerald-500/10'
                        : 'bg-gradient-to-r from-amber-500 to-rose-550 text-slate-105 active:scale-98 hover:opacity-90 shadow-rose-500/10'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current text-slate-950" />
                  {reactorState === 'charging' ? 'Memasukkan Zat...' : reactorState === 'reacting' ? 'Melangsungkan Reaksi...' : 'Mulai Sintesis Reaksi'}
                </button>

                <button
                  onClick={resetReactor}
                  className={`p-3 border rounded-xl transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-900 border-slate-900 text-zinc-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'}`}
                  title="Bersihkan Reaktor"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Side: Visual Glassware Simulator chamber and Live Gauges */}
            <div className={`lg:col-span-7 flex flex-col justify-between border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}>
              
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <span className="text-[9px] font-mono text-teal-400 uppercase font-black block">Kamar Reaktor Kalorimeter</span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Simulasi Visual Kemurnian Reaksi
                  </h3>
                </div>

                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                  reactorState === 'completed' 
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                    : reactorState === 'reacting' 
                      ? 'bg-rose-950/45 text-amber-400 border-amber-500/20 animate-pulse'
                      : 'bg-slate-950 text-zinc-505 border-slate-900'
                }`}>
                  Status: {reactorState === 'idle' ? 'Siaga' : reactorState === 'charging' ? 'Memasukkan Reaktan' : reactorState === 'reacting' ? 'Mereaksikan Molekul' : 'Sintesis Berhasil'}
                </span>
              </div>

              {/* Physical Reactor glass chamber Graphic panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2 items-center">
                
                {/* Visual Glassware Reaction */}
                <div className="md:col-span-7 flex flex-col items-center justify-center relative min-h-[220px]">
                  
                  {/* Floating particles of toxic gas rising if traditional path is active */}
                  {reactorState === 'reacting' && !useGreenRoute && (
                    <div className="absolute top-1/4 -translate-y-12 inset-x-0 flex justify-center h-16 pointer-events-none">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: [0.3, 0.7, 0], y: -40 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="p-1 px-2.5 bg-red-950/40 border border-amber-500/30 rounded text-[9px] text-amber-500 flex items-center gap-1 font-mono"
                      >
                        <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" /> Gas Beracun Bocor
                      </motion.div>
                    </div>
                  )}

                  {/* Clean oxygen releases if green path is running */}
                  {reactorState === 'reacting' && useGreenRoute && (
                    <div className="absolute top-1/4 -translate-y-12 inset-x-0 flex justify-center h-16 pointer-events-none">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: [0.5, 0.8, 0], y: -45 }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="p-1 px-2.5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded text-[9px] flex items-center gap-1 font-mono font-bold"
                      >
                        🍃 Uap Air &amp; O₂ Segar
                      </motion.div>
                    </div>
                  )}

                  {/* Glass Reactor vessel */}
                  <div className={`w-48 h-52 border-b-8 border-x-4 border-slate-700 rounded-b-[40px] relative flex flex-col justify-end overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-slate-905/40' : 'bg-slate-100/40'}`}>
                    
                    {/* Measurement markings ticks */}
                    <div className="absolute left-2.5 top-8 bottom-4 w-1.5 bg-zinc-650/15 flex flex-col justify-between text-[6px] font-mono text-zinc-650">
                      <span>- MAX</span>
                      <span>- 400ml</span>
                      <span>- 300ml</span>
                      <span>- 200ml</span>
                      <span>- MIN</span>
                    </div>

                    {/* Progress Fill Fluid level inside vessel */}
                    <motion.div
                      className={`absolute bottom-0 inset-x-0 w-full transition-all duration-300 rounded-b-[32px] ${
                        reactorState === 'idle' 
                          ? 'h-0' 
                          : reactorState === 'charging' 
                            ? 'h-[25%] bg-slate-800' 
                            : activePathway.solutionColor
                      }`}
                      animate={reactorState === 'reacting' ? { height: '62%' } : reactorState === 'completed' ? { height: '58%' } : {}}
                    >
                      {/* Interactive bubblers inside matrix */}
                      {activeBubbles.map((bub) => (
                        <motion.span
                          key={bub.id}
                          className={`absolute rounded-full ${useGreenRoute ? 'bg-emerald-400/50' : 'bg-amber-300/40'}`}
                          style={{
                            width: bub.size,
                            height: bub.size,
                            left: `${bub.left}%`,
                            bottom: 0
                          }}
                          animate={{
                            y: -230,
                            opacity: [0.3, 0.8, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: useGreenRoute ? 1.6 : 0.9,
                            delay: bub.delay,
                            ease: 'linear'
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Chemical catalyst core solid representation */}
                    {activePathway.usesCatalyst && (reactorState === 'reacting' || reactorState === 'completed') && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-gradient-to-br from-cyan-400 to-teal-550 border border-cyan-400 text-slate-950 font-black text-[9px] font-mono rounded-lg animate-pulse shadow-md z-10">
                        {useGreenRoute ? '🧪 NANO KATALIS' : 'Besi'}
                      </div>
                    )}
                  </div>

                  {/* Platform Stand holder */}
                  <div className="w-56 h-3 bg-zinc-800 rounded-full border border-slate-700 mt-0.5" />
                  <div className="w-1.5 h-16 bg-zinc-700" />
                  <div className="w-24 h-2 bg-zinc-800 rounded" />
                </div>

                {/* Live Telemertry Indicators dials and gauges */}
                <div className="md:col-span-5 flex flex-col justify-center gap-3">
                  
                  {/* Gauge 1: Thermometer */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    <div className={`p-2 rounded-lg ${reactorTemperature >= 100 ? 'bg-rose-500/10 text-rose-450' : 'bg-cyan-500/10 text-cyan-405 animate-pulse'}`}>
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-zinc-555 block">TELESENSOR SUHU</span>
                      <strong className={`text-xs font-mono block ${reactorTemperature >= 100 ? 'text-rose-455 font-black' : 'text-cyan-455'}`}>
                        {reactorTemperature} °C {reactorTemperature >= 100 ? '(Panas Ekstrem)' : '(Hangat Aman)'}
                      </strong>
                    </div>
                  </div>

                  {/* Gauge 2: Pressure vakum */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="p-2 bg-amber-500/15 rounded-lg text-amber-400">
                      <Gauge className="w-4 h-4 animate-spin" style={{ animationDuration: reactorState === 'reacting' ? '1s' : '5s' }} />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-zinc-555 block">TEKANAN SENSOR</span>
                      <strong className="text-xs font-mono text-amber-400 block">
                        {reactorPressure} atm {reactorPressure > 15 ? '(Sangat Tinggi)' : '(Normal Ruang)'}
                      </strong>
                    </div>
                  </div>

                  {/* Gauge 3: Atom Economy Percent Dial */}
                  <div className={`p-3 rounded-xl border text-center relative overflow-hidden ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="text-[9px] font-mono font-black text-zinc-505 block uppercase pb-1 border-b border-slate-905">INTEGRITAS EKONOMI ATOM</span>
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className="text-left">
                        <span className="text-[8px] font-mono text-zinc-555">Rasio Berat Berguna:</span>
                        <div className={`text-lg font-mono font-black ${useGreenRoute ? 'text-emerald-450' : 'text-rose-455'}`}>
                          {activeAtomEconomy}%
                        </div>
                      </div>
                      <div className={`flex-1 max-w-[100px] h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                        <div 
                          className={`h-full transition-all duration-1000 ${useGreenRoute ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${activeAtomEconomy}%` }}
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Dynamic Typewriter Command line logs */}
              <div className={`rounded-xl border p-3.5 space-y-1 text-[10px] font-mono select-none ${theme === 'dark' ? 'bg-slate-955 border-slate-900 text-zinc-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                <div className="flex justify-between items-center text-[8.5px] text-zinc-655 uppercase pb-1.5 border-b border-slate-900 mb-1.5 font-bold">
                  <span>Reaktor Telemetry diagnostics</span>
                  <span className="animate-pulse text-emerald-400">● Live Feed</span>
                </div>
                <div className="space-y-1 max-h-[90px] overflow-y-auto scrollbar-thin">
                  {reactorLogs.slice(0, 4).map((log, lIdx) => (
                    <div key={lIdx} className="leading-tight">
                      <span className="text-zinc-650">&gt;&gt;</span> {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Economy Atom equation comparative summary cards */}
              <div className="p-4 bg-emerald-950/10 rounded-2xl border border-emerald-950/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono">
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-555 block lowercase">Massa Desired Formula:</span>
                  <strong className="text-xs text-white block">{activePathway.molarMassDesired} g/mol</strong>
                </div>
                <div className="space-y-1 border-y md:border-y-0 md:border-x border-slate-900/60 py-2 md:py-0">
                  <span className="text-[8px] text-zinc-555 block lowercase">Massa Semua Reaktan Input:</span>
                  <strong className="text-xs text-white block">{activePathway.molarMassAllReactants} g/mol</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] text-teal-400/80 block uppercase font-bold">Evaluasi E-Factor Limbah:</span>
                  <strong className={`text-sm font-black block ${useGreenRoute ? 'text-emerald-400' : 'text-rose-455 animate-pulse'}`}>
                    {activePathway.wasteMassKg}x {useGreenRoute ? '(Sangat Hijau)' : '(Bencana Polusi)'}
                  </strong>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 3: INTERACTIVE ECO-IMPACT & ATOM ECONOMY CALCULATOR
          ========================================== */}
      {activeTab === 'calculator' && (() => {
        const calculatedAtomEconomy = calcProductMass && calcReactantMass 
          ? Math.min(100, parseFloat(((calcProductMass / calcReactantMass) * 100).toFixed(1)))
          : 0;
        
        const calculatedEFactor = calcProductMass && calcWasteMass
          ? parseFloat((calcWasteMass / calcProductMass).toFixed(2))
          : 0;

        const getAtomEconomyRating = (ae: number) => {
          if (ae >= 80) return { label: 'SANGAT EFISIEN (EKONOMI ATOM TINGGI)', color: 'text-emerald-400', bg: 'bg-emerald-950/25 border-emerald-500/20', desc: 'Hampir seluruh atom reaktan bahan baku mengalir tuntas menjadi senyawa akhir produk bernilai guna tinggi.' };
          if (ae >= 50) return { label: 'EFISIENSI SEDANG', color: 'text-amber-400', bg: 'bg-amber-950/25 border-amber-500/20', desc: 'Banyak atom reaktan terbuang sia-sia menjadi produk sampingan atau intermediet terbuang.' };
          return { label: 'PEMBOROSAN ATOM (EKONOMI ATOM RENDAH)', color: 'text-rose-455', bg: 'bg-rose-955/15 border-rose-500/10', desc: 'Efisiensi reaksi buruk. Mayoritas massa atom terbuang menjadi limbah samping berbahaya tak berguna.' };
        };

        const getEFactorRating = (ef: number) => {
          if (ef <= 0.1) return { label: 'KLASIFIKASI HIJAU MURNI', color: 'text-emerald-400', bg: 'bg-emerald-950/25 border-emerald-500/20', desc: 'Rasio limbah sangat minimal, ideal untuk standar keberlanjutan industri hijau.' };
          if (ef <= 1.0) return { label: 'STANDAR INDUSTRI MENENGAH', color: 'text-yellow-405', bg: 'bg-yellow-950/25 border-yellow-500/25', desc: 'Limbah dihasilkan berbanding lurus dengan produk. Cukup aman namun memerlukan katalis re-usable.' };
          return { label: 'ALARM LIMBAH BERBAHAYA / EXCESSED WASTE', color: 'text-rose-455', bg: 'bg-rose-955/15 border-rose-500/15', desc: 'Jumlah limbah terproduksi melebihi massa produk jadi. Sangat menentang Prinsip 1 (Mencegah Limbah).' };
        };

        const aeRating = getAtomEconomyRating(calculatedAtomEconomy);
        const efRating = getEFactorRating(calculatedEFactor);

        // Compute custom Eco Score (starts at 30, adds or subtracts points based on green indicators)
        let calcScore = 30;
        if (calculatedAtomEconomy >= 80) calcScore += 25;
        else if (calculatedAtomEconomy >= 50) calcScore += 12;

        if (calculatedEFactor <= 0.1) calcScore += 25;
        else if (calculatedEFactor <= 1.0) calcScore += 10;

        if (calcSolventHazard === 'water') calcScore += 15;
        else if (calcSolventHazard === 'alcohol') calcScore += 8;

        if (calcWithCatalyst) calcScore += 15;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
            
            {/* Left Inputs panel */}
            <div className={`lg:col-span-5 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}>
              <div className="space-y-1.5 pb-2 border-b border-slate-900">
                <span className="text-[9px] font-mono text-emerald-450 uppercase font-black block">Kalkulator Simulasi Siswa</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <Gauge className="w-4.5 h-4.5 text-emerald-400" />
                  Parameter Reaksi Buatanmu
                </h3>
              </div>

              {/* Molecular Masse Desired Box */}
              <div className="space-y-3.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-black block">
                  1. Massa Atom / Molekul (g/mol):
                </label>
                
                <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-zinc-500">Massa Molar Produk Diinginkan (mol_des):</span>
                      <strong className="text-teal-400">{calcProductMass} g/mol</strong>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="350"
                      value={calcProductMass}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCalcProductMass(val);
                        if (val > calcReactantMass) {
                          setCalcReactantMass(val + 10);
                        }
                      }}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-zinc-500">Massa Molar Semua Reaktan (mol_all):</span>
                      <strong className="text-teal-400">{calcReactantMass} g/mol</strong>
                    </div>
                    <input 
                      type="range"
                      min={calcProductMass + 1}
                      max="600"
                      value={calcReactantMass}
                      onChange={(e) => setCalcReactantMass(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* E-Factor weights inputs */}
              <div className="space-y-3.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-black block">
                  2. Sediaan Massa Riil Reaksi Sintesis (kg):
                </label>

                <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-zinc-500">Massa Total Limbah Terbuang:</span>
                      <strong className="text-rose-455">{calcWasteMass} kg</strong>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="200"
                      value={calcWasteMass}
                      onChange={(e) => setCalcWasteMass(parseInt(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Solvent Hazards selection */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-black block">
                  3. Seleksi Pelarut Pendukung (Solvents):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'water', label: 'Air Murni', desc: 'Bebas toksik', border: 'border-emerald-650' },
                    { id: 'alcohol', label: 'Etanol / Bio', desc: 'Uap ringan', border: 'border-yellow-605' },
                    { id: 'halogenated', label: 'Kloroform VOC', desc: 'Karsinogen berbahaya', border: 'border-rose-650' }
                  ].map((solv) => {
                    const isSelect = calcSolventHazard === solv.id;
                    return (
                      <button
                        key={solv.id}
                        onClick={() => setCalcSolventHazard(solv.id as any)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                          isSelect 
                            ? 'border-emerald-500 bg-emerald-950/20 text-white' 
                            : 'border-slate-850 bg-slate-950/40 text-zinc-550 hover:bg-slate-900/30 hover:text-zinc-350'
                        }`}
                      >
                        <strong className="text-[10px] block leading-none">{solv.label}</strong>
                        <span className="text-[7.5px] font-mono uppercase text-zinc-500 leading-tight block mt-1">{solv.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className={`p-4 rounded-xl border space-y-3 font-mono text-[10.5px] ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-450 uppercase">Gunakan Reagen Katalis Selektif (Enzim/Ni)?</span>
                  <button 
                    onClick={() => setCalcWithCatalyst(!calcWithCatalyst)}
                    className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-all cursor-pointer ${calcWithCatalyst ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right scorecard analysis */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              <div className={`border rounded-2xl p-5 flex flex-col justify-between space-y-6 flex-1 min-h-[380px] ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
                
                {/* Header diagnostic summary */}
                <div className="flex justify-between items-start flex-wrap gap-3 pb-3 border-b border-slate-900/60 w-full">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-zinc-455 uppercase block">Laporan Diagnostik Kualitatif</span>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                      <Activity className="w-4 h-4 text-emerald-455 animate-pulse" />
                      Profil Ekologis Formula Sintesis Buatan Siswa
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] text-zinc-500 block uppercase font-mono">Hasil Desorpsi Eco-Score:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-black uppercase ${
                      calcScore >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : calcScore >= 50 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-455 border border-rose-500/30 animate-pulse'
                    }`}>
                      {calcScore} / 100 Pts
                    </span>
                  </div>
                </div>

                {/* Display grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 items-stretch">
                  
                  {/* Atom Economy evaluation panel */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${aeRating.bg}`}>
                    <div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-550 border-b border-zinc-800 pb-1 mb-2">
                        <span className="uppercase">EKONOMI ATOM REAKSI:</span>
                        <span className="font-bold">STANDAR EKOLOGI</span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-black text-white">{calculatedAtomEconomy}% EA</span>
                        <div className={`w-full h-2.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                            style={{ width: `${calculatedAtomEconomy}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <strong className={`font-mono text-[9px] uppercase tracking-wide block ${aeRating.color}`}>{aeRating.label}</strong>
                      <p className="text-[10px] text-zinc-400 leading-normal font-sans">{aeRating.desc}</p>
                    </div>
                  </div>

                  {/* E-Factor evaluation panel */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${efRating.bg}`}>
                    <div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-550 border-b border-zinc-800 pb-1 mb-2">
                        <span className="uppercase">E-FACTOR (RASIO LIMBAH/PRODUK):</span>
                        <span className="font-bold">Dampak Sampah</span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-black text-white">{calculatedEFactor}x E-Factor</span>
                        <div className={`w-full h-2.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 transition-all duration-500" 
                            style={{ width: `${Math.min(100, calculatedEFactor * 40)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <strong className={`font-mono text-[9px] uppercase tracking-wide block ${efRating.color}`}>{efRating.label}</strong>
                      <p className="text-[10px] text-zinc-400 leading-normal font-sans">{efRating.desc}</p>
                    </div>
                  </div>

                </div>

                {/* 12 principles recommendations diagnostic block representing your inputs */}
                <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                  <span className="text-[9.5px] text-teal-400 font-extrabold uppercase tracking-wide block font-mono border-b border-slate-900 pb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Kesesuaian dengan 12 Prinsip Kimia Hijau:
                  </span>

                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] leading-relaxed font-sans text-zinc-350 list-inside">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 select-none">&bull;</span>
                      <div>
                        {calculatedAtomEconomy >= 80 ? (
                          <>Lolos <strong>Prinsip 2 (Ekonomi Atom)</strong> dengan efisiensi tinggi murni.</>
                        ) : (
                          <>Melanggar <strong>Prinsip 2</strong>. Cobalah mengganti reaktan pembantu yang redundan.</>
                        )}
                      </div>
                    </li>

                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 select-none">&bull;</span>
                      <div>
                        {calcSolventHazard === 'water' ? (
                          <>Mematuhi <strong>Prinsip 5 (Pelarut Aman)</strong> menggunakan air sebagai matriks.</>
                        ) : calcSolventHazard === 'alcohol' ? (
                          <>Cukup mematuhi <strong>Prinsip 5</strong>, waspadai risiko uap volatil sedang.</>
                        ) : (
                          <>Melanggar keras <strong>Prinsip 5 &amp; 3</strong> karena menggunakan pelarut halogenated beracun abadi.</>
                        )}
                      </div>
                    </li>

                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 select-none">&bull;</span>
                      <div>
                        {calcWithCatalyst ? (
                          <>Mematuhi <strong>Prinsip 9 (Katalis)</strong> yang mereduksi energi aktivasi reaksi secara substansial.</>
                        ) : (
                          <>Mengabaikan <strong>Prinsip 9</strong>. Sintesis tak berkatalis memicu peningkatan kebutuhan energi industri.</>
                        )}
                      </div>
                    </li>

                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 select-none">&bull;</span>
                      <div>
                        {calculatedEFactor <= 0.1 ? (
                          <>Sangat ideal menurut <strong>Prinsip 1 (Mencegah Limbah)</strong>.</>
                        ) : (
                          <>Belum ideal menurut <strong>Prinsip 1</strong>. Rasio buangan residu meluber keluar sediaan.</>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        );
      })()}

      {/* ==========================================
          TAB 3: THE GAME CHANGING CONSULTANT ENVIRONMENTAL AUDIT
          ========================================== */}
      {activeTab === 'challenge' && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          <AnimatePresence mode="wait">
            {!quizFinished ? (
              <motion.div
                key={currentQuestionIdx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`border rounded-2xl p-5 md:p-8 space-y-6 shadow-2xl ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}
              >
                
                {/* Visual scorecard indicator */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-900 gap-4 flex-wrap">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-emerald-450 uppercase font-black block">KONSULTAN AUDIT ENERGI BUMI</span>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5 font-sans">
                      <Award className="w-4.5 h-4.5 text-yellow-405 animate-bounce" />
                      Ujian Kualifikasi Kimia Hijau
                    </h3>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-zinc-555 block uppercase">Akumulasi Kredit poin:</span>
                      <strong className="text-sm font-mono text-emerald-455 block">&bull; +{quizScore} Pts</strong>
                    </div>
                    <div className={`h-8 w-px ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`} />
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-zinc-555 block uppercase">Progress Audit:</span>
                      <strong className="text-xs font-mono text-white block">{currentQuestionIdx + 1} / {CHALLENGE_QUESTIONS.length}</strong>
                    </div>
                  </div>
                </div>

                {/* Audit scenarios box */}
                <div className="space-y-4">
                  <span className="inline-block p-1 px-2.5 bg-yellow-500/10 text-yellow-450 text-[9px] font-mono font-bold uppercase rounded border border-yellow-500/25">
                    STUDI KASUS NYATA INDUSTRI
                  </span>
                  <h2 className="text-base md:text-lg font-bold text-white leading-relaxed font-sans">
                    {CHALLENGE_QUESTIONS[currentQuestionIdx].title}
                  </h2>
                  <div className={`p-4 rounded-xl border font-sans text-xs md:text-sm text-zinc-350 leading-relaxed shadow-inner ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    {CHALLENGE_QUESTIONS[currentQuestionIdx].scenario}
                  </div>
                </div>

                {/* Dynamic Comparative radar/score card meters representing the currently selected answer hover/click state */}
                {selectedAnswerIdx !== null && (
                  <div className={`p-4 rounded-xl border grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[10.5px] ${theme === 'dark' ? 'bg-slate-950 border-slate-900/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="space-y-1">
                      <span className="text-zinc-555 uppercase text-[8px]">Integritas Keamanan:</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].safety || 50}%` }}
                          />
                        </div>
                        <span className="font-bold text-emerald-405">{CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].safety || 50}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-555 uppercase text-[8px]">Profil Ekonomi:</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                          <div 
                            className="h-full bg-teal-400 transition-all duration-500" 
                            style={{ width: `${CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].eco || 50}%` }}
                          />
                        </div>
                        <span className="font-bold text-teal-400">{CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].eco || 50}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-555 uppercase text-[8px]">Kandungan Toksisitas:</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                          <div 
                            className="h-full bg-rose-500 transition-all duration-500" 
                            style={{ width: `${CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].toxic || 10}%` }}
                          />
                        </div>
                        <span className="font-bold text-rose-455">{CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].toxic || 10}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-555 uppercase text-[8px]">Efisiensi Energi:</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                          <div 
                            className="h-full bg-amber-400 transition-all duration-500" 
                            style={{ width: `${CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].energy || 50}%` }}
                          />
                        </div>
                        <span className="font-bold text-amber-405">{CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx].energy || 50}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multiple choice decision responses */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-mono font-bold text-zinc-505 uppercase tracking-widest">Tentukan Langkah Strategis Anda:</h4>
                  {CHALLENGE_QUESTIONS[currentQuestionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswerIdx === oIdx;
                    return (
                      <button
                        key={oIdx}
                        disabled={hasAnswered}
                        onClick={() => handleAnswerSelect(oIdx)}
                        className={`w-full text-left p-4 rounded-2xl transition-all border flex items-start gap-4 cursor-pointer text-xs md:text-sm ${
                          hasAnswered
                            ? opt.correct
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                              : isSelected
                                ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                                : 'bg-slate-950/40 border-slate-900/60 opacity-40 text-zinc-550'
                            : isSelected
                              ? 'bg-emerald-950/10 border-emerald-555 shadow-md scale-101 text-white font-semibold'
                              : 'bg-slate-955 border-slate-900/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <div className={`mt-0.5 w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-sans leading-relaxed">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback box */}
                <AnimatePresence>
                  {hasAnswered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border font-sans text-xs md:text-sm leading-relaxed ${
                        CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx!].correct
                          ? 'bg-emerald-950/15 border-emerald-900/30 text-emerald-450'
                          : 'bg-rose-950/15 border-rose-900/30 text-rose-455'
                      }`}
                    >
                      <div className="font-mono font-black border-b border-current/10 pb-1.5 mb-2 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                        {CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx!].correct ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            REKOMENDASI AUDIT: LOLOS STANDAR HIJAU
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                            REKOMENDASI AUDIT: CAIRAN BERHAZARD / GAGAL
                          </>
                        )}
                      </div>
                      {CHALLENGE_QUESTIONS[currentQuestionIdx].options[selectedAnswerIdx!].feedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nav buttons */}
                <div className="flex justify-end pt-2">
                  {!hasAnswered ? (
                    <button
                      onClick={handleApplyAnswer}
                      disabled={selectedAnswerIdx === null}
                      className="px-6 py-3 bg-emerald-500 text-slate-950 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:bg-zinc-805 disabled:text-zinc-600 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Evaluasi Keputusan Reaksi
                    </button>
                  ) : (
                    <button
                      onClick={handleNextChallenge}
                      className="px-6 py-3 bg-gradient-to-r from-teal-550 to-indigo-555 text-slate-950 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{currentQuestionIdx === CHALLENGE_QUESTIONS.length - 1 ? 'Selesaikan Sertifikasi Audit' : 'Evaluasi Kasus Selanjutnya'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border rounded-2xl p-8 text-center space-y-6 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-900' : 'bg-slate-100/30 border-slate-300'}`}
              >
                <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                  <Award className="w-10 h-10" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl md:text-2xl font-bold font-sans text-white">Sertifikasi Audit Industri Hijau Berhasil!</h2>
                  <p className="text-zinc-400 text-xs md:text-sm font-sans">
                    Hasil kebijakan operasional Anda telah tuntas kami evaluasi menurut standardisasi global.
                  </p>
                </div>

                <div className={`p-4 border rounded-xl max-w-sm mx-auto flex justify-between items-center font-mono ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                  <div className="text-left">
                    <span className="text-zinc-505 text-[8px] uppercase font-black leading-none mb-1 block">Skor diperoleh:</span>
                    <strong className={`text-2xl font-black ${quizScore >= 66 ? "text-emerald-400" : "text-amber-500"}`}>{Math.min(100, quizScore + 1)} / 100</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-505 text-[8px] uppercase font-black leading-none mb-1 block">Rekomendasi Jabatan:</span>
                    <strong className="text-xs font-bold text-white uppercase block">{quizScore >= 66 ? 'Konsultan Lingkungan Utama' : 'Magang Kimia Hijau'}</strong>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto font-sans">
                  {quizScore >= 66
                    ? 'Luar biasa! Keputusan taktis Anda sukses menyelamatkan ekosistem karsa, mengurangi emisi dinitrogen oksida global, dan menghemat konsumsi energi total. Hasil ini telah tersimpan dalam rekapitulasi nilai praktikum Anda!'
                    : 'Beberapa keputusan Anda memicu tumpahan limbah phthalate dan emisi gas asam korosif. Silakan ulas 12 prinsip di tab belajar dan ulangi kuis uji ini.'}
                </p>

                <div className="pt-4 flex justify-center gap-3 font-mono">
                  <button
                    onClick={() => {
                      setCurrentQuestionIdx(0);
                      setSelectedAnswerIdx(null);
                      setHasAnswered(false);
                      setQuizScore(0);
                      setQuizFinished(false);
                    }}
                    className={`px-5 py-2.5 border text-zinc-350 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-955 border-slate-900 hover:border-zinc-700' : 'bg-slate-100 border-slate-300 hover:border-slate-400'}`}
                  >
                    Ulangi Audit Kasus
                  </button>
                  <button
                    onClick={() => setActiveTab('principles')}
                    className="px-5 py-2.5 bg-emerald-555 hover:opacity-90 text-slate-950 font-mono font-black text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Kembali Ke Kamus 12 Prinsip
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
