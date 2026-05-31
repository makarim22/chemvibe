/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  RefreshCw, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  Edit3,
  ClipboardList,
  Flame,
  Droplet,
  Zap,
  Activity,
  Orbit,
  Award,
  Save,
  Check
} from 'lucide-react';
import { ActivityLog, UserAccount } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface VirtualReportLabProps {
  theme?: 'dark' | 'light';
  currentUser: UserAccount | null;
  activities: ActivityLog[];
  onNavigate?: (view: string) => void;
}

interface ObservationRow {
  variable: string;
  value: string;
  unit: string;
  notes: string;
}

// Curriculum-aligned Indonesian virtual lab templates
const LAB_TOPICS = [
  {
    id: 'bohr-atom',
    title: 'Penyusunan Struktur Atom Bohr & Isotop',
    objectives: '1. Memahami susunan partikel subatom (proton, neutron, elektron) dari unsur-unsur periode 1-3.\n2. Menentukan konfigurasi elektron Bohr serta kestabilan isotop di alam.\n3. Membuktikan relasi nomor atom dan nomor massa terhadap muatan kelistrikan atom.',
    theory: 'Atom terdiri atas inti atom yang bermuatan positif (terdiri dari proton netral dan neutron netral) dikelilingi oleh elektron pada lintasan kulit tertentu (Bohr). Muatan atom netral ditentukan oleh kesamaan jumlah proton dan elektron. Ketidakseimbangan proton dan elektron membentuk kation (+) atau anion (-). Variasi jumlah neutron pada proton yang sama menghasilkan isotop yang berbeda stabil atau radioaktif sesuai batas pita kestabilan nuklir.',
    apparatus: 'Visualisasi Model Bohr Atom ChemVibe, Tabel Interaktif Periodik, Generator Isotop Multi-Partikel.',
    defaultObservations: [
      { variable: 'Misi Hidrogen-1 (Protium)', value: 'Proton: 1, Neutron: 0, Elektron: 1', unit: 'Netral', notes: 'Isotop stabil hidrogen paling melimpah.' },
      { variable: 'Sintesis Inti Helium-4 (Partikel Alpha)', value: 'Proton: 2, Neutron: 2, Elektron: 2', unit: 'Netral/Sangat Stabil', notes: 'Konfigurasi duplet stabil penuh.' },
      { variable: 'Kation Alkali Litium-7', value: 'Proton: 3, Neutron: 4, Elektron: 2', unit: 'Kation (+1)', notes: 'Sangat reaktif, kehilangan 1 elektron valensi.' },
      { variable: 'Anion Oksigen-16 (Oktet)', value: 'Proton: 8, Neutron: 8, Elektron: 10', unit: 'Anion (-2)', notes: 'Kulit terluar terisi penuh 8 elektron.' }
    ]
  },
  {
    id: 'vsepr-geometry',
    title: 'Geometri Molekul 3D & Teori VSEPR',
    objectives: '1. Mengetahui bentuk geometri molekul berdasarkan Domain Elektron (VSEPR).\n2. Menganalisis pengaruh Pasangan Elektron Bebas (PEB) terhadap penyusutan sudut ikatan inter-atom.\n3. Memahami konsep hibridisasi orbital hibrida senyawa kovalen.',
    theory: 'Teori VSEPR (Valence Shell Electron Pair Repulsion) menyatakan bahwa pasangan elektron disekitar atom pusat akan saling menolak sehingga mengambil susunan ruang sedemikian rupa untuk memperkecil gaya tolakan tersebut. Pasangan Elektron Bebas (PEB) memberikan gaya tolakan lebih kuat dibanding Pasangan Elektron Ikatan (PEI), mengakibatkan sudut ikatan menyusut dari geometri idealnya.',
    apparatus: 'VSEPR Interactive 3D Canvas Engine, Monitor Sudut Sterik, Orbital Stress Visualizer.',
    defaultObservations: [
      { variable: 'Metana (CH4)', value: 'PEI: 4, PEB: 0, Hibridisasi: sp3', unit: '109.5°', notes: 'Bentuk Tetrahedral sempurna.' },
      { variable: 'Air (H2O)', value: 'PEI: 2, PEB: 2, Hibridisasi: sp3', unit: '104.5°', notes: 'Bentuk Bengkok (Bent/V-shape), sudut menyusut karena 2 PEB.' },
      { variable: 'Amonia (NH3)', value: 'PEI: 3, PEB: 1, Hibridisasi: sp3', unit: '107.8°', notes: 'Bentuk Trigonal Piramida, efek 1 PEB.' },
      { variable: 'Karbon Dioksida (CO2)', value: 'PEI: 2, PEB: 0 (Ikatan Ganda)', unit: '180.0°', notes: 'Bentuk Linier sempurna.' }
    ]
  },
  {
    id: 'stoichiometry',
    title: 'Kalkulasi Stoikiometri & Pereaksi Pembatas',
    objectives: '1. Menghitung mol, massa, dan rasio molar reaksi kimia.\n2. Mengidentifikasi reaksi pembatas yang menentukan kuantitas rendemen produk maksimum.\n3. Memverifikasi Hukum Kekekalan Massa (Hukum Lavoisier) dalam wadah tertutup.',
    theory: 'Rasio koefisien dalam persamaan reaksi setara mencerminkan rasio mol komponen yang bereaksi. Komponen reaktan yang habis bereaksi terlebih dahulu disebut pereaksi pembatas (limiting reactant). Perhitungan rendemen (yield) teoretis selalu didasarkan pada perbandingan koefisien pereaksi pembatas ini.',
    apparatus: 'Stoichiometry Balance Calculator, Reaktan Mass Slider, Rendemen Output Monitor.',
    defaultObservations: [
      { variable: 'Sintesis Amonia (Haber-Bosch)', value: 'N₂ + 3H₂ → 2NH₃', unit: 'Koefisien Seimbang', notes: 'Rasio stoikiometri nitrogen ke hidrogen 1:3.' },
      { variable: 'Reaktan Masuk', value: 'N₂: 28.0 g (1 mol), H₂: 12.0 g (6 mol)', unit: 'Massa Reaktan', notes: 'H₂ berlebih secara substansial.' },
      { variable: 'Pereaksi Pembatas Terdeteksi', value: 'Gas Nitrogen (N₂)', unit: 'Limiting Component', notes: 'Habis bereaksi seluruhnya.' },
      { variable: 'Hasil Rendemen Teoretis NH₃', value: '34.0 gram (2 mol) terbentuk', unit: 'Yield Teoretis', notes: 'Hukum Kekekalan Massa terbukti mutlak.' }
    ]
  },
  {
    id: 'acid-base-titration',
    title: 'Asidi-Alkalimetri & Kurva Titrasi pH',
    objectives: '1. Menggambar kurva perubahan pH selama penambahan titran secara kontinu.\n2. Menentukan titik ekuivalen asam kuat vs basa kuat berdasarkan pH ekuivalensi.\n3. Memilih indikator warna visual yang presisi di rentang transisi pKa.',
    theory: 'Titrasi asam-basa (asidi-alkalimetri) didasarkan pada reaksi netralisasi ion H⁺ dari asam dengan ion OH⁻ dari basa membentuk air. Titik ekuivalen tercapai saat jumlah mol ekuivalen asam sama dengan basa. Titik akhir titrasi ditandai oleh perubahan warna indikator pH yang trayek pH warnanya mencakup atau berada sangat dekat dengan pH titik ekuivalen.',
    apparatus: 'Titrator Mikro Digital, pH Sensor Probe, Grafik Logaritma Log Probe, Indikator Fenolftalein.',
    defaultObservations: [
      { variable: 'Sistem Reaksi', value: 'HCl (Asam Kuat) dengan NaOH (Basa Kuat)', unit: 'Vol: 25.0 mL', notes: 'HCl 0.1 M dititrasi NaOH 0.1 M.' },
      { variable: 'pH Mulai Asam', value: '1.00', unit: 'pH', notes: 'HCl terionisasi sempurna.' },
      { variable: 'Titik Ekuivalen Tercapai', value: 'Penambahan NaOH: 25.0 mL', unit: 'pH = 7.00', notes: 'Tepat netral dengan garam NaCl larut.' },
      { variable: 'Perubahan Warna Indikator', value: 'Indikator Fenolftalein (PP)', unit: 'Bening ke Merah Muda', notes: 'Titik akhir terdeteksi pada pH 8.2.' }
    ]
  },
  {
    id: 'redox-voltaic',
    title: 'Reaksi Redoks & Sel Volta (Elektrokimia)',
    objectives: '1. Menyetarakan reaksi redoks kompleks dengan metode setengah reaksi.\n2. Merakit sel Daniell (Volta) untuk menghasilkan beda potensial listrik terukur.\n3. Menganalisis pengaruh konsentrasi ion dilarutkan terhadap nilai potensial sel aktif (Persamaan Nernst).',
    theory: 'Sel Volta mengubah energi kimia dari reaksi redoks spontan menjadi energi listrik. Oksidasi terjadi di Anoda bermuatan negatif (melepas elektron), sedangkan reduksi terjadi di Katoda bermuatan positif (menerima elektron). Jembatan garam menjaga kenetralan listrik kedua kompartemen dengan mentransfer anion dan kation pelindung.',
    apparatus: 'Interaktif Sel Daniell Zn-Cu, Jembatan Garam Digital, Voltmeter Volt Monitor, Solusi Konsentrasi Node.',
    defaultObservations: [
      { variable: 'Setengah Sel Oksidasi (Anoda)', value: 'Zn(s) → Zn²⁺(aq) + 2e⁻', unit: 'Zn || Zn²⁺ (1M)', notes: 'Anoda melarut dan mengalami korosi.' },
      { variable: 'Setengah Sel Reduksi (Katoda)', value: 'Cu²⁺(aq) + 2e⁻ → Cu(s)', unit: 'Cu²⁺ (1M) || Cu', notes: 'Katoda menebal karena pengendapan logam Cu.' },
      { variable: 'Potensial Sel Standar (E°sel)', value: '+1.10 Volt', unit: 'Volt DC', notes: 'Dihitung dari E°Katoda (+0.34V) - E°Anoda (-0.76V).' },
      { variable: 'Pengaruh Persamaan Nernst', value: 'Cu²⁺ rendah (0.1M) → Esel menyusut', unit: '+1.07 Volt', notes: 'Penurunan potensial sel seiring depletion ion katolit.' }
    ]
  },
  {
    id: 'kinetics-rates',
    title: 'Faktor Laju Reaksi & Teori Tumbukan',
    objectives: '1. Menyelidiki efek suhu dan konsentrasi reaktan terhadap laju pembentukan produk.\n2. Menjelaskan mekanisme kerja katalis menurunkan energi aktivasi (Ea).\n3. Memprediksi frekuensi tumbukan efektif partikel di ruang reaksi terisolasi.',
    theory: 'Laju reaksi menyatakan laju berkurangnya konsentrasi pereaksi atau laju bertambahnya produk per satuan waktu. Berdasarkan teori tumbukan, reaksi terjadi saat partikel reaktan saling bertumbukan dengan arah orientasi yang efisien dan tingkat energi kinetik melampaui batas minimum energi aktivasi (Ea). Kenaikan suhu meningkatkan energi kinetik rata-rata partikel.' ,
    apparatus: 'Collision Particle Chamber Simulator, Heat Regulator Slider, Catalyst Node Lever, Stopwatch Digital.',
    defaultObservations: [
      { variable: 'Reaksi Standar', value: '2A + B → Produk', unit: 'Suhu Standar: 298 K', notes: 'Waktu selesai dasar: 45 detik.' },
      { variable: 'Suhu Ditingkatkan (+30 K)', value: 'Energi kinetik partikel naik pesat', unit: 'Waktu: 15 detik (3x Cepat)', notes: 'Tumbukan efektif melimpah.' },
      { variable: 'Konsentrasi Reaktan Dilipatgandakan', value: 'Kerapatan partikel meningkat di ruang', unit: 'Waktu: 22 detik', notes: 'Frekuensi tumbukan meningkat.' },
      { variable: 'Penambahan Katalis Homogen', value: 'Energi Aktivasi Ea terpangkas', unit: 'Waktu: 8 detik', notes: 'Menyediakan rute reaksi energi rendah alternatif.' }
    ]
  }
];

