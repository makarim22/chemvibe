/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Award, 
  Info, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  AlertTriangle, 
  RotateCcw,
  Sliders,
  Compass,
  Check,
  X,
  Droplet,
  Beaker,
  TestTube,
  Magnet,
  Activity,
  Thermometer,
  Eye,
  Percent,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';

interface ElementReactivityLabProps {
  currentUser: UserAccount | null;
  theme: 'dark' | 'light';
}

// Compact Data Modeling with Programmatic Helpers to keep file concise & high-performance
interface MetalReactivity {
  id: string;
  symbol: string;
  name: string;
  group: 'Alkali (1A)' | 'Alkali Tanah (2A)';
  intensity: number; // 1 to 5
  equation: string;
  energyChange: string;
  observation: string;
  indicatorColor: string;
  flameColor: string;
  speedLabel: string;
  tempRise: number; // Max temp increase
}

const METAL_REACTIVITY_DATA: MetalReactivity[] = [
  {
    id: 'li', symbol: 'Li', name: 'Litium', group: 'Alkali (1A)', intensity: 2,
    equation: '2Li(s) + 2H₂O(l) → 2LiOH(aq) + H₂(g)',
    energyChange: 'Eksotermik Sedang (ΔH < 0)',
    observation: 'Mengapung, mendesis perlahan mengeluarkan gelembung gas hidrogen, dan air berubah warna menjadi merah muda akibat perubahan keasaman ke basa (LiOH).',
    indicatorColor: 'from-pink-500/20 to-pink-550/40', flameColor: 'shadow-rose-500 text-rose-550 bg-rose-500/10',
    speedLabel: 'Desisan Teratur', tempRise: 18
  },
  {
    id: 'na', symbol: 'Na', name: 'Natrium', group: 'Alkali (1A)', intensity: 4,
    equation: '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)',
    energyChange: 'Sangat Eksotermik (ΔH = -368 kJ/mol)',
    observation: 'Bereaksi sangat cepat, meleleh menjadi bola logam yang bergerak lincah di air dengan letupan kecil dan nyala api kuning-jingga khas.',
    indicatorColor: 'from-pink-500/50 to-pink-600/70', flameColor: 'shadow-yellow-500 text-yellow-500 bg-yellow-500/15',
    speedLabel: 'Letupan Jingga', tempRise: 52
  },
  {
    id: 'k', symbol: 'K', name: 'Kalium', group: 'Alkali (1A)', intensity: 5,
    equation: '2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)',
    energyChange: 'Sangat Eksotermik Maksimal (Ledakan Lila)',
    observation: 'Seketika meledak dengan kilatan api warna lila (ungu-merah muda) yang indah begitu menyentuh air murni.',
    indicatorColor: 'from-pink-500/80 to-pink-700/90', flameColor: 'shadow-purple-500 text-fuchsia-400 bg-purple-500/20',
    speedLabel: 'Eksplosif Lila!', tempRise: 85
  },
  {
    id: 'mg', symbol: 'Mg', name: 'Magnesium', group: 'Alkali Tanah (2A)', intensity: 1,
    equation: 'Mg(s) + 2H₂O(l) → Mg(OH)₂(s) + H₂(g)',
    energyChange: 'Lambat Dingin / Cepat Panas',
    observation: 'Hampir tidak bereaksi dengan air dingin. Apabila air panas digunakan, gelembung gas terlihat stabil dan air berubah keruh perlahan.',
    indicatorColor: 'from-pink-500/5 to-pink-500/10', flameColor: 'shadow-slate-400 text-slate-300 bg-slate-500/5',
    speedLabel: 'Reaksi Termal', tempRise: 4
  },
  {
    id: 'ca', symbol: 'Ca', name: 'Kalsium', group: 'Alkali Tanah (2A)', intensity: 3,
    equation: 'Ca(s) + 2H₂O(l) → Ca(OH)₂(aq) + H₂(g)',
    energyChange: 'Eksotermik Sedang-Tinggi',
    observation: 'Tenggelam dan segera melepaskan aliran gas hidrogen stabil yang membuat gelembung-gelembung gas, diselimuti suspensi putih keruh Ca(OH)₂.',
    indicatorColor: 'from-pink-500/30 to-pink-600/40', flameColor: 'shadow-orange-400 text-orange-400 bg-orange-500/10',
    speedLabel: 'Aliran Gas Cepat', tempRise: 32
  },
  {
    id: 'ba', symbol: 'Ba', name: 'Barium', group: 'Alkali Tanah (2A)', intensity: 4,
    equation: 'Ba(s) + 2H₂O(l) → Ba(OH)₂(aq) + H₂(g)',
    energyChange: 'Eksotermik Cepat-Kuat',
    observation: 'Tenggelam dan langsung mendesis kencang menghasilkan gas hidrogen dalam jumlah besar dan larutan basa barium hidroksida kuat.',
    indicatorColor: 'from-pink-500/60 to-pink-600/80', flameColor: 'shadow-green-405 text-emerald-400 bg-green-500/10',
    speedLabel: 'Efervesen Kuat', tempRise: 58
  }
];

interface Period3Hydroxide {
  symbol: string;
  name: string;
  formula: string;
  character: 'Basa Kuat' | 'Basa Lemah' | 'Amfoter' | 'Asam Lemah' | 'Asam Sedang' | 'Asam Kuat' | 'Asam Terkuat/Super';
  pH: number;
  electronegativity: number;
  radius: number; // in pm
  ionization: number; // in kJ/mol
  electronAffinity: number; // in kJ/mol
  themeColor: string;
  description: string;
  acidReaction: string;
  baseReaction: string;
}

const PERIOD3_DATA: Period3Hydroxide[] = [
  {
    symbol: 'Na', name: 'Natrium', formula: 'NaOH', character: 'Basa Kuat', pH: 14.0, electronegativity: 0.93, radius: 186,
    ionization: 496, electronAffinity: 53,
    themeColor: 'cyan', description: 'Hidroksida basa alkali kuat yang larut sempurna dalam air melepaskan ion OH⁻ yang korosif.',
    acidReaction: 'NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l)',
    baseReaction: 'NaOH(aq) + NaOH(aq) → (Tidak Bereaksi, sesama kation alkali)'
  },
  {
    symbol: 'Mg', name: 'Magnesium', formula: 'Mg(OH)₂', character: 'Basa Lemah', pH: 10.4, electronegativity: 1.31, radius: 160,
    ionization: 738, electronAffinity: 0,
    themeColor: 'sky', description: 'Basa alkali tanah lemah dengan kelarutan rendah. Mengendap putih susu, sering digunakan sebagai antasida penetral lambung.',
    acidReaction: 'Mg(OH)₂(s) + 2HCl(aq) → MgCl₂(aq) + 2H₂O(l) (Melarutkan endapan)',
    baseReaction: 'Mg(OH)₂(s) + NaOH(aq) → (Tidak Bereaksi, sukar larut)'
  },
  {
    symbol: 'Al', name: 'Aluminium', formula: 'Al(OH)₃', character: 'Amfoter', pH: 7.0, electronegativity: 1.61, radius: 143,
    ionization: 578, electronAffinity: 43,
    themeColor: 'emerald', description: 'Memiliki sifat ganda (Amfoter). Berupa endapan gelatin putih yang larut baik dalam asam kuat maupun basa kuat berlebih.',
    acidReaction: 'Al(OH)₃(s) + 3HCl(aq) → AlCl₃(aq) + 3H₂O(l) (Melarut menjadi ion Al³⁺)',
    baseReaction: 'Al(OH)₃(s) + NaOH(aq) → Na[Al(OH)₄](aq) (Membentuk ion aluminat kompleks terlarut)'
  },
  {
    symbol: 'Si', name: 'Silikon', formula: 'H₄SiO₄', character: 'Asam Lemah', pH: 5.5, electronegativity: 1.90, radius: 118,
    ionization: 786, electronAffinity: 134,
    themeColor: 'amber', description: 'Asam Ortosilikat. Merupakan asam oksi silika yang sangat lemah, tidak stabil dan mudah mendehidrasi membentuk gel koloid SiO₂.',
    acidReaction: 'H₄SiO₄(s) + HCl(aq) → (Tidak Bereaksi secara kimiawi)',
    baseReaction: 'H₄SiO₄(s) + 4NaOH(aq) → Na₄SiO₄(aq) + 4H₂O(l) (Bereaksi lambat)'
  },
  {
    symbol: 'P', name: 'Fosforus', formula: 'H₃PO₄', character: 'Asam Sedang', pH: 2.1, electronegativity: 2.19, radius: 110,
    ionization: 1012, electronAffinity: 72,
    themeColor: 'orange', description: 'Asam Fosfat. Asam lemah triprotik yang digunakan secara komersial dalam pembuatan pupuk superfosfat dan minuman kola.',
    acidReaction: 'H₃PO₄(aq) + HCl(aq) → (Tidak Bereaksi)',
    baseReaction: 'H₃PO₄(aq) + 3NaOH(aq) → Na₃PO₄(aq) + 3H₂O(l) (Netralisasi Garam)'
  },
  {
    symbol: 'S', name: 'Belerang', formula: 'H₂SO₄', character: 'Asam Kuat', pH: 0.9, electronegativity: 2.58, radius: 102,
    ionization: 1000, electronAffinity: 200,
    themeColor: 'rose', description: 'Asam Sulfat. Asam mineral bivalen kuat yang bersifat pendehidrasi, menghasilkan panas raksasa, dan digunakan dalam baterai aki.',
    acidReaction: 'H₂SO₄(aq) + HCl(aq) → (Tidak Bereaksi)',
    baseReaction: 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l)'
  },
  {
    symbol: 'Cl', name: 'Klorin', formula: 'HClO₄', character: 'Asam Terkuat/Super', pH: 0.1, electronegativity: 3.16, radius: 99,
    ionization: 1251, electronAffinity: 349,
    themeColor: 'purple', description: 'Asam Perklorat. Merupakan salah satu asam oksi terkuat dalam kimia modern dengan delokalisasi muatan anion ClO₄⁻ maksimal.',
    acidReaction: 'HClO₄(aq) + HCl(aq) → (Tidak Bereaksi)',
    baseReaction: 'HClO₄(aq) + NaOH(aq) → NaClO₄(aq) + H₂O(l)'
  }
];

interface TransitionMetal {
  symbol: string;
  name: string;
  unpairedElectrons: number;
  configuration: string;
  aqueousColor: string; // Tailwind color matching the aquo-complex
  colorName: string;
  ionSymbol: string;
  magneticMoment: number;
  paramagnetic: boolean;
  dElectronsCount: number;
  applications: string;
}

const TRANSITION_METALS_DATA: TransitionMetal[] = [
  { symbol: 'Sc', name: 'Skandium', unpairedElectrons: 0, configuration: '[Ar] 3d¹ 4s²', aqueousColor: 'bg-slate-400/5 border-slate-705 text-zinc-400', colorName: 'Bening (Tak Berwarna)', ionSymbol: 'Sc³⁺ (d⁰)', magneticMoment: 0.0, paramagnetic: false, dElectronsCount: 0, applications: 'Campuran logam alloy pesawat jet militer berkekuatan tinggi.' },
  { symbol: 'Ti', name: 'Titanium', unpairedElectrons: 1, configuration: '[Ar] 3d² 4s²', aqueousColor: 'bg-violet-500/25 border-violet-500/40 text-violet-405', colorName: 'Ungu Romantis', ionSymbol: 'Ti³⁺ (d¹)', magneticMoment: 1.73, paramagnetic: true, dElectronsCount: 1, applications: 'Implan medis ortopedi tulang dan cat pigmen TiO₂ putih mutiara.' },
  { symbol: 'V', name: 'Vanadium', unpairedElectrons: 2, configuration: '[Ar] 3d³ 4s²', aqueousColor: 'bg-emerald-600/30 border-emerald-500/40 text-emerald-400', colorName: 'Hijau Toska', ionSymbol: 'V³⁺ (d²)', magneticMoment: 2.83, paramagnetic: true, dElectronsCount: 2, applications: 'Material baja Vanadium antigores untuk kunci pas mekanik.' },
  { symbol: 'Cr', name: 'Kromium', unpairedElectrons: 3, configuration: '[Ar] 3d⁵ 4s¹', aqueousColor: 'bg-green-700/40 border-green-600/50 text-green-400', colorName: 'Hijau Daun Tua', ionSymbol: 'Cr³⁺ (d³)', magneticMoment: 3.87, paramagnetic: true, dElectronsCount: 3, applications: 'Pelapis kilap chrome electroplating anti-karat velg mobil.' },
  { symbol: 'Mn', name: 'Mangan', unpairedElectrons: 5, configuration: '[Ar] 3d⁵ 4s²', aqueousColor: 'bg-rose-400/20 border-rose-400/30 text-rose-350', colorName: 'Merah Jambu Sangat Pucat', ionSymbol: 'Mn²⁺ (d⁵)', magneticMoment: 5.92, paramagnetic: true, dElectronsCount: 5, applications: 'Zat aktif depolarisator batu baterai karbon seng & baja ferromangan.' },
  { symbol: 'Fe', name: 'Besi / Iron', unpairedElectrons: 5, configuration: '[Ar] 3d⁶ 4s²', aqueousColor: 'bg-orange-600/20 border-amber-600/40 text-orange-400', colorName: 'Kuning Jingga Karat', ionSymbol: 'Fe³⁺ (d⁵)', magneticMoment: 5.92, paramagnetic: true, dElectronsCount: 5, applications: 'Konstruksi beton baja girder, serta inti hemoglobin pengikat oksigen darah.' },
  { symbol: 'Co', name: 'Kobalt', unpairedElectrons: 3, configuration: '[Ar] 3d⁷ 4s²', aqueousColor: 'bg-pink-500/40 border-pink-500/50 text-pink-400', colorName: 'Pink Cerah', ionSymbol: 'Co²⁺ (d⁷)', magneticMoment: 3.87, paramagnetic: true, dElectronsCount: 7, applications: 'Pewarna biru kobalt gelas kaca antik, baterai super litium-ion.' },
  { symbol: 'Ni', name: 'Nikel', unpairedElectrons: 2, configuration: '[Ar] 3d⁸ 4s²', aqueousColor: 'bg-teal-500/35 border-teal-500/50 text-teal-400', colorName: 'Hijau Zamrud', ionSymbol: 'Ni²⁺ (d⁸)', magneticMoment: 2.83, paramagnetic: true, dElectronsCount: 8, applications: 'Katalis pembuat margarin kelapa sawit dan paduan koin monel.' },
  { symbol: 'Cu', name: 'Tembaga', unpairedElectrons: 1, configuration: '[Ar] 3d¹⁰ 4s¹', aqueousColor: 'bg-cyan-500/40 border-cyan-500/60 text-cyan-400', colorName: 'Biru Cerah Elok', ionSymbol: 'Cu²⁺ (d⁹)', magneticMoment: 1.73, paramagnetic: true, dElectronsCount: 9, applications: 'Kabel tembaga transmisi listrik utama dan perunggu lonceng.' },
  { symbol: 'Zn', name: 'Seng / Zinc', unpairedElectrons: 0, configuration: '[Ar] 3d¹⁰ 4s²', aqueousColor: 'bg-slate-400/10 border-slate-700 text-zinc-500', colorName: 'Bening (Mutiara Keruh)', ionSymbol: 'Zn²⁺ (d¹⁰)', magneticMoment: 0.0, paramagnetic: false, dElectronsCount: 10, applications: 'Proses galvanisasi plat baja atap seng rumah agar antikarat.' }
];

