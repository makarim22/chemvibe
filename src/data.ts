import { ChemicalElement, VSEPRMolecule, StoichReaction, Flashcard, MasteryDay } from './types';
import { ELEMENTS_DATA } from './elementsData';

export { ELEMENTS_DATA };

export const MOLECULES_DATA: VSEPRMolecule[] = [
  {
    formula: 'CO2',
    name: 'Carbon Dioxide',
    geometry: 'Linear',
    stericNumber: 2,
    lonePairs: 0,
    bondAngles: '180°',
    hybridization: 'sp',
    description: 'Carbon forms double covalent bonds with two Oxygen atoms. With zero lone pairs on the central carbon element, the electron groups repel each other symmetrically, producing a straight line.'
  },
  {
    formula: 'H2O',
    name: 'Water',
    geometry: 'Bent',
    stericNumber: 4,
    lonePairs: 2,
    bondAngles: '104.5°',
    hybridization: 'sp³',
    description: 'Oxygen shares electrons with two Hydrogen atoms and contains two localized non-bonding lone pairs. These lone pairs exert greater electron repulsion than the bonding pairs, compressing the bond angle down from the tetrahedral 109.5° to 104.5°.'
  },
  {
    formula: 'NH3',
    name: 'Ammonia',
    geometry: 'Trigonal Pyramidal',
    stericNumber: 4,
    lonePairs: 1,
    bondAngles: '107°',
    hybridization: 'sp³',
    description: 'The central nitrogen atom has three bonding pairs with hydrogen and one lone pair. The lone pair pushes down on the covalent N-H links, creating a tetrahedral electron shape but a trigonal pyramidal atomic layout.'
  },
  {
    formula: 'CH4',
    name: 'Methane',
    geometry: 'Tetrahedral',
    stericNumber: 4,
    lonePairs: 0,
    bondAngles: '109.5°',
    hybridization: 'sp³',
    description: 'Carbon forms four symmetric single bonds pointing towards the vertices of a regular tetrahedron. This minimizes electrostatic repulsion between adjacent C-H electron density paths.'
  },
  {
    formula: 'BF3',
    name: 'Boron Trifluoride',
    geometry: 'Trigonal Planar',
    stericNumber: 3,
    lonePairs: 0,
    bondAngles: '120°',
    hybridization: 'sp²',
    description: 'Boron is content in an electron-deficient state with six valence shell electrons. The three fluorine bonds lie flat in a single geometry plane exactly 120 degrees apart.'
  },
  {
    formula: 'PCl5',
    name: 'Phosphorus Pentachloride',
    geometry: 'Trigonal Bipyramidal',
    stericNumber: 5,
    lonePairs: 0,
    bondAngles: '120° (equatorial), 90° (axial)',
    hybridization: 'sp³d',
    description: 'Phosphorus exhibits expanded octet capabilities, bonding with five chlorine atoms. Three chlorine targets reside on a planar equator, while two align vertically along the polar axis.'
  },
  {
    formula: 'SF6',
    name: 'Sulfur Hexafluoride',
    geometry: 'Octahedral',
    stericNumber: 6,
    lonePairs: 0,
    bondAngles: '90°',
    hybridization: 'sp³d²',
    description: 'An expanded octet noble gas equivalent. Six bonds connect Sulfur to Fluorine atoms, arranged perfectly symmetrically in coordinates matching standard Cartesian space.'
  }
];

export const REACTIONS_DATA: StoichReaction[] = [
  {
    id: 'h2o',
    equation: '2 H₂ + O₂ → 2 H₂O',
    reactants: [
      { symbol: 'H2', coef: 2, mw: 2.016, name: 'Hydrogen Gas' },
      { symbol: 'O2', coef: 1, mw: 31.998, name: 'Oxygen Gas' }
    ],
    products: [
      { symbol: 'H2O', coef: 2, mw: 18.015, name: 'Water' }
    ]
  },
  {
    id: 'propane',
    equation: 'C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O',
    reactants: [
      { symbol: 'C3H8', coef: 1, mw: 44.097, name: 'Propane' },
      { symbol: 'O2', coef: 5, mw: 31.998, name: 'Oxygen Gas' }
    ],
    products: [
      { symbol: 'CO2', coef: 3, mw: 44.009, name: 'Carbon Dioxide' },
      { symbol: 'H2O', coef: 4, mw: 18.015, name: 'Water Vapor' }
    ]
  },
  {
    id: 'ammonia',
    equation: 'N₂ + 3 H₂ → 2 NH₃',
    reactants: [
      { symbol: 'N2', coef: 1, mw: 28.014, name: 'Nitrogen Gas' },
      { symbol: 'H2', coef: 3, mw: 2.016, name: 'Hydrogen Gas' }
    ],
    products: [
      { symbol: 'NH3', coef: 2, mw: 17.031, name: 'Ammonia Product' }
    ]
  },
  {
    id: 'salt',
    equation: '2 Na + Cl₂ → 2 NaCl',
    reactants: [
      { symbol: 'Na', coef: 2, mw: 22.990, name: 'Sodium Metal' },
      { symbol: 'Cl2', coef: 1, mw: 70.906, name: 'Chlorine Gas' }
    ],
    products: [
      { symbol: 'NaCl', coef: 2, mw: 58.440, name: 'Sodium Chloride' }
    ]
  }
];

