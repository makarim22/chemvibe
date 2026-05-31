export interface GlossaryItem {
  term: string;
  definition: string;
}

export const GLOSSARY_MAP: Record<string, GlossaryItem[]> = {
  'periodic-table': [
    {
      term: 'Tabel Periodik',
      definition: 'Susunan unsur-unsur kimia berdasarkan kenaikan nomor atom (jumlah proton) dan kemiripan sifat periodiknya.'
    },
    {
      term: 'Elektron Valensi',
      definition: 'Elektron yang terletak pada kulit terluar atom dan bertanggung jawab langsung atas pembentukan ikatan kimia dengan atom lain.'
    },
    {
      term: 'Jari-jari Atom',
      definition: 'Jarak antara inti atom sampai dengan kulit elektron terluar yang ditempati elektron dalam keadaan dasar.'
    },
    {
      term: 'Keelektronegatifan',
      definition: 'Ukuran kemampuan relatif suatu atom dalam menarik pasangan elektron ikatan menuju dirinya sendiri dalam senyawa.'
    },
    {
      term: 'Energi Ionisasi',
      definition: 'Energi minimum yang diperlukan oleh suatu atom netral dalam wujud gas untuk melepaskan satu elektron terluarnya.'
    }
  ],
  'atom-builder': [
    {
      term: 'Isotop',
      definition: 'Atom-atom dari unsur kimia yang sama (memiliki jumlah proton sama) tetapi mempunyai jumlah neutron yang berbeda dalam intinya.'
    },
    {
      term: 'Proton',
      definition: 'Partikel subatomik bermuatan positif (+1) yang terletak di pusat inti atom dan menentukan identitas nomor atom tersebut.'
    },
    {
      term: 'Neutron',
      definition: 'Partikel subatomik netral (tidak bermuatan) yang dijumpai di inti atom, berfungsi menstabilkan inti dari gaya tolakan elektrostatik proton.'
    },
    {
      term: 'Elektron',
      definition: 'Partikel dasar bermuatan negatif (-1) yang mengelilingi inti atom pada tingkat energi lintasan orbital tertentu.'
    },
    {
      term: 'Inti Atom (Nukleus)',
      definition: 'Area pusat atom yang sangat kecil, padat, dan bermuatan positif, menampung hampir seluruh massa atom (terdiri atas proton dan neutron).'
    }
  ],
  'bonding-lab': [
    {
      term: 'Ikatan Ion',
      definition: 'Gaya tarik menarik elektrostatik antara ion bermuatan positif (kation) dan negatif (anion) yang terbentuk akibat serah-terima elektron antar atom logam kelompok IA/IIA dengan non-logam.'
    },
    {
      term: 'Ikatan Kovalen',
      definition: 'Ikatan kimia yang terbentuk akibat penggunaan bersama pasangan elektron oleh dua atau lebih atom non-logam untuk mencapai konfigurasi stabil.'
    },
    {
      term: 'Aturan Oktet',
      definition: 'Kecenderungan atom-atom untuk berikatan atau berbagi elektron sedemikian rupa sehingga kulit terluarnya terisi 8 elektron (stabil seperti gas mulia).'
    },
    {
      term: 'Ikatan Logam',
      definition: 'Gaya tarik antara kation-kation logam dengan lautan elektron valensi yang bebas bergerak menyelimuti seluruh kisi kristal logam tersebut.'
    },
    {
      term: 'Kovalen Polar',
      definition: 'Ikatan kovalen di mana pasangan elektron ikatan tertarik lebih kuat ke salah satu atom yang memiliki keelektronegatifan lebih tinggi, menciptakan kutub muatan.'
    }
  ],
  'geometry': [
    {
      term: 'Teori VSEPR',
      definition: 'Valence Shell Electron Pair Repulsion; teori untuk meramalkan geometri spasial molekul berdasarkan gaya tolakan minimum antara pasangan elektron di kulit valensi atom pusat.'
    },
    {
      term: 'Pasangan Elektron Bebas (PEB)',
      definition: 'Pasangan elektron valensi atom pusat yang tidak digunakan dalam pembentukan ikatan kovalen, memberikan tolakan spasial yang kuat terhadap pasangan ikatan.'
    },
    {
      term: 'Pasangan Elektron Ikatan (PEI)',
      definition: 'Pasangan elektron valensi yang digunakan bersama oleh dua atom yang saling berikatan kovalen untuk menautkan inti atom.'
    },
    {
      term: 'Geometri Molekul',
      definition: 'Susunan tiga dimensi dari atom-atom dalam molekul (tidak menghitung ruang PEB secara langsung melainkan efek tolakannya terhadap posisi inti atom).'
    },
    {
      term: 'Hibridisasi',
      definition: 'Konsep penggabungan orbital-orbital atom yang berbeda tingkat energinya membentuk orbital hibrida baru yang setingkat energi untuk memfasilitasi ikatan.'
    }
  ],
  'stoichiometry': [
    {
      term: 'Stoikiometri',
      definition: 'Studi kuantitatif mengenai hubungan massa, mol, volume, dan jumlah partikel reaktan serta produk yang terlibat dalam suatu reaksi kimia berimbang.'
    },
    {
      term: 'Pereaksi Pembatas',
      definition: 'Reaktan yang habis dikonsumsi terlebih dahulu dalam suatu reaksi kimia, sehingga secara teoritis menghentikan reaksi dan membatasi jumlah produk maksimum.'
    },
    {
      term: 'Hukum Kekekalan Massa',
      definition: 'Hukum Lavoisier yang menyatakan bahwa dalam sistem tertutup, massa total zat-zat sebelum reaksi kimia selalu sama dengan massa total pasca reaksi.'
    },
    {
      term: 'Mol',
      definition: 'Satuan SI untuk jumlah zat, yang menyatakan jumlah zat yang mengandung entitas dasar (atom, molekul) sebanyak bilangan Avogadro (6,022 x 10²³).'
    },
    {
      term: 'Pereaksi Berlebih',
      definition: 'Zat pereaksi yang jumlah molekulnya melebihi rasio stoikiometri yang diperlukan untuk bereaksi, menyisakan sisa zat pasca-reaksi.'
    }
  ],
  'titration': [
    {
      term: 'Titrasi Asam-Basa',
      definition: 'Metode analisis kuantitatif untuk menghitung konsentrasi suatu larutan asam atau basa melalui reaksi netralisasi terjadwal dengan larutan standar.'
    },
    {
      term: 'Titran',
      definition: 'Larutan standar sekunder yang dimasukkan ke dalam buret, yang konsentrasinya telah diketahui secara presisi untuk menetes pada analit.'
    },
    {
      term: 'Titrat (Analit)',
      definition: 'Larutan sampel di dalam labu Erlenmeyer yang dicari konsentrasinya, direaksikan bertahap melalui kontrol laju kran buret.'
    },
    {
      term: 'Titik Ekuivalen',
      definition: 'Kondisi di mana asam dan basa tepat bereaksi habis satu sama lain sesuai perhitungan mol stoikiometris murni.'
    },
    {
      term: 'Titik Akhir Titrasi',
      definition: 'Keadaan saat indikator derajat pH mengalami perubahan warna visual yang konstan, menandakan buret harus segera ditutup rapat.'
    },
    {
      term: 'Indikator pH',
      definition: 'Zat asam/basa organik lemah dengan warna khas yang berubah secara visual pada trayek derajat keasaman tertentu (misal Penolftalein).'
    }
  ],
  'volta-lab': [
    {
      term: 'Sel Volta',
      definition: 'Perangkat elektrokimia spontan yang memanfaatkan energi bebas dari reaksi reduksi-oksidasi kimia untuk memicu sirkulasi listrik searah (DC).'
    },
    {
      term: 'Anoda (Sel Volta)',
      definition: 'Elektroda bermuatan negatif di mana reaksi oksidasi peluruhan logam terjadi, melepaskan elektron menuju sirkuit luar.'
    },
    {
      term: 'Katoda (Sel Volta)',
      definition: 'Elektroda bermuatan positif di mana kation reduksi mengendap, mengonsumsi elektron yang datang dari anoda.'
    },
    {
      term: 'Jembatan Garam',
      definition: 'U-tube berisi gel elektrolit inert (misal KCl) yang menyeimbangkan muatan anion dan kation pada kedua reservoir tabung bejana setengah sel.'
    },
    {
      term: 'Potensial Sel (E° sel)',
      definition: 'Beda potensial listrik antara katoda dan anoda dalam kondisi standar, dihitung dengan mengurangkan potensial reduksi katoda dengan anoda.'
    }
  ],
  'kinetics-lab': [
    {
      term: 'Laju Reaksi',
      definition: 'Laju berkurangnya konsentrasi reaktan atau laju terbentuknya konsentrasi produk reaksi per satu satuan waktu.'
    },
    {
      term: 'Energi Aktivasi (Ea)',
      definition: 'Energi kinetik batas minimum yang harus dimiliki oleh molekul-molekul reaktan agar tumbukannya menghasilkan pembongkaran ikatan molekul.'
    },
    {
      term: 'Katalisator',
      definition: 'Zat yang ditambahkan untuk mengintensifkan laju reaksi dengan menyediakan rute reaksi alternatif berenergi aktivasi lebih rendah.'
    },
    {
      term: 'Teori Tumbukan',
      definition: 'Asumsi kinetika gas bahwa reaksi terjadi bila partikel reaktan saling bertumbukan dengan orientasi geometri spasial tepat dan energi kinetik cukup.'
    },
    {
      term: 'Orde Reaksi',
      definition: 'Pangkat konsentrasi reaktan dalam persamaan laju reaksi yang menunjukkan sensitivitas pengaruh perubahan konsentrasi terhadap laju.'
    }
  ],
  'equilibrium-lab': [
    {
      term: 'Kesetimbangan Dinamis',
      definition: 'Kondisi di mana laju reaksi ke kanan (maju) dan ke kiri (balik) berlangsung sama cepat secara terus-menerus pada tingkat molekuler, membuat konsentrasi makro kosmetik terhenti.'
    },
    {
      term: 'Asas Le Chatelier',
      definition: 'Prinsip kimia bahwa jika suatu sistem kesetimbangan diberikan aksi gangguan eksternal, sistem akan melakukan pergeseran tanggapan guna menetralkan efek tersebut.'
    },
    {
      term: 'Tetapan Kesetimbangan (Kc)',
      definition: 'Nilai perbandingan konsentrasi produk reaksi dengan konsentrasi reaktan (yang masing-masing dipangkatkan koefisien reaksinya) pada saat setimbang.'
    },
    {
      term: 'Reaksi Reversibel',
      definition: 'Reaksi kimia bolak-balik di mana zat-zat hasil produk reaksi dapat bereaksi kembali menghasilkan molekul reaktan mula-mula.'
    }
  ],
  'thermochemistry-lab': [
    {
      term: 'Sistem dan Lingkungan',
      definition: 'Sistem adalah bagian spesifik yang dipelajari energinya (reaksi kimia), sedangkan Lingkungan adalah segala sesuatu di luar batas sistem tersebut.'
    },
    {
      term: 'Reaksi Eksoterm',
      definition: 'Reaksi kimia yang membebaskan energi kalor dari sistem menuju lingkungan, menyebabkan peningkatan entalpi lingkungan (suhu naik, ΔH negatif).'
    },
    {
      term: 'Reaksi Endoterm',
      definition: 'Reaksi kimia yang menyerap energi panas dari lingkungan masuk ke dalam sistem, menyebabkan lingkungan dingin (suhu turun, ΔH positif).'
    },
    {
      term: 'Entalpi (H)',
      definition: 'Fungsi keadaan termodinamika yang merepresentasikan jumlah total energi termal internal suatu sistem pada kondisi tekanan konstan.'
    },
    {
      term: 'Kalorimeter',
      definition: 'Alat eksperimen terisolasi termal yang dirancang khusus untuk mengukur perpindahan energi kalor reaksi kimia secara empiris.'
    }
  ],
  'colligative-lab': [
    {
      term: 'Sifat Koligatif Larutan',
      definition: 'Sifat fisik larutan yang nilainya murni ditentukan oleh rasio perbandingan jumlah partikel zat terlarut terhadap jumlah partikel pelarut, bukan jenis kimianya.'
    },
    {
      term: 'Penurunan Titik Beku (ΔTf)',
      definition: 'Selisih antara titik beku pelarut murni dengan titik beku larutan setelah dicemari partikel terlarut non-volatil yang menghambat kristalisasi.'
    },
    {
      term: 'Kenaikan Titik Didih (ΔTb)',
      definition: 'Selisih suhu antara titik didih larutan dengan titik didih pelarut murninya, terjadi karena partikel terlarut menurunkan tekanan uap pelarut.'
    },
    {
      term: 'Faktor Van \'t Hoff (i)',
      definition: 'Nilai rasio pengali sifat koligatif elektrolit dibanding non-elektrolit, memperhitungkan ionisasi senyawa terlarut menjadi sejumlah kation/anion.'
    },
    {
      term: 'Osmosis',
      definition: 'Perpindahan spontan pelarut murni melalui membran semipermeabel dari larutan dengan konsentrasi rendah ke larutan berkonsentrasi tinggi.'
    }
  ],
  'colloid-lab': [
    {
      term: 'Sistem Koloid',
      definition: 'Bentuk campuran heterogen dua atau lebih zat di mana ukuran partikel terdispersinya berada pada rentang menengah (1 nm hingga 100 nm).'
    },
    {
      term: 'Efek Tyndall',
      definition: 'Gejala terhamburnya berkas cahaya oleh partikel koloid yang relatif besar, menyebabkan sorot sinar terlihat mengkilap jalurnya.'
    },
    {
      term: 'Gerak Brown',
      definition: 'Gerakan acak zigzag tak terputus dari partikel koloid akibat tumbukan asimetris berulang dengan molekul medium pendispersinya.'
    },
    {
      term: 'Adsorpsi Koloid',
      definition: 'Proses penempelan ion-ion bermuatan atau molekul netral pada permukaan partikel koloid, memberi muatan listrik stabil pada koloid.'
    },
    {
      term: 'Koagulasi',
      definition: 'Penggumpalan partikel koloid akibat destabilisasi muatan listrik pelindungnya (oleh elektrolit atau pemanasan), menyebabkan koloid mengendap.'
    }
  ],
  'electrolysis-lab': [
    {
      term: 'Elektrolisis',
      definition: 'Proses penguraian kimia suatu zat menggunakan arus listrik luar untuk memicu jalannya reaksi redoks non-spontan pada elektroda duga.'
    },
    {
      term: 'Katoda (Sel Elektrolisis)',
      definition: 'Elektroda bermuatan negatif yang dihubungkan ke kutub negatif aki, menjadi pusat reduksi kation analit.'
    },
    {
      term: 'Anoda (Sel Elektrolisis)',
      definition: 'Elektroda bermuatan positif yang memicu oksidasi anion analit atau reaksi pengikisan peluruhan lempeng logam aktif.'
    },
    {
      term: 'Hukum I Faraday',
      definition: 'Hukum yang menyatakan bahwa massa zat yang dibebaskan pada elektroda selama elektrolisis sebanding dengan total muatan listrik yang mengalir.'
    },
    {
      term: 'Elektroda Inert',
      definition: 'Elektroda berbahan stabil (Pt, C, Au) yang tidak ikut terlibat dalam reaksi oksidasi-reduksi kimia elektrolisis.'
    }
  ],
  'flame-test-lab': [
    {
      term: 'Uji Nyala (Flame Test)',
      definition: 'Prosedur analisis kualitatif mikrokimia untuk membedakan logam Alkali/Alkali Tanah berdasarkan pendaran warna nyala uniknya di atas api bunsen.'
    },
    {
      term: 'Keadaan Dasar (Ground State)',
      definition: 'Kondisi orbital elektronik stabil di mana seluruh elektron atom menempati tingkat energi orbital terendah yang diizinkan.'
    },
    {
      term: 'Eksitasi Elektron',
      definition: 'Lompatan elektron dari kulit energi ground menuju orbital kulit luar berenergi lebih tinggi akibat penyerapan panas kalor nyala api.'
    },
    {
      term: 'Emisi Foton',
      definition: 'Pelepasan energi berbentuk partikel gelombang cahaya (foton) saat elektron kembali meluncur turun dari tingkat eksitasi ke keadaan dasarnya.'
    },
    {
      term: 'Warna Karakteristik',
      definition: 'Warna cahaya spesifik yang kita lihat (misalnya merah tua untuk Litium, hijau-biru untuk Tembaga), bergantung pada selisih energi transisi kulit atom.'
    }
  ],
  'buffer-hydrolysis-lab': [
    {
      term: 'Larutan Penyangga (Buffer)',
      definition: 'Sistem larutan (campuran asam lemah & basa konjugasi atau sebaliknya) yang mempunyai kemampuan menolak perubahan pH secara drastis saat ditambah sedikit asam/basa.'
    },
    {
      term: 'Hidrolisis Garam',
      definition: 'Reaksi penguraian garam oleh air, di mana ion-ion sisa asam lemah atau basa lemah bereaksi dengan molekul air membentuk ion H+ atau OH-.'
    },
    {
      term: 'Asam-Basa Konjugasi',
      definition: 'Pasangan dua spesi kimia yang rumusnya hanya berbeda satu ion proton hidrogen (H+), menyokong struktur buffer penyeimbang.'
    },
    {
      term: 'Kapasitas Buffer',
      definition: 'Batas maksimum asam atau basa kuat yang dapat ditampung oleh larutan penyangga sebelum sistem penyangga tersebut kehilangan efektivitasnya.'
    }
  ],
  'solubility-ksp-lab': [
    {
      term: 'Kelarutan (s)',
      definition: 'Konsentrasi molar maksimum zat terlarut yang dapat melarut sempurna dalam suatu pelarut pada suhu tertentu hingga mencapai titik jenuh.'
    },
    {
      term: 'Hasil Kali Kelarutan (Ksp)',
      definition: 'Tetapan kesetimbangan dari kelarutan elektrolit sukar larut, disajikan sebagai hasil kali konsentrasi kation dan anion pangkat koefisiennya.'
    },
    {
      term: 'Larutan Jenuh',
      definition: 'Kondisi larutan di mana zat terlarut telah setimbang sempurna dengan zat padat jenuhnya, tidak mampu melarutkan zat tambahan baru.'
    },
    {
      term: 'Efek Ion Senama',
      definition: 'Penurunan drastis kelarutan suatu garam sukar larut karena kehadiran ion serupa yang sudah larut dari garam lain, memicu pengendapan spontan.'
    }
  ],
  'organic-lab': [
    {
      term: 'Gugus Fungsi',
      definition: 'Gugus atom khas di dalam senyawa karbon organik yang paling reaktif dan memberikan pola sifat fisika serta kimia yang identik pada senyawa tersebut.'
    },
    {
      term: 'Isomer Struktur',
      definition: 'Dua atau lebih senyawa organik yang mempunyai rumus molekul sama, namun mempunyai urutan penataan ikatan atom yang berbeda.'
    },
    {
      term: 'Keton dan Aldehid',
      definition: 'Senyawa karbonils; aldehid memiliki gugus karbonil di ujung rantai (-CHO), sedangkan keton memilikinya di tengah rantai (-CO-).'
    },
    {
      term: 'Reaksi Esterifikasi',
      definition: 'Reaksi kondensasi sintesis antara asam karboksilat dan alkohol dengan bantuan katalis asam untuk menghasilkan senyawa ester yang beraroma buah.'
    }
  ],
  'macromolecule-lab': [
    {
      term: 'Makromolekul',
      definition: 'Molekul raksasa berdaya massa tinggi (polimer, protein, asam nukleat, polisakarida) yang terbentuk dari kaitan rantai-rantai monomer.'
    },
    {
      term: 'Denaturasi Protein',
      definition: 'Perubahan konformasi alami protein (pematahan ikatan hidrogen struktur sekunder/tersier) tanpa merusak rantai peptida utama, melumpuhkan fungsional sel.'
    },
    {
      term: 'Monomer',
      definition: 'Unit struktur penyusun terkecil yang berulang dan saling berikatan kuat untuk membentuk molekul rantai panjang polimer.'
    },
    {
      term: 'Polimerisasi Adisi',
      definition: 'Reaksi penggabungan monomer-monomer berikatan rangkap dua (tak jenuh) membentuk rantai panjang jenuh tanpa menghasilkan molekul sampingan.'
    }
  ]
};
