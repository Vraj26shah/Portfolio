import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech in Computer Science</h4>
                <h5>VIT Bhopal University</h5>
              </div>
              <h3>2023</h3>
            </div>
            <p>
              Pursuing B.Tech in Computer Science with a CGPA of 8.75/10.00.
              Active in hackathons, research publishing, and technical blogging
              on Linux, networking, and computer architecture.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Founder & Full-Stack Developer</h4>
                <h5>ScholarStack</h5>
              </div>
              <h3>2023</h3>
            </div>
            <p>
              Built and operated a Linux-hosted academic resource platform from
              scratch, sustaining 99%+ uptime for 500+ concurrent users and
              generating ₹10,000+ monthly revenue with zero external IT support.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>DevOps & Cloud Engineering</h4>
                <h5>Self-Directed Projects</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Building production-grade CI/CD pipelines, Docker containers,
              Prometheus + Grafana monitoring stacks on AWS EC2, and exploring
              cybersecurity through TryHackMe CTFs and OWASP Top 10.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
