/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, Sliders, Info, HelpCircle, RefreshCw, 
  Award, CheckCircle, XCircle, ChevronRight,
  TrendingUp, Sparkles, BookOpen, Layers, Wind, Droplet,
  Volume2, VolumeX
} from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Berdasarkan Asas Le Chatelier, ke arah manakah kesetimbangan gas N₂O₄ (tidak berwarna) ⇄ 2 NO₂ (cokelat) akan bergeser saat suhu sistem dinaikkan? Reaksi bersifat endotermik (ΔH = +57.2 kJ/mol).",
    options: [
      "Bergeser ke kiri (arah N₂O₄), membuat larutan/gas menjadi tidak berwarna karena reaksi melepas panas.",
      "Bergeser ke kanan (arah NO₂), membuat warna gas menjadi cokelat lebih pekat karena reaksi menyerap panas.",
      "Tidak terjadi pergeseran karena perubahan suhu hanya memengaruhi nilai konstanta kinetis k tanpa mengutak-atik Kc.",
      "Kesetimbangan mulanya bergeser ke kanan lalu segera berayun kembali ke kiri membentuk osilasi tetap."
    ],
    correctAnswer: 1,
    explanation: "Karena reaksi pembentukan NO₂ berenergi positif/endotermik (ΔH > 0), peningkatan suhu memicu sistem untuk menyerap kelebihan panas dengan cara bergeser ke arah kanan (produk endotermis). Akibatnya, konsentrasi gas NO₂ yang berwarna cokelat meningkat pekat."
  },
  {
    question: "Dalam sistem reaksi larutan Fe³⁺ (kuning jingga) + SCN⁻ (tidak berwarna) ⇄ FeSCN²⁺ (merah darah), apa yang terjadi jika ke dalam larutan ditambahkan sekeping kristal NaF atau Na₂HPO₄?",
    options: [
      "Warna merah semakin pekat karena ion sulfat mengikat warna merah darah menjadi endapan reaktif.",
      "Warna merah memudar karena ion fluorida atau hidrogen fosfat mengikat Fe³⁺ membentuk kompleks stabil tak berwarna, menurunkan [Fe³⁺] sehingga kesetimbangan bergeser ke kiri.",
      "Tidak terjadi perubahan warna sama sekali karena NaF bersifat netral dan tidak ikut serta dalam sirkuit redoks.",
      "Konsentrasi SCN⁻ spontan merosot tajam menjadi nol akibat pembentukan gas amonia hidrogen sulfida."
    ],
    correctAnswer: 1,
    explanation: "Fluorida (F⁻) atau hidrogen fosfat (HPO₄²⁻) bertindak sebagai agen pengompleks yang sangat kuat bagi Fe³⁺, membentuk [FeF₆]³⁻ yang sangat stabil dan tidak berwarna. Hal ini 'merampas' ion Fe³⁺ bebas dari larutan. Karena [Fe³⁺] anjlok, kesetimbangan terpaksa bergeser ke kiri (arah reaktan) untuk menambah Fe³⁺ yang hilang, menyebabkan kompleks merah FeSCN²⁺ terurai dan warna memudar."
  },
  {
    question: "Bagaimanakah pengaruh kompresi (penurunan volume / peningkatan tekanan) pada kondisi kesetimbangan gas N₂O₄ (1 mol gas) ⇄ 2 NO₂ (2 mol gas)?",
    options: [
      "Kesetimbangan bergeser ke arah reaktan (kiri, N₂O₄) karena sistem bergeser menuju ke arah dengan jumlah mol gas terkecil.",
      "Kesetimbangan bergeser ke arah produk (kanan, NO₂) karena molekul gas terpaksa pecah menjadi fragmen ganda.",
      "Volume wadah tidak memberikan pengaruh mekanis atau spasial apa pun terhadap posisi kestabilan spesies gas.",
      "Seluruh gas akan langsung mengembun seketika menjadi logam padat yang mengendap di dasar tabung piston."
    ],
    correctAnswer: 0,
    explanation: "Menurut Asas Le Chatelier, peningkatan tekanan (penurunan volume) mendorong sistem mengimbangi beban tekanan dengan memilih jalur yang menghasilkan jumlah molekul gas lebih sedikit. Di sini, sisi kiri (N₂O₄) memiliki 1 koefisien gas sedangkan sisi kanan (NO₂) memiliki 2 koefisien gas. Oleh karena itu, kompresi memicu pergeseran ke arah kiri."
  },
  {
    question: "Jika ke dalam bejana kesetimbangan larutan Fe³⁺ + SCN⁻ ⇄ FeSCN²⁺ ditambahkan sejumlah air murni (proses pengenceran / dilusi), arah pergeseran kesetimbangan yang terjadi adalah...",
    options: [
      "Bergeser ke arah kanan (FeSCN²⁺) karena air memperlancar tumbukan ionik bebas.",
      "Bergeser ke arah kiri (Fe³⁺ dan SCN⁻) karena pengenceran menurunkan konsentrasi dan mendorong pergeseran ke arah jumlah partikel terbanyak.",
      "Sistem membeku seketika karena air mengganggu nilai konstanta kesetimbangan konvensional.",
      "Warna larutan menjadi hitam legam akibat oksidasi hidrogen peroksida dari atmosfer."
    ],
    correctAnswer: 1,
    explanation: "Pengenceran (membesarnya volume larutan) menurunkan konsentrasi seluruh spesi dalam larutan secara mendadak. Untuk memitigasi penurunan konsentrasi ini, kesetimbangan bergeser ke arah yang menghasilkan jumlah partikel terlarut lebih banyak (ke kiri: Fe³⁺ + SCN⁻ = 2 partikel, kanan: FeSCN²⁺ = 1 partikel), guna menyesuaikan kembali rasio Qc agar setara Kc."
  }
];

