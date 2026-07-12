import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCode,
  FiCloud,
  FiCpu,
  FiFileText,
  FiGithub,
  FiInstagram,
  FiLayers,
  FiLinkedin,
  FiMail,
  FiMaximize2,
  FiX,
} from "react-icons/fi";
import { FaMedium } from "react-icons/fa6";
// Lazy-loaded so the entire Three.js + Rapier + postprocessing bundle (~1.1 MB gz)
// is split into a separate chunk and only fetched when the user scrolls near the Stack section.
const TechStack = lazy(() => import("./components/TechStack"));
import ParallaxBackground from "./components/ParallaxBackground";
import "./App.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Story", href: "#story" },
  { label: "Experience", href: "#experience" },
  { label: "Craft", href: "#craft" },
  { label: "Process", href: "#process" },
  { label: "Resume", href: "#resume" },
  { label: "Contact", href: "#contact" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Vraj26shah", icon: FiGithub },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/vraj-shah-5b4127297/", icon: FiLinkedin },
  { label: "Medium", href: "https://medium.com/@vraj1012006shah", icon: FaMedium },
  { label: "Instagram", href: "https://www.instagram.com/vraj10s?igsh=a2Q2YXVnaXZsYmVn", icon: FiInstagram },
];

const services = [
  {
    icon: FiLayers,
    title: "CS Fundamentals",
    text: "Data structures, algorithms, OOP, databases, and operating systems — the fundamentals that make everything else on this page possible.",
  },
  {
    icon: FiCloud,
    title: "Cloud & DevOps",
    text: "I run the full delivery pipeline myself: Docker containers, GitHub Actions for CI/CD, Prometheus and Grafana for monitoring, and AWS EC2 instances I provision and harden by hand.",
  },
  {
    icon: FiCpu,
    title: "Linux, Networking & Security",
    text: "Linux is my daily driver, not just a project skill — Ubuntu and Fedora, RHCSA-level systems knowledge, packet analysis with Scapy, reconnaissance with Nmap, and regular practice on TryHackMe.",
  },
  {
    icon: FiCode,
    title: "Full-Stack & Mobile",
    text: "I build both sides of the stack — React and Flutter on the frontend, FastAPI or Node.js on the backend, tied together with JWT-secured APIs. Proven on production code during my internship, not just side projects.",
  },
];

const experience: {
  role: string;
  org: string;
  dates: string;
  summary: string;
  bullets: string[];
}[] = [
  {
    role: "SDE Intern",
    org: "Inspira",
    dates: "2026 · 6 Weeks",
    summary: "During my six weeks at Inspira, I shipped real production code — a Flutter mobile app, secure authentication, and backend APIs that are live today.",
    bullets: [
      "Built the Flutter frontend from scratch, including a reusable design-token system so every screen stayed pixel-accurate and consistent.",
      "Implemented JWT authentication end-to-end — initialising tokens, storing them securely, and handling refresh so sessions never broke.",
      "Extended the existing FastAPI backend with new chart-data endpoints that power the analytics dashboard.",
    ],
  },
  {
    role: "Founder & Full-Stack Developer",
    org: "ScholarStack",
    dates: "Sep 2023 – Present",
    summary: "I built this alone and I'm still running it today — a live platform that generates real revenue, not a class project.",
    bullets: [
      "Holds 99%+ uptime for 500+ concurrent users and brings in ₹10,000+ every month, with no outside IT support.",
      "Automated content delivery with Python and Bash scripts, which got 95% of users on board within two weeks of launch.",
      "I handle the entire production lifecycle myself — reverse proxy configuration, SSL certificates, DNS, and every deployment.",
    ],
  },
];

