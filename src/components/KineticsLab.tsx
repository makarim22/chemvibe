/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Sliders, Info, HelpCircle, RefreshCw, 
  Play, Pause, Award, CheckCircle, XCircle, ChevronRight,
  TrendingUp, Sparkles, BookOpen, Layers, Flame,
  Volume2, VolumeX
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  ReferenceLine as RechartsReferenceLine,
  ReferenceDot as RechartsReferenceDot,
} from 'recharts';

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  type: 'A' | 'B' | 'AB';
  color: string;
  id: number;
  clustered: boolean; // For Surface Area (chunk) illustration
}

interface Spark {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Bagaimana pengaruh peningkatan suhu terhadap laju reaksi berdasarkan teori tumbukan?",
    options: [
      "Meningkatkan energi aktivasi total yang dibutuhkan reaktan.",
      "Meningkatkan energi kinetik rata-rata partikel sehingga frekuensi tumbukan efektif naik.",
      "Menurunkan orde reaksi keseluruhan sehingga reaksi selesai spontan.",
      "Membuat molekul reaktan menyusut sehingga memperkecil luas rintangan sterik."
    ],
    correctAnswer: 1,
    explanation: "Peningkatan suhu menaikkan energi kinetik rata-rata molekul. Partikel bergerak lebih cepat dan menumbuk satu sama lain dengan gaya yang lebih besar, meningkatkan fraksi tumbukan sukses yang berhasil melewati rintangan energi aktivasi."
  },
  {
    question: "Katalis meningkatkan kecepatan reaksi kimia secara teoretis melalui mekanisme...",
    options: [
      "Menyediakan jalur reaksi alternatif dengan energi aktivasi (Ea) yang lebih rendah.",
      "Meningkatkan suhu internal bejana reaksi secara ekstrem tanpa suplai sirkuit.",
      "Mengubah reaksi endotermik murni menjadi reaksi eksotermik sempurna.",
      "Mengonsumsi reaktan secara instan dan membiarkannya bereaksi secara mandiri."
    ],
    correctAnswer: 0,
    explanation: "Katalis tidak meningkatkan energi partikel, melainkan menurunkan 'tinggi pagar rintangan' (Energi Aktivasi). Ini memberikan rute baru yang lebih mudah dilalui reaktan sehingga mempercepat terbentuknya produk."
  },
  {
    question: "Reaksi: CaCO₃(s) + 2 HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g). Laju reaksi pembentukan gas CO₂ paling cepat dicapai melalu kombinasi...",
    options: [
      "Menggunakan bongkahan kalsium karbonat dalam HCl 0,5 M pada suhu 20°C.",
      "Menggunakan serbuk halus kalsium karbonat dalam HCl 2,0 M pada suhu 45°C.",
      "Menggunakan bongkahan kalsium karbonat dalam HCl 2,0 M pada suhu 45°C.",
      "Menggunakan serbuk halus kalsium karbonat dalam HCl 0,5 M pada suhu 20°C."
    ],
    correctAnswer: 1,
    explanation: "Laju reaksi berbanding lurus dengan konsentrasi HCl (makakin tebal makin sering tumbukan), luas permukaan reaktif (serbuk halus memiliki bidang sentuh jauh lebih luas dibanding bongkahan), dan suhu (mempercepat tumbukan efektif)."
  },
  {
    question: "Suatu reaksi kimia memiliki persamaan laju r = k [A] [B]². Jika konsentrasi zat B dinaikkan menjadi 3 kali semula sementara A tetap, laju reaksi akan menjadi...",
    options: [
      "3 kali semula",
      "6 kali semula",
      "9 kali semula",
      "27 kali semula"
    ],
    correctAnswer: 2,
    explanation: "Reaksi ini berorde 2 terhadap B. Jika [B] dilipatgandakan 3 kali, perubahan laju reaksinya adalah 3² = 9 kali semula. [A] tetap sehingga tidak memberi pengaruh ekstra."
  }
];