export default function EquilibriumLab() {
  // Choice of chemical system
  // 'thiocyanate' : Fe3+ + SCN- <=> FeSCN2+ (Aqueous solution)
  // 'gas-no2'     : N2O4 <=> 2 NO2 (Gaseous system)
  const [activeSystem, setActiveSystem] = useState<'thiocyanate' | 'gas-no2'>('thiocyanate');
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory' | 'quiz'>('simulation');

  // Multi-state inputs for System 1 (Thiocyanate)
  const [feConc, setFeConc] = useState<number>(1.0); // Concentration of Fe(III) in units (0.1 to 3.0)
  const [scnConc, setScnConc] = useState<number>(1.0); // Concentration of SCN- in units (0.1 to 3.0)
  const [complexConc, setComplexConc] = useState<number>(1.0); // FeSCN2+ start state
  const [complexLigandAdded, setComplexLigandAdded] = useState<boolean>(false); // Adding NaF which binds Fe3+ (removing active Fe3+)
  const [dilutionLevel, setDilutionLevel] = useState<number>(1.0); // Dilution multiplier (1.0x to 4.0x)
  const [thioTemp, setThioTemp] = useState<number>(298); // Kelvin: 273 - 353 K (reaction exothermic, deltaH < 0)

  // Multi-state inputs for System 2 (NO2 gas)
  const [n2o4Conc, setN2o4Conc] = useState<number>(1.0); // Concentration of N2O4 (0.1 to 3.0)
  const [no2Conc, setNo2Conc] = useState<number>(1.0); // Concentration of NO2 (0.1 to 3.0)
  const [gasVolume, setGasVolume] = useState<number>(2.0); // Volume in Liters (1.0 to 4.0 L)
  const [gasTemp, setGasTemp] = useState<number>(298); // K: 273 - 373 K (reaction endothermic, deltaH > 0)

  // Dispatch state updates to window for adaptive feedback
  useEffect(() => {
    (window as any).chemvibe_latest_state = {
      lab: 'equilibrium-lab',
      timestamp: Date.now(),
      data: {
        activeSystem,
        feConc,
        scnConc,
        complexLigandAdded,
        dilutionLevel,
        thioTemp,
        n2o4Conc,
        no2Conc,
        gasVolume,
        gasTemp
      }
    };
    window.dispatchEvent(new CustomEvent('chemvibe_state_change', {
      detail: { lab: 'equilibrium-lab' }
    }));
  }, [
    activeSystem, feConc, scnConc, complexLigandAdded, dilutionLevel,
    thioTemp, n2o4Conc, no2Conc, gasVolume, gasTemp
  ]);

  // Audio Synthesis States & Refs for dynamic bubbling sounds
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const isAudioEnabledRef = React.useRef<boolean>(false);
  const activeSystemRef = React.useRef<string>('thiocyanate');
  const timerIdRef = React.useRef<any>(null);

  // Sync refs to bypass stale capture in async timers
  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  useEffect(() => {
    activeSystemRef.current = activeSystem;
  }, [activeSystem]);

  // Handle play bubble sound
  const playBubbleSound = () => {
    try {
      if (!isAudioEnabledRef.current) return;
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sine';
      const now = ctx.currentTime;

      // Base frequency depends on whether it's liquid (thiocyanate - slightly lower/mellow)
      // or gas (gas-no2 - slightly higher/tinkly like popping bubbles)
      const isLiquid = activeSystemRef.current === 'thiocyanate';
      const baseFreq = isLiquid ? 180 + Math.random() * 60 : 250 + Math.random() * 100;
      const duration = isLiquid ? 0.08 + Math.random() * 0.06 : 0.05 + Math.random() * 0.05;

      // Exponential pitch sweep upwards mimic physical bubble rising/shrinking
      const endFreq = baseFreq * (1.8 + Math.random() * 1.4);

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.04, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch (_) {}
  };

  // Setup loop for bubble sounds based dynamically on chemical circumstances!
  useEffect(() => {
    if (!isAudioEnabled) {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }

    const scheduleNextBubble = () => {
      if (!isAudioEnabledRef.current) return;

      // Dynamic interval calculation based on state
      let interval = 800; // default in ms
      if (activeSystemRef.current === 'thiocyanate') {
        const tempRatio = (thioTemp - 273) / (353 - 273); // 0 to 1
        const concSum = feConc + scnConc; // 0.2 to 6.0
        // More active bubbling with higher temperature, dilution and concentration
        const activityScore = tempRatio * 0.4 + (concSum / 6) * 0.3 + (dilutionLevel / 4.0) * 0.3;
        interval = Math.max(120, 1500 - activityScore * 1300);
      } else {
        const tempRatio = (gasTemp - 273) / (373 - 273); // 0 to 1
        // Gas molecules collide more and "bubble/pop" under higher pressure/smaller volume and higher temperatures
        const activityScore = tempRatio * 0.6 + ((n2o4Conc + no2Conc) / 6.0) * 0.2 + ((4.0 - gasVolume) / 3.0) * 0.2;
        interval = Math.max(80, 1300 - activityScore * 1150);
      }

      playBubbleSound();

      // Add slight organic random flutter to the bubble popping times so they don't sound like a strict metronome
      const organicDelay = interval * (0.85 + Math.random() * 0.3);
      timerIdRef.current = setTimeout(scheduleNextBubble, organicDelay);
    };

    scheduleNextBubble();

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [isAudioEnabled, activeSystem, thioTemp, feConc, scnConc, dilutionLevel, gasTemp, gasVolume, n2o4Conc, no2Conc]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  // Computed/resolved equilibrium states
  const [computedState, setComputedState] = useState<{
    eqConcA: number; // Reactant A (Fe3+ or N2O4)
    eqConcB: number; // Reactant B (SCN- or 2*NO2)
    eqConcC: number; // Product C (FeSCN2+ or NO2)
    directionOfShift: 'KANAN' | 'KIRI' | 'SETARA';
    colorDescription: string;
    beakerColor: string;
    qcValue: number;
    kcValue: number;
  }>({
    eqConcA: 1,
    eqConcB: 1,
    eqConcC: 1,
    directionOfShift: 'SETARA',
    colorDescription: 'N/A',
    beakerColor: 'rgba(251, 146, 60, 0.5)',
    qcValue: 1,
    kcValue: 1
  });

  // Quiz States
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  // Compute Equilibrium positions in real-time
  useEffect(() => {
    if (activeSystem === 'thiocyanate') {
      // Fe3+ + SCN- <=> FeSCN2+ (Exothermic, delta H = -26 kJ/mol)
      // Standard Kc at 298 K is approx 10.0 (dimensionless for simplicity)
      // Changing temp affects Kc because exothermic -> heating decreases Kc, cooling increases Kc
      const tempFactor = Math.exp((1 / thioTemp - 1 / 298) * 3100); 
      const baseKc = 10.0 * tempFactor;

      // Effective initial concentrations considering dilution level (volume)
      // Active Fe3+ is lowered if complex ligand (NaF) is added
      const activeFeInitial = (complexLigandAdded ? Math.max(0.05, feConc * 0.15) : feConc) / dilutionLevel;
      const activeScnInitial = scnConc / dilutionLevel;
      const activeProductInitial = complexConc / dilutionLevel;

      // Reaction quotient Qc before equilibrium shift
      // Qc = [FeSCN2+] / ([Fe3+] * [SCN-])
      const calculatedQc = activeProductInitial / (activeFeInitial * activeScnInitial);

      // Solve for equilibrium shift (x)
      // Kc = (Product + x) / ((Fe - x) * (SCN - x))
      // Kc * (Fe - x) * (SCN - x) = (Product + x)
      // Kc * (Fe*SCN - x*(Fe+SCN) + x^2) = Product + x
      // Kc*x^2 - (Kc*(Fe+SCN) + 1)*x + Kc*Fe*SCN - Product = 0
      const a = baseKc;
      const b = -(baseKc * (activeFeInitial + activeScnInitial) + 1);
      const c = baseKc * activeFeInitial * activeScnInitial - activeProductInitial;

      // Quadratic formula: x = (-b - sqrt(b^2 - 4ac)) / (2a)
      const discriminant = b * b - 4 * a * c;
      let x = 0;
      if (discriminant >= 0) {
        const x1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b + Math.sqrt(discriminant)) / (2 * a);
        // Valid x must keep equilibrium concentrations positive
        const validX = [x1, x2].find(val => 
          (activeFeInitial - val > 0) && 
          (activeScnInitial - val > 0) && 
          (activeProductInitial + val > 0)
        );
        if (validX !== undefined) x = validX;
      }

      const eqFe = activeFeInitial - x;
      const eqScn = activeScnInitial - x;
      const eqComplex = activeProductInitial + x;

      // Arah pergeseran
      let direction: 'KANAN' | 'KIRI' | 'SETARA' = 'SETARA';
      if (Math.abs(calculatedQc - baseKc) / baseKc < 0.05) {
        direction = 'SETARA';
      } else if (calculatedQc < baseKc) {
        direction = 'KANAN';
      } else {
        direction = 'KIRI';
      }

      // Beaker color calculation
      // Fe3+ is light yellow-orange, SCN- is colorless, FeSCN2+ is blood red
      // Color depends on complex concentration. Dilution dims it.
      const redIntensity = Math.min(255, Math.round(eqComplex * 140));
      const yellowIntensity = Math.min(200, Math.round(eqFe * 110));
      // Base fluid overlay
      const opacity = Math.max(0.15, 0.85 - (dilutionLevel - 1) * 0.18);
      const beakerColorRGB = `rgba(${redIntensity + yellowIntensity}, ${Math.max(25, 140 - redIntensity)}, ${Math.max(10, 50 - redIntensity)}, ${opacity})`;

      let desc = 'Kuning Jingga Transparan';
      if (eqComplex > 1.2) desc = 'Merah Darah Sangat Pekat';
      else if (eqComplex > 0.6) desc = 'Merah Jingga Sedang';
      else if (eqComplex > 0.25) desc = 'Kuning Kemerahan Pudar';

      setComputedState({
        eqConcA: eqFe,
        eqConcB: eqScn,
        eqConcC: eqComplex,
        directionOfShift: direction,
        colorDescription: desc,
        beakerColor: beakerColorRGB,
        qcValue: calculatedQc,
        kcValue: baseKc
      });

    } else {
      // N2O4 <=> 2 NO2 (Endothermic, delta H = +57.2 kJ/mol)
      // Standard Kc at 298 K is approx 0.15 mol/L
      // Endothermic -> heating shifts right, increasing Kc.
      const tempFactor = Math.exp((1 / 298 - 1 / gasTemp) * 6800);
      const baseKc = 0.15 * tempFactor;

      // Concentrations considering volume
      // N2O4 = n / V
      const initN2O4 = n2o4Conc / gasVolume;
      const initNO2 = no2Conc / gasVolume;

      // Qc = [NO2]^2 / [N2O4]
      const calculatedQc = (initNO2 * initNO2) / initN2O4;

      // Solve Kc = (initNO2 + 2x)^2 / (initN2O4 - x)
      // Kc * (initN2O4 - x) = initNO2^2 + 4 * initNO2 * x + 4 * x^2
      // 4*x^2 + (4*initNO2 + Kc)*x + initNO2^2 - Kc*initN2O4 = 0
      const a = 4;
      const b = 4 * initNO2 + baseKc;
      const c = (initNO2 * initNO2) - (baseKc * initN2O4);

      const discriminant = b * b - 4 * a * c;
      let x = 0;
      if (discriminant >= 0) {
        const x1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const validX = [x1, x2].find(val => 
          (initN2O4 - val > 0) && 
          (initNO2 + 2 * val > 0)
        );
        if (validX !== undefined) x = validX;
      }

      const eqN2O4 = initN2O4 - x;
      const eqNO2 = initNO2 + 2 * x;

      let direction: 'KANAN' | 'KIRI' | 'SETARA' = 'SETARA';
      if (Math.abs(calculatedQc - baseKc) / baseKc < 0.05) {
        direction = 'SETARA';
      } else if (calculatedQc < baseKc) {
        direction = 'KANAN';
      } else {
        direction = 'KIRI';
      }

      // NO2 is brown, N2O4 is colorless.
      // Color intensity corresponds to [NO2] and gas compressed state
      const brownDensity = Math.min(255, Math.round(eqNO2 * 110));
      const opacity = Math.max(0.08, Math.min(0.9, (eqNO2 * 0.45) * (3.0 / gasVolume)));
      const syringeColor = `rgba(${139 + Math.round(brownDensity * 0.4)}, ${75 - Math.round(brownDensity * 0.2)}, ${30 - Math.round(brownDensity * 0.1)}, ${opacity})`;

      let desc = 'Tak Berwarna / Sangat Jernih';
      if (eqNO2 > 1.5) desc = 'Cokelat Pekat Beruap';
      else if (eqNO2 > 0.8) desc = 'Cokelat Jingga Sedang';
      else if (eqNO2 > 0.2) desc = 'Kuning Kecokelatan Samar';

      setComputedState({
        eqConcA: eqN2O4,
        eqConcB: eqNO2, // For simplicity in display
        eqConcC: eqNO2,
        directionOfShift: direction,
        colorDescription: desc,
        beakerColor: syringeColor,
        qcValue: calculatedQc,
        kcValue: baseKc
      });
    }
  }, [
    activeSystem, feConc, scnConc, complexConc, complexLigandAdded, dilutionLevel,
    thioTemp, n2o4Conc, no2Conc, gasVolume, gasTemp
  ]);

  // Handle resets
  const handleResetParameters = () => {
    if (activeSystem === 'thiocyanate') {
      setFeConc(1.0);
      setScnConc(1.0);
      setComplexConc(1.0);
      setComplexLigandAdded(false);
      setDilutionLevel(1.0);
      setThioTemp(298);
    } else {
      setN2o4Conc(1.0);
      setNo2Conc(1.0);
      setGasVolume(2.0);
      setGasTemp(298);
    }
  };

  // Handle quiz choices
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
          labId: 'equilibrium',
          title: 'Kuis Kesetimbangan Kimia',
          description: `Selesai mengevaluasi Asas Le Chatelier dengan skor ${quizScore}/${QUIZ_QUESTIONS.length}`,
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
      {/* Dynamic module Header */}
      <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-yellow-400 rotate-90" />
            Simulasi Kesetimbangan Kimia & Asas Le Chatelier
          </h2>
          <p className="text-zinc-400 text-sm">
            Eksplorasi bergesernya kesetimbangan berdasar faktor konsentrasi, temperatur, volume, dan tekanan. Lengkap dengan sistem visual & kuis kurikulum.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-zinc-900/60 p-1 rounded-lg border border-zinc-800 self-start">
          <button 
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'simulation' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Virtual Lab
          </button>
          <button 
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'theory' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Azas Le Chatelier
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === 'quiz' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Kuis Evaluasi
          </button>
        </div>
      </div>

      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Controls Sidebar (Left: Span 5 on tablet, 4 on desktop) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            
            {/* System Selector Card */}
            <div className="glass-panel border-white/5 rounded-2xl p-4.5 space-y-3">
              <span className="text-[9.5px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">SISTEM KESETIMBANGAN</span>
              
              <div className="space-y-2">
                <button 
                  onClick={() => { setActiveSystem('thiocyanate'); handleResetParameters(); }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    activeSystem === 'thiocyanate' 
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 ring-1 ring-yellow-500/25' 
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <Droplet className="w-4 h-4 text-rose-450 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-xs font-bold">1. Homogen Larutan (FeSCN²⁺)</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Fe³⁺ (aq) + SCN⁻ (aq) ⇄ FeSCN²⁺ (aq)</div>
                  </div>
                </button>

                <button 
                  onClick={() => { setActiveSystem('gas-no2'); handleResetParameters(); }}
                  className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    activeSystem === 'gas-no2' 
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 ring-1 ring-yellow-500/25' 
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <Wind className="w-4 h-4 text-emerald-450 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-xs font-bold">2. Homogen Gas (NO₂ / Cokelat)</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">N₂O₄ (g) ⇄ 2 NO₂ (g)</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Audio Sonification Info Box */}
            <div className="space-y-2 bg-yellow-950/10 p-4 rounded-2xl border border-yellow-500/15">
              <span className="text-[11px] font-bold text-yellow-500 flex items-center gap-1.5 font-sans">
                <Volume2 className="w-4 h-4 text-yellow-400 font-medium" />
                Sonifikasi Gelembung Kimia
              </span>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                Sonifikasi interaktif menyuarakan aktivitas tabrakan molekul dan pergeseran fasa:
              </p>
              <ul className="text-[9.5px] text-zinc-500 space-y-1 list-disc pl-4">
                <li><strong className="text-zinc-400">Tempo Letupan</strong>: Semakin rapat (cepat) saat suhu dinaikkan atau reaktan dipekatkan, mewakili percepatan reaksi molekuler.</li>
                <li><strong className="text-zinc-400">Karakter Bunyi</strong>: Fasa larutan menghasilkan nada letup basah (bloop), sedangkan fasa gas menghasilkan letupan dencing frekuensi tinggi (pop).</li>
              </ul>
            </div>

            {/* Input parameters container */}
            <div className="glass-panel border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">MANIPULASI REAKSI</span>
                <div className="flex items-center gap-1.5 animate-pulse-slow">
                  <button 
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`p-1 px-1.5 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all border ${
                      isAudioEnabled 
                        ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400 font-bold' 
                        : 'bg-zinc-950/40 border-zinc-850 text-zinc-500 hover:text-zinc-400'
                    }`}
                    title="Aktifkan sonifikasi gelembung kimia dinamis"
                  >
                    {isAudioEnabled ? (
                      <>
                        <Volume2 className="w-3 h-3 text-yellow-400" /> Audio: On
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3 h-3 text-zinc-600" /> Audio: Off
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleResetParameters}
                    className="p-1 px-2 text-zinc-400 hover:text-white border border-zinc-800 rounded bg-zinc-950/40 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Nilai
                  </button>
                </div>
              </div>

              {/* SYSTEM 1: THIOCYANTE LIQUID SLIDERS */}
              {activeSystem === 'thiocyanate' && (
                <div className="space-y-4">
                  
                  {/* Slider: Fe3+ reactant */}
                  <div className="space-y-1.5 bg-zinc-950/35 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold font-sans">Konsentrasi Awal [Fe³⁺]</span>
                      <span className="font-mono text-orange-400 font-bold">{feConc.toFixed(1)} M</span>
                    </div>
                    <input 
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.2"
                      value={feConc}
                      disabled={complexLigandAdded}
                      onChange={(e) => setFeConc(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-orange-550 disabled:opacity-30"
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 pt-0.5">
                      <span>Encer (0.2)</span>
                      <span>Pekat (3.0)</span>
                    </div>
                  </div>

                  {/* Slider: SCN- reactant */}
                  <div className="space-y-1.5 bg-zinc-950/35 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold font-sans">Konsentrasi Awal [SCN⁻]</span>
                      <span className="font-mono text-slate-300 font-bold">{scnConc.toFixed(1)} M</span>
                    </div>
                    <input 
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.2"
                      value={scnConc}
                      onChange={(e) => setScnConc(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-500"
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500 pt-0.5">
                      <span>Encer (0.2)</span>
                      <span>Pekat (3.0)</span>
                    </div>
                  </div>

                  {/* Slider: Temp (Exothermic reaction) */}
                  <div className="space-y-1.5 bg-zinc-950/35 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold font-sans">Suhu Larutan (T)</span>
                      <span className="font-mono text-yellow-400 font-bold">{thioTemp - 273}°C ({thioTemp} K)</span>
                    </div>
                    <input 
                      type="range"
                      min="278"
                      max="358"
                      step="10"
                      value={thioTemp}
                      onChange={(e) => setThioTemp(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-yellow-550"
                    />
                    <p className="text-[10px] text-zinc-500 italic mt-1 leading-normal">
                      *Reaksi bersifat eksotermik (melepas panas). Suhu naik mendiskon nilai Kc.
                    </p>
                  </div>

                  {/* Volumetric Dilution input */}
                  <div className="space-y-2 bg-zinc-950/35 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-blue-400" /> Pengenceran (Air Murni)
                      </span>
                      <span className="font-mono text-blue-400 font-bold">{dilutionLevel.toFixed(1)}x Vol</span>
                    </div>
                    <input 
                      type="range"
                      min="1.0"
                      max="4.0"
                      step="0.5"
                      value={dilutionLevel}
                      onChange={(e) => setDilutionLevel(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Add chemical ligand to bind Fe3+ */}
                  <div className="p-3 bg-red-950/15 border border-red-500/20 rounded-xl space-y-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-red-400 block">Zat Pengkompleks (kristal NaF)</span>
                      <p className="text-[9.5px] text-zinc-500 leading-tight pr-3">
                        Mengikat ion besi menjadi [FeF₆]³⁻ sehingga merosot tajam dari kesetimbangan bebas.
                      </p>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 border border-zinc-800 bg-zinc-900/60 p-1.5 rounded-lg">
                      <input 
                        type="checkbox" 
                        checked={complexLigandAdded}
                        onChange={() => setComplexLigandAdded(!complexLigandAdded)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[8px] after:right-[22px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-slate-950"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* SYSTEM 2: GAS DINITROGEN TETROXIDE SLIDERS */}
              {activeSystem === 'gas-no2' && (
                <div className="space-y-4">
                  
                  {/* Slider: N2O4 starting conc */}
                  <div className="space-y-1.5 bg-zinc-950/35 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold font-sans">Mol Awal N₂O₄ (Reaktan)</span>
                      <span className="font-mono text-zinc-400 font-bold">{n2o4Conc.toFixed(1)} mol</span>
                    </div>
                    <input 
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.2"
                      value={n2o4Conc}
                      onChange={(e) => setN2o4Conc(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-400"
                    />
                  </div>

                  {/* Slider: NO2 starting conc */}
                  <div className="space-y-1.5 bg-zinc-950/35 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold font-sans">Mol Awal NO₂ (Produk)</span>
                      <span className="font-mono text-amber-500 font-bold">{no2Conc.toFixed(1)} mol</span>
                    </div>
                    <input 
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.2"
                      value={no2Conc}
                      onChange={(e) => setNo2Conc(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-550"
                    />
                  </div>

                  {/* Slider: Gas syringe volume (affects pressure simultaneously) */}
                  <div className="space-y-1.5 bg-zinc-950/35 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold font-sans">Volume Syringe / Tabung (V)</span>
                      <span className="font-mono text-orange-400 font-bold">{gasVolume.toFixed(1)} Liter</span>
                    </div>
                    <input 
                      type="range"
                      min="1.0"
                      max="4.0"
                      step="0.5"
                      value={gasVolume}
                      onChange={(e) => setGasVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between items-center text-[9.5px] text-zinc-500 pt-1 leading-none font-mono">
                      <span>Kompresi (V↓ P↑)</span>
                      <span>Ekspansi (V↑ P↓)</span>
                    </div>
                  </div>

                  {/* Slider: Gas Temperature (Endothermic reaction) */}
                  <div className="space-y-1.5 bg-zinc-950/35 p-3 rounded-xl border border-zinc-900/80">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-bold font-sans">Suhu Tabung (T)</span>
                      <span className="font-mono text-emerald-400 font-bold">{gasTemp - 273}°C ({gasTemp} K)</span>
                    </div>
                    <input 
                      type="range"
                      min="273"
                      max="373"
                      step="10"
                      value={gasTemp}
                      onChange={(e) => setGasTemp(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-[10px] text-zinc-500 italic mt-1 leading-normal">
                      *Reaksi bersifat endotermik (menyerap panas). Memanaskan meningkatkan nilai Kc.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visualization Area & Thermodynamics Analytics (Right: Span 7 on tablet, 8 on desktop) */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
            
            {/* Real-time Chemical Reaction Container */}
            <div className="glass-panel border-white/5 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-center">
              
              {/* Visual Beaker / Container Column */}
              <div className="w-full lg:w-1/2 flex flex-col items-center justify-center space-y-4">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest block text-center">
                  {activeSystem === 'thiocyanate' ? 'REAKTOR BEAKER KIMIA (LARUTAN)' : 'TABUNG SYRINGE GAS SPASIAL'}
                </span>

                {/* Draw dynamic beaker container or gas syringe depending on selected simulation */}
                {activeSystem === 'thiocyanate' ? (
                  <div className="relative w-44 h-52 bg-zinc-950/30 border-4 border-slate-700/65 rounded-b-3xl rounded-t-sm overflow-hidden flex flex-col justify-end shadow-2xl">
                    {/* Tick markers on beaker */}
                    <div className="absolute top-4 left-3 font-mono text-[8px] text-slate-500 space-y-4 pointer-events-none">
                      <div>─ 200 ml</div>
                      <div>─ 150 ml</div>
                      <div>─ 100 ml</div>
                      <div>─ 50 ml</div>
                    </div>

                    {/* Liquid fill matching dilution level and compound values */}
                    <div 
                      style={{ 
                        height: `${Math.min(95, 23 * dilutionLevel + 12)}%`, 
                        backgroundColor: computedState.beakerColor 
                      }}
                      className="w-full transition-all duration-300 relative"
                    >
                      {/* Fluid waves accent */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20 animate-pulse rounded-t-full" />
                      
                      {/* Tiny molecular bubbles rising */}
                      <div className="absolute inset-x-0 bottom-4 flex justify-around opacity-45 pointer-events-none">
                        <span className="w-1 h-1 rounded-full bg-white/30 animate-bounce duration-1000" />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/25 animate-bounce duration-700 delay-150" />
                        <span className="w-1 h-1 rounded-full bg-white/30 animate-bounce duration-900 delay-300" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-36 h-56 bg-zinc-950/30 border-x-4 border-b-4 border-slate-700/65 rounded-b-xl px-1 flex flex-col justify-end overflow-hidden shadow-2xl">
                    
                    {/* Syringe Piston Plunger matching gas volume */}
                    <div 
                      style={{ 
                        height: `${Math.min(94, 100 - (gasVolume / 4.0) * 80)}%`,
                      }}
                      className="w-full absolute top-0 inset-x-0 bg-zinc-900 border-b-8 border-slate-600 transition-all duration-300 flex flex-col items-center justify-start z-10"
                    >
                      {/* Piston metallic stick */}
                      <div className="w-5 h-20 bg-slate-500 -mt-20 border-x border-slate-400" />
                      <div className="w-1.5 h-full bg-slate-400/80 text-center font-bold text-[7px] text-zinc-550 pt-2 flex items-center justify-center">
                        PLUNGER
                      </div>
                    </div>

                    {/* Syringe gas space */}
                    <div 
                      style={{ 
                        height: `${(gasVolume / 4.0) * 80}%`,
                        backgroundColor: computedState.beakerColor 
                      }}
                      className="w-full transition-all duration-300 relative border-t-2 border-dashed border-sky-400/20"
                    >
                      {/* Simulated gas molecular particles floating */}
                      <div className="absolute inset-0 flex flex-wrap gap-2 justify-around items-center p-3 opacity-80 z-0 pointer-events-none">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-700/60 blur-xs animate-pulse inline-block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600/50 inline-block animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-zinc-300/30 inline-block animate-pulse" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-800/70 inline-block animate-bounce delay-150" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300/40 inline-block animate-ping duration-1500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Color and state text readout */}
                <div className="text-center">
                  <div className="text-xs font-bold text-white leading-tight">
                    Warna Campuran: <span className="text-yellow-400 font-sans">{computedState.colorDescription}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Chemistry Dashboard Column */}
              <div className="w-full lg:w-1/2 space-y-4">
                
                {/* Visual Shift indicator meter */}
                <div className="bg-zinc-950 p-4.5 rounded-2xl border border-zinc-900 select-none space-y-3 shadow-md">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold block uppercase tracking-widest leading-none">
                    ARAH PERGESERAN KESETIMBANGAN (ASAS LE CHATELIER)
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Shift indication state UI */}
                    <div className="w-full grid grid-cols-3 text-center border-y border-zinc-850 py-2.5 mt-1">
                      <div className={`p-1.5 rounded-lg text-[10.5px] font-bold font-sans transition-all leading-none flex flex-col justify-center items-center ${
                        computedState.directionOfShift === 'KIRI' 
                          ? 'bg-red-500/10 border border-red-500/35 text-red-400' 
                          : 'text-zinc-550'
                      }`}>
                        <span>← GESER KIRI</span>
                        <span className="text-[7.5px] mt-1 font-mono uppercase tracking-wider block font-bold">Kecuali Reaktan</span>
                      </div>
                      
                      <div className={`p-1.5 rounded-lg text-[10.5px] font-bold font-sans transition-all leading-none flex flex-col justify-center items-center ${
                        computedState.directionOfShift === 'SETARA' 
                          ? 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400' 
                          : 'text-zinc-550'
                      }`}>
                        <span>STABIL / SETARA</span>
                        <span className="text-[7.5px] mt-1 font-mono uppercase tracking-wider block font-bold">Qc ≈ Kc (Eq)</span>
                      </div>

                      <div className={`p-1.5 rounded-lg text-[10.5px] font-bold font-sans transition-all leading-none flex flex-col justify-center items-center ${
                        computedState.directionOfShift === 'KANAN' 
                          ? 'bg-yellow-500/10 border border-yellow-500/35 text-yellow-400 font-black' 
                          : 'text-zinc-550'
                      }`}>
                        <span>GESER KANAN →</span>
                        <span className="text-[7.5px] mt-1 font-mono uppercase tracking-wider block font-bold">Kecuali Produk</span>
                      </div>
                    </div>
                  </div>

                  {/* Scientific interpretation note */}
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic border-t border-zinc-900 pt-2.5">
                    {computedState.directionOfShift === 'KANAN' && 'Sistem mengkompensasi perubahan dengan membentuk lebih banyak produk (menghabiskan reaktan) demi memulihkan kesetimbangan.'}
                    {computedState.directionOfShift === 'KIRI' && 'Sistem mengkompensasi rintangan eksternal dengan menguraikan kembali produk menjadi zat asal reaktan.'}
                    {computedState.directionOfShift === 'SETARA' && 'Sistem berada dalam laju dinamis seimbang di mana laju reaksi maju sama tepat dengan laju reaksi balik.'}
                  </p>
                </div>

                {/* Equilibrium concentrations progress bars */}
                <div className="bg-zinc-950/50 p-4.5 rounded-2xl border border-zinc-900/60 space-y-3.5">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold block uppercase tracking-widest leading-none">
                    KONSENTRASI SPESI KESETIMBANGAN AKTUAL (EQ)
                  </span>

                  <div className="space-y-3">
                    {/* Compound 1 (Fe3+ or N2O4) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-zinc-400 font-bold">
                          {activeSystem === 'thiocyanate' ? 'Ion Bebas [Fe³⁺]' : 'Baku Gas [N₂O₄]'}
                        </span>
                        <span className="font-mono text-zinc-300">{computedState.eqConcA.toFixed(2)} M</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, computedState.eqConcA * 30)}%` }} 
                          className="bg-orange-500 h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Compound 2 (SCN- or 2*NO2) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-zinc-400 font-bold">
                          {activeSystem === 'thiocyanate' ? 'Ligand Bebas [SCN⁻]' : 'Baku Gas [NO₂]'}
                        </span>
                        <span className="font-mono text-zinc-300">{computedState.eqConcB.toFixed(2)} M</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, computedState.eqConcB * 30)}%` }} 
                          className="bg-zinc-400 h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Compound 3 (Product) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-zinc-450 font-bold">
                          {activeSystem === 'thiocyanate' ? 'Kompleks Larutan [FeSCN²⁺]' : 'Kompleks Gas [NO2]'}
                        </span>
                        <span className="font-mono text-zinc-300">{computedState.eqConcC.toFixed(2)} M</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, computedState.eqConcC * 30)}%` }} 
                          className="bg-rose-600 h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations and thermodynamic values display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Kc vs Qc indicators */}
              <div className="glass-panel border-white/5 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block mb-2">INTEGRITAS KONSTANTA KESETIMBANGAN</span>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                      <span className="text-[8.5px] font-mono text-zinc-500 font-bold block">NILAI Kc SEBENARNYA</span>
                      <span className="font-mono text-white font-black text-sm">{computedState.kcValue.toFixed(4)}</span>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                      <span className="text-[8.5px] font-mono text-zinc-500 font-bold block">KUOSIEN REAKSI (Qc)</span>
                      <span className="font-mono text-yellow-500 font-black text-sm">{computedState.qcValue.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-[10px] text-zinc-400 leading-normal pt-2 border-t border-zinc-900">
                  {computedState.qcValue < computedState.kcValue ? (
                    <span className="text-yellow-450 font-bold">{"★ Qc < Kc :"}</span>
                  ) : computedState.qcValue > computedState.kcValue ? (
                    <span className="text-red-405 font-bold">{"★ Qc > Kc :"}</span>
                  ) : (
                    <span className="text-emerald-450 font-bold">{"★ Qc ≈ Kc :"}</span>
                  )}
                  {' '}
                  {computedState.qcValue < computedState.kcValue 
                    ? 'Reaktan berlebihan dibanding rasio setimbang. Sistem bergeser ke kanan untuk mengonversi menjadi produk.' 
                    : computedState.qcValue > computedState.kcValue 
                      ? 'Produk terlalu berlebihan dibanding kapasitas termodinamis. Sistem bergeser ke kiri untuk memulihkan kestabilan.'
                      : 'Larutan berada dalam kondisi kesetimbangan dinamis sempurna.'}
                </p>
              </div>

              {/* Box 2: Asas Le Chatelier diagnostics checker */}
              <div className="glass-panel border-white/5 rounded-2xl p-4.5 space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">DIAGNOSTIK ASAS LE CHATELIER</span>

                <div className="space-y-2 text-[11px] font-sans leading-relaxed text-zinc-300">
                  <div className="flex items-start gap-1.5">
                    <span className="text-yellow-500 font-bold font-mono">▸ Temp:</span>
                    <span>
                      {activeSystem === 'thiocyanate' 
                        ? `Suhu ${thioTemp - 273}°C membuat reaksi bergeser ke arah ${thioTemp >= 310 ? 'Kiri (Eksotermik tertekan)' : 'Kanan (Suhu sejuk)'}.`
                        : `Suhu ${gasTemp - 273}°C membuat reaksi bergeser ke arah ${gasTemp >= 310 ? 'Kanan (Endotermik diuntungkan)' : 'Kiri (Suhu sejuk)'}.`}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 border-t border-zinc-900/60 pt-1.5">
                    <span className="text-yellow-500 font-bold font-mono">▸ Volume:</span>
                    <span>
                      {activeSystem === 'thiocyanate' 
                        ? `Dilusi ${dilutionLevel}x menurunkan seluruh konsentrasi, memicu pergeseran ke arah Kiri (sisi mol terbanyak).`
                        : `Volume ${gasVolume.toFixed(1)}L (${gasVolume <= 1.5 ? 'Kompresi Tinggi' : 'Ekspansi Wadah'}) memicu pergeseran ke arah ${gasVolume <= 1.5 ? 'Kiri (mengurangi tekanan)' : 'Kanan (mengisi ruang)'}.`}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 border-t border-zinc-900/60 pt-1.5">
                    <span className="text-yellow-500 font-bold font-mono">▸ Perturbasi:</span>
                    <span>
                      {activeSystem === 'thiocyanate'
                        ? (complexLigandAdded ? 'Kristal NaF ditambahkan, merampas Fe3+ bebas dan memaksa pergeseran ke Kiri.' : 'Bebas dari perampas ligan pengompleks.')
                        : 'Sistem kompartemen gas tersegel dinamis.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'theory' && (
        <div className="glass-panel border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white font-sans">Asas Le Chatelier & Pergeseran Kesetimbangan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-sm text-zinc-300">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-yellow-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-yellow-500 inline-block rounded-sm"></span>
                  Rumusan Asas Le Chatelier (1884)
                </h4>
                <p className="text-[12.5px] leading-relaxed">
                  Jika diberikan rintangan, stres, atau gangguan eksternal terhadap suatu sistem kesetimbangan dinamis, sistem tersebut akan memicu pergeseran posisi sedemikian rupa untuk menepis atau memitigasi efek dari gangguan tersebut.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-yellow-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-yellow-500 inline-block rounded-sm"></span>
                  Aksi & Reaksi Konsentrasi Spesi
                </h4>
                <p className="text-[12.5px] leading-relaxed">
                  Apabila konsentrasi salah satu spesi <strong>ditambah</strong>, kesetimbangan akan bergeser <strong>menjauhi</strong> spesi tersebut. Sebaliknya, jika konsentrasi salah satu spesi <strong>dikurangi</strong>, kesetimbangan akan bergeser <strong>menuju</strong> ke arah spesi tersebut guna mengisi kekosongan.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-yellow-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-yellow-500 inline-block rounded-sm"></span>
                  Pengaruh Temperatur terhadap Tetapan Kc
                </h4>
                <p className="text-[12.5px] leading-relaxed">
                  Temperatur adalah satu-satunya faktor yang dapat mengutak-atik nilai konstanta kesetimbangan (Kc). Peningkatan suhu mendorong kesetimbangan bergeser ke arah reaksi yang menyerap panas (<strong>endotermik</strong>). Penurunan suhu mendorong ke arah reaksi pelepasan panas (<strong>eksotermik</strong>).
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-yellow-400 font-sans flex items-center gap-1.5">
                  <span className="w-1.5 h-4 bg-yellow-500 inline-block rounded-sm"></span>
                  Pengaruh Penekanan Ruang (Volume / Tekanan)
                </h4>
                <p className="text-[12.5px] leading-relaxed">
                  Jika kompresi dilakukan (volume dipersempit, maka tekanan melonjak naik), kesetimbangan akan merespons dengan bergeser ke arah jumlah mol koefisien gas terkecil untuk mendinginkan tekanan ekstrem. Sebaliknya, perluasan volume menggesernya ke arah jumlah mol koefisien gas terbesar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-4.5 rounded-xl border border-zinc-900 font-mono text-xs text-slate-350 space-y-1.5">
            <h4 className="text-[10px] font-black text-yellow-500">RINGKASAN ARAH PERGESERAN KESETIMBANGAN HOMOGEN:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-zinc-450 mt-1">
              <div className="space-y-0.5">
                <div>• Konsentrasi Reaktan Ditambah ➔ Geser ke Kanan</div>
                <div>• Konsentrasi Reaktan Dikurangi ➔ Geser ke Kiri</div>
                <div>• Volume Diperbesar (Tekanan ↓) ➔ Geser ke koefisien mol terbesar</div>
              </div>
              <div className="space-y-0.5">
                <div>• Suhu Diturunkan ➔ Geser ke arah eksotermik (ΔH &lt; 0)</div>
                <div>• Suhu Dinaikkan ➔ Geser ke arah endotermik (ΔH &gt; 0)</div>
                <div>• Katalis Ditambahkan ➔ Tidak bergeser (hanya mempercepat reaksi mencapai eq)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="glass-panel border-white/5 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="font-black text-white text-sm">Uji Pemahaman Asas Le Chatelier</span>
            </div>
            <span className="font-mono text-xs text-zinc-500">
              SOAL {currentQuizIndex + 1} DARI {QUIZ_QUESTIONS.length}
            </span>
          </div>

          {!showQuizResult ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-zinc-100 font-sans leading-relaxed">
                  {QUIZ_QUESTIONS[currentQuizIndex].question}
                </h4>
              </div>

              {/* Answers */}
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
                    optStyle = 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 ring-1 ring-yellow-500/20';
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

              {/* Quiz Bahasan */}
              {hasSubmittedAnswer && (
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 text-xs leading-relaxed space-y-1.5 animate-fade-in">
                  <div className="font-bold text-yellow-404 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                    <Info className="w-3.5 h-3.5 text-yellow-450" /> BEDAH SOAL & BAHASAN TEORETIS:
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    {QUIZ_QUESTIONS[currentQuizIndex].explanation}
                  </p>
                </div>
              )}

              {/* Action area */}
              <div className="flex justify-end pt-3">
                {!hasSubmittedAnswer ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={selectedAnswer === null}
                    className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-lg transition-all"
                  >
                    Kirim Jawaban <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuiz}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-lg transition-all"
                  >
                    {currentQuizIndex + 1 < QUIZ_QUESTIONS.length ? 'Pertanyaan Berikutnya' : 'Lihat Hasil Nilai'} <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 animate-pulse">
                <Award className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Evaluasi Kesetimbangan Selesai!</h4>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  Anda telah menguji hipotesis dengan kecerdasan optimal. Skor Anda:
                </p>
              </div>

              <div className="text-4xl font-mono font-black text-yellow-400">
                {Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)} / 100
              </div>

              <p className="text-xs text-zinc-550">
                ({quizScore} dijawab sahih dari {QUIZ_QUESTIONS.length} butir evaluasi.)
              </p>

              <button
                onClick={handleResetQuiz}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-650 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
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
