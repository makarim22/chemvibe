import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Search, 
  Award, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  BookOpen, 
  Clock, 
  Zap, 
  Atom, 
  Globe,
  GraduationCap,
  FlaskConical,
  Users
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { UserAccount, ActivityLog } from '../types';
import { motion } from 'motion/react';

interface LeaderboardProps {
  theme?: 'dark' | 'light';
  currentUser: UserAccount | null;
  onNavigate: (view: string) => void;
}

interface PublicProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  atomHighscore?: number;
  periodicHighscore?: number;
  completedMissions?: number[];
  updatedAt?: string;
  role?: 'guru' | 'siswa';
  classCode?: string;
  className?: string;
}

interface PublicActivity {
  id: string;
  userId: string;
  userName: string;
  activityType: string;
  title: string;
  description: string;
  timestamp: string;
}

export default function Leaderboard({ currentUser, onNavigate, theme = 'dark' }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'atom' | 'periodic' | 'badges'>('atom');
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [liveActivities, setLiveActivities] = useState<PublicActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClassOnly, setFilterClassOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Leaderboard Entries in Real-time from public_profiles
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const profilesRef = collection(db, 'public_profiles');
    // Using simple getDocs/onSnapshot since we don't have composite indexes pre-configured,
    // we fetch them and sort/filter client-side to ensure index errors NEVER occur dynamically
    const unsubscribe = onSnapshot(profilesRef, (snapshot) => {
      const parsedProfiles: PublicProfile[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        parsedProfiles.push({
          id: doc.id,
          name: data.name || 'Peneliti',
          avatarUrl: data.avatarUrl,
          atomHighscore: typeof data.atomHighscore === 'number' ? data.atomHighscore : 0,
          periodicHighscore: typeof data.periodicHighscore === 'number' ? data.periodicHighscore : 0,
          completedMissions: Array.isArray(data.completedMissions) ? data.completedMissions : [],
          role: data.role,
          classCode: data.classCode || '',
          className: data.className || ''
        });
      });
      setProfiles(parsedProfiles);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'public_profiles');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 2. Stream Global Live Activities in Real-time and display them with micro-animations
  useEffect(() => {
    if (!currentUser) return;

    const activitiesRef = collection(db, 'public_activities');
    const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(15));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed: PublicActivity[] = [];
      snapshot.forEach((doc) => {
        parsed.push({ id: doc.id, ...doc.data() } as PublicActivity);
      });
      setLiveActivities(parsed);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'public_activities');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Sort profiles client-side according to activeTab
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (activeTab === 'atom') {
      return (b.atomHighscore || 0) - (a.atomHighscore || 0);
    } else if (activeTab === 'periodic') {
      return (b.periodicHighscore || 0) - (a.periodicHighscore || 0);
    } else {
      return (b.completedMissions?.length || 0) - (a.completedMissions?.length || 0);
    }
  });

  // Filter sorted profiles matching searchQuery and classmates filter
  const filteredProfiles = sortedProfiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterClassOnly && currentUser?.classCode) {
      return matchesSearch && p.classCode === currentUser.classCode;
    }
    return matchesSearch;
  });

  // Find current user's placement details
  const myIndex = sortedProfiles.findIndex(p => p.id === currentUser?.id);
  const myRank = myIndex !== -1 ? myIndex + 1 : null;
  const myRecord = myIndex !== -1 ? sortedProfiles[myIndex] : null;

  // Helper colors for rank badges
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold font-mono text-xs">
            1st
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200/10 text-slate-350 border border-slate-200/30 font-bold font-mono text-xs">
            2nd
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/15 text-orange-400 border border-amber-700/30 font-bold font-mono text-xs">
            3rd
          </div>
        );
      default:
        return (
          <div className={`flex items-center justify-center w-7 h-7 rounded-full border font-mono text-xs ${theme === 'dark' ? 'bg-slate-900/60 text-slate-400 border-slate-800' : 'bg-slate-100/60 text-slate-600 border-slate-300'}`}>
            {rank}
          </div>
        );
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'latihan':
      case 'quiz':
        return <Award className="w-3.5 h-3.5 text-indigo-400" />;
      case 'highscore':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'badge':
        return <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />;
      case 'lab-report':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Atom className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  // Helper date text format
  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m yang lalu`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}j yang lalu`;
      return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch (_) {
      return 'Baru saja';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-sans">
      
      {/* 1. Header Hero section */}
      <div className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-r from-teal-950/40 via-slate-900/65 to-indigo-950/30 border border-teal-500/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-teal-500/10 border border-teal-500/15 rounded-full text-teal-400 font-mono text-[10px] uppercase font-black tracking-wider">
            <Globe className="w-3 h-3 animate-spin duration-3000" />
            <span>Pusat Riset Quantum Global</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Papan Peringkat Global</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Bandingkan akurasi rekonstruksi atomik, skor tabel periodik, dan prestasi lencana quantum Anda dengan peneliti kimia virtual dari seluruh belahan akademis.
          </p>
        </div>

        {/* Current user's stats summary */}
        {currentUser ? (
          <div className={`p-4 border border-teal-500/15 rounded-xl space-y-3 w-full md:w-[260px] self-stretch flex flex-col justify-between shrink-0 ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-slate-100/70'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-sm tracking-wide">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">STATUS ANDA</p>
                <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{currentUser.name}</h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-2 text-center">
              <div>
                <p className="text-[9px] font-mono text-slate-500 uppercase font-black">Peringkat</p>
                <p className="text-sm font-black text-teal-400 font-mono">
                  {myRank ? `#${myRank}` : '--'}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-mono text-slate-500 uppercase font-black">Skor Atom</p>
                <p className="text-sm font-black text-indigo-400 font-mono">
                  {myRecord?.atomHighscore ?? (localStorage.getItem('chemvibe_atombuilder_highscore') || '0')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-5 border rounded-xl text-center md:w-[260px] shrink-0 space-y-3 ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-300'}`}>
            <p className="text-xs text-slate-400">Hubungkan profil belajar Anda untuk berpartisipasi di papan peringkat global.</p>
            <button 
              onClick={() => onNavigate('dashboard')} // Triggers modal by returning to dashboard
              className="w-full py-1.5 bg-teal-500 text-slate-950 font-sans text-xs font-bold uppercase rounded-lg shadow-md hover:bg-teal-400 transition-all cursor-pointer"
            >
              Masuk / Daftar
            </button>
          </div>
        )}
      </div>

      {currentUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: LEADERBOARD MAIN BOARD */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search and Category Filter Tabs */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border rounded-xl p-3.5 ${theme === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100/50 border-slate-300'}`}>
              
              {/* Tabs */}
              <div className={`inline-flex gap-1.5 rounded-lg p-1 border self-start sm:self-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                <button
                  onClick={() => setActiveTab('atom')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'atom'
                      ? 'bg-slate-800 text-teal-300 font-bold border border-slate-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Atom className="w-3.5 h-3.5 text-teal-400" />
                  <span>Skor Atom</span>
                </button>
                <button
                  onClick={() => setActiveTab('periodic')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'periodic'
                      ? 'bg-slate-800 text-teal-300 font-bold border border-slate-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Skor Periodik</span>
                </button>
                <button
                  onClick={() => setActiveTab('badges')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'badges'
                      ? 'bg-slate-800 text-teal-300 font-bold border border-slate-700/60 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Koleksi Lencana</span>
                </button>
              </div>

              {/* Search Box & Group Filter toggle */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari nama peneliti..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full border rounded-lg pl-9 pr-3 py-1.5 text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500/50 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-slate-100/60 border-slate-300 text-slate-900'}`}
                  />
                </div>
                
                {currentUser?.classCode && (
                  <button
                    type="button"
                    onClick={() => setFilterClassOnly(!filterClassOnly)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      filterClassOnly
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-extrabold shadow-sm'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-350 hover:border-slate-700'
                    }`}
                    title="Saring hanya teman sekelas"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Kelas: {currentUser.className || currentUser.classCode}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Main Ranking Table/List */}
            <div className={`border rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850/80' : 'bg-slate-100/40 border-slate-300'}`}>
              {loading ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-teal-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-550 font-mono">Mengunduh kalkulasi peringkat riset...</p>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <div className={`p-3.5 border rounded-full w-12 h-12 flex items-center justify-center mx-auto ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-500' : 'bg-slate-100/40 border-slate-300 text-slate-600'}`}>
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider pt-2">Data Tidak Ditemukan</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Belum ada peneliti lain yang mengunggah rekam jejak untuk kategori ini atau pencarian tidak cocok.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-900/75">
                  
                  {/* Table Header */}
                  <div className={`grid grid-cols-12 gap-3 px-5 py-3 text-[10px] font-mono font-black uppercase tracking-wider border-b ${theme === 'dark' ? 'text-slate-500 bg-slate-900/25 border-slate-900' : 'text-slate-600 bg-slate-100/25 border-slate-300'}`}>
                    <div className="col-span-2 text-center">PERINGKAT</div>
                    <div className="col-span-6">NAMA PENELITI</div>
                    <div className="col-span-4 text-right">CAPAIAN PRESTASI</div>
                  </div>

                  {/* Table Rows */}
                  {filteredProfiles.map((p, idx) => {
                    const rank = idx + 1;
                    const isMe = p.id === currentUser.id;

                    return (
                      <div 
                        key={p.id}
                        className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-all ${
                          isMe 
                            ? 'bg-teal-500/5 border-l-2 border-teal-400' 
                            : 'hover:bg-slate-900/20'
                        }`}
                      >
                        {/* Rank Badge Column */}
                        <div className="col-span-2 flex justify-center">
                          {getRankBadge(rank)}
                        </div>

                        {/* User Details */}
                        <div className="col-span-6 flex items-center gap-3">
                          <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center font-bold font-mono text-xs shadow-md border ${
                            isMe 
                              ? 'bg-teal-500 text-slate-950 border-teal-400' 
                              : p.completedMissions && p.completedMissions.length >= 7
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/25'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
                            {p.name.substring(0,2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-xs font-bold truncate max-w-[120px] sm:max-w-none block ${isMe ? 'text-teal-400 font-extrabold' : 'text-slate-250 hover:text-white'}`}>
                                {p.name}
                              </span>
                              <span className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[7.5px] font-mono uppercase border shrink-0 ${
                                p.role === 'guru'
                                  ? 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400 font-black'
                                  : 'bg-teal-500/15 border-teal-500/25 text-teal-400 font-black'
                              }`}>
                                {p.role === 'guru' ? 'Guru' : 'Siswa'}
                              </span>
                              {isMe && (
                                <span className="px-1 py-0.2 bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[8px] font-bold uppercase rounded">
                                  Anda
                                </span>
                              )}
                              {p.completedMissions && p.completedMissions.length >= 7 && (
                                <Flame className="w-3 h-3 text-orange-400 shrink-0 fill-orange-400/20" title="Quantum Master" />
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate font-mono">ID: {p.id.substring(0,8)}...</span>
                          </div>
                        </div>

                        {/* User Achievements */}
                        <div className="col-span-4 text-right">
                          {activeTab === 'atom' && (
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs font-black text-teal-400">
                                {p.atomHighscore || 0} pts
                              </span>
                              <p className="text-[9px] text-slate-500 font-mono">Skor Tertinggi Atom</p>
                            </div>
                          )}
                          {activeTab === 'periodic' && (
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs font-black text-amber-400">
                                {p.periodicHighscore || 0} pts
                              </span>
                              <p className="text-[9px] text-slate-500 font-mono">Akurasi Tebak Unsur</p>
                            </div>
                          )}
                          {activeTab === 'badges' && (
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs font-black text-indigo-400 flex items-center gap-1 justify-end">
                                <Award className="w-3.5 h-3.5 text-indigo-400" />
                                {p.completedMissions?.length || 0} / 7
                              </span>
                              <p className="text-[9px] text-slate-500 font-mono">Lencana Quantum Terbaca</p>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                  
                </div>
              )}
            </div>

            {/* Additional informational banner */}
            <div className={`p-4 border rounded-xl flex items-start gap-3 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-800/80' : 'bg-slate-100/30 border-slate-300'}`}>
              <Sparkles className="w-4 h-4 text-teal-404 text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white uppercase font-mono">Sinkronisasi Instan</h5>
                <p className="text-[10px] text-slate-400 leading-normal">Peringkat disinkronisasikan secara otomatis tiap kali Anda mencetak rekor skor baru atau memperoleh lencana bonus di Laboratorium Struktur Atom atau Tantangan Tabel Periodik.</p>
              </div>
            </div>

          </div>

          {/* RIGHT: REAL-TIME ACTIVITY STREAM TICKER */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className={`border rounded-xl p-4.5 space-y-4 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/10">
                    <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-black uppercase text-white tracking-wider">Aktivitas Real-Time</h3>
                    <p className="text-[9px] text-slate-500 font-mono">Ledger kegiatan laborat global</p>
                  </div>
                </div>
                
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              {/* Feed List */}
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {liveActivities.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <Clock className="w-5 h-5 mx-auto opacity-50 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <p className="text-[10px] font-mono">Menunggu transmisi log peneliti...</p>
                  </div>
                ) : (
                  liveActivities.map((act) => (
                    <div 
                      key={act.id}
                      className={`p-3 border rounded-xl space-y-2 transition-all ${theme === 'dark' ? 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-850 hover:border-slate-800' : 'bg-slate-100/40 hover:bg-slate-200 border-slate-300 hover:border-slate-400'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[10.5px] text-slate-200 hover:text-teal-350 truncate block max-w-[120px]">
                          {act.userName}
                        </span>
                        
                        <div className="flex items-center gap-1 text-[9px] text-slate-550 font-mono truncate">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>{formatTimeAgo(act.timestamp)}</span>
                        </div>
                      </div>

                      <div className={`p-1.5 border rounded-lg space-y-1 ${theme === 'dark' ? 'bg-slate-950/70 border-slate-850' : 'bg-slate-100/70 border-slate-300'}`}>
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1 rounded border text-xs shrink-0 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                            {getActivityIcon(act.activityType)}
                          </div>
                          <span className="text-[10px] font-mono text-teal-400 font-bold tracking-tight truncate block max-w-[150px]">
                            {act.title}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-normal pl-0.5">
                          {act.description}
                        </p>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* Prompt user to authenticate */
        <div className={`p-12 text-center border rounded-2xl max-w-lg mx-auto space-y-5 ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100/60 border-slate-300'}`}>
          <div className="mx-auto w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/10 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white uppercase font-mono tracking-wider">Akses Terkunci</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anda perlu masuk menggunakan akun peneliti terdaftar untuk mengakses data analisis papan peringkat serta melihat aktivitas sains berkala dari rekan kerja Anda secara langsung.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('dashboard')} // Send user to dashboard to log in/register
            className="px-5 py-2.5 bg-teal-500 text-slate-900 text-xs font-black uppercase rounded-lg shadow-md hover:bg-teal-400 cursor-pointer"
          >
            Hubungkan Akun Peneliti
          </button>
        </div>
      )}

    </div>
  );
}
