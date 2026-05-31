/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  FlaskConical, 
  HelpCircle, 
  RotateCw, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw, 
  Play, 
  Flame, 
  Info, 
  Award,
  ChevronRight,
  TrendingDown,
  Wind,
  Droplet,
  Shuffle,
  Activity,
  Plus,
  Trash2,
  Sliders,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// DATA DEFINITIONS & SCHEMAS (INDONESIAN)
// ==========================================

export interface MacromoleculeClass {
  id: string;
  name: string;
  chemicalFormula: string;
  description: string;
  buildingBlock: string;
  linkageType: string;
  everydayUses: string[];
}

export const MACROMOLECULE_TYPES: MacromoleculeClass[] = [
  {
    id: 'carbohydrate',
    name: 'Karbohidrat (Sakarida)',
    chemicalFormula: '(CH₂O)_n',
    description: 'Sumber energi utama tubuh. Terdiri dari unsur C, H, dan O dengan perbandingan atom H:O = 2:1. Berperan juga sebagai komponen struktural sel.',
    buildingBlock: 'Monosakarida (seperti Glukosa, Fruktosa, Galaktosa)',
    linkageType: 'Ikatan Glikosidik',
    everydayUses: ['Nasi & Gandum (Tepung/Pati)', 'Gula Tebu (Sukrosa)', 'Serat Kapas (Selulosa)', 'Gula Susu (Laktosa)']
  },
  {
    id: 'protein',
    name: 'Protein (Polipeptida)',
    chemicalFormula: 'Kopolimer Asam Amino',
    description: 'Biomolekul kompleks penyusun struktur tubuh, katalis enzimatik, antibodi, dan sistem transportasi seluler. Memiliki rantai samping R penentu sifat keasaman/kepolaran.',
    buildingBlock: 'Asam Amino (memiliki gugus amina -NH₂ dan asam karboksilat -COOH)',
    linkageType: 'Ikatan Peptida (Amida)',
    everydayUses: ['Katalis Biologi (Enzim & Hormon)', 'Daging, Telur & Tahu (Nutrisi)', 'Katin & Kolagen (Kuku & Kulit)', 'Sutra & Wol (Tekstil)']
  },
  {
    id: 'lipid',
    name: 'Lipid (Lemak & Minyak)',
    chemicalFormula: 'Trigliserida (Ester Gliserol)',
    description: 'Senyawa hidrofobik penyimpan cadangan energi efisien tinggi, isolasi termal, penyusun membran sel (fosfolipid), dan hormon steroid.',
    buildingBlock: 'Asam Lemak & Gliserol',
    linkageType: 'Ikatan Ester (Esterifikasi)',
    everydayUses: ['Minyak Goreng & Mentega', 'Membran Fosfolipid Sel', 'Lilin Pelindung Daun', 'Hormon Steroid & Kolesterol']
  },
  {
    id: 'polymer',
    name: 'Polimer Sintesis (Plastik & Serat)',
    chemicalFormula: '-(Monomer)_n-',
    description: 'Makromolekul rantai panjang buatan manusia yang dibentuk melalui reaksi polimerisasi rantai pendek (monomer). Menentukan era industri modern.',
    buildingBlock: 'Monomer Alkena / Gugus Multifungsional',
    linkageType: 'Ikatan Karbon-Karbon / Ester / Amida',
    everydayUses: ['Kantong Plastik (Polietilena)', 'Pipa PVC (Polivinil Klorida)', 'Wadah Styrofoam (Polistirena)', 'Serat Pakaian (Nilon & Dakron)']
  }
];

// Reagent Identification Tests database
export interface IdentificationTest {
  id: string;
  name: string;
  indicator: string;
  positiveObservation: string;
  targetFunctionalGroup: string;
}

const CARB_TESTS: IdentificationTest[] = [
  { id: 'molisch', name: 'Uji Molisch', indicator: 'Alfa-naftol + H₂SO₄ pekat', positiveObservation: 'Terbentuk cincin ungu di batas larutan', targetFunctionalGroup: 'Karbohidrat secara umum (semua golongan)' },
  { id: 'benedict', name: 'Uji Benedict / Fehling', indicator: 'Reagen Tembaga(II) Kompleks Kupri', positiveObservation: 'Larutan biru berubah mjd endapan merah bata (Cu₂O)', targetFunctionalGroup: 'Gula pereduksi (Glukosa, Fruktosa, Laktosa, Maltosa; Sukrosa negatif)' },
  { id: 'seliwanoff', name: 'Uji Seliwanoff', indicator: 'Resorsinol + HCl pekat', positiveObservation: 'Larutan berwarna merah cerah (merah ceri) cepat', targetFunctionalGroup: 'Gugus Ketosa (Fruktosa; sedangkan Aldosa rambat/negatif)' },
  { id: 'iodine', name: 'Uji Iodium (Iod)', indicator: 'Larutan Kalium Iodida (I₂ / KI)', positiveObservation: 'Larutan berubah warna menjadi Biru-Tua / Ungu pekat', targetFunctionalGroup: 'Polisakarida Amilum (Pati). Selulosa memberikan warna cokelat.' }
];

const PROTEIN_TESTS: IdentificationTest[] = [
  { id: 'biuret', name: 'Uji Biuret', indicator: 'Larutan CuSO₄ encer + NaOH kuat', positiveObservation: 'Perubahan warna larutan menjadi Ungu / Violet pekat', targetFunctionalGroup: 'Keberadaan ikatan peptida (minimal dua ikatan peptida)' },
  { id: 'ninhydrin', name: 'Uji Ninhidrin', indicator: 'Larutan Triketohidrindena Hidrat', positiveObservation: 'Warna biru kemerahan / ungu (Ruhemann\'s purple)', targetFunctionalGroup: 'Gugus asam amino bebas (alfa-asam amino)' },
  { id: 'xanthoproteic', name: 'Uji Xantoproteat', indicator: 'HNO₃ pekat + pemanasan + NaOH', positiveObservation: 'Terbentuk warna kuning tua / jingga setelah basa', targetFunctionalGroup: 'Asam amino dengan cincin benzena (Tirosin, Triptofan, Fenilalanin)' },
  { id: 'lead_acetate', name: 'Uji Timbal(II) Asetat', indicator: 'NaOH + Pb(CH₃COO)₂ + pemanasan', positiveObservation: 'Terbentuk endapan hitam Timbal Sulfida (PbS)', targetFunctionalGroup: 'Asam amino pengikat belerang / sulfur (Sistein, Metionin)' }
];

const LIPID_TESTS: IdentificationTest[] = [
  { id: 'solubility', name: 'Uji Kelarutan', indicator: 'Air vs Kloroform / Heksana', positiveObservation: 'Fasa terpisah di air, larut merata di pelarut nonpolar', targetFunctionalGroup: 'Karakter hidrofobik rantai asam lemak panjang' },
  { id: 'acrolein', name: 'Uji Akrolein', indicator: 'Pemanasan KHSO₄ anhidrat', positiveObservation: 'Bau menusuk tajam merusak mata akibat akrolein volatil', targetFunctionalGroup: 'Keberadaan gliserol bebas atau terikat (dalam minyak/lemak)' },
  { id: 'unsaturation', name: 'Uji Ketidakjenuhan', indicator: 'Air Bromin / Air Iodium', positiveObservation: 'Hilangnya warna kuning air iodium secara cepat', targetFunctionalGroup: 'Adanya ikatan rangkap dua karbon (Asam lemak tidak jenuh)' }
];

export default function MacromoleculeLab() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'simulators' | 'quiz'>('explorer');

  // ==========================================
// 1. EXPLORER WORKSPACE STATE
// ==========================================
  const [selectedClassId, setSelectedClassId] = useState<string>('carbohydrate');
  const [carbSubclass, setCarbSubclass] = useState<'mono' | 'di' | 'poly'>('mono');
  
  // Zwitterion simulation states (under Protein Explorer)
  const [pHValue, setPHValue] = useState<number>(7.0);

  // Polymer Assembler game states (under Polymer Explorer)
  const [polymerMonomer, setPolymerMonomer] = useState<'etena' | 'vinil' | 'stirena'>('etena');
  const [polymerChain, setPolymerChain] = useState<string[]>([]);
  const [reactionLog, setReactionLog] = useState<string[]>([]);

  const activeClass = MACROMOLECULE_TYPES.find(c => c.id === selectedClassId) || MACROMOLECULE_TYPES[0];

  // ==========================================
// 2. SIMULATORS WORKSPACE STATE
// ==========================================
  const [selectedSim, setSelectedSim] = useState<'reagent' | 'saponification'>('reagent');
  
  // Reagent Simulator State
  const [reagentCategory, setReagentCategory] = useState<'carb' | 'protein' | 'lipid'>('carb');
  const [selectedSample, setSelectedSample] = useState<string>('glukosa');
  const [selectedReagent, setSelectedReagent] = useState<string>('benedict');
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [reagentResultState, setReagentResultState] = useState<'empty' | 'added' | 'heated'>('empty');
  const [reagentStatusText, setReagentStatusText] = useState<string>('Tabung reaksi kosong. Masukkan sampel dan reagen indikator.');

  // Saponification Simulator State
  const [sapFatType, setSapFatType] = useState<'triolein' | 'tristearin'>('triolein');
  const [sapBase, setSapBase] = useState<'naoh' | 'koh'>('naoh');
  const [sapStep, setSapStep] = useState<number>(0); // 0=idle, 1=mixing, 2=complete
  const [sapProgress, setSapProgress] = useState<number>(0);

  // ==========================================
