/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Percent, 
  HelpCircle, 
  Info, 
  Sparkles, 
  Calculator, 
  Thermometer, 
  Droplet, 
  Beaker, 
  Scale, 
  ArrowRight, 
  GraduationCap, 
  TrendingDown, 
  TrendingUp, 
  RotateCcw,
  Waves,
  Zap,
  Check,
  ChevronRight,
  Flame,
  Snowflake,
  Wind,
  Shuffle,
  Layers
} from 'lucide-react';

interface Solute {
  id: string;
  name: string;
  formula: string;
  type: 'non-electrolyte' | 'electrolyte-strong' | 'electrolyte-weak';
  iFactor: number; // Van 't Hoff base value
  ionsCount: number; // For electrolytes (n)
  alpha: number; // degree of ionization
  molarMass: number; // g/mol
  description: string;
}

const SOLUTES: Solute[] = [
  {
    id: 'glucose',
    name: 'Glukosa (C₆H₁₂O₆)',
    formula: 'C₆H₁₂O₆',
    type: 'non-electrolyte',
    iFactor: 1.0,
    ionsCount: 1,
    alpha: 0,
    molarMass: 180.16,
    description: 'Sifat Non-elektrolit murni. Larut sebagai molekul utuh tanpa terurai menjadi ion, sehingga faktor Van \'t Hoff (i) selalu tepat 1.00.'
  },
  {
    id: 'nacl',
    name: 'Garam Dapur (NaCl)',
    formula: 'NaCl',
    type: 'electrolyte-strong',
    iFactor: 2.0,
    ionsCount: 2,
    alpha: 1.0,
    molarMass: 58.44,
    description: 'Elektrolit kuat. Terionisasi sempurna membentuk kation Na⁺ dan anion Cl⁻ (n = 2). Menghasilkan efek koligatif dua kali lipat dibanding non-elektrolit.'
  },
  {
    id: 'cacl2',
    name: 'Kalsium Klorida (CaCl₂)',
    formula: 'CaCl₂',
    type: 'electrolyte-strong',
    iFactor: 3.0,
    ionsCount: 3,
    alpha: 1.0,
    molarMass: 110.98,
    description: 'Elektrolit kuat dengan muatan berganda. Terurai menjadi satu kation Ca²⁺ dan dua anion Cl⁻ (n = 3), melipatgandakan tekanan osmotik secara ekstrem.'
  },
  {
    id: 'ch3cooh',
    name: 'Asam Asetat (CH₃COOH)',
    formula: 'CH₃COOH',
    type: 'electrolyte-weak',
    iFactor: 1.15,
    ionsCount: 2,
    alpha: 0.15,
    molarMass: 60.05,
    description: 'Elektrolit lemah (Asam Cuka). Hanya terionisasi sebagian kecil di air (derajat ionisasi α ≈ 15%), melahirkan faktor Van \'t Hoff di antara 1 dan 2.'
  }
];

