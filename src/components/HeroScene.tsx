import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Group, InstancedMesh, LineSegments } from "three";
import * as THREE from "three";

/** Read by background `useFrame` loops — respects accessibility (reduced motion). */
const heroMotion = { reducedMotion: false };

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared scroll state — App.tsx writes progress + section + activeProject.
   HeroScene reads them every useFrame tick.
───────────────────────────────────────────────────────────────────────────── */
export const scrollState = {
  progress: 0,
  section: "home",
  activeProject: -1,
};

/* ─────────────────────────────────────────────────────────────────────────────
   Mouse parallax state — global listener, zero React overhead
───────────────────────────────────────────────────────────────────────────── */
const mouseState = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener(
    "mousemove",
    (e) => {
      mouseState.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseState.y = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Scroll velocity tracker — drives warp grid speed + camera lunge
───────────────────────────────────────────────────────────────────────────── */
const scrollVelState = { raw: 0, damped: 0 };
if (typeof window !== "undefined") {
  let _lastScrollY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      scrollVelState.raw = window.scrollY - _lastScrollY;
      _lastScrollY = window.scrollY;
    },
    { passive: true },
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Node registry — 21 nodes, every real tool from the tech stack.
───────────────────────────────────────────────────────────────────────────── */
const NODE_IDS = [
  "linux", "docker", "aws", "ghactions", "git",
  "python", "bash", "nginx", "prometheus", "grafana",
  "ubuntu", "fedora", "vim", "ssh", "wireshark",
  "owasp", "nmap", "cpp", "java", "sql", "vscode",
] as const;

type NID = (typeof NODE_IDS)[number];

const COLOR: Record<NID, string> = {
  linux:      "#FCC624",
  docker:     "#2496ED",
  aws:        "#FF9900",
  ghactions:  "#2088FF",
  git:        "#F05032",
  python:     "#3776AB",
  bash:       "#4EAA25",
  nginx:      "#009639",
  prometheus: "#E6522C",
  grafana:    "#F46800",
  ubuntu:     "#E95420",
  fedora:     "#51A2DA",
  vim:        "#019733",
  ssh:        "#0D7377",
  wireshark:  "#1679A7",
  owasp:      "#00549E",
  nmap:       "#4CBB17",
  cpp:        "#00599C",
  java:       "#ED8B00",
  sql:        "#4479A1",
  vscode:     "#007ACC",
};

/* Base radius fed into the dummy scale */
const BASE: Record<NID, number> = {
  linux:      0.30,
  docker:     0.28,
  aws:        0.28,
  ghactions:  0.22,
  git:        0.22,
  python:     0.24,
  bash:       0.20,
  nginx:      0.20,
  prometheus: 0.20,
  grafana:    0.22,
  ubuntu:     0.20,
  fedora:     0.18,
  vim:        0.16,
  ssh:        0.16,
  wireshark:  0.18,
  owasp:      0.16,
  nmap:       0.16,
  cpp:        0.18,
  java:       0.18,
  sql:        0.16,
  vscode:     0.18,
};

/* Per-node deterministic spin speeds [rx, ry, rz] rad/s */
const SPIN: Record<NID, [number, number, number]> = {
  linux:      [-0.20,  0.45, -0.18],
  docker:     [ 0.20,  0.50,  0.15],
  aws:        [ 0.18,  0.55,  0.20],
  ghactions:  [-0.30,  0.32, -0.25],
  git:        [-0.22, -0.42,  0.28],
  python:     [ 0.28,  0.42, -0.15],
  bash:       [ 0.35,  0.28,  0.25],
  nginx:      [-0.20,  0.52, -0.18],
  prometheus: [ 0.28, -0.35,  0.30],
  grafana:    [-0.25,  0.48,  0.15],
  ubuntu:     [ 0.25,  0.35,  0.20],
  fedora:     [-0.28, -0.38,  0.22],
  vim:        [ 0.32,  0.30, -0.22],
  ssh:        [ 0.35,  0.25,  0.20],
  wireshark:  [-0.18,  0.45,  0.22],
  owasp:      [ 0.22, -0.40,  0.18],
  nmap:       [-0.30,  0.35, -0.25],
  cpp:        [-0.22,  0.38,  0.20],
  java:       [ 0.30, -0.32,  0.18],
  sql:        [-0.18,  0.50, -0.12],
  vscode:     [ 0.24,  0.50,  0.20],
};

const N = NODE_IDS.length; // 21

/* Background parking positions for inactive/dim nodes */
const BG: THREE.Vector3[] = [
  new THREE.Vector3(-8,  4.0, -15), new THREE.Vector3( 7, -5.0, -14),
  new THREE.Vector3(-6, -6.5, -16), new THREE.Vector3( 9,  5.5, -15),
  new THREE.Vector3(-9,  2.0, -14), new THREE.Vector3( 5,  8.0, -16),
  new THREE.Vector3(-7, -3.0, -15), new THREE.Vector3( 8, -6.5, -14),
  new THREE.Vector3(-5,  7.0, -16), new THREE.Vector3( 6, -8.0, -15),
  new THREE.Vector3(-8, -5.0, -14), new THREE.Vector3( 7,  7.0, -16),
  new THREE.Vector3(-6,  3.0, -15), new THREE.Vector3( 9, -4.0, -14),
  new THREE.Vector3(-4,  6.0, -16), new THREE.Vector3( 5,  4.0, -15),
  new THREE.Vector3(-7,  1.0, -14), new THREE.Vector3( 8,  2.0, -16),
  new THREE.Vector3(-5, -7.0, -15), new THREE.Vector3( 6, -3.0, -14),
  new THREE.Vector3(-3,  5.0, -16),
];

type NT = { pos: THREE.Vector3; scale: number; brightness: number };
type SC = { targets: Record<NID, NT>; edges: [NID, NID][] };

function cfg(
  active: Partial<Record<NID, { pos: [number, number, number]; s?: number; b?: number }>>,
  edges: [NID, NID][],
): SC {
  let bi = 0;
  const targets = {} as Record<NID, NT>;
  for (const id of NODE_IDS) {
    const a = active[id];
    targets[id] = a
      ? { pos: new THREE.Vector3(...a.pos), scale: (a.s ?? 1) * BASE[id], brightness: a.b ?? 1 }
      : { pos: BG[bi++ % BG.length].clone(), scale: BASE[id] * 0.14, brightness: 0.06 };
  }
  return { targets, edges };
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CONFIGURATIONS
   Every section tells a visual story about the tech stack.
───────────────────────────────────────────────────────────────────────────── */
const CONFIGS: Record<string, SC> = {

  /* ── HOME: Full galaxy — all 21 nodes, showing the whole picture ────────── */
  home: cfg({
    linux:      { pos: [ 0.5,  0.5,  2.5], s: 1.10 },
    docker:     { pos: [-0.5, -1.5,  2.0], s: 1.10 },
    aws:        { pos: [-3.0,  0.2, -0.5], s: 1.10 },
    ghactions:  { pos: [ 2.0, -1.0,  1.5] },
    git:        { pos: [ 0.2,  3.0, -0.5] },
    python:     { pos: [-2.2,  1.8,  0.5] },
    bash:       { pos: [-2.5, -0.5,  1.0] },
    nginx:      { pos: [-1.2, -2.5, -1.0] },
    prometheus: { pos: [ 1.5,  0.5, -2.5] },
    grafana:    { pos: [ 3.0, -0.5, -1.0] },
    ubuntu:     { pos: [-1.8,  0.8,  1.8] },
    fedora:     { pos: [ 1.5,  2.0,  0.8] },
    vim:        { pos: [-3.5,  1.5, -1.2], s: 0.85 },
    ssh:        { pos: [ 2.5,  2.5, -0.8], s: 0.85 },
    wireshark:  { pos: [-2.8, -1.5, -0.5] },
    owasp:      { pos: [ 0.8, -3.0, -1.5] },
    nmap:       { pos: [-0.5,  2.0, -2.8] },
    cpp:        { pos: [ 2.8,  1.2, -0.8] },
    java:       { pos: [-1.0,  2.5, -1.2] },
    sql:        { pos: [ 1.2, -2.8,  0.3] },
    vscode:     { pos: [ 3.0,  1.0,  0.2] },
  }, [
    /* Live backbone pipeline — always visible on hero */
    ["git",    "ghactions"],
    ["ghactions", "docker"],
    ["docker", "aws"],
    ["linux",  "docker"],
    ["linux",  "nginx"],
    ["prometheus", "grafana"],
  ]),

  /* ── STORY: Three discipline clusters ───────────────────────────────────── */
  story: cfg({
    /* Left — Systems & OS */
    linux:   { pos: [-4.0,  0.8,  0.0], s: 1.10 },
    ubuntu:  { pos: [-4.8, -0.3,  0.0] },
    fedora:  { pos: [-3.2, -0.9,  0.0] },
    bash:    { pos: [-4.4,  1.8,  0.0] },
    vim:     { pos: [-3.0,  1.9,  0.0], s: 0.85 },
    ssh:     { pos: [-5.0,  0.8,  0.0], s: 0.85 },
    /* Centre — DevOps & Cloud */
    docker:     { pos: [ 0.0,  0.8,  0.0], s: 1.10 },
    aws:        { pos: [-0.8, -0.5,  0.0], s: 1.10 },
    ghactions:  { pos: [ 0.8, -0.5,  0.0] },
    git:        { pos: [ 0.0,  2.0,  0.0] },
    nginx:      { pos: [ 1.4,  0.5,  0.0] },
    prometheus: { pos: [-1.4,  0.5,  0.0] },
    grafana:    { pos: [ 0.0, -1.4,  0.0] },
    /* Right — Dev & Security */
    python:    { pos: [ 4.0,  0.8,  0.0], s: 1.05 },
    cpp:       { pos: [ 4.8, -0.3,  0.0] },
    java:      { pos: [ 3.2, -0.9,  0.0] },
    sql:       { pos: [ 3.0,  1.9,  0.0] },
    vscode:    { pos: [ 4.4,  1.8,  0.0] },
    wireshark: { pos: [ 5.0,  0.8,  0.0] },
    owasp:     { pos: [ 3.5, -1.8,  0.0], s: 0.85 },
    nmap:      { pos: [ 4.8, -1.2,  0.0], s: 0.85 },
  }, [
    /* OS cluster */
    ["linux", "ubuntu"], ["linux", "fedora"], ["linux", "bash"],
    ["bash", "vim"], ["bash", "ssh"],
    /* DevOps cluster */
    ["git", "ghactions"], ["ghactions", "docker"], ["docker", "aws"],
    ["docker", "prometheus"], ["prometheus", "grafana"], ["nginx", "docker"],
    /* Dev/Security cluster */
    ["python", "vscode"], ["python", "sql"],
    ["wireshark", "nmap"], ["owasp", "wireshark"],
  ]),

  /* ── CRAFT: Live CI/CD pipeline flowing left → right ────────────────────── */
  craft: cfg({
    /* Stage 1 — Write code */
    python:  { pos: [-5.0,  0.5,  0.0], s: 1.05 },
    cpp:     { pos: [-5.0, -0.6,  0.0], s: 0.85 },
    vscode:  { pos: [-5.0,  1.6,  0.0], s: 0.85 },
    /* Stage 2 — Version control */
    git:     { pos: [-2.8,  0.0,  0.0], s: 1.10 },
    /* Stage 3 — CI runner */
    ghactions: { pos: [-0.8,  0.0,  0.0], s: 1.10 },
    bash:      { pos: [-0.8,  1.4,  0.0], s: 0.85 },
    /* Stage 4 — Containerise & serve */
    docker:  { pos: [ 1.4,  0.0,  0.0], s: 1.15 },
    nginx:   { pos: [ 1.4,  1.4,  0.0] },
    linux:   { pos: [ 1.4, -1.4,  0.0] },
    /* Stage 5 — Deploy to cloud */
    aws:     { pos: [ 3.6,  0.0,  0.0], s: 1.15 },
    ssh:     { pos: [ 3.6,  1.2,  0.0], s: 0.80 },
    /* Stage 6 — Observe */
    prometheus: { pos: [ 5.4,  0.6,  0.0], s: 0.95 },
    grafana:    { pos: [ 5.4, -0.6,  0.0], s: 0.95 },
  }, [
    /* Pipeline flow */
    ["python", "git"], ["cpp", "git"],
    ["git", "ghactions"], ["bash", "ghactions"],
    ["ghactions", "docker"],
    ["nginx", "docker"], ["linux", "docker"],
    ["docker", "aws"], ["ssh", "aws"],
    ["aws", "prometheus"], ["prometheus", "grafana"],
  ]),

  /* ── WORK 00 — ScholarStack: bare Linux server stack ───────────────────── */
  work_0: cfg({
    linux:      { pos: [ 0.0,  3.5,  0.0], s: 1.40 },
    nginx:      { pos: [ 0.0,  1.8,  0.0], s: 1.10 },
    python:     { pos: [ 2.0,  0.5, -0.5], s: 1.00 },
    bash:       { pos: [-2.0,  0.5, -0.5], s: 0.90 },
    ssh:        { pos: [ 2.2, -1.4, -0.5], s: 0.80 },
    grafana:    { pos: [-2.2, -1.4, -0.5], s: 0.80 },
    prometheus: { pos: [ 0.0, -1.6, -0.5], s: 0.85 },
    vim:        { pos: [ 0.0,  0.0,  0.0], s: 0.70, b: 0.65 },
  }, [
    ["linux", "nginx"],
    ["nginx", "python"], ["nginx", "bash"],
    ["linux", "python"], ["linux", "bash"],
    ["bash", "grafana"], ["python", "ssh"],
    ["grafana", "prometheus"],
  ]),

  /* ── WORK 01 — AgentForge: multi-agent AI orchestration ────────────────── */
  work_1: cfg({
    python:    { pos: [ 0.0,  0.0,  0.0], s: 1.20 }, /* FastAPI hub */
    aws:       { pos: [ 0.0,  2.5,  0.0], s: 1.15 }, /* Claude AI  */
    vscode:    { pos: [-2.6,  0.0,  0.0], s: 1.00 }, /* React       */
    docker:    { pos: [ 0.0, -2.3,  0.0], s: 1.00 }, /* Containers  */
    ghactions: { pos: [ 2.6,  0.0,  0.0], s: 0.90 }, /* JWT / TS    */
    sql:       { pos: [ 1.8, -1.6, -0.8], s: 0.90 }, /* SpacetimeDB */
    nginx:     { pos: [-1.8,  1.6, -0.8], s: 0.85 }, /* WebSocket   */
    linux:     { pos: [-1.6, -1.6, -1.0], s: 0.60, b: 0.50 },
  }, [
    ["aws",  "python"],     ["python", "vscode"],
    ["python", "docker"],  ["python", "ghactions"],
    ["docker", "sql"],     ["vscode", "ghactions"],
    ["nginx", "python"],   ["aws",    "nginx"],
  ]),

  /* ── WORK 02 — DevOps Lab: CI/CD pipeline ──────────────────────────────── */
  work_2: cfg({
    bash:      { pos: [-4.2,  0.0,  0.0], s: 0.80 },
    git:       { pos: [-3.0,  1.2, -0.5], s: 0.85 },
    ghactions: { pos: [-2.0,  0.0,  0.0], s: 1.00 },
    docker:    { pos: [ 0.2,  0.0,  0.0], s: 1.20 },
    aws:       { pos: [ 2.8,  0.0,  0.0], s: 1.10 },
    prometheus:{ pos: [ 0.8,  2.2,  0.0], s: 1.05 },
    grafana:   { pos: [ 2.0,  2.2,  0.0], s: 1.05 },
    linux:     { pos: [-4.2, -1.6, -0.8], s: 0.65, b: 0.60 },
  }, [
    ["bash", "ghactions"], ["git", "ghactions"],
    ["ghactions", "docker"],
    ["docker", "aws"], ["docker", "prometheus"],
    ["prometheus", "grafana"], ["aws", "grafana"],
  ]),

  /* ── WORK 03 — Network Traffic Analyser: packet-level stack ────────────── */
  work_3: cfg({
    python:    { pos: [ 0.0,  2.5,  0.0], s: 1.10 },
    bash:      { pos: [-2.0,  2.3, -0.5], s: 0.85, b: 0.85 },
    grafana:   { pos: [ 2.0,  2.3, -0.5], s: 0.85, b: 0.85 },
    wireshark: { pos: [ 0.0,  0.0,  0.0], s: 1.30 },
    nmap:      { pos: [-1.5, -1.0,  0.0], s: 1.00 },
    owasp:     { pos: [ 1.5, -1.0,  0.0], s: 0.90 },
    linux:     { pos: [ 0.0, -2.5, -0.5], s: 1.00 },
    ssh:       { pos: [-2.2,  0.5, -0.5], s: 0.80 },
  }, [
    ["python", "wireshark"], ["wireshark", "linux"],
    ["bash",   "wireshark"], ["grafana",   "python"],
    ["nmap",   "wireshark"], ["owasp",     "nmap"],
    ["ssh",    "linux"],
  ]),

  /* ── WORK 04 — Mentorship Algorithm: decision-tree ML ──────────────────── */
  work_4: cfg({
    python:  { pos: [ 0.0,  2.8,  0.0], s: 1.10 },
    aws:     { pos: [-1.8,  1.0,  0.0], s: 1.00 }, /* Decision trees / AI */
    grafana: { pos: [ 1.8,  1.0,  0.0], s: 1.00 }, /* Data visualisation  */
    bash:    { pos: [-3.2, -0.8,  0.0], s: 0.80 },
    sql:     { pos: [-1.0, -0.8,  0.0], s: 0.80 },
    git:     { pos: [ 1.0, -0.8,  0.0], s: 0.80 },
    vscode:  { pos: [ 3.2, -0.8,  0.0], s: 0.80 },
  }, [
    ["python", "aws"],   ["python", "grafana"],
    ["aws",  "bash"],    ["aws",    "sql"],
    ["grafana", "git"],  ["grafana", "vscode"],
  ]),

  /* ── WORK 05 — MediGuard: full-stack healthcare ─────────────────────────── */
  work_5: cfg({
    vscode:  { pos: [-1.6,  2.4,  0.0], s: 1.05 }, /* React frontend */
    java:    { pos: [ 1.6,  2.4,  0.0], s: 0.90 }, /* JavaScript     */
    nginx:   { pos: [ 0.8,  0.0,  0.0], s: 1.00 }, /* REST API       */
    python:  { pos: [-0.8,  0.0,  0.0], s: 1.10 }, /* Node.js        */
    sql:     { pos: [ 0.0, -2.4,  0.0], s: 1.00 }, /* MongoDB        */
    git:     { pos: [-2.2, -0.5,  0.0], s: 0.85 },
    docker:  { pos: [ 2.2, -0.5,  0.0], s: 0.85 },
  }, [
    ["vscode", "nginx"], ["java", "nginx"],
    ["nginx", "python"], ["python", "sql"],
    ["nginx", "sql"],    ["git", "python"], ["docker", "nginx"],
  ]),

  /* ── WORK 06 — Timetable Maker: static frontend ─────────────────────────── */
  work_6: cfg({
    vscode: { pos: [ 0.0,  2.2,  0.0], s: 1.00 },
    java:   { pos: [-2.0, -0.8,  0.0], s: 1.00 }, /* JavaScript */
    bash:   { pos: [ 2.0, -0.8,  0.0], s: 1.00 }, /* CSS        */
    aws:    { pos: [ 0.0, -2.6,  0.0], s: 0.85 }, /* Vercel     */
    git:    { pos: [ 0.0,  0.0, -1.0], s: 0.80 },
  }, [
    ["vscode", "java"], ["vscode", "bash"],
    ["java", "bash"],   ["bash", "aws"], ["git", "vscode"],
  ]),

  /* ── STACK: Full galaxy — all 21 nodes bright and spread ──────────────── */
  stack: cfg({
    linux:      { pos: [-3.5,  1.0,  1.5] },
    docker:     { pos: [ 3.2, -1.0, -1.5] },
    aws:        { pos: [ 1.5, -2.8, -1.0] },
    ghactions:  { pos: [-0.5, -3.2,  0.8] },
    git:        { pos: [-2.5, -0.5, -2.5] },
    python:     { pos: [-1.5, -0.5,  3.5] },
    bash:       { pos: [-1.2, -2.8, -1.5] },
    nginx:      { pos: [-3.0, -1.5,  1.0] },
    prometheus: { pos: [ 2.8,  2.0,  1.2] },
    grafana:    { pos: [-1.0,  0.8, -3.2] },
    ubuntu:     { pos: [-3.2,  1.8, -0.8] },
    fedora:     { pos: [ 1.0,  3.2, -1.2], s: 0.85 },
    vim:        { pos: [ 0.5,  2.5,  2.8] },
    ssh:        { pos: [ 0.8, -1.5,  3.0] },
    wireshark:  { pos: [-1.8,  3.0, -0.5] },
    owasp:      { pos: [ 3.5, -0.5, -1.8] },
    nmap:       { pos: [-2.5,  0.5,  2.2] },
    cpp:        { pos: [ 2.8,  1.8, -0.5] },
    java:       { pos: [-2.0,  2.8,  0.8] },
    sql:        { pos: [ 2.0, -2.5,  1.0] },
    vscode:     { pos: [ 1.2,  1.5,  3.2] },
  }, [
    ["linux",  "docker"], ["linux",  "aws"],
    ["docker", "aws"],    ["ghactions", "docker"],
    ["git",    "ghactions"],
    ["prometheus", "grafana"], ["nginx", "linux"],
    ["python", "vscode"], ["owasp", "wireshark"],
  ]),

  /* ── PROCESS: Methodical 4-column grid ─────────────────────────────────── */
  process: cfg({
    /* Row 1 — Infra core */
    linux:      { pos: [-4.0,  1.5,  0.0] },
    docker:     { pos: [-1.5,  1.5,  0.0] },
    aws:        { pos: [ 1.0,  1.5,  0.0] },
    git:        { pos: [ 3.5,  1.5,  0.0] },
    /* Row 2 — Automation + observe */
    bash:       { pos: [-4.0,  0.0,  0.0] },
    ghactions:  { pos: [-1.5,  0.0,  0.0] },
    prometheus: { pos: [ 1.0,  0.0,  0.0] },
    grafana:    { pos: [ 3.5,  0.0,  0.0] },
    /* Row 3 — Dev stack */
    python:     { pos: [-4.0, -1.5,  0.0] },
    java:       { pos: [-1.5, -1.5,  0.0] },
    vscode:     { pos: [ 1.0, -1.5,  0.0] },
    nginx:      { pos: [ 3.5, -1.5,  0.0] },
    /* Supporting — dim background layer */
    ubuntu:     { pos: [-2.8,  0.8, -1.5], s: 0.70, b: 0.60 },
    fedora:     { pos: [ 2.5,  0.8, -1.5], s: 0.70, b: 0.60 },
    ssh:        { pos: [-2.8, -0.7, -1.5], s: 0.70, b: 0.60 },
    vim:        { pos: [ 2.5, -0.7, -1.5], s: 0.70, b: 0.60 },
    wireshark:  { pos: [ 0.0,  0.0, -2.5], s: 0.70, b: 0.60 },
    owasp:      { pos: [ 0.0, -2.5,  0.0], s: 0.70, b: 0.60 },
    nmap:       { pos: [ 0.0,  2.5,  0.0], s: 0.70, b: 0.60 },
    sql:        { pos: [-2.8,  2.0, -1.0], s: 0.70, b: 0.60 },
    cpp:        { pos: [ 2.5,  2.0, -1.0], s: 0.70, b: 0.60 },
  }, [
    ["linux",  "docker"],  ["docker", "aws"],  ["aws",  "git"],
    ["bash",   "ghactions"], ["ghactions", "prometheus"], ["prometheus", "grafana"],
    ["linux",  "bash"],    ["docker", "ghactions"],
    ["aws",    "prometheus"], ["git",  "grafana"],
  ]),

  /* ── RESUME: Structured showcase grid ─────────────────────────────────── */
  resume: cfg({
    linux:      { pos: [-3.0,  1.5,  0.0] },
    docker:     { pos: [-3.0,  0.0,  0.0] },
    ghactions:  { pos: [-3.0, -1.5,  0.0] },
    python:     { pos: [ 0.0,  1.5,  0.0] },
    vscode:     { pos: [ 0.0,  0.0,  0.0] },
    prometheus: { pos: [ 0.0, -1.5,  0.0] },
    aws:        { pos: [ 3.0,  1.5,  0.0] },
    nginx:      { pos: [ 3.0,  0.0,  0.0] },
    git:        { pos: [ 3.0, -1.5,  0.0] },
    /* Dim supporting ring */
    bash:       { pos: [-1.5,  0.7, -1.5], s: 0.70, b: 0.60 },
    grafana:    { pos: [ 1.5,  0.7, -1.5], s: 0.70, b: 0.60 },
    ssh:        { pos: [-1.5, -0.7, -1.5], s: 0.70, b: 0.60 },
    java:       { pos: [ 1.5, -0.7, -1.5], s: 0.70, b: 0.60 },
    sql:        { pos: [ 0.0,  0.0, -2.0], s: 0.70, b: 0.60 },
    ubuntu:     { pos: [-1.5,  2.0, -0.8], s: 0.70, b: 0.60 },
    fedora:     { pos: [ 1.5,  2.0, -0.8], s: 0.70, b: 0.60 },
    vim:        { pos: [-1.5, -2.0, -0.8], s: 0.70, b: 0.60 },
    wireshark:  { pos: [ 1.5, -2.0, -0.8], s: 0.70, b: 0.60 },
    owasp:      { pos: [-3.5,  2.5, -1.0], s: 0.60, b: 0.50 },
    nmap:       { pos: [ 3.5,  2.5, -1.0], s: 0.60, b: 0.50 },
    cpp:        { pos: [ 0.0,  3.0, -1.5], s: 0.70, b: 0.60 },
  }, [
    ["linux",  "docker"],    ["docker", "ghactions"],
    ["python", "vscode"],    ["vscode", "prometheus"],
    ["aws",    "nginx"],     ["nginx",  "git"],
    ["linux",  "python"],    ["python", "aws"],
    ["ghactions", "prometheus"], ["prometheus", "git"],
  ]),

  /* ── CONTACT: All nodes pull into a tight cluster ───────────────────────── */
  contact: cfg({
    linux:      { pos: [-0.8,  0.5,  0.2] },
    docker:     { pos: [ 1.0, -0.2, -0.5] },
    aws:        { pos: [ 0.5, -0.8, -0.3] },
    ghactions:  { pos: [-0.2, -1.0,  0.3] },
    git:        { pos: [-0.7, -0.1, -0.6] },
    python:     { pos: [-0.4,  0.7,  0.5] },
    bash:       { pos: [-0.3, -0.9, -0.4] },
    nginx:      { pos: [ 0.9, -0.5,  0.2] },
    prometheus: { pos: [ 0.7,  0.9,  0.0] },
    grafana:    { pos: [-0.3,  0.3, -0.9] },
    ubuntu:     { pos: [-0.9,  0.8, -0.3] },
    fedora:     { pos: [ 0.3,  1.0,  0.1] },
    vim:        { pos: [ 0.2,  0.6,  0.8] },
    ssh:        { pos: [ 0.4, -0.3,  0.9] },
    wireshark:  { pos: [-0.8, -0.5,  0.2] },
    owasp:      { pos: [ 0.6, -0.7,  0.5] },
    nmap:       { pos: [-0.2,  0.9, -0.5] },
    cpp:        { pos: [ 0.6,  0.8, -0.3] },
    java:       { pos: [-0.5, -0.7,  0.4] },
    sql:        { pos: [ 0.7, -0.6, -0.4] },
    vscode:     { pos: [ 0.9,  0.4, -0.7] },
  }, []),
};

/* ── Config key resolver ─────────────────────────────────────────────────── */
function getKey(): string {
  const { section, activeProject } = scrollState;
  if (section === "work" && activeProject >= 0 && activeProject <= 6)
    return `work_${activeProject}`;
  if (section === "craft")   return "craft";
  if (section === "story")   return "story";
  if (section === "process") return "process";
  if (section === "resume")  return "resume";
  if (section === "contact") return "contact";
  if (section === "stack")   return "stack";
  return "home";
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAX_EDGES — enough for story (15 edges)
───────────────────────────────────────────────────────────────────────────── */
const MAX_EDGES = 16;

/* ─────────────────────────────────────────────────────────────────────────────
   DeepStarfield — three parallax depth layers that react to scroll
   Far stars barely shift; near stars shift fast → convincing 3D depth.
───────────────────────────────────────────────────────────────────────────── */
function DeepStarfield() {
  const tRef = useRef(0);

  const layers = useMemo(() => {
    // [count, xzSpread, zMin, zMax, size, color, opacity, parallaxY, driftSpeed]
    const specs = [
      { n: 340, spread: 56, zMin: 22, zMax: 50, sz: 0.008, col: "#3a5f88", op: 0.22, prlx: 0.4, spd: 0.0028 },
      { n: 215, spread: 42, zMin: 11, zMax: 22, sz: 0.014, col: "#7aabcc", op: 0.36, prlx: 1.0, spd: 0.0065 },
      { n: 85,  spread: 28, zMin: 4,  zMax: 11, sz: 0.020, col: "#b8d8f0", op: 0.50, prlx: 1.8, spd: 0.0120 },
    ] as const;

    return specs.map(({ n, spread, zMin, zMax, sz, col, op, prlx, spd: speed }) => {
      const halfY = spread * 0.60;
      const base  = new Float32Array(n * 3);
      const spd   = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        base[i * 3]     = (Math.random() - 0.5) * spread;
        base[i * 3 + 1] = (Math.random() - 0.5) * halfY * 2;
        base[i * 3 + 2] = -(zMin + Math.random() * (zMax - zMin));
        spd[i]           = speed * (0.5 + Math.random());
      }
      const cur  = new Float32Array(base);
      const attr = new THREE.BufferAttribute(cur, 3);
      attr.setUsage(THREE.DynamicDrawUsage);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", attr);
      const mat = new THREE.PointsMaterial({
        size: sz, color: col, transparent: true, opacity: op,
        sizeAttenuation: true, depthWrite: false,
      });
      return { pts: new THREE.Points(geo, mat), geo, mat, base, n, prlx, halfY, spd };
    });
  }, []);

  useEffect(
    () => () => layers.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); }),
    [layers],
  );

  useFrame((_, delta) => {
    const k = heroMotion.reducedMotion ? 0.2 : 1;
    tRef.current += delta * k;
    const t    = tRef.current;
    const prog = scrollState.progress;

    layers.forEach(({ geo, base, n, prlx, halfY, spd }) => {
      const pShift = prog * prlx * k;                          // parallax bias (upward with scroll)
      const attr   = geo.attributes.position as THREE.BufferAttribute;
      const arr    = attr.array as Float32Array;
      for (let i = 0; i < n; i++) {
        // Continuous upward drift + parallax offset, wrapped to [-halfY, halfY)
        const rawY  = base[i * 3 + 1] + pShift + spd[i] * t * 30 * k;
        const range = halfY * 2;
        arr[i * 3 + 1] = ((rawY + halfY) % range + range) % range - halfY;
      }
      attr.needsUpdate = true;
    });
  });

  return <>{layers.map((l, i) => <primitive key={i} object={l.pts} />)}</>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   WarpGrid — perspective floor grid that flows forward.
   Scroll velocity boosts speed for a "warp drive" feeling.
   Also owns the scroll-velocity decay so it runs before SceneContent.
───────────────────────────────────────────────────────────────────────────── */
function WarpGrid() {
  // Grid geometry constants
  const W     = 28;   // world-unit width
  const D     = 38;   // world-unit depth
  const XSTEP = 12;   // longitudinal lines (run along Z)
  const ZSTEP = 30;   // lateral lines      (run along X, scroll toward viewer)
  const CELL  = D / ZSTEP;
  const Y     = -4.2;

  // Buffer: (XSTEP+1) longitudinal + (ZSTEP+1) lateral, 2 pts each
  const TOTAL = ((XSTEP + 1) + (ZSTEP + 1)) * 2;

  const geo = useMemo(() => {
    const arr  = new Float32Array(TOTAL * 3);
    const attr = new THREE.BufferAttribute(arr, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", attr);
    return g;
  }, []);

  const mat = useMemo(() => new THREE.LineBasicMaterial({
    color: "#0c3a6e", transparent: true, opacity: 0.08, toneMapped: false,
  }), []);

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  useFrame((state, delta) => {
    // ── Velocity decay lives here (WarpGrid runs before SceneContent) ────────
    scrollVelState.damped += (scrollVelState.raw - scrollVelState.damped) *
      Math.min(delta * 8, 0.15);
    scrollVelState.raw *= Math.max(0, 1 - delta * 7);

    const t     = state.clock.getElapsedTime();
    const prog  = scrollState.progress;
    const vel   = Math.abs(scrollVelState.damped);
    const mk    = heroMotion.reducedMotion ? 0.25 : 1;
    const boost = Math.min(vel * 0.38, 2.0) * mk;            // up to 2× speed on fast scroll

    // Offset scrolls forward over time; scroll velocity gives an instant kick
    const offset = ((t * (0.28 + boost) * mk + prog * 10 * mk) % CELL + CELL) % CELL;

    const attr = geo.attributes.position as THREE.BufferAttribute;
    const arr  = attr.array as Float32Array;
    let   idx  = 0;

    // Longitudinal lines (X-spread, run into distance)
    for (let i = 0; i <= XSTEP; i++) {
      const x = -W / 2 + (i / XSTEP) * W;
      arr[idx++] = x; arr[idx++] = Y; arr[idx++] = 3 - offset;
      arr[idx++] = x; arr[idx++] = Y; arr[idx++] = 3 - offset - D;
    }
    // Lateral lines (left-right bands streaming toward viewer)
    for (let i = 0; i <= ZSTEP; i++) {
      const z = 3 - offset - (i / ZSTEP) * D;
      arr[idx++] = -W / 2; arr[idx++] = Y; arr[idx++] = z;
      arr[idx++] =  W / 2; arr[idx++] = Y; arr[idx++] = z;
    }

    attr.needsUpdate = true;

    // Opacity surges subtly on fast scroll then settles
    mat.opacity =
      (0.06 + Math.min(boost * 0.022, 0.06) + Math.sin(t * 0.42) * 0.012) * (0.55 + mk * 0.45);
  });

  return <lineSegments geometry={geo} material={mat} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SceneContent — all 21 nodes + edges + data packets in one tight useFrame
───────────────────────────────────────────────────────────────────────────── */
function SceneContent() {
  const rigRef = useRef<Group>(null);
  const tRef   = useRef(0);

  /* ── Node InstancedMesh ─────────────────────────────────────────────────── */
  const nodeMesh = useRef<InstancedMesh>(null);
  const dummy    = useMemo(() => new THREE.Object3D(), []);

  const curPos    = useRef(NODE_IDS.map((id) => CONFIGS.home.targets[id].pos.clone()));
  const curScale  = useRef(NODE_IDS.map((id) => CONFIGS.home.targets[id].scale));
  const curBright = useRef(NODE_IDS.map(() => 1.0));
  const rotEuler  = useRef(
    NODE_IDS.map((_, i) => new THREE.Euler(
      (i * 1.37) % (Math.PI * 2),
      (i * 2.61) % (Math.PI * 2),
      (i * 0.72) % (Math.PI * 2),
    )),
  );

  /* ── Edge geometry ──────────────────────────────────────────────────────── */
  const edgeBuf = useMemo(() => {
    const arr  = new Float32Array(MAX_EDGES * 6);
    const attr = new THREE.BufferAttribute(arr, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    const geo  = new THREE.BufferGeometry();
    geo.setAttribute("position", attr);
    return { arr, attr, geo };
  }, []);

  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({
    color:       "#6699cc",
    transparent: true,
    opacity:     0,
    toneMapped:  false,
  }), []);

  const edgeLines = useMemo(
    () => new THREE.LineSegments(edgeBuf.geo, edgeMat),
    [edgeBuf.geo, edgeMat],
  );
  const edgeOp = useRef(0);

  /* ── Packet InstancedMesh ───────────────────────────────────────────────── */
  const pktMesh  = useRef<InstancedMesh>(null);
  const pktDummy = useMemo(() => new THREE.Object3D(), []);
  const pktProg  = useRef(Array.from({ length: MAX_EDGES }, (_, i) => i / MAX_EDGES));
  const pktSpeed = useMemo(
    () => Array.from({ length: MAX_EDGES }, (_, i) => 0.15 + (i * 0.011) % 0.058),
    [],
  );
  const prevKey = useRef("home");
  const tmpCol  = useMemo(() => new THREE.Color(), []);

  /* ── Cleanup ────────────────────────────────────────────────────────────── */
  useEffect(() => () => {
    edgeBuf.geo.dispose();
    edgeMat.dispose();
  }, [edgeBuf.geo, edgeMat]);

  /* ── Init instance colors from brand palette ────────────────────────────── */
  useEffect(() => {
    const nm = nodeMesh.current;
    const pm = pktMesh.current;
    if (!nm) return;

    NODE_IDS.forEach((id, i) => { nm.setColorAt(i, tmpCol.set(COLOR[id])); });
    if (nm.instanceColor) nm.instanceColor.needsUpdate = true;

    if (pm) {
      for (let e = 0; e < MAX_EDGES; e++) pm.setColorAt(e, tmpCol.set("#88aaff"));
      if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const refreshPktColors = (edges: [NID, NID][]) => {
    const pm = pktMesh.current;
    if (!pm) return;
    const c2 = new THREE.Color();
    for (let e = 0; e < MAX_EDGES; e++) {
      const edge = edges[e];
      if (edge) tmpCol.set(COLOR[edge[0]]).lerp(c2.set(COLOR[edge[1]]), 0.5);
      else      tmpCol.set("#223344");
      pm.setColorAt(e, tmpCol);
    }
    if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
  };

  /* ── Main useFrame ──────────────────────────────────────────────────────── */
  useFrame((state, delta) => {
    tRef.current += delta;
    const t    = tRef.current;
    const prog = scrollState.progress;

    const mk = heroMotion.reducedMotion ? 0.22 : 1;

    /* Rig: slow rotation + mouse parallax tilt */
    const rig = rigRef.current;
    if (rig) {
      rig.rotation.y += delta * 0.034 * mk;
      rig.rotation.x  = (Math.sin(t * 0.07) * 0.032 + mouseState.y * 0.055) * mk;
      rig.rotation.z  = mouseState.x * 0.038 * mk;
      rig.position.y  = THREE.MathUtils.damp(rig.position.y,  prog * 0.65 * mk, 3, delta);
      rig.position.z  = THREE.MathUtils.damp(rig.position.z, -prog * 1.15 * mk, 3, delta);
    }

    /* Camera: subtle drift + mouse parallax */
    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      (Math.sin(t * 0.09) * 0.20 + mouseState.x * 0.32) * mk,
      2, delta,
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      1.8 - mouseState.y * 0.22 * mk,
      2, delta,
    );
    state.camera.lookAt(0, 0, 0);

    /* Resolve config */
    const key    = getKey();
    const config = CONFIGS[key] ?? CONFIGS.home;
    const s      = Math.min(delta * 60 * 0.021, 0.19);

    if (key !== prevKey.current) {
      refreshPktColors(config.edges);
      prevKey.current = key;
    }

    /* Update all 21 nodes */
    const nm = nodeMesh.current;
    if (!nm) return;

    for (let i = 0; i < N; i++) {
      const id     = NODE_IDS[i];
      const target = config.targets[id];
      const sp     = SPIN[id];

      curPos.current[i].lerp(target.pos, s);
      curScale.current[i]  += (target.scale      - curScale.current[i])  * s;
      curBright.current[i] += (target.brightness - curBright.current[i]) * s;

      rotEuler.current[i].x += sp[0] * delta;
      rotEuler.current[i].y += sp[1] * delta;
      rotEuler.current[i].z += sp[2] * delta;

      dummy.position.copy(curPos.current[i]);
      dummy.rotation.copy(rotEuler.current[i]);
      dummy.scale.setScalar(curScale.current[i]);
      dummy.updateMatrix();
      nm.setMatrixAt(i, dummy.matrix);

      nm.setColorAt(i, tmpCol.set(COLOR[id]).multiplyScalar(curBright.current[i]));
    }
    nm.instanceMatrix.needsUpdate = true;
    if (nm.instanceColor) nm.instanceColor.needsUpdate = true;

    /* Edges */
    const edges = config.edges;
    const tgtOp = edges.length > 0 ? 0.24 : 0;
    edgeOp.current += (tgtOp - edgeOp.current) * s;
    edgeMat.opacity = edgeOp.current;

    for (let e = 0; e < MAX_EDGES; e++) {
      const base = e * 6;
      const edge = edges[e];
      if (edge) {
        const ai = NODE_IDS.indexOf(edge[0]);
        const bi = NODE_IDS.indexOf(edge[1]);
        const pa = curPos.current[ai];
        const pb = curPos.current[bi];
        edgeBuf.arr[base]     = pa.x; edgeBuf.arr[base + 1] = pa.y; edgeBuf.arr[base + 2] = pa.z;
        edgeBuf.arr[base + 3] = pb.x; edgeBuf.arr[base + 4] = pb.y; edgeBuf.arr[base + 5] = pb.z;
      } else {
        edgeBuf.arr.fill(0, base, base + 6);
      }
    }
    edgeBuf.attr.needsUpdate = true;

    /* Data packets racing along active edges */
    const pm = pktMesh.current;
    if (pm) {
      for (let e = 0; e < MAX_EDGES; e++) {
        pktProg.current[e] = (pktProg.current[e] + delta * pktSpeed[e]) % 1;
        const edge = edges[e];
        if (edge) {
          const ai = NODE_IDS.indexOf(edge[0]);
          const bi = NODE_IDS.indexOf(edge[1]);
          pktDummy.position.lerpVectors(
            curPos.current[ai], curPos.current[bi], pktProg.current[e],
          );
          pktDummy.scale.setScalar(1);
        } else {
          pktDummy.position.set(0, 0, -999);
          pktDummy.scale.setScalar(0);
        }
        pktDummy.updateMatrix();
        pm.setMatrixAt(e, pktDummy.matrix);
      }
      pm.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={rigRef}>
      {/* Connection lines */}
      <primitive object={edgeLines} />

      {/* Tech nodes — spinning icosahedra with brand vertex colors */}
      <instancedMesh ref={nodeMesh} args={[undefined, undefined, N]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          vertexColors
          emissive="#aaddff"
          emissiveIntensity={0.55}
          metalness={0.72}
          roughness={0.08}
          envMapIntensity={1.4}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Data packets gliding along edges */}
      <instancedMesh ref={pktMesh} args={[undefined, undefined, MAX_EDGES]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <meshBasicMaterial vertexColors toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Canvas — performance-tuned, alpha for vignette overlay to show through
───────────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────────
   NebulaCloud — large soft glowing orbs that drift and pulse, creating
   a deep-space aurora effect behind the tech constellation.
───────────────────────────────────────────────────────────────────────────── */
function NebulaCloud() {
  const tRef = useRef(0);

  const orbs = useMemo(() => {
    const specs = [
      { pos: [-6,  2, -18], col: "#1a3a8f", sz: 7.5, spd: 0.18, phase: 0.0 },
      { pos: [ 7, -1, -20], col: "#0f2d6e", sz: 9.0, spd: 0.12, phase: 1.2 },
      { pos: [-2,  5, -22], col: "#2a1a6e", sz: 8.0, spd: 0.22, phase: 2.4 },
      { pos: [ 4,  3, -16], col: "#0e3a5c", sz: 6.5, spd: 0.15, phase: 0.8 },
      { pos: [-8, -3, -19], col: "#1e1060", sz: 7.0, spd: 0.20, phase: 3.1 },
      { pos: [ 2, -5, -24], col: "#0a2850", sz: 10.0, spd: 0.10, phase: 1.7 },
    ] as const;

    return specs.map(({ pos, col, sz, spd, phase }) => {
      const geo = new THREE.SphereGeometry(sz, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.0,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      return { mesh, geo, mat, spd, phase, baseOpacity: 0.055 + Math.random() * 0.04 };
    });
  }, []);

  useEffect(() => () => orbs.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); }), [orbs]);

  useFrame((_, delta) => {
    const k = heroMotion.reducedMotion ? 0.35 : 1;
    tRef.current += delta * k;
    const t = tRef.current;
    orbs.forEach(({ mat, spd, phase, baseOpacity }) => {
      mat.opacity = baseOpacity * (0.7 + 0.3 * Math.sin(t * spd + phase));
    });
  });

  return <>{orbs.map((o, i) => <primitive key={i} object={o.mesh} />)}</>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   AuroraRings — large translucent torus rings that slowly rotate,
   giving a cinematic depth-of-field halo effect.
───────────────────────────────────────────────────────────────────────────── */
function AuroraRings() {
  const tRef = useRef(0);

  const rings = useMemo(() => {
    const specs = [
      { r: 12, tube: 0.06, col: "#3a8fff", op: 0.07, rx: 1.2, ry: 0.3, rz: 0.0, spd: 0.04, z: -8 },
      { r: 18, tube: 0.05, col: "#7b3fff", op: 0.05, rx: 0.8, ry: 0.6, rz: 0.2, spd: 0.025, z: -12 },
      { r: 9,  tube: 0.08, col: "#ff6aa6", op: 0.06, rx: 1.5, ry: 0.1, rz: 0.4, spd: 0.06, z: -5 },
      { r: 24, tube: 0.04, col: "#00d4ff", op: 0.04, rx: 0.5, ry: 0.9, rz: 0.1, spd: 0.018, z: -16 },
    ] as const;

    return specs.map(({ r, tube, col, op, rx, ry, rz, spd, z }) => {
      const geo = new THREE.TorusGeometry(r, tube, 6, 80);
      const mat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: op,
        depthWrite: false, blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(rx, ry, rz);
      mesh.position.z = z;
      return { mesh, geo, mat, spd };
    });
  }, []);

  useEffect(() => () => rings.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); }), [rings]);

  useFrame((_, delta) => {
    const k = heroMotion.reducedMotion ? 0.2 : 1;
    tRef.current += delta * k;
    rings.forEach(({ mesh, spd }) => {
      mesh.rotation.y += delta * spd * k;
      mesh.rotation.z += delta * spd * 0.6 * k;
    });
  });

  return <>{rings.map((r, i) => <primitive key={i} object={r.mesh} />)}</>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   FloatingHexGrid — a subtle hex-pattern plane that drifts upward,
   giving a sci-fi HUD / holographic floor feel.
───────────────────────────────────────────────────────────────────────────── */
function FloatingHexGrid() {
  const tRef = useRef(0);
  const linesRef = useRef<LineSegments>(null);

  const { geo, mat } = useMemo(() => {
    const positions: number[] = [];
    const HEX_R = 0.38;
    const cols = 16, rows = 10;
    const colW = HEX_R * 2 * 0.87;
    const rowH = HEX_R * 1.5;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xOff = (row % 2) * colW * 0.5;
        const cx = (col - cols / 2) * colW + xOff;
        const cy = (row - rows / 2) * rowH;
        // Hexagon outline (6 line segments)
        for (let s = 0; s < 6; s++) {
          const a0 = (s / 6) * Math.PI * 2;
          const a1 = ((s + 1) / 6) * Math.PI * 2;
          positions.push(
            cx + Math.cos(a0) * HEX_R, cy + Math.sin(a0) * HEX_R, 0,
            cx + Math.cos(a1) * HEX_R, cy + Math.sin(a1) * HEX_R, 0,
          );
        }
      }
    }

    const arr  = new Float32Array(positions);
    const attr = new THREE.BufferAttribute(arr, 3);
    const g    = new THREE.BufferGeometry();
    g.setAttribute("position", attr);
    const m = new THREE.LineBasicMaterial({
      color: "#1a4a8a", transparent: true, opacity: 0.055,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    return { geo: g, mat: m };
  }, []);

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  useFrame((_, delta) => {
    const k = heroMotion.reducedMotion ? 0.15 : 1;
    tRef.current += delta * k;
    const t    = tRef.current;
    const prog = scrollState.progress;
    const yOff = ((t * 0.12 + prog * 4 * k) % 8) - 4;
    const mesh = linesRef.current;
    if (mesh) {
      mesh.position.y = yOff - 3;
      const m = mesh.material as THREE.LineBasicMaterial;
      m.opacity = 0.04 + Math.sin(t * 0.3) * 0.015 * k;
    }
  });

  return (
    <lineSegments
      ref={linesRef}
      geometry={geo}
      material={mat}
      position={[0, -3, -4]}
      rotation={[Math.PI * 0.08, 0, 0]}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ScanLine — a single horizontal glowing line that sweeps top-to-bottom
   like a radar/holographic scan, adding a cinematic HUD feel.
───────────────────────────────────────────────────────────────────────────── */
function ScanLine() {
  const tRef = useRef(0);
  const meshRef = useRef<THREE.Mesh>(null);

  const { geo, mat } = useMemo(() => {
    const g = new THREE.PlaneGeometry(40, 0.012);
    const m = new THREE.MeshBasicMaterial({
      color: "#7bdcff", transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    return { geo: g, mat: m };
  }, []);

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  useFrame((_, delta) => {
    if (heroMotion.reducedMotion) {
      mat.opacity = 0;
      return;
    }
    tRef.current += delta;
    const t = tRef.current;
    const mesh = meshRef.current;
    if (!mesh) return;
    const cycle = (t % 6) / 6;
    mesh.position.y = 8 - cycle * 16;
    const fade = Math.sin(cycle * Math.PI);
    mat.opacity = fade * 0.12;
  });

  return <mesh ref={meshRef} geometry={geo} material={mat} position={[0, 8, -2]} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   DataHelix — double-helix point streams suggesting “systems wiring”; slow,
   readable motion that stays behind the tech constellation (memorable motif).
───────────────────────────────────────────────────────────────────────────── */
function DataHelix() {
  const groupRef = useRef<Group>(null);
  const tRef = useRef(0);

  const strands = useMemo(() => {
    const make = (phase: number, radius: number, z0: number, color: string, n: number) => {
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        const t = u * Math.PI * 6 + phase;
        const y = (u - 0.5) * 11;
        const r = radius * (0.65 + 0.35 * Math.sin(u * Math.PI));
        pos[i * 3] = Math.cos(t) * r;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = Math.sin(t) * r + z0;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });
      const pts = new THREE.Points(geo, mat);
      return { pts, geo, mat };
    };

    return [
      make(0, 3.4, -13.5, "#38bdf8", 420),
      make(Math.PI, 3.1, -14.2, "#c084fc", 380),
    ];
  }, []);

  useEffect(
    () => () => strands.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); }),
    [strands],
  );

  useFrame((_, delta) => {
    const k = heroMotion.reducedMotion ? 0.08 : 1;
    tRef.current += delta * k;
    const g = groupRef.current;
    if (g) {
      g.rotation.y = tRef.current * 0.11;
      g.rotation.x = Math.sin(tRef.current * 0.09) * 0.06 * k;
      const mx = mouseState.x * 0.04 * k;
      const my = mouseState.y * 0.03 * k;
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, mx * 0.15, 0.02);
      g.position.x = THREE.MathUtils.lerp(g.position.x, mx * 0.35, 0.03);
      g.position.y = THREE.MathUtils.lerp(g.position.y, my * 0.22, 0.03);
    }
  });

  return (
    <group ref={groupRef} position={[0.4, 0.2, 0]}>
      {strands.map((s, i) => (
        <primitive key={i} object={s.pts} />
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PrismaticOrbitals — large wireframe forms + soft inner glow; “signature”
   depth layer visitors notice without competing with hero copy.
───────────────────────────────────────────────────────────────────────────── */
function PrismaticOrbitals() {
  const groupRef = useRef<Group>(null);

  const meshes = useMemo(() => {
    type Spec = {
      geo: THREE.BufferGeometry;
      mat: THREE.MeshBasicMaterial;
      mesh: THREE.Mesh;
      spin: [number, number, number];
      pos: [number, number, number];
      scl: number;
    };
    const out: Spec[] = [];

    const add = (
      geometry: THREE.BufferGeometry,
      color: string,
      opacity: number,
      pos: [number, number, number],
      scl: number,
      spin: [number, number, number],
    ) => {
      const mat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...pos);
      mesh.scale.setScalar(scl);
      out.push({ geo: geometry, mat, mesh, spin, pos, scl });
    };

    add(new THREE.IcosahedronGeometry(1.25, 1), "#7dd3fc", 0.14, [-5.8, 2.2, -16], 2.2, [0.12, 0.22, 0.08]);
    add(new THREE.OctahedronGeometry(1.4, 0), "#fb923c", 0.11, [6.2, -1.4, -17], 1.85, [-0.1, 0.18, 0.14]);
    add(new THREE.TorusKnotGeometry(0.95, 0.22, 96, 12), "#a78bfa", 0.12, [1.2, 3.6, -14], 1.4, [0.15, 0.11, 0.2]);
    add(new THREE.IcosahedronGeometry(1.1, 0), "#f472b6", 0.09, [-3.4, -3.8, -18], 2.6, [0.08, -0.14, 0.1]);
    add(new THREE.TorusGeometry(4.2, 0.04, 8, 64), "#22d3ee", 0.08, [0, -1.2, -19], 1, [0.04, 0.06, 0.02]);

    /* Soft filled cores (non-wireframe) for a hint of glass-like depth */
    const coreGeo = new THREE.IcosahedronGeometry(0.42, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: "#0ea5e9",
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(-5.8, 2.2, -15.2);
    core.scale.setScalar(2.4);
    out.push({ geo: coreGeo, mat: coreMat, mesh: core, spin: [0.05, 0.08, 0.03], pos: [-5.8, 2.2, -15.2], scl: 2.4 });

    return out;
  }, []);

  useEffect(
    () => () => meshes.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); }),
    [meshes],
  );

  useFrame((_, delta) => {
    const k = heroMotion.reducedMotion ? 0.06 : 1;
    const g = groupRef.current;
    if (g) {
      g.rotation.y += delta * 0.028 * k;
      g.position.z = -scrollState.progress * 0.9 * k;
    }
    meshes.forEach(({ mesh, spin }) => {
      mesh.rotation.x += delta * spin[0] * k;
      mesh.rotation.y += delta * spin[1] * k;
      mesh.rotation.z += delta * spin[2] * k;
    });
  });

  return (
    <group ref={groupRef}>
      {meshes.map((m, i) => (
        <primitive key={i} object={m.mesh} />
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SubtleBloom — tight threshold so emissive nodes and helix glow read as
   premium; skipped when reduced motion or narrow viewports (performance).
───────────────────────────────────────────────────────────────────────────── */
function SubtleBloom({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={0.42}
        luminanceThreshold={0.38}
        luminanceSmoothing={0.88}
        mipmapBlur
        radius={0.42}
      />
    </EffectComposer>
  );
}

/* Deepen fog slightly as the visitor scrolls — reinforces parallax without
   touching foreground readability. */
function ScrollReactiveFog() {
  const { scene } = useThree();
  useFrame(() => {
    const f = scene.fog;
    if (f instanceof THREE.FogExp2) {
      const k = heroMotion.reducedMotion ? 0.82 : 1;
      f.density = (0.0104 + scrollState.progress * 0.0046) * k;
    }
  });
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Canvas — performance-tuned, alpha for vignette overlay to show through
───────────────────────────────────────────────────────────────────────────── */
export default function HeroScene() {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  heroMotion.reducedMotion = reduced;

  const [narrowViewport, setNarrowViewport] = useState(false);
  useEffect(() => {
    const sync = () => setNarrowViewport(window.innerWidth <= 768);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const enableBloom = !reduced && !narrowViewport;

  return (
    <Canvas
      camera={{ position: [0, 1.8, 10], fov: 42 }}
      dpr={[0.75, 1.5]}
      gl={{ alpha: true, antialias: false }}
      performance={{ min: 0.5 }}
    >
      <color attach="background" args={["#020810"]} />
      <fogExp2 attach="fog" args={["#030d18", 0.011]} />
      <ambientLight intensity={0.38} />
      <directionalLight position={[6, 9, 5]}   intensity={2.2} color="#cce8ff" />
      <pointLight       position={[-5, 4, 3]}  intensity={18}  color="#ff7b3a" />
      <pointLight       position={[ 4, -3, 5]} intensity={12}  color="#3388ff" />
      <pointLight       position={[ 0, 6, -4]} intensity={8}   color="#7b3fff" />
      {/* Deep background layers */}
      <NebulaCloud />
      <AuroraRings />
      <DeepStarfield />
      <DataHelix />
      <PrismaticOrbitals />
      {/* Mid-ground atmosphere */}
      <FloatingHexGrid />
      <WarpGrid />
      <ScanLine />
      {/* Foreground tech constellation */}
      <SceneContent />
      <ScrollReactiveFog />
      <SubtleBloom enabled={enableBloom} />
    </Canvas>
  );
}
