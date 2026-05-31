/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
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
  ThermometerSnowflake,
  ShieldCheck,
  Check,
  X,
  Gauge as Speedometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';

interface PetroleumLabProps {
  currentUser: UserAccount | null;
  theme: 'dark' | 'light';
}

// 1. Fractions of Crude Oil Data
interface Fraction {
  id: number;
  name: string;
  chemicalName: string;
  carbonRange: string;
  boilingPoint: string;
  minTemp: number;
  maxTemp: number;
  description: string;
  uses: string;
  colorGrade: string; // Tailwinds color class for fraction representation
  icon: string;
}

const PETROLEUM_FRACTIONS: Fraction[] = [
  {
    id: 1,
    name: 'Fraksi Gas',
    chemicalName: 'Petroleum Gas / Elpiji',
    carbonRange: 'C1 – C4',
    boilingPoint: '< 20°C',
    minTemp: -160,
    maxTemp: 20,
    description: 'Gas metana, etana, propana, dan butana yang tidak terkondensasi di menara. Memiliki titik didih yang sangat rendah dan berwujud gas pada ruangan umum.',
    uses: 'Bahan bakar elpiji (LPG), bahan baku industri lilin sintetis dan petrokimia.',
    colorGrade: 'bg-zinc-500',
    icon: '💨'
  },
  {
    id: 2,
    name: 'Petroleum Eter',
    chemicalName: 'Ligroin Ringan',
    carbonRange: 'C5 – C6',
    boilingPoint: '30°C – 90°C',
    minTemp: 30,
    maxTemp: 90,
    description: 'Hidrokarbon cair berantai pendek dengan volatilitas sangat tinggi. Sifat nonpolarnya membuatnya sangat baik bertindak sebagai zat pengekstraksi.',
    uses: 'Bahan pelarut nonpolar laboratorium (solvent), pembersih minyak dan pengering mekanis.',
    colorGrade: 'bg-yellow-450',
    icon: '🧪'
  },
  {
    id: 3,
    name: 'Bensin (Gasoline)',
    chemicalName: 'Premium / Petrol / Motor Fuel',
    carbonRange: 'C5 – C10',
    boilingPoint: '70°C – 140°C',
    minTemp: 70,
    maxTemp: 140,
    description: 'Campuran komplek rantai senyawa alkana lurus dan bercabang yang sangat mudah menguap dan terbakar. Menjadi primadona utama pengolahan minyak bumi.',
    uses: 'Bahan bakar kendaraan bermotor roda dua dan roda empat standar sipil.',
    colorGrade: 'bg-amber-450',
    icon: '⛽'
  },
  {
    id: 4,
    name: 'Nafta (Premium Bensin Berat)',
    chemicalName: 'Petroleum Spirit',
    carbonRange: 'C6 – C10',
    boilingPoint: '140°C – 180°C',
    minTemp: 145,
    maxTemp: 180,
    description: 'Cairan ringan yang tidak mudah menguap sebanyak bensin, namun kaya akan aromatik hidrokarbon. Merupakan bahan pondasi penting dunia manufaktur modern.',
    uses: 'Bahan baku primer sintesis plastik, lem serat sintetis, cat rambut, karet sintetis, obat-obatan, kosmetik.',
    colorGrade: 'bg-orange-450',
    icon: '🏭'
  },
  {
    id: 5,
    name: 'Kerosin & Avtur',
    chemicalName: 'Minyak Tanah / Jet A-1 Fuel',
    carbonRange: 'C11 – C16',
    boilingPoint: '180°C – 250°C',
    minTemp: 180,
    maxTemp: 250,
    description: 'Fraksi minyak berdensitas sedang dengan titik nyala cair yang aman. Berguna dalam mesin turbin tekanan tinggi tanpa tersumbat kristal es.',
    uses: 'Bahan bakar jet udara pesawat komersial (avtur), mesin masak gas minyak tanah tradisional.',
    colorGrade: 'bg-cyan-550',
    icon: '✈️'
  },
  {
    id: 6,
    name: 'Minyak Solar (Diesel)',
    chemicalName: 'Gas Oil / Diesel Fuel',
    carbonRange: 'C15 – C25',
    boilingPoint: '250°C – 320°C',
    minTemp: 250,
    maxTemp: 320,
    description: 'Minyak bumi berat yang memerlukan kompresi tinggi untuk menyalakannya. Membawa tenaga kinetis besar untuk angkutan logistik darat.',
    uses: 'Bahan bakar mesin truk angkutan berat, mesin generator listrik industri, kapal nelayan.',
    colorGrade: 'bg-sky-650',
    icon: '🚚'
  },
  {
    id: 7,
    name: 'Minyak Pelumas (Oli)',
    chemicalName: 'Lubricating Oil',
    carbonRange: 'C20 – C30',
    boilingPoint: '320°C – 350°C',
    minTemp: 320,
    maxTemp: 350,
    description: 'Minyak kental bercirikan gaya adhesi tinggi terhadap permukaan besi logam, melindungi friksi mesin yang dipicu oleh gerakan rotasi ekstrem.',
    uses: 'Pelumas mesin (oli rantai & mesin silinder), pendingin metalurgi metal presisi.',
    colorGrade: 'bg-teal-650',
    icon: '💧'
  },
  {
    id: 8,
    name: 'Minyak Bakar (Fuel Oil)',
    chemicalName: 'Parafin Cair Berat / Fuel Oil No 6',
    carbonRange: 'C30 – C40',
    boilingPoint: '350°C – 400°C',
    minTemp: 350,
    maxTemp: 400,
    description: 'Cairan kental berwarna hitam legat berenergi kalori luar biasa mantap saat dibakar dalam kubah api raksasa pabrik baja atau turbin laut.',
    uses: 'Bahan bakar kapal kargo samudera raksasa, tungku peleburan baja industri, pembangkit listrik uap.',
    colorGrade: 'bg-purple-650',
    icon: '🛳️'
  },
  {
    id: 9,
    name: 'Residu (Aspal & Vaselin)',
    chemicalName: 'Bitumen / Ter / Lilin Parafin padat',
    carbonRange: 'C40+',
    boilingPoint: '> 400°C',
    minTemp: 400,
    maxTemp: 600,
    description: 'Komponen hidrokarbon rantai terpanjang serta paling lambat menguap. Menetap di lapisan dasar kolom distilasi berupa material solid/semi-padat anti-korosif air.',
    uses: 'Aspal pelapis jalan raya, bahan baku lilin parafin, salep kosmetik / pelapis anti rembes atap.',
    colorGrade: 'bg-stone-850',
    icon: '🛣️'
  }
];

// 2. Refinement tech data
interface TechCard {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  chemicalEquation: string;
  icon: any;
  aim: string;
}

const REFINERY_TECH: TechCard[] = [
  {
    id: 'cracking',
    title: 'Cracking (Perengkahan)',
    subTitle: 'Memecah Rantai Karbon Besar Menjadi Kecil',
    description: 'Proses kimia di mana hidrokarbon berantai panjang didegradasi secara termal atau menggunakan asam katalisator (silika Alumina) menjadi senyawa hidrokarbon pendek bernilai jual tinggi (yaitu hidrokarbon fraksi bensin berkualitas).',
    chemicalEquation: 'C₂₀H₄₂ (Minyak Berat) —[Panas / Katalis]—> C₈H₁₈ (Bensin) + C₁₂H₂₄ (Minyak Sedang)',
    icon: Layers,
    aim: 'Meningkatkan kuantitas fraksi bensin yang diproduksi dari satu barel minyak bumi mentah.'
  },
  {
    id: 'reforming',
    title: 'Reforming (Isomerisasi)',
    subTitle: 'Mengubah Stuktur Lurus Menjadi Bercabang',
    description: 'Struktur hidrokarbon rantai lurus (alkana normal) diubah menjadi isomer alkana rantai bercabang atau alkana siklik (sikloalkana) dengan bantuan platina katalis logam mulia. Struktur rantai bercabang memiliki ketahanan bakar mesin (angka oktan) jauh lebih unggul.',
    chemicalEquation: 'CH₃-(CH₂)₅-CH₃ (n-Heptan, Okt=0) —[Kat Platina]—> Isomer Bercabang (Isoheptan, Okt~90)',
    icon: Sliders,
    aim: 'Meningkatkan mutu/kualitas pembakaran (angka oktan) bahan bakar bensin.'
  },
  {
    id: 'alkylation',
    title: 'Alkilasi & Polimerisasi',
    subTitle: 'Menggabungkan Molekul Gas Menjadi Cair',
    description: 'Penggabungan molekul-molekul gas rantai pendek (seperti propena dan butena) menjadi senyawa hidrokarbon berantai medium bercabang yang laku digunakan sebagai bahan bakar bensin performa premium.',
    chemicalEquation: 'C₃H₆ (Gas Propilena) + C₄H₁₀ (Gas Butana) —[Kat Asam Sulfat]—> C₇H₁₆ (Bensin Berkualitas)',
    icon: Layers,
    aim: 'Menyulap gas hasil limbah kilang minyak menjadi cairan bensin siap jual.'
  },
  {
    id: 'blending',
    title: 'Blending (Formulasi Aditif)',
    subTitle: 'Pencampuran Zat Penstabil Dentuman Mesin',
    description: 'Mencampur bahan dasar bensin hasil reformasi dengan zat-zat kimia tambahan (aditif) agar meningkatkan angka oktan, mencegah pengendapan kerak pada katup piston mesin, dan mengurangi kandungan emisi buangan knalpot.',
    chemicalEquation: 'Bensin Dasar + Bio-Tanol (Ethanol) 10% —> Bahan Bakar Ramah Lingkungan Berkadar Oktan 95+',
    icon: Sparkles,
    aim: 'Membeli perlindungan tambahan bagi mesin kendaraan dan memitigasi pencemaran polusi udara.'
  }
];

