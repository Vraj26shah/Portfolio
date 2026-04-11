import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import {
  Color,
  CubicBezierCurve3,
  EllipseCurve,
  MathUtils,
  Vector3,
} from "three";

export const scrollState = { progress: 0 };

/* ─── Orbital ring data ─────────────────────────────────────────────────── */
const RINGS = [
  { radius: 2.15, tilt: [0.88, 0.22, 0] as [number, number, number], color: "#56c8ff", thickness: 0.032, speed: 0.19, segments: 220 },
  { radius: 2.9,  tilt: [0.36, 0.42, 1.18] as [number, number, number], color: "#ff78b2", thickness: 0.024, speed: -0.24, segments: 260 },
  { radius: 3.65, tilt: [1.28, -0.18, 0.6] as [number, number, number], color: "#ffd86d", thickness: 0.018, speed: 0.15, segments: 300 },
  { radius: 4.4,  tilt: [0.55, 0.78, -0.4] as [number, number, number], color: "#78ddff", thickness: 0.014, speed: -0.11, segments: 340 },
];

/* ─── Orbital node placement ────────────────────────────────────────────── */
const NODES = [
  { angle: 0.15,  radius: 3.2,  y:  1.15, zS: 0.85, color: "#ffb45f", size: 0.072 }, // AWS
  { angle: 0.85,  radius: 3.6,  y: -0.25, zS: 1.05, color: "#78ddff", size: 0.058 }, // Azure
  { angle: 1.7,   radius: 3.1,  y:  0.95, zS: 0.7,  color: "#ffd86d", size: 0.064 }, // Python
  { angle: 2.55,  radius: 3.45, y: -1.1,  zS: 1.05, color: "#8dd8ff", size: 0.055 }, // C++
  { angle: 3.1,   radius: 3.2,  y:  0.3,  zS: 0.9,  color: "#ff8eb7", size: 0.068 }, // Java
  { angle: 3.95,  radius: 3.5,  y:  1.25, zS: 0.75, color: "#74e4ff", size: 0.060 }, // Docker
  { angle: 4.75,  radius: 3.2,  y: -0.55, zS: 1.15, color: "#7bb7ff", size: 0.066 }, // K8s
  { angle: 5.6,   radius: 3.55, y:  0.82, zS: 0.88, color: "#ffc56b", size: 0.060 }, // DevOps
];

/* ─── Bezier packet routes ──────────────────────────────────────────────── */
const ROUTES: { pts: [Vector3, Vector3, Vector3, Vector3]; color: string; opacity: number }[] = [
  {
    pts: [new Vector3(-3.2, 1.9, -1.2), new Vector3(-1.1, 0.8, 0.4), new Vector3(0.7, -0.9, 0.2), new Vector3(2.6, -1.7, -1.1)],
    color: "#78ddff", opacity: 0.32,
  },
  {
    pts: [new Vector3(-2.5, -1.6, 1.2), new Vector3(-0.6, -0.4, 0.3), new Vector3(1.0, 1.2, -0.2), new Vector3(2.9, 1.7, 1.1)],
    color: "#ffd86d", opacity: 0.28,
  },
  {
    pts: [new Vector3(3.0, 0.5, -1.6), new Vector3(1.2, 1.3, -0.3), new Vector3(-0.8, 0.2, 0.6), new Vector3(-2.8, -0.7, 1.4)],
    color: "#ff84ba", opacity: 0.22,
  },
  {
    pts: [new Vector3(-1.9, 2.4, 0.8), new Vector3(-0.4, 1.1, -0.4), new Vector3(1.1, -1.0, -0.6), new Vector3(2.2, -2.1, 0.9)],
    color: "#a8d8ff", opacity: 0.18,
  },
  {
    pts: [new Vector3(0.5, -2.8, -0.9), new Vector3(0.2, -1.2, 0.8), new Vector3(-0.6, 1.4, 0.4), new Vector3(-0.9, 2.6, -0.8)],
    color: "#78ddff", opacity: 0.15,
  },
];