const projects: {
  index: string;
  category: string;
  title: string;
  description: string;
  insight: string;
  tech: string[];
  highlights: string[];
  link: string;
  liveUrl?: string;
  imageSrc: string;
  imageAlt: string;
}[] = [
  {
    index: "01",
    category: "Academic Resource Platform",
    title: "ScholarStack",
    description: "An academic resource platform I host on Linux myself. It holds 99%+ uptime for 500+ concurrent users and brings in ₹10,000+ a month, with no external IT team behind it.",
    insight: "I set up and still run every piece myself — DNS, SSL, the reverse proxy, and automation, all on a bare Linux server I manage directly.",
    tech: ["Linux", "Nginx", "Python", "Bash", "Certbot", "DNS", "Cron Jobs"],
    highlights: ["Runs on a self-managed Linux setup", "Student-focused delivery flow", "Stable operations with zero external IT support"],
    link: "https://github.com/Vraj26shah/vitbsmashers",
    liveUrl: "https://vitbsmasher.vercel.app/",
    imageSrc: "/project-screenshot-03.png",
    imageAlt: "ScholarStack project architecture screenshot",
  },
  {
    index: "02",
    category: "Secure Workflow Orchestration",
    title: "AgentForge",
    description: "A secure workflow platform using signed intent tokens and real-time policy checks so multiple services can operate safely and transparently.",
    insight: "Four specialised agents work through a single orchestration layer that logs everything and fails safely the moment something looks wrong.",
    tech: ["FastAPI", "React", "TypeScript", "Docker", "SpacetimeDB", "JWT"],
    highlights: ["Planner and tool agents coordinated centrally", "Realtime task state and audits", "Security checks before execution"],
    link: "https://github.com/Vraj26shah/agentforge",
    liveUrl: "https://agentforges.onrender.com/",
    imageSrc: "/project-screenshot-02.png",
    imageAlt: "AgentForge project architecture screenshot",
  },
  {
    index: "03",
    category: "Infrastructure & CI/CD",
    title: "DevOps Engineering Lab",
    description: "A full CI/CD pipeline on AWS EC2, using Docker for containers and Prometheus with Grafana for monitoring, so deployments and alerts happen automatically.",
    insight: "Built to prove a point: good delivery automation makes systems repeatable and easy to observe, not just faster to ship.",
    tech: ["Docker", "GitHub Actions", "Prometheus", "Grafana", "AWS EC2", "Bash"],
    highlights: ["CI build and publish workflow", "Monitoring stack on EC2", "Metrics, dashboards, and alerts in one flow"],
    link: "https://github.com/Vraj26shah/Devops-aws-",
    imageSrc: "/project-screenshot-05.png",
    imageAlt: "DevOps Engineering Lab project architecture screenshot",
  },
  {
    index: "04",
    category: "Security & Networking",
    title: "Network Traffic Analyser",
    description: "Captures live network traffic to catch anomalies and IP or MAC spoofing, trace where an attack is coming from, and chart the protocol breakdown with Pandas and Matplotlib.",
    insight: "This is where I show packet-level thinking — capturing raw frames, parsing them, spotting anomalies, and exporting findings you can actually act on.",
    tech: ["Python", "Scapy", "Wireshark", "TCP/IP", "ARP", "Nmap"],
    highlights: ["Raw frame capture and parsing", "Spoof detection through ARP mismatch analysis", "Charts, logs, and pcap export from one CLI"],
    link: "https://github.com/Vraj26shah/NetworkAnalyzer",
    imageSrc: "/project-screenshot-04.png",
    imageAlt: "Network Traffic Analyser project architecture screenshot",
  },
  {
    index: "05",
    category: "Research & Machine Learning",
    title: "Mentorship Algorithm",
    description: "A mentor-matching engine that uses decision trees and genetic programming to recommend the right pairing, built out of a research paper I co-authored.",
    insight: "This one is about the reasoning underneath, not the interface — how the matching logic actually decides who gets paired with whom.",
    tech: ["Decision Trees", "Genetic Programming", "Python", "Data Profiling"],
    highlights: ["Research-driven recommendation logic", "Structured profiling and matching flow", "Decision-focused architecture thinking"],
    link: "https://github.com/Vraj26shah/fathersadvice_final",
    liveUrl: "https://fathersadvice-final.onrender.com",
    imageSrc: "/project-screenshot-mentorship.svg",
    imageAlt: "Mentorship Algorithm project architecture diagram",
  },
  {
    index: "06",
    category: "Full-Stack Healthcare App",
    title: "MediGuard",
    description: "A full-stack healthcare app with a clean split between backend and frontend, connected through a properly designed REST API.",
    insight: "Built to show I can own a real app end-to-end — the backend logic and the frontend experience both fall on me.",
    tech: ["Node.js", "React", "JavaScript", "REST API", "MongoDB"],
    highlights: ["Separate patient and provider flows", "Role-aware frontend and API design", "Structured backend and data handling"],
    link: "https://github.com/Vraj26shah/mediguard",
    imageSrc: "/project-screenshot-06.png",
    imageAlt: "MediGuard healthcare app architecture screenshot",
  },
  {
    index: "07",
    category: "Web Scheduling Tool",
    title: "Timetable Maker",
    description: "A lightweight, browser-only tool for building timetables — no backend required, just fast and responsive by design.",
    insight: "Sometimes the right call is to keep it simple — this one proves I know when not to overengineer a solution.",
    tech: ["JavaScript", "HTML", "CSS", "Responsive Design", "Vercel"],
    highlights: ["Frontend-only workflow", "Fast scheduling interactions", "Simple tool built for direct usability"],
    link: "https://github.com/Vraj26shah/timetablemaker",
    liveUrl: "https://ffcstimetablemaker.vercel.app",
    imageSrc: "/project-screenshot-timetable.svg",
    imageAlt: "Timetable Maker project architecture diagram",
  },
];