// 3. Quiz Data
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Berdasarkan prinsip distilasi bertingkat, fraksi minyak bumi dilepaskan dan dipisahkan berdasarkan perbedaan sifat fisik apa?',
    options: [
      { text: 'A. Perbedaan kelarutan hidrokarbon di dalam air', correct: false },
      { text: 'B. Perbedaan titik didih masing-masing hidrokarbon', correct: true },
      { text: 'C. Perbedaan massa jenis relatif yang sangat ekstrem', correct: false },
      { text: 'D. Jumlah muatan ion positif di dalam struktur karbon', correct: false }
    ],
    feedback: 'Benar sekali! Distilasi bertingkat memisahkan komponen campuran zat cair berdasarkan perbedaan titik didihnya. Zat cair bertitik didih rendah akan menguap terlebih dahulu hingga mencapai bagian puncak kolom menara.'
  },
  {
    id: 2,
    question: 'Sebuah sampel bensin tersusun atas campuran 10% n-heptana dan 90% isooktana (2,2,4-trimetilpentana). Angka oktan (octane rating) dari bensin tersebut adalah...',
    options: [
      { text: 'A. Angka Oktan 10', correct: false },
      { text: 'B. Angka Oktan 80', correct: false },
      { text: 'C. Angka Oktan 90', correct: true },
      { text: 'D. Angka Oktan 100', correct: false }
    ],
    feedback: 'Tepat! Nilai angka oktan menyatakan persentase isooktana dalam bahan bakar tersebut. Karena isooktana bernilai oktan 100 dan n-heptana bernilai 0, maka campuran 90% isooktana & 10% n-heptana setara angka oktan 90.'
  },
  {
    id: 3,
    question: 'Mengapa penggunaan zat aditif TEL (Tetraethyl Lead) saat ini dilarang keras di Indonesia dan seluruh penjuru dunia?',
    options: [
      { text: 'A. Mengakibatkan korosi hebat pada dinding knalpot seketika', correct: false },
      { text: 'B. Mengurangi energi kalori ledakan bensin berkali-kali lipat', correct: false },
      { text: 'C. Gas buang sisa pembakaran mengandung logam timbal beracun yang merusak fungsi syaraf otak anak-anak', correct: true },
      { text: 'D. Membuat aspal jalan raya menjadi gampang terbakar matahari', correct: false }
    ],
    feedback: 'Luar biasa benar! TEL mengandung unsur plumbum (timbal / Pb). Pembakarannya menghasilkan partikulat logam berat timbal di udara bebas yang sangat toksik, dapat terhirup manusia, serta memicu penurunan kognitif karsa otak anak.'
  },
  {
    id: 4,
    question: 'Metode pengolahan minyak bumi untuk merestrukturisasi alkana rantai lurus (octane buruk) menjadi senyawa rantai bercabang (octane unggul) disebut...',
    options: [
      { text: 'A. Cracking (Perengkahan katalis)', correct: false },
      { text: 'B. Reforming (Isomerisasi)', correct: true },
      { text: 'C. Polimerisasi adisi molekul', correct: false },
      { text: 'D. Desulfurasi hidroalkana', correct: false }
    ],
    feedback: 'Benar! Reforming (Isomerisasi) adalah pendesainan ulang struktur molekul hidrokarbon rantai lurus menjadi rantai bercabang yang tahan dipadatkan tekanan mesin tanpa detonasi prematur.'
  },
  {
    id: 5,
    question: 'Bensin Pertamax yang dijual di SPBU memiliki kadar oktan minimal 92. Jenis rasio kompresi mesin mobil/motor yang direkomendasikan untuk membakar bensin ini paling aman berkisar antara...',
    options: [
      { text: 'A. Rasio kompresi sangat rendah (7:1 s.d. 8:1)', correct: false },
      { text: 'B. Rasio kompresi komersial sedang (10:1 s.d. 11:1)', correct: true },
      { text: 'C. Rasio kompresi traktor sawit ekstrim (lebih besar dari 14:1)', correct: false },
      { text: 'D. Silinder tanpa kompresi termal', correct: false }
    ],
    feedback: 'Betul sekali! Bensin berangka oktan 92 dirancang stabil di bawah rasio kompresi 10:1 hingga 11:1 untuk mencegah terjadinya noda karat karbon akibat knocking/ketukan mesin bensin generasi modern.'
  }
];

