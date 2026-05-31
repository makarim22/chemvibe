/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ELEMENTS_DATA } from '../data';
import { ChemicalElement } from '../types';
import { 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  ArrowRightLeft, 
  Info, 
  GraduationCap, 
  ArrowRight, 
  Play, 
  Check, 
  Beaker,
  Award,
  Zap,
  HelpCircle as HelpIcon 
} from 'lucide-react';

// Dictionary of compounds that can be formed by selectables: H, C, O, Na, Cl, He
// Symmetrical keys based on alphabetically sorted symbols, e.g., Na_Cl, H_O, etc.
const COMPOUNDS_MAP: Record<string, {
  formula: string;
  name: string;
  commonName: string;
  equation: string;
  ratio: string;
  explanation: string;
  steps: string[];
  teacherTip: string;
}> = {
  "H_H": {
    formula: "H₂",
    name: "Gas Hidrogen",
    commonName: "Gas Hidrogen (Diatomik)",
    equation: "H + H → H₂",
    ratio: "1 : 1 (1 atom Hidrogen berpasangan dengan 1 atom Hidrogen)",
    explanation: "Masing-masing atom H menyumbangkan 1 elektron untuk dipakai bersama. Melalui pembagian seimbang ini, kedua atom mencapai kestabilan duplet (2 elektron valensi seperti Helium). Ini adalah contoh ikatan kovalen tunggal nonpolar murni.",
    steps: [
      "Persiapan: Setiap atom Hidrogen berdiri secara bebas dan memiliki 1 elektron valensi tunggal yang belum berpasangan (keadaan tidak stabil).",
      "Kombinasi e⁻: Kedua atom saling mendekat. Mengingat memiliki keelektronegatifan setara, kedua atom setuju menggunakan elektron bersama dengan tumpang tindih orbital.",
      "Kestabilan Duplet: Sepasang elektron kini mengorbit di ranah tengah secara simetris, menghasilkan gas molekuler diatomik H₂ yang stabil dengan konfigurasi duplet cemerlang."
    ],
    teacherTip: "Sangat baik untuk mengajarkan konsep ikatan kovalen tunggal pertama kali, menjelaskan mengapa Hidrogen selalu eksis sebagai molekul diatomik H₂ di alam, serta mendemonstrasikan aturan duplet (pengecualian cangkang K)."
  },
  "C_H": {
    formula: "CH₄",
    name: "Metana",
    commonName: "Gas Alam / Metana",
    equation: "C + 4 H → CH₄",
    ratio: "1 : 4 (1 atom Karbon berikatan kovalen dengan 4 atom Hidrogen)",
    explanation: "Atom Karbon memiliki 4 elektron valensi dalam kulit terluar dan membutuhkan 4 elektron tambahan untuk mencapai oktet (8e⁻). Empat unsur atom Hidrogen masing-masing menyumbangkan 1 elektron, membentuk 4 ikatan kovalen tunggal sempurna tanpa elektron sisa.",
    steps: [
      "Persiapan: Karbon menempatkan 4 elektron valensinya di empat penjuru berbeda, sementara 4 atom Hidrogen berada di sekelilingnya dengan membawa masing-masing 1e⁻.",
      "Kombinasi e⁻: Karbon mengikat tiap atom Hidrogen dengan membagikan 1 elektronnya. Terjadi tumpang tindih orbital (sp³ hibridisasi) di mana 4 pasangan elektron dibagi rata secara merata.",
      "Kestabilan Oktet: Semua atom sekarang senang! Karbon berhasil dikelilingi oleh 8 elektron valensi (aturan oktet), sementara masing-masing dari ke-4 Hidrogen melengkapi 2 elektron (aturan duplet)."
    ],
    teacherTip: "Gunakan molekul ini untuk menunjukkan bagaimana rumus empiris rasional kimia ditentukan dari persilangan valensi, dan tunjukkan bentuk ruang geometri stabilnya yang bersifat tetrahedral karena tolak-menolak PEI secara maksimal."
  },
  "H_O": {
    formula: "H₂O",
    name: "Air",
    commonName: "Air Murni (Dihidrogen Monoksida)",
    equation: "2 H + O → H₂O",
    ratio: "2 : 1 (2 atom Hidrogen berikatan kovalen dengan 1 atom Oksigen)",
    explanation: "Oksigen yang memiliki 6 elektron valensi bertekad mengikat 2 elektron lagi demi ketetapan oktet. Dua atom Hidrogen masing-masing menyumbangkan 1 elektron tunggalnya. Namun karena Oksigen sangat elektronegatif, awan elektron ditarik asimetris membentuk polaritas parsial.",
    steps: [
      "Persiapan: Oksigen bersiap dengan 6 elektron valensi (2 pasang berpasangan dan 2 elektron bebas tunggal), diapit oleh dua atom Hidrogen.",
      "Kombinasi e⁻: Oksigen membentuk 2 ikatan kovalen tunggal dengan menyilangkan elektron bersama dua Hidrogen. Oksigen membiarkan sisa 4 elektron (2 pasang) tetap menyendiri sebagai PEB.",
      "Kestabilan Oktet: Oksigen memeluk 8 elektron penuh di sekelilingnya sedangkan kedua Hidrogen mencapai duplet. Bentuk molekul melengkung (bent) diraih akibat tolak-menolak ekstrem dari kedua PEB tersebut."
    ],
    teacherTip: "Tekankan efek dari Pasangan Elektron Bebas (PEB) milik atom pusat Oksigen. PEB ini mendorong ikatan kovalen O-H ke bawah, memelintir sudut lurus air menjadi melengkung 104.5° sehingga air berkarakter polar kuat."
  },
  "H_Na": {
    formula: "NaH",
    name: "Natrium Hidrida",
    commonName: "Natrium Hidrida (Garam Bersifat Basa)",
    equation: "2 Na + H₂ → 2 NaH",
    ratio: "1 : 1 (1 atom Natrium mentransfer elektron ke 1 atom Hidrogen)",
    explanation: "Sebuah anomali kovalen biasa tetapi mendasar. Natrium sebagai logam alkali berenergi ionisasi rendah melepas 1 elektron valensinya ($3s^1$) seutuhnya. Hidrogen bertindak sebagai penangkap gas elektron kuat membentuk anion hidrida logam ($H^-$) yang stabil secara ionik.",
    steps: [
      "Persiapan: Natrium (1e⁻ valensi) dan Hidrogen (1e⁻ valensi) saling berhadapan. Perbedaan keelektronegatifan memaksa proses transfer penuh daripada berbagi bersama.",
      "Kombinasi e⁻: Natrium menyisihkan elektron terluarnya secara total, menyerahkannya kepada Hidrogen. Na bermuatan positif Na⁺ sedangkan H beralih mengemban muatan negatif H⁻ (Hidrida).",
      "Kestabilan Ionik: Gaya tarik Coulomb elektrostatik mempertemukan kation logam Na⁺ dan anion nonlogam H⁻ untuk mengkristal dalam struktur kisi garam ionik kokoh."
    ],
    teacherTip: "Gunakan contoh spesial ini untuk membakar rasa ingin tahu siswa: 'Biasanya Hidrogen melepas elektron atau berbagi, tapi di sini Hidrogen bertindak sebagai nonlogam pelahap elektropositif pembentuk anion!'"
  },
  "Cl_H": {
    formula: "HCl",
    name: "Asam Klorida",
    commonName: "Asam Klorida / Hidrogen Klorida",
    equation: "H + Cl → HCl",
    ratio: "1 : 1 (1 atom Hidrogen berbagi elektron dengan 1 atom Klorin)",
    explanation: "Klorin (7e⁻ valensi) membutuhkan satu elektron demi oktet. Hidrogen menyumbangkan 1 elektron. Terbentuk ikatan kovalen kutub polar di mana awan elektron sangat condong ditarik ke arah Klorin yang lebih elektronegatif (ΔEN cukup besar).",
    steps: [
      "Persiapan: Atom Hidrogen bersiap dengan 1e⁻ valensi tunggal, sementara Klorin memiliki 7e⁻ valensi dengan 1 elektron tersisa tanpa pasangan.",
      "Kombinasi e⁻: Terjadi serikat pemakaian bersama satu pasang elektron di tengah. Namun, Klorin dengan keelektronegatifan tinggi menarik kepemilikan elektron kian merapat ke sisinya.",
      "Kestabilan Dipol: Hidrogen mencapai duplet dan Klorin mencapai oktet. Terpancar kerapatan bipolar parsial positif (δ⁺) pada Hidrogen dan parsial negatif (δ⁻) pada Klorin mendirikan sifat asam kuat jika dilarutkan ke air."
    ],
    teacherTip: "Sangat baik untuk menjelaskan dipol ikatan kimia. Guru dapat mendemonstrasikan bahwa HCl murni adalah gas kovalen polar, tetapi ketika dimasukkan ke dalam air ia berionisasi penuh menghasilkan ion H⁺ dan Cl⁻."
  },
  "C_C": {
    formula: "C",
    name: "Karbon Elementer",
    commonName: "Grafit / Intan (Rantai Kovalen Raksasa)",
    equation: "C + C → Jaringan Kovalen Tak Terhingga",
    ratio: "N/A (Pembentukan jaringan polimer murni tak terhingga)",
    explanation: "Gabungan atom Karbon yang identik. Karena masing-masing dapat membentuk 4 ikatan kovalen terarah di segala dimensi, atom C menyatu menjadi jaringan kovalen raksasa (Giant Covalent Network) tanpa batas struktural sederhana.",
    steps: [
      "Persiapan: Setiap karbon memiliki 4 elektron valensi bebas yang diletakkan searah sudut-sudut ruang koordinat.",
      "Kombinasi e⁻: Karbon saling berbagi elektron satu sama lain secara terus menerus membentuk struktur rantai berulang (hibridisasi sp² atau sp³).",
      "Kestabilan Allotrop: Struktur terhubung melahirkan material tangguh: intan kristalin super keras atau lemping rapuh grafit konduktif dengan lautan elektron konjugasi."
    ],
    teacherTip: "Bantu siswa memahami allotropi: zat yang tersusun dari unsur yang persis sama (Karbon), tetapi perbedaan cara penataan geometri ikatannya merubah sifat fisikanya dari penghantar listrik rapuh (grafit) menjadi permata penggores kaca terkeras di bumi (intan)."
  },
  "C_O": {
    formula: "CO₂",
    name: "Karbon Dioksida",
    commonName: "Karbon Dioksida (Gas Rumah Kaca)",
    equation: "C + O₂ → CO₂",
    ratio: "1 : 2 (1 atom Karbon berikatan kovalen rangkap dua dengan 2 atom Oksigen)",
    explanation: "Karbon menyumbangkan 4 elektron terluarnya dan masing-masing Oksigen menyumbangkan 2 elektron. Mereka membentuk 2 set ikatan kovalen rangkap dua (C=O). Karena ketiadaan elektron bebas di atom pusat, tolak-menolak mendorong ikatan lurus memanjang 180°.",
    steps: [
      "Persiapan: Atom Karbon (4 valensi) berada di tengah cawan sebagai atom pusat. Dua atom Oksigen (masing-masing 6 valensi) mendampingi di kiri dan kanan.",
      "Kombinasi e⁻: Karbon menempatkan 2 pasangan elektronnya di sisi kiri berpasangan dengan Oksigen kiri, sedang 2 keping elektron di kanan digabung bersama Oksigen kanan.",
      "Geometri Linear: Terbentuk 2 ikatan kovalen rangkap dua ( double bonds ). Karbon dan kedua Oksigen stabil berkonfigurasi oktet lengkap membentuk gas tak berwarna CO₂."
    ],
    teacherTip: "Jelaskan mengapa gas CO₂ bersifat tidak polar meskipun memiliki ikatan C=O yang polar! Itu karena geometri molekulnya linear simetris mengesampingkan atau membatalkan kedua vektor dipol momen satu sama lain."
  },
  "C_Na": {
    formula: "Na₂C₂",
    name: "Natrium Karbida (Natrium Asetilida)",
    commonName: "Natrium Asetilida",
    equation: "2 Na + 2 C → Na₂C₂",
    ratio: "2 : 2 (Dalam kristal ionik polimer)",
    explanation: "Reaksi ekstrim antara logam mulia elektropositif alkali dan unsur nonlogam karbon. Natrium menyerahkan elektronnya untuk ditangkap oleh karbon terkonjugasi secara ionik membentuk garam karbida putih.",
    steps: [
      "Persiapan: Dua atom Natrium (1e⁻) siap mendonasikan elektronnya ke atom karbon.",
      "Kombinasi e⁻: Karbon menangkap donasi tersebut menjadi anion asetilida berganda, menstabilkan strukturnya dengan ikatan rangkap tiga kovalen internal.",
      "Kestabilan Garam: Interaksi kisi elektrostatik terbentuk merapatkan ion garam berselubung energi tinggi."
    ],
    teacherTip: "Menarik bagi murid kelas XII untuk ditunjukkan reaksi hidrolisis dari Na₂C₂ yang ketika terkena tetesan air akan meledak melepaskan gas asetilena (gas karbit pengelas logam)."
  },
  "C_Cl": {
    formula: "CCl₄",
    name: "Karbon Tetraklorida",
    commonName: "Karbon Tetraklorida (Pelarut Organik)",
    equation: "C + 2 Cl₂ → CCl₄",
    ratio: "1 : 4 (1 atom Karbon dikelilingi kovalen oleh 4 atom Klorin)",
    explanation: "Karbon sebagai pusat mengikat 4 atom halogen Klorin yang masing-masing membawa 7 elektron valensinya. Mereka saling memakai elektron tunggal menghasilkan 4 ikatan kovalen tunggal tegar berbentuk tetrahedral simetris tanpa sisi dipol polar bersih.",
    steps: [
      "Persiapan: Atom Karbon di pusat dikelilingi oleh empat penjuru atom Klorin di sudut-sudut kubus miring.",
      "Kombinasi e⁻: Karbon berbagi masing-masing 1 elektron valensi dengan 4 atom Klorin, mendirikan 4 garis ikatan kovalen tunggal tegar.",
      "Kestabilan Tetrahedral: Karbon mencapai oktet aman dengan 8 elektron pelindung dan tiap Klorin menggapai cangkang oktet penuh. Senyawa nonpolar stabil ini berbentuk cairan organik murni."
    ],
    teacherTip: "Sempurna untuk membuktikan materi sifat kepolaran zat terlarut ('like dissolves like'). CCl₄ bersifat nonpolar karena dipolnya saling meniadakan secara kaku di ruang tiga dimensi."
  },
  "O_O": {
    formula: "O₂",
    name: "Gas Oksigen",
    commonName: "Gas Oksigen / Udara Pernapasan",
    equation: "O + O → O₂",
    ratio: "1 : 1 (Dua atom Oksigen berbagi sepasang elektron ganda)",
    explanation: "Dua atom Oksigen (masing-masing memiliki 6e⁻ valensi) saling menyumbang 2 buah elektron terluarnya ke ranah tengah persatuan. Mereka berbagi 4 elektron (2 pasang elektron ikatan) untuk saling memenuhi aturan oktet cangkang.",
    steps: [
      "Persiapan: Dua atom Oksigen bersandingan dekat, masing-masing kekurangan 2 elektron untuk mencapai susunan mulia oktet.",
      "Kombinasi e⁻: Keduanya menaruh masing-masing 2 elektron di tengah tumpang tindih p-orbital, melahirkan zona ikatan ganda.",
      "Kestabilan Rangkap Dua: Terbentuk ikatan kovalen ganda rangkap dua ( double bond ). Kedua Oksigen memiliki 8 elektron terluar (oktet) yang kokoh dalam fasa gas diatomik."
    ],
    teacherTip: "Bagus sebagai pembanding ikatan kovalen tunggal (H₂) dengan ikatan kovalen rangkap dua (O₂), tunjukkan bahwa ikatan rangkap dua lebih pendek kaku dan bermutasi energi disosiasi jauh lebih tinggi."
  },
  "Na_O": {
    formula: "Na₂O",
    name: "Natrium Oksida",
    commonName: "Natrium Oksida (Oksida Logam Basa)",
    equation: "4 Na + O₂ → 2 Na₂O",
    ratio: "2 : 1 (2 atom Natrium mentransfer elektron ke 1 atom Oksigen)",
    explanation: "Satu atom Oksigen membutuhkan 2 elektron terluar demi kestabilan (oktet). Karenanya, diperlukan dua atom logam Natrium (yang bersedia melepaskan masing-masing 1e⁻ valensinya) untuk memuaskan kebutuhan asupan elektron Oksigen.",
    steps: [
      "Persiapan: Satu atom Oksigen (6e⁻) mempersiapkan posisinya sebagai penampung ionik didampingi oleh dua atom logam Natrium elektropositif (masing-masing 1e⁻).",
      "Kombinasi/Transfer: Kedua atom Natrium melepas elektron valensinya dan dilarikan penuh menuju Oksigen. Oksigen bermuatan anion negatif ganda O²⁻ dan Natrium menjadi kation positif ganda Na⁺.",
      "Garis Gaya Kristal: Ketiga ion terikat rapat dalam tarikan kisi elektrostatik ionik yang solid, membentuk padatan oksida semen basah putih Na₂O."
    ],
    teacherTip: "Gunakan senyawa ini untuk mematahkan kebingungan matematika siswa tentang rumus indeks: Terangkan bahwa jumlah muatan positif total dari kation (2 × Na⁺ = +2) harus seimbang dengan muatan negatif total anion (O²⁻ = -2)."
  },
  "Cl_O": {
    formula: "Cl₂O",
    name: "Diklorin Monoksida",
    commonName: "Gas Diklorin Monoksida (Gas Oksida Halogen)",
    equation: "2 Cl₂ + O₂ → 2 Cl₂O",
    ratio: "2 : 1 (2 atom Klorin halogen berbagi elektron dengan 1 atom Oksigen)",
    explanation: "Dua nonlogam elektronegatif bergabung. Oksigen bertindak sebagai pusat menyumbangkan masing-masing 1 elektron untuk dipakai bersama 2 atom Klorin. Tercipta 2 ikatan kovalen tunggal polar dengan sisa PEB di Oksigen yang membentuk lekukan bengkok berkarakter reaktif pasif.",
    steps: [
      "Persiapan: Atom Oksigen berada di posisi sentral dan dua atom Klorin menempati sayap kiri dan kanan.",
      "Kombinasi e⁻: Terjadi perserikatan sepasang elektron kovalen tunggal secara polar antara O-Cl kiri dan O-Cl kanan.",
      "Gaya Struktur: Molekul terstabilkan dengan konfigurasi oktet penuh di ketiga atom pembangun, sisa PEB membentuk geometri asimetris."
    ],
    teacherTip: "Menarik untuk menjelaskan konsep tata nama IUPAC senyawa kovalen nonlogam biner: diklorin monoksida (menggunakan awalan angka Yunani)."
  },
  "Na_Na": {
    formula: "Na (s)",
    name: "Kristal Logam Natrium",
    commonName: "Logam Natrium Padat",
    equation: "Na + Na → Struktur Ikatan Logam (Metalik)",
    ratio: "N/A (Kisi logam terdelokalisasi lautan elektron)",
    explanation: "Interaksi antar atom logam sejenis. Karena energi ionisasi Natrium sangat rendah, elektron valensi $3s^1$ mudah lepas dan membentuk 'lautan elektron' bebas menyelimuti ion positif Na⁺. Ini melahirkan ikatan logam (Metallic Bond) murni yang solid.",
    steps: [
      "Persiapan: Atom Natrium berkumpul rapat dalam kisi kristal padat logam murni.",
      "Kombinasi e⁻: Elektron terluar terlepas secara kolektif melanglang buana secara delokalisasi melompati kation-kation positif Na⁺.",
      "Sifat Logam: Lautan elektron bebas ini yang bertindak sebagai perekat penstabil padatan logam, memberi karakteristik berkilau, konduktor panas-listrik handal, dan lunak."
    ],
    teacherTip: "Visualisasi hebat untuk meruntuhkan miskonsepsi siswa bahwa ikatan kimia cuma ada Ionik dan Kovalen saja. Ikatan logam dengan konsep lautan elektron menerangkan mengapa panci logam menghantar panas atau kabel listrik tembaga mengalirkan arus."
  },
  "Cl_Na": {
    formula: "NaCl",
    name: "Natrium Klorida",
    commonName: "Garam Dapur / Salt",
    equation: "2 Na + Cl₂ → 2 NaCl",
    ratio: "1 : 1 (1 atom Natrium mentransfer elektron ke 1 atom Klorin)",
    explanation: "Representasi ikonik ikatan ionik murni. Natrium ($1s^2 2s^2 2p^6 3s^1$) mendonasikan elektron valensinya agar stabil sesuai cangkas dalam oktet Neon. Elektron tunggal itu diterima seutuhnya oleh Klorin ($3s^2 3p^5$) untuk membuahkan oktet cangkang Argon.",
    steps: [
      "Persiapan: Logam alkali Natrium yang tidak stabil (1e⁻ valensi) berjumpa dengan gas halogen racun Klorin yang lapar elektron (7e⁻ valensi).",
      "Kombinasi/Transfer: Natrium melepas elektron valensinya dan diserap penuh oleh Klorin. Terciptalah kation Na⁺ yang super stabil dan anion klorida Cl⁻.",
      "Kestabilan Ionik: Daya tarik elektrostatik kental mengunci kedua ion kontras tersebut ke susunan kubus kristal garam meja NaCl yang kita konsumsi sehari-hari."
    ],
    teacherTip: "Sebuah contoh fantastis di mana dua zat reaktif maut berbahaya (Natrium logam peledak berair dan Klorin gas beracun paruparu) bertransformasi radikal menjadi bumbu penyedap makanan rumahan yang mutlak ramah gizi."
  },
  "Cl_Cl": {
    formula: "Cl₂",
    name: "Gas Klorin",
    commonName: "Gas Klorin (Gas Halogen)",
    equation: "Cl + Cl → Cl₂",
    ratio: "1 : 1 (Dua atom Klorin berbagi sepasang elektron tunggal)",
    explanation: "Dua atom halogen Klorin (masing-masing memiliki 7e⁻ valensi) saling menempatkan 1 elektron terluar tidak berpasangan mereka di pusat perserikatan. Terjalin 1 pasang elektron ikatan kovalen tunggal nonpolar murni.",
    steps: [
      "Persiapan: Dua atom Klorin mendekat, masing-masing gelisah membutuhkan 1 elektron tamat kulit luarnya.",
      "Kombinasi e⁻: Orbital p terluar saling bersinggungan di sumbu ikatan, mengkontribusikan masing-masing 1 elektron ke ranah kongsi bersama.",
      "Kestabilan Halogen: Terpahat satu ikatan kovalen tunggal tegar nonpolar. Kedua atom mencapai pemenuhan oktet penuh menyerupai Argon."
    ],
    teacherTip: "Sempurna untuk melisensi penjelasan ikatan tunggal kovalen nonpolar antar atom halogen golongan VIIA."
  }
};