export const FLASHCARDS_DATA: Flashcard[] = [
  {
    id: 'f1',
    category: 'Elements',
    question: 'Berapakah jumlah proton dan susunan elektron valensi dari logam alkali Natrium (Sodium, Na)?',
    answer: 'Natrium memiliki nomor atom 11 (11 proton). Konfigurasi elektronnya adalah [Ne] 3s¹, yang berarti memiliki 1 elektron valensi pada kulit n=3.',
    hint: 'Sodium berada pada periode ke-3 di golongan logam alkali paling kiri.'
  },
  {
    id: 'f2',
    category: 'Molecular Geometry',
    question: 'Mengapa molekul H₂O (air) berbentuk "Bent" (bengkok) padahal susunan domain elektronnya tetrahedral?',
    answer: 'Karena molekul air memiliki 2 pasangan elektron bebas (lone pairs) pada atom Oksigen pusat. Pasangan elektron bebas ini menolak pasangan ikatan kovalen lebih kuat, menekan sudut ikatan H-O-H menjadi 104.5°.',
    hint: 'Teori VSEPR menyatukan efek tolakan pasangan elektron non-ikatan.'
  },
  {
    id: 'f3',
    category: 'Chemical Bonding',
    question: 'Jenis ikatan apakah yang terjadi antara unsur dengan perbedaan keelektronegatifan (electronegativity) sangat tinggi, seperti Na (0.93) & Cl (3.16)?',
    answer: 'Ikatan Ion (Ionic Bonding). Perbedaan keelektronegatifan yang tinggi (Δ > 2.0) menyebabkan transfer elektron secara penuh dari logam ke nonlogam, menghasilkan gaya tarik elektrostatik antar ion Na⁺ & Cl⁻.',
    hint: 'Logam memberi elektron dan non-logam menerimanya secara utuh.'
  },
  {
    id: 'f4',
    category: 'Titration Metrics',
    question: 'Indikator apakah yang paling sering berubah warna menjadi merah muda (pink) cerah pada pH sekitar 8.2 hingga 10 untuk titrasi asam kuat - basa kuat?',
    answer: 'Indikator Fenolftalein (Phenolphthalein). Indikator ini tidak berwarna (clear) di kondisi asam, dan bergeser menjadi merah muda/pink intens ketika melewati titik ekuivalen transisi basa.',
    hint: 'Sangat sering digunakan pada buret laboratorium sekolah dan universitas.'
  },
  {
    id: 'f5',
    category: 'Stoichiometry',
    question: 'Apa definisi dari "Reaktan Pembatas" (Limiting Reactant) dalam perhitungan kimia?',
    answer: 'Reaktan pembatas adalah reaktan yang habis bereaksi terlebih dahulu dalam suatu reaksi kimia, sehingga membatasi jumlah produk maksimum (yield teoritis) yang dapat diproduksi.',
    hint: 'Reaktan ini mengontrol jalannya perhitungan mol produk.'
  },
  {
    id: 'f6',
    category: 'Atomic Physics',
    question: 'Unsur manakah di antara seluruh tabel periodik yang memiliki nilai keelektronegatifan (electronegativity) paling tinggi?',
    answer: 'Fluorin (F) dengan nilai keelektronegatifan sebesar 3.98 di Skala Pauling, menjadikannya unsur elektro-negatif paling reaktif dan agresif.',
    hint: 'Berada di pojok kanan atas golongan Halogen sebelum gas mulia.'
  },
  {
    id: 'f7',
    category: 'Organic Chemistry',
    question: 'Apa perbedaan mendasar antara isomer struktur dan isomer geometri (cis-trans)?',
    answer: 'Isomer struktur memiliki perbedaan urutan ikatan atom penyusunnya. Isomer geometri memiliki konektivitas ikatan yang sama, tetapi orientasi spasial tiga dimensinya berbeda akibat adanya hambatan rotasi pada ikatan rangkap dua karbon (C=C).',
    hint: 'Isomer geometri hanya terjadi jika rotasi ikatan terhambat.'
  },
  {
    id: 'f8',
    category: 'Chemical Point & Equilibrium',
    question: 'Menurut Prinsip Le Chatelier, apa yang akan terjadi pada arah kesetimbangan jika volume wadah diperkecil pada reaksi: N₂(g) + 3H₂(g) ⇌ 2NH₃(g)?',
    answer: 'Reaksi akan bergeser ke arah kanan (menghasilkan produk NH₃). Memperkecil volume meningkatkan tekanan total, sehingga reaksi bergeser ke arah sisi dengan jumlah koefisien mol gas terkecil (2 mol produk vs 4 mol reaktan).',
    hint: 'Volume berbanding terbalik dengan tekanan; hitung jumlah koefisien gas di kiri vs kanan.'
  },
  {
    id: 'f9',
    category: 'Thermochemistry',
    question: 'Apa arti nilai Perubahan Entalpi (ΔH) yang bernilai negatif, dan bagaimana efek perpindahan energinya?',
    answer: 'ΔH negatif menunjukkan reaksi Eksoterm. Pada kondisi ini, sistem melepaskan energi panas ke lingkungan karena kestabilan termal produk lebih tinggi daripada energi reaktan awal. Lingkungan akan mengalami kenaikan suhu.',
    hint: 'Pelepasan energi ditandai dengan penurunan tingkat energi potensial sistem.'
  },
  {
    id: 'f10',
    category: 'Electrochemistry',
    question: 'Pada sel Volta, elektroda manakah yang bertindak sebagai kutub negatif tempat berlangsungnya oksidasi, dan kemana arah aliran elektron?',
    answer: 'Anoda adalah kutub negatif tempat terjadinya reaksi Oksidasi. Elektron mengalir secara eksternal melalui kawat penghantar dari Anoda (-) menuju ke Katoda (+).',
    hint: 'Ingat jembatan keledai: KPAN (Katoda Positif, Anoda Negatif) dan AN-OK (Anoda Oksidasi), KAT-RED (Katoda Reduksi).'
  },
  {
    id: 'f11',
    category: 'Electrochemistry',
    question: 'Bagaimana prinsip dasar Hukum Faraday I dalam menentukan massa zat hasil reaksi elektrolisis?',
    answer: 'Massa zat (W) yang dibebaskan pada elektroda berbanding lurus dengan jumlah muatan listrik (Q) yang mengalir melalui larutan. Dinyatakan dalam rumus: W = e * i * t / 96500.',
    hint: 'Massa ekuivalen (e) dihitung dari Ar dibagi dengan perubahan bilangan oksidasi ion.'
  },
  {
    id: 'f12',
    category: 'Kinetics',
    question: 'Bagaimana pengaruh peningkatan suhu terhadap laju reaksi berdasarkan Teori Tumbukan?',
    answer: 'Peningkatan suhu meningkatkan energi kinetik rata-rata molekul. Hal ini memicu frekuensi tumbukan efektif yang lebih tinggi dan memperbesar fraksi mol zat yang memiliki energi melebihi batas Energi Aktivasi (Ea).',
    hint: 'Suhu meningkatkan kecepatan gerak partikel sehingga tumbukan antar zat lebih bertenaga.'
  },
  {
    id: 'f13',
    category: 'Colloids & Solutions',
    question: 'Apa itu "Efek Tyndall" dan mengapa fenomena ini dapat digunakan untuk mendeteksi sistem koloid?',
    answer: 'Efek Tyndall adalah fenomena hamburan berkas cahaya oleh partikel koloid (ukuran 1-100 nm). Larutan sejati memiliki partikel terlarut sangat kecil (<1 nm) sehingga tidak melontarkan/menghamburkan cahaya melainkan meneruskannya.',
    hint: 'Contoh nyata: sorot lampu mobil di tengah kabut basah vs di daerah hampa udara.'
  },
  {
    id: 'f14',
    category: 'Chemical Bonding',
    question: 'Apa perbedaan karakteristik kovalen polar vs nonpolar ditinjau dari momen dipol?',
    answer: 'Kovalen polar memiliki momen dipol total (μ) tidak sama dengan nol karena adanya ketidakseimbangan keelektronegatifan dan geometri asimetris. Kovalen nonpolar simetris sehingga tarikan muatan saling meniadakan (μ = 0).',
    hint: 'Distribusi awan elektron merata pada nonpolar, dan memusat ke satu arah pada polar.'
  },
  {
    id: 'f15',
    category: 'Stoichiometry',
    question: 'Jika suatu larutan memiliki konsentrasi 1 Molar (M), berapa jumlah mol zat terlarut murni di dalam 250 mL larutan tersebut?',
    answer: 'Jumlah mol terlarut adalah 0.25 mol. Dihitung menggunakan rumus mol = Molaritas * Volume (Liter) = 1 M * 0.250 Liters = 0.25 mol.',
    hint: 'Ingat konversi mililiter ke liter terlebih dahulu!'
  },
  {
    id: 'f16',
    category: 'Atomic Physics',
    question: 'Menurut model mekanika kuantum, apa yang dimaksud dengan orbital atom?',
    answer: 'Orbital adalah tingkat keterwakilan matematis/probabilitas ruang 3D di sekeliling inti tempat ditemukannya posisi elektron dengan peluang tertinggi (~90%). Ini meniadakan lintasan kaku lingkaran penuh.',
    hint: 'Prinsip Ketidakpastian Heisenberg membuktikan posisi eksak elektron tidak bisa ditunjuk serentak.'
  },
  {
    id: 'f17',
    category: 'Solubility & Ksp',
    question: 'Mengapa penambahan garam dapur (NaCl) ke dalam larutan jenuh AgCl dapat membentuk endapan padat AgCl baru?',
    answer: 'Ini disebabkan oleh Efek Ion Sejenis (Common Ion Effect). Tambahan Cl⁻ dari NaCl mendesak kesetimbangan reaksi AgCl(s) ⇌ Ag⁺ + Cl⁻ bergeser ke kiri untuk memenuhi batas konstanta Ksp AgCl.',
    hint: 'Penambahan ion sejenis selalu menurunkan kelarutan elektrolit yang sukar larut.'
  },
  {
    id: 'f18',
    category: 'Organic Chemistry',
    question: 'Apa yang dimaksud dengan reaksi Esterifikasi Fischer dan zat apa yang dihasilkan?',
    answer: 'Esterifikasi Fischer adalah reaksi pembentukan senyawa Ester dan air (H₂O) melalui kondensasi asam karboksilat dengan alkohol, biasanya dikatalisis oleh asam kuat pekat (seperti H₂SO₄).',
    hint: 'Menghasilkan wewangian buah-buahan sintetis (aroma ester).'
  },
  {
    id: 'f19',
    category: 'Macromolecules',
    question: 'Uji warna apakah yang spesifik digunakan untuk mengidentifikasi keberadaan ikatan peptida (protein) dalam larutan?',
    answer: 'Uji Biuret. Dalam kondisi basa, reagen CuSO₄ akan berkoordinasi dengan nitrogen ikatan peptida membentuk senyawa kompleks koordinasi tembaga berwarna ungu (violet).',
    hint: 'Jika positif mengandung ikatan peptida protein, warna berubah drastis menjadi ungu/violet.'
  },
  {
    id: 'f20',
    category: 'Thermochemistry',
    question: 'Apa kontribusi Hukum Hess dalam bidang termokimia industri?',
    answer: 'Hukum Hess membuktikan perubahan entalpi keseluruhan bersifat aditif dan tidak tergantung rute/tahapan reaksi. Ini memudahkan penghitungan panas kalor reaksi yang berbahaya atau sangat lambat jika diukur langsung.',
    hint: 'Entalpi adalah fungsi keadaan—hanya menilai kondisi titik akhir dikurangi awal.'
  }
];

export const INITIAL_MASTERY_DATA: MasteryDay[] = [
  { day: 'SEN', level: 42 },
  { day: 'SEL', level: 55 },
  { day: 'RAB', level: 32 },
  { day: 'KAM', level: 75 },
  { day: 'JUM', level: 60 },
  { day: 'SAB', level: 82 },
  { day: 'MIN', level: 64 }
];
