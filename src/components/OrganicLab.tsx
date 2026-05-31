/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, 
  FlaskConical, 
  HelpCircle, 
  RotateCw, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw, 
  Play, 
  Thermometer, 
  Flame, 
  Info, 
  Award,
  ChevronRight,
  TrendingDown,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// DATA STRUCTURES & DATA CONSTANTS (INDO)
// ==========================================

export interface GroupMeta {
  id: string;
  name: string; // Indonesian name
  generalFormula: string;
  iupacSuffix: string;
  description: string;
  polarization: string;
  boilingTrend: string;
  solubilityTrend: string;
}

export const ORGANIC_GROUPS: GroupMeta[] = [
  {
    id: 'alkane',
    name: 'Alkana (Hidrokarbon Jenuh)',
    generalFormula: 'C_n H_{2n+2}',
    iupacSuffix: '-ana',
    description: 'Senyawa hidrokarbon rantai terbuka jenuh dengan ikatan tunggal C-C. Memiliki reaktivitas yang relatif rendah (parafin), berfungsi sebagai bahan bakar utama.',
    polarization: 'Nonpolar. Hanya ada gaya dispersi London antar molekul.',
    boilingTrend: 'Titik didih meningkat seiring bertambahnya rantai C karena luas permukaan kontak gaya London yang membesar.',
    solubilityTrend: 'Tidak larut dalam air (hidrofobik). Larut baik dalam pelarut nonpolar seperti benzena atau eter.'
  },
  {
    id: 'alkene',
    name: 'Alkena (Hidrokarbon Tak Jenuh)',
    generalFormula: 'C_n H_{2n}',
    iupacSuffix: '-ena',
    description: 'Hidrokarbon tak jenuh yang memiliki minimal satu ikatan rangkap dua C=C. Jauh lebih reaktif dibandingkan alkana, mudah mengalami reaksi adisi.',
    polarization: 'Sangat sedikit polar hingga nonpolar, tergantung simetri molekul.',
    boilingTrend: 'Hampir mirip dengan alkana dengan jumlah C yang sama, meningkat seiring bertambahnya massa molekul.',
    solubilityTrend: 'Tidak larut dalam air. Larut dalam pelarut organik nonpolar.'
  },
  {
    id: 'alkyne',
    name: 'Alkina (Hidrokarbon Tak Jenuh)',
    generalFormula: 'C_n H_{2n-2}',
    iupacSuffix: '-una',
    description: 'Hidrokarbon tak jenuh dengan satu ikatan rangkap tiga C≡C. Paling reaktif di antara hidrokarbon alifatik sederhana karena kerapatan elektron tinggi di area ikatan rangkap tiga.',
    polarization: 'Sedikit lebih polar dibandingkan alkana dan alkena karena hibridisasi sp karbon yang menarik elektron lebih kuat.',
    boilingTrend: 'Sedikit lebih tinggi dibanding alkana dan alkena sepadan akibat polarisabilitas awan elektron sp yang lebih rapat.',
    solubilityTrend: 'Tidak larut dalam air, larut dalam pelarut nonpolar.'
  },
  {
    id: 'alcohol',
    name: 'Alkohol (Alkanol)',
    generalFormula: 'R - OH',
    iupacSuffix: '-ol',
    description: 'Senyawa organik yang memiliki gugus fungsi hidroksil (-OH) terikat pada atom karbon jenuh. Memiliki kegunaan industri yang luas sebagai pelarut dan antiseptik.',
    polarization: 'Sangat polar karena adanya ikatan O-H. Mampu membentuk ikatan hidrogen antar molekul.',
    boilingTrend: 'Sangat tinggi dibandingkan hidrokarbon bermassa molekul seimbang karena memerlukan energi extra besar untuk memutus ikatan hidrogen.',
    solubilityTrend: 'Rantai pendek (C1-C3) sangat larut dalam air (bercampur sempurna), kelarutan menurun drastis mulai C4 ke atas karena dominasi rantai nonpolar alifatik.'
  },
  {
    id: 'ether',
    name: 'Eter (Alkoksi Alkana)',
    generalFormula: 'R - O - R\'',
    iupacSuffix: '-oksi -ana',
    description: 'Senyawa dengan gugus fungsional eter (-O-) yang menjembatani dua gugus alkil. Sifatnya volatil, sempat populer sebagai zat anestesi.',
    polarization: 'Sedikit polar pada ikatan C-O-C, namun tidak dapat membentuk ikatan hidrogen sesama dirinya.',
    boilingTrend: 'Jauh lebih rendah daripada alkohol isomeriknya dengan jumlah karbon sama, cenderung dekat dengan titik didih alkana.',
    solubilityTrend: 'Cukup larut dalam air untuk rantai sangat pendek karena dapat menerima ikatan hidrogen dari molekul air.'
  },
  {
    id: 'aldehyde',
    name: 'Aldehida (Alkanal)',
    generalFormula: 'R - CHO',
    iupacSuffix: '-al',
    description: 'Senyawa dengan gugus karbonil terminal (C=O di ujung). Mudah dioksidasi menjadi asam karboksilat, dapat diuji dengan pereaksi Fehling atau Tollens.',
    polarization: 'Polar sedang sampai kuat karena gugus karbonil C=O yang sangat terpolarisasi.',
    boilingTrend: 'Lebih tinggi dibandingkan eter dan alkana karena tarik-menarik dipol-dipol, namun masih di bawah alkohol lantaran absennya ikatan hidrogen.',
    solubilityTrend: 'Suku rendah larut baik dalam air karena hidrasi oksigen karbonil oleh hidrogen dari molekul air.'
  },
  {
    id: 'ketone',
    name: 'Keton (Alkanon)',
    generalFormula: 'R - CO - R\'',
    iupacSuffix: '-on',
    description: 'Senyawa dengan gugus karbonil non-terminal (C=O di tengah). Stabil terhadap oksidasi ringan. Aseton adalah pelarut organik keton terpopuler.',
    polarization: 'Sangat polar akibat dipol permanen ikatan ganda karbonil (C=O).',
    boilingTrend: 'Mirip atau sedikit lebih tinggi dari aldehida isomeriknya karena sifat dipol-dipol yang kuat.',
    solubilityTrend: 'Suku rendah (seperti propanon) larut sempurna dalam air.'
  },
  {
    id: 'carboxylic_acid',
    name: 'Asam Karboksilat (Asam Alkanoat)',
    generalFormula: 'R - COOH',
    iupacSuffix: 'Asam ... -oat',
    description: 'Asam organik lemah yang dicirikan oleh gugus karboksil (-COOH). Menunjukkan sifat keasaman khas dengan melepaskan proton H+ dalam air.',
    polarization: 'Sangat polar. Memiliki kemampuan ganda untuk berikatan hidrogen membentuk senyawa dimer yang sangat stabil.',
    boilingTrend: 'Sangat tinggi, bahkan melebihi alkohol dari rantai C sebanding karena formasi dimer ikatan hidrogen yang kokoh.',
    solubilityTrend: 'Asam format, asetat, dan propionat bercampur sempurna dalam air. Kelarutan menurun cepat seiring membentangnya rantai hidrofobik.'
  },
  {
    id: 'ester',
    name: 'Ester (Alkil Alkanoat)',
    generalFormula: 'R - COO - R\'',
    iupacSuffix: '-il ... -oat',
    description: 'Senyawa hasil kondensasi asam karboksilat dan alkohol. Umumnya berbau harum manis buah-buahan, dimanfaatkan sebagai esens sintetis makanan/parfum.',
    polarization: 'Polar sedang. Mengandung gugus karbonil teresterifikasi C(=O)-O.',
    boilingTrend: 'Mirip dengan keton/aldehida dengan ukuran setara, jauh di bawah asam karboksilat induknya karena tiada ikatan hidrogen.',
    solubilityTrend: 'Sedikit larut dalam air untuk rantai kecil, sangat larut dalam pelarut organik konvensional.'
  }
];

export interface CompoundDetails {
  formula: string;
  iupacName: string;
  commonName: string;
  boilingPoint: number; // in Celsius
  solubility: string; // Kelarutan
  phase: 'Gas' | 'Cair' | 'Padat';
  odor: string; // Bau khas
  everydayUse: string; // Manfaat praktis
}

