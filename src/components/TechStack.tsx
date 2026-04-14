import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  BallCollider,
  Physics,
  RigidBody,
  RapierRigidBody,
} from "@react-three/rapier";

/* ──────────────────────────────────────────────────────────────────────────
   Tech items — all 21 skills from the resume
   ────────────────────────────────────────────────────────────────────────── */
type TechItem = { label: string; logo: string; dark: boolean; accent: string };

const techItems: TechItem[] = [
  { label: "Python",         logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",               dark: false, accent: "#3776AB" },
  { label: "C/C++",          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",          dark: false, accent: "#00599C" },
  { label: "Java",           logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",                   dark: false, accent: "#ED8B00" },
  { label: "SQL",            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",                 dark: false, accent: "#4479A1" },
  { label: "Bash",           logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",                   dark: true,  accent: "#4EAA25" },
  { label: "Linux",          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",                 dark: false, accent: "#FCC624" },
  { label: "Ubuntu",         logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-original.svg",               dark: false, accent: "#E95420" },
  { label: "Fedora",         logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fedora/fedora-original.svg",               dark: false, accent: "#51A2DA" },
  { label: "Docker",         logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",               dark: false, accent: "#2496ED" },
  { label: "GitHub Actions", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg", dark: false, accent: "#2088FF" },
  { label: "AWS",            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", dark: false, accent: "#FF9900" },
  { label: "Git",            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",                    dark: false, accent: "#F05032" },
  { label: "Vim",            logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vim/vim-original.svg",                    dark: true,  accent: "#019733" },
  { label: "Grafana",        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg",             dark: false, accent: "#F46800" },
  { label: "Prometheus",     logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg",       dark: false, accent: "#E6522C" },
  { label: "Nginx",          logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg",                 dark: false, accent: "#009639" },
  { label: "SSH",            logo: "https://cdn.simpleicons.org/openssh/073551",                                                  dark: false, accent: "#073551" },
  { label: "Wireshark",      logo: "https://cdn.simpleicons.org/wireshark/1679A7",                                                dark: false, accent: "#1679A7" },
  { label: "OWASP",          logo: "https://cdn.simpleicons.org/owasp/00549E",                                                    dark: false, accent: "#00549E" },
  { label: "Nmap",           logo: "https://cdn.simpleicons.org/nmap/4CBB17",                                                     dark: true,  accent: "#4CBB17" },
  { label: "VS Code",        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",               dark: false, accent: "#007ACC" },
];

/* ──────────────────────────────────────────────────────────────────────────
   Static mobile fallback — pure CSS marquee, zero WebGL
   Shown on phones where the Three.js canvas would be too heavy.
   ────────────────────────────────────────────────────────────────────────── */
function StaticTechGrid() {
  const row1 = techItems.slice(0, 11);
  const row2 = techItems.slice(11);
  return (
    <div className="techstack-static">
      <div className="techstack-ghost-title" aria-hidden="true">MY TECH STACK</div>
      <div className="techstack-marquee-wrap">
        {[row1, row2].map((row, ri) => (
          <div key={ri} className={`techstack-marquee-row techstack-marquee-row--${ri % 2 === 0 ? "fwd" : "rev"}`}>
            {/* Duplicate for seamless loop */}
            {[...row, ...row].map((item, i) => (
              <div key={`${item.label}-${i}`} className="techstack-chip">
                <img src={item.logo} alt={item.label} width={20} height={20} loading="lazy" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Canvas texture helpers
   ────────────────────────────────────────────────────────────────────────── */
const SPHERE_GEO = new THREE.SphereGeometry(1, 12, 12);
const SCALES    = [1.08, 1.18, 1.26, 1.34, 1.14, 1.22];
const TEX       = 512;

function buildBaseCanvas(dark: boolean, accent: string) {
  const canvas = document.createElement("canvas");
  canvas.width = TEX; canvas.height = TEX;
  const ctx = canvas.getContext("2d")!;

  const base = ctx.createRadialGradient(TEX * 0.34, TEX * 0.28, TEX * 0.06, TEX * 0.5, TEX * 0.5, TEX * 0.58);
  base.addColorStop(0,    dark ? "#2a2e3e" : "#ffffff");
  base.addColorStop(0.4,  dark ? "#181c28" : "#f5f7fc");
  base.addColorStop(0.74, dark ? "#0a0d16" : "#e2e8f2");
  base.addColorStop(1,    dark ? "#050710" : "#c8d3e0");
  ctx.fillStyle = base; ctx.fillRect(0, 0, TEX, TEX);

  const glow = ctx.createRadialGradient(TEX * 0.68, TEX * 0.7, 0, TEX * 0.68, TEX * 0.7, TEX * 0.32);
  glow.addColorStop(0, accent + "55"); glow.addColorStop(0.5, accent + "14"); glow.addColorStop(1, accent + "00");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, TEX, TEX);

  const hl = ctx.createRadialGradient(TEX * 0.3, TEX * 0.24, 0, TEX * 0.3, TEX * 0.24, TEX * 0.24);
  hl.addColorStop(0, "rgba(255,255,255,0.9)"); hl.addColorStop(0.35, "rgba(255,255,255,0.3)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl; ctx.fillRect(0, 0, TEX, TEX);

  ctx.strokeStyle = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.38)";
  ctx.lineWidth = TEX * 0.012;
  ctx.beginPath(); ctx.arc(TEX / 2, TEX / 2, TEX * 0.43, Math.PI * 0.1, Math.PI * 1.76); ctx.stroke();

  return { canvas, ctx };
}

function toCanvasTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function createFallbackTexture(label: string, dark: boolean, accent: string) {
  const { canvas, ctx } = buildBaseCanvas(dark, accent);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = dark ? "#d0d8ff" : "#1a1a2e";
  const text = label.length > 4 ? label.slice(0, 3) : label;
  const fs = text.length > 3 ? 50 : text.length > 2 ? 66 : 84;
  ctx.font = `800 ${fs}px 'Inter','Segoe UI',system-ui,sans-serif`;
  ctx.fillText(text, TEX / 2, TEX / 2);
  return toCanvasTexture(canvas);
}

function makeMaterial(tex: THREE.CanvasTexture, dark: boolean) {
  return new THREE.MeshPhysicalMaterial({
    map: tex,
    color: dark ? "#d4dcff" : "#ffffff",
    metalness: 0.03,
    roughness: 0.14,
    clearcoat: 0.9,
    clearcoatRoughness: 0.06,
    reflectivity: 0.88,
    envMapIntensity: 0.8,
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   Physics ball
   ────────────────────────────────────────────────────────────────────────── */
function SphereGeo({ scale, material, isActive, label, spawnIndex }: {
  scale: number; material: THREE.MeshPhysicalMaterial; isActive: boolean; label: string; spawnIndex: number;
}) {
  const body    = useRef<RapierRigidBody>(null);
  const impulse = useRef(new THREE.Vector3());
  const spawned = useRef(false);

  useFrame((_s, delta) => {
    if (!body.current) return;

    // Reset spawned flag when section leaves so re-entry re-animates
    if (!isActive && spawned.current) {
      spawned.current = false;
      body.current.setTranslation({ x: 0, y: -40, z: 0 }, true);
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // On first active frame, teleport ball below screen so it rises up naturally
    if (isActive && !spawned.current) {
      spawned.current = true;
      // First 6 balls launch instantly, rest stagger at 35ms each
      const delay = spawnIndex < 6 ? 0 : (spawnIndex - 6) * 35;
      const launch = () => {
        if (!body.current) return;
        body.current.setTranslation(
          { x: THREE.MathUtils.randFloatSpread(10), y: -14 - Math.random() * 4, z: THREE.MathUtils.randFloatSpread(4) - 2 },
          true,
        );
        body.current.setLinvel(
          { x: THREE.MathUtils.randFloatSpread(3), y: 14 + Math.random() * 6, z: 0 },
          true,
        );
      };
      if (delay === 0) launch();
      else setTimeout(launch, delay);
    }

    if (!isActive) return;
    const d = Math.min(delta, 0.08);
    const p = body.current.translation();
    impulse.current.set(p.x, p.y, p.z).normalize().multiplyScalar(-40 * d * scale);
    body.current.applyImpulse(impulse.current, true);
  });

  return (
    <RigidBody
      colliders={false}
      linearDamping={0.72}
      angularDamping={0.2}
      friction={0.18}
      // Park far off-screen until isActive triggers the staggered spawn
      position={[0, -40, 0]}
      ref={body}
    >
      <BallCollider args={[scale]} />
      <mesh scale={scale} geometry={SPHERE_GEO} material={material} />
      <Html position={[0, -scale - 0.44, 0]} center distanceFactor={12} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
        <div className="tech-ball-label">{label}</div>
      </Html>
    </RigidBody>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Cursor pointer (kinematic body that pushes balls)
   ────────────────────────────────────────────────────────────────────────── */
function Pointer({ isActive }: { isActive: boolean }) {
  const ref    = useRef<RapierRigidBody>(null);
  const pos    = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;
    target.current.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);
    pos.current.lerp(target.current, 0.18);
    ref.current.setNextKinematicTranslation(pos.current);
  });

  return (
    <RigidBody ref={ref} type="kinematicPosition" colliders={false} position={[100, 100, 100]}>
      <BallCollider args={[2.6]} />
    </RigidBody>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Main export
   ────────────────────────────────────────────────────────────────────────── */
export default function TechStack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMobile]  = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);

  // Materials with letter fallback textures (instant), then CDN logos hot-swapped in
  const materials = useMemo(
    () => techItems.map(({ label, dark, accent }) => makeMaterial(createFallbackTexture(label, dark, accent), dark)),
    [],
  );

  // Async-load real SVG logos from CDN → hot-swap onto ball textures
  useEffect(() => {
    if (isMobile) return; // no canvas on mobile — skip all CDN fetches
    techItems.forEach(({ logo, dark, accent }, i) => {
      const { canvas, ctx } = buildBaseCanvas(dark, accent);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const size = TEX * 0.44, off = (TEX - size) / 2;
        ctx.drawImage(img, off, off, size, size);
        const prev = materials[i].map;
        materials[i].map = toCanvasTexture(canvas);
        materials[i].needsUpdate = true;
        if (prev) prev.dispose();
      };
      img.src = logo;
    });
  }, [materials, isMobile]);

  // Activate physics only when section is visible; pause when tab hidden
  useEffect(() => {
    if (isMobile) return;
    const el = sectionRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // Small delay so the canvas finishes its first render before physics runs
          timer = setTimeout(() => setIsActive(true), 120);
        } else {
          clearTimeout(timer);
          setIsActive(false);
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const cb = () => { if (document.hidden) setIsActive(false); };
    document.addEventListener("visibilitychange", cb);
    return () => document.removeEventListener("visibilitychange", cb);
  }, [isMobile]);

  // ── Mobile: render a pure-CSS marquee instead of a heavy WebGL canvas ──
  if (isMobile) return <StaticTechGrid />;

  // ── Desktop: full 3D physics canvas ──
  return (
    <div className="techstack-moncy" ref={sectionRef}>
      <div className="techstack-ghost-title" aria-hidden="true">MY TECH STACK</div>

      <Canvas
        /*
         * Performance choices:
         *  - No `shadows` prop → no shadow map allocated (big GPU win)
         *  - dpr capped at 1.2 → fewer pixels on high-DPI screens
         *  - performance.min = 0.5 → R3F auto-reduces DPR if FPS drops
         *  - No EffectComposer / N8AO → removes the full post-process pipeline
         *  - No Environment HDR → removes the HDR texture fetch + IBL cost
         */
        gl={{ alpha: true, antialias: false, stencil: false, powerPreference: "high-performance" }}
        dpr={[1, 1.2]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 0, 20], fov: 32, near: 1, far: 100 }}
        onCreated={(s) => { s.gl.toneMappingExposure = 1.3; }}
        className="tech-canvas-moncy"
      >
        {/* Lights — compensate for removed Environment HDR with slightly stronger values */}
        <ambientLight intensity={1.6} />
        <hemisphereLight intensity={1.1} groundColor="#060a14" color="#dce6ff" />
        <spotLight position={[18, 18, 22]} penumbra={1} angle={0.28} intensity={90} color="#ffffff" />
        <pointLight position={[-10, -4, 10]} intensity={55} color="#63d6ff" />
        <pointLight position={[10, 5, 8]} intensity={40} color="#ff78ad" />

        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {techItems.map((item, i) => (
            <SphereGeo
              key={item.label}
              scale={SCALES[i % SCALES.length]}
              material={materials[i]}
              isActive={isActive}
              label={item.label}
              spawnIndex={i}
            />
          ))}
        </Physics>
      </Canvas>
    </div>
  );
}