const QUIZ_DATA = [
  {
    id: 1,
    question: 'Di antara senyawa hidroksida unsur periode 3 berikut, senyawa manakah yang bersifat paling asam dan sanggup melepaskan hidrogen terklorat terkondensasi?',
    options: ['A. H₂SO₄ (Asam Sulfat)', 'B. Al(OH)₃ (Aluminium Hidroksida)', 'C. HClO₄ (Asam Perklorat)', 'D. H₄SiO₄ (Asam Silikat)'],
    correctIndex: 2,
    feedback: 'Tepat! HClO₄ (Asam Perklorat) adalah asam oksi terkuat (super acid) di antara unsur Periode ke-3 karena atom pusat klorin memiliki bilangan oksidasi tertinggi (+7), menarik kerapatan elektron menjauh dari ikatan O-H, memudahkan pelepasan H⁺.'
  },
  {
    id: 2,
    question: 'Jika gas Klorin (Cl₂) ditiupkan ke dalam tabung reaksi berisi larutan Kalium Bromida (KBr) berpelarut organik heksana, reaksi pengamatan apa yang akan Anda saksikan?',
    options: [
      'A. Tidak terjadi reaksi karena Klorin kurang elektronegatif daripada Bromin',
      'B. Klorin mendesak ion Bromida menghasilkan Bromin bebas (Br₂) yang membuat lapisan heksana berwarna jingga cokelat',
      'C. Terbentuk endapan putih padat fluorida kristalin',
      'D. Lapisan heksana memancarkan warna ungu violet khas iodin'
    ],
    correctIndex: 1,
    feedback: 'Sangat bagus! Karena kekuatan oksidasi gas halogen adalah Cl₂ > Br₂ > I₂, Klorin bersedia mendesak ion bromida (Br⁻) mengoksidasinya menjadi Bromin bebas (Br₂), yang larut secara organik ke dalam pelumas heksana atas menjadi warna jingga jingga-kecokelatan.'
  },
  {
    id: 3,
    question: 'Mengapa ion logam transisi Sc³⁺ (d⁰) dan Zn²⁺ (d¹⁰) dalam medium larutan air (aqua-kompleks) tidak menghasilkan warna elok (tak berwarna)?',
    options: [
      'A. Karena air mereduksi ion logam seketika menjadi logam padat berkilau',
      'B. Karena tidak memiliki elektron tak berpasangan, atau orbital d terisi penuh, sehingga tidak terjadi transisi elektronik d-to-d',
      'C. Nilai spin magnetik terlalu tinggi sehingga merusak spektrum warna foton',
      'D. Ion-ion tersebut menolak gelombang radio laser'
    ],
    correctIndex: 1,
    feedback: 'Brilian! Warna indah aqua-kompleks logam transisi d-block dipicu oleh penyerapan energi foton untuk eksitasi d-to-d. Untuk Sc³⁺ (d⁰ orbital kosong) dan Zn²⁺ (d¹⁰ orbital terisi penuh), transisi elektronik d-to-d mustahil berlangsung.'
  },
  {
    id: 4,
    question: 'Amfoter kation logam transisi, contohnya endapan gelatin putih Al(OH)₃, melarut saat ditambahkan reagen larutan apa sediaan sekolah?',
    options: [
      'A. Melarut hanya dalam air murni destilasi',
      'B. Melarut baik dalam asam kuat (seperti HCl) maupun dalam basa kuat berlebih (seperti NaOH)',
      'C. Melarut hanya dalam pelarut nonpolar kloroform',
      'D. Hanya bereaksi melarut jika disorot sinar ultraviolet'
    ],
    correctIndex: 1,
    feedback: 'Betul! Karakteristik senyawa amfoter dapat bertindak sebagai penawar asam maupun basa. Al(OH)₃ melarut dalam HCl (sebagai basa) kation bebas Al³⁺, dan larut dalam NaOH berlebih (sebagai asam) melahirkan Aluminate kompleks [Al(OH)₄]⁻.'
  },
  {
    id: 5,
    question: 'Bagaimana tren kekuatan reaktivitas logam alkali golongan 1A terhadap air murni dari atas ke bawah (Li → Na → K)?',
    options: [
      'A. Reaktivitas berkurang karena ikatan kovalen semakin padu',
      'B. Reaktivitas bertambah dahsyat karena ukuran radius atom membesar sehingga energi ionisasi melemah, memudahkan atom membuang elektron valensinya',
      'C. Reaktivitas sama rata karena muatan muara ionnya sesama positif satu',
      'D. Kalium adalah yang paling lambat mendesak molekul air dingin'
    ],
    correctIndex: 1,
    feedback: 'Sempurna! Dari atas ke bawah dalam golongan Alkali (Li → Na → K), radius atom bertambah panjang, tarikan muara inti kepada elektron kulit terluar sangat kendor (energi ionisasi sangat kecil), sehingga logam semakin instan melepas elektron valensinya bereaksi meledak dengan air!'
  }
];

export interface OxidationStateOverride {
  stateLabel: string;
  ionSymbol: string;
  configuration: string;
  aqueousColor: string;
  colorName: string;
  unpairedElectrons: number;
  paramagnetic: boolean;
  dElectronsCount: number;
  desc: string;
}

export const OXIDATION_STATES_MAP: Record<string, OxidationStateOverride[]> = {
  Sc: [
    { stateLabel: '+3', ionSymbol: 'Sc³⁺', configuration: '[Ar] 3d⁰', aqueousColor: 'bg-slate-400/10 border-slate-700/50 text-zinc-450', colorName: 'Bening (Tak Berwarna)', unpairedElectrons: 0, paramagnetic: false, dElectronsCount: 0, desc: 'Satu-satunya tingkat oksidasi stabil Skandium dalam air murni.' }
  ],
  Ti: [
    { stateLabel: '+3', ionSymbol: 'Ti³⁺', configuration: '[Ar] 3d¹', aqueousColor: 'bg-violet-600/25 border-violet-500/40 text-violet-400', colorName: 'Ungu Romantis', unpairedElectrons: 1, paramagnetic: true, dElectronsCount: 1, desc: 'Tingkat oksidasi +3 pada Titanium memicu warna ungu elok namun tidak stabil di udara bebas.' }
  ],
  V: [
    { stateLabel: '+3', ionSymbol: 'V³⁺', configuration: '[Ar] 3d²', aqueousColor: 'bg-emerald-600/30 border-emerald-500/40 text-emerald-400', colorName: 'Hijau Toska', unpairedElectrons: 2, paramagnetic: true, dElectronsCount: 2, desc: 'Diperoleh dalam suasana reduksi kuat dari ion vanadat.' }
  ],
  Cr: [
    { stateLabel: '+3', ionSymbol: 'Cr³⁺', configuration: '[Ar] 3d³', aqueousColor: 'bg-emerald-700/40 border-emerald-600/50 text-emerald-400', colorName: 'Hijau Daun Tua', unpairedElectrons: 3, paramagnetic: true, dElectronsCount: 3, desc: 'Kation Chromium paling stabil di air, membentuk kompleks oktahedral [Cr(H₂O)₆]³⁺.' },
    { stateLabel: '+6 (Kromat)', ionSymbol: 'CrO₄²⁻', configuration: '[Ar] 3d⁰', aqueousColor: 'bg-yellow-405/40 border-yellow-550/40 text-yellow-400', colorName: 'Kuning Cerah', unpairedElectrons: 0, paramagnetic: false, dElectronsCount: 0, desc: 'Senyawa kromat beracun, stabil hanya dalam suasana pH basa.' },
    { stateLabel: '+6 (Dikromat)', ionSymbol: 'Cr₂O₇²⁻', configuration: '[Ar] 3d⁰', aqueousColor: 'bg-gradient-to-t from-orange-550/40 to-red-500/10 border-orange-500/45 text-orange-400', colorName: 'Jingga Kemerahan', unpairedElectrons: 0, paramagnetic: false, dElectronsCount: 0, desc: 'Kromat mengalami kondensasi dalam asam kuat memicu warna jingga dikromat.' }
  ],
  Mn: [
    { stateLabel: '+2', ionSymbol: 'Mn²⁺', configuration: '[Ar] 3d⁵', aqueousColor: 'bg-rose-400/25 border-rose-450/30 text-rose-350', colorName: 'Pink Sangat Pucat', unpairedElectrons: 5, paramagnetic: true, dElectronsCount: 5, desc: 'Mangan (II) memiliki kelopak d setengah-penuh yang sangat stabil di air.' },
    { stateLabel: '+4', ionSymbol: 'MnO₂', configuration: '[Ar] 3d³', aqueousColor: 'bg-stone-800/80 border-stone-705 text-zinc-500', colorName: 'Cokelat Gelap (Koloid)', unpairedElectrons: 3, paramagnetic: true, dElectronsCount: 3, desc: 'Senyawa mangan padat stabil berwarna hitam kecokelatan pada baterai.' },
    { stateLabel: '+6', ionSymbol: 'MnO₄²⁻', configuration: '[Ar] 3d¹', aqueousColor: 'bg-teal-900/40 border-teal-800/50 text-teal-400', colorName: 'Hijau Daun Pekat', unpairedElectrons: 1, paramagnetic: true, dElectronsCount: 1, desc: 'Stabil secara kinetis eksklusif pada larutan berfase basa tinggi.' },
    { stateLabel: '+7', ionSymbol: 'MnO₄⁻', configuration: '[Ar] 3d⁰', aqueousColor: 'bg-gradient-to-t from-fuchsia-600/35 to-purple-650/30 border-purple-500/55 text-fuchsia-300', colorName: 'Ungu Violet Kuat', unpairedElectrons: 0, paramagnetic: false, dElectronsCount: 0, desc: 'Ion permanganat legendaris dengan pita adsorbsi transfer muatan Oksigen ke Mangan.' }
  ],
  Fe: [
    { stateLabel: '+3', ionSymbol: 'Fe³⁺', configuration: '[Ar] 3d⁵', aqueousColor: 'bg-amber-600/25 border-amber-500/35 text-amber-500', colorName: 'Kuning Jingga Karat', unpairedElectrons: 5, paramagnetic: true, dElectronsCount: 5, desc: 'Kation besi paling stabil di udara luar bebas.' },
    { stateLabel: '+2', ionSymbol: 'Fe²⁺', configuration: '[Ar] 3d⁶', aqueousColor: 'bg-emerald-350/15 border-emerald-500/25 text-emerald-250', colorName: 'Hijau Fajar Pucat', unpairedElectrons: 4, paramagnetic: true, dElectronsCount: 6, desc: 'Besi (II) mudah teroksidasi oleh oksigen terlarut membentuk fasa besi (III).' }
  ],
  Co: [
    { stateLabel: '+2', ionSymbol: 'Co²⁺', configuration: '[Ar] 3d⁷', aqueousColor: 'bg-pink-500/35 border-pink-400/40 text-pink-400', colorName: 'Merah Muda Cerah', unpairedElectrons: 3, paramagnetic: true, dElectronsCount: 7, desc: 'Kompleks kobalt heksahidrat berwarna pink menyala.' }
  ],
  Ni: [
    { stateLabel: '+2', ionSymbol: 'Ni²⁺', configuration: '[Ar] 3d⁸', aqueousColor: 'bg-teal-500/35 border-teal-500/50 text-teal-400', colorName: 'Hijau Zamrud', unpairedElectrons: 2, paramagnetic: true, dElectronsCount: 8, desc: 'Nikel heksahidrat menyerap cahaya merah memotret warna komplementer hijau elok.' }
  ],
  Cu: [
    { stateLabel: '+2', ionSymbol: 'Cu²⁺', configuration: '[Ar] 3d⁹', aqueousColor: 'bg-cyan-500/40 border-cyan-500/60 text-cyan-405', colorName: 'Biru Elok Cerah', unpairedElectrons: 1, paramagnetic: true, dElectronsCount: 9, desc: 'Warna biru klasik kation hidrat tembaga yang menghiasi banyak laboratorium.' },
    { stateLabel: '+1', ionSymbol: 'Cu⁺', configuration: '[Ar] 3d¹⁰', aqueousColor: 'bg-slate-400/10 border-slate-700 text-zinc-500', colorName: 'Bening (Mutiara)', unpairedElectrons: 0, paramagnetic: false, dElectronsCount: 10, desc: 'Subkulit d penuh menghambat transisi d-to-d sehingga tak berwarna.' }
  ],
  Zn: [
    { stateLabel: '+2', ionSymbol: 'Zn²⁺', configuration: '[Ar] 3d¹⁰', aqueousColor: 'bg-slate-500/5 border-slate-900 text-zinc-450', colorName: 'Bening (Tak Berwarna)', unpairedElectrons: 0, paramagnetic: false, dElectronsCount: 10, desc: 'Hanya memiliki fasa +2 stabil dengan diamagnetik murni.' }
  ]
};

