export interface ScienceLaw {
  id: string;
  name: string;
  formulator: string;
  category: 'Kimia' | 'Fisika' | 'Elektrokimia' | 'Termodinamika';
  formula: string;
  description: string;
  appLab: string;
  teacherNote: string;
  studentNote: string;
}

export const SCIENCE_LAWS: ScienceLaw[] = [
  {
    id: "h-lavoisier",
    name: "Hukum Kekekalan Massa (Lavoisier)",
    formulator: "Antoine Lavoisier (1789)",
    category: "Kimia",
    formula: "m_reaktan = m_produk",
    description: "Dalam suatu reaksi kimia di dalam sistem tertutup, massa total zat sebelum reaksi (reaktan) adalah sama dengan massa total zat setelah reaksi (produk). Materi tidak dapat diciptakan atau dimusnahkan, hanya dapat ditata ulang.",
    appLab: "Stoichiometry & Laboratorium Makromolekul",
    teacherNote: "💡 Tips Pengajaran: Tekankan kepada siswa bahwa hilangnya berat pada pembakaran lilin di wadah terbuka bukanlah pemusnahan massa, melainkan pembentukan gas CO2 dan uap air yang lepas ke udara. Gunakan simulasi Stoichiometry untuk membuktikan kekekalan massa atom.",
    studentNote: "📝 Pertanyaan Refleksi: Jika 12 gram Karbon terbakar habis dalam wadah tertutup berisi 32 gram Oksigen, berapa gram Carbon Dioxide (CO2) yang akan terbentuk? Mengapa?"
  },
  {
    id: "h-proust",
    name: "Hukum Perbandingan Tetap (Proust)",
    formulator: "Joseph Proust (1799)",
    category: "Kimia",
    formula: "Rasio Massa Unsur = Konstan",
    description: "Perbandingan massa unsur-unsur penyusun suatu senyawa murni selalu tetap dan konstan, tidak bergantung pada asal-usul senyawa tersebut maupun metode pembuatannya.",
    appLab: "Stoichiometry & Orbitals Bonding Lab",
    teacherNote: "💡 Tips Pengajaran: Bantu siswa membedakan antara campuran (rasio variabel) dengan senyawa (rasio tetap). Misalnya, air (H2O) selalu memiliki rasio massa Hidrogen dibanding Oksigen sebesar 1:8, baik air keran, air laut, maupun uap.",
    studentNote: "📝 Pertanyaan Refleksi: Jika rasio massa H : O dalam senyawa air adalah 1:8, berapakah massa Oksigen yang tepat bereaksi dengan 5 gram gas Hidrogen untuk membentuk air?"
  },
  {
    id: "h-coulomb",
    name: "Hukum Coulomb (Elektrostatika)",
    formulator: "Charles-Augustin de Coulomb (1785)",
    category: "Fisika",
    formula: "F = k * (q1 * q2) / r²",
    description: "Gaya elektrostatik tarik-menarik atau tolak-menolak antara dua muatan listrik berbanding lurus dengan hasil kali kedua muatan dan berbanding terbalik dengan kuadrat jarak pisah antara pusat muatan tersebut.",
    appLab: "Build an Atom & Orbitals Bonding",
    teacherNote: "💡 Tips Pengajaran: Hubungkan hukum ini pada konsep kestabilan atom di 'Build an Atom'. Proton yang bermuatan positif di dalam inti akan menolak sesamanya (gaya tolak Coulomb), namun diikat oleh gaya nuklir kuat. Elektron terluar diikat oleh gaya tarik Coulomb dari inti.",
    studentNote: "📝 Pertanyaan Refleksi: Apa yang terjadi pada gaya tarik elektrostatik elektron terluar jika jumlah proton dalam inti bertambah (periode yang sama)? Hubungkan dengan jari-jari atom!"
  },
  {
    id: "h-faraday",
    name: "Hukum Faraday I (Elektrolisis)",
    formulator: "Michael Faraday (1834)",
    category: "Elektrokimia",
    formula: "w = e * I * t / 96.500",
    description: "Massa zat yang diendapkan atau dibebaskan pada elektrode selama proses elektrolisis berbanding lurus dengan jumlah muatan listrik (Q = I * t) yang dilewatkan melalui sel elektrolit tersebut.",
    appLab: "Elektrokimia & Volta Lab (Kelas XII)",
    teacherNote: "💡 Tips Pengajaran: Jelaskan konsep 'Satu Faraday' sebagai muatan dari 1 mol elektron (96.500 Coulomb). Sangat cocok untuk mengintegrasikan fisika arus listrik ke dalam stoikiometri reduksi-oksidasi pada katode.",
    studentNote: "📝 Pertanyaan Refleksi: Mengapa mengendapkan 1 mol logam Tembaga (Cu²⁺) dari larutan memerlukan arus listrik dua kali lebih lama daripada mengendapkan 1 mol Perak (Ag⁺) pada kuat arus yang sama?"
  },
  {
    id: "h-hess",
    name: "Hukum Hess",
    formulator: "Germain Henri Hess (1840)",
    category: "Termodinamika",
    formula: "ΔH_total = ΔH1 + ΔH2 + ...",
    description: "Perubahan entalpi total dari suatu reaksi kimia selalu konstan dan bernilai sama, baik reaksi tersebut berlangsung dalam satu tahapan tunggal maupun melalui beberapa tahapan antara. Entalpi adalah fungsi keadaan.",
    appLab: "Termokimia & Energi Lab (Kelas XI)",
    teacherNote: "💡 Tips Pengajaran: Gunakan analogi ketinggian gedung. Jika Anda naik lift langsung atau singgah di lantai perantara, beda ketinggian dari dasar ke puncak tetap sama. Ini memudahkan siswa menyusun siklus Hess.",
    studentNote: "📝 Pertanyaan Refleksi: Jika pembentukan CO2 dilakukan langsung atau lewat intermediate CO dulu, mengapa ΔH totalnya sama? Manakah yang merupakan fungsi keadaan?"
  },
  {
    id: "h-gasideal",
    name: "Hukum Gas Ideal",
    formulator: "Émile Clapeyron (1834)",
    category: "Fisika",
    formula: "P * V = n * R * T",
    description: "Persamaan keadaan gas teoretis yang menyatakan hubungan antar empat variabel dasar gas: perkalian tekanan (P) dan volume (V) berbanding lurus dengan perkalian jumlah zat/mol (n) dan suhu mutlak Kelvin (T).",
    appLab: "Sifat Koligatif Larutan & Lab Settings",
    teacherNote: "💡 Tips Pengajaran: Demonstrasikan bagaimana hukum gas ideal menggabungkan Hukum Boyle, Charles, dan Avogadro. Bantu siswa memahami mengapa peningkatan suhu (T) pada volume tetap akan memicu lonjakan tekanan (P) ruangan.",
    studentNote: "📝 Pertanyaan Refleksi: Mengapa ban mobil yang terparkir terlalu lama di aspal gurun pasir yang panas rentan meletus menurut hukum gas Charles-Gay Lussac?"
  }
];