/* ─── Packet burst pulse ────────────────────────────────────────────────── */
function PacketPulse({ routeIndex }: { routeIndex: number }) {
  const meshRef = useRef<Mesh>(null);
  const progressRef = useRef(routeIndex * 0.33);
  const route = ROUTES[routeIndex % ROUTES.length];

  const curve = useMemo(
    () => new CubicBezierCurve3(route.pts[0], route.pts[1], route.pts[2], route.pts[3]),
    [route],
  );

  useFrame((_state, delta) => {
    progressRef.current = (progressRef.current + delta * 0.18) % 1;
    const pos = curve.getPoint(progressRef.current);
    if (meshRef.current) {
      meshRef.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.055, 8, 8]} />
      <meshStandardMaterial
        color={route.color}
        emissive={route.color}
        emissiveIntensity={3.5}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ─── Orbital dot node ──────────────────────────────────────────────────── */
function OrbitalNode({ color, size }: { color: string; size: number }) {
  const meshRef = useRef<Mesh>(null);
  return (
    <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.14}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

/* ─── Scanning arc ──────────────────────────────────────────────────────── */
function ScanArc() {
  const groupRef = useRef<Group>(null);

  const arcPoints = useMemo(() => {
    const curve = new EllipseCurve(0, 0, 1.85, 1.85, -Math.PI / 3, Math.PI / 3, false, 0);
    return curve.getPoints(60).map((p) => new Vector3(p.x, 0, p.y));
  }, []);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.62;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0]}>
      <Line points={arcPoints} color="#78ddff" transparent opacity={0.55} lineWidth={1.5} />
    </group>
  );
}

/* ─── DNS arc (static curved line) ──────────────────────────────────────── */
function DnsArc({ pts, color, opacity }: { pts: [Vector3, Vector3, Vector3, Vector3]; color: string; opacity: number }) {
  const points = useMemo(() => {
    const curve = new CubicBezierCurve3(pts[0], pts[1], pts[2], pts[3]);
    return curve.getPoints(72);
  }, [pts]);
  return <Line points={points} color={color} transparent opacity={opacity} lineWidth={0.9} />;
}

