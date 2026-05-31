/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Type, 
  HelpCircle, 
  Info, 
  Sparkles, 
  Activity, 
  Droplet, 
  Beaker, 
  Zap, 
  Check, 
  ChevronRight, 
  RotateCcw,
  Waves,
  Eye,
  Sliders,
  Play,
  Flame,
  ArrowRight,
  Filter,
  Layers,
  ZapOff
} from 'lucide-react';

interface Mixture {
  id: string;
  name: string;
  type: 'larutan' | 'koloid' | 'suspensi';
  subType: string;
  dispersedPhase: string;
  dispersionMedium: string;
  particleSize: string;
  appearance: string;
  stability: string;
  filterability: string;
  tyndallDescription: string;
  chemComposition: string;
  colorHex: string; // Tailwind color or hex for liquid in beaker
  solidColorHex: string; // Color of dispersed particles/sediments
  sedimentStatus: 'none' | 'slow_sediment' | 'instant_settling';
}

const MIXTURES: Mixture[] = [
  {
    id: 'garam_ruang',
    name: 'Larutan Garam (Dapur)',
    type: 'larutan',
    subType: 'Sistem Dispersi Molekular',
    dispersedPhase: 'Zat Terlarut (Solid)',
    dispersionMedium: 'Pelarut (Liquid)',
    particleSize: '< 1 nm (Homogen Sempurna)',
    appearance: 'Cenderung jernih, transparan, satu fase stabil',
    stability: 'Sangat Stabil (Tidak akan pernah mengendap)',
    filterability: 'Tidak dapat disaring (Bahkan dengan kertas ultra)',
    tyndallDescription: 'Efek Tyndall nihil. Berkas sinar laser menembus larutan tanpa pembiasan terpantulkan karena ukuran ion Na⁺ dan Cl⁻ terhidrasi terlalu kecil dibanding panjang gelombang cahaya visible.',
    chemComposition: 'NaCl Terdisosiasi di Air',
    colorHex: 'rgba(56, 189, 248, 0.12)', // Subtle blue clear
    solidColorHex: '#ffffff',
    sedimentStatus: 'none'
  },
  {
    id: 'gula_ruang',
    name: 'Larutan Gula Murni',
    type: 'larutan',
    subType: 'Sistem Dispersi Molekular',
    dispersedPhase: 'Zat Terlarut (Solid)',
    dispersionMedium: 'Pelarut (Liquid)',
    particleSize: '< 1 nm (Homogen Sempurna)',
    appearance: 'Jernih, transparan, tidak berwarna, satu fase',
    stability: 'Sangat Stabil',
    filterability: 'Tidak dapat disaring',
    tyndallDescription: 'Molekul glukosa/sukrosa terlarut tunggal berukuran mikro-atomik sehingga sinar laser lewat lurus sepenuhnya tanpa hamburan cahaya.',
    chemComposition: 'Monomer Gula C₁₂H₂₂O₁₁ terlarut',
    colorHex: 'rgba(255, 255, 255, 0.05)', // Almost invisible/clear
    solidColorHex: '#ffffff',
    sedimentStatus: 'none'
  },
  {
    id: 'susu_ecer',
    name: 'Koloid Susu (Emulsi Cair)',
    type: 'koloid',
    subType: 'Emulsi (Cair dalam Cair)',
    dispersedPhase: 'Lemak Susu (Cair)',
    dispersionMedium: 'Air (Cair)',
    particleSize: '1 nm - 100 nm (Mikroskopis)',
    appearance: 'Keruh, tampak homogen tetapi heterogen di bawah ultramikroskop',
    stability: 'Cukup Stabil (Tertopang kasein penstabil emulsifier)',
    filterability: 'Hanya dapat disaring dengan membran ultra',
    tyndallDescription: 'Efek Tyndall Sangat Kuat! Berkas laser tampak berpendar tebal, bersinar megah di sepanjang wadah karena butiran lemak susu mendifraksikan berkas cahaya ke segala penjuru mata.',
    chemComposition: 'Lemak & Protein Kasein Tersuspensi',
    colorHex: 'rgba(255, 255, 255, 0.72)', // Milky white
    solidColorHex: '#f1f5f9',
    sedimentStatus: 'none'
  },
  {
    id: 'santan_kelapa',
    name: 'Koloid Santan',
    type: 'koloid',
    subType: 'Emulsi (Cair dalam Cair)',
    dispersedPhase: 'Minyak kelapa nabati (Cair)',
    dispersionMedium: 'Air (Cair)',
    particleSize: '1 nm - 100 nm (Mikroskopis)',
    appearance: 'Keruh keputihan, agak kental',
    stability: 'Relatif Stabil (Bisa memisah/koagulasi jika dipanaskan ekstrem)',
    filterability: 'Hanya bisa disaring membran ultra bertekanan tinggi',
    tyndallDescription: 'Berkas sinar terhambur jelas membentuk jalur pita cahaya yang tebal dan redup di bagian belakang akibat penyerapan sebagian intensitas laser di depan.',
    chemComposition: 'Trigliserida kelapa terdispersi di air',
    colorHex: 'rgba(248, 250, 252, 0.85)', // Dense white
    solidColorHex: '#ffffff',
    sedimentStatus: 'none'
  },
  {
    id: 'sol_fe_oh3',
    name: 'Koloid Sol Fe(OH)₃ (Positif)',
    type: 'koloid',
    subType: 'Sol (Padat dalam Cair)',
    dispersedPhase: 'Besi(III) Hidroxida Fe(OH)₃ (Padat)',
    dispersionMedium: 'Air (Cair)',
    particleSize: '2 nm - 50 nm (Nanopartikel Hidroksil)',
    appearance: 'Cairan merah bata/cokelat bening indah nan elegan',
    stability: 'Sangat Stabil (Muatan positif pelindung ion Fe3+)',
    filterability: 'Tembus kertas saring biasa, tertahan membran dialisis',
    tyndallDescription: 'Efek Tyndall Klasik. Menghasilkan hamburan menyala merah-jingga tajam yang memperlihatkan lintasan berkas laser lurus menawan berkilauan.',
    chemComposition: '[Fe(OH)₃]x · yFe³⁺ || Terkomposisi Lewat Reaksi Hidrolisis',
    colorHex: 'rgba(185, 28, 28, 0.65)', // Deep warm wine-red
    solidColorHex: '#f87171',
    sedimentStatus: 'none'
  },
  {
    id: 'kopi_tumbuk',
    name: 'Suspensi Kopi Hitam',
    type: 'suspensi',
    subType: 'Dispersi Kasar (Padat dalam Cair)',
    dispersedPhase: 'Butir Kopi Gilingan (Padat)',
    dispersionMedium: 'Air (Cair)',
    particleSize: '> 100 nm (Makroskopis Kasar)',
    appearance: 'Tepung kasar hitam pekat, sangat heterogen, dua fase terpisah',
    stability: 'Tidak Stabil (Segera mengendap seiring jalannya waktu)',
    filterability: 'Dapat disaring dengan kertas saring biasa/kain saring',
    tyndallDescription: 'Bukan Hamburan Tyndall. Sinar dihalang/diserap total oleh partikel kopi berukuran raksasa. Cahaya terhalang total memicu bayangan gelap lurus di belakang larutan.',
    chemComposition: 'Bubuk Kopi Terperangkap Gravitasi',
    colorHex: 'rgba(30, 20, 15, 0.94)', // Coffee black/brown dark
    solidColorHex: '#3b2314',
    sedimentStatus: 'slow_sediment'
  },
  {
    id: 'tepung_terigu',
    name: 'Suspensi Air & Tepung',
    type: 'suspensi',
    subType: 'Dispersi Kasar',
    dispersedPhase: 'Pati/Gluten Tepung Terigu (Padat)',
    dispersionMedium: 'Air (Cair)',
    particleSize: '> 200 nm',
    appearance: 'Keruh pekat keputihan, berlapis',
    stability: 'Sangat Tidak Stabil (Mengendap menjadi ampas padat)',
    filterability: 'Mudah dipisahkan menggunakan penyaringan lab standar biasa',
    tyndallDescription: 'Sinar laser tak mampu tembus secara lurus. Mengalami pemantulan permukaan kacau (difusi keruh) dan diblokir total membentuk hamburan berpendar keruh tak menentu.',
    chemComposition: 'Granula Amilopektin Terdispersi Kasar',
    colorHex: 'rgba(241, 245, 249, 0.88)', // Flour sediment white
    solidColorHex: '#cbd5e1',
    sedimentStatus: 'instant_settling'
  },
  {
    id: 'pasir_sungai',
    name: 'Suspensi Lumpur / Pasir',
    type: 'suspensi',
    subType: 'Dispersi Kasar',
    dispersedPhase: 'Silika / Pasir (Padat)',
    dispersionMedium: 'Air (Cair)',
    particleSize: '> 1000 nm (Kasat Mata)',
    appearance: 'Keruh berkabut, dalam hitungan detik butir pasir tenggelam',
    stability: 'Sangat Tidak Stabil',
    filterability: 'Sangat mudah disaring',
    tyndallDescription: 'Dinding laser memajang pantulan reflektif sesaat pada kerikil, setelah mengendap, laser melewati air jernih di bagian atas dan membentur timbunan lumpur di bawah.',
    chemComposition: 'SiO₂ Silika Pasir Terbawa Fluida',
    colorHex: 'rgba(120, 100, 75, 0.35)', // Mud water yellowish
    solidColorHex: '#a16207',
    sedimentStatus: 'instant_settling'
  }
];

interface ColloidLabProps {
  theme?: 'dark' | 'light';
}

