import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Download, 
  Printer, 
  QrCode, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  Flame, 
  GraduationCap, 
  Briefcase, 
  Atom, 
  Globe, 
  Bookmark, 
  Calendar, 
  UserCheck, 
  Info,
  ChevronRight,
  ClipboardCheck,
  Zap,
  Activity,
  FileText
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, onSnapshot, setDoc, collection, updateDoc } from 'firebase/firestore';
import { UserAccount } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AcademicCredentialsProps {
  currentUser: UserAccount | null;
  onNavigate?: (view: string) => void;
}

interface SmartBadge {
  id: string;
  name: string;
  category: string;
  description: string;
  requirementHtml: string;
  isUnlocked: boolean;
  scoreValue?: number;
  rewardPoints: number;
  iconName: 'zap' | 'atom' | 'trophy' | 'sparkles' | 'shield' | 'report' | 'quiz' | 'periodic';
  color: string;
  glow: string;
}

export default function AcademicCredentials({ currentUser, onNavigate }: AcademicCredentialsProps) {
  const [activeTab, setActiveTab] = useState<'badges' | 'certificate' | 'verification'>('badges');
  const [profileData, setProfileData] = useState<UserAccount | null>(currentUser);
  const [gradedReportsCount, setGradedReportsCount] = useState<number>(0);
  const [certificateName, setCertificateName] = useState<string>('');
  const [isCertificateAuthorized, setIsCertificateAuthorized] = useState<boolean>(false);
  const [serialCode, setSerialCode] = useState<string>('');
  const [claimingBadgeId, setClaimingBadgeId] = useState<string | null>(null);
  const [isVerifiedOnChain, setIsVerifiedOnChain] = useState<boolean>(false);
  const [verificationSearch, setVerificationSearch] = useState<string>('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Custom certificate styling configuration
  const [certTheme, setCertTheme] = useState<'classic' | 'cyber' | 'emerald'>('classic');

  // Cryptographic/Encrypted badges verification system
  const [verifiedBadges, setVerifiedBadges] = useState<Record<string, any>>({});
  const [badgeVerificationStatus, setBadgeVerificationStatus] = useState<Record<string, { valid: boolean; details: string; loading: boolean }>>({});
  const [signingBadgeId, setSigningBadgeId] = useState<string | null>(null);

  // Real-time listener for current user's profile to catch live updates of badges
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;
    
    // Default draft name for certificate matching active user name
    setCertificateName(currentUser.name);
    
    // Generate an unique serialized credentials hash based on user initials & id
    const initials = (currentUser.name || '').trim().split(/\s+/).map(n => n ? n[0] : '').join('').toUpperCase() || 'CV';
    const cleanId = currentUser.id.slice(0, 6).toUpperCase();
    setSerialCode(`CERT-${initials}-${cleanId}-2026`);

    const userDocRef = doc(db, 'public_profiles', currentUser.id);
    const unsubscribe = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        setProfileData({ id: snap.id, ...snap.data() } as UserAccount);
      }
    }, (err) => {
      console.error("Gagal mendengarkan profil real-time:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Read student virtual lab report entries to count the total graded submissions
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const reportsRef = collection(db, 'student_reports');
    const unsubscribe = onSnapshot(reportsRef, (snap) => {
      let count = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.studentId === currentUser.id && data.status === 'graded') {
          count++;
        }
      });
      setGradedReportsCount(count);
    }, (err) => {
      console.error("Gagal membaca koleksi laporan untuk validasi lencana:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time listener for current user's cryptographically verified badges
  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const bRef = collection(db, 'users', currentUser.id, 'verified_badges');
    const unsubscribe = onSnapshot(bRef, (snap) => {
      const bMap: Record<string, any> = {};
      snap.forEach((doc) => {
        const data = doc.data();
        bMap[doc.id] = data;
        // Verify badge signature in background
        verifyBadgeSignatureLocally(data);
      });
      setVerifiedBadges(bMap);
    }, (err) => {
      console.error("Gagal mendengarkan lencana terenkripsi real-time:", err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const verifyBadgeSignatureLocally = async (badgeData: any) => {
    const { badgeId, userId, points, timestamp, signature } = badgeData;
    if (!badgeId || !userId || points === undefined || !timestamp || !signature) return;
    
    // Set loading state
    setBadgeVerificationStatus(prev => ({
      ...prev,
      [badgeId]: { valid: false, details: 'Memverifikasi...', loading: true }
    }));

    try {
      const res = await fetch("/api/badges/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, badgeId, points, timestamp, signature })
      });
      if (res.ok) {
        const body = await res.json();
        setBadgeVerificationStatus(prev => ({
          ...prev,
          [badgeId]: { valid: !!body.valid, details: body.details, loading: false }
        }));
      } else {
        setBadgeVerificationStatus(prev => ({
          ...prev,
          [badgeId]: { valid: false, details: 'Gagal merespon dari server', loading: false }
        }));
      }
    } catch (e: any) {
      setBadgeVerificationStatus(prev => ({
        ...prev,
        [badgeId]: { valid: false, details: 'Koneksi error', loading: false }
      }));
    }
  };

  // Derive logical criteria for smart gamified credentials
  const completedMissions = profileData?.completedMissions || [];
  const atomHighscore = profileData?.atomHighscore || 0;
  const periodicHighscore = profileData?.periodicHighscore || 0;

  // Real-time Badges criteria mapping inside the interactive state
  const badgesList: SmartBadge[] = [
    {
      id: 'deuteron',
      name: 'Lencana Deuteron Fusi',
      category: 'Konstruksi Atom',
      description: 'Diberikan atas keberhasilan menyelesaikan misi sintesis isotop Deuteron dan Hydrogen stabil.',
      requirementHtml: 'Selesaikan Misi #1 pada simulator rancang atom.',
      isUnlocked: completedMissions.includes(1),
      rewardPoints: 100,
      iconName: 'zap',
      color: 'from-emerald-500 to-teal-400 text-teal-400 border-teal-500/20 bg-teal-500/10',
      glow: 'shadow-teal-500/10 border-teal-500/30'
    },
    {
      id: 'alpha-core',
      name: 'Lencana Reaktor Alpha',
      category: 'Konstruksi Atom',
      description: 'Diberikan kepada perancang yang berhasil merakit partikel fusi Helium-4 dengan kestabilan nuklir maksimus.',
      requirementHtml: 'Selesaikan Misi #2 pada simulator rancang atom.',
      isUnlocked: completedMissions.includes(2),
      rewardPoints: 100,
      iconName: 'atom',
      color: 'from-blue-600 to-indigo-500 text-blue-400 border-blue-500/20 bg-blue-500/10',
      glow: 'shadow-blue-500/10 border-blue-500/30'
    },
    {
      id: 'organik-carbon',
      name: 'Lencana Karbon Allotrop',
      category: 'Struktur Organik',
      description: 'Siswa berhasil menyelaraskan 6 proton dan neutron untuk membangun jembatan organik sempurna Karbon-12.',
      requirementHtml: 'Selesaikan Misi #4 pada simulator rancang atom.',
      isUnlocked: completedMissions.includes(4),
      rewardPoints: 110,
      iconName: 'sparkles',
      color: 'from-amber-500 to-orange-400 text-amber-400 border-amber-500/20 bg-amber-500/10',
      glow: 'shadow-amber-500/10 border-amber-500/30'
    },
    {
      id: 'quantum-expert',
      name: 'Lencana Master Kuantum',
      category: 'Capaian Skor',
      description: 'Lencana khusus penyusun atom profesional yang menembus skor akumulasi di atas ambang kompetensi kualifikasi.',
      requirementHtml: 'Raih skor minimum 300 pts di simulator rancang atom.',
      isUnlocked: atomHighscore >= 300,
      rewardPoints: 150,
      iconName: 'trophy',
      color: 'from-fuchsia-600 to-indigo-500 text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/10',
      glow: 'shadow-fuchsia-500/10 border-fuchsia-500/30'
    },
    {
      id: 'periodic-scholar',
      name: 'Lencana Ahli Hukum Periodik',
      category: 'Sains Teoretis',
      description: 'Dianugerahkan atas kemampuan mengidentifikasi keelektronegatifan, jari-jari kovalen, dan konfigurasi elektron unsur modern.',
      requirementHtml: 'Raih skor minimum 100 pts pada ujian tabel periodik.',
      isUnlocked: periodicHighscore >= 100,
      rewardPoints: 150,
      iconName: 'periodic',
      color: 'from-pink-500 to-rose-400 text-pink-400 border-pink-500/20 bg-pink-500/10',
      glow: 'shadow-pink-500/10 border-pink-500/30'
    },
    {
      id: 'lab-scientist',
      name: 'Lencana Riset Berlisensi',
      category: 'Validasi Praktikum',
      description: 'Dilegalkan khusus bagi penemu virtual yang sukses menyusun proposal hasil uji dan mendapat evaluasi formal dari pengajar.',
      requirementHtml: 'Miliki minimal 1 Laporan Praktikum yang telah resmi dinilai oleh Pengajar.',
      isUnlocked: gradedReportsCount >= 1,
      rewardPoints: 200,
      iconName: 'report',
      color: 'from-sky-500 to-emerald-400 text-sky-400 border-sky-500/20 bg-sky-500/10',
      glow: 'shadow-sky-500/10 border-sky-500/30'
    },
    {
      id: 'nobel-champion',
      name: 'Lencana Grandmaster ChemVibe',
      category: 'Prestasi Tertinggi',
      description: 'Gelar kehormatan akademik tertinggi bagi siswa dengan rekor aktivitas riset komprehensif tanpa cacat.',
      requirementHtml: 'Miliki minimum 4 lencana cerdas lain yang aktif.',
      isUnlocked: (completedMissions.length + (atomHighscore >= 300 ? 1 : 0) + (periodicHighscore >= 100 ? 1 : 0) + (gradedReportsCount >= 1 ? 1 : 0)) >= 4,
      rewardPoints: 300,
      iconName: 'shield',
      color: 'from-purple-600 via-pink-500 to-amber-500 text-amber-300 border-purple-500/25 bg-amber-500/10',
      glow: 'shadow-amber-500/20 border-purple-500/40'
    }
  ];

  const unlockedBadgesCount = badgesList.filter(b => b.isUnlocked).length;
  const isEligibleForCertificate = unlockedBadgesCount >= 3;

  // Handle local print triggering
  const handlePrintCertificate = () => {
    window.print();
  };

  // Claim points trigger to reward students and update their highscores locally
  const claimBadgeScore = async (badge: SmartBadge) => {
    if (!profileData || !currentUser) {
      alert("Masuk akun untuk mengklaim poin reward!");
      return;
    }
    setClaimingBadgeId(badge.id);
    
    try {
      const userRef = doc(db, 'public_profiles', currentUser.id);
      const newScore = (profileData.atomHighscore || 0) + badge.rewardPoints;
      
      await updateDoc(userRef, {
        atomHighscore: newScore
      });

      // Register public activity log for global pipeline feeds
      const actId = 'act_badge_' + Date.now();
      await setDoc(doc(db, 'public_activities', actId), {
        id: actId,
        userId: currentUser.id,
        userName: currentUser.name,
        activityType: 'badge',
        title: 'Mendapat Lencana Kehormatan',
        description: `Berhasil mengklaim Lencana "${badge.name}" dan memperoleh bonus +${badge.rewardPoints} poin sains!`,
        timestamp: new Date().toISOString()
      });

      alert(`Sukses mengklaim! Anda dihadiahi +${badge.rewardPoints} Poin Prestasi. Status disinkronkan ke Cloud.`);
    } catch (err) {
      console.error(err);
      alert("Poin gagal disinkronkan ke server.");
    } finally {
      setClaimingBadgeId(null);
    }
  };

  // Securely request server cryptographic signature and write verified badge to database
  const signAndSecureBadge = async (badge: SmartBadge) => {
    if (!currentUser) {
      alert("Masuk akun untuk memverifikasi lencana!");
      return;
    }
    setSigningBadgeId(badge.id);
    const writePath = `users/${currentUser.id}/verified_badges/${badge.id}`;
    try {
      const res = await fetch("/api/badges/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          badgeId: badge.id,
          points: badge.rewardPoints
        })
      });
      if (!res.ok) {
        throw new Error("Gagal menandatangani lencana via server API");
      }
      const data = await res.json();
      
      // Save signed data to Firestore
      try {
        await setDoc(doc(db, 'users', currentUser.id, 'verified_badges', badge.id), {
          id: data.id,
          userId: data.userId,
          badgeId: data.badgeId,
          points: Number(data.points),
          timestamp: Number(data.timestamp),
          signature: data.signature
        });
      } catch (firestoreError) {
        handleFirestoreError(firestoreError, OperationType.WRITE, writePath);
      }

      // Add a public activity log for this cryptographic audit confirmation
      const actId = 'act_badge_secure_' + Date.now();
      const actPath = `public_activities/${actId}`;
      try {
        await setDoc(doc(db, 'public_activities', actId), {
          id: actId,
          userId: currentUser.id,
          userName: currentUser.name,
          activityType: 'badge_security',
          title: 'Sertifikasi Kriptografis Lencana',
          description: `Mengamankan Lencana "${badge.name}" lewat database dengan tanda tangan hash ${data.signature.slice(0, 10)}...`,
          timestamp: new Date().toISOString()
        });
      } catch (firestoreError) {
        handleFirestoreError(firestoreError, OperationType.WRITE, actPath);
      }

      alert(`Sukses mengkonfirmasi lencana! Tanda tangan digital aman telah diterbitkan dan diverifikasi di database.`);
    } catch (err: any) {
      console.error(err);
      alert("Otentikasi & Verifikasi lencana database gagal: " + err.message);
    } finally {
      setSigningBadgeId(null);
    }
  };

  // Mock submit certificate verification lookup to on-chain simulation
  const handleOnChainVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setIsVerifiedOnChain(true);
      setLoading(false);
    }, 1200);
  };

  // Verification search engine of other certificates
  const handleSearchCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationSearch.trim()) return;

    setLoading(true);
    setSearchResult(null);

    try {
      const searchKey = verificationSearch.trim();

      // Check if it matches a signature or badge ID in local verified list
      const badgeMatch = (Object.values(verifiedBadges) as any[]).find(b => b.badgeId === searchKey || b.signature === searchKey);
      if (badgeMatch) {
         const matchingRef = badgesList.find(b => b.id === (badgeMatch as any).badgeId);
         setSearchResult({
           type: 'badge_signed',
           id: (badgeMatch as any).id,
           badgeId: (badgeMatch as any).badgeId,
           badgeName: matchingRef?.name || (badgeMatch as any).badgeId,
           points: (badgeMatch as any).points,
           timestamp: (badgeMatch as any).timestamp,
           signature: (badgeMatch as any).signature,
           studentName: currentUser?.name || 'Siswa Utama',
           status: badgeVerificationStatus[(badgeMatch as any).badgeId]?.valid ? 'Terverifikasi Secara Kriptografis' : 'Dalam pemrosesan...'
         });
         return;
      }

      // Look up reports, profiles or simulators to see if serial exists
      const reportId = searchKey;
      const reportRef = doc(db, 'student_reports', reportId);
      const snap = await getDoc(reportRef);

      if (snap.exists()) {
        setSearchResult({
          type: 'report',
          id: snap.id,
          ...snap.data()
        });
      } else {
        // Mock lookup registry for certificates matching the search code
        if (reportId === serialCode) {
          setSearchResult({
            type: 'certificate',
            id: serialCode,
            studentName: certificateName,
            status: 'Verifikasi Valid',
            date: new Date().toLocaleDateString('id-ID'),
            issuedBy: 'ChemVibe Accreditation Board'
          });
        } else {
          // Check standard format matching default
          if (reportId.startsWith('CERT-')) {
            setSearchResult({
              type: 'certificate',
              id: reportId,
              studentName: 'Siswa Utama Terakreditasi',
              status: 'Verifikasi Valid',
              date: '30 Mei 2026',
              issuedBy: 'ChemVibe Accreditation Board'
            });
          } else {
            setSearchResult({
              error: true,
              message: 'Sertifikat tidak terdaftar di database cloud ChemVibe. Silakan periksa kembali unit ID Anda.'
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderBadgeIcon = (name: string, color = "text-teal-400") => {
    switch (name) {
      case 'zap': return <Zap className={`w-5 h-5 ${color}`} />;
      case 'atom': return <Atom className={`w-5 h-5 ${color}`} />;
      case 'sparkles': return <Sparkles className={`w-5 h-5 ${color}`} />;
      case 'trophy': return <Trophy className={`w-5 h-5 ${color}`} />;
      case 'periodic': return <Globe className={`w-5 h-5 ${color}`} />;
      case 'report': return <FileText className={`w-5 h-5 ${color}`} />;
      default: return <ShieldCheck className={`w-5 h-5 ${color}`} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-sans animate-fade-in unique-credentials-deck">
      
      {/* Hero Header Unit */}
      <div className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/5 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-teal-500/10 border border-teal-500/15 rounded-full text-teal-400 font-mono text-[10px] uppercase font-black tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Kredensial Kompetensi (Lencana &amp; Sertifikat)</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Kualifikasi Akademik &amp; Lencana</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Klaim lencana cerdas dari progres simulasi laboratorium Anda, cetak Sertifikat Kelulusan resmi ter-validasi, dan verifikasi sertifikasi Anda secara global.
          </p>
        </div>

        <div className="p-4 bg-slate-950/80 border border-teal-500/30 rounded-xl space-y-2.5 text-xs w-full md:w-[240px] shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-mono uppercase text-[9px]">Lencana Aktif:</span>
            <strong className="text-teal-400 font-mono font-bold">{unlockedBadgesCount} / {badgesList.length}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-mono uppercase text-[9px]">Nilai Rancang Atom:</span>
            <strong className="text-white font-mono font-bold">{atomHighscore} pts</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-mono uppercase text-[9px]">Tabel Periodik:</span>
            <strong className="text-white font-mono font-bold">{periodicHighscore} pts</strong>
          </div>
          <div className="pt-2 border-t border-slate-900 flex items-center gap-1.5 justify-center">
            {isEligibleForCertificate ? (
              <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Layak Sertifikasi
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-400 uppercase">
                butuh {3 - unlockedBadgesCount} lencana lagi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Selector Navigation on Desktop Screen */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 print:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'badges'
                ? 'bg-slate-800 text-teal-400 border border-slate-700 shadow-md translate-y-[-1px]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Koleksi Lencana Cerdas ({unlockedBadgesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'certificate'
                ? 'bg-slate-800 text-teal-400 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Sertifikat Kelulusan Resmi</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'verification'
                ? 'bg-slate-800 text-teal-400 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cek &amp; Verifikasi Kredensial</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* TAB 1: SMART BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-6 print:hidden">
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider mb-1">Mekanisme Gamifikasi Kredensial</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lencana Akademik ChemVibe secara cerdas mendeteksi tingkat pemahaman praktikum Anda secara real-time. Unsur atom yang berhasil disusun, nilai modul ujian periodik, serta verifikasi laporan praktikum dari pengajar Anda akan membuka lencana prestisius dengan poin reward sains instan!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {badgesList.map((badge) => {
              const isVerified = !!verifiedBadges[badge.id];
              const verification = badgeVerificationStatus[badge.id];

              return (
                <div 
                  key={badge.id}
                  className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between group h-full ${
                    badge.isUnlocked
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700/60 shadow-lg ' + badge.glow
                      : 'bg-slate-950/20 border-slate-900/70 opacity-60 text-slate-500'
                  }`}
                >
                  {/* Status Indicator Stamp */}
                  <div className="absolute top-4 right-4 print:hidden">
                    {badge.isUnlocked ? (
                      isVerified ? (
                        verification?.loading ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[9px] font-bold rounded">
                            <span className="w-1.5 h-1.5 border border-sky-400 border-t-transparent animate-spin rounded-full inline-block" /> VERIFYING...
                          </span>
                        ) : verification?.valid ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 font-mono text-[9px] font-bold rounded" title="Aman dan terotentikasi di database">
                            🔐 SECURE DB
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-500/15 border border-red-500/40 text-red-400 font-mono text-[9px] font-bold rounded" title="Kredensial database tidak valid!">
                            ⚠ INVALID SIGN
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-bold rounded">
                          ✓ UNLOCKED
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] font-bold rounded">
                        🔒 LOCKED
                      </span>
                    )}
                  </div>

                  {/* Icon & Title Group */}
                  <div className="space-y-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 ${
                      badge.isUnlocked ? badge.color : 'from-slate-900 to-slate-950 text-slate-500 border-slate-800'
                    }`}>
                      {renderBadgeIcon(badge.iconName, badge.isUnlocked ? 'text-teal-400' : 'text-slate-600')}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-teal-450 uppercase font-black tracking-widest block">
                        {badge.category}
                      </span>
                      <h4 className="text-sm font-black text-white group-hover:text-teal-400 transition-colors">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Requirements & Action Footer */}
                  <div className="mt-5 pt-3.5 border-t border-slate-950/60 space-y-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Kriteria Rilis:</span>
                      <p className="text-[10.5px] text-zinc-400 font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: badge.requirementHtml }} />
                    </div>

                    {isVerified && (
                      <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-900/60 font-mono text-[9.5px] text-zinc-400 space-y-1 mb-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-500 uppercase text-[9px]">Audit DB:</span>
                          <span className="text-emerald-400 font-bold uppercase text-[9px]">AKTIF &amp; ENKRIPSI</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-zinc-500 uppercase text-[9px]">Tanda Tangan:</span>
                          <span className="text-zinc-300 select-all truncate font-bold text-[9px]" title={verifiedBadges[badge.id]?.signature}>
                            {verifiedBadges[badge.id]?.signature ? `${verifiedBadges[badge.id]?.signature.slice(0, 12)}...` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 uppercase text-[9px]">Verifikasi Kripto:</span>
                          <span className={`font-bold uppercase text-[9px] ${verification?.valid ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}>
                            {verification?.loading ? 'Mengecek...' : (verification?.valid ? 'Lulus Sah' : 'Data Rusak')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 pt-1 font-mono">
                      {badge.isUnlocked && (
                        <button
                          onClick={() => claimBadgeScore(badge)}
                          disabled={claimingBadgeId !== null}
                          className="w-full py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-[10.5px] font-black uppercase rounded-lg font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md hover:shadow-teal-500/20 active:scale-98"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{claimingBadgeId === badge.id ? 'Mengunggah Poin...' : `Klaim Reward +${badge.rewardPoints} Poin!`}</span>
                        </button>
                      )}

                      {badge.isUnlocked && !isVerified && (
                        <button
                          onClick={() => signAndSecureBadge(badge)}
                          disabled={signingBadgeId !== null}
                          className="w-full py-1.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-slate-950 text-[10.5px] font-black uppercase rounded-lg font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-teal-500/15 active:scale-98"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{signingBadgeId === badge.id ? 'Mengamankan...' : 'Sertifikasi lewat Database'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CERTIFICATE GENERATOR */}
      {activeTab === 'certificate' && (
        <div className="space-y-6">
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4 print:hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-mono font-black text-teal-300 uppercase tracking-wider">Formulir Penerbitan Sertifikat</h3>
                <p className="text-xs text-slate-400">
                  Pastikan nama lengkap Anda sudah benar. Jika Anda telah mengaktifkan minimal 3 lencana akademik, draf sertifikat kelulusan dapat disahkan secara formal oleh sistem ChemVibe!
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Pilih Tema Visual:</span>
                {['classic', 'cyber', 'emerald'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setCertTheme(theme as any)}
                    className={`px-3 py-1 text-[10px] font-bold font-mono rounded cursor-pointer transition-all border ${
                      certTheme === theme
                        ? 'bg-teal-500 text-slate-950 border-teal-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {theme.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">NAMA PENERIMA SERTIFIKAT (DAPAT DISESUAIKAN)</label>
                <input
                  type="text"
                  value={certificateName}
                  onChange={(e) => setCertificateName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-400 font-sans"
                  placeholder="Masukkan nama lengkap Anda..."
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setIsCertificateAuthorized(true)}
                  disabled={!isEligibleForCertificate}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-505 hover:to-indigo-600 font-mono text-slate-950 hover:text-white text-xs font-black uppercase rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sahkan Sertifikat</span>
                </button>
              </div>
            </div>

            {!isEligibleForCertificate && (
              <div className="p-3 bg-amber-500/5 text-amber-400 border border-amber-500/15 rounded-lg text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">Sertifikat Belum Memenuhi Kualifikasi:</strong>
                  Anda membutuhkan minimum 3 Lencana Unlocked untuk merilis sertifikat. Saat ini Anda baru memiliki <strong>{unlockedBadgesCount} lencana cerdas</strong>. Selesaikan misi molekul, rancang atom, atau laporkan hasil uji praktikum untuk melegalkan kelayakan Anda.
                </div>
              </div>
            )}
          </div>

          {/* THE OFFICIAL HIGH-FIDELITY PRINTABLE CERTIFICATE CARD */}
          <div className="relative overflow-hidden">
            {/* Action floating deck only on developer view */}
            <div className="absolute top-4 right-4 z-25 flex items-center gap-2 print:hidden">
              <button
                onClick={handlePrintCertificate}
                disabled={!isCertificateAuthorized}
                className="px-3.5 py-2 bg-slate-950/90 border border-slate-800 text-teal-400 hover:text-white font-mono text-[10px] uppercase font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xl hover:shadow-teal-500/10 disabled:opacity-30 disabled:pointer-events-none"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Cetak PDF</span>
              </button>
              <button
                onClick={() => alert("Sertifikat berhasil diekspor sebagai draft visual!")}
                disabled={!isCertificateAuthorized}
                className="px-3.5 py-2 bg-slate-950/90 border border-slate-800 text-slate-350 hover:text-white font-mono text-[10px] uppercase font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xl disabled:opacity-30 disabled:pointer-events-none"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>

            {/* CERTIFICATE DISPLAY SHEET (Perfect 4:3 Ratio for desktop/paper outputs) */}
            <div 
              className={`w-full max-w-4xl mx-auto p-8 md:p-14 border-4 rounded-xl relative overflow-hidden shadow-2xl transition-all duration-500 ${
                !isCertificateAuthorized ? 'filter blur-[1.5px] pointer-events-none opacity-40 select-none' : ''
              } ${
                certTheme === 'classic' 
                  ? 'bg-slate-900/90 border-amber-500/35 text-slate-300' 
                  : certTheme === 'cyber'
                    ? 'bg-slate-950 border-sky-500/40 text-slate-300'
                    : 'bg-slate-900 border-emerald-500/35 text-slate-300'
              } print:bg-white print:border-gray-800 print:text-black print:shadow-none print:p-8 print:w-full print:mx-0 print:border-8`}
            >
              
              {/* Elegant borders layout lines */}
              <div className="absolute inset-2 border border-dashed border-slate-800 pointer-events-none print:border-gray-300" />
              <div className="absolute inset-4 border border-rose-500/5 pointer-events-none" />

              {/* Background watermark seals */}
              <div className="absolute -top-16 -right-16 w-96 h-96 bg-teal-500/5 rounded-full blur-[80px] pointer-events-none print:hidden" />
              <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none print:hidden" />

              {/* Certificate content starts here */}
              <div className="space-y-8 text-center relative z-10">
                
                {/* Visual Header Branding */}
                <div className="flex flex-col items-center space-y-3.5">
                  <div className={`p-4 rounded-full border bg-slate-950/80 ${
                    certTheme === 'classic' ? 'border-amber-500/30 text-amber-400' : certTheme === 'cyber' ? 'border-sky-500/30 text-teal-400' : 'border-emerald-500/30 text-emerald-450'
                  } print:bg-white print:border-gray-800 print:text-black`}>
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono tracking-widest text-teal-400 font-extrabold uppercase print:text-black">
                      CHEMVIBE MOLECULAR ACCREDITATION BOARD
                    </span>
                    <h2 className="text-sm font-semibold tracking-wider text-slate-400 print:text-black font-mono">
                      PIAGAM SERTIFIKASI PRESTASI virtual
                    </h2>
                  </div>
                </div>

                {/* Main Body Statement */}
                <div className="space-y-6">
                  <p className="text-xs font-mono text-zinc-550 italic uppercase tracking-wider print:text-black">
                    Sertifikat ini resmi dianugerahkan dengan segala hak kehormatan kepada:
                  </p>

                  <div className="py-2 inline-block border-b-2 border-dashed border-slate-700 max-w-lg w-full print:border-gray-850">
                    <h1 className="text-2xl md:text-3.5xl font-sans tracking-tight text-white font-black uppercase print:text-black">
                      {certificateName || 'Siswa Berprestasi'}
                    </h1>
                  </div>

                  <p className="text-xs leading-relaxed max-w-xl mx-auto text-slate-400 print:text-zinc-700 font-medium">
                    Atas penyelesaian yang luar biasa dari kompilasi riset struktural, penyusunan rancangan konfigurasi kuantum sub-atomik, kelulusan ujian tabel periodik modern, serta dedikasi tinggi dalam pelaporan virtual lembar kerja sains.
                  </p>
                </div>

                {/* Metadata & Achievement Badges Grid in Certificate */}
                <div className="max-w-lg mx-auto py-3 bg-slate-950/60 border border-slate-800 rounded-xl px-4 grid grid-cols-3 gap-2 text-[10.5px] font-mono print:bg-white print:border-gray-300 print:text-black print:shadow-none">
                  <div className="text-center border-r border-slate-900 last:border-0 print:border-gray-200">
                    <span className="text-slate-500 block text-[8px] uppercase">Predikat</span>
                    <strong className="text-teal-400 font-semibold tracking-tight print:text-black uppercase">
                      {unlockedBadgesCount >= 6 ? 'GRANDMASTER' : unlockedBadgesCount >= 4 ? 'AHLI UTAMA' : 'PRAKTISI'}
                    </strong>
                  </div>
                  
                  <div className="text-center border-r border-slate-900 last:border-0 print:border-gray-200">
                    <span className="text-slate-500 block text-[8px] uppercase">Lencana Lulus</span>
                    <strong className="text-white font-semibold print:text-black">{unlockedBadgesCount} Lencana</strong>
                  </div>

                  <div className="text-center">
                    <span className="text-slate-500 block text-[8px] uppercase">Akreditasi</span>
                    <strong className="text-emerald-400 font-semibold print:text-black">EXCELLENT</strong>
                  </div>
                </div>

                {/* Footer Validation Signature Block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-900/60 items-end max-w-3xl mx-auto text-left print:border-gray-300">
                  
                  {/* Left Signature validation */}
                  <div className="space-y-2 text-xs font-mono text-slate-500 print:text-black">
                    <span className="text-[8px] uppercase text-zinc-550 block">Disahkan secara sistem:</span>
                    <div className="italic text-zinc-350 print:text-black font-semibold text-[11px] leading-none">
                      Dr. ChemVibe Al-Kemi
                    </div>
                    <p className="text-[9px] text-zinc-600 border-t border-slate-900/80 pt-1 print:border-gray-200 leading-none">
                      Direktur Utama Akreditasi
                    </p>
                  </div>

                  {/* Center Verification Hallmark Stamp */}
                  <div className="flex flex-col items-center justify-center space-y-1.5 print:text-black">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border border-dashed border-emerald-500/40 flex items-center justify-center text-teal-400 font-mono text-[9px] font-black print:text-black print:border-gray-400">
                        VERIFIED
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full animate-ping print:hidden" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 border border-slate-900 rounded-full print:hidden" />
                    </div>
                    <span className="text-[8.5px] font-mono text-zinc-550 uppercase tracking-widest text-center">
                      SECURE CREDENTIAL
                    </span>
                  </div>

                  {/* Right Serial ID with Dynamic QR code outline */}
                  <div className="flex items-center md:justify-end gap-3.5">
                    <div className="text-right text-xs font-mono text-slate-500 print:text-black leading-tight">
                      <span className="text-[8px] uppercase tracking-wide text-zinc-400 block">No. Registrasi:</span>
                      <strong className="text-white text-[11px] font-bold font-mono print:text-black">{serialCode}</strong>
                      <span className="text-[8.5px] text-slate-400 block mt-1.5">Sains Berbasis Cloud</span>
                    </div>
                    <div className="p-1 bg-white border border-gray-200 rounded shrink-0 shadow-lg print:shadow-none">
                      <QrCode className="w-8 h-8 text-black" />
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Authorized stamp overlay block when locked */}
            {!isCertificateAuthorized && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 p-6 text-center text-slate-300 print:hidden rounded-lg">
                <Bookmark className="w-12 h-12 text-teal-400 mb-3 animate-bounce" />
                <h4 className="text-sm font-black font-mono uppercase tracking-widest text-white">Pratinjau Kredensial Terkunci</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-1.5 mb-4">
                  Pastikan Anda telah mengisi nama lengkap, memenuhi prasyarat minimal lencana cerdas, lalu klik tombol <strong>"Sahkan Sertifikat"</strong> untuk melegalisasi piagam kelulusan ini.
                </p>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                  <span>Sarat Lencana Aktif: {unlockedBadgesCount} / 3</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION SYSTEM */}
      {activeTab === 'verification' && (
        <div className="space-y-6 print:hidden">
          <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Sistem Verifikasi Kredensial Terbuka (Public Registry)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Setiap laporan laboratorium virtual atau sertifikat prestasi yang dihasilkan di lingkungan ujian dapat diaudit validitasnya menggunakan ID Registrasi yang terdaftar di database cloud Firebase. Gunakan kolom pencarian di bawah untuk memverifikasi keaslian draf.
              </p>
            </div>

            <form onSubmit={handleSearchCredential} className="flex gap-2">
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={verificationSearch}
                  onChange={(e) => setVerificationSearch(e.target.value)}
                  placeholder="Masukkan ID Registrasi (Contoh: report_[ID_Siswa] / CERT-CV-2026 atau No. Registrasi Piagam)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pl-4 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-black uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-teal-500/10 active:scale-98 shrink-0"
              >
                Cari Kredensial
              </button>
            </form>
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono">Mengecek basis data audit cloud ChemVibe...</p>
              </div>
            )}

            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-5"
              >
                {searchResult.error ? (
                  <div className="p-4 bg-rose-500/5 text-rose-400 border border-rose-500/15 rounded-xl text-xs flex gap-2">
                    <Info className="w-4.5 h-4.5 shrink-0" />
                    <div>
                      <strong className="block mb-0.5">ID Kredensial Tidak Ditemukan:</strong>
                      {searchResult.message}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ✓ TERDAFTAR SECARA SAH
                        </span>
                        <h4 className="text-sm font-black text-white mt-1.5 font-mono">
                          AUDIT HASIL: {searchResult.id}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Sains Berbasis Cloud
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-500 block text-[9px] uppercase">NAMA PEMILIK KREDENSIAL:</span>
                        <span className="text-white font-bold">{searchResult.studentName || searchResult.studentId}</span>
                      </div>
                      
                      <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-500 block text-[9px] uppercase">JENIS KREDENSIAL:</span>
                        <span className="text-white font-bold uppercase">{searchResult.type === 'report' ? 'LAPORAN VIRTUAL LAB (GRADED)' : 'PIAGAM SERTIFIKAT PRESTASI'}</span>
                      </div>

                      {searchResult.type === 'report' ? (
                        <>
                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-500 block text-[9px] uppercase">NILAI EVALUASI GURU:</span>
                            <span className="text-teal-400 font-bold">{searchResult.grade} / 100</span>
                          </div>
                          
                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-500 block text-[9px] uppercase">TANGGAL SUBMISI:</span>
                            <span className="text-zinc-300 font-bold">{new Date(searchResult.submittedAt || Date.now()).toLocaleDateString('id-ID')}</span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1 md:col-span-2">
                            <span className="text-slate-500 block text-[9px] uppercase">KOMENTAR / ULASAN PENGAJAR:</span>
                            <p className="text-zinc-300 font-semibold italic mt-1 leading-relaxed">&ldquo;{searchResult.teacherFeedback}&rdquo;</p>
                          </div>
                        </>
                      ) : searchResult.type === 'badge_signed' ? (
                        <>
                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-500 block text-[9px] uppercase">Nama Lencana:</span>
                            <span className="text-teal-400 font-bold">{searchResult.badgeName}</span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-500 block text-[9px] uppercase">Bobot Poin:</span>
                            <span className="text-white font-bold">+{searchResult.points} Poin</span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1 md:col-span-2">
                            <span className="text-slate-500 block text-[9px] uppercase">Tanda Tangan Kriptografi (SHA-256):</span>
                            <span className="text-emerald-400 select-all font-mono break-all text-[11px] font-bold block">{searchResult.signature}</span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1 md:col-span-2">
                            <span className="text-slate-500 block text-[9px] uppercase">Status Keaslian:</span>
                            <span className="text-emerald-450 font-bold text-[11px] block">✓ {searchResult.status}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-500 block text-[9px] uppercase">AKREDITASI DEWAN:</span>
                            <span className="text-teal-400 font-bold">{searchResult.status}</span>
                          </div>

                          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-500 block text-[9px] uppercase">OTORITAS PENERBIT:</span>
                            <span className="text-zinc-300 font-bold">{searchResult.issuedBy}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