const certifications = [
  "Google IT Support — Coursera",
  "Networking Essentials — Coursera",
  "AI/ML Fundamentals — Vityarthi",
  "Python Programming Mastery — Vityarthi",
  "C Programming — Fortune Education",
];

const researchPapers = [
  {
    title: "Mentorship Algorithm Design using Decision Trees & Genetic Programming",
    href: "https://drive.google.com/file/d/1wRSaRFBvGezorwXrbTEyd87blxlKQMA4/view?usp=drive_link",
  },
  {
    title: "Energy-Efficient ALU Design via Advanced Verilog Optimisation",
    href: "https://drive.google.com/file/d/1LgGJUPxdITf8N8qW0eK6qvadd869_wM9/view?usp=drive_link",
  },
];

const processSteps = [
  {
    id: "01",
    title: "Understand the problem",
    text: "Before I write a single line of code, I map out exactly what needs to be built and where it's most likely to break.",
  },
  {
    id: "02",
    title: "Design the architecture",
    text: "I sketch out the services, the data flow, and where the complexity should live first — architecture decisions are far cheaper to change on paper than in code.",
  },
  {
    id: "03",
    title: "Build iteratively",
    text: "I get the core path working first, then layer on features one at a time. Every change is tested against real inputs before it ships.",
  },
  {
    id: "04",
    title: "Automate delivery",
    text: "CI/CD, containers, and monitoring all go in early, so by the time something ships, it's a non-event instead of a scramble.",
  },
  {
    id: "05",
    title: "Operate and improve",
    text: "After launch, I watch the metrics and read the logs myself. A build isn't done when it deploys — it's done once I know how it behaves under real load.",
  },
];

function renderWords(text: string) {
  return <>{text}</>;
}