export default function ColloidLab({ theme = 'dark' }: ColloidLabProps) {
  const [activeSegment, setActiveSegment] = useState<'tyndall' | 'synthesis' | 'properties'>('tyndall');

  // ==========================================
  // TAB 1: TYNDALL EFFECT & MICROSCOPIC VIEW
  // ==========================================
  const [selectedMixId, setSelectedMixId] = useState<string>('susu_ecer');
  const [laserOn, setLaserOn] = useState<boolean>(true);
  const [laserColor, setLaserColor] = useState<'red' | 'green' | 'violet'>('green');
  const [laserPower, setLaserPower] = useState<number>(80); // In percent 0-100
  const [brownianSpeed, setBrownianSpeed] = useState<number>(40); // speed slider for microscope

  const currentMix = MIXTURES.find(m => m.id === selectedMixId) || MIXTURES[2];

  // Ref for Microscopic Canvas Animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Microscopic Particles Store for rendering
  const microParticles = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
  }[]>([]);

  // Photon Particles Store for rendering lasers scattering
  const microPhotons = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    active: boolean;
    scattered: boolean;
  }[]>([]);

  // Initialize microscopic particles based on mixture type
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    const particles: typeof microParticles.current = [];
    
    if (currentMix.type === 'larutan') {
      // Small particles, moving fast (Individual molecules / hydrated ions)
      const count = 40;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: 1.5 + Math.random() * 2,
          color: selectedMixId === 'garam_ruang' ? '#38bdf8' : '#e2e8f0'
        });
      }
    } else if (currentMix.type === 'koloid') {
      // Mid-sized particles, moderate Brownian motion
      const count = 22;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: 8 + Math.random() * 12,
          color: currentMix.solidColorHex
        });
      }
    } else {
      // Suspension: HUGE chunky clusters, sinking slowly downwards
      const count = 10;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * (height - 30),
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.15 + Math.random() * 0.4, // Drift down
          radius: 20 + Math.random() * 18,
          color: currentMix.solidColorHex
        });
      }
    }

    microParticles.current = particles;
    microPhotons.current = []; // Clear photons
  }, [selectedMixId]);

  // Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const getLaserColorHex = () => {
      if (laserColor === 'red') return '#f43f5e';
      if (laserColor === 'green') return '#10b981';
      return '#8b5cf6'; // Violet
    };

    const speedScale = brownianSpeed / 40;

    const render = () => {
      // Clear with dark tech theme background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Grid line guidelines subtle
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 1;
      for (let i = 40; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 40; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // 1. Spawning laser photons (only if laser on and power is > 0)
      if (laserOn && laserPower > 0) {
        const pRate = Math.ceil(laserPower / 25);
        for (let r = 0; r < pRate; r++) {
          microPhotons.current.push({
            x: 0,
            y: 40 + Math.random() * (height - 80),
            vx: 4.5,
            vy: 0,
            color: getLaserColorHex(),
            active: true,
            scattered: false
          });
        }
      }

      // 2. Update and Draw Photons
      ctx.lineWidth = 1.5;
      for (let i = 0; i < microPhotons.current.length; i++) {
        const ph = microPhotons.current[i];
        if (!ph.active) continue;

        // Draw path trail
        ctx.beginPath();
        ctx.strokeStyle = ph.color;
        ctx.globalAlpha = ph.scattered ? 0.35 : 0.85;
        ctx.moveTo(ph.x - ph.vx * 1.5, ph.y - ph.vy * 1.5);
        ctx.lineTo(ph.x, ph.y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Move
        ph.x += ph.vx;
        ph.y += ph.vy;

        // Out of bounds check
        if (ph.x < 0 || ph.x > width || ph.y < 0 || ph.y > height) {
          ph.active = false;
        }
      }
      // Filter out idle photons to save memory
      microPhotons.current = microPhotons.current.filter(p => p.active);

      // 3. Draw and Update Chemical Particles
      for (let i = 0; i < microParticles.current.length; i++) {
        const p = microParticles.current[i];

        // Apply Brownian jitter speed multiplier
        p.x += p.vx * speedScale;
        p.y += p.vy * speedScale;

        // Boundary bounce inside microscope zoom bounds
        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = -p.vx;
        }
        if (p.x + p.radius > width) {
          p.x = width - p.radius;
          p.vx = -p.vx;
        }

        // Under suspension, particles slowly accumulate at bottom
        if (currentMix.type === 'suspensi') {
          if (p.y + p.radius > height - 12) {
            p.y = height - 12 - p.radius;
            p.vy = -p.vy * 0.15; // lose velocity on sediment impact
            p.vx = (Math.random() - 0.5) * 0.1;
          }
        } else {
          // Normal boundary
          if (p.y - p.radius < 0) {
            p.y = p.radius;
            p.vy = -p.vy;
          }
          if (p.y + p.radius > height) {
            p.y = height - p.radius;
            p.vy = -p.vy;
          }
        }

        // Draw particle representation
        ctx.beginPath();
        if (currentMix.type === 'larutan') {
          // Tiny glowing speck representing solute ion/mol
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (currentMix.type === 'koloid') {
          // Colloidal particle: Core with hydration layer halo around it
          const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.2, p.x, p.y, p.radius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, p.color);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = grad;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Suspension: Massive blocky coarse soil fragment
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.x + p.y) * 0.005); // pseudo rotation
          ctx.fillStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#78350f';
          
          ctx.beginPath();
          // Draw a rough polygon representing dirt speck
          ctx.moveTo(0, -p.radius);
          ctx.lineTo(p.radius * 0.8, -p.radius * 0.6);
          ctx.lineTo(p.radius * 0.9, p.radius * 0.5);
          ctx.lineTo(0, p.radius * 0.9);
          ctx.lineTo(-p.radius * 0.8, p.radius * 0.4);
          ctx.lineTo(-p.radius * 0.9, -p.radius * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // 4. Photon-Particle Collision Check (scattering!)
        if (laserOn && laserPower > 0) {
          for (let j = 0; j < microPhotons.current.length; j++) {
            const ph = microPhotons.current[j];
            if (ph.scattered || !ph.active) continue;

            // Distance calculation
            const dx = ph.x - p.x;
            const dy = ph.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < p.radius + 1) {
              if (currentMix.type === 'larutan') {
                // Ions/molecules are too small (<1nm) compared to visible light waves (400-700nm).
                // Quantum rule: No ray-tracing collision occurs, light waves wrap around them directly.
                // Do not scatter!
              } else if (currentMix.type === 'koloid') {
                // Colloid particles (1-100nm) are big enough to scatter photons (Rayleigh/Mie)
                ph.scattered = true;
                
                // Deflect angle randomly outwards on hemisphere
                const angle = (Math.random() - 0.5) * Math.PI * 1.5; // highly random deflection
                const speed = 4.2;
                ph.vx = Math.cos(angle) * speed;
                ph.vy = Math.sin(angle) * speed;

                // Create a flash sparkle effect on collision point
                ctx.beginPath();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.moveTo(ph.x - 3, ph.y);
                ctx.lineTo(ph.x + 3, ph.y);
                ctx.moveTo(ph.x, ph.y - 3);
                ctx.lineTo(ph.x, ph.y + 3);
                ctx.stroke();
              } else {
                // Suspension particle blocks, absorbs or heavily reflects
                ph.scattered = true;
                if (Math.random() < 0.6) {
                  // Captured (Absorbed/shadowed by mud slurry)
                  ph.active = false;
                } else {
                  // Bounced back (Reflected of dirty surface)
                  ph.vx = -ph.vx * 1.1; // Backbounce direction
                  ph.vy = (Math.random() - 0.5) * 3;
                }
              }
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [selectedMixId, laserOn, laserColor, laserPower, brownianSpeed]);

  // ==========================================
  // TAB 2: COLLOID SYNTHESIS LABORATORY
  // ==========================================
  const [synthMethod, setSynthMethod] = useState<'cond_hydrolysis' | 'cond_redox' | 'disp_peptization'>('cond_hydrolysis');
  const [synthStep, setSynthStep] = useState<number>(1);
  const [isSynthSimulating, setIsSynthSimulating] = useState<boolean>(false);
  const [synthNarrative, setSynthNarrative] = useState<string>('Pilih formulasi pengolahan untuk memicu sintesis koloid.');
  const [synthBeakerColor, setSynthBeakerColor] = useState<string>('rgba(241, 245, 249, 0.15)'); // Clear water at start
  const [synthClumps, setSynthClumps] = useState<{ x: number, y: number, r: number, color: string }[]>([]);

  // Reset synthesis lab when switching methods
  useEffect(() => {
    setSynthStep(1);
    setIsSynthSimulating(false);
    setSynthClumps([]);
    if (synthMethod === 'cond_hydrolysis') {
      setSynthNarrative('Hidrolisis Besi(III) Klorida (Kondensasi): Kami akan mereaksikan garam FeCl₃ dengan air mendidih untuk melahirkan Sol Besi(III) Hidroksida Fe(OH)₃.');
      setSynthBeakerColor('rgba(255, 255, 255, 0.15)'); // Clear water start
    } else if (synthMethod === 'cond_redox') {
      setSynthNarrative('Sintesis Sol Belerang Kimiawi (Kondensasi Redoks): Direaksikan Natrium Tiosulfat (Na₂S₂O₃) jernih dengan Asam Klorida (HCl).');
      setSynthBeakerColor('rgba(255, 255, 255, 0.15)');
    } else {
      setSynthNarrative('Peptisasi Endapan Padat (Dispersi): Memecah gumpalan kaku gel Al(OH)₃ kembali menjadi partikel koloid tersuspensi halus dengan bantuan zat peptisasi AlCl₃.');
      setSynthBeakerColor('rgba(255, 255, 255, 0.05)'); // Water background with clumps
      // Add initial coarse clumps inside the beaker representing coagulated Al(OH)3 precipitate
      const startClumps = [];
      for (let i = 0; i < 16; i++) {
        startClumps.push({
          x: 40 + Math.random() * 120,
          y: 60 + Math.random() * 60,
          r: 5 + Math.random() * 6,
          color: '#ffffff'
        });
      }
      setSynthClumps(startClumps);
    }
  }, [synthMethod]);

  const advanceSynthStep = () => {
    if (isSynthSimulating) return;

    setIsSynthSimulating(true);
    const nextS = synthStep + 1;

    if (synthMethod === 'cond_hydrolysis') {
      if (synthStep === 1) {
        setSynthNarrative('Langkah 1: Menyalakan Pembakar Bunsen untuk memanaskan air murni hingga mencapai titik didih 100°C. Gas gelembung uap mulai naik...');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          setSynthNarrative('Air telah siap mendidih sempurna! Siap menembakkan cairan FeCl₃ berwarna kuning bening ke labu.');
        }, 2000);
      } else if (synthStep === 2) {
        setSynthNarrative('Langkah 2: Meneteskan larutan garam FeCl₃ pekat berwarna kuning bening ke dalam air mendidih. Reaksi hidrolisis segera dimulai...');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          setSynthBeakerColor('rgba(161, 98, 7, 0.55)'); // yellowish transition
          setSynthNarrative('Air mendidih mendegradasi molekul FeCl₃ menjadi asam hidroklorida kuat dan partikel Fe(OH)₃ halus.');
        }, 2000);
      } else if (synthStep === 3) {
        setSynthNarrative('Langkah 3: Membiarkan pemanasan beberapa saat. Molekul-molekul kecil Fe(OH)₃ yang baru terbentuk saling mengelompok (kondensasi) membentuk Sol Koloid Fe(OH)₃.');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          setSynthBeakerColor('rgba(185, 28, 28, 0.72)'); // Beautiful deep ruby red wine sol
          setSynthNarrative('SINTESIS SELESAI! Larutan bertransformasi total menjadi cairan Sol Fe(OH)₃ merah bata bernuansa merah anggur yang sangat stabil dan pendaran Tyndall luar biasa.');
        }, 2500);
      }
    } else if (synthMethod === 'cond_redox') {
      if (synthStep === 1) {
        setSynthNarrative('Langkah 1: Menuangkan larutan jernih Natrium Tiosulfat (Na₂S₂O₃) ke dalam gelas reaktor.');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          setSynthNarrative('Tiosulfat siap. Sekarang kita akan menetesi Asam Klorida (HCl).');
        }, 1500);
      } else if (synthStep === 2) {
        setSynthNarrative('Langkah 2: Menambahkan tetes HCl kuat ke dalam gelas tiosulfat. Ion tiosulfat bereaksi cepat melepas gas SO₂ dan menghasilkan atom S bebas...');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          setSynthBeakerColor('rgba(234, 240, 160, 0.25)'); // Pale yellow clouding
          setSynthNarrative('Atom belerang bebas terperangkap di air. Merekondensasi secara mandiri membentuk rantai makromolekul belerang berbobot koloidal.');
        }, 2000);
      } else if (synthStep === 3) {
        setSynthNarrative('Langkah 3: Biarkan kepingan atom belerang stabil berkat interaksi tolak-menolak muatan permukaan.');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          setSynthBeakerColor('rgba(254, 240, 138, 0.65)'); // Cloudy yellow Sulfur Sol
          setSynthNarrative('SINTESIS FINISHED! Sol belerang kuning susu keruh terbentuk secara kondensasi kimiawi murni. Siap disorot efek Tyndall.');
        }, 2000);
      }
    } else {
      // peptization
      if (synthStep === 1) {
        setSynthNarrative('Langkah 1: Menyiapkan endapan kaku putih Al(OH)₃ yang telah mengendap kental di dalam gelas beaker.');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          setSynthNarrative('Endapan molekul-ion netral ini mengelompok kasar (suspensi) dan tidak larut. Kami akan menuang cairan peptisator AlCl₃.');
        }, 1500);
      } else if (synthStep === 2) {
        setSynthNarrative('Langkah 2: Meneteskan elektrolit AlCl₃ ke dalam wadah. Ion Al³⁺ yang sangat bermuatan terserap kuat pada permukaan endapan kaku Al(OH)₃...');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          
          // Animate crumbling of clumps
          setSynthClumps(prev => prev.map(c => ({
            ...c,
            r: c.r * 0.4 // Shrink into microscopic size!
          })));
          setSynthBeakerColor('rgba(248, 250, 252, 0.45)'); // Cloudy milky white colloidal transition

          setSynthNarrative('Karena partikel sekarang memiliki muatan positif sejenis Al³⁺, mereka mengalami gaya tolak-menolak elektrostatik ekstrem, menyebabkan gumpalan terpecah lepas kembali.');
        }, 2500);
      } else if (synthStep === 3) {
        setSynthNarrative('Langkah 3: Mengguncang pelan wadah agar pemisahan terdispersi merata ke seluruh volume cairan pelarut.');
        setTimeout(() => {
          setIsSynthSimulating(false);
          setSynthStep(nextS);
          setSynthClumps([]); // dissolved completely into sub-nm/nm particles too small to draw custom clumps
          setSynthBeakerColor('rgba(241, 245, 249, 0.72)'); // Beautiful white colloidal dispersion
          setSynthNarrative('SINTESIS PEPTISASI BERHASIL! Suspensi endapan putih kasar berubah drastis menjadi sistem koloid sol Al(OH)₃ putih keperakan yang stabil dengan pendaran merata.');
        }, 2000);
      }
    }
  };

  const resetSynthExperiments = () => {
    setSynthStep(1);
    setIsSynthSimulating(false);
    if (synthMethod === 'cond_hydrolysis') {
      setSynthNarrative('Hidrolisis Besi(III) Klorida (Kondensasi): Reaksi hidrolisis air mendidih.');
      setSynthBeakerColor('rgba(255, 255, 255, 0.15)');
      setSynthClumps([]);
    } else if (synthMethod === 'cond_redox') {
      setSynthNarrative('Sintesis Sol Belerang Kimiawi (Kondensasi): Campur tiosulfat & HCl.');
      setSynthBeakerColor('rgba(255, 255, 255, 0.15)');
      setSynthClumps([]);
    } else {
      setSynthNarrative('Peptisasi Endapan Padat (Dispersi): Hancurkan endapan Al(OH)₃ dengan AlCl₃.');
      setSynthBeakerColor('rgba(255, 255, 255, 0.05)');
      const startClumps = [];
      for (let i = 0; i < 16; i++) {
        startClumps.push({
          x: 40 + Math.random() * 120,
          y: 60 + Math.random() * 60,
          r: 5 + Math.random() * 6,
          color: '#ffffff'
        });
      }
      setSynthClumps(startClumps);
    }
  };


  // ==========================================
  // TAB 3: COLLOID PROPERTIES PLAYGROUND
  // ==========================================
  const [propTab, setPropTab] = useState<'electro' | 'coagulate' | 'dialysis'>('electro');
  
  // Electrophoresis states
  const [voltageOn, setVoltageOn] = useState<boolean>(false);
  const [colloidTypeCharged, setColloidTypeCharged] = useState<'positive' | 'negative'>('positive'); // Positive: Fe(OH)3, Negative: As2S3
  const [electroProgress, setElectroProgress] = useState<number>(0); // Left/Right migration offset

  // Dialysis states
  const [dialysisActive, setDialysisActive] = useState<boolean>(false);
  const [dialysisPureGrade, setDialysisPureGrade] = useState<number>(10); // Impurities index inside bag, 10 to 0 (clean!)
  const [runningWaterTimer, setRunningWaterTimer] = useState<boolean>(false);

  // Coagulation state
  const [coagResult, setCoagResult] = useState<string>('Sol koloid bermuatan negatif menyebar stabil. Tambahkan elektrolit untuk menguji presipitasi.');
  const [coagSaltPower, setCoagSaltPower] = useState<'none' | 'nacl' | 'cacl2' | 'alcl3'>('none');
  const [isCoagulatingAnim, setIsCoagulatingAnim] = useState<boolean>(false);

  // Electrophoresis simulation loop
  useEffect(() => {
    let timer: any;
    if (voltageOn) {
      timer = setInterval(() => {
        setElectroProgress(prev => {
          if (colloidTypeCharged === 'positive') {
            // Positively charged colloidal particles migrate to the CATHODE (Negative Pole on the Left side (-))
            if (prev <= -60) return -60;
            return prev - 2;
          } else {
            // Negatively charged colloidal particles migrate to the ANODE (Positive Pole on the Right side (+))
            if (prev >= 60) return 60;
            return prev + 2;
          }
        });
      }, 80);
    } else {
      // Slowly relax back to normal dispersion (thermal diffusion)
      timer = setInterval(() => {
        setElectroProgress(prev => {
          if (prev === 0) return 0;
          return prev > 0 ? Math.max(0, prev - 1) : Math.min(0, prev + 1);
        });
      }, 100);
    }

    return () => clearInterval(timer);
  }, [voltageOn, colloidTypeCharged]);

  // Dialysis simulation loop
  useEffect(() => {
    let timer: any;
    if (dialysisActive && dialysisPureGrade > 0) {
      setRunningWaterTimer(true);
      timer = setInterval(() => {
        setDialysisPureGrade(prev => {
          if (prev <= 1) {
            setDialysisActive(false);
            setRunningWaterTimer(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1500);
    } else {
      setRunningWaterTimer(false);
    }

    return () => clearInterval(timer);
  }, [dialysisActive]);

  const triggerCoagulation = (salt: 'nacl' | 'cacl2' | 'alcl3') => {
    setCoagSaltPower(salt);
    setIsCoagulatingAnim(true);
    
    if (salt === 'nacl') {
      setCoagResult('Menambahkan garam NaCl (Kation Na⁺ monovalen). Gaya penetralan rendah. Koloid membutuhkan muatan garam berlebih atau waktu lama untuk koagulasi.');
      setTimeout(() => {
        setIsCoagulatingAnim(false);
        setCoagResult('Koagulasi Ringan: Setelah beberapa jam, sebagian kecil koloid baru mulai menggumpal tipis (flokulasi lambat). Kapasitas pengendapan rendah.');
      }, 3000);
    } else if (salt === 'cacl2') {
      setCoagResult('Menambahkan garam CaCl₂ (Kation Ca²⁺ divalen). Sesuai aturan Schulze-Hardy, kation bermuatan 2+ jauh lebih unggul menetralkan muatan koloid dibanding Na⁺.');
      setTimeout(() => {
        setIsCoagulatingAnim(false);
        setCoagResult('Koagulasi Sedang: Penggumpalan koloid berjalan terakselerasi dalam beberapa menit. Terbentuk ampas endapan halus di dasar tabung.');
      }, 3000);
    } else {
      setCoagResult('Menambahkan garam AlCl₃ (Kation Al³⁺ trivalen). Kation bermuatan tinggi memiliki daya tarik elektrostatik luar biasa, menetralkan lapisan ganda koloid seketika.');
      setTimeout(() => {
        setIsCoagulatingAnim(false);
        setCoagResult('Koagulasi Instan! Kation Al³⁺ segera melumpuhkan ketebalan lapisan listrik ganda negatif. Partikel mengendap total berupa sedimen tebal di dasar wadah.');
      }, 3000);
    }
  };

  const resetCoagulation = () => {
    setCoagSaltPower('none');
    setIsCoagulatingAnim(false);
    setCoagResult('Sol koloid bermuatan negatif menyebar stabil. Tambahkan garam elektrolit untuk mengamati pengaruh valensi kation!');
  };

  return (
    <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white border-slate-850' : 'bg-slate-50 text-slate-900 border-slate-200'} rounded-3xl border overflow-hidden shadow-2xl flex flex-col font-sans`} id="colloid-lab-root">
      
      {/* Lab Hero Header Section */}
      <div className={`p-6 sm:p-8 border-b relative ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-teal-950 via-slate-950 to-indigo-950 border-slate-900'
          : 'bg-gradient-to-r from-teal-50 via-slate-50 to-indigo-50 border-slate-200'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono font-black uppercase tracking-widest rounded-full">
              LAB VISUALISASI AKTIF • KELAS XI SEMESTER 2
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-teal-400" />
              Sistem Koloid &amp; Efek Tyndall
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Jelajahi keunikan sistem dispersi berukuran nanometer. Mulai dari pendaran berkas cahaya laser pada efek Tyndall, metode pembuatan koloid secara kondensasi &amp; dispersi, hingga sifat mekanis-elektrik terpadu!
            </p>
          </div>

          <div className="flex gap-2">
            <div className={`px-3.5 py-2 border rounded-2xl flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100/80 border-slate-300'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left font-mono text-[9px]">
                <p className="text-slate-500 leading-none">STATUS PENELITIAN</p>
                <p className="font-bold text-white leading-tight mt-0.5">TERAKREDITASI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className={`flex flex-col gap-2 p-1 rounded-xl border w-full md:w-56 shrink-0 mt-6 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
        }`}>
          <button
            onClick={() => setActiveSegment('tyndall')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-start gap-2 cursor-pointer ${
              activeSegment === 'tyndall' 
                ? 'bg-slate-950 border border-slate-800 text-teal-400 shadow'
                : (theme === 'dark' ? 'text-slate-450 hover:text-white' : 'text-slate-700 hover:text-slate-900')
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Simulator Tyndall</span>
          </button>
          
          <button
            onClick={() => setActiveSegment('synthesis')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-start gap-2 cursor-pointer ${
              activeSegment === 'synthesis' 
                ? 'bg-slate-950 border border-slate-800 text-teal-400 shadow'
                : (theme === 'dark' ? 'text-slate-450 hover:text-white' : 'text-slate-700 hover:text-slate-900')
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Sintesis Koloid</span>
          </button>

          <button
            onClick={() => setActiveSegment('properties')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-start gap-2 cursor-pointer ${
              activeSegment === 'properties' 
                ? 'bg-slate-950 border border-slate-800 text-teal-400 shadow'
                : (theme === 'dark' ? 'text-slate-450 hover:text-white' : 'text-slate-700 hover:text-slate-900')
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Sifat Playground</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-8">
        
        {/* ==========================================
            SEGMENT 1: TYNDALL EFFECT SIMULATOR
            ========================================== */}
        {activeSegment === 'tyndall' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Control Column (35%) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Select Mixture Container */}
              <div className={`p-5 border rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                <div className="flex items-center gap-2">
                  <Beaker className="w-4 animate-bounce h-4 text-teal-450" />
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-350">Pengaturan Campuran Larutan</h3>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-mono font-black uppercase">PILIH FLUIDA DI DALAM BEAKER</p>
                  <div className="grid grid-cols-1 gap-2">
                    {MIXTURES.map(mix => {
                      const isSelected = mix.id === selectedMixId;
                      return (
                        <button
                          key={mix.id}
                          onClick={() => setSelectedMixId(mix.id)}
                          className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-teal-500/10 border-teal-500/55 text-teal-300 font-bold shadow-md'
                              : 'bg-slate-900/30 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-inner"
                              style={{ backgroundColor: mix.colorHex }}
                            />
                            <div className="text-left leading-tight">
                              <p className="font-semibold">{mix.name}</p>
                              <span className="text-[9px] text-slate-500 font-medium font-mono uppercase">{mix.type}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono leading-none ${
                            mix.type === 'larutan' 
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : mix.type === 'koloid'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {mix.type.toUpperCase()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Laser Beam Settings Grid */}
              <div className={`p-5 border rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-teal-400" />
                    <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-350">Parameter Laser Fisika</h3>
                  </div>
                  <button
                    onClick={() => setLaserOn(!laserOn)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all ${
                      laserOn
                        ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                        : 'bg-rose-500/15 border border-rose-550/40 text-rose-450'
                    }`}
                  >
                    {laserOn ? <Activity className="w-3 h-3 text-emerald-400" /> : <ZapOff className="w-3 h-3 text-rose-500" />}
                    <span>LASER: {laserOn ? 'MENYALA' : 'OFF'}</span>
                  </button>
                </div>

                {/* Laser Power Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>INTENSITAS ENERGI LASER</span>
                    <span className="text-teal-400 font-bold">{laserPower}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={laserPower}
                    onChange={(e) => setLaserPower(Number(e.target.value))}
                    disabled={!laserOn}
                    className={`w-full accent-teal-400 cursor-pointer h-1.5 rounded-lg ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}
                  />
                </div>

                {/* Laser Color Wavelength Switcher */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-500 font-mono">PANJANG GELOMBANG LASER (WAVELENGTH)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setLaserColor('red')}
                      disabled={!laserOn}
                      className={`py-1.5 rounded-lg text-[9px] font-semibold border font-mono transition-all uppercase cursor-pointer ${
                        laserColor === 'red' && laserOn
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400 font-bold shadow'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      650nm (Merah)
                    </button>
                    <button
                      onClick={() => setLaserColor('green')}
                      disabled={!laserOn}
                      className={`py-1.5 rounded-lg text-[9px] font-semibold border font-mono transition-all uppercase cursor-pointer ${
                        laserColor === 'green' && laserOn
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold shadow'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      532nm (Hijau)
                    </button>
                    <button
                      onClick={() => setLaserColor('violet')}
                      disabled={!laserOn}
                      className={`py-1.5 rounded-lg text-[9px] font-semibold border font-mono transition-all uppercase cursor-pointer ${
                        laserColor === 'violet' && laserOn
                          ? 'bg-purple-500/10 border-purple-500 text-purple-400 font-bold shadow'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      405nm (Violet)
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Experimental Bench & Microscope Zoom (70%) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Beaker Laser Bench Box */}
              <div className={`p-6 rounded-3xl relative flex flex-col items-center justify-center min-h-[280px] overflow-hidden border ${
                theme === 'dark' 
                  ? 'bg-[#030712] border-slate-850'
                  : 'bg-white border-slate-200'
              }`}>
                <div className={`absolute inset-x-0 bottom-0 h-10 pointer-events-none ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-t from-slate-950/90 to-transparent'
                      : 'bg-gradient-to-t from-slate-50/90 to-transparent'
                }`} />
                
                {/* Benchmark Title */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                  <span className={`text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border shadow ${theme === 'dark' ? 'text-slate-400 bg-slate-950/80 border-slate-900' : 'text-slate-600 bg-slate-100/80 border-slate-300'}`}>
                    MEJA EKSPERIMEN OPTIK SIFAT TYNDALL
                  </span>
                </div>

                {/* Laser light emitter model Left */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center z-15">
                  <div className={`w-10 h-6 border border-slate-750 rounded-lg flex items-center justify-center shadow-md relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                    <div className="w-3 h-3 bg-zinc-700 border border-zinc-600 rounded-full" />
                    {/* Tiny glowing emitter hole */}
                    <div className={`absolute right-0 w-1.5 h-2 rounded-r-md ${
                      laserOn ? (laserColor === 'red' ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : laserColor === 'green' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-purple-500 shadow-lg shadow-purple-500/50') : 'bg-slate-700'
                    }`} />
                  </div>
                  <span className="text-[7.5px] font-mono text-zinc-600 mt-1 uppercase font-bold text-center">EMITTER</span>
                </div>

                {/* Pure physical Beaker model */}
                <div className="relative w-44 h-48 flex flex-col items-center justify-end z-10 mt-6 select-none">
                  
                  {/* Beaker outline with double thickness glass effect */}
                  <div className="absolute inset-0 border-x-4 border-b-6 border-slate-300/40 rounded-b-2xl rounded-t-lg relative flex flex-col justify-end overflow-hidden shadow-inner w-36 h-44">
                    
                    {/* Fluid liquid color inside beaker responsive */}
                    <div 
                      className="w-full absolute bottom-0 left-0 right-0 transition-all duration-700 flex flex-col justify-end"
                      style={{ 
                        height: '75%', 
                        backgroundColor: currentMix.colorHex,
                        boxShadow: `inset 0 -15px 30px rgba(0,0,0,0.3)`
                      }}
                    >
                      {/* Interactive internal Tyndall laser path lines */}
                      {laserOn && laserPower > 0 && (
                        <div 
                          className="absolute left-0 right-0 h-1.5 blur-[1.5px] transition-all duration-300 pointer-events-none"
                          style={{
                            top: '55%',
                            background: laserColor === 'red' 
                              ? 'linear-gradient(90deg, rgba(244,63,94,1) 0%, rgba(244,63,94,0.3) 100%)' 
                              : laserColor === 'violet' 
                              ? 'linear-gradient(90deg, rgba(139,92,246,1) 0%, rgba(139,92,246,0.3) 100%)' 
                              : 'linear-gradient(90deg, rgba(16,185,129,1) 0%, rgba(16,185,129,0.3) 100%)',
                            opacity: currentMix.type === 'larutan' 
                              ? 0 
                              : currentMix.type === 'koloid' 
                              ? (laserPower / 100) * 0.95 
                              : (laserPower / 100) * 0.35, // light distorted heavily in suspension
                            boxShadow: `0 0 12px ${laserColor === 'red' ? '#f43f5e' : laserColor === 'green' ? '#10b981' : '#8b5cf6'}`
                          }}
                        />
                      )}

                      {/* Suspension Floating speck dots inside beaker (flour, dirt, clay) */}
                      {currentMix.type === 'suspensi' && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <span className="absolute bottom-1.5 left-6 w-12 h-1 bg-amber-800/40 rounded blur-xs animate-pulse" />
                          <span className="absolute bottom-1 left-16 w-14 h-2 bg-amber-800/30 rounded border border-amber-900/10 blur-2xs" />
                          
                          {/* Floating particles mimicking coarse settling */}
                          <div className="absolute top-2 left-6 w-1.5 h-1.5 rounded-full bg-amber-900/80 animate-bounce" />
                          <div className="absolute top-8 left-16 w-2 h-1.5 rounded bg-amber-800/60 animate-pulse" />
                          <div className="absolute top-12 left-20 w-1 h-1 bg-amber-700 animate-ping" />
                          <div className="absolute top-16 left-8 w-1.5 h-2 rounded-full bg-amber-900 animate-bounce" />
                        </div>
                      )}
                    </div>

                    {/* Volumetric lab measurement tick lines on beaker glass */}
                    <div className="absolute right-2 top-4 flex flex-col items-end gap-5 text-[8px] font-mono text-zinc-500 select-none">
                      <div className="flex items-center gap-1"><span>200 mL</span><span className="w-2.5 h-px bg-zinc-650" /></div>
                      <div className="flex items-center gap-1"><span>150 mL</span><span className="w-1.5 h-px bg-zinc-650" /></div>
                      <div className="flex items-center gap-1"><span>100 mL</span><span className="w-2.5 h-px bg-zinc-650" /></div>
                      <div className="flex items-center gap-1"><span>50 mL</span><span className="w-1.5 h-px bg-zinc-650" /></div>
                    </div>
                  </div>

                  {/* Air laser lines around Beaker (before entry & after exiting) */}
                  {laserOn && laserPower > 0 && (
                    <>
                      {/* Left: Input beam line */}
                      <div 
                        className="absolute left-[-110px] w-24 h-0.5 pointer-events-none transition-all duration-300"
                        style={{
                          top: '52%',
                          backgroundColor: laserColor === 'red' ? '#f43f5e' : laserColor === 'green' ? '#10b981' : '#8b5cf6',
                          opacity: (laserPower / 100) * 0.85,
                          boxShadow: `0 0 6px ${laserColor === 'red' ? '#f43f5e' : laserColor === 'green' ? '#10b981' : '#8b5cf6'}`
                        }}
                      />
                      
                      {/* Right: Output exit beam line */}
                      <div 
                        className="absolute right-[-110px] w-24 h-0.5 pointer-events-none transition-all duration-300"
                        style={{
                          top: '52%',
                          backgroundColor: laserColor === 'red' ? '#f43f5e' : laserColor === 'green' ? '#10b981' : '#8b5cf6',
                          // exit beam gets attenuated if beam travels through cloudy Colloid/dense suspension
                          opacity: currentMix.type === 'larutan' 
                            ? (laserPower / 100) * 0.8
                            : currentMix.type === 'koloid' 
                            ? (laserPower / 100) * 0.38 
                            : (laserPower / 100) * 0.04, // barely exits suspension due to blocking
                          boxShadow: `0 0 6px ${laserColor === 'red' ? '#f43f5e' : laserColor === 'green' ? '#10b981' : '#8b5cf6'}`
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Small indicator label */}
                <div className={`text-center font-mono text-[10px] mt-2 border px-3.5 py-1.5 rounded-xl z-10 max-w-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                  {currentMix.name}: <span className="font-extrabold text-teal-450">{currentMix.subType}</span>
                </div>
              </div>

              {/* MICROSCOPIC VIEW COLLISION LAB SCREEN */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Microscope interactive Canvas Panel (60%) */}
                <div className={`md:col-span-7 p-4 border rounded-2xl space-y-3.5 ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-pink-400 animate-pulse" />
                      <h4 className="text-[10px] font-mono font-black uppercase text-pink-400 tracking-wider">Lensa Ultramikroskop Zoom (1.5M x)</h4>
                    </div>
                    {/* Speed regulator */}
                    <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-500">
                      <span>Gerak Brown:</span>
                      <span className="text-white font-bold">{brownianSpeed}ms</span>
                    </div>
                  </div>

                  <canvas 
                    ref={canvasRef} 
                    width={280} 
                    height={160} 
                    className="w-full bg-[#020617] rounded-xl border border-slate-900 shadow-inner"
                  />

                  {/* Micro speed controller */}
                  <div className="flex items-center gap-3">
                    <span className="text-[8.5px] font-mono text-zinc-500">BOMBARDIR THERMAL FLUIDA</span>
                    <input 
                      type="range"
                      min="5"
                      max="100"
                      value={brownianSpeed}
                      onChange={(e) => setBrownianSpeed(Number(e.target.value))}
                      className={`flex-1 accent-pink-500 h-1 rounded cursor-pointer ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}
                    />
                  </div>
                </div>

                {/* Description and Data Info Box (40%) */}
                <div className="md:col-span-5 flex flex-col justify-between p-5 bg-gradient-to-br from-slate-900/40 to-slate-950 border border-slate-850 rounded-2xl space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[10px] font-mono font-black text-emerald-400 border-b border-slate-900 pb-1.5 uppercase">
                      <span className="px-1 bg-emerald-500/10 border border-emerald-500/20 rounded mr-1">DATA</span>
                      <span>Sifat Fisik Campuran</span>
                    </div>

                    <div className="space-y-2 text-[11px] font-sans">
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500 font-mono">Ukuran Partikel:</span>
                        <span className="font-semibold text-white text-right">{currentMix.particleSize}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500 font-mono">Kestabilan:</span>
                        <span className="font-semibold text-slate-350 text-right">{currentMix.stability}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-900 pb-1">
                        <span className="text-slate-500 font-mono">Penyaringan:</span>
                        <span className="font-semibold text-slate-350 text-right">{currentMix.filterability}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-slate-500 font-mono">Fase Aktif:</span>
                        <span className="font-mono text-teal-400 font-bold">{currentMix.dispersedPhase.slice(0, 5)} / {currentMix.dispersionMedium.slice(0, 5)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="flex gap-2 text-[10.5px] leading-relaxed">
                      <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <p className="text-slate-400 font-sans">{currentMix.tyndallDescription}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bento Board: The 8 Colloid Classification Helper Card */}
              <div className={`p-5 border rounded-2xl space-y-3.5 ${theme === 'dark' ? 'bg-slate-900/20 border-slate-850' : 'bg-slate-100/20 border-slate-300'}`}>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-[10px] font-mono font-black uppercase text-indigo-400 tracking-wider">Tabel 8 Jenis Sistem Koloid Berdasarkan Fase &amp; Medium</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] font-mono text-slate-400 text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500">
                        <th className="py-2 pr-2">Fase Terdispersi</th>
                        <th className="py-2 px-2">Medium Pendispersi</th>
                        <th className="py-2 px-2">Nama Koloid</th>
                        <th className="py-2 px-2">Contoh Realistis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      <tr className={currentMix.subType.includes("Sol (Padat") ? "bg-indigo-500/10 text-indigo-300 font-bold" : ""}>
                        <td className="py-2 pr-2">Padat</td>
                        <td className="py-2 px-2">Cair</td>
                        <td className="py-2 px-2">Sol (Cair)</td>
                        <td className="py-2 px-2 text-white">Tinta, Sol Emas, Sol Fe(OH)₃, Cat</td>
                      </tr>
                      <tr className={currentMix.subType.includes("Sol Padat") ? "bg-indigo-500/10 text-indigo-300 font-bold" : ""}>
                        <td className="py-2 pr-2">Padat</td>
                        <td className="py-2 px-2">Padat</td>
                        <td className="py-2 px-2">Sol Padat</td>
                        <td className="py-2 px-2 text-white">Gelas Berwarna, Paduan Logam</td>
                      </tr>
                      <tr className={currentMix.subType.includes("Aerosol Padat") ? "bg-indigo-500/10 text-indigo-300 font-bold" : ""}>
                        <td className="py-2 pr-2">Padat</td>
                        <td className="py-2 px-2">Gas</td>
                        <td className="py-2 px-2">Aerosol Padat</td>
                        <td className="py-2 px-2 text-white">Asap, Debu di udara</td>
                      </tr>
                      <tr className={currentMix.subType.includes("Emulsi (Cair") ? "bg-indigo-500/10 text-indigo-300 font-bold" : ""}>
                        <td className="py-2 pr-2">Cair</td>
                        <td className="py-2 px-2">Cair</td>
                        <td className="py-2 px-2">Emulsi (Cair)</td>
                        <td className="py-2 px-2 text-white">Susu, Mayones, Santan, Minyak Ikan</td>
                      </tr>
                      <tr className={currentMix.subType.includes("Emulsi Padat") ? "bg-indigo-500/10 text-indigo-300 font-bold" : ""}>
                        <td className="py-2 pr-2">Cair</td>
                        <td className="py-2 px-2">Padat</td>
                        <td className="py-2 px-2">Emulsi Padat (Gel)</td>
                        <td className="py-2 px-2 text-white">Keju, Mentega, Jeli, Agar-agar</td>
                      </tr>
                      <tr className={currentMix.subType.includes("Aerosol Cair") ? "bg-indigo-500/10 text-indigo-300 font-bold" : ""}>
                        <td className="py-2 pr-2">Cair</td>
                        <td className="py-2 px-2">Gas</td>
                        <td className="py-2 px-2">Aerosol Cair</td>
                        <td className="py-2 px-2 text-white">Kabut, Awan, Hairspray obat nyamuk</td>
                      </tr>
                      <tr className={currentMix.subType.includes("Busa / Buih") ? "bg-indigo-500/10 text-indigo-300 font-bold" : ""}>
                        <td className="py-2 pr-2">Gas</td>
                        <td className="py-2 px-2">Cair</td>
                        <td className="py-2 px-2">Busa / Buih</td>
                        <td className="py-2 px-2 text-white">Busa Sabun, Krim Kocok (Whipped)</td>
                      </tr>
                      <tr className={currentMix.subType.includes("Busa Padat") ? "bg-indigo-500/10 text-indigo-300 font-bold" : ""}>
                        <td className="py-2 pr-2">Gas</td>
                        <td className="py-2 px-2">Padat</td>
                        <td className="py-2 px-2">Busa Padat</td>
                        <td className="py-2 px-2 text-white">Batu Apung, Styrofoam, Karet Busa</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            SEGMENT 2: COLLOID SYNTHESIS LABORATORY
            ========================================== */}
        {activeSegment === 'synthesis' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Control Synthetizer (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className={`p-5 border rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-350">Pengolahan &amp; Metode Pembuatan Colloid</h3>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-mono font-black uppercase">PILIH METODE LABORATORIUM</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    
                    <button
                      onClick={() => setSynthMethod('cond_hydrolysis')}
                      className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1 text-xs transition-all cursor-pointer ${
                        synthMethod === 'cond_hydrolysis'
                          ? 'bg-amber-400/10 border-amber-400/50 text-amber-300'
                          : 'bg-slate-900/20 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold">1. Hidrolisis FeCl₃ (Kondensasi)</span>
                        <span className="font-mono text-[8px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">KONDENSASI</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-normal">Pembuatan koloid dari molekul kecil dilarutkan lalu dikondensasikan menjadi partikel koloid.</p>
                    </button>

                    <button
                      onClick={() => setSynthMethod('cond_redox')}
                      className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1 text-xs transition-all cursor-pointer ${
                        synthMethod === 'cond_redox'
                          ? 'bg-amber-400/10 border-amber-400/50 text-amber-300'
                          : 'bg-slate-900/20 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold">2. Sol Belerang Tiosulfat (Redoks)</span>
                        <span className="font-mono text-[8px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">KONDENSASI</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-normal">Reaksi reduksi-oksidasi kimia melepaskan atom belerang bebas terdispersi koloid.</p>
                    </button>

                    <button
                      onClick={() => setSynthMethod('disp_peptization')}
                      className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1 text-xs transition-all cursor-pointer ${
                        synthMethod === 'disp_peptization'
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                          : 'bg-slate-900/20 border-slate-850 text-slate-400 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold">3. Peptisasi Al(OH)₃ (Dispersi)</span>
                        <span className="font-mono text-[8px] px-1.5 py-0.5 bg-indigo-500/15 text-indigo-400 rounded">DISPERSI</span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-normal">Menghancurkan gumpalan kaku makroskopis menjadi partikel halus dengan zat pelerai.</p>
                    </button>

                  </div>
                </div>
              </div>

              {/* Chemical Equations Box */}
              <div className={`p-5 border rounded-2xl space-y-3 ${theme === 'dark' ? 'bg-slate-900/20 border-slate-850' : 'bg-slate-100/20 border-slate-300'}`}>
                <h4 className="text-[10px] font-mono font-black text-rose-450 uppercase tracking-widest border-b border-slate-905 pb-1">
                  PERSAMAAN REAKSI KIMIA SINTESIS
                </h4>
                
                {synthMethod === 'cond_hydrolysis' && (
                  <div className="space-y-1.5 font-mono text-xs">
                    <p className="text-amber-300 font-bold">FeCl₃(aq) + 3 H₂O(l) → Fe(OH)₃(sol) + 3 HCl(aq)</p>
                    <p className="text-[10.5px] text-slate-500 font-sans leading-relaxed">
                      FeCl₃ terhidrolisis cepat dalam air mendidih. Ion besi (Fe³⁺) mengikat molekul air membentuk gugus nanometer besi(III) hidroksida bermuatan positif.
                    </p>
                  </div>
                )}

                {synthMethod === 'cond_redox' && (
                  <div className="space-y-1.5 font-mono text-xs">
                    <p className="text-amber-300 font-bold">Na₂S₂O₃(aq) + 2 HCl(aq) → 2 NaCl(aq) + H₂O(l) + SO₂(g) + S(sol)</p>
                    <p className="text-[10.5px] text-slate-500 font-sans leading-relaxed">
                      Gas SO₂ dan atom-atom dwi-belerang mengalami netralisasi melahirkan sol belerang berwarna kuning susu belerang koloid.
                    </p>
                  </div>
                )}

                {synthMethod === 'disp_peptization' && (
                  <div className="space-y-1.5 font-mono text-xs">
                    <p className="text-indigo-300 font-bold">Al(OH)₃(s) + Al³⁺(dari AlCl₃) → [Al(OH)₃] · Al³⁺(sol)</p>
                    <p className="text-[10.5px] text-slate-500 font-sans leading-relaxed">
                      Zat pelerai elektrostatik (AlCl₃) diserap kuat oleh dinding luar endapan Al(OH)₃ sehingga muatan kation sejenis pecah mengapung.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Interactive Lab Bench Graphic (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className={`p-6 border rounded-3xl relative flex flex-col items-center justify-center min-h-[360px] overflow-hidden ${theme === 'dark' ? 'bg-[#030712] border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/90 to-transparent pointer-events-none" />
                
                {/* Title */}
                <span className={`absolute top-4 left-4 text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded border shadow ${theme === 'dark' ? 'text-slate-400 bg-slate-950/80 border-slate-900' : 'text-slate-600 bg-slate-100/80 border-slate-300'}`}>
                  REAKTOR SINTESIS REAKSI KIMIA BENCH
                </span>

                {/* Hot plate / Bunsen visual burner underneath the beaker */}
                <div className="relative w-44 h-48 flex flex-col items-center justify-end z-10 select-none mt-4">
                  
                  {/* Beaker representing reaction */}
                  <div className="absolute inset-0 border-x-4 border-b-6 border-slate-300/40 rounded-b-2xl rounded-t-lg relative flex flex-col justify-end overflow-hidden shadow-inner w-36 h-40">
                    
                    {/* Liquid dynamic react color */}
                    <div 
                      className="w-full absolute bottom-0 left-0 right-0 transition-all duration-1000 flex flex-col justify-center items-center"
                      style={{ 
                        height: '70%', 
                        backgroundColor: synthBeakerColor,
                        boxShadow: `inset 0 -10px 25px rgba(0,0,0,0.3)`
                      }}
                    >
                      {/* Interactive coarse Al(OH)3 clumps to disintegrate */}
                      {synthMethod === 'disp_peptization' && (
                        <div className="absolute inset-0 overflow-hidden">
                          {synthClumps.map((cl, idx) => (
                            <div
                              key={idx}
                              className="absolute rounded-full border border-white/20 shadow-sm transition-all duration-[2000ms] ease-out"
                              style={{
                                left: `${cl.x}px`,
                                top: `${cl.y}px`,
                                width: `${cl.r * 2}px`,
                                height: `${cl.r * 2}px`,
                                backgroundColor: cl.color
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Vapor gas gelembung bubbles if boiling cond_hydrolysis */}
                      {synthMethod === 'cond_hydrolysis' && synthStep >= 2 && (
                        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-4 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/25 animate-bounce" />
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Milliliter calibrations */}
                    <div className="absolute right-2 top-4 flex flex-col items-end gap-5 text-[8px] font-mono text-zinc-650">
                      <span className="w-2 h-px bg-zinc-700" />
                      <span className="w-2 h-px bg-zinc-700" />
                      <span className="w-2 h-px bg-zinc-700" />
                    </div>
                  </div>

                  {/* Hot burner Bunsen fire model if heating up */}
                  {synthMethod === 'cond_hydrolysis' && synthStep >= 2 && (
                    <div className="absolute bottom-[-15px] flex flex-col items-center">
                      {/* Red plate stand burner */}
                      <div className="w-24 h-1.5 bg-zinc-800 rounded-full" />
                      {/* Fire sparks visual */}
                      <div className="flex gap-1.5 h-6 mt-0.5 animate-pulse">
                        <span className="w-2 h-5 bg-gradient-to-t from-red-500 to-amber-400 rounded-full" />
                        <span className="w-3.5 h-6 bg-gradient-to-t from-orange-600 to-yellow-450 rounded-full animate-bounce" />
                        <span className="w-2.5 h-4 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full" />
                      </div>
                    </div>
                  )}

                </div>

                {/* Step indicators row */}
                <div className={`flex items-center gap-1.5 mt-8 z-10 border p-2.5 rounded-2xl w-full max-w-sm justify-between ${theme === 'dark' ? 'bg-slate-900/90 border-slate-850' : 'bg-slate-100/90 border-slate-300'}`}>
                  <div className="flex gap-1 font-mono text-[9px] items-center">
                    <span className="text-zinc-500">PROGRES:</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono text-[8px] ${synthStep >= 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-500'}`}>1</span>
                    <span className="text-zinc-700">→</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono text-[8px] ${synthStep >= 2 ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-500'}`}>2</span>
                    <span className="text-zinc-700">→</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono text-[8px] ${synthStep >= 3 ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-500'}`}>3</span>
                    <span className="text-zinc-700">→</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono text-[8px] ${synthStep >= 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-500'}`}>✓</span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono">
                    Langkah <span className="font-extrabold text-white">{synthStep <= 3 ? synthStep : 3}</span> dari 3
                  </span>
                </div>

              </div>

              {/* Action area control trigger buttons */}
              <div className={`border p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                
                <div className="flex-1 text-left">
                  <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-widest block mb-0.5">NURATIVE ALUR EKSPERIMENT</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{synthNarrative}</p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    onClick={resetSynthExperiments}
                    className={`p-3 border rounded-xl transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900'}`}
                    title="Reset Reaktor"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={advanceSynthStep}
                    disabled={isSynthSimulating || synthStep > 3}
                    className="flex-1 sm:flex-initial px-5 py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {isSynthSimulating ? (
                      <>
                        <Activity className="w-3.5 h-3.5 animate-spin text-slate-950" />
                        <span>Reaksi Berjalan...</span>
                      </>
                    ) : (
                      <>
                        <span>{synthStep > 3 ? 'Eksperimen Selesai' : 'Mulai / Langkah Berikutnya'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==========================================
            SEGMENT 3: PROPERTIES EXPLORER PLAYGROUND
            ========================================== */}
        {activeSegment === 'properties' && (
          <div className="space-y-8">
            
            {/* Top Properties Subtabs buttons selection */}
            <div className={`flex max-w-sm p-0.5 rounded-xl border items-center justify-center gap-0.5 select-none text-[11px] font-mono shadow-inner ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
              <button
                onClick={() => setPropTab('electro')}
                className={`flex-1 py-1.5 rounded-lg font-bold uppercase tracking-wider text-center transition-all cursor-pointer leading-tight ${
                  propTab === 'electro' 
                    ? 'bg-slate-950 border border-slate-800 text-teal-400 font-extrabold shadow-md' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                Elektroforesis
              </button>
              <button
                onClick={() => setPropTab('coagulate')}
                className={`flex-1 py-1.5 rounded-lg font-bold uppercase tracking-wider text-center transition-all cursor-pointer leading-tight ${
                  propTab === 'coagulate' 
                    ? 'bg-slate-950 border border-slate-800 text-teal-400 font-extrabold shadow-md' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                Koagulasi
              </button>
              <button
                onClick={() => setPropTab('dialysis')}
                className={`flex-1 py-1.5 rounded-lg font-bold uppercase tracking-wider text-center transition-all cursor-pointer leading-tight ${
                  propTab === 'dialysis' 
                    ? 'bg-slate-950 border border-slate-800 text-teal-400 font-extrabold shadow-md' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                Dialisis
              </button>
            </div>

            {/* Sub-property layouts */}
            
            {/* PROPERTY 1: ELECTROPHORESIS */}
            {propTab === 'electro' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                
                {/* Left controls column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className={`p-5 border rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-teal-450 animate-pulse" />
                      <h4 className="text-xs font-mono font-black uppercase text-slate-300">Teori Elektroforesis Koloid</h4>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Partikel koloid memiliki lapisan listrik ganda yang bermuatan negatif atau positif di permukaannya. Jika sol dimasukkan ke pipa U dan dipasang beda potensial listrik (anode (+) dan katode (-)), partikel koloid bermuatan akan termigrasi/bergerak mengalir secara spesifik mengarah ke muatan elektrode yang berlawanan polaritas!
                    </p>

                    <div className={`p-3 rounded-xl space-y-2 border text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                      <p className="text-zinc-500 font-mono text-[9px] uppercase font-black">UJICOBA DENGAN JENIS KOLOID:</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setColloidTypeCharged('positive');
                            setElectroProgress(0);
                          }}
                          className={`flex-1 py-2 text-[10.5px] rounded-lg border font-semibold transition-all cursor-pointer uppercase ${
                            colloidTypeCharged === 'positive' 
                              ? 'bg-rose-500/10 border-rose-500 text-rose-450 font-bold' 
                              : 'bg-slate-900 text-zinc-500 border-zinc-900'
                          }`}
                        >
                          Fe(OH)₃ (Sol Bermuatan +)
                        </button>
                        <button
                          onClick={() => {
                            setColloidTypeCharged('negative');
                            setElectroProgress(0);
                          }}
                          className={`flex-1 py-1.5 text-[10.5px] rounded-lg border font-semibold transition-all cursor-pointer uppercase ${
                            colloidTypeCharged === 'negative' 
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' 
                              : 'bg-slate-900 text-zinc-500 border-zinc-900'
                          }`}
                        >
                          As₂S₃ / Lumpur (Sol Bermuatan -)
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setVoltageOn(!voltageOn)}
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                          voltageOn 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                        }`}
                      >
                        {voltageOn ? (
                          <>
                            <ZapOff className="w-4 h-4" />
                            <span>Matikan Tegangan Listrik (DC)</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 shrink-0" />
                            <span>Hubungkan Tegangan Listrik</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Interactive U-Tube animation (7 cols) */}
                <div className="lg:col-span-7 bg-[#020617] border border-slate-850 p-6 rounded-3xl relative flex flex-col items-center justify-center min-h-[300px]">
                  
                  {/* U-Tube model using pure SVG/div layout */}
                  <div className="relative w-72 h-44 flex items-center justify-center mt-6 select-none">
                    
                    {/* The Left Cathode (-) and Right Anode (+) labels */}
                    <div className="absolute top-0 left-4 text-center space-y-1">
                      <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-md font-mono font-bold text-[9px]">KATODE (-)</span>
                      <div className="w-1.5 h-12 bg-slate-500 border border-slate-400 mx-auto rounded shadow-inner relative flex justify-center">
                        {voltageOn && <div className="absolute inset-0 bg-sky-400/35 animate-pulse rounded" />}
                      </div>
                    </div>

                    <div className="absolute top-0 right-4 text-center space-y-1">
                      <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-md font-mono font-bold text-[9px]">ANODE (+)</span>
                      <div className="w-1.5 h-12 bg-slate-500 border border-slate-400 mx-auto rounded shadow-inner relative flex justify-center">
                        {voltageOn && <div className="absolute inset-0 bg-rose-400/35 animate-pulse rounded" />}
                      </div>
                    </div>

                    {/* U-Tube Fluid representation beaker curves */}
                    <div className="w-48 h-32 border-x-8 border-b-8 border-slate-300/40 rounded-b-[40px] absolute bottom-0 flex justify-between overflow-hidden">
                      
                      {/* Left Chamber fluid level */}
                      <div 
                        className="w-14 bg-gradient-to-t from-teal-900/30 transition-all duration-350"
                        style={{ 
                          height: '90%', 
                          backgroundColor: colloidTypeCharged === 'positive' 
                            ? `rgba(185, 28, 28, ${0.45 + (-electroProgress / 100)})` // Positives pack on cathode (Left)
                            : `rgba(234, 179, 8, ${0.45 - (electroProgress / 100)})`
                        }}
                      />

                      {/* Middle horizontal connecting tube */}
                      <div 
                        className="flex-1 self-end h-8 transition-all duration-350"
                        style={{ 
                          backgroundColor: colloidTypeCharged === 'positive' ? 'rgba(185, 28, 28, 0.45)' : 'rgba(234, 179, 8, 0.45)' 
                        }}
                      />

                      {/* Right Chamber fluid level */}
                      <div 
                        className="w-14 bg-gradient-to-t from-teal-900/30 transition-all duration-350"
                        style={{ 
                          height: '90%', 
                          backgroundColor: colloidTypeCharged === 'positive' 
                            ? `rgba(185, 28, 28, ${0.45 + (electroProgress / 100)})` // Negatives pack on anode (Right)
                            : `rgba(234, 179, 8, ${0.45 + (electroProgress / 100)})`
                        }}
                      />

                    </div>

                    {/* Charged particle moving icons */}
                    {voltageOn && (
                      <div className="absolute inset-x-12 bottom-12 h-10 pointer-events-none overflow-hidden">
                        <span 
                          className={`absolute w-2 h-2 rounded-full animate-ping ${colloidTypeCharged === 'positive' ? 'bg-rose-500' : 'bg-yellow-500'}`}
                          style={{
                            left: colloidTypeCharged === 'positive' ? '25%' : '75%',
                            transition: 'all 0.5s ease'
                          }}
                        />
                      </div>
                    )}

                  </div>

                  <div className={`mt-8 border p-3 rounded-2xl w-full text-center text-[11px] font-sans ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="font-bold text-teal-400">INFO EKSPERIMEN: </span>
                    {voltageOn ? (
                      colloidTypeCharged === 'positive'
                        ? 'Tegangan Terhubung! Sol Fe(OH)₃ yang bermuatan POSITIF mengalir menyeberang menuju Katode (-) di sebelah kiri yang sangat elektronegatif.'
                        : 'Tegangan Terhubung! Sol As₂S₃ bermuatan NEGATIF ditarik kuat menuju elektroda positif Anode (+) di sebelah kanan.'
                    ) : (
                      'Tegangan dinonaktifkan. Partikel tersuspensi tersebar merata secara difusi kinetik alami kembali.'
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* PROPERTY 2: COAGULATION WITH VALENCY */}
            {propTab === 'coagulate' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                
                {/* Left control panel (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className={`p-5 border rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-amber-400" />
                      <h4 className="text-xs font-mono font-black uppercase text-slate-300">Teori Koagulasi &amp; Aturan Schulze-Hardy</h4>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Stabilitas koloid terjaga oleh gaya tolak-menolak elektrostatik antarpartikel yang sejenis. Jika muatan di permukaan partikel koloid ini dinetralkan oleh ion dengan muatan berlawanan (dari garam dapur, kapur, dsb.), partikel tersebut akan berkondensasi saling bertumbukan membentuk makro-gumpalan yang mengendap (Koagulasi).
                    </p>

                    <div className={`p-4 rounded-xl border space-y-2.5 ${theme === 'dark' ? 'bg-slate-950/60 border-slate-900' : 'bg-slate-100/60 border-slate-300'}`}>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase font-black tracking-widest block">TAMBAHKAN ELEKTROLIT BERIKUT</span>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          onClick={() => triggerCoagulation('nacl')}
                          disabled={isCoagulatingAnim}
                          className={`w-full text-left p-3 border hover:bg-slate-850 text-xs rounded-xl flex items-center justify-between cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}
                        >
                          <span className="font-semibold text-sky-400">Natrium Klorida (NaCl)</span>
                          <span className="px-1.5 py-0.5 bg-sky-505/10 border border-sky-500/20 rounded font-mono text-[8px] text-sky-400">Na⁺ Kation</span>
                        </button>
                        <button
                          onClick={() => triggerCoagulation('cacl2')}
                          disabled={isCoagulatingAnim}
                          className={`w-full text-left p-3 border hover:bg-slate-850 text-xs rounded-xl flex items-center justify-between cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}
                        >
                          <span className="font-semibold text-amber-400">Kalsium Klorida (CaCl₂)</span>
                          <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded font-mono text-[8px] text-amber-400">Ca²⁺ Kation</span>
                        </button>
                        <button
                          onClick={() => triggerCoagulation('alcl3')}
                          disabled={isCoagulatingAnim}
                          className={`w-full text-left p-3 border hover:bg-slate-850 text-xs rounded-xl flex items-center justify-between cursor-pointer transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}
                        >
                          <span className="font-semibold text-rose-450">Aluminium Klorida (AlCl₃)</span>
                          <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-550/20 rounded font-mono text-[8px] text-rose-450 font-bold">Al³⁺ Kation</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={resetCoagulation}
                        className={`w-full py-2.5 border rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900'}`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Beaker Koloid</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Beaker of mud coagulation animation (7 cols) */}
                <div className={`lg:col-span-7 border p-6 rounded-3xl relative flex flex-col items-center justify-center min-h-[300px] ${theme === 'dark' ? 'bg-[#030712] border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                  
                  {/* Beaker with dynamic sediment generation */}
                  <div className="relative w-40 h-44 border-x-4 border-b-6 border-slate-300/40 rounded-b-2xl rounded-t-lg overflow-hidden flex flex-col justify-end shadow-inner mb-4">
                    
                    {/* Sedimentation visual */}
                    <div 
                      className="w-full absolute bottom-0 left-0 right-0 transition-all duration-1000 flex flex-col justify-end"
                      style={{ 
                        height: '75%', 
                        backgroundColor: coagSaltPower === 'none' 
                          ? 'rgba(120, 80, 50, 0.45)' // Stable brown colloid mud
                          : coagSaltPower === 'nacl'
                          ? 'rgba(120, 80, 50, 0.42)'
                          : coagSaltPower === 'cacl2'
                          ? 'rgba(120, 80, 50, 0.28)' // clearing water top
                          : 'rgba(120, 80, 50, 0.12)', // clear water top (Al3+ coagulates almost entirely)
                        boxShadow: `inset 0 -10px 20px rgba(0,0,0,0.4)`
                      }}
                    >
                      {/* Sediments piled up at bottom */}
                      {coagSaltPower !== 'none' && (
                        <div 
                          className="w-full bg-amber-950 border-t border-amber-800 transition-all duration-[3000ms] ease-out shadow-lg"
                          style={{
                            height: coagSaltPower === 'nacl' 
                              ? '8px' 
                              : coagSaltPower === 'cacl2' 
                              ? '22px' 
                              : '42px' // huge chunk sediment
                          }}
                        />
                      )}
                    </div>

                    <div className="absolute right-2 top-4 flex flex-col items-end gap-5 text-[8px] font-mono text-zinc-500 select-none">
                      <span className="w-2 h-px bg-zinc-650" />
                      <span className="w-2 h-px bg-zinc-650" />
                    </div>
                  </div>

                  <div className={`p-4 border rounded-2xl w-full space-y-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-widest block">RESPONS KOAGULASI</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{coagResult}</p>
                  </div>

                </div>

              </div>
            )}

            {/* PROPERTY 3: DIALYSIS RUNNING PURIFICATION */}
            {propTab === 'dialysis' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                
                {/* Left dialect column (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className={`p-5 border rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-100/40 border-slate-300'}`}>
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-indigo-400 animate-pulse" />
                      <h4 className="text-xs font-mono font-black uppercase text-slate-300">Teori Dialisis Koloid</h4>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Larutan koloid seringkali dinodai kontaminan zat terlarut ataupun ion kecil lain. Guna memurnikannya, cairan koloid dibungkus dalam kantong semipermeabel (semacam membran parchment/selofan) dan dicelupkan ke tangki air mengalir. Ion klorida (Cl⁻) dan kation (Na⁺) yang sangat kecil berdifusi bebas melewati pori halus membran keluar kantong, menyisakan partikel koloid murni tetap terperangkap steril di dalam kantong!
                    </p>

                    <div className={`p-3 rounded-xl space-y-1.5 border text-xs ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex justify-between items-center font-mono text-[9px] text-zinc-500">
                        <span>ION KONTAMINAN TERISOLASI</span>
                        <span className="text-white font-bold">{dialysisPureGrade} dari 10</span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                        <div 
                          className="bg-indigo-500 h-full transition-all duration-[1000ms] ease-out"
                          style={{ width: `${dialysisPureGrade * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => {
                          setDialysisPureGrade(10);
                          setDialysisActive(false);
                          setRunningWaterTimer(false);
                        }}
                        className={`p-3 border rounded-xl transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-900'}`}
                        title="Isi Ulang Impurities"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (dialysisPureGrade <= 0) return;
                          setDialysisActive(true);
                        }}
                        disabled={dialysisActive || dialysisPureGrade <= 0}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        {dialysisActive ? (
                          <>
                            <Activity className="w-3.5 h-3.5 animate-spin" />
                            <span>Difusi Berjalan...</span>
                          </>
                        ) : (
                          <>
                            <Waves className="w-3.5 h-3.5 animate-bounce" />
                            <span>Mulai Aliran Pemurnian</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right parchment bag dialysis interactive frame (7 cols) */}
                <div className="lg:col-span-7 bg-[#020617] border border-slate-850 p-6 rounded-3xl relative flex flex-col items-center justify-center min-h-[300px]">
                  
                  {/* Dynamic water tank containing the suspended dialysis capsule */}
                  <div className="relative w-56 h-48 border-x-4 border-b-6 border-sky-400/20 rounded-b-3xl rounded-t-lg bg-sky-950/10 flex flex-col items-center justify-center shadow-lg relative">
                    
                    {/* Running water flow visual effect */}
                    {runningWaterTimer && (
                      <div className="absolute inset-x-0 inset-y-0 overflow-hidden pointer-events-none opacity-40">
                        <span className="absolute left-2 top-0 bottom-0 w-1 bg-sky-400/20 rounded animate-pulse" />
                        <span className="absolute right-2 top-0 bottom-0 w-1 bg-sky-400/20 rounded animate-pulse" />
                        <span className="absolute left-1/4 top-0 w-px h-full bg-sky-450/10 animate-pulse" />
                      </div>
                    )}

                    {/* Semipermeable membrane pocket suspended in center */}
                    <div className={`w-24 h-32 border-4 border-indigo-400/50 rounded-b-full p-3 flex flex-col justify-center items-center shadow-2xl relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                      
                      {/* Capsule cap string hanger */}
                      <div className="absolute top-[-30px] w-0.5 h-8 bg-zinc-400" />
                      
                      {/* Starches / large colloid macromolecules (cannot escape bags) */}
                      <span className="w-3.5 h-3.5 rounded-full bg-teal-400/80 absolute top-8 left-6" />
                      <span className="w-4 h-4 rounded-full bg-teal-350/90 absolute top-14 right-6 animate-pulse" />
                      <span className="w-3 h-3 rounded-full bg-teal-400/85 absolute bottom-8 left-8" />
                      
                      {/* Escaping yellow small ions if purification active */}
                      {dialysisPureGrade > 0 && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 absolute top-10 right-8" />
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 absolute bottom-12 left-6" />
                          {dialysisActive && (
                            // escaping animation specks
                            <span className="w-1 h-1 rounded-full bg-yellow-300 absolute left-[-15px] top-1/2 animate-ping" />
                          )}
                        </>
                      )}
                    </div>

                    {/* Dispersing ions floating out in the tank water */}
                    {runningWaterTimer && (
                      <div className="absolute inset-x-0 inset-y-0 overflow-hidden pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 absolute left-4 bottom-12 animate-bounce" />
                        <span className="w-1 h-1 rounded-full bg-yellow-400 absolute right-6 top-16" />
                      </div>
                    )}

                  </div>

                  <div className={`mt-6 border p-3 rounded-xl w-full text-center text-[10.5px] font-sans ${theme === 'dark' ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-300'}`}>
                    {dialysisPureGrade > 0 ? (
                      dialysisActive ? (
                        <p className={`text-yellow-400 animate-pulse font-bold`}>
                          ⚠️ DIFUSI TERPANCAR AKTIF: Ion pengotor terlarut (Kuning) merembes bebas melompati kulit selofan membran, sementara dwi-partikel kanji koloid hijau raksasa terperangkap steril!
                        </p>
                      ) : (
                        <p className="text-slate-400">Siap dialisis. Tekan tombol untuk meluncurkan aliran air mendesak ion pengotor keluar membran.</p>
                      )
                    ) : (
                      <p className="text-emerald-400 font-bold">
                        ✓ PEMURNIAN SEMPURNA: Semua ion pengotor NaCl murni berasimilasi bebas lari terbawa air. Tersisa sediaan cairan koloid murni bermutu tinggi.
                      </p>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
