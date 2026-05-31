import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Award, 
  Lightbulb, 
  ChevronRight, 
  Brain,
  MessageSquare,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
  Play,
  Check
} from 'lucide-react';

interface AdaptiveFeedbackWidgetProps {
  activeView: string;
}

interface FeedbackRuleResult {
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  concept: string;
}

interface Challenge {
  id: string;
  title: string;
  condition: string;
  points: number;
  checkFn: (state: any) => boolean;
  hint: string;
}

export default function AdaptiveFeedbackWidget({ activeView }: AdaptiveFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [localState, setLocalState] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});
  const [activeHintId, setActiveHintId] = useState<string | null>(null);

  // Sound play helper
  const triggerAudioFeedback = (type: 'win' | 'hint' | 'click') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.setValueAtTime(300, now + 0.05);
        g.gain.setValueAtTime(0.05, now);
        g.gain.linearRampToValueAtTime(0, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
      } else if (type === 'hint') {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.setValueAtTime(659, now + 0.08); // E5
        g.gain.setValueAtTime(0.06, now);
        g.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'win') {
        const notes = [523.25, 587.33, 659.25, 783.99, 1046.50]; // C5, D5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.08, now + idx * 0.08);
          g.gain.linearRampToValueAtTime(0, now + idx * 0.08 + 0.2);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.25);
        });
      }
    } catch (_) {}
  };

  // Convert activeView to friendly Indonesian title
  const getLabTitle = (view: string) => {
    switch (view) {
      case 'periodic-table': return 'Tabel Periodik Unsur';
      case 'atom-builder': return 'Model Atom Bohr';
      case 'bonding-lab': return 'Ikatan & Struktur Molekul';
      case 'geometry': return 'Geometri Molekul VSEPR';
      case 'stoichiometry': return 'Kalkulator Stoikiometri';
      case 'titration': return 'Titrasi Asam-Basa';
      case 'volta-lab': return 'Sel Volta & Elektrokimia';
      case 'kinetics-lab': return 'Laju Reaksi & Katalis';
      case 'equilibrium-lab': return 'Kesetimbangan Le Chatelier';
      case 'thermochemistry-lab': return 'Termokimia';
      case 'colligative-lab': return 'Sifat Koligatif Larutan';
      case 'colloid-lab': return 'Sistem Koloid & Efek Tyndall';
      case 'electrolysis-lab': return 'Hukum Faraday Sel Elektrolisis';
      case 'flame-test-lab': return 'Uji Nyala Spektrum Pancaran';
      case 'buffer-hydrolysis-lab': return 'Penyangga & Hidrolisis Garam';
      case 'solubility-ksp-lab': return 'Hasil Kali Kelarutan Ksp';
      case 'organic-lab': return 'Kimia Organik & Isomer';
      case 'macromolecule-lab': return 'Makromolekul & Polimerisasi';
      default: return 'Modul Simulasi Aktif';
    }
  };

  // Listen to state changes emitted by simulators
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.lab === activeView) {
        const latest = (window as any).chemvibe_latest_state;
        if (latest && latest.lab === activeView) {
          setLocalState(latest.data);
          setAiAnalysis(''); // Clear AI tutor answer when parameters shift so advice stays fresh
        }
      }
    };

    window.addEventListener('chemvibe_state_change', handleStateChange);

    // Initial check for existing states in global object on mount
    const latest = (window as any).chemvibe_latest_state;
    if (latest && latest.lab === activeView) {
      setLocalState(latest.data);
    } else {
      setLocalState(null);
    }
    setAiAnalysis('');
    setActiveHintId(null);

    return () => {
      window.removeEventListener('chemvibe_state_change', handleStateChange);
    };
  }, [activeView]);

  // Defined interactive formative rules based on student state
  const formativeFeedback = useMemo<FeedbackRuleResult[]>(() => {
    const feed: FeedbackRuleResult[] = [];
    if (!localState) {
      feed.push({
        type: 'info',
        title: 'Mulai Bereksperimen!',
        message: 'Geser slider, atur tombol, atau klik partikel di simulasian untuk memperoleh umpan balik mendalam mengenai pengaturan kimia Anda.',
        concept: 'Eksplorasi Aktif'
      });
      return feed;
    }

    if (activeView === 'titration') {
      const { acidType, indicator, titrantVol, currentPH } = localState;
      
      if (titrantVol === 0) {
        feed.push({
          type: 'info',
          title: 'Titran Nol Mulai',
          message: 'Larutan analit Anda saat ini murni tanpa campuran basa Penetes. Lacak trayek awal pH larutan Anda!',
          concept: 'Konsentrasi Awal Asam'
        });
      } else if (titrantVol > 0 && titrantVol < 23) {
        feed.push({
          type: 'info',
          title: 'Fase Buffer Awal',
          message: 'Asam dinetralkan secara bertahap. pH perlahan naik seiring meningkatnya konsentrasi ion hidrogas.',
          concept: 'Netralisasi Parsial'
        });
      }

      // Indicator warnings
      if (acidType === 'weak' && indicator === 'mo') {
        feed.push({
          type: 'warning',
          title: 'Ketidakcocokan Indikator!',
          message: 'Menggunakan Jingga Metil (MO) untuk mentitrasi asam lemah (seperti CH₃COOH) dengan basa kuat kurang ideal. pH ekuivalen akan berada di atas 8, namun MO berubah warna pada pH rendah (3.1 - 4.4).',
          concept: 'Trayek Kerja Indikator Asam-Basa'
        });
      } else if (acidType === 'strong' && indicator === 'pp') {
        feed.push({
          type: 'success',
          title: 'Kombinasi Indikator Sempurna',
          message: 'Fenolftalein (PP) sangat ideal untuk titrasi asam kuat dengan basa kuat karena titik ekuivalen (pH = 7) berada hampir berimpit dengan trayek transisi warna PP (pH 8.2 - 10.0).',
          concept: 'Kesesuaian Indikator'
        });
      }

      // Overshooting
      if (titrantVol >= 25.4) {
        feed.push({
          type: 'warning',
          title: 'Saturasi Ekstra: Overshooting!',
          message: `Laju penetesan Anda terlalu cepat sehingga melewati titik ekuivalen jauh (Vol: ${titrantVol} mL, pH: ${currentPH}). Larutan Anda sekarang sangat jenuh basa.`,
          concept: 'Titik Akhir Titrasi'
        });
      } else if (titrantVol >= 24.5 && titrantVol <= 25.3) {
        feed.push({
          type: 'success',
          title: 'Zonasi Titik Ekuivalen Dinamis!',
          message: `Luar biasa! Volume titran Anda adalah ${titrantVol} mL dengan tingkat pH ${currentPH}. Anda berada tepat pada tikungan kurva kesetimbangan reaksi netralisasi.`,
          concept: 'Stoikiometri Netralisasi'
        });
      }
    }

    if (activeView === 'atom-builder') {
      const { protons, neutrons, electrons, isStable, netCharge } = localState;

      // Charge warnings
      if (netCharge > 0) {
        feed.push({
          type: 'warning',
          title: 'Kation Terbentuk (Gaya Kulit Terbuka)',
          message: `Jumlah proton bermuatan positif (+${protons}) mengungguli elektron negatif (-${electrons}). Terbina kation logam reaktif dengan muatan formal +${netCharge}.`,
          concept: 'Ionisasi Atom'
        });
      } else if (netCharge < 0) {
        feed.push({
          type: 'warning',
          title: 'Anion Terformasi (Kulit Kelebihan)',
          message: `Lempeng muatan didominasi oleh lautan awan elektron negatif. Tercipta anion tidak netral dengan muatan formal ${netCharge}. Abadikan kestabilan konfigurasi gas mulia terdekat!`,
          concept: 'Afinitas Elektron'
        });
      } else if (protons > 0 && netCharge === 0) {
        feed.push({
          type: 'success',
          title: 'Keseimbangan Muatan (Atom Netral)',
          message: `Atom netral sempurna terbentuk dengan ${protons} Proton diimbangi tepat oleh ${electrons} Elektron. Muatan bersih = 0.`,
          concept: 'Gaya Elektrostatik Coulomb'
        });
      }

      // Isotope Stability
      if (protons > 0 && !isStable) {
        feed.push({
          type: 'warning',
          title: 'Nukleus Tidak Stabil (Isotop Radioaktif)',
          message: 'Rasio proton-neutron di dalam inti terlalu condong asimetris. Tanpa neutron yang ideal, tolakan elektrostatik mengalahkan gaya nuklir kuat, memicu peluruhan radiasi spontan!',
          concept: 'Pita Kestabilan Nuklir'
        });
      } else if (protons > 0 && isStable) {
        feed.push({
          type: 'success',
          title: 'Nukleus Stabil Tercapai',
          message: `Nuklida Anda stabil berkat proporsi neutron (${neutrons}) dibanding proton (${protons}) yang seimbang, menciptakan perekat gaya ikat helium prima.`,
          concept: 'Gaya Inti Kuat (Gaya Nuklir)'
        });
      }
    }

    if (activeView === 'volta-lab') {
      const { isLeftAnode, anode, cathode, actualPotVal, isNernstActive } = localState;

      if (actualPotVal < 0) {
        feed.push({
          type: 'warning',
          title: 'Aliran Spontanitas Mandet (E° Sel Negatif!)',
          message: `Sel Volta Anda menunjukkan muatan potensial negatif (${actualPotVal.toFixed(3)} V). Elektron dipaksa mengalir mundur yang menandakan sirkuit tidak spontan. Tukar anode dan katoda Anda!`,
          concept: 'Termodinamika Sel elektrokimia'
        });
      } else if (actualPotVal > 0) {
        feed.push({
          type: 'success',
          title: 'Sel Bekerja Aktif Secara Spontan',
          message: `Elektron mengalir lancar dari anoda ${anode?.symbol} (oksidasi) menuju elektroda ${cathode?.symbol} (reduksi) menghasilkan daya listrik bersih sebesar ${actualPotVal.toFixed(3)} V!`,
          concept: 'Sel Volta Spontan'
        });
      }

      if (isNernstActive) {
        feed.push({
          type: 'info',
          title: 'Efek Persamaan Nernst Aktif',
          message: 'Konsentrasi ion larutan saat ini tidak standar (tidak sama dengan 1.0 M). Nilai tegangan menyusut atau menebal mengikuti rasio konsentrasi produk dibagi reaktan (Q).',
          concept: 'Kinetika Kimia Sifat Koligatif Sel'
        });
      }
    }

    if (activeView === 'equilibrium-lab') {
      const { activeSystem, complexLigandAdded, dilutionLevel, thioTemp, gasTemp, gasVolume } = localState;

      if (activeSystem === 'thiocyanate') {
        if (complexLigandAdded) {
          feed.push({
            type: 'warning',
            title: 'Penangkapan Ion Fe³⁺ (Pergeseran Kiri)',
            message: 'Kristal NaF melepaskan F⁻ yang mengikat Fe³⁺ membentuk senyawa stabil fluorida besi tak berwarna. Karena Fe³⁺ berkurang drastis, kesetimbangan bergeser ke kiri untuk memproduksi kembali Fe³⁺.',
            concept: 'Efek Pengompleksan Asas Le Chatelier'
          });
        }
        if (thioTemp < 298) {
          feed.push({
            type: 'success',
            title: 'Suhu Rendah Eksotermik',
            message: 'Reaksi de-kompleks thiocyanate melepaskan panas (eksoterm). Menurunkan suhu menggeser kesetimbangan ke arah kanan (merah darah pekat) untuk mengganti kalor panas.',
            concept: 'Termodinamika Kesetimbangan'
          });
        } else if (thioTemp > 298) {
          feed.push({
            type: 'warning',
            title: 'Pemanasan Reaksi Eksoterm',
            message: 'Suhu tinggi merangsang sistem menggeser kesetimbangan ke arah kiri (reaktan endotermik absorbsi), melarutkan senyawa merah darah membentuk ion-ion bebas pudar.',
            concept: 'Pergeseran Panas Kalor'
          });
        }
      } else if (activeSystem === 'gas-no2') {
        if (gasVolume < 2.0) {
          feed.push({
            type: 'success',
            title: 'Hukum Kompresi Gas (Mol Kecil)',
            message: `Volume dikecilkan (${gasVolume} L) meningkatkan tekanan total. Sistem bergeser ke reaktan kiri (N₂O₄) karena memiliki koefisien mol gas lebih sedikit (1 mol N₂O₄ vs 2 mol NO₂).`,
            concept: 'Mekanika Tekanan Kesetimbangan'
          });
        }
        if (gasTemp > 298) {
          feed.push({
            type: 'success',
            title: 'Suhu Tinggi Endotermik NO₂',
            message: 'Suhu tinggi mendorong reaksi ke kanan (endoterm, NO₂) sehingga warna gas cokelat semakin pekat, sejalan dengan bertambahnya konsentrasi nitrogen dioksida berlebih.',
            concept: 'Asas Suhu Kesetimbangan'
          });
        }
      }
    }

    // Default return empty state if not matching active rules
    if (feed.length === 0) {
      feed.push({
        type: 'info',
        title: 'Konfigurasi Kimiawi Terdeteksi',
        message: 'Modul ini dikoordinasikan di bawah standar peninjauan ChemVibe. Anda dapat mengubah nilai atau menekan tombol Analisis AI Mentor untuk tinjauan menyeluruh.',
        concept: 'Prinsip Dasar Kimia'
      });
    }

    return feed;
  }, [localState, activeView]);

  // Specific micro challenges for the active view to practice adaptive feedback
  const challenges = useMemo<Challenge[]>(() => {
    switch (activeView) {
      case 'titration':
        return [
          {
            id: 'tit-1',
            title: 'Titik Ekuivalen Sempurna (CH₃COOH)',
            condition: 'Mentitrasi Asam Lemah dengan volume NaOH berada pada range 24.5 sampai 25.1 mL.',
            points: 50,
            hint: 'Set jenis asam ke lemah, lalu buka aliran slow. Saat volume mendekati 23 mL, ganti laju ke "dropwise" (tetes demi tetes)!',
            checkFn: (state) => state && state.acidType === 'weak' && state.titrantVol >= 24.5 && state.titrantVol <= 25.1
          },
          {
            id: 'tit-2',
            title: 'Indikator pH Yang Sesuai',
            condition: 'Memilih Fenolftalein (PP) untuk Asam Kuat (HCl).',
            points: 30,
            hint: 'PP berubah warna tepat pada pH 8.2 - 10.0, yang bertepatan dengan lonjakan vertikal ekuivalen asam kuat - basa kuat.',
            checkFn: (state) => state && state.acidType === 'strong' && state.indicator === 'pp'
          }
        ];
      case 'atom-builder':
        return [
          {
            id: 'atom-1',
            title: 'Kation Litium-7 Stabil',
            condition: 'Membangun kation Logam Litium dengan 3 proton, 4 neutron, dan 2 elektron.',
            points: 50,
            hint: 'Litium bermuatan netral memiliki 3 proton dan 3 elektron. Kurangi 1 elektron untuk membuatnya kation +1, pastikan 4 neutron terpasang agar stabil.',
            checkFn: (state) => state && state.protons === 3 && state.neutrons === 4 && state.electrons === 2
          },
          {
            id: 'atom-2',
            title: 'Anion Oksigen-16 Stabil',
            condition: 'Membangun anion dengan 8 proton, 8 neutron, dan 10 elektron.',
            points: 50,
            hint: 'Oksigen bermuatan -2 (anion) memiliki 10 elektron mengitari inti berisi 8 proton dan 8 neutron.',
            checkFn: (state) => state && state.protons === 8 && state.neutrons === 8 && state.electrons === 10
          }
        ];
      case 'volta-lab':
        return [
          {
            id: 'volt-1',
            title: 'Sirkuit Tegangan Maksimal',
            condition: 'Mengonfigurasikan anoda dan katoda dengan beda potensial (E° sel) di atas 1.0 Volt.',
            points: 40,
            hint: 'Kombinasikan logam yang letaknya berjauhan di tabel periodik/deret elektrokimia (misalnya Seng Zn dan Tembaga Cu).',
            checkFn: (state) => state && state.actualPotVal > 1.0
          },
          {
            id: 'volt-2',
            title: 'Aktivasi Koreksi Nernst',
            condition: 'Mengaktifkan persamaan Nernst pada konsentrasi sel tidak standar.',
            points: 30,
            hint: 'Centang kotak Nernst teoretikal di simulator, dan atur konsentrasi agar menyimpang dari kondisi 1.0 M.',
            checkFn: (state) => state && state.isNernstActive
          }
        ];
      case 'equilibrium-lab':
        return [
          {
            id: 'equ-1',
            title: 'Memudarkan Senyawa Kompleks',
            condition: 'Memudarkan warna kompleks thiocyanate dengan menambahkan agen pembawa NaF.',
            points: 40,
            hint: 'Set sistem ke thiocyanate, lalu klik tombol/centang NaF ligand added untuk mengikat Fe³⁺.',
            checkFn: (state) => state && state.activeSystem === 'thiocyanate' && state.complexLigandAdded === true
          },
          {
            id: 'equ-2',
            title: 'Pencokelatan Intensivitas Gas',
            condition: 'Menggeser NO₂ ke arah kanan dengan menaikkan suhu bejana di atas 340 Kelvin.',
            points: 40,
            hint: 'Set sistem ke gas-no2, lalu naikkan suhu gas (gasTemp) hingga mencapai nilai termal yang sangat panas.',
            checkFn: (state) => state && state.activeSystem === 'gas-no2' && state.gasTemp > 340
          }
        ];
      default:
        return [];
    }
  }, [activeView]);

  // Run challenge completions check ticker
  useEffect(() => {
    if (!localState || challenges.length === 0) return;

    challenges.forEach((chall) => {
      if (!completedChallenges[chall.id] && chall.checkFn(localState)) {
        setCompletedChallenges(prev => ({ ...prev, [chall.id]: true }));
        triggerAudioFeedback('win');

        // Broadcast achievements to standard scorecard log using customEvent
        window.dispatchEvent(new CustomEvent('chemvibe_activity', {
          detail: {
            activityType: 'challenge_achieved',
            title: `🏆 Lencana Tercapai: ${chall.title}`,
            description: `Menyelesaikan misi bimbingan formatif adaptif dalam ${getLabTitle(activeView)}!`,
            score: {
              earned: chall.points,
              total: chall.points
            }
          }
        }));
      }
    });
  }, [localState, challenges, completedChallenges, activeView]);

  // Query Google Gemini API for Deep Personalized Chemistry Review
  const requestAIMentorReview = async () => {
    if (isLoadingAI) return;
    triggerAudioFeedback('click');
    setIsLoadingAI(true);
    setAiAnalysis('');
    setAiError('');

    try {
      const stateSummary = localState 
        ? JSON.stringify(localState, null, 2) 
        : 'Tidak ada data simulasi aktif (awal/baseline).';

      const prompt = `Saya sedang belajar kimia menggunakan simulator "${getLabTitle(activeView)}" (Kunci: ${activeView}) di platform laboratorium ChemVibe. 

Kondisi konfigurasi instrumen terpasang saat ini:
${stateSummary}

Tolong posisikan diri Anda sebagai Guru Kimia Mentor Cerdas (AI Chemistry Tutor). Berikan umpan balik formatif adaptif (Adaptive Formative Feedback) berlandaskan aspek pedagogi modern:
1. **Analisis Konfigurasi**: Jelaskan fenomena kimia apa yang terjadi pada pengaturan instrumen saya saat ini (analisis angka-angkanya secara akurat).
2. **Koreksi atau Evaluasi**: Apakah pengaturan ini aman, stabil, spontan, atau ideal secara praktikum? Tunjukkan bias/celah kesalahan jika ada (misal indicator tidak cocok, isotop runtuh, sirkuit mundur).
3. **Saran Eksperimen**: Berikan 2 langkah aksi terarah (rekomendasi nilai kualitatif/kuantitatif) untuk mengoptimalkan pengaturan agar mencapai pemahaman konseptual yang lebih tinggi.

Berikan penjelasan dengan nada ramah, ringkas, profesional, murni mendidik, menggunakan format markdown yang kokoh dengan list scannable. Batasi penjelasan sekitar 200-250 kata agar langsung terbaca.`;

      const res = await fetch('/api/gemini/chemistry-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt,
          history: []
        })
      });

      if (!res.ok) {
        throw new Error('Asisten AI sedang sibuk merawat larutan. Gagal memproses data.');
      }

      const data = await res.json();
      setAiAnalysis(data.text);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Maaf, gagal memanggil AI Mentor. Silakan coba sesaat lagi.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const isSupportedView = ['titration', 'atom-builder', 'volta-lab', 'equilibrium-lab'].includes(activeView);

  // Return empty if view doesn't declare rule-evaluation engines to prevent layout clutter
  if (!isSupportedView) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div 
        id="unique-adaptive-feedback-launcher"
        className="fixed bottom-40 right-6 lg:bottom-24 lg:right-6 z-45 pointer-events-auto"
      >
        <button
          onClick={() => {
            triggerAudioFeedback('click');
            setIsOpen(true);
          }}
          className="relative flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 border border-slate-800 text-pink-400 font-sans text-xs font-black transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer hover:border-pink-500/30 group"
          aria-label="Buka Tutor Kimia Adaptif"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
          <Brain className="w-4.5 h-4.5 text-pink-400 group-hover:animate-bounce-short" />
          <span className="hidden sm:inline font-mono tracking-wide">TUTOR ADAPTIF</span>
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
        </button>
      </div>

      {/* Slide drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop slide clickout */}
            <motion:div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Sidebar drawer canvas */}
            <motion:div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 23, stiffness: 220 }}
              className="relative w-full max-w-lg bg-slate-955 border-l border-slate-850 h-full flex flex-col shadow-2xl relative z-10 overflow-hidden"
              id="unique-adaptive-feedback-panel"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 via-indigo-500 to-teal-400" />

              {/* Drawer Header Segment */}
              <div className="p-5 border-b border-slate-900 bg-slate-950/80 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      Tutor Sains Adaptif
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    </h3>
                    <p className="text-[10px] text-slate-450 leading-tight">Umpan Balik Formatif Real-time &amp; Evaluasi Kognitif</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                  aria-label="Tutup Panel Tutor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lab Metadata Header display */}
              <div className="px-5 py-3.5 bg-slate-900/40 flex items-center justify-between border-b border-slate-900 leading-tight">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase text-slate-500">Eksperimen Aktif:</span>
                  <span className="text-xs font-black font-mono text-teal-400 uppercase mt-0.5">{getLabTitle(activeView)}</span>
                </div>
                <div className="px-2.5 py-1 bg-pink-500/10 rounded-full border border-pink-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9.5px] font-mono font-extrabold text-pink-400">ANALYZER ONLINE</span>
                </div>
              </div>

              {/* Main Contents wrap */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                
                {/* 1. COMPACT REAL-TIME MENTOR GUIDANCE CARDS */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    Analisis Kondisi Reaksi Terkini
                  </h4>

                  <div className="space-y-2.5">
                    {formativeFeedback.map((feedItem, idx) => {
                      const isWarning = feedItem.type === 'warning';
                      const isSuccess = feedItem.type === 'success';

                      return (
                        <div 
                          key={idx}
                          className={`p-4 rounded-xl border transition-all ${
                            isWarning 
                              ? 'bg-amber-950/20 border-amber-900/50 text-amber-100'
                              : isSuccess
                              ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-100'
                              : 'bg-slate-900/60 border-slate-850 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              {isWarning && <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />}
                              {isSuccess && <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />}
                              {!isWarning && !isSuccess && <Info className="w-4.5 h-4.5 text-blue-400" />}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-extrabold">{feedItem.title}</h5>
                                <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                  isWarning ? 'bg-amber-500/10 text-amber-400' : isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-400'
                                }`}>
                                  {feedItem.concept}
                                </span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-slate-300">
                                {feedItem.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. CHALLENGES & LEARNING OBJECTIVES */}
                {challenges.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-pink-400" />
                      Misi Kompetensi Adaptif
                    </h4>

                    <div className="space-y-2.5">
                      {challenges.map((c) => {
                        const isDone = completedChallenges[c.id];
                        const isHintOpen = activeHintId === c.id;

                        return (
                          <div 
                            key={c.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isDone 
                                ? 'bg-indigo-950/20 border-indigo-500/40 text-slate-200'
                                : 'bg-slate-900/30 border-slate-850 text-slate-405'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                                  isDone ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-950 text-slate-600 border border-slate-900'
                                }`}>
                                  {isDone ? <Check className="w-3.5 h-3.5" /> : <Play className="w-2.5 h-2.5" />}
                                </div>
                                <h5 className="text-[11.5px] font-extrabold text-white">{c.title}</h5>
                              </div>
                              <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                isDone ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                              }`}>
                                +{c.points} Pts
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-350 leading-relaxed font-sans mb-3">
                              {c.condition}
                            </p>

                            <div className="flex items-center justify-between gap-2.5 pt-2.5 border-t border-slate-900">
                              <button
                                onClick={() => {
                                  triggerAudioFeedback('hint');
                                  setActiveHintId(isHintOpen ? null : c.id);
                                }}
                                className="text-[10px] font-sans font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Lightbulb className="w-3.5 h-3.5" />
                                {isHintOpen ? 'Sembunyikan Petunjuk' : 'Dapatkan Petunjuk Konsep'}
                              </button>

                              {isDone ? (
                                <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase font-bold">✓ SELESAI</span>
                              ) : (
                                <span className="text-[9px] font-mono bg-slate-950 text-slate-500 border border-slate-900 px-2 py-0.5 rounded-md uppercase font-bold">SEDANG DICARI</span>
                              )}
                            </div>

                            <AnimatePresence>
                              {isHintOpen && (
                                <motion:div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 p-3 bg-slate-950/60 border border-teal-500/20 rounded-lg text-[10.5px] text-teal-300 font-sans leading-relaxed flex items-start gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-405 shrink-0 mt-0.5" />
                                    <p><strong>Tips Guru:</strong> {c.hint}</p>
                                  </div>
                                </motion:div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. DEEP AI MENTOR EVALUATION (GEMINI BACKEND INTEGRATION) */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-950/40 to-indigo-950/40 border border-pink-500/20 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <MessageSquare className="w-4.5 h-4.5 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">Penilaian AI Mentor (Gemini)</h4>
                      <p className="text-[9.5px] text-slate-400 font-mono">Dapatkan ulasan instrumen berorientasi kurikulum</p>
                    </div>
                  </div>

                  <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                    Apakah Anda ragu dengan kalkulasi konsentrasi, rasio isotop, atau letak anoda Anda? Izinkan asisten kognitif kami meninjau formulasi Anda secara presisi dengan basis data teoretis yang mendalam.
                  </p>

                  <button
                    onClick={requestAIMentorReview}
                    disabled={isLoadingAI}
                    className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-indigo-650 hover:from-pink-500 hover:to-indigo-550 disabled:opacity-50 text-white font-mono text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoadingAI ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Menganalisis Instrumen...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>✨ Analisis Formulasi Saya</span>
                      </>
                    )}
                  </button>

                  {/* AI Output Segment */}
                  <AnimatePresence>
                    {(aiAnalysis || aiError) && (
                      <motion:div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3 text-xs leading-relaxed max-h-96 overflow-y-auto"
                      >
                        {aiError && (
                          <div className="text-rose-455 font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {aiError}
                          </div>
                        )}

                        {aiAnalysis && (
                          <div className="space-y-1 mt-1 prose prose-invert font-sans text-slate-300">
                            <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase pb-1.5 border-b border-slate-900">
                              <Brain className="w-3 h-3 text-pink-400" />
                              Transkrip Konseling Tutor Kimia
                            </div>
                            <div className="whitespace-pre-line text-[11px] font-medium leading-relaxed leading-6 pt-1 text-slate-300">
                              {aiAnalysis}
                            </div>
                          </div>
                        )}
                      </motion:div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Bottom Educational micro tip footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-900 text-[10px] text-slate-400 flex items-start gap-2 max-h-24 select-none shrink-0">
                <Info className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Belajar Adaptif:</strong> Tutor memonitor state aktif di balik simulator. Jika analisis tidak berjalan ganti parameter atau segarkan simulasian Anda!
                </div>
              </div>

            </motion:div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
