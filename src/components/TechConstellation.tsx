import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sparkles, Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { Color, CubicBezierCurve3, Vector3 } from "three";

const stackNodes = [
  { label: "AWS", color: "#ffb45f", angle: 0.1, radius: 2.8, y: 0.9 },
  { label: "Azure", color: "#7fe0ff", angle: 0.78, radius: 3.2, y: -0.2 },
  { label: "Python", color: "#ffd86d", angle: 1.45, radius: 2.9, y: 1.3 },
  { label: "C++", color: "#9ad7ff", angle: 2.05, radius: 3.25, y: -0.95 },
  { label: "Java", color: "#ff8fbe", angle: 2.78, radius: 2.95, y: 0.42 },
  { label: "Docker", color: "#86eeff", angle: 3.48, radius: 3.2, y: -1.22 },
  { label: "Kubernetes", color: "#8fb9ff", angle: 4.25, radius: 3.05, y: 0.96 },
  { label: "DevOps", color: "#ffc96d", angle: 4.95, radius: 3.25, y: -0.28 },
  { label: "Full Stack", color: "#f7fbff", angle: 5.75, radius: 3.08, y: 1.18 },
];

function Ribbon({
  points,
  color,
}: {
  points: [Vector3, Vector3, Vector3, Vector3];
  color: string;
}) {
  const curvePoints = useMemo(() => {
    const curve = new CubicBezierCurve3(points[0], points[1], points[2], points[3]);
    return curve.getPoints(48);
  }, [points]);

  return <Line points={curvePoints} color={color} transparent opacity={0.3} lineWidth={1} />;
}

function ConstellationRig() {
  const rigRef = useRef<Group>(null);
  const orbitalRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);
  const tempColorRef = useRef(new Color("#7fe0ff"));

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    if (rigRef.current) {
      rigRef.current.rotation.y += delta * 0.08;
      rigRef.current.rotation.x = Math.sin(elapsed * 0.2) * 0.04;
    }

    if (orbitalRef.current) {
      orbitalRef.current.rotation.y -= delta * 0.18;
      orbitalRef.current.rotation.z = Math.sin(elapsed * 0.28) * 0.08;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.12;
    }

    tempColorRef.current.set("#7fe0ff");
    state.camera.position.x = Math.sin(elapsed * 0.18) * 0.28;
    state.camera.position.y = 0.08 + Math.cos(elapsed * 0.12) * 0.08;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={rigRef}>
      <group ref={ringRef}>
        <mesh rotation={[0.9, 0.1, 0]}>
          <torusGeometry args={[2.35, 0.03, 16, 80]} />
          <meshStandardMaterial color="#7fe0ff" emissive="#56beff" emissiveIntensity={1.2} roughness={0.1} metalness={0.7} />
        </mesh>
        <mesh rotation={[0.4, 0.3, 1.1]}>
          <torusGeometry args={[3.05, 0.022, 14, 90]} />
          <meshStandardMaterial color="#ff91c2" emissive="#ff7fb5" emissiveIntensity={0.92} roughness={0.1} metalness={0.66} />
        </mesh>
      </group>

      <mesh>
        <dodecahedronGeometry args={[0.88, 0]} />
        <meshPhysicalMaterial
          color="#7fe0ff"
          emissive="#13425e"
          emissiveIntensity={0.85}
          metalness={0.52}
          roughness={0.14}
          transparent
          opacity={0.72}
        />
      </mesh>

      <mesh>
        <torusKnotGeometry args={[0.48, 0.11, 64, 10, 2, 3]} />
        <meshStandardMaterial color="#ffd86d" emissive="#ff9fc7" emissiveIntensity={1.05} roughness={0.08} metalness={0.62} />
      </mesh>

      <Ribbon
        points={[
          new Vector3(-2.2, 1.2, -0.8),
          new Vector3(-1.1, 0.6, 0.15),
          new Vector3(0.8, -0.6, -0.1),
          new Vector3(2.4, -1.1, 0.82),
        ]}
        color="#7fe0ff"
      />
      <Ribbon
        points={[
          new Vector3(-2.4, -1.25, 0.95),
          new Vector3(-0.8, -0.7, 0.15),
          new Vector3(0.9, 0.75, -0.15),
          new Vector3(2.1, 1.25, -0.9),
        ]}
        color="#ffd86d"
      />

      <group ref={orbitalRef}>
        {stackNodes.map((node) => (
          <Float key={node.label} speed={1.2} rotationIntensity={0.1} floatIntensity={0.14}>
            <group
              position={[
                Math.cos(node.angle) * node.radius,
                node.y,
                Math.sin(node.angle) * node.radius,
              ]}
            >
              <mesh>
                <capsuleGeometry args={[0.28, 1.4, 8, 16]} />
                <meshPhysicalMaterial
                  color={node.color}
                  emissive={node.color}
                  emissiveIntensity={0.34}
                  roughness={0.14}
                  metalness={0.44}
                  transparent
                  opacity={0.88}
                />
              </mesh>
              <Text position={[0, 0, 0.28]} fontSize={0.16} color="#06111b" anchorX="center" anchorY="middle" maxWidth={1.5}>
                {node.label}
              </Text>
            </group>
          </Float>
        ))}
      </group>
    </group>
  );
}

export default function TechConstellation() {
  return (
    <Canvas camera={{ position: [0, 0.08, 7.4], fov: 34 }} dpr={[0.75, 1.5]} gl={{ alpha: true, antialias: false }} performance={{ min: 0.5 }}>
      <ambientLight intensity={0.86} />
      <directionalLight position={[4.2, 4.4, 3.6]} intensity={1.9} color="#effcff" />
      <pointLight position={[-3, 1.4, 2]} intensity={14} color="#58caff" />
      <pointLight position={[2.2, 1.5, -1.4]} intensity={12} color="#ff89bb" />

      <Sparkles count={55} size={2.2} scale={[12, 8, 10]} speed={0.24} color="#8fe8ff" opacity={0.35} />
      <ConstellationRig />
    </Canvas>
  );
}
