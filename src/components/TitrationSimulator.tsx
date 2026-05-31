/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplet, 
  RotateCcw, 
  Plus, 
  Zap, 
  HelpCircle, 
  ZoomIn, 
  Info, 
  Volume2, 
  VolumeX, 
  Check, 
  Sparkles, 
  TrendingUp, 
  Award,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';

// ==========================================
// VIRTUAL LAB AUDIO SYNTHESIZER (WEB AUDIO API)
// ==========================================
function playLabSound(type: 'click' | 'drip' | 'success' | 'valve' | 'beep', soundEnabled: boolean = true) {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'valve') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'drip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'success') {
      const scale = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major notes
      scale.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.1);
        g.gain.setValueAtTime(0.08, now + idx * 0.1);
        g.gain.linearRampToValueAtTime(0, now + idx * 0.1 + 0.3);
        o.start(now + idx * 0.1);
        o.stop(now + idx * 0.1 + 0.35);
      });
    }
  } catch (_) {}
}

interface DropItem {
  id: number;
  y: number; // Percentage down the column (0 to 100)
  size: number;
}

interface RippleItem {
  id: number;
  scale: number;
  opacity: number;
}

export default function TitrationSimulator() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [acidType, setAcidType] = useState<'strong' | 'weak'>('strong'); // strong=HCl, weak=CH3COOH
  const [indicator, setIndicator] = useState<'pp' | 'mo' | 'btb'>('pp'); // pp=phenolphthalein, mo=methyl orange, btb=bromothymol blue
  const [titrantVol, setTitrantVol] = useState<number>(0); // Volume of NaOH in mL (max 50mL)
  
  const titrantVolRef = useRef(titrantVol);
  useEffect(() => {
    titrantVolRef.current = titrantVol;
  }, [titrantVol]);

  // Immersive Flow rate controls representing physical stopcock valve turning
  const [flowRate, setFlowRate] = useState<'off' | 'dropwise' | 'slow' | 'fast'>('off');
  const [isProbeDipped, setIsProbeDipped] = useState<boolean>(true);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [activeInspectVol, setActiveInspectVol] = useState<number | null>(null);

  // Dynamic visual animation components state
  const [drops, setDrops] = useState<DropItem[]>([]);
  const [ripples, setRipples] = useState<RippleItem[]>([]);
  const [isEndpointCelebrated, setIsEndpointCelebrated] = useState<boolean>(false);
  const [localSwirlHighlight, setLocalSwirlHighlight] = useState<boolean>(false);
  const [swirlIntensity, setSwirlIntensity] = useState<number>(0);

  // Constants
  const analyteVol = 25.0; // Analyte volume 25ml
  const acidConc = 0.1; // Concentr 0.1M
  const baseConc = 0.1; // Concentr 0.1M

  // Format to neat human scientific superscript format (e.g. 1.80 × 10⁻⁵ M)
  const formatScientific = (num: number): string => {
    if (num <= 0) return '0 M';
    if (num >= 0.01) return `${num.toFixed(4)} M`;
    const str = num.toExponential(2); // e.g. "1.80e-5"
    const [base, exp] = str.split('e');
    const expNum = parseInt(exp);
    
    // Convert exponent to unicode superscript symbols
    const superscripts: { [key: string]: string } = {
      '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    const expStr = expNum.toString().split('').map(char => superscripts[char] || char).join('');
    return `${base} × 10${expStr} M`;
  };

  // Helper calculating ionic and molecular concentrations at specific NaOH volume
  const getSpeciesInfo = (vol: number) => {
    const ph = calculatePH(vol);
    const hConc = Math.pow(10, -ph);
    const ohConc = Math.pow(10, -(14 - ph));
    const totalVol = analyteVol + vol;
    const naConc = (baseConc * vol) / totalVol;

    let acidAnionName = acidType === 'strong' ? 'Cl⁻' : 'CH₃COO⁻';
    let acidAnionConc = 0;
    let neutralAcidName = acidType === 'strong' ? 'HCl' : 'CH₃COOH';
    let neutralAcidConc = 0;

    if (acidType === 'strong') {
      acidAnionConc = (acidConc * analyteVol) / totalVol;
      neutralAcidConc = 0; // Strong acids fully ionize
    } else {
      const totalAcetateConc = (acidConc * analyteVol) / totalVol;
      const Ka = 1.8e-5;
      const fractionBase = Ka / (Ka + hConc);
      acidAnionConc = totalAcetateConc * fractionBase;
      neutralAcidConc = totalAcetateConc * (1 - fractionBase);
    }

    return {
      ph,
      vol,
      hConc,
      ohConc,
      naConc,
      acidAnionName,
      acidAnionConc,
      neutralAcidName,
      neutralAcidConc
    };
  };

  // Calculate pH dynamically
  const calculatePH = (vol: number): number => {
    if (vol < 0) return 7;
    
    if (acidType === 'strong') {
      // HCl (Strong Acid) titrated with 0.1M NaOH
      const eqVolume = 25.0; // equivalence volume

      if (vol < eqVolume) {
        const remainingH = (acidConc * analyteVol - baseConc * vol) / 1000; // in moles
        const totalVolLit = (analyteVol + vol) / 1000; // in Liters
        const concH = remainingH / totalVolLit;
        const pH = Math.max(1.0, -Math.log10(concH));
        return parseFloat(pH.toFixed(2));
      } else if (Math.abs(vol - eqVolume) < 0.05) {
        return 7.0;
      } else {
        const excessOH = (baseConc * vol - acidConc * analyteVol) / 1000;
        const totalVolLit = (analyteVol + vol) / 1000;
        const concOH = excessOH / totalVolLit;
        const pOH = -Math.log10(concOH);
        const pH = Math.min(13.0, 14.0 - pOH);
        return parseFloat(pH.toFixed(2));
      }
    } else {
      // Weak Acid CH3COOH (Ka = 1.8e-5) titrated with 0.1M NaOH
      const Ka = 1.8e-5;
      const eqVolume = 25.0;

      if (vol === 0) {
        // [H+] = sqrt(Ka * C)
        const concH = Math.sqrt(Ka * acidConc);
        return parseFloat((-Math.log10(concH)).toFixed(2));
      } else if (vol < eqVolume) {
        // Buffer region Henderson-Hasselbalch: pH = pKa + log([conjugate base]/[weak acid])
        const saltMoles = (baseConc * vol);
        const acidMoles = (acidConc * analyteVol - baseConc * vol);
        const pKa = -Math.log10(Ka);
        const pH = pKa + Math.log10(saltMoles / acidMoles);
        return parseFloat(Math.min(6.9, Math.max(2.8, pH)).toFixed(2));
      } else if (Math.abs(vol - eqVolume) < 0.05) {
        // At equivalence point, salt hydrolysis of CH3COO-
        // [OH-] = sqrt(Kw * C_salt / Ka)
        const totalVolLit = (analyteVol + eqVolume) / 1000;
        const saltConc = (acidConc * analyteVol / 1000) / totalVolLit;
        const Kb = 1e-14 / Ka;
        const concOH = Math.sqrt(Kb * saltConc);
        const pOH = -Math.log10(concOH);
        return parseFloat((14.0 - pOH).toFixed(2));
      } else {
        // Excess NaOH dominates
        const excessOH = (baseConc * vol - acidConc * analyteVol) / 1000;
        const totalVolLit = (analyteVol + vol) / 1000;
        const concOH = excessOH / totalVolLit;
        const pOH = -Math.log10(concOH);
        const pH = Math.min(13.0, 14.0 - pOH);
        return parseFloat(pH.toFixed(2));
      }
    }
  };

  const currentPH = calculatePH(titrantVol);

  // Dispatch state updates to window for adaptive feedback
  useEffect(() => {
    (window as any).chemvibe_latest_state = {
      lab: 'titration',
      timestamp: Date.now(),
      data: {
        acidType,
        indicator,
        titrantVol,
        currentPH
      }
    };
    window.dispatchEvent(new CustomEvent('chemvibe_state_change', {
      detail: { lab: 'titration' }
    }));
  }, [acidType, indicator, titrantVol, currentPH]);

  // Beaker Solution Color Mapping based on current indicator with smooth continuous color interpolation
  const getSolutionColor = (pH: number): { color: string; bg: string; border: string; glow: string } => {
    if (indicator === 'pp') {
      // Phenolphthalein: Acid (244, 244, 245, 0.08) to Base (219, 39, 119, 0.85)
      const minPH = 8.2;
      const maxPH = 10.0;
      let factor = 0;
      if (pH <= minPH) {
        factor = 0;
      } else if (pH >= maxPH) {
        factor = 1;
      } else {
        factor = (pH - minPH) / (maxPH - minPH);
      }

      // Local droplet basic splash effect temporarily boosts indicator basic form locally before it diffuses
      const effectiveFactor = Math.min(1.0, factor + swirlIntensity * 0.75);

      // Interpolate RGBA
      const r = Math.round(244 - effectiveFactor * (244 - 219));
      const g = Math.round(244 - effectiveFactor * (244 - 39));
      const b = Math.round(245 - effectiveFactor * (245 - 119));
      const a = 0.08 + effectiveFactor * (0.85 - 0.08);

      const borderStr = effectiveFactor > 0.1 ? 'border-pink-400' : 'border-zinc-700/60';
      const glowStr = effectiveFactor > 0.1 
        ? `shadow-[0_0_20px_rgba(236,72,153,${0.3 + effectiveFactor * 0.45})]` 
        : 'shadow-inner border-t-zinc-600/30';

      let desc = 'Bening (Asam)';
      if (effectiveFactor > 0.9) {
        desc = 'Merah Jambu Pekat (Basa)';
      } else if (effectiveFactor > 0.05) {
        desc = `Transisi Merah Muda (pH Ekuivalen: ${(effectiveFactor * 100).toFixed(0)}%)`;
      }

      return {
        color: desc,
        bg: `rgba(${r}, ${g}, ${b}, ${a})`,
        border: borderStr,
        glow: glowStr
      };
    } else if (indicator === 'mo') {
      // Methyl Orange: Red (239, 68, 68, 0.7) to Yellow (234, 179, 8, 0.6)
      const minPH = 3.1;
      const maxPH = 4.4;
      let factor = 0;
      if (pH <= minPH) {
        factor = 0;
      } else if (pH >= maxPH) {
        factor = 1;
      } else {
        factor = (pH - minPH) / (maxPH - minPH);
      }

      // Droplets of NaOH are basic, so contact temporarily shifts color towards Yellow (basic form)
      const effectiveFactor = Math.min(1.0, factor + swirlIntensity * 0.82);

      // Red [239, 68, 68] to Yellow [234, 179, 8]
      const r = Math.round(239 + effectiveFactor * (234 - 239));
      const g = Math.round(68 + effectiveFactor * (179 - 68));
      const b = Math.round(68 + effectiveFactor * (8 - 68));
      const a = 0.7 - effectiveFactor * (0.7 - 0.6);

      const borderStr = effectiveFactor > 0.8 
        ? 'border-yellow-400' 
        : effectiveFactor > 0.15 
          ? 'border-orange-400' 
          : 'border-red-500';

      const glowStr = `shadow-[0_0_15px_rgba(${r},${g},${b},0.35)]`;

      let desc = 'Merah (Asam)';
      if (effectiveFactor > 0.9) {
        desc = 'Kuning Basa';
      } else if (effectiveFactor > 0.05) {
        desc = `Jingga Transisi (pH Ekuivalen: ${(effectiveFactor * 100).toFixed(0)}%)`;
      }

      return {
        color: desc,
        bg: `rgba(${r}, ${g}, ${b}, ${a})`,
        border: borderStr,
        glow: glowStr
      };
    } else {
      // Bromothymol Blue: Yellow (202, 138, 4, 0.55) -> Neutral Green (16, 185, 129) -> Blue (37, 99, 235, 0.75)
      const minPH = 6.0;
      const maxPH = 7.6;
      let factor = 0;
      if (pH <= minPH) {
        factor = 0;
      } else if (pH >= maxPH) {
        factor = 1;
      } else {
        factor = (pH - minPH) / (maxPH - minPH);
      }

      // Droplets of NaOH are basic, temporarily shifts color towards Blue (basic form)
      const effectiveFactor = Math.min(1.0, factor + swirlIntensity * 0.8);

      let r, g, b;
      let a = 0.55 + effectiveFactor * 0.2; // 0.55 to 0.75
      if (effectiveFactor < 0.5) {
        const subFactor = effectiveFactor / 0.5; // 0 to 1
        // Yellow [202, 138, 4] to Green [16, 185, 129]
        r = Math.round(202 + subFactor * (16 - 202));
        g = Math.round(138 + subFactor * (185 - 138));
        b = Math.round(4 + subFactor * (129 - 4));
      } else {
        const subFactor = (effectiveFactor - 0.5) / 0.5; // 0 to 1
        // Green [16, 185, 129] to Blue [37, 99, 235]
        r = Math.round(16 + subFactor * (37 - 16));
        g = Math.round(185 + subFactor * (99 - 185));
        b = Math.round(129 + subFactor * (235 - 129));
      }

      const borderStr = effectiveFactor > 0.8 
        ? 'border-blue-500' 
        : effectiveFactor > 0.2 
          ? 'border-emerald-400' 
          : 'border-yellow-500';

      const glowStr = `shadow-[0_0_20px_rgba(${r},${g},${b},0.4)]`;

      let desc = 'Kuning Asam';
      if (effectiveFactor > 0.8) {
        desc = 'Biru Basa';
      } else if (effectiveFactor > 0.2) {
        desc = `Hijau Transisi (pH Netral: ${(effectiveFactor * 100).toFixed(0)}%)`;
      }

      return {
        color: desc,
        bg: `rgba(${r}, ${g}, ${b}, ${a})`,
        border: borderStr,
        glow: glowStr
      };
    }
  };

  const solutionStyle = getSolutionColor(currentPH);

  // ==========================================
  // PHYSICAL DRIP ANIMATION & GRAPH TICKS
  // ==========================================
  // Update falling drops & trigger volume increase + plop sounds + ripples
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const updateLoop = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Gradually decay local color mixing swirl intensity
      setSwirlIntensity(intensity => Math.max(0, intensity - 1.2 * delta));

      setDrops(prevDrops => {
        const remainingDrops: DropItem[] = [];
        prevDrops.forEach(drop => {
          // Increase Y position of falling drop
          const speed = 250; // pixels per second
          const nextY = drop.y + speed * delta;
          
          if (nextY >= 100) {
            // Drop hit the liquid! Trigger physical splash kinetics
            setRipples(prevRipples => [...prevRipples, { id: Date.now() + Math.random(), scale: 1.0, opacity: 1.0 }]);
            
            // Add tiny titrant increment
            setTitrantVol(v => {
              const cap = 50.0;
              const nextVol = Math.min(cap, parseFloat((v + 0.1).toFixed(2)));
              
              // Local chemical color stir highlight
              setLocalSwirlHighlight(true);
              setTimeout(() => setLocalSwirlHighlight(false), 240);
              
              // Trigger chemical localized color shockwave wave
              setSwirlIntensity(1.0);

              return nextVol;
            });

            // Synthesize drop collision chime
            playLabSound('drip', soundEnabled);
          } else {
            remainingDrops.push({ ...drop, y: nextY });
          }
        });
        return remainingDrops;
      });

      // Gradually decay visual solution ripples
      setRipples(prevRipples => 
        prevRipples
          .map(r => ({ ...r, scale: r.scale + 2.5 * delta, opacity: r.opacity - 2.8 * delta }))
          .filter(r => r.opacity > 0)
      );

      animationFrame = requestAnimationFrame(updateLoop);
    };

    animationFrame = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrame);
  }, [soundEnabled]);

  // Handle periodic drop release depending on actively selected valve speed
  useEffect(() => {
    let dropInterval: NodeJS.Timeout;
    if (flowRate !== 'off') {
      const intervalMs = {
        dropwise: 900,
        slow: 450,
        fast: 160
      }[flowRate];

      dropInterval = setInterval(() => {
        if (titrantVolRef.current >= 50.0) {
          setFlowRate('off');
          return;
        }
        // Release a new drop
        setDrops(prev => [...prev, { id: Date.now() + Math.random(), y: 0, size: flowRate === 'fast' ? 7 : 4.5 }]);
      }, intervalMs);
    }
    return () => clearInterval(dropInterval);
  }, [flowRate]);

  // Celebrate equivalence crossing!
  useEffect(() => {
    const isAtEquivalence = Math.abs(currentPH - (acidType === 'strong' ? 7.0 : 8.7)) < 1.1;
    if (isAtEquivalence && !isEndpointCelebrated && titrantVol > 0) {
      setIsEndpointCelebrated(true);
      playLabSound('success', soundEnabled);
    } else if (!isAtEquivalence && isEndpointCelebrated) {
      // Allow resetting transition trigger only when far away or reset
      setIsEndpointCelebrated(false);
    }
  }, [currentPH, acidType, isEndpointCelebrated, soundEnabled, titrantVol]);

  const handleStepwiseClick = (amount: number) => {
    if (titrantVol >= 50.0) return;
    playLabSound('click', soundEnabled);
    // Directly inject drops for pleasing ripple simulation
    const dropCount = Math.min(6, Math.max(1, Math.round(amount * 4)));
    for (let i = 0; i < dropCount; i++) {
      setTimeout(() => {
        setDrops(prev => [...prev, { id: Date.now() + Math.random() + i, y: 0, size: 5 }]);
      }, i * 150);
    }
  };

  const handleResetLab = () => {
    playLabSound('click', soundEnabled);
    setTitrantVol(0);
    setFlowRate('off');
    setIsEndpointCelebrated(false);
    setDrops([]);
    setRipples([]);
  };

  const cycleFlowRate = () => {
    playLabSound('valve', soundEnabled);
    setFlowRate(curr => {
      if (curr === 'off') return 'dropwise';
      if (curr === 'dropwise') return 'slow';
      if (curr === 'slow') return 'fast';
      return 'off';
    });
  };

  // Generate data points for Recharts based on zoom state
  const getChartData = () => {
    const data = [];
    if (isZoomed) {
      // Zoomed region: 20mL to 30mL in high-quality 0.1 mL steps
      for (let v = 20.0; v <= 30.0; v = parseFloat((v + 0.1).toFixed(2))) {
        data.push({
          vol: v,
          pH: calculatePH(v),
        });
      }
    } else {
      // Normal region: 0mL to 50mL in 0.5 mL steps
      for (let v = 0.0; v <= 50.0; v = parseFloat((v + 0.5).toFixed(2))) {
        data.push({
          vol: v,
          pH: calculatePH(v),
        });
      }
    }
    return data;
  };

  const chartData = getChartData();

  // Selected volume for species profiling (defaults to current titrant volume)
  const inspectVol = activeInspectVol !== null ? activeInspectVol : titrantVol;
  const inspectSpecies = getSpeciesInfo(inspectVol);

  // Objectives tasklist statuses
  const hasDippedProbe = isProbeDipped;
  const hasSelectedIndicator = indicator !== 'pp' || titrantVol > 0;
  const reachedEquivalence = Math.abs(titrantVol - 25.0) < 0.6;
  const overTitrated = titrantVol > 27.5;

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 pb-12">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-white/5 gap-3 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] font-black uppercase tracking-wider">LABORATORIUM VIRTUAL</span>
            <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono text-[9px] font-black uppercase tracking-wider">ALUR TITRASI INTUITIF</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Kanal Simulasi Titrasi Kimia Interaktif</h2>
          <p className="text-zinc-400 text-xs md:text-sm text-balance">
            Kontrol keran buret secara nyata, amati jatuhnya tetesan larutan analit, selidiki spektrum indikator, dan pantau kurva pH secara waktu nyata.
          </p>
        </div>

        {/* Audio Toggle button */}
        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            playLabSound('beep', next);
          }}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            soundEnabled 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-550'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>SUARA: HIDUP</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>SUARA: MATI</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Simulator Workspace Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* LEFT COLUMN: Controls & Interactive Checklist Sheet */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Lab Setup & Objective checklist */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/30 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <BookOpen className="w-4.5 h-4.5" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">Lembar Panduan &amp; Prosedur</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-350">
              <div className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                  hasSelectedIndicator ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-zinc-700 text-zinc-500'
                }`}>
                  <Check className="w-2.5 h-2.5" />
                </div>
                <div>
                  <span className="font-bold block text-slate-200">1. Atur Parameter Analit</span>
                  <span className="text-[10px] text-zinc-500 block">Pilih tipe asam (Kuat/Lemah) dan pewarna indikator.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                  hasDippedProbe ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-zinc-700 text-zinc-500'
                }`}>
                  <Check className="w-2.5 h-2.5" />
                </div>
                <div>
                  <span className="font-bold block text-slate-200">2. Aktifkan Sensor pH Bejana</span>
                  <span className="text-[10px] text-zinc-500 block">Letakkan probe sensor pH ke dalam bejana untuk memantau.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                  reachedEquivalence ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-zinc-700 text-zinc-500'
                }`}>
                  <Check className="w-2.5 h-2.5" />
                </div>
                <div>
                  <span className="font-bold block text-slate-200">3. Capai Titik Ekuivalen</span>
                  <span className="text-[10px] text-zinc-500 block">Kucurkan NaOH saksama hingga warna indikator berubah stabil (≈ 25mL).</span>
                </div>
              </div>
            </div>

            {reachedEquivalence && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 animate-pulse">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Award className="w-4 h-4" /> Ekuivalen Tercapai Sempurna!
                </span>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Rasio mol asam {acidType === 'strong' ? 'HCl' : 'CH₃COOH'} sebanding stoichiometris dengan NaOH ditambahkan. Warna zat bertransisi anggun.
                </p>
              </div>
            )}

            {overTitrated && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                <span className="text-xs font-bold text-red-400">⚠️ Melebihi Titik Ekuivalen</span>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Kelebihan ion basa OH⁻ mendominasi larutan secara masif. Lakukan reset untuk menguji ulang kinetik ekuivalen yang presisi.
                </p>
              </div>
            )}
          </div>

          {/* Configuration panel */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/30 space-y-5">
            <span className="text-xs font-mono font-bold text-slate-350 tracking-wider block">KONTROL PANEL ANALIT</span>
            
            {/* Acid selection */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide block">1. Jenis Larutan Asam (Analit)</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    playLabSound('click', soundEnabled);
                    setAcidType('strong');
                    handleResetLab();
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                    acidType === 'strong' 
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-extrabold' 
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-450 hover:text-zinc-300'
                  }`}
                >
                  <span className="block">Asam Kuat: HCl</span>
                  <span className="text-[9px] text-zinc-550 block font-normal leading-none mt-0.5">25 mL - 0.1 M</span>
                </button>
                <button
                  onClick={() => {
                    playLabSound('click', soundEnabled);
                    setAcidType('weak');
                    handleResetLab();
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                    acidType === 'weak' 
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-extrabold' 
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-450 hover:text-zinc-300'
                  }`}
                >
                  <span className="block">Asam Lemah: AcOH</span>
                  <span className="text-[9px] text-zinc-550 block font-normal leading-none mt-0.5">CH₃COOH - 0.1 M</span>
                </button>
              </div>
            </div>

            {/* Indicator selection */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide block">2. Pewarna Indikator pH</span>
              <div className="space-y-1.5">
                {[
                  { id: 'pp', name: 'Fenolftalein (PP)', range: 'pH 8.2 - 10.0', desc: 'Bening → Merah Jambu' },
                  { id: 'btb', name: 'Bromtimol Biru (BTB)', range: 'pH 6.0 - 7.6', desc: 'Kuning → Hijau → Biru' },
                  { id: 'mo', name: 'Metil Jingga (MO)', range: 'pH 3.1 - 4.4', desc: 'Merah → Jingga → Kuning' }
                ].map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => {
                      playLabSound('click', soundEnabled);
                      setIndicator(ind.id as any);
                    }}
                    className={`w-full py-2 px-3 border rounded-xl transition-all cursor-pointer flex justify-between items-center text-left ${
                      indicator === ind.id 
                        ? 'bg-pink-500/10 border-pink-500 text-pink-400 font-extrabold' 
                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-450 hover:text-zinc-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs block font-sans">{ind.name}</span>
                      <span className="text-[9px] text-zinc-550 block mt-0.5 leading-none">{ind.desc}</span>
                    </div>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-950/80 border border-zinc-900 text-zinc-500">{ind.range}</span>
                  </button>
                ))}
              </div>

              {/* Spectacular Indicator Color Ribbon Map */}
              <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-2 mt-2 select-none">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-500 uppercase font-black">Spektrum Warna ({indicator.toUpperCase()})</span>
                  <span className="text-teal-400 font-bold">pH {currentPH.toFixed(2)}</span>
                </div>

                {/* Color gradient ribbon */}
                <div className="relative h-3 rounded-md overflow-hidden border border-zinc-800 shadow-inner">
                  <div 
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      background: 
                        indicator === 'pp' ? 'linear-gradient(to right, rgba(244, 244, 245, 0.1) 0%, rgba(244, 244, 245, 0.1) 50%, rgba(244, 114, 182, 0.4) 65%, rgba(219, 39, 119, 0.9) 85%, rgba(219, 39, 119, 0.95) 100%)' :
                        indicator === 'mo' ? 'linear-gradient(to right, #ef4444 0%, #ff8316 35%, #eab308 65%, #eab308 100%)' :
                        'linear-gradient(to right, #eab308 0%, #10b981 50%, #2563eb 80%, #1e40af 100%)'
                    }}
                  />

                  {/* Moving ticker cursor representing current pH */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-md transition-all duration-300 flex items-center justify-center pointer-events-none"
                    style={{ left: `${Math.max(1, Math.min(99, ((currentPH - 1) / 13) * 100))}%` }}
                  >
                    <div className="absolute top-[-3px] w-2 h-2 bg-white border border-teal-500 rounded-full shadow-md" />
                    <div className="absolute bottom-[-3px] w-2 h-2 bg-white border border-teal-500 rounded-full shadow-md" />
                  </div>
                </div>

                {/* Axis labels */}
                <div className="flex justify-between text-[8px] font-mono text-zinc-500 px-1 select-none">
                  <span>pH 1</span>
                  <span>pH 4</span>
                  <span>pH 7</span>
                  <span>pH 10</span>
                  <span>pH 13</span>
                </div>

                <div className="text-[10px] text-zinc-450 leading-relaxed font-sans border-t border-zinc-900/50 pt-1.5 flex items-center justify-between">
                  <span>Warna bejana:</span>
                  <span className="font-bold text-zinc-200">{solutionStyle.color}</span>
                </div>
              </div>
            </div>

            {/* Manual controls buttons */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-900">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide block">3. Injeksi Manual &amp; Reset</span>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  disabled={titrantVol >= 50}
                  onClick={() => handleStepwiseClick(0.1)}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] text-slate-300 font-mono transition-all flex flex-col items-center justify-center disabled:opacity-30 cursor-pointer"
                >
                  <Droplet className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                  +0.1 mL
                </button>
                <button
                  disabled={titrantVol >= 50}
                  onClick={() => handleStepwiseClick(1.0)}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] text-slate-300 font-mono transition-all flex flex-col items-center justify-center disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                  +1.0 mL
                </button>
                <button
                  disabled={titrantVol >= 50}
                  onClick={() => handleStepwiseClick(5.0)}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] text-slate-300 font-mono transition-all flex flex-col items-center justify-center disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                  +5.0 mL
                </button>
              </div>

              <button
                onClick={handleResetLab}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-xl text-xs font-bold font-sans flex justify-center items-center gap-1.5 transition-all cursor-pointer border border-slate-750"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulasi Titrasi</span>
              </button>
            </div>

          </div>

        </div>

        {/* MIDDLE COLUMN: immmersive interactive laboratory apparatus visuals */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Virtual laboratory apparatus diagram */}
          <div className="glass-panel border-slate-800 rounded-2xl p-6 flex flex-col justify-between items-center relative overflow-hidden bg-slate-900/30 h-[430px]">
            
            {/* Header */}
            <div className="w-full flex justify-between items-center z-10 border-b border-zinc-900pb-2 mb-2">
              <span className="text-[10px] font-mono text-zinc-500 font-black tracking-wider uppercase">Sirkuit Aparatus Titrator</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    playLabSound('click', soundEnabled);
                    setIsProbeDipped(!isProbeDipped);
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all cursor-pointer uppercase ${
                    isProbeDipped 
                      ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-bold' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                  }`}
                >
                  {isProbeDipped ? 'Sensor pH: DIP' : 'Sensor pH: OFF'}
                </button>
              </div>
            </div>

            {/* Immersive SVG-based interactive titration apparatus */}
            <div className="relative w-full h-72 flex items-center justify-center">
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 280">
                {/* Metallic Laboratory stand support rack backpiece */}
                <path d="M 60 260 L 60 20 L 75 20" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M 30 260 L 160 260" stroke="#374151" strokeWidth="8" strokeLinecap="round" fill="none" strokeDasharray="none" />
                
                {/* Upper holding clamp for buret */}
                <path d="M 60 60 L 150 60" stroke="#6b7280" strokeWidth="3" />
                <rect x="146" y="52" width="8" height="16" fill="#1f2937" rx="2" />

                {/* Lower holding clamp */}
                <path d="M 60 140 L 150 140" stroke="#6b7280" strokeWidth="3" />
                <rect x="146" y="132" width="8" height="16" fill="#1f2937" rx="2" />
              </svg>

              {/* Physical interactive Buret column with fluid */}
              <div className="absolute top-[10px] left-[132px] w-12 flex flex-col items-center">
                
                {/* Tube body containing water */}
                <div className="w-4 h-36 bg-zinc-950/90 border border-zinc-700/60 rounded-t-sm flex flex-col justify-end relative overflow-hidden">
                  <div 
                    className="w-full bg-cyan-400/25 transition-all duration-300"
                    style={{ height: `${Math.max(0, (1.0 - titrantVol/50.0) * 100)}%` }}
                  />
                  {/* Graduation marks on buret */}
                  <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between py-2 opacity-60">
                    {Array.from({ length: 11 }).map((_, idx) => (
                      <div key={idx} className="flex justify-between items-center w-full px-0.5">
                        <div className="border-t border-zinc-500 w-1"></div>
                        <span className="text-[6px] font-mono text-zinc-550 scale-75 select-none">{idx * 5}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Turnable Stopcock valve section */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  
                  {/* Stopcock stem holder */}
                  <div className="w-2.5 h-6 bg-zinc-600 border border-zinc-700 relative z-10" />

                  {/* Rotatable manual valve handle widget */}
                  <button
                    onClick={cycleFlowRate}
                    className="absolute w-8 h-8 rounded-full border border-teal-500/40 bg-zinc-950 hover:bg-teal-500/10 flex items-center justify-center transition-all cursor-pointer z-20 group"
                    title="Putar Keran Buret (Kecepatan)"
                  >
                    {/* SVG Stopcock valve visualization */}
                    <svg 
                      className="w-6 h-6 transition-transform duration-300" 
                      style={{ 
                        transform: `rotate(${
                          flowRate === 'off' ? 0 : 
                          flowRate === 'dropwise' ? 30 : 
                          flowRate === 'slow' ? 60 : 90
                        }deg)` 
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M 12 2 L 12 22" stroke={flowRate !== 'off' ? '#22d3ee' : '#ec4899'} strokeWidth="4" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="5" fill="#374151" stroke="#4b5563" />
                    </svg>
                  </button>

                  {/* Tiny status indicator lamp near buret tip */}
                  <div className="absolute top-2 right-[-24px] z-10 flex flex-col items-start leading-none gap-0.5">
                    <span className="text-[7px] font-mono text-zinc-500 leading-none">KERAN v:</span>
                    <span className={`text-[8.5px] font-mono font-black ${
                      flowRate === 'off' ? 'text-pink-500' :
                      flowRate === 'dropwise' ? 'text-amber-400' :
                      flowRate === 'slow' ? 'text-teal-400' : 'text-emerald-400 animate-pulse'
                    }`}>
                      {flowRate.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Fine tip pointing downwards */}
                <div className="w-1.5 h-5 bg-zinc-600 rounded-b" />

                {/* Visual dropping nodes render layer */}
                {drops.map((dr) => (
                  <div 
                    key={dr.id}
                    className="absolute bg-cyan-400 rounded-full shadow-glow shadow-cyan-400/60 pointer-events-none"
                    style={{
                      top: `${175 + (dr.y / 100) * 45}px`, 
                      width: `${dr.size}px`, 
                      height: `${dr.size * 1.5}px`,
                      left: 'calc(50% - 2.5px)'
                    }}
                  />
                ))}

              </div>

              {/* Beaker & magnetic spinning stir bar */}
              <div className="absolute top-[170px] left-[104px] w-28 h-24 flex items-end justify-center">
                
                {/* Physical beaker silhouette */}
                <div className="w-24 h-20 bg-transparent border-t-0 border-2 border-slate-500/90 rounded-b-xl relative overflow-hidden flex flex-col justify-end">
                  
                  {/* Floating ripples on physical drop splash */}
                  {ripples.map((rp) => (
                    <div
                      key={rp.id}
                      className="absolute rounded-full border border-cyan-400/80 pointer-events-none"
                      style={{
                        bottom: '30px',
                        left: '12%',
                        right: '12%',
                        height: '10px',
                        transform: `scale(${rp.scale})`,
                        opacity: rp.opacity
                      }}
                    />
                  ))}

                  {/* Main solution liquid level body */}
                  <div 
                    className={`w-full border-t-2 ${solutionStyle.border} ${solutionStyle.glow} transition-all duration-300 flex flex-col items-center justify-end pb-3 relative min-h-[30px]`}
                    style={{ 
                      height: `${40 + (titrantVol / 50.0) * 22}px`,
                      backgroundColor: solutionStyle.bg
                    }}
                  >
                    
                    {/* Spinning magnetic spin-bar visualization */}
                    <div 
                      className={`w-10 h-1.5 bg-white border border-zinc-400 rounded-full shadow-md z-15 ${
                        flowRate !== 'off' ? 'animate-spin' : 'opacity-80'
                      }`}
                      style={{ animationDuration: '0.4s' }}
                    />
                    
                    {/* Tiny visual reactive swirls near buret dripping node representing localized pH shock */}
                    {localSwirlHighlight && (
                      <div className={`absolute top-0 inset-x-4 h-6 blur-[3px] rounded-full animate-ping pointer-events-none ${
                        indicator === 'pp' ? 'bg-pink-500/40' :
                        indicator === 'mo' ? 'bg-yellow-400/40' :
                        'bg-blue-500/40'
                      }`} />
                    )}

                    {/* Glowing endpoint visual crown */}
                    {isEndpointCelebrated && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                    )}

                  </div>

                  {/* Static measurement volume lines */}
                  <div className="absolute top-2 left-1.5 flex flex-col justify-between h-12 text-[7.5px] font-mono text-zinc-650 opacity-80 pointer-events-none select-none">
                    <div>— 50 mL</div>
                    <div>— 25 mL</div>
                  </div>
                </div>

                {/* Submersed Glass pH sensing probe electrode */}
                {isProbeDipped && (
                  <div className="absolute top-[-36px] right-2 w-4 h-20 bg-gradient-to-b from-zinc-700 to-zinc-800 border border-zinc-900 rounded-full z-20 flex flex-col items-center p-0.5 shadow-md">
                    <div className="w-1.5 h-16 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden relative">
                      <div className="absolute inset-x-0 bottom-0 h-4 bg-teal-400/60 animate-pulse" />
                    </div>
                    {/* Dipped probe tip bulb */}
                    <div className="w-2 h-2 rounded-full bg-cyan-400/80 absolute bottom-[-4px] animate-pulse border border-cyan-300" />
                  </div>
                )}

              </div>

            </div>

            {/* Live micro stats banner at bottom of column */}
            <div className="w-full flex justify-between text-xs font-mono border-t border-slate-800/60 pt-3 z-10">
              <span className="text-zinc-400">Penyaluran (NaOH): <strong className="text-white">{titrantVol.toFixed(1)} / 50.0 mL</strong></span>
              <span className="text-zinc-400">Indikator: <strong className="text-pink-400 font-bold">{indicator.toUpperCase()}</strong></span>
            </div>

          </div>

          {/* RIGHT COLUMN: Real-time Digital PH Meter panel & plotted dynamic curve */}
          <div className="flex flex-col gap-5 justify-between">
            
            {/* Retro LED glowing pH meter panel box */}
            <div className="glass-panel border-slate-800 bg-slate-950/80 p-5 rounded-2xl flex md:flex-col justify-between items-center gap-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 font-black tracking-widest block uppercase">PENGUKUR pH DIGITAL</span>
                <p className="text-[10.5px] text-zinc-400 leading-snug">Menampilkan keasaman langsung di dalam bejana.</p>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl w-full min-w-[150px] relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
                
                {isProbeDipped ? (
                  <>
                    <span className="text-3xl font-mono font-black text-teal-400 tracking-widest animate-pulse drop-shadow-[0_0_10px_rgba(45,212,191,0.4)]">
                      {currentPH.toFixed(2)}
                    </span>
                    <span className="text-[9px] font-mono text-teal-400 font-bold uppercase tracking-wider mt-1.5">SENSING ACTIVE</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-mono font-black text-rose-500 tracking-widest block opacity-70">
                      --.--
                    </span>
                    <span className="text-[9px] font-mono text-rose-400 block mt-1.5 uppercase font-medium">SENSOR DISCONNECTED</span>
                  </>
                )}
              </div>
            </div>

            {/* Recharts graph panel display */}
            <div className="glass-panel border-slate-800 bg-slate-900/30 p-5 rounded-2xl flex flex-col justify-between h-[255px]">
              
              <div className="flex justify-between items-center w-full mb-1">
                <span className="text-[10px] font-mono text-zinc-500 block font-bold uppercase tracking-wider">KURVA pH TITRASI DYNAMIC</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      playLabSound('click', soundEnabled);
                      setIsZoomed(false);
                      setActiveInspectVol(null);
                    }}
                    className={`px-2 py-0.5 rounded text-[8.5px] font-mono border transition-all cursor-pointer ${
                      !isZoomed 
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-extrabold' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                    }`}
                  >
                    Induk (0-50 mL)
                  </button>
                  <button
                    onClick={() => {
                      playLabSound('click', soundEnabled);
                      setIsZoomed(true);
                      setActiveInspectVol(25.0);
                    }}
                    className={`px-2 py-0.5 rounded text-[8.5px] font-mono border transition-all cursor-pointer ${
                      isZoomed 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-extrabold' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-500'
                    }`}
                  >
                    Zoom (20-30 mL)
                  </button>
                </div>
              </div>

              {/* Recharts canvas */}
              <div className="relative w-full h-[165px] bg-zinc-950/20 border border-zinc-900/60 rounded-xl overflow-hidden mt-2">
                <ResponsiveContainer width="99%" height="100%">
                  <LineChart 
                    data={chartData}
                    margin={{ top: 12, right: 10, left: -22, bottom: 2 }}
                    onMouseMove={(state: any) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        const vol = state.activePayload[0].payload.vol;
                        setActiveInspectVol(vol);
                      }
                    }}
                    onMouseLeave={() => setActiveInspectVol(null)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis 
                      dataKey="vol" 
                      type="number"
                      domain={isZoomed ? [20, 30] : [0, 50]}
                      stroke="#52525b"
                      fontSize={8.5}
                      tickFormatter={(v) => `${v}`}
                      fontFamily="monospace"
                    />
                    <YAxis 
                      domain={[1, 14]} 
                      tickCount={8}
                      stroke="#52525b"
                      fontSize={8.5}
                      fontFamily="monospace"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    
                    <ReferenceLine x={25.0} stroke="rgba(244, 63, 94, 0.45)" strokeDasharray="3 3" />
                    <ReferenceLine y={7.0} stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />

                    <Line 
                      type="monotone" 
                      dataKey="pH" 
                      stroke="#14b8a6" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 4, fill: '#ec4899', stroke: '#ffffff' }}
                    />

                     {(!isZoomed || (titrantVol >= 20 && titrantVol <= 30)) && (
                      <ReferenceDot 
                        x={titrantVol} 
                        y={currentPH} 
                        r={6.5} 
                        fill={solutionStyle.bg.replace(/[^,]+\)$/, ' 0.95)')} 
                        stroke="#ffffff" 
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Informative text below canvas */}
              <div className="text-[9px] font-mono text-zinc-550 flex justify-between items-center bg-slate-950/40 px-2 py-1 rounded border border-slate-900 mt-2">
                <span>INSPEKSI TITIK KURVA KURSOR:</span>
                <span className="text-zinc-300 font-bold">Vol. {inspectVol.toFixed(1)} mL ➔ pH {inspectSpecies.ph.toFixed(2)}</span>
              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM METRICS EXPLORER LAYOUT BANNER */}
        <div className="lg:col-span-12 glass-panel border-white/5 rounded-2xl p-5 space-y-4 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Info className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white tracking-tight">🔬 Pemeriksaan Konstituen Mikro-Kimia Campuran</h3>
                <p className="text-[11px] text-zinc-450">
                  Melaporkan spesi ionik dan molekul netral yang bersirkulasi dalam bejana reaktan pada volume NaOH <span className="text-cyan-400 font-bold">{inspectVol.toFixed(1)} mL</span> (pH <span className="text-emerald-400 font-bold">{inspectSpecies.ph.toFixed(2)}</span>).
                </p>
              </div>
            </div>

            {/* Informative Chemical State indicator badges */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Status Bejana:</span>
              {(() => {
                const v = inspectVol;
                if (v === 0) {
                  return <span className="bg-red-500/10 border border-red-500/25 text-red-400 px-2 py-0.5 rounded-lg text-xs font-bold font-sans">Asam Murni</span>;
                } else if (Math.abs(v - 25.0) < 0.1) {
                  return <span className="bg-violet-600/25 border border-violet-500/35 text-violet-400 px-2 py-0.5 rounded-lg text-xs font-black font-sans animate-pulse">⭐ Titik Ekuivalen Netralisasi</span>;
                } else if (v < 25.0) {
                  if (acidType === 'strong') {
                    return <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-lg text-xs font-bold font-sans">Kelebihan Ion H⁺</span>;
                  } else {
                    return <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold font-sans">sistem Penyangga (Buffer)</span>;
                  }
                } else {
                  return <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-xs font-bold font-sans">Kelebihan OH⁻ (Basa Berlebih)</span>;
                }
              })()}
            </div>
          </div>

          {/* Micro concentration grid rows for ionic analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Hydrogen Ions (H+) */}
            <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
                <span className="text-[11px] font-bold text-red-400 font-sans flex items-center gap-1">
                  🌐 [H₃O⁺] <span className="text-[9px] text-zinc-500 font-normal font-mono">(Hidronium)</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-300">pH {inspectSpecies.ph.toFixed(2)}</span>
              </div>
              <div className="py-2.5">
                <span className="text-xs font-mono font-black text-white">{formatScientific(inspectSpecies.hConc)}</span>
              </div>
              <div className="space-y-1">
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-300" 
                    style={{ width: `${Math.max(2, ((14 - inspectSpecies.ph) / 13) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                  <span>Sangat Sedikit</span>
                  <span>Sangat Tinggi</span>
                </div>
              </div>
            </div>

            {/* 2. Hydroxide Ions (OH-) */}
            <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
                <span className="text-[11px] font-bold text-blue-400 font-sans flex items-center gap-1">
                  💧 [OH⁻] <span className="text-[9px] text-zinc-500 font-normal font-mono">(Hidroksida)</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-300">pOH {(14 - inspectSpecies.ph).toFixed(2)}</span>
              </div>
              <div className="py-2.5">
                <span className="text-xs font-mono font-black text-white">{formatScientific(inspectSpecies.ohConc)}</span>
              </div>
              <div className="space-y-1">
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-300" 
                    style={{ width: `${Math.max(2, (inspectSpecies.ph / 14) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                  <span>Sangat Sedikit</span>
                  <span>Sangat Tinggi</span>
                </div>
              </div>
            </div>

            {/* 3. Sodium Ions (Na+) */}
            <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
                <span className="text-[11px] font-bold text-purple-400 font-sans flex items-center gap-1">
                  🥗 [Na⁺] <span className="text-[9px] text-zinc-500 font-normal font-mono">(Natrium Spectator)</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-505">Titran</span>
              </div>
              <div className="py-2.5">
                <span className="text-xs font-mono font-black text-white">{formatScientific(inspectSpecies.naConc)}</span>
              </div>
              <div className="space-y-1">
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-300" 
                    style={{ width: `${(inspectVol / 50) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                  <span>0 mL</span>
                  <span>Maks (50 mL)</span>
                </div>
              </div>
            </div>

            {/* 4. Acid balance (anion or un-ionized molecular forms) */}
            <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900/60">
                <span className="text-[11px] font-bold text-emerald-400 font-sans flex items-center gap-1">
                  🧪 [{inspectSpecies.acidAnionName}] <span className="text-[9px] text-zinc-500 font-normal font-mono">({acidType === 'strong' ? 'Klorida' : 'Anion Asetat'})</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-505">Analit</span>
              </div>
              <div className="py-1.5 flex flex-col">
                <span className="text-xs font-mono font-black text-white">{formatScientific(inspectSpecies.acidAnionConc)}</span>
                {acidType === 'weak' && (
                  <span className="text-[9.5px] font-mono text-zinc-550 leading-none mt-1">
                    [{inspectSpecies.neutralAcidName}]: {formatScientific(inspectSpecies.neutralAcidConc)}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300" 
                    style={{ width: `${(25.0 / (25.0 + inspectVol)) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                  <span>Encer</span>
                  <span>Pekat Awal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// Custom tooltip renderer for interactive titration curve
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isEquiv = Math.abs(data.vol - 25.0) < 0.05;
    return (
      <div className="bg-zinc-950/95 border border-zinc-800 p-3 rounded-xl shadow-2xl font-mono text-[11px] text-zinc-300 space-y-1 backdrop-blur-md text-left">
        <div className="text-white font-bold border-b border-zinc-800 pb-1 mb-1">NaOH titran: {data.vol.toFixed(1)} mL</div>
        <div className="flex justify-between gap-4">
          <span>Nilai pH:</span>
          <span className="text-cyan-400 font-bold">{data.pH.toFixed(2)}</span>
        </div>
        {isEquiv && (
          <div className="text-red-400 font-black animate-pulse text-[9.5px] mt-1 border-t border-red-950/40 pt-1">
            ⭐ TITIK EKUIVALEN (STOIKIOMETRIS)
          </div>
        )}
      </div>
    );
  }
  return null;
};