const COMPOUND_DB: Record<string, Record<number, CompoundDetails>> = {
  alkane: {
    1: { formula: 'CH4', iupacName: 'Metana', commonName: 'Gas Rawa / Gas Alam', boilingPoint: -161.5, solubility: 'Sangat tidak larut', phase: 'Gas', odor: 'Tidak berbau (alami)', everydayUse: 'Bahan bakar gas utama (LPG/LNG), pemanas rumah tangga.' },
    2: { formula: 'C2H6', iupacName: 'Etana', commonName: 'Dimetil', boilingPoint: -89, solubility: 'Sangat tidak larut', phase: 'Gas', odor: 'Tidak berbau', everydayUse: 'Bahan baku industri petrokimia untuk pembuatan etena.' },
    3: { formula: 'C3H8', iupacName: 'Propana', commonName: 'Propil Hidrida', boilingPoint: -42, solubility: 'Sangat tidak larut', phase: 'Gas', odor: 'Tidak berbau', everydayUse: 'Komponen utama gas elpiji (LPG) portabel, gas pembakar obor.' },
    4: { formula: 'C4H10', iupacName: 'Butana', commonName: 'n-Butana', boilingPoint: -0.5, solubility: 'Tidak larut', phase: 'Gas', odor: 'Bau gas khas', everydayUse: 'Bahan bakar pemantik api (korek gas), propelan aerosol kaleng.' },
    5: { formula: 'C5H12', iupacName: 'Pentana', commonName: 'n-Pentana', boilingPoint: 36.1, solubility: 'Tidak larut', phase: 'Cair', odor: 'Bau bensin lemah', everydayUse: 'Pelarut laboratorium khusus, zat peniup pembuatan busa polistirena.' },
  },
  alkene: {
    2: { formula: 'C2H4', iupacName: 'Etena', commonName: 'Etilena', boilingPoint: -103.7, solubility: 'Sangat sedikit larut', phase: 'Gas', odor: 'Manis samar', everydayUse: 'Hormon pematangan buah buatan, sintesis plastik polietilena.' },
    3: { formula: 'C3H6', iupacName: 'Propena', commonName: 'Propilena', boilingPoint: -47.6, solubility: 'Sangat sedikit larut', phase: 'Gas', odor: 'Bau gas manis', everydayUse: 'Bahan dasar serat sintetis polipropilena (botol plastik keras).' },
    4: { formula: 'C4H8', iupacName: '1-Butena', commonName: 'Butilena', boilingPoint: -6.3, solubility: 'Tidak larut', phase: 'Gas', odor: 'Bau hidrokarbon', everydayUse: 'Komonomer bagi produksi polietilen densitas rendah linier (LLDPE).' },
    5: { formula: 'C5H10', iupacName: '1-Pentena', commonName: 'Amilena', boilingPoint: 30, solubility: 'Tidak larut', phase: 'Cair', odor: 'Bau menyengat', everydayUse: 'Bahan aditif peningkatan oktan bensin premium.' },
  },
  alkyne: {
    2: { formula: 'C2H2', iupacName: 'Etuna', commonName: 'Asetilena / Gas Karbit', boilingPoint: -84, solubility: 'Sedikit larut', phase: 'Gas', odor: 'Menyengat (karbit)', everydayUse: 'Bahan bakar las karbit bersuhu ultra tinggi, pematangan buah.' },
    3: { formula: 'C3H4', iupacName: 'Propuna', commonName: 'Metilasetilena', boilingPoint: -23.2, solubility: 'Hampir tidak larut', phase: 'Gas', odor: 'Manis samar', everydayUse: 'Komponen gas khusus untuk pemotongan logam industri panas.' },
    4: { formula: 'C4H6', iupacName: '1-Butuna', commonName: 'Etilasetilena', boilingPoint: 8.1, solubility: 'Tidak larut', phase: 'Gas', odor: 'Bau khas gas', everydayUse: 'Sintesis intermediat senyawa alkil organik kompleks.' },
    5: { formula: 'C5H8', iupacName: '1-Pentuna', commonName: 'Propilasetilena', boilingPoint: 40.2, solubility: 'Tidak larut', phase: 'Cair', odor: 'Aroma tajam', everydayUse: 'Agen sintesis khusus bidang riset kimia farmasi.' },
  },
  alcohol: {
    1: { formula: 'CH3OH', iupacName: 'Metanol', commonName: 'Spiritus / Alkohol Kayu', boilingPoint: 64.7, solubility: 'Larut sempurna', phase: 'Cair', odor: 'Bau tajam khas alkohol', everydayUse: 'Bahan bakar balap, pelarut industri, toksik menyebabkan kebutaan.' },
    2: { formula: 'C2H5OH', iupacName: 'Etanol', commonName: 'Alkohol Gandum / Etanol', boilingPoint: 78.4, solubility: 'Larut sempurna', phase: 'Cair', odor: 'Aroma khas menyegarkan', everydayUse: 'Antiseptik medis (70%), pelarut parfum, bahan bakar bioetanol.' },
    3: { formula: 'C3H7OH', iupacName: '1-Propanol', commonName: 'n-Propil Alkohol', boilingPoint: 97.2, solubility: 'Larut sempurna', phase: 'Cair', odor: 'Aroma menyengat', everydayUse: 'Pelarut kosmetik, cat kuku, cairan resin industri lilin.' },
    4: { formula: 'C4H9OH', iupacName: '1-Butanol', commonName: 'n-Butil Alkohol', boilingPoint: 117.7, solubility: 'Cukup larut (7.3 g/100 mL)', phase: 'Cair', odor: 'Bau pisang busuk', everydayUse: 'Senyawa pengencer cat (thinner), agen ekstraksi minyak esensial.' },
    5: { formula: 'C5H11OH', iupacName: '1-Pentanol', commonName: 'n-Amil Alkohol', boilingPoint: 138, solubility: 'Kurang larut (2.2 g/100 mL)', phase: 'Cair', odor: 'Bau minyak tajam', everydayUse: 'Bahan pembuat ester amil asetat yang beraroma pisang rimbun.' },
  },
  ether: {
    2: { formula: 'CH3OCH3', iupacName: 'Metoksi Metana', commonName: 'Dimetil Eter (DME)', boilingPoint: -24, solubility: 'Larut baik', phase: 'Gas', odor: 'Eterik manis', everydayUse: 'Propelan kaleng semprot ramah lingkungan menggantikan Freon.' },
    3: { formula: 'CH3OC2H5', iupacName: 'Metoksi Etana', commonName: 'Etil Metil Eter', boilingPoint: 7.4, solubility: 'Sedikit larut', phase: 'Gas', odor: 'Bau obat bius manis', everydayUse: 'Riset pendingin temperatur rendah.' },
    4: { formula: 'C2H5OC2H5', iupacName: 'Etoksi Etana', commonName: 'Dietil Eter / Eter', boilingPoint: 34.6, solubility: 'Sedikit larut (6.9 g/100mL)', phase: 'Cair', odor: 'Khas menyengat tajam', everydayUse: 'Zat anestesi bedah klasik, zat pelarut ekstraksi lemak.' },
    5: { formula: 'C2H5OC3H7', iupacName: 'Etoksi Propana', commonName: 'Etil Propil Eter', boilingPoint: 64, solubility: 'Sangat sedikit larut', phase: 'Cair', odor: 'Bau kimia manis', everydayUse: 'Pelarut reaksi sintesis senyawa Grignard.' },
  },
  aldehyde: {
    1: { formula: 'HCHO', iupacName: 'Metanal', commonName: 'Formaldehida / Formalin', boilingPoint: -19, solubility: 'Sangat larut', phase: 'Gas', odor: 'Menyesakkan hidung', everydayUse: 'Pengawet spesimen biologi, industri pembuatan lem kayu.' },
    2: { formula: 'CH3CHO', iupacName: 'Etanal', commonName: 'Asetaldehida', boilingPoint: 20.2, solubility: 'Bercampur sempurna', phase: 'Cair', odor: 'Buah layu menyengat', everydayUse: 'Bahan baku antara pembuatan asam asetat, plastik polimer.' },
    3: { formula: 'C2H5CHO', iupacName: 'Propanal', commonName: 'Propionaldehida', boilingPoint: 48, solubility: 'Sangat larut', phase: 'Cair', odor: 'Bau buah tajam', everydayUse: 'Bahan sintesis plastik termoseting resin dural.' },
    4: { formula: 'C3H7CHO', iupacName: 'Butanal', commonName: 'Butiraldehida', boilingPoint: 74.8, solubility: 'Sedikit larut', phase: 'Cair', odor: 'Tajam tengik', everydayUse: 'Bahan baku plastik resin butiral lem kaca safety mobil.' },
    5: { formula: 'C4H9CHO', iupacName: 'Pentanal', commonName: 'Valeraldehida', boilingPoint: 103, solubility: 'Kurang larut', phase: 'Cair', odor: 'Kacang menyengat', everydayUse: 'Aditif resin, zat perasa makanan skala kecil.' },
  },
  ketone: {
    3: { formula: 'CH3COCH3', iupacName: 'Propanon', commonName: 'Aseton', boilingPoint: 56.1, solubility: 'Sangat larut', phase: 'Cair', odor: 'Bau tajam dingin manis', everydayUse: 'Pembersih kutek/cat kuku, pelarut plastik abs dalam reparasi.' },
    4: { formula: 'CH3COC2H5', iupacName: 'Butanon', commonName: 'Metil Etil Keton (MEK)', boilingPoint: 79.6, solubility: 'Larut baik', phase: 'Cair', odor: 'Bau pelarut tajam', everydayUse: 'Pelarut cat vinil, tinta cetak sablon, lem karet pipa.' },
    5: { formula: 'CH3COC3H7', iupacName: '2-Pentanon', commonName: 'Metil Propil Keton', boilingPoint: 102, solubility: 'Sedikit larut', phase: 'Cair', odor: 'Bau asetonik', everydayUse: 'Agen perasa makanan komersial, sintesis alkil.' },
  },
  carboxylic_acid: {
    1: { formula: 'HCOOH', iupacName: 'Asam Metanoat', commonName: 'Asam Format / Asam Semut', boilingPoint: 100.8, solubility: 'Sangat larut', phase: 'Cair', odor: 'Sangat menusuk asam', everydayUse: 'Koagulasi (menggumpalkan) getah karet latex, industri tekstil.' },
    2: { formula: 'CH3COOH', iupacName: 'Asam Etanoat', commonName: 'Asam Asetat / Cuka Makan', boilingPoint: 118.1, solubility: 'Sangat larut', phase: 'Cair', odor: 'Menyengat masam', everydayUse: 'Cuka dapur (konsentrasi 5%), pengatur pH industri makanan.' },
    3: { formula: 'C2H5COOH', iupacName: 'Asam Propanat', commonName: 'Asam Propionat', boilingPoint: 141, solubility: 'Sangat larut', phase: 'Cair', odor: 'Mentega tengik samar', everydayUse: 'Pengawet roti anti-jamur (sebagai kalsium propionat).' },
    4: { formula: 'C3H7COOH', iupacName: 'Asam Butanat', commonName: 'Asam Butirat', boilingPoint: 163.5, solubility: 'Sangat larut', phase: 'Cair', odor: 'Keringat/mentega busuk', everydayUse: 'Pembuatan esens aroma nanas (esterifikasi etil butirat).' },
    5: { formula: 'C4H9COOH', iupacName: 'Asam Pentanat', commonName: 'Asam Valerat', boilingPoint: 185.4, solubility: 'Sedikit larut', phase: 'Cair', odor: 'Kaki kotor menyengat', everydayUse: 'Industri sintetis cairan pelumas motor hidrolis khusus.' },
  },
  ester: {
    2: { formula: 'HCOOCH3', iupacName: 'Metil Metanoat', commonName: 'Metil Format', boilingPoint: 32, solubility: 'Sangat larut', phase: 'Cair', odor: 'Aroma segar manis', everydayUse: 'Fumigan pertanian, pembuatan pelarut serbaguna formamida.' },
    3: { formula: 'CH3COOCH3', iupacName: 'Metil Etanoat', commonName: 'Metil Asetat', boilingPoint: 56.9, solubility: 'Cukup larut', phase: 'Cair', odor: 'Bau lem manis akrilik', everydayUse: 'Bahan pelepaskan kosmetik lem bulu mata palsu.' },
    4: { formula: 'CH3COOC2H5', iupacName: 'Etil Etanoat', commonName: 'Etil Asetat', boilingPoint: 77.1, solubility: 'Sedikit larut', phase: 'Cair', odor: 'Aroma buah jernih', everydayUse: 'Esens pembuat rasa buah pir/pisang murni, pelarut cat kuku.' },
    5: { formula: 'CH3COOC3H7', iupacName: 'Propil Etanoat', commonName: 'Propil Asetat', boilingPoint: 101, solubility: 'Sangat sedikit larut', phase: 'Cair', odor: 'Bau buah pir harum', everydayUse: 'Aroma peningkat buah buatan kue, aerosol penyegar ruang.' },
  }
};

// ==========================================
// 3D MATH PROJECTION ENGINE (MOLECULE DRAWER)
// ==========================================

interface Atom3D {
  id: string;
  symbol: 'C' | 'H' | 'O' | 'Cl';
  rawX: number;
  rawY: number;
  rawZ: number;
  color: string;
  radius: number;
}

interface Bond3D {
  from: string;
  to: string;
  type: 'single' | 'double' | 'triple';
}

const ATOM_STYLES = {
  C: { color: '#3f3f46', radius: 18, labelColor: '#f4f4f5' },
  H: { color: '#e4e4e7', radius: 11, labelColor: '#18181b' },
  O: { color: '#ef4444', radius: 15, labelColor: '#ffffff' },
  Cl: { color: '#22c55e', radius: 16, labelColor: '#ffffff' }
};