export default function PetroleumLab({ currentUser, theme = 'dark' }: PetroleumLabProps) {
  const [activeTab, setActiveTab] = useState<'distillation' | 'octane' | 'treatment' | 'quiz'>('distillation');

  // Tab 1: Distillation State
  const [columnTemp, setColumnTemp] = useState<number>(150); // °C slider
  const [selectedFractionId, setSelectedFractionId] = useState<number>(3); // Default values Bensin
  
  // Tab 1 Dynamic Simulation States
  const [isSimulatingDistillation, setIsSimulatingDistillation] = useState<boolean>(false);
  const [distillationStep, setDistillationStep] = useState<'idle' | 'pumping' | 'heating' | 'condensing' | 'completed'>('idle');
  const [distillationLogs, setDistillationLogs] = useState<string[]>([
    'Sistem siap. Klik "Mulai Simulasikan Aliran" untuk mengamati fraksionasi otomatis!'
  ]);

  // Tab 2: Octane Simulator State
  const [isooctanePercent, setIsooctanePercent] = useState<number>(90); // 0-100%
  const [compressionRatio, setCompressionRatio] = useState<number>(10); // 7:1 to 12:1
  const [engineState, setEngineState] = useState<'idle' | 'running' | 'knocking'>('idle');
  const [sparkFired, setSparkFired] = useState<boolean>(false);
  const [testLog, setTestLog] = useState<string[]>(['Sistem siap disimulasikan. Tekan "Nyalakan Mesin"!']);
  
  // Tab 2 Molecular & Additive States
  const [selectedAdditive, setSelectedAdditive] = useState<'none' | 'tel' | 'mtbe' | 'ethanol'>('none');
  const [selectedStructure, setSelectedStructure] = useState<'isooctane' | 'heptane'>('isooctane');

  // Tab 3: Refinery Sandbox Catalyst States
  const [refineryGoal, setRefineryGoal] = useState<'bensin' | 'isooctane' | 'hightech'>('bensin');
  const [selectedCatalyst, setSelectedCatalyst] = useState<string>('alumina_silica');
  const [selectedTempRange, setSelectedTempRange] = useState<number>(400); // °C slider
  const [sandboxFeedstock, setSandboxFeedstock] = useState<'heavy_oil' | 'lurus_nheptan' | 'gas_c3c4'>('heavy_oil');
  const [sandboxResult, setSandboxResult] = useState<{ success: boolean; msg: string; product: string } | null>(null);
  const [sandboxIsReacting, setSandboxIsReacting] = useState<boolean>(false);

  // Tab 3: Refinery Tech State
  const [activeTechId, setActiveTechId] = useState<string>('cracking');

  // Tab 4: Quiz State
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [wrongStreak, setWrongStreak] = useState<number>(0);

  // Derive active fraction based on selected index
  const activeFraction = PETROLEUM_FRACTIONS.find(f => f.id === selectedFractionId) || PETROLEUM_FRACTIONS[2];

  // Derive active fraction based on column temperature slider
  useEffect(() => {
    if (isSimulatingDistillation) return;
    // Find fraction that covers this temperature
    const matched = PETROLEUM_FRACTIONS.find(f => {
      if (f.id === 1 && columnTemp <= 20) return true;
      if (f.id === 9 && columnTemp >= 400) return true;
      return columnTemp >= f.minTemp && columnTemp <= f.maxTemp;
    });
    if (matched) {
      setSelectedFractionId(matched.id);
    }
  }, [columnTemp, isSimulatingDistillation]);

  // Handle engine ignition logic
  const handleIsooctaneChange = (val: number) => {
    setIsooctanePercent(val);
  };

  const getHeptanePercent = () => 100 - isooctanePercent;

  const getAdditiveBoost = () => {
    switch (selectedAdditive) {
      case 'tel': return 10;
      case 'mtbe': return 8;
      case 'ethanol': return 5;
      default: return 0;
    }
  };

  const getOctaneRating = () => {
    return Math.min(100, isooctanePercent + getAdditiveBoost());
  };

  // Start distillation automatically
  const startFullDistillation = () => {
    if (isSimulatingDistillation) return;
    setIsSimulatingDistillation(true);
    setDistillationStep('pumping');
    setColumnTemp(20);
    setDistillationLogs([
      '🛢️ [POMPA] Memompa minyak mentah (Crude Oil) hitam kental dari tangki pelabuhan sandar...',
      '🔍 [SENSOR] Sistem membaca kombinasi hidrokarbon rantai pendek hingga aspal padat.'
    ]);

    setTimeout(() => {
      setDistillationStep('heating');
      setDistillationLogs(prev => [
        '🔥 [TANUR] Tungku peleburan furnace dinyalakan! Menyuplai gas bersuhu ekstrim...',
        ...prev
      ]);

      // Ramp temperature
      let temp = 20;
      const tInterval = setInterval(() => {
        temp += 30;
        if (temp >= 420) {
          temp = 420;
          clearInterval(tInterval);
        }
        setColumnTemp(temp);
      }, 100);

      setTimeout(() => {
        setDistillationStep('condensing');
        setDistillationLogs(prev => [
          '⚡ [MENARA] Komponen gas mendidih terbang naik. Kondensasi kaskade bertingkat berjalan...',
          ...prev
        ]);

        // Show fractions from Bottom to Top (descending id 9 to 1)
        let fId = 9;
        const fInterval = setInterval(() => {
          setSelectedFractionId(fId);
          const activeFrac = PETROLEUM_FRACTIONS.find(f => f.id === fId);
          if (activeFrac) {
            setDistillationLogs(prev => [
              `💧 [KONDENSASI] Plat #${10 - fId} (${activeFrac.boilingPoint}): Fraksi ${activeFrac.name} mengembun dengan rentang senyawa ${activeFrac.carbonRange}!`,
              ...prev
            ]);
          }
          fId--;
          if (fId < 1) {
            clearInterval(fInterval);
            setDistillationStep('completed');
            setIsSimulatingDistillation(false);
            setDistillationLogs(prev => [
              '🏆 [SUKSES KPI] Siklus fraksionasi minyak mentah berhasil dikelompokkan menjadi 9 aliran murni.',
              '💡 [PETUNJUK GURU] Terlihat fraksi aspal & solar mendominasi berat barel draf alami. Untuk meningkatkan bensin bermutu, kilang menggunakan rekayasa sekunder Cracking & Reforming!',
              ...prev
            ]);

            // Dispatch score event
            const actEvent = new CustomEvent('chemvibe_activity', {
              detail: {
                activityType: 'lab_simulated',
                title: 'Distilasi Bertingkat Sukses',
                description: 'Berhasil melakukan fraksionasi Crude Oil suhu bertahap dan memilah produk alkana.',
                score: { earned: 15, total: 15 }
              }
            });
            window.dispatchEvent(actEvent);
          }
        }, 800);

      }, 1500);

    }, 1500);
  };

  const runSandboxRefinery = () => {
    setSandboxIsReacting(true);
    setSandboxResult(null);
    
    setTimeout(() => {
      setSandboxIsReacting(false);
      let isCorrect = false;
      let msg = '';
      let product = '';
      
      if (refineryGoal === 'bensin') {
        if (sandboxFeedstock === 'heavy_oil' && selectedCatalyst === 'alumina_silica' && selectedTempRange >= 350) {
          isCorrect = true;
          product = 'Bensin Cair volatile (C₈H₁₈) + Gas Alkena Sampingan';
          msg = 'Sempurna! Cracking (Perengkahan) termokatalitik berhasil memutuskan ikatan kental C20 menjadi rantai bensin ringan siap guna yang bernilai ekonomis tinggi.';
        } else {
          msg = 'Gagal! Untuk memecah molekul kental (Cracking) silinder bensin berat, Anda wajib menyediakan sediaan Minyak Berat (C20-C40), asupan energi panas melimpah (>350°C), serta bantuan katalis kopolimer Alumina Silika.';
        }
      } else if (refineryGoal === 'isooctane') {
        if (sandboxFeedstock === 'lurus_nheptan' && selectedCatalyst === 'platinum' && selectedTempRange >= 200 && selectedTempRange <= 350) {
          isCorrect = true;
          product = 'Ramifikasi Iso-Oktana / Isomer Bercabang';
          msg = 'Luar biasa benar! Logam Platinum (Pt) murni berperan merestrukturisasi (Reforming) sirkuit n-Heptana lurus menjadi isomer-isomer bercabang yang ramah tebasan kompresi tinggi.';
        } else {
          msg = 'Gagal! Reforming (Isomerisasi) membutuhkan zat hidrokarbon berantai lurus (n-heptana), asupan panas sedang-tinggi (200°C - 350°C), serta logam transisi murni Platinum (Pt) sebagai agen kopolimer katalisator.';
        }
      } else if (refineryGoal === 'hightech') {
        if (sandboxFeedstock === 'gas_c3c4' && selectedCatalyst === 'sulfuric_acid' && selectedTempRange < 150) {
          isCorrect = true;
          product = 'Cairan Alkilat Bensin Alkilasi Premium (C₇H₁₆)';
          msg = 'Tepat sekali! Alkilasi gas-gas olefin pendek membutuhkan sediaan katalis berupa protonik asam kuat (Asam Sulfat Pekat) di bawah suhu rendah (<150°C) agar karbon kation tidak hancur.';
        } else {
          msg = 'Gagal! Polimerisasi / alkilasi molekul gas pengilangan membutuhkan umpan gas C3-C4, temperatur dingin-sedang (<150°C) untuk menstabilkan anion, serta asam sulfat cair pekat.';
        }
      }
      
      setSandboxResult({ success: isCorrect, msg, product });
      
      if (isCorrect) {
        const actEvent = new CustomEvent('chemvibe_activity', {
          detail: {
            activityType: 'lab_simulated',
            title: 'Rekayasa Katalis Kilang',
            description: `Berhasil merakit reaktor katalis sekunder untuk target sediaan: ${refineryGoal}`,
            score: { earned: 20, total: 20 }
          }
        });
        window.dispatchEvent(actEvent);
      }
    }, 1500);
  };

  const getFuelGradeDetails = (octane: number) => {
    if (octane < 88) return { name: 'Kerosin / Campuran Solar Berat', color: 'text-rose-455', desc: 'Sangat tidak direkomendasikan untuk mesin bensin sipil. Detonasi ekstrim!' };
    if (octane >= 88 && octane < 90) return { name: 'Premium (Oktan 88)', color: 'text-amber-400', desc: 'Cocok untuk mobil jadul dengan rasio kompresi rendah (< 9:1).' };
    if (octane >= 90 && octane < 92) return { name: 'Pertalite (Oktan 90)', color: 'text-teal-400', desc: 'Standar kendaraan komersial berkeliaran di jalanan dengan kompresi 9:1 s.d 10:1.' };
    if (octane >= 92 && octane < 95) return { name: 'Pertamax (Oktan 92)', color: 'text-blue-400', desc: 'Sangat efisien untuk mesin modern ber-rasio kompresi 10:1 s.d 11:1.' };
    if (octane >= 95 && octane < 98) return { name: 'Pertamax Green (Oktan 95)', color: 'text-emerald-450', desc: 'Ramah hayati, ideal untuk rasio kompresi presisi 11:1 s.d 11.5:1.' };
    return { name: 'Pertamax Turbo (Oktan 98)', color: 'text-purple-400', desc: 'Bahan bakar oktan tinggi untuk performa optimal rasio kompresi tinggi (11.5:1 s.d 12.5:1).' };
  };

  const activeFuelInfo = getFuelGradeDetails(getOctaneRating());

  // Determine if the current fueling ratio leads to engine knocking under chosen compression
  const doesEngineKnock = () => {
    const octane = getOctaneRating();
    // Logical safety grid
    // Compression 7-8 needs oktan >= 80
    // Compression 9 needs oktan >= 88
    // Compression 10 needs oktan >= 90
    // Compression 11 needs oktan >= 92
    // Compression 12 needs oktan >= 95
    if (compressionRatio <= 8 && octane >= 80) return false;
    if (compressionRatio === 9 && octane >= 88) return false;
    if (compressionRatio === 10 && octane >= 90) return false;
    if (compressionRatio === 11 && octane >= 92) return false;
    if (compressionRatio === 12 && octane >= 95) return false;
    return true; // Knocking occurs!
  };

  const [engineCycle, setEngineCycle] = useState<number>(0);
  const [knocksRegistered, setKnocksRegistered] = useState<number>(0);

  // Run periodic engine simulator tick to represent combustion in real-time
  useEffect(() => {
    if (engineState === 'idle') return;

    const interval = setInterval(() => {
      setSparkFired(true);
      setTimeout(() => setSparkFired(false), 200);

      const knockingOccurred = doesEngineKnock();
      setEngineCycle(prev => prev + 1);

      if (knockingOccurred) {
        setEngineState('knocking');
        setKnocksRegistered(prev => prev + 1);
        setTestLog(prev => [
          `[Siklus ${engineCycle}] ⚠️ ENGINE KNOCKING! Ledakan terdeteksi sebelum piston siap di puncak kompresi.`,
          ...prev.slice(0, 5)
        ]);
      } else {
        setEngineState('running');
        setTestLog(prev => [
          `[Siklus ${engineCycle}] Sempurna. Pembakaran bensin oktan tinggi tenang pada tekanan kompresi ${compressionRatio}:1.`,
          ...prev.slice(0, 5)
        ]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [engineState, isooctanePercent, compressionRatio, engineCycle]);

  const handleStartEngine = () => {
    setEngineCycle(1);
    setKnocksRegistered(0);
    const knocks = doesEngineKnock();
    if (knocks) {
      setEngineState('knocking');
      setTestLog([
        'Mesin mulai berputar... 🔨 PERINGATAN: Ketukan mesin (Knocking) parah terdeteksi segera setelah api dinyalakan!'
      ]);
    } else {
      setEngineState('running');
      setTestLog([
        'Mesin dinyalakan... ✓ Berputar mulus, bensin memicu percikan dengan kestabilan penuh.'
      ]);
    }
  };

  const handleStopEngine = () => {
    setEngineState('idle');
    setTestLog(prev => ['Mesin dimatikan secara aman.', ...prev.slice(0, 4)]);
  };

  // Handle quiz choices
  const handleSelectQuizOption = (optIdx: number) => {
    if (quizAnswered) return;
    setSelectedOptIdx(optIdx);
  };

  const handleApplyQuizAnswer = () => {
    if (selectedOptIdx === null || quizAnswered) return;
    setQuizAnswered(true);

    const isCorrect = QUIZ_QUESTIONS[quizIdx].options[selectedOptIdx].correct;
    if (isCorrect) {
      setQuizScore(prev => prev + 20); // Each is worth 20 pts
      setWrongStreak(0);
    } else {
      setWrongStreak(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOptIdx(null);
    setQuizAnswered(false);

    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(prev => prev + 1);
    } else {
      setQuizComplete(true);
      
      // Dispatching activity score event to top-level app logic so it writes dynamically to Firebase Firestore Database
      const earnedPoints = quizScore;
      const totalPoints = 100;
      const actEvent = new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          title: 'Petroleum & Angka Oktan',
          description: `Telah lulus evaluasi fraksionasi minyak bumi dengan akurasi nilai ${earnedPoints}/100`,
          score: { earned: earnedPoints, total: totalPoints }
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
    setWrongStreak(0);
  };

  return (
    <div id="petroleum-fractions-lab-view" className={`w-full min-h-[calc(100vh-4rem)] p-4 md:p-8 space-y-6 ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Visual Header Banner */}
      <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-r from-teal-950/40 via-yellow-950/10 to-slate-900 border border-teal-900/30 overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-teal-500/5 rounded-full blur-2xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-450 text-[10px] font-mono font-black uppercase rounded-full">
                Kimia Kelas XI • Minyak Bumi
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-teal-400 font-bold bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-550/20">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Kurikulum Merdeka
              </span>
            </div>
            <h1 className="text-2xl md:text-3.5xl font-sans font-bold tracking-tight text-white flex items-center gap-2.5">
              <Flame className="w-8 h-8 text-yellow-450 animate-pulse fill-yellow-500/15" />
              Fraksionasi Minyak Bumi <span className="text-teal-400 font-normal">&amp; Angka Oktan</span>
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Pelajari teknik distilasi bertingkat (menara fraksionasi) pengubah minyak mentah (crude oil) menjadi produk energi, rahasia isooktana vs n-heptana pada mesin bensin, serta rekayasa angka oktan.
            </p>
          </div>

          <div className={`flex flex-col gap-2 p-1 rounded-xl border w-full md:w-56 shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
            <button
              onClick={() => setActiveTab('distillation')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left ${
                activeTab === 'distillation'
                  ? 'bg-gradient-to-r from-yellow-500/20 to-teal-500/20 text-yellow-400 border border-yellow-500/30'
                  : (theme === 'dark' ? 'text-zinc-450 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Distilasi Bertingkat
            </button>
            <button
              onClick={() => setActiveTab('octane')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left ${
                activeTab === 'octane'
                  ? 'bg-gradient-to-r from-yellow-500/20 to-teal-500/20 text-yellow-400 border border-yellow-500/30'
                  : (theme === 'dark' ? 'text-zinc-450 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Simulator Oktan &amp; Mesin
            </button>
            <button
              onClick={() => setActiveTab('treatment')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left ${
                activeTab === 'treatment'
                  ? 'bg-gradient-to-r from-yellow-500/20 to-teal-500/20 text-yellow-400 border border-yellow-500/30'
                  : (theme === 'dark' ? 'text-zinc-450 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Proses Pemurnian
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all tracking-wider text-left relative ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-yellow-500/20 to-teal-500/20 text-yellow-400 border border-yellow-500/30'
                  : (theme === 'dark' ? 'text-zinc-450 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Evaluasi Kuis
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE FRACTIONAL DISTILLATION COLUMN */}
      {activeTab === 'distillation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Column Controller and Dynamic Visualization Panel */}
          <div className={`lg:col-span-7 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/25 border-slate-900' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-yellow-500" />
                  Interaksi Menara Fraksionasi Distilasi
                </h3>
                <p className="text-[10.5px] font-mono text-zinc-550 uppercase">Atur reaktor secara manual atau jalankan simulasi otomatis kilang kimia.</p>
              </div>

              {/* Simulation Trigger Button */}
              <button
                disabled={isSimulatingDistillation}
                onClick={startFullDistillation}
                className={`px-4.5 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  isSimulatingDistillation
                    ? 'bg-zinc-805 text-zinc-500 border border-zinc-700/30'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 shadow-lg shadow-teal-500/10'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${isSimulatingDistillation ? '' : 'animate-bounce'}`} />
                {isSimulatingDistillation ? 'Simulasi Berjalan...' : 'Simulasikan Pengilangan'}
              </button>
            </div>

            {/* Simulated Temperature Knob Slider */}
            <div className={`p-4 rounded-xl border space-y-3.5 transition-all ${isSimulatingDistillation ? 'opacity-45 pointer-events-none' : ''} ${
              theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500 font-bold uppercase">Suhu Reaktor Utama (Furnace):</span>
                <span className="px-2 py-0.5 bg-yellow-550/15 text-yellow-405 border border-yellow-500/20 rounded font-black text-sm">
                  {columnTemp === -160 ? 'Minyak Mentah Dingin (< 20°C)' : `${columnTemp} °C`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="450"
                step="10"
                value={columnTemp}
                disabled={isSimulatingDistillation}
                onChange={(e) => setColumnTemp(Number(e.target.value))}
                className={`w-full accent-yellow-450 h-2 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-650">
                <span>0°C (Minyak Mentah)</span>
                <span>150°C (Bensin/Nafta)</span>
                <span>270°C (Solar)</span>
                <span>&gt; 400°C (Aspal Padat)</span>
              </div>
            </div>

            {/* Dynamic Step visualizer during simulation */}
            {isSimulatingDistillation && (
              <div className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
                theme === 'dark' ? 'bg-teal-950/15 border-teal-900/30 text-zinc-300' : 'bg-teal-50 border-teal-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                  <span>Progress Aliran Reaktan:</span>
                  <span className="animate-pulse text-emerald-450">Fase: {distillationStep.toUpperCase()}</span>
                </div>
                <div className={`w-full h-2 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-200'} rounded-full overflow-hidden relative border border-slate-900`}>
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300 animate-pulse"
                    style={{ 
                      width: 
                        distillationStep === 'pumping' ? '25%' : 
                        distillationStep === 'heating' ? '50%' : 
                        distillationStep === 'condensing' ? '80%' : '100%' 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Fractionating Tower Interactive SVG Render */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-5 items-stretch min-h-[460px] ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-900/60' : 'bg-white border-slate-200'
            }`}>
              
              {/* Vertical Schematic of the tower */}
              <div className={`w-full md:w-1/2 flex flex-col justify-between border-l border-r rounded-lg p-2.5 space-y-1 relative ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-300 bg-slate-100/80'}`}>
                
                {/* Furnace Base graphic */}
                <div className="absolute -bottom-1 -left-2.5 right-0 h-10 w-2.5 md:w-3 bg-rose-500/10 border-l border-rose-500/30 rounded-l animate-pulse pointer-events-none" />
                
                {/* Gradient background representing hot bottom vs cold top */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-950/15 via-yellow-950/5 to-cyan-950/10 pointer-events-none rounded-lg" />

                {/* Iterate through the fractions in top-to-bottom order (lowest boiling point to highest) */}
                {PETROLEUM_FRACTIONS.map((frac) => {
                  const isCurrentlyActive = selectedFractionId === frac.id;
                  
                  // Highlight is based on current furnace temperature coverage
                  const isTempActive = columnTemp >= frac.minTemp;

                  return (
                    <button
                      key={frac.id}
                      onClick={() => !isSimulatingDistillation && setSelectedFractionId(frac.id)}
                      disabled={isSimulatingDistillation}
                      className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between cursor-pointer relative z-10 ${
                        isCurrentlyActive 
                          ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-404 shadow-md shadow-yellow-500/5' 
                          : isTempActive 
                            ? 'bg-slate-900/85 border-slate-800 text-zinc-300 hover:border-zinc-700' 
                            : 'bg-slate-950/45 border-slate-910/30 text-zinc-650 opacity-45 hover:opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm">{frac.icon}</span>
                        <div className="truncate">
                          <span className="font-bold block text-[10.5px] leading-tight">{frac.name}</span>
                          <span className="text-[8.5px] text-zinc-550 block leading-none">{frac.carbonRange} &bull; {frac.boilingPoint}</span>
                        </div>
                      </div>

                      {/* Led temperature gauge bulb on the tower */}
                      <span className={`w-2.5 h-2.5 rounded-full border shadow-sm ${
                        isCurrentlyActive 
                          ? 'bg-yellow-400 border-yellow-300 animate-pulse scale-110' 
                          : isTempActive 
                            ? 'bg-teal-500/80 border-teal-450 shadow-inner' 
                            : 'bg-zinc-800 border-zinc-900'
                      }`} />
                    </button>
                  );
                })}
              </div>

              {/* Furnacing Heater Fire graphic simulation */}
              <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4">
                <div className={`p-4 rounded-xl border flex-1 flex flex-col justify-center items-center text-center space-y-3 relative overflow-hidden ${
                  theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="relative">
                    <Flame className={`w-12 h-12 transition-all duration-500 ${
                      columnTemp > 300 
                        ? 'text-rose-500 scale-125 animate-bounce' 
                        : columnTemp > 120 
                          ? 'text-amber-500 scale-110 animate-pulse' 
                          : 'text-zinc-650 opacity-40'
                    }`} />
                    <span className="text-[10px] absolute -bottom-1 left-1/2 -translate-x-1/2 font-mono font-black text-rose-505">
                      {columnTemp > 300 ? 'APAKAH MAKS' : columnTemp > 100 ? 'SEDANG' : 'DIPADAM'}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-xs text-zinc-300">
                    <div className="font-bold">Tanur Penguapan</div>
                    <div className="text-[10px] text-zinc-550 leading-normal">
                      Minyak mentah (petroleum mentah) memasuki furnace dasar pada suhu tinggi hingga mendidih membentuk campuran uap gas sebelum ditiup ke menara.
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border font-mono text-[10.5px] text-left space-y-1 ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-900 text-zinc-400'
                  : 'bg-slate-200 border-slate-300 text-slate-800'
              }`}>
                    <div className="text-zinc-550 text-[9px] uppercase font-bold">Analisis Termofisika Menara:</div>
                    <div>• Suhu Fraksionator Default: <strong className="text-white">{columnTemp}°C</strong></div>
                    <div>• Rentang Senyawa Aktif: <strong className="text-yellow-405">{activeFraction.carbonRange}</strong></div>
                    <div>• Sifat Kondensat: <span className="text-emerald-450">{columnTemp >= activeFraction.minTemp ? 'Menguap Bersih' : 'Mengendap Cair'}</span></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Distillation Log output console */}
            <div className={`p-4 rounded-xl border font-mono space-y-1.5 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'
              }`}>
              <span className="text-[9.5px] uppercase text-zinc-505 font-bold block">Hasil Log Aliran &amp; Kondensasi Menara:</span>
              <div className="text-[10.5px] space-y-1.5 max-h-[120px] overflow-y-auto leading-relaxed divide-y divide-slate-900/60">
                {distillationLogs.map((log, lIdx) => {
                  let lColor = 'text-zinc-400';
                  if (log.includes('[SUKSES')) lColor = 'text-teal-400 font-black animate-pulse';
                  else if (log.includes('[KONDENSASI]')) lColor = 'text-yellow-450';
                  else if (log.includes('[TANUR]')) lColor = 'text-rose-455';
                  else if (log.includes('[POMPA]')) lColor = 'text-blue-400';

                  return (
                    <div key={lIdx} className={`${lColor} pt-1.5 first:pt-0`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Panel of Selected Petroleum Fraction */}
          <div className="lg:col-span-5 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFraction.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className={`border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/25 border-slate-900' : 'bg-white border-slate-200'} p-6 space-y-6 flex-1 flex flex-col justify-between`}
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-3.5">
                    <span className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-2xl rounded-2xl">
                      {activeFraction.icon}
                    </span>
                    <div>
                      <span className="text-[9px] font-mono text-yellow-405 font-bold uppercase tracking-widest block">FRAKSI NO. {activeFraction.id}</span>
                      <h2 className="text-lg md:text-xl font-bold font-sans text-white leading-none">{activeFraction.name}</h2>
                      <span className="text-zinc-500 font-mono text-[11px] block mt-1">{activeFraction.chemicalName}</span>
                    </div>
                  </div>

                  {/* Boiling range indicators */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className={`p-3 rounded-xl border text-center ${theme === 'dark' ? 'bg-slate-950 border-slate-900/60' : 'bg-slate-100 border-slate-200'}`}>
                      <span className="text-[9px] text-zinc-550 uppercase tracking-wider block mb-0.5">Rentang Karbon</span>
                      <strong className="text-teal-400 text-sm font-black">{activeFraction.carbonRange}</strong>
                    </div>

                    <div className={`p-3 rounded-xl border text-center ${theme === 'dark' ? 'bg-slate-950 border-slate-900/60' : 'bg-slate-100 border-slate-200'}`}>
                      <span className="text-[9px] text-zinc-550 uppercase tracking-wider block mb-0.5">Suhu Titik Didih</span>
                      <strong className="text-yellow-450 text-sm font-black">{activeFraction.boilingPoint}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold text-zinc-505 uppercase tracking-widest">Karakteristik Fisika ZAT:</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed font-sans">{activeFraction.description}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} space-y-2`}>
                    <h4 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-450" />
                      Kegunaan di Industri &amp; Kehidupan:
                    </h4>
                    <p className="text-zinc-300 text-xs md:text-sm leading-relaxed font-sans">{activeFraction.uses}</p>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-zinc-550">
                  <span>Materi Kimia Karbon • Kelas XI SMA</span>
                  <span>Distilasi Bertingkat Minyak Bumi</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* TAB 2: OCTANE RATING AND ENGINE KNOCKING SIMULATOR */}
      {activeTab === 'octane' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Octane Mixing Controller Console */}
          <div className={`lg:col-span-7 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/25 border-slate-900' : 'bg-white border-slate-200'}`}>
            <div className="space-y-1">
              <h3 className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-yellow-405" />
                Formulasi Bahan Bakar &amp; Uji Detonasi Piston
              </h3>
              <p className="text-[10.5px] font-mono text-zinc-550 uppercase">Racik perbandingan molekul isomer hidrokarbon untuk menguji kestabilan putaran piston silinder mesin.</p>
            </div>

            {/* Indonesian Fuel Presets Selector */}
            <div className="space-y-2 border-b border-slate-900 pb-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase font-black block">Presets Bahan Bakar Pasaran Indonesia (SPBU):</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {[
                  { name: 'Premium 88', octane: 88, compRatio: 8, color: 'text-amber-400 hover:bg-amber-950/20 active:bg-amber-950/40 border-amber-500/20' },
                  { name: 'Pertalite 90', octane: 90, compRatio: 9, color: 'text-teal-405 hover:bg-teal-950/20 active:bg-teal-950/40 border-teal-500/20' },
                  { name: 'Pertamax 92', octane: 92, compRatio: 10, color: 'text-blue-400 hover:bg-blue-950/20 active:bg-blue-950/40 border-blue-500/20' },
                  { name: 'Pertamax G.', octane: 95, compRatio: 11, color: 'text-emerald-400 hover:bg-emerald-950/20 active:bg-emerald-950/40 border-emerald-500/20' },
                  { name: 'Pertamax T.', octane: 98, compRatio: 12, color: 'text-purple-400 hover:bg-purple-950/20 active:bg-purple-950/40 border-purple-500/20' },
                ].map((fuel) => {
                  const isCurrentPreset = isooctanePercent === fuel.octane && compressionRatio === fuel.compRatio && selectedAdditive === 'none';
                  return (
                    <button
                      key={fuel.name}
                      onClick={() => {
                        setIsooctanePercent(fuel.octane);
                        setCompressionRatio(fuel.compRatio);
                        setSelectedAdditive('none');
                        setTestLog(prev => [`[INFO] Memuat Preset SPBU: ${fuel.name} (Oktan ${fuel.octane}, Rasio Kompresi ${fuel.compRatio}:0)`, ...prev.slice(0, 4)]);
                      }}
                      className={`px-2 py-2 rounded-xl text-[10.5px] font-mono font-bold border transition-all text-center cursor-pointer ${
                        isCurrentPreset
                          ? 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-400 text-teal-400 shadow shadow-teal-550/20'
                          : `bg-slate-950 ${fuel.color}`
                      }`}
                    >
                      {fuel.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Isooctane and Heptane Mixer Slider */}
            <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} space-y-5`}>
              
              {/* Formula explanation */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-450">
                <div className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-905' : 'bg-slate-100 border-slate-200'}`}>
                  <span className="text-[9.5px] text-emerald-400 font-bold block mb-1">🌿 Iso-Oktana (100)</span>
                  Senyawa alkana rantai bercabang (2,2,4-trimetilpentana) yang tahan kompresi, terbakar merata tanpa getaran.
                </div>
                <div className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/40 border-slate-905' : 'bg-slate-100 border-slate-200'}`}>
                  <span className="text-[9.5px] text-rose-455 font-bold block mb-1">⚠️ n-Heptana (0)</span>
                  Senyawa alkana rantai lurus jenuh yang mudah meledak prematur sebelum waktunya, pemicu knocking.
                </div>
              </div>

              {/* Dual Range representations */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500 font-bold uppercase">Formulasi Iso-Oktana:</span>
                  <span className="text-emerald-450 font-black">{isooctanePercent}% (Angka Oktan Dasar: {isooctanePercent})</span>
                </div>
                <input
                  type="range"
                  min="50" // High school fuels usually don't drop below 50 in standard scales
                  max="100"
                  step="1"
                  value={isooctanePercent}
                  onChange={(e) => handleIsooctaneChange(Number(e.target.value))}
                  className={`w-full accent-emerald-500 h-2 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-650">
                  <span>90% n-heptana (Oktan Ringan)</span>
                  <span>Oktan Tengah (Premium 88 / Pertalite 90)</span>
                  <span>100% Isooktana murni (Formula Balap)</span>
                </div>
              </div>

              {/* Compression Ratio Slider */}
              <div className="space-y-2 border-t border-slate-900/80 pt-4">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500 font-bold uppercase">Rasio Kompresi Mesin Silinder:</span>
                  <span className="text-yellow-450 font-black">{compressionRatio} : 1</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="12"
                  step="1"
                  value={compressionRatio}
                  onChange={(e) => setCompressionRatio(Number(e.target.value))}
                  className={`w-full accent-yellow-450 h-2 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-650">
                  <span>7:1 (Mesin Jadul 1980)</span>
                  <span>9:1 s.d 10:1 (Komuter / Skutik)</span>
                  <span>11:1 s.d 12:1 (Injeksi Kompresi Tinggi)</span>
                </div>
              </div>

            </div>

            {/* Additive selection mixer */}
            <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} space-y-3`}>
              <span className="text-[10px] font-mono text-zinc-550 uppercase font-black block">Pencampuran Zat Aditif (Anti-Knocking Boosters):</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { id: 'none', name: 'Tanpa Aditif', boost: '+0 Oktan', desc: 'Sediaan murni bensin kiln tanpa peningkat.', style: 'hover:bg-slate-900 border-slate-800' },
                  { id: 'tel', name: 'TEL (Lead)', boost: '+10 Oktan', desc: 'Tetraethyl Lead. Mengandung Timbal Pb beracun!', style: 'hover:bg-rose-950/10 border-rose-900/30 text-rose-455 hover:border-rose-500/40' },
                  { id: 'mtbe', name: 'MTBE Eco', boost: '+8 Oktan', desc: 'Methyl Tertiary Butyl Ether. Cairan oksigenat stabil.', style: 'hover:bg-teal-950/10 border-teal-900/30 text-teal-400 hover:border-teal-500/40' },
                  { id: 'ethanol', name: 'Bio-Ethanol', boost: '+5 Oktan', desc: 'Campuran nabati terbarukan ramah lingkungan.', style: 'hover:bg-emerald-950/10 border-emerald-900/30 text-emerald-450 hover:border-emerald-500/40' }
                ].map((add) => {
                  const isAddSelected = selectedAdditive === add.id;
                  return (
                    <button
                      key={add.id}
                      onClick={() => {
                        setSelectedAdditive(add.id as any);
                        if (add.id === 'tel') {
                          setTestLog(prev => ['🚨 [PERINGATAN] Penggunaan TEL (Tetraethyl Lead) dilarang internasional karena menghamburkan partikulat timbal neurotoksik!', ...prev.slice(0, 4)]);
                        } else {
                          setTestLog(prev => [`[CAMPURAN] Meramu bensin dengan aditif ${add.name} (Tambahan ${add.boost})`, ...prev.slice(0, 4)]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer min-h-[90px] ${
                        isAddSelected
                          ? 'bg-yellow-500/10 border-yellow-500/60 text-yellow-405 shadow-md shadow-yellow-500/5'
                          : `bg-slate-900/40 ${add.style}`
                      }`}
                    >
                      <div className="space-y-0.5">
                        <strong className="text-[11px] block leading-none">{add.name}</strong>
                        <span className="text-[9px] opacity-75 font-mono block font-black">{add.boost}</span>
                      </div>
                      <span className="text-[8px] text-zinc-500 block mt-1 leading-normal">{add.desc}</span>
                    </button>
                  );
                })}
              </div>

              {selectedAdditive === 'tel' && (
                <div className="p-3 bg-red-950/45 border border-red-900/30 rounded-lg text-[10.5px] font-sans text-rose-350 leading-relaxed flex items-start gap-2 animate-pulse mt-2">
                  <AlertTriangle className="w-4 h-4 text-rose-550 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-red-400">Efek Toksisitas Plumbum (Timbal):</span>
                    Hasil pembakaran TEL menghasilkan senyawa timbal inorganic halus ke atmosfir yang masuk ke plasenta &amp; sirkulasi darah anak-anak, menginduksi kegagalan kognitif (IQ drop) &amp; sindrom hiperaktif.
                  </div>
                </div>
              )}
            </div>

            {/* Test action Buttons */}
            <div className="flex items-center gap-3">
              {engineState === 'idle' ? (
                <button
                  onClick={handleStartEngine}
                  className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-98 cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950" />
                  Nyalakan Mesin &amp; Uji Pembakaran
                </button>
              ) : (
                <button
                  onClick={handleStopEngine}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                  Matikan Mesin / Hentikan Tes
                </button>
              )}

              <div className={`flex-1 p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} font-mono text-[10px] text-zinc-500 flex items-center gap-2`}>
                <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Tekanan bensin minim oktan memicu preignition (meledak sendirinya akibat panas gesek).</span>
              </div>
            </div>

            {/* Simulated Live Console Log Tracker */}
            <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} font-mono space-y-1.5`}>
              <span className="text-[9px] uppercase text-zinc-505 font-bold block">Status Generator Log (Sensor Kompresor):</span>
              <div className="text-[10.5px] space-y-1 max-h-[110px] overflow-y-auto">
                {testLog.map((log, idx) => {
                  let logColor = 'text-zinc-400';
                  if (log.includes('ENGINE KNOCKING')) logColor = 'text-red-400 font-bold';
                  else if (log.includes('Sempurna')) logColor = 'text-emerald-450';
                  else if (log.includes('Mulai')) logColor = 'text-yellow-405';

                  return (
                    <div key={idx} className={`${logColor} leading-relaxed`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Interactive Engine Knocking Visual Simulation Screen */}
          <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
            
            {/* Visual Combustion Chamber Box */}
            <div className={`border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/35 border-slate-900' : 'bg-white border-slate-200'} p-6 flex flex-col justify-between space-y-5 relative overflow-hidden min-h-[385px]`}>
              
              <div className="space-y-1.5 text-center">
                <span className="text-[9px] font-mono text-zinc-550 uppercase">Kamar Pembakaran • Silinder Piston</span>
                <h4 className="text-sm font-sans font-bold text-white flex items-center justify-center gap-1.5">
                  <Speedometer className="w-4 h-4 text-yellow-405" />
                  Visual Simulasi Gerak Dinamis
                </h4>
              </div>

              {/* SVG Piston Cylinder graphic representing physical engine knock */}
              <div className="w-full h-48 relative flex items-center justify-center">
                
                {/* Cylinder block frame */}
                <div id="engine-cylinder-frame" className={`w-44 h-40 border-l-4 border-r-4 border-t-2 rounded-t-xl relative overflow-hidden flex flex-col justify-between ${theme === 'dark' ? 'border-slate-800 bg-slate-950/40' : 'border-slate-300 bg-slate-100/40'}`}>
                  
                  {/* Spark Plug indicator at the top center */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-zinc-800 border-b border-zinc-700 flex flex-col items-center flex-col">
                    <div className="w-1.5 h-1.5 bg-cyan-405 rounded-full" />
                    <span className="text-[7px] text-zinc-650 font-mono scale-90">Busi</span>
                  </div>

                  {/* Spark ignition flashing spark */}
                  {sparkFired && (
                    <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 transition-all ${
                      engineState === 'knocking' ? 'text-red-500 scale-150' : 'text-cyan-405 scale-100'
                    }`}>
                      <div className="w-10 h-10 rounded-full animate-ping absolute bg-yellow-500/25 -translate-x-1/3 -translate-y-1/3" />
                      💥
                    </div>
                  )}

                  {/* Combustion fire color filling top chamber */}
                  {sparkFired && engineState === 'knocking' && (
                    <div className="absolute top-1 inset-x-0 h-14 bg-gradient-to-b from-red-500/40 via-orange-500/20 to-transparent animate-pulse" />
                  )}
                  {sparkFired && engineState === 'running' && (
                    <div className="absolute top-1 inset-x-0 h-14 bg-gradient-to-b from-cyan-400/35 via-teal-500/10 to-transparent" />
                  )}

                  {/* Moveable Piston Body represented by Framer Motion */}
                  <motion.div
                    className="w-11/12 mx-auto bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 h-14 rounded-md border-t border-b border-zinc-500 flex flex-col items-center justify-center absolute left-1.5 shadow-md relative z-10"
                    animate={
                      engineState === 'idle' 
                        ? { y: 60 } 
                        : engineState === 'knocking'
                          ? { y: [60, 20, 60], rotate: [0, 1.5, -1.5, 0] } // Knock jitter movement
                          : { y: [60, 15, 60] } // Clean cycle
                    }
                    transition={
                      engineState === 'idle' 
                        ? { duration: 0.5 } 
                        : { 
                            repeat: Infinity, 
                            duration: 1.2, 
                            ease: "easeInOut" 
                          }
                    }
                  >
                    <div className={`w-8 h-1 rounded-full mb-1 opacity-60 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`} />
                    <span className="text-[8.5px] font-mono text-zinc-300">PISTON</span>
                  </motion.div>

                  {/* Cranker connector rod */}
                  <div className="absolute bottom-0 inset-x-0 h-10 flex justify-center items-end opacity-40 select-none">
                    <div className="w-2.5 h-12 bg-zinc-600 rounded-full transform origin-top rotate-12" />
                  </div>
                </div>

                {/* Overlaid Knock hazard alert warning */}
                {engineState === 'knocking' && (
                  <div className="absolute top-12 text-center pointer-events-none z-20 bg-red-950/85 p-2 rounded-lg border border-red-500/40 shadow-lg animate-bounce">
                    <span className="text-red-400 font-mono text-[10px] font-black uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 fill-red-500/10" />
                      KETUKAN MESIN (KNOCKING)
                    </span>
                    <span className="text-[8.5px] text-zinc-350 block leading-tight font-mono mt-0.5">Bensin Meledak Terlalu Dini!</span>
                  </div>
                )}
              </div>

              {/* Status and Diagnostics Box */}
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} space-y-3.5 font-mono text-xs`}>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-zinc-500">Merek Bahan Bakar:</span>
                  <span className={`font-black ${activeFuelInfo.color}`}>{activeFuelInfo.name}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-zinc-500">Efektif Angka Oktan:</span>
                  <span className="text-emerald-400 font-black">{getOctaneRating()} RON</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-zinc-500">Rasio n-Heptana:</span>
                  <span className="text-rose-455 font-bold">{getHeptanePercent()}%</span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-zinc-500">Kombinasi Ketegangan:</span>
                  <span className={`${engineState === 'knocking' ? 'text-red-400 font-bold' : 'text-emerald-455'}`}>
                    {engineState === 'knocking' ? '⚠️ TIDAK SEIMBANG' : '✓ AMAN &amp; IDEAL'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg text-center leading-normal text-[10.5px] ${theme === 'dark' ? 'bg-slate-905 text-zinc-400' : 'bg-slate-100 text-slate-600'}`}>
                  {activeFuelInfo.desc}
                </div>
              </div>

              {/* Kalkulator Efisiensi Motor & Emisi Karbon (Kelas XI SMA) */}
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} space-y-3 font-sans`}>
                <span className="text-[9.5px] text-teal-400 font-extrabold font-mono uppercase tracking-wide block border-b border-slate-900 pb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  Kalkulator Efisiensi Pembakaran &amp; Emisi
                </span>

                {(() => {
                  const isKnocking = engineState === 'knocking';
                  const effectiveOctane = getOctaneRating();
                  
                  // Compute thermodynamics thermal conversion rate and mileage range 
                  const thermalEfficiency = isKnocking 
                    ? Math.max(38, Math.round(55 - (compressionRatio * 1.6))) 
                    : Math.min(98, Math.round(72 + (compressionRatio * 1.9)));
                    
                  const fuelEconomy = isKnocking
                    ? parseFloat((10.5 - (compressionRatio * 0.2)).toFixed(1))
                    : parseFloat((14.0 + (compressionRatio * 0.4)).toFixed(1));

                  const carbonMonoxide = isKnocking
                    ? '3.50% (Sangat Beracun)'
                    : '0.15% (Aman Bersih)';

                  const carbonFootprint = isKnocking
                    ? Math.round(185 + (compressionRatio * 3))
                    : Math.round(124 - (compressionRatio * 1.5));

                  return (
                    <div className="space-y-3 font-mono text-[10.5px]">
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Efisiensi Termal Mesin:</span>
                        <strong className={isKnocking ? 'text-rose-455 animate-pulse' : 'text-emerald-450'}>
                          {thermalEfficiency}% {isKnocking ? '(Energi Hilang Jadi Panas)' : '(Optimal)'}
                        </strong>
                      </div>

                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Konsumsi Bahan Bakar:</span>
                        <strong className={isKnocking ? 'text-red-400' : 'text-teal-400'}>
                          {fuelEconomy} Km/Liter
                        </strong>
                      </div>

                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Emisi Monoksida (CO):</span>
                        <strong className={isKnocking ? 'text-rose-455 animate-pulse' : 'text-zinc-300'}>
                          {carbonMonoxide}
                        </strong>
                      </div>

                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Jejak Karbon (CO2):</span>
                        <strong className={isKnocking ? 'text-amber-500' : 'text-emerald-400'}>
                          {carbonFootprint} g/Km
                        </strong>
                      </div>

                      <div className={`p-2 rounded-lg text-[9.5px] leading-relaxed font-sans border ${theme === 'dark' ? 'bg-slate-900/60 text-zinc-400 border-slate-905' : 'bg-slate-100/60 text-slate-600 border-slate-300'}`}>
                        {isKnocking ? (
                          <span className="text-rose-300">
                            💔 <strong>Gagal Pembakaran Sempurna!</strong> Karena Angka Oktan ({effectiveOctane}) tidak kuat menahan kompresi ({compressionRatio}:1), bensin meledak prematur menghasilkan gas racun CO tinggi dan menurunkan efisiensi termal.
                          </span>
                        ) : (
                          <span className="text-emerald-300">
                            💚 <strong>Pembakaran Sempurna Terpenuhi!</strong> Angka Oktan ({effectiveOctane}) ideal untuk meredam suhu kompresi ({compressionRatio}:1), bensin terbakar merata menghasilkan energi dorong piston optimal dengan emisi minimal.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Interactive Molecular Isomers Structure Comparator Card */}
            <div className={`border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/35 border-slate-900' : 'bg-white border-slate-200'} p-5 md:p-6 space-y-4`}>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-550 uppercase">Struktur Isomer Alifatik • Kelas XI</span>
                <h4 className="text-sm font-sans font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-yellow-405" />
                  Isomeri Struktur &amp; Efek Ketukan
                </h4>
              </div>

              {/* Selector Tabs for Isooktana vs n-Heptana 2D renderings */}
              <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-910' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setSelectedStructure('isooctane')}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedStructure === 'isooctane'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-zinc-550 hover:text-white border border-transparent'
                  }`}
                >
                  2,2,4-Trimetilpentana
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStructure('heptane')}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedStructure === 'heptane'
                      ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                      : 'text-zinc-505 hover:text-white border border-transparent'
                  }`}
                >
                  n-Heptana (Lurus)
                </button>
              </div>

              {/* Molecule Display Canvas Render */}
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} flex flex-col justify-center items-center min-h-[160px] relative overflow-hidden`}>
                {selectedStructure === 'isooctane' ? (
                  <div className="space-y-4 w-full">
                    {/* Visual Carbon Map representing branched isomer */}
                    <div className="flex flex-col items-center justify-center space-y-1 py-4">
                      {/* Sub branch methyl */}
                      <div className="text-teal-400 font-mono text-[10px] mb-1 bg-teal-950/20 px-2 py-0.5 rounded border border-teal-900/30">
                        CH₃ (Metil Cabang)
                      </div>
                      
                      {/* Main spine with bonds */}
                      <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                        <span className={`p-1 px-1.5 rounded border text-teal-404 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₃</span>
                        <span>—</span>
                        <span className={`p-1 px-1.5 rounded border font-bold relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}>
                          C
                          {/* methyl down branch */}
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-teal-400 text-[10px]">CH₃</span>
                        </span>
                        <span>—</span>
                        <span className={`p-1 px-1.5 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₂</span>
                        <span>—</span>
                        <span className={`p-1 px-1.5 rounded border font-bold relative ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}>
                          CH
                          {/* methyl up branch code */}
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-teal-400 text-[10px]">CH₃</span>
                        </span>
                        <span>—</span>
                        <span className={`p-1 px-1.5 rounded border text-teal-404 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₃</span>
                      </div>
                      
                      <div className="h-6" /> {/* Spacer spacer down branch */}
                    </div>

                    <div className="text-[11px] font-mono leading-relaxed text-zinc-400 text-center border-t border-slate-900 pt-3">
                      <span className="text-emerald-400 font-bold">Mengapa tahan ketukan?</span> Struktur bercabang meminimalkan luas permukaan kontak radikal bebas sehingga laju oksidasi lebih merata dan teratur.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    {/* Visual Carbon Map representing linear pentane */}
                    <div className="flex justify-center items-center gap-1.5 font-mono text-xs text-zinc-400 py-6">
                      <span className={`p-1 px-1.5 rounded border text-rose-404 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₃</span>
                      <span>—</span>
                      <span className={`p-1 px-1.5 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₂</span>
                      <span>—</span>
                      <span className={`p-1 px-1.5 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₂</span>
                      <span>—</span>
                      <span className={`p-1 px-1.5 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₂</span>
                      <span>—</span>
                      <span className={`p-1 px-1.5 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₂</span>
                      <span>—</span>
                      <span className={`p-1 px-1.5 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₂</span>
                      <span>—</span>
                      <span className={`p-1 px-1.5 rounded border text-rose-404 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>CH₃</span>
                    </div>

                    <div className="text-[11px] font-mono leading-relaxed text-zinc-405 text-center border-t border-slate-900 pt-3">
                      <span className="text-rose-455 font-bold">Mengapa mudah knocking?</span> Rantai lurus memiliki luas kontak permukaan yang luas, menurunkan energi pembakaran sehingga meledak spontan sebelum piston mencapai puncak.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: HYDROCARBON REFINEMENT TECHNOLOGIES (POLISHING PROCESSES) */}
      {activeTab === 'treatment' && (
        <div className="space-y-6">
          
          {/* Section banner */}
          <div className={`p-4 border ${theme === 'dark' ? 'bg-slate-900/25 border-slate-900' : 'bg-slate-50 border-slate-200'} rounded-xl font-mono text-xs space-y-1`}>
            <h3 className="text-xs font-sans font-bold text-teal-400">Pondasi Pabrik Kilang Minyak Bumi (Petroleum Refining Processes)</h3>
            <p className="text-[10px] text-zinc-500">Menyaring minyak mentah kotor tidaklah cukup; reaksi sekunder diperlukan untuk memaksimalkan daya bakar energi motor.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Side-by-side Technology Category Buttons */}
            <div className="lg:col-span-4 flex flex-col gap-3.5">
              {REFINERY_TECH.map((tech) => {
                const isSelected = activeTechId === tech.id;
                const Icon = tech.icon;
                return (
                  <button
                    key={tech.id}
                    onClick={() => setActiveTechId(tech.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border-teal-505 text-teal-400'
                        : 'bg-slate-900/35 border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mt-0.5 shrink-0 text-yellow-450" />
                    <div>
                      <strong className="text-xs font-sans font-bold block">{tech.title}</strong>
                      <span className="text-[10px] text-zinc-550 block mt-0.5 leading-tight">{tech.subTitle}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed Science description with molecular drawings */}
            <div className="lg:col-span-8 flex flex-col">
              <AnimatePresence mode="wait">
                {(() => {
                  const tech = REFINERY_TECH.find(t => t.id === activeTechId) || REFINERY_TECH[0];
                  return (
                    <motion.div
                      key={tech.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={`border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/25 border-slate-900' : 'bg-white border-slate-200'} p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between`}
                    >
                      <div className="space-y-5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-405" />
                          <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-widest font-black">Metodologi Kilang Minyak</span>
                        </div>

                        <div>
                          <h2 className="text-lg md:text-xl font-bold font-sans text-white text-teal-450">{tech.title}</h2>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{tech.subTitle}</p>
                        </div>

                        <p className="text-zinc-350 text-sm leading-relaxed">{tech.description}</p>

                        {/* Equation Box styled of hydrocarbon changes */}
                        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} space-y-2`}>
                          <span className="text-[8.5px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">Skema Persamaan Reaksi Kimia:</span>
                          <div className="font-mono text-[11.5px] md:text-xs text-yellow-400 break-all select-all font-bold">
                            {tech.chemicalEquation}
                          </div>
                        </div>

                        <div className="p-4 bg-teal-950/15 rounded-xl border border-teal-900/20 space-y-2.5">
                          <h4 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-450 animate-pulse" />
                            Target &amp; Efektivitas Produksi:
                          </h4>
                          <p className="text-zinc-300 text-xs md:text-sm font-sans leading-relaxed">{tech.aim}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-900/80 pt-4 mt-6 text-[10px] font-mono text-zinc-550 flex items-center justify-between">
                        <span>Pengolahan Minyak Tahap Kedua (Secondary Refining)</span>
                        <span>Materi Kimia Kelas XI</span>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: PEDAGOGICAL QUIZ / CHALLENGE SYSTEM */}
      {activeTab === 'quiz' && (
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!quizComplete ? (
              <motion.div
                key={quizIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/25 border-slate-900' : 'bg-white border-slate-200'} p-6 md:p-8 space-y-6`}
              >
                
                {/* Visual Quiz progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-500">
                    <span>Soal Latihan {quizIdx + 1} dari {QUIZ_QUESTIONS.length}</span>
                    <span className="font-black text-yellow-450">Poin Terkumpul: {quizScore} / 100</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                    <div 
                      className="bg-yellow-505 h-full transition-all duration-300"
                      style={{ width: `${((quizIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-mono font-black text-teal-450 border border-teal-500/25 px-2.5 py-0.5 rounded-full bg-teal-500/5">EVALUASI KOGNITIF SISWA</span>
                  <p className="text-sm md:text-base font-bold text-white leading-relaxed font-sans shadow-sm">
                    {QUIZ_QUESTIONS[quizIdx].question}
                  </p>
                </div>

                {/* Multiple choice selections */}
                <div className="grid grid-cols-1 gap-3.5">
                  {QUIZ_QUESTIONS[quizIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedOptIdx === oIdx;
                    
                    let bgBorderColor = 'bg-slate-950 border-slate-900 text-zinc-300 hover:border-zinc-700';
                    if (isSelected) {
                      bgBorderColor = 'bg-yellow-500/10 border-yellow-505 text-yellow-400';
                    }
                    if (quizAnswered) {
                      if (opt.correct) {
                        bgBorderColor = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-450 font-bold';
                      } else if (isSelected) {
                        bgBorderColor = 'bg-rose-500/15 border-rose-500/40 text-rose-455';
                      } else {
                        bgBorderColor = 'bg-slate-950/45 border-slate-910/20 text-zinc-550 opacity-45';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={quizAnswered}
                        onClick={() => handleSelectQuizOption(oIdx)}
                        className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all leading-normal cursor-pointer flex items-center justify-between ${bgBorderColor}`}
                      >
                        <span className="font-sans">{opt.text}</span>
                        {quizAnswered && opt.correct && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                        {quizAnswered && isSelected && !opt.correct && (
                          <X className="w-4 h-4 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Panel and Navigation Trigger */}
                <div className="pt-2 border-t border-slate-900/60 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="text-xs text-zinc-500 font-mono">
                    {quizAnswered ? (
                      <span className="text-teal-400 flex items-center gap-1.5 animation-pulse">
                        <Info className="w-4 h-4 text-teal-400 shrink-0" />
                        Pembahasan Soal Aktif Terlampir!
                      </span>
                    ) : (
                      'Pilih satu respons di atas lalu simpan untuk mengunci skor.'
                    )}
                  </div>

                  <div className="flex gap-3">
                    {!quizAnswered ? (
                      <button
                        onClick={handleApplyQuizAnswer}
                        disabled={selectedOptIdx === null}
                        className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-800 disabled:text-zinc-650 text-slate-950 font-mono font-black text-xs uppercase rounded-lg transition-all cursor-pointer"
                      >
                        Simpan Jawaban
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuiz}
                        className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-mono font-black text-xs uppercase rounded-lg transition-all flex items-center gap-1 hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer"
                      >
                        <span>{quizIdx === QUIZ_QUESTIONS.length - 1 ? 'Selesai &amp; Rekam Skor' : 'Soal Berikutnya'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Pedagogical Explanations block */}
                {quizAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} text-zinc-400 leading-relaxed font-sans text-xs md:text-sm space-y-1`}
                  >
                    <strong className="text-emerald-450 block font-mono text-[10.5px] uppercase">Penjelasan Guru (Pedagogi):</strong>
                    <p>{QUIZ_QUESTIONS[quizIdx].feedback}</p>
                  </motion.div>
                )}

              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border rounded-2xl ${theme === 'dark' ? 'bg-slate-900/25 border-slate-900' : 'bg-white border-slate-200'} p-6 md:p-8 text-center space-y-6`}
              >
                <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 text-yellow-450 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                  🏆
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold font-sans text-white">Sertifikasi Evaluasi Minyak Bumi Selesai!</h3>
                  <p className="text-xs text-zinc-400 font-mono">Skor Akhir Kognitif Anda:</p>
                  <p className="text-4xl font-mono font-black text-teal-400">{quizScore} / 100</p>
                </div>

                <div className={`p-4.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'} max-w-md mx-auto text-xs md:text-sm text-zinc-400 font-sans leading-relaxed`}>
                  {quizScore === 100 ? (
                    'Sempurna! Anda telah menguasai konsep distilasi bertingkat, fraksionasi hidrokarbon kilang kimia, dan penghitungan angka oktan dengan sangat gemilang.'
                  ) : quizScore >= 60 ? (
                    'Bagus sekali! Anda memahami poin-poin dasar distilasi fraksi dan angka oktan kendaraan. Sedikit revisi akan membuat pemahaman Anda sempurna.'
                  ) : (
                    'Jangan putus asa! Silakan cek kembali diagram interaktif menara fraksionasi distilasi dan cobalah kuis ulang untuk menaikkan skor Anda.'
                  )}
                </div>

                <div className="flex gap-3.5 justify-center pt-2">
                  <button
                    onClick={resetQuiz}
                    className={`px-5 py-2 border text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-98 ${theme === 'dark' ? 'bg-slate-950 border-slate-900 hover:text-white text-zinc-400' : 'bg-slate-100 border-slate-300 hover:text-slate-900 text-slate-600'}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Ulangi Pembelajaran Kuis
                  </button>
                  <button
                    onClick={() => setActiveTab('distillation')}
                    className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer active:scale-98"
                  >
                    Kembali Ke Menara Distilasi
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
