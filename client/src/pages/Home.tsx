import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="tech-home-page">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="tech-navbar">
        <div
          className="tech-brand"
          onClick={() => navigate("/")}
        >
          <div className="tech-brand-icon">
            +
          </div>

          <div>
            <h2>MediChain AI</h2>
            <p>
              Smart Healthcare Platform
            </p>
          </div>
        </div>

        <div className="tech-navbar-links">
          <a href="#features">
            Features
          </a>

          <a href="#technology">
            Technology
          </a>

          <a href="#workflow">
            Workflow
          </a>

          <button
            type="button"
            className="tech-nav-login"
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </button>

          <button
            type="button"
            className="tech-nav-register"
            onClick={() =>
              navigate("/register")
            }
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="tech-hero">
        {/* BACKGROUND DECORATION */}

        <div className="hero-grid-bg"></div>

        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="tech-hero-container">
          {/* LEFT */}

          <div className="tech-hero-content">
            <div className="tech-live-badge">
              <span></span>
              SMART DIGITAL HEALTHCARE
            </div>

            <h1>
              Healthcare Management
              <br />
              <span>
                Built for the Future.
              </span>
            </h1>

            <p>
              MediChain AI combines secure
              appointment management, digital
              medical records, role-based
              authentication and cryptographic
              integrity verification in one
              intelligent healthcare platform.
            </p>

            <div className="tech-hero-actions">
              <button
                type="button"
                className="tech-primary-btn"
                onClick={() =>
                  navigate("/login")
                }
              >
                Enter Healthcare Portal
                <span>→</span>
              </button>

              <button
                type="button"
                className="tech-secondary-btn"
                onClick={() =>
                  navigate("/register")
                }
              >
                Create Patient Account
              </button>
            </div>

            {/* MINI TECHNOLOGY LABELS */}

            <div className="hero-tech-labels">
              <span>React</span>
              <span>TypeScript</span>
              <span>Node.js</span>
              <span>MongoDB</span>
              <span>JWT</span>
              <span>SHA-256</span>
            </div>
          </div>

          {/* RIGHT FUTURISTIC HOSPITAL PANEL */}

          <div className="tech-hero-visual">
            <div className="hospital-command-card">
              <div className="hospital-card-header">
                <div>
                  <span>
                    MEDICHAIN CONTROL CENTER
                  </span>

                  <h3>
                    Healthcare System
                  </h3>
                </div>

                <div className="system-online">
                  <span></span>
                  ONLINE
                </div>
              </div>

              <div className="hospital-center-display">
                <div className="hospital-ring ring-one">
                  <div className="hospital-ring ring-two">
                    <div className="hospital-core">
                      +
                    </div>
                  </div>
                </div>
              </div>

              <div className="hospital-system-grid">
                <div>
                  <strong>Patient</strong>
                  <span>
                    Secure Portal
                  </span>
                </div>

                <div>
                  <strong>Doctor</strong>
                  <span>
                    Clinical Portal
                  </span>
                </div>

                <div>
                  <strong>Records</strong>
                  <span>
                    Digital Access
                  </span>
                </div>

                <div>
                  <strong>SHA-256</strong>
                  <span>
                    Integrity Check
                  </span>
                </div>
              </div>

              <div className="hospital-health-line">
                <div></div>
              </div>
            </div>

            {/* FLOATING CARDS */}

            <div className="tech-floating-card tech-float-one">
              <div className="floating-status-icon">
                ✓
              </div>

              <div>
                <strong>
                  Record Verified
                </strong>

                <span>
                  Integrity Valid
                </span>
              </div>
            </div>

            <div className="tech-floating-card tech-float-two">
              <div className="floating-blue-number">
                24/7
              </div>

              <div>
                <strong>
                  Healthcare Access
                </strong>

                <span>
                  Digital Portal
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SYSTEM INFORMATION STRIP
      ====================================================== */}

      <section className="tech-status-strip">
        <div>
          <strong>02</strong>
          <span>User Roles</span>
        </div>

        <div>
          <strong>05+</strong>
          <span>Core Modules</span>
        </div>

        <div>
          <strong>JWT</strong>
          <span>Authentication</span>
        </div>

        <div>
          <strong>SHA-256</strong>
          <span>Record Integrity</span>
        </div>

        <div>
          <strong>MongoDB</strong>
          <span>Secure Data Storage</span>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}

      <section
        id="features"
        className="tech-section"
      >
        <div className="tech-section-heading">
          <span>
            CORE SYSTEM MODULES
          </span>

          <h2>
            One Platform.
            Complete Hospital Workflow.
          </h2>

          <p>
            Designed to connect patients and
            doctors through a secure digital
            healthcare workflow.
          </p>
        </div>

        <div className="tech-feature-grid">
          {/* FEATURE 1 */}

          <div className="tech-feature-card">
            <div className="tech-feature-number">
              01
            </div>

            <h3>
              Patient Portal
            </h3>

            <p>
              Patients can register, login,
              book consultations, track
              appointments and access their
              medical records securely.
            </p>

            <div className="feature-tag">
              Role-Based Access
            </div>
          </div>

          {/* FEATURE 2 */}

          <div className="tech-feature-card">
            <div className="tech-feature-number">
              02
            </div>

            <h3>
              Doctor Portal
            </h3>

            <p>
              Doctors can manage appointment
              requests, review patients and
              create consultation medical
              records.
            </p>

            <div className="feature-tag">
              Clinical Management
            </div>
          </div>

          {/* FEATURE 3 */}

          <div className="tech-feature-card">
            <div className="tech-feature-number">
              03
            </div>

            <h3>
              Appointment System
            </h3>

            <p>
              Patients send requests while
              doctors approve, complete or
              cancel consultations through a
              connected workflow.
            </p>

            <div className="feature-tag">
              Live Status
            </div>
          </div>

          {/* FEATURE 4 */}

          <div className="tech-feature-card">
            <div className="tech-feature-number">
              04
            </div>

            <h3>
              Medical Records
            </h3>

            <p>
              Diagnosis, prescriptions,
              clinical notes and follow-up
              information are maintained
              digitally.
            </p>

            <div className="feature-tag">
              Digital Healthcare
            </div>
          </div>

          {/* FEATURE 5 */}

          <div className="tech-feature-card">
            <div className="tech-feature-number">
              05
            </div>

            <h3>
              Integrity Verification
            </h3>

            <p>
              Medical record contents are
              protected using SHA-256
              cryptographic hash verification
              to detect modifications.
            </p>

            <div className="feature-tag">
              SHA-256
            </div>
          </div>

          {/* FEATURE 6 */}

          <div className="tech-feature-card">
            <div className="tech-feature-number">
              06
            </div>

            <h3>
              Secure Authentication
            </h3>

            <p>
              JWT authentication and password
              hashing protect access to
              patient and doctor services.
            </p>

            <div className="feature-tag">
              JWT + bcrypt
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TECHNOLOGY STACK
      ====================================================== */}

      <section
        id="technology"
        className="technology-section"
      >
        <div className="tech-section-heading">
          <span>
            TECHNOLOGY ARCHITECTURE
          </span>

          <h2>
            Built with a Modern
            Full-Stack Architecture
          </h2>

          <p>
            MediChain AI combines modern
            frontend, backend, database and
            security technologies.
          </p>
        </div>

        <div className="technology-stack-grid">
          {/* FRONTEND */}

          <div className="technology-stack-card">
            <div className="stack-card-top">
              <div className="stack-icon">
                FE
              </div>

              <div>
                <span>
                  FRONTEND
                </span>

                <h3>
                  User Experience
                </h3>
              </div>
            </div>

            <div className="technology-items">
              <div>
                <strong>React</strong>
                <span>
                  Component-based UI
                </span>
              </div>

              <div>
                <strong>TypeScript</strong>
                <span>
                  Type-safe development
                </span>
              </div>

              <div>
                <strong>Axios</strong>
                <span>
                  API communication
                </span>
              </div>

              <div>
                <strong>React Router</strong>
                <span>
                  Role-based navigation
                </span>
              </div>
            </div>
          </div>

          {/* BACKEND */}

          <div className="technology-stack-card">
            <div className="stack-card-top">
              <div className="stack-icon">
                BE
              </div>

              <div>
                <span>
                  BACKEND
                </span>

                <h3>
                  Server & API
                </h3>
              </div>
            </div>

            <div className="technology-items">
              <div>
                <strong>Node.js</strong>
                <span>
                  Runtime environment
                </span>
              </div>

              <div>
                <strong>Express</strong>
                <span>
                  REST API server
                </span>
              </div>

              <div>
                <strong>TypeScript</strong>
                <span>
                  Backend type safety
                </span>
              </div>

              <div>
                <strong>REST API</strong>
                <span>
                  Client-server communication
                </span>
              </div>
            </div>
          </div>

          {/* DATA + SECURITY */}

          <div className="technology-stack-card">
            <div className="stack-card-top">
              <div className="stack-icon">
                DB
              </div>

              <div>
                <span>
                  DATA & SECURITY
                </span>

                <h3>
                  Secure Infrastructure
                </h3>
              </div>
            </div>

            <div className="technology-items">
              <div>
                <strong>MongoDB</strong>
                <span>
                  Medical data storage
                </span>
              </div>

              <div>
                <strong>Mongoose</strong>
                <span>
                  Data modelling
                </span>
              </div>

              <div>
                <strong>JWT</strong>
                <span>
                  Authentication tokens
                </span>
              </div>

              <div>
                <strong>SHA-256</strong>
                <span>
                  Record integrity verification
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WORKFLOW / USE CASES
      ====================================================== */}

      <section
        id="workflow"
        className="workflow-section"
      >
        <div className="tech-section-heading">
          <span>
            HEALTHCARE WORKFLOW
          </span>

          <h2>
            From Appointment
            to Verified Medical Record
          </h2>

          <p>
            The complete MediChain AI
            consultation workflow.
          </p>
        </div>

        <div className="tech-workflow">
          <div className="workflow-tech-card">
            <span>01</span>

            <h3>
              Patient Login
            </h3>

            <p>
              Secure patient authentication.
            </p>
          </div>

          <div className="workflow-connector">
            →
          </div>

          <div className="workflow-tech-card">
            <span>02</span>

            <h3>
              Book Appointment
            </h3>

            <p>
              Select doctor and consultation time.
            </p>
          </div>

          <div className="workflow-connector">
            →
          </div>

          <div className="workflow-tech-card">
            <span>03</span>

            <h3>
              Doctor Review
            </h3>

            <p>
              Doctor approves and manages request.
            </p>
          </div>

          <div className="workflow-connector">
            →
          </div>

          <div className="workflow-tech-card">
            <span>04</span>

            <h3>
              Medical Record
            </h3>

            <p>
              Diagnosis and prescription recorded.
            </p>
          </div>

          <div className="workflow-connector">
            →
          </div>

          <div className="workflow-tech-card">
            <span>05</span>

            <h3>
              Verify Integrity
            </h3>

            <p>
              SHA-256 hash confirms data integrity.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          USE CASES
      ====================================================== */}

      <section className="usecase-section">
        <div className="usecase-left">
          <span>
            REAL-WORLD USE CASES
          </span>

          <h2>
            Designed Around
            Modern Hospital Operations
          </h2>

          <p>
            MediChain AI demonstrates how
            healthcare workflows can be
            digitized while preserving secure
            access and record integrity.
          </p>

          <button
            type="button"
            className="tech-primary-btn"
            onClick={() =>
              navigate("/login")
            }
          >
            Launch Portal
            <span>→</span>
          </button>
        </div>

        <div className="usecase-grid">
          <div>
            <strong>
              Patient Consultation
            </strong>

            <span>
              Digital appointment booking
            </span>
          </div>

          <div>
            <strong>
              Doctor Workflow
            </strong>

            <span>
              Appointment management
            </span>
          </div>

          <div>
            <strong>
              Digital Prescription
            </strong>

            <span>
              Structured clinical records
            </span>
          </div>

          <div>
            <strong>
              Record Verification
            </strong>

            <span>
              Cryptographic integrity check
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="tech-final-cta">
        <div>
          <span>
            MEDICHAIN AI
          </span>

          <h2>
            Intelligent Healthcare.
            Secure Digital Records.
          </h2>

          <p>
            Experience a connected healthcare
            management system built using
            modern web technologies.
          </p>
        </div>

        <div className="final-cta-buttons">
          <button
            type="button"
            className="tech-white-btn"
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </button>

          <button
            type="button"
            className="tech-dark-btn"
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </button>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="tech-footer">
        <div className="tech-brand">
          <div className="tech-brand-icon small">
            +
          </div>

          <div>
            <h3>
              MediChain AI
            </h3>

            <p>
              Blockchain-Based Hospital
              Management System
            </p>
          </div>
        </div>

        <p>
          Secure Healthcare • Role-Based Access •
          SHA-256 Record Integrity
        </p>
      </footer>
    </div>
  );
};

export default Home;