import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  FiArrowRight,
  FiArrowDownRight,
  FiArrowUpRight,
  FiCode,
  FiCommand,
  FiCloud,
  FiCpu,
  FiFileText,
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiMail,
} from "react-icons/fi";
import { FaMedium } from "react-icons/fa6";
import HeroScene, { scrollState } from "./components/HeroScene";
import TechStack from "./components/TechStack";
import "./App.css";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Story", href: "#story" },
  { label: "Craft", href: "#craft" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
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

const featurePanels = [
  {
    id: "01",
    eyebrow: "Sharp Start",
    title: "Projects first, signal early, and no wasted scroll.",
    text: "The structure is built to move fast: strong work up front, clean pacing, and just enough context to keep the story clear.",
  },
  {
    id: "02",
    eyebrow: "Clean Motion",
    title: "The visuals carry energy without getting in the way.",
    text: "Movement stays controlled so the page feels alive, but the work still stays readable from top to bottom.",
  },
  {
    id: "03",
    eyebrow: "Build Style",
    title: "Cloud, systems, and frontend work sit together as one modern engineering profile.",
    text: "The portfolio shows how I like to build: structured, practical, and polished where the details matter.",
  },
];

const services = [
  {
    icon: FiCloud,
    title: "Cloud & DevOps",
    text: "I enjoy the side of engineering where systems ship cleanly, environments stay reliable, and infra decisions actually matter.",
  },
  {
    icon: FiCpu,
    title: "Networking & Systems",
    text: "Protocols, traffic flow, debugging, and system-level thinking keep me locked in because they explain what is really happening under the hood.",
  },
  {
    icon: FiCode,
    title: "Frontend & Interaction",
    text: "I care about interfaces that feel fast, modern, and intentional, with motion used to support clarity instead of noise.",
  },
];

const projects = [
  {
    index: "01",
    category: "Academic Resource Platform",
    title: "ScholarStack",
    description: "Linux-hosted academic resource platform sustaining 99%+ uptime for 500+ concurrent users and generating ₹10,000+ monthly revenue with zero external IT support.",
    insight: "Built and operated end-to-end — from DNS config and SSL certificates to Nginx reverse-proxy and automated Cron Jobs — all on a bare Linux server.",
    tech: ["Linux", "Nginx", "Python", "Bash", "Certbot", "DNS", "Cron Jobs"],
    visualLabel: "Readable student workflow",
    visualText: "Structured navigation, dependable delivery, and a calmer product surface for study resources.",
    link: "https://github.com/Vraj26shah/vitbsmashers",
    liveUrl: "https://vitbsmasher.vercel.app/",
  },
  {
    index: "02",
    category: "AI Agent Orchestration",
    title: "AgentForge",
    description: "Full-stack AI agent orchestration platform with ArmorIQ security — cryptographically signed intent tokens, real-time policy enforcement, and multi-agent task execution.",
    insight: "Four specialised agents (Analyzer, Executor, Validator, Reporter) coordinate over WebSocket with complete audit trails and fail-closed security policy.",
    tech: ["FastAPI", "React", "TypeScript", "Claude AI", "Docker", "SpacetimeDB", "JWT"],
    visualLabel: "Multi-agent coordination",
    visualText: "Secure agent pipelines with intent verification and real-time synchronisation.",
    link: "https://github.com/Vraj26shah/agentforge",
  },
  {
    index: "03",
    category: "Infrastructure & CI/CD",
    title: "DevOps Engineering Lab",
    description: "Production-grade CI/CD pipelines, Docker containers, Prometheus + Grafana monitoring stacks on AWS EC2 with automated deployment and alerting.",
    insight: "It reflects the part of engineering I enjoy most: making systems repeatable, measurable, and easier to operate over time.",
    tech: ["Docker", "GitHub Actions", "Prometheus", "Grafana", "AWS EC2", "Bash"],
    visualLabel: "Ops visibility",
    visualText: "Automation, monitoring, and deployment checkpoints arranged like a working control surface.",
    link: "https://github.com/Vraj26shah/Devops-aws-",
  },
  {
    index: "04",
    category: "Security & Networking",
    title: "Network Traffic Analyser",
    description: "Analyses network packets to detect anomalies and identify IP/MAC spoofing — traces attacker addresses and visualises protocol breakdowns with Pandas and Matplotlib.",
    insight: "This is where my curiosity for TCP/IP, scanning, and troubleshooting becomes visible in a more technical, systems-oriented format.",
    tech: ["Python", "Scapy", "Wireshark", "TCP/IP", "ARP", "Nmap"],
    visualLabel: "Packet-level view",
    visualText: "Traffic interpretation, signal tracing, and protocol awareness presented as a technical story.",
    link: "https://github.com/Vraj26shah/NetworkAnalyzer",
  },
  {
    index: "05",
    category: "Research & Machine Learning",
    title: "Mentorship Algorithm",
    description: "A research-led build exploring recommendation logic, data profiling, and decision pathways for better mentorship matching using genetic programming.",
    insight: "It highlights how I approach problem framing when the answer is not purely visual and needs a stronger analytical backbone.",
    tech: ["Decision Trees", "Genetic Programming", "Python", "Data Profiling"],
    visualLabel: "Analytical decision flow",
    visualText: "A project shaped around logic, evaluation, and how structured data can guide better recommendations.",
    link: "https://github.com/Vraj26shah/fathersadvice1",
  },
  {
    index: "06",
    category: "Full-Stack Healthcare App",
    title: "MediGuard",
    description: "Full-stack healthcare web application with separate backend and frontend, RESTful API design, and structured configuration management.",
    insight: "Demonstrates full ownership of both the backend logic and the frontend experience in a real-world application context.",
    tech: ["Node.js", "React", "JavaScript", "REST API", "MongoDB"],
    visualLabel: "Healthcare workflow",
    visualText: "Clean architecture, API-first design, and a product surface built for dependable use.",
    link: "https://github.com/Vraj26shah/mediguard",
  },
  {
    index: "07",
    category: "Web Scheduling Tool",
    title: "Timetable Maker",
    description: "Lightweight browser-based timetable creation tool with no backend dependencies — fast, responsive, and deployed on Vercel.",
    insight: "A focused single-page tool that shows I can ship something clean and usable without overengineering the solution.",
    tech: ["JavaScript", "HTML", "CSS", "Responsive Design", "Vercel"],
    visualLabel: "Scheduling made simple",
    visualText: "Zero-dependency frontend tool with instant usability and a clean scheduling interface.",
    link: "https://github.com/Vraj26shah/timetablemaker",
    liveUrl: "https://ffcstimetablemaker.vercel.app",
  },
];

const researchPapers = [
  {
    title: "Research Paper 1",
    href: "https://drive.google.com/file/d/1wRSaRFBvGezorwXrbTEyd87blxlKQMA4/view?usp=drive_link",
  },
  {
    title: "Research Paper 2",
    href: "https://drive.google.com/file/d/1LgGJUPxdITf8N8qW0eK6qvadd869_wM9/view?usp=drive_link",
  },
];

const processSteps = [
  {
    id: "01",
    title: "Open strong",
    text: "The page leads with the work so the first impression already says something real.",
  },
  {
    id: "02",
    title: "Keep it readable",
    text: "Spacing, copy, and section rhythm are tuned so the content stays easy to scan without feeling flat.",
  },
  {
    id: "03",
    title: "Let motion help",
    text: "Animation guides attention, adds pace, and keeps the experience smooth without becoming the main event.",
  },
  {
    id: "04",
    title: "Polish the edges",
    text: "The final layer is about responsiveness, consistency, and making the whole portfolio feel ready to ship.",
  },
];

function renderChars(text: string) {
  return Array.from(text).map((char, index) => (
    <span key={`${char}-${index}`} className={`hero-char${char === " " ? " is-space" : ""}`}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

function renderWords(text: string) {
  return text.split(" ").map((word, index) => (
    <span key={`${word}-${index}`} className="reveal-word">
      {word}&nbsp;
    </span>
  ));
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
  const workViewportRef = useRef<HTMLDivElement>(null);
  const workRailRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderValueRef = useRef<HTMLSpanElement>(null);
  const loaderLineRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1120) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Smooth bidirectional scroll for all anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    e.preventDefault();
    setMenuOpen(false);
    const smoother = smootherRef.current ?? ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(href, true, "top top");
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Custom cursor with magnetic pull on interactive elements
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;

    if (!finePointer || !dot || !ring) {
      return;
    }

    const moveDotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    const moveRingX = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power3.out" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power3.out" });

    const fillSelector =
      ".feature-card, .service-card, .project-card, .timeline-step, .hero-metrics article, .story-lead, .story-note, .contact-card, .hero-orbit-copy__card";

    const updateTargetFillPosition = (target: HTMLElement, clientX: number, clientY: number) => {
      const rect = target.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--cursor-fill-x", `${x}%`);
      target.style.setProperty("--cursor-fill-y", `${y}%`);
    };

    const handleMove = (event: MouseEvent) => {
      moveDotX(event.clientX);
      moveDotY(event.clientY);
      moveRingX(event.clientX);
      moveRingY(event.clientY);
    };

    const handleInteractiveMove = (event: Event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement) || !(event instanceof MouseEvent) || !target.matches(fillSelector)) return;
      updateTargetFillPosition(target, event.clientX, event.clientY);
    };

    const handleEnter = (event: Event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) return;
      ring.classList.add("is-active");
      if (target.matches(fillSelector)) {
        target.classList.add("is-cursor-filled");
        if (event instanceof MouseEvent) {
          updateTargetFillPosition(target, event.clientX, event.clientY);
        }
      }
    };

    const handleLeave = (event: Event) => {
      const target = event.currentTarget;
      if (target instanceof HTMLElement && target.matches(fillSelector)) {
        target.classList.remove("is-cursor-filled");
      }
      ring.classList.remove("is-active");
    };

    // Observe interactive elements (including dynamically rendered ones)
    const observe = () => {
      const interactiveElements = Array.from(
        document.querySelectorAll<HTMLElement>(
          "a, button, .service-card, .project-card, .timeline-step, .feature-card, .hero-metrics article",
        ),
      );
      interactiveElements.forEach((element) => {
        element.addEventListener("mouseenter", handleEnter);
        element.addEventListener("mouseleave", handleLeave);
        element.addEventListener("mousemove", handleInteractiveMove);
      });
      return interactiveElements;
    };

    document.documentElement.classList.add("has-custom-cursor");
    window.addEventListener("mousemove", handleMove);
    const elements = observe();

    // Button hover spotlight effect
    const buttons = document.querySelectorAll<HTMLElement>(".button");
    const handleButtonMove = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      (e.currentTarget as HTMLElement).style.setProperty("--mx", `${x}%`);
      (e.currentTarget as HTMLElement).style.setProperty("--my", `${y}%`);
    };
    buttons.forEach((btn) => btn.addEventListener("mousemove", handleButtonMove as EventListener));

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", handleMove);
      elements.forEach((element) => {
        element.removeEventListener("mouseenter", handleEnter);
        element.removeEventListener("mouseleave", handleLeave);
        element.removeEventListener("mousemove", handleInteractiveMove);
      });
      buttons.forEach((btn) => btn.removeEventListener("mousemove", handleButtonMove as EventListener));
    };
  }, [isReady]);

  useEffect(() => {
    // Always start at the very top on mount / refresh
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const loader = loaderRef.current;
    const loaderValue = loaderValueRef.current;
    const loaderLine = loaderLineRef.current;

    if (!loader || !loaderValue || !loaderLine) {
      setIsReady(true);
      setShowLoader(false);
      return;
    }

    const progress = { value: 0 };
    const timeline = gsap.timeline();

    timeline
      .to(progress, {
        value: 100,
        duration: 2.1,
        ease: "power2.out",
        onUpdate: () => {
          const rounded = Math.round(progress.value);
          loaderValue.textContent = `${rounded.toString().padStart(2, "0")}`;
          loaderLine.style.transform = `scaleX(${progress.value / 100})`;
        },
      })
      .to(loader, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.9,
        ease: "power4.inOut",
        onStart: () => setIsReady(true),
        onComplete: () => setShowLoader(false),
      });

    return () => {
      timeline.kill();
    };
  }, []);

  useGSAP(
    () => {
      if (!wrapperRef.current || !contentRef.current) {
        return;
      }

      const existing = ScrollSmoother.get();
      const smoother =
        existing ??
        ScrollSmoother.create({
          wrapper: wrapperRef.current,
          content: contentRef.current,
          smooth: 1.2,
          speed: 1,
          effects: true,
          normalizeScroll: true,
        });

      smootherRef.current = smoother;

      return () => {
        if (!existing) {
          smoother.kill();
          smootherRef.current = null;
        }
      };
    },
    { scope: appRef },
  );

  useGSAP(
    () => {
      if (!isReady || !contentRef.current) {
        return;
      }

      scrollState.progress = 0;

      const isMobile = window.innerWidth <= 768;

      if (!isMobile) {
        gsap.set(".feature-card", { autoAlpha: 0, yPercent: 16, scale: 0.96 });
        gsap.set(".feature-card.is-first", { autoAlpha: 1, yPercent: 0, scale: 1 });
      }

      const introTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      introTimeline
        .fromTo(".topbar", { autoAlpha: 0, y: -32 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.12)
        .fromTo(".hero-char", { autoAlpha: 0, yPercent: 120, rotateX: -90 }, { autoAlpha: 1, yPercent: 0, rotateX: 0, duration: 1.1, stagger: 0.028 }, 0.22)
        .fromTo(".hero-kicker, .hero-subtitle, .hero-actions, .hero-metrics, .hero-scroll", { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.72);

      // Master scroll progress — drives 3D scene + progress bar
      ScrollTrigger.create({
        trigger: contentRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          scrollState.progress = self.progress;
          if (scrollBarRef.current) {
            scrollBarRef.current.style.width = `${(self.progress * 100).toFixed(1)}%`;
          }
        },
      });

      ScrollTrigger.create({
        trigger: ".hero-section",
        start: "bottom top+=100",
        end: "bottom top",
        toggleClass: { targets: ".topbar", className: "is-scrolled" },
      });

      // Active nav link tracking
      const sectionIds = ["home", "story", "craft", "work", "stack", "process", "resume", "contact"];
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      });

      gsap.to(".hero-copy", {
        yPercent: -18,
        autoAlpha: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-orbit-copy", {
        yPercent: -25,
        autoAlpha: 0.2,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      const featureCards = gsap.utils.toArray<HTMLElement>(".feature-card");

      if (!isMobile) {
        const featureTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".showcase-shell",
            start: "top top",
            end: "+=260%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        featureCards.forEach((card, index) => {
          const position = index * 1.05;
          if (index > 0) {
            featureTimeline.fromTo(
              card,
              { autoAlpha: 0, yPercent: 16, scale: 0.96 },
              { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.35 },
              position,
            );
            featureTimeline.to(
              featureCards[index - 1],
              { autoAlpha: 0.15, yPercent: -18, scale: 0.95, duration: 0.35 },
              position,
            );
          }
          if (index < featureCards.length - 1) {
            featureTimeline.to(card, { autoAlpha: 0.18, yPercent: -20, scale: 0.95, duration: 0.35 }, position + 0.58);
          } else {
            featureTimeline.to(card, { autoAlpha: 1, yPercent: -4, scale: 1.02, duration: 0.4 }, position + 0.6);
          }
        });
      }

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 54, filter: "blur(6px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
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
          { autoAlpha: 0, y: 60, scale: 0.95, filter: "blur(4px)" },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".services-grid",
              start: "top 78%",
            },
          },
        );
      }

      gsap.utils.toArray<HTMLElement>(".reveal-word-group").forEach((element) => {
        const words = element.querySelectorAll(".reveal-word");
        gsap.fromTo(
          words,
          { autoAlpha: 0, yPercent: 120 },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.8,
            stagger: 0.045,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
            },
          },
        );
      });

      // Horizontal scroll — pin the work section and slide rail left
      if (workSectionRef.current && workRailRef.current && workViewportRef.current && window.innerWidth > 900) {
        const rail = workRailRef.current;
        const section = workSectionRef.current;
        const viewport = workViewportRef.current;

        gsap.set(rail, { x: 0 });

        gsap.to(rail, {
          x: () => {
            const travel = Math.max(rail.scrollWidth - viewport.offsetWidth, 0);
            return -travel;
          },
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => {
              const travel = Math.max(rail.scrollWidth - viewport.offsetWidth, 0);
              return `+=${Math.max(travel, window.innerHeight * 2)}`;
            },
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
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
          { autoAlpha: 0, y: 48, x: -20, filter: "blur(4px)" },
          {
            autoAlpha: 1,
            y: 0,
            x: 0,
            filter: "blur(0px)",
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
    <div ref={appRef} className={`app-shell${isReady ? " is-ready" : ""}`}>
      {showLoader ? (
        <div ref={loaderRef} className="loading-screen" aria-hidden={isReady}>
          <div className="loading-screen__grid" />
          <div className="loading-screen__inner">
            <p className="loading-screen__label">Preparing cinematic mode</p>
            <span ref={loaderValueRef} className="loading-screen__value">
              00
            </span>
            <div className="loading-screen__line-shell">
              <div ref={loaderLineRef} className="loading-screen__line" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="scroll-progress" aria-hidden="true">
        <div ref={scrollBarRef} className="scroll-progress__bar" />
      </div>

      <div ref={cursorDotRef} className="cursor-dot" />
      <div ref={cursorRingRef} className="cursor-ring" />

      <div className="scene-layer" aria-hidden="true">
        <HeroScene />
      </div>

      <div className="scene-vignette" aria-hidden="true" />

      <div id="smooth-wrapper" ref={wrapperRef}>
        <div id="smooth-content" ref={contentRef}>
          <header className="topbar">
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
            <section id="home" className="hero-section">
              <div className="hero-copy">
                <p className="hero-kicker">Engineering student • Cloud • DevOps • Networking • Full stack</p>

                <h1 className="hero-title" aria-label="Vraj Shah">
                  <span className="hero-title__line">{renderChars("VRAJ")}</span>
                  <span className="hero-title__line">{renderChars("SHAH")}</span>
                </h1>

                <p className="hero-subtitle">
                  I build across cloud, DevOps, networking, and frontend, with a strong pull toward systems that feel solid and interfaces that feel sharp.
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
                  <article>
                    <strong>Project-led</strong>
                    <span>The strongest builds show up early, with enough detail to explain what matters.</span>
                  </article>
                  <article>
                    <strong>Systems-minded</strong>
                    <span>Linux, automation, networking, research, and frontend work all live in the same build story.</span>
                  </article>
                  <article>
                    <strong>Built with intent</strong>
                    <span>The layout stays clean, the motion stays useful, and the copy stays direct.</span>
                  </article>
                </div>
              </div>

              <div className="hero-orbit-copy">
                <div className="hero-orbit-copy__card hero-orbit-copy__card--primary glass-card">
                  <span>Current energy</span>
                  <strong>I am at my best when I can connect solid engineering fundamentals with interfaces that feel modern, fast, and deliberate.</strong>
                  <div className="hero-orbit-copy__list">
                    <div>
                      <small>Right now</small>
                      <p>Cloud workflows, observability, networking, and frontend systems are the areas pulling me forward.</p>
                    </div>
                    <div>
                      <small>Build style</small>
                      <p>I like clean architecture, visible system thinking, and product surfaces that feel considered.</p>
                    </div>
                  </div>
                </div>
                <div className="hero-orbit-copy__card hero-orbit-copy__card--secondary glass-card">
                  <span>What you will find here</span>
                  <strong>Projects with real engineering weight, a clear stack, and a portfolio that moves with confidence.</strong>
                </div>
                <div className="hero-scroll">
                  <span>Scroll to explore</span>
                </div>
              </div>
            </section>

            <section className="showcase-shell">
              <div className="showcase-frame">
                <div className="showcase-copy reveal-up">
                  <p className="eyebrow">Portfolio highlight</p>
                  <h2>A portfolio with pace, clarity, and enough edge to stay memorable.</h2>
                </div>

                <div className="feature-stack">
                  {featurePanels.map((panel, index) => (
                    <article key={panel.id} className={`feature-card glass-card${index === 0 ? " is-first" : ""}`}>
                      <span className="feature-card__index">{panel.id}</span>
                      <p className="eyebrow">{panel.eyebrow}</p>
                      <h3>{panel.title}</h3>
                      <p>{panel.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="story" className="story-section section-shell">
              <div className="section-heading reveal-up">
                <p className="eyebrow">Story</p>
                <h2>I like building things that are technically grounded and still feel good to use.</h2>
              </div>

              <div className="story-grid">
                <div className="story-lead glass-card reveal-up">
                  <p className="reveal-word-group">
                    {renderWords(
                      "This portfolio is a compact read on how I work: strong systems thinking, modern presentation, and a genuine interest in building things that hold up under real use.",
                    )}
                  </p>
                </div>

                <div className="story-notes">
                  <article className="story-note glass-card reveal-up">
                    <strong>Clear structure</strong>
                    <p>The sections move from identity to work, stack, process, resume, and contact without dragging the experience down.</p>
                  </article>
                  <article className="story-note glass-card reveal-up">
                    <strong>Modern, not overdone</strong>
                    <p>The visuals bring energy, but the portfolio stays anchored in projects, tools, and actual engineering choices.</p>
                  </article>
                </div>
              </div>
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="craft" className="services-section section-shell">
              <div className="section-heading reveal-up">
                <p className="eyebrow">Craft</p>
                <h2>The mix is simple: systems depth, frontend polish, and a bias toward building things properly.</h2>
              </div>

              <div className="services-grid">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <article key={service.title} className="service-card glass-card reveal-up">
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

            <section id="work" ref={workSectionRef} className="work-section">
              <div className="work-stage">
                <div className="work-intro reveal-up">
                  <p className="eyebrow">Selected work</p>
                  <h2>Projects that ship, not just screenshots.</h2>
                  <p className="work-intro__text">
                    Each card links directly to GitHub. Live demos shown where available.
                  </p>
                </div>

                <div ref={workViewportRef} className="work-viewport">
                  <div ref={workRailRef} className="work-rail">
                    {projects.map((project) => (
                      <article key={project.index} className="project-card glass-card">
                        <div className="project-card__visual">
                          <span className="project-card__category">{project.category}</span>
                          <span className="project-card__num">{project.index}</span>
                        </div>
                        <div className="project-card__body">
                          <h3>{project.title}</h3>
                          <p className="project-card__desc">{project.description}</p>
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
            </section>

            <section id="stack" className="section-shell techstack-shell">
              <TechStack />
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="process" className="process-section section-shell">
              <div className="section-heading reveal-up">
                <p className="eyebrow">Process</p>
                <h2>I care about flow, hierarchy, and the small decisions that make a build feel finished.</h2>
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
                <h2>Experience, projects, and published research in one place.</h2>
              </div>

              <div className="resume-layout">
                <div className="resume-copy glass-card reveal-up">
                  <span className="resume-copy__label">Resume</span>
                  <h3>B.Tech Computer Science · VIT Bhopal · CGPA 8.75 · DevOps, Cloud, Networking, Full-Stack.</h3>
                  <p>
                    Open to internships, collaborations, and engineering opportunities across cloud infrastructure, DevOps, cybersecurity, and full-stack development.
                  </p>

                  <div className="resume-actions">
                    <a className="button button--primary" href="https://drive.google.com/file/d/1iB-za6zlcpj9CG8PNOv2prKdbUxe-TkH/view?usp=drive_link" target="_blank" rel="noreferrer">
                      <FiFileText />
                      View Resume
                    </a>
                    <a className="button button--ghost" href="https://drive.google.com/file/d/1iB-za6zlcpj9CG8PNOv2prKdbUxe-TkH/view?usp=drive_link" target="_blank" rel="noreferrer">
                      <FiArrowDownRight />
                      Download PDF
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
                </div>

                <div className="resume-preview glass-card reveal-up" aria-label="Resume preview">
                  <div className="resume-preview__sheet">
                    <div className="resume-preview__top">
                      <strong>Vraj Shah</strong>
                      <span>vraj1012006shah@gmail.com</span>
                    </div>
                    <div className="resume-preview__grid">
                      <div />
                      <div />
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                    <div className="resume-preview__footer">
                      <span>Click "View Resume" to open the full document.</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="section-divider" aria-hidden="true" />

            <section id="contact" className="contact-section">
              <div className="contact-card glass-card reveal-up">
                <p className="eyebrow">Contact</p>
                <h2>Open to good work, sharp teams, and interesting problems.</h2>
                <p>
                  If you want to talk about projects, internships, collaboration, or engineering ideas, feel free to reach out.
                </p>

                <div className="contact-actions">
                  <a className="button button--primary" href="mailto:vraj1012006shah@gmail.com">
                    <FiMail />
                    Start the conversation
                  </a>
                  <a className="button button--ghost" href="#home" onClick={handleNavClick}>
                    <FiCommand />
                    Back to top
                  </a>
                </div>
              </div>
            </section>

            <footer className="footer-badge glass-card" aria-label="Footer">
              <div className="footer-badge__copy">
                <p className="eyebrow">Portfolio footer</p>
                <strong>Built with a clear story, strong motion, and a modern engineering voice.</strong>
                <span>Cloud, systems, networking, frontend, and research work brought together in one clean portfolio.</span>
                <div className="footer-badge__start">
                  <span>Start here</span>
                  <div className="footer-badge__start-links">
                    <a href="#work" onClick={handleNavClick}>
                      Featured work
                    </a>
                    <a href="#resume" onClick={handleNavClick}>
                      Resume
                    </a>
                    <a href="#stack" onClick={handleNavClick}>
                      Tech stack
                    </a>
                  </div>
                </div>
              </div>

              <div className="footer-badge__actions">
                <div className="footer-badge__nav">
                  {navLinks.slice(1).map((link) => (
                    <a key={link.href} href={link.href} onClick={handleNavClick}>
                      {link.label}
                    </a>
                  ))}
                </div>

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
