import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Megaphone, 
  Send, 
  Trash2, 
  Trophy, 
  TrendingUp, 
  Plus, 
  Award, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Search, 
  ChevronRight, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  FileText,
  CheckCircle2,
  Lock,
  GraduationCap
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { UserAccount, Classroom } from '../types';

interface TeacherPortalProps {
  theme?: 'dark' | 'light';
  currentUser: UserAccount | null;
  onNavigate: (view: string) => void;
}

interface StudentProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  atomHighscore: number;
  periodicHighscore: number;
  completedMissions: number[];
  updatedAt?: string;
  classCode?: string;
  className?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  timestamp: string;
  category: 'tugas' | 'pengumuman' | 'materi';
}

export interface StudentReport {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  topicId: string;
  topicTitle: string;
  objectives: string;
  theory: string;
  apparatus: string;
  observations: any[];
  conclusion: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  grade: number | null;
  teacherFeedback: string | null;
  gradedAt: string | null;
  teacherName: string | null;
  classCode?: string;
}

export default function TeacherPortal({ currentUser, onNavigate, theme = 'dark' }: TeacherPortalProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'announcements' | 'analytics' | 'classroom' | 'reports'>('roster');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('semua');
  
  // Create Classroom Form State
  const [newClassName, setNewClassName] = useState('');
  const [generatingClass, setGeneratingClass] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'tugas' | 'pengumuman' | 'materi'>('pengumuman');
  const [postingAnn, setPostingAnn] = useState(false);

  // Mock Student Creator State (for quick testing/demo)
  const [mockName, setMockName] = useState('');
  const [mockAtomSc, setMockAtomSc] = useState('120');
  const [mockPeriodicSc, setMockPeriodicSc] = useState('85');
  const [mockClassCode, setMockClassCode] = useState('');
  const [creatingMock, setCreatingMock] = useState(false);

  // Student reports evaluations state
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('90');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [submittingGrade, setSubmittingGrade] = useState<boolean>(false);

  // Handle classroom creation
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newClassName.trim()) {
      alert("Nama kelas tidak boleh kosong.");
      return;
    }

    setGeneratingClass(true);
    // Generate a unique dynamic code: e.g. CHEM-5F2A
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const classCode = `CHEM-${randomHex}`;

    try {
      await setDoc(doc(db, 'classrooms', classCode), {
        code: classCode,
        className: newClassName.trim(),
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        createdAt: new Date().toISOString()
      });

      // Post creation log to public pipeline
      const actId = 'act_cls_' + Date.now();
      await setDoc(doc(db, 'public_activities', actId), {
        id: actId,
        userId: currentUser.id,
        userName: currentUser.name,
        activityType: 'classroom_created',
        title: `Mendirikan Kelas Baru`,
        description: `Membuka ruang belajar digital "${newClassName.trim()}" (Kode: ${classCode})`,
        timestamp: new Date().toISOString()
      });

      setNewClassName('');
      alert(`Sukses mendirikan kelas "${newClassName.trim()}"!\n\nKode Kelas: ${classCode}\n\nSiswa Anda dapat mendaftar kode ini di Dashboard mereka untuk bergabung.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `classrooms/${classCode}`);
      alert("Gagal mendirikan kelas baru.");
    } finally {
      setGeneratingClass(false);
    }
  };

  // Handle classroom deletion
  const handleDeleteClassroom = async (classCode: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kelas (${classCode})? Tindakan ini akan menghapus entitas kelas dari portal.`)) return;
    try {
      await deleteDoc(doc(db, 'classrooms', classCode));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `classrooms/${classCode}`);
      alert("Gagal menghapus kelas.");
    }
  };

  // 1. Fetch all student profiles in real-time from public_profiles
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    
    const unsubscribe = onSnapshot(collection(db, 'public_profiles'), (snapshot) => {
      const list: StudentProfile[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Ignore profiles that are actually other teachers/gurus
        if (data.role !== 'guru') {
          list.push({
            id: doc.id,
            name: data.name || 'Siswa Tanpa Nama',
            avatarUrl: data.avatarUrl,
            atomHighscore: typeof data.atomHighscore === 'number' ? data.atomHighscore : 0,
            periodicHighscore: typeof data.periodicHighscore === 'number' ? data.periodicHighscore : 0,
            completedMissions: Array.isArray(data.completedMissions) ? data.completedMissions : [],
            updatedAt: data.updatedAt,
            classCode: data.classCode || '',
            className: data.className || ''
          });
        }
      });
      setStudents(list);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'public_profiles');
      setError("Gagal sinkronisasi data guru dengan server Firestore.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 1b. Fetch teacher-owned classrooms in real-time
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'classrooms'), (snapshot) => {
      const list: Classroom[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.teacherId === currentUser.id) {
          list.push({
            code: doc.id,
            className: data.className || 'Kelas Tanpa Nama',
            teacherId: data.teacherId || '',
            teacherName: data.teacherName || '',
            createdAt: data.createdAt || ''
          });
        }
      });
      setClassrooms(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'classrooms');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Read submitted student lab reports in real-time
  useEffect(() => {
    if (!currentUser) return;
    const reportRef = collection(db, 'student_reports');
    
    const unsubscribe = onSnapshot(reportRef, (snapshot) => {
      const list: StudentReport[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as StudentReport);
      });
      // Sort reports by submittedAt descending
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setReports(list);
    }, (err) => {
      console.error("Gagal membaca daftar laporan praktikum:", err);
      handleFirestoreError(err, OperationType.GET, 'student_reports');
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleGradeReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedReport) return;
    
    setSubmittingGrade(true);
    const reportRef = doc(db, 'student_reports', selectedReport.id);
    const scoreVal = parseInt(gradeInput, 10);
    
    try {
      await setDoc(reportRef, {
        ...selectedReport,
        status: 'graded',
        grade: scoreVal,
        teacherFeedback: feedbackInput.trim() || 'Laporan praktikum telah ditelaah dengan baik oleh guru.',
        teacherName: currentUser.name,
        gradedAt: new Date().toISOString()
      });

      // Post activity log to public pipeline
      const actId = 'act_eval_' + Date.now();
      await setDoc(doc(db, 'public_activities', actId), {
        id: actId,
        userId: currentUser.id,
        userName: currentUser.name,
        activityType: 'quiz_completed', // Consistent type
        title: 'Evaluasi Laporan Selesai',
        description: `Menilai laporan "${selectedReport.topicTitle}" milik ${selectedReport.studentName} dengan skor ${scoreVal}/100`,
        timestamp: new Date().toISOString()
      });

      alert(`Sukses mengirimkan nilai ${scoreVal}/100 dan umpan balik ke siswa!`);
      setSelectedReport(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `student_reports/${selectedReport.id}`);
      alert("Gagal memublikasikan penilaian.");
    } finally {
      setSubmittingGrade(false);
    }
  };

  // 2. Fetch announcements in real-time
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'class_announcements'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Announcement);
      });
      setAnnouncements(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'class_announcements');
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle post announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!annTitle.trim() || !annContent.trim()) {
      alert("Judul dan isi pengumuman tidak boleh kosong.");
      return;
    }

    setPostingAnn(true);
    const id = 'ann_' + Date.now();
    try {
      await setDoc(doc(db, 'class_announcements', id), {
        id,
        title: annTitle.trim(),
        content: annContent.trim(),
        category: annCategory,
        authorName: currentUser.name,
        timestamp: new Date().toISOString()
      });
      
      // Post activity to public timeline about this announcement too!
      const actId = 'act_ann_' + Date.now();
      await setDoc(doc(db, 'public_activities', actId), {
        id: actId,
        userId: currentUser.id,
        userName: currentUser.name,
        activityType: 'announcement',
        title: `Pengumuman Kelas Baru`,
        description: `Mempublikasikan info berkala: ${annTitle.trim().substring(0, 30)}...`,
        timestamp: new Date().toISOString()
      });

      // Clear input form
      setAnnTitle('');
      setAnnContent('');
      setAnnCategory('pengumuman');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `class_announcements/${id}`);
      alert("Gagal mengunggah pengumuman kelas.");
    } finally {
      setPostingAnn(false);
    }
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengumuman kelas ini?")) return;
    try {
      await deleteDoc(doc(db, 'class_announcements', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `class_announcements/${id}`);
      alert("Gagal menghapus pengumuman.");
    }
  };

  // Create mock student profile for demonstration and testing of global sync features
  const handleCreateMockStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName.trim()) return;

    setCreatingMock(true);
    const mockId = 'stub_student_' + Math.floor(Math.random() * 10000);
    const atomScInt = parseInt(mockAtomSc, 10) || 0;
    const periodicScInt = parseInt(mockPeriodicSc, 10) || 0;
    
    const chosenClass = classrooms.find(c => c.code === mockClassCode);
    const classNameVal = chosenClass ? chosenClass.className : '';

    try {
      // Create global public profile with simulation classroom
      await setDoc(doc(db, 'public_profiles', mockId), {
        id: mockId,
        name: mockName.trim(),
        role: 'siswa',
        atomHighscore: atomScInt,
        periodicHighscore: periodicScInt,
        completedMissions: [1, 2, 4], // Give some random unlocked missions
        classCode: mockClassCode,
        className: classNameVal,
        updatedAt: new Date().toISOString()
      });

      // Let's also create an activity log for this simulated student
      const activityId = 'act_sim_' + Date.now();
      await setDoc(doc(db, 'public_activities', activityId), {
        id: activityId,
        userId: mockId,
        userName: mockName.trim(),
        activityType: 'highscore',
        title: 'Mencetak Rekor Baru',
        description: `Berhasil menyelesaikan tantangan struktur atom dengan skor tertinggi ${atomScInt}`,
        timestamp: new Date().toISOString()
      });

      setMockName('');
      alert(`Berhasil membuat data uji siswa "${mockName.trim()}"! Terdaftar pada kelas: ${classNameVal || 'Mandiri (Tanpa Kelas)'}. Data langsung tersinkron secara real-time.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `public_profiles/${mockId}`);
      alert("Gagal membuat profil simulasi siswa.");
    } finally {
      setCreatingMock(false);
    }
  };

  // Filter students matching searchQuery AND selectedClassFilter
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedClassFilter !== 'semua') {
      return matchesSearch && student.classCode === selectedClassFilter;
    }
    return matchesSearch;
  });

  // Math Statistics (Dynamically reflects the active filtered classroom)
  const totalStudents = filteredStudents.length;
  const avgAtomScore = filteredStudents.length 
    ? Math.round(filteredStudents.reduce((acc, s) => acc + (s.atomHighscore || 0), 0) / filteredStudents.length)
    : 0;
  const avgPeriodicScore = filteredStudents.length 
    ? Math.round(filteredStudents.reduce((acc, s) => acc + (s.periodicHighscore || 0), 0) / filteredStudents.length)
    : 0;
  const totalUnlockedBadges = filteredStudents.reduce((acc, s) => acc + (s.completedMissions?.length || 0), 0);

  // List of all active quantum missions context mapping
  const missionLabels = [
    "Ubah Protons / Hidrogen standar",
    "Ubah Protons demi Helium-4 stabil",
    "Konstruksikan Litium kation positif",
    "Rangka Karbon-12 murni sempurna",
    "Synthesize Oksigen-16 netral stabil",
    "Ciptakan Isotop Neon-20 stabil",
    "Ubah Protons ke Natrium fasa berat"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-sans animate-fade-in">
      
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-r from-teal-950/50 via-slate-900/70 to-indigo-950/40 border border-teal-500/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-teal-500/10 border border-teal-500/15 rounded-full text-teal-400 font-mono text-[10px] uppercase font-black tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>KONSOL GURU / MONITORING</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Portal Pengawasan Guru</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Kelola pengumuman kelas, pantau capaian prestasi individu siswa saat mendesain struktur atom, dan selidiki statistik kuis berkala secara real-time.
          </p>
        </div>

        <div className={`p-3 border border-indigo-500/35 rounded-xl space-y-2 w-full md:w-[220px] shrink-0 ${theme === 'dark' ? 'bg-slate-950/70' : 'bg-slate-100/70'}`}>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-mono text-indigo-400 font-black tracking-wider uppercase">Pendidik Terverifikasi</span>
          </div>
          <p className="text-xs text-slate-100 font-bold truncate">{currentUser ? currentUser.name : 'Peneliti Kimia'}</p>
          <p className="text-[10px] text-indigo-450 font-mono">Peran: Pendidik (Guru)</p>
        </div>
      </div>

      {/* Main Grid: Statistics dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Stat Card 1 */}
        <div className={`p-4 border rounded-xl space-y-1 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
          <p className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-wider">TOTAL SISWA AKTIF</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalStudents}</span>
            <span className="text-[10px] text-teal-400 font-mono">Peneliti</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className={`p-4 border rounded-xl space-y-1 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
          <p className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-wider">RETA-RETA SKOR ATOM</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-400 font-mono">{avgAtomScore}</span>
            <span className="text-[10px] text-slate-500 font-mono">Pts</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className={`p-4 border rounded-xl space-y-1 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
          <p className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-wider">RETA-RETA SKOR PERIODIK</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{avgPeriodicScore}</span>
            <span className="text-[10px] text-slate-500 font-mono">Pts</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className={`p-4 border rounded-xl space-y-1 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
          <p className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-wider">LENCANA SISWA TERBUKA</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-400 font-mono">{totalUnlockedBadges}</span>
            <span className="text-[10px] text-slate-500 font-mono">Lencana</span>
          </div>
        </div>

      </div>

      {/* Control Tabs switcher */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border rounded-xl p-3 ${theme === 'dark' ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-100/60 border-slate-300'}`}>
        <div className={`inline-flex flex-wrap gap-1.5 rounded-lg p-1 border ${theme === 'dark' ? 'bg-slate-900 border-slate-850/80' : 'bg-slate-100 border-slate-300'}`}>
          
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-slate-800 text-teal-350 font-bold border border-slate-700/60 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>Daftar Siswa &amp; Rekor</span>
          </button>
          
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'announcements'
                ? 'bg-slate-800 text-teal-350 font-bold border border-slate-700/60 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Papan Pengumuman Kelas</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-teal-350 font-bold border border-slate-700/60 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Analisis Kurva Rerata</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'classroom'
                ? 'bg-slate-800 text-teal-350 font-bold border border-slate-700/60 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-pink-400" />
            <span>Kelola Kelas &amp; Kode</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-teal-350 font-bold border border-slate-700/60 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Evaluasi Laporan ({reports.filter(r => r.status === 'pending').length})</span>
          </button>

        </div>

        {/* Filters/Search block based on selected tabs */}
        {activeTab === 'roster' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Dropdown Filter Kelas */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className={`border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500/40 cursor-pointer font-mono ${theme === 'dark' ? 'bg-slate-905 bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 bg-slate-100 border-slate-300 text-slate-900'}`}
            >
              <option value="semua">📂 Semua Kelas</option>
              {classrooms.map((cls) => (
                <option key={cls.code} value={cls.code}>
                  🏫 {cls.className} ({cls.code})
                </option>
              ))}
            </select>

            {/* Search Input field */}
            <div className="relative max-w-xs w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-lg pl-9 pr-3 py-1.5 text-xs placeholder-slate-550 focus:outline-none focus:border-teal-500/40 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tab Panels content rendering area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* MAIN PANEL CONTENT (LEFT 8 SPAN OR 12 IF NO STUDENT SELECTED) */}
        <div className={`col-span-12 ${selectedStudent && activeTab === 'roster' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          
          {/* TAB 1: ROSTER & RECORD LIST */}
          {activeTab === 'roster' && (
            <div className={`border rounded-xl overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
              <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-slate-900 bg-slate-900/10' : 'border-slate-300 bg-slate-100/10'}`}>
                <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-400" />
                  <span>Daftar Nilai Siswa Tersinkronisasi</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">Mencakup {filteredStudents.length} Akun</span>
              </div>

              {loading ? (
                <div className="p-16 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-teal-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-550 font-mono">Mengunduh portofolio siswa dari Firestore...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-16 text-center space-y-2">
                  <Users className="w-10 h-10 text-slate-700 mx-auto" />
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider pt-2">Database Kosong</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Gunakan formulir simulator di pojok kanan untuk membuat "Siswa Simulasi" instan untuk keperluan demonstrasi atau pengujian.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-900/75">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudent?.id === student.id;
                    const completionRate = Math.round(((student.completedMissions?.length || 0) / 7) * 100);

                    return (
                      <div 
                        key={student.id}
                        onClick={() => setSelectedStudent(isSelected ? null : student)}
                        className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-teal-500/5 border-l-2 border-teal-400' 
                            : 'hover:bg-slate-900/25'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-black font-mono text-xs ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                            {student.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[260px] flex items-center gap-1.5 flex-wrap">
                              <span>{student.name}</span>
                              {student.className && (
                                <span className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[8px] font-bold rounded uppercase">
                                  {student.className}
                                </span>
                              )}
                            </h4>
                            <p className="text-[9px] text-slate-550 font-mono truncate">ID: {student.id}</p>
                            
                            {/* Visual Miniature progress bar */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className={`w-16 rounded-full h-1 overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                <div className="bg-gradient-to-r from-teal-500 to-indigo-500 h-1 rounded-full" style={{ width: `${completionRate}%` }} />
                              </div>
                              <span className="text-[8.5px] font-mono font-bold text-teal-400">{completionRate}% Lencana</span>
                            </div>
                          </div>
                        </div>

                        {/* Student Scores */}
                        <div className="flex items-center gap-6 text-right shrink-0">
                          <div>
                            <p className="text-[8px] font-mono text-slate-550 uppercase font-black">Score Atom</p>
                            <span className="font-mono text-xs font-black text-sky-400">
                              {student.atomHighscore || 0}
                            </span>
                          </div>
                          <div>
                            <p className="text-[8px] font-mono text-slate-550 uppercase font-black">Score Periodik</p>
                            <span className="font-mono text-xs font-black text-amber-500">
                              {student.periodicHighscore || 0}
                            </span>
                          </div>
                          
                          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-teal-400' : ''}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENTS BOARD MANAGER */}
          {activeTab === 'announcements' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Publisher Board */}
              <div className={`md:col-span-5 border rounded-xl p-5 space-y-4 self-start ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Megaphone className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Terbitan Baru</h3>
                </div>

                <form onSubmit={handlePostAnnouncement} className="space-y-4.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold font-mono">Judul Pengumuman</label>
                    <input
                      type="text"
                      placeholder="e.g. Ujian Praktikum Struktur Atom"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold font-mono">Kategori Informasi</label>
                    <select
                      value={annCategory}
                      onChange={(e: any) => setAnnCategory(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                    >
                      <option value="pengumuman">📢 Informasi / Pengumuman</option>
                      <option value="tugas">📝 Tugas Praktikum Mandiri</option>
                      <option value="materi">🧪 Bacaan Materi Suplemen</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold font-mono">Isi Pesan Detail</label>
                    <textarea
                      placeholder="Tuliskan arahan laboratorium lengkap untuk seluruh siswa di kelas Anda..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      rows={4}
                      className={`w-full border rounded-lg p-2.5 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={postingAnn}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{postingAnn ? 'Mengirim...' : 'Menebar Pengumuman'}</span>
                  </button>
                </form>
              </div>

              {/* Published Stream and History */}
              <div className="md:col-span-7 space-y-4">
                <div className={`border rounded-xl p-5 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                  <div className="pb-3 border-b border-slate-900 flex justify-between items-center mb-4">
                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Histori Informasi Kelas</h3>
                    <span className={`px-2 py-0.5 border rounded text-[9px] font-mono text-indigo-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                      {announcements.length} Aktif
                    </span>
                  </div>

                  {announcements.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Megaphone className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
                      <p className="text-xs">Belum ada instruksi atau pengumuman kelas yang dipublikasikan.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                      {announcements.map((ann) => (
                        <div key={ann.id} className={`p-4 border rounded-xl space-y-3 relative group ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                          
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className={`absolute top-3.5 right-3.5 p-1.5 border hover:border-rose-500/30 hover:text-rose-450 rounded-md transition-all cursor-pointer hover:bg-rose-500/5 ${theme === 'dark' ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-slate-100/70 border-slate-300 text-slate-600'}`}
                            title="Hapus Pengumuman"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>

                          <div className="space-y-1 max-w-[85%]">
                            <div className="flex items-center gap-2">
                              {ann.category === 'tugas' ? (
                                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[8.5px] font-black uppercase rounded">TUGAS</span>
                              ) : ann.category === 'materi' ? (
                                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-500 font-mono text-[8.5px] font-black uppercase rounded">MATERI</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/25 text-teal-400 font-mono text-[8.5px] font-black uppercase rounded">PENGUMUMAN</span>
                              )}
                              <span className="text-[10px] text-slate-550 font-mono">
                                {new Date(ann.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className="text-xs font-extrabold text-white leading-snug">{ann.title}</h4>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed pr-2 whitespace-pre-wrap">{ann.content}</p>
                          
                          <div className="border-t border-slate-950 pt-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
                              <span className="font-bold">Oleh:</span>
                              <span className="text-slate-400 italic font-black">{ann.authorName}</span>
                            </div>
                            <span className="text-[8.5px] font-mono text-slate-600 uppercase font-black">ID: {ann.id}</span>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CURVE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className={`border rounded-xl p-6 space-y-6 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
              <div className="space-y-1 border-b border-slate-900 pb-4">
                <h3 className="text-sm font-bold text-white uppercase font-mono">Distribusi &amp; Pemahaman Kurva Kelas</h3>
                <p className="text-xs text-slate-450 leading-relaxed">Gambaran metrik terpadu untuk pemantauan tingkat penyerapan pembelajaran sains kimia siswa di seluruh tantangan simulasi.</p>
              </div>

              {students.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Tidak ada data analisis pemahaman siswa karena daftar siswa masih kosong.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Performance Bracket Column */}
                  <div className={`p-4 border rounded-xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-850' : 'bg-slate-100/30 border-slate-300'}`}>
                    <h4 className="text-xs font-bold text-teal-400 uppercase font-mono flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-teal-400" />
                      <span>Distribusi Rentang Skor Atom</span>
                    </h4>
                    
                    {/* Visual brackets bar charts simulated based on real records */}
                    <div className="space-y-3.5 pt-2">
                      {[
                        { bracket: "Master (Score 150+)", count: students.filter(s => s.atomHighscore >= 150).length, color: "bg-teal-400" },
                        { bracket: "Tinggi (Score 100 - 149)", count: students.filter(s => s.atomHighscore >= 100 && s.atomHighscore < 150).length, color: "bg-indigo-400" },
                        { bracket: "Menengah (Score 50 - 99)", count: students.filter(s => s.atomHighscore >= 50 && s.atomHighscore < 100).length, color: "bg-amber-400" },
                        { bracket: "Rendah (Score < 50)", count: students.filter(s => s.atomHighscore < 50).length, color: "bg-rose-500" }
                      ].map((item, idx) => {
                        const pctOfTotal = totalStudents ? Math.round((item.count / totalStudents) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-slate-300 font-bold">{item.bracket}</span>
                              <span className="text-slate-450">{item.count} Siswa ({pctOfTotal}%)</span>
                            </div>
                            <div className={`w-full rounded-full h-2 overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                              <div className={`${item.color} h-2 rounded-full`} style={{ width: `${pctOfTotal}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badges Popularity */}
                  <div className={`p-4 border rounded-xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/30 border-slate-850' : 'bg-slate-100/30 border-slate-300'}`}>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase font-mono flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span>Popularitas Penyelesai Lencana</span>
                    </h4>

                    {/* Badge metrics of entire class */}
                    <div className="space-y-3.5 pt-2">
                      {[1, 2, 4, 7].map((badgeId) => {
                        const countCompleted = students.filter(s => s.completedMissions?.includes(badgeId)).length;
                        const pctVal = totalStudents ? Math.round((countCompleted / totalStudents) * 100) : 0;
                        const badgeName = badgeId === 1 ? 'Lencana Hidrogen' : badgeId === 2 ? 'Lencana Helium' : badgeId === 4 ? 'Lencana Karbon-12' : 'Lencana Natrium fasa';
                        return (
                          <div key={badgeId} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-slate-300 font-bold">{badgeName} (ID: {badgeId})</span>
                              <span className="text-indigo-400 font-bold">{countCompleted} Penyelesai ({pctVal}%)</span>
                            </div>
                            <div className={`w-full rounded-full h-1.5 overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pctVal}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLASSROOM MANAGER */}
          {activeTab === 'classroom' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Creator Form */}
              <div className={`md:col-span-12 lg:col-span-5 border rounded-xl p-5 space-y-4 self-start ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Plus className="w-4 h-4 text-pink-400" />
                  <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Mendirikan Kelas Baru</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Buat grup belajar virtual untuk siswa Anda. Setelah dirilis, sistem akan menghasilkan kode acak 6-digit yang dapat didistribusikan kepada peserta didik.
                </p>

                <form onSubmit={handleCreateClassroom} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold font-mono">Nama Ruang / Kelas</label>
                    <input
                      type="text"
                      placeholder="e.g. Kelas XI MIPA 5"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-xs placeholder-slate-600 focus:outline-none focus:border-pink-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={generatingClass}
                    className="w-full py-2.5 bg-pink-600 hover:bg-pink-555 text-white font-black text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:bg-pink-500"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-white" />
                    <span>{generatingClass ? 'Merembuk ID Kelas...' : 'Terbitkan Kode Kelas'}</span>
                  </button>
                </form>
              </div>

              {/* Classroom list and actions */}
              <div className="md:col-span-12 lg:col-span-7 space-y-4">
                <div className={`border rounded-xl p-5 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                  <div className="pb-3 border-b border-slate-900 flex justify-between items-center mb-4">
                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Grup Kelas Terdaftar</h3>
                    <span className={`px-2 py-0.5 border rounded text-[9px] font-mono text-pink-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                      {classrooms.length} Kelas Aktif
                    </span>
                  </div>

                  {classrooms.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <GraduationCap className="w-8 h-8 mx-auto opacity-30 text-pink-400" />
                      <p className="text-xs text-slate-450 leading-relaxed">Anda belum merilis grup kelas virtual mana pun.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {classrooms.map((cls) => {
                        const countClassStudents = students.filter(s => s.classCode === cls.code).length;
                        return (
                          <div key={cls.code} className={`p-4 border rounded-xl flex items-center justify-between gap-4 relative group ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                            
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-extrabold text-white leading-none">{cls.className}</h4>
                                <span className="px-2 py-0.5 bg-pink-550/10 border border-pink-500/20 text-pink-400 font-mono text-[9px] font-bold rounded uppercase">
                                  {cls.code}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-450 font-mono flex items-center gap-1">
                                <span>Diarsipkan: {new Date(cls.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                <span>•</span>
                                <span className="text-teal-400 font-bold">{countClassStudents} Siswa Terdaftar</span>
                              </p>
                            </div>

                            <button
                              onClick={() => handleDeleteClassroom(cls.code)}
                              className={`p-1.5 border hover:border-rose-500/30 hover:text-rose-450 rounded-md transition-all cursor-pointer hover:bg-rose-500/5 focus:outline-none ${theme === 'dark' ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-slate-100/70 border-slate-300 text-slate-600'}`}
                              title="Bubarkan Kelas"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* SIDEBAR ANALYSIS CARDS & CREATORS (RIGHT 4 SPAN IF ROSTER OR ANNOUNCEMENT MODE) */}
        
        {/* Sub-Widget: Specific Student profile inspector */}
        {selectedStudent && activeTab === 'roster' && (
          <div className={`col-span-12 lg:col-span-5 border rounded-xl p-5 space-y-5 self-start animate-fade-in ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
            <div className="flex justify-between items-start border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Investigasi Akademis</h3>
                <p className="text-[9.5px] text-slate-500 font-mono">Analisis rekam jejak riset individu</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className={`text-[10px] font-mono px-2 py-0.5 border rounded cursor-pointer ${theme === 'dark' ? 'text-slate-500 hover:text-white bg-slate-900 border-slate-850' : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-300'}`}
              >
                Tutup [x]
              </button>
            </div>

            {/* Visual highlight stats CARD */}
            <div className={`p-4 border border-teal-500/10 rounded-xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-100/60'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-extrabold text-sm border-2 border-teal-400">
                  {selectedStudent.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{selectedStudent.name}</h4>
                  <p className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">ID: {selectedStudent.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-950">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-100/50'}`}>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Highscore Atom</span>
                  <span className="font-mono text-sm font-black text-sky-400">{selectedStudent.atomHighscore || 0} pts</span>
                </div>
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-slate-100/50'}`}>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Akurasi Periodik</span>
                  <span className="font-mono text-sm font-black text-amber-500">{selectedStudent.periodicHighscore || 0} pts</span>
                </div>
              </div>
            </div>

            {/* Completed Lencana list */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span>AKSES LENCANA QUANTUM ({selectedStudent.completedMissions?.length || 0} / 7)</span>
              </h4>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7].map((badgeId) => {
                  const isUnlocked = selectedStudent.completedMissions?.includes(badgeId);
                  return (
                    <div 
                      key={badgeId}
                      className={`p-2 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                        isUnlocked 
                          ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-300' 
                          : 'bg-slate-900/20 border-slate-900 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black font-mono shrink-0 ${
                          isUnlocked ? 'bg-indigo-500 text-slate-950' : 'bg-slate-950 text-slate-700'
                        }`}>
                          {badgeId}
                        </div>
                        <span className="truncate font-medium">{missionLabels[badgeId - 1]}</span>
                      </div>
                      
                      {isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sync Timestamp logs */}
            {selectedStudent.updatedAt && (
              <div className="flex items-center gap-1.5 justify-end font-mono text-[9px] text-slate-600">
                <Clock className="w-3.5 h-3.5" />
                <span>Terakhir aktif: {new Date(selectedStudent.updatedAt).toLocaleString('id-ID')}</span>
              </div>
            )}

          </div>
        )}

        {/* Sub-Widget: Simulated Sandbox Student profile injector (Always visible on bottom/right of Roster Tab for testing ease) */}
        {activeTab === 'roster' && !selectedStudent && (
          <div className={`col-span-12 lg:col-span-4 border rounded-xl p-5 space-y-4 self-start ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Simulator Akun Siswa</h3>
            </div>

            <p className="text-[10px] text-slate-450 leading-relaxed">Gunakan sandbox ini untuk membuat user tiruan. Skor tiruan akan dimasukkan ke database global sehingga Anda bisa memvalidasi logika sinkronisasi, leaderboard, serta dashboard monitoring secara real-time.</p>

            <form onSubmit={handleCreateMockStudent} className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 uppercase font-bold font-mono">Nama Siswa Simulasi</label>
                <input
                  type="text"
                  placeholder="e.g. Raditya Wahono"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs placeholder-slate-600 focus:outline-none focus:border-teal-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold font-mono">Simulasi skor Atom</label>
                  <input
                    type="number"
                    value={mockAtomSc}
                    onChange={(e) => setMockAtomSc(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-teal-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold font-mono">Skor Periodik</label>
                  <input
                    type="number"
                    value={mockPeriodicSc}
                    onChange={(e) => setMockPeriodicSc(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-teal-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>

              {classrooms.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-bold font-mono">Pilih Kelompok Kelas</label>
                  <select
                    value={mockClassCode}
                    onChange={(e) => setMockClassCode(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-teal-400 font-mono cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  >
                    <option value="">-- Mandiri / Tanpa Kelas --</option>
                    {classrooms.map((cls) => (
                      <option key={cls.code} value={cls.code}>
                        🏫 {cls.className} ({cls.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={creatingMock}
                className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-[10.5px] uppercase rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {creatingMock ? 'Mengunggah Siswa...' : 'Inject Real-Time User'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: REPORTS MANAGER TAB */}
        {activeTab === 'reports' && (
          <div className="col-span-12 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: List of submittals */}
              <div className={`lg:col-span-5 border rounded-xl p-5 space-y-4 ${theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Berkas Laporan Masuk</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Daftar lembar kerja siswa yang diajukan</p>
                  </div>
                  <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-350 text-[10px] rounded font-mono font-bold">
                    Total: {reports.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {reports.map((rep) => {
                    const isSelected = selectedReport?.id === rep.id;
                    const formattedDate = new Date(rep.submittedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    return (
                      <div 
                        key={rep.id}
                        onClick={() => {
                          setSelectedReport(rep);
                          setGradeInput(rep.grade !== null ? rep.grade.toString() : '90');
                          setFeedbackInput(rep.teacherFeedback || '');
                        }}
                        className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all hover:bg-slate-900 ${
                          isSelected 
                            ? 'bg-sky-500/5 border-sky-500/45 ring-1 ring-sky-500/20' 
                            : 'bg-slate-900/40 border-slate-850 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wide">
                            {rep.studentClass || 'Siswa Mandiri'}
                          </span>
                          {rep.status === 'graded' ? (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 font-mono font-bold text-[9px] rounded">
                              ✓ {rep.grade} / 100
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/35 text-amber-400 font-mono font-bold text-[9px] rounded animate-pulse">
                              ⏳ MENUNGGU REVIEW
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white truncate">{rep.studentName}</h4>
                        <p className="text-[10.5px] text-zinc-400 font-medium truncate mt-0.5">{rep.topicTitle}</p>
                        
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-2.5 pt-2 border-t border-slate-950/40">
                          <span>Kirim: {formattedDate}</span>
                          {rep.classCode && (
                            <span className="text-slate-400 uppercase font-black">KELAS: {rep.classCode}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {reports.length === 0 && (
                    <div className="py-12 text-center text-slate-550 border border-dashed border-slate-900 rounded-lg space-y-1.5">
                      <FileText className="w-8 h-8 text-slate-700 mx-auto" />
                      <p className="text-xs font-mono">Belum ada laporan yang diajukan oleh siswa.</p>
                      <p className="text-[10px] text-slate-650 max-w-xs mx-auto">Siswa dapat menggunakan tombol "Ajukan Resmi ke Guru" pada modul Virtual Lab Report untuk mengirim draf evaluasi.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Detailed review & grading deck */}
              <div className="lg:col-span-7 space-y-6">
                {selectedReport ? (
                  <div className="space-y-6">
                    {/* Lab Report Display Sheet */}
                    <div className={`border rounded-xl p-6 shadow-xl space-y-5 ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                        <div>
                          <span className="text-[10px] font-mono text-teal-400 font-black tracking-widest uppercase">CHEMVIBE INDONESIA • LEMBAR JAWABAN SISWA</span>
                          <h2 className="text-sm font-black text-white mt-1 uppercase">LAPORAN RESMI PRAKTIKUM</h2>
                        </div>
                        <span className={`px-2.5 py-1 border font-mono text-[9px] rounded ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                          TOPIC ID: {selectedReport.topicId}
                        </span>
                      </div>

                      {/* Header details block */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-500 border-b border-slate-900 pb-3">
                        <div>
                          <div>NAMA PRAKTIKAN: <span className="text-white font-bold">{selectedReport.studentName}</span></div>
                          <div>KELAS KELOMPOK: <span className="text-white font-bold">{selectedReport.studentClass}</span></div>
                        </div>
                        <div className="text-right">
                          <div>STATUS DRAF: <span className={selectedReport.status === 'graded' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{selectedReport.status === 'graded' ? 'GRADED' : 'PENDING'}</span></div>
                          <div>DIAJUKAN PADA: <span className="text-teal-400 font-bold">{new Date(selectedReport.submittedAt).toLocaleDateString('id-ID')}</span></div>
                        </div>
                      </div>

                      {/* Report text components */}
                      <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                        <div className="space-y-1">
                          <h4 className="font-mono font-black text-white tracking-widest uppercase text-[10px]">I. TUJUAN PRAKTIKUM</h4>
                          <p className="pl-3 border-l border-slate-900 italic text-zinc-400">{selectedReport.objectives}</p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-mono font-black text-white tracking-widest uppercase text-[10px]">II. DASAR TEORI</h4>
                          <p className="pl-3 border-l border-slate-900 text-justify">{selectedReport.theory}</p>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-mono font-black text-white tracking-widest uppercase text-[10px]">III. ALAT &amp; BAHAN</h4>
                          <p className="pl-3 border-l border-slate-900 whitespace-pre-line text-zinc-400 font-mono text-[10.5px] leading-relaxed">{selectedReport.apparatus}</p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-mono font-black text-white tracking-widest uppercase text-[10px]">IV. TABEL DATA OBSERVASI</h4>
                          <div className="border border-slate-905 border-slate-900 rounded-lg overflow-hidden">
                            <table className="w-full text-[10.5px] text-left">
                              <thead>
                                <tr className={`text-[9px] font-mono border-b ${theme === 'dark' ? 'bg-slate-900/60 text-slate-450 border-slate-900' : 'bg-slate-100/60 text-slate-600 border-slate-300'}`}>
                                  <th className="p-2">Variabel Percobaan</th>
                                  <th className="p-2">Hasil Ukur</th>
                                  <th className="p-2">Satuan</th>
                                  <th className="p-2">Catatan Analitis</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedReport.observations?.map((row, idx) => (
                                  <tr key={idx} className={`border-b last:border-0 ${theme === 'dark' ? 'border-slate-900/50 hover:bg-slate-900/20' : 'border-slate-300 hover:bg-slate-200'}`}>
                                    <td className="p-2 font-bold text-white">{row.variable}</td>
                                    <td className="p-2 font-mono text-teal-400 font-semibold">{row.value}</td>
                                    <td className="p-2 text-zinc-400">{row.unit}</td>
                                    <td className="p-2 text-zinc-400 truncate max-w-xs">{row.notes}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-mono font-black text-white tracking-widest uppercase text-[10px]">V. KESIMPULAN &amp; PENUTUP</h4>
                          <p className="pl-3 border-l border-slate-900 text-justify">{selectedReport.conclusion}</p>
                        </div>
                      </div>
                    </div>

                    {/* Teacher grading control card */}
                    <div className={`border p-5 rounded-xl space-y-4 shadow-xl ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                        <Award className="w-4 h-4 text-sky-400" />
                        <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">PANEL EVALUASI DAN PENILAIAN</h3>
                      </div>

                      <form onSubmit={handleGradeReport} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          
                          {/* Score selector */}
                          <div className="md:col-span-1 space-y-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold font-mono">SKOR (0-100)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={gradeInput}
                              onChange={(e) => setGradeInput(e.target.value)}
                              className={`w-full border rounded-lg p-2.5 text-sm text-teal-400 font-mono font-black text-center focus:outline-none focus:border-teal-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'}`}
                              required
                            />
                          </div>

                          {/* Quick response selectors */}
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] text-slate-400 uppercase font-bold font-mono">Tanggapan Cepat</label>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'Data presisi & analisis logis',
                                'Karakteristik kuantum komputasi baik',
                                'Sangat akurat, tingkatkan bagian teori',
                                'Tabel lengkap, penyimpulan rasional'
                              ].map((resp) => (
                                <button
                                  key={resp}
                                  type="button"
                                  onClick={() => setFeedbackInput(resp)}
                                  className={`px-2.5 py-1 hover:bg-slate-850 border text-[10px] rounded-md transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-900 hover:text-white border-slate-850 text-slate-450' : 'bg-slate-100 hover:text-slate-900 border-slate-300 text-slate-600'}`}
                                >
                                  {resp}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* Custom feedback input */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 uppercase font-bold font-mono">Ulasan &amp; Masukan Guru</label>
                          <textarea
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            rows={3}
                            placeholder="Tuliskan ulasan penilaian dan koreksi akademis di sini..."
                            className={`w-full border rounded-lg p-3 text-xs placeholder-slate-650 focus:outline-none focus:border-teal-400 leading-relaxed ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                            required
                          />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(null)}
                            className={`px-4 py-2.5 hover:bg-slate-850 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-300'}`}
                          >
                            Tutup Inspector
                          </button>
                          
                          <button
                            type="submit"
                            disabled={submittingGrade}
                            className="flex-1 py-2.5 bg-gradient-to-r from-sky-400 to-teal-500 hover:from-sky-505 hover:to-teal-600 text-slate-950 hover:text-white text-xs font-black uppercase rounded-lg transition-all cursor-pointer disabled:opacity-50 text-center flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{submittingGrade ? 'Sedang Menyimpan...' : 'Sahkan & Publikasikan Nilai'}</span>
                          </button>
                        </div>
                      </form>
                    </div>

                  </div>
                ) : (
                  <div className={`h-full flex flex-col items-center justify-center border rounded-xl p-10 text-center border-dashed space-y-2 ${theme === 'dark' ? 'bg-slate-950/20 border-slate-900 text-slate-550' : 'bg-slate-100/20 border-slate-300 text-slate-600'}`}>
                    <FileText className="w-10 h-10 text-slate-800" />
                    <h3 className="text-xs font-mono font-black text-slate-400 uppercase">INSPECTOR LAPORAN</h3>
                    <p className="text-[11px] max-w-sm leading-relaxed">Silakan pilih salah satu berkas laporan siswa di kolom sebelah kiri untuk mengulas tabel observasi, rumusan teori ilmiah, serta memberikan evaluasi nilai nominal secara real-time.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