export default function KineticsLab({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  // Simulation factors states
  const [concentrationA, setConcentrationA] = useState<number>(30); // Number of A particles (Red)
  const [concentrationB, setConcentrationB] = useState<number>(30); // Number of B particles (Blue)
  const [temperature, setTemperature] = useState<number>(298); // Kelvin: 273 - 373 K
  const [surfaceArea, setSurfaceArea] = useState<'powder' | 'chunk'>('powder'); // Powder vs Chunk
  const [useCatalyst, setUseCatalyst] = useState<boolean>(false);

  // Simulation play states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [historyData, setHistoryData] = useState<{ t: number; A: number; B: number; AB: number }[]>([]);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

  // Quantitative counters for collision statistics
  const [effCollisions, setEffCollisions] = useState<number>(0);
  const [ineffCollisions, setIneffCollisions] = useState<number>(0);
  const [pulseValue, setPulseValue] = useState<number>(1.0); // Visual indicator of energy pulse

  // Generate highly accurate activation energy profile data points
  const energyProfileData = React.useMemo(() => {
    const data = [];
    const H_react = 34.0;
    const H_prod = 14.0;
    const Ea_std = 48.0;
    const Ea_cat = 26.0;

    for (let x = 0; x <= 100; x += 2) {
      let H_std = H_react;
      let H_cat = H_react;

      if (x >= 15 && x <= 50) {
        // Ascending arc using smooth sin-squared interpolation (chemically authentic transition curve)
        const progress = (x - 15) / 35;
        const factor = Math.sin(progress * Math.PI / 2);
        H_std = H_react + Ea_std * factor;
        H_cat = H_react + Ea_cat * factor;
      } else if (x > 50 && x <= 85) {
        // Descending arc
        const progress = (x - 50) / 35;
        const factor = Math.cos(progress * Math.PI / 2);
        H_std = H_prod + (H_react + Ea_std - H_prod) * factor;
        H_cat = H_prod + (H_react + Ea_cat - H_prod) * factor;
      } else if (x > 85) {
        H_std = H_prod;
        H_cat = H_prod;
      }

      data.push({
        coord: x,
        std: parseFloat(H_std.toFixed(1)),
        cat: parseFloat(H_cat.toFixed(1)),
      });
    }
    return data;
  }, []);

  // Dynamic Equilibrium Constant (Ke) estimation
  const estEquilibriumK = React.useMemo(() => {
    if (historyData.length === 0) {
      return "0.000";
    }
    const current = historyData[historyData.length - 1];
    const { A, B, AB } = current;
    if (A === 0 || B === 0) {
      return '∞ (Reaksi Selesai)';
    }
    // Ke = [AB] / ([A] * [B])
    // Multiply by a factor of 10 for neat scaling
    const K = (AB * 10) / (A * B);
    return K.toFixed(3);
  }, [historyData]);

  // Active view tab inside module
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory' | 'quiz'>('simulation');

  // Quiz States
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  // Canvas ref for particle animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Refs for real-time and performance-optimized statistics
  const sparksRef = useRef<Spark[]>([]);
  const effCollisionsRef = useRef<number>(0);
  const ineffCollisionsRef = useRef<number>(0);
  const pulseDecayRef = useRef<number>(1.0);

  // Audio Synthesis States & Refs for dynamic reaction rate sonification
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [realtimeRate, setRealtimeRate] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const beatTimerAccumulatorRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const beatCountRef = useRef<number>(0);
  const lastChimeTimeRef = useRef<number>(0);
  const isAudioEnabledRef = useRef<boolean>(false);

  // Sync ref immediately to bypass stale captures in closures
  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  const initAudioContextOrToggle = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);

    if (nextState) {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        playStartupChirp();
      } catch (e) {
        console.error("Gagal mendeteksi/mengaktifkan Web Audio Context:", e);
      }
    } else {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(() => {});
      }
    }
  };

  const playStartupChirp = () => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (_) {}
  };

  const playBeatNode = (rateValue: number) => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      // Mellow base cutoff frequency shifts with reaction rate (increases harmoniously when fast)
      filter.frequency.setValueAtTime(160 + Math.min(600, rateValue * 2500), ctx.currentTime);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Relaxing pentatonic chime-thump notes
      const lowScale = [110.00, 123.47, 130.81, 146.83, 164.81, 196.00]; // A2, B2, C3, D3, E3, G3
      const highScale = [220.00, 246.94, 261.63, 293.66, 329.63, 392.00]; // A3, B3, C4, D4, E4, G4

      const activeScale = rateValue > 0.05 ? highScale : lowScale;
      const index = beatCountRef.current % activeScale.length;
      beatCountRef.current++;
      const freq = activeScale[index];

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (_) {}
  };

  const playChimeNode = () => {
    try {
      const now = Date.now();
      if (now - lastChimeTimeRef.current < 45) return;
      lastChimeTimeRef.current = now;

      const ctx = audioContextRef.current;
      if (!ctx || ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const chimeFreqs = [783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51]; // G5, A5, B5, C6, D6, E6
      const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, ctx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.004);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch (_) {}
  };

  // Turn off context on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  // Reset simulation function
  const handleResetSimulation = () => {
    setReactionTime(0);
    setCompletionPercentage(0);
    setHistoryData([{ t: 0, A: concentrationA, B: concentrationB, AB: 0 }]);
    
    // Clear collision trackers
    effCollisionsRef.current = 0;
    ineffCollisionsRef.current = 0;
    setEffCollisions(0);
    setIneffCollisions(0);
    sparksRef.current = [];
    pulseDecayRef.current = 1.0;
    setPulseValue(1.0);
    
    // Generate initial particles
    const list: Particle[] = [];
    let pId = 0;

    // Generate A (Red)
    for (let i = 0; i < concentrationA; i++) {
      list.push(createRandomParticle('A', pId++));
    }

    // Generate B (Blue)
    if (surfaceArea === 'chunk') {
      // Chunk style: B molecules are clustered at the center and cannot move easily
      const centerX = 200;
      const centerY = 125;
      for (let i = 0; i < concentrationB; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 45; // clumped tightly
        list.push({
          id: pId++,
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist,
          dx: (Math.random() - 0.5) * 0.1, // barely moving
          dy: (Math.random() - 0.5) * 0.1,
          radius: 6,
          type: 'B',
          color: '#3b82f6', // blue
          clustered: true
        });
      }
    } else {
      // Powder style: B molecules are fully free and moving
      for (let i = 0; i < concentrationB; i++) {
        list.push(createRandomParticle('B', pId++));
      }
    }

    particlesRef.current = list;
  };

  const createRandomParticle = (type: 'A' | 'B' | 'AB', id: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    // Speed scales with temperature
    // Base speed at 298K is 1.0, scales from 0.5 (273K) to 2.5 (373K)
    const tempRatio = (temperature - 260) / 38;
    const speed = (0.6 + Math.random() * 0.8) * tempRatio;
    
    return {
      id,
      x: 20 + Math.random() * 360,
      y: 20 + Math.random() * 210,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      radius: 6,
      type,
      color: type === 'A' ? '#ef4444' : '#3b82f6', // red or blue
      clustered: false
    };
  };

  // Heat flash impulse trigger for temporary activation boost
  const triggerEnergyPulse = () => {
    pulseDecayRef.current = 2.5;
    setPulseValue(2.5);
    // Inject multiple thermal shockwaves
    for (let i = 0; i < 6; i++) {
      sparksRef.current.push({
        x: 40 + Math.random() * 320,
        y: 40 + Math.random() * 170,
        radius: 4,
        maxRadius: 40,
        opacity: 0.8,
        color: 'rgba(249, 115, 22, 0.55)'
      });
    }
  };

  // Re-run setup whenever initial conditions or surface area changes
  useEffect(() => {
    handleResetSimulation();
  }, [concentrationA, concentrationB, surfaceArea]);

  // Adjust speeds list in place when temperature changes
  useEffect(() => {
    const tempRatio = (temperature - 260) / 38;
    particlesRef.current = particlesRef.current.map(p => {
      if (p.clustered) return p; // Clustered group is immovable
      const angle = Math.atan2(p.dy, p.dx);
      const speed = (0.6 + Math.random() * 0.8) * tempRatio;
      return {
        ...p,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed
      };
    });
  }, [temperature]);

  // Handle core Canvas loop, collisions, and state recording
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTime = reactionTime;

    const updateSimulationFrame = () => {
      if (!isPlaying) {
        lastFrameTimeRef.current = 0;
        drawFrame();
        animationFrameIdRef.current = requestAnimationFrame(updateSimulationFrame);
        return;
      }

      // Track exact simulation frame timing delta for rock-solid audio synchronization
      const nowFrameTime = performance.now();
      const deltaMs = lastFrameTimeRef.current ? nowFrameTime - lastFrameTimeRef.current : 16.67;
      lastFrameTimeRef.current = nowFrameTime;
      const deltaSec = Math.min(0.1, deltaMs / 1000);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = [...particlesRef.current];
      const speedMultiplier = pulseDecayRef.current;

      // Dynbeat synthesizer ticks
      if (isAudioEnabledRef.current) {
        const countA_now = particles.filter(p => p.type === 'A').length;
        const countB_now = particles.filter(p => p.type === 'B').length;

        let k_base = 0.0003;
        if (useCatalyst) k_base *= 3.0;
        if (surfaceArea === 'powder') k_base *= 1.6;
        const tempRatio = Math.exp((temperature - 298) / 35);
        const rateEstimate = k_base * tempRatio * countA_now * countB_now;

        const intervalSeconds = Math.max(0.16, Math.min(2.5, 1.6 / (rateEstimate + 0.4)));

        beatTimerAccumulatorRef.current += deltaSec;
        if (beatTimerAccumulatorRef.current >= intervalSeconds) {
          beatTimerAccumulatorRef.current = 0;
          playBeatNode(rateEstimate);
        }
      }

      // Move and bounce
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.dx * speedMultiplier;
        p.y += p.dy * speedMultiplier;

        // Wall collisions (guarded from sticking)
        if (p.x < p.radius) { p.x = p.radius; if (p.dx < 0) p.dx *= -1; }
        if (p.x > canvas.width - p.radius) { p.x = canvas.width - p.radius; if (p.dx > 0) p.dx *= -1; }
        if (p.y < p.radius) { p.y = p.radius; if (p.dy < 0) p.dy *= -1; }
        if (p.y > canvas.height - p.radius) { p.y = canvas.height - p.radius; if (p.dy > 0) p.dy *= -1; }
      }

      // Handle Particle collisions (A + B -> AB)
      // Collision probability factors:
      // - Catalyst lowers Activation Energy, increasing successful reactions probability.
      // - Temperature increases frequency & success rate of particles colliding.
      let baseReactProb = 0.04; // standard probability
      if (useCatalyst) baseReactProb += 0.20; // Catalyst provides faster alternative pathway
      const tempRatioFactor = (temperature - 273) / 100; // 0 to 1 scaling
      baseReactProb += tempRatioFactor * 0.08;

      // Heat shock pulses also augment activation success ratios
      if (speedMultiplier > 1.0) {
        baseReactProb += (speedMultiplier - 1.0) * 0.06;
      }

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.type !== 'A') continue;

        for (let j = 0; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.type !== 'B') continue;

          // Compute distance
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < p1.radius + p2.radius) {
            // Collision occurred!
            // In chunk mode, inner particles can't easily react unless they on the surface
            let surfaceAreaChance = true;
            if (p2.clustered) {
              // Calculate distance of p2 from chunk center to represent boundary reactivity
              const distFromClumpCenter = Math.sqrt(Math.pow(p2.x - 200, 2) + Math.pow(p2.y - 125, 2));
              if (distFromClumpCenter < 20) {
                // Inside core: low chance
                surfaceAreaChance = Math.random() < 0.15;
              }
            }

            if (surfaceAreaChance && Math.random() < baseReactProb) {
              // React and transform into Purple AB
              p1.type = 'AB';
              p1.color = '#a855f7'; // Purple product
              p1.radius = 7.5; // Slightly larger representing molecule complex
              
              // Remove the B particle that was bound
              particles.splice(j, 1);
              if (j < i) i--; // Re-align index

              // Trigger acoustic glass chime synthesizer
              if (isAudioEnabledRef.current) {
                playChimeNode();
              }

              // Register highly effective collision spark
              effCollisionsRef.current += 1;
              sparksRef.current.push({
                x: p1.x,
                y: p1.y,
                radius: 3,
                maxRadius: 28,
                opacity: 1.0,
                color: '#ec4899' // Pink shockwave
              });

              break;
            } else {
              // Elastic collision bounce back
              const angle = Math.atan2(dy, dx);
              const speed1 = Math.sqrt(p1.dx * p1.dx + p1.dy * p1.dy);
              const speed2 = Math.sqrt(p2.dx * p2.dx + p2.dy * p2.dy);
              
              p1.dx = Math.cos(angle) * speed1;
              p1.dy = Math.sin(angle) * speed1;
              if (!p2.clustered) {
                p2.dx = -Math.cos(angle) * speed2;
                p2.dy = -Math.sin(angle) * speed2;
              }

              // Register ineffective collision ripple
              ineffCollisionsRef.current += 1;
              sparksRef.current.push({
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2,
                radius: 1,
                maxRadius: 10,
                opacity: 0.5,
                color: '#eab308' // Orange-Yellow elastic bounce ripple
              });
            }
          }
        }
      }

      // Update sparks animations and decay alpha
      sparksRef.current = sparksRef.current
        .map(s => ({
          ...s,
          radius: s.radius + 1.2 * speedMultiplier,
          opacity: s.opacity - 0.04
        }))
        .filter(s => s.opacity > 0);

      // Decay energy pulse back to 1.0
      if (pulseDecayRef.current > 1.0) {
        pulseDecayRef.current -= 0.035;
        if (pulseDecayRef.current < 1.0) {
          pulseDecayRef.current = 1.0;
        }
      }

      particlesRef.current = particles;
      drawFrame();

      // Track time and write graph coordinates
      localTime += 0.016; // Approx 60fps frame tick
      setReactionTime(localTime);

      // Periodically update React component states (approx every 15 frames)
      if (Math.round(localTime * 1000) % 250 < 20) {
        const countA = particles.filter(p => p.type === 'A').length;
        const countB = particles.filter(p => p.type === 'B').length;
        const countAB = particles.filter(p => p.type === 'AB').length;
        const maxPossibleAB = Math.min(concentrationA, concentrationB);
        const percent = maxPossibleAB > 0 ? (countAB / maxPossibleAB) * 100 : 0;
        setCompletionPercentage(percent);

        // Calculate dynamic real-time reaction rate Session for UI presentation
        let k_base = 0.0003;
        if (useCatalyst) k_base *= 3.0;
        if (surfaceArea === 'powder') k_base *= 1.6;
        const tempRatio = Math.exp((temperature - 298) / 35);
        const rateEstimate = k_base * tempRatio * countA * countB;
        setRealtimeRate(rateEstimate);

        // Sync visual telemetry stats and pulse factors to UI
        setEffCollisions(effCollisionsRef.current);
        setIneffCollisions(ineffCollisionsRef.current);
        setPulseValue(pulseDecayRef.current);

        setHistoryData(prev => {
          // Prevent array getting too bloated
          if (prev.length > 100) {
            return [...prev.slice(1), { t: localTime, A: countA, B: countB, AB: countAB }];
          }
          return [...prev, { t: localTime, A: countA, B: countB, AB: countAB }];
        });
      }

      animationFrameIdRef.current = requestAnimationFrame(updateSimulationFrame);
    };

    const drawFrame = () => {
      // Clear background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 40; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 40; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw shockwave and collision ripple sparks beautifully
      const activeSparks = sparksRef.current;
      for (let i = 0; i < activeSparks.length; i++) {
        const s = activeSparks[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.color === '#ec4899' ? 2 : 1;
        ctx.globalAlpha = Math.max(0, s.opacity);
        ctx.stroke();
        ctx.closePath();
      }
      ctx.globalAlpha = 1.0; // Reset global alpha

      // Draw Boundary box
      ctx.strokeStyle = useCatalyst ? '#a855f7' : '#334155';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      if (useCatalyst) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
      }

      // Render each bouncing particle
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        // Solid fill
        ctx.fillStyle = p.color;
        ctx.fill();

        // High gloss overlay representing atom
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.closePath();

        // Draw chemical symbol over sphere
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type, p.x, p.y);
      }

      // Draw surface boundary for clumped chunk to make it clear visually
      if (surfaceArea === 'chunk') {
        const countBInChunk = particles.filter(p => p.type === 'B' && p.clustered).length;
        if (countBInChunk > 0) {
          ctx.beginPath();
          ctx.arc(200, 125, 48, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
          ctx.lineWidth = 4;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.closePath();
          
          ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
          ctx.beginPath();
          ctx.arc(200, 125, 48, 0, Math.PI * 2);
          ctx.fill();
          ctx.closePath();

          ctx.fillStyle = '#60a5fa';
          ctx.font = '9px monospace';
          ctx.fillText('BONGKAHAN B', 200, 72);
        }
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(updateSimulationFrame);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, concentrationA, concentrationB, useCatalyst, temperature, surfaceArea]);

  // Derived current particle stats
  const currentParticles = particlesRef.current;
  const countA = currentParticles.filter(p => p.type === 'A').length;
  const countB = currentParticles.filter(p => p.type === 'B').length;
  const countAB = currentParticles.filter(p => p.type === 'AB').length;

  // React rate coefficients
  const rateConstantK = 0.002 * (temperature / 298) * (useCatalyst ? 3.5 : 1.0);
  const reactionRate = rateConstantK * countA * countB;

  // Handle quiz answer choice
  const handleSelectAnswer = (idx: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedAnswer(idx);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return;
    setHasSubmittedAnswer(true);
    if (selectedAnswer === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setHasSubmittedAnswer(false);
    if (currentQuizIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setShowQuizResult(true);
      // Dispatch custom event to update student progress
      window.dispatchEvent(new CustomEvent('chemvibe_activity', {
        detail: {
          activityType: 'quiz_completed',
          labId: 'kinetics',
          title: 'Kuis Kinetika Kimia',
          description: `Menyelesaikan evaluasi laju reaksi dengan skor ${quizScore}/${QUIZ_QUESTIONS.length}`,
          score: { earned: quizScore, total: QUIZ_QUESTIONS.length }
        }
      }));
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setHasSubmittedAnswer(false);
    setQuizScore(0);
    setShowQuizResult(false);
  };

  return (
    <div className="space-y-6">
      {/* Header element */}
      <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Laboratorium Kinetika Kimia & Laju Reaksi
          </h2>
          <p className="text-zinc-400 text-sm">
            Simulasikan teori tumbukan Kelas XI. Manipulasi konsentrasi, temperatur, luas bidang sentuh, & katalis untuk mempercepat laju perubahan kimia.
          </p>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex bg-zinc-900/60 p-1 rounded-lg border border-zinc-800 self-start">
          <button 
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'simulation' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Virtual Lab
          </button>
          <button 
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'theory' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Teori Laju Reaksi
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'quiz' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Kuis Kinetika
          </button>
        </div>
      </div>

      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Sidebar (Left: Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel border-white/5 rounded-2xl p-5 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">PARAMETER REAKSI</span>
                <button 
                  onClick={handleResetSimulation}
                  className="p-1 px-2 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded bg-zinc-950/40 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Ulang Reaksi
                </button>
              </div>

              {/* Concentration Sliders */}
              <div className="space-y-4 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900/80">
                <span className="text-xs font-bold text-emerald-400 block font-sans">1. Konsentrasi Awal Pereaksi</span>
                
                {/* Reactant A Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                      Partikel Red [A]
                    </span>
                    <span className="font-mono text-white font-bold">{concentrationA} Partikel</span>
                  </div>
                  <input 
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={concentrationA}
                    onChange={(e) => setConcentrationA(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                {/* Reactant B Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                      Partikel Blue [B]
                    </span>
                    <span className="font-mono text-white font-bold">{concentrationB} Partikel</span>
                  </div>
                  <input 
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={concentrationB}
                    onChange={(e) => setConcentrationB(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900/80">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-sans">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    2. Temperatur Bejana (Suhu)
                  </span>
                  <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-1 py-0.2 rounded font-mono">
                    {(temperature - 273).toFixed(0)}°C
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Energi Kinetik Gerak</span>
                    <span className="font-mono text-zinc-300 font-bold">{temperature} Kelvin</span>
                  </div>
                  <input 
                    type="range"
                    min="273"
                    max="373"
                    step="5"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 italic leading-snug">
                  *Suhu yang lebih tinggi melipatgandakan kecepatan gerak dan gaya benturan partikel reaktan.
                </p>
              </div>

              {/* Surface Area Selector */}
              <div className="space-y-2 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900/80">
                <span className="text-xs font-bold text-emerald-400 block font-sans">3. Luas Permukaan Bidang Sentuh (B)</span>
                
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button 
                    onClick={() => setSurfaceArea('powder')}
                    className={`p-2 rounded-lg text-xs font-bold font-sans transition border cursor-pointer ${
                      surfaceArea === 'powder' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-white'
                    }`}
                  >
                    Serbuk Halus
                  </button>
                  <button 
                    onClick={() => setSurfaceArea('chunk')}
                    className={`p-2 rounded-lg text-xs font-bold font-sans transition border cursor-pointer ${
                      surfaceArea === 'chunk' 
                        ? 'bg-amber-600/10 border-amber-500/30 text-amber-500' 
                        : 'bg-zinc-900 border-zinc-850 text-zinc-500 hover:text-white'
                    }`}
                  >
                    Bongkahan (Clump)
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug">
                  {surfaceArea === 'powder' 
                    ? 'Serbuk halus terdispersi merata, memaksimalkan bidang sentuhan antar-partikel.'
                    : 'Bongkahan menyandera molekul B di bagian dalam, membatasi tabrakan langsung hanya di kulit luar.'}
                </p>
              </div>

              {/* Catalyst Toggle */}
              <div className="space-y-2 bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    4. Tambahkan Katalis Reaksi
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={useCatalyst}
                      onChange={() => setUseCatalyst(!useCatalyst)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500 peer-checked:after:bg-slate-950"></div>
                  </label>
                </div>
                <p className="text-[10px] text-zinc-555 leading-relaxed italic">
                  Katalis menurunkan tingkat energi aktivasi. Membantu tumbukan tidak sempurna tetap menghasilkan rekombinasi produk.
                </p>
              </div>

              {/* Sonification Sound Explanation Panel */}
              <div className="space-y-2 bg-purple-950/10 p-3.5 rounded-xl border border-purple-550/15">
                <span className="text-[11px] font-bold text-purple-450 flex items-center gap-1 font-sans">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  Sintesis Audio Laju Reaksi
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Sonifikasi interaktif mengonversi dinamika kimia menjadi melodi ritmis:
                </p>
                <ul className="text-[9.5px] text-zinc-500 space-y-1 list-disc pl-4.5">
                  <li><strong className="text-zinc-450">Tempo Ketukan</strong>: Berubah dinamis; cepat harmonis saat reaksi tinggi, melambat tenang saat laju mereda.</li>
                  <li><strong className="text-zinc-450">Klip Kaca (Chime)</strong>: Menghasilkan tinkle frekuensi tinggi setiap kali reaksi menghasilkan produk baru [AB].</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Visualization Area, Charts, and Diagnostics (Right: Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Real-time Collision Chamber Card */}
            <div className="glass-panel border-white/5 rounded-2xl p-5 flex flex-col justify-between items-center relative overflow-hidden">
              <div className="w-full flex justify-between items-center mb-3">
                <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                  <Layers className="w-4 h-4 text-emerald-400" /> CHM_COLLISION_CHAMBER: TUMBUKAN AKHIR REAKTAND
                </span>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Synthesis Audio Dynamic Sonifier Button */}
                  <button 
                    onClick={initAudioContextOrToggle}
                    className={`p-1.5 px-2.5 rounded-lg border text-[10px] flex items-center gap-1 transition cursor-pointer ${
                      isAudioEnabled 
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-400 font-bold hover:bg-purple-500/25 animate-pulse' 
                        : 'bg-zinc-950/60 border-zinc-805 text-zinc-400 hover:text-zinc-300'
                    }`}
                    title="Aktifkan sonifikasi sintesis audio laju reaksi"
                  >
                    {isAudioEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                        Acoustic Synth: On
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                        Sintesis Audio Acoustic
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 px-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60 text-[10px] flex items-center gap-1 text-zinc-300 hover:text-white transition cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-yellow-500" /> Jeda Simulasi
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" /> Mulai Simulasi
                      </>
                    )}
                  </button>

                  {isPlaying && (
                    <button 
                      onClick={triggerEnergyPulse}
                      className={`p-1.5 px-2.5 rounded-lg border text-[10px] flex items-center gap-1 font-bold tracking-tight transition cursor-pointer ${
                        pulseValue > 1.0 
                          ? 'bg-orange-500 border-orange-400 text-slate-950 animate-pulse' 
                          : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${pulseValue > 1.0 ? 'text-slate-950' : 'text-orange-450'}`} />
                      {pulseValue > 1.0 ? `Pulsa Akut: ${pulseValue.toFixed(1)}x` : 'Picu Pulsa Panas'}
                    </button>
                  )}

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    completionPercentage >= 95 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}>
                    {completionPercentage >= 95 ? 'REAKSI SELESAI' : `PROSES: ${completionPercentage.toFixed(0)}%`}
                  </span>
                </div>
              </div>

              {/* Core Canvas Simulator */}
              <div className="w-full relative rounded-xl overflow-hidden border border-zinc-900 bg-zinc-950">
                <canvas 
                  ref={canvasRef} 
                  width={400} 
                  height={250} 
                  className="w-full aspect-[8/5] block"
                />

                {/* Absolut float metrics banner */}
                <div className={`absolute bottom-3 left-3 border border-zinc-800/80 px-3 py-2 rounded-lg text-[10.5px] font-mono leading-none space-y-1.5 backdrop-blur-sm shadow-xl ${theme === 'dark' ? 'bg-slate-950/90 text-zinc-400' : 'bg-slate-100/90 text-slate-600'}`}>
                  <div className="flex items-center gap-2 font-bold justify-between">
                    <span className="text-red-400">● Zat [A]:</span>
                    <span className="text-white">{countA} mol</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold justify-between">
                    <span className="text-blue-400">● Zat [B]:</span>
                    <span className="text-white">{countB} mol</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold justify-between border-t border-zinc-800/80 pt-1">
                    <span className="text-purple-400">● Produk [AB]:</span>
                    <span className="text-white font-black">{countAB} mol</span>
                  </div>
                </div>

                {/* Time Indicator top flat */}
                <div className="absolute top-3 right-3 bg-zinc-900/90 border border-zinc-800/60 px-2 py-1 rounded text-[9.5px] font-mono text-zinc-400">
                  WAKTU: <span className="text-white font-bold">{reactionTime.toFixed(1)}s</span>
                </div>
              </div>
            </div>

            {/* Live Chart area and Catalyst peak Curve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Curve chart of Concentration vs Time */}
              <div className="glass-panel border-white/5 rounded-2xl p-4.5 space-y-4 flex flex-col justify-between h-[270px] min-h-[270px]">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900/40">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> TREN KONSENTRASI REAKTAN VS WAKTU
                  </span>
                </div>

                <div className="h-44 relative w-full mt-2">
                  {historyData.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center text-[10px] text-zinc-500 font-mono py-10 bg-zinc-950/20 rounded-xl border border-zinc-900/40">
                      <span>Simulasi berjalan akan mengalirkan data deret berkala di sini...</span>
                      <span className="text-cyan-500/80 mt-1">Suhu, katalis, dan bidang sentuh mempengaruhi kemiringan garis laju</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="99%" height="100%">
                      <RechartsLineChart data={historyData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#121214" />
                        <XAxis 
                          dataKey="t" 
                          stroke="#52525b"
                          fontSize={9}
                          tickFormatter={(t) => `${t.toFixed(0)}s`}
                          fontFamily="monospace"
                        />
                        <YAxis stroke="#52525b" fontSize={9} fontFamily="monospace" />
                        <RechartsTooltip content={<ConcentrationTooltip />} />
                        <RechartsLegend 
                          iconSize={8} 
                          wrapperStyle={{ fontSize: '8.5px', fontFamily: 'monospace' }} 
                        />
                        <RechartsLine 
                          type="monotone" 
                          dataKey="A" 
                          name="Reaktan [A]" 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          dot={false} 
                        />
                        <RechartsLine 
                          type="monotone" 
                          dataKey="B" 
                          name="Reaktan [B]" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          dot={false} 
                        />
                        <RechartsLine 
                          type="monotone" 
                          dataKey="AB" 
                          name="Produk [AB]" 
                          stroke="#a855f7" 
                          strokeWidth={2.5} 
                          dot={false} 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Energy Barrier Diagram Curve (Ea transition state illustration) */}
              <div className="glass-panel border-white/5 rounded-2xl p-4.5 space-y-4 flex flex-col justify-between h-[270px] min-h-[270px]">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900/40">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-400" /> KURVA PROFIL ENERGI AKTIVASI (Ea / ENTALPI)
                  </span>
                  {useCatalyst && (
                    <span className="bg-purple-950/40 text-purple-400 text-[8.5px] border border-purple-800/40 px-1.5 py-0.5 rounded font-mono animate-pulse">
                      ⚡ Katalis Aktif
                    </span>
                  )}
                </div>

                <div className="h-44 relative w-full mt-2">
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={energyProfileData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#121214" />
                      <XAxis 
                        dataKey="coord" 
                        stroke="#52525b"
                        fontSize={8.5}
                        tickFormatter={(v) => v === 50 ? 'TS' : `${v}%`}
                        fontFamily="monospace"
                        label={{ value: 'Koordinat Reaksi', position: 'insideBottom', offset: -5, fill: '#52525b', fontSize: 8.5, fontFamily: 'monospace' }}
                      />
                      <YAxis 
                        domain={[0, 90]} 
                        stroke="#52525b" 
                        fontSize={8.5} 
                        fontFamily="monospace"
                        label={{ value: 'Energi (kJ/mol)', angle: -90, position: 'insideLeft', offset: -10, fill: '#52525b', fontSize: 8.5, fontFamily: 'monospace' }}
                      />
                      <RechartsTooltip content={<EnergyTooltip />} />
                      
                      {/* Reactant Base level baseline reference */}
                      <RechartsReferenceLine y={34} stroke="#3f3f46" strokeDasharray="3 3" />
                      {/* Product Base level baseline reference */}
                      <RechartsReferenceLine y={14} stroke="#3f3f46" strokeDasharray="3 3" />

                      {/* Standard Energy Barrier curve */}
                      <Area 
                        type="monotone" 
                        dataKey="std" 
                        name="Energi Standar" 
                        stroke="#ef2244" 
                        strokeWidth={useCatalyst ? 1.5 : 2.5}
                        strokeDasharray={useCatalyst ? "3 3" : "0"}
                        fillOpacity={useCatalyst ? 0 : 1}
                        fill="url(#colorStd)" 
                      />

                      {/* Catalyzed Energy Barrier curve */}
                      {(useCatalyst || true) && (
                        <Area 
                          type="monotone" 
                          dataKey="cat" 
                          name="Jalur Katalis" 
                          stroke="#a855f7" 
                          strokeWidth={useCatalyst ? 2.5 : 1}
                          strokeDasharray={useCatalyst ? "0" : "2 2"}
                          fillOpacity={useCatalyst ? 1 : 0.05}
                          fill="url(#colorCat)" 
                        />
                      )}

                      {/* Reference markers representing reactants and products directly */}
                      <RechartsReferenceDot x={15} y={34} r={4} fill="#ef4444" stroke="#ffffff" />
                      <RechartsReferenceDot x={85} y={14} r={4} fill="#3b82f6" stroke="#ffffff" />
                      
                      {/* Peak transition states representation dots */}
                      <RechartsReferenceDot x={50} y={82} r={4} fill="#ef2244" stroke="#ffffff" />
                      {useCatalyst && (
                        <RechartsReferenceDot x={50} y={60} r={4} fill="#a855f7" stroke="#ffffff" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Real-time Collision Diagnostics & Efficiency Stats */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-950/40 p-4.5 rounded-2xl border border-zinc-900/80">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-550 font-bold uppercase tracking-wider block">TOTAL TUMBUKAN</span>
                  <span className="font-mono text-xl text-white font-black block">{(effCollisions + ineffCollisions).toLocaleString()}</span>
                  <span className="text-[8.5px] text-zinc-500 block leading-none">Total deteksi benturan</span>
                </div>
                
                <div className="space-y-1 border-l border-zinc-900/80 pl-4">
                  <span className="text-[9px] font-mono text-pink-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-550 animate-pulse inline-block" />
                    TUMBUKAN EFEKTIF
                  </span>
                  <span className="font-mono text-xl text-pink-400 font-black block">{effCollisions.toLocaleString()}</span>
                  <span className="text-[8.5px] text-pink-500/75 block leading-none">Menghasilkan produk [AB]</span>
                </div>

                <div className="space-y-1 border-l border-zinc-900/80 pl-4">
                  <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-wider block">TUMBUKAN TIDAK EFEKTIF</span>
                  <span className="font-mono text-xl text-amber-500 font-black block">{ineffCollisions.toLocaleString()}</span>
                  <span className="text-[8.5px] text-zinc-500 block leading-none">Energi kurang / arah salah</span>
                </div>

                <div className="space-y-1 border-l border-zinc-900/80 pl-4">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">EFISIENSI BENTURAN</span>
                  <span className="font-mono text-xl text-emerald-400 font-black block">
                    {(effCollisions + ineffCollisions > 0 
                      ? (effCollisions / (effCollisions + ineffCollisions) * 100).toFixed(1) 
                      : "0.0")}%
                  </span>
                  <span className="text-[8.5px] text-zinc-500 block leading-none">Rasio tumbukan sukses</span>
                </div>
              </div>

              {/* Advanced Reaction Thermodynamics & Equilibrium Constant Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950/25 p-4 rounded-xl border border-zinc-900/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 font-mono text-xs font-black select-none">
                    K_c
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold block uppercase tracking-wider">Tetapan Kesetimbangan (Ke)</span>
                    <span className="font-mono text-xs text-purple-400 font-black block mt-0.5">{estEquilibriumK}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-zinc-900/60 pt-2.5 md:pt-0 md:pl-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 font-mono text-xs font-black select-none">
                    R_t
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">Laju Reaksi Sesaat (r)</span>
                    <span className="font-mono text-xs text-emerald-400 font-black block mt-0.5">
                      {realtimeRate === 0 ? "0.000" : (realtimeRate * 10).toFixed(3)} M/s
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-zinc-900/60 pt-2.5 md:pt-0 md:pl-4">
                  <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 font-mono text-xs font-bold select-none">
                    ΔH
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold block uppercase tracking-wider">Perubahan Entalpi (ΔH)</span>
                    <span className="font-mono text-xs text-cyan-400 font-medium block mt-0.5">
                      -20.0 kJ/mol (Eksotermik)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chemical diagnostics readout */}
            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 leading-relaxed">
              <div className="space-y-1">
                <div className="text-zinc-500 font-mono text-[9px] uppercase font-bold tracking-wider">HUKUM LAJU REAKSI TEORETIS SEMENTARA</div>
                <div className="font-mono text-emerald-400 font-black text-sm">
                  r = {rateConstantK.toFixed(5)} × [A]¹ × [B]¹
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-zinc-500 font-mono text-[9px] uppercase font-bold tracking-wider text-right md:-mt-0">LAJU REAKSI AKTUAL</div>
                <div className="font-mono text-zinc-300 text-right font-bold">
                  {reactionRate.toFixed(2)} partikel/detik
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'theory' && (
        <div className="glass-panel border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white font-sans">Landasan Teori: Kinetika Kimia Kelas XI</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-sm text-zinc-300">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-sm inline-block"></span>
                  1. Teori Tumbukan (Collision Theory)
                </h4>
                <p className="text-[12.5px] leading-relaxed">
                  Tidak semua tabrakan antar partikel menghasilkan perubahan kimia. Agar reaksi dapat berlangsung, partikel harus menabrak dalam orientasi ruang ruang yang tepat (efektif) dan memiliki kecukupan energi kinetik untuk melebihi tingkat batasan minimum yang dikenal sebagai <strong>Energi Aktivasi (Ea)</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-sm inline-block"></span>
                  2. Pengaruh Suhu / Temperatur
                </h4>
                <p className="text-[12.5px] leading-relaxed">
                  Temperatur memanifestasikan tingkat energi kinetik pada tingkat molekuler. Ketika bejana dipanaskan, kecepatan gerak molekul melompat drastis. Ini memicu dua efek ganda: tumbukan antar partikel terjadi lebih sering, dan tumbukan terjadi dalam tingkat impak yang jauh lebih bertenaga untuk menyubstitusi pemutusan ikatan lama.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-sm inline-block"></span>
                  3. Luas Permukaan Bidang Sentuh
                </h4>
                <p className="text-[12.5px] leading-relaxed">
                  Benda padat yang dipotong atau dihancurkan menjadi partikel halus (serbuk halus) memiliki luas permukaan tersingkap jauh lebih melimpah dibanding sebungkus bongkahan tunggal. Luas permukaan sentuh yang lapang memberi ruang kesempatan tumbukan serbuan partikel reaktan cair/gas lain secara simultan.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-sm inline-block"></span>
                  4. Efek Katalisator
                </h4>
                <p className="text-[12.5px] leading-relaxed">
                  Katalis adalah agen khusus yang mempercepat laju reaksi tanpa ikut terkonsumsi secara permanen. Cara kerjanya yang elegan adalah mengubah bentuk jalur reaksi (menyediakan jalur tol alternatif) yang memiliki batas rintangan <strong>Energi Aktivasi (Ea)</strong> yang jauh lebih rendah, sehingga tumbukan tidak bersuara pun dapat melampauinya dengan gampang.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-4.5 rounded-xl border border-zinc-900 font-mono text-xs text-slate-350 space-y-2">
            <h4 className="text-[10.5px] font-black text-emerald-400">RUMUS LAJU REAKSI UMUM</h4>
            <div className="text-sm text-center text-emerald-450 leading-relaxed font-bold">
              {"r = k [Reactant_A]^x [Reactant_B]^y"}
            </div>
            <p className="text-[10px] text-zinc-500 text-center leading-normal">
              Dimana k adalah konstanta laju reaksi (sensitif terhadap temperatur & katalis), sedangkan x dan y merupakan derajat orde reaksi yang diperoleh secara eksperimen nyata.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="glass-panel border-white/5 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span className="font-black text-white text-base">Evaluasi Kinetika Kimia SMA</span>
            </div>
            <span className="font-mono text-xs text-zinc-500">
              PERNYATAAN {currentQuizIndex + 1} DARI {QUIZ_QUESTIONS.length}
            </span>
          </div>

          {!showQuizResult ? (
            <div className="space-y-6 animate-fade-in">
              {/* Question heading */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-zinc-100 font-sans leading-relaxed">
                  {QUIZ_QUESTIONS[currentQuizIndex].question}
                </h4>
              </div>

              {/* Answers options stack */}
              <div className="space-y-2.5">
                {QUIZ_QUESTIONS[currentQuizIndex].options.map((opt, idx) => {
                  let optStyle = 'bg-zinc-900/60 border-zinc-850 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/40';
                  
                  if (hasSubmittedAnswer) {
                    if (idx === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer) {
                      optStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold';
                    } else if (idx === selectedAnswer) {
                      optStyle = 'bg-red-500/15 border-red-500/50 text-red-300';
                    } else {
                      optStyle = 'bg-zinc-950/20 border-zinc-900 text-zinc-650';
                    }
                  } else if (idx === selectedAnswer) {
                    optStyle = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 ring-1 ring-emerald-500/20';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={hasSubmittedAnswer}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition duration-150 flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span className="leading-relaxed">{opt}</span>
                      {hasSubmittedAnswer && idx === QUIZ_QUESTIONS[currentQuizIndex].correctAnswer && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-3" />
                      )}
                      {hasSubmittedAnswer && idx === selectedAnswer && idx !== QUIZ_QUESTIONS[currentQuizIndex].correctAnswer && (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-3" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation area */}
              {hasSubmittedAnswer && (
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 text-xs leading-relaxed space-y-1.5 animate-fade-in">
                  <div className="font-bold text-emerald-404 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                    <Info className="w-3.5 h-3.5 text-emerald-450" /> BAHASAN EKSKLUSIF:
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    {QUIZ_QUESTIONS[currentQuizIndex].explanation}
                  </p>
                </div>
              )}

              {/* Action buttons footer */}
              <div className="flex justify-end pt-3">
                {!hasSubmittedAnswer ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedAnswer === null}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-lg transition-all"
                  >
                    Kirim Jawaban <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuiz}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-lg transition-all"
                  >
                    {currentQuizIndex + 1 < QUIZ_QUESTIONS.length ? 'Pernyataan Lanjut' : 'Lihat Hasil Nilai'} <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Award className="w-12 h-12" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Evaluasi Laju Reaksi Selesai!</h4>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  Selamat atas usahamu! Kamu mencetak hasil ketepatan sebagai berikut:
                </p>
              </div>

              <div className="text-4xl font-mono font-black text-emerald-400">
                {Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)} / 100
              </div>

              <p className="text-xs text-zinc-500">
                ({quizScore} keputusan benar dari total {QUIZ_QUESTIONS.length} pertanyaan kurikulum.)
              </p>

              <button
                onClick={handleResetQuiz}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                Ulangi Evaluasi <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom tooltip renderer for Reaction Coordinate Energy Profile
const EnergyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const x = data.coord;
    let stage = "Bahan Dasar Reaktan";
    let color = "text-sky-400";
    if (x >= 45 && x <= 55) {
      stage = "Kompleks Teraktivasi (Keadaan Transisi)";
      color = "text-amber-400 font-bold animate-pulse";
    } else if (x > 65) {
      stage = "Stabilisasi Produk Akhir (AB)";
      color = "text-purple-400";
    }
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 p-3 rounded-xl shadow-2xl font-mono text-[10.5px] text-zinc-350 space-y-1.5 backdrop-blur-md">
        <div className="text-zinc-400 border-b border-zinc-800/40 pb-1 mb-1 font-bold">Jalan Reaksi: {x}%</div>
        <div className="flex justify-between gap-5">
          <span>H Standar:</span>
          <span className="text-red-400 font-bold">{data.std} kJ/mol</span>
        </div>
        <div className="flex justify-between gap-5">
          <span>H Katalis:</span>
          <span className="text-purple-400 font-bold">{data.cat} kJ/mol</span>
        </div>
        <div className={`text-[9.5px] mt-1 pt-1 border-t border-zinc-900/40 ${color}`}>
          ℹ️ {stage}
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip renderer for Concentration History Chart
const ConcentrationTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 p-3 rounded-xl shadow-2xl font-mono text-[10.5px] text-zinc-300 space-y-1.5 backdrop-blur-md">
        <div className="text-zinc-400 border-b border-zinc-800/40 pb-1 mb-1 font-bold">Waktu: {data.t.toFixed(1)} detik</div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-red-400 flex items-center gap-1">● Reaktan [A]:</span>
          <span className="font-bold text-white font-mono">{data.A} partikel</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-blue-400 flex items-center gap-1">● Reaktan [B]:</span>
          <span className="font-bold text-white font-mono">{data.B} partikel</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-purple-400 flex items-center gap-1">● Produk [AB]:</span>
          <span className="font-bold text-white font-mono">{data.AB} partikel</span>
        </div>
      </div>
    );
  }
  return null;
};
