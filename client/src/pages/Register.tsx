import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !fullName.trim()
    ) {
      setError(
        "Please enter your full name."
      );

      return;
    }

    if (
      password.length < 6
    ) {
      setError(
        "Password must be at least 6 characters."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await registerUser({
          fullName:
            fullName.trim(),

          email:
            email.trim(),

          password,

          role:
            "patient",
        });

      setSuccess(
        response?.message ||
          "Patient account created successfully."
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        navigate(
          "/login"
        );
      }, 1200);
    } catch (error: any) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      setError(
        error?.response?.data
          ?.message ||
          "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-tech-page">
      <div className="auth-tech-bg-grid"></div>

      <div className="auth-tech-shell">
        {/* LEFT PANEL */}

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
                Patient Registration
              </p>
            </div>
          </div>

          <div className="auth-tech-left-content">
            <div className="auth-tech-badge">
              DIGITAL PATIENT PORTAL
            </div>

            <h1>
              Your Healthcare.
              <br />
              One Secure Portal.
            </h1>

            <p>
              Create your patient account
              to access digital
              appointments, consultation
              history and medical records.
            </p>

            <div className="auth-tech-features">
              <div>
                <span>01</span>

                <div>
                  <strong>
                    Book Appointments
                  </strong>

                  <p>
                    Connect with registered doctors
                  </p>
                </div>
              </div>

              <div>
                <span>02</span>

                <div>
                  <strong>
                    Track Consultations
                  </strong>

                  <p>
                    View appointment status
                  </p>
                </div>
              </div>

              <div>
                <span>03</span>

                <div>
                  <strong>
                    Medical Records
                  </strong>

                  <p>
                    Access and verify healthcare data
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-tech-system">
            <span></span>
            PATIENT SERVICES ACTIVE
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="auth-tech-right">
          <div className="auth-tech-form-header">
            <span>
              CREATE ACCOUNT
            </span>

            <h2>
              Patient Registration
            </h2>

            <p>
              Complete the form below
              to create your account.
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

          {success && (
            <div className="auth-tech-success">
              <div>
                ✓
              </div>

              <p>
                {success}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-tech-form"
          >
            <div className="form-group">
              <label className="form-label">
                Full Name
              </label>

              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                placeholder="Enter your full name"
                required
              />
            </div>

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

            <div className="auth-tech-two-column">
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
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm Password
                </label>

                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-tech-primary-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Patient Account"}
            </button>
          </form>

          <div className="auth-tech-divider">
            <span>
              ALREADY REGISTERED
            </span>
          </div>

          <button
            type="button"
            className="auth-tech-secondary-btn"
            onClick={() =>
              navigate(
                "/login"
              )
            }
          >
            Login to Existing Account
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
              Patient-Only Registration
            </strong>

            <p>
              Public registration creates
              patient accounts only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;