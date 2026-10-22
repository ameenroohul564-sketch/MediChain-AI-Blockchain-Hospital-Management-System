import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

// ======================================================
// TYPES
// ======================================================

interface User {
  _id?: string;
  id?: string;

  fullName: string;
  email: string;

  role:
    | "patient"
    | "doctor"
    | "admin";
}

// ======================================================
// COMPONENT
// ======================================================

const Dashboard = () => {
  const navigate =
    useNavigate();

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  // ======================================================
  // AUTH CHECK
  // ======================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    const storedUser =
      localStorage.getItem(
        "user"
      );

    if (
      !token ||
      !storedUser
    ) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    try {
      const parsedUser: User =
        JSON.parse(
          storedUser
        );

      // ================================================
      // ROLE REDIRECT
      // ================================================

      if (
        parsedUser.role ===
        "doctor"
      ) {
        navigate(
          "/doctor-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      if (
        parsedUser.role ===
        "admin"
      ) {
        navigate(
          "/admin-dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      if (
        parsedUser.role !==
        "patient"
      ) {
        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }

      setUser(
        parsedUser
      );
    } catch (error) {
      console.error(
        "DASHBOARD USER ERROR:",
        error
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }
  }, [navigate]);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  // ======================================================
  // LOADING
  // ======================================================

  if (!user) {
    return (
      <div className="app-page patient-portal-page">
        <div className="doctor-loading-box">
          <div className="loading-spinner"></div>

          <h3>
            Loading Dashboard
          </h3>

          <p>
            Preparing your
            patient portal...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="app-page patient-portal-page">
      <div className="app-container">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="medical-page-header">
          <div>
            <div className="patient-badge">
              PATIENT PORTAL
            </div>

            <h1>
              Welcome,{" "}
              {user.fullName}
            </h1>

            <p>
              Manage your
              appointments,
              medical records,
              privacy and secure
              healthcare access.
            </p>
          </div>

          <div
            className="button-row"
            style={{
              position:
                "relative",

              zIndex: 5,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>
          </div>
        </div>

        {/* ==================================================
            HERO
        ================================================== */}

        <div className="patient-dashboard-hero">
          <div className="patient-dashboard-hero-icon">
            +
          </div>

          <div>
            <span>
              MEDICHAIN AI
            </span>

            <h2>
              Secure Digital
              Healthcare
            </h2>

            <p>
              AI-assisted
              pre-consultation,
              secure appointment
              booking,
              blockchain-backed
              medical record
              integrity and
              patient-controlled
              access.
            </p>
          </div>
        </div>

        {/* ==================================================
            MAIN ACTIONS
        ================================================== */}

        <div className="patient-dashboard-grid">
          {/* AI APPOINTMENT */}

          <button
            type="button"
            className="patient-dashboard-card"
            onClick={() =>
              navigate(
                "/appointment"
              )
            }
          >
            <div className="patient-dashboard-card-icon">
              🩺
            </div>

            <div>
              <span>
                AI-ASSISTED
              </span>

              <h3>
                Book Appointment
              </h3>

              <p>
                Complete a simple
                pre-consultation
                and get a
                specialization-based
                doctor
                recommendation.
              </p>
            </div>

            <div className="patient-dashboard-card-arrow">
              →
            </div>
          </button>

          {/* MY APPOINTMENTS */}

          <button
            type="button"
            className="patient-dashboard-card"
            onClick={() =>
              navigate(
                "/my-appointments"
              )
            }
          >
            <div className="patient-dashboard-card-icon">
              📅
            </div>

            <div>
              <span>
                APPOINTMENTS
              </span>

              <h3>
                My Appointments
              </h3>

              <p>
                View pending,
                approved,
                completed and
                cancelled
                appointments.
              </p>
            </div>

            <div className="patient-dashboard-card-arrow">
              →
            </div>
          </button>

          {/* MEDICAL RECORDS */}

          <button
            type="button"
            className="patient-dashboard-card"
            onClick={() =>
              navigate(
                "/medical-records"
              )
            }
          >
            <div className="patient-dashboard-card-icon">
              📄
            </div>

            <div>
              <span>
                BLOCKCHAIN
                INTEGRITY
              </span>

              <h3>
                Medical Records
              </h3>

              <p>
                View your medical
                records and verify
                their SHA-256
                integrity against
                the blockchain
                ledger.
              </p>
            </div>

            <div className="patient-dashboard-card-arrow">
              →
            </div>
          </button>

          {/* ==================================================
              PRIVACY & RECORD ACCESS
          ================================================== */}

          <button
            type="button"
            className="patient-dashboard-card patient-dashboard-privacy-card"
            onClick={() =>
              navigate(
                "/record-access"
              )
            }
          >
            <div className="patient-dashboard-card-icon">
              🔐
            </div>

            <div>
              <span>
                PRIVACY &
                CONSENT
              </span>

              <h3>
                Privacy &
                Record Access
              </h3>

              <p>
                Grant or revoke
                doctor access and
                see who has viewed
                your medical
                records.
              </p>
            </div>

            <div className="patient-dashboard-card-arrow">
              →
            </div>
          </button>
        </div>

        {/* ==================================================
            SECURITY INFO
        ================================================== */}

        <div className="patient-security-section">
          <div className="patient-security-header">
            <span>
              SECURITY LAYERS
            </span>

            <h2>
              How MediChain
              Protects Your Data
            </h2>
          </div>

          <div className="patient-security-grid">
            <div className="patient-security-item">
              <strong>
                01
              </strong>

              <h4>
                Authentication
              </h4>

              <p>
                Secure JWT-based
                role authentication
                controls access.
              </p>
            </div>

            <div className="patient-security-item">
              <strong>
                02
              </strong>

              <h4>
                Patient Consent
              </h4>

              <p>
                You control which
                doctor can view
                protected records.
              </p>
            </div>

            <div className="patient-security-item">
              <strong>
                03
              </strong>

              <h4>
                Blockchain Hash
              </h4>

              <p>
                SHA-256 record
                hashes are anchored
                on an
                Ethereum-compatible
                blockchain.
              </p>
            </div>

            <div className="patient-security-item">
              <strong>
                04
              </strong>

              <h4>
                Audit Trail
              </h4>

              <p>
                Record updates and
                doctor access can
                be tracked for
                accountability.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            ACCOUNT INFO
        ================================================== */}

        <div className="patient-account-card">
          <div>
            <span>
              PATIENT ACCOUNT
            </span>

            <h3>
              {user.fullName}
            </h3>

            <p>
              {user.email}
            </p>
          </div>

          <div className="patient-account-status">
            <span>
              ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;