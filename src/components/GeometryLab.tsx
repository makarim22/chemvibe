/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { MOLECULES_DATA } from '../data';
import { VSEPRMolecule } from '../types';
import { 
  Info, Orbit, Compass, RotateCw, Play, Pause, 
  RefreshCw, Eye, EyeOff, Sparkles, Activity, ShieldAlert
} from 'lucide-react';

const Molecule3DViewer = lazy(() => import('./Molecule3DViewer'));

interface Atom3D {
  symbol: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  colorId: string;
  strokeColor: string;
}

interface Bond3D {
  from: number;
  to: number;
  type: 'single' | 'double' | 'triple';
}

interface LonePair3D {
  x: number;
  y: number;
  z: number;
}

// 3D Matrix Rotation Helper
const rotate3D = (x: number, y: number, z: number, angleX: number, angleY: number) => {
  // Yaw (rotation around Y-axis)
  const radY = (angleY * Math.PI) / 180;
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;

  // Pitch (rotation around X-axis)
  const radX = (angleX * Math.PI) / 180;
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
};

export default function GeometryLab() {
  const [selectedMolecule, setSelectedMolecule] = useState<VSEPRMolecule>(MOLECULES_DATA[1]); // Default H2O
  const [renderMode, setRenderMode] = useState<'webgl' | 'classic'>('webgl');
  const [angleX, setAngleX] = useState<number>(15);
  const [angleY, setAngleY] = useState<number>(45);
  const [tweakAngle, setTweakAngle] = useState<number>(0); // Bond angle tweak from standard
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [showLonePairs, setShowLonePairs] = useState<boolean>(true);
  const [showDipoles, setShowDipoles] = useState<boolean>(true);
  const [showAngles, setShowAngles] = useState<boolean>(true);
  const [isTweakMode, setIsTweakMode] = useState<boolean>(false);

  // Mouse interaction state
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [baseAngles, setBaseAngles] = useState({ x: 0, y: 0 });

  // Reset rotation angle on molecule switch
  useEffect(() => {
    setTweakAngle(0);
  }, [selectedMolecule]);

  // Smooth Y-axis auto-rotation continuous animation (Only tick in classic mode so WebGL context isn't repeatedly re-evaluated by parent state changes)
  useEffect(() => {
    if (!isAutoRotating || renderMode !== 'classic') return;
    let frameId: number;
    const tick = () => {
      setAngleY((prev) => (prev + 0.5) % 360);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoRotating, renderMode]);

  // Mouse drag handler functions
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setBaseAngles({ x: angleX, y: angleY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setAngleY((baseAngles.y + dx * 0.7) % 360);
    setAngleX(Math.max(-85, Math.min(85, baseAngles.x - dy * 0.7))); // Clamp pitch to prevent flipping
  };

  const handleMouseUpOrLeave = () => {
    setDragStart(null);
  };

  // Touch gesture handler functions for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    setDragStart({ x: t.clientX, y: t.clientY });
    setBaseAngles({ x: angleX, y: angleY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragStart || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.x;
    const dy = t.clientY - dragStart.y;
    setAngleY((baseAngles.y + dx * 0.8) % 360);
    setAngleX(Math.max(-85, Math.min(85, baseAngles.x - dy * 0.8)));
  };

  // Construct coordinates dynamically based on tweak variables
  const getMoleculeStructure = (formula: string, tweak: number) => {
    let atoms: Atom3D[] = [];
    let bonds: Bond3D[] = [];
    let lonePairs: LonePair3D[] = [];
    let dipoleDir = { x: 0, y: 0, z: 0 };
    let dipoleVal = 0;
    let labelIndices: [number, number, number] | null = null;
    let actualAngleText = '';

    switch (formula) {
      case 'CO2': {
        const current = Math.min(180, Math.max(120, 180 + tweak));
        actualAngleText = `${current.toFixed(1)}°`;
        const rRad = (current * Math.PI) / 180;
        atoms = [
          { symbol: 'C', x: 0, y: 0, z: 0, radius: 21, colorId: 'C', strokeColor: '#52525b' },
          { symbol: 'O', x: -65 * Math.sin(rRad / 2), y: -65 * Math.cos(rRad / 2), z: 0, radius: 17, colorId: 'O', strokeColor: '#b91c1c' },
          { symbol: 'O', x: 65 * Math.sin(rRad / 2), y: -65 * Math.cos(rRad / 2), z: 0, radius: 17, colorId: 'O', strokeColor: '#b91c1c' }
        ];
        bonds = [
          { from: 0, to: 1, type: 'double' },
          { from: 0, to: 2, type: 'double' }
        ];
        labelIndices = [1, 0, 2];
        if (current < 180) {
          dipoleDir = { x: 0, y: -1, z: 0 };
          dipoleVal = Math.abs(2 * 2.7 * Math.cos(rRad / 2));
        } else {
          dipoleDir = { x: 0, y: 0, z: 0 };
          dipoleVal = 0;
        }
        break;
      }
      case 'H2O': {
        const current = Math.max(70, Math.min(150, 104.5 + tweak));
        actualAngleText = `${current.toFixed(1)}°`;
        const rRad = (current * Math.PI) / 180;
        atoms = [
          { symbol: 'O', x: 0, y: 15, z: 0, radius: 21, colorId: 'O', strokeColor: '#b91c1c' },
          { symbol: 'H', x: -65 * Math.sin(rRad / 2), y: 15 - 65 * Math.cos(rRad / 2), z: 0, radius: 13, colorId: 'H', strokeColor: '#64748b' },
          { symbol: 'H', x: 65 * Math.sin(rRad / 2), y: 15 - 65 * Math.cos(rRad / 2), z: 0, radius: 13, colorId: 'H', strokeColor: '#64748b' }
        ];
        bonds = [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' }
        ];
        lonePairs = [
          { x: -28, y: 55, z: 20 },
          { x: 28, y: 55, z: -20 }
        ];
        labelIndices = [1, 0, 2];
        dipoleDir = { x: 0, y: 1, z: 0 };
        dipoleVal = 1.85 * (Math.cos(rRad / 2) / Math.cos((104.5 * Math.PI) / 360));
        break;
      }
      case 'NH3': {
        const current = Math.max(80, Math.min(125, 107 + tweak));
        actualAngleText = `${current.toFixed(1)}°`;
        const thetaRad = (current * Math.PI) / 180;
        const cosPhi = Math.sqrt(Math.max(0, (Math.cos(thetaRad) + 0.5) / 1.5));
        const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
        const hY = 15 - 65 * cosPhi;
        const hRad = 65 * sinPhi;
        atoms = [
          { symbol: 'N', x: 0, y: 15, z: 0, radius: 20, colorId: 'N', strokeColor: '#1d4ed8' },
          { symbol: 'H', x: 0, y: hY, z: hRad, radius: 13, colorId: 'H', strokeColor: '#64748b' },
          { symbol: 'H', x: -hRad * Math.cos(Math.PI / 6), y: hY, z: -hRad * Math.sin(Math.PI / 6), radius: 13, colorId: 'H', strokeColor: '#64748b' },
          { symbol: 'H', x: hRad * Math.cos(Math.PI / 6), y: hY, z: -hRad * Math.sin(Math.PI / 6), radius: 13, colorId: 'H', strokeColor: '#64748b' }
        ];
        bonds = [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' }
        ];
        lonePairs = [{ x: 0, y: 55, z: 0 }];
        labelIndices = [1, 0, 2];
        dipoleDir = { x: 0, y: 1, z: 0 };
        dipoleVal = 1.47 * (cosPhi / Math.cos((107 * Math.PI) / 360));
        break;
      }
      case 'CH4': {
        const current = Math.max(80, Math.min(130, 109.5 + tweak));
        actualAngleText = `${current.toFixed(1)}°`;
        const thetaRad = (current * Math.PI) / 180;
        const cosPhi = Math.min(0.95, Math.max(-0.95, -Math.cos(thetaRad)));
        const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
        atoms = [
          { symbol: 'C', x: 0, y: 0, z: 0, radius: 21, colorId: 'C', strokeColor: '#52525b' },
          { symbol: 'H', x: 0, y: 68, z: 0, radius: 13, colorId: 'H', strokeColor: '#64748b' },
          { symbol: 'H', x: 68 * sinPhi, y: -68 * cosPhi, z: 0, radius: 13, colorId: 'H', strokeColor: '#64748b' },
          { symbol: 'H', x: 68 * sinPhi * Math.cos(120 * Math.PI / 180), y: -68 * cosPhi, z: 68 * sinPhi * Math.sin(120 * Math.PI / 180), radius: 13, colorId: 'H', strokeColor: '#64748b' },
          { symbol: 'H', x: 68 * sinPhi * Math.cos(240 * Math.PI / 180), y: -68 * cosPhi, z: 68 * sinPhi * Math.sin(240 * Math.PI / 180), radius: 13, colorId: 'H', strokeColor: '#64748b' }
        ];
        bonds = [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' },
          { from: 0, to: 4, type: 'single' }
        ];
        labelIndices = [2, 0, 3];
        break;
      }
      case 'BF3': {
        const current = Math.max(90, Math.min(145, 120 + tweak));
        actualAngleText = `${current.toFixed(1)}°`;
        const thetaRad = (current * Math.PI) / 180;
        atoms = [
          { symbol: 'B', x: 0, y: 0, z: 0, radius: 19, colorId: 'B', strokeColor: '#db2777' },
          { symbol: 'F', x: 0, y: 65, z: 0, radius: 15, colorId: 'F', strokeColor: '#047857' },
          { symbol: 'F', x: -65 * Math.sin(thetaRad / 2), y: -65 * Math.cos(thetaRad / 2), z: 0, radius: 15, colorId: 'F', strokeColor: '#047857' },
          { symbol: 'F', x: 65 * Math.sin(thetaRad / 2), y: -65 * Math.cos(thetaRad / 2), z: 0, radius: 15, colorId: 'F', strokeColor: '#047857' }
        ];
        bonds = [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' }
        ];
        labelIndices = [2, 0, 3];
        if (Math.abs(tweak) > 1) {
          dipoleDir = { x: 0, y: -1, z: 0 };
          dipoleVal = Math.abs(2 * 3.5 * Math.cos(thetaRad / 2) - 3.5) * 0.5;
        }
        break;
      }
      case 'PCl5': {
        const currentEq = Math.max(90, Math.min(150, 120 + tweak));
        actualAngleText = `${currentEq.toFixed(1)}° eq / 90° ax`;
        const thetaRad = (currentEq * Math.PI) / 180;
        atoms = [
          { symbol: 'P', x: 0, y: 0, z: 0, radius: 21, colorId: 'P', strokeColor: '#d97706' },
          { symbol: 'Cl', x: 0, y: 68, z: 0, radius: 16, colorId: 'Cl', strokeColor: '#4d7c0f' },
          { symbol: 'Cl', x: 0, y: -68, z: 0, radius: 16, colorId: 'Cl', strokeColor: '#4d7c0f' },
          { symbol: 'Cl', x: 0, y: 0, z: 68, radius: 16, colorId: 'Cl', strokeColor: '#4d7c0f' },
          { symbol: 'Cl', x: -68 * Math.sin(thetaRad / 2), y: 0, z: -68 * Math.cos(thetaRad / 2), radius: 16, colorId: 'Cl', strokeColor: '#4d7c0f' },
          { symbol: 'Cl', x: 68 * Math.sin(thetaRad / 2), y: 0, z: -68 * Math.cos(thetaRad / 2), radius: 16, colorId: 'Cl', strokeColor: '#4d7c0f' }
        ];
        bonds = [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' },
          { from: 0, to: 4, type: 'single' },
          { from: 0, to: 5, type: 'single' }
        ];
        labelIndices = [4, 0, 5];
        break;
      }
      case 'SF6': {
        const current = Math.max(70, Math.min(110, 90 + tweak));
        actualAngleText = `${current.toFixed(1)}°`;
        const bendRad = (tweak * Math.PI) / 180;
        const dist = 65;
        const bY = dist * Math.sin(bendRad);
        const pR = dist * Math.cos(bendRad);
        atoms = [
          { symbol: 'S', x: 0, y: 0, z: 0, radius: 21, colorId: 'S', strokeColor: '#a16207' },
          { symbol: 'F', x: 0, y: dist, z: 0, radius: 15, colorId: 'F', strokeColor: '#047857' },
          { symbol: 'F', x: 0, y: -dist, z: 0, radius: 15, colorId: 'F', strokeColor: '#047857' },
          { symbol: 'F', x: 0, y: -bY, z: pR, radius: 15, colorId: 'F', strokeColor: '#047857' },
          { symbol: 'F', x: 0, y: -bY, z: -pR, radius: 15, colorId: 'F', strokeColor: '#047857' },
          { symbol: 'F', x: -pR, y: bY, z: 0, radius: 15, colorId: 'F', strokeColor: '#047857' },
          { symbol: 'F', x: pR, y: bY, z: 0, radius: 15, colorId: 'F', strokeColor: '#047857' }
        ];
        bonds = [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' },
          { from: 0, to: 4, type: 'single' },
          { from: 0, to: 5, type: 'single' },
          { from: 0, to: 6, type: 'single' }
        ];
        labelIndices = [3, 0, 6];
        break;
      }
    }
    return { atoms, bonds, lonePairs, dipoleDir, dipoleVal, labelIndices, actualAngleText };
  };

  const { atoms, bonds, lonePairs, dipoleDir, dipoleVal, labelIndices, actualAngleText } = useMemo(() => {
    return getMoleculeStructure(selectedMolecule.formula, tweakAngle);
  }, [selectedMolecule.formula, tweakAngle]);

  // Compute 3D Projected Screen Elements
  const cx = 150;
  const cy = 135;
  const scaleMultiplier = 1.25; // Balanced scale to maximize viewport utilization and ensure zero clipping in classic rendering

  const projectedAtoms = atoms.map((atom, idx) => {
    const proj = rotate3D(atom.x * scaleMultiplier, atom.y * scaleMultiplier, atom.z * scaleMultiplier, angleX, angleY);
    return {
      ...atom,
      idx,
      projX: cx + proj.x,
      projY: cy - proj.y,
      projZ: proj.z
    };
  });

  const projectedBonds = bonds.map((bond, idx) => {
    const a1 = projectedAtoms[bond.from];
    const a2 = projectedAtoms[bond.to];
    const avgZ = (a1.projZ + a2.projZ) / 2;
    return {
      ...bond,
      idx,
      a1,
      a2,
      projZ: avgZ
    };
  });

  const projectedLonePairs = (showLonePairs ? lonePairs : []).map((lp, idx) => {
    const proj = rotate3D(lp.x * scaleMultiplier, lp.y * scaleMultiplier, lp.z * scaleMultiplier, angleX, angleY);
    return {
      idx,
      projX: cx + proj.x,
      projY: cy - proj.y,
      projZ: proj.z
    };
  });

  // Collect all elements to sort them by Z-depth (front-to-back painter's alignment)
  const renderList: { type: 'atom' | 'bond' | 'lone-pair'; projZ: number; item: any }[] = [];

  projectedAtoms.forEach((atom) => {
    renderList.push({ type: 'atom', projZ: atom.projZ, item: atom });
  });

  projectedBonds.forEach((bond) => {
    renderList.push({ type: 'bond', projZ: bond.projZ, item: bond });
  });

  projectedLonePairs.forEach((lp) => {
    renderList.push({ type: 'lone-pair', projZ: lp.projZ, item: lp });
  });

  // Sort: smaller projZ (further away) is rendered first
  renderList.sort((a, b) => a.projZ - b.projZ);

  // Calculate repulsion force/stress index from VSEPR optimal config
  const stressLevel = Math.min(100, Math.round((Math.abs(tweakAngle) / 20) * 100));
  let stressLabel = "Stabil (Optimal)";
  let stressColorClass = "text-emerald-400";
  let stressGlowColor = "rgba(16, 185, 129, 0.04)";

  if (stressLevel > 15 && stressLevel < 50) {
    stressLabel = "Tegangan Rendah";
    stressColorClass = "text-yellow-400";
    stressGlowColor = "rgba(234, 179, 8, 0.08)";
  } else if (stressLevel >= 50 && stressLevel < 80) {
    stressLabel = "Tegangan Sedang";
    stressColorClass = "text-orange-400";
    stressGlowColor = "rgba(249, 115, 22, 0.14)";
  } else if (stressLevel >= 80) {
    stressLabel = "Tolak Tolakan Kuat (Kritis)";
    stressColorClass = "text-rose-450 text-red-400 animate-pulse";
    stressGlowColor = "rgba(239, 68, 68, 0.22)";
  }

  return (
    <div className="space-y-6">
      {/* Header element */}
      <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Orbit className="w-6 h-6 text-yellow-400 animate-spin-slow" />
            Laboratorium Geometri Molekul 3D
          </h2>
          <p className="text-zinc-400 text-sm">
            Eksplorasi interaktif teori VSEPR. Geser kanvas untuk rotasi 3D bebas, manipulasi sudut ikatan & analisis gaya tolakan.
          </p>
        </div>
        
        {/* Reset Camera State */}
        <button 
          onClick={() => { setAngleX(15); setAngleY(45); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Kamera Semula
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Molecule Selector Menu Panel (Span 2) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="space-y-3">
            <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900 shadow-inner">
              <label htmlFor="molecule-select" className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-widest block mb-1.5_m">
                Pilih Molekul/Elemen:
              </label>
              <div className="relative">
                <select
                  id="molecule-select"
                  value={selectedMolecule.formula}
                  onChange={(e) => {
                    const found = MOLECULES_DATA.find(m => m.formula === e.target.value);
                    if (found) setSelectedMolecule(found);
                  }}
                  className="w-full bg-zinc-900/90 border border-zinc-800 text-white font-sans text-xs rounded-lg px-2 py-2 pr-8 focus:outline-none focus:border-yellow-500 cursor-pointer appearance-none shadow-md transition-all hover:border-zinc-700 font-medium"
                >
                  {MOLECULES_DATA.map((mol) => (
                    <option key={mol.formula} value={mol.formula} className="bg-zinc-950 text-white">
                      {mol.formula} - {mol.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Selected quick summary card */}
            <div className="glass-panel p-3 rounded-xl border border-white/5 space-y-2">
              <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest block">Parameter Aktif</span>
              <div>
                <span className="text-xl font-black tracking-tight text-yellow-400">{selectedMolecule.formula}</span>
                <span className="text-zinc-300 text-[11px] font-semibold block truncate" title={selectedMolecule.name}>{selectedMolecule.name}</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-[10px]">
                <div className="bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900/80">
                  <span className="text-zinc-500 block font-mono text-[8px]">GEOMETRI</span>
                  <span className="text-white font-bold block truncate" title={selectedMolecule.geometry}>{selectedMolecule.geometry}</span>
                </div>
                <div className="bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900/80">
                  <span className="text-zinc-500 block font-mono text-[8px]">HIBRIDISASI</span>
                  <span className="text-white font-bold block">{selectedMolecule.hybridization}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Theory card brief */}
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900 text-[11px] leading-relaxed space-y-1.5">
            <div className="flex items-center gap-1 text-yellow-400 font-bold uppercase tracking-wider text-[8px] font-mono">
              <Info className="w-3 h-3" /> Petunjuk
            </div>
            <ul className="list-disc pl-3.5 space-y-1 text-zinc-400">
              <li><strong>Seret/Drag</strong> untuk memutar model 3D.</li>
              <li>Atur <strong>"Ubah Sudut"</strong> untuk stres orbital.</li>
            </ul>
          </div>
        </div>

        {/* 3D Core Canvas Render Area (Span 10) */}
        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* SVG canvas container element */}
          <div className="md:col-span-9 glass-panel rounded-2xl p-4 flex flex-col justify-start items-stretch relative select-none gap-2.5">
            
            {/* Top row status with toggle */}
            <div className="w-full flex justify-between items-center text-[9px] font-mono text-zinc-500 z-10">
              <span className="flex items-center gap-1 tracking-wider">
                <Compass className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> VSEPR 3D ENGINE
              </span>
              <div className="flex items-center gap-1.5 bg-zinc-950/80 px-1 py-0.5 rounded-lg border border-zinc-900 shadow-sm">
                <button
                  type="button"
                  onClick={() => setRenderMode('webgl')}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold transition-all cursor-pointer ${
                    renderMode === 'webgl'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-black'
                      : 'text-zinc-500 border border-transparent hover:text-zinc-300'
                  }`}
                >
                  WebGL 3D
                </button>
                <button
                  type="button"
                  onClick={() => setRenderMode('classic')}
                  className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold transition-all cursor-pointer ${
                    renderMode === 'classic'
                      ? 'bg-yellow-500/10 text-yellow-555 border border-yellow-500/20 font-black'
                      : 'text-zinc-500 border border-transparent hover:text-zinc-300'
                  }`}
                >
                  Klasik
                </button>
              </div>
            </div>

            {renderMode === 'webgl' ? (
              <div 
                className="w-full h-[400px] md:h-[430px] flex items-center justify-center relative bg-zinc-950/60 border border-zinc-900 rounded-xl overflow-hidden shadow-inner transition-all duration-300"
                style={{ boxShadow: `inset 0 0 40px ${stressGlowColor}` }}
              >
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center gap-3 text-zinc-400">
                    <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
                    <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">Memuat Visualisator 3D...</span>
                  </div>
                }>
                  <Molecule3DViewer 
                    atoms={atoms}
                    bonds={bonds}
                    lonePairs={lonePairs}
                    dipoleDir={dipoleDir}
                    dipoleVal={dipoleVal}
                    showLonePairs={showLonePairs}
                    showDipoles={showDipoles}
                    isAutoRotating={isAutoRotating}
                  />
                </Suspense>
              </div>
            ) : (
              <div 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUpOrLeave}
                className="w-full h-[400px] md:h-[430px] flex items-center justify-center relative bg-zinc-950/60 border border-zinc-900 rounded-xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing transition-all duration-300"
                style={{ boxShadow: `inset 0 0 40px ${stressGlowColor}` }}
              >
                {/* Subtle grid axis backgrounds */}
                <div className="absolute inset-0 border border-dashed border-zinc-900/30 pointer-events-none flex items-center justify-center">
                  <div className="w-1/2 h-full border-r border-dashed border-zinc-900/20" />
                  <div className="absolute w-full h-1/2 border-b border-dashed border-zinc-900/20" />
                </div>

                {/* Stress ripple wave aura around center when tweak is massive */}
                {isTweakMode && stressLevel > 50 && (
                  <div 
                    className="absolute w-24 h-24 rounded-full border-2 border-red-500/20 animate-ping pointer-events-none" 
                    style={{ 
                      left: 'calc(50% - 48px)', 
                      top: 'calc(50% - 48px)',
                      animationDuration: `${Math.max(0.6, 2 - (stressLevel / 50))}s`
                    }} 
                  />
                )}

                {/* Real mathematical SVG */}
                <svg className="w-full h-full relative" viewBox="0 0 300 270">
                  {/* Embedded Rich Shader Gradients */}
                  <defs>
                    <radialGradient id="grad-C" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#8e909a" />
                      <stop offset="100%" stopColor="#1e1e21" />
                    </radialGradient>
                    <radialGradient id="grad-O" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ff7070" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </radialGradient>
                    <radialGradient id="grad-H" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </radialGradient>
                    <radialGradient id="grad-N" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#81b2ff" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </radialGradient>
                    <radialGradient id="grad-B" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ff85cc" />
                      <stop offset="100%" stopColor="#db2777" />
                    </radialGradient>
                    <radialGradient id="grad-F" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#86efac" />
                      <stop offset="100%" stopColor="#059669" />
                    </radialGradient>
                    <radialGradient id="grad-P" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#fed7aa" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </radialGradient>
                    <radialGradient id="grad-S" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </radialGradient>
                    <radialGradient id="grad-Cl" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#d9f99d" />
                      <stop offset="100%" stopColor="#4d7c0f" />
                    </radialGradient>
                    
                    {/* Lone pairs orbital shading */}
                    <radialGradient id="grad-orbital" cx="50%" cy="30%" r="65%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.45)" />
                      <stop offset="80%" stopColor="rgba(168, 85, 247, 0.12)" />
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0.0)" />
                    </radialGradient>
                  </defs>

                  {/* Back-to-Front Painter's Rendering List */}
                  {renderList.map((node, i) => {
                    const { type, item } = node;

                    if (type === 'bond') {
                      const isDouble = item.type === 'double';
                      
                      // Simple bonds coordinates
                      if (isDouble) {
                        return (
                          <g key={`b-${item.idx}`}>
                            <line 
                              x1={item.a1.projX - 3} y1={item.a1.projY - 3} 
                              x2={item.a2.projX - 3} y2={item.a2.projY - 3} 
                              stroke="#475569" strokeWidth="3" strokeLinecap="round"
                            />
                            <line 
                              x1={item.a1.projX + 3} y1={item.a1.projY + 3} 
                              x2={item.a2.projX + 3} y2={item.a2.projY + 3} 
                              stroke="#475569" strokeWidth="3" strokeLinecap="round"
                            />
                          </g>
                        );
                      } else {
                        return (
                          <line 
                            key={`b-${item.idx}`}
                            x1={item.a1.projX} y1={item.a1.projY} 
                            x2={item.a2.projX} y2={item.a2.projY} 
                            stroke="#64748b" strokeWidth="4.5" strokeLinecap="round"
                          />
                        );
                      }
                    }

                    if (type === 'lone-pair') {
                      // Coordinates of lobes
                      const ox = cx;
                      const oy = cy;
                      const lpx = item.projY; // projected target
                      
                      // Bezier curves control points to make a tear shape
                      const dx = item.projX - cx;
                      const dy = item.projY - cy;
                      const len = Math.sqrt(dx * dx + dy * dy);
                      const angle = Math.atan2(dy, dx);
                      
                      // Perpendicular directions
                      const px = -Math.sin(angle) * 16;
                      const py = Math.cos(angle) * 16;

                      return (
                        <g key={`lp-${item.idx}`} className="opacity-80">
                          {/* Shaded Lobe */}
                          <path 
                            d={`M ${ox} ${oy} C ${item.projX - px} ${item.projY - py}, ${item.projX + px} ${item.projY + py}, ${ox} ${oy}`} 
                            fill="url(#grad-orbital)" 
                            stroke="rgba(168, 85, 247, 0.35)" 
                            strokeWidth="1" 
                            strokeDasharray="2 1.5"
                          />
                          {/* Inner Electron pair dots */}
                          <circle cx={item.projX - px*0.25} cy={item.projY - py*0.25} r="2" fill="#d8b4fe" />
                          <circle cx={item.projX + px*0.25} cy={item.projY + py*0.25} r="2" fill="#d8b4fe" />
                        </g>
                      );
                    }

                    if (type === 'atom') {
                      const isCentral = item.isCentral;
                      return (
                        <g key={`atm-${item.idx}`}>
                          {/* Shaded Atom sphere */}
                          <circle 
                            cx={item.projX} 
                            cy={item.projY} 
                            r={item.radius} 
                            fill={`url(#grad-${item.colorId})`}
                            stroke={item.strokeColor}
                            strokeWidth="1.5"
                            className="transition-transform duration-200"
                          />
                          {/* Element label */}
                          <text 
                            x={item.projX} 
                            y={item.projY + 4} 
                            fill={item.colorId === 'H' ? '#1e293b' : '#ffffff'} 
                            textAnchor="middle" 
                            className="text-[10px] font-black font-sans select-none pointer-events-none"
                          >
                            {item.symbol}
                          </text>
                        </g>
                      );
                    }

                    return null;
                  })}

                  {/* Draw angles arc and floating value labels */}
                  {showAngles && labelIndices && projectedAtoms[labelIndices[0]] && (
                    (() => {
                      const t1 = projectedAtoms[labelIndices[0]];
                      const cen = projectedAtoms[labelIndices[1]];
                      const t2 = projectedAtoms[labelIndices[2]];

                      // Vector representations
                      const v1x = t1.projX - cen.projX;
                      const v1y = t1.projY - cen.projY;
                      const v2x = t2.projX - cen.projX;
                      const v2y = t2.projY - cen.projY;

                      const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
                      const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

                      if (len1 > 0 && len2 > 0) {
                        const u1x = v1x / len1;
                        const u1y = v1y / len1;
                        const u2x = v2x / len2;
                        const u2y = v2y / len2;

                        // Symmetrical Arc points
                        const arcRad = 32;
                        const p1x = cen.projX + u1x * arcRad;
                        const p1y = cen.projY + u1y * arcRad;
                        const p2x = cen.projX + u2x * arcRad;
                        const p2y = cen.projY + u2y * arcRad;

                        // Centered labels bisector coordinates
                        const bx = u1x + u2x;
                        const by = u1y + u2y;
                        const blen = Math.sqrt(bx * bx + by * by);
                        
                        let textX = cen.projX + (bx / (blen || 1)) * 48;
                        let textY = cen.projY + (by / (blen || 1)) * 48;
                        
                        if (blen < 0.1) {
                          textX = cen.projX;
                          textY = cen.projY - 48;
                        }

                        // Quadratic arc path
                        const pmx = cen.projX + (u1x + u2x) * 0.5 * arcRad * 0.8;
                        const pmy = cen.projY + (u1y + u2y) * 0.5 * arcRad * 0.8;

                        return (
                          <g className="pointer-events-none">
                            <path 
                              d={`M ${p1x} ${p1y} Q ${pmx} ${pmy} ${p2x} ${p2y}`} 
                              fill="none" 
                              stroke="#fbbf24" 
                              strokeWidth="2" 
                              strokeDasharray="2.5 1.5"
                            />
                            <rect 
                              x={textX - 22} 
                              y={textY - 8} 
                              width="44" 
                              height="15" 
                              rx="3" 
                              fill="#000000" 
                              stroke="#eab308" 
                              strokeWidth="1" 
                              opacity="0.85" 
                            />
                            <text 
                              x={textX} 
                              y={textY + 3} 
                              fill="#facc15" 
                              textAnchor="middle" 
                              className="text-[9px] font-mono font-black"
                            >
                              {actualAngleText}
                            </text>
                          </g>
                        );
                      }
                      return null;
                    })()
                  )}

                  {/* Polar net dipole vector arrow */}
                  {showDipoles && dipoleVal > 0 && (
                    (() => {
                      const pDir = rotate3D(dipoleDir.x, dipoleDir.y, dipoleDir.z, angleX, angleY);
                      const vectorLength = 45; // visual multiplier
                      const dx = pDir.x * vectorLength;
                      const dy = pDir.y * vectorLength;

                      // Start from center
                      const endX = cx + dx;
                      const endY = cy - dy;

                      // Arrowhead points
                      const angle = Math.atan2(-dy, dx);
                      const headLen = 8;
                      const h1x = endX - headLen * Math.cos(angle - Math.PI / 6);
                      const h1y = endY - headLen * Math.sin(angle - Math.PI / 6);
                      const h2x = endX - headLen * Math.cos(angle + Math.PI / 6);
                      const h2y = endY - headLen * Math.sin(angle + Math.PI / 6);

                      return (
                        <g className="pointer-events-none filter drop-shadow-[0_0_3px_rgba(234,179,8,0.5)]">
                          <line 
                            x1={cx} y1={cy} 
                            x2={endX} y2={endY} 
                            stroke="#f59e0b" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                          />
                          <polygon 
                            points={`${endX},${endY} ${h1x},${h1y} ${h2x},${h2y}`} 
                            fill="#f59e0b" 
                          />
                          {/* Dipole mini chemical crossline on positive end */}
                          <line 
                            x1={cx - Math.sin(angle) * 5} y1={cy - Math.cos(angle) * 5}
                            x2={cx + Math.sin(angle) * 5} y2={cy + Math.cos(angle) * 5}
                            stroke="#f59e0b" 
                            strokeWidth="2.5"
                          />
                          <text 
                            x={endX + Math.cos(angle) * 12} 
                            y={endY + Math.sin(angle) * 12 + 3} 
                            fill="#fbbf24" 
                            textAnchor="middle" 
                            className="text-[9px] font-sans font-black bg-zinc-950 px-1 rounded border border-yellow-500/10"
                          >
                            Net Net μ ({selectedMolecule.formula === 'CO2' ? 'Polar Bent' : 'Net'})
                          </text>
                        </g>
                      );
                    })()
                  )}
                </svg>
              </div>
            )}

            {/* Canvas Interactive Controls Panel */}
            <div className="w-full flex flex-wrap justify-center gap-1.5 pt-1 border-t border-zinc-900/60 mt-1">
              {/* Play/Pause Rotation */}
              <button 
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
                  isAutoRotating 
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Continuous Rotation"
              >
                {isAutoRotating ? <Pause className="w-3.5 h-3.5 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
                <span className="text-[10px]">AutoPutar</span>
              </button>

              {/* Toggle Lone Pairs */}
              {selectedMolecule.lonePairs > 0 && (
                <button 
                  onClick={() => setShowLonePairs(!showLonePairs)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
                    showLonePairs 
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Orbital Lone Pairs"
                >
                  {showLonePairs ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">Awan Bebas</span>
                </button>
              )}

              {/* Toggle Dipoles */}
              <button 
                onClick={() => setShowDipoles(!showDipoles)}
                className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
                  showDipoles 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Vector Dipole moment polarities"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px]">Polaritas μ</span>
              </button>

              {/* Toggle Angles */}
              <button 
                onClick={() => setShowAngles(!showAngles)}
                className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
                  showAngles 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="text-[10px]">Busur</span>
              </button>
            </div>
          </div>

          {/* Molecule Parameter details & Dynamic Bending Controls (Span 3) */}
          <div className="md:col-span-3 flex flex-col justify-between space-y-4">
            {/* Core Selected Molecule Params Card */}
            <div className="glass-panel border-white/5 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Unsur Terpilih</span>
                <h3 className="text-xl font-extrabold text-white leading-tight mt-0.5">{selectedMolecule.name}</h3>
                <div className="flex gap-1.5 items-center mt-1.5">
                  <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded-md tracking-wide">
                    {selectedMolecule.geometry}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-900 text-zinc-400 text-[10px] font-mono rounded-md">
                    Spasiasi {selectedMolecule.hybridization}
                  </span>
                </div>
              </div>

              {/* Detailed statistical blocks */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] font-mono text-zinc-500 block leading-none">BILANGAN STERIK</span>
                  <span className="text-sm font-black text-white mt-1 block leading-none">{selectedMolecule.stericNumber} x Domain</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] font-mono text-zinc-500 block leading-none">PASANGAN BEBAS (LP)</span>
                  <span className="text-sm font-black text-violet-400 mt-1 block leading-none">{selectedMolecule.lonePairs} pasang</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] font-mono text-zinc-500 block leading-none">KONFIG HORISONTAL</span>
                  <span className="text-sm font-bold text-zinc-305 text-white mt-1 block leading-none">{selectedMolecule.bondAngles} (Statis)</span>
                </div>
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                  <span className="text-[9px] font-mono text-zinc-500 block leading-none">HIBRIDISASI</span>
                  <span className="text-sm font-mono text-white mt-1 block leading-none font-bold">{selectedMolecule.hybridization}</span>
                </div>
              </div>

              {/* DEKLARASI RUMUS UMUM VSEPR AX_nE_m */}
              {(() => {
                const n = selectedMolecule.stericNumber - selectedMolecule.lonePairs;
                const m = selectedMolecule.lonePairs;
                
                const vseprDetailsMap: Record<string, { central: string; ligand: string }> = {
                  'CO2': { central: "Karbon (C)", ligand: "Oksigen (O)" },
                  'H2O': { central: "Oksigen (O)", ligand: "Hidrogen (H)" },
                  'NH3': { central: "Nitrogen (N)", ligand: "Hidrogen (H)" },
                  'CH4': { central: "Karbon (C)", ligand: "Hidrogen (H)" },
                  'BF3': { central: "Boron (B)", ligand: "Fluor (F)" },
                  'PCl5': { central: "Fosfor (P)", ligand: "Klorin (Cl)" },
                  'SF6': { central: "Sulfur (S)", ligand: "Fluor (F)" }
                };

                const details = vseprDetailsMap[selectedMolecule.formula] || { 
                  central: "Atom Pusat (A)", 
                  ligand: "Substituen (X)"
                };

                return (
                  <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-3 shadow-inner">
                    <div className="flex justify-between items-center pb-2 border-b border-rose-500/10">
                      <span className="text-[10px] font-sans text-yellow-500 font-extrabold uppercase tracking-wider block">
                        Deklarasi Rumus Umum VSEPR
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        {"AX_nE_m Notation"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-4 bg-slate-905/40 rounded-xl border border-slate-900/50 relative overflow-hidden">
                      {/* VSEPR big rendered visual */}
                      <div className="flex items-baseline font-serif text-3xl font-black mb-4 select-none tracking-tight">
                        <span className="text-white bg-zinc-805 px-2 py-0.5 rounded border border-zinc-700/50 mr-1 cursor-help" title="A = Atom Pusat">A</span>
                        <span className="text-cyan-400 cursor-help" title={`X = Atom Ligand/Berikatan (${n} atom)`}>X</span>
                        <sub className="text-cyan-500 text-sm font-sans font-extrabold mr-1.5">{n}</sub>
                        {m > 0 && (
                          <>
                            <span className="text-violet-400 cursor-help" title={`E = Pasangan Elektron Bebas (${m} pasang)`}>E</span>
                            <sub className="text-violet-500 text-sm font-sans font-extrabold">{m}</sub>
                          </>
                        )}
                      </div>

                      {/* Annotated breakdown list */}
                      <div className="w-full px-2 grid grid-cols-1 gap-2 text-[10px] font-mono text-slate-400">
                        <div className="p-2 bg-slate-950/45 rounded-lg border border-slate-900/60 flex items-center justify-between leading-none">
                          <span className="text-zinc-400 font-bold">Atom Pusat <span className="text-white text-[11px] font-sans font-extrabold px-1.5 py-0.5 rounded bg-zinc-800/40 border border-zinc-750 ml-1">A</span></span>
                          <span className="text-amber-400 font-black">{details.central}</span>
                        </div>
                        
                        <div className="p-2 bg-slate-950/45 rounded-lg border border-slate-900/60 flex items-center justify-between leading-none font-semibold">
                          <span className="text-zinc-400 font-bold">Domain Ikatan <span className="text-cyan-450 text-[11px] font-sans font-extrabold px-1.5 py-0.5 rounded bg-zinc-800/40 border border-zinc-750 ml-1">X<sub>{n}</sub></span></span>
                          <span className="text-cyan-400 font-black">{n} x {details.ligand}</span>
                        </div>

                        <div className="p-2 bg-slate-950/45 rounded-lg border border-slate-900/60 flex items-center justify-between leading-none font-semibold">
                          <span className="text-zinc-400 font-bold">Domain Bebas <span className="text-violet-400 text-[11px] font-sans font-extrabold px-1.5 py-0.5 rounded bg-zinc-800/40 border border-zinc-750 ml-1">E<sub>{m}</sub></span></span>
                          <span className={m > 0 ? "text-violet-400 font-black" : "text-zinc-500 font-bold"}>
                            {m > 0 ? `${m} Pasang (Lone Pairs)` : "0 (Tidak Ada)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Description box */}
              <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 text-zinc-300 text-xs leading-relaxed">
                {selectedMolecule.description}
              </div>
            </div>

            {/* Dynamic Interactive Tweak Slider */}
            <div className="glass-panel border-white/5 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-yellow-400" /> Tweak Sudut (Gaya Tolak VSEPR)
                </span>
                {/* Switch button */}
                <button 
                  onClick={() => {
                    setIsTweakMode(!isTweakMode);
                    if (isTweakMode) setTweakAngle(0); // reset if off
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-normal transition cursor-pointer ${
                    isTweakMode 
                      ? 'bg-yellow-500 text-zinc-950 hover:bg-yellow-400 shadow-md' 
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  {isTweakMode ? "Nonaktifkan" : "Ubah Manual"}
                </button>
              </div>

              {isTweakMode ? (
                <div className="space-y-3 animate-fade-in text-xs">
                  {/* Slider and gauge */}
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400 leading-none">
                    <span>Sudut Relatif</span>
                    <span className="text-yellow-400 font-black font-semibold bg-zinc-950 px-1 py-0.5 rounded border border-zinc-850">
                      {tweakAngle > 0 ? `+${tweakAngle}°` : `${tweakAngle}°`} deviation
                    </span>
                  </div>

                  <input 
                    type="range"
                    min="-25"
                    max="25"
                    value={tweakAngle}
                    onChange={(e) => setTweakAngle(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />

                  {/* Reset tweak angle quickly */}
                  <div className="flex items-center justify-between bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-900 leading-normal">
                    <div>
                      <span className="text-[10px] text-zinc-500 block leading-none font-mono">STATUS ENERGI</span>
                      <span className={`font-black tracking-tight text-[11px] block mt-1 ${stressColorClass}`}>
                        {stressLabel}
                      </span>
                    </div>
                    {tweakAngle !== 0 && (
                      <button 
                        onClick={() => setTweakAngle(0)}
                        className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-md hover:text-white hover:border-zinc-700 font-bold transition flex items-center gap-0.5 cursor-pointer"
                      >
                        Optimum VSEPR
                      </button>
                    )}
                  </div>

                  {/* Scientific Explanation */}
                  <p className="text-[10px] text-zinc-450 leading-relaxed italic text-zinc-400">
                    {tweakAngle < 0 
                      ? "Merapatkan ikatan meningkatkan gaya tolak menolak orbital secara eksponensial (Stres Termal & Kinetik bertambah)." 
                      : tweakAngle > 0 
                      ? "Kandungan orbital merenggang melebihi sudut ekuilibrium VSEPR. Tegangan sirkuler terdeteksi."
                      : "Stabil sempurna pada konfigurasi energi minimum yang divalidasi teori VSEPR molekular."
                    }
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  <ShieldAlert className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  Gunakan tombol di atas untuk mengubah parameter sudut ikatan molekul, menstimulasikan stres & ekuilibrium.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