export default function ColligativeLab({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [activeTab, setActiveTab] = useState<'boiling_freezing' | 'osmotic' | 'vapor_pressure' | 'particle_dissociation'>('boiling_freezing');

  // Shared state simulation inputs
  const [selectedSoluteId, setSelectedSoluteId] = useState<string>('nacl');
  const [concentration, setConcentration] = useState<number>(1.0); // Molality (m) or Molarity (M)
  const [customTemp, setCustomTemp] = useState<number>(25); // Celsius for osmotic pressure calculations
  
  const currentSolute = SOLUTES.find(s => s.id === selectedSoluteId) || SOLUTES[1];

  // Particle Dissociation Sandbox States
  interface SimParticle {
    id: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
    type: 'cation' | 'anion' | 'intact' | 'water';
    label: string;
    charge: string;
    color: string;
    size: number;
    angle?: number;
  }
  const [dissocParticles, setDissocParticles] = useState<SimParticle[]>([]);
  const [showHydrationShell, setShowHydrationShell] = useState<boolean>(true);
  const [dissocSpeed, setDissocSpeed] = useState<number>(1.0);
  const [hasAddedBatch, setHasAddedBatch] = useState<boolean>(false);

  // Animation physics for Dissociation Tab
  useEffect(() => {
    if (activeTab !== 'particle_dissociation') return;

    // Load initial background water molecules if empty
    if (dissocParticles.length === 0) {
      const waters: SimParticle[] = Array.from({ length: 15 }).map((_, idx) => ({
        id: idx * 1000 + 1,
        x: 40 + Math.random() * 410,
        y: 120 + Math.random() * 125,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        type: 'water',
        label: 'H₂O',
        charge: 'δ⁺/δ⁻',
        color: 'rgba(56, 189, 248, 0.25)',
        size: 14,
        angle: Math.random() * Math.PI * 2
      }));
      setDissocParticles(waters);
    }

    const timer = setInterval(() => {
      setDissocParticles(prev => {
        return prev.map(p => {
          let nx = p.x + p.dx * dissocSpeed;
          let ny = p.y + p.dy * dissocSpeed;
          let ndx = p.dx;
          let ndy = p.dy;
          const nAngle = p.angle !== undefined ? p.angle + 0.04 * dissocSpeed : undefined;

          // Bounce off container walls (Width: 10 to 490px, water top level at y: 110px to bottom y: 270px)
          if (nx < 18 || nx > 482) ndx = -ndx;
          if (ny < 112 || ny > 268) ndy = -ndy;

          nx = Math.max(18, Math.min(482, nx));
          ny = Math.max(112, Math.min(268, ny));

          return {
            ...p,
            x: nx,
            y: ny,
            dx: ndx,
            dy: ndy,
            angle: nAngle
          };
        });
      });
    }, 30);

    return () => clearInterval(timer);
  }, [activeTab, dissocSpeed, dissocParticles.length]);

  const handleDissocTrigger = () => {
    setDissocParticles(prev => {
      const nextId = prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1;
      const newItems: SimParticle[] = [];

      // Spawn 4 batches
      for (let b = 0; b < 3; b++) {
        const spawnX = 60 + Math.random() * 380;

        if (currentSolute.id === 'nacl') {
          // Na+ (Green) and Cl- (Red) splitting burst
          newItems.push({
            id: nextId + b * 20,
            x: spawnX - 10,
            y: 125,
            dx: -0.6 - Math.random() * 0.6,
            dy: (Math.random() - 0.5) * 0.8,
            type: 'cation',
            label: 'Na⁺',
            charge: '+1',
            color: 'rgb(34, 197, 94)',
            size: 16,
            angle: Math.random() * Math.PI * 2
          });
          newItems.push({
            id: nextId + b * 20 + 1,
            x: spawnX + 10,
            y: 125,
            dx: 0.6 + Math.random() * 0.6,
            dy: (Math.random() - 0.5) * 0.8,
            type: 'anion',
            label: 'Cl⁻',
            charge: '-1',
            color: 'rgb(239, 68, 68)',
            size: 19,
            angle: Math.random() * Math.PI * 2
          });
        } else if (currentSolute.id === 'cacl2') {
          // Ca2+ (Purple) and 2x Cl- (Red) splitting burst
          newItems.push({
            id: nextId + b * 20,
            x: spawnX,
            y: 125,
            dx: (Math.random() - 0.5) * 0.4,
            dy: -0.3 + Math.random() * 0.6,
            type: 'cation',
            label: 'Ca²⁺',
            charge: '+2',
            color: 'rgb(168, 85, 247)',
            size: 15,
            angle: Math.random() * Math.PI * 2
          });
          newItems.push({
            id: nextId + b * 20 + 1,
            x: spawnX - 12,
            y: 125,
            dx: -0.7 - Math.random() * 0.5,
            dy: (Math.random() - 0.5) * 0.8,
            type: 'anion',
            label: 'Cl⁻',
            charge: '-1',
            color: 'rgb(239, 68, 68)',
            size: 19,
            angle: Math.random() * Math.PI * 2
          });
          newItems.push({
            id: nextId + b * 20 + 2,
            x: spawnX + 12,
            y: 125,
            dx: 0.7 + Math.random() * 0.5,
            dy: (Math.random() - 0.5) * 0.8,
            type: 'anion',
            label: 'Cl⁻',
            charge: '-1',
            color: 'rgb(239, 68, 68)',
            size: 19,
            angle: Math.random() * Math.PI * 2
          });
        } else if (currentSolute.id === 'ch3cooh') {
          // Weak electrolyte. Spawns ~15% chance split into H+ and CH3COO-, 85% intact
          const shouldDissolve = Math.random() < 0.20;
          if (shouldDissolve) {
            newItems.push({
              id: nextId + b * 20,
              x: spawnX - 8,
              y: 125,
              dx: -0.5 - Math.random() * 0.4,
              dy: (Math.random() - 0.5) * 0.6,
              type: 'cation',
              label: 'H⁺',
              charge: '+1',
              color: 'rgb(59, 130, 246)',
              size: 11,
              angle: Math.random() * Math.PI * 2
            });
            newItems.push({
              id: nextId + b * 20 + 1,
              x: spawnX + 8,
              y: 125,
              dx: 0.5 + Math.random() * 0.4,
              dy: (Math.random() - 0.5) * 0.6,
              type: 'anion',
              label: 'CH₃COO⁻',
              charge: '-1',
              color: 'rgb(234, 179, 8)',
              size: 21,
              angle: Math.random() * Math.PI * 2
            });
          } else {
            newItems.push({
              id: nextId + b * 20,
              x: spawnX,
              y: 125,
              dx: (Math.random() - 0.5) * 0.7,
              dy: (Math.random() - 0.5) * 0.7,
              type: 'intact',
              label: 'CH₃COOH',
              charge: '0',
              color: 'rgb(100, 116, 139)',
              size: 22,
              angle: Math.random() * Math.PI * 2
            });
          }
        } else if (currentSolute.id === 'glucose') {
          // Glukosa stays fully molekuler
          newItems.push({
            id: nextId + b * 20,
            x: spawnX,
            y: 125,
            dx: (Math.random() - 0.5) * 0.6,
            dy: (Math.random() - 0.5) * 0.6,
            type: 'intact',
            label: 'Glukosa',
            charge: '0',
            color: 'rgb(245, 158, 11)',
            size: 23,
            angle: Math.random() * Math.PI * 2
          });
        }
      }

      setHasAddedBatch(true);
      return [...prev, ...newItems];
    });
  };

  const clearDissocArena = () => {
    setDissocParticles([]);
    setHasAddedBatch(false);
  };

  // Constants for pure water
  const Kb = 0.52; // °C/m (boiling point elevation constant for water)
  const Kf = 1.86; // °C/m (freezing point depression constant for water)
  const R = 0.08205; // L.atm/mol.K
  const P_pure_water = 23.76; // mmHg at 25°C

  // 1. Calculate Van 't Hoff factor dynamically: i = 1 + (n - 1) * alpha
  const calculateVanHoff = (solute: Solute): number => {
    if (solute.type === 'non-electrolyte') return 1.0;
    return 1 + (solute.ionsCount - 1) * solute.alpha;
  };

  const iFactorVal = calculateVanHoff(currentSolute);

  // 2. Boiling & Freezing Calculations
  const deltaTb = concentration * Kb * iFactorVal;
  const tBoiling = 100.0 + deltaTb;

  const deltaTf = concentration * Kf * iFactorVal;
  const tFreezing = 0.0 - deltaTf;

  // Real-time animated temperature simulation state
  const [currentTemp, setCurrentTemp] = useState<number>(25.0);
  const [tempTestType, setTempTestType] = useState<'stabil' | 'heating' | 'cooling'>('stabil');
  const [isSimulatingTemp, setIsSimulatingTemp] = useState<boolean>(false);

  // 3. Osmotic Pressure Calculation
  const tKelvin = customTemp + 273.15;
  const osmoticPressure = concentration * R * tKelvin * iFactorVal; // Pi = M * R * T * i
  const [appliedPressure, setAppliedPressure] = useState<number>(0.0); // in atm, pumped by user

  // 4. Vapor Pressure Depression Calculations
  const n_solvent = 55.49;
  const n_solute_eff = concentration * iFactorVal;
  const total_moles = n_solvent + n_solute_eff;
  const mole_fraction_solute = n_solute_eff / total_moles;
  const mole_fraction_solvent = n_solvent / total_moles;
  
  const deltaP = P_pure_water * mole_fraction_solute; // Raoult's: deltaP = P0 * Xt
  const vaporPressureSol = P_pure_water - deltaP;

  const [gasTempInput, setGasTempInput] = useState<number>(25.0); // Temperature for the Raoult's tab
  const [isValveOpen, setIsValveOpen] = useState<boolean>(false);
  const [valveReleaseTimer, setValveReleaseTimer] = useState<number>(0);

  // Interactive beaker element visuals strings
  const [simMessage, setSimMessage] = useState<string>('Sistem stabil pada suhu kamar (25°C). Siap diuji coba.');

  // Temperature Simulation Effect Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingTemp) {
      interval = setInterval(() => {
        setCurrentTemp(prev => {
          if (tempTestType === 'heating') {
            if (prev >= tBoiling) {
              setIsSimulatingTemp(false);
              setSimMessage(`Sukses! Larutan mendidih secara konsisten pada suhu ${tBoiling.toFixed(3)}°C.`);
              return tBoiling;
            }
            // Rapid rise initially, slows down near limit
            const step = Math.max(0.2, (tBoiling - prev) * 0.12);
            return prev + step;
          } else if (tempTestType === 'cooling') {
            if (prev <= tFreezing) {
              setIsSimulatingTemp(false);
              setSimMessage(`Sukses! Larutan membeku mengkristal sempurna pada suhu ${tFreezing.toFixed(3)}°C.`);
              return tFreezing;
            }
            // Rapid fall initially, slows down near limit
            const step = Math.max(0.15, (prev - tFreezing) * 0.12);
            return prev - step;
          }
          return prev;
        });
      }, 70);
    }
    return () => clearInterval(interval);
  }, [isSimulatingTemp, tempTestType, tBoiling, tFreezing]);

  const startHeatingTest = () => {
    setTempTestType('heating');
    setIsSimulatingTemp(true);
    setSimMessage('Menyalakan pembakar Bunsen. Mengalirkan energi kalor...');
  };

  const startCoolingTest = () => {
    setTempTestType('cooling');
    setIsSimulatingTemp(true);
    setSimMessage('Mengalirkan nitrogen cair ke kompresor pendingin...');
  };

  const stopInteractiveTest = () => {
    setIsSimulatingTemp(false);
    setTempTestType('stabil');
    setCurrentTemp(25.0);
    setSimMessage('Kembali ke suhu kamar (25°C). Sistem stabil kembali.');
  };

  const triggerValveBlow = () => {
    setIsValveOpen(true);
    setValveReleaseTimer(5);
  };

  // Valve auto-close timer
  useEffect(() => {
    if (isValveOpen && valveReleaseTimer > 0) {
      const t = setTimeout(() => {
        setValveReleaseTimer(p => {
          if (p <= 1) {
            setIsValveOpen(false);
            return 0;
          }
          return p - 1;
        });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isValveOpen, valveReleaseTimer]);

  // Reset parameters
  const handleReset = () => {
    setSelectedSoluteId('nacl');
    setConcentration(1.0);
    setCustomTemp(25);
    setGasTempInput(25.0);
    setAppliedPressure(0);
    setIsSimulatingTemp(false);
    setTempTestType('stabil');
    setCurrentTemp(25.0);
    setIsValveOpen(false);
    setSimMessage('Seluruh parameter laboratorium koligatif telah diatur ulang.');
  };

  // Vapor pressure calculations influenced by temperature (simulated Antoine expansion relative)
  const calcTempAffectedVapor = (baseP: number, temp: number): number => {
    const scaleFactor = Math.exp((temp - 25.0) / 45.0);
    return baseP * scaleFactor;
  };

  const currentPureVaporAtT = calcTempAffectedVapor(P_pure_water, gasTempInput);
  const currentSolOptionVaporAtT = calcTempAffectedVapor(vaporPressureSol, gasTempInput) * (isValveOpen ? 0.3 : 1.0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Page Title & Subject Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-white/5 gap-2 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-[9px] font-black uppercase tracking-wider">LABORATORIUM FISIKAWAL</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-black uppercase tracking-wider">Sifat Koligatif</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Virtual Colligative Properties Laboratory</h2>
          <p className="text-zinc-400 text-xs md:text-sm">
            Eksplorasi kenaikan titik didih, penurunan titik beku, tekanan uap, dan osmosis dengan simulator termik &amp; hidrolik interaktif.
          </p>
        </div>
      </div>

      {/* Main Control Panel split: Left Selectors, Right Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* LEFT COLUMN: PARAMETER SETTINGS (SPAN 4) */}
        <div className="lg:col-span-4 space-y-5">
          <div className={`glass-panel rounded-2xl p-5 border space-y-5 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-100/30'}`}>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4.5 h-4.5 text-teal-400" />
                <span className="text-xs font-mono font-bold text-zinc-350 uppercase tracking-widest">KONSOL KONTROL</span>
              </div>
              <button 
                onClick={handleReset}
                className="p-1 px-2 hover:bg-slate-850 rounded border border-zinc-900 text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Lab
              </button>
            </div>

            {/* Solute chooser */}
            <div className="space-y-2">
              <label className="text-xs font-sans text-slate-400 block font-semibold">Pilih Zat Terlarut (Solute):</label>
              <div className="grid grid-cols-1 gap-2">
                {SOLUTES.map((sol) => {
                  const isCur = selectedSoluteId === sol.id;
                  let badgeColor = 'bg-stone-500/10 text-stone-400';
                  if (sol.type === 'electrolyte-strong') badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-950';
                  if (sol.type === 'electrolyte-weak') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-955';
                  return (
                    <button
                      key={sol.id}
                      onClick={() => { setSelectedSoluteId(sol.id); }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isCur 
                          ? 'bg-teal-500/10 border-teal-500 text-white shadow' 
                          : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold block">{sol.name}</span>
                        <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-black border ${badgeColor}`}>
                          {sol.type === 'non-electrolyte' ? 'NON-ELI' : sol.type === 'electrolyte-strong' ? 'ELI-KUAT' : 'ELI-LEMAH'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono mt-2 text-zinc-550">
                        <span>Rumus: {sol.formula}</span>
                        <span>Mr: {sol.molarMass} g/mol</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Concentration Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Konsentrasi Zat Terlarut :</span>
                <span className={`text-teal-400 font-mono font-bold text-sm px-2 py-0.5 rounded border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                  {concentration.toFixed(2)} m (Molal)
                </span>
              </div>
              <input 
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={concentration}
                onChange={(e) => { 
                  setConcentration(parseFloat(e.target.value)); 
                  // If we are simulating and change concentration, keep simulated state but let target adjust
                }}
                className={`w-full accent-teal-500 h-1.5 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-650">
                <span>Encer (0.10 m)</span>
                <span>Pekat (5.00 m)</span>
              </div>
            </div>

            {/* Van 't Hoff Calculation breakdown box */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${theme === 'dark' ? 'bg-slate-950/70 border-slate-900' : 'bg-slate-100/70 border-slate-300'}`}>
              <span className="text-[9.5px] font-mono text-zinc-550 block">FAKTOR DISOSIASI VAN 'T HOFF (i) :</span>
              
              <div className="flex justify-between items-center">
                <div className="font-mono text-xs text-slate-350">
                  {currentSolute.type === 'non-electrolyte' ? (
                    <span>Tidak terionisasi (i = 1 murni)</span>
                  ) : (
                    <div className="space-y-0.5">
                      <div>i = 1 + (n − 1)α</div>
                      <div className="text-[10px] text-zinc-500">
                        1 + ({currentSolute.ionsCount} - 1) × {currentSolute.alpha.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded text-center">
                  <span className="text-[9px] font-mono text-zinc-500 block leading-none">NILAI i</span>
                  <span className="text-xs font-bold font-mono text-teal-400">{iFactorVal.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed font-sans pt-1 border-t border-zinc-900/40">
                {currentSolute.description}
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: LAB INTERACTIVITIES & SIMULATOR RESULTS (SPAN 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Internal Module tabs select */}
          <div className={`flex flex-wrap gap-2 p-1 border rounded-xl w-max ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/60 border-slate-300'}`}>
            <button
              onClick={() => setActiveTab('boiling_freezing')}
              className={`px-3 py-1.5 text-[11px] font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'boiling_freezing' 
                  ? 'bg-teal-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Titik Didih &amp; Beku</span>
            </button>
            <button
              onClick={() => setActiveTab('osmotic')}
              className={`px-3 py-1.5 text-[11px] font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'osmotic' 
                  ? 'bg-teal-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Osmosis &amp; Osmosis Balik</span>
            </button>
            <button
              onClick={() => setActiveTab('vapor_pressure')}
              className={`px-3 py-1.5 text-[11px] font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'vapor_pressure' 
                  ? 'bg-teal-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Tekanan Uap</span>
            </button>
            <button
              onClick={() => setActiveTab('particle_dissociation')}
              className={`px-3 py-1.5 text-[11px] font-bold font-sans rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'particle_dissociation' 
                  ? 'bg-teal-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Disosiasi & Hidrasi</span>
            </button>
          </div>

          {/* --- MODULE 1: BOILING ELEVATION & FREEZING DEPRESSION --- */}
          {activeTab === 'boiling_freezing' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Visual Beaker Pot with Freezing or Boiling status */}
                <div className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between items-center text-center h-[380px] relative overflow-hidden ${theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-100/30'}`}>
                  <div className="text-[10px] font-mono text-zinc-500 block font-bold uppercase tracking-wider mb-1">BEAKER DENGAN SIMULATOR PEMANAS &amp; PENDINGIN</div>
                  
                  {/* Particulate rendering container */}
                  <div className="relative w-36 h-40 border-4 border-t-0 border-slate-400 rounded-b-3xl bg-zinc-950/40 mt-3 flex items-end p-0.5">
                    
                    {/* Visual Ice Formations: shows frozen lattice starting from bottom depending on how cold it is */}
                    {tempTestType === 'cooling' && currentTemp <= 10 && (
                      <div 
                        className="absolute bottom-0 inset-x-0 bg-blue-105 border-t-2 border-white/40 transition-all duration-300 pointer-events-none z-10 text-[9px] font-mono text-blue-900 flex items-center justify-center font-bold"
                        style={{ 
                          height: `${Math.min(100, Math.max(0, ((10 - currentTemp) / (10 - tFreezing)) * 100))}%`,
                          backgroundColor: 'rgba(219, 234, 254, 0.75)',
                          backdropFilter: 'blur(1px)'
                        }}
                      >
                        {currentTemp <= tFreezing ? 'FROZEN SOLID' : 'KRISTAL ES...'}
                      </div>
                    )}

                    {/* Water fluid level with color depending on concentration */}
                    <div 
                      className={`w-full h-24 rounded-b-2.5xl transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
                        tempTestType === 'heating' && currentTemp >= 95 ? 'bg-cyan-650/40 border-t-2 border-orange-400/40' : 'bg-cyan-600/20 border-t border-cyan-500/35'
                      }`}
                      style={{ filter: `hue-rotate(${concentration * 10}deg)` }}
                    >
                      {/* Floating steam or bubbles if hot */}
                      {tempTestType === 'heating' && currentTemp >= 60 && (
                        <div className="absolute inset-0 z-0">
                          {Array.from({ length: Math.round((currentTemp - 50) / 4) }).map((_, bIdx) => {
                            const delay = (bIdx * 0.1) % 1;
                            const size = (bIdx % 2 === 0) ? 'w-2 h-2' : 'w-1 h-1';
                            const left = (bIdx * 17) % 110 + 10;
                            return (
                              <div 
                                key={`bubble-${bIdx}`}
                                className={`absolute rounded-full border border-white/50 bg-white/10 animate-bounce ${size}`}
                                style={{
                                  left: `${left}px`,
                                  bottom: `${(bIdx * 11) % 60}px`,
                                  animationDuration: `${0.8 + delay}s`
                                }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Visual rendering of water molecules (blue) vs solute molecules (yellow core) */}
                      {/* Solute particles are scattered on-screen */}
                      {Array.from({ length: Math.round(concentration * 7) }).map((_, pIdx) => {
                        const randomX = (pIdx * 13) % 110 + 10;
                        const randomY = (pIdx * 19) % 70 + 15;
                        const isFrozen = tempTestType === 'cooling' && currentTemp <= tFreezing;
                        return (
                          <div 
                            key={pIdx}
                            className={`absolute w-2 h-2 rounded-full border border-zinc-950 shrink-0 z-20 ${
                              isFrozen ? 'animate-none' : 'animate-pulse'
                            } ${
                              currentSolute.type === 'non-electrolyte' 
                                ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.7)]' 
                                : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.7)]'
                            }`}
                            style={{ 
                              left: `${randomX}px`, 
                              bottom: `${randomY}px`,
                              animationDelay: `${pIdx * 0.15}s`
                            }}
                            title="Molekul terlarut"
                          />
                        );
                      })}
                      
                      <span className="text-[9.5px] font-mono text-zinc-500 absolute bottom-3 text-center w-full block">Massa Air: 1 kg</span>
                    </div>

                    {/* Thermometer scale sidebar to pot */}
                    <div className="absolute right-[-24px] top-4 h-32 flex flex-col justify-between text-[9px] font-mono text-zinc-550">
                      <span className="text-red-400">Didih</span>
                      <span>— 100°C</span>
                      <span>Asal</span>
                      <span>— 0°C</span>
                      <span className="text-sky-400">Beku</span>
                    </div>
                  </div>

                  {/* Bunsen burner burner / cooling plate underneath beaker */}
                  <div className="w-full flex justify-center items-center h-8">
                    {tempTestType === 'heating' && (
                      <div className="flex gap-1.5 items-center justify-center animate-pulse">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-[10px] font-mono text-orange-400 font-bold tracking-widest uppercase">PEMANAS BUNSEN AKTIF</span>
                      </div>
                    )}
                    {tempTestType === 'cooling' && (
                      <div className="flex gap-1.5 items-center justify-center animate-pulse">
                        <Snowflake className="w-5 h-5 text-sky-400" />
                        <span className="text-[10px] font-mono text-sky-400 font-bold tracking-widest uppercase">KOMPRESOR ES AKTIF</span>
                      </div>
                    )}
                    {tempTestType === 'stabil' && (
                      <span className="text-[9px] font-mono text-zinc-600 uppercase">Bunsen / Kompresor Mati</span>
                    )}
                  </div>

                  {/* Status Bar */}
                  <div className={`w-full p-2.5 rounded-xl border flex justify-between items-center text-[10.5px] font-mono ${theme === 'dark' ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-100/80 border-slate-300'}`}>
                    <span className="text-zinc-550">SUHU MONITORED:</span>
                    <span className="text-teal-400 font-bold block">{currentTemp.toFixed(2)} °C</span>
                  </div>
                </div>

                {/* Calculation breakdown and formula output */}
                <div className="space-y-4">
                  
                  {/* Dynamic interactive buttons for testing boiling / freezing */}
                  <div className={`p-4 rounded-xl border space-y-2 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-300 bg-slate-100/50'}`}>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold block uppercase tracking-wider">UJI FISIK PARTIKEL SECARA LIVE:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={startHeatingTest}
                        disabled={isSimulatingTemp && tempTestType === 'heating'}
                        className="py-2 px-3 rounded-lg text-xs font-bold font-sans bg-amber-500 text-slate-950 hover:bg-amber-600 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        Panaskan (Didih)
                      </button>
                      <button
                        onClick={startCoolingTest}
                        disabled={isSimulatingTemp && tempTestType === 'cooling'}
                        className="py-2 px-3 rounded-lg text-xs font-bold font-sans bg-sky-500 text-slate-950 hover:bg-sky-600 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Snowflake className="w-3.5 h-3.5" />
                        Dinginkan (Beku)
                      </button>
                    </div>
                    {tempTestType !== 'stabil' && (
                      <button
                        onClick={stopInteractiveTest}
                        className="w-full py-1.5 mt-1 rounded-lg text-[10px] uppercase tracking-wider font-mono bg-red-950 hover:bg-red-900/55 border border-red-500/20 text-red-400 font-bold cursor-pointer"
                      >
                        Hentikan Pengujian &amp; Reset Suhu
                      </button>
                    )}
                  </div>

                  {/* Boiling Point Elevation Panel */}
                  <div className={`p-4 rounded-xl border space-y-2 text-left ${theme === 'dark' ? 'border-slate-850 bg-slate-900/25' : 'border-slate-300 bg-slate-100/25'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-sans font-bold text-xs">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                        <span>Kenaikan Titik Didih (ΔTb)</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">Kb = {Kb} °C/m</span>
                    </div>

                    <div className={`p-3 rounded-lg border font-mono text-xs space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="text-zinc-550">ΔTb = m × Kb × i</div>
                      <div>
                        ΔTb = {concentration.toFixed(2)} × {Kb} × {iFactorVal.toFixed(2)} = <strong className="text-red-400">+{deltaTb.toFixed(3)}°C</strong>
                      </div>
                      <div className="text-zinc-400 border-t border-zinc-900/70 pt-1 mt-1 font-semibold flex justify-between">
                        <span>Suhu Didih Larutan:</span>
                        <span className="text-white font-bold">{tBoiling.toFixed(3)} °C</span>
                      </div>
                    </div>
                  </div>

                  {/* Freezing Point Depression Panel */}
                  <div className={`p-4 rounded-xl border space-y-2 text-left ${theme === 'dark' ? 'border-slate-850 bg-slate-900/25' : 'border-slate-300 bg-slate-100/25'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-sans font-bold text-xs">
                        <TrendingDown className="w-4 h-4 text-sky-450" />
                        <span>Penurunan Titik Beku (ΔTf)</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">Kf = 1.86 °C/m</span>
                    </div>

                    <div className={`p-3 rounded-lg border font-mono text-xs space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="text-zinc-505">ΔTf = m × Kf × i</div>
                      <div>
                        ΔTf = {concentration.toFixed(2)} × {Kf} × {iFactorVal.toFixed(2)} = <strong className="text-sky-400">+{deltaTf.toFixed(3)}°C</strong>
                      </div>
                      <div className="text-zinc-400 border-t border-zinc-900/70 pt-1 mt-1 font-semibold flex justify-between">
                        <span>Suhu Beku Larutan:</span>
                        <span className="text-white font-bold">{tFreezing.toFixed(3)} °C</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Status Message */}
              <div className={`w-full p-3 rounded-xl border border-teal-500/20 text-xs font-sans flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-slate-100/80'}`}>
                <Info className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{simMessage}</span>
              </div>

            </div>
          )}

          {/* --- MODULE 2: OSMOTIC PRESSURE --- */}
          {activeTab === 'osmotic' && (
            <div className="space-y-6 text-left">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual U-Tube representation of osmosis membrane cell */}
                <div className={`glass-panel p-5 border flex flex-col justify-between items-center h-[380px] relative ${theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-100/30'}`}>
                  <div className="text-[10px] font-mono text-zinc-500 font-bold tracking-wider mb-2">SIMULASI DUA ARAH (MEMBRAN SEMIPERMEABEL)</div>
                  
                  {/* Dynamic Water levels in Pipa U layout */}
                  <div className="relative w-48 h-40 border-b-8 border-slate-400 flex justify-between px-3 mt-4">
                    {/* Left chamber: Pure Water (solvent only) */}
                    <div 
                      className="w-12 border-l-4 border-r-4 border-t-0 border-slate-400 bg-cyan-600/10 rounded-b relative flex items-end transition-all duration-500 ease-in-out"
                      style={{ 
                        // If reverse osmosis triggers, pure water rises!
                        height: `${80 - concentration * 8 + (appliedPressure > osmoticPressure ? (appliedPressure - osmoticPressure) * 1.5 : 0)}%` 
                      }}
                    >
                      <div className="w-full bg-cyan-500/25 h-full relative">
                        <div className="absolute inset-x-0 bottom-2 text-[9px] font-mono text-sky-400 text-center leading-none">AIR MURNI</div>
                      </div>
                    </div>

                    {/* Central barrier (virtual membrane line) */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 top-0 w-1 bg-dashed border-l border-teal-500/30 font-mono text-[8.5px] text-teal-400 flex items-center justify-center writing-mode-vertical">
                      MEMBRAN
                    </div>

                    {/* Right chamber: Concentration solution (Solute + Solvent) with piston above */}
                    <div 
                      className="w-12 border-l-4 border-r-4 border-t-0 border-slate-400 bg-cyan-600/10 rounded-b relative flex flex-col justify-end transition-all duration-500 ease-in-out"
                      style={{ 
                        height: `${80 + concentration * 10 - (appliedPressure > osmoticPressure ? (appliedPressure - osmoticPressure) * 1.5 : appliedPressure * 0.5)}%` 
                      }}
                    >
                      {/* Piston head representing applied pressure */}
                      <div 
                        className="absolute w-[40px] bg-slate-500 h-2 border-b border-black flex justify-center items-center transition-all duration-500"
                        style={{ 
                          top: '0px', 
                          left: '0px',
                          transform: `translateY(${appliedPressure * 0.8}px)`
                        }}
                      />

                      <div className="w-full bg-teal-500/20 h-full relative flex flex-col justify-end overflow-hidden">
                        {/* Solute dots floating looking denser */}
                        <div className="grid grid-cols-2 gap-1.5 p-1 absolute top-4 left-1">
                          {Array.from({ length: Math.round(concentration * 4) }).map((_, dIdx) => (
                            <div key={dIdx} className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
                          ))}
                        </div>
                        <div className="absolute inset-x-0 bottom-2 text-[9px] font-mono text-yellow-400 text-center uppercase font-bold leading-none">LARUTAN</div>
                      </div>
                    </div>

                    {/* Flow arrow markers showing water translation */}
                    {appliedPressure > osmoticPressure ? (
                      <div className="absolute left-1/2 -translateX-1/2 top-1/2 text-green-400 font-bold text-xs animate-ping">
                        ← REVERSE
                      </div>
                    ) : (
                      <div className="absolute left-1/2 -translateX-1/2 top-1/2 text-teal-400 font-bold text-xs animate-pulse">
                        OSMOSIS →
                      </div>
                    )}
                  </div>

                  <div className={`w-full p-2.5 rounded-lg border border-dashed text-stone-300 text-center text-[10px] leading-relaxed font-sans ${theme === 'dark' ? 'bg-slate-950/20 border-slate-900' : 'bg-slate-100/20 border-slate-300'}`}>
                    {appliedPressure > osmoticPressure ? (
                      <span className="text-emerald-400 font-semibold">
                        🎉 OSMOSIS BALIK AKTIF! Pompa ({appliedPressure.toFixed(1)} atm) melampaui tekanan osmotik ({osmoticPressure.toFixed(2)} atm), memaksa air keluar dari larutan!
                      </span>
                    ) : (
                      <span>
                        Air murni merembes alami ke kanan. Berikan <strong>tekanan pompa eksternal</strong> di sebelah kanan untuk menolak rembesan air atau memicu pemurnian kembali air.
                      </span>
                    )}
                  </div>
                </div>

                {/* Calculation outputs */}
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border space-y-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/20' : 'border-slate-300 bg-slate-100/20'}`}>
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Waves className="w-4 h-4 text-emerald-400" />
                        <span>Hukum Van 't Hoff &amp; Pompa Hidrolik</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">R = 0.08205</span>
                    </div>

                    {/* Temperature custom setting input */}
                    <div className={`space-y-1 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-905' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>SUHU SIMULASI :</span>
                        <span className="text-white font-bold">{customTemp}°C ({tKelvin.toFixed(1)} K)</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="80"
                        step="5"
                        value={customTemp}
                        onChange={(e) => setCustomTemp(parseInt(e.target.value))}
                        className={`w-full h-1.5 accent-teal-500 appearance-none rounded-md ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                      />
                    </div>

                    {/* INTERACTIVE COMPRESSOR PUMP CONTROLLER */}
                    <div className={`space-y-2 p-3 rounded-xl border border-teal-950/40 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-amber-400 font-bold block">TEKANAN POMPA EKSTERNAL:</span>
                        <span className="text-white font-black">{appliedPressure.toFixed(1)} atm</span>
                      </div>
                      <input 
                        type="range"
                        min="0.0"
                        max="50.0"
                        step="0.5"
                        value={appliedPressure}
                        onChange={(e) => setAppliedPressure(parseFloat(e.target.value))}
                        className={`w-full h-1.5 accent-amber-500 appearance-none rounded-md ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                      />
                      <div className="flex justify-between items-center gap-2 pt-1">
                        <button
                          onClick={() => setAppliedPressure(p => Math.min(50, p + 5.0))}
                          className={`flex-1 py-1 px-2 text-[9px] uppercase font-mono hover:bg-slate-850 rounded border border-zinc-800 font-bold cursor-pointer ${theme === 'dark' ? 'bg-slate-900 hover:text-white' : 'bg-slate-100 hover:text-slate-900'}`}
                        >
                          +5.0 atm (Pompa!)
                        </button>
                        <button
                          onClick={() => setAppliedPressure(0)}
                          className={`py-1 px-3 text-[9px] uppercase font-mono rounded border border-zinc-800 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-zinc-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}
                        >
                          Rilis Piston
                        </button>
                      </div>
                    </div>

                    {/* Formulation widget */}
                    <div className={`p-4.5 rounded-xl border border-zinc-900 font-mono text-xs space-y-2 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                      <div className="flex justify-between">
                        <span className="text-zinc-650 text-[10px] uppercase">RUMUS TEKANAN OSMOTIK:</span>
                        <span className="text-[9px] text-zinc-650">Π = M × R × T × i</span>
                      </div>

                      <div className="pt-2 border-t border-zinc-900/60 text-slate-300">
                        <div>Π = {concentration.toFixed(2)} M × {R} × {tKelvin.toFixed(1)} K × {iFactorVal.toFixed(2)}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-teal-400 font-mono text-sm uppercase">TEKANAN OSMOTIK (Π) :</span>
                          <span className="text-base text-teal-400 font-black">
                            {osmoticPressure.toFixed(3)} atm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* --- MODULE 3: VAPOR PRESSURE DEPRESSION --- */}
          {activeTab === 'vapor_pressure' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Visual Glass tube closed caps with evaporation particles */}
                <div className={`glass-panel p-5 border flex flex-col justify-between items-center h-[380px] relative ${theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-100/30'}`}>
                  <div className="text-[10px] font-mono text-zinc-550 block font-bold uppercase tracking-wider mb-2">SIMULASI DUA TABUNG TERTUTUP (UJI PENGUAPAN)</div>
                  
                  <div className="flex justify-center gap-10 mt-3 w-full my-auto items-end">
                    
                    {/* Bottle A: Pure Solvent (lots of steam dots) */}
                    <div className="flex flex-col items-center">
                      <div className="w-18 h-28 border-4 border-slate-400 rounded-b-xl rounded-t-3xl relative bg-zinc-950/20">
                        {/* Liquid fluid level */}
                        <div className="absolute inset-x-0 bottom-0 bg-cyan-600/20 h-10 border-t border-cyan-500/25" />
                        {/* Vapor dots - many in pure solvent */}
                        {Array.from({ length: Math.round(currentPureVaporAtT * 0.4) }).map((_, idx) => (
                          <div 
                            key={`v1-${idx}`} 
                            className="absolute w-1 h-1 bg-indigo-300 rounded-full animate-ping"
                            style={{ 
                              left: `${(idx * 7) % 36 + 12}px`,
                              top: `${(idx * 11) % 45 + 15}px`,
                              animationDuration: `${1.1 + idx * 0.2}s`
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[9.5px] font-mono text-zinc-450 mt-1.5">Pelarut Murni</span>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/30 px-1.5 py-0.5 rounded border border-indigo-900 mt-0.5">
                        {currentPureVaporAtT.toFixed(2)} mmHg
                      </span>
                    </div>

                    {/* Bottle B: With Solute particles blocking surface (fewer steam dots) */}
                    <div className="flex flex-col items-center">
                      <div className="w-18 h-28 border-4 border-slate-400 rounded-b-xl rounded-t-3xl relative bg-zinc-950/20">
                        {/* Liquid fluid level */}
                        <div className="absolute inset-x-0 bottom-0 bg-teal-500/15 h-10 border-t border-teal-550/20 flex flex-wrap gap-1 p-0.5 pointer-events-none">
                          {/* Yellow blocker particles at surface of liquid */}
                          <div className="w-1.5 bg-yellow-400 h-1.5 rounded-full absolute top-[-3px] left-2 shadow-[0_0_2px_#fbbf24]" />
                          <div className="w-1.5 bg-yellow-400 h-1.5 rounded-full absolute top-[-3px] left-6 shadow-[0_0_2px_#fbbf24]" />
                          <div className="w-1.5 bg-yellow-400 h-1.5 rounded-full absolute top-[-3px] left-10 shadow-[0_0_2px_#fbbf24]" />
                        </div>
                        {/* Vapor dots - FEW because of solute blockage */}
                        {Array.from({ length: Math.round(currentSolOptionVaporAtT * 0.4) }).map((_, idx) => (
                          <div 
                            key={`v2-${idx}`} 
                            className="absolute w-1 h-1 bg-zinc-450 rounded-full animate-pulse"
                            style={{ 
                              left: `${(idx * 13) % 36 + 12}px`,
                              top: `${(idx * 17) % 45 + 25}px`,
                              animationDuration: `${1.6 + idx * 0.3}s`
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[9.5px] font-mono text-zinc-450 mt-1.5">Larutan dengan Solut</span>
                      <span className="text-xs font-mono font-bold text-yellow-450 bg-yellow-950/30 px-1.5 py-0.5 rounded border border-yellow-900 mt-0.5">
                        {currentSolOptionVaporAtT.toFixed(2)} mmHg
                      </span>
                    </div>

                  </div>

                  {/* Interactive Valve Button */}
                  <div className="w-full flex justify-between items-center pt-2 gap-2 text-xs">
                    <button
                      onClick={triggerValveBlow}
                      disabled={isValveOpen}
                      className="flex-1 py-1.5 px-3 rounded-lg font-bold font-sans bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Wind className={`w-3.5 h-3.5 ${isValveOpen ? 'animate-spin' : ''}`} />
                      {isValveOpen ? 'Katup Terbuka (Hissing...)' : 'Buka Katup Tekanan'}
                    </button>
                  </div>
                </div>

                {/* Calculation output card */}
                <div className="space-y-4">
                  <div className={`p-5 rounded-2xl border space-y-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/20' : 'border-slate-300 bg-slate-100/20'}`}>
                    <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Droplet className="w-4 h-4 text-sky-400" />
                        <span>Hukum Raoult: Tekanan Uap &amp; Suhu</span>
                      </div>
                    </div>

                    {/* Interactive Temperature slider for the vapor tab */}
                    <div className={`space-y-1 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-905' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>SUHU PELARUT :</span>
                        <span className="text-indigo-400 font-bold">{gasTempInput}°C (Naikkan untuk menguapkan)</span>
                      </div>
                      <input 
                        type="range"
                        min="20"
                        max="90"
                        step="1"
                        value={gasTempInput}
                        onChange={(e) => setGasTempInput(parseFloat(e.target.value))}
                        className={`w-full h-1.5 accent-indigo-500 appearance-none rounded-md ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                      />
                    </div>

                    <div className={`p-4 rounded-xl border font-mono text-xs space-y-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-905' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="space-y-1">
                        <span className="text-zinc-550 text-[10px] block leading-none">FRAKSI MOL ZAT TERLARUT (Xt):</span>
                        <div className="text-teal-400 font-bold">
                          Xt = {mole_fraction_solute.toFixed(5)}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-900/70 space-y-1">
                        <span className="text-zinc-550 text-[10px] block leading-none">DAMPAK RAOULT:</span>
                        <div className="text-red-400 font-bold">
                          ΔP pada 25°C = {deltaP.toFixed(4)} mmHg
                        </div>
                        <div className="text-emerald-400 font-bold border-t border-zinc-900/65 pt-1.5 mt-1 font-sans">
                          Tekanan Uap Larutan (Pl) = {vaporPressureSol.toFixed(3)} mmHg
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* --- MODULE 4: DYNAMIC PARTICLE DISSOCIATION ARENA --- */}
          {activeTab === 'particle_dissociation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Beaker (Span 7) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between items-center text-center relative overflow-hidden h-[410px] ${theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-100/30'}`}>
                    <div className="w-full flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">BEAKER ARENA DISOSIASI MOLEKUL</span>
                      <span className="text-[10.5px] font-mono text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                        Zat Aktif: {currentSolute.name}
                      </span>
                    </div>

                    {/* Interactive Arena */}
                    <div className={`relative w-full h-80 border-4 border-t-0 border-slate-400 rounded-b-3xl mt-4 overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-100/90'}`}>
                      {/* Air line / water top line */}
                      <div className="absolute top-[100px] inset-x-0 border-t-2 border-sky-400/35 bg-sky-500/10 h-[220px] pointer-events-none z-0">
                        <div className="absolute top-1 right-2 text-[9px] font-mono text-sky-450 tracking-wider">BATAS PERMUKAAN AIR H₂O</div>
                      </div>

                      {/* Render Particles */}
                      {dissocParticles.map((p) => {
                        const showShell = showHydrationShell && (p.type === 'cation' || p.type === 'anion');
                        
                        return (
                          <div
                            key={p.id}
                            className="absolute transition-all duration-75 select-none animate-fade-in"
                            style={{
                              left: `${p.x}px`,
                              top: `${p.y}px`,
                              transform: 'translate(-50%, -50%)',
                              zIndex: p.type === 'water' ? 10 : 20
                            }}
                          >
                            {/* Main Particle representation */}
                            <div
                              className={`rounded-full flex items-center justify-center font-bold text-[9.5px] font-mono border shadow-md relative group select-none`}
                              style={{
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                backgroundColor: p.color,
                                borderColor: p.type === 'water' ? 'rgba(56, 189, 248, 0.4)' : 'rgb(9, 9, 11)',
                                color: p.type === 'water' ? '#7dd3fc' : '#000000',
                                cursor: 'help'
                              }}
                              title={`Tipe: ${p.label}, Muatan: ${p.charge}`}
                            >
                              {p.label}
                              
                              {/* Charge indicator */}
                              {p.charge !== '0' && p.type !== 'water' && (
                                <span className="absolute -top-1.5 -right-1 px-1 bg-black text-white text-[7.5px] rounded-full border border-zinc-705 leading-none">
                                  {p.charge}
                                </span>
                              )}

                              {/* Hydration shell representation */}
                              {showShell && (
                                <div className="absolute inset-0 pointer-events-none">
                                  {Array.from({ length: 4 }).map((_, hIdx) => {
                                    const baseAngle = (p.angle || 0) + (hIdx * (Math.PI / 2));
                                    const rad = 18;
                                    const hx = Math.cos(baseAngle) * rad;
                                    const hy = Math.sin(baseAngle) * rad;
                                    return (
                                      <div
                                        key={hIdx}
                                        className="absolute w-2.5 h-2.5 rounded-full border flex items-center justify-center text-[5.5px] font-black pointer-events-none"
                                        style={{
                                          left: `calc(50% + ${hx}px)`,
                                          top: `calc(50% + ${hy}px)`,
                                          transform: 'translate(-50%, -50%)',
                                          backgroundColor: p.type === 'cation' ? '#ef4444' : '#e2e8f0', // Oxygen (red, oxygen end) facing cation vs hydrogen (white/slate, hydrogen end) facing anion
                                          borderColor: '#27272a',
                                          color: p.type === 'cation' ? '#ffffff' : '#0f172a'
                                        }}
                                        title={p.type === 'cation' ? 'Oksigen (δ⁻) ditarik kation' : 'Hidrogen (δ⁺) ditarik anion'}
                                      >
                                        {p.type === 'cation' ? 'O' : 'H'}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Background grid details */}
                      {dissocParticles.filter(p => p.type !== 'water').length === 0 && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 font-sans space-y-1.5 pointer-events-none z-10 ${theme === 'dark' ? 'text-zinc-500 bg-slate-950/40' : 'text-slate-600 bg-slate-100/40'}`}>
                          <Layers className="w-8 h-8 text-teal-400/80 animate-pulse" />
                          <span className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Beaker Larutan Kosong</span>
                          <p className="text-[10px] leading-relaxed max-w-xs text-zinc-400">
                            Klik &quot;Larutkan Batch Zat&quot; di tombol sisi kanan untuk memasukkan kristal zat terlarut ke dalam air!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className={`w-full text-left p-2 text-[10px] font-mono rounded border border-white/5 flex justify-between ${theme === 'dark' ? 'bg-slate-950 text-zinc-500' : 'bg-slate-100 text-slate-600'}`}>
                      <span>Total Partikel di Beaker: <b className="text-white">{dissocParticles.length}</b></span>
                      <span>Mantel Hidrasi Selat: <b className={showHydrationShell ? "text-teal-400" : "text-zinc-500"}>{showHydrationShell ? "Aktif" : "Mati"}</b></span>
                    </div>
                  </div>
                </div>

                {/* Control Panel (Span 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className={`glass-panel p-5 rounded-2xl border space-y-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-100/30'}`}>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold tracking-widest uppercase block border-b border-white/5 pb-2">KEMUDI ARENA DISOSIASI</span>

                    <div className="space-y-2">
                      <button
                        onClick={handleDissocTrigger}
                        className="w-full py-3 px-4 rounded-xl text-xs font-bold font-sans bg-teal-500 text-slate-950 hover:bg-teal-600 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
                        Larutkan Batch Zat (Tambah Kristal Baru)
                      </button>
                      <button
                        onClick={clearDissocArena}
                        disabled={dissocParticles.filter(p => p.type !== 'water').length === 0}
                        className="w-full py-2 px-3 rounded-lg text-xs font-mono border border-red-500/20 bg-red-950/20 text-red-00 hover:bg-red-950/40 disabled:opacity-55 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Bersihkan Solut
                      </button>
                    </div>

                    {/* Hydration shell toggle */}
                    <div className={`p-3 rounded-xl border border-white/5 space-y-2 ${theme === 'dark' ? 'bg-slate-955 bg-slate-950/60' : 'bg-slate-100 bg-slate-100/60'}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-semibold">Gaya Dipol Hidrasi (H₂O Shell):</span>
                        <input
                          type="checkbox"
                          checked={showHydrationShell}
                          onChange={(e) => setShowHydrationShell(e.target.checked)}
                          className={`w-4 h-4 text-teal-600 border-zinc-755 rounded focus:ring-teal-500 accent-teal-500 cursor-pointer ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                        />
                      </div>
                      <p className="text-[9.5px] text-zinc-500 leading-relaxed font-sans font-medium">
                        Ketika aktif, menampilkan bagaimana dipol molekul air yang bermassa polar menarik kation/anion. Bagian oksigen (O, merah, δ⁻) merapat ke bagian kation (Na⁺, Ca²⁺) sedangkan bagian hidrogen (H, putih, δ⁺) mengelilingi anion (Cl⁻).
                      </p>
                    </div>

                    {/* Simulation speed slider */}
                    <div className={`p-3 rounded-xl border border-white/5 space-y-2 ${theme === 'dark' ? 'bg-slate-950/60' : 'bg-slate-100/60'}`}>
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">GERAK TERMAL FLUKS :</span>
                        <span className="text-teal-400 font-bold">{dissocSpeed.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={dissocSpeed}
                        onChange={(e) => setDissocSpeed(parseFloat(e.target.value))}
                        className={`w-full h-1.5 accent-teal-500 appearance-none rounded-md ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                      />
                    </div>

                    {/* Conductivity index & Van't Hoff metrics */}
                    <div className={`p-4 rounded-xl border border-white/5 space-y-3 font-mono text-xs ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                      <span className="text-zinc-550 text-[10px] uppercase font-bold tracking-wider block border-b border-zinc-900 pb-1">
                        STATISTIK SPEKTRUM AKTIF:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-zinc-500 block text-[9.5px]">KATION BEBAS:</span>
                          <span className="text-green-400 font-bold text-sm block">{dissocParticles.filter(p => p.type === 'cation').length}</span>
                        </div>
                        <div>
                          <span className="text-zinc-550 block text-[9.5px]">ANION BEBAS:</span>
                          <span className="text-red-400 font-bold text-sm block">{dissocParticles.filter(p => p.type === 'anion').length}</span>
                        </div>
                        <div>
                          <span className="text-zinc-550 block text-[9.5px]">MOLEKUL UTUH:</span>
                          <span className="text-amber-405 text-amber-400 font-bold text-sm block">{dissocParticles.filter(p => p.type === 'intact').length}</span>
                        </div>
                        <div>
                          <span className="text-zinc-550 block text-[9.5px]">AIR (H₂O):</span>
                          <span className="text-sky-400 font-bold text-sm block">15 Partikel</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-905 space-y-1.5 leading-tight">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-zinc-400">FAKTOR VAN &apos;T HOFF (i) AKTIF:</span>
                          <span className="font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                            i = {dissocParticles.filter(p => p.type !== 'water').length > 0 
                              ? (
                                  (
                                    dissocParticles.filter(p => p.type === 'cation').length + 
                                    dissocParticles.filter(p => p.type === 'anion').length + 
                                    dissocParticles.filter(p => p.type === 'intact').length
                                  ) / (
                                    currentSolute.id === 'nacl' 
                                      ? Math.max(1, (dissocParticles.filter(p => p.type === 'cation').length + dissocParticles.filter(p => p.type === 'anion').length) / 2)
                                      : currentSolute.id === 'cacl2'
                                      ? Math.max(1, (dissocParticles.filter(p => p.type === 'cation').length + (dissocParticles.filter(p => p.type === 'anion').length / 2)) / 2)
                                      : currentSolute.id === 'ch3cooh'
                                      ? Math.max(1, dissocParticles.filter(p => p.type === 'intact').length + dissocParticles.filter(p => p.type === 'cation').length)
                                      : Math.max(1, dissocParticles.filter(p => p.type === 'intact').length)
                                  )
                                ).toFixed(2)
                              : '1.00'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-zinc-400">DAYA HANTAR LISTRIK:</span>
                          <span className={`font-bold uppercase text-[9.5px] px-1.5 py-0.5 rounded ${
                            currentSolute.type === 'electrolyte-strong' && dissocParticles.filter(p => p.type !== 'water').length > 0
                              ? 'bg-rose-500/10 text-rose-450 border border-rose-500/10'
                              : currentSolute.type === 'electrolyte-weak' && dissocParticles.filter(p => p.type !== 'water').length > 0
                              ? 'bg-amber-500/10 text-amber-450 border border-amber-500/10'
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}>
                            {dissocParticles.filter(p => p.type !== 'water').length === 0 
                              ? 'TAK BERION' 
                              : currentSolute.type === 'electrolyte-strong'
                              ? 'KONDUKTOR KUAT'
                              : currentSolute.type === 'electrolyte-weak'
                              ? 'KONDUKTOR LEMAH'
                              : 'INSULATOR'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Interactive Classroom Lecture Card */}
          <div className={`glass-panel p-5 rounded-2xl border border-teal-500/15 text-left flex gap-4 ${theme === 'dark' ? 'bg-slate-900/15' : 'bg-slate-100/15'}`}>
            <GraduationCap className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">PEDOMAN DISKUSI INTERAKTIF DI KELAS</span>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Gunakan pilihan zat <strong className="text-teal-300">Garam Dapur (NaCl)</strong> versus <strong className="text-teal-300">Glukosa (C₆H₁₂O₆)</strong> dengan konsentrasi yang sama (misal 1.00 m) untuk menunjukkan kepada siswa keajaiban sifat koligatif: 
                <br />
                Meskipun jumlah partikel kimianya disetel setara, penarikan titik didih NaCl berganda dua kali lipat lebih tinggi dari Glukosa karena NaCl terurai menjadi kation Na⁺ &amp; anion Cl⁻ murni (Faktor Van 't Hoff).
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
