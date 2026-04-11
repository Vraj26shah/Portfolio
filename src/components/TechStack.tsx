import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  RapierRigidBody,
} from "@react-three/rapier";

/* ──────────────────────────────────────────────────────────────────────────
   Tech stack — comprehensive list with devicon / simpleicon CDN logos
   Logos are drawn directly onto the ball canvas texture (moncy.dev style)
   ────────────────────────────────────────────────────────────────────────── */
type TechItem = {
  label: string;
  logo: string;
  dark: boolean;
  accent: string;
};

const techItems: TechItem[] = [
  { label: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", dark: false, accent: "#3776AB" },
  { label: "C/C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg", dark: false, accent: "#00599C" },
  { label: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", dark: false, accent: "#ED8B00" },
  { label: "SQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg", dark: false, accent: "#4479A1" },
  { label: "Bash", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg", dark: true, accent: "#4EAA25" },
  { label: "Linux", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg", dark: false, accent: "#FCC624" },
  { label: "Ubuntu", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-original.svg", dark: false, accent: "#E95420" },
  { label: "Fedora", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fedora/fedora-original.svg", dark: false, accent: "#51A2DA" },
  { label: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg", dark: false, accent: "#2496ED" },
  { label: "GitHub Actions", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/githubactions/githubactions-original.svg", dark: false, accent: "#2088FF" },
  { label: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", dark: false, accent: "#FF9900" },
  { label: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg", dark: false, accent: "#F05032" },
  { label: "Vim", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vim/vim-original.svg", dark: true, accent: "#019733" },
  { label: "Grafana", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg", dark: false, accent: "#F46800" },
  { label: "Prometheus", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prometheus/prometheus-original.svg", dark: false, accent: "#E6522C" },
  { label: "Nginx", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg", dark: false, accent: "#009639" },
  { label: "SSH", logo: "https://cdn.simpleicons.org/openssh/073551", dark: false, accent: "#073551" },
  { label: "Wireshark", logo: "https://cdn.simpleicons.org/wireshark/1679A7", dark: false, accent: "#1679A7" },
  { label: "OWASP", logo: "https://cdn.simpleicons.org/owasp/00549E", dark: false, accent: "#00549E" },
  { label: "Nmap", logo: "https://cdn.simpleicons.org/nmap/4CBB17", dark: true, accent: "#4CBB17" },
  { label: "VS Code", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg", dark: false, accent: "#007ACC" },
];

/* ──────────────────────────────────────────────────────────────────────────
   Shared geometry + scale palette
   ────────────────────────────────────────────────────────────────────────── */
const SPHERE_GEO = new THREE.SphereGeometry(1, 16, 16);
const SCALES = [1.08, 1.18, 1.26, 1.34, 1.14, 1.22];
const TEX = 512;

/* ──────────────────────────────────────────────────────────────────────────
   Canvas texture helpers — pearl ball with brand accent glow
   ────────────────────────────────────────────────────────────────────────── */
function buildBaseCanvas(dark: boolean, accent: string) {
  const canvas = document.createElement("canvas");
  canvas.width = TEX;
  canvas.height = TEX;
  const ctx = canvas.getContext("2d")!;

  // Pearl radial gradient
  const base = ctx.createRadialGradient(
    TEX * 0.34, TEX * 0.28, TEX * 0.06,
    TEX * 0.5, TEX * 0.5, TEX * 0.58,
  );
  base.addColorStop(0, dark ? "#2a2e3e" : "#ffffff");
  base.addColorStop(0.4, dark ? "#181c28" : "#f5f7fc");
  base.addColorStop(0.74, dark ? "#0a0d16" : "#e2e8f2");
  base.addColorStop(1, dark ? "#050710" : "#c8d3e0");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, TEX, TEX);

  // Brand-color accent glow (lower-right quadrant)
  const glow = ctx.createRadialGradient(
    TEX * 0.68, TEX * 0.7, 0,
    TEX * 0.68, TEX * 0.7, TEX * 0.32,
  );
  glow.addColorStop(0, accent + "55");
  glow.addColorStop(0.5, accent + "14");
  glow.addColorStop(1, accent + "00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, TEX, TEX);

  // Specular highlight (upper-left)
  const hl = ctx.createRadialGradient(
    TEX * 0.3, TEX * 0.24, 0,
    TEX * 0.3, TEX * 0.24, TEX * 0.24,
  );
  hl.addColorStop(0, "rgba(255,255,255,0.9)");
  hl.addColorStop(0.35, "rgba(255,255,255,0.3)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, TEX, TEX);

  // Rim arc
  ctx.strokeStyle = dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.38)";
  ctx.lineWidth = TEX * 0.012;
  ctx.beginPath();
  ctx.arc(TEX / 2, TEX / 2, TEX * 0.43, Math.PI * 0.1, Math.PI * 1.76);
  ctx.stroke();

  return { canvas, ctx };
}

function toCanvasTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

/** Instant fallback — draws label initials until real SVG logo loads */
function createFallbackTexture(label: string, dark: boolean, accent: string) {
  const { canvas, ctx } = buildBaseCanvas(dark, accent);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
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
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.94,
    envMapIntensity: 1.3,
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   SphereGeo — physics ball with logo texture + floating label
   ────────────────────────────────────────────────────────────────────────── */
function SphereGeo({
  scale,
  material,
  isActive,
  label,
}: {
  scale: number;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
  label: string;
}) {
  const body = useRef<RapierRigidBody>(null);
  const impulse = useRef(new THREE.Vector3());

  useFrame((_s, delta) => {
    if (!isActive || !body.current) return;
    const d = Math.min(delta, 0.08);
    const p = body.current.translation();
    impulse.current.set(p.x, p.y, p.z).normalize().multiplyScalar(-40 * d * scale);
    body.current.applyImpulse(impulse.current, true);
  });

  return (
    <RigidBody
      colliders={false}
      linearDamping={0.78}
      angularDamping={0.2}
      friction={0.18}
      position={[
        THREE.MathUtils.randFloatSpread(18),
        THREE.MathUtils.randFloatSpread(16) - 14,
        THREE.MathUtils.randFloatSpread(10) - 3,
      ]}
      ref={body}
    >
      <BallCollider args={[scale]} />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={SPHERE_GEO}
        material={material}
      />
      <Html
        position={[0, -scale - 0.44, 0]}
        center
        distanceFactor={12}
        zIndexRange={[15, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="tech-ball-label">{label}</div>
      </Html>
    </RigidBody>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Pointer — cursor interaction (kinematic body that pushes balls)
   ────────────────────────────────────────────────────────────────────────── */
function Pointer({ isActive }: { isActive: boolean }) {
  const ref = useRef<RapierRigidBody>(null);
  const pos = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;
    target.current.set(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0,
    );
    pos.current.lerp(target.current, 0.18);
    ref.current.setNextKinematicTranslation(pos.current);
  });

  return (
    <RigidBody
      ref={ref}
      type="kinematicPosition"
      colliders={false}
      position={[100, 100, 100]}
    >
      <BallCollider args={[2.6]} />
    </RigidBody>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Main TechStack component
   ────────────────────────────────────────────────────────────────────────── */
export default function TechStack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  // Create materials instantly with letter-fallback textures
  const materials = useMemo(
    () =>
      techItems.map(({ label, dark, accent }) =>
        makeMaterial(createFallbackTexture(label, dark, accent), dark),
      ),
    [],
  );

  // Async-load real SVG logos from CDN → hot-swap onto ball textures
  useEffect(() => {
    techItems.forEach(({ logo, dark, accent }, i) => {
      const { canvas, ctx } = buildBaseCanvas(dark, accent);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw logo centered — sized to ~44% of canvas to avoid UV distortion at sphere edges
        const size = TEX * 0.44;
        const off = (TEX - size) / 2;
        ctx.drawImage(img, off, off, size, size);
        const prev = materials[i].map;
        materials[i].map = toCanvasTexture(canvas);
        materials[i].needsUpdate = true;
        if (prev) prev.dispose();
      };
      // onerror: fallback texture already shows the label — no action needed
      img.src = logo;
    });
  }, [materials]);

  // Activate physics only when section is in viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setIsActive(e.isIntersecting),
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Pause physics when browser tab is hidden
  useEffect(() => {
    const cb = () => {
      if (document.hidden) setIsActive(false);
    };
    document.addEventListener("visibilitychange", cb);
    return () => document.removeEventListener("visibilitychange", cb);
  }, []);

  return (
    <div className="techstack-moncy" ref={sectionRef}>
      <div className="techstack-ghost-title" aria-hidden="true">
        MY TECH STACK
      </div>

      <Canvas
        shadows
        gl={{ alpha: true, antialias: false, stencil: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 20], fov: 32, near: 1, far: 100 }}
        onCreated={(s) => {
          s.gl.toneMappingExposure = 1.4;
        }}
        className="tech-canvas-moncy"
      >
        <ambientLight intensity={1.15} />
        <hemisphereLight intensity={0.9} groundColor="#060a14" color="#dce6ff" />
        <spotLight
          position={[18, 18, 22]}
          penumbra={1}
          angle={0.26}
          intensity={65}
          castShadow
          shadow-mapSize={[512, 512]}
          color="#ffffff"
        />
        <pointLight position={[-10, -4, 10]} intensity={35} color="#63d6ff" />
        <pointLight position={[10, 5, 8]} intensity={25} color="#ff78ad" />

        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {techItems.map((item, i) => (
            <SphereGeo
              key={item.label}
              scale={SCALES[i % SCALES.length]}
              material={materials[i]}
              isActive={isActive}
              label={item.label}
            />
          ))}
        </Physics>

        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.95}
          environmentRotation={[0, 4, 2]}
        />

        <EffectComposer enableNormalPass={false}>
          <N8AO color="#000000" aoRadius={2.4} intensity={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