class SynthSounds {
  private static ctx: AudioContext | null = null;
  public static isMuted: boolean = false;

  private static getCtx() {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (e) {
      console.warn('Could not initialize AudioContext:', e);
      return null;
    }
  }

  public static playTick() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  public static playBubble(freq: number = 800, duration: number = 0.15) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  public static playFizz(duration: number = 0.3, intensity: number = 1) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 6000 + Math.random() * 2000;
      filter.Q.value = 1.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04 * intensity, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  public static playExplosion(intensity: number = 3) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      const rumble = ctx.createOscillator();
      rumble.type = 'triangle';
      const rumbleGain = ctx.createGain();
      
      rumble.frequency.setValueAtTime(130, now);
      rumble.frequency.exponentialRampToValueAtTime(10, now + 1.2);
      
      rumbleGain.gain.setValueAtTime(0.3 * intensity, now);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      rumble.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      
      rumble.start();
      rumble.stop(now + 1.2);

      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 700;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2 * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      noiseSource.start();
      noiseSource.stop(now + 0.8);
    } catch (e) {}
  }

  public static playPhotonLaser() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 2.5;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  public static playSparkle() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const pitches = [1300, 1600, 1900, 2200];
      pitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        
        gain.gain.setValueAtTime(0.02, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.22);
      });
    } catch (e) {}
  }

  public static playPipetteDrop() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1700, ctx.currentTime + 0.07);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  }

  public static playShakeSwirl() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const duration = 2.0;
      
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1.2;
      
      const gain = ctx.createGain();
      
      for (let t = 0; t < duration; t += 0.25) {
        const freq = 1000 + Math.sin(t * Math.PI * 4) * 600;
        filter.frequency.setValueAtTime(freq, now + t);
      }
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.20);
      gain.gain.linearRampToValueAtTime(0.05, now + 1.70);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
      noise.stop(now + duration);
    } catch (e) {}
  }

  public static playMagnetHum(freq: number) {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  public static playQuizCorrect() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99, 1046.50];
      pitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0.04, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } catch (e) {}
  }

  public static playQuizIncorrect() {
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      
      osc1.frequency.setValueAtTime(140, now);
      osc2.frequency.setValueAtTime(137, now);
      
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }
}

