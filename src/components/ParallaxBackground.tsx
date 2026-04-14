import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────────────
   ParallaxBackground — Milky Way, dual-layer intra-galaxy parallax
   Mobile-optimised: ~65% fewer particles, no antialias, pixel ratio 1.0,
   wider FOV, touch input, no Lissajous / banking.
   ───────────────────────────────────────────────────────────────────────── */

export default function ParallaxBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ─── Mobile detection ─────────────────────────────────────────────────────
    // All performance budgets scale off this flag.
    const isMobile = window.innerWidth < 768;
    const PM = isMobile ? 0.35 : 1.0; // particle-count multiplier

    // ─── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,  // antialias is expensive on mobile GPUs
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Mobile: hard-cap at 1.0 — halves fragment fill on retina displays
    renderer.setPixelRatio(
      isMobile
        ? Math.min(window.devicePixelRatio, 1.0)
        : Math.min(window.devicePixelRatio, 1.5),
    );
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ─── Scene / Camera ───────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    // Mobile: wider FOV (65°) + camera further back (z=18) so galaxy fits portrait screens
    // Desktop: FOV 55°, z=15 for the dramatic close-up
    const camera = new THREE.PerspectiveCamera(
      isMobile ? 65 : 55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, isMobile ? 1.8 : 2.5, isMobile ? 18 : 15);
    camera.lookAt(0, 0, 0);

    // ─── 1. Star fields (4-layer parallax) ───────────────────────────────────
    function makeStarField(
      count: number, spread: number, size: number,
      color: number, opacity: number,
      zStart = -10, zRange = 22,
    ): THREE.Points {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.55;
        pos[i * 3 + 2] = zStart - Math.random() * zRange;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        color, size, transparent: true, opacity,
        sizeAttenuation: true, depthWrite: false,
      }));
    }
    // Counts scale with PM — mobile gets ~35% of desktop particles
    const starsDeep = makeStarField(Math.round(6500 * PM), 200, 0.009, 0xb8ccff, 0.38, -18, 55);
    const starsFar  = makeStarField(Math.round(3500 * PM), 115, 0.013, 0xc0dcff, 0.65, -12, 28);
    const starsMid  = makeStarField(Math.round(1800 * PM),  68, 0.024, 0x90d4ff, 0.78,  -6, 16);
    const starsNear = makeStarField(Math.round(620  * PM),  42, 0.052, 0x7bdcff, 0.92,  -2, 10);
    scene.add(starsDeep, starsFar, starsMid, starsNear);

    // ─── 2. Nebula glow sprites ───────────────────────────────────────────────
    // Lower texture resolution on mobile (128 vs 256) — halves canvas work
    function makeGlowTex(innerColor: string): THREE.CanvasTexture {
      const res = isMobile ? 128 : 256;
      const c = document.createElement('canvas');
      c.width = res; c.height = res;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(res / 2, res / 2, 0, res / 2, res / 2, res / 2);
      g.addColorStop(0,    innerColor);
      g.addColorStop(0.45, innerColor.replace(/[\d.]+\)$/, '0.22)'));
      g.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, res, res);
      return new THREE.CanvasTexture(c);
    }

    type NebEntry = { sprite: THREE.Sprite; base: THREE.Vector3 };
    const nebEntries: NebEntry[] = [];
    const nebGroup = new THREE.Group();
    (
      [
        { col: 'rgba(15,70,150,1)',  pos: [-10,  4, -26] as [number, number, number], sc: 14, op: 0.12 },
        { col: 'rgba(90,15,190,1)',  pos: [  11, -5, -32] as [number, number, number], sc: 16, op: 0.09 },
        { col: 'rgba(0,150,200,1)', pos: [   2,  8, -38] as [number, number, number], sc: 18, op: 0.07 },
        { col: 'rgba(150,15,95,1)', pos: [  -9, -4, -28] as [number, number, number], sc: 12, op: 0.07 },
      ]
    ).forEach(({ col, pos, sc, op }) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlowTex(col), transparent: true, opacity: op,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      sp.position.set(pos[0], pos[1], pos[2]);
      sp.scale.setScalar(sc);
      nebEntries.push({ sprite: sp, base: sp.position.clone() });
      nebGroup.add(sp);
    });
    scene.add(nebGroup);

    // ─── 3. Milky Way Galaxy — dual-layer depth parallax ─────────────────────
    const CORE_R = 2.8;
    const MAX_R  = 6.5;

    const galaxyParent = new THREE.Group();
    galaxyParent.position.set(0, -1.2, -2);
    // Scale down on mobile so spiral arms don't clip portrait edges
    if (isMobile) galaxyParent.scale.setScalar(0.80);
    scene.add(galaxyParent);

    const galaxyCore = new THREE.Group();
    const galaxyDisk = new THREE.Group();
    galaxyParent.add(galaxyCore, galaxyDisk);

    function gauss(mean = 0, std = 1): number {
      const u = Math.max(Math.random(), 1e-9);
      return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
    }

    function starColor(f: number): [number, number, number] {
      const t = Math.min(Math.max(f, 0), 1);
      if (t < 0.18) {
        const s = t / 0.18;
        return [1.0, THREE.MathUtils.lerp(0.62, 0.90, s), THREE.MathUtils.lerp(0.22, 0.72, s)];
      } else if (t < 0.42) {
        const s = (t - 0.18) / 0.24;
        return [1.0, THREE.MathUtils.lerp(0.90, 0.96, s), THREE.MathUtils.lerp(0.72, 0.96, s)];
      } else if (t < 0.70) {
        const s = (t - 0.42) / 0.28;
        return [THREE.MathUtils.lerp(0.96, 0.68, s), THREE.MathUtils.lerp(0.96, 0.82, s), 1.0];
      } else {
        const s = (t - 0.70) / 0.30;
        return [THREE.MathUtils.lerp(0.68, 0.35, s), THREE.MathUtils.lerp(0.82, 0.52, s), 1.0];
      }
    }

    // Buffer capacities scale with PM
    const CORE_CAP = isMobile ? 7000  : 18000;
    const DISK_CAP = isMobile ? 9000  : 32000;
    const cPos = new Float32Array(CORE_CAP * 3);
    const cCol = new Float32Array(CORE_CAP * 3);
    let cN = 0;
    const dPos = new Float32Array(DISK_CAP * 3);
    const dCol = new Float32Array(DISK_CAP * 3);
    let dN = 0;

    function emit(x: number, y: number, z: number, r: number) {
      const [rc, gc, bc] = starColor(r / MAX_R);
      const brt = 0.45 + Math.random() * 0.55;
      if (r < CORE_R) {
        if (cN >= CORE_CAP) return;
        cPos[cN * 3] = x; cPos[cN * 3 + 1] = y; cPos[cN * 3 + 2] = z;
        cCol[cN * 3] = rc * brt; cCol[cN * 3 + 1] = gc * brt; cCol[cN * 3 + 2] = bc * brt;
        cN++;
      } else {
        if (dN >= DISK_CAP) return;
        dPos[dN * 3] = x; dPos[dN * 3 + 1] = y; dPos[dN * 3 + 2] = z;
        dCol[dN * 3] = rc * brt; dCol[dN * 3 + 1] = gc * brt; dCol[dN * 3 + 2] = bc * brt;
        dN++;
      }
    }

    // ── Bulge ──────────────────────────────────────────────────────────────────
    for (let i = 0; i < Math.round(5000 * PM); i++) {
      const r  = Math.abs(gauss(0, 0.9));
      const th = Math.random() * Math.PI * 2;
      const ph = gauss(0, 0.28);
      emit(
        r * Math.cos(th) * Math.cos(ph),
        r * Math.sin(ph) * 0.50,
        r * Math.sin(th) * Math.cos(ph),
        r,
      );
    }

    // ── Galactic bar ───────────────────────────────────────────────────────────
    for (let i = 0; i < Math.round(2800 * PM); i++) {
      const x = gauss(0, 2.1);
      const y = gauss(0, 0.11);
      const z = gauss(0, 0.42);
      emit(x, y, z, Math.sqrt(x * x + z * z));
    }

    // ── Spiral arms (logarithmic) ──────────────────────────────────────────────
    const ARM_R0 = 0.80;
    const ARM_B  = 0.22;
    [
      { offset: 0,             n: Math.round(9500 * PM), major: true  },
      { offset: Math.PI,       n: Math.round(9500 * PM), major: true  },
      { offset: Math.PI / 2,   n: Math.round(3800 * PM), major: false },
      { offset: Math.PI * 1.5, n: Math.round(3800 * PM), major: false },
    ].forEach(({ offset, n, major }) => {
      const scW = major ? 1.0 : 1.35;
      for (let i = 0; i < n; i++) {
        const frac    = Math.pow(Math.random(), 0.72);
        const theta   = 0.18 + frac * 2.75 * Math.PI;
        const r_spine = ARM_R0 * Math.exp(ARM_B * theta);
        if (r_spine > MAX_R * 1.12) continue;
        const angle      = offset + theta;
        const radScatter = gauss(0, 0.17 * scW * (0.45 + r_spine / MAX_R));
        const r          = Math.max(0.12, r_spine + radScatter);
        const angJitter  = gauss(0, 0.055 / Math.max(r_spine, 0.5) * scW);
        const x = r * Math.cos(angle + angJitter);
        const z = r * Math.sin(angle + angJitter);
        const y = gauss(0, 0.048 * (0.75 + r_spine / MAX_R));
        const dist = Math.sqrt(x * x + z * z);
        if (dist > MAX_R * 1.15) continue;
        emit(x, y, z, dist);
      }
    });

    // ── Outer diffuse disk ─────────────────────────────────────────────────────
    for (let i = 0; i < Math.round(3500 * PM); i++) {
      const r  = MAX_R * (0.38 + Math.random() * 0.68);
      const th = Math.random() * Math.PI * 2;
      emit(r * Math.cos(th), gauss(0, 0.10), r * Math.sin(th), r);
    }

    // ── Build geometries ───────────────────────────────────────────────────────
    const mkPts = (posSlice: Float32Array, colSlice: Float32Array, size: number, opacity: number) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(posSlice, 3));
      geo.setAttribute('color',    new THREE.BufferAttribute(colSlice, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        vertexColors: true, size, sizeAttenuation: true,
        transparent: true, opacity, depthWrite: false,
        blending: THREE.AdditiveBlending,
      }));
    };
    galaxyCore.add(mkPts(cPos.slice(0, cN * 3), cCol.slice(0, cN * 3), 0.040, 0.92));
    galaxyDisk.add(mkPts(dPos.slice(0, dN * 3), dCol.slice(0, dN * 3), 0.030, 0.85));

    // ── Bright star overlay ────────────────────────────────────────────────────
    const BRIGHT = Math.round(190 * PM);
    const bPos = new Float32Array(BRIGHT * 3);
    const bCol = new Float32Array(BRIGHT * 3);
    for (let i = 0; i < BRIGHT; i++) {
      const r  = Math.random() * MAX_R * 0.96;
      const th = Math.random() * Math.PI * 2;
      bPos[i * 3]     = r * Math.cos(th);
      bPos[i * 3 + 1] = (Math.random() - 0.5) * 0.22;
      bPos[i * 3 + 2] = r * Math.sin(th);
      const [rc, gc, bc] = starColor(r / MAX_R);
      bCol[i * 3] = rc; bCol[i * 3 + 1] = gc; bCol[i * 3 + 2] = bc;
    }
    galaxyDisk.add(mkPts(bPos, bCol, 0.095, 1.0));

    // ── Central core-glow sprite ───────────────────────────────────────────────
    {
      const res = isMobile ? 128 : 256;
      const c = document.createElement('canvas');
      c.width = res; c.height = res;
      const ctx = c.getContext('2d')!;
      const half = res / 2;
      const g = ctx.createRadialGradient(half, half, 0, half, half, half);
      g.addColorStop(0.00, 'rgba(255,245,210,1.0)');
      g.addColorStop(0.07, 'rgba(255,210,130,0.92)');
      g.addColorStop(0.18, 'rgba(210,150,80,0.58)');
      g.addColorStop(0.40, 'rgba(100,60,210,0.20)');
      g.addColorStop(0.65, 'rgba(40,25,130,0.07)');
      g.addColorStop(1.00, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, res, res);
      const mat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c), transparent: true,
        opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(3.4, 3.4, 1);
      galaxyCore.add(sp);
      (galaxyCore as THREE.Group & { _glowMat: THREE.SpriteMaterial })._glowMat = mat;
    }

    // ─── Input tracking ───────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const sm    = { x: 0, y: 0 };
    let scrollY = 0;

    const onMM = (e: MouseEvent) => {
      mouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    // Touch: use first touch point the same way as mouse
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      mouse.x =  (t.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = -(t.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScr = () => { scrollY = window.scrollY; };
    const onRes = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMM);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('scroll',    onScr, { passive: true });
    window.addEventListener('resize',    onRes);

    // ─── Animation loop ───────────────────────────────────────────────────────
    let rafId: number;
    let clock = 0;

    // Precompute camera Y base (constant)
    const CAM_Y = isMobile ? 1.8 : 2.5;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      clock += 0.006;

      // Touch input is jerkier — smoother easing on mobile prevents jitter
      const ease = isMobile ? 0.06 : 0.04;
      sm.x += (mouse.x - sm.x) * ease;
      sm.y += (mouse.y - sm.y) * ease;

      const scroll = Math.min(scrollY * 0.00052, 5.5);

      // ── Stars: 4-layer parallax ───────────────────────────────────────────
      starsDeep.position.set(sm.x * 0.04,  sm.y * 0.04  - scroll * 0.12, 0);
      starsFar.position.set( sm.x * 0.12,  sm.y * 0.12  - scroll * 0.40, 0);
      starsMid.position.set( sm.x * 0.38,  sm.y * 0.38  - scroll * 1.10, 0);
      starsNear.position.set(sm.x * 0.85,  sm.y * 0.85  - scroll * 2.40, 0);

      // ── Galaxy: cinematic 3-axis scroll arc ──────────────────────────────
      const s = scroll / 5.5;

      galaxyParent.rotation.y += 0.00018 + sm.x * 0.00060;

      const swingX = Math.sin(s * Math.PI) * (Math.PI * 0.48);
      const targetRotX = 0.28 + swingX - sm.y * 0.14;
      galaxyParent.rotation.x += (targetRotX - galaxyParent.rotation.x) * 0.028;

      galaxyParent.rotation.z = Math.sin(s * Math.PI) * 0.28;

      galaxyParent.position.x =  Math.sin(s * Math.PI * 0.85) * 1.4;
      galaxyParent.position.y = -1.2 + Math.sin(s * Math.PI) * 1.7 - s * 0.3;
      galaxyParent.position.z = -2.0
        + Math.sin(Math.min(s * Math.PI * 1.1, Math.PI)) * 3.8
        - s * 5.5;

      // ── Intra-galaxy depth parallax ───────────────────────────────────────
      galaxyCore.position.x = sm.x * 0.10;
      galaxyCore.position.y = sm.y * 0.07;
      galaxyDisk.position.x = sm.x * 0.28;
      galaxyDisk.position.y = sm.y * 0.18;

      // ── Core glow breathing ───────────────────────────────────────────────
      const glowMat = (galaxyCore as THREE.Group & { _glowMat?: THREE.SpriteMaterial })._glowMat;
      if (glowMat) glowMat.opacity = 0.72 + 0.20 * Math.sin(clock * 0.9);

      // ── Nebulae ───────────────────────────────────────────────────────────
      nebEntries.forEach(({ sprite, base }, i) => {
        const f = 0.022 + i * 0.006;
        sprite.position.x = base.x + sm.x * f * 9;
        sprite.position.y = base.y + sm.y * f * 9 - scroll * (0.07 + i * 0.025);
      });

      // ── Camera ────────────────────────────────────────────────────────────
      if (isMobile) {
        // Mobile: clean mouse parallax only — no Lissajous, no banking
        // Saves matrix computation and prevents motion sickness on small screens
        camera.position.x = sm.x * 0.40;
        camera.position.y = CAM_Y + sm.y * 0.30;
      } else {
        // Desktop: Lissajous figure-8 drift + mouse (feels weightless)
        camera.position.x = sm.x * 0.40 + Math.sin(clock * 0.18) * 0.22;
        camera.position.y = CAM_Y + sm.y * 0.30 + Math.cos(clock * 0.13) * 0.14;
      }
      camera.lookAt(0, 0, 0);
      // Banking roll — desktop only (rotation.z after lookAt)
      if (!isMobile) camera.rotation.z = -sm.x * 0.048;

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove',  onMM);
      window.removeEventListener('touchmove',  onTouch);
      window.removeEventListener('scroll',     onScr);
      window.removeEventListener('resize',     onRes);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