/* ─── Orbital ring ───────────────────────────────────────────────────────── */
function OrbitalRing({ radius, tilt, color, thickness, speed, segments }: (typeof RINGS)[number]) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * speed;
  });

  return (
    <mesh ref={meshRef} rotation={tilt}>
      <torusGeometry args={[radius, thickness, 18, segments]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={1.4}
        roughness={0.08}
        metalness={0.72}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ─── Main Packet Observatory ────────────────────────────────────────────── */
function PacketObservatory() {
  const rigRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const coreMaterialRef = useRef<MeshPhysicalMaterial>(null);
  const innerRef = useRef<Mesh>(null);
  const tempColor = useRef(new Color("#78ddff"));

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const progress = scrollState.progress;
    const heroPhase = MathUtils.smoothstep(progress, 0, 0.22);
    const systemPhase = MathUtils.smoothstep(progress, 0.18, 0.72);
    const finalePhase = MathUtils.smoothstep(progress, 0.7, 1);

    if (rigRef.current) {
      rigRef.current.rotation.y = MathUtils.damp(
        rigRef.current.rotation.y,
        -0.28 + heroPhase * 0.32 + systemPhase * Math.PI * 0.88,
        3.5, delta,
      );
      rigRef.current.rotation.x = MathUtils.damp(
        rigRef.current.rotation.x,
        0.16 - systemPhase * 0.16 + Math.sin(elapsed * 0.25) * 0.03,
        3.5, delta,
      );
      rigRef.current.position.y = MathUtils.damp(
        rigRef.current.position.y,
        Math.sin(elapsed * 0.42) * 0.07 - systemPhase * 0.1 + finalePhase * 0.16,
        4, delta,
      );
      rigRef.current.position.z = MathUtils.damp(
        rigRef.current.position.z,
        -systemPhase * 0.95 + finalePhase * 1.1,
        4, delta,
      );
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * (0.12 + systemPhase * 0.22);
      coreRef.current.rotation.x += delta * 0.07;
      const scale = 1 + systemPhase * 0.1 - finalePhase * 0.04;
      coreRef.current.scale.setScalar(scale);
    }

    if (innerRef.current) {
      innerRef.current.rotation.x += delta * (0.42 + systemPhase * 0.3);
      innerRef.current.rotation.y -= delta * 0.2;
    }

    const accent = tempColor.current;
    accent.set("#78ddff");
    accent.lerp(new Color("#ff7db0"), systemPhase * 0.38);
    accent.lerp(new Color("#ffd86d"), finalePhase * 0.55);

    if (coreMaterialRef.current) {
      coreMaterialRef.current.color.lerp(accent, 0.04);
      coreMaterialRef.current.emissive.lerp(accent, 0.03);
    }

    state.camera.position.x = MathUtils.damp(
      state.camera.position.x,
      Math.sin(progress * Math.PI * 1.1) * 0.44,
      3, delta,
    );
    state.camera.position.y = MathUtils.damp(
      state.camera.position.y,
      0.1 + heroPhase * 0.18 - finalePhase * 0.12,
      3, delta,
    );
    state.camera.position.z = MathUtils.damp(
      state.camera.position.z,
      6.5 - systemPhase * 0.85 + finalePhase * 0.55,
      3, delta,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={rigRef}>
      {/* Core icosahedron */}
      <Float speed={1.0} rotationIntensity={0.07} floatIntensity={0.12}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.12, 1]} />
          <meshPhysicalMaterial
            ref={coreMaterialRef}
            color="#78ddff"
            emissive="#0d3047"
            emissiveIntensity={0.9}
            metalness={0.5}
            roughness={0.11}
            clearcoat={0.82}
            transparent
            opacity={0.74}
            transmission={0.14}
          />
        </mesh>
      </Float>

      {/* Inner torus-knot energy trace */}
      <mesh ref={innerRef}>
        <torusKnotGeometry args={[0.58, 0.11, 200, 22, 2, 3]} />
        <meshPhysicalMaterial
          color="#ffe187"
          emissive="#ff6fa8"
          emissiveIntensity={1.3}
          metalness={0.64}
          roughness={0.07}
        />
      </mesh>

      {/* Orbital rings */}
      {RINGS.map((ring, i) => (
        <OrbitalRing key={i} {...ring} />
      ))}

      {/* Bezier protocol routes */}
      {ROUTES.map((route, i) => (
        <DnsArc key={i} pts={route.pts} color={route.color} opacity={route.opacity} />
      ))}

      {/* Packet burst pulses (1 per route) */}
      {ROUTES.map((_, i) => (
        <PacketPulse key={i} routeIndex={i} />
      ))}

      {/* Rotating scan arc */}
      <ScanArc />

      {/* Orbital dot nodes (no text labels) */}
      <group>
        {NODES.map((node, i) => (
          <group
            key={i}
            position={[
              Math.cos(node.angle) * node.radius,
              node.y,
              Math.sin(node.angle) * node.radius * node.zS,
            ]}
          >
            <OrbitalNode color={node.color} size={node.size} />
          </group>
        ))}
      </group>

      {/* Soft glow sphere behind everything */}
      <mesh position={[0, 0, -0.8]}>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial color="#1483d3" transparent opacity={0.09} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0.12, 6.5], fov: 34 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <color attach="background" args={["#030711"]} />
      <fog attach="fog" args={["#030711", 9, 20]} />

      <ambientLight intensity={0.72} />
      <directionalLight position={[4.8, 4.5, 4]} intensity={2.0} color="#effcff" />
      <directionalLight position={[-5, -3, 2]} intensity={1.1} color="#42b5ff" />
      <pointLight position={[3.2, 1.4, -1.8]} intensity={16} color="#ff84ba" />
      <pointLight position={[-3.1, 1.8, 2.9]} intensity={16} color="#5fc8ff" />
      <pointLight position={[0, 0, 0]} intensity={8} color="#78ddff" />

      {/* Deep-space star field */}
      <Sparkles count={220} size={2.2} scale={[18, 12, 14]} speed={0.18} color="#8fe8ff" opacity={0.36} />
      <Sparkles count={100} size={3.0} scale={[16, 9, 11]} speed={0.28} color="#ff9ac2" opacity={0.14} />

      <PacketObservatory />
    </Canvas>
  );
}
