/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Atom, 
  FlaskConical, 
  Orbit, 
  Scale, 
  Droplet, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  RotateCw,
  HelpCircle,
  Zap,
  Activity,
  GitBranch,
  Flame,
  Dna,
  FileText,
  Megaphone,
  GraduationCap,
  Layers
} from 'lucide-react';
import { ELEMENTS_DATA, FLASHCARDS_DATA } from '../data';
import { ElementCategory, UserAccount, ActivityLog } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  timestamp: string;
  category: 'tugas' | 'pengumuman' | 'materi';
}

interface DashboardHomeProps {
  onNavigate: (view: string) => void;
  masteryLevels: { day: string; level: number }[];
  dueCardsCount: number;
  currentUser: UserAccount | null;
  activities: ActivityLog[];
  onTriggerAuth: () => void;
  onUpdateClass?: (classCode: string, className: string) => void;
}

export default function DashboardHome({ 
  onNavigate, 
  masteryLevels, 
  dueCardsCount,
  currentUser,
  activities,
  onTriggerAuth,
  onUpdateClass
}: DashboardHomeProps) {
  // We can pick sodium flashcard representation
  const featuredFlashcard = FLASHCARDS_DATA[0]; // Na card
  const [flipped, setFlipped] = React.useState(false);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [selectedGrade, setSelectedGrade] = React.useState<'all' | 'X' | 'XI' | 'XII'>('all');

  // Class Management States
  const [classCodeInput, setClassCodeInput] = React.useState('');
  const [joiningClass, setJoiningClass] = React.useState(false);
  const [classError, setClassError] = React.useState('');

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const code = classCodeInput.trim().toUpperCase();
    if (!code) return;

    setJoiningClass(true);
    setClassError('');

    try {
      // 1. Verify classroom exists
      const classDoc = await getDoc(doc(db, 'classrooms', code));
      if (!classDoc.exists()) {
        setClassError('Kode kelas tidak ditemukan. Silakan periksa kembali.');
        setJoiningClass(false);
        return;
      }

      const classData = classDoc.data();
      const className = classData.className || 'Kelas Kimia';

      // 2. Update users document in Firestore
      await setDoc(doc(db, 'users', currentUser.id), {
        classCode: code,
        className: className
      }, { merge: true });

      // 3. Update public profiles document in Firestore
      await setDoc(doc(db, 'public_profiles', currentUser.id), {
        classCode: code,
        className: className
      }, { merge: true });

      // 4. Log join activity
      const actId = 'act_join_' + Date.now();
      await setDoc(doc(db, 'users', currentUser.id, 'activities', actId), {
        id: actId,
        activityType: 'simulation_run',
        title: 'Bergabung dengan Kelas',
        description: `Berhasil mendaftarkan lab di kelas "${className}" (Kode: ${code})`,
        timestamp: new Date().toISOString()
      });

      // 5. Update local React state in App.tsx
      if (onUpdateClass) {
        onUpdateClass(code, className);
      }

      setClassCodeInput('');
      alert(`Sukses bergabung dengen kelas "${className}"! Anda dapat menyaring papan peringkat khusus kelompok kelas ini.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.id}`);
      setClassError('Kesalahan jaringan saat menghubungi server kelas.');
    } finally {
      setJoiningClass(false);
    }
  };

  const handleLeaveClass = async () => {
    if (!currentUser) return;
    if (!window.confirm("Apakah Anda yakin ingin keluar dari kelompok kelas Anda? Anda akan dialihkan ke kategori belajar mandiri.")) return;

    setJoiningClass(true);
    try {
      // 1. Remove attributes in Firestore users doc
      await setDoc(doc(db, 'users', currentUser.id), {
        classCode: '',
        className: ''
      }, { merge: true });

      // 2. Remove attributes in Firestore public_profiles doc
      await setDoc(doc(db, 'public_profiles', currentUser.id), {
        classCode: '',
        className: ''
      }, { merge: true });

      // 3. Update local state
      if (onUpdateClass) {
        onUpdateClass('', '');
      }

      alert("Anda telah keluar dari kelas. Sekarang Anda kembali belajar mandiri.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.id}`);
      alert("Gagal memproses pemisahan kelas.");
    } finally {
      setJoiningClass(false);
    }
  };

  React.useEffect(() => {
    if (!currentUser) {
      setAnnouncements([]);
      return;
    }

    // Sync class announcements from the database in real-time
    const q = query(collection(db, 'class_announcements'), orderBy('timestamp', 'desc'), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed: Announcement[] = [];
      snapshot.forEach(doc => {
        parsed.push({ id: doc.id, ...doc.data() } as Announcement);
      });
      setAnnouncements(parsed);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'class_announcements');
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Group elements category styling helper
  const getCategoryColor = (cat: ElementCategory) => {
    switch(cat) {
      case 'alkali-metals': return 'border-alkali-metals/40 bg-alkali-metals/10 text-alkali-metals';
      case 'alkaline-earth': return 'border-alkaline-earth/40 bg-alkaline-earth/10 text-alkaline-earth';
      case 'transition-metals': return 'border-transition-metals/40 bg-transition-metals/10 text-transition-metals';
      case 'post-transition': return 'border-post-transition/40 bg-post-transition/10 text-post-transition';
      case 'metalloids': return 'border-metalloids/40 bg-metalloids/10 text-metalloids';
      case 'nonmetals': return 'border-nonmetals/40 bg-nonmetals/10 text-nonmetals';
      case 'noble-gases': return 'border-noble-gases/40 bg-noble-gases/10 text-noble-gases';
      case 'lanthanides': return 'border-pink-500/40 bg-pink-500/10 text-pink-400';
      case 'actinides': return 'border-purple-500/40 bg-purple-500/10 text-purple-400';
      default: return 'border-gray-500/40 bg-gray-500/10 text-gray-400';
    }
  };

  const dashboardElements = ELEMENTS_DATA.slice(0, 10); // Display H, He, Li, Be, B, C, N, O, F, Ne

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl h-48 md:h-64 flex flex-col justify-center px-6 md:px-10 border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            alt="Cosmic Space Lab Nebula" 
            className="w-full h-full object-cover select-none" 
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8WBzK3okRTOUwJYRKmouCnAI827FREUe-alRIIsY98e-DOgUGX_OKY313xsbbGEHTrvWecKZqL4si1C20gpU6r5hjvrT_U8JXIMbtKFTooKe6p1O4XoVZ41Eiyp41oiNDbmk8V8zij1DTEQv78Dbyyw7UuUYl2jpu9M891GXcZLRdwua2lGPwujuPSDEJi31N5p-F6zivTRxKyovcK6k6TSrKNnU0P0R2Skn9vfptIiS8beJeVM3gxIT6e6VsnQKD5LES6XpMEAw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/45 to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs text-teal-400 font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Quantum Laboratory Online
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-sans text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white animate-fade-in">
              Welcome Back, {currentUser ? currentUser.name : 'Student'}.
            </h1>
            {currentUser && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9.5px] md:text-xs font-mono font-black tracking-wider uppercase shadow-md ${
                currentUser.role === 'guru' 
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400 shadow-indigo-500/5'
                  : 'bg-teal-500/15 border-teal-500/30 text-teal-400 shadow-teal-500/5'
              }`} id="welcome-role-badge">
                {currentUser.role === 'guru' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Pendidik (Guru)</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Peneliti (Siswa)</span>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-slate-300 text-sm md:text-base font-normal leading-relaxed">
            {currentUser 
              ? <>Sesi lab Anda aktif. Konsol mengamankan seluruh progress kuis, skor pencapaian, dan grafik kemajuan belajar virtual Anda.</>
              : <>Your quantum analysis of the Halogen group is <span className="text-teal-400 font-bold">82% complete</span>. Silakan masuk/daftar buat mentrack progress permanen.</>
            }
          </p>
        </div>
      </section>

      {/* Papan Pengumuman Guru / Class Announcements */}
      {announcements.length > 0 && (
        <section className="bg-slate-950/40 border border-indigo-500/15 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-400 animate-pulse" />
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
              Pengumuman Terbaru dari Guru
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 bg-slate-900/35 border border-slate-850 rounded-xl space-y-2.5 relative">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 font-mono text-[8.5px] font-black uppercase rounded ${
                    ann.category === 'tugas' 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : ann.category === 'materi'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                        : 'bg-teal-500/10 text-teal-400 border border-teal-500/25'
                  }`}>
                    {ann.category === 'tugas' ? 'Tugas' : ann.category === 'materi' ? 'Materi' : 'Pengumuman'}
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-500">
                    Oleh: <span className="text-slate-400 italic font-bold">{ann.authorName}</span>
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white leading-snug">{ann.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                <div className="text-[8.5px] font-mono text-slate-600 text-right">
                  {new Date(ann.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kolom Hubungan Kelas Guru & Siswa */}
      {currentUser && currentUser.role !== 'guru' && (
        <section className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5" id="classroom-student-connector bg-slate-900 border-indigo-500/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                  Laborat Kelompok Kelas Virtual
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Hubungkan portofolio riset Anda dengan pendidik via kode 6-digit
                </p>
              </div>
            </div>

            {currentUser.classCode ? (
              <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl cursor-default w-full sm:w-auto">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <p className="text-[9.5px] font-mono text-indigo-300 font-black uppercase tracking-wider">Terhubung Kelas</p>
                  <p className="text-xs text-white font-black truncate max-w-[200px] leading-tight">
                    {currentUser.className}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">Kode: {currentUser.classCode}</p>
                </div>
                <button
                  onClick={handleLeaveClass}
                  disabled={joiningClass}
                  className="px-2.5 py-1.5 bg-rose-500/15 border border-rose-500/20 text-rose-400 hover:bg-rose-500/25 hover:text-rose-300 text-[9.5px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {joiningClass ? '...' : 'Keluar'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinClass} className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Kode Kelas (e.g. CHEM-3901)"
                    value={classCodeInput}
                    onChange={(e) => setClassCodeInput(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-pink-500 font-mono w-full sm:w-[220px]"
                  />
                  {classError && (
                    <span className="absolute -bottom-4.5 left-1 text-[8.5px] text-rose-450 font-mono w-48 truncate leading-none">
                      {classError}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={joiningClass || !classCodeInput.trim()}
                  className="px-4 py-2 bg-pink-650 hover:bg-pink-550 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {joiningClass ? 'Koneksi...' : 'Gabung'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Grade Level Tab Selector */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
        <div>
          <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-teal-400" />
            <span>Katalog Laboratorium Virtual</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Eksplorasi modul kimia interaktif berdasarkan tingkat/kelas kurikulum nasional.</p>
        </div>
        <div className="flex bg-slate-900/65 border border-slate-800/80 p-1 rounded-xl gap-1 shrink-0 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setSelectedGrade('all')}
            className={`px-4.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedGrade === 'all'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            Semua Kelas
          </button>
          <button
            onClick={() => setSelectedGrade('X')}
            className={`px-4.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedGrade === 'X'
                ? 'bg-teal-500/15 border border-teal-500/30 text-teal-405 font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            Kelas X (Dasar)
          </button>
          <button
            onClick={() => setSelectedGrade('XI')}
            className={`px-4.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedGrade === 'XI'
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-405 font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            Kelas XI (Lanjutan)
          </button>
          <button
            onClick={() => setSelectedGrade('XII')}
            className={`px-4.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedGrade === 'XII'
                ? 'bg-orange-500/15 border border-orange-500/30 text-orange-405 font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            Kelas XII (Spesialis)
          </button>
        </div>
      </div>

      {/* Main Bento Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Periodic Table Card (Span 8) */}
        {(selectedGrade === 'all' || selectedGrade === 'X') && (
          <div 
            onClick={() => onNavigate('periodic-table')}
            className="md:col-span-8 group relative overflow-hidden glass-panel rounded-2xl p-6 md:p-8 hover:border-teal-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer glow-teal flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-mono text-slate-500 tracking-wider">MODULE_ALPHA_01</span>
                <h3 className="font-sans text-2xl font-bold text-white mt-1 group-hover:text-teal-400 transition-colors">
                  Interactive Periodic Table
                </h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md">
                  Explore atomic masses, electron configurations, Phase properties, and historical facts.
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-all">
                <Atom className="w-5 h-5" />
              </div>
            </div>

            {/* Quick mini grid snippet */}
            <div className="grid grid-cols-10 gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity mt-2">
              {dashboardElements.map((el, i) => {
                // Alignments
                const colClass = el.symbol === 'He' ? 'col-start-10' : el.symbol === 'B' ? 'col-start-6' : '';
                return (
                  <div 
                    key={el.symbol} 
                    className={`${colClass} aspect-square rounded border ${getCategoryColor(el.category)} flex flex-col items-center justify-center text-[11px] font-bold transition-transform group-hover:scale-105 duration-200 shadow-sm`}
                  >
                    <span className="text-[9px] opacity-70 font-mono leading-none">{el.number}</span>
                    <span className="leading-tight">{el.symbol}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-end text-xs text-teal-400 font-semibold gap-1 group-hover:gap-2 transition-all">
              Open Interactive Table <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Bonding Lab Card (Span 4) */}
        {(selectedGrade === 'all' || selectedGrade === 'X') && (
          <div 
            onClick={() => onNavigate('bonding-lab')}
            className="md:col-span-4 group relative overflow-hidden glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 text-teal-400 transition-all duration-500">
              <FlaskConical className="w-48 h-48 rotate-12" />
            </div>
            <div className="z-10">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-widest uppercase">
                  New: Orbitals
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-all">
                  <FlaskConical className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-sans text-xl font-bold text-white mt-4 group-hover:text-teal-400 transition-colors">
                Bonding Lab
              </h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Drag, align, and drop atoms together to synthesize electron orbitals, covalent, polar and ionic bonds in real time.
              </p>
            </div>
            <div className="mt-6 z-10 flex items-center text-xs text-teal-400 font-semibold gap-1 group-hover:gap-2 transition-all">
              Enter Chemistry Laboratory <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Small Navigation Cards */}
        {(selectedGrade === 'all' || selectedGrade === 'X') && (
          <div 
            onClick={() => onNavigate('geometry')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                <Orbit className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Molecular Geometry</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              3D interactive visualization of molecules conforming to active VSEPR molecular rotation guidelines, steric angles, and lone pairs.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'X') && (
          <div 
            onClick={() => onNavigate('stoichiometry')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-all">
                <Scale className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Stoichiometry</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Determine limiting reactants, compute relative molar ratios, molecular weights, and exact grams yields of reactants instantly.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XI') && (
          <div 
            onClick={() => onNavigate('titration')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-all">
                <Droplet className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Titration Curves</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Simulate acid-base titrations with detailed pH curve equations, equivalence indicator states, and concentration diagnostics.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XII') && (
          <div 
            onClick={() => onNavigate('volta-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450 group-hover:bg-rose-500/20 transition-all">
                <Zap className="w-4.5 h-4.5 text-rose-400" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Laboratorium Elektrokimia</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Eksplorasi penyetaraan reaksi Redoks otomatis, simulasi Sel Volta (Nernst), Sel Elektrolisis (Faraday), dan kuis evaluasi komprehensif.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XI') && (
          <div 
            onClick={() => onNavigate('kinetics-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 group-hover:bg-emerald-500/20 transition-all">
                <Activity className="w-4.5 h-4.5 text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Kinetika & Laju Reaksi</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Manipulasi konsentrasi, suhu, luas bidang sentuh, & katalis untuk melihat frekuensi dan efek energi tumbukan partikel pada kurva waktu.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XI') && (
          <div 
            onClick={() => onNavigate('equilibrium-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-450 group-hover:bg-yellow-500/20 transition-all">
                <GitBranch className="w-4.5 h-4.5 text-yellow-400 rotate-90" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Kesetimbangan Kimia</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Eksperimen Asas Le Chatelier secara visual. Ganggu kestabilan sistem reaksi lewat konsentrasi, tekanan, volume, suhu, dan saksikan pergeserannya.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XI') && (
          <div 
            onClick={() => onNavigate('thermochemistry-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-450 group-hover:bg-amber-500/20 transition-all">
                <Flame className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Termokimia &amp; Energi</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Eksplorasi entalpi ($\Delta H$), transisi reaksi eksoterm &amp; endoterm lewat kalorimeter dinamis, serta kalkulasi energi ikatan rata-rata senyawa.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XII') && (
          <div 
            onClick={() => onNavigate('colligative-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-all">
                <Droplet className="w-4.5 h-4.5 text-teal-400" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Sifat Koligatif Larutan</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Simulasikan penurunan tekanan uap, kenaikan titik didih, penurunan titik beku, dan tekanan osmotik (elektrolit &amp; non-elektrolit) pasca pelarutan.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XI') && (
          <div 
            onClick={() => onNavigate('colloid-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-550/10 border border-indigo-505/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                <Layers className="w-4.5 h-4.5 text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Sistem Koloid &amp; Tyndall</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Visualisasikan pendaran berkas cahaya laser (Efek Tyndall) nanometer, pelajari metode sintesis sol hidrolisis/peptisasi, serta sifat elektroforesis dialisis.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XII') && (
          <div 
            onClick={() => onNavigate('electrolysis-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 group-hover:bg-emerald-500/20 transition-all">
                <Zap className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Sel Elektrolisis &amp; Faraday</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Amati reduksi-oksidasi non-spontan, visualisasikan penyepuhan logam perak/tembaga murni, dan kalkulasi massa kuantitatif Hukum Faraday I &amp; II.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XII') && (
          <div 
            onClick={() => onNavigate('flame-test-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-420/20 transition-all">
                <Flame className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Uji Nyala Kimia Unsur</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Panaskan logam sampel IA/IIA Kelas XII, amati eksitasi/de-eksitasi elektron Bohr, saring lewat kaca kobalt, and kalkulasi energi emisi kuantum.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XI') && (
          <div 
            onClick={() => onNavigate('buffer-hydrolysis-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-all">
                <Droplet className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Penyangga &amp; Hidrolisis Garam</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Desain larutan buffer asam/basa stabil, uji ketahanan terhadap HCl/NaOH, amati hidrolisis parsial sisa pereaksi, serta kalkulasi pH eksak MIPA XI.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XI') && (
          <div 
            onClick={() => onNavigate('solubility-ksp-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-all">
                <Sparkles className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Kelarutan &amp; Hasil Kali Ksp</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Periksa pengendapan jenuh AgCl atau CaF₂, uji anjlokan spektakuler kelarutan molar berkat efek ion senama NaCl/NaF, dan simulasi pH-dependent antasida Al(OH)₃.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XII') && (
          <div 
            onClick={() => onNavigate('organic-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition-all">
                <FlaskConical className="w-4.5 h-4.5 text-orange-400" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Kimia Karbon (Organik)</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Eksplorasi tata nama (IUPAC), fasa sifat fisika, pemutaran model 3D hidrokarbon &amp; gugus fungsi, kuis mandiri, serta simulasi reaktor esterifikasi parfum.
            </p>
          </div>
        )}

        {(selectedGrade === 'all' || selectedGrade === 'XII') && (
          <div 
            onClick={() => onNavigate('macromolecule-lab')}
            className="md:col-span-4 group glass-panel rounded-2xl p-6 hover:border-teal-500/50 hover:shadow-md transition-all duration-300 cursor-pointer space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition-all">
                <Dna className="w-4.5 h-4.5 text-orange-400" />
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">Laboratorium Makromolekul</h4>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Belajar gugus biologis: uji karbohidrat (Benedict &amp; Iodium), model pI zwitterion asam amino, ketidakjenuhan lipid &amp; penyabunan, serta perakitan polimer sintetis.
            </p>
          </div>
        )}
      </div>

      {/* Progress metrics & next review cards stack */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Mastery Graph Chart area */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 glow-purple flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <h3 className="font-sans text-lg font-bold text-white">Recent Progress</h3>
            </div>
            <span className="font-mono text-xs text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
              AVERAGE MASTERY: {Math.round(masteryLevels.reduce((acc, d) => acc + d.level, 0) / masteryLevels.length)}%
            </span>
          </div>

          {/* SVG Custom Graph */}
          <div className="relative h-44 flex items-end gap-3 mt-2 px-1">
            {/* Grid background markers */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-slate-600">
              <div className="border-t border-slate-800 w-full pt-1 flex justify-between"><span>100%</span></div>
              <div className="border-t border-slate-800 w-full pt-1 flex justify-between"><span>50%</span></div>
              <div className="border-t border-slate-800 w-full pt-1"><span>0%</span></div>
            </div>

            {/* Simulated bars */}
            {masteryLevels.map((ml, idx) => (
              <div key={ml.day} className="flex-1 flex flex-col items-center z-10 h-full justify-end group">
                <div 
                  className={`w-full rounded-t-md transition-all duration-300 relative ${
                    idx === masteryLevels.length - 1 
                      ? 'bg-gradient-to-t from-teal-600 to-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.4)]' 
                      : 'bg-teal-500/20 group-hover:bg-teal-500/30'
                  }`}
                  style={{ height: `${ml.level}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 border border-teal-550/40 text-[9px] px-2 py-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20 pointer-events-none whitespace-nowrap">
                    {ml.level}% Mastery
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-500 mt-2 font-semibold">
                  {ml.day}
                </span>
              </div>
            ))}
          </div>

          {/* Virtual Lab Report Fast Launcher Banner */}
          <div className="mt-6 p-4 bg-gradient-to-r from-teal-500/10 via-slate-900/40 to-indigo-500/10 border border-teal-500/15 rounded-xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/10">
                <FileText className="w-5 h-5 text-teal-400" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[12px] uppercase font-mono font-black text-white tracking-wider">Ekspor Laporan Praktikum Virtual</h4>
                <p className="text-[10px] text-slate-400 max-w-sm leading-normal">Kompilasi otomatis data observasi dan pencapaian lab Anda ke lembar kertas formal siap kumpul.</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('virtual-report')}
              className="px-4 py-2 bg-teal-500 text-slate-950 hover:bg-teal-400 font-sans text-[10.5px] font-black uppercase rounded-lg shadow-lg hover:shadow-teal-500/10 transition-all cursor-pointer active:scale-95 duration-150 shrink-0"
            >
              Kompilasi Laporan
            </button>
          </div>

          {/* Real-time Activity Logs & Feedback */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">ACTIVITY LOG & LAB REVIEWS</span>
              {!currentUser && (
                <button 
                  onClick={onTriggerAuth}
                  className="text-[10px] font-sans text-teal-400 hover:text-teal-300 transition-colors uppercase font-black tracking-tight underline adorn-decoration-dotted pointer-events-auto cursor-pointer"
                >
                  Daftar untuk Menyimpan Progress Permanen
                </button>
              )}
            </div>

            {activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {activities.slice(0, 4).map((act, idx) => (
                  <div key={act.id || idx} className="flex gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-900 text-xs">
                    <div className="w-5.5 h-5.5 shrink-0 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[9px] font-black flex items-center justify-center">
                      {act.activityType === 'quiz_completed' ? 'Q' : 'F'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-1">
                        <span className="font-bold text-slate-200 truncate block">{act.title}</span>
                        <span className="text-[8px] font-mono text-slate-500 shrink-0">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-tight mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl text-slate-500 text-[10.5px] font-mono">
                Belum ada aktivitas terekam. Selesaikan kuis evaluasi di Lab agar progress Anda mulai teracak.
              </div>
            )}
          </div>
        </div>

        {/* Immediate Flashcards Preview block */}
        <div className="glass-panel border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-400 md:animate-pulse" />
              <h3 className="font-sans text-base font-bold text-white">Next Review</h3>
            </div>
            <span className="font-mono text-[11px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
              {dueCardsCount} due
            </span>
          </div>

          {/* Simulated 3D Element Interactive Flashcard card preview */}
          <div className="card-perspective flex-1 flex items-center justify-center py-4">
            <div 
              onClick={() => setFlipped(!flipped)}
              className={`relative w-44 aspect-[5/7] cursor-pointer card-inner ${flipped ? 'card-flip' : ''}`}
            >
              {/* Card FRONT */}
              <div className="absolute inset-0 bg-slate-900 rounded-xl shadow-2xl p-4 text-slate-200 flex flex-col justify-between backface-hidden border-2 border-slate-700">
                <div className="absolute inset-1.5 border-[1.5px] border-teal-500/20 rounded-lg pointer-events-none"></div>
                <div className="flex justify-between items-start pointer-events-none">
                  <span className="font-mono text-xs font-bold text-slate-500">11</span>
                  <span className="text-xl font-black text-teal-400 font-sans tracking-tight">Na</span>
                </div>
                <div className="text-center font-sans pointer-events-none">
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">CATION</p>
                  <p className="font-bold text-lg text-white leading-tight">Sodium</p>
                </div>
                <div className="flex justify-between items-end rotate-180 pointer-events-none">
                  <span className="font-mono text-xs font-bold text-slate-500">11</span>
                  <span className="text-xl font-black text-teal-400 font-sans tracking-tight">Na</span>
                </div>
              </div>

              {/* Card BACK */}
              <div className="absolute inset-0 bg-slate-950 border border-teal-500/50 rounded-xl shadow-2xl p-4 text-teal-100 flex flex-col justify-between [transform:rotateY(180deg)] backface-hidden">
                <div className="absolute inset-1.5 border border-teal-500/20 rounded-lg pointer-events-none"></div>
                <div className="text-center flex-1 flex flex-col justify-center items-center gap-1.5 pointer-events-none">
                  <span className="text-[8px] tracking-widest text-teal-400 font-bold uppercase">Properties</span>
                  <p className="text-[10px] font-mono leading-normal text-slate-300 text-center">
                    Kation Na⁺ melepas 1 elektron valensi demi kestabilan oktet n=2.
                  </p>
                </div>
                <div className="text-[8px] font-mono text-slate-500 text-center pointer-events-none">
                  Click to re-flip
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-1 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-mono">CARDS_DUE</span>
              <span className="text-teal-400 font-bold font-mono">{dueCardsCount} cards ready</span>
            </div>
            
            <button 
              onClick={() => onNavigate('flashcards')}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-xs duration-200 shadow-lg shadow-teal-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start Deck <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