export default function ElementReactivityLab({ currentUser, theme = 'dark' }: ElementReactivityLabProps) {
  const [activeTab, setActiveTab] = useState<'alkali' | 'period3' | 'halogen' | 'transition' | 'quiz'>('alkali');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync soundEnabled with static property on SynthSounds
  useEffect(() => {
    SynthSounds.isMuted = !soundEnabled;
  }, [soundEnabled]);

  // ==========================================
  // TAB 1: LOGAM ALKALI & ALKALI TANAH + WATER
  // ==========================================
  const [selectedMetalId, setSelectedMetalId] = useState<string>('na');
  const [waterTemperature, setWaterTemperature] = useState<number>(25); // Celsius
  const [particleSize, setParticleSize] = useState<'bongkahan' | 'butiran' | 'serbuk'>('bongkahan');
  const [alkaliMedia, setAlkaliMedia] = useState<'murni' | 'asam' | 'basa'>('murni');
  const [beakerState, setBeakerState] = useState<'idle' | 'reacting' | 'completed'>('idle');
  const [currentTemp, setCurrentTemp] = useState<number>(25);
  const [h2Ppm, setH2Ppm] = useState<number>(0);
  const [indicatorIntensity, setIndicatorIntensity] = useState<number>(0); // 0 to 100
  const [bubbles, setBubbles] = useState<{ id: number; left: number; speed: number; size: number }[]>([]);
  const [zoomMicroOn, setZoomMicroOn] = useState<boolean>(true);
  const [alkaliEventLog, setAlkaliEventLog] = useState<string[]>([
    'Lab Alkali diinisialisasi. Pasang indikator PP dan atur parameter reaksi.'
  ]);

  const activeMetal = METAL_REACTIVITY_DATA.find(m => m.id === selectedMetalId) || METAL_REACTIVITY_DATA[1];

  // Dynamically generate bubble particles during active chemistry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (beakerState === 'reacting') {
      const density = activeMetal.intensity * (particleSize === 'serbuk' ? 40 : particleSize === 'butiran' ? 25 : 15);
      interval = setInterval(() => {
        const newBubbles = Array.from({ length: 8 }).map((_, i) => ({
          id: Math.random() + i,
          left: 10 + Math.random() * 80,
          speed: 1 + Math.random() * 2,
          size: 2 + Math.random() * 5
        }));
        setBubbles(prev => [...prev.slice(-density), ...newBubbles]);
      }, 100);
    } else {
      setBubbles([]);
    }
    return () => clearInterval(interval);
  }, [beakerState, selectedMetalId, particleSize, activeMetal.intensity]);

  // Handle the Alkali reactive run
  const triggerAlkaliEeksperimen = () => {
    if (beakerState === 'reacting') return;
    setBeakerState('reacting');
    
    // Play initial splash sound of metal hitting water
    SynthSounds.playPipetteDrop();
    
    const mediaName = alkaliMedia === 'asam' ? 'Asam Encer (HCl 0.1M)' : alkaliMedia === 'basa' ? 'Basa Encer (NaOH 0.1M)' : 'Air Suling Murni';
    setAlkaliEventLog(prev => [
      `[Reaksi Mulai] Menjatuhkan sediaan ${particleSize} logam ${activeMetal.name} (${activeMetal.symbol}) ke ${mediaName} bersuhu ${waterTemperature}°C...`,
      ...prev
    ]);

    // Calculate kinetics modifier based on temperature, size, and solvent media
    const tempKineticsMult = 1 + (waterTemperature - 20) / 75; // Up to 2x faster at hot temperature
    const sizeKineticsMult = particleSize === 'serbuk' ? 2.5 : particleSize === 'butiran' ? 1.5 : 1.0;
    const mediaKineticsMult = alkaliMedia === 'asam' ? 2.5 : alkaliMedia === 'basa' ? 0.5 : 1.0;
    const overallSpeedModifier = tempKineticsMult * sizeKineticsMult * mediaKineticsMult;

    // Reaction duration decreases with higher speed modifier
    const baseDuration = (activeMetal.intensity === 5 ? 3000 : activeMetal.intensity === 4 ? 4500 : 7000);
    const actualDuration = Math.max(1200, baseDuration / overallSpeedModifier);

    // Simulated thermodynamics climbs and gas release depending on solvent reactivity
    const activeIntensity = alkaliMedia === 'asam' 
      ? Math.min(5, activeMetal.intensity + 1.5) 
      : alkaliMedia === 'basa' 
        ? Math.max(0.5, activeMetal.intensity - 1.5) 
        : activeMetal.intensity;

    const targetTempRise = activeMetal.tempRise * (particleSize === 'serbuk' ? 1.3 : 1.0) * (alkaliMedia === 'asam' ? 1.6 : alkaliMedia === 'basa' ? 0.4 : 1.0);
    const targetTemp = Math.min(100, waterTemperature + targetTempRise);
    const targetH2 = Math.round(activeIntensity * 250 * sizeKineticsMult);

    const basePPIntensity = alkaliMedia === 'basa' ? 80 : 0;
    const targetPPIntensity = alkaliMedia === 'asam' 
      ? (activeIntensity >= 3 ? 30 : 0) // acids minimize PP color unless metal is highly basic
      : (activeIntensity * 20);

    // Play a sharp preview pop for ultra-reactive elements (Kalium/K) on touch
    if (activeIntensity >= 4.5) {
      setTimeout(() => {
        SynthSounds.playExplosion(0.85);
      }, 250);
    }

    // Tick variables
    let startTimestamp = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      const progress = Math.min(1, elapsed / actualDuration);

      setCurrentTemp(Math.round(waterTemperature + progress * (targetTemp - waterTemperature)));
      setH2Ppm(Math.round(progress * targetH2));
      setIndicatorIntensity(Math.round(basePPIntensity + progress * (targetPPIntensity - basePPIntensity)));

      // Play dynamic fizz / bubble tick sounds during active kinetics
      if (progress < 1) {
        if (activeIntensity >= 4.5) {
          // Extremely reactive (Kalium)
          SynthSounds.playFizz(0.18, 1.4);
          if (Math.random() < 0.35) {
            SynthSounds.playBubble(180 + Math.random() * 220, 0.12);
          }
        } else if (activeIntensity >= 3.0) {
          // Highly reactive (Natrium, Kalsium, Barium)
          SynthSounds.playFizz(0.15, 0.85);
          if (Math.random() < 0.25) {
            SynthSounds.playBubble(300 + Math.random() * 250, 0.1);
          }
        } else if (activeIntensity >= 1.5) {
          // Moderately reactive (Litium)
          SynthSounds.playFizz(0.12, 0.4);
          if (Math.random() < 0.15) {
            SynthSounds.playBubble(450 + Math.random() * 250, 0.08);
          }
        } else {
          // Mild reaction (Magnesium)
          if (waterTemperature > 50) {
            SynthSounds.playFizz(0.1, 0.15);
            if (Math.random() < 0.08) {
              SynthSounds.playBubble(600 + Math.random() * 300, 0.06);
            }
          }
        }
      }

      if (progress >= 1) {
        clearInterval(interval);
        setBeakerState('completed');
        
        // Final chemical explosion popping sounds on complete!
        if (activeIntensity >= 4.5) {
          SynthSounds.playExplosion(2.2); // Big boom for Kalium
        } else if (activeIntensity >= 3.0) {
          SynthSounds.playExplosion(0.9); // Small popping bang for Sodium/Barium
        } else if (activeIntensity >= 1.5) {
          SynthSounds.playExplosion(0.3); // Low intensity pop for Li
        } else {
          SynthSounds.playTick(); // Minimal resolution tick
        }

        let reactionEq = activeMetal.equation;
        if (alkaliMedia === 'asam') {
          reactionEq = activeMetal.group.includes('Alkali Tanah') 
            ? `${activeMetal.symbol}(s) + 2H⁺(aq) → ${activeMetal.symbol}²⁺(aq) + H₂(g)` 
            : `2${activeMetal.symbol}(s) + 2H⁺(aq) → 2${activeMetal.symbol}⁺(aq) + H₂(g)`;
        }

        const safetyLabel = activeIntensity >= 4.5 ? 'WARNING: EKSPLOSIF DAHSHAT' : activeIntensity >= 3 ? 'REAKSI EKSTREM BUIH' : 'REAKSI SEDANG-LAMBAT';

        setAlkaliEventLog(prev => [
          `[Sifat Energi] ${activeMetal.energyChange}. Kalorimeter naik mencapai ${Math.round(targetTemp)}°C (${safetyLabel}).`,
          `[Gas H₂] Terdeteksi konsentrasi puncak gas hidrogen sebesar ${Math.round(targetH2)} ppm.`,
          `[Mekanisme] Persamaan redoks media: ${reactionEq}`,
          `[Selesai] Logam ${activeMetal.name} (${activeMetal.symbol}) habis terdisposisi sempurna dalam pelarut.`,
          ...prev
        ]);
      }
    }, 100);
  };

  const resetAlkaliEksperimen = () => {
    setBeakerState('idle');
    setCurrentTemp(waterTemperature);
    setH2Ppm(0);
    setIndicatorIntensity(alkaliMedia === 'basa' ? 80 : 0);
    setBubbles([]);
    const initialLog = alkaliMedia === 'asam' 
      ? 'Beaker dikalibrasi ulang dengan larutan HCl 0.1M (Banjir H+). Indikator PP tak berwarna.' 
      : alkaliMedia === 'basa' 
        ? 'Beaker diisi larutan NaOH 0.1M berlebih + PP (Warna fuchsia/lembayung pekat). Siap bereaksi.' 
        : 'Beaker dibilas dengan aquades murni baru + 2 tetes PP. Siap bereaksi kembali.';
    setAlkaliEventLog([initialLog]);
  };

  useEffect(() => {
    setCurrentTemp(waterTemperature);
  }, [waterTemperature]);

  useEffect(() => {
    resetAlkaliEksperimen();
  }, [selectedMetalId, alkaliMedia]);


  // ==========================================
  // TAB 2: PERIOD 3 OXIDATION & PH SLIDERS
  // ==========================================
  const [selectedP3Idx, setSelectedP3Idx] = useState<number>(2); // Default Al
  const [p3ActivePh, setP3ActivePh] = useState<number>(7.0);
  const [p3PrecipitateOpacity, setP3PrecipitateOpacity] = useState<number>(1.0); // opacity fraction
  const [selectedP3Property, setSelectedP3Property] = useState<'radius' | 'ionization' | 'electronAffinity' | 'electronegativity'>('radius');

  const activeP3 = PERIOD3_DATA[selectedP3Idx];

  // Dynamic precipitate calculation based on element character and manual pH sliding
  useEffect(() => {
    if (activeP3.symbol === 'Al') {
      // Al(OH)3 is amphoteric: insoluble around neutral (pH 5.0 to 9.0), but soluble at extreme pH (<4 or >10.5)
      if (p3ActivePh >= 5.0 && p3ActivePh <= 9.0) {
        // High opacity gelatinous precipitate
        const distFromCenter = Math.abs(p3ActivePh - 7.0); // 0 to 2
        setP3PrecipitateOpacity(1 - (distFromCenter * 0.2)); // stay thick
      } else if (p3ActivePh < 4.0) {
        // dissolves at low pH
        const p = Math.max(0, (p3ActivePh - 1.5) / 2.5); // fade down
        setP3PrecipitateOpacity(p * 0.1); 
      } else if (p3ActivePh > 10.5) {
        // dissolves at high pH
        const p = Math.max(0, (13.5 - p3ActivePh) / 3.0);
        setP3PrecipitateOpacity(p * 0.1);
      } else {
        // intermediate states
        setP3PrecipitateOpacity(0.35);
      }
    } else if (activeP3.symbol === 'Mg') {
      // Mg(OH)2 is basic: insolubles at high pH (>9.5), dissolves in acidic environment (<8.5)
      if (p3ActivePh >= 9.5) {
        setP3PrecipitateOpacity(0.9);
      } else if (p3ActivePh < 8.0) {
        setP3PrecipitateOpacity(0);
      } else {
        // intermediate fading
        setP3PrecipitateOpacity((p3ActivePh - 8.0) / 1.5);
      }
    } else {
      // All other Period 3 oxides form transparent acids (H2SO4, HClO4, H3PO4) or silica gel (Si)
      if (activeP3.symbol === 'Si') {
        setP3PrecipitateOpacity(0.4); // silica gel stays slightly colloidal
      } else {
        setP3PrecipitateOpacity(0); // completely transparent solution
      }
    }
  }, [p3ActivePh, selectedP3Idx, activeP3.symbol]);

  // Quick preset pH values
  const applyPresetPh = (ph: number) => {
    setP3ActivePh(ph);
  };


  // ==========================================
  // TAB 3: HALOGEN DISPLACEMENT (GAS REDOX TREN)
  // ==========================================
  const [chosenHalogen, setChosenHalogen] = useState<'Cl₂' | 'Br₂' | 'I₂'>('Cl₂');
  const [chosenHalide, setChosenHalide] = useState<'KF' | 'KCl' | 'KBr' | 'KI'>('KBr');
  const [halogenStep, setHalogenStep] = useState<'empty' | 'dripping' | 'unmixed' | 'shaking' | 'shaken'>('empty');
  const [halogenLogs, setHalogenLogs] = useState<string[]>(['Siap memulai ekstraksi redoks halogen.']);

  // Programmatic determination if reaction path occurs
  const checkRedoxSpontaneous = (hal: string, halide: string): boolean => {
    // Halogen oxidizer strength: Cl2 > Br2 > I2
    // F (from KF) has no matching higher halogen in this test, so nothing can displace F-
    if (halide === 'KF') return false;
    if (hal === 'Cl₂') return halide === 'KBr' || halide === 'KI';
    if (hal === 'Br₂') return halide === 'KI';
    return false; // I2 is too weak to displace Cl- or Br- or F-
  };

  const isSpontaneous = checkRedoxSpontaneous(chosenHalogen, chosenHalide);

  // Return the custom colors of the organic upper layer after extraction
  const getOrganicLayerColor = (): string => {
    if (halogenStep === 'empty') return 'bg-zinc-800/20';
    if (halogenStep === 'dripping' || halogenStep === 'unmixed') {
      // Pre-mixed hexane layer is standard clear/slightly yellowed
      return 'bg-zinc-400/20';
    }
    // After shake behavior
    if (!isSpontaneous) {
      // No reaction, organic layer takes the color of dissolved inputs
      // Cl2 in hexane is light greenish-yellow, Br2 is light brown orange, I2 is violet-purple
      if (chosenHalogen === 'Cl₂') return 'bg-yellow-100/30 shadow-inner border-y border-yellow-250/20';
      if (chosenHalogen === 'Br₂') return 'bg-amber-600/30 shadow-inner border-y border-amber-500/25';
      return 'bg-fuchsia-600/30 shadow-inner border-y border-fuchsia-500/30';
    }
    // High-contrast color from displaced element
    // Cl2 + KBr -> Br2 produced (deep orange/red in hexane)
    if (chosenHalogen === 'Cl₂' && chosenHalide === 'KBr') return 'bg-gradient-to-r from-amber-600 to-orange-500 shadow-xl border-y border-amber-400/45';
    // Cl2 + KI -> I2 produced (vibrant violet-purple in hexane)
    // Br2 + KI -> I2 produced (vibrant violet-purple in hexane)
    return 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 shadow-xl border-y border-fuchsia-500/50 text-fuchsia-100 font-extrabold';
  };

  const triggerDropperPipet = () => {
    if (halogenStep !== 'empty') return;
    setHalogenStep('dripping');
    
    // Play initial dropper click
    SynthSounds.playPipetteDrop();
    // Play drop hitting liquid surface after a gravity latency
    setTimeout(() => {
      SynthSounds.playBubble(1000, 0.12);
    }, 500);

    setHalogenLogs(prev => [
      `[Tetes] Meneteskan cairan halogen bebas ${chosenHalogen} ke atas larutan garam halida ${chosenHalide} di bawah lapisan Heksana murni...`,
      ...prev
    ]);

    setTimeout(() => {
      setHalogenStep('unmixed');
      setHalogenLogs(prev => [
        `[Diam] Zat halogen mengendap bertumpuk di antara batas cairan non-polar. Larutan belum dikocok (belum terlarut terdistribusi).`,
        ...prev
      ]);
    }, 1200);
  };

  const triggerShakeSimulation = () => {
    if (halogenStep !== 'unmixed') return;
    setHalogenStep('shaking');
    
    // Play active centrifuge tube shaking swirl sound
    SynthSounds.playShakeSwirl();

    setHalogenLogs(prev => [
      `[Kocok] Tabung reaksi dikocok berputar dengan putaran sirkular centrifugator (proses ekstraksi hulu)...`,
      ...prev
    ]);

    setTimeout(() => {
      setHalogenStep('shaken');
      const reactionSummary = isSpontaneous 
        ? `[BERHASIL] Redoks Spontan! Potensial reduksi ${chosenHalogen} lebih tinggi. Persamaan: ${chosenHalogen}(aq) + 2${chosenHalide}(aq) → 2K${chosenHalogen.slice(0,2).toLowerCase()}(aq) + ${chosenHalide === 'KBr' ? 'Br₂' : 'I₂'}(l).` 
        : `[Gagal/Pasif] Tidak terjadi reaksi. Halogen ${chosenHalogen} tidak sanggup mendesak ion dalam molekul garam unsur ${chosenHalide}.`;

      // Play success arpeggio or simple tick depending on spontaneity
      if (isSpontaneous) {
        SynthSounds.playSparkle();
      } else {
        SynthSounds.playTick();
      }

      setHalogenLogs(prev => [
        reactionSummary,
        isSpontaneous 
          ? `[Warna Layer Organik] Terjadi ekstraksi zat halogen bebas baru ke atas fase heksana menghasilkan warna spektakuler!` 
          : `[Hasil Fase] Lapisan heksana atas hanya berisikan residu reaktan murni terlarut pasif.`,
        ...prev
      ]);
    }, 2000);
  };

  const resetHalogenEksperimen = () => {
    setHalogenStep('empty');
    setHalogenLogs(['Tabung dicuci desinfektor. Silakan pilih kombinasi halogen - halida baru.']);
  };


  // ==========================================
  // TAB 4: TRANSITION METALS PARAMAGNETIC GOUY BALANCE
  // ==========================================
  const [selectedTmIdx, setSelectedTmIdx] = useState<number>(4); // Default Mn
  const [magnetStrength, setMagnetStrength] = useState<number>(0); // 0 (off) to 100% active
  const [scaleBaseWeight, setScaleBaseWeight] = useState<number>(10.000);
  const [photonGunActive, setPhotonGunActive] = useState<boolean>(false);
  const [ddTransitionColor, setDdTransitionColor] = useState<string>('');

  const [activeOxStateIdx, setActiveOxStateIdx] = useState<number>(0);
  const activeTm = TRANSITION_METALS_DATA[selectedTmIdx];

  const availableOxStates = OXIDATION_STATES_MAP[activeTm.symbol] || [];
  const activeOxState = availableOxStates[activeOxStateIdx] || availableOxStates[0] || {
    stateLabel: 'N/A',
    ionSymbol: activeTm.ionSymbol,
    configuration: activeTm.configuration,
    aqueousColor: activeTm.aqueousColor,
    colorName: activeTm.colorName,
    unpairedElectrons: activeTm.unpairedElectrons,
    paramagnetic: activeTm.paramagnetic,
    dElectronsCount: activeTm.dElectronsCount,
    desc: 'Tingkat oksidasi default.'
  };

  // Gouy balance weight simulation calculation
  const getSimulatedWeight = (): string => {
    if (magnetStrength === 0) return scaleBaseWeight.toFixed(4);
    // Paramagnetic: pull down (increases registered weight)
    // Diamagnetic: slight repulsion (extremely slight decrease)
    const factor = activeOxState.paramagnetic 
      ? (activeOxState.unpairedElectrons * 0.118 * (magnetStrength / 100))
      : (-0.002 * (magnetStrength / 100));
    
    return (scaleBaseWeight + factor).toFixed(4);
  };

  useEffect(() => {
    setMagnetStrength(0);
    setDdTransitionColor('');
    setActiveOxStateIdx(0);
  }, [selectedTmIdx]);

  // Shooting dynamic photon laser to simulate orbital d-to-d transition
  const triggerPhotonLaser = () => {
    if (!activeOxState.paramagnetic) {
      SynthSounds.playTick();
      setAlkaliEventLog(prev => [`[Spektroskopi] Unsur ${activeTm.symbol} (${activeOxState.ionSymbol}) bersubkulit d kosong/penuh (${activeOxState.configuration}), laser terpantul tak terabsorbsi bening.`, ...prev]);
      return;
    }
    
    // Play futuristic laser sound on charge-up
    SynthSounds.playPhotonLaser();
    
    setPhotonGunActive(true);
    setTimeout(() => {
      setPhotonGunActive(false);
      // Give appropriate emission flare
      setDdTransitionColor(activeOxState.aqueousColor);
      
      // Play a lovely high-frequency light arpeggio
      SynthSounds.playSparkle();
    }, 1500);
  };


  // ==========================================
  // TAB 5: QUIZ ASSESSMENT STATE
  // ==========================================
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerApplied, setIsAnswerApplied] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);

  const activeQuestion = QUIZ_DATA[quizIndex];

  const handleApplyQuizAnswer = () => {
    if (selectedOption === null || isAnswerApplied) return;
    setIsAnswerApplied(true);
    if (selectedOption === activeQuestion.correctIndex) {
      setQuizScore(prev => prev + 20);
      SynthSounds.playQuizCorrect();
    } else {
      SynthSounds.playQuizIncorrect();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerApplied(false);
    if (quizIndex < QUIZ_DATA.length - 1) {
      setQuizIndex(prev => prev + 1);
      SynthSounds.playTick();
    } else {
      setIsQuizComplete(true);
      // Play a lovely high-frequency sparkling chime representing quiz completion!
      SynthSounds.playSparkle();
      
      // Send custom event
      const actEvent = new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          title: 'Asesmen Reaktivitas Unsur',
          description: `Lulus kuis reaktivitas kimia dengan skor akhir ${quizScore}/100`,
          score: { earned: quizScore, total: 100 }
        }
      });
      window.dispatchEvent(actEvent);
    }
  };

  const resetQuizEvaluasi = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerApplied(false);
    setQuizScore(0);
    setIsQuizComplete(false);
  };

  return (
    <div id="chem-laboratory-reactivity-panel" className={`w-full min-h-[calc(100vh-4rem)] p-4 md:p-8 space-y-6 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans leading-relaxed`}>
      
      {/* Upper Unified Visual Banner */}
      <div className={`relative p-6 md:p-8 rounded-2xl border shadow-2xl overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-slate-900 via-cyan-950/20 to-emerald-950/10 border-slate-800' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -translate-y-12" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none translate-y-12" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 w-full">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 px-2.5 bg-cyan-950/80 border border-cyan-500/30 text-cyan-405 text-[10px] font-mono font-black uppercase rounded-full">
                KIMIA KELAS XII • PEMBELAJARAN INTERAKTIF
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Sparkles className="w-3" />
                V2.5 Supercharged Lab
              </span>
              <button
                onClick={() => {
                  const targetState = !soundEnabled;
                  setSoundEnabled(targetState);
                  if (targetState) {
                    // Play a quick tick sound to confirm
                    setTimeout(() => {
                      SynthSounds.playTick();
                    }, 50);
                  }
                }}
                className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full border transition-all cursor-pointer ${
                  soundEnabled 
                    ? 'text-cyan-400 bg-cyan-950/50 border-cyan-500/30 hover:bg-cyan-900/40' 
                    : 'text-zinc-500 bg-zinc-950/60 border-zinc-850 hover:bg-zinc-900/30'
                }`}
                title={soundEnabled ? "Mute Suara" : "Aktifkan Suara"}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>EFEK SUARA: AKTIF</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                    <span>EFEK SUARA: SENYAP</span>
                  </>
                )}
              </button>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Beaker className="w-8 h-8 text-cyan-400 animate-pulse" />
              Komparator Sifat &amp; Reaktivitas <span className="text-emerald-400">Kimia Unsur</span>
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-2xl">
              Platform simulasi interaktif termodinamika hidrolisis alkali 1A/2A, kesetimbangan pH larutan amfoter, ekstraksi pelarut redoks halogen, hingga gaya magnetik Gouy orbital d-block.
            </p>
          </div>

          {/* Core Lab Route Selector Tabs */}
          <div className={`flex flex-col gap-2 p-1 rounded-xl border w-full md:w-56 shrink-0 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
          }`}>
            {(['alkali', 'period3', 'halogen', 'transition', 'quiz'] as const).map((tab) => {
              const tabLabels: Record<string, string> = {
                alkali: '💧 Hidrolisis 1A/2A',
                period3: '🧪 Hidroksida P3',
                halogen: '🌈 Halogen 7A',
                transition: '🧲 Transisi P4',
                quiz: '🏆 Kuis Asesmen'
              };
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    SynthSounds.playTick();
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all tracking-wide text-left cursor-pointer ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-cyan-550 to-emerald-555 text-slate-950 shadow-md transform scale-102 font-black'
                      : (theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==========================================
          TAB 1: DYNAMICS ALKALI WATER INTERACTION
          ========================================== */}
      {activeTab === 'alkali' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Reactive parameters controls */}
          <div className={`lg:col-span-5 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase block">Parameter Kinetika Reaksi</span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-450" />
                Pilih Logam &amp; Atur Kondisi
              </h3>
              <p className="text-zinc-500 text-xs">
                Sesuaikan ukuran partikel zat padat dan intensitas suhu awal air suling untuk menguji tingkat tumbukan partikel.
              </p>
            </div>

            {/* Solid Reagents grid selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400 uppercase block">1. Sediaan Logam Alkali/Tanah:</span>
              <div className="grid grid-cols-3 gap-2">
                {METAL_REACTIVITY_DATA.map((metal) => {
                  const isSelected = metal.id === selectedMetalId;
                  return (
                    <button
                      key={metal.id}
                      onClick={() => {
                        if (beakerState === 'reacting') return;
                        setSelectedMetalId(metal.id);
                        SynthSounds.playPipetteDrop();
                      }}
                      disabled={beakerState === 'reacting'}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[84px] cursor-pointer ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-950/20 text-white shadow-lg' 
                          : 'border-slate-800 bg-slate-900/30 text-zinc-400 hover:bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-lg font-black">{metal.symbol}</span>
                        <span className={`text-[7.5px] font-mono px-1 rounded border font-bold uppercase ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-zinc-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                          {metal.group.slice(0, 7)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold block truncate leading-tight">{metal.name}</span>
                        <span className="text-[9px] font-mono whitespace-nowrap text-zinc-505 block leading-none">Intensitas: {metal.intensity}/5</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kinetic controls sliders */}
            <div className="space-y-4 pt-1 border-t border-slate-800/10">
              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-zinc-400">2. Suhu Awal Air Suling:</span>
                  <span className="font-mono text-cyan-400 font-extrabold flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    {waterTemperature} °C {waterTemperature >= 75 ? '(Mendidih)' : waterTemperature <= 15 ? '(Air Es)' : '(Suhu Kamar)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={waterTemperature}
                  onChange={(e) => {
                    if (beakerState === 'reacting') return;
                    setWaterTemperature(parseInt(e.target.value));
                  }}
                  disabled={beakerState === 'reacting'}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-40"
                />
              </div>

              {/* Particle size select options */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400 block">3. Keadaan Fisik Padatan Logam:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['bongkahan', 'butiran', 'serbuk'] as const).map((sz) => {
                    const isPick = particleSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => {
                          if (beakerState === 'reacting') return;
                          setParticleSize(sz);
                        }}
                        disabled={beakerState === 'reacting'}
                        className={`py-1.5 rounded-lg border text-[10.5px] font-mono font-black uppercase text-center transition-all cursor-pointer ${
                          isPick 
                            ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' 
                            : 'border-slate-800 bg-slate-900/20 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {sz === 'bongkahan' ? '🧱 Bongkah' : sz === 'butiran' ? '🍬 Butiran' : '✨ Serbuk'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Media Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-800/40">
                <span className="text-xs font-mono text-zinc-400 block">4. Pelarut / Suasana Beaker:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['murni', 'asam', 'basa'] as const).map((med) => {
                    const isSelect = alkaliMedia === med;
                    return (
                      <button
                        key={med}
                        onClick={() => {
                          if (beakerState === 'reacting') return;
                          setAlkaliMedia(med);
                        }}
                        disabled={beakerState === 'reacting'}
                        className={`py-1.5 rounded-lg border text-[10.1px] font-mono font-black uppercase text-center transition-all cursor-pointer ${
                          isSelect 
                            ? med === 'asam' 
                              ? 'border-red-500 bg-red-950/25 text-red-100 font-extrabold' 
                              : med === 'basa' 
                                ? 'border-purple-500 bg-purple-950/25 text-purple-100 font-extrabold' 
                                : 'border-cyan-500 bg-cyan-950/25 text-cyan-100 font-extrabold'
                            : 'border-slate-800 bg-slate-900/20 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {med === 'murni' ? '💧 Air Suling' : med === 'asam' ? '🧪 Asam (HCl)' : '🧼 Basa (NaOH)'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* React Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={triggerAlkaliEeksperimen}
                disabled={beakerState === 'reacting'}
                className={`flex-1 py-3 text-xs font-mono font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  beakerState === 'reacting'
                    ? 'bg-zinc-805 text-zinc-505 border border-slate-900 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-90 transform active:scale-98 font-bold'
                }`}
              >
                <Zap className="w-4 h-4 text-slate-950" />
                Drop Logam ke Air
              </button>

              <button
                onClick={resetAlkaliEksperimen}
                className={`px-4 py-3 hover:bg-slate-800 text-zinc-300 font-mono text-xs rounded-xl border transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}
                title="Reset Beaker & Cairan"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Formula Panel */}
            <div className={`p-3 rounded-xl border space-y-1 font-mono text-xs ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Persamaan Hidrolisis Reduktor ({alkaliMedia === 'asam' ? 'Suasana Asam' : alkaliMedia === 'basa' ? 'Suasana Basa' : 'Air Murni'}):</span>
              <p className="text-cyan-400 font-black leading-relaxed">
                {alkaliMedia === 'asam' 
                  ? activeMetal.group.includes('Alkali Tanah') 
                    ? `${activeMetal.symbol}(s) + 2H⁺(aq) → ${activeMetal.symbol}²⁺(aq) + H₂(g)` 
                    : `2${activeMetal.symbol}(s) + 2H⁺(aq) → 2${activeMetal.symbol}⁺(aq) + H₂(g)`
                  : activeMetal.equation}
              </p>
            </div>

          </div>

          {/* Interactive Beaker Visual Simulation Canvas */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className={`border rounded-2xl p-5 flex flex-col justify-between space-y-6 flex-1 min-h-[420px] relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
              <div className="absolute inset-0 bg-gradient-radial from-cyan-500/0 via-transparent to-slate-950/25 pointer-events-none" />
              
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-zinc-450 uppercase block">Laboratorium Kalorimeter Terpadu</span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-pink-450 animate-pulse" />
                    Uji Hidrolisis Logam Alkali
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">State:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                    beakerState === 'reacting' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse' 
                      : beakerState === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {beakerState === 'reacting' ? '⚠️ REAKSI AKTIF' : beakerState === 'completed' ? '✓ REAKSI SELESAI' : 'DIAM'}
                  </span>
                </div>
              </div>

              {/* Unified Physical Graphics Beaker with Thermometer dashboard surrounding */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-stretch">
                
                {/* 1. Digital Telemetry Diagnostics Side-Bar */}
                <div className="md:col-span-4 flex flex-col justify-center gap-3">
                  {/* Gauge 1: Thermometer */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 relative ${theme === 'dark' ? 'bg-slate-950/90 border-slate-850' : 'bg-slate-100/90 border-slate-300'}`}>
                    <div className="p-2 bg-rose-500/5 rounded-lg text-rose-450">
                      <Thermometer className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[8.5px] font-mono text-zinc-505 block">TELESENSOR SUHU</span>
                      <strong className="text-sm font-mono text-rose-400 block">{currentTemp} °C</strong>
                    </div>
                  </div>

                  {/* Gauge 2: Gas Sensor */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 relative ${theme === 'dark' ? 'bg-slate-950/90 border-slate-850' : 'bg-slate-100/90 border-slate-300'}`}>
                    <div className="p-2 bg-cyan-500/5 rounded-lg text-cyan-405 font-mono text-xs font-black">
                      H₂
                    </div>
                    <div>
                      <span className="text-[8.5px] font-mono text-zinc-505 block">DETEKTOR GAS H₂</span>
                      <strong className="text-sm font-mono text-cyan-400 block">{h2Ppm} ppm</strong>
                    </div>
                  </div>

                  {/* Gauge 3: pH Indicator bar */}
                  <div className={`p-3 rounded-xl border flex items-center gap-3 relative ${theme === 'dark' ? 'bg-slate-950/90 border-slate-850' : 'bg-slate-100/90 border-slate-300'}`}>
                    <div className="p-2 bg-pink-500/5 rounded-lg text-pink-450 font-mono text-xs font-black">
                      pH
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[8.5px] font-mono text-zinc-505 block">KEMURNIAN PP INDICATOR</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="h-2 bg-slate-800 rounded-full flex-1 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-400 to-pink-650 transition-all duration-300"
                            style={{ width: `${indicatorIntensity}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-pink-400">
                          {alkaliMedia === 'asam' 
                            ? Math.max(1.0, 1.2 + (indicatorIntensity / 20)).toFixed(1)
                            : alkaliMedia === 'basa'
                              ? Math.min(14.0, 12.0 + (indicatorIntensity / 25)).toFixed(1)
                              : (7.0 + (indicatorIntensity / 20)).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Visual Glass Beaker Animation Area */}
                <div className="md:col-span-8 flex items-center justify-center relative min-h-[200px] border-l border-slate-900/40 md:pl-4">
                  
                  {/* Glass Beaker representation */}
                  <div className={`w-48 h-44 border-b-8 border-l-4 border-r-4 border-slate-700 rounded-b-3xl relative flex flex-col justify-end overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-slate-900/10' : 'bg-slate-100/10'}`}>
                    
                    {/* Tick markings on side */}
                    <div className="absolute left-2.5 top-6 bottom-4 w-1 bg-slate-650/15 opacity-40 flex flex-col justify-between text-[6px] font-mono text-zinc-650">
                      <span>- 200</span>
                      <span>- 150</span>
                      <span>- 100</span>
                      <span>- 50</span>
                    </div>

                    {/* Water volume container */}
                    <motion.div
                      animate={
                        beakerState === 'reacting'
                          ? { height: '62%' }
                          : beakerState === 'completed'
                            ? { height: '62%' }
                            : { height: '56%' }
                      }
                      className="absolute bottom-0 inset-x-0 w-full rounded-b-2.5xl transition-all duration-1000 bg-gradient-to-t"
                      style={{
                        backgroundImage: `linear-gradient(to top, rgba(219,39,119,${indicatorIntensity / 100 * 0.35 + 0.05}), rgba(56,189,248,0.12))`
                      }}
                    >
                      {/* Rising bubbles particle loop */}
                      {bubbles.map((bub) => (
                        <motion.span
                          key={bub.id}
                          className="absolute rounded-full bg-sky-100/50"
                          style={{
                            width: bub.size,
                            height: bub.size,
                            left: `${bub.left}%`,
                            bottom: 0
                          }}
                          animate={{
                            y: -200,
                            opacity: [0.6, 0.9, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: bub.speed,
                            ease: 'linear'
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Reactor sample metal lump bouncing/dissolving */}
                    {beakerState !== 'idle' && (
                      <motion.div
                        className={`w-7 h-7 rounded-full border border-zinc-200 absolute flex items-center justify-center font-mono font-black text-[9px] text-slate-950 shadow-2xl ${activeMetal.flameColor}`}
                        initial={{ y: -30, x: 50, scale: 1 }}
                        animate={
                          beakerState === 'reacting'
                            ? {
                                x: [30, -30, 40, -10, 20, 0],
                                y: [100, 110, -10, -20, 0, 0],
                                rotate: [0, 360, 720, 1080],
                                scale: [1, 0.8, 0.6, 0.3, 0.1, 0]
                              }
                            : { y: 110, x: 0, scale: 0 }
                        }
                        transition={{
                          duration: activeMetal.intensity === 5 ? 2.5 : activeMetal.intensity === 4 ? 4 : 6,
                          ease: 'easeInOut'
                        }}
                      >
                        {activeMetal.symbol}
                        
                        {/* Dynamic splash flares */}
                        {beakerState === 'reacting' && activeMetal.intensity >= 4 && (
                          <span className="absolute inset-0 rounded-full border border-orange-400 animate-ping opacity-75" />
                        )}
                      </motion.div>
                    )}

                    {/* Splash Warnings indicator overlay */}
                    {beakerState === 'reacting' && activeMetal.intensity === 5 && (
                      <div className="absolute inset-x-0 bottom-12 text-center pointer-events-none z-15">
                        <span className="p-1 px-2.5 bg-rose-950/80 border border-rose-500/30 text-rose-455 font-mono text-[8px] font-black uppercase rounded-lg animate-bounce">
                          💥 IGNISI NYALA LILA!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom live analysis event ledger */}
              <div className={`p-3.5 border rounded-xl space-y-1.5 font-mono text-xs text-left ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <span className="text-[9px] text-zinc-550 block font-black uppercase">LAPORAN OBSERVASI LAB ALKALI:</span>
                <div className="max-h-[70px] overflow-y-auto space-y-1 pr-1">
                  {alkaliEventLog.map((log, lIdx) => (
                    <div 
                      key={lIdx} 
                      className={`text-[11px] leading-relaxed transition-all ${
                        log.startsWith('[Reaksi') ? 'text-cyan-405 font-bold' : log.startsWith('[Selesai') ? 'text-emerald-400 font-bold' : 'text-zinc-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Microscopic Zoom Frame Molecular Microscope Overlay */}
            {zoomMicroOn && (
              <div className={`border rounded-2xl p-4 space-y-3 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900/15 border-slate-900' : 'bg-slate-100/15 border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Mikroskop Submikroskopis (Molekuler Level)
                  </span>
                  <button 
                    onClick={() => setZoomMicroOn(!zoomMicroOn)}
                    className="text-[9.5px] font-mono text-zinc-505 hover:text-zinc-200 uppercase"
                  >
                    Sembunyikan
                  </button>
                </div>

                <div className={`flex items-center gap-4 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/50 border-slate-850' : 'bg-slate-100/50 border-slate-300'}`}>
                  <div className={`w-14 h-14 rounded-full border-2 border-emerald-500/20 flex items-center justify-center flex-shrink-0 animate-spin-slow ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    {beakerState === 'reacting' ? (
                      <div className="text-[10px] font-mono text-cyan-405 font-extrabold rotate-3">H₂↑</div>
                    ) : (
                      <div className="text-[10px] text-zinc-650 font-mono">H₂O</div>
                    )}
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-zinc-350 text-[11px] leading-relaxed">
                      {beakerState === 'reacting' ? (
                        <>Molekul air <strong>H₂O</strong> menabrak kisi logam, merebut elektron membentuk ion kation hidrasi berwarna merah muda PP dan gas <strong>Hidrogen (H₂)</strong> yang terlepas berupa buih.</>
                      ) : (
                        <>Logam sediaan dalam wujud solid netral stabil dikelilingi zat pelumas air destilasi yang statis.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: PERIOD 3 TRENDS & PH SLIDERS
          ========================================== */}
      {activeTab === 'period3' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Periodic Row representation sidebar */}
          <div className={`lg:col-span-5 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-805' : 'bg-slate-100/40 border-slate-300'}`}>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase block">Transisi Sifat Hidroksida P3</span>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-450" />
                Mini-Tabel Periodik P3
              </h3>
              <p className="text-zinc-500 text-xs">
                Sifat unsur dari kiri ke kanan bermutasi dari logam (basa kuat), metaloid amfoter, hingga non-logam asam súper kuat.
              </p>
            </div>

            {/* Custom Interactive Table row */}
            <div className={`p-1 px-1.5 rounded-xl border grid grid-cols-7 gap-1.5 ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
              {PERIOD3_DATA.map((element, idx) => {
                const isSelected = idx === selectedP3Idx;
                return (
                  <button
                    key={element.symbol}
                    onClick={() => {
                      setSelectedP3Idx(idx);
                      setP3ActivePh(element.pH);
                      SynthSounds.playPipetteDrop();
                    }}
                    className={`p-2 py-3 rounded-lg border text-center transition-all flex flex-col items-center justify-between min-h-[76px] cursor-pointer ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md' 
                        : 'border-slate-850 bg-slate-900/20 text-zinc-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="font-mono text-sm block font-black">{element.symbol}</span>
                    <span className="text-[8px] font-mono text-zinc-550 block select-none">No.{11 + idx}</span>
                    <span className="text-[9px] font-mono text-teal-400 font-bold block">{element.formula}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Physical Rings: radius and electronegativity visualization */}
            <div className={`grid grid-cols-2 gap-3 p-4 rounded-xl border text-center ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
              
              {/* Diameter of circle represents atomic radius */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-[9.5px] font-mono text-zinc-500 uppercase">Jari-jari Atom (pm)</span>
                <div 
                  className="rounded-full bg-emerald-550/15 border border-emerald-550 flex items-center justify-center text-[10.5px] font-mono text-zinc-200 transition-all duration-500 shadow-lg"
                  style={{ 
                    width: `${activeP3.radius * 0.45}px`, 
                    height: `${activeP3.radius * 0.45}px`,
                    maxHeight: '84px',
                    maxWidth: '84px'
                  }}
                >
                  {activeP3.radius} pm
                </div>
              </div>

              {/* Ring intensity represents electronegativity */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="text-[9.5px] font-mono text-zinc-500 uppercase">Elektronegativitas</span>
                <div className="relative w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center font-mono text-[11px]">
                  {/* Circular ring representation */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                      cx="32" cy="32" r="28" 
                      stroke="#06b6d4" strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray="175"
                      strokeDashoffset={175 - (175 * (activeP3.electronegativity / 4.0))}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <strong className="text-cyan-400 font-bold">{activeP3.electronegativity.toFixed(2)}</strong>
                </div>
              </div>

            </div>

            {/* Core Acid Base Titration pH Control Slider */}
            <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-400 uppercase font-black">Asiditas pH Komparator:</span>
                <span className={`text-sm font-mono text-yellow-405 font-extrabold px-2 py-0.5 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                  pH {p3ActivePh.toFixed(1)}
                </span>
              </div>

              <input
                type="range"
                min="0.1"
                max="14.0"
                step="0.1"
                value={p3ActivePh}
                onChange={(e) => setP3ActivePh(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              {/* pH Quick buttons presets */}
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => applyPresetPh(1.5)} className="py-1 bg-rose-950/20 text-rose-455 text-[9px] font-mono border border-rose-900/30 rounded">Banjir Asam (pH 1.5)</button>
                <button onClick={() => applyPresetPh(7.0)} className="py-1 bg-teal-950/20 text-teal-405 text-[9px] font-mono border border-teal-900/30 rounded">Netral Rata (pH 7.0)</button>
                <button onClick={() => applyPresetPh(13.5)} className="py-1 bg-blue-950/20 text-blue-455 text-[9px] font-mono border border-blue-900/30 rounded">Basa Pekat (pH 13.5)</button>
              </div>
            </div>

          </div>

          {/* Test Tube visualization side with chemical characteristics */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className={`border rounded-2xl p-5 flex flex-col justify-between space-y-6 flex-1 min-h-[380px] ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
              
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-zinc-455 uppercase block">Visualisasi Reagen Hidrolisis P3</span>
                  <h4 className="text-sm font-bold text-white">
                    Tabung Uji {activeP3.name} - Hidroksida: <span className="text-emerald-450">{activeP3.formula}</span>
                  </h4>
                </div>

                <div className={`p-1 px-2.5 rounded border font-mono text-center ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                  <span className="text-[7.5px] text-zinc-550 block uppercase">KARAKTER ASLI</span>
                  <span className="text-[11px] font-extrabold text-cyan-405">{activeP3.character}</span>
                </div>
              </div>

              {/* Precipitation Test Tube Graphics render */}
              <div className="w-full h-44 relative flex items-center justify-center">
                
                {/* 3D Glass Tube wrapper representation */}
                <div className={`w-16 h-36 border-b-4 border-l-2 border-r-2 border-slate-600 rounded-b-2xl relative overflow-hidden flex flex-col justify-end ${theme === 'dark' ? 'bg-slate-900/10' : 'bg-slate-100/10'}`}>
                  
                  {/* Dynamic Fluid Content representing selected pH indicator color */}
                  <div className={`absolute bottom-0 inset-x-0 h-2/3 transition-colors duration-500 flex flex-col justify-center items-center ${
                    p3ActivePh < 4.0 
                      ? 'bg-rose-500/20' 
                      : p3ActivePh < 6.5 
                        ? 'bg-orange-400/25' 
                        : p3ActivePh < 8.5 
                          ? 'bg-emerald-400/20' 
                          : 'bg-blue-500/25'
                  }`}>
                    
                    {/* white gelatinous precipitate graphic with dynamic opacity */}
                    {activeP3.symbol === 'Al' && (
                      <motion.div 
                        animate={{ opacity: p3PrecipitateOpacity }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex flex-col items-center justify-center space-y-1 pointer-events-none"
                      >
                        <div className="w-4/5 h-10 bg-slate-100/55 rounded-full blur-[2px]" />
                        <div className="w-3/5 h-6 bg-slate-100/35 rounded-full blur-[3px]" />
                        <span className="text-[7px] font-mono text-slate-100 uppercase scale-90 font-bold tracking-tight">Al(OH)₃ Gel</span>
                      </motion.div>
                    )}

                    {activeP3.symbol === 'Mg' && (
                      <motion.div 
                        animate={{ opacity: p3PrecipitateOpacity }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex flex-col items-center justify-center space-y-1 pointer-events-none"
                      >
                        <div className="w-11/12 h-14 bg-zinc-350/50 rounded-lg blur-[2.5px]" />
                        <span className="text-[7.5px] font-mono text-zinc-300 uppercase font-black">Suspensi Mg(OH)₂</span>
                      </motion.div>
                    )}

                    {activeP3.symbol === 'Si' && (
                      <div className="w-full flex flex-col items-center justify-center space-y-1 pointer-events-none">
                        <div className="w-4/5 h-12 bg-slate-300/30 rounded blur-[3px] animate-pulse" />
                        <span className="text-[7px] font-mono text-zinc-450 uppercase">Gel Asam Silikat</span>
                      </div>
                    )}

                    {/* Highly clear soluble acids */}
                    {p3PrecipitateOpacity === 0 && (
                      <span className="text-[7px] font-mono text-blue-400 uppercase text-center select-none tracking-wider">
                        Ion Bening Terlarut
                      </span>
                    )}

                  </div>

                </div>

              </div>

              {/* Description Panel output */}
              <div className={`p-4 rounded-xl border space-y-2 text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <span className="text-[10px] text-zinc-550 uppercase font-extrabold block">Penjelasan Reaksi:</span>
                <p className="text-zinc-300 text-xs md:text-sm leading-relaxed">{activeP3.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[10.5px]">
                  <div className={`p-2 text-zinc-300 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="text-[8px] text-emerald-400 font-extrabold block">Reaksi Ditambahkan Asam (HCl):</span>
                    <p className="mt-0.5 truncate" title={activeP3.acidReaction}>{activeP3.acidReaction}</p>
                  </div>
                  <div className={`p-2 text-zinc-300 rounded border ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="text-[8px] text-cyan-400 font-extrabold block">Reaksi Ditambahkan Basa (NaOH):</span>
                    <p className="mt-0.5 truncate" title={activeP3.baseReaction}>{activeP3.baseReaction}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Full-Width Premium Period 3 Deeper Trend Board */}
          <div className={`lg:col-span-12 mt-6 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/60 border-slate-300'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase block">
                  Dasbor Analitis Kelas XII
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-500" />
                  Tren Sifat Periodik Mendalam &amp; Anomali Unsur Periode 3
                </h3>
                <p className="text-zinc-400 text-xs">
                  Analisis kuantitatif dari kiri ke kanan disertai alasan konfigurasi kestabilan s/p subkulit elektron.
                </p>
              </div>

              {/* Property Tabs selector */}
              <div className={`flex flex-wrap gap-1 p-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                {(['radius', 'ionization', 'electronAffinity', 'electronegativity'] as const).map((prop) => {
                  const propLabels: Record<string, string> = {
                    radius: '📐 Jari-jari',
                    ionization: '⚡ Ionisasi',
                    electronAffinity: '🧲 Afinitas e⁻',
                    electronegativity: '🔗 Elektronegatif'
                  };
                  return (
                    <button
                      key={prop}
                      onClick={() => setSelectedP3Property(prop)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedP3Property === prop
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {propLabels[prop]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom bar chart canvas */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              {/* Left Bar chart: 7 cols */}
              <div className={`xl:col-span-7 rounded-xl p-5 border space-y-4 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Grafik Perbandingan Kuantitatif:</span>
                
                <div className="space-y-3.5 pt-1">
                  {PERIOD3_DATA.map((element, idx) => {
                    const isSelected = idx === selectedP3Idx;

                    // Compute values and percentages pro-rated dynamically
                    let displayValue = '';
                    let percent = 0;
                    if (selectedP3Property === 'radius') {
                      displayValue = `${element.radius} pm`;
                      percent = (element.radius / 186) * 100;
                    } else if (selectedP3Property === 'ionization') {
                      displayValue = `${element.ionization} kJ/mol`;
                      percent = (element.ionization / 1251) * 100;
                    } else if (selectedP3Property === 'electronAffinity') {
                      displayValue = `${element.electronAffinity} kJ/mol`;
                      percent = (element.electronAffinity / 349) * 100;
                    } else {
                      displayValue = `${element.electronegativity.toFixed(2)}`;
                      percent = (element.electronegativity / 3.16) * 100;
                    }

                    // Theme Tailwind colors mapping
                    const colorPairs: Record<string, string> = {
                      cyan: 'bg-cyan-500/80 text-cyan-400 border border-cyan-500/30',
                      sky: 'bg-sky-500/80 text-sky-400 border border-sky-500/30',
                      emerald: 'bg-emerald-500/80 text-emerald-400 border border-emerald-500/30',
                      amber: 'bg-amber-500/80 text-amber-400 border border-amber-500/30',
                      orange: 'bg-orange-500/80 text-orange-400 border border-orange-500/30',
                      rose: 'bg-rose-500/80 text-rose-400 border border-rose-500/30',
                      purple: 'bg-purple-500/80 text-purple-400 border border-purple-500/30'
                    };

                    const barColor = colorPairs[element.themeColor] || 'bg-teal-500';

                    return (
                      <div 
                        key={element.symbol}
                        onClick={() => {
                          setSelectedP3Idx(idx);
                          setP3ActivePh(element.pH);
                          SynthSounds.playPipetteDrop();
                        }}
                        className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-slate-900 border border-slate-800' 
                            : 'border border-transparent hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Element Label */}
                        <div className="flex items-center gap-2.5 w-16 shrink-0">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-extrabold border ${
                            isSelected ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-zinc-400'
                          }`}>
                            {element.symbol}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">No.{11 + idx}</span>
                        </div>

                        {/* Comparative Bar filled */}
                        <div className={`flex-1 h-6 rounded-md overflow-hidden relative border ${theme === 'dark' ? 'bg-slate-900 border-slate-800/60' : 'bg-slate-100 border-slate-300'}`}>
                          {/* fill progress */}
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full opacity-80 ${barColor}`}
                          />
                          {/* Inner element name */}
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-zinc-300 font-bold uppercase drop-shadow">
                            {element.name}
                          </span>
                        </div>

                        {/* Numerical Value badge */}
                        <div className="w-24 text-right shrink-0">
                          <span className="font-mono text-xs font-black text-white">{displayValue}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right explanation + anomali details: 5 cols */}
              <div className="xl:col-span-5 flex flex-col gap-4">
                {/* Specific selected element property fact */}
                <div className={`p-5 rounded-xl border flex-1 space-y-4 ${theme === 'dark' ? 'bg-slate-950/90 border-slate-900' : 'bg-slate-100/90 border-slate-300'}`}>
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 rounded bg-emerald-950 border border-emerald-500/25 font-mono text-[11px] text-emerald-400 font-black">
                      {activeP3.symbol}
                    </span>
                    <div>
                      <strong className="text-white text-xs block uppercase font-bold">Fisika Unsur Terpilih: {activeP3.name}</strong>
                      <span className="text-[10px] text-zinc-500 block font-mono">Periode 3 Golongan {activeP3.symbol === 'Na' ? 'IA' : activeP3.symbol === 'Mg' ? 'IIA' : activeP3.symbol === 'Al' ? 'IIIA' : activeP3.symbol === 'Si' ? 'IVA' : activeP3.symbol === 'P' ? 'VA' : activeP3.symbol === 'S' ? 'VIA' : 'VIIA'}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-xs border-t border-slate-800/40">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'bg-slate-905 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                        <span className="text-[8px] text-zinc-500 uppercase block font-mono">Energi Ionisasi</span>
                        <strong className="text-amber-450 font-mono text-[12px]">{activeP3.ionization} kJ/mol</strong>
                      </div>
                      <div className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'bg-slate-905 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                        <span className="text-[8px] text-zinc-500 uppercase block font-mono">Afinitas Elektron</span>
                        <strong className="text-purple-400 font-mono text-[12px]">{activeP3.electronAffinity} kJ/mol</strong>
                      </div>
                    </div>

                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      Komposisi hibridisasi orbital valensi terluar dari unsur <strong>{activeP3.name}</strong> mencerminkan tingkat kemampuannya mengikat muatan negatif. Karakter hidroksida aslinya adalah <strong>{activeP3.character}</strong>.
                    </p>
                  </div>
                </div>

                {/* Anomalies Card - Incredibly important for Class XII syllabus! */}
                <div className={`p-5 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-slate-950/50 border-slate-905' : 'bg-slate-100/50 border-slate-300'}`}>
                  <h4 className="text-xs font-mono font-black text-rose-450 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-450 animate-pulse" />
                    Catatan Anomali Kelas XII
                  </h4>
                  
                  <div className="text-[11px] leading-relaxed text-zinc-400 space-y-2.5">
                    <p>
                      Meskipun secara umum dari kiri ke kanan (Na → Cl) energi ionisasi meningkat akibat tarikan inti yang makin kuat, terdapat <strong className="text-zinc-200">dua anomali penting</strong> yang sering muncul di ujian nasional:
                    </p>
                    <div className={`p-2.5 text-zinc-350 rounded-lg border space-y-1 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                      <strong className="text-amber-450 block text-[10.5px]">1. Anomali Energi Ionisasi Mg vs Al:</strong>
                      <p className="text-[10.5px]">
                        Energi ionisasi <strong>Mg ({PERIOD3_DATA[1].ionization} kJ)</strong> lebih tinggi dari <strong>Al ({PERIOD3_DATA[2].ionization} kJ)</strong>. Ini dikarenakan Mg memiliki konfigurasi terluar penuh <code className="text-emerald-400 font-mono">3s²</code> yang sangat stabil, sementara Al memiliki satu elektron sunyi berpereaksi longgar di orbital <code className="text-cyan-400 font-mono">3s² 3p¹</code> yang gampang diusir.
                      </p>
                    </div>
                    <div className={`p-2.5 text-zinc-350 rounded-lg border space-y-1 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
                      <strong className="text-fuchsia-400 block text-[10.5px]">2. Anomali Energi Ionisasi P vs S:</strong>
                      <p className="text-[10.5px]">
                        Energi ionisasi <strong>P ({PERIOD3_DATA[4].ionization} kJ)</strong> lebih tinggi daripada <strong>S ({PERIOD3_DATA[5].ionization} kJ)</strong>. Hal ini disebabkan konfigurasi orbital p fosforus adalah <code className="text-purple-400 font-mono">3p³</code> (setengah-penuh) yang menyebarkan kestabilan maksimal simetris, sedangkan S memiliki konfigurasi <code className="text-rose-400 font-mono">3p⁴</code> yang mengandung satu pasang elektron spin berpasangan berdesakan memicu gaya tolak-menolak mempergampang ionisasi pertama.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 3: HALOGEN DISPLACEMENT (GAS REDOX TREN)
          ========================================== */}
      {activeTab === 'halogen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Reagents selection and steps sidebar */}
          <div className={`lg:col-span-4 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase block">Sifat Keasaman oksidator Halogen</span>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <TestTube className="w-4 h-4 text-cyan-450" />
                Daftar Reagen Golongan 7A
              </h3>
              <p className="text-zinc-500 text-xs text-left">
                Reaksi pendesakan halogen didasarkan pada sifat mengoksidasi unsur gas halogen bebas di bagian atas ketiak desak unsur di bawahnya.
              </p>
            </div>

            {/* Stepper 1 - Select element halogen */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase font-black block">1. Pilih Larutan Halogen Bebas (Pipet):</span>
              <div className="grid grid-cols-3 gap-2">
                {(['Cl₂', 'Br₂', 'I₂'] as const).map((hal) => {
                  const isSelect = chosenHalogen === hal;
                  return (
                    <button
                      key={hal}
                      onClick={() => {
                        setChosenHalogen(hal);
                        resetHalogenEksperimen();
                        SynthSounds.playPipetteDrop();
                      }}
                      className={`p-2 font-mono text-xs font-black rounded-xl text-center border transition-all cursor-pointer ${
                        isSelect 
                          ? 'border-yellow-500 bg-yellow-950/20 text-yellow-405' 
                          : 'border-slate-800 bg-slate-900/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {hal === 'Cl₂' ? '💨 Gas Cl₂' : hal === 'Br₂' ? '🧪 Cair Br₂' : '🔬 Krist I₂'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper 2 - Select halide salt */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase font-black block">2. Larutan Halida (Garam Tabung):</span>
              <div className="grid grid-cols-4 gap-2">
                {(['KF', 'KCl', 'KBr', 'KI'] as const).map((salt) => {
                  const isSelect = chosenHalide === salt;
                  return (
                    <button
                      key={salt}
                      onClick={() => {
                        setChosenHalide(salt);
                        resetHalogenEksperimen();
                        SynthSounds.playPipetteDrop();
                      }}
                      className={`p-1.5 font-mono text-xs font-black rounded-lg text-center border transition-all cursor-pointer ${
                        isSelect 
                          ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400' 
                          : 'border-slate-800 bg-slate-900/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {salt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step triggers panel */}
            <div className={`p-4 border rounded-xl space-y-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
              <span className="text-[9px] font-mono text-zinc-550 block font-black uppercase">ALUR EKSPERIMENT:</span>
              
              <div className="flex flex-col gap-2">
                {/* Dripping button */}
                <button
                  onClick={triggerDropperPipet}
                  disabled={halogenStep !== 'empty'}
                  className={`w-full py-2.5 font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    halogenStep === 'empty'
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  1. Ambil Pipet &amp; Teteskan
                </button>

                {/* Shaking button */}
                <button
                  onClick={triggerShakeSimulation}
                  disabled={halogenStep !== 'unmixed'}
                  className={`w-full py-2.5 font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    halogenStep === 'unmixed'
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black animate-pulse'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  2. Kocok Tabung Reaksi
                </button>
              </div>

              <button
                onClick={resetHalogenEksperimen}
                className={`w-full py-1.5 hover:bg-slate-800 font-mono text-[9px] uppercase tracking-widest rounded border cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-zinc-400 border-slate-850' : 'bg-slate-100 text-slate-600 border-slate-300'}`}
              >
                Reset Tabung
              </button>
            </div>

          </div>

          {/* Test Tube layer outputs */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            <div className={`border rounded-2xl p-5 flex flex-col justify-between space-y-6 flex-1 min-h-[380px] ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
              
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-zinc-450 uppercase block">Proses Pemisahan Fase Cair-Cair</span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-405" />
                    Pendesakan Halogen: {chosenHalogen} + {chosenHalide}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[8.5px] text-zinc-500 block uppercase font-mono">REAKSI REDOKS:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                    isSpontaneous 
                      ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/30' 
                      : 'bg-rose-500/10 text-rose-455 border border-rose-500/30'
                  }`}>
                    {isSpontaneous ? '⚡ SPONTAN (REAKTIF)' : '✗ TIDAK SPONTAN'}
                  </span>
                </div>
              </div>

              {/* Realistic extraction phase layers simulation */}
              <div className="w-full h-44 relative flex items-center justify-center">
                
                {/* Pipet dropping visual animation */}
                {halogenStep === 'dripping' && (
                  <motion.div 
                    initial={{ y: -80, opacity: 1 }}
                    animate={{ y: 20, opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute z-20 w-1.5 h-10 bg-yellow-405 rounded-full pointer-events-none"
                  />
                )}

                {/* Shaking vibration wrapper */}
                <motion.div
                  animate={halogenStep === 'shaking' ? {
                    x: [-4, 4, -4, 4, -2, 2, 0],
                    y: [-4, 4, -4, 4, -2, 2, 0],
                    rotate: [-3, 3, -3, 3, 0]
                  } : {}}
                  transition={{ repeat: halogenStep === 'shaking' ? 4 : 0, duration: 0.4 }}
                  className={`w-16 h-36 border-b-4 border-l-2 border-r-2 border-slate-650 rounded-b-2xl relative overflow-hidden flex flex-col justify-end ${theme === 'dark' ? 'bg-slate-900/10' : 'bg-slate-100/10'}`}
                >
                  {/* Phase 1: Hexane layer (Top Layer) - Extracts element color */}
                  <div className={`absolute top-1/4 inset-x-0 h-1/3 transition-colors duration-1000 z-10 border-b border-dashed border-slate-500/40 flex items-center justify-center ${getOrganicLayerColor()}`}>
                    <span className="text-[7.5px] font-mono text-zinc-200 select-none uppercase font-bold text-center px-1">
                      {halogenStep === 'shaking' ? '🔀 EKSTRAKSI...' : 'Heksana (Org)'}
                    </span>
                  </div>

                  {/* Phase 2: Aqueous layer (Bottom Layer) - Metal halide salts */}
                  <div className="absolute top-[58%] bottom-0 inset-x-0 bg-sky-200/15 flex items-end justify-center pb-2 select-none">
                    <span className="text-[7.5px] font-mono text-zinc-500 font-bold uppercase">Garam (Aq)</span>
                  </div>

                </motion.div>

              </div>

              {/* Chemical action ledger */}
              <div className={`p-4 rounded-xl border space-y-2 text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <span className="text-[10px] text-zinc-550 uppercase font-extrabold block">Hasil Analisis Reaksi Tabung:</span>
                <div className="max-h-[80px] overflow-y-auto space-y-1 font-mono pr-1 text-left">
                  {halogenLogs.map((log, lIdx) => (
                    <div 
                      key={lIdx} 
                      className={`text-[11px] leading-relaxed ${
                        log.startsWith('[BERHASIL') ? 'text-emerald-400 font-bold' : log.startsWith('[Gagal') ? 'text-rose-455' : 'text-zinc-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 4: PARAMAGNETIC GOUY BALANCE PERIOD 4
          ========================================== */}
      {activeTab === 'transition' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Transition Metals selection Grid */}
          <div className={`lg:col-span-5 border rounded-2xl p-5 md:p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-805' : 'bg-slate-100/40 border-slate-300'}`}>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-405 font-extrabold uppercase block font-mono">Orbital Blok-d Transisi P4</span>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Magnet className="w-4 h-4 text-cyan-405" />
                Daftar Unsur Blok-d P4
              </h3>
              <p className="text-zinc-500 text-xs">
                Logam transisi menunjukkan sifat kemagnetan paramagnetik akibat kelimpahan spin elektron tak berpasangan pada subkulit d.
              </p>
            </div>

            {/* Elements selector cards */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1">
              {TRANSITION_METALS_DATA.map((tm, idx) => {
                const isSelect = idx === selectedTmIdx;
                return (
                  <button
                    key={tm.symbol}
                    onClick={() => {
                      setSelectedTmIdx(idx);
                      SynthSounds.playPipetteDrop();
                    }}
                    className={`p-2 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelect 
                        ? 'border-cyan-500 bg-cyan-950/20 text-white' 
                        : 'border-slate-850 bg-slate-900/25 text-zinc-400 hover:border-slate-705'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <strong className="font-mono text-base text-teal-400">{tm.symbol}</strong>
                      <span className="text-[9px] font-mono text-zinc-500">{tm.ionSymbol}</span>
                    </div>
                    <span className="text-[11px] font-bold block truncate leading-snug">{tm.name}</span>
                    <span className="text-[9px] font-mono text-zinc-555 block leading-none">Spin Unpaired: {tm.unpairedElectrons}</span>
                  </button>
                );
              })}
            </div>

            {/* Oxidation State Selector Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase font-black block">Bilangan Oksidasi Spesifik Ion (Siswa XII):</span>
              <div className="grid grid-cols-2 gap-2">
                {availableOxStates.map((state, idx) => {
                  const isSelect = idx === activeOxStateIdx;
                  return (
                    <button
                      key={state.stateLabel}
                      onClick={() => {
                        setActiveOxStateIdx(idx);
                        SynthSounds.playPipetteDrop();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[64px] cursor-pointer ${
                        isSelect 
                          ? 'border-yellow-500 bg-yellow-950/20 text-white' 
                          : 'border-slate-850 bg-slate-900/30 text-zinc-500 hover:text-zinc-350 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <strong className="font-mono text-sm leading-none text-yellow-500">{state.stateLabel}</strong>
                        <span className="text-[7.5px] font-mono font-bold uppercase text-zinc-500">{state.dElectronsCount >= 10 ? 'd¹⁰' : `d${state.dElectronsCount}`}</span>
                      </div>
                      <span className="text-[9.5px] font-mono text-zinc-300 block whitespace-nowrap overflow-hidden text-ellipsis">{state.colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gouy magnetic field controls slider */}
            <div className={`p-4 border rounded-xl space-y-3.5 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-400 uppercase font-black">Intensitas Magnet Listrik:</span>
                <span className="text-xs font-mono text-cyan-455 font-bold">
                  {magnetStrength}% {magnetStrength === 0 ? '(Kumparan Mati)' : '(Medan Aktif)'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={magnetStrength}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMagnetStrength(val);
                  if (val > 0) {
                    // Play a laboratory hum that gets slightly higher in pitch as power increases
                    SynthSounds.playMagnetHum(60 + val * 0.8);
                  } else {
                    SynthSounds.playTick();
                  }
                }}
                className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    setMagnetStrength(100);
                    SynthSounds.playMagnetHum(140);
                  }} 
                  className="py-1.5 bg-cyan-950/20 text-cyan-455 font-mono text-[9px] border border-cyan-900/40 uppercase rounded"
                >
                  Nyalakan Medan
                </button>
                <button 
                  onClick={() => {
                    setMagnetStrength(0);
                    SynthSounds.playTick();
                  }} 
                  className={`py-1.5 font-mono text-[9px] border uppercase rounded ${theme === 'dark' ? 'bg-slate-900 text-zinc-500 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-300'}`}
                >
                  Matikan Medan
                </button>
              </div>
            </div>

          </div>

          {/* Gouy Digital Weighing Balance display and d-orbital diagram */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className={`border rounded-2xl p-5 flex flex-col justify-between space-y-6 flex-1 min-h-[380px] ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
              
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-zinc-450 uppercase block">Gouy Balance Electromagnet Simulator</span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-455 animate-pulse" />
                    Warna Ion Hidro-Kompleks ({activeOxState.ionSymbol}): <span className="text-teal-400 font-extrabold">{activeOxState.colorName}</span>
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[8px] text-zinc-500 block uppercase font-mono">Kemagnetan:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                    activeOxState.paramagnetic 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {activeOxState.paramagnetic ? 'Paramagnetik' : 'Diamagnetik'}
                  </span>
                </div>
              </div>

              {/* Gouy Physical Layout: scale, vial bottle and electromagnetic coils */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 items-stretch">
                
                {/* 1. Digital weigh scale display panel */}
                <div className={`md:col-span-5 flex flex-col justify-center items-center p-4 rounded-xl border text-center space-y-3 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
                  <span className="text-[9px] font-mono text-zinc-550 block font-black uppercase leading-none">NERACA GOUY DIGITAL (GRAM):</span>
                  
                  {/* Scale LCD display screen */}
                  <div className="p-3 bg-zinc-950 rounded-xl border border-teal-950 w-full font-mono text-xl text-teal-400 font-black tracking-widest shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-teal-500/3 opacity-5 pointer-events-none" />
                    {getSimulatedWeight()} g
                  </div>

                  <span className="text-[10px] text-zinc-500 leading-normal text-left">
                    {magnetStrength > 0 && activeOxState.paramagnetic ? (
                      <>Ion terlepas memiliki spin d bebas ({activeOxState.unpairedElectrons} elektron tak berpasangan) terpikat kuat, menarik wadah ke bawah yang <strong>menambah bobot</strong> registers pada sediaan.</>
                    ) : magnetStrength > 0 ? (
                      <>Ion diamagnetik bersubkulit d jenuh/kosong ({activeOxState.unpairedElectrons} elektron tak berpasangan), memberikan gaya tolak mikroskopis sangat tipis yang mereduksi bobot.</>
                    ) : (
                      <>Keadaan timbangan netral. Tanpa medan induksi elektromagnetik luar.</>
                    )}
                  </span>
                </div>

                {/* 2. Physical electromagnet representation and vial container */}
                <div className="md:col-span-7 flex items-center justify-center relative min-h-[200px] border-l border-slate-900/40 md:pl-4 overflow-hidden">
                  
                  {/* Coils wrapper */}
                  <div className="absolute right-1 w-14 h-full flex flex-col justify-between items-center py-6">
                    <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center font-mono font-black text-xs text-zinc-400 border border-slate-700">N</div>
                    <div className="h-full w-1 border-r border-dashed border-red-500/30" />
                    <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center font-mono font-black text-xs text-zinc-400 border border-slate-700">S</div>
                  </div>

                  {/* Vial test tube with compound */}
                  <motion.div
                    animate={
                      magnetStrength > 0 && activeOxState.paramagnetic
                        ? { y: 15, rotate: 2, scaleY: 1.01 }
                        : { y: 0, rotate: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 80 }}
                    className={`w-10 h-28 border-b-4 border-l-2 border-r-2 border-slate-650 rounded-b-xl relative flex flex-col justify-end overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-100/40'}`}
                  >
                    <div className={`absolute bottom-0 inset-x-0 h-4/5 ${activeOxState.aqueousColor} flex items-center justify-center z-10 transition-all duration-500`}>
                      <span className="text-[10px] font-mono font-black text-white/90 drop-shadow-md text-center leading-tight">
                        {activeOxState.ionSymbol}
                      </span>
                    </div>
                  </motion.div>

                  {/* Spectral emission flare on match */}
                  {ddTransitionColor && (
                    <motion.div 
                      initial={{ scale: 0.1, opacity: 0 }}
                      animate={{ scale: [1, 2, 0], opacity: [0.8, 0.4, 0] }}
                      transition={{ duration: 1.2 }}
                      className={`absolute w-36 h-36 rounded-full blur-xl pointer-events-none -z-10 ${ddTransitionColor}`}
                    />
                  )}

                  {/* Live magnetic wave visual dashes */}
                  {magnetStrength > 0 && activeOxState.paramagnetic && (
                    <div className="absolute right-12 w-6 h-20 flex flex-col justify-between pointer-events-none">
                      <span className="h-0.5 bg-gradient-to-r from-teal-400 to-transparent animate-ping" />
                      <span className="h-0.5 bg-gradient-to-r from-rose-455 to-transparent animate-pulse" />
                      <span className="h-0.5 bg-gradient-to-r from-orange-400 to-transparent animate-ping" style={{ animationDelay: '0.3s' }} />
                    </div>
                  )}
                </div>

              </div>

              {/* Interactive Scientific d-Electrons Hund's Rule Splitting Diagram */}
              <div className={`p-4 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] text-teal-400 font-extrabold uppercase block font-mono">Diagram Pemisahan Orbital d (Crystal Field Splitting)</span>
                    <p className="text-[11px] text-zinc-500 font-sans">
                      Dua tingkat energi: <strong>e_g</strong> (atas, repulsion tinggi) dan <strong>t_2g</strong> (bawah, repulsion rendah).
                    </p>
                  </div>

                  <button
                    onClick={triggerPhotonLaser}
                    disabled={photonGunActive}
                    className="p-1 px-3 bg-indigo-950/70 hover:bg-indigo-900/70 text-indigo-405 border border-indigo-500/25 text-[10px] font-mono font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    🚀 Tembak Laser Spektroskopi
                  </button>
                </div>

                {/* Crystal field diagram with spins */}
                <div className={`p-3 rounded-lg space-y-6 relative border text-center font-mono select-none ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                  
                  {/* Energy bar scale */}
                  <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-slate-800 flex flex-col justify-between text-[7px] text-zinc-555">
                    <span>E_g (+)</span>
                    <span>t_2g (-)</span>
                  </div>

                  {/* 1. Upper orbital level: e_g (2 degenerate orbitals) */}
                  <div className="flex justify-center items-center gap-4">
                    <span className="text-[9px] text-zinc-500 font-black uppercase w-8 text-right">e_g:</span>
                    <div className="flex gap-2">
                      {Array.from({ length: 2 }).map((_, oIdx) => {
                        // Total d electrons in eg depend on electronic setup
                        // e.g. for high-spin d5: Mn2+, Fe3+ has 2 electrons in eg (1 in each)
                        let arrows = '';
                        const dC = activeTm.dElectronsCount;
                        if (dC === 5 || dC === 6) arrows = '↑';
                        else if (dC === 7) {
                          arrows = oIdx === 0 ? '↑' : '↑';
                        } else if (dC === 8) {
                          arrows = '↑';
                        } else if (dC === 9) {
                          arrows = oIdx === 0 ? '↑↓' : '↑';
                        } else if (dC === 10) {
                          arrows = '↑↓';
                        }

                        return (
                          <div key={oIdx} className={`w-10 h-10 border border-slate-700 rounded flex items-center justify-center font-extrabold text-sm text-cyan-405 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                            {arrows}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Lower orbital level: t_2g (3 degenerate orbitals) */}
                  <div className="flex justify-center items-center gap-4">
                    <span className="text-[9px] text-zinc-500 font-black uppercase w-8 text-right">t_2g:</span>
                    <div className="flex gap-2">
                      {Array.from({ length: 3 }).map((_, oIdx) => {
                        let arrows = '';
                        const dC = activeTm.dElectronsCount;
                        if (dC === 1) arrows = oIdx === 0 ? '↑' : '';
                        else if (dC === 2) arrows = oIdx <= 1 ? '↑' : '';
                        else if (dC === 3 || dC === 4 || dC === 5) arrows = '↑';
                        else if (dC === 6) {
                          arrows = oIdx === 0 ? '↑↓' : '↑';
                        } else if (dC === 7) {
                          arrows = oIdx <= 1 ? '↑↓' : '↑';
                        } else if (dC === 8 || dC === 9 || dC === 10) {
                          arrows = '↑↓';
                        }

                        return (
                          <div key={oIdx} className={`w-10 h-10 border border-slate-700 rounded flex items-center justify-center font-extrabold text-sm text-emerald-400 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                            {arrows}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <div className={`p-3 rounded-lg text-zinc-350 text-xs text-left grid grid-cols-2 gap-3 leading-normal font-sans ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  <div>
                    <span className="text-zinc-550 font-mono text-[9px] uppercase block">Konfigurasi Elektron Ion ({activeOxState.ionSymbol}):</span>
                    <strong className="text-white font-mono text-xs">{activeOxState.configuration}</strong>
                    <span className="text-zinc-400 font-sans text-[11px] block leading-relaxed mt-1">
                      {activeOxState.desc}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-550 font-mono text-[9px] uppercase block">Aplikasi Lapangan Unsur:</span>
                    <p className="text-zinc-400 font-sans text-[11px] leading-relaxed mt-0.5">{activeTm.applications}</p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 5: HIGH-SCHOOL CHEMISTRY ASSESSMENT QUIZ
          ========================================== */}
      {activeTab === 'quiz' && (
        <div className="max-w-3xl mx-auto">
          {!isQuizComplete ? (
            <div className={`border rounded-2xl p-6 md:p-8 space-y-6 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
              
              {/* Quiz progress */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase block">UJI ASESMEN {quizIndex + 1} DARI {QUIZ_DATA.length}</span>
                  <h3 className="text-base font-bold text-white">Evaluasi Mandiri Reaktivitas Unsur</h3>
                </div>

                <div className="text-right">
                  <span className="text-[8px] font-mono text-zinc-555 block leading-none">NILAI KELAS</span>
                  <strong className="text-emerald-400 font-mono font-black text-lg">{quizScore} / 100</strong>
                </div>
              </div>

              {/* Progress bar */}
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${((quizIndex + 1) / QUIZ_DATA.length) * 100}%` }}
                />
              </div>

              {/* Question statement card */}
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <h4 className="text-sm md:text-base font-bold text-zinc-105 leading-relaxed font-sans">
                  {activeQuestion.question}
                </h4>
              </div>

              {/* Options selection stack */}
              <div className="space-y-2.5">
                {activeQuestion.options.map((opt, oIdx) => {
                  const isSelect = selectedOption === oIdx;
                  
                  let optStyle = 'border-slate-805 bg-slate-900/20 text-zinc-300 hover:border-slate-700 hover:bg-slate-900/40';
                  if (isSelect && !isAnswerApplied) {
                    optStyle = 'border-cyan-500 bg-cyan-950/35 text-cyan-400 font-bold';
                  } else if (isAnswerApplied) {
                    if (oIdx === activeQuestion.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-400 font-extrabold';
                    } else if (isSelect) {
                      optStyle = 'border-rose-500 bg-rose-955/20 text-rose-455';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => {
                        if (isAnswerApplied) return;
                        setSelectedOption(oIdx);
                      }}
                      disabled={isAnswerApplied}
                      className={`w-full p-3.5 text-left rounded-xl border text-xs md:text-sm font-sans transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswerApplied && oIdx === activeQuestion.correctIndex && <Check className="w-4 h-4 text-emerald-400" />}
                      {isAnswerApplied && isSelect && oIdx !== activeQuestion.correctIndex && <X className="w-4 h-4 text-rose-455" />}
                    </button>
                  );
                })}
              </div>

              {/* Real-time expert chemistry guide feedback */}
              {isAnswerApplied && (
                <div className={`p-4 rounded-xl border space-y-1 text-xs ${theme === 'dark' ? 'bg-slate-955 border-slate-905' : 'bg-slate-100 border-slate-300'}`}>
                  <span className="text-[9px] font-mono text-cyan-400 font-extrabold block uppercase">SOLUSI &amp; MEKANISME KIMIA:</span>
                  <p className="text-zinc-300 leading-relaxed font-sans text-xs md:text-sm">{activeQuestion.feedback}</p>
                </div>
              )}

              {/* Quiz navigation bar */}
              <div className="flex justify-end pt-2">
                {!isAnswerApplied ? (
                  <button
                    onClick={handleApplyQuizAnswer}
                    disabled={selectedOption === null}
                    className={`px-6 py-2.5 font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer font-bold ${
                      selectedOption === null 
                        ? 'bg-zinc-800 text-zinc-600 border border-slate-900 cursor-not-allowed'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-600 shadow-md'
                    }`}
                  >
                    Kunci Jawaban
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-md font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {quizIndex === QUIZ_DATA.length - 1 ? 'Selesaikan Ujian' : 'Maju Selanjutnya'}
                    <ChevronRight className="w-4.5 h-4.5 text-slate-950" />
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className={`border rounded-2xl p-6 md:p-8 text-center max-w-md mx-auto space-y-6 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/40 border-slate-300'}`}>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <Award className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Sertifikat Asesmen Mandiri!</h3>
                <p className="text-zinc-400 text-xs">
                  Anda telah menyelesaikan simulasi komparasi sediaan golongan alkali 1A/2A, amfoter, pendesakan fasa halogen, &amp; magnetic balance.
                </p>
              </div>

              <div className={`p-4 rounded-xl border font-mono ${theme === 'dark' ? 'bg-slate-955 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                <span className="text-[10px] text-zinc-500 block uppercase">NILAI AKHIR:</span>
                <strong className={`text-3.5xl font-black block mt-1.5 ${quizScore >= 80 ? 'text-emerald-450' : quizScore >= 50 ? 'text-amber-500' : 'text-rose-455'}`}>
                  {quizScore} %
                </strong>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1 px-2 select-none">
                  {quizScore >= 80 ? '✓ Sangat Baik! Pemahaman Anda tentang reaktivitas & warna ion sangat tangguh.' : 'Silakan mengulangi sediaan kimia kembali.'}
                </p>
              </div>

              <button
                onClick={resetQuizEvaluasi}
                className={`w-full py-2.5 hover:bg-slate-800 border text-zinc-300 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}
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
