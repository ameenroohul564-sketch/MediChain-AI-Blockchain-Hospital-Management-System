import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response =
        await loginUser({
          email:
            email.trim(),

          password,
        });

      if (
        !response?.token ||
        !response?.user
      ) {
        setError(
          "Invalid login response."
        );

        return;
      }

      localStorage.setItem(
        "token",
        response.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          response.user
        )
      );

      // ADMIN

      if (
        response.user.role ===
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

      // DOCTOR

      if (
        response.user.role ===
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

      // PATIENT

      if (
        response.user.role ===
        "patient"
      ) {
        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

      navigate("/", {
        replace: true,
      });
    } catch (error: any) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error?.response?.data
          ?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-tech-page">
      <div className="auth-tech-bg-grid"></div>

      <div className="auth-tech-shell">
        <div className="auth-tech-left">
          <div className="auth-tech-brand">
            <div className="auth-tech-logo">
              +
            </div>

            <div>
              <h2>
                MediChain AI
              </h2>

              <p>
                Smart Healthcare Platform
              </p>
            </div>
          </div>

          <div className="auth-tech-left-content">
            <div className="auth-tech-badge">
              SECURE HEALTHCARE ACCESS
            </div>

            <h1>
              Connected Care.
              <br />
              Secure Access.
            </h1>

            <p>
              Secure role-based access
              for patients, doctors
              and administrators.
            </p>

            <div className="auth-tech-features">
              <div>
                <span>01</span>

                <div>
                  <strong>
                    Patient Portal
                  </strong>

                  <p>
                    Appointments and medical records
                  </p>
                </div>
              </div>

              <div>
                <span>02</span>

                <div>
                  <strong>
                    Doctor Portal
                  </strong>

                  <p>
                    Consultation and record management
                  </p>
                </div>
              </div>

              <div>
                <span>03</span>

                <div>
                  <strong>
                    Admin Control
                  </strong>

                  <p>
                    Secure doctor account management
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-tech-system">
            <span></span>
            SYSTEM ONLINE
          </div>
        </div>

        <div className="auth-tech-right">
          <div className="auth-tech-form-header">
            <span>
              PORTAL LOGIN
            </span>

            <h2>
              Welcome Back
            </h2>

            <p>
              Enter your registered
              credentials to continue.
            </p>
          </div>

          {error && (
            <div className="auth-tech-error">
              <div>
                !
              </div>

              <p>
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-tech-form"
          >
            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>

              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Enter your email address"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>

              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="auth-tech-primary-btn"
              disabled={loading}
            >
              {loading
                ? "Authenticating..."
                : "Login to Portal"}
            </button>
          </form>

          <div className="auth-tech-divider">
            <span>
              NEW PATIENT
            </span>
          </div>

          <button
            type="button"
            className="auth-tech-secondary-btn"
            onClick={() =>
              navigate("/register")
            }
          >
            Create Patient Account
          </button>

          <button
            type="button"
            className="auth-tech-home-btn"
            onClick={() =>
              navigate("/")
            }
          >
            ← Back to Home
          </button>

          <div className="auth-tech-security-card">
            <strong>
              Role-Based Access
            </strong>

            <p>
              Patient, doctor and
              administrator access is
              controlled using JWT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;