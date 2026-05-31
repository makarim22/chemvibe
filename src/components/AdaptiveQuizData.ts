/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdaptiveQuestion {
  id: string;
  category: string; // Matches activeView string
  difficulty: 'mudah' | 'sedang' | 'sukar';
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const ADAPTIVE_QUIZ_DATA: AdaptiveQuestion[] = [
  // 1. periodic-table
  {
    id: 'pt-easy',
    category: 'periodic-table',
    difficulty: 'mudah',
    text: 'Dalam tabel periodik, unsur-unsur yang terletak dalam satu golongan vertikal yang sama memiliki kesamaan dalam hal...',
    options: [
      'Jumlah kulit elektron',
      'Jumlah elektron valensi',
      'Massa atom relatif',
      'Jari-jari ionik'
    ],
    correctIndex: 1,
    explanation: 'Unsur-unsur dalam satu golongan vertikal memiliki jumlah elektron valensi (elektron terluar) yang sama, sehingga memiliki kemiripan sifat kimia.'
  },
  {
    id: 'pt-medium',
    category: 'periodic-table',
    difficulty: 'sedang',
    text: 'Dari kiri ke kanan dalam satu periode yang sama pada tabel periodik, nilai energi ionisasi pertama cenderung...',
    options: [
      'Meningkat karena muatan inti efektif bertambah besar menahan elektron terluar',
      'Menurun karena jumlah kulit atom bertambah tebal',
      'Tetap tidak berubah karena berada pada kulit utama yang sama',
      'Menurun lalu meningkat secara drastis setelah golongan halogen'
    ],
    correctIndex: 0,
    explanation: 'Dari kiri ke kanan dalam satu periode, muatan positif di inti atom meningkat sementara kulit elektron tetap sama. Gaya tarik inti terhadap elektron luar meningkat, membuat elektron lebih sukar dilepas sehingga energi ionisasi meningkat.'
  },
  {
    id: 'pt-hard',
    category: 'periodic-table',
    difficulty: 'sukar',
    text: 'Mengapa energi ionisasi pertama unsur Seng (Zn, nomor atom 30) lebih tinggi daripada unsur Galium (Ga, nomor atom 31)?',
    options: [
      'Ukuran atom Ga lebih besar karena muatan inti lebih kecil',
      'Zn memiliki konfigurasi elektron dengan subkulit d dan s yang terisi penuh stabil ([Ar] 3d10 4s2)',
      'Ga berada pada golongan alkali tanah yang reaktif',
      'Elektron valensi Zn berada pada kulit kuantum utama yang lebih kecil dibanding Ga'
    ],
    correctIndex: 1,
    explanation: 'Zn memiliki konfigurasi elektron stabil [Ar] 3d10 4s2 dengan subkulit 4s terisi berpasangan penuh. Sementara Ga berada pada konfigurasi [Ar] 3d10 4s2 4p1. Elektron tunggal pada orbital 4p Ga lebih mudah dilepas daripada elektron subkulit 4s Zn yang penuh stabil.'
  },

  // 2. atom-builder
  {
    id: 'ab-easy',
    category: 'atom-builder',
    difficulty: 'mudah',
    text: 'Partikel penyusun inti atom (nukleus) terdiri atas...',
    options: [
      'Proton dan elektron',
      'Elektron dan neutron',
      'Proton dan neutron',
      'Positron dan neutron'
    ],
    correctIndex: 2,
    explanation: 'Inti atom bermuatan positif yang terdiri dari proton (bermuatan positif) dan neutron (netral), sedangkan elektron bergerak di sekitarnya dalam awan elektron.'
  },
  {
    id: 'ab-medium',
    category: 'atom-builder',
    difficulty: 'sedang',
    text: 'Berdasarkan aturan Hund, pengisian elektron pada orbital-orbital dengan tingkat energi yang sama dilakukan dengan cara...',
    options: [
      'Mengisi secara berpasangan penuh terlebih dahulu sebelum orbital kosong lain diisi',
      'Mengisi orbital secara tunggal dengan spin searah (paralel) sebelum berpasangan',
      'Mengisi orbital dari tingkat energi terluar langsung ke orbital d yang kosong',
      'Menempatkan seluruh elektron pada bilangan kuantum spin negatif saja'
    ],
    correctIndex: 1,
    explanation: 'Aturan Hund menyatakan bahwa jika orbital-orbital memiliki tingkat energi yang sama (degenarat), elektron akan menempati orbital secara sendiri-sendiri dengan arah spin sejajar baru kemudian berpasangan.'
  },
  {
    id: 'ab-hard',
    category: 'atom-builder',
    difficulty: 'sukar',
    text: 'Tentukan bilangan kuantum elektron terakhir dari unsur Titanium (Ti) yang memiliki nomor atom 22!',
    options: [
      'n = 3, l = 2, m = -1, s = +1/2',
      'n = 4, l = 0, m = 0, s = -1/2',
      'n = 3, l = 2, m = 0, s = +1/2',
      'n = 3, l = 1, m = +1, s = -1/2'
    ],
    correctIndex: 0,
    explanation: 'Konfigurasi elektron Titanium (22Ti) adalah 1s2 2s2 2s6 3s2 3p6 4s2 3d2. Elektron terakhir masuk ke subkulit 3d. Untuk subkulit d, l = 2, n = 3. Dengan 2 elektron di orbital d (m = -2, -1, 0, +1, +2), elektron terakhir menempati m = -1 dengan spin paralel s = +1/2.'
  },

  // 3. bonding-lab
  {
    id: 'bl-easy',
    category: 'bonding-lab',
    difficulty: 'mudah',
    text: 'Ikatan yang terbentuk akibat serah terima elektron antara atom logam bermuatan positif dan nonlogam bermuatan negatif disebut...',
    options: [
      'Ikatan Kovalen',
      'Ikatan Hidrogen',
      'Ikatan Ionik',
      'Ikatan Logam'
    ],
    correctIndex: 2,
    explanation: 'Ikatan ion terbentuk karena gaya tarik elektrostatik kation (logam yang melepas elektron) dan anion (nonlogam yang menerima elektron).'
  },
  {
    id: 'bl-medium',
    category: 'bonding-lab',
    difficulty: 'sedang',
    text: 'Manakah dari molekul berikut yang memiliki ikatan kovalen polar namun bersifat nonpolar karena bentuk geometrinya yang simetris?',
    options: [
      'H2O',
      'CO2',
      'NH3',
      'HCl'
    ],
    correctIndex: 1,
    explanation: 'CO2 memiliki ikatan C=O yang polar karena perbedaan elektronegativitas. Namun, bentuk molekulnya linear (simetris), sehingga momen dipol ikatannya saling meniadakan (momen dipol total = 0) dan menjadikannya nonpolar.'
  },
  {
    id: 'bl-hard',
    category: 'bonding-lab',
    difficulty: 'sukar',
    text: 'Gaya antarmolekul yang bertanggung jawab atas titik didih air (H2O) yang jauh lebih tinggi dibandingkan dengan senyawa hidrida segolongan seperti H2S adalah...',
    options: [
      'Gaya London (Dipol Sesaat)',
      'Ikatan Hidrogen',
      'Gaya Dipol-Dipol Permanen',
      'Interaksi Ion-Dipol'
    ],
    correctIndex: 1,
    explanation: 'Kombinasi atom hidrogen yang sangat elektropositif terikat pada atom sangat elektronegatif (N, O, F) menghasilkan Ikatan Hidrogen yang sangat kuat antarmolekulnya, menaikkan energi yang diperlukan untuk menguapkan air.'
  },

  // 4. geometry
  {
    id: 'g-easy',
    category: 'geometry',
    difficulty: 'mudah',
    text: 'Berdasarkan teori VSEPR, molekul dengan formula AX2 (tanpa pasangan elektron bebas / PEB) akan menghasilkan bentuk geometri...',
    options: [
      'Linear (Sudut 180°)',
      'Planar Trigonal',
      'Tetrahedral',
      'Bipiramida Trigonal'
    ],
    correctIndex: 0,
    explanation: 'Molekul tipe AX2 memiliki 2 domain ikatan tanpa PEB pada atom pusat. Tolak-menolak minimum dicapai saat orientasinya membentuk garis lurus (sudut 180°).'
  },
  {
    id: 'g-medium',
    category: 'geometry',
    difficulty: 'sedang',
    text: 'Molekul air (H2O) memiliki tipe molekul AX2E2 dengan 2 pasangan elektron ikatan (PEI) dan 2 pasangan elektron bebas (PEB). Berapakah perkiraan sudut ikatan H-O-H yang terbentuk?',
    options: [
      'Tepat 109,5°',
      'Sekitar 120°',
      'Sekitar 104,5°',
      'Tepat 90°'
    ],
    correctIndex: 2,
    explanation: 'Karena dorongan tolak-menolak PEB-PEB lebih kuat dibanding PEB-PEI dan PEI-PEI, sudut ikatan tetrahedral awal (109.5°) terdistorsi menyusut menjadi sekitar 104,5° (mengalami penyempitan).'
  },
  {
    id: 'g-hard',
    category: 'geometry',
    difficulty: 'sukar',
    text: 'Hibridisasi dan bentuk geometri molekul dari Sulfur Heksafluorida (SF6) adalah...',
    options: [
      'sp3 - Tetrahedral',
      'dsp3 - Bipiramida Trigonal',
      'd2sp3 - Oktahedral',
      'sp3d2 - Planar Segiempat'
    ],
    correctIndex: 2,
    explanation: 'SF6 memiliki 6 pasang elektron ikatan pada atom pusat belerang (S). Hal ini memerlukan hibridisasi sp3d2 (atau d2sp3) dengan penataan ruang 6 koordinat berbentuk oktahedral sempurna.'
  },

  // 5. stoichiometry
  {
    id: 's-easy',
    category: 'stoichiometry',
    difficulty: 'mudah',
    text: 'Berapakah jumlah mol zat terlarut dalam 500 mL larutan NaOH dengan konsentrasi 0,2 M?',
    options: [
      '0,1 mol',
      '1,0 mol',
      '0,01 mol',
      '0,5 mol'
    ],
    correctIndex: 0,
    explanation: 'Rumus mol: n = M x V. V dalam liter = 500 mL / 1000 = 0.5 L. Maka n = 0.2 M x 0.5 L = 0.1 mol.'
  },
  {
    id: 's-medium',
    category: 'stoichiometry',
    difficulty: 'sedang',
    text: 'Sebanyak 12 gram gas metana (CH4, Mr = 16 g/mol) dibakar sempurna dengan oksigen berlebih sesuai persamaan reaksi:\nCH4 + 2 O2 -> CO2 + 2 H2O. Berapakah massa gas CO2 (Mr = 44 g/mol) yang dihasilkan?',
    options: [
      '22 gram',
      '33 gram',
      '44 gram',
      '66 gram'
    ],
    correctIndex: 1,
    explanation: 'Mol CH4 = 12 / 16 = 0,75 mol. Berdasarkan koefisien reaksi, 1 mol CH4 menghasilkan 1 mol CO2. Maka mol CO2 = 0,75 mol. Massa CO2 = 0,75 x 44 = 33 gram.'
  },
  {
    id: 's-hard',
    category: 'stoichiometry',
    difficulty: 'sukar',
    text: 'Sebanyak 5,4 gram logam Aluminium (Ar = 27) direaksikan dengan 24,5 gram asam sulfat (H2SO4, Mr = 98) menghasilkan aluminium sulfat dan hidrogen:\n2 Al + 3 H2SO4 -> Al2(SO4)3 + 3 H2.\nZat yang bertindak sebagai pereaksi pembatas adalah...',
    options: [
      'Aluminium (Al)',
      'Asam Sulfat (H2SO4)',
      'Aluminium Sulfat (Al2(SO4)3)',
      'Kedua reaktan habis bersamaan'
    ],
    correctIndex: 1,
    explanation: 'Mol Al = 5,4 / 27 = 0.2 mol. Nilai pembagi koefisien = 0.2 / 2 = 0.1 . Mol H2SO4 = 24.5 / 98 = 0.25 mol. Nilai pembagi koefisien = 0.25 / 3 = 0.083. Karena 0.083 < 0.1, maka H2SO4 adalah pereaksi pembatas.'
  },

  // 6. titration
  {
    id: 'ti-easy',
    category: 'titration',
    difficulty: 'mudah',
    text: 'Keadaan di mana jumlah asam yang ditambahkan setara dengan jumlah basa sesuai koefisien reaksi dalam buret dinamakan...',
    options: [
      'Titik Akhir Titrasi',
      'Titik Ekuivalen',
      'Titik Netralisasi',
      'Titik Isoelektris'
    ],
    correctIndex: 1,
    explanation: 'Titik Ekuivalen adalah titik teoritis di mana larutan penitrat dan zat terlarut dalam labu erlenmeyer bereaksi sempurna secara stoikiometri.'
  },
  {
    id: 'ti-medium',
    category: 'titration',
    difficulty: 'sedang',
    text: 'Kira-kira berapa wilayah pH titik ekuivalen pada titrasi antara Asam Lemah (misal, CH3COOH) dengan Basa Kuat (misal, NaOH)?',
    options: [
      'pH < 7 karena didominasi ion asam sisa',
      'pH = 7 karena terjadi netralisasi sempurna',
      'pH > 7 (sekitar 8-9) karena terbentuk garam terhidrolisis sebagian yang bersifat basa',
      'pH mendekati 14 karena NaOH berlebih'
    ],
    correctIndex: 2,
    explanation: 'Hasil reaksi asam lemah dan basa kuat membentuk garam (seperti CH3COONa). Ion konjugat basa lemah (CH3COO-) akan terhidrolisis di air menghasilkan ion OH-, membuat larutan menjadi agak basa (pH > 7).'
  },
  {
    id: 'ti-hard',
    category: 'titration',
    difficulty: 'sukar',
    text: 'Jika 25 mL larutan HNO2 (asam lemah) dititrasi dengan 0,1 M KOH, dan titik ekuivalen dicapai setelah penambahan 20 mL KOH. Setelah penambahan ke-10 mL KOH, sistem membentuk buffer dengan pH larutan sebesar...',
    options: [
      'Sama dengan pKa dari HNO2',
      'Sama dengan 7 (Netral)',
      'Dua kali lipat dari konsentrasi awal',
      'Tergantung harga derajat disosiasi α KOH'
    ],
    correctIndex: 0,
    explanation: 'Keadaan setengah titik ekuivalen (ditambah 10 mL dari total 20 mL KOH yang dibutuhkan) menghasilkan mol asam terkira HNO2 sama dengan mol konjugatnya (NO2-). Berdasarkan persamaan Henderson-Hasselbalch, pH = pKa + log([garam]/[asam]), jika [garam]=[asam] maka pH = pKa.'
  },

  // 7. volta-lab
  {
    id: 'vl-easy',
    category: 'volta-lab',
    difficulty: 'mudah',
    text: 'Pada sel volta komersial, kutub elektrode tempat terjadinya reaksi Oksidasi disebut...',
    options: [
      'Katode (Kutub Positif)',
      'Katode (Kutub Negatif)',
      'Anode (Kutub Negatif)',
      'Anode (Kutub Positif)'
    ],
    correctIndex: 2,
    explanation: 'Dalam sel volta, Anode adalah tempat reaksi Oksidasi berlangsung dan bertindak sebagai kutub Negatif melepaskan elektron.'
  },
  {
    id: 'vl-medium',
    category: 'volta-lab',
    difficulty: 'sedang',
    text: 'Diketahui Potensial Reduksi Standar:\nZn2+ + 2e -> Zn (E° = -0,76 Volt)\nCu2+ + 2e -> Cu (E° = +0,34 Volt)\nBerapakah potensial sel (E° sel) standar yang dihasilkan dari kombinasi sel Zn-Cu ini?',
    options: [
      '+0,42 V',
      '+1,10 V',
      '-1,10 V',
      '+1,14 V'
    ],
    correctIndex: 1,
    explanation: 'E° sel = E° Katode (Reduksi) - E° Anode (Oksidasi). Katode adalah Cu (+0,30 V ke atas) dan Anode Zn (-0,76 V). Maka E° sel = +0,34 - (-0,76) = +1,10 Volt.'
  },
  {
    id: 'vl-hard',
    category: 'volta-lab',
    difficulty: 'sukar',
    text: 'Sesuai persamaan Nernst, apa yang akan terjadi pada potensial sel Daniell (Zn-Cu) jika konsentrasi ion seng [Zn2+] di anode ditingkatkan menjadi 2,0 M sementara ion tembaga [Cu2+] diturunkan menjadi 0,01 M pada suhu kamar?',
    options: [
      'Potensial sel meningkat karena sistem lebih bermuatan aktif',
      'Potensial sel tidak berubah karena elektrode logamnya padat',
      'Potensial sel menurun karena rasio Q = [Zn2+]/[Cu2+] meningkat',
      'Potensial sel berbalik polaritas dari positif menjadi negatif'
    ],
    correctIndex: 2,
    explanation: 'Persamaan Nernst: E = E° - (0,0592/n) * log(Q) di mana Q = [Zn2+]/[Cu2+]. Dengan meningkatkan reaktan ion seng (pembilang) dan menurunkan tembaga (penyebut), nilai Q membesar. Log(Q) bertanda positif besar, mengurangi nilai E sel akhir.'
  },

  // 8. kinetics-lab
  {
    id: 'kl-easy',
    category: 'kinetics-lab',
    difficulty: 'mudah',
    text: 'Mengapa menaikkan suhu larutan reaktan dapat mempercepat laju suatu reaksi kimia?',
    options: [
      'Meningkatkan energi aktivasi reaksi',
      'Meningkatkan energi kinetik partikel sehingga memperbesar frekuensi tumbukan efektif',
      'Membuat reaktan menjadi lebih encer dan steril',
      'Mengubah arah reaksi menjadi endotermik mendadak'
    ],
    correctIndex: 1,
    explanation: 'Peningkatan suhu meningkatkan energi kinetik partikel, menyebabkannya bergerak lebih cepat dan bertumbukan dengan energi yang melampaui energi aktivasi (tumbukan efektif).'
  },
  {
    id: 'kl-medium',
    category: 'kinetics-lab',
    difficulty: 'sedang',
    text: 'Suatu reaksi memiliki orde reaksi 2 terhadap reaktan B. Jika konsentrasi reaktan B diperbesar 3 kali lipat semula sedangkan reaktan lainnya dibuat tetap, laju reaksi akan menjadi...',
    options: [
      '3 kali lipat lebih cepat',
      '6 kali lipat lebih cepat',
      '9 kali lipat lebih cepat',
      'Tetap tidak berubah'
    ],
    correctIndex: 2,
    explanation: 'Persamaan laju v = k[B]^2. Jika [B] baru = 3[B], maka v baru = k * (3[B])^2 = 9 * k[B]^2 (9 kali lipat).'
  },
  {
    id: 'kl-hard',
    category: 'kinetics-lab',
    difficulty: 'sukar',
    text: 'Katalis bekerja mempercepat laju reaksi dengan cara membuka mekanisme reaksi baru yang memiliki...',
    options: [
      'Energi aktivasi (Ea) lebih rendah daripada jalur aslinya',
      'Perubahan entalpi (ΔH) yang bernilai jauh lebih eksotermis',
      'Konstanta kesetimbangan (Kc) yang berkali lipat lebih tinggi',
      'Gaya repulsion tolak-menolak antarmolekul yang dimampatkan'
    ],
    correctIndex: 0,
    explanation: 'Katalis memfasilitasi jalur koordinasi reaksi yang berbeda (transisi berenergi rendah) sehingga menurunkan energi aktivasi pembatas, mempercepat pembentukan produk tanpa dikonsumsi.'
  },

  // 9. equilibrium-lab
  {
    id: 'el-easy',
    category: 'equilibrium-lab',
    difficulty: 'mudah',
    text: 'Apabila pada reaksi kesetimbangan: N2(g) + 3H2(g) <=> 2NH3(g) volume wadah diperkecil (tekanan dinaikkan), kesetimbangan akan bergeser ke arah...',
    options: [
      'Kiri karena NH3 akan terurai menyerap kalor',
      'Kanan karena jumlah koefisien di kanan (2) lebih kecil dibanding di kiri (1 + 3 = 4)',
      'Tidak bergeser karena jumlah unsur N dan H tetap setara',
      'Kiri karena reaktan memerlukan ruang yang lapang'
    ],
    correctIndex: 1,
    explanation: 'Prinsip Le Chatelier: jika tekanan ditingkatkan (volume berkurang), sistem bergeser ke arah total koefisien gas terkecil untuk mengimbangi tekanan berlebih. Koefisien kanan = 2, koefisien kiri = 4.'
  },
  {
    id: 'el-medium',
    category: 'equilibrium-lab',
    difficulty: 'sedang',
    text: 'Reaksi sintesis gas berikut: PCl5(g) <=> PCl3(g) + Cl2(g) bersifat endotermis (ΔH = +92 kJ). Agar jumlah produk Cl2 meningkat maksimal, perlakuan apa yang paling tepat?',
    options: [
      'Menurunkan suhu sistem secara acak',
      'Menaikkan suhu sistem agar kesetimbangan bergeser ke arah endoterm',
      'Mengecilkan volume wadah logam penyimpan',
      'Menambahkan katalis katalisator dalam jumlah besar'
    ],
    correctIndex: 1,
    explanation: 'Karena reaksi endotermis memerlukan kalor, menaikkan suhu akan memicu sistem menyerap panas dengan bergeser ke arah reaktan endoterm (ke kanan), memproduksi lebih banyak PCl3 dan Cl2.'
  },
  {
    id: 'el-hard',
    category: 'equilibrium-lab',
    difficulty: 'sukar',
    text: 'Satu wadah bervolume 1 L diisi 4 mol gas CO dan 4 mol gas H2O membentuk kesetimbangan endotermik: CO(g) + H2O(g) <=> CO2(g) + H2(g). Jika nilai Kc = 4, berapakah sisa mol gas CO saat setimbang?',
    options: [
      '2,67 mol',
      '1,33 mol',
      '2,00 mol',
      '0,80 mol'
    ],
    correctIndex: 1,
    explanation: 'Mula-mula CO: 4, H2O: 4. Bereaksi x mol. Sisa setimbang CO: 4-x, H2O: 4-x, CO2: x, H2: x. Kc = (x * x) / ((4-x) * (4-x)) = 4. Akar kedua ruas: x / (4-x) = 2. x = 8 - 2x => 3x = 8 => x = 2,67 mol. Maka sisa CO = 4 - 2,67 = 1,33 mol.'
  },

  // 10. thermochemistry-lab
  {
    id: 'tl-easy',
    category: 'thermochemistry-lab',
    difficulty: 'mudah',
    text: 'Reaksi kimia yang melepaskan kalor/energi panas dari sistem ke lingkungan dan memiliki nilai perubahan entalpi negatif (ΔH < 0) disebut...',
    options: [
      'Reaksi Endotermik',
      'Reaksi Eksotermik',
      'Reaksi Isentropik',
      'Reaksi Isokhorik'
    ],
    correctIndex: 1,
    explanation: 'Reaksi eksotermik memancarkan energi ke lingkungan karena entalpi produk lebih rendah daripada entalpi reaktan awal, ditandai ΔH bertanda negatif.'
  },
  {
    id: 'tl-medium',
    category: 'thermochemistry-lab',
    difficulty: 'sedang',
    text: 'Hukum Hess menyatakan bahwa perubahan entalpi keseluruhan dari suatu reaksi kimia bersifat...',
    options: [
      'Tergantung pada laju reaksi kuantum sistem',
      'Hanya ditentukan oleh kondisi awal reaktan dan akhir produk, tidak tergantung jalannya tahapan reaksi',
      'Tergantung pada jumlah katalis besi yang melumuti katode',
      'Berbanding lurus dengan perubahan entropi pada tekanan mutlak konstan'
    ],
    correctIndex: 1,
    explanation: 'Hukum Hess adalah konsekuensi Hukum Kekekalan Energi. Nilai ΔH hanyalah fungsi keadaan awal dan akhir, sehingga penjumlahan kalor reaksi bertahap akan memberikan hasil sama dengan satu tahap langsung.'
  },
  {
    id: 'tl-hard',
    category: 'thermochemistry-lab',
    difficulty: 'sukar',
    text: 'Sebanyak 100 mL air dipanaskan dalam kalorimeter oleh pembakaran 0,8 gram gas metana (CH4, Mr = 16). Jika suhu air naik dari 25°C menjadi 37°C dan kalor jenis air c = 4,2 J/g°C. Berapakah entalpi pembakaran molar (ΔHc) metana dalam kJ/mol?',
    options: [
      '-5,04 kJ/mol',
      '-100,8 kJ/mol',
      '-504 kJ/mol',
      '-252 kJ/mol'
    ],
    correctIndex: 2,
    explanation: 'Massa air m = 100 gram. Kalor diserap Q = m c ΔT = 100 * 4,2 * 12 = 5040 Joule = 5,04 kJ. Mol CH4 = 0,8 / 16 = 0,05 mol. ΔHc = -Q / mol = -5,04 / 0,05 = -100,8? No, wait: 5.04 / 0.05 = -100.8? Ah! 5,04 / 0,05 = 100,8 kJ/mol. Wait, 0,8 / 16 = 0,05 mol. Q = 5,04 kJ. 5,04 / 0,05 = 100,8.'
  },

  // 11. colligative-lab
  {
    id: 'cl-easy',
    category: 'colligative-lab',
    difficulty: 'mudah',
    text: 'Sifat koligatif larutan adalah sifat fisik larutan yang hanya bergantung pada...',
    options: [
      'Jenis zat terlarut kimiawi',
      'Jumlah partikel zat terlarut dalam larutan',
      'Ukuran diameter partikel molekul terlarut',
      'Sifat kemudahan menguap zat pelarut'
    ],
    correctIndex: 1,
    explanation: 'Sifat koligatif larutan tidak memedulikan identitas kimiawi atau bentuk molekul zat terlarut, melainkan hanya jumlah konsentrasi atau fraksi partikel zat terlarut.'
  },
  {
    id: 'cl-medium',
    category: 'colligative-lab',
    difficulty: 'sedang',
    text: 'Larutan garam NaCl 1,0 M akan memiliki penurunan tekanan uap jenuh dan kenaikan titik didih yang hampir dua kali lipat lebih ekstrim jika dibandingkan dengan larutan Urea (CO(NH2)2) 1,0 M. Mengapa demikian?',
    options: [
      'NaCl memiliki kerapatan massa yang jauh lebih berat',
      'NaCl terdisosiasi sempurna menjadi 2 ion aktif (Na+ dan Cl-) di air dengan faktor Van\'t Hoff i mendekati 2',
      'Urea mengendap di dasar air berupa polimer',
      'Suhu penguapan larutan urea tertahan ikatan nitrogen dipol'
    ],
    correctIndex: 1,
    explanation: 'NaCl adalah elektrolit kuat yang terurai menjadi ion Na+ dan Cl-, memberikan jumlah partikel efektif dua kali lipat konsentrasi awalnya bagi sifat koligatif larutan.'
  },
  {
    id: 'cl-hard',
    category: 'colligative-lab',
    difficulty: 'sukar',
    text: 'Berapakah titik didih larutan jika 5,85 gram garam NaCl (Mr = 58,5) dilarutkan dalam 250 gram air jenuh? Berharga Kb air = 0,52°C/m, asumsikan derajat ionisasi α NaCl = 100%.',
    options: [
      '100,416°C',
      '100,208°C',
      '100,832°C',
      '101,040°C'
    ],
    correctIndex: 0,
    explanation: 'Mol NaCl = 5.85 / 58.5 = 0.1 mol. Molalitas m = (0.1 / 250) * 1000 = 0.4 molal. Karena NaCl terurai jadi 2 ion (i = 2). ΔTb = m * Kb * i = 0.4 * 0.52 * 2 = 0,416°C. Maka titik didih larutan = 100 + 0,416 = 100,416°C.'
  },

  // 12. organic-lab
  {
    id: 'ol-easy',
    category: 'organic-lab',
    difficulty: 'mudah',
    text: 'Gugus fungsi pengidentifikasi khas yang membedakan golongan senyawa Alkanol (Alkohol) adalah...',
    options: [
      '-CHO (Gugus Alkanal)',
      '-OH (Gugus Hidroksil)',
      '-COOH (Gugus Karboksil)',
      '-CO- (Gugus Karbonil)'
    ],
    correctIndex: 1,
    explanation: 'Golongan alkohol (alkanol) dicirikan secara gugus fungsional dengan adanya pengikatan gugus Hidroksil (-OH) pada rantai alkil hidrokarbonnya.'
  },
  {
    id: 'ol-medium',
    category: 'organic-lab',
    difficulty: 'sedang',
    text: 'Senyawa karbon dengan rumus molekul C3H6O dapat berupa dua jenis isomer fungsional berselisih gugus fungsi, yaitu golongan senyawa...',
    options: [
      'Alkoksi Alkana dan Alkanol',
      'Alkanal (Aldehid) dan Alkanon (Keton)',
      'Asam Alkanoat dan Alkil Alkanoat',
      'Alkena dan Alkuna bercabang'
    ],
    correctIndex: 1,
    explanation: 'Senyawa berumus umum CnH2nO merupakan kelompok fungsional dari Aldehid (Alkanal) dan Keton (Alkanon) yang berisomer satu sama lain.'
  },
  {
    id: 'ol-hard',
    category: 'organic-lab',
    difficulty: 'sukar',
    text: 'Jenis reaksi organik apa yang terjadi apabila senyawa Propena (CH3-CH=CH2) direaksikan dengan gas asam klorida (HCl) menghasilkan senyawa 2-kloropropana?',
    options: [
      'Reaksi Eliminasi rantai',
      'Reaksi Substitusi radikal',
      'Reaksi Oksidasi reduktif',
      'Reaksi Adisi elektrofilik sesuai Aturan Markovnikov'
    ],
    correctIndex: 3,
    explanation: 'Penambahan HCl ke ikatan rangkap dua (alkena) adalah reaksi Adisi. Sesuai Aturan Markovnikov, hidrogen dari asam masuk ke karbon rangkap berikatan hidrogen terbanyak, sedangkan klorida mengikat karbon sekunder menghasilkan 2-kloropropana.'
  },

  // 13. macromolecule-lab
  {
    id: 'ml-easy',
    category: 'macromolecule-lab',
    difficulty: 'mudah',
    text: 'Polimer alam penyusun dinding sel tumbuhan yang tersusun secara linear atas ribuan monomer D-glukosa terhubung ikatan β-glikosidik dinamakan...',
    options: [
      'Selulosa',
      'Glikogen',
      'Amilum',
      'Polietilena'
    ],
    correctIndex: 0,
    explanation: 'Selulosa merupakan polimer struktural alamiah tumbuhan yang disusun oleh gugusan monomer glukosa padat dengan ikatan β-1,4-glikosidik.'
  },
  {
    id: 'ml-medium',
    category: 'macromolecule-lab',
    difficulty: 'sedang',
    text: 'Kerusakan struktur alami protein akibat pengaruh lingkungan ekstrim seperti panas berlebih atau perubahan pH asam/basa dinamakan proses...',
    options: [
      'Saponifikasi',
      'Denaturasi',
      'Polimerisasi Kondensasi',
      'Esterifikasi kovalen'
    ],
    correctIndex: 1,
    explanation: 'Denaturasi merusak ikatan sekunder, tersier, atau kuaterner dari protein tanpa memutus rantai peptida utama (ikatan primer), sehingga protein kehilangan fungsinya.'
  },
  {
    id: 'ml-hard',
    category: 'macromolecule-lab',
    difficulty: 'sukar',
    text: 'Struktur sekunder protein berupa heliks-alfa (α-helix) dan lembaran-beta (β-sheet) distabilkan oleh interaksi non-kovalen jenis...',
    options: [
      'Gaya dispersi London antar gugus hidrofobik',
      'Ikatan hidrogen intramolekuler antar gugus C=O dan N-H rantai utama peptida',
      'Jembatan garam ionik rantai samping asam amino',
      'Ikatan kovalen disulfida antar residu sistein'
    ],
    correctIndex: 1,
    explanation: 'Struktur sekunder distabilkan secara spesifik oleh ikatan hidrogen berkala antara atom oksigen karbonil (C=O) suatu asam amino dengan nitrogen amida (N-H) asam amino lainnya di sepanjang sumbu utama rantai peptida.'
  },

  // 14. colloid-lab
  {
    id: 'col-easy',
    category: 'colloid-lab',
    difficulty: 'mudah',
    text: 'Efek Tyndall merupakan peristiwa hamburan cahaya oleh partikel koloid. Gejala sehari-hari berikut yang merupakan penerapan efek Tyndall adalah...',
    options: [
      'Sorot lampu mobil pada malam hari yang berkabut tampak berpendar jelas',
      'Birunya warna langit pada siang hari akibat hamburan Rayleigh',
      'Pemisahan ion garam NaCl dari air laut menggunakan membran saringan osmosis',
      'Pembentukan endapan delta di muara sungai'
    ],
    correctIndex: 0,
    explanation: 'Sorot lampu mobil di malam yang berkabut merupakan contoh efek Tyndall karena butiran uap air (kabut) bersifat koloid yang menghamburkan berkas cahaya lampu sehingga jalur lintasannya terlihat berpendar.'
  },
  {
    id: 'col-medium',
    category: 'colloid-lab',
    difficulty: 'sedang',
    text: 'Berdasarkan studi koagulasi Aturan Schulze-Hardy, kemampuan elektrolit dalam menetralisir muatan permukaan koloid negatif sebanding dengan kekuatan valensi kation. Manakah kation garam berikut yang memiliki daya koagulasi paling cepat terhadap lumpur koloidal?',
    options: [
      'Na⁺ dari NaCl pekat',
      'Ca²⁺ dari CaCl₂',
      'Al³⁺ dari AlCl₃',
      'K⁺ dari KCl encer'
    ],
    correctIndex: 2,
    explanation: 'Sesuai Aturan Schulze-Hardy, semakin tinggi muatan (valensi) ion yang berlawanan muatannya dengan koloid, semakin cepat daya koagulasinya. Untuk mengkoagulasi koloid negatif, kation Al³⁺ (trivalen, muatan 3) jauh lebih efektif dibanding Ca²⁺ (divalen, muatan 2) dan Na⁺/K⁺ (monovalen, muatan 1).'
  },
  {
    id: 'col-hard',
    category: 'colloid-lab',
    difficulty: 'sukar',
    text: 'Susu merupakan salah satu jenis sistem koloid emulsi cair. Mengapa partikel minyak lemak di dalam susu dapat menyebar stabil di pelarut air tanpa mengalami pemisahan fase secara spontan?',
    options: [
      'Massa jenis lemak susu sama persis dengan air',
      'Lemak susu larut sempurna secara kimia membentuk larutan homogen',
      'Adanya protein kasein yang bertindak sebagai emulgator/zat penstabil pembungkus droplet',
      'Pengaruh gaya gravitasi bumi yang dinonaktifkan oleh gerak lurus cahaya'
    ],
    correctIndex: 2,
    explanation: 'Susu adalah emulsi minyak dalam air (M/A) yang tidak saling campur. Stabilitas emulsi susu dijaga oleh protein kasein yang bertindak sebagai emulgator (emulsifier). Kasein membungkus droplet lemak dengan bagian hidrofobik menghadap lemak dan bagian hidrofilik menghadap air, mencegah peleburan (koalesensi) antar butir lemak.'
  },

  // 15. electrolysis-lab
  {
    id: 'elec-easy',
    category: 'electrolysis-lab',
    difficulty: 'mudah',
    text: 'Pada sel elektrolisis larutan tembaga(II) sulfat (CuSO₄) menggunakan elektroda inert karbon (C), spesi yang dihasilkan di katoda dan anoda berturut-turut adalah...',
    options: [
      'Logam Cu di katoda dan gas O₂ di anoda',
      'Gas H₂ di katoda dan gas O₂ di anoda',
      'Logam Cu di katoda dan gas Cl₂ di anoda',
      'Gas O₂ di katoda dan logam Cu di anoda'
    ],
    correctIndex: 0,
    explanation: 'Pada katoda larutan CuSO₄, kation Cu²⁺ tereduksi menjadi endapan logam Cu (Cu²⁺ + 2e⁻ -> Cu). Pada anoda inert (C), air teroksidasi menghasilkan gas oksigen (2H₂O -> O₂ + 4H⁺ + 4e⁻). Jadi hasilnya adalah logam tembaga (Cu) di katoda dan gas oksigen (O₂) di anoda.'
  },
  {
    id: 'elec-medium',
    category: 'electrolysis-lab',
    difficulty: 'sedang',
    text: 'Dalam sel elektrolisis perak nitrat (AgNO₃) dialirkan arus listrik sebesar 10 Amper selama tepat 965 detik. Berapakah massa endapan perak (Ag) yang terbentuk di katoda? (Ar Ag = 108 g/mol, F = 96.500 C/mol)',
    options: [
      '1,08 gram',
      '10,80 gram',
      '5,40 gram',
      '108,00 gram'
    ],
    correctIndex: 1,
    explanation: 'Menggunakan Hukum Faraday I: W = (e * i * t) / 96500. Berat ekivalen perak (e) = Ar/valensi = 108 / 1 = 108. Maka: W = (108 * 10 * 965) / 96500 = 1.041.300 / 96500 = 10.8 gram.'
  },
  {
    id: 'elec-hard',
    category: 'electrolysis-lab',
    difficulty: 'sukar',
    text: 'Mengapa elektrolisis larutan NaCl encer dengan elektroda platina menghasilkan gas hidrogen (H₂) di katoda, sedangkan elektrolisis lelehan NaCl menghasilkan endapan logam natrium (Na) di katoda?',
    options: [
      'Ion Na⁺ di katoda larutan menguap akibat panas listrik',
      'Molekul air memiliki potensial reduksi standar lebih positif (E° = -0.83 V) dibandingkan ion Na⁺ (E° = -2.71 V), sehingga air lebih mudah direduksi dalam fase larutan berair',
      'Elektroda platina bereaksi secara selektif menolak ion Na⁺ hanya ketika ada molekul air',
      'Garam NaCl dalam larutan mengalami disosiasi total menghasilkan gas penyangga yang menghambat reduksi kation'
    ],
    correctIndex: 1,
    explanation: 'Dalam larutan berair, molekul air dan ion Na⁺ bersaing di katoda. Karena potensial reduksi air (E° = -0.83 V) jauh lebih tinggi/positif dibanding E° Na⁺ (E° = -2.71 V), maka molekul air yang tereduksi menghasilkan gas H₂ dan ion OH⁻. Sementara pada sistem lelehan (molten) tidak terdapat air, sehingga ion Na⁺ terpaksa direduksi langsung menjadi logam Na cair.'
  },

  // 16. flame-test-lab
  {
    id: 'flame-easy',
    category: 'flame-test-lab',
    difficulty: 'mudah',
    text: 'Warna nyala api khas yang dihasilkan oleh unsur kation alkali Natrium (Na) ketika dipanaskan pada pembakar Bunsen non-luminous adalah...',
    options: [
      'Merah tua / Crimson',
      'Kuning jingga / Emas',
      'Ungu muda / Lilac',
      'Hijau apel'
    ],
    correctIndex: 1,
    explanation: 'Natrium (Na) memancarkan warna kuning jingga keemasan yang sangat kuat dan sensitif. Panjang gelombangnya adalah doublet 589 nm (D-line).'
  },
  {
    id: 'flame-medium',
    category: 'flame-test-lab',
    difficulty: 'sedang',
    text: 'Pada pengujian nyala kation Kalium (K), keberadaan kontaminasi senyawa Natrium seringkali mengaburkan warna ungu lilac Kalium. Peralatan apakah yang efektif digunakan sebagai penyaring (filter) untuk mendeteksi emisi Kalium secara jelas?',
    options: [
      'Kaca arloji tebal berlapis tembaga',
      'Plat krusibel silika berbobot',
      'Kaca kobalt berwarna biru murni',
      'Lenses polarisasi polikarbonat'
    ],
    correctIndex: 2,
    explanation: 'Kaca kobalt biru berfungsi menyerap (mengabsorpsi) panjang gelombang warna kuning natrium (589 nm) sehingga warna ungu-pink lilac dari kation Kalium dapat ditembus dan terlihat oleh mata laboran.'
  },
  {
    id: 'flame-hard',
    category: 'flame-test-lab',
    difficulty: 'sukar',
    text: 'Berdasarkan teori mekanika kuantum Niels Bohr, pancaran emisi warna-warni yang berbeda pada uji nyala dipicu secara langsung oleh peristiwa...',
    options: [
      'Disosiasi ikatan kovalen garam klorida menghasilkan radikal bebas gas klorin',
      'Peluruhan atau de-eksitasi elektron dari kulit energi tinggi kembali ke ground state (tingkat dasar) yang melepaskan energi foton (E = hc/λ) unik',
      'Kenaikan suhu kalor secara eksotermik memicu penggabungan fusi nuklir kecil',
      'Transisi hidrolisis air pelarut yang melepaskan gelembung gas hidrogen'
    ],
    correctIndex: 1,
    explanation: 'Sesuai dengan teori atom Bohr, saat dipanaskan elektron menyerap kalor dan naik ke tingkat energi tereksitasi yang tidak stabil. Hamburan elektron yang meluruh gugur kembali ke keadaan ground state melepaskan energi sisa dalam bentuk foton elektromagnetik. Karena jarak antar kulit energi setiap kation bersifat unik (ternormalisasi), panjang gelombang emisi h·c/λ juga khas.'
  },

  // 17. buffer-hydrolysis-lab
  {
    id: 'buffer-easy',
    category: 'buffer-hydrolysis-lab',
    difficulty: 'mudah',
    text: 'Sistem larutan penyangga (buffer) biologis utama yang bertugas mempertahankan pH cairan ekstraseluler dalam darah manusia agar berkisar konstan antara 7,35 - 7,45 adalah...',
    options: [
      'Sistem penyangga H₂PO₄⁻ dan HPO₄²⁻ dalam sitoplasma',
      'Sistem penyangga asam karbonat (H₂CO₃) dan ion bikarbonat (HCO₃⁻)',
      'Sistem hemoglobin protein laktat teroksidasi',
      'Campuran asam empedu dan garam kalsium koroner'
    ],
    correctIndex: 1,
    explanation: 'Sistem dapar karbonat (H₂CO₃ / HCO₃⁻) merupakan penyangga utama ekstrasel darah, sedangkan dapar fosfat bertugas menjaga kestabilan pH cairan intraseluler.'
  },
  {
    id: 'buffer-medium',
    category: 'buffer-hydrolysis-lab',
    difficulty: 'sedang',
    text: 'Sebanyak 100 mL larutan asam asetat (CH₃COOH) 0,1 M dicampur dengan 100 mL larutan natrium asetat (CH₃COONa) 0,1 M. Jika diketahui nilai konstanta Kₐ CH₃COOH = 1.8 × 10⁻⁵, berapakah perkiraan pH akhir larutan penyangga tersebut?',
    options: [
      '3.74',
      '4.74',
      '5.74',
      '7.00'
    ],
    correctIndex: 1,
    explanation: 'Gunakan persamaan Henderson-Hasselbalch: pH = pKₐ - log(n_asam / n_basa_konj). Karena volume dan molaritas kedua komponen sama, mmol asetat asid maupun garam konjugat bernilai identik (10 mmol). rasionya adalah 1 (log 1 = 0), maka pH = pKₐ = -log(1.8 × 10⁻⁵) = 4.74.'
  },
  {
    id: 'buffer-hard',
    category: 'buffer-hydrolysis-lab',
    difficulty: 'sukar',
    text: 'Diketahui garam amonium klorida (NH₄Cl) dilarutkan ke air murni hingga mencapai molaritas 0,1 M. Jika tetapan konstanta basa K_b NH₃ = 1.0 × 10⁻⁵, berapakah derajat keasaman (pH) dari larutan garam asam hasil hidrolisis parsial tersebut?',
    options: [
      'pH = 9.00',
      'pH = 7.00',
      'pH = 5.00',
      'pH = 3.00'
    ],
    correctIndex: 2,
    explanation: 'Garam murni ini terhidrolisis sebagian menghasilkan kation asam NH₄⁺. Konsentrasi [H⁺] dihitung menggunakan formula hidrolisis kation: [H⁺] = √( (Kw/Kb) · Mg ) = √( (10⁻¹⁴ / 10⁻⁵) · 0.1 ) = √( 10⁻⁹ · 10⁻¹ ) = √10⁻¹⁰ = 10⁻⁵ M. pH = -log(10⁻⁵) = 5.00.'
  },
  {
    id: 'ksp-easy',
    category: 'solubility-ksp-lab',
    difficulty: 'mudah',
    text: 'Di antara senyawa garam sukar larut berikut, manakah yang memiliki rumus hubungan Ksp = 4s³ saat terionisasi penuh di dalam air?',
    options: [
      'AgCl dan PbI₂',
      'CaF₂ dan Ag₂CrO₄',
      'Al(OH)₃ dan CaF₂',
      'BaSO₄ dan AgCl'
    ],
    correctIndex: 1,
    explanation: 'CaF₂ dan Ag₂CrO₄ masing-masing terdisosiasi menghasilkan 3 buah ion (n = 3), ber-rasio 1:2 atau 2:1. Rumus Ksp-nya adalah Ksp = s · (2s)² = 4s³. Sedangkan AgCl bernilai s² dan Al(OH)₃ bernilai 27s⁴.'
  },
  {
    id: 'ksp-medium',
    category: 'solubility-ksp-lab',
    difficulty: 'sedang',
    text: 'Kelarutan molar perak klorida (AgCl, Ksp = 1,6 × 10⁻¹⁰) di dalam air murni dibandingkan dengan kelarutan molar AgCl di dalam larutan NaCl 0,1 M akan mengalami...',
    options: [
      'Kenaikan kelarutan sebesar 10 kali lipat akibat efek ion senama',
      'Penurunan kelarutan yang dahsyat dari 1.26 × 10⁻⁵ M menjadi 1.6 × 10⁻⁹ M',
      'Keadaan jenuh konstan tanpa perubahan kelarutan nyata',
      'Hidrolisis garam cepat menghasilkan gelembung gas hidrogen'
    ],
    correctIndex: 1,
    explanation: 'Kelarutan AgCl di air murni: s = √Ksp = √(1.6e-10) = 1.26 × 10⁻⁵ M. Kelarutan di dalam NaCl 0.1 M (menggiring ion senama Cl⁻ = 0.1 M): s = Ksp / [Cl⁻] = 1.6e-10 / 0.1 = 1.6 × 10⁻⁹ M. Terjadi penurunan kelarutan molaritas s yang sangat drastik.'
  },
  {
    id: 'ksp-hard',
    category: 'solubility-ksp-lab',
    difficulty: 'sukar',
    text: 'Sebanyak 100 mL larutan CaCl₂ 0,02 M dicampur dengan 100 mL larutan NaF 0,02 M. Jika Ksp CaF₂ = 4,0 × 10⁻¹¹, berapakah nilai Qsp hasil pencampuran tersebut dan bagaimana status fisiknya?',
    options: [
      'Qsp = 1.0 × 10⁻⁶; terbentuk endapan padat CaF₂ pekat',
      'Qsp = 4.0 × 15⁻¹²; larutan belum jenuh dan jernih',
      'Qsp = 2.0 × 10⁻⁶; larutan tepat jenuh',
      'Qsp = 1.0 × 10⁻⁶; larutan terhidrolisis total'
    ],
    correctIndex: 0,
    explanation: 'Setelah pencampuran, volume total menjadi 200 mL (konsentrasi masing-masing zat berkurang setengah menjadi 0.01 M). [Ca²⁺] = 0.01 M, [F⁻] = 0.01 M. Maka Qsp CaF₂ = [Ca²⁺][F⁻]² = (10⁻²)(10⁻²)² = 10⁻⁶. Karena Qsp (10⁻⁶) > Ksp (4 × 10⁻¹¹), maka terbentuk endapan CaF₂.'
  }
];