export default function App() {
  // Prevent browser from restoring scroll position on refresh — always start at top
  if (typeof window !== "undefined" && history.scrollRestoration) {
    history.scrollRestoration = "manual";
  }

  const appRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const workSectionRef = useRef<HTMLElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const techStackSentinelRef = useRef<HTMLDivElement>(null);
  const [isReady] = useState(true);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Only mount the heavy Three.js canvas when the user scrolls near the Stack section.
  // rootMargin: "400px" triggers the import ~400 px before the element enters the viewport,
  // giving the browser time to fetch the chunk without the user noticing any delay.
  const [showTechStack, setShowTechStack] = useState(false);

  useEffect(() => {
    const el = techStackSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShowTechStack(true); obs.disconnect(); } },
      { rootMargin: "400px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    // Cinematic loader — progress 0→100 over ~1.8s using RAF, then fade out
    const DURATION = 1800;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const p = Math.max(0, Math.min(100, Math.round(((now - start) / DURATION) * 100)));
      setLoaderProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setLoaded(true), 520); // wait for CSS fade-out
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const [activeSection, setActiveSection] = useState("");
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; title: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null);
  const lbBodyRef = useRef<HTMLDivElement>(null);

  const openLightbox = (src: string, alt: string, title: string) => {
    setZoom(1);
    setLightbox({ src, alt, title });
  };
  const closeLightbox = () => { setLightbox(null); setZoom(1); };
  const zoomIn  = () => setZoom(z => Math.min(z + 0.5, 4));
  const zoomOut = () => setZoom(z => Math.max(z - 0.5, 0.5));
  const zoomReset = () => setZoom(1);

  // Double-click: zoom in progressively; at max reset
  const handleLbDblClick = () => setZoom(z => z >= 3.5 ? 1 : Math.min(z + 0.75, 4));

  // Drag-to-pan handlers
  const handleLbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    const el = lbBodyRef.current;
    if (!el) return;
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    e.preventDefault();
  };
  const handleLbMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragRef.current) return;
    const el = lbBodyRef.current;
    if (!el) return;
    el.scrollLeft = dragRef.current.scrollLeft - (e.clientX - dragRef.current.startX);
    el.scrollTop  = dragRef.current.scrollTop  - (e.clientY - dragRef.current.startY);
  };
  const handleLbMouseUp = () => { setIsDragging(false); dragRef.current = null; };

  // Close lightbox on Escape; zoom with + / -
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")   closeLightbox();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-")        zoomOut();
      if (e.key === "0")        zoomReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);
  // Active nav link — track which section is currently past the top of the viewport.
  // Uses a scroll listener + getBoundingClientRect so it works correctly with GSAP-pinned
  // sections (showcase pin, work pin) where ScrollTrigger trigger positions are unreliable.
  useEffect(() => {
    const ids = ["home", "work", "stack", "story", "experience", "craft", "process", "resume", "contact"];
    const THRESHOLD = 120; // px from viewport top (sits just below the fixed navbar)

    const update = () => {
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        // getBoundingClientRect gives the visual top even for position:fixed pins
        if (el.getBoundingClientRect().top <= THRESHOLD) {
          current = id;
        }
      }
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", update, { passive: true });
    update(); // set correct state on mount / refresh
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Scroll progress bar — native listener so pinned GSAP sections never break it
  useEffect(() => {
    const bar = scrollBarRef.current;
    if (!bar) return;
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      bar.style.transform = `scaleX(${(window.scrollY / maxScroll).toFixed(4)})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialise on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1120) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile menu or lightbox is open
  useEffect(() => {
    document.body.style.overflow = (menuOpen || !!lightbox) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, lightbox]);

  // Smooth scroll for all anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  // Mouse-tracking spotlight — buttons and cards both use a --mx/--my
  // driven radial-gradient (see .button::before / .glass-card::before)
  // so cards feel responsive to the cursor instead of static boxes.
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".button, .glass-card");
    const handleMove = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      (e.currentTarget as HTMLElement).style.setProperty("--mx", `${x}%`);
      (e.currentTarget as HTMLElement).style.setProperty("--my", `${y}%`);
    };
    targets.forEach((el) => el.addEventListener("mousemove", handleMove as EventListener));
    return () => {
      targets.forEach((el) => el.removeEventListener("mousemove", handleMove as EventListener));
    };
  }, [isReady]);

  useEffect(() => {
    // Always start at the very top on mount / refresh
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);


  useGSAP(
    () => {
      if (!isReady || !contentRef.current) {
        return;
      }

      gsap.fromTo(".topbar", { autoAlpha: 0, y: -32 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.12 });

      // Scroll progress bar — intentionally left empty here.
      // A separate useEffect below drives it with a native scroll listener,
      // which is reliable even when GSAP pin sections inflate the scroll height.

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 54 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
            },
          },
        );
      });

      // Stagger-in service cards as a group
      const serviceCards = gsap.utils.toArray<HTMLElement>(".service-card");
      if (serviceCards.length) {
        gsap.fromTo(
          serviceCards,
          { autoAlpha: 0, y: 50, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".services-grid",
              start: "top 82%",
            },
          },
        );
      }

      gsap.utils.toArray<HTMLElement>(".reveal-word-group").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
            },
          },
        );
      });

      // Stacked slides — pin the work section and drive both panels via activeProjectIndex
      if (workSectionRef.current && window.innerWidth > 900) {
        ScrollTrigger.create({
          trigger: workSectionRef.current,
          start: "top top",
          end: `+=${window.innerHeight * (projects.length - 1)}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            setActiveProjectIndex(0);
          },
          onEnterBack: () => {
            setActiveProjectIndex(projects.length - 1);
          },
          onUpdate: (self) => {
            const index = Math.min(
              projects.length - 1,
              Math.max(0, Math.round(self.progress * (projects.length - 1))),
            );
            setActiveProjectIndex(index);
          },
        });
      } else if (workSectionRef.current) {
        const cards = gsap.utils.toArray<HTMLElement>(".project-card-slide");
        cards.forEach((card, index) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top center",
            end: "bottom center",
            onEnter: () => {
              setActiveProjectIndex(index);
            },
            onEnterBack: () => {
              setActiveProjectIndex(index);
            },
          });
        });
      }

      gsap.fromTo(
        ".process-progress-bar",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top top",
          scrollTrigger: {
            trigger: ".process-grid",
            start: "top 68%",
            end: "bottom 70%",
            scrub: true,
          },
        },
      );

      const timelineSteps = gsap.utils.toArray<HTMLElement>(".timeline-step");
      if (timelineSteps.length) {
        gsap.fromTo(
          timelineSteps,
          { autoAlpha: 0, y: 48, x: -20 },
          {
            autoAlpha: 1,
            y: 0,
            x: 0,
            duration: 0.85,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".timeline",
              start: "top 78%",
            },
          },
        );
      }

      // Dividers animate in
      gsap.utils.toArray<HTMLElement>(".section-divider").forEach((div) => {
        gsap.fromTo(
          div,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.2,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: div,
              start: "top 88%",
            },
          },
        );
      });

      ScrollTrigger.refresh();
    },
    { scope: appRef, dependencies: [isReady], revertOnUpdate: true },
  );

  return (
    <div ref={appRef} className="app-shell is-ready">
      {/* 3D parallax background — fixed, behind all content */}
      <ParallaxBackground />

      {/* Cinematic loading screen */}
      {!loaded && (
        <div className={`loading-screen${loaderProgress >= 100 ? " is-done" : ""}`} aria-hidden="true">
          <div className="loading-screen__grid" />
          <div className="loading-screen__inner">
            <p className="loading-screen__label">Preparing cinematic mode</p>
            <span className="loading-screen__value">
              {String(Math.max(0, loaderProgress)).padStart(2, "0")}
            </span>
            <div className="loading-screen__line-shell">
              <div
                className="loading-screen__line"
                style={{ transform: `scaleX(${loaderProgress / 100})` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Architecture lightbox */}
      {lightbox && (
        <div
          className="arch-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.title} system architecture`}
          onClick={closeLightbox}
        >
          <div className="arch-lightbox__panel" onClick={(e) => e.stopPropagation()}>
            <div className="arch-lightbox__header">
              <span className="arch-lightbox__title">
                <FiMaximize2 /> System Architecture — {lightbox.title}
              </span>
              <div className="arch-lightbox__controls">
                <button className="arch-lightbox__zoom-btn" onClick={zoomOut} aria-label="Zoom out" title="Zoom out (-)">−</button>
                <button className="arch-lightbox__zoom-label" onClick={zoomReset} aria-label="Reset zoom" title="Reset zoom (0)">
                  {Math.round(zoom * 100)}%
                </button>
                <button className="arch-lightbox__zoom-btn" onClick={zoomIn} aria-label="Zoom in" title="Zoom in (+)">+</button>
                <button
                  className="arch-lightbox__close"
                  onClick={closeLightbox}
                  aria-label="Close architecture view"
                >
                  <FiX />
                  <span>Close</span>
                </button>
              </div>
            </div>
            <div
              ref={lbBodyRef}
              className="arch-lightbox__body"
              data-zoomed={zoom > 1 ? "true" : "false"}
              onDoubleClick={handleLbDblClick}
              onMouseDown={handleLbMouseDown}
              onMouseMove={handleLbMouseMove}
              onMouseUp={handleLbMouseUp}
              onMouseLeave={handleLbMouseUp}
              style={{ cursor: zoom <= 1 ? "zoom-in" : isDragging ? "grabbing" : "grab" }}
            >
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                draggable={false}
                style={{
                  width: zoom > 1 ? `${zoom * 100}%` : "auto",
                  maxWidth: zoom > 1 ? "none" : "100%",
                  height: "auto",
                  maxHeight: zoom > 1 ? "none" : "calc(92vh - 6rem)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="scroll-progress" aria-hidden="true">
        <div ref={scrollBarRef} className="scroll-progress__bar" />
      </div>

      <div ref={wrapperRef}>
        <div ref={contentRef}>
          <header className="topbar is-scrolled">
            <a className="brand-mark" href="#home" onClick={handleNavClick}>
              <span className="brand-mark__dot" />
              Vraj Shah
            </a>

            <nav className="topnav" aria-label="Primary">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={activeSection === link.href.slice(1) ? "is-active" : ""}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <a className="topbar-cta" href="#contact" onClick={handleNavClick}>
              Connect with me <FiArrowUpRight />
            </a>

            <button
              className={`topbar-menu-btn${menuOpen ? " is-open" : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </header>

          {/* Mobile navigation drawer */}
          <nav className={`mobile-nav${menuOpen ? " is-open" : ""}`} aria-label="Mobile navigation">
            <div className="mobile-nav__links">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={activeSection === link.href.slice(1) ? "is-active" : ""}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mobile-nav__social">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </nav>

          <aside className="social-rail" aria-label="Social links">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  className="social-rail__item"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                >
                  <Icon />
                </a>
              );
            })}
          </aside>

          <main>
            {/* ── Hero Introduction ─────────────────────────────────────────── */}
            <section id="home" className="hero-section">
              <div className="hero-copy">
                <p className="hero-kicker">Full-Stack Developer · DevOps Engineer · Systems Builder</p>

                <h1 className="hero-title" aria-label="Vraj Shah">
                  <span className="hero-title__line">VRAJ</span>
                  <span className="hero-title__line">SHAH</span>
                </h1>

                <p className="hero-subtitle">
                  Founder of ScholarStack — building production systems in Linux, DevOps, AWS, and Python since day one. Open to internships and full-time roles.
                </p>

                <div className="hero-actions">
                  <a className="button button--primary" href="#work" onClick={handleNavClick}>
                    Explore projects <FiArrowRight />
                  </a>
                  <a className="button button--ghost" href="#resume" onClick={handleNavClick}>
                    View resume
                  </a>
                </div>

                <div className="hero-metrics">
                  <article className="glass-card">
                    <strong>500+ Users</strong>
                    <span>ScholarStack serves 500+ concurrent users at 99%+ uptime — self-managed, no external IT.</span>
                  </article>
                  <article className="glass-card">
                    <strong>2 Research Papers</strong>
                    <span>Peer-reviewed work on genetic algorithm mentor matching and Verilog ALU power optimisation.</span>
                  </article>
                  <article className="glass-card">
                    <strong>40+ Articles</strong>
                    <span>Long-form Linux and networking publications on Medium, driving 25% traffic growth.</span>
                  </article>
                </div>
              </div>

              <div className="hero-orbit-copy">
                <div className="hero-orbit-copy__card glass-card">
                  <span>Current focus</span>
                  <strong>DevOps, AWS, network security, and Kubernetes.</strong>
                  <div className="hero-orbit-copy__list">
                    <div>
                      <small>Build style</small>
                      <p>Operate first, then automate. Real infra, real users — not toy setups.</p>
                    </div>
                    <div>
                      <small>Right now</small>
                      <p>Just wrapped an SDE internship at Inspira — shipping Flutter + FastAPI in production.</p>
                    </div>
                  </div>
                </div>
                <div className="hero-scroll">
                  <span>Scroll to explore</span>
                </div>
              </div>
            </section>

            <section id="work" ref={workSectionRef} className="work-section">
              <div className="work-stage">
                <div className="work-intro reveal-up">
                  <p className="eyebrow">Selected work</p>
                  <h2>Seven shipped projects.</h2>
                  <p className="work-intro__text">
                    Scroll to step through each one — the system architecture on the left, the engineering breakdown on the right.
                  </p>
                </div>

                <div className="work-progress-dots" aria-hidden="true">
                  {projects.map((_, i) => (
                    <span key={i} className={`work-progress-dot${activeProjectIndex === i ? " is-active" : ""}`} />
                  ))}
                </div>

                <div className="work-split">
                  {/* LEFT — Architecture diagrams */}
                  <div className="work-pane work-pane--arch">
                    <div className="work-viewport work-viewport--arch">
                      <div className="work-arch-stack">
                        {projects.map((project, index) => (
                          <article
                            key={project.index}
                            className={`arch-slide${
                              activeProjectIndex === index
                                ? " is-active"
                                : activeProjectIndex > index
                                ? " is-past"
                                : " is-upcoming"
                            }`}
                          >
                            <div className="arch-slide__chrome">
                              <span>{project.category}</span>
                              <span>{project.index}</span>
                            </div>
                            <button
                              className="arch-slide__frame"
                              onClick={() => openLightbox(project.imageSrc, project.imageAlt, project.title)}
                              aria-label={`View ${project.title} architecture fullscreen`}
                              title="Click to view full architecture"
                            >
                              <img src={project.imageSrc} alt={project.imageAlt} loading="lazy" />
                              <span className="arch-slide__expand-hint">
                                <FiMaximize2 /> View architecture
                              </span>
                            </button>
                            <p className="arch-slide__caption">{project.title}</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — Project cards */}
                  <div className="work-pane work-pane--cards">
                    <div className="work-viewport work-viewport--cards">
                      <div className="work-cards-stack">
                        {projects.map((project, index) => (
                          <article
                            key={project.index}
                            className={`project-card-slide project-frame project-card${
                              activeProjectIndex === index
                                ? " is-active"
                                : activeProjectIndex > index
                                ? " is-past"
                                : " is-upcoming"
                            }`}
                          >
                            <div className="project-card__body">
                              <div className="project-card__header">
                                <div>
                                  <span className="project-card__category">{project.category}</span>
                                  <h3>{project.title}</h3>
                                </div>
                                <span className="project-card__num">{project.index}</span>
                              </div>

                              <p className="project-card__desc">{project.description}</p>

                              <div className="project-card__detail">
                                <strong>Project focus</strong>
                                <p>{project.insight}</p>
                              </div>

                              <ul className="project-highlights" aria-label={`${project.title} highlights`}>
                                {project.highlights.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>

                              <ul className="project-tags" aria-label={`${project.title} technologies`}>
                                {project.tech.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>

                              <div className="project-card__links">
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="project-card__link"
                                  aria-label={`View ${project.title} on GitHub`}
                                >
                                  <FiGithub /> GitHub
                                </a>
                                {project.liveUrl && (
                                  <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="project-card__link project-card__link--live"
                                    aria-label={`View ${project.title} live`}
                                  >
                                    <FiArrowUpRight /> Live
                                  </a>
                                )}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="stack" className="section-shell techstack-shell">
              {/* Sentinel div — IntersectionObserver watches this to trigger the lazy import */}
              <div ref={techStackSentinelRef} style={{ minHeight: "1px" }} />
              {showTechStack && (
                <Suspense fallback={<div className="techstack-skeleton" aria-hidden="true" />}>
                  <TechStack />
                </Suspense>
              )}
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="story" className="story-section section-shell">
              <div className="section-heading reveal-up">
                <p className="eyebrow">Story</p>
                <h2>Building real systems since day one.</h2>
              </div>

              <div className="story-grid">
                <div className="story-lead glass-card reveal-up">
                  <p className="reveal-word-group">
                    {renderWords(
                      "I started ScholarStack back in my first semester, and I'm still running it today — 500+ users, real revenue, and one Linux server I manage entirely on my own. That hands-on experience shapes how I approach everything else I build.",
                    )}
                  </p>
                </div>

                <div className="story-notes">
                  <article className="story-note glass-card reveal-up">
                    <strong>Solvit Hackathon Finalist</strong>
                    <p>Designed and shipped a responsive municipal-services interface in just 12 hours, finishing as a finalist and lifting live-demo engagement by 35%.</p>
                  </article>
                  <article className="story-note glass-card reveal-up">
                    <strong>CGPA 8.75 · Always building outside class</strong>
                    <p>Studying at VIT Bhopal, and outside of class I'm digging into Kubernetes, CTF challenges, and blockchain consensus.</p>
                  </article>
                </div>
              </div>
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="experience" className="experience-section section-shell">
              <div className="section-heading reveal-up">
                <p className="eyebrow">Experience</p>
                <h2>Real codebases. Real production stakes.</h2>
              </div>

              <div className="experience-grid">
                {experience.map((role) => (
                  <article key={role.org} className="experience-card glass-card reveal-up">
                    <div className="experience-card__header">
                      <div>
                        <h3>{role.role}</h3>
                        <span className="experience-card__org">{role.org}</span>
                      </div>
                      <span className="experience-card__dates">{role.dates}</span>
                    </div>
                    <p className="experience-card__summary">{role.summary}</p>
                    <ul className="experience-card__bullets">
                      {role.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="craft" className="services-section section-shell">
              <div className="section-heading reveal-up">
                <p className="eyebrow">Craft</p>
                <h2>Infra. Security. Full-stack. All production-tested.</h2>
              </div>

              <div className="services-grid">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <article key={service.title} className="service-card glass-card">
                      <span className="service-card__icon">
                        <Icon />
                      </span>
                      <h3>{service.title}</h3>
                      <p>{service.text}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="process" className="process-section section-shell">
              <div className="section-heading reveal-up">
                <p className="eyebrow">How I work</p>
                <h2>From first principles to production.</h2>
              </div>

              <div className="process-grid">
                <div className="process-progress">
                  <div className="process-progress-bar" />
                </div>

                <div className="timeline">
                  {processSteps.map((step) => (
                    <article key={step.id} className="timeline-step glass-card">
                      <span className="timeline-step__id">{step.id}</span>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="resume" className="resume-section section-shell">
              <div className="section-heading reveal-up">
                <p className="eyebrow">Resume & Research</p>
                <h2>One year. Two papers. Seven projects.</h2>
              </div>

              <div className="resume-layout">
                <div className="resume-copy glass-card reveal-up">
                  <span className="resume-copy__label">Resume</span>
                  <h3>B.Tech CS · VIT Bhopal · CGPA 8.75</h3>
                  <p>
                    I'm open to internships and full-time roles in cloud infrastructure, DevOps, security, and full-stack development.
                  </p>

                  <div className="resume-actions">
                    <a className="button button--primary" href="https://drive.google.com/file/d/1Da7fbSMTyYshX6KQ6iC4eOr9vYaJYfqk/view?usp=sharing" target="_blank" rel="noreferrer">
                      <FiFileText />
                      View Resume
                    </a>
                  </div>

                  <div className="resume-papers">
                    <span className="resume-copy__label">Published Research</span>
                    {researchPapers.map((paper, i) => (
                      <a
                        key={i}
                        className="button button--ghost resume-paper-link"
                        href={paper.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FiFileText />
                        {paper.title}
                        <FiArrowUpRight />
                      </a>
                    ))}
                  </div>

                  <div className="resume-certs">
                    <span className="resume-copy__label">Certifications</span>
                    <ul className="resume-certs__list">
                      {certifications.map((cert) => (
                        <li key={cert}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="resume-preview glass-card reveal-up" aria-label="Resume preview">
                  <iframe
                    className="resume-preview__iframe"
                    src="https://drive.google.com/file/d/1Da7fbSMTyYshX6KQ6iC4eOr9vYaJYfqk/preview"
                    title="Vraj Shah Resume"
                    allow="autoplay"
                    loading="lazy"
                  />
                </div>
              </div>
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="contact" className="contact-section">
              <div className="contact-card glass-card reveal-up">
                <p className="eyebrow">Contact</p>
                <h2>Let's build something real.</h2>
                <p>
                  Whether it's cloud infrastructure, DevOps, security, or full-stack — if the problem sounds interesting, I want to hear about it.
                </p>

                <div className="contact-actions">
                  <a className="button button--primary" href="mailto:vraj1012006shah@gmail.com">
                    <FiMail />
                    Start the conversation
                  </a>
                </div>
              </div>
            </section>

            <footer className="footer-badge glass-card" aria-label="Footer">
              <div className="footer-badge__copy">
                <p className="eyebrow">Vraj Shah · VIT Bhopal · CGPA 8.75</p>
                <strong>Linux, DevOps, cloud, networking, and full-stack — open to internships and full-time roles.</strong>
                <span>Founder of ScholarStack · 2 peer-reviewed papers · 40+ published articles · Solvit Hackathon Finalist.</span>
              </div>

              <div className="footer-badge__actions">
                <div className="footer-badge__social" aria-label="Footer social links">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={`footer-${link.label}`}
                        className="footer-badge__social-link"
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={link.label}
                        title={link.label}
                      >
                        <Icon />
                      </a>
                    );
                  })}
                </div>

                <div className="footer-badge__meta">
                  <span>Vraj Shah</span>
                  <span>{new Date().getFullYear()}</span>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