export default function VirtualReportLab({ currentUser, activities, onNavigate, theme = 'dark' }: VirtualReportLabProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('bohr-atom');
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('XI-MIPA 1');
  const [institution, setInstitution] = useState<string>('');
  const [reportDate, setReportDate] = useState<string>('');
  const [objectives, setObjectives] = useState<string>('');
  const [theory, setTheory] = useState<string>('');
  const [apparatus, setApparatus] = useState<string>('');
  const [observations, setObservations] = useState<ObservationRow[]>([]);
  const [conclusion, setConclusion] = useState<string>('');
  
  // Real-time Teacher Reviewed Lab Reports Integration
  const [dbReport, setDbReport] = useState<any>(null);
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);

  // Status flags
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Load profile defaults
  useEffect(() => {
    if (currentUser) {
      setStudentName(currentUser.name);
      setInstitution(currentUser.email ? (currentUser.email.includes('@') ? 'Sekolah Menengah Kimia Digital' : 'ChemVibe University') : 'Laboratorium ChemVibe');
      if (currentUser.classCode) {
        setStudentClass(currentUser.classCode);
      }
    } else {
      setStudentName('Peneliti Tamu (Guest Explorer)');
      setInstitution('Laboratorium Virtual ChemVibe');
    }
    const today = new Date().toISOString().split('T')[0];
    setReportDate(today);
  }, [currentUser]);

  // Read submitted reports and real-time grades from Firestore
  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      setDbReport(null);
      return;
    }
    setFetchLoading(true);
    const reportId = `report_${currentUser.id}_${selectedTopicId}`;
    const reportRef = doc(db, 'student_reports', reportId);
    
    const unsubscribe = onSnapshot(reportRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDbReport(data);
      } else {
        setDbReport(null);
      }
      setFetchLoading(false);
    }, (err) => {
      console.error("Gagal mendengarkan sinkronisasi laporan:", err);
      setFetchLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, selectedTopicId]);

  const handleSubmitToTeacher = async () => {
    if (!currentUser) {
      alert("Silakan masuk (login) terlebih dahulu untuk mengajukan laporan resmi kepada guru.");
      return;
    }
    setSubmittingReport(true);
    const reportId = `report_${currentUser.id}_${selectedTopicId}`;
    const topic = LAB_TOPICS.find(t => t.id === selectedTopicId);
    
    try {
      const payload = {
        id: reportId,
        studentId: currentUser.id,
        studentName: studentName || currentUser.name,
        studentClass: studentClass || currentUser.className || 'XI-MIPA 1',
        topicId: selectedTopicId,
        topicTitle: topic?.title || 'Praktikum Kimia',
        objectives,
        theory,
        apparatus,
        observations,
        conclusion,
        submittedAt: new Date().toISOString(),
        status: dbReport?.status === 'graded' ? 'graded' : 'pending',
        grade: dbReport?.grade !== undefined ? dbReport.grade : null,
        teacherFeedback: dbReport?.teacherFeedback || null,
        gradedAt: dbReport?.gradedAt || null,
        teacherName: dbReport?.teacherName || null,
        classCode: currentUser.classCode || ''
      };

      await setDoc(doc(db, 'student_reports', reportId), payload);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);

      // Create a public activity log
      const actId = 'act_report_' + Date.now();
      await setDoc(doc(db, 'public_activities', actId), {
        id: actId,
        userId: currentUser.id,
        userName: studentName || currentUser.name,
        activityType: 'quiz_completed',
        title: 'Mengajukan Laporan Praktikum',
        description: `Mengajukan draf laporan formal "${topic?.title}" untuk direview oleh pengajar.`,
        timestamp: new Date().toISOString()
      });

      alert("Laporan berhasil diajukan kepada guru! Guru Anda dapat mengevaluasi laporan Anda langsung lewat Portal Guru.");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `student_reports/${reportId}`);
      alert("Gagal mengirimkan laporan resmi ke cloud database.");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Handle template change
  useEffect(() => {
    const topic = LAB_TOPICS.find(t => t.id === selectedTopicId);
    if (topic) {
      setObjectives(topic.objectives);
      setTheory(topic.theory);
      setApparatus(topic.apparatus);
      setObservations([...topic.defaultObservations]);
      
      // Compute adaptive conclusion
      const defaultConclusion = `Berdasarkan pengamatan virtual dari modul "${topic.title}", dapat disimpulkan bahwa hukum-hukum kimia terbukti konsisten melalui model komputasi 3D ChemVibe. Parameter yang diuji menunjukkan hubungan rasional sesuai teori akademik primer, memfasilitasi visualisasi fenomena kuantum berskala mikro secara akurat.`;
      setConclusion(defaultConclusion);
    }
  }, [selectedTopicId]);

  // Load saved draft if exits
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`chemvibe_draft_report_${selectedTopicId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStudentName(parsed.studentName || '');
        setStudentClass(parsed.studentClass || '');
        setInstitution(parsed.institution || '');
        setReportDate(parsed.reportDate || '');
        setObjectives(parsed.objectives || '');
        setTheory(parsed.theory || '');
        setApparatus(parsed.apparatus || '');
        setObservations(parsed.observations || []);
        setConclusion(parsed.conclusion || '');
      }
    } catch (_) {}
  }, [selectedTopicId]);

  // Save current Draft locally
  const handleSaveDraft = () => {
    try {
      const draftData = {
        studentName,
        studentClass,
        institution,
        reportDate,
        objectives,
        theory,
        apparatus,
        observations,
        conclusion
      };
      localStorage.setItem(`chemvibe_draft_report_${selectedTopicId}`, JSON.stringify(draftData));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);

      // Log activity
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'flashcard_reviewed',
          title: 'Draft Laporan Disimpan',
          description: `Berhasil merasionalisasi draft laporan untuk topik ${LAB_TOPICS.find(t=>t.id===selectedTopicId)?.title}`
        }
      }));
    } catch (_) {}
  };

  // Add observation row
  const handleAddRow = () => {
    setObservations([
      ...observations,
      { variable: 'Parameter Baru', value: 'Data Terukur', unit: 'Satuan', notes: 'Catatan tambahan.' }
    ]);
  };

  // Delete observation row
  const handleDeleteRow = (index: number) => {
    setObservations(observations.filter((_, idx) => idx !== index));
  };

  // Edit observation value
  const handleEditRowCell = (index: number, key: keyof ObservationRow, val: string) => {
    const updated = observations.map((row, idx) => {
      if (idx === index) {
        return { ...row, [key]: val };
      }
      return row;
    });
    setObservations(updated);
  };

  // Fetch log observations
  const handleImportLogSummary = () => {
    if (activities.length === 0) {
      alert("Belum ada log aktivitas terdeteksi di sesi ini. Silakan selesaikan beberapa visualisasi, eksperimen titrasi, atau kuis atom terlebih dahulu!");
      return;
    }

    // Capture user activities and format beautifully
    const logRows: ObservationRow[] = activities.slice(0, 5).map(act => ({
      variable: act.title,
      value: act.description,
      unit: act.score ? `${act.score.earned}/${act.score.total} pts` : 'Completed',
      notes: `Terekam otomatis pada ${new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }));

    setObservations([...logRows]);
    
    // Log dispatch
    window.dispatchEvent(new CustomEvent('chemvibe_activity', {
      detail: {
        activityType: 'quiz_completed',
        title: 'Auto-Import Data Log',
        description: 'Menyinkronkan data petunjuk penemuan dari sensor aktif ke tabel observasi laporan.'
      }
    }));
  };

  // Copy Markdown to Clipboard
  const handleCopyMarkdown = () => {
    const topic = LAB_TOPICS.find(t => t.id === selectedTopicId);
    if (!topic) return;

    let md = `# LAPORAN RESMI PRAKTIKUM virtual - CHEMVIBE
**Lembaga/Sekolah:** ${institution}
**Topik Percobaan:** ${topic.title}
**Nama Peneliti:** ${studentName} (${studentClass})
**Tanggal Percobaan:** ${reportDate}

---

## 1. TUJUAN PERCOBAAN
${objectives}

## 2. LANDASAN TEORI
${theory}

## 3. ALAT DAN BAHAN DIGITAL
${apparatus}

## 4. DATA PENGAMATAN & ANALISIS
| Parameter / Variabel Uji | Hasil Pengamatan / nilai | Format / Satuan | Keterangan |
| --- | --- | --- | --- |
`;

    observations.forEach(obs => {
      md += `| ${obs.variable} | ${obs.value} | ${obs.unit} | ${obs.notes} |\n`;
    });

    md += `
## 5. KESIMPULAN
${conclusion}

---
*Laporan ini digenerate secara otomatis melalui Virtual Lab Report Engine ChemVibe UI v4.2.*
`;

    navigator.clipboard.writeText(md).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Trigger browser print
  const handlePrintReport = () => {
    window.print();
  };

  const selectedTopic = LAB_TOPICS.find(t => t.id === selectedTopicId) || LAB_TOPICS[0];

  return (
    <div className="space-y-6 animate-fade-in unique-report-workspace print:bg-white print:text-black print:p-0">
      
      {/* Visual Header Banner (Hidden on print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4 print:hidden">
        <div>
          <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest block w-fit mb-2">
            Module Alpha 12 - Quantum Desk
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">Ekspor Laporan Praktikum Virtual</h2>
          <p className="text-slate-400 text-sm mt-1">
            Kembalikan lembar kerja resmi praktikum Anda dengan parameter digital, ulasan, & data observasi instan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isPreviewMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{isPreviewMode ? 'Tulis Laporan' : 'Pratinjau Kertas'}</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2 text-xs font-black bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-slate-950 rounded-xl transition-all shadow-lg hover:shadow-teal-500/15 flex items-center gap-1.5 cursor-pointer hover:scale-102 duration-150"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Ekspor / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Settings vs Preview container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPILER PANEL: Hidden in Preview mode unless responsive (Hidden on print) */}
        <div className={`lg:col-span-4 space-y-4 print:hidden ${isPreviewMode ? 'hidden lg:block' : ''}`}>
          
          {/* Target Select Area */}
          <div className={`border p-4.5 rounded-xl space-y-3.5 ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/60 border-slate-300'}`}>
            <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-widest block">
              1. Pilih Topik Eksperimen
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className={`w-full border font-sans text-xs rounded-lg px-2.5 py-2.5 focus:outline-none focus:border-teal-500 cursor-pointer appearance-none shadow-md ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
            >
              {LAB_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id} className={` ${theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {topic.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleImportLogSummary}
              className={`w-full py-2 hover:bg-slate-850 border text-[10px] font-mono font-bold text-teal-400 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 hover:text-white border-slate-800' : 'bg-slate-100 hover:text-slate-900 border-slate-300'}`}
              title="Menggunakan catatan aktivitas kuis Anda yang aktif untuk mengisi data tabel laporan."
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>SINKRON DATA LOG AKTIF</span>
            </button>
          </div>

          {/* Student details details bar */}
          <div className={`border p-4.5 rounded-xl space-y-3.5 ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/60 border-slate-300'}`}>
            <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-widest block">
              2. Identitas Mahasiswa / Peneliti
            </span>
            
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-zinc-500 font-mono text-[9px] mb-1">NAMA LENGKAP</label>
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Contoh: Jaka Makarim"
                  className={`w-full border p-2 rounded-md focus:outline-none focus:border-teal-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono text-[9px] mb-1">KELAS / TINGKAT</label>
                <input 
                  type="text" 
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="Contoh: XII - MIPA 2"
                  className={`w-full border p-2 rounded-md focus:outline-none focus:border-teal-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono text-[9px] mb-1">SEKOLAH / INSTITUSI</label>
                <input 
                  type="text" 
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Contoh: SMAN 1 Digital"
                  className={`w-full border p-2 rounded-md focus:outline-none focus:border-teal-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-mono text-[9px] mb-1">TANGGAL LAPORAN</label>
                <input 
                  type="date" 
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className={`w-full border p-2 rounded-md focus:outline-none focus:border-teal-500 font-mono ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                />
              </div>
            </div>
          </div>
          
          {/* Guru Evaluation & Submission Card */}
          <div className={`border p-4.5 rounded-xl space-y-3.5 text-xs print:hidden ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/60 border-slate-300'}`}>
            <span className="text-[10px] font-mono text-slate-450 font-extrabold uppercase tracking-widest block">
              3. Evaluasi &amp; Ajukan ke Guru
            </span>
            
            {dbReport ? (
              <div className={`p-3 border rounded-lg space-y-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Status Pengajuan:</span>
                  {dbReport.status === 'graded' ? (
                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[9px] rounded-md">
                      ✓ Telah Dinilai
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold text-[9px] rounded-md animate-pulse">
                      ⟳ Menunggu Review
                    </span>
                  )}
                </div>

                {dbReport.status === 'graded' && (
                  <div className="space-y-1 pt-1.5 border-t border-slate-950">
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-450 font-medium">Skor Laporan:</span>
                      <strong className="text-lg font-mono text-teal-400 font-black">{dbReport.grade} / 100</strong>
                    </div>
                    {dbReport.teacherFeedback && (
                      <div className={`text-[11px] text-zinc-300 italic p-2 rounded border mt-1 leading-relaxed ${theme === 'dark' ? 'bg-slate-950 border-slate-800/60' : 'bg-slate-100 border-slate-300'}`}>
                        &ldquo;{dbReport.teacherFeedback}&rdquo;
                      </div>
                    )}
                    {dbReport.teacherName && (
                      <p className="text-[9px] text-slate-500 font-mono text-right">
                        — Oleh: {dbReport.teacherName}
                      </p>
                    )}
                  </div>
                )}

                {dbReport.status === 'pending' && (
                  <p className="text-[11px] text-amber-400/90 leading-relaxed bg-amber-500/5 p-2 rounded border border-amber-500/10">
                    Laporan sudah diajukan untuk ditinjau. Anda dapat merevisi laporan dan mengirim ulang sebelum dinilai.
                  </p>
                )}
              </div>
            ) : (
              <div className={`p-3 border rounded-lg text-[11px] leading-relaxed ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900 text-slate-450' : 'bg-slate-100/40 border-slate-300 text-slate-600'}`}>
                Belum diajukan. Gunakan tombol di bawah ini untuk menyerahkan draf laporan Anda langsung ke portal penilai pengajar.
              </div>
            )}

            <button
              onClick={handleSubmitToTeacher}
              disabled={submittingReport}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-slate-950 hover:text-white rounded-lg font-sans font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>{submittingReport ? 'Sedang Mengajukan...' : dbReport ? 'Kirim Ulang / Revisi Laporan' : 'Ajukan Resmi Ke Guru'}</span>
            </button>
          </div>

          {/* Quick Actions Shelf */}
          <div className={`border p-4.5 rounded-xl space-y-2 text-xs ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/60 border-slate-300'}`}>
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block mb-2">4. Lembar Draft Tindakan</span>
            
            <button
              onClick={handleSaveDraft}
              className={`w-full py-2 hover:bg-slate-850 rounded-lg border transition-all flex items-center justify-center gap-1.5 font-sans font-bold cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-100 text-slate-900 border-slate-300'}`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Draf Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-zinc-400" />
                  <span>Simpan Progres Draft</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyMarkdown}
              className={`w-full py-2 hover:bg-slate-850 rounded-lg border transition-all flex items-center justify-center gap-1.5 font-sans font-semibold cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-300'}`}
            >
              {copySuccess ? (
                <span className="text-emerald-400 font-bold">Terpopulasi ke Clipboard!</span>
              ) : (
                <>
                  <Download className="w-4 h-4 text-zinc-400" />
                  <span>Salin format Markdown (MD)</span>
                </>
              )}
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full py-2 bg-teal-500/5 hover:bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/10 transition-all flex items-center justify-center gap-1.5 font-sans font-bold cursor-pointer mt-1"
              >
                Kembali ke Dashboard
              </button>
            )}
          </div>

        </div>

        {/* RIGHT PREVIEW / COMPOSE COLUMN (Span 8 or full depending on toggles) */}
        <div className={`lg:col-span-8 space-y-4 ${isPreviewMode ? 'lg:col-span-12' : ''}`}>
          
          {/* Main Printable Document Sheet (Uses formal traditional A4 paper layout) */}
          <div className={`border rounded-2xl p-6 md:p-10 shadow-2xl space-y-6 relative overflow-hidden select-text transition-all print:border-0 print:p-0 print:bg-white print:text-black ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            
            {/* Elegant Letterhead Header Decoration */}
            <div className="border-b-4 border-double border-teal-500/30 pb-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:border-black">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 tracking-widest uppercase print:text-black">
                  CHEMVIBE QUANTUM CHEMISTRY ACADEMY
                </span>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none print:text-black">
                  LAPORAN HASIL PRAKTIKUM virtual
                </h1>
                <p className="text-[10.5px] text-zinc-500 font-mono print:text-gray-600">
                  ID Dokumen: CRV-{selectedTopicId.toUpperCase()}-{Date.now().toString().slice(-5)} / LAB-LOG-2026
                </p>
              </div>
              <div className={`text-right font-mono text-[9.5px] p-2 border rounded-lg print:text-black print:bg-white print:border-gray-500 pointer-events-none self-end md:self-center shrink-0 ${theme === 'dark' ? 'text-zinc-400 bg-slate-900/60 border-slate-800' : 'text-slate-600 bg-slate-100/60 border-slate-300'}`}>
                <span>STATUS DATA: </span>
                <strong className="text-teal-400 font-black print:text-black">TERVERIFIKASI SISTEM</strong>
              </div>
            </div>

            {/* Student Metadata Table */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans p-4 rounded-xl border print:text-black print:bg-white print:border-gray-400 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-900' : 'bg-slate-100/40 border-slate-300'}`}>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-zinc-500 font-medium shrink-0 print:text-black">Nama Peneliti :</span>
                  <span className="font-extrabold text-white print:text-black">{studentName || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-zinc-500 font-medium shrink-0 print:text-black">Kelas/Tingkat :</span>
                  <span className="font-bold text-slate-300 print:text-black">{studentClass || '—'}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-zinc-500 font-medium shrink-0 print:text-black">Institusi :</span>
                  <span className="font-bold text-slate-300 print:text-black">{institution || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-zinc-500 font-medium shrink-0 print:text-black">Tgl Percobaan :</span>
                  <span className="font-mono text-teal-400 font-bold print:text-black">{reportDate || '—'}</span>
                </div>
              </div>
            </div>

            {/* Document Core Sections */}
            <div className="space-y-5 text-sm leading-relaxed text-slate-300 print:text-black">
              
              {/* Percobaan title */}
              <div className="border-b border-slate-900 pb-2.5">
                <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Topik Diskusi</h3>
                <h4 className="text-base font-extrabold text-teal-400 tracking-tight print:text-black">{selectedTopic.title}</h4>
              </div>

              {/* SECTION 1: OBJECTIVES */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-black text-white tracking-wider flex items-center gap-1.5 print:text-black">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full print:hidden" />
                  I. TUJUAN PERCOBAAN
                </h3>
                {isPreviewMode ? (
                  <p className="text-slate-350 pr-2 pl-2 border-l border-slate-900 print:text-black print:border-gray-400 whitespace-pre-line">{objectives}</p>
                ) : (
                  <textarea
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    rows={3}
                    placeholder="Masukkan tujuan percobaan di sini..."
                    className={`w-full border p-3 rounded-lg focus:outline-none focus:border-teal-500 print:bg-white print:text-black print:p-0 print:border-0 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-slate-100/40 border-slate-300 text-slate-600'}`}
                  />
                )}
              </div>

              {/* SECTION 2: THEORY */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-black text-white tracking-wider flex items-center gap-1.5 print:text-black">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full print:hidden" />
                  II. LANDASAN TEORI
                </h3>
                {isPreviewMode ? (
                  <p className="text-slate-350 pr-2 pl-2 border-l border-slate-900 print:text-black print:border-gray-400 whitespace-pre-line font-normal text-xs leading-relaxed">{theory}</p>
                ) : (
                  <textarea
                    value={theory}
                    onChange={(e) => setTheory(e.target.value)}
                    rows={4}
                    placeholder="Formula atau dasar hukum sains..."
                    className={`w-full border p-3 rounded-lg focus:outline-none focus:border-teal-500 text-xs print:bg-white print:text-black print:p-0 print:border-0 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-slate-100/40 border-slate-300 text-slate-600'}`}
                  />
                )}
              </div>

              {/* SECTION 3: APPARATUS */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-black text-white tracking-wider flex items-center gap-1.5 print:text-black">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full print:hidden" />
                  III. ALAT DAN BAHAN DIGITAL EXPOSURE
                </h3>
                {isPreviewMode ? (
                  <p className="text-slate-350 pr-2 pl-2 border-l border-slate-900 print:text-black print:border-gray-400 font-mono text-xs text-teal-400/90 print:text-black">{apparatus}</p>
                ) : (
                  <input
                    type="text"
                    value={apparatus}
                    onChange={(e) => setApparatus(e.target.value)}
                    placeholder="Contoh: Titrator ChemVibe, Sensor Sinyal..."
                    className={`w-full border p-3 rounded-lg focus:outline-none focus:border-teal-500 text-xs font-mono print:bg-white print:text-black print:p-0 print:border-0 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-slate-100/40 border-slate-300 text-slate-600'}`}
                  />
                )}
              </div>

              {/* SECTION 4: OBSERVATION DATA TABLE */}
              <div className="space-y-3">
                <div className="flex justify-between items-center print:block">
                  <h3 className="text-xs font-mono font-black text-white tracking-wider flex items-center gap-1.5 print:text-black">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full print:hidden" />
                    IV. DATA PENGAMATAN &amp; ANALISIS KUALITATIF
                  </h3>
                  
                  {/* Plus button inside editor */}
                  {!isPreviewMode && (
                    <button
                      onClick={handleAddRow}
                      className="px-2.5 py-1 text-[10px] font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 rounded-lg flex items-center gap-1 cursor-pointer print:hidden"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Baris</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-900 print:border-gray-400">
                  <table className="w-full text-xs text-left text-slate-300 print:text-black">
                    <thead className={`font-mono text-[10px] border-b print:bg-gray-100 print:text-black print:border-gray-400 ${theme === 'dark' ? 'bg-slate-950 text-slate-500 border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-300'}`}>
                      <tr>
                        <th className="p-3 w-1/3">Variabel / Parameter Uji</th>
                        <th className="p-3">Hasil / Nilai Terukur</th>
                        <th className="p-3">Unit / Karakteristik</th>
                        <th className="p-3">Penafsiran Ilmiah</th>
                        {!isPreviewMode && <th className="p-3 text-center print:hidden">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 print:divide-y print:divide-gray-400">
                      {observations.map((row, idx) => (
                        <tr key={idx} className={`print:hover:bg-white ${theme === 'dark' ? 'hover:bg-slate-900/20' : 'hover:bg-slate-200'}`}>
                          <td className="p-2 w-1/3">
                            {isPreviewMode ? (
                              <span className="font-extrabold text-white print:text-black block">{row.variable}</span>
                            ) : (
                              <input
                                type="text"
                                value={row.variable}
                                onChange={(e) => handleEditRowCell(idx, 'variable', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 text-white p-1 rounded focus:outline-none focus:border-teal-500 font-extrabold"
                              />
                            )}
                          </td>
                          <td className="p-2">
                            {isPreviewMode ? (
                              <span className="text-teal-400 font-mono font-semibold print:text-black block">{row.value}</span>
                            ) : (
                              <input
                                type="text"
                                value={row.value}
                                onChange={(e) => handleEditRowCell(idx, 'value', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 text-teal-400 font-mono p-1 rounded focus:outline-none focus:border-teal-500"
                              />
                            )}
                          </td>
                          <td className="p-2">
                            {isPreviewMode ? (
                              <span className="text-slate-450 block">{row.unit}</span>
                            ) : (
                              <input
                                type="text"
                                value={row.unit}
                                onChange={(e) => handleEditRowCell(idx, 'unit', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 text-slate-350 p-1 rounded focus:outline-none focus:border-teal-500"
                              />
                            )}
                          </td>
                          <td className="p-2">
                            {isPreviewMode ? (
                              <span className="text-zinc-400 block leading-normal">{row.notes}</span>
                            ) : (
                              <input
                                type="text"
                                value={row.notes}
                                onChange={(e) => handleEditRowCell(idx, 'notes', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-800 text-zinc-350 p-1 rounded focus:outline-none focus:border-teal-500"
                              />
                            )}
                          </td>
                          {!isPreviewMode && (
                            <td className="p-2 text-center print:hidden">
                              <button
                                onClick={() => handleDeleteRow(idx)}
                                className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                                title="Hapus Baris"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {observations.length === 0 && (
                        <tr>
                          <td colSpan={isPreviewMode ? 4 : 5} className="p-6 text-center text-zinc-500 font-mono text-[10.5px]">
                            Tidak ada data dalam tabel observasi. Klik "SINKRON DATA LOG" atau "Tambah Baris" untuk menyisipkan data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: CONCLUSION */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-black text-white tracking-wider flex items-center gap-1.5 print:text-black">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full print:hidden" />
                  V. KESIMPULAN &amp; PENUTUP
                </h3>
                {isPreviewMode ? (
                  <p className="text-slate-350 pr-2 pl-2 border-l border-slate-900 print:text-black print:border-gray-400 whitespace-pre-line font-medium leading-relaxed">{conclusion}</p>
                ) : (
                  <textarea
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    rows={3}
                    placeholder="Masukkan kesimpulan pembelajaran di sini..."
                    className={`w-full border p-3 rounded-lg focus:outline-none focus:border-teal-500 text-xs print:bg-white print:text-black print:p-0 print:border-0 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-slate-100/40 border-slate-300 text-slate-600'}`}
                  />
                )}
              </div>

              {/* SECTION 6: TEACHER EVALUATION & FEEDBACK IN PAPER SHEET */}
              {dbReport && dbReport.status === 'graded' && (
                <div className="mt-6 p-4 bg-teal-500/5 border-2 border-dashed border-teal-500/20 rounded-xl space-y-3 font-sans text-xs print:bg-gray-50 print:border-gray-400 print:text-black">
                  <div className="flex items-center justify-between pb-2 border-b border-teal-500/10 print:border-gray-400">
                    <span className="font-mono font-black text-teal-400 tracking-wider uppercase print:text-black">
                      VI. LEMBAR PENILAIAN &amp; VALIDASI GURU (EVALUATION FEEDBACK)
                    </span>
                    <span className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono font-black text-[10px] rounded uppercase print:text-black print:border-gray-400">
                      OFFICIAL GRADE
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className={`md:col-span-1 text-center p-4 rounded-lg border print:bg-white print:border-gray-400 ${theme === 'dark' ? 'bg-slate-905 bg-slate-900/60 border-slate-800/85' : 'bg-slate-100 bg-slate-100/60 border-slate-300'}`}>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">NILAI EVALUASI</span>
                      <strong className="text-3xl font-mono text-teal-400 font-extrabold print:text-black">{dbReport.grade} / 100</strong>
                    </div>
                    
                    <div className="md:col-span-3 space-y-1.5 pl-0 md:pl-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono print:text-black">Catatan &amp; Telaah Guru Sains:</span>
                      <p className="text-[11.5px] text-zinc-300 italic leading-relaxed print:text-black">
                        &ldquo;{dbReport.teacherFeedback || 'Laporan praktikum diselesaikan secara presisi sesuai petunjuk operasional laboratorium virtual.'}&rdquo;
                      </p>
                      <div className="flex items-center justify-between pt-1 font-mono text-[9px] text-slate-550 print:text-black">
                        <span>Penilai: <strong className="text-slate-350 print:text-black">{dbReport.teacherName || 'Sistem Lab Cloud'}</strong></span>
                        <span>Disahkan pada: {dbReport.gradedAt ? new Date(dbReport.gradedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Signature & Authentication Footnote Block */}
            <div className="pt-8 border-t border-slate-900 grid grid-cols-2 gap-4 text-[10px] print:text-black print:border-gray-500">
              <div className="text-left py-4 pointer-events-none">
                <span className="text-zinc-500 block uppercase font-mono text-[8px] tracking-wider mb-8">Disusun Oleh Pratikan:</span>
                <span className="text-white border-b border-slate-850 pb-1 font-bold font-sans print:text-black print:border-black">
                  {studentName || '________________________'}
                </span>
                <span className="text-zinc-500 block mt-1 font-mono">{studentClass || 'Siswa Aktif'}</span>
              </div>
              <div className="text-right py-4 pointer-events-none">
                <span className="text-zinc-500 block uppercase font-mono text-[8px] tracking-wider mb-8">Disahkan Secara Kuantum:</span>
                <span className="text-teal-400 bg-teal-500/10 px-2 py-1.5 rounded-lg font-bold font-mono border border-teal-500/20 print:text-black print:border-black print:bg-white">
                  ✓ CHEMVIBE LAB-REPORT APPROVED
                </span>
                <span className="text-zinc-500 block mt-3 font-mono">{reportDate}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