// 3. QUIZ WORKSPACE STATE
// ==========================================
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuizQIdx, setCurrentQuizQIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  // Update dynamic sample selection lists based on reagentCategory
  useEffect(() => {
    if (reagentCategory === 'carb') {
      setSelectedSample('glukosa');
      setSelectedReagent('benedict');
    } else if (reagentCategory === 'protein') {
      setSelectedSample('putih_telur');
      setSelectedReagent('biuret');
    } else {
      setSelectedSample('minyak_kelapa');
      setSelectedReagent('unsaturation');
    }
    resetReagentTube();
  }, [reagentCategory]);

  const resetReagentTube = () => {
    setIsPouring(false);
    setIsHeating(false);
    setReagentResultState('empty');
    setReagentStatusText('Tabung reaksi siap. Tambahkan sampel dan teteskan reagen indikator pencari indikasi.');
  };

  // Polymer assembly handlers
  const handleAddMonomer = () => {
    const unitName = polymerMonomer === 'etena' ? 'Etilena' : polymerMonomer === 'vinil' ? 'VinilKlorida' : 'Stirena';
    const updated = [...polymerChain, unitName];
    setPolymerChain(updated);
    setReactionLog(prev => [`Aditisi monomer [C=C] ${unitName} ke dalam ujung radikal rantai aktif.`, ...prev]);

    if (updated.length === 5) {
      const polymerName = polymerMonomer === 'etena' ? 'Polietilena (PE)' : polymerMonomer === 'vinil' ? 'Polivinil Klorida (PVC)' : 'Polistirena (PS)';
      setReactionLog(prev => [`🎉 SUKSES: Terbentuk polimer rantai jenuh ${polymerName} berkarakter termoplastik!`, ...prev]);
      
      // Dispatch telemetry log
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'simulation_run',
          title: 'Polimerisasi Karbon',
          description: `Mensimulasikan sintesis polimer adisi ${polymerName} berkarbon panjang`,
          score: { earned: 5, total: 5 }
        }
      }));
    }
  };

  const handleClearPolymer = () => {
    setPolymerChain([]);
    setReactionLog([]);
  };

  // Saponification Reasearch Handler
  const handleTriggerSaponification = () => {
    setSapStep(1);
    setSapProgress(1);

    const interval = setInterval(() => {
      setSapProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSapStep(2);
          
          const fatName = sapFatType === 'triolein' ? 'Gliseril Trioleat (Minyak Cair/Cair)' : 'Gliseril Tristearat (Lemak Solid/Sapi)';
          const baseName = sapBase === 'naoh' ? 'Natrium Hidroksida (NaOH - Sabun Keras)' : 'Kalium Hidroksida (KOH - Sabun Cair/Lembek)';
          const productSabun = sapFatType === 'triolein' 
            ? (sapBase === 'naoh' ? 'Natrium Oleat (Keras)' : 'Kalium Oleat (Lunak)')
            : (sapBase === 'naoh' ? 'Natrium Stearat (Keras)' : 'Kalium Stearat (Lunak)');

          // Telemetry
          window.dispatchEvent(new CustomEvent('chemvibe_activity', {
            detail: {
              activityType: 'simulation_run',
              title: 'Reaksi Saponifikasi',
              description: `Memasak fasa lemak ${fatName} dengan basa alkali ${baseName} menghasilkan garam ${productSabun} + Gliserol murni`,
              score: { earned: 5, total: 5 }
            }
          }));

          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  // Run reagent reaction test
  const handlePourReagent = () => {
    setIsPouring(true);
    setReagentStatusText('Sedang meneteskan reagen indikator ke dalam fasa sampel campuran...');
    
    setTimeout(() => {
      setIsPouring(false);
      setReagentResultState('added');
      calculateReagentResult(false);
    }, 1500);
  };

  const handleHeatReagent = () => {
    setIsHeating(true);
    setReagentStatusText('Menyalakan pembakar bunsen spiritus untuk mempercepat proses oksidator kovalen...');

    setTimeout(() => {
      setIsHeating(false);
      setReagentResultState('heated');
      calculateReagentResult(true);

      // Telemetry trigger
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'simulation_run',
          title: 'Uji Reagen Makromolekul',
          description: `Melakukan pengujian sampel ${selectedSample} dengan reagen ${selectedReagent}`,
          score: { earned: 4, total: 4 }
        }
      }));
    }, 2200);
  };

  const calculateReagentResult = (heated: boolean) => {
    if (reagentCategory === 'carb') {
      if (selectedReagent === 'molisch') {
        setReagentStatusText('Uji Molisch POSITIF (Semua karbohidrat memberikan hasil cincin ungu pekat di batas dua cairan karena dehidrasi asam menghasilkan senyawa furfural).');
      } else if (selectedReagent === 'benedict') {
        if (selectedSample === 'glukosa' || selectedSample === 'fruktosa' || selectedSample === 'laktosa') {
          if (heated) {
            setReagentStatusText('Uji Benedict POSITIF! Terjadi reduksi ion padat Cu²⁺ mjd Cu⁺ menghasilkan endapan merah bata (Cu₂O) yang terlihat memisahkan diri di dasar tabung.');
          } else {
            setReagentStatusText('Campuran berwarna biru (sebelum dipanaskan). Uji Benedict membutuhkan kalor pemanasan guna menderegulasi gugus pereduksi.');
          }
        } else if (selectedSample === 'sukrosa') {
          setReagentStatusText('Uji Benedict NEGATIF. Warna tetap biru jernih Cu²⁺. Sukrosa adalah disakarida non-pereduksi karena ikatan glikosidiknya mengunci karbon anomerik bebas.');
        } else { // amilum
          setReagentStatusText('Uji Benedict NEGATIF untuk amilum polisakarida makro karena konsentrasi ujung hemisetal bebas pereduksi terdistribusi sangat kecil.');
        }
      } else if (selectedReagent === 'seliwanoff') {
        if (selectedSample === 'fruktosa') {
          if (heated) {
            setReagentStatusText('Uji Seliwanoff POSITIF CEPAT! Perubahan warna merah ceri menyala menunjukkan adanya karbohidrat golongan KETOSA (Fruktosa).');
          } else {
            setReagentStatusText('Uji Seliwanoff terdispersi jingga pudar, membutuhkan pemanas temperatur tinggi agar resorsinol mengembun sempurna.');
          }
        } else if (selectedSample === 'glukosa' || selectedSample === 'laktosa') {
          setReagentStatusText('Uji Seliwanoff NEGATIF LAMBAT (Tetap transparan atau merah muda sangat samar pudar karena aldehida terdehidrasi lambat dibanding ketosa).');
        } else {
          setReagentStatusText('Uji Seliwanoff NEGATIF untuk polisakarida kompleks.');
        }
      } else { // iodine
        if (selectedSample === 'amilum') {
          setReagentStatusText('Uji Iodium SANGAT POSITIF! Terbentuk kompleks iodium-amilosa heliks dengan absorpsi radiasi cahaya menghasilkan warna Biru-Tua gelap.');
        } else if (selectedSample === 'sukrosa' || selectedSample === 'glukosa') {
          setReagentStatusText('Uji Iodium NEGATIF (Warna kuning kecokelatan lemah pudar sesuai warna sisa reagen iod asli karena tidak memiliki struktur heliks melingkar).');
        } else {
          setReagentStatusText('Uji Iodium memberikan warna merah-kecokelatan lemah pada fasa molekul pendek.');
        }
      }
    } else if (reagentCategory === 'protein') {
      if (selectedReagent === 'biuret') {
        if (selectedSample === 'putih_telur' || selectedSample === 'susu_sapi') {
          setReagentStatusText('Uji Biuret POSITIF (Warna larutan berubah total menjadi UNGU / VIOLET pekat karena ion tembaga Cu²⁺ dikoordinasikan oleh ikatan peptida protein).');
        } else { // fenilalanin
          setReagentStatusText('Uji Biuret NEGATIF (Warna biru lemah Cu²⁺ dari reagen tetap dominan karena ia merupakan asam amino tunggal tanpa ikatan peptida).');
        }
      } else if (selectedReagent === 'ninhydrin') {
        setReagentStatusText('Uji Ninhidrin POSITIF UNGU (Ruhemann\'s Purple). Bereaksi dengan gugus alfa-amino bebas. Semua sampel protein bebas maupun asam amino menghasilkan reaksi ini.');
      } else if (selectedReagent === 'xanthoproteic') {
        if (selectedSample === 'putih_telur' || selectedSample === 'fenilalanin') {
          if (heated) {
            setReagentStatusText('Uji Xantoproteat POSITIF! HNO₃ bereaksi melakukan nitrasi cincin benzena asam amino hidrofobik tirosin/fenilalanin membentuk endapan warna kuning jingga.');
          } else {
            setReagentStatusText('Sedang berlangsung reaksi nitrasi dingin. Uji Xantoproteat memerlukan pemanasan untuk membentuk kompleks kuning maksimal.');
          }
        } else { // susu_sapi (kadar tyrosin rendah aromatis)
          setReagentStatusText('Uji Xantoproteat memberikan warna kuning yang cenderung teramat samar karena minimnya fragmen cincin benzena peptida.');
        }
      } else { // lead_acetate
        if (selectedSample === 'putih_telur') {
          if (heated) {
            setReagentStatusText('Uji Timbal Asetat POSITIF! Terjadi dekomposisi sulfur organik membentuk belerang bebas yang diikat menjadi endapan PbS hitam legam.');
          } else {
            setReagentStatusText('Larutan putih keruh. Perlu dipanaskan kuat bersama NaOH pekat agar ikatan belerang sistein terurai lepas sebagai sulfida.');
          }
        } else {
          setReagentStatusText('Uji Timbal Asetat NEGATIF. Spons cairan tetap putih/abu transparan karena sampel tidak mengandung gugus belerang penyusun sistein.');
        }
      }
    } else { // lipid
      if (selectedReagent === 'solubility') {
        if (selectedSample === 'minyak_kelapa') {
          setReagentStatusText('Uji Kelarutan: Terbentuk 2 Lapisan terpisah (di atas air) atau larut homogen jika dimasukkan dalam cairan kloroform nonpolar.');
        } else {
          setReagentStatusText('Larut sebagian (gliserol polar menyatu dengan molekul air karena ikatan hidroksil ganda).');
        }
      } else if (selectedReagent === 'acrolein') {
        if (selectedSample === 'minyak_kelapa' || selectedSample === 'gliserol') {
          if (heated) {
            setReagentStatusText('Uji Akrolein POSITIF! Timbul uap tak sedap dan menusuk hidung (akrolein) hasil dehidrasi dekomposisi rantai gliserol berkat bunsen KHSO₄.');
          } else {
            setReagentStatusText('Masih tercium bau lemak biasa sebelum terjadi pirolisis dehidrasi kuat pada suhu tinggi.');
          }
        } else {
          setReagentStatusText('Bau uap netral (bukan bau akrolein merusak mata).');
        }
      } else { // unsaturation / iodine
        if (selectedSample === 'minyak_kelapa') {
          setReagentStatusText('Uji Ketidakjenuhan POSITIF! Warna kuning-cokelat dari larutan brom/iodium menghilang dengan cepat akibat reaksi adisi kejenuhan melintasi ikatan rangkap C=C minyak nabati.');
        } else {
          setReagentStatusText('Warna iodium cokelat tetap tergenang stabil karena lipid sudah berupa alkil jenuh tanpa ikatan ganda.');
        }
      }
    }
  };

  // Multiple choice Questions (20 item MAKROMOLEKUL)
  const QUIZ_QUESTIONS = [
    {
      q: "Gula pencari energi berikut ini yang termasuk golongan aldosa (memiliki gugus aldehida) sekaligus monoksakarida pembentuk laktosa susu adalah...",
      o: ["Fruktosa", "Galaktosa", "Sukrosa", "Amilum"],
      a: 1,
      exp: "Galaktosa dan Glukosa adalah monosakarida golongan aldosa (memiliki gugus aldehid). Sedangkan Fruktosa adalah monosakarida golongan ketosa (memiliki gugus keton). Penggabungan glukosa dan galaktosa melahirkan laktosa."
    },
    {
      q: "Asam amino dalam medium air dapat membentuk struktur ion dipolar yang bermuatan positif di satu ujung dan bermuatan negatif di ujung lainnya. Keadaan ionik ini dinamakan...",
      o: ["Ion Amfoter", "Zwitterion", "Ion Karboksilat", "Isokalorik"],
      a: 1,
      exp: "Zwitterion adalah struktur asam amino di mana gugus amina bermuatan positif (-NH₃⁺) dan gugus karboksil bermuatan negatif (-COO⁻). Terbentuk akibat transfer proton internal."
    },
    {
      q: "Seorang siswa mereaksikan larutan putih telur dengan asam nitrat pekat, lalu memanaskannya. Terbentuk larutan berwarna kuning yang berubah menjadi jingga setelah ditetesi NaOH. Uji identifikasi ini bernama...",
      o: ["Uji Biuret", "Uji Ninhidrin", "Uji Xantoproteat", "Uji Timbal Asetat"],
      a: 2,
      exp: "Uji Xantoproteat ditandai dengan terbentuknya endapan/larutan kuning-jingga setelah penambahan asam nitrat pekat dan pemanasan, menyasar keberadaan asam amino aromatik (inti benzena)."
    },
    {
      q: "Berikut ini adalah asam-asam lemak pembentuk lipid:\n1) Asam Oleat\n2) Asam Stearat\n3) Asam Linoleat\n4) Asam Palmitat\nAsam lemak yang berwujud cair pada suhu ruang karena memiliki ikatan rangkap dua karbon (akibat ketidakjenuhan) adalah...",
      o: ["1 dan 2", "1 dan 3", "2 dan 4", "3 dan 4"],
      a: 1,
      exp: "Asam lemak tidak jenuh memiliki satu atau lebih ikatan rangkap C=C (oleat, linoleat, linolenat), menyebabkan titik lelehnya rendah (berwujud cair/minyak). Sedangkan asam lemak jenuh (stearat, palmitat) berwujud padat/lemak pada suhu kamar."
    },
    {
      q: "Polimer sintesis seperti Nilon dan Dakron diperoleh melalui reaksi penggabungan monomer-monomer yang disertai pelepasan molekul kecil seperti air (H₂O). Jenis polimerisasi ini dinamakan...",
      o: ["Polimerisasi Adisi", "Polimerisasi Kondensasi", "Kopolimerisasi Radikal", "Vulkanisasi Karet"],
      a: 1,
      exp: "Polimerisasi kondensasi adalah penggabungan monomer-monomer dengan gugus fungsi multifungsi yang melepas molekul kecil (seperti H₂O atau HCl) selama pembentukan ikatannya."
    },
    {
      q: "Uji Benedict yang menghasilkan endapan merah bata jika dipanaskan akan memberikan hasil negatif (biru jernih) pada karbohidrat golongan...",
      o: ["Maltosa", "Laktosa", "Sukrosa", "Fruktosa"],
      a: 2,
      exp: "Sukrosa terbentuk dari glukosa-fruktosa yang terikat pada karbon anomeriknya masing-masing. Akibatnya ia tidak lagi memiliki gugus karbonil hemiasetal bebas untuk mereduksi kupri kuprat, sehingga memberikan hasil negatif pada Benedict."
    },
    {
      q: "Polimer berikut yang bersifat elastis, tahan panas kimia tinggi, dan digunakan sebagai pelapis antilengket panci masak (Teflon) merupakan polimer dengan rumus monomer...",
      o: ["Tetrafluoroetena", "Vinil Klorida", "Stirena", "Propilena"],
      a: 0,
      exp: "Teflon (Politetrafluoroetilen - PTFE) disintesis dari polimerisasi adisi monomer tetrafluoroetena (CF₂=CF₂)."
    },
    {
      q: "Larutan protein berkadar tinggi ditetesi dengan reagen timbal asetat menghasilkan endapan hitam pekat setelah dipanaskan. Hal ini membuktikan bahwa protein tersebut memiliki kandungan asam amino...",
      o: ["Tirosin", "Sistein", "Triptofan", "Glisin"],
      a: 1,
      exp: "Endapan hitam yang terbentuk merupakan timbal sulfida (PbS). Reaksi ini spesifik mendeteksi asam amino yang mengandung belerang / sulfur seperti Sistein dan Metionin."
    },
    {
      q: "Reaksi pembuatan sabun melalui hidrolisis trigliserida (minyak goreng) dengan basa alkali KOH akan menghasilkan senyawa bernilai tinggi sebagai hasil samping berupa...",
      o: ["Etanol", "Gliserol", "Metil Format", "Laktosa"],
      a: 1,
      exp: "Penyabunan (saponifikasi) trigliserida melepas asam-asam lemak yang membentuk sabun (garam kalium/natrium oleat) bercampur dengan hasil samping senyawa alkohol trihidroksi gliserol (gliserin)."
    },
    {
      q: "Di antara polimer sintesis berikut, manakah kelompok yang seluruhnya tergolong polimer Termosetting (tidak melunak jika dipanaskan)?",
      o: ["PVC dan Polietilena", "Bakelit dan Resin Termoset", "Polistirena dan Nilon-66", "Teflon dan Kopolimer SBR"],
      a: 1,
      exp: "Polimer termoseting mengalami ikatan silang (cross-linking) tiga dimensi saat pertama kali dicetak, sehingga menjadi keras permanen dan tidak dapat dilelehkan kembali. Contoh klasiknya adalah Bakelit (plastik sirkuit elektrik) dan resin melamin."
    },
    {
      q: "Hubungan antara monosakarida dan ikatan penghubungnya untuk membentuk selulosa adalah...",
      o: ["Alfa-D-Glukosa dengan ikatan 1,4-glikosidik", "Beta-D-Glukosa dengan ikatan 1,4-glikosidik", "Fruktosa dengan ikatan ester", "Galaktosa dengan ikatan peptida"],
      a: 1,
      exp: "Selulosa tersusun dari pengulangan unit Beta-D-Glukosa yang diikat oleh ikatan kovalen beta-1,4-glikosidik yang membentuk serat linier panjang tak bercabang."
    },
    {
      q: "Asam amino berikut yang berkarakter nonpolar (hidrofobik) karena rantai sampingnya (R) berupa gugus alkil sederhana metil (-CH₃) adalah...",
      o: ["Glisin", "Alanin", "Asam Aspartat", "Lisin"],
      a: 1,
      exp: "Glisin memiliki R = H (paling sederhana), sedangkan Alanin memiliki rantai samping R = -CH₃ (metil nonpolar). Asam aspartat mengandung gugus karboksilat tambahan (asam polar), dan Lisin mengandung amina tambahan (basa polar)."
    },
    {
      q: "Minyak nabati dapat dikeraskan menjadi margarin padat melalui proses industri yang mendobrak ikatan rangkap dua asam lemak tidak jenuh. Nama proses penting ini adalah...",
      o: ["Hidrolisis", "Katalis dehidrasi", "Hidrogenasi katalitik", "Saponifikasi"],
      a: 2,
      exp: "Hidrogenasi katalitik dilakukan dengan menambahkan gas H₂ menggunakan katalis logam Ni/Pt ke dalam minyak tidak jenuh, mengubah fasa cair yang kaya ikatan rangkap C=C menjadi fasa padat jenuh (margarin)."
    },
    {
      q: "Suatu larutan biomolekul memberikan hasil negatif pada uji Biuret, namun memberikan cincin ungu pada uji Molisch. Kemungkinan besar senyawa tersebut adalah...",
      o: ["Minyak ikan", "Putih telur", "Glukosa", "Nilon"],
      a: 2,
      exp: "Negatif pada Biuret menegaskan tiadanya peptida (bukan protein). Positif pada Molisch membuktikan zat tersebut adalah salah satu senyawa di bawah rumpun gula / karbohidrat (seperti Glukosa)."
    },
    {
      q: "Ikatan kovalen amida yang menggabungkan gugus karboksil ( -COOH ) dari satu asam amino dengan gugus amino ( -NH₂ ) dari asam amino berikutnya dinamakan...",
      o: ["Ikatan Glikosidik", "Ikatan Ester", "Ikatan Peptida", "Ikatan Hidrogen"],
      a: 2,
      exp: "Ikatan peptida dibentuk ketika gugus asam karboksilat (-COOH) melepaskan gugus -OH dan gugus amino (-NH₂) melepaskan proton H, menghasilkan air dan tautan karbonil-nitrogen amida -CO-NH-."
    },
    {
      q: "Nilon-66 dibentuk dari kopolimerisasi kondensasi antara asam adipat dengan senyawa...",
      o: ["Heksametilenadiamina", "Vinilasetat", "Etilena glikol", "Resorsinol"],
      a: 0,
      exp: "Nilon-66 merupakan serat poliamida sintetik yang disintesis dari asam adipat (asam dikarboksilat berkarbon 6) dan heksametilenadiamina (diamina dengan karbon 6)."
    },
    {
      q: "Uji Seliwanoff digunakan untuk membedakan glukosa dan fruktosa. Fruktosa akan memberikan kompleks berwarna merah ceri lebih cepat karena memiliki gugus...",
      o: ["Aldehida", "Keton (Ketosa)", "Am पदार्था", "Karboksilat"],
      a: 1,
      exp: "Reagen Seliwanoff mengandung asam kuat HCl untuk mendehidrasi ketosa (seperti Fruktosa) menjadi 5-hidroksimetilfurfural dengan sangat cepat karena sifat cincin furanosanya, menghasilkan warna merah ceri bersama resorsinol."
    },
    {
      q: "Lipid membran sel berbentuk fosfolipid memiliki sifat amfifilik yang unik, artinya...",
      o: ["Tidak larut di semua jenis pelarut", "Memiliki ujung kepala polar hidrofilik dan ekor nonpolar hidrofobik", "Dapat diubah seutuhnya menjadi protein otot", "Hanya aktif pada pH asam keras di bawah 2"],
      a: 1,
      exp: "Fosfolipid bersifat amfifilik karena memiliki kepala fosfat bermuatan (polar & suka air / hidrofilik) dan ekor berupa sepasang rantai asam lemak hidrofobik (nonpolar & tidak suka air)."
    },
    {
      q: "Zat makromolekul polimer alam yang menyusun cangkang keras antropoda (seperti kepiting) maupun dinding sel jamur adalah...",
      o: ["Dakron", "Polipropilena", "Kitin", "Selulosa"],
      a: 2,
      exp: "Kitin adalah polimer alam turunan karbohidrat polisakarida (N-asetilglukosamin) penyusun eksoskeleton serangga, krustasea, dan jamur."
    },
    {
      q: "Asam amino dengan titik isoelektrik (pI) tertentu akan berwujud anion (bermuatan negatif secara keseluruhan) jika larutan berada pada kondisi...",
      o: ["Suhu sangat dingin 0 °C", "pH di atas titik isoelektriknya (pH &gt; pI)", "pH di bawah titik isoelektriknya (pH &lt; pI)", "pH tepat di nilai pI"],
      a: 1,
      exp: "Jika pH larutan di atas titik isoelektrik (pH > pI), gugus amino kehilangan proton menjadi netral (-NH₂) dan gugus karboksilat melepas asam bermuatan negatif (-COO⁻), sehingga asam amino bermuatan negatif (anion) secara total."
    }
  ];

  const handleSelectAnswer = (idx: number) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (idx === QUIZ_QUESTIONS[currentQuizQIdx].a) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuizQIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizQIdx(prev => prev + 1);
    } else {
      setQuizComplete(true);
      
      // Dispatch final Telemetry Complete Event
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          title: 'Kuis Makromolekul',
          description: `Kuis Makromolekul diselesaikan: Skor ${quizScore} dari ${QUIZ_QUESTIONS.length} soal dasar`,
          score: { earned: quizScore, total: QUIZ_QUESTIONS.length }
        }
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10" id="macromolecule-lab-root">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-zinc-900 border border-zinc-850 shadow-2xl" id="macro-header">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-400/10 border border-orange-400/20 text-xs text-orange-400 font-mono tracking-widest uppercase">
              <Dna className="w-3.5 h-3.5" /> Biomolekul &amp; Polimer
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Laboratorium Makromolekul</h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-2xl">
              Eksplorasi biokimia terapan Indonesia: struktur karbohidrat, protein, lipid (sabun), serta polimer plastik sintesis dengan simulator zwitterion interaktif dan uji reagen basah.
            </p>
          </div>
          
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 shadow-inner">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'explorer' 
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
              id="btn-macro-tab-explore"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Belajar Gugus</span>
            </button>
            <button
              onClick={() => setActiveTab('simulators')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'simulators' 
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
              id="btn-macro-tab-sims"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Sim Tabung Reaksi</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'quiz' 
                  ? 'bg-zinc-800 text-orange-400 border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
              id="btn-macro-tab-quiz"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Evaluasi UTBK (20)</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: EXPLORER AND LEARN */}
        {activeTab === 'explorer' && (
          <motion.div
            key="tab-macro-explorer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            id="tab-explore-content"
          >
            {/* Visual Class Selector Cards */}
            <div className="lg:col-span-3 space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1">PILIH GOLONGAN MAKROMOLEKUL</span>
              {MACROMOLECULE_TYPES.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedClassId === cls.id 
                      ? 'bg-zinc-850 border-orange-500/50 shadow-md text-white' 
                      : 'bg-zinc-900/40 border-zinc-900 hover:bg-zinc-900/70 text-zinc-400'
                  }`}
                  id={`btn-select-class-${cls.id}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">{cls.name}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedClassId === cls.id ? 'text-orange-400 translate-x-1' : 'opacity-40'}`} />
                  </div>
                  <span className="text-[10px] font-mono opacity-80 mt-1 block">{cls.chemicalFormula}</span>
                </button>
              ))}
            </div>

            {/* Main Interactive Sandbox Workspace Container */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Common Class Metadata Summary Card */}
              <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5" id="meta-summary-card">
                <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-zinc-850 pb-4 mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-orange-400">{activeClass.name}</h3>
                    <p className="text-zinc-405 text-xs">{activeClass.description}</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-1.5 shrink-0 text-[11px] h-fit">
                    <div><span className="text-zinc-500">Monomer Dasar:</span> <strong className="text-zinc-300 block">{activeClass.buildingBlock}</strong></div>
                    <div className="pt-1.5 border-t border-zinc-900"><span className="text-zinc-500">Jenis Jembatan / Ikatan:</span> <strong className="text-zinc-300 block">{activeClass.linkageType}</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 mb-2">Manfaat Praktis di Kehidupan Nyata:</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {activeClass.everydayUses.map((use, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-zinc-400 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{use}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicator reagent summary */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-300 mb-2">Indikator Ciri Kimia Utama:</h4>
                    <p className="text-zinc-450 text-[11px] leading-relaxed">
                      {selectedClassId === 'carbohydrate' && 'Dapat dideteksi dengan uji Molisch ungu, uji reduksi Fehling/Benedict merah bata, atau uji biru-iodium.'}
                      {selectedClassId === 'protein' && 'Identifikasi ikatan peptida melalui uji Biuret ungu pekat, uji asam amino bebas dengan Ninhidrin, atau uji timbal asetat hitam.'}
                      {selectedClassId === 'lipid' && 'Dicirikan lewat hidrofobisitas tinggi (tidak larut dalam air), uji gas menusuk akrolein, atau reaksi dekolorisasi pelarut iodium jenuh.'}
                      {selectedClassId === 'polymer' && 'Memiliki pemisahan termoplastik (mudah melunak dan dicetak kembali) vs termoseting (keras permanen akibat jembatan silang kovalen).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Interactive Sandbox based on selectedClassId */}
              {selectedClassId === 'carbohydrate' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5" id="carb-interactive-section">
                  <div className="md:col-span-4 glass-panel border-white/5 bg-slate-900/30 p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">SUB-KLASIFIKASI</span>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setCarbSubclass('mono')}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex justify-between items-center ${carbSubclass==='mono' ? 'bg-zinc-800 text-orange-400 font-bold' : 'text-zinc-400 hover:bg-zinc-900/30'}`}
                      >
                        <span>1. Monosakarida</span>
                        <span className="text-[9px] font-mono opacity-80 opacity-60">Metropolis ring tunggal</span>
                      </button>
                      <button 
                        onClick={() => setCarbSubclass('di')}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex justify-between items-center ${carbSubclass==='di' ? 'bg-zinc-800 text-orange-400 font-bold' : 'text-zinc-400 hover:bg-zinc-900/30'}`}
                      >
                        <span>2. Disakarida</span>
                        <span className="text-[9px] font-mono opacity-80 opacity-60">Dua cincin glikosida</span>
                      </button>
                      <button 
                        onClick={() => setCarbSubclass('poly')}
                        className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex justify-between items-center ${carbSubclass==='poly' ? 'bg-zinc-800 text-orange-400 font-bold' : 'text-zinc-400 hover:bg-zinc-900/30'}`}
                      >
                        <span>3. Polisakarida</span>
                        <span className="text-[9px] font-mono opacity-80 opacity-60">Polimer rantai raksasa</span>
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-8 p-5 bg-zinc-900/30 rounded-xl border border-zinc-900 text-xs space-y-4">
                    {carbSubclass === 'mono' && (
                      <div className="space-y-3">
                        <strong className="text-zinc-300 block text-sm">Monosakarida (Satu Cincin Karbon)</strong>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Golongan karbohidrat yang paling sederhana dan tidak dapat dihidrolisis lagi lebih matang. Berdasarkan letak gugus karbonilnya dibedakan menjadi:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                            <span className="text-orange-400 font-bold block">1. Aldosa (Gugus Aldehida)</span>
                            <span className="text-[11px] text-zinc-400 mt-1 block leading-relaxed">
                              Memiliki gugus fungsional -CHO di ujung. Contoh: <strong>Glukosa</strong> &amp; <strong>Galaktosa</strong>. Sangat reaktif pada uji Benedict.
                            </span>
                          </div>
                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850">
                            <span className="text-orange-400 font-bold block">2. Ketosa (Gugus Keton)</span>
                            <span className="text-[11px] text-zinc-400 mt-1 block leading-relaxed">
                              Memiliki gugus fungsional karbonil non-terminal C=O. Contoh: <strong>Fruktosa</strong> (gula buah paling manis). Bereaksi menceri murni di uji Seliwanoff.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {carbSubclass === 'di' && (
                      <div className="space-y-3">
                        <strong className="text-zinc-300 block text-sm">Disakarida (Gabungan Dua Monosakarida)</strong>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Molekul yang dibentuk dengan menggabungkan dua monosakarida melalui reaksi dehidrasi dehidrasi jembatan glikosidik:
                        </p>
                        <div className="space-y-2 text-[11px]">
                          <div className="flex justify-between items-center p-2 bg-zinc-950/60 rounded border border-zinc-900">
                            <div><strong className="text-zinc-300">A. Maltosa (Gula Gandum)</strong> = Glukosa + Glukosa</div>
                            <span className="text-emerald-400 font-semibold">Gula Pereduksi</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-zinc-950/60 rounded border border-zinc-900">
                            <div><strong className="text-zinc-300">B. Laktosa (Gula Susu)</strong> = Glukosa + Galaktosa</div>
                            <span className="text-emerald-400 font-semibold">Gula Pereduksi</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-zinc-950/60 rounded border border-zinc-900">
                            <div><strong className="text-zinc-350 font-bold text-zinc-300">C. Sukrosa (Gula Pasir)</strong> = Glukosa + Fruktosa</div>
                            <span className="text-red-400 font-semibold">Non-Pereduksi (Benedict Negatif)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {carbSubclass === 'poly' && (
                      <div className="space-y-3">
                        <strong className="text-zinc-300 block text-sm">Polisakarida (Rantai Panjang Kompleks)</strong>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Makromolekul yang tersusun atas ratusan hingga ribuan unit gula sederhana yang saling bertautan, berfungsi sebagai cadangan bahan bakar atau dinding pengaku struktural:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                          <div className="bg-zinc-950 p-2 text-center rounded border border-zinc-900">
                            <strong className="text-zinc-200 block">Amilum (Pati)</strong>
                            <p className="text-zinc-500 mt-1">Cadangan makanan tumbuhan, memberi reaksi biru-gelap dengan iodium jod.</p>
                          </div>
                          <div className="bg-zinc-950 p-2 text-center rounded border border-zinc-900">
                            <strong className="text-zinc-200 block">Selulosa</strong>
                            <p className="text-zinc-500 mt-1">Struktur pembentuk kayu/serabut tumbuhan. Tidak dapat dicerna oleh manusia dasar.</p>
                          </div>
                          <div className="bg-zinc-950 p-2 text-center rounded border border-zinc-900">
                            <strong className="text-zinc-200 block">Glikogen</strong>
                            <p className="text-zinc-500 mt-1">Poli-gluko bercabang tinggi tempat menyimpan gula otot di tubuh hewan &amp; manusia.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedClassId === 'protein' && (
                <div className="glass-panel border-white/5 bg-slate-900/30 p-5 rounded-xl space-y-4" id="protein-interactive-section">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-zinc-850 pb-3">
                    <div className="space-y-1">
                      <strong className="text-zinc-350 block font-bold text-zinc-300">Model Zwitterion Asam Amino &amp; Pengaruh pH</strong>
                      <p className="text-zinc-500 text-[11px]">
                        Asam amino bersifat amfoter berkat gugus karboksilat asam basah amina. Amati perubahan strukturnya dengan menggeser pH larutan.
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-zinc-950 border border-zinc-900 text-xs rounded-lg font-mono text-teal-400">
                      pH: <span className="font-bold">{pHValue.toFixed(1)}</span> (
                      {pHValue < 4 ? 'Asam Kuat' : pHValue < 6.5 ? 'Asam Lemah' : pHValue <= 7.5 ? 'Netral / Isoelektrik' : pHValue < 10 ? 'Basa Lemah' : 'Basa Kuat'}
                      )
                    </div>
                  </div>

                  {/* Graphic Representation of Zwitterion */}
                  <div className="flex justify-center py-4 bg-zinc-950/70 border border-zinc-900 rounded-xl relative overflow-hidden">
                    
                    {/* Visual molecules mapping */}
                    <div className="flex items-center gap-4 z-10 font-mono text-zinc-300 text-xs">
                      
                      {/* Amino Terminal */}
                      <div className={`p-3.5 rounded-xl border text-center transition-all ${pHValue < 3 ? 'bg-teal-500/15 border-teal-500 text-teal-400 scale-105' : pHValue < 9.5 ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-red-500/5 hover-red border-red-500/30 text-zinc-500 shadow-inner'}`}>
                        <span className="block text-[10px] text-zinc-500">Amino Group</span>
                        <strong className="text-sm block py-1">{pHValue < 9.5 ? '-NH₃⁺' : '-NH₂'}</strong>
                        <span className="text-[10px] font-mono">{pHValue < 9.5 ? 'Kationik (Terprotonasi)' : 'Netral (De-protonasi)'}</span>
                      </div>

                      {/* Peptide bond bridge */}
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-[2px] bg-zinc-800" />
                        <span className="text-[10px] font-mono text-zinc-500">C_alfa</span>
                        <div className="w-6 h-6 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800 font-sans text-xs text-orange-400 font-bold">R</div>
                        <div className="w-10 h-[2px] bg-zinc-800" />
                      </div>

                      {/* Carboxyl Terminal */}
                      <div className={`p-3.5 rounded-xl border text-center transition-all ${pHValue > 3 ? 'bg-orange-500/15 border-orange-500 text-orange-400 scale-105' : 'bg-zinc-900 border-zinc-800 text-zinc-500 shadow-inner'}`}>
                        <span className="block text-[10px] text-zinc-500 font-mono">Acid Group</span>
                        <strong className="text-sm block py-1">{pHValue < 3 ? '-COOH' : '-COO⁻'}</strong>
                        <span className="text-[10px] font-mono">{pHValue < 3 ? 'Netral (Terprotonasi)' : 'Anionik (De-protonasi)'}</span>
                      </div>

                    </div>
                  </div>

                  {/* Slide controls */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-zinc-400 font-mono">
                      <span>Cairan Sangat Asam (pH 1.0)</span>
                      <span>Titik Isolistrik (pI ~7.0)</span>
                      <span>Sangat Basa (pH 14.0)</span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={14.0}
                      step={0.1}
                      value={pHValue}
                      onChange={(e) => setPHValue(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 text-[11px] text-zinc-400 leading-relaxed text-center">
                      {pHValue < 4 && '💡 KONDISI ASAM: Konsentrasi H⁺ lingkungan tinggi mendorong protonasi semua ujung. Gugus amina bermuatan positif (-NH₃⁺), karboksilat netral (-COOH). Muatan total = +1.'}
                      {pHValue >= 4 && pHValue <= 9 && '💡 KONDISI NETRAL/ISOELEKTRIK: Kedua muatan berlawanan hidup bersamaan. Gugus amina positif dan karboksilat negatif. Membentuk ZWITTERION yang sangat polar namun bermuatan total Nol.'}
                      {pHValue > 9 && '💡 KONDISI BASA: Konsentrasi OH⁻ tinggi menarik proton keluar. Gugus karboksilat bermuatan negatif (-COO⁻), amina melepaskan proton menjadi netral (-NH₂). Muatan total = -1.'}
                    </div>
                  </div>
                </div>
              )}

              {selectedClassId === 'lipid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="lipid-interactive-section">
                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-3">
                    <strong className="text-zinc-300 block text-xs font-bold font-mono">ASAM LEMAK JENUH VS TIDAK JENUH</strong>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="p-3 bg-zinc-950 rounded-lg border-l-2 border-orange-500">
                        <span className="font-bold text-zinc-200 block text-[11px]">Asam Lemak Jenuh (Saturated Fat)</span>
                        <p className="text-zinc-400 text-[11px] mt-1 leading-normal">
                          Tidak memiliki ikatan rangkap dua C=C di sepanjang ekor karbon alifatiknya. Rantai lurus padat tertata rapi. Umumnya berwujud <strong>padat</strong> pada suhu kamar (cth: mentega, lemak daging).
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-950 rounded-lg border-l-2 border-teal-500">
                        <span className="font-bold text-zinc-250 block text-[11px]">Asam Lemak Tak Jenuh (Unsaturated Fat)</span>
                        <p className="text-zinc-400 text-[11px] mt-1 leading-normal">
                          Memiliki minimal satu atau beberapa ikatan kovalen rangkap dua C=C. Ikatan rangkap menciptakan lekukan rantai (kink) yang merusak susunan kisi padat. Berbentuk <strong>cair</strong> dalam keadaan natural (cth: minyak zaitun, minyak kelapanya).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-3 text-xs">
                    <strong className="text-zinc-300 block text-xs font-bold font-mono">KOMPOSISI TRIGLISERIDA (LEMAK MURNI)</strong>
                    <p className="text-zinc-450 leading-relaxed text-[11px]">
                      Satu molekul Trigliserida sejati terbentuk dari proses kondensasi / esterifikasi satu molekul alkohol berkaki tiga bernama <strong>Gliserol</strong> dengan tiga rantai panjang <strong>Asam Lemak</strong> bebas (melepas 3 molekul H₂O).
                    </p>
                    
                    <div className="p-3.5 bg-zinc-950 border border-zinc-900 rounded-lg space-y-2 text-center text-[10px] font-mono text-zinc-400">
                      <div className="inline-block px-1.5 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-orange-400">1 x Gliserol</div>
                      <div className="inline-block px-1 mx-1 text-zinc-600">+</div>
                      <div className="inline-block px-1.5 py-1 bg-zinc-900 border border-zinc-800 rounded font-bold text-blue-400">3 x Asam Lemak</div>
                      <div className="py-1 text-zinc-550">↓ Reaksi Dehidrasi Esterifikasi ↓</div>
                      <div className="px-2 py-1 bg-teal-500/10 border border-teal-500/20 rounded inline-block font-bold text-teal-400">Trigliserida (Lemak) + 3 H₂O</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedClassId === 'polymer' && (
                <div className="glass-panel border-white/5 bg-slate-900/30 p-5 rounded-xl space-y-4" id="polymer-assembling-game">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                    <div className="space-y-1">
                      <strong className="text-zinc-300 block text-xs font-bold font-mono">PERAKIT RANTAI POLIMERISASI ADISI</strong>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">
                        Pilih jenis monomer, kemudian klik tambahkan monomer untuk merakit rantai polietena, polistirena, atau PVC jenuh.
                      </p>
                    </div>
                    
                    <select
                      value={polymerMonomer}
                      onChange={(e) => { setPolymerMonomer(e.target.value as any); handleClearPolymer(); }}
                      className="bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs text-zinc-200.5 font-bold rounded-lg focus:outline-none"
                    >
                      <option value="etena">Etena (Fase Polietilena)</option>
                      <option value="vinil">Vinil Klorida (Fase PVC)</option>
                      <option value="stirena">Stirena (Fase Polistirena)</option>
                    </select>
                  </div>

                  {/* Render assembled polymer blocks */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 p-4 bg-zinc-950 rounded-xl min-h-[90px] border border-zinc-900">
                    {polymerChain.length === 0 ? (
                      <span className="text-zinc-600 font-mono text-[10px]">Rantai polimer kosong. Tambahkan monomer untuk melangsungkan adisi...</span>
                    ) : (
                      <>
                        <div className="text-[10px] font-mono text-zinc-500 px-2 border-r border-zinc-850">Radikal*</div>
                        {polymerChain.map((u, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-bold shadow-sm ${
                              polymerMonomer === 'etena' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                              polymerMonomer === 'vinil' ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' :
                              'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                            }`}
                          >
                            [-{u}-]
                          </motion.div>
                        ))}
                        {polymerChain.length < 5 && <div className="text-[10px] font-mono text-zinc-400 animate-pulse">~~ [Aktif]*</div>}
                      </>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex gap-3 justify-end text-xs">
                    <button
                      onClick={handleClearPolymer}
                      className="px-3.5 py-2 hover:bg-zinc-800 text-zinc-450 border border-zinc-800 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Bersihkan
                    </button>
                    <button
                      onClick={handleAddMonomer}
                      disabled={polymerChain.length >= 5}
                      className={`px-4 py-2 bg-orange-500 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all ${
                        polymerChain.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 shadow-md'
                      }`}
                    >
                      <Plus className="w-4 h-4" /> Tambah Monomer
                    </button>
                  </div>

                  {/* Reaction Log Console */}
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 font-mono text-[10px] text-zinc-500 space-y-1 max-h-24 overflow-y-auto">
                    <span className="text-zinc-650 block border-b border-zinc-900 pb-1 mb-1 text-[9px] uppercase tracking-wider font-bold">REAKSI LOG (RADIKAL BEBAS)</span>
                    {reactionLog.length === 0 ? (
                      <span className="text-zinc-700 italic block">Menunggu katalis panas tekanan dimasukkan...</span>
                    ) : (
                      reactionLog.map((log, li) => (
                        <div key={li} className="text-zinc-450">{log}</div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}

        {/* TAB 2: REAGENT & SAPONIFICATION SIMULATORS */}
        {activeTab === 'simulators' && (
          <motion.div
            key="tab-macro-simulators"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
            id="tab-sims-content"
          >
            
            {/* Top Selector Toggle */}
            <div className="flex justify-center">
              <div className="bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 inline-flex shadow-inner">
                <button
                  onClick={() => setSelectedSim('reagent')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedSim === 'reagent' ? 'bg-zinc-800 text-orange-400 border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="btn-select-sim-reagent"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Uji Reagen Basah</span>
                </button>
                <button
                  onClick={() => setSelectedSim('saponification')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedSim === 'saponification' ? 'bg-zinc-800 text-orange-400 border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id="btn-select-sim-saponify"
                >
                  <Flame className="w-4 h-4" />
                  <span>Simulator Saponifikasi (Sabun)</span>
                </button>
              </div>
            </div>

            {/* SIMULATOR 1: REAGENT LAB */}
            {selectedSim === 'reagent' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sim-reagent-body">
                
                {/* Control Panel (4 Columns) */}
                <div className="lg:col-span-4 space-y-4">
                  
                  {/* Category toggle */}
                  <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-4.5 space-y-4">
                    <div>
                      <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1.5">KATALOG PENGUJIAN</label>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <button
                          onClick={() => setReagentCategory('carb')}
                          className={`p-2 rounded-lg font-bold border transition-all cursor-pointer ${reagentCategory === 'carb' ? 'bg-zinc-800 border-orange-500/40 text-orange-450' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}
                          id="btn-reagent-cat-carb"
                        >
                          Karbohidrat
                        </button>
                        <button
                          onClick={() => setReagentCategory('protein')}
                          className={`p-2 rounded-lg font-bold border transition-all cursor-pointer ${reagentCategory === 'protein' ? 'bg-zinc-800 border-orange-500/40 text-orange-450' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}
                          id="btn-reagent-cat-protein"
                        >
                          Protein
                        </button>
                        <button
                          onClick={() => setReagentCategory('lipid')}
                          className={`p-2 rounded-lg font-bold border transition-all cursor-pointer ${reagentCategory === 'lipid' ? 'bg-zinc-800 border-orange-500/40 text-orange-450' : 'bg-zinc-950 border-zinc-900 text-zinc-500'}`}
                          id="btn-reagent-cat-lipid"
                        >
                          Lipid
                        </button>
                      </div>
                    </div>

                    {/* Sample Selection */}
                    <div>
                      <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1.5">PILIH SAMPEL ORGANIK</label>
                      <select
                        value={selectedSample}
                        onChange={(e) => { setSelectedSample(e.target.value); resetReagentTube(); }}
                        className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-300 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none"
                      >
                        {reagentCategory === 'carb' && (
                          <>
                            <option value="glukosa">Sampel Glukosa (Monosakarida pereduksi)</option>
                            <option value="fruktosa">Sampel Fruktosa (Ketosa pereduksi)</option>
                            <option value="sukrosa">Sampel Gula Pasir (Sukrosa non-pereduksi)</option>
                            <option value="amilum">Cairan Kanji (Pati Polisakarida)</option>
                          </>
                        )}
                        {reagentCategory === 'protein' && (
                          <>
                            <option value="putih_telur">Putih Telur (Albumin Kaya Peptida &amp; Sulfur)</option>
                            <option value="susu_sapi">Susu Sapi Encer (Kasein Alami)</option>
                            <option value="fenilalanin">Fenilalanin Terlarut (Asam amino aromatik murni)</option>
                          </>
                        )}
                        {reagentCategory === 'lipid' && (
                          <>
                            <option value="minyak_kelapa">Minyak Kelapa Nabati (Asam kaprilat tidak jenuh)</option>
                            <option value="gliserol">Larutan Gliserol Bebas (Gliserin)</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Reagent Selection */}
                    <div>
                      <label className="text-[9px] font-mono font-bold text-zinc-500 block mb-1.5">PILIH REAGEN INDIKATOR</label>
                      <select
                        value={selectedReagent}
                        onChange={(e) => { setSelectedReagent(e.target.value); resetReagentTube(); }}
                        className="w-full bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-350 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none"
                      >
                        {reagentCategory === 'carb' && (
                          <>
                            <option value="benedict">Reagen Benedict (Tembaga II Kompleks)</option>
                            <option value="seliwanoff">Reagen Seliwanoff (Pendeteksi Ketosa)</option>
                            <option value="iodine">Reagen Iodium KI (Pendeteksi Kanji)</option>
                            <option value="molisch">Reagen Molisch (Pembukti Karbohidrat)</option>
                          </>
                        )}
                        {reagentCategory === 'protein' && (
                          <>
                            <option value="biuret">Reagen Biuret (Kupri Sulfat + NaOH)</option>
                            <option value="ninhydrin">Indikator Ninhidrin (Rantai asam amino bebas)</option>
                            <option value="xanthoproteic">Asam Nitrat HNO3 Pekat (Untuk aromatik)</option>
                            <option value="lead_acetate">Timbal Asetat + NaOH (Untuk deteksi belerang)</option>
                          </>
                        )}
                        {reagentCategory === 'lipid' && (
                          <>
                            <option value="unsaturation">Air Iodium/Bromin (Uji ikatan rangkap dua)</option>
                            <option value="acrolein">KHSO4 + Bunsen Panas (Uji Akrolein gliserol)</option>
                            <option value="solubility">Pelarut Air vs Pelarut Kloroform (Uji Kelarutan)</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Active Tests Help metadata */}
                    <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-900 text-[10px] text-zinc-500 leading-normal space-y-1.5">
                      <span className="font-bold text-zinc-400 block font-mono">REAKSI INFORMASI</span>
                      {reagentCategory === 'carb' && (
                        <>
                          <p><strong>Benedict:</strong> Glukosa, Fruktosa, Laktosa (+) menjadi Merah Bata. Sukrosa &amp; Amilum (-).</p>
                          <p><strong>Iod:</strong> Amilum (+) Biru Gelap. Monosakarida (-).</p>
                        </>
                      )}
                      {reagentCategory === 'protein' && (
                        <>
                          <p><strong>Biuret:</strong> Terbentuk kompleks koordinasi Cu²⁺ berujung warna Ungu.</p>
                          <p><strong>Timbal Asetat:</strong> (+) Menghasilkan PbS hitam jika ada sulfur (Sistein).</p>
                        </>
                      )}
                      {reagentCategory === 'lipid' && (
                        <>
                          <p><strong>Iodium:</strong> Adisi ikatan rangkap melarutkan warna iodium cokelat menjadi jernih.</p>
                          <p><strong>Akrolein:</strong> Pirolisis gliserin menghasilkan akrolein volatil pedih mata.</p>
                        </>
                      )}
                    </div>

                  </div>

                </div>

                {/* Wet Lab Screen Tube Visualizer (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col justify-between p-5 bg-zinc-950 border border-zinc-900 rounded-2xl relative overflow-hidden min-h-[380px]">
                  
                  {/* Bunsen Background Glow effect */}
                  {isHeating && (
                    <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />
                  )}

                  <div className="text-center space-y-1 z-10">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-650 font-bold uppercase uppercase">KAWAN REAKTOR SEJATI</span>
                    <h3 className="text-sm font-bold text-zinc-300">Tabung Reaksi Wet-Test Simulator</h3>
                  </div>

                  {/* Interactive Test Tube Graphic */}
                  <div className="flex flex-col items-center justify-center py-6 h-56 relative">
                    
                    {/* Dropper pipet visual */}
                    <AnimatePresence>
                      {isPouring && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="absolute top-0 text-center font-mono text-[9px] text-teal-400 z-20"
                        >
                          💧 Meneteskan indikator...
                          <div className="w-1 h-8 bg-sky-400/80 mx-auto rounded animate-bounce mt-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Test Tube Body vector */}
                    <div className="w-16 h-40 border-4 border-zinc-650 rounded-b-full relative overflow-hidden bg-zinc-900/30">
                      
                      {/* Inside liquid indicator */}
                      {reagentResultState !== 'empty' && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '55%' }}
                          className={`absolute bottom-0 inset-x-0 transition-colors duration-1000 ${
                            reagentResultState === 'added' ? (
                              selectedReagent === 'benedict' ? 'bg-sky-500/40' :
                              selectedReagent === 'iodine' || selectedReagent === 'unsaturation' ? 'bg-amber-600/40' :
                              selectedReagent === 'biuret' ? 'bg-blue-400/40' :
                              selectedReagent === 'xanthoproteic' ? 'bg-zinc-200/50' : 'bg-zinc-100/30'
                            ) : (
                              // Heated states
                              selectedReagent === 'benedict' ? (
                                selectedSample === 'glukosa' || selectedSample === 'fruktosa' || selectedSample === 'laktosa' ? 'bg-red-500/80' : 'bg-sky-500/40'
                              ) :
                              selectedReagent === 'seliwanoff' ? (
                                selectedSample === 'fruktosa' ? 'bg-red-650/90' : 'bg-orange-400/40'
                              ) :
                              selectedReagent === 'iodine' ? (
                                selectedSample === 'amilum' ? 'bg-indigo-900/90' : 'bg-amber-600/30'
                              ) :
                              selectedReagent === 'biuret' ? (
                                selectedSample === 'putih_telur' || selectedSample === 'susu_sapi' ? 'bg-purple-650/80' : 'bg-blue-450/40'
                              ) :
                              selectedReagent === 'xanthoproteic' ? (
                                selectedSample === 'putih_telur' || selectedSample === 'fenilalanin' ? 'bg-amber-500/80' : 'bg-zinc-200/30'
                              ) :
                              selectedReagent === 'lead_acetate' ? (
                                selectedSample === 'putih_telur' ? 'bg-stone-900/95 shadow-inner' : 'bg-zinc-200/40'
                              ) :
                              selectedReagent === 'unsaturation' ? (
                                selectedSample === 'minyak_kelapa' ? 'bg-zinc-100/20' : 'bg-amber-600/40'
                              ) : 'bg-zinc-100/30'
                            )
                          }`}
                        >
                          {/* Heated bubbling effect representation */}
                          {isHeating && (
                            <div className="absolute inset-x-0 bottom-1 flex justify-around opacity-60">
                              <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping delay-100" />
                              <span className="w-1 h-1 bg-white rounded-full animate-ping delay-200" />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Bunsen Heat Maker Visual */}
                    <AnimatePresence>
                      {isHeating && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute -bottom-2 flex flex-col items-center justify-center font-mono text-[9px] text-blue-400"
                        >
                          <Flame className="w-7 h-7 text-blue-500 animate-bounce" />
                          <span>Bunsen ON</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                  {/* Status Indicator text screen */}
                  <div className="bg-zinc-950 p-4.5 rounded-xl border border-zinc-900 min-h-[64px] text-center text-xs text-zinc-350 flex items-center justify-center leading-relaxed">
                    <p>{reagentStatusText}</p>
                  </div>

                  {/* Operational controls */}
                  <div className="flex gap-4 justify-center pt-2.5">
                    <button
                      onClick={resetReagentTube}
                      disabled={reagentResultState === 'empty'}
                      className="px-4 py-2 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Bersihkan Reaktor
                    </button>
                    <button
                      onClick={handlePourReagent}
                      disabled={reagentResultState !== 'empty' || isPouring}
                      className="px-4.5 py-2 bg-orange-500 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-orange-650 flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      id="btn-trigger-pour"
                    >
                      <span>1. Teteskan Reagen</span>
                    </button>
                    <button
                      onClick={handleHeatReagent}
                      disabled={reagentResultState !== 'added' || isHeating}
                      className="px-4.5 py-2 bg-red-500 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-red-655 flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      id="btn-trigger-heat"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>2. Panaskan Larutan</span>
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* SIMULATOR 2: SAPONIFICATION */}
            {selectedSim === 'saponification' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sim-saponification-body">
                
                {/* Options Panel (5 Columns) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 block pb-2 border-b border-zinc-850">REAKTOR SABUN MANDI SINTESIS</span>
                    
                    {/* Fat select */}
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1">PILIH TRIGLISERIDA (MINYAK / LEMAK)</label>
                      <select
                        value={sapFatType}
                        onChange={(e) => { setSapFatType(e.target.value as any); setSapStep(0); }}
                        className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none"
                      >
                        <option value="triolein">Gliseril Trioleat (Minyak Kelapa Sawit Cair)</option>
                        <option value="tristearin">Gliseril Tristearat (Lemak Hewani Solid/Beku)</option>
                      </select>
                    </div>

                    {/* Alkali base select */}
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-1">PILIH ALKALI BASA</label>
                      <select
                        value={sapBase}
                        onChange={(e) => { setSapBase(e.target.value as any); setSapStep(0); }}
                        className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 px-3 py-2 text-xs font-semibold rounded-lg focus:outline-none"
                      >
                        <option value="naoh">Natrium Hidroksida (NaOH - Sabun Keras Padat)</option>
                        <option value="koh">Kalium Hidroksida (KOH - Sabun Cair/Lembek)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <strong className="text-zinc-300 block">Penjelasan Reaksi:</strong>
                      <p className="text-zinc-450 leading-relaxed text-[11px]">
                        Hidrolisis trigliserida oleh basa kuat melepas gliserol dan menghasilkan garam natrium/kalium asam lemak yang bertindak sebagai surfaktan (sabun).
                      </p>
                    </div>

                    <button
                      onClick={handleTriggerSaponification}
                      disabled={sapStep === 1}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-650 text-white font-black text-xs rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      id="btn-start-saponify"
                    >
                      <Play className="w-3.5 h-3.5" /> Mulai Reaksi Penyabunan
                    </button>
                  </div>
                </div>

                {/* Animation Output (7 Columns) */}
                <div className="lg:col-span-7 flex flex-col justify-between p-5 bg-zinc-950 border border-zinc-900 rounded-2xl min-h-[300px]">
                  
                  {sapStep === 0 && (
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 my-auto">
                      <Scale className="w-10 h-10 text-zinc-650" />
                      <p className="text-xs text-zinc-400 font-mono">Bahan baku ditimbang dan siap diumpankan ke mixer reaktor sabun.</p>
                    </div>
                  )}

                  {sapStep === 1 && (
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                      <Sliders className="w-8 h-8 text-orange-400 animate-spin" />
                      <strong className="text-xs text-zinc-350">Sedang mengaduk campuran Trigliserida &amp; Alkali Basa...</strong>
                      
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden max-w-sm">
                        <motion.div
                          className="bg-orange-500 h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${sapProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {sapStep === 2 && (
                    <div className="space-y-4 my-auto">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-[10px] text-emerald-400 font-mono w-fit mx-auto">
                        <CheckCircle className="w-3 h-3" /> Reaksi Saponifikasi Sukses
                      </div>

                      <div className="p-4 bg-zinc-900 text-xs rounded-xl space-y-3.5 border border-zinc-850 max-w-md mx-auto">
                        <div>
                          <span className="text-zinc-500">Bahan Asal:</span>
                          <strong className="text-zinc-300 block mt-0.5">{sapFatType === 'triolein' ? 'Gliseril Trioleat' : 'Gliseril Tristearat'} + {sapBase === 'naoh' ? 'NaOH' : 'KOH'}</strong>
                        </div>
                        <div className="pt-2 border-t border-zinc-850">
                          <span className="text-zinc-500">Hasil Produk Sabun Mandi Utama:</span>
                          <strong className="text-orange-400 block mt-0.5">
                            {sapFatType === 'triolein' ? (sapBase === 'naoh' ? 'Natrium Oleat (Sabun Batang Keras)' : 'Kalium Oleat (Sabun Cair Lembut)') : (sapBase === 'naoh' ? 'Natrium Stearat (Sabun Batang Berbusa)' : 'Kalium Stearat (Formula Sabun Cair Krim)')}
                          </strong>
                        </div>
                        <div className="pt-2 border-t border-zinc-850">
                          <span className="text-zinc-500">Hasil Sampingan Bernilai Tinggi:</span>
                          <strong className="text-zinc-300 block mt-0.5">Gliserol murni (Gliserin) - Bahan pelembap kulit industri kosmetik</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 text-[10px] text-zinc-500 text-center font-mono">
                    Persamaan kimia: R-COO-CH₂-CH-CH₂ + 3 M-OH → 3 R-COO-M (Sabun) + Gliserol
                  </div>

                </div>

              </div>
            )}

          </motion.div>
        )}

        {/* TAB 3: QUIZ EVALUATION (20 QUESTIONS INDONESIAN) */}
        {activeTab === 'quiz' && (
          <motion.div
            key="tab-macro-quiz"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex justify-center"
            id="tab-quiz-content"
          >
            
            {!quizStarted ? (
              <div className="text-center space-y-5 py-8 max-w-md" id="quiz-intro-screen">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto">
                  <Award className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">Evaluasi Mandiri Kimia Karbon &amp; Makromolekul</h2>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Evaluasi diri Anda dengan 20 butir soal pilihan ganda berbobot UTBK dan SBMPTN. Mencakup materi Karbohidrat, Protein, Lipid, serta Polimerisasi Alkena.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-[11px] text-zinc-500 text-center font-mono">
                  ✦ total {QUIZ_QUESTIONS.length} Pertanyaan Standar Ujian ✦
                </div>

                <button
                  onClick={() => { setQuizStarted(true); setQuizComplete(false); setCurrentQuizQIdx(0); setQuizScore(0); }}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  id="btn-start-macro-quiz"
                >
                  Mulai Kuis Sekarang
                </button>
              </div>
            ) : quizComplete ? (
              <div className="text-center space-y-5 py-8 max-w-md" id="quiz-complete-screen">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-white">Evaluasi Selesai!</h2>
                  <p className="text-zinc-450 text-xs">Kerja bagus, pembelajar sejati selalu tumbuh seiring perjuangan.</p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl w-36 mx-auto">
                  <span className="text-3xl font-mono font-black text-emerald-400">{quizScore}</span>
                  <span className="text-zinc-500 text-sm font-bold"> / {QUIZ_QUESTIONS.length}</span>
                </div>

                <div className="flex gap-3 justify-center text-xs">
                  <button
                    onClick={() => setQuizStarted(false)}
                    className="px-4 py-2 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    Kembali Menu Kuis
                  </button>
                  <button
                    onClick={() => { setQuizComplete(false); setCurrentQuizQIdx(0); setQuizScore(0); setSelectedAnswer(null); setShowExplanation(false); }}
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-655 text-white font-bold rounded-xl cursor-pointer transition-colors shadow"
                  >
                    Ulangi Tes
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-zinc-900/40 p-5 md:p-6 rounded-2xl border border-zinc-900 space-y-4" id="quiz-question-screen">
                
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                  <span>PERTANYAAN {currentQuizQIdx + 1} / {QUIZ_QUESTIONS.length}</span>
                  <span className="text-orange-450 px-2 py-0.5 bg-orange-400/10 border border-orange-400/20 rounded font-bold uppercase">UTBK / SBMPTN</span>
                </div>

                <h3 className="text-sm font-bold text-zinc-200 leading-relaxed whitespace-pre-line" id="quiz-question-text">
                  {QUIZ_QUESTIONS[currentQuizQIdx].q}
                </h3>

                <div className="space-y-2 pt-2" id="quiz-options-container">
                  {QUIZ_QUESTIONS[currentQuizQIdx].o.map((opt, oIdx) => {
                    const isSelected = selectedAnswer === oIdx;
                    const isCorrect = oIdx === QUIZ_QUESTIONS[currentQuizQIdx].a;
                    
                    let bgBorderClass = 'bg-zinc-950 border-zinc-900 hover:border-zinc-750 text-zinc-400';
                    if (showExplanation) {
                      if (isCorrect) bgBorderClass = 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 font-bold';
                      else if (isSelected) bgBorderClass = 'bg-red-500/10 border-red-500/60 text-red-405';
                    } else if (isSelected) {
                      bgBorderClass = 'bg-zinc-800 border-orange-500 text-orange-400 font-bold';
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectAnswer(oIdx)}
                        disabled={showExplanation}
                        className={`w-full text-left p-3 rounded-xl border text-xs leading-normal cursor-pointer transition-all ${bgBorderClass}`}
                        id={`btn-quiz-option-${oIdx}`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{opt}</span>
                          {showExplanation && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-2.5 text-xs text-zinc-400 leading-relaxed"
                    id="quiz-explanation-box"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-orange-450 text-[11px] font-mono">
                      <Info className="w-3.5 h-3.5" /> PENJELASAN AKADEMIS
                    </div>
                    <span>{QUIZ_QUESTIONS[currentQuizQIdx].exp}</span>
                    
                    <button
                      onClick={handleNextQuestion}
                      className="w-full mt-2 py-2 bg-zinc-850 hover:bg-zinc-750 text-zinc-200.5 font-bold rounded-lg cursor-pointer transition-colors text-[11px]"
                      id="btn-quiz-next"
                    >
                      <span>{currentQuizQIdx === QUIZ_QUESTIONS.length - 1 ? 'Selesaikan Kuis' : 'Langkah Selanjutnya'}</span>
                    </button>
                  </motion.div>
                )}

              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
