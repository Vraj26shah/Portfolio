import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const Work = () => {
  useGSAP(() => {
  let translateX: number = 0;

  function setTranslateX() {
    const box = document.getElementsByClassName("work-box");
    translateX = window.innerWidth * (box.length - 1);
  }

  setTranslateX();

  let timeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".work-section",
      start: "top top",
      end: `+=${translateX}`, // Use actual scroll width
      scrub: true,
      pin: true,
      id: "work",
    },
  });

  timeline.to(".work-flex", {
    x: -translateX,
    ease: "none",
  });

  // Clean up (optional, good practice)
  return () => {
    timeline.kill();
    ScrollTrigger.getById("work")?.kill();
  };
}, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>01</h3>
                <div>
                  <h4>ScholarStack</h4>
                  <p>Academic Resource Platform</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Linux, Nginx, Python, Bash, Certbot, DNS, Cron Jobs</p>
            </div>
            <WorkImage
              image="/images/placeholder.webp"
              alt="ScholarStack"
              link="https://github.com/Vraj26shah/vitbsmashers"
            />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>02</h3>
                <div>
                  <h4>AgentForge</h4>
                  <p>AI Agent Orchestration Platform</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>FastAPI, React, TypeScript, Claude AI, Docker, SpacetimeDB, WebSocket, JWT</p>
              <a href="https://agentforges.onrender.app" target="_blank" rel="noreferrer">agentforges.onrender.app ↗</a>
            </div>
            <WorkImage
              image="/project-screenshot-04.png"
              alt="AgentForge"
              link="https://github.com/Vraj26shah/agentforge"
            />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>03</h3>
                <div>
                  <h4>DevOps Engineering Lab</h4>
                  <p>Infrastructure & CI/CD</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Docker, GitHub Actions, Prometheus, Grafana, AWS EC2, Bash</p>
            </div>
            <WorkImage
              image="/images/placeholder.webp"
              alt="DevOps Lab"
              link="https://github.com/Vraj26shah/Devops-aws-"
            />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>04</h3>
                <div>
                  <h4>Network Traffic Analyser</h4>
                  <p>Security & Networking</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Python, Scapy, Wireshark, TCP/IP, ARP, Nmap</p>
            </div>
            <WorkImage
              image="/images/placeholder.webp"
              alt="Network Analyser"
              link="https://github.com/Vraj26shah/NetworkAnalyzer"
            />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>05</h3>
                <div>
                  <h4>Mentorship Algorithm</h4>
                  <p>Research & ML</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Decision Trees, Genetic Programming, Python, Data Profiling</p>
            </div>
            <WorkImage
              image="/images/placeholder.webp"
              alt="Mentorship Algorithm"
              link="https://github.com/Vraj26shah/fathersadvice1"
            />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>06</h3>
                <div>
                  <h4>MediGuard</h4>
                  <p>Full-Stack Healthcare App</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Node.js, React, JavaScript, REST API, MongoDB</p>
            </div>
            <WorkImage
              image="/images/placeholder.webp"
              alt="MediGuard"
              link="https://github.com/Vraj26shah/mediguard"
            />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>07</h3>
                <div>
                  <h4>Timetable Maker</h4>
                  <p>Web Scheduling Tool</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>JavaScript, HTML, CSS, Responsive Design, Vercel</p>
            </div>
            <WorkImage
              image="/images/placeholder.webp"
              alt="Timetable Maker"
              link="https://github.com/Vraj26shah/timetablemaker"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