// Generates atoms structure on-the-fly to prevent massive hardcoded static declarations
function generateMoleculeData(groupId: string, carbonCount: number): { atoms: Atom3D[], bonds: Bond3D[] } {
  const atoms: Atom3D[] = [];
  const bonds: Bond3D[] = [];

  const addAtom = (sym: 'C' | 'H' | 'O' | 'Cl', x: number, y: number, z: number): string => {
    const style = ATOM_STYLES[sym];
    const id = `${sym}_${atoms.length}`;
    atoms.push({
      id,
      symbol: sym,
      rawX: x,
      rawY: y,
      rawZ: z,
      color: style.color,
      radius: style.radius
    });
    return id;
  };

  const addBond = (from: string, to: string, type: 'single' | 'double' | 'triple' = 'single') => {
    bonds.push({ from, to, type });
  };

  if (groupId === 'alkane' || groupId === 'alkene' || groupId === 'alkyne') {
    const cIds: string[] = [];
    // Generate Carbon chain
    for (let i = 0; i < carbonCount; i++) {
      const cx = (i - (carbonCount - 1) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      const cz = 0;
      cIds.push(addAtom('C', cx, cy, cz));
    }

    // Connect Carbons
    for (let i = 0; i < carbonCount - 1; i++) {
      let bType: 'single' | 'double' | 'triple' = 'single';
      if (i === 0) {
        if (groupId === 'alkene') bType = 'double';
        if (groupId === 'alkyne') bType = 'triple';
      }
      addBond(cIds[i], cIds[i+1], bType);
    }

    // Attach Hydrogens based on capacity
    for (let i = 0; i < carbonCount; i++) {
      const cx = (i - (carbonCount - 1) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      const isTerminalLeft = i === 0;
      const isTerminalRight = i === carbonCount - 1;

      let maxH = 2;
      if (isTerminalLeft || isTerminalRight) maxH = 3;
      if (carbonCount === 1) maxH = 4;

      // Subtract due to double/triple bonds at carbon index 0 & 1
      if (groupId === 'alkene') {
        if (i === 0 || i === 1) maxH -= 1;
      } else if (groupId === 'alkyne') {
        if (i === 0 || i === 1) maxH -= 2;
      }

      let hCount = 0;
      
      // Top hydrogen
      if (hCount < maxH) {
        const hy = cy + (i % 2 === 0 ? 40 : -40);
        const hid = addAtom('H', cx, hy, 0);
        addBond(cIds[i], hid);
        hCount++;
      }
      
      // Front & Back hydrogens
      if (hCount < maxH) {
        const hid = addAtom('H', cx - 12, cy + (i % 2 === 0 ? -15 : 15), 32);
        addBond(cIds[i], hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx + 12, cy + (i % 2 === 0 ? -15 : 15), -32);
        addBond(cIds[i], hid);
        hCount++;
      }

      // Left extra hydrogen for terminal left
      if (isTerminalLeft && hCount < maxH) {
        const hid = addAtom('H', cx - 40, cy, 0);
        addBond(cIds[i], hid);
        hCount++;
      }
      // Right extra hydrogen for terminal right
      if (isTerminalRight && hCount < maxH) {
        const hid = addAtom('H', cx + 40, cy, 0);
        addBond(cIds[i], hid);
        hCount++;
      }
    }
  } else if (groupId === 'alcohol') {
    const cIds: string[] = [];
    for (let i = 0; i < carbonCount; i++) {
      const cx = (i - (carbonCount) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      cIds.push(addAtom('C', cx, cy, 0));
    }
    // Connect carbons
    for (let i = 0; i < carbonCount - 1; i++) {
      addBond(cIds[i], cIds[i+1]);
    }
    // Attach Hydrogens to Carbons
    for (let i = 0; i < carbonCount; i++) {
      const cx = (i - (carbonCount) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      const isTerminalLeft = i === 0;
      
      let maxH = 2;
      if (isTerminalLeft) maxH = 3;
      if (carbonCount === 1) maxH = 3; // Metanol C has 3 H's and 1 OH
      
      let hCount = 0;
      if (hCount < maxH) {
        const hid = addAtom('H', cx, cy + (i % 2 === 0 ? 40 : -40), 0);
        addBond(cIds[i], hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx - 12, cy + (i % 2 === 0 ? -15 : 15), 32);
        addBond(cIds[i], hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx + 12, cy + (i % 2 === 0 ? -15 : 15), -32);
        addBond(cIds[i], hid);
        hCount++;
      }
      if (isTerminalLeft && hCount < maxH) {
        const hid = addAtom('H', cx - 40, cy, 0);
        addBond(cIds[0], hid);
      }
    }
    // Add OH group linked to the last Carbon
    const lastIdx = carbonCount - 1;
    const lcx = (lastIdx - (carbonCount) / 2) * 60;
    const lcy = (lastIdx % 2 === 0 ? 12 : -12);

    const oid = addAtom('O', lcx + 42, lcy + 25, 10);
    addBond(cIds[lastIdx], oid);

    const ohid = addAtom('H', lcx + 58, lcy + 12, 28);
    addBond(oid, ohid);

  } else if (groupId === 'ether') {
    // E.g. C - O - C chains. Let's make it C_left - O - C_right
    const leftCount = Math.floor(carbonCount / 2) || 1;
    const rightCount = carbonCount - leftCount;
    const totalHeavyAtoms = leftCount + rightCount + 1; // plus oxygen

    const heavyIds: string[] = [];
    const syms: ('C' | 'O')[] = [];

    for (let i = 0; i < leftCount; i++) syms.push('C');
    syms.push('O');
    for (let i = 0; i < rightCount; i++) syms.push('C');

    syms.forEach((sym, idx) => {
      const x = (idx - (totalHeavyAtoms - 1) / 2) * 55;
      const y = (idx % 2 === 0 ? 10 : -10);
      heavyIds.push(addAtom(sym, x, y, 0));
    });

    for (let i = 0; i < totalHeavyAtoms - 1; i++) {
      addBond(heavyIds[i], heavyIds[i+1]);
    }

    // Attach H's to Carbon atoms
    heavyIds.forEach((id, idx) => {
      if (syms[idx] === 'O') return;
      const cx = (idx - (totalHeavyAtoms - 1) / 2) * 55;
      const cy = (idx % 2 === 0 ? 10 : -10);
      const isExtreme = idx === 0 || idx === totalHeavyAtoms - 1;
      const maxH = isExtreme ? 3 : 2;

      let hCount = 0;
      if (hCount < maxH) {
        const hid = addAtom('H', cx, cy + (idx % 2 === 0 ? 40 : -40), 0);
        addBond(id, hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx - 12, cy + (idx % 2 === 0 ? -12 : 12), 30);
        addBond(id, hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx + 12, cy + (idx % 2 === 0 ? -12 : 12), -30);
        addBond(id, hid);
        hCount++;
      }
    });

  } else if (groupId === 'aldehyde') {
    // R - C(=O) - H. Terminal C=O is last
    const cIds: string[] = [];
    for (let i = 0; i < carbonCount; i++) {
      const cx = (i - (carbonCount) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      cIds.push(addAtom('C', cx, cy, 0));
    }
    for (let i = 0; i < carbonCount - 1; i++) {
      addBond(cIds[i], cIds[i+1]);
    }

    // Hydrogens for base carbons (except the last carbonyl carbon)
    for (let i = 0; i < carbonCount - 1; i++) {
      const cx = (i - (carbonCount) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      const isTerminalLeft = i === 0;
      const maxH = isTerminalLeft ? 3 : 2;

      let hCount = 0;
      if (hCount < maxH) {
        const hid = addAtom('H', cx, cy + (i % 2 === 0 ? 40 : -40), 0);
        addBond(cIds[i], hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx - 12, cy + (i % 2 === 0 ? -15 : 15), 32);
        addBond(cIds[i], hid);
        hCount++;
      }
      if (isTerminalLeft && hCount < maxH) {
        const hid = addAtom('H', cx - 40, cy, 0);
        addBond(cIds[0], hid);
      }
    }

    // Carbonyl details on the last Carbon
    const lastCId = cIds[carbonCount - 1];
    const lcx = (carbonCount - 1 - (carbonCount) / 2) * 60;
    const lcy = (carbonCount - 1 % 2 === 0 ? 12 : -12);

    const oid = addAtom('O', lcx + 15, lcy + 42, 0);
    addBond(lastCId, oid, 'double');

    const hid = addAtom('H', lcx + 42, lcy - 20, 0);
    addBond(lastCId, hid);

  } else if (groupId === 'ketone') {
    // Inside carbonyl group, e.g. C - C(=O) - C. Let's make C1 the C=O terminal
    const cIds: string[] = [];
    for (let i = 0; i < carbonCount; i++) {
      const cx = (i - (carbonCount - 1) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      cIds.push(addAtom('C', cx, cy, 0));
    }
    for (let i = 0; i < carbonCount - 1; i++) {
      addBond(cIds[i], cIds[i+1]);
    }

    // Carbonyl Oxygen on C1
    const carbonylId = cIds[1];
    const cx1 = (1 - (carbonCount - 1) / 2) * 60;
    const cy1 = (1 % 2 === 0 ? 12 : -12);
    const oid = addAtom('O', cx1, cy1 + 42, 0);
    addBond(carbonylId, oid, 'double');

    // Add Hydrogens to C-0 (3H) and other C-i (except C1 which has no H)
    cIds.forEach((id, i) => {
      if (i === 1) return; // Carbonyl carbon has 0 Hydrogens
      const cx = (i - (carbonCount - 1) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      const isExtreme = i === 0 || i === carbonCount - 1;
      const maxH = isExtreme ? 3 : 2;

      let hCount = 0;
      if (hCount < maxH) {
        const hid = addAtom('H', cx, cy + (i % 2 === 0 ? 40 : -40), 0);
        addBond(id, hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx - 12, cy + (i % 2 === 0 ? -15 : 15), 32);
        addBond(id, hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx + 12, cy + (i % 2 === 0 ? -15 : 15), -32);
        addBond(id, hid);
        hCount++;
      }
    });

  } else if (groupId === 'carboxylic_acid') {
    // R - C(=O) - O - H
    const cIds: string[] = [];
    for (let i = 0; i < carbonCount; i++) {
      const cx = (i - (carbonCount) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      cIds.push(addAtom('C', cx, cy, 0));
    }
    for (let i = 0; i < carbonCount - 1; i++) {
      addBond(cIds[i], cIds[i+1]);
    }

    // Add Hydrogens for other C's except terminal karboksilat C
    for (let i = 0; i < carbonCount - 1; i++) {
      const cx = (i - (carbonCount) / 2) * 60;
      const cy = (i % 2 === 0 ? 12 : -12);
      const isTerminalLeft = i === 0;
      const maxH = isTerminalLeft ? 3 : 2;

      let hCount = 0;
      if (hCount < maxH) {
        const hid = addAtom('H', cx, cy + (i % 2 === 0 ? 40 : -40), 0);
        addBond(cIds[i], hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx - 12, cy + (i % 2 === 0 ? -15 : 15), 32);
        addBond(cIds[i], hid);
        hCount++;
      }
      if (isTerminalLeft && hCount < maxH) {
        const hid = addAtom('H', cx - 40, cy, 0);
        addBond(cIds[0], hid);
      }
    }

    // Carboxyl atoms on the last Carbon
    const lastCId = cIds[carbonCount - 1];
    const lcx = (carbonCount - 1 - (carbonCount) / 2) * 60;
    const lcy = (carbonCount - 1 % 2 === 0 ? 12 : -12);

    const oDoubleId = addAtom('O', lcx + 12, lcy + 42, 0);
    addBond(lastCId, oDoubleId, 'double');

    const oSingleId = addAtom('O', lcx + 42, lcy - 15, 10);
    addBond(lastCId, oSingleId);

    const hid = addAtom('H', lcx + 56, lcy - 12, 28);
    addBond(oSingleId, hid);

  } else if (groupId === 'ester') {
    // C_left - C(=O) - O - C_right
    const leftCount = 1;
    const rightCount = Math.max(1, carbonCount - 2);
    const heavyIds: string[] = [];
    const syms: ('C' | 'O')[] = ['C', 'C', 'O'];
    for (let i = 0; i < rightCount; i++) syms.push('C');

    const totalHeavyAtoms = syms.length;

    syms.forEach((sym, idx) => {
      const x = (idx - (totalHeavyAtoms - 1) / 2) * 55;
      const y = (idx % 2 === 0 ? 10 : -10);
      heavyIds.push(addAtom(sym, x, y, 0));
    });

    for (let i = 0; i < totalHeavyAtoms - 1; i++) {
      addBond(heavyIds[i], heavyIds[i+1]);
    }

    // Double bonded oxygen on the second Carbon (index 1)
    const carbonylId = heavyIds[1];
    const cx1 = (1 - (totalHeavyAtoms - 1) / 2) * 55;
    const cy1 = (1 % 2 === 0 ? 10 : -10);
    
    const doubleO = addAtom('O', cx1, cy1 + 42, 0);
    addBond(carbonylId, doubleO, 'double');

    // Add Hydrogens to Heavy carbons (index 0, and starting from index 3)
    heavyIds.forEach((id, idx) => {
      if (syms[idx] !== 'C' || idx === 1) return; // skip O and carbonyl C
      const cx = (idx - (totalHeavyAtoms - 1) / 2) * 55;
      const cy = (idx % 2 === 0 ? 10 : -10);
      const isExtreme = idx === 0 || idx === totalHeavyAtoms - 1;
      const maxH = isExtreme ? 3 : 2;

      let hCount = 0;
      if (hCount < maxH) {
        const hid = addAtom('H', cx, cy + (idx % 2 === 0 ? 40 : -40), 0);
        addBond(id, hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx - 12, cy + (idx % 2 === 0 ? -12 : 12), 30);
        addBond(id, hid);
        hCount++;
      }
      if (hCount < maxH) {
        const hid = addAtom('H', cx + 12, cy + (idx % 2 === 0 ? -12 : 12), -30);
        addBond(id, hid);
        hCount++;
      }
    });
  }

  return { atoms, bonds };
}

// ==========================================
// ORGANIC LAB COMPONENT CODE
// ==========================================

export default function OrganicLab() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'reactions' | 'quiz'>('explorer');

  // EXPLORER STATE
  const [selectedGroup, setSelectedGroup] = useState<string>('alkane');
  const [carbonCount, setCarbonCount] = useState<number>(3); // C1 - C5
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const dragRef = useRef<HTMLDivElement>(null);

  // REACTION STATE
  const [rxType, setRxType] = useState<'addition' | 'esterification' | 'sub_elim'>('addition');
  
  // Addition reaction states
  const [additionAlkene, setAdditionAlkene] = useState<'etena' | 'propena'>('propena');
  const [additionReagent, setAdditionReagent] = useState<'h2' | 'cl2' | 'hcl'>('hcl');
  const [additionStep, setAdditionStep] = useState<number>(0); // 0 = idle, 1 = animated, 2 = complete

  // Esterification Fischer states
  const [esterAcid, setEsterAcid] = useState<'format' | 'asetat' | 'butirat'>('asetat');
  const [esterAlcohol, setEsterAlcohol] = useState<'metanol' | 'etanol' | 'pentanol'>('pentanol');
  const [esterHeating, setEsterHeating] = useState<boolean>(false);
  const [esterProgress, setEsterProgress] = useState<number>(0);
  const [esterResult, setEsterResult] = useState<any | null>(null);

  // QUIZ STATE
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuizQIdx, setCurrentQuizQIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);

  const groupMeta = ORGANIC_GROUPS.find(g => g.id === selectedGroup) || ORGANIC_GROUPS[0];
  
  // Clean restrictions for alkenes / alkynes / ketones / ethers which usually require min carbons
  useEffect(() => {
    if (selectedGroup === 'alkene' || selectedGroup === 'alkyne' || selectedGroup === 'ether') {
      if (carbonCount < 2) setCarbonCount(2);
    } else if (selectedGroup === 'ketone') {
      if (carbonCount < 3) setCarbonCount(3);
    }
  }, [selectedGroup]);

  // Handle auto-rotation of molecular structure
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.015) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(interval);
  }, [isRotating]);

  // Math calculation of projected 2D coordinates from 3D points
  const molecule = generateMoleculeData(selectedGroup, carbonCount);
  const cosAngle = Math.cos(rotationAngle);
  const sinAngle = Math.sin(rotationAngle);

  // Project atoms
  const projectedAtoms = molecule.atoms.map(atom => {
    // Rotate around Y axis
    const rotX = atom.rawX * cosAngle - atom.rawZ * sinAngle;
    const rotZ = atom.rawX * sinAngle + atom.rawZ * cosAngle;
    return {
      ...atom,
      projX: rotX + 160, // translate to center of 320px SVG width
      projY: atom.rawY + 120, // translate to center of 240px SVG height
      projZ: rotZ
    };
  });

  // Sort atoms by Z position so back elements render first (Painter's algorithm)
  const sortedAtoms = [...projectedAtoms].sort((a, b) => a.projZ - b.projZ);

  // Dragging to rotate manually
  const handleSourceMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsRotating(false);
    const startX = e.clientX;
    const initialAngle = rotationAngle;

    const handleMouseMove = (mvEvent: MouseEvent) => {
      const deltaX = mvEvent.clientX - startX;
      setRotationAngle(initialAngle + deltaX * 0.012);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Get current compound metadata details dynamically
  const details: CompoundDetails = COMPOUND_DB[selectedGroup]?.[carbonCount] || {
    formula: 'C_n H_m',
    iupacName: 'Molekul Karbon',
    commonName: 'Zat Organik',
    boilingPoint: 0,
    solubility: 'Data terbatas',
    phase: 'Cair',
    odor: 'Tajam',
    everydayUse: 'Riset petrokimia kovalen'
  };

  // Run Fischer Esterification Simulation 
  const handleStartEsterification = () => {
    setEsterHeating(true);
    setEsterProgress(1);
    setEsterResult(null);

    const interval = setInterval(() => {
      setEsterProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setEsterHeating(false);
          calculateEsterResult();
          return 100;
        }
        return prev + 4;
      });
    }, 150);
  };

  const calculateEsterResult = () => {
    let acidFull = '';
    let alcoholFull = '';
    let esterName = '';
    let formula = '';
    let fragrance = '';
    let useCase = '';

    if (esterAcid === 'asetat') {
      acidFull = 'Asam Asetat (CH₃COOH)';
      if (esterAlcohol === 'pentanol') {
        esterName = 'Pentil Asetat (Amil Asetat)';
        formula = 'CH₃COOC₅H₁₁';
        fragrance = 'Pisang Matang Lezat 🍌 (Banana fragrance)';
        useCase = 'Esens kue srikaya, perasa banana split, pelarut industri lilin.';
      } else if (esterAlcohol === 'metanol') {
        esterName = 'Metil Asetat';
        formula = 'CH₃COOCH₃';
        fragrance = 'Lem Manis / Cat Baru 🧪';
        useCase = 'Pelarut lem selulosa, penghilang mascara kosmetik.';
      } else {
        esterName = 'Etil Asetat';
        formula = 'CH₃COOC₂H₅';
        fragrance = 'Buah Segar / Pembersih Kutek 💅';
        useCase = 'Pelarut cat kuku, esens sintesis sirup buah pir.';
      }
    } else if (esterAcid === 'format') {
      acidFull = 'Asam Format (HCOOH)';
      if (esterAlcohol === 'pentanol') {
        esterName = 'Pentil Format';
        formula = 'HCOOC₅H₁₁';
        fragrance = 'Buah Prem / Cherry Asam 🍒';
        useCase = 'Bahan parfum aroma eksotis maskulin.';
      } else if (esterAlcohol === 'metanol') {
        esterName = 'Metil Format';
        formula = 'HCOOCH₃';
        fragrance = 'Aroma Jeruk Nipis Tajam 🍋';
        useCase = 'Fumigan pangan, bahan baku obat anestesi hewan.';
      } else {
        esterName = 'Etil Format';
        formula = 'Etil Format';
        fragrance = 'Aroma Rum Klasik / Raspberry Dan Madu 🍯';
        useCase = 'Pemberi aroma minuman rum buatan, pengawet gandum.';
      }
    } else { // butirat
      acidFull = 'Asam Butirat (C₃H₇COOH)';
      if (esterAlcohol === 'pentanol') {
        esterName = 'Pentil Butirat';
        formula = 'C₃H₇COOC₅H₁₁';
        fragrance = 'Aroma Jambu Biji Liar / Buah Aprikot 🍑';
        useCase = 'Lotion kosmetik kecantikan, pewangi sabun cair.';
      } else if (esterAlcohol === 'metanol') {
        esterName = 'Metil Butirat';
        formula = 'Metil Butirat';
        fragrance = 'Buah Apel Hijau Segar 🍏 (Apple scent)';
        useCase = 'Esens sirup apel hijau, pewangi lilin aromaterapi.';
      } else {
        esterName = 'Etil Butirat';
        formula = 'C₃H₇COOC₂H₅';
        fragrance = 'Nanas Tropis Menyegarkan 🍍 (Fresh pineapple aroma)';
        useCase = 'Penyedap rasa minuman bersoda, permen jelly nanas.';
      }
    }

    if (esterAlcohol === 'metanol') alcoholFull = 'Metanol (CH₃OH)';
    else if (esterAlcohol === 'etanol') alcoholFull = 'Etanol (C₂H₅OH)';
    else alcoholFull = 'Pentanol (C₅H₁₁OH)';

    setEsterResult({
      acid: acidFull,
      alcohol: alcoholFull,
      ester: esterName,
      formula,
      fragrance,
      useCase
    });

    // Dispatch telemetry logging
    window.dispatchEvent(new CustomEvent('chemvibe_activity', {
      detail: {
        activityType: 'simulation_run',
        title: 'Fischer Esterifikasi',
        description: `Bermain reaktor sintesis parfum: ${acidFull} + ${alcoholFull} menghasilkan ester harum ${esterName}`,
        score: { earned: 5, total: 5 }
      }
    }));
  };

  // Markovnikov Addition handler
  const handleTriggerAddition = () => {
    setAdditionStep(1);
    setTimeout(() => {
      setAdditionStep(2);
      // Dispatch telemetry logging
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'simulation_run',
          title: 'Markovnikov Addition',
          description: `Mensimulasikan adisi alkena ${additionAlkene} dengan reagen ${additionReagent}`,
          score: { earned: 4, total: 4 }
        }
      }));
    }, 1800);
  };

  // Organic Chemistry Quiz database
  const QUIZ_QUESTIONS = [
    {
      q: "Zat pewangi makanan buatan beraroma nanas mengandung Etil Butirat. Senyawa ini merupakan turunan dari gugus fungsi apa?",
      o: ["Alkanol (Alkohol)", "Alkoksi Alkana (Eter)", "Alkil Alkanoat (Ester)", "Alkanal (Aldehida)"],
      a: 2,
      exp: "Etil butirat memiliki akhiran -at di akhir namanya yang mengindikasikan senyawa ini bermuatan gugus fungsi Ester (alkil alkanoat). Ester terkenal sebagai senyawa organik pembuat aroma buah buatan."
    },
    {
      q: "Menurut hukum Markovnikov, jika senyawa Propena (CH₃-CH=CH₂) diadisi menggunakan gas Asam Klorida (HCl), produk mayoritas yang akan terbentuk adalah...",
      o: ["1-kloropropana", "2-kloropropana", "1,2-dikloropropana", "propil alkohol"],
      a: 1,
      exp: "Aturan Markovnikov menyatakan: atom H dari asam halida akan menyerang karbon ikatan rangkap yang mengikat hidrogen lebih banyak (C ujung), sedangkan halogen (Cl) terikat pada C sekunder pusat yang hidrogennya lebih sedikit. Menghasilkan 2-kloropropana (mayoritas)."
    },
    {
      q: "Alkohol primer jika dirawat dengan agen pengoksidasi sedang akan teroksidasi menghasilkan senyawa apa pada tahap pertamanya?",
      o: ["Keton", "Aldehida (Alkanal)", "Asam Karboksilat", "Eter"],
      a: 1,
      exp: "Oksidasi alkohol primer mula-mula melepaskan dua atom hidrogen membentuk Aldehida (alkanal). Oksidasi lebih lanjut dari aldehida baru akan menghasilkan Asam Karboksilat."
    },
    {
      q: "Senyawa Butanon (CH₃-CO-CH₂-CH₃) yang umumnya dimanfaatkan sebagai bahan dasar pengencer cat semprot termasuk ke dalam keluarga...",
      o: ["Aldehida", "Asam Alkanoat", "Alkanon (Keton)", "Alkoksi Alkana"],
      a: 2,
      exp: "Butanon memiliki sufiks '-on' dan letak gugus karbonil (C=O) di atom karbon nomor dua (tidak di ujung). Ini mencirikan senyawa Keton (alkanon)."
    },
    {
      q: "Di antara senyawa organik berikut, senyawa manakah yang memiliki titik didih paling tinggi pada jumlah atom karbon (C) yang sama?",
      o: ["Alkana", "Eter", "Aldehida", "Asam Karboksilat"],
      a: 3,
      exp: "Asam Karboksilat memiliki titik didih tertinggi di antara senyawa organik seukuran karena kemampuannya berasosiasi membentuk ikatan hidrogen dimer kuat bercirikan jembatan ganda."
    },
    {
      q: "Senyawa dengan rumus molekul C₃H₈O memiliki dua isomer posisi dari golongan alkohol dan satu senyawa dari golongan eter. Senyawa eter yang merupakan isomer fungsi dari propanol tersebut adalah...",
      o: ["Dimetil eter", "Metoksi etana (Etil metil eter)", "Dietil eter", "Metoksi metana"],
      a: 1,
      exp: "Isomer fungsi dari alkohol C₃H₈O (propanol) adalah eter dengan jumlah karbon sama (C₃). Rumus eter dengan C₃ adalah CH₃-O-C₂H₅, yang bernama IUPAC Metoksi etana atau lazim dikenal sebagai etil metil eter."
    },
    {
      q: "Reaksi pembentukan ester (esterifikasi) dari asam karboksilat dan alkohol merupakan jenis reaksi kondensasi yang berjalan setimbang. Reaksi ini juga dikenal dengan nama...",
      o: ["Saponifikasi", "Esterifikasi Fischer", "Adsorpsi Koloid", "Adisi Nukleofilik"],
      a: 1,
      exp: "Sintesis ester dari mereaksikan asam karboksilat langsung dengan alkohol menggunakan katalis asam kuat (seperti asam sulfat) dinamakan Esterifikasi Fischer."
    },
    {
      q: "Pereaksi Tollens (cermin perak) atau senyawa Fehling (endapan merah bata Cu₂O) dapat digunakan untuk membedakan pasangan isomer fungsional golongan...",
      o: ["Alkohol dan Eter", "Alkanal (Aldehida) dan Alkanon (Keton)", "Asam Karboksilat dan Ester", "Alkana dan Alkena"],
      a: 1,
      exp: "Alkanal (Aldehida) bereaksi positif dengan Tollens menghasilkan cermin perak dan dengan Fehling menghasilkan endapan Cu₂O merah bata karena sifat aldehida yang mudah dioksidasi. Sebaliknya, Keton bersifat stabil terhadap oksidator lemah ini sehingga tidak memberikan reaksi positif."
    },
    {
      q: "Nama IUPAC yang benar dari senyawa CH₃ - CH(CH₃) - CH₂ - CH₂ - OH adalah...",
      o: ["1-pentanol", "2-metil-4-butanol", "3-metil-1-butanol", "Isopentil alkohol"],
      a: 2,
      exp: "Penomoran rantai utama karbon dimulai dari ujung yang terdekat dengan gugus hidroksil (-OH). Gugus -OH berada di karbon nomor 1, sedangkan cabang metil terikat pada karbon nomor 3. Jadi nama IUPAC-nya adalah 3-metil-1-butanol."
    },
    {
      q: "Ketika lemak atau minyak dipanaskan dengan larutan basa kuat seperti NaOH atau KOH, akan terjadi reaksi hidrolisis menghasilkan sabun dan gliserol. Reaksi pembentukan sabun ini disebut...",
      o: ["Esterifikasi", "Ozonolisis", "Saponifikasi (Penyabunan)", "Eliminasi Dehidrasi"],
      a: 2,
      exp: "Reaksi saponifikasi atau penyabunan adalah reaksi hidrolisis lemak/minyak dengan menggunakan basa kuat yang menghasilkan garam asam lemak (sabun) dan gliserol sebagai hasil samping."
    },
    {
      q: "Asam karboksilat berikut yang merupakan komponen utama dalam sekresi pertahanan diri sengatan semut merah dan memiliki rumus HCOOH adalah...",
      o: ["Asam Format (Asam Metanoat)", "Asam Asetat (Asam Etanoat)", "Asam Butirat", "Asam Valerat"],
      a: 0,
      exp: "Asam format (berasal dari kata Latin: formica yang berarti semut) atau asam metanoat memiliki rumus kimia HCOOH dan disekresikan oleh semut untuk pertahanan diri."
    },
    {
      q: "Senyawa eter sangat tidak reaktif terhadap oksidator dan reduktor umum. Kelarutan eter dalam air jauh lebih rendah dibanding alkohol isomer strukturnya karena...",
      o: ["Eter tidak memiliki atom oksigen", "Molekul eter tidak dapat membentuk ikatan hidrogen antar sesama molekulnya", "Eter merupakan zat elektrolit kuat", "Eter berbentuk padat pada suhu ruang yang mengkristal"],
      a: 1,
      exp: "Eter tidak memiliki ikatan polar H terikat langsung pada O, sehingga antar sesama molekul eter tidak terdapat ikatan hidrogen. Hal ini membuat titik didihnya rendah dan kelarutannya di dalam air jauh di bawah alkohol yang kaya ikatan hidrogen."
    },
    {
      q: "Gas alkana jenuh berkarbon empat yang mudah dicairkan pada tekanan sedang dan umum digunakan sebagai gas pengisi korek api gas portabel adalah...",
      o: ["Etena", "Asetilena", "Butana", "Propena"],
      a: 2,
      exp: "Butana (C₄H₁₀) mudah dicairkan pada tekanan sedang dan umum digunakan sebagai gas pengisi pemantik api (korek gas) maupun tabung gas portabel alat masak lapangan."
    },
    {
      q: "Manakah di antara pasangan senyawa berikut yang merupakan pasangan isomer fungsi?",
      o: ["Propanal dan Propanon", "Etanol dan Gliserol", "Metil asetat dan Asam propionil klorida", "Metana dan Etena"],
      a: 0,
      exp: "Isomer fungsi adalah senyawa-senyawa yang memiliki rumus molekul sama namun berbeda gugus fungsinya. Propanal (Aldehida) dan Propanon (Keton) keduanya memiliki rumus molekul C₃H₆O dengan fungsi pengikat karbonil terminal vs non-terminal."
    },
    {
      q: "Reaksi dehidrasi alkohol (pelepasan molekul air H₂O) menggunakan asam sulfat pekat pada suhu tinggi (~180°C) akan menghasilkan senyawa dari golongan...",
      o: ["Alkana", "Alkena", "Ester", "Aldehida"],
      a: 1,
      exp: "Pada suhu tinggi (~180 °C), alkohol primer terdehidrasi dengan bantuan katalis asam sulfat pekat menghasilkan senyawa tak jenuh Alkena melalui eliminasi molekul air. Pada suhu lebih rendah (~140 °C), dehidrasi menghasilkan eter."
    },
    {
      q: "Formol atau formalin yang digunakan sebagai pengawet jaringan biologis mati di laboratorium medis merupakan larutan berair dari senyawa...",
      o: ["Metanol", "Metanal (Formaldehida)", "Dimetil eter", "Asam format"],
      a: 1,
      exp: "Formalin adalah larutan air berkonsentrasi sekitar 37-40% dari gas formaldehida (Metanal, HCHO). Senyawa ini mendenaturasi protein seluler bakteri sehingga menghentikan aktivitas pembusukan mikroba secara permanen."
    },
    {
      q: "Gugus fungsi yang tersusun atas sepasang atom karbon yang terikat secara rangkap dua dengan oksigen (C=O) disebut...",
      o: ["Gugus Karbonil", "Gugus Hidroksil", "Gugus Karboksil", "Gugus Alkoksi"],
      a: 0,
      exp: "Gugus C=O dinamakan gugus karbonil. Gugus ini merupakan fondasi utama bagi struktur kimia alkanal (aldehida), alkanon (keton), asam alkanoat, dan alkil alkanoat."
    },
    {
      q: "Berdasarkan tata nama IUPAC, nama yang tepat untuk senyawa ester dengan rumus CH₃-CH₂-CH₂-COO-CH₂-CH₃ adalah...",
      o: ["Etil Butanoat", "Propil Propanoat", "Metil Pentanoat", "Butil Etanoat"],
      a: 0,
      exp: "Struktur ester terbagi menjadi rantai alkil ester (terikat pada O silang: -CH₂-CH₃ = Etil) dan rantai asam asil induk (mengandung gugus karbonil C=O: CH₃-CH₂-CH₂-COO- = 4 karbon = butanoat). Sehingga namanya adalah Etil Butanoat."
    },
    {
      q: "Reaksi penambahan gas hidrogen (H₂) pada ikatan rangkap dua Alkena menjadi ikatan tunggal Alkana menggunakan katalis logam Ni atau Pt dinamakan reaksi...",
      o: ["Esterifikasi", "Eliminasi", "Hidrogenasi (Adisi)", "Substitusi Nukleofilik"],
      a: 2,
      exp: "Reaksi hidrogenasi adalah reaksi adisi (penjenuhan) di mana atom hidrogen ditambahkan pada ikatan kovalen rangkap tak jenuh (seperti C=C alkena) mengubahnya menjadi sistem ikatan tunggal alkana yang jenuh."
    },
    {
      q: "Zat antiseptik pembersih luka medis berkadar 70% yang umum aman digunakan pada kulit luar tubuh manusia sebagai disinfektan harian adalah senyawa...",
      o: ["Metanol", "Etanol", "Metanal", "Asam asetat"],
      a: 1,
      exp: "Etanol (alkohol gandum) berkonsentrasi 70% mampu menembus sel, melarutkan membran lipid, dan mendenaturasi protein virus/bakteri secara optimal, serta aman diaplikasikan luar dibanding metanol yang sangat toksik."
    }
  ];

  const handleSelectQuizAnswer = (idx: number) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (idx === QUIZ_QUESTIONS[currentQuizQIdx].a) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuizQIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizQIdx(prev => prev + 1);
    } else {
      setQuizComplete(true);
      // Dispatch final score log
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          title: 'Kuis Kimia Karbon',
          description: `Berhasil menyelesaikan Kuis Senyawa Organik dengan skor ${quizScore} / ${QUIZ_QUESTIONS.length}`,
          score: { earned: quizScore, total: QUIZ_QUESTIONS.length }
        }
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-zinc-900 border border-zinc-850 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-xs text-teal-400 font-mono tracking-widest uppercase">
              <Sparkles className="w-3 h-3 animate-pulse" /> Hidrokarbon &amp; Gugus Fungsi
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Laboratorium Kimia Karbon</h1>
            <p className="text-zinc-400 text-xs md:text-sm">
              Eksplorasi representasi molekul 3D, tata nama IUPAC, trend sifat kelarutan, titik didih, beserta simulator reaksi adisi dan esterifikasi organik.
            </p>
          </div>
          
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 shadow-inner">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'explorer' 
                  ? 'bg-zinc-800 text-teal-400 border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>Explorer 3D</span>
            </button>
            <button
              onClick={() => setActiveTab('reactions')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'reactions' 
                  ? 'bg-zinc-800 text-teal-400 border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Simulator Reaksi</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'quiz' 
                  ? 'bg-zinc-800 text-teal-400 border border-zinc-700/50' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Kuis Evaluasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: EXPLORER */}
        {activeTab === 'explorer' && (
          <motion.div
            key="tab-explorer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Control Panel (left side) */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              
              {/* Group selection box */}
              <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">KATEGORI GUGUS FUNGSI</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full mt-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-100 px-3 py-2 text-xs font-semibold rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                  >
                    {ORGANIC_GROUPS.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Carbon Count Selection Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-450 font-mono text-[10px]">ATOM KARBON (CHAIN LENGTH)</span>
                    <span className="font-mono text-teal-450 font-black bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                      C_ {carbonCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={selectedGroup === 'alkene' || selectedGroup === 'alkyne' || selectedGroup === 'ether' ? 2 : selectedGroup === 'ketone' ? 3 : 1}
                    max={5}
                    value={carbonCount}
                    onChange={(e) => setCarbonCount(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <span className="text-[10px] text-zinc-500 block leading-tight">
                    Mengubah panjang rantai alkil terikat (Metil, Etil, Propil, Butil, Pentil).
                  </span>
                </div>
              </div>

              {/* Physical Properties Trend Card */}
              <div className="glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 block pb-2 border-b border-zinc-850">TREND SIFAT GUGUS</span>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <strong className="text-zinc-300 block">Polaritas:</strong>
                    <p className="text-zinc-450 mt-0.5 leading-relaxed text-[11px]">{groupMeta.polarization}</p>
                  </div>
                  <div>
                    <strong className="text-zinc-300 block">Kecenderungan Didih:</strong>
                    <p className="text-zinc-450 mt-0.5 leading-relaxed text-[11px]">{groupMeta.boilingTrend}</p>
                  </div>
                  <div>
                    <strong className="text-zinc-300 block">Kelarutan Air:</strong>
                    <p className="text-zinc-450 mt-0.5 leading-relaxed text-[11px]">{groupMeta.solubilityTrend}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Molecule Canvas & Details Panel (right side) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Draggable Molecule viewer */}
              <div className="bg-zinc-950/80 rounded-2xl p-5 border border-zinc-900 shadow-md relative group/canvas">
                
                {/* Floating controls */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 font-mono text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    Interactive 3D Ball-and-Stick
                  </span>
                  <button
                    onClick={() => setIsRotating(!isRotating)}
                    className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-md flex items-center gap-1 text-[10px] font-mono transition-colors cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
                    <span>{isRotating ? 'Pause' : 'Rotate'}</span>
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 z-10 text-[9px] font-mono text-zinc-500 font-semibold uppercase bg-zinc-900/70 p-1 px-2 rounded backdrop-blur">
                  *Drag mouse di area kanvas untuk memutar
                </div>

                {/* Legend */}
                <div className="absolute top-4 right-4 z-10 flex gap-2 font-mono text-[9.5px] bg-zinc-900/50 p-1.5 px-3 rounded-lg border border-zinc-800/40">
                  <span className="flex items-center gap-1 text-zinc-400"><span className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> C</span>
                  <span className="flex items-center gap-1 text-zinc-400"><span className="w-1.5 h-1.5 rounded-full bg-zinc-100" /> H</span>
                  <span className="flex items-center gap-1 text-zinc-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> O</span>
                </div>

                {/* Draggable container area */}
                <div 
                  ref={dragRef}
                  onMouseDown={handleSourceMouseDown}
                  className="w-full h-64 bg-zinc-950 rounded-xl border border-zinc-900/40 flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden shadow-inner select-none"
                >
                  <svg className="w-80 h-60" viewBox="0 0 320 240">
                    <defs>
                      <linearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#71717a" />
                        <stop offset="100%" stopColor="#27272a" />
                      </linearGradient>
                      <linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#d4d4d8" />
                      </linearGradient>
                      <linearGradient id="oGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#b91c1c" />
                      </linearGradient>
                    </defs>

                    {/* Projections of Bond Lines */}
                    {molecule.bonds.map((bond, idx) => {
                      const fromAtom = projectedAtoms.find(a => a.id === bond.from);
                      const toAtom = projectedAtoms.find(a => a.id === bond.to);
                      if (!fromAtom || !toAtom) return null;

                      const x1 = fromAtom.projX;
                      const y1 = fromAtom.projY;
                      const x2 = toAtom.projX;
                      const y2 = toAtom.projY;

                      if (bond.type === 'double') {
                        // Parallel double bonds displacement calculations
                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const len = Math.sqrt(dx*dx + dy*dy) || 1;
                        const px = -dy / len * 4;
                        const py = dx / len * 4;

                        return (
                          <g key={idx}>
                            <line x1={x1 + px} y1={y1 + py} x2={x2 + px} y2={y2 + py} stroke="#6b7280" strokeWidth="4.5" />
                            <line x1={x1 - px} y1={y1 - py} x2={x2 - px} y2={y2 - py} stroke="#6b7280" strokeWidth="4.5" />
                          </g>
                        );
                      } else if (bond.type === 'triple') {
                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const len = Math.sqrt(dx*dx + dy*dy) || 1;
                        const px = -dy / len * 6;
                        const py = dx / len * 6;

                        return (
                          <g key={idx}>
                            <line x1={x1 + px} y1={y1 + py} x2={x2 + px} y2={y2 + py} stroke="#4b5563" strokeWidth="4" />
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4b5563" strokeWidth="4" />
                            <line x1={x1 - px} y1={y1 - py} x2={x2 - px} y2={y2 - py} stroke="#4b5563" strokeWidth="4" />
                          </g>
                        );
                      }

                      return (
                        <line 
                          key={idx} 
                          x1={x1} 
                          y1={y1} 
                          x2={x2} 
                          y2={y2} 
                          stroke="#6b7280" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                        />
                      );
                    })}

                    {/* Projections of Atoms spheres - sorted Z hierarchy */}
                    {sortedAtoms.map(atom => {
                      const labelColor = ATOM_STYLES[atom.symbol].labelColor;
                      const fill = atom.symbol === 'C' ? 'url(#cGrad)' : atom.symbol === 'O' ? 'url(#oGrad)' : 'url(#hGrad)';
                      const scaledRadius = atom.radius * (1 + atom.projZ * 0.002); // slight prospective size

                      return (
                        <g key={atom.id}>
                          {/* Inner shadow overlay styling for realistic look */}
                          <circle cx={atom.projX} cy={atom.projY} r={scaledRadius} fill={fill} stroke="#1f2937" strokeWidth="1.5" />
                          {/* Reflector light dot */}
                          <circle cx={atom.projX - scaledRadius * 0.3} cy={atom.projY - scaledRadius * 0.3} r={scaledRadius * 0.2} fill="#ffffff" fillOpacity="0.5" />
                          <text 
                            x={atom.projX} 
                            y={atom.projY + 4} 
                            fill={labelColor} 
                            fontSize={scaledRadius * 0.75} 
                            fontWeight="bold" 
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="pointer-events-none select-none"
                          >
                            {atom.symbol}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Compound Specs Sheet Details */}
              <div className="glass-panel border-white/5 bg-slate-900/45 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-850 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-widest block">IUPAC &amp; DATA SPEKTROSKOPI</span>
                    <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                      {details.iupacName} <span className="font-mono text-zinc-500 text-sm font-semibold">({details.formula})</span>
                    </h2>
                  </div>
                  
                  <div className="flex gap-2 font-mono text-xs">
                    <span className="px-3 py-1 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-400 font-bold">
                      FASA: {details.phase === 'Gas' ? '💨 Gas' : details.phase === 'Cair' ? '💧 Cair' : '🧱 Padat'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 text-xs text-zinc-300">
                  <div className="sm:col-span-4 bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="text-zinc-500 font-mono text-[9px] block">NAMA TRIVIAL (COMMON NAME)</span>
                    <strong className="text-zinc-200 block text-sm">{details.commonName}</strong>
                  </div>

                  <div className="sm:col-span-4 bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="text-zinc-500 font-mono text-[9px] block">TITIK DIDIH (BP °C)</span>
                    <strong className="text-teal-400 block text-lg font-mono font-black">{details.boilingPoint} °C</strong>
                  </div>

                  <div className="sm:col-span-4 bg-zinc-950 border border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="text-zinc-500 font-mono text-[9px] block">SENSASI BAU (ODOR SEVERITY)</span>
                    <strong className="text-amber-400 block text-sm">{details.odor}</strong>
                  </div>
                </div>

                {/* Practical Use case details */}
                <div className="bg-teal-500/5 border border-teal-500/15 p-4 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-teal-405 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-teal-300">Kegunaan Praktis Sehari-hari (Everyday Value):</h4>
                    <p className="text-[11.5px] leading-relaxed text-zinc-400">
                      {details.everydayUse}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: VIRTUAL SIMULATOR REACTIONS */}
        {activeTab === 'reactions' && (
          <motion.div
            key="tab-reactions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Reaction category selector buttons */}
            <div className="flex border-b border-zinc-850 pb-1 gap-4 text-xs font-mono">
              <button
                onClick={() => setRxType('addition')}
                className={`py-2 px-1 border-b-2 font-bold cursor-pointer transition-all ${
                  rxType === 'addition' ? 'text-teal-400 border-teal-500' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                1. Adisi Alkena (Markovnikov Rule)
              </button>
              <button
                onClick={() => setRxType('esterification')}
                className={`py-2 px-1 border-b-2 font-bold cursor-pointer transition-all ${
                  rxType === 'esterification' ? 'text-teal-400 border-teal-500' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                2. Kondensasi Esterifikasi Fischer (Parfum Buah)
              </button>
              <button
                onClick={() => setRxType('sub_elim')}
                className={`py-2 px-1 border-b-2 font-bold cursor-pointer transition-all ${
                  rxType === 'sub_elim' ? 'text-teal-400 border-teal-500' : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                }`}
              >
                3. Substitusi vs Eliminasi
              </button>
            </div>

            {/* CASE A: ADDITION REACTION */}
            {rxType === 'addition' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Control card */}
                <div className="lg:col-span-5 glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-6 space-y-5">
                  <h3 className="text-base font-bold text-white font-sans flex items-center gap-1.5 border-b border-zinc-850 pb-3">
                    <FlaskConical className="w-4 h-4 text-teal-400" />
                    Reaktor Adisi Alkena
                  </h3>

                  {/* Alkene reactant selector */}
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] font-mono text-zinc-500 font-bold uppercase">A. PILIH ALKENA (REAKTAN)</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setAdditionAlkene('etena'); setAdditionStep(0); }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          additionAlkene === 'etena' 
                            ? 'bg-zinc-805 border-teal-500 text-teal-400 bg-zinc-800' 
                            : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-300'
                        }`}
                      >
                        Etena (C₂H₄)
                      </button>
                      <button
                        onClick={() => { setAdditionAlkene('propena'); setAdditionStep(0); }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          additionAlkene === 'propena' 
                            ? 'bg-zinc-805 border-teal-500 text-teal-400 bg-zinc-800' 
                            : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-300'
                        }`}
                      >
                        Propena (C₃H₆)
                      </button>
                    </div>
                  </div>

                  {/* Reagent Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] font-mono text-zinc-500 font-bold uppercase">B. PILIH REAGEN (GAS PENYERANG)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => { setAdditionReagent('h2'); setAdditionStep(0); }}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                          additionReagent === 'h2' 
                            ? 'bg-zinc-805 border-teal-500 text-teal-400 bg-zinc-800' 
                            : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                        }`}
                      >
                        H₂ (Hidrogenasi)
                      </button>
                      <button
                        onClick={() => { setAdditionReagent('cl2'); setAdditionStep(0); }}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                          additionReagent === 'cl2' 
                            ? 'bg-zinc-805 border-teal-500 text-teal-400 bg-zinc-800' 
                            : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                        }`}
                      >
                        Cl₂ (Klorinasi)
                      </button>
                      <button
                        onClick={() => { setAdditionReagent('hcl'); setAdditionStep(0); }}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                          additionReagent === 'hcl' 
                            ? 'bg-zinc-805 border-teal-500 text-teal-400 bg-zinc-800' 
                            : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                        }`}
                      >
                        HCl (Asam Klorida)
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleTriggerAddition}
                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-zinc-950 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10 cursor-pointer text-center"
                  >
                    <Play className="w-4 h-4" />
                    <span>JALANKAN REAKSI ADISI</span>
                  </button>
                </div>

                {/* Animation screen & Outcome */}
                <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between min-h-[350px]">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">VISUALISASI IKATAN RANGKAP BREAKDOWN</span>
                    
                    {/* Visualizer screen */}
                    <div className="h-44 flex items-center justify-center relative bg-zinc-950/80 border border-zinc-900 rounded-xl my-4 overflow-hidden shadow-inner">
                      {additionStep === 0 && (
                        <div className="text-center space-y-2">
                          <span className="text-sm font-mono text-zinc-400 font-bold">
                            {additionAlkene === 'etena' ? 'CH₂ = CH₂' : 'CH₃ - CH = CH₂'}
                          </span>
                          <span className="text-[11px] text-zinc-600 block">ditambah</span>
                          <span className="text-xs bg-zinc-900 border border-zinc-850 py-1 px-3 rounded-md text-teal-400 font-mono font-bold">
                            {additionReagent === 'h2' ? 'H - H' : additionReagent === 'cl2' ? 'Cl - Cl' : 'H - Cl'}
                          </span>
                        </div>
                      )}

                      {additionStep === 1 && (
                        <div className="flex flex-col items-center gap-4 text-center animate-pulse">
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 p-1 rounded font-mono font-bold border border-amber-500/15">REAKSI BERLANGSUNG...</span>
                          <span className="text-sm text-zinc-300 font-mono">
                            Ikatan pi (rangkap) diputuskan oleh molekul elektrofil.
                          </span>
                        </div>
                      )}

                      {additionStep === 2 && (
                        <div className="text-center space-y-4">
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg w-max mx-auto px-4 animate-bounce">
                            ✓ ADISI SELESAI! Saturated bonding terbentuk.
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase">NAMA SENYAWA UTAMA HASIL ADISI:</span>
                            <span className="text-lg text-white font-sans font-black tracking-tight block">
                              {additionAlkene === 'etena' ? (
                                additionReagent === 'h2' ? 'Etana (CH₃-CH₃)' :
                                additionReagent === 'cl2' ? '1,2-dikloroetana (CH₂Cl-CH₂Cl)' : 'Kloroetana (CH₃-CH₂Cl)'
                              ) : (
                                additionReagent === 'h2' ? 'Propana (CH₃-CH₂-CH₃)' :
                                additionReagent === 'cl2' ? '1,2-dikloropropana (CH₃-CHCl-CH₂Cl)' : '2-kloropropana (CH₃-CHCl-CH₃) *MARKOVNIKOV*'
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Theoretical Explanation */}
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-905 font-sans text-xs text-zinc-400 leading-relaxed space-y-1">
                    <h4 className="font-bold text-zinc-200">Keterangan Mekanisme:</h4>
                    {additionAlkene === 'propena' && additionReagent === 'hcl' ? (
                      <p>
                        Adisi hidrogen klorida (HCl) pada propena memenuhi <strong className="text-teal-405">Hukum Markovnikov</strong>. Karbon rangkap terminal mengikat 2 H, sedangkan karbon rangkap tengah mengikat 1 H. Sehingga atom H dari HCl terikat di ujung, dan atom Cl terikat di tengah. Menghasilkan senyawa <strong className="text-zinc-200">2-kloropropana</strong> sebagai produk utama (99%).
                      </p>
                    ) : (
                      <p>
                        Reaksi adisi melepaskan satu dari dua ikatan rangkap dua (ikatan pi yang lemah), lalu kedua atom reaktif dari penyerang menempel langsung pada sepasang atom karbon yang dulunya merangkap dua tersebut. Reaktan tak jenuh berubah sifat menjadi senyawa karbon jenuh.
                      </p>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* CASE B: CONDENSATION ESTERIFICATION (FISCHER) */}
            {rxType === 'esterification' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Reactor control card (5 cols) */}
                <div className="lg:col-span-5 glass-panel border-white/5 bg-slate-900/40 rounded-2xl p-6 space-y-5">
                  <h3 className="text-base font-bold text-white font-sans flex items-center gap-1.5 border-b border-zinc-850 pb-3">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    Sintesis Parfum Buah (Esterifikasi)
                  </h3>

                  {/* Selecting Acid */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">PILIH ASAM KARBOKSILAT</label>
                    <select
                      value={esterAcid}
                      onChange={(e) => { setEsterAcid(e.target.value as any); setEsterResult(null); }}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-1.5 text-xs rounded-lg font-semibold focus:outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="metanoat">Asam Format / Semut (Asam Metanoat)</option>
                      <option value="asetat">Asam Asetat / Cuka (Asam Etanoat)</option>
                      <option value="butirat">Asam Butirat / Mentega Busuk (Asam Butanat)</option>
                    </select>
                  </div>

                  {/* Selecting Alcohol */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">PILIH ALKOHOL ALKANOL</label>
                    <select
                      value={esterAlcohol}
                      onChange={(e) => { setEsterAlcohol(e.target.value as any); setEsterResult(null); }}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-1.5 text-xs rounded-lg font-semibold focus:outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="metanol">Metanol (Alkohol Kayu)</option>
                      <option value="etanol">Etanol (Alkohol Gandum)</option>
                      <option value="pentanol">n-Pentanol (Amil Alkohol)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-1.5 text-[11px] text-zinc-400">
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 font-bold uppercase">🧪 KATALIS REAKSI</div>
                    <p className="leading-relaxed">
                      Esterifikasi membutuhkan katalis asam kuat pekat seperti <strong className="text-rose-400">Asam Sulfat (H₂SO₄)</strong> dan suhu pemanasan tinggi untuk mendorong pembentukan ikatan ester.
                    </p>
                  </div>

                  <button
                    onClick={handleStartEsterification}
                    disabled={esterHeating}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-slate-950 font-sans font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>TUANG H₂SO₄ &amp; PANASKAN REAKTOR</span>
                  </button>
                </div>

                {/* Animated visual beaker (7 cols) */}
                <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between text-zinc-300 min-h-[350px]">
                  
                  {/* Beaker graphic */}
                  <div className="h-44 bg-zinc-950 border border-zinc-900 rounded-xl relative flex items-center justify-center overflow-hidden">
                    
                    {/* Heating Flame */}
                    {esterHeating && (
                      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-amber-600/20 via-orange-500/10 to-transparent flex justify-center">
                        <Flame className="w-8 h-8 text-amber-500 animate-bounce absolute bottom-1" />
                        <Wind className="w-6 h-6 text-indigo-400 animate-pulse absolute bottom-1.5" />
                      </div>
                    )}

                    {/* Chemical Beaker outline */}
                    <div className="w-24 h-32 border-2 border-zinc-700 rounded-b-xl relative flex items-end overflow-hidden shadow-inner bg-zinc-950/40">
                      
                      {/* Fluid state */}
                      <div 
                        style={{ 
                          height: esterHeating ? `${30 + esterProgress * 0.3}%` : esterResult ? '60%' : '35%'
                        }}
                        className={`absolute bottom-0 inset-x-0 bg-teal-500/10 border-t-2 border-teal-400/30 transition-all duration-300 ${
                          esterHeating ? 'bg-orange-400/15 border-orange-400/40' : ''
                        }`}
                      >
                        {/* Bubbles during active heating */}
                        {esterHeating && (
                          <div className="absolute inset-x-0 bottom-0 top-1 overflow-hidden pointer-events-none">
                            <span className="absolute w-1 h-1 bg-white/40 rounded-full bottom-2 left-6 animate-ping" />
                            <span className="absolute w-1.5 h-1.5 bg-white/40 rounded-full bottom-4 left-1/2 animate-ping" style={{ animationDelay: '200ms' }} />
                            <span className="absolute w-0.5 h-0.5 bg-white/40 rounded-full bottom-1 left-16 animate-ping" style={{ animationDelay: '400ms' }} />
                          </div>
                        )}
                        <span className="text-[8px] font-mono text-zinc-600 block text-center mt-2 uppercase">REAKTOR</span>
                      </div>
                      
                      {/* Rim outline */}
                      <div className="absolute top-0 w-24 h-1 bg-zinc-600 rounded-t" />
                    </div>

                    {/* Progress details */}
                    {esterHeating && (
                      <div className="absolute top-4 inset-x-0 flex flex-col items-center gap-1">
                        <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase animate-pulse">Sintesis Fischer Sedang Dilakukan</span>
                        <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div style={{ width: `${esterProgress}%` }} className="h-full bg-amber-500 transition-all duration-150" />
                        </div>
                      </div>
                    )}

                    {!esterHeating && !esterResult && (
                      <div className="absolute inset-5 flex flex-col items-center justify-center text-center text-zinc-500 text-xs">
                        <span>Pilih reaktan senyawa asam karboksilat dan alkohol lalu nyalakan reaktor untuk disintesis.</span>
                      </div>
                    )}
                  </div>

                  {/* Ester result card */}
                  {esterResult && (
                    <div className="p-4 rounded-xl bg-orange-400/5 border border-orange-400/20 space-y-3.5 animate-fade-in text-xs">
                      <div className="flex items-center gap-2 pb-2 border-b border-zinc-850">
                        <CheckCircle className="w-4.5 h-4.5 text-orange-400 shrink-0" />
                        <div>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">PRODUK ESTER (ALKIL ALKANOAT)</span>
                          <span className="text-sm font-black text-white">{esterResult.ester} <span className="font-mono text-orange-400 font-bold">{esterResult.formula}</span></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-zinc-550 font-mono text-[9px] block text-zinc-500">POTRETS AROMA HASIL (Scent):</span>
                          <strong className="text-orange-300 block font-sans text-sm">{esterResult.fragrance}</strong>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-zinc-550 font-mono text-[9px] block text-zinc-500">PENGGUNAAN PRODUK:</span>
                          <strong className="text-zinc-350 block leading-relaxed text-[11px]">{esterResult.useCase}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* CASE C: SUBSTITUTION VS ELIMINATION COMPARISON */}
            {rxType === 'sub_elim' && (
              <div className="glass-panel border-white/5 bg-slate-900/45 rounded-2xl p-6 space-y-6">
                <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-xl space-y-1">
                  <h4 className="text-sm font-bold text-teal-300">Teori Substitusi vs Eliminasi Senyawa Karbon</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed text-[11px]">
                    Keberadaan gugus pergi, muatan nukleofil, suhu tinggi, dan keberadaan asam kuat pekat menentukan arah reaksi antara apakah mensubstitusi (menggantikan gugus) atau mengeliminasi (melepaskan atom untuk membuat ikatan rangkap jenuh).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Substitution info */}
                  <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-900 space-y-3">
                    <span className="text-[10px] font-mono bg-teal-500/10 text-teal-400 py-0.5 px-2 rounded border border-teal-500/20 w-max block">REAKSI SUBSTITUSI (PENGGANTIAN)</span>
                    <h5 className="text-xs font-bold text-zinc-200">Definisi &amp; Contoh Mekanisme:</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed text-[11px]">
                      Penggantian suatu atom atau gugus atom dalam molekul reaktan oleh atom atau gugus atom lain tanpa merusak derajat kejenuhan ikatan. Umum terjadi pada Alkana oleh radikal bebas halogen di bawah sinar ultraviolet.
                    </p>
                    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-850 font-mono text-zinc-200 text-center text-xs whitespace-pre">
                      {`CH₄ + Cl₂  —(Sinar UV)—➔  CH₃Cl + HCl\n(Metana)               (Kloroetana)`}
                    </div>
                  </div>

                  {/* Elimination info */}
                  <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-900 space-y-3">
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-450 py-0.5 px-2 rounded border border-rose-500/20 w-max block text-rose-400">REAKSI ELIMINASI (PENINGKATAN RANGKAP)</span>
                    <h5 className="text-xs font-bold text-zinc-200">Definisi &amp; Contoh Mekanisme:</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed text-[11px]">
                      Pelepasan dua gugus berdampingan dari satu struktur molekul kovalen jenuh untuk menghasilkan ikatan kovalen baru yang memiliki tingkat ketidakjenuhan lebih tinggi (singgel menjadi rangkap dua atau tiga).
                    </p>
                    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-850 font-mono text-zinc-200 text-center text-xs whitespace-pre">
                      {`CH₃-CH₂OH —(H₂SO₄ pekat, 180°C)—➔ CH₂=CH₂ + H₂O\n(Etanol)                     (Etena / Gas)`}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* TAB 3: PRACTICE QUIZ CHALLENGES */}
        {activeTab === 'quiz' && (
          <motion.div
            key="tab-quiz"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto"
          >
            {/* QUIZ STARTING VIEW */}
            {!quizStarted ? (
              <div className="glass-panel border-zinc-800 rounded-2xl p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto">
                  <Award className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white font-sans">Uji Kompetensi Kimia Karbon (Indonesian Curriculum)</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    Uji pemahaman Anda terkait tata nama hidrokarbon IUPAC, reaksi adisi alkena, esterifikasi parfum butirat, serta sifat fisika kelarutan alkohol kovalen.
                  </p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-[11px] text-zinc-500 text-left max-w-xs mx-auto font-mono text-center">
                  ✦ total {QUIZ_QUESTIONS.length} Pertanyaan Standar SBMPTN/UTBK ✦
                </div>

                <button
                  onClick={() => {
                    setQuizStarted(true);
                    setCurrentQuizQIdx(0);
                    setQuizScore(0);
                    setQuizComplete(false);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                  }}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-xl font-bold text-sm cursor-pointer transition-all"
                >
                  MULAI SEKARANG
                </button>
              </div>
            ) : quizComplete ? (
              /* QUIZ COMPLETION STATE */
              <div className="glass-panel border-zinc-805 rounded-2xl p-8 text-center space-y-6 animate-scale-up">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <Award className="w-8 h-8 font-black block" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 block tracking-widest uppercase">EVALUASI KUIS SELESAI</span>
                  <h3 className="text-xl font-black text-white">Luar Biasa, Riset Berhasil!</h3>
                  <p className="text-xs text-zinc-400 leading-normal">
                    Skor akhir kuis evaluasi hidrokarbon &amp; gugus fungsi kovalen Anda:
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl w-36 mx-auto">
                  <span className="text-3xl font-mono font-black text-emerald-400">{quizScore}</span>
                  <span className="text-zinc-500 text-sm font-bold"> / {QUIZ_QUESTIONS.length}</span>
                </div>

                <div className="flex gap-3 justify-center text-xs">
                  <button
                    onClick={() => setQuizStarted(false)}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg cursor-pointer transition-colors"
                  >
                    Kembali Menu Kuis
                  </button>
                  <button
                    onClick={() => {
                      setCurrentQuizQIdx(0);
                      setQuizScore(0);
                      setQuizComplete(false);
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                    }}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Ulangi Kuis
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE QUIZ QUESTION VIEW */
              <div className="glass-panel border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
                
                {/* Meta details */}
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">SOAL EVALUASI ORGANIK</span>
                  <span className="font-mono text-xs text-teal-400 font-bold bg-zinc-950 border border-zinc-900 rounded px-2">
                    PERTANYAAN {currentQuizQIdx + 1} / {QUIZ_QUESTIONS.length}
                  </span>
                </div>

                {/* Question */}
                <h4 className="text-sm font-sans font-extrabold text-white leading-relaxed">
                  {QUIZ_QUESTIONS[currentQuizQIdx].q}
                </h4>

                {/* Answer Options */}
                <div className="grid grid-cols-1 gap-3">
                  {QUIZ_QUESTIONS[currentQuizQIdx].o.map((opt, oIdx) => {
                    const isSelected = selectedAnswer === oIdx;
                    const isCorrect = oIdx === QUIZ_QUESTIONS[currentQuizQIdx].a;
                    const showFeedback = showExplanation;

                    let btnClass = 'bg-zinc-950 border-zinc-905 hover:border-zinc-700 text-zinc-350';
                    if (showFeedback) {
                      if (isCorrect) btnClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-300 pointer-events-none font-bold';
                      else if (isSelected) btnClass = 'bg-rose-500/10 border-rose-500 text-rose-350 pointer-events-none';
                      else btnClass = 'bg-zinc-950/40 border-zinc-900 text-zinc-500 pointer-events-none';
                    } else if (isSelected) {
                      btnClass = 'bg-zinc-800 border-teal-500 text-teal-400 font-semibold';
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectQuizAnswer(oIdx)}
                        disabled={showFeedback}
                        className={`w-full text-left p-3.5 px-4 rounded-xl border text-xs leading-normal transition-all cursor-pointer ${btnClass}`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span>{opt}</span>
                          {showFeedback && isCorrect && <span className="text-[10px] font-mono text-emerald-400 font-black">BENAR ✓</span>}
                          {showFeedback && isSelected && !isCorrect && <span className="text-[10px] font-mono text-rose-450 font-black">SALAH ✕</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanations & Next Button */}
                {showExplanation && (
                  <div className="space-y-4 animate-fade-in pt-4 border-t border-zinc-850">
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-850 space-y-2">
                      <span className="text-[9px] font-mono text-teal-400 font-bold tracking-widest uppercase block">Penjelasan Jawaban:</span>
                      <p className="text-xs font-sans text-zinc-450 leading-relaxed">
                        {QUIZ_QUESTIONS[currentQuizQIdx].exp}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleNextQuizQuestion}
                        className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <span>{currentQuizQIdx === QUIZ_QUESTIONS.length - 1 ? 'Selesaikan Kuis' : 'Langkah Selanjutnya'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
