/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VoltaMetal {
  id: string;
  name: string;
  symbol: string;
  e0: number; // Standard reduction potential in Volts
  valency: number; // e.g. Mg2+ is 2, Ag+ is 1
  electrodeColor: string;
  solutionColor: string;
  ionSymbol: string;
  description: string;
}

export interface RedoxReaction {
  id: string;
  reactantStr: string;
  productStr: string;
  type: 'acidic' | 'basic';
  unbalanced: string;
  steps: {
    title: string;
    description: string;
    equation: string;
  }[];
}

export interface ElectrolyteReaction {
  id: string;
  name: string;
  phase: 'aqueous' | 'molten';
  anodeMaterial: 'Pt' | 'Cu';
  solutionColor: string;
  beakerColor: string;
  cathodeReaction: string;
  anodeReaction: string;
  cathodeProduct: string;
  anodeProduct: string;
  cathodeBubbles: boolean;
  anodeBubbles: boolean;
  cathodeDeposit: 'copper' | 'silver' | 'none' | 'sodium';
  anodeDeposit: 'none' | 'iodine' | 'dissolve';
  cathodeAr: number;
  cathodeValency: number;
  anodeAr: number;
  anodeValency: number;
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const VOLTA_METALS: VoltaMetal[] = [
  {
    id: 'Mg',
    name: 'Magnesium',
    symbol: 'Mg',
    e0: -2.37,
    valency: 2,
    electrodeColor: '#e2e8f0',
    solutionColor: 'rgba(241, 245, 249, 0.08)',
    ionSymbol: 'Mg²⁺',
    description: 'Logam alkali tanah yang sangat reaktif. Memiliki potensial oksidasi tinggi sehingga handal sebagai anoda pelindung korosi.'
  },
  {
    id: 'Al',
    name: 'Aluminium',
    symbol: 'Al',
    e0: -1.66,
    valency: 3,
    electrodeColor: '#cbd5e1',
    solutionColor: 'rgba(241, 245, 249, 0.06)',
    ionSymbol: 'Al³⁺',
    description: 'Logam ringan yang tahan terhadap korosi udara karena lapisan pasivasi alumina alami.'
  },
  {
    id: 'Zn',
    name: 'Seng',
    symbol: 'Zn',
    e0: -0.76,
    valency: 2,
    electrodeColor: '#94a3b8',
    solutionColor: 'rgba(226, 232, 240, 0.07)',
    ionSymbol: 'Zn²⁺',
    description: 'Bahan anoda klasik pada sel kering baterai karbon-seng dan proses galvanisasi besi.'
  },
  {
    id: 'Fe',
    name: 'Besi',
    symbol: 'Fe',
    e0: -0.44,
    valency: 2,
    electrodeColor: '#64748b',
    solutionColor: 'rgba(74, 222, 128, 0.1)',
    ionSymbol: 'Fe²⁺',
    description: 'Logam transisi magnetik melimpah yang rentan terhadap korosi (oksidasi spontan berkarat).'
  },
  {
    id: 'Ni',
    name: 'Nikel',
    symbol: 'Ni',
    e0: -0.25,
    valency: 2,
    electrodeColor: '#a1a1aa',
    solutionColor: 'rgba(16, 185, 129, 0.15)',
    ionSymbol: 'Ni²⁺',
    description: 'Sering digunakan dalam pelapisan baja dekoratif dan sistem elektrokimia baterai Ni-Cd.'
  },
  {
    id: 'Pb',
    name: 'Timbal',
    symbol: 'Pb',
    e0: -0.13,
    valency: 2,
    electrodeColor: '#71717a',
    solutionColor: 'rgba(148, 163, 184, 0.12)',
    ionSymbol: 'Pb²⁺',
    description: 'Logam berat padat penghantar lemah yang menyusun plat elektroda pada baterai aki kendaraan bermotor.'
  },
  {
    id: 'Cu',
    name: 'Tembaga',
    symbol: 'Cu',
    e0: 0.34,
    valency: 2,
    electrodeColor: '#b87333',
    solutionColor: 'rgba(6, 182, 212, 0.22)',
    ionSymbol: 'Cu²⁺',
    description: 'Logam transisi mulia berdaya hantar listrik sangat baik. Kationnya Cu²⁺ mengendap sebagai lapisan tembaga pada reduksi.'
  },
  {
    id: 'Ag',
    name: 'Perak',
    symbol: 'Ag',
    e0: 0.80,
    valency: 1,
    electrodeColor: '#f8fafc',
    solutionColor: 'rgba(100, 116, 139, 0.08)',
    ionSymbol: 'Ag⁺',
    description: 'Logam bernilai tinggi dengan tingkat konduktivitas listrik termurni di antara semua logam bebas.'
  }
];

export const REDOX_REACTIONS: RedoxReaction[] = [
  {
    id: 'rx-1',
    reactantStr: 'MnO₄⁻ + Fe²⁺',
    productStr: 'Mn²⁺ + Fe³⁺',
    type: 'acidic',
    unbalanced: 'MnO₄⁻(aq) + Fe²⁺(aq) ➔ Mn²⁺(aq) + Fe³⁺(aq)  [Suasana Asam]',
    steps: [
      {
        title: 'Pisahkan Setengah Reaksi',
        description: 'Bagi seluruh spesi kimia menjadi setengah-reaksi reduksi dan oksidasi.',
        equation: 'Reduksi: MnO₄⁻ ➔ Mn²⁺\nOksidasi: Fe²⁺ ➔ Fe³⁺'
      },
      {
        title: 'Setarakan Atom Selain O & H',
        description: 'Setarakan atom selain oksigen dan hidrogen. Di sini Mn dan Fe sudah setara di kedua sisi.',
        equation: 'Reduksi: MnO₄⁻ ➔ Mn²⁺ (Setara)\nOksidasi: Fe²⁺ ➔ Fe³⁺ (Setara)'
      },
      {
        title: 'Setarakan Oksigen (Tambah H₂O)',
        description: 'Setarakan jumlah O dengan menambahkan molekul H₂O pada sisi yang kekurangan oksigen (spesi kanan pada reduksi).',
        equation: 'Reduksi: MnO₄⁻ ➔ Mn²⁺ + 4H₂O\nOksidasi: Fe²⁺ ➔ Fe³⁺'
      },
      {
        title: 'Setarakan Hidrogen (Tambah H⁺)',
        description: 'Setarakan atom H dengan menambahkan ion H⁺ pada sisi yang kekurangan hidrogen (spesi kiri pada reduksi karena suasana asam).',
        equation: 'Reduksi: MnO₄⁻ + 8H⁺ ➔ Mn²⁺ + 4H₂O\nOksidasi: Fe²⁺ ➔ Fe³⁺'
      },
      {
        title: 'Setarakan Muatan (Tambah El)',
        description: 'Tambahkan elektron (e⁻) pada sisi bermuatan lebih positif agar muatan kiri dan kanan bernilai seimbang.',
        equation: 'Reduksi (kirimuat=+7, kananmuat=+2): MnO₄⁻ + 8H⁺ + 5e⁻ ➔ Mn²⁺ + 4H₂O\nOksidasi (kirimuat=+2, kananmuat=+3): Fe²⁺ ➔ Fe³⁺ + e⁻'
      },
      {
        title: 'Samakan Elektron Diserap & Dilepas',
        description: 'Kalikan reaksi oksidasi dengan 5 dan reduksi dengan 1 sehingga elektron yang dilepas sama dengan elektron yang diserap.',
        equation: 'Reduksi: 1 x [MnO₄⁻ + 8H⁺ + 5e⁻ ➔ Mn²⁺ + 4H₂O]\nOksidasi: 5 x [Fe²⁺ ➔ Fe³⁺ + e⁻]'
      },
      {
        title: 'Gabungkan Setengah Reaksi',
        description: 'Satukan kedua reaksi dan eliminasi elektron dari kedua belah pihak.',
        equation: 'MnO₄⁻(aq) + 8H⁺(aq) + 5Fe²⁺(aq) ➔ Mn²⁺(aq) + 4H₂O(l) + 5Fe³⁺(aq)'
      }
    ]
  },
  {
    id: 'rx-2',
    reactantStr: 'Cr₂O₇²⁻ + C₂O₄²⁻',
    productStr: 'Cr³⁺ + CO₂',
    type: 'acidic',
    unbalanced: 'Cr₂O₇²⁻(aq) + C₂O₄²⁻(aq) ➔ Cr³⁺(aq) + CO₂(g)  [Suasana Asam]',
    steps: [
      {
        title: 'Pisahkan Setengah Reaksi',
        description: 'Bagi menjadi setengah-reaksi berdasarkan unsur yang mengalami perubahan bilangan oksidasi.',
        equation: 'Reduksi: Cr₂O₇²⁻ ➔ Cr³⁺\nOksidasi: C₂O₄²⁻ ➔ CO₂'
      },
      {
        title: 'Setarakan Atom Selain O & H',
        description: 'Setarakan atom Cr (bagi dengan mengalikan produk kanannya dengan 2) dan atom C (kalikan spesi kanannya dengan 2).',
        equation: 'Reduksi: Cr₂O₇²⁻ ➔ 2Cr³⁺\nOksidasi: C₂O₄²⁻ ➔ 2CO₂'
      },
      {
        title: 'Setarakan Oksigen (Tambah H₂O)',
        description: 'Tambahkan 7 molekul H₂O pada ruas kanan reduksi karena ruas kiri memiliki 7 atom O.',
        equation: 'Reduksi: Cr₂O₇²⁻ ➔ 2Cr³⁺ + 7H₂O\nOksidasi: C₂O₄²⁻ ➔ 2CO₂ (Sudah Setara O)'
      },
      {
        title: 'Setarakan Hidrogen (Tambah H⁺)',
        description: 'Tambahkan 14 ion H⁺ pada sisi kiri reaksi reduksi.',
        equation: 'Reduksi: Cr₂O₇²⁻ + 14H⁺ ➔ 2Cr³⁺ + 7H₂O\nOksidasi: C₂O₄²⁻ ➔ 2CO₂'
      },
      {
        title: 'Setarakan Muatan (Tambah El)',
        description: 'Tambahkan elektron agar total muatan kanan dan kiri sama.',
        equation: 'Reduksi (net kiri=+12, kanan=+6): Cr₂O₇²⁻ + 14H⁺ + 6e⁻ ➔ 2Cr³⁺ + 7H₂O\nOksidasi (net kiri=-2, kanan=0): C₂O₄²⁻ ➔ 2CO₂ + 2e⁻'
      },
      {
        title: 'Samakan Jumlah Elektron',
        description: 'Kalikan reaksi oksidasi dengan 3 dan reaksi reduksi dengan 1 sehingga total elektron yang mengalir adalah 6e⁻.',
        equation: 'Reduksi: [Cr₂O₇²⁻ + 14H⁺ + 6e⁻ ➔ 2Cr³⁺ + 7H₂O] x 1\nOksidasi: [C₂O₄²⁻ ➔ 2CO₂ + 2e⁻] x 3'
      },
      {
        title: 'Gabungkan & Sederhanakan',
        description: 'Jumlahkan kedua setengah reaksi dan hilangkan spesi elektron berulang.',
        equation: 'Cr₂O₇²⁻(aq) + 14H⁺(aq) + 3C₂O₄²⁻(aq) ➔ 2Cr³⁺(aq) + 7H₂O(l) + 6CO₂(g)'
      }
    ]
  },
  {
    id: 'rx-3',
    reactantStr: 'Cl₂ + IO₃⁻',
    productStr: 'Cl⁻ + IO₄⁻',
    type: 'basic',
    unbalanced: 'Cl₂(g) + IO₃⁻(aq) ➔ Cl⁻(aq) + IO₄⁻(aq)  [Suasana Basa]',
    steps: [
      {
        title: 'Pisahkan Setengah Reaksi',
        description: 'Pisahkan menjadi reaksi reduksi gas klorin serta oksidasi ion iodat.',
        equation: 'Reduksi: Cl₂ ➔ Cl⁻\nOksidasi: IO₃⁻ ➔ IO₄⁻'
      },
      {
        title: 'Setarakan Atom Selain O & H',
        description: 'Kalikan spesi produk kanan klorida dengan 2 agar atom Cl seimbang.',
        equation: 'Reduksi: Cl₂ ➔ 2Cl⁻\nOksidasi: IO₃⁻ ➔ IO₄⁻ (Sudah setara I)'
      },
      {
        title: 'Setarakan O (Gunakan Basa)',
        description: 'Dalam suasana basa, ruas yang kekurangan oksigen (IO₃⁻) ditambah ion OH⁻ sebanyak 2 kali kekurangan, dan ruas lainnya ditambah air, ATAU gunakan metode standar: setarakan O dengan H₂O lalu tambahkan OH⁻ sejumlah H⁺ untuk menetralkan.',
        equation: 'Reduksi: Cl₂ ➔ 2Cl⁻\nOksidasi: IO₃⁻ + 2OH⁻ ➔ IO₄⁻ + H₂O'
      },
      {
        title: 'Setarakan Muatan (Tambah El)',
        description: 'Tambahkan elektron pada bilik muatan lebih positif.',
        equation: 'Reduksi: Cl₂ + 2e⁻ ➔ 2Cl⁻\nOksidasi (kiri=-3, kanan=-1): IO₃⁻ + 2OH⁻ ➔ IO₄⁻ + H₂O + 2e⁻'
      },
      {
        title: 'Gabungkan Setengah Reaksi',
        description: 'Kedua setengah-reaksi dilewati oleh 2 elektron, sehingga kita dapat langsung menyatukannya.',
        equation: 'Cl₂(g) + IO₃⁻(aq) + 2OH⁻(aq) ➔ 2Cl⁻(aq) + IO₄⁻(aq) + H₂O(l)'
      }
    ]
  }
];

export const ELECTROLYTE_REACTIONS: ElectrolyteReaction[] = [
  {
    id: 'CuSO4_inert',
    name: 'Larutan CuSO₄ dengan Elektroda Pt (Inert)',
    phase: 'aqueous',
    anodeMaterial: 'Pt',
    solutionColor: 'rgba(6, 182, 212, 0.2)', // Sky blue solution
    beakerColor: '#0e7490',
    cathodeReaction: 'Cu²⁺(aq) + 2e⁻ ➔ Cu(s)',
    anodeReaction: '2H₂O(l) ➔ O₂(g) + 4H⁺(aq) + 4e⁻',
    cathodeProduct: 'Endapan Tembaga (Cu) pada katoda',
    anodeProduct: 'Gelembung Gas Oksigen (O₂)',
    cathodeBubbles: false,
    anodeBubbles: true,
    cathodeDeposit: 'copper',
    anodeDeposit: 'none',
    cathodeAr: 63.5,
    cathodeValency: 2,
    anodeAr: 32.0,
    anodeValency: 4, // 4e- exchanged per mole of O2
    explanation: 'Karena Cu²⁺ adalah kation logam transisi, potensial reduksinya lebih besar daripada air. Di anoda, karena Pt bersifat inert dan sisa asam (SO₄²⁻) sukar dioksidasi, maka air dioksidasi menjadi gas O₂.'
  },
  {
    id: 'CuSO4_active',
    name: 'Larutan CuSO₄ dengan Elektroda Cu (Aktif)',
    phase: 'aqueous',
    anodeMaterial: 'Cu',
    solutionColor: 'rgba(6, 182, 212, 0.22)',
    beakerColor: '#0891b2',
    cathodeReaction: 'Cu²⁺(aq) + 2e⁻ ➔ Cu(s)',
    anodeReaction: 'Cu(s) ➔ Cu²⁺(aq) + 2e⁻',
    cathodeProduct: 'Endapan Tembaga (Cu) pada katoda',
    anodeProduct: 'Oksidasi Anoda Tembaga (Cu Larut)',
    cathodeBubbles: false,
    anodeBubbles: false,
    cathodeDeposit: 'copper',
    anodeDeposit: 'dissolve',
    cathodeAr: 63.5,
    cathodeValency: 2,
    anodeAr: 63.5,
    anodeValency: 2,
    explanation: 'Di katoda, kation Cu²⁺ kembali tereduksi menjadi endapan tembaga padu. Di anoda, karena elektroda Cu bersifat aktif, logam tembaga pada lempeng anoda itu sendiri yang meluruh teroksidasi menjadi ion larut Cu²⁺.'
  },
  {
    id: 'NaCl_aqueous',
    name: 'Larutan NaCl dengan Elektroda Pt (Inert)',
    phase: 'aqueous',
    anodeMaterial: 'Pt',
    solutionColor: 'rgba(255, 255, 255, 0.05)', // Colorless clear
    beakerColor: '#334155',
    cathodeReaction: '2H₂O(l) + 2e⁻ ➔ H₂(g) + 2OH⁻(aq)',
    anodeReaction: '2Cl⁻(aq) ➔ Cl₂(g) + 2e⁻',
    cathodeProduct: 'Gas Hidrogen (H₂) + Sifat Basa (pH naik)',
    anodeProduct: 'Gas Klorin (Cl₂) berbau khas kekuningan',
    cathodeBubbles: true,
    anodeBubbles: true,
    cathodeDeposit: 'none',
    anodeDeposit: 'none',
    cathodeAr: 2.0, // H2 gas mass
    cathodeValency: 2,
    anodeAr: 71.0, // Cl2 gas mass
    anodeValency: 2,
    explanation: 'Di katoda, ion Na⁺ (alkali) memiliki potensial reduksi jauh lebih rendah dibanding air. Maka molekul air tereduksi menghasilkan gas H₂ & lingkungan basa. Di anoda, anion halogen Cl⁻ mudah dioksidasi membentuk Cl₂.'
  },
  {
    id: 'NaCl_molten',
    name: 'Lelehan / Leburan NaCl dengan Elektroda Pt',
    phase: 'molten',
    anodeMaterial: 'Pt',
    solutionColor: 'rgba(249, 115, 22, 0.15)', // Orange molten sodium salt feel
    beakerColor: '#c2410c',
    cathodeReaction: 'Na⁺(l) + e⁻ ➔ Na(l)',
    anodeReaction: '2Cl⁻(l) ➔ Cl₂(g) + 2e⁻',
    cathodeProduct: 'Logam Cair Natrium / Sodium Na',
    anodeProduct: 'Gelembung Gas Klorin (Cl₂)',
    cathodeBubbles: false,
    anodeBubbles: true,
    cathodeDeposit: 'sodium',
    anodeDeposit: 'none',
    cathodeAr: 23.0,
    cathodeValency: 1,
    anodeAr: 71.0,
    anodeValency: 2,
    explanation: 'Pada bentuk lelehan / leburan, media air TIDAK hadir (H₂O = 0). Akibatnya, kation Na⁺ terpaksa tereduksi secara langsung menghasilkan logam natrium cair panas di kutub negatif katoda.'
  },
  {
    id: 'KI_aqueous',
    name: 'Larutan KI dengan Elektroda Pt (Inert)',
    phase: 'aqueous',
    anodeMaterial: 'Pt',
    solutionColor: 'rgba(253, 224, 71, 0.08)', // Faint yellow-brown KI
    beakerColor: '#a16207',
    cathodeReaction: '2H₂O(l) + 2e⁻ ➔ H₂(g) + 2OH⁻(aq)',
    anodeReaction: '2I⁻(aq) ➔ I₂(s) + 2e⁻',
    cathodeProduct: 'Gas Hidrogen (H₂)',
    anodeProduct: 'Iodium (I₂) mengendap cokelat di sekitar anoda',
    cathodeBubbles: true,
    anodeBubbles: false,
    cathodeDeposit: 'none',
    anodeDeposit: 'iodine',
    cathodeAr: 2.0,
    cathodeValency: 2,
    anodeAr: 254.0, // I2 solid mass
    anodeValency: 2,
    explanation: 'Katoda mereduksi air membentuk gelembung gas H₂ karena ion K⁺ tidak reaktif. Sedangkan di anoda, anion I⁻ dengan mudah teroksidasi menghasilkan padatan Iodium (I₂) yang mewarnai kuning-coklat lingkungan sekitar electrode.'
  },
  {
    id: 'AgNO3_inert',
    name: 'Larutan AgNO₃ dengan Elektroda Pt (Inert)',
    phase: 'aqueous',
    anodeMaterial: 'Pt',
    solutionColor: 'rgba(255, 255, 255, 0.08)',
    beakerColor: '#475569',
    cathodeReaction: 'Ag⁺(aq) + e⁻ ➔ Ag(s)',
    anodeReaction: '2H₂O(l) ➔ O₂(g) + 4H⁺(aq) + 4e⁻',
    cathodeProduct: 'Lapisan Perak Mengkilap (Ag)',
    anodeProduct: 'Gelembung Gas Oksigen (O₂)',
    cathodeBubbles: false,
    anodeBubbles: true,
    cathodeDeposit: 'silver',
    anodeDeposit: 'none',
    cathodeAr: 108.0,
    cathodeValency: 1,
    anodeAr: 32.0,
    anodeValency: 4,
    explanation: 'Kation Ag⁺ merupakan ion transisi logam mulia yang potensial reduksinya sangat positif sehingga mendominasi reduksi air. Di anoda, asam oksi NO₃⁻ tidak teroksidasi, melainkan air terurai menghasilkan oksigen.'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Manakah pernyataan yang tepat mengenai arah aliran elektron pada sel Volta standar?",
    options: [
      "Elektron mengalir dari katoda bermuatan positif ke anoda bermuatan negatif.",
      "Elektron mengalir dari anoda (oksidasi) ke katoda (reduksi) melalui kawat sirkuit luar.",
      "Elektron mengalir menembus jembatan garam dari larutan encer ke kental.",
      "Elektron dipindahkan lewat kation jembatan garam ke dalam reservoir anoda."
    ],
    correctAnswer: 1,
    explanation: "Elektron dihasilkan pada elektroda Anoda melalui reaksi oksidasi (pelepasan elektron) dan mengalir melalui sirkuit luar menuju elektroda Katoda untuk memediasi reaksi reduksi (penerimaan elektron) kation logam."
  },
  {
    question: "Fungsi utama jembatan garam dalam susunan sel elektrokimia Galvani adalah...",
    options: [
      "Menghasilkan arus elektron tambahan demi melipatgandakan beda potensial.",
      "Mencegah pelepasan oksigen bebas ke atmosfer laboratorium.",
      "Menjaga kenetralan muatan larutan dengan memindahkan anion ke anoda dan kation ke katoda.",
      "Mereduksi logam di katoda agar tidak terjadi konsleting listrik cair."
    ],
    correctAnswer: 2,
    explanation: "Tanpa jembatan garam, bejana kation anoda akan kelebihan muatan positif karena disosiasi logam, sedangkan bejana katoda akan kekurangan kation. Jembatan garam menetralkannya secara simultan dengan migrasi ion cair pelindung."
  },
  {
    question: "Diketahui potensial reduksi: Zn²⁺ | Zn = -0,76V dan Cu²⁺ | Cu = +0,34V. Notasi sel yang terbentuk spontan adalah...",
    options: [
      "Cu | Cu²⁺ || Zn²⁺ | Zn",
      "Zn | Zn²⁺ || Cu²⁺ | Cu",
      "Zn²⁺ | Zn || Cu | Cu²⁺",
      "Cu²⁺ | Cu || Zn | Zn²⁺"
    ],
    correctAnswer: 1,
    explanation: "Spontanitas tercapai jika potensial sel total E° sel bernilai positif. Karena Cu lebih positif maka Cu bertindak sebagai katoda (reduksi) dan Zn sebagai anoda (oksidasi). Susunan notasi sel adalah: Anoda | Ion Anoda || Ion Katoda | Katoda. Sehingga menjadi Zn | Zn²⁺ || Cu²⁺ | Cu."
  },
  {
    question: "Pada penentuan biloks unsur-unsur dalam senyawa, berapakah bilangan oksidasi Atom Cr dalam ion poliatomik kromat dikromat Cr₂O₇²⁻?",
    options: [
      "+3",
      "+5",
      "+6",
      "+7"
    ],
    correctAnswer: 2,
    explanation: "Setiap atom O memiliki biloks -2. Karena total muatan senyawa adalah -2, maka: 2(Biloks Cr) + 7(-2) = -2 => 2(Biloks Cr) - 14 = -2 => 2(Biloks Cr) = +12 => Biloks Cr = +6."
  },
  {
    question: "Pada penyetaraan reaksi redoks MnO₄⁻ + Fe²⁺ ➔ Mn²⁺ + Fe³⁺ dalam suasana asam, berapakah koefisien ion H⁺ dan air H₂O berturut-turut setelah disetarakan?",
    options: [
      "8 dan 4",
      "4 dan 8",
      "6 dan 3",
      "14 dan 7"
    ],
    explanation: "Setelah reaksi disetarakan seutuhnya dengan metode setengah reaksi, persamaan setaranya adalah: MnO₄⁻ + 5Fe²⁺ + 8H⁺ ➔ Mn²⁺ + 5Fe³⁺ + 4H₂O. Jadi koefisien H⁺ adalah 8 dan molekul air H₂O adalah 4.",
    correctAnswer: 0
  },
  {
    question: "Pada peristiwa elektrolisis larutan garam dapur (NaCl) menggunakan elektroda inert Platinum (Pt), produk apakah yang terbentuk di masing-masing kutub?",
    options: [
      "Katoda: Gas Cl₂; Anoda: Logam Na cair",
      "Katoda: Logam Na; Anoda: Gas O₂",
      "Katoda: Gas H₂; Anoda: Gas Cl₂",
      "Katoda: Gas O₂; Anoda: Gas H₂"
    ],
    correctAnswer: 2,
    explanation: "Karena ion Na⁺ merupakan logam golongan IA reaktif, potensial reduksinya jauh di bawah air sehingga air yang tereduksi di katoda menghasilkan gas H₂. Untuk anoda inert, ion Cl⁻ dioksidasi menghasilkan gas Cl₂."
  },
  {
    question: "Apa yang terjadi pada anoda apabila larutan tembaga sulfat CuSO₄ dielektrolisis menggunakan elektroda Tembaga (Cu) aktif?",
    options: [
      "Eksitasi gas oksigen O₂ dalam jumlah besar.",
      "Suhu bejana mendingin karena reaksi berjalan endotermis murni.",
      "Anoda tembaga menyusut dan terkikis karena larut menjadi ion Cu²⁺.",
      "Anoda mengeras dan dilapisi cairan gelatin putih perak."
    ],
    correctAnswer: 2,
    explanation: "Apabila menggunakan elektroda aktif (non-inert seperti Cu), elektroda logam tembaga di anoda memiliki kecenderungan teroksidasi yang lebih tinggi dibanding air. Sehingga, kawat/elektroda tembaga melarut menghasilkan kation Cu²⁺."
  },
  {
    question: "Berdasarkan Hukum I Faraday, berapakah massa logam perak (Ag, Ar = 108) yang dihasilkan di katoda jika larutan AgNO₃ dielektrolisis selama 965 detik dengan arus sebesar 10 Ampere?",
    options: [
      "10.8 gram",
      "21.6 gram",
      "5.4 gram",
      "1.08 gram"
    ],
    correctAnswer: 0,
    explanation: "Menggunakan Hukum I Faraday: w = e * I * t / 96500. Nilai e (berat ekivalen) Ag adalah Ar / valensi = 108 / 1 = 108. Jadi w = 108 * 10 * 965 / 96500 => w = 1080 * 965 / 96500 = 10.8 gram."
  },
  {
    question: "Manakah perbedaan prinsip yang benar mengenai Sel Volta dan Sel Elektrolisis?",
    options: [
      "Sel Volta memerlukan baterai luar; Sel Elektrolisis menghasilkan baterai listrik.",
      "Sel Volta katoda bermuatan negatif; Sel Elektrolisis katoda bermuatan positif.",
      "Sel Volta mengonversi energi kimia menjadi listrik; Sel Elektrolisis mengubah energi listrik menjadi kimia.",
      "Sel Volta menghasilkan gas halogen bebas spontan; Sel Elektrolisis selalu berkarat melarut logam alkali."
    ],
    correctAnswer: 2,
    explanation: "Sel elektrokimia Volta didesain untuk reaksi kimia spontan agar melepaskan sirkulasi energi listrik. Sebaliknya, elektrolisis memompa arus listrik luar dari adaptor/baterai untuk memicu reaksi kimia non-spontan."
  },
  {
    question: "Pada elektrolisis lelehan natrium klorida (molten NaCl), mengapa logam natrium Na cair dapat diproduksi di Katoda?",
    options: [
      "Karena natrium klorida lelehan memiliki suhu mendidih yang sangat tinggi bertekanan besar.",
      "Karena tiadanya media air (H₂O), sehingga kation alkali Na⁺ tidak perlu bersaing dengan reduksi air.",
      "Karena elektroda Pt memindahkan klorin secara spontan mengisolasi Na klorida.",
      "Karena ion klorida bertindak sebagai katalis reduksi selektif natrium kromat."
    ],
    correctAnswer: 1,
    explanation: "Pada media lelehan, air tidak ada sama sekali. Akibatnya, kation natrium Na⁺ tidak berkompetisi dengan air dan langsung menerima elektron dari katoda untuk membentuk logam natrium bebas."
  }
];
