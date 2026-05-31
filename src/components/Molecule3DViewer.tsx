import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Orbit, RefreshCw, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface Molecule3DViewerProps {
  atoms: any[];
  bonds: any[];
  lonePairs: any[];
  dipoleDir: { x: number; y: number; z: number };
  dipoleVal: number;
  showLonePairs: boolean;
  showDipoles: boolean;
  isAutoRotating: boolean;
}

// Atom color database matching periodic table
const elementColors: { [key: string]: number } = {
  C: 0x3f3f46,  // Dark Zinc/Carbon
  O: 0xef4444,  // Red Oxygen
  H: 0xf4f4f5,  // White Hydrogen
  N: 0x3b82f6,  // Blue Nitrogen
  B: 0xec4899,  // Pink Boron
  F: 0x10b981,  // Green Fluorine
  P: 0xf97316,  // Orange Phosphorus
  S: 0xeab308,  // Yellow Sulfur
  Cl: 0x84cc16, // Lime Chlorine
};

export default function Molecule3DViewer({
  atoms,
  bonds,
  lonePairs,
  dipoleDir,
  dipoleVal,
  showLonePairs,
  showDipoles,
  isAutoRotating,
}: Molecule3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<boolean>(true);
  const requestFrameRef = useRef<number | null>(null);

  // Group references for dynamic rotation & animation
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const isAutoRotatingRef = useRef<boolean>(isAutoRotating);

  // Interactive local states for 3D navigation
  const [zoom, setZoom] = useState<number>(5.8); // maps to camera.position.z (closer zoom to fill viewport)
  const [autoRotateSpeed, setAutoRotateSpeed] = useState<number>(1.0); // 0.5x, 1x, 2.5x speed
  const [autoRotateAxis, setAutoRotateAxis] = useState<string>('Y'); // rotation axis: 'Y', 'X', 'Z', 'diagonal'
  const [showAxesIndicator, setShowAxesIndicator] = useState<boolean>(false); // 3D RGB Axes lines helper
  const [activePreset, setActivePreset] = useState<string>('iso'); // 'front', 'top', 'side', 'iso'

  // Sync states to mutable refs to prevent expensive WebGL context recreation
  const autoRotateSpeedRef = useRef<number>(1.0);
  const autoRotateAxisRef = useRef<string>('Y');
  const zoomRef = useRef<number>(5.8);
  const showAxesIndicatorRef = useRef<boolean>(false);
  const targetRotationRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0.2, y: 0.6, active: false });

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    autoRotateSpeedRef.current = autoRotateSpeed;
  }, [autoRotateSpeed]);

  useEffect(() => {
    autoRotateAxisRef.current = autoRotateAxis;
  }, [autoRotateAxis]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    showAxesIndicatorRef.current = showAxesIndicator;
  }, [showAxesIndicator]);

  // Handle preset cameras with custom interpolation target
  const handleResetCamera = () => {
    setActivePreset('iso');
    if (moleculeGroupRef.current) {
      const currentX = moleculeGroupRef.current.rotation.x;
      const currentY = moleculeGroupRef.current.rotation.y;
      
      const alignedY = currentY + Math.atan2(Math.sin(0.6 - currentY), Math.cos(0.6 - currentY));
      const alignedX = currentX + Math.atan2(Math.sin(0.2 - currentX), Math.cos(0.2 - currentX));

      targetRotationRef.current = {
        x: alignedX,
        y: alignedY,
        active: true
      };
    }
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    mountRef.current = true;
    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Set canvas parent dimensions
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 270;

    // 1. Initialize Scene, Camera, WebGLRenderer
    const scene = new THREE.Scene();
    
    // Perspective Camera: FOV=45, Aspect, Near=0.1, Far=100
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = zoomRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Setup Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Warm key light
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    // Cool rim fill light
    const dirLight2 = new THREE.DirectionalLight(0xb4e1ff, 0.45);
    dirLight2.position.set(-5, -3, -2);
    scene.add(dirLight2);

    // Highlight top specular direct spot
    const pointLight = new THREE.PointLight(0xffffff, 0.3, 20);
    pointLight.position.set(0, 4, 3);
    scene.add(pointLight);

    // 3. Setup Molecule Container Group
    const moleculeGroup = new THREE.Group();
    // Default pleasant diagonal isometric viewing angle
    moleculeGroup.rotation.set(0.2, 0.6, 0);
    scene.add(moleculeGroup);
    moleculeGroupRef.current = moleculeGroup;

    // Add Axes Helper colored lines (X=red, Y=green, Z=blue) for spatial learning
    const axesHelper = new THREE.AxesHelper(1.15);
    axesHelper.visible = showAxesIndicatorRef.current;
    scene.add(axesHelper);

    // Scale constant to bring coordinates down from screen coordinate domain - optimized to make sure elements are fully visible and clear
    const scale = 26.0;

    // Helper to draw single/double cylinders
    const buildBond = (p1: THREE.Vector3, p2: THREE.Vector3, type: 'single' | 'double' | 'triple') => {
      const direction = new THREE.Vector3().subVectors(p2, p1);
      const length = direction.length();
      const normDir = direction.clone().normalize();
      
      const bondMaterial = new THREE.MeshPhongMaterial({
        color: 0x5a5a65,
        shininess: 90,
        specular: 0x7a7a85,
      });

      if (type === 'double') {
        // Parallel bonds calculation
        let up = new THREE.Vector3(0, 0, 1);
        if (Math.abs(normDir.dot(up)) > 0.98) {
          up = new THREE.Vector3(1, 0, 0);
        }
        const perp = new THREE.Vector3().crossVectors(normDir, up).normalize();
        const offsetDist = 0.12;

        const doubleBondGroup = new THREE.Group();

        // Left cylinder
        const p1_a = p1.clone().addScaledVector(perp, offsetDist);
        const p2_a = p2.clone().addScaledVector(perp, offsetDist);
        const dir_a = p2_a.clone().sub(p1_a);
        const geom_a = new THREE.CylinderGeometry(0.045, 0.045, dir_a.length(), 16);
        const mesh_a = new THREE.Mesh(geom_a, bondMaterial);
        mesh_a.position.copy(p1_a).addScaledVector(dir_a, 0.5);
        mesh_a.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir_a.clone().normalize());
        doubleBondGroup.add(mesh_a);

        // Right cylinder
        const p1_b = p1.clone().addScaledVector(perp, -offsetDist);
        const p2_b = p2.clone().addScaledVector(perp, -offsetDist);
        const dir_b = p2_b.clone().sub(p1_b);
        const geom_b = new THREE.CylinderGeometry(0.045, 0.045, dir_b.length(), 16);
        const mesh_b = new THREE.Mesh(geom_b, bondMaterial);
        mesh_b.position.copy(p1_b).addScaledVector(dir_b, 0.5);
        mesh_b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir_b.clone().normalize());
        doubleBondGroup.add(mesh_b);

        return doubleBondGroup;
      } else {
        // Standard single cylinder bond
        const bondGeom = new THREE.CylinderGeometry(0.065, 0.065, length, 16);
        const bondMesh = new THREE.Mesh(bondGeom, bondMaterial);
        bondMesh.position.copy(p1).addScaledVector(direction, 0.5);
        bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normDir);
        return bondMesh;
      }
    };

    // Rebuild the visible mesh nodes inside the Group container
    const rebuildSceneMeshes = () => {
      // Clear current group elements
      while (moleculeGroup.children.length > 0) {
        const obj = moleculeGroup.children[0];
        moleculeGroup.remove(obj);
        obj.traverse((child: any) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      // Add Atom nodes
      const projectedMeshCenters: THREE.Vector3[] = [];
      atoms.forEach((atom) => {
        const x_scaled = atom.x / scale;
        const y_scaled = atom.y / scale;
        const z_scaled = atom.z / scale;
        const vec = new THREE.Vector3(x_scaled, y_scaled, z_scaled);
        projectedMeshCenters.push(vec);

        // Determine specific radius (0.1 radius per 4px radius)
        const atomicRadius = (atom.radius || 15) / 28.0;

        const sphereGeom = new THREE.SphereGeometry(atomicRadius, 32, 24);
        const elementColor = elementColors[atom.symbol] || 0xcccccc;
        const sphereMat = new THREE.MeshPhongMaterial({
          color: elementColor,
          shininess: 95,
          specular: 0x444444,
          flatShading: false,
        });

        const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
        sphereMesh.position.copy(vec);
        moleculeGroup.add(sphereMesh);
      });

      // Add Chemical Bond links
      bonds.forEach((bond) => {
        const p1 = projectedMeshCenters[bond.from];
        const p2 = projectedMeshCenters[bond.to];
        if (p1 && p2) {
          const bMesh = buildBond(p1, p2, bond.type);
          moleculeGroup.add(bMesh);
        }
      });

      // Add Lone Pair orbital lobes
      if (showLonePairs) {
        lonePairs.forEach((lp) => {
          const target = new THREE.Vector3(lp.x / scale, lp.y / scale, lp.z / scale);
          const centralLoc = projectedMeshCenters[0] || new THREE.Vector3(0, 0, 0);

          const lpGroup = new THREE.Group();

          // Lobe sphere
          const lobeGeom = new THREE.SphereGeometry(0.38, 32, 24);
          lobeGeom.scale(1, 1.5, 1); // stretch into teardrop shape
          const lobeMat = new THREE.MeshPhongMaterial({
            color: 0xa855f7, // purple hue for unshared pairs
            transparent: true,
            opacity: 0.42,
            shininess: 100,
            specular: 0xebf4ff,
            depthWrite: false,
          });
          const lobeMesh = new THREE.Mesh(lobeGeom, lobeMat);
          
          // Position lobe
          lobeMesh.position.copy(target);

          // Rotate lobe to point away from central atom
          const dirFromCentral = target.clone().sub(centralLoc).normalize();
          lobeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirFromCentral);
          lpGroup.add(lobeMesh);

          // Add two tiny electrons inside the lobe
          const electronGeom = new THREE.SphereGeometry(0.06, 12, 12);
          const electronMat = new THREE.MeshPhongMaterial({
            color: 0xd8b4fe,
            emissive: 0xa855f7,
            emissiveIntensity: 0.3,
          });

          const e1 = new THREE.Mesh(electronGeom, electronMat);
          const e2 = new THREE.Mesh(electronGeom, electronMat);

          e1.position.set(-0.12, 0.4, 0);
          e2.position.set(0.12, 0.4, 0);

          lobeMesh.add(e1);
          lobeMesh.add(e2);

          moleculeGroup.add(lpGroup);
        });
      }

      // Add Net Dipole Moment force arrow
      if (showDipoles && dipoleVal > 0) {
        const dDir = new THREE.Vector3(dipoleDir.x, dipoleDir.y, dipoleDir.z).normalize();
        const d_len = 1.6;

        const dGroup = new THREE.Group();

        const dipoleMat = new THREE.MeshPhongMaterial({
          color: 0xf59e0b, // Amber Gold
          emissive: 0xd97706,
          emissiveIntensity: 0.35,
          shininess: 100,
        });

        // Cylinder shaft
        const shaftGeom = new THREE.CylinderGeometry(0.045, 0.045, d_len - 0.3, 16);
        const shaftMesh = new THREE.Mesh(shaftGeom, dipoleMat);
        shaftMesh.position.copy(new THREE.Vector3(0, 0, 0)).addScaledVector(dDir, (d_len - 0.3) / 2);
        shaftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dDir);
        dGroup.add(shaftMesh);

        // Cone Head
        const coneGeom = new THREE.ConeGeometry(0.12, 0.35, 16);
        const coneMesh = new THREE.Mesh(coneGeom, dipoleMat);
        coneMesh.position.copy(new THREE.Vector3(0, 0, 0)).addScaledVector(dDir, d_len - 0.175);
        coneMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dDir);
        dGroup.add(coneMesh);

        // Positive charge indicator '+' sign cross line on structural tail
        const crossGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
        const crossMesh = new THREE.Mesh(crossGeom, dipoleMat);
        crossMesh.position.copy(new THREE.Vector3(0, 0, 0)).addScaledVector(dDir, 0.1);
        
        // Find a perpendicular vector for alignment cross
        let pVec = new THREE.Vector3(0, 0, 1);
        if (Math.abs(dDir.dot(pVec)) > 0.95) pVec = new THREE.Vector3(1, 0, 0);
        const normPerp = new THREE.Vector3().crossVectors(dDir, pVec).normalize();
        crossMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normPerp);
        dGroup.add(crossMesh);

        moleculeGroup.add(dGroup);
      }
    };

    // Initial build
    rebuildSceneMeshes();


    // 4. Custom Drag-to-Rotate Gesture Listeners (Mouse & Touch) featuring Kinematic Momentum
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let velocityX = 0;
    let velocityY = 0;
    let lastMoveTime = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      targetRotationRef.current.active = false; // Immediately disable camera preset animation on user interaction
      setActivePreset(''); // Clear preset identifier
      prevMousePos = { x: e.clientX, y: e.clientY };
      velocityX = 0;
      velocityY = 0;
      lastMoveTime = performance.now();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime); // Prevent division by zero
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;

      moleculeGroup.rotation.y += dx * 0.008;
      moleculeGroup.rotation.x += dy * 0.008;

      // Track drag momentum
      velocityX = dx / dt;
      velocityY = dy / dt;

      prevMousePos = { x: e.clientX, y: e.clientY };
      lastMoveTime = now;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseLeave = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      isDragging = true;
      targetRotationRef.current.active = false;
      setActivePreset('');
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      velocityX = 0;
      velocityY = 0;
      lastMoveTime = performance.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      const dx = e.touches[0].clientX - prevMousePos.x;
      const dy = e.touches[0].clientY - prevMousePos.y;

      moleculeGroup.rotation.y += dx * 0.01;
      moleculeGroup.rotation.x += dy * 0.01;

      // Track touch drag momentum
      velocityX = dx / dt;
      velocityY = dy / dt;

      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastMoveTime = now;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    // Attach listeners strictly to the canvas element
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    // 5. Continuous Frame-Rendering & Animation Loop
    const animate = () => {
      if (!mountRef.current) return;

      // Update camera distance dynamically (Zoom)
      camera.position.z = zoomRef.current;

      // Sync 3D Coordinate axes visibility
      axesHelper.visible = showAxesIndicatorRef.current;

      if (isDragging) {
        // Friction dampener during active dragging
        velocityX *= 0.95;
        velocityY *= 0.95;
      } else {
        // Handle target camera presets transitions
        if (targetRotationRef.current.active) {
          const diffX = targetRotationRef.current.x - moleculeGroup.rotation.x;
          const diffY = targetRotationRef.current.y - moleculeGroup.rotation.y;

          moleculeGroup.rotation.x += diffX * 0.12;
          moleculeGroup.rotation.y += diffY * 0.12;

          if (Math.abs(diffX) < 0.001 && Math.abs(diffY) < 0.001) {
            moleculeGroup.rotation.x = targetRotationRef.current.x;
            moleculeGroup.rotation.y = targetRotationRef.current.y;
            targetRotationRef.current.active = false;
          }
          velocityX = 0;
          velocityY = 0;
        } else {
          // If no dragging & no active camera preset transition, apply decay physics or auto-rotation
          const absV_x = Math.abs(velocityX);
          const absV_y = Math.abs(velocityY);

          if (absV_x > 0.001 || absV_y > 0.001) {
            // High-precision rolling glide based on release kinetic velocities
            moleculeGroup.rotation.y += velocityX * 7.5;
            moleculeGroup.rotation.x += velocityY * 7.5;
            // Apply air friction / inertia speed decay
            velocityX *= 0.93;
            velocityY *= 0.93;
          } else if (isAutoRotatingRef.current) {
            const speedMultiplier = autoRotateSpeedRef.current;
            const chosenAxis = autoRotateAxisRef.current;

            if (chosenAxis === 'Y') {
              moleculeGroup.rotation.y += 0.006 * speedMultiplier;
            } else if (chosenAxis === 'X') {
              moleculeGroup.rotation.x += 0.006 * speedMultiplier;
            } else if (chosenAxis === 'Z') {
              moleculeGroup.rotation.z += 0.006 * speedMultiplier;
            } else {
              // Diagonal compound rotation speeds
              moleculeGroup.rotation.y += 0.004 * speedMultiplier;
              moleculeGroup.rotation.x += 0.003 * speedMultiplier;
              moleculeGroup.rotation.z += 0.002 * speedMultiplier;
            }
          }
        }
      }

      renderer.render(scene, camera);
      requestFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 6. Responsive Dynamic Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!mountRef.current || entries.length === 0) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      const w = Math.max(newWidth, 100);
      const h = Math.max(newHeight, 100);

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Return Cleanup context
    return () => {
      mountRef.current = false;
      resizeObserver.disconnect();
      if (requestFrameRef.current) cancelAnimationFrame(requestFrameRef.current);

      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);

      scene.traverse((obj: any) => {
        if (obj.isMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, [atoms, bonds, lonePairs, dipoleDir, dipoleVal, showLonePairs, showDipoles]);

  return (
    <div id="molecule-3d-viewport" ref={containerRef} className="w-full h-full relative group bg-zinc-950/40 select-none molecule-3d-viewport">
      {/* 3D WebGL Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none block"
      />
      
      {/* Visual Overlay Status Tag */}
      <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-1 opacity-50 text-[8px] font-mono text-zinc-400 bg-zinc-950/80 px-1.5 py-0.5 rounded transition group-hover:opacity-85">
        <Orbit className="w-3 h-3 text-cyan-400 animate-spin-slow" />
        WebGL Engine Aktif
      </div>

      {/* Preset Camera reset */}
      <button
        onClick={handleResetCamera}
        type="button"
        className="absolute top-2.5 right-2.5 p-1 rounded bg-zinc-950/80 border border-zinc-800 text-[9px] font-mono text-zinc-400 hover:text-white transition opacity-0 group-hover:opacity-100 flex items-center gap-1 cursor-pointer"
        title="Reset ke posisi isometrik"
      >
        <RefreshCw className="w-2.5 h-2.5" /> Reset
      </button>

      {/* Floating Interactive 3D Control overlay panel */}
      <div className="absolute bottom-2.5 inset-x-2.5 flex flex-wrap justify-between items-center gap-2 pointer-events-none z-20">
        
        {/* Left HUD: Interactive zooming & 3D Axes toggle */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1 bg-zinc-950/85 backdrop-blur-xs border border-zinc-900/90 rounded-lg p-0.5 shadow-lg shadow-black/40">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(4, z - 0.8))}
              className="p-1 rounded text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900/60 transition active:scale-95 cursor-pointer"
              title="Perbesar Kamera (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] font-mono text-zinc-500 px-1 font-bold select-none">{((8 / zoom) * 100).toFixed(0)}%</span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(13, z + 0.8))}
              className="p-1 rounded text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900/60 transition active:scale-95 cursor-pointer"
              title="Perkecil Kamera (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAxesIndicator(prev => !prev)}
            className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-lg shadow-black/40 bg-zinc-950/85 backdrop-blur-xs cursor-pointer ${
              showAxesIndicator 
                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30' 
                : 'border-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
            title="Sumbu XYZ Spasial (X=Merah, Y=Hijau, Z=Biru)"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">XYZ</span>
          </button>
        </div>

        {/* Right HUD: Camera preset angles and Auto-rotation tweaking */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          
          {/* Preset buttons */}
          <div className="bg-zinc-950/85 backdrop-blur-xs border border-zinc-900 rounded-lg p-0.5 flex gap-1 items-center shadow-lg shadow-black/40 text-[9px] font-mono font-bold text-zinc-500">
            <span className="text-[7.5px] uppercase font-black px-1.5 border-r border-zinc-850 text-zinc-500 hidden md:inline select-none">Sudut:</span>
            {[
              { id: 'front', label: 'Depan', rx: 0, ry: 0 },
              { id: 'top', label: 'Atas', rx: Math.PI / 2, ry: 0 },
              { id: 'side', label: 'Samping', rx: 0, ry: Math.PI / 2 },
              { id: 'iso', label: 'Iso', rx: 0.2, ry: 0.6 }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePreset(p.id);
                  if (moleculeGroupRef.current) {
                    const currentX = moleculeGroupRef.current.rotation.x;
                    const currentY = moleculeGroupRef.current.rotation.y;
                    
                    // Aligns wrapped target metrics
                    const alignedY = currentY + Math.atan2(Math.sin(p.ry - currentY), Math.cos(p.ry - currentY));
                    const alignedX = currentX + Math.atan2(Math.sin(p.rx - currentX), Math.cos(p.rx - currentX));
                    
                    targetRotationRef.current = {
                      x: alignedX,
                      y: alignedY,
                      active: true
                    };
                  }
                }}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer text-[8.5px] ${
                  activePreset === p.id 
                    ? 'bg-cyan-500/15 text-cyan-400 font-extrabold border border-cyan-500/35' 
                    : 'hover:text-white hover:bg-zinc-900 border border-transparent text-zinc-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Speed & Custom Axis Selection */}
          <div className="bg-zinc-950/85 backdrop-blur-xs border border-zinc-900 rounded-lg p-0.5 flex gap-1 items-center shadow-lg shadow-black/40 text-[9px] font-mono">
            <span className="text-[7.5px] text-zinc-500 uppercase font-black px-1.5 border-r border-zinc-850 hidden md:inline select-none">Laju:</span>
            
            {/* Speed triggers */}
            {[
              { multiplier: 0.5, label: '0.5x' },
              { multiplier: 1.0, label: '1x' },
              { multiplier: 2.5, label: '2.5x' }
            ].map((s) => (
              <button
                key={s.multiplier}
                type="button"
                onClick={() => setAutoRotateSpeed(s.multiplier)}
                className={`px-1 rounded text-[8.5px] transition cursor-pointer ${
                  autoRotateSpeed === s.multiplier 
                    ? 'bg-yellow-500/15 text-yellow-500 font-extrabold border border-yellow-500/20' 
                    : 'hover:text-white hover:bg-zinc-900 border border-transparent text-zinc-400'
                }`}
              >
                {s.label}
              </button>
            ))}

            {/* Custom Axis select box */}
            <select
              value={autoRotateAxis}
              onChange={(e) => setAutoRotateAxis(e.target.value)}
              className="bg-zinc-900 border border-zinc-850 rounded px-1 py-0.5 text-[8.5px] font-bold text-zinc-400 hover:text-white focus:outline-none cursor-pointer outline-none ml-1 shadow-sm"
              title="Pilih sumbu auto-rotasi interaktif"
            >
              <option value="Y">Sumbu Y</option>
              <option value="X">Sumbu X</option>
              <option value="Z">Sumbu Z</option>
              <option value="diagonal">Diag</option>
            </select>
          </div>

        </div>

      </div>

    </div>
  );
}