export default function BondingLab() {
  const selectables = ['H', 'C', 'O', 'Na', 'Cl', 'He'];
  const labElements = selectables.map(symbol => 
    ELEMENTS_DATA.find(el => el.symbol === symbol)!
  ).filter(Boolean);

  const [atomA, setAtomA] = useState<ChemicalElement>(labElements.find(e => e.symbol === 'Na') || labElements[3]);
  const [atomB, setAtomB] = useState<ChemicalElement>(labElements.find(e => e.symbol === 'Cl') || labElements[4]);
  
  // Interactive Simulator Step for chemistry teachers
  const [simStep, setSimStep] = useState<number>(1);

  // States for custom Polarization Sandbox
  const [customEnA, setCustomEnA] = useState<number>(2.1);
  const [customEnB, setCustomEnB] = useState<number>(3.0);

  // When elements change, automatically reset simulation step to 1 to guide user sequentially
  useEffect(() => {
    setSimStep(1);
  }, [atomA, atomB]);

  const electronegA = atomA.electronegativity ?? 0;
  const electronegB = atomB.electronegativity ?? 0;
  const diffEN = Math.abs(electronegA - electronegB);

  // Determine bonding type
  let bondTitle = '';
  let bondType: 'ionic' | 'polar-covalent' | 'nonpolar-covalent' | 'none' = 'none';
  let bondDescription = '';
  let formedFormula = '';

  const isNoble = atomA.symbol === 'He' || atomB.symbol === 'He';

  if (isNoble) {
    bondType = 'none';
    bondTitle = 'Tidak Ada Ikatan (Gas Mulia)';
    bondDescription = 'Helium memiliki susunan elektron duplet penuh yang sangat stabil (1s²). Berdasarkan aturan oktet, atom ini memiliki afinitas mendekati nol dan tidak memerlukan ikatan kimia tambahan untuk mencapai kestabilan.';
    formedFormula = 'N/A';
  } else if (atomA.symbol === atomB.symbol) {
    bondType = 'nonpolar-covalent';
    bondTitle = 'Ikatan Kovalen Nonpolar';
    bondDescription = `Kedua atom berasal dari unsur ${atomA.name}. Karena nilai keelektronegatifan setara (ΔEN = 0.00), mereka berbagi pasangan elektron secara simetris di tengah-tengah inti atom tanpa kutub muatan.`;
    formedFormula = `${atomA.symbol}₂`;
  } else if (diffEN >= 2.0) {
    bondType = 'ionic';
    bondTitle = 'Ikatan Ionik (Transfer Elektron)';
    bondDescription = `Perbedaan keelektronegatifan bernilai tinggi (ΔEN = ${diffEN.toFixed(2)}). Logam ${electronegA < electronegB ? atomA.name : atomB.name} mentransfer elektron valensinya menuju atom nonlogam yang sangat elektronegatif ${electronegA > electronegB ? atomA.name : atomB.name}, menghasilkan ion bermuatan kontras yang saling tarik-menarik.`;
    formedFormula = electronegA < electronegB ? `${atomA.symbol}${atomB.symbol}` : `${atomB.symbol}${atomA.symbol}`;
  } else if (diffEN > 0.4 && diffEN < 2.0) {
    bondType = 'polar-covalent';
    bondTitle = 'Ikatan Kovalen Polar';
    bondDescription = `Perbedaan keelektronegatifan bernilai sedang (ΔEN = ${diffEN.toFixed(2)}). Pasangan elektron dibagi bersama tetapi awan elektron ketarik lebih kuat ke arah atom yang lebih elektronegatif (${electronegA > electronegB ? atomA.name : atomB.name}), memicu polaritas muatan lokal parsial (δ⁺ & δ⁻).`;
    formedFormula = electronegA < electronegB ? `${atomA.symbol}${atomB.symbol}` : `${atomB.symbol}${atomA.symbol}`;
  } else {
    bondType = 'nonpolar-covalent';
    bondTitle = 'Ikatan Kovalen Nonpolar (Hampir Sempurna)';
    bondDescription = `Perbedaan keelektronegatifan bernilai sangat minimal (ΔEN = ${diffEN.toFixed(2)}). Kemampuan menarik elektron yang setara menghasilkan distribusi elektron yang merata di antara kedua unsur pembangun molekul.`;
    formedFormula = `${atomA.symbol}${atomB.symbol}`;
  }

  // Lookup compound from symmetrical map
  const compoundKey = [atomA.symbol, atomB.symbol].sort().join('_');
  const activeCompound = isNoble ? null : COMPOUNDS_MAP[compoundKey];

  // Swap elements
  const handleSwap = () => {
    const temp = atomA;
    setAtomA(atomB);
    setAtomB(temp);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-white/5 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[9px] font-black uppercase tracking-wider">LABORATORIUM REAKSI</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[9px] font-black uppercase tracking-wider">Edisi Guru</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">Chemical Bonding &amp; Compound Formation</h2>
          <p className="text-zinc-400 text-sm">
            Gabungkan dua atom unsur untuk mensimulasikan mekanisme orbital, transfer/sharing elektron, dan pembentukan senyawa nyata.
          </p>
        </div>
        <button
          onClick={handleSwap}
          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-mono flex items-center gap-1.5 hover:bg-zinc-850 active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
          Swap Atoms
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left selector panel for Atom A (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-pink-500 rounded-full" />
            <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-widest">ATOM UTAMA (A)</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            {labElements.map((el) => {
              const active = atomA.symbol === el.symbol;
              const disabled = atomB.symbol === el.symbol && el.symbol !== 'Cl' && el.symbol !== 'H'; // Allow duplicate H/Cl
              return (
                <button
                  key={`a-${el.symbol}`}
                  disabled={disabled}
                  onClick={() => setAtomA(el)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active 
                      ? 'bg-pink-500/10 border-pink-500 text-white shadow-lg relative overflow-hidden' 
                      : disabled 
                        ? 'bg-zinc-950/20 border-zinc-950 text-zinc-650 cursor-not-allowed opacity-30' 
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750'
                  }`}
                >
                  {active && <div className="absolute right-0 top-0 w-8 h-8 bg-pink-500/20 rounded-full blur-xl" />}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black font-sans">{el.name}</span>
                    <span className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{el.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono mt-2 text-zinc-500">
                    <span>Valensi: {el.valenceElectrons}e⁻</span>
                    <span>EN: {el.electronegativity ?? '—'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Canvas display visualizer (Span 6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-6 h-80 flex flex-col items-center justify-center relative overflow-hidden border border-slate-900">
            {/* Background glowing halo depending on reaction state */}
            {simStep === 3 && activeCompound && (
              <div className="absolute w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
            )}
            
            <div className="absolute top-4 left-4 flex gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-950 font-mono text-[9px] font-semibold tracking-wider">
                {simStep === 1 ? "TAHAP 1: ATOM BEBAS" : simStep === 2 ? "TAHAP 2: PROSES INTERAKSI" : "TAHAP 3: SENYAWA TERBENTUK"}
              </span>
            </div>

            {/* Atomic Interaction Canvas representation using standard elements */}
            <div className="flex items-center justify-center gap-1 md:gap-8 z-10 w-full">
              
              {/* Atom A orbital representation */}
              <div className={`flex flex-col items-center text-center space-y-3 relative transition-all duration-700 ${
                simStep === 3 && activeCompound ? 'translate-x-3 scale-95 opacity-90' : 'translate-x-0'
              }`}>
                <div className={`w-20 h-20 rounded-full border-2 border-dashed border-pink-400/30 relative flex items-center justify-center ${
                  simStep === 1 ? 'animate-spin' : simStep === 2 ? 'scale-105 animate-pulse' : 'scale-90 border-pink-500/50'
                }`} style={{ animationDuration: '28s' }}>
                  {/* Outer valence dots */}
                  {Array.from({ length: atomA.valenceElectrons }).map((_, i) => {
                    const angle = (i / atomA.valenceElectrons) * 360;
                    return (
                      <div 
                        key={i} 
                        className="w-2.5 h-2.5 rounded-full bg-pink-400 absolute border border-zinc-950 shadow-[0_0_8px_rgba(244,114,182,0.8)]"
                        style={{ transform: `rotate(${angle}deg) translate(40px) rotate(-${angle}deg)` }}
                      />
                    );
                  })}
                </div>
                {/* Nucleus node */}
                <div className="absolute inset-x-0 top-0 bottom-0 m-auto w-12 h-12 bg-zinc-950 rounded-full border-2 border-pink-500 flex flex-col items-center justify-center text-white z-20 shadow-md">
                  <span className="text-sm font-black font-sans">{atomA.symbol}</span>
                  <span className="text-[7.5px] text-zinc-500 font-mono">z={atomA.number}</span>
                </div>
                <div className="text-[10px] font-semibold text-pink-400 font-mono">EN: {atomA.electronegativity ?? 'Inert'}</div>
              </div>

              {/* Bonding Force Bridge icon/indicator */}
              <div className="flex flex-col items-center gap-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/50 min-w-[70px] md:min-w-[100px]">
                <div className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold border border-zinc-800">
                  ΔEN = {diffEN.toFixed(2)}
                </div>
                
                {/* Visualizing electron transfer / sharing dynamically */}
                <div className="relative w-12 md:w-16 h-4 flex items-center justify-center">
                  {simStep === 2 ? (
                    <div className="absolute inset-0 flex justify-center items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                    </div>
                  ) : null}
                  <div className={`h-[1px] w-full ${
                    bondType === 'ionic' ? 'bg-gradient-to-r from-pink-500 to-cyan-500' :
                    bondType === 'polar-covalent' ? 'bg-gradient-to-r from-pink-400 via-zinc-600 to-cyan-400' :
                    bondType === 'nonpolar-covalent' ? 'bg-zinc-500' : 'bg-transparent border-t border-dashed border-zinc-800'
                  }`} />
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[9.5px] font-mono font-black text-white tracking-widest leading-none">
                    {simStep === 3 && activeCompound ? activeCompound.formula : formedFormula}
                  </span>
                  <span className="text-[7px] font-mono text-zinc-500 tracking-wider mt-0.5">
                    {bondType === 'ionic' ? 'IONIC' : bondType === 'polar-covalent' ? 'POLAR' : bondType === 'nonpolar-covalent' ? 'NONPOLAR' : 'GAS MULIA'}
                  </span>
                </div>
              </div>

              {/* Atom B orbital representation */}
              <div className={`flex flex-col items-center text-center space-y-3 relative transition-all duration-700 ${
                simStep === 3 && activeCompound ? '-translate-x-3 scale-95 opacity-90' : 'translate-x-0'
              }`}>
                <div className={`w-20 h-20 rounded-full border-2 border-dashed border-cyan-400/30 relative flex items-center justify-center ${
                  simStep === 1 ? 'animate-spin' : simStep === 2 ? 'scale-105 animate-pulse' : 'scale-90 border-cyan-500/50'
                }`} style={{ animationDuration: '28s', animationDirection: 'reverse' }}>
                  {/* Outer valence dots */}
                  {Array.from({ length: atomB.valenceElectrons }).map((_, i) => {
                    const angle = (i / atomB.valenceElectrons) * 360;
                    return (
                      <div 
                        key={i} 
                        className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute border border-zinc-950 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        style={{ transform: `rotate(${angle}deg) translate(40px) rotate(-${angle}deg)` }}
                      />
                    );
                  })}
                </div>
                {/* Nucleus node */}
                <div className="absolute inset-x-0 top-0 bottom-0 m-auto w-12 h-12 bg-zinc-950 rounded-full border-2 border-cyan-500 flex flex-col items-center justify-center text-white z-20 shadow-md">
                  <span className="text-sm font-black font-sans">{atomB.symbol}</span>
                  <span className="text-[7.5px] text-zinc-500 font-mono">z={atomB.number}</span>
                </div>
                <div className="text-[10px] font-semibold text-cyan-400 font-mono">EN: {atomB.electronegativity ?? 'Inert'}</div>
              </div>

            </div>

            {/* Display compound overlay if step is step 3 and not noble */}
            {simStep === 3 && activeCompound && (
              <div className="absolute bottom-5 bg-teal-950/90 border border-teal-500/40 p-2.5 rounded-xl max-w-[90%] text-center transition-all animate-bounce shadow-xl">
                <div className="text-[9px] font-mono text-teal-400 font-bold uppercase tracking-widest leading-none">SENYAWA STABIL YANG TERBENTUK:</div>
                <div className="text-xs font-black text-white mt-1">
                  {activeCompound.name} ({activeCompound.formula})
                </div>
                <div className="text-[9.5px] text-slate-300 font-mono font-medium mt-0.5">
                  {activeCompound.commonName}
                </div>
              </div>
            )}

            {/* Helium inert state warning */}
            {isNoble && (
              <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-400 font-mono">REAKSI INERT / TIDAK REAKTIF</h4>
                  <p className="text-[10.5px] text-slate-400 max-w-xs leading-relaxed">
                    Helium merupakan gas mulia dengan konfigurasi kulit K penuh (duplet stabil). Atom Helium tidak rela berbagi atau menyerap elektron lain.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Teacher Interactive Steering Stage Navigation */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider uppercase block">KONSOL SIMULASI GURU (STEERING DASHBOARD)</span>
            <div className="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
              {[
                { s: 1, name: "Tahap 1", text: "Struktur Asal" },
                { s: 2, name: "Tahap 2", text: "Reaksi Gabung" },
                { s: 3, name: "Tahap 3", text: "Hasil Senyawa" }
              ].map((step) => {
                const active = simStep === step.s;
                return (
                  <button
                    key={step.s}
                    onClick={() => setSimStep(step.s)}
                    className={`py-2 px-1 text-center rounded-lg border cursor-pointer transition-all ${
                      active
                        ? 'bg-gradient-to-r from-teal-500/15 to-indigo-500/15 border-teal-500/60 text-teal-300 font-bold'
                        : 'bg-zinc-950/40 hover:bg-slate-900 border-transparent text-zinc-500'
                    }`}
                  >
                    <div className="text-[9.5px] font-mono leading-none tracking-widest uppercase">{step.name}</div>
                    <div className="text-[8.5px] font-sans mt-0.5 opacity-80">{step.text}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Compound Chemistry Fact Summary Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/40 p-5 rounded-2xl space-y-4 shadow-sm text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
                <h4 className="text-sm font-bold text-slate-100">{bondTitle}</h4>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed font-sans mt-1">
                {bondDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
              <div>
                <span className="text-zinc-600 block">DIPOLE CHARACTER</span>
                <span className="text-teal-400 mt-0.5 block font-bold">
                  {bondType === 'ionic' ? 'Sangat Tinggi (Ionik)' :
                   bondType === 'polar-covalent' ? 'Parsial Dipole (Asimetris)' :
                   bondType === 'nonpolar-covalent' ? 'Tidak Ada (Simetris)' : 'Inert'}
                </span>
              </div>
              <div>
                <span className="text-zinc-600 block">REDUKSI LELEHAN / MP</span>
                <span className="text-teal-400 mt-0.5 block font-bold">
                  {bondType === 'ionic' ? 'Sangat Tinggi (e.g. NaCl)' :
                   bondType === 'polar-covalent' ? 'Sedang-Rendah' :
                   bondType === 'nonpolar-covalent' ? 'Sangat Rendah (Gas)' : 'Inert'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right selector panel for Atom B (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-cyan-500 rounded-full" />
            <h3 className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-widest">ATOM SEKUNDER (B)</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            {labElements.map((el) => {
              const active = atomB.symbol === el.symbol;
              const disabled = atomA.symbol === el.symbol && el.symbol !== 'Cl' && el.symbol !== 'H'; // Allow duplicate H/Cl
              return (
                <button
                  key={`b-${el.symbol}`}
                  disabled={disabled}
                  onClick={() => setAtomB(el)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active 
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg relative overflow-hidden' 
                      : disabled 
                        ? 'bg-zinc-950/20 border-zinc-950 text-zinc-650 cursor-not-allowed opacity-30' 
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750'
                  }`}
                >
                  {active && <div className="absolute right-0 top-0 w-8 h-8 bg-cyan-500/20 rounded-full blur-xl" />}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black font-sans">{el.name}</span>
                    <span className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{el.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono mt-2 text-zinc-500">
                    <span>Valensi: {el.valenceElectrons}e⁻</span>
                    <span>EN: {el.electronegativity ?? '—'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Teacher's Masterclass Presentation Deck Section (Wide Panel Bottom) */}
      {!isNoble && activeCompound && (
        <div className="border border-teal-500/20 bg-slate-900/30 rounded-2xl p-6 space-y-6 text-left shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-850 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-indigo-600 text-slate-950 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-sans">Pedoman Pengajaran Kelas (Simulasi Pembentukan Senyawa)</h3>
                <p className="text-[11px] text-slate-400 leading-none mt-0.5">Analisis formasi konfigurasi atom demi pencapaian kestabilan oktet/duplet.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase leading-none">RUMUS REAKSI:</span>
              <span className="text-teal-400 font-black tracking-wide">{activeCompound.equation}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Formula & Ratio Information */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-900">
              <div className="flex items-center gap-2">
                <Beaker className="w-4.5 h-4.5 text-pink-400" />
                <span className="text-xs font-bold text-zinc-300 font-mono">IDENTITAS KIMIA</span>
              </div>
              
              <div className="space-y-3 font-sans">
                <div>
                  <span className="text-[9.5px] font-mono text-zinc-500 block leading-none">SENYAWA AKHIR:</span>
                  <span className="text-sm font-black text-white">{activeCompound.name}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-zinc-500 block leading-none">NAMA UMUM / DAGANG:</span>
                  <span className="text-sm font-bold text-teal-400">{activeCompound.commonName}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono text-zinc-500 block leading-none">PERBANDINGAN RASIO ATOM:</span>
                  <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5">{activeCompound.ratio}</p>
                </div>
              </div>
            </div>

            {/* Column 2: Mechanisms description and steps */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-slate-900 md:col-span-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4.5 h-4.5 text-yellow-400" />
                <span className="text-xs font-bold text-zinc-300 font-mono">MEKANISME LANGKAH DEMI LANGKAH GABUNGAN ELEKTRON</span>
              </div>
              
              <div className="space-y-3.5">
                {activeCompound.steps.map((rawStep, index) => {
                  const stepNumber = index + 1;
                  const isActiveStep = simStep === stepNumber;
                  return (
                    <div 
                      key={index} 
                      className={`flex gap-3 items-start p-2.5 rounded-lg border transition-all ${
                        isActiveStep 
                          ? 'bg-teal-500/10 border-teal-500/30 text-slate-200' 
                          : 'bg-transparent border-transparent opacity-50'
                      }`}
                    >
                      <button 
                        onClick={() => setSimStep(stepNumber)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-black cursor-pointer transition-all shrink-0 ${
                          isActiveStep 
                            ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20' 
                            : 'bg-slate-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {stepNumber}
                      </button>
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] font-mono font-bold text-zinc-500 leading-none block uppercase">
                          {stepNumber === 1 ? 'Persiapan Struktur' : stepNumber === 2 ? 'Proses Interaksi' : 'Kestabilan Oktet Terwujud'}
                        </span>
                        <p className="text-[10.5px] leading-relaxed text-zinc-300 mt-0.5">{rawStep}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Expert Board Classroom Advice */}
          <div className="p-4 rounded-xl bg-teal-950/10 border border-teal-500/20 flex gap-3.5 text-amber-300">
            <Award className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-teal-400 tracking-wider block uppercase">CATATAN PRESENTASI UNTUK GURU (CLASSROOM PROMPTS)</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                {activeCompound.teacherTip} <strong className="text-teal-300 font-semibold">Tanya ke siswa:</strong> Coba diskusikan apa perbedaan sifat senyawa pasca reaksi ini dengan unsur-unsur murni pembentuk aslinya di kehidupan nyata!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Electronegativity & Dipole Character Slider Sandbox */}
      <div className="border border-indigo-500/20 bg-slate-900/30 rounded-2xl p-6 space-y-6 text-left shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-850 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-slate-950 rounded-xl">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">Lab Mandiri: Sandbox Polarisasi Awan Elektron &amp; Momen Dipol</h3>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">Sesuaikan skala keelektronegatifan secara manual untuk melihat polaritas dinamis.</p>
            </div>
          </div>
          
          <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-mono font-bold">
            Interactive Dipole Simulator
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Controls Sliders (Span 5) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-4">
              {/* Atom A Electronegativity Slider */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-pink-400 font-bold uppercase tracking-wider">Keelektronegatifan Atom A:</span>
                  <span className="text-sm font-bold text-white font-mono bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/25">
                    {customEnA.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="4.0"
                  step="0.05"
                  value={customEnA}
                  onChange={(e) => setCustomEnA(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 accent-pink-500 appearance-none rounded-md cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-550">
                  <span>Alkali (Cs = 0.79)</span>
                  <span>Halogen (F = 3.98)</span>
                </div>
              </div>

              {/* Atom B Electronegativity Slider */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider">Keelektronegatifan Atom B:</span>
                  <span className="text-sm font-bold text-white font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
                    {customEnB.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="4.0"
                  step="0.05"
                  value={customEnB}
                  onChange={(e) => setCustomEnB(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 accent-cyan-400 appearance-none rounded-md cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-550">
                  <span>Alkali (Na = 0.93)</span>
                  <span>Halogen (Cl = 3.16)</span>
                </div>
              </div>
            </div>

            {/* Threshold chart explanation */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 text-xs space-y-2 font-mono">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">KLASIFIKASI IKATAN BERDASARKAN ΔEN:</span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center pb-1 border-b border-zinc-900/50">
                  <span className="text-green-400 font-bold">Nonpolar Kovalen:</span>
                  <span className="text-zinc-400 font-bold">ΔEN ≤ 0.40</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-zinc-900/50">
                  <span className="text-yellow-405 text-yellow-400 font-bold">Polar Kovalen:</span>
                  <span className="text-zinc-400 font-bold">0.40 &lt; ΔEN &lt; 2.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 font-bold">Karakter Ionik:</span>
                  <span className="text-zinc-400 font-bold">ΔEN ≥ 2.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Sandbox Screen (Span 7) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-4 relative overflow-hidden h-[330px] lg:h-auto">
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-wider">AWAN ELEKTRON (ELECTRON DENSITY CLOUD)</span>
              <div className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold text-indigo-400">
                ΔEN = {Math.abs(customEnA - customEnB).toFixed(2)}
              </div>
            </div>

            {/* Visual Arena */}
            <div className="relative w-full h-44 border border-zinc-900 rounded-xl bg-slate-950 flex justify-between items-center px-12 md:px-20 overflow-hidden">
              
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29371a_1px,transparent_1px),linear-gradient(to_bottom,#1f29371a_1px,transparent_1px)] bg-[size:10px_10px] opacity-70" />

              {/* Electron density cloud representation */}
              {(() => {
                const enDiff = Math.abs(customEnA - customEnB);
                const enBIsGreater = customEnB > customEnA;

                if (enDiff >= 2.0) {
                  return (
                    <div className="absolute inset-x-0 w-full flex justify-between items-center px-12 md:px-20 z-0">
                      {/* Positive ion shell */}
                      <div className="w-14 h-14 rounded-full bg-pink-500/15 border border-dashed border-pink-500/70 flex items-center justify-center text-pink-400 font-mono text-sm font-bold">
                        {enBIsGreater ? 'A⁺' : 'B⁺'}
                      </div>
                      <div className="w-0.5 h-10 border-l border-dashed border-zinc-800" />
                      {/* Negative ion filled shell with electron */}
                      <div className="w-16 h-16 rounded-full bg-cyan-400/25 border border-cyan-500/80 flex items-center justify-center text-cyan-300 font-mono text-sm font-black relative animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        {enBIsGreater ? 'B⁻' : 'A⁻'}
                        <div className="absolute right-1 top-2 w-3 h-3 rounded-full bg-teal-400 border border-slate-950 font-sans text-[7.5px] font-black text-black flex items-center justify-center">-</div>
                      </div>
                    </div>
                  );
                } else if (enDiff <= 0.4) {
                  return (
                    <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-36 h-14 bg-gradient-to-r from-pink-500/25 via-sky-450/40 to-cyan-500/25 rounded-full border border-sky-400/30 blur-[1px] z-0 flex justify-between items-center px-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                      <div className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>
                  );
                } else {
                  const leftRadius = enBIsGreater ? '30% 70% 70% 30% / 50% 50% 50% 50%' : '70% 30% 30% 70% / 50% 50% 50% 50%';

                  return (
                    <div 
                      className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[160px] h-16 bg-gradient-to-r from-pink-500/20 via-sky-405/35 to-cyan-500/20 border border-sky-400/40 blur-[1px] z-0"
                      style={{
                        borderRadius: leftRadius
                      }}
                    />
                  );
                }
              })()}

              {/* Atom A node */}
              <div className="w-12 h-12 bg-slate-950 rounded-full border-2 border-pink-500 shadow-md flex flex-col items-center justify-center text-white z-10 font-bold relative">
                <span className="text-[11px]">Atom A</span>
                {customEnA !== customEnB && (
                  <span className="absolute -top-5 text-[10px] font-mono text-pink-400 font-black leading-none">
                    {customEnA > customEnB ? 'δ⁻' : 'δ⁺'}
                  </span>
                )}
              </div>

              {/* Dipole Direction Vector line & arrow */}
              {(() => {
                const enDiff = Math.abs(customEnA - customEnB);
                if (enDiff > 0.15 && enDiff < 2.0) {
                  const enBIsGreater = customEnB > customEnA;
                  const arrowLength = Math.min(100, enDiff * 45);
                  return (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <div className="flex flex-col items-center pb-2">
                        {/* Red dipole arrow */}
                        <div 
                          className="h-1.5 bg-rose-500 relative flex items-center justify-end rounded"
                          style={{ 
                            width: `${arrowLength}px`,
                            transform: enBIsGreater ? 'rotate(0deg)' : 'rotate(180deg)',
                            transition: 'width 0.2s ease-out'
                          }}
                        >
                          <div className="absolute left-0 -top-1.5 font-mono text-[10px] font-black text-rose-550 -translate-x-[6px]">+</div>
                          <div className="border-[4px] border-transparent border-l-rose-500 w-0 h-0" />
                        </div>
                        <span className="text-[8px] font-mono font-bold text-rose-450 tracking-widest mt-1">
                          VEKTOR DIPOL (μ)
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Atom B node */}
              <div className="w-12 h-12 bg-slate-950 rounded-full border-2 border-cyan-500 shadow-md flex flex-col items-center justify-center text-white z-10 font-bold relative">
                <span className="text-[11px]">Atom B</span>
                {customEnA !== customEnB && (
                  <span className="absolute -top-5 text-[10px] font-mono text-cyan-400 font-black leading-none">
                    {customEnB > customEnA ? 'δ⁻' : 'δ⁺'}
                  </span>
                )}
              </div>

            </div>

            {/* Dynamic Chemistry Explanation */}
            <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-white">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Analisis Sifat Ikatan Molekul:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300 font-sans mt-1 font-medium">
                {(() => {
                  const enDiff = Math.abs(customEnA - customEnB);
                  if (enDiff <= 0.40) {
                    return "Kovalen Nonpolar: Karena perbedaan kekuatan menarik elektron sangat kecil (ΔEN ≤ 0.40), kerapatan awan elektron dibagi secara simetris di tengah. Tidak ada penumpukan muatan, sehingga molekul memiliki kepolaran nol / homogen murni.";
                  } else if (enDiff < 2.00) {
                    const enHighestSym = customEnB > customEnA ? 'B' : 'A';
                    return `Kovalen Polar: Perbedaan penarikan elektron sedang (ΔEN = ${enDiff.toFixed(2)}). Elektron cenderung mengorbit lebih lama di dekat Atom ${enHighestSym} yang lebih elektronegatif, memompa muatan parsial negatif (δ⁻) di sisi tersebut, dan memunculkan momen dipol asimetris.`;
                  } else {
                    const enHighestSym = customEnB > customEnA ? 'B' : 'A';
                    const electroposSym = customEnB > customEnA ? 'A' : 'B';
                    return `Karakter Ionik Dominan: Perbedaan keelektronegatifan ekstrem (ΔEN = ${enDiff.toFixed(2)}). Atom ${electroposSym} tidak dapat menahan elektron luarnya dan menyerahkannya sepenuhnya kepada Atom ${enHighestSym}. Terjadi pemisahan muatan ionik nyata (+ dan -) berinteraksi elektrostatik Coulomb.`;
                  }
                })()}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
