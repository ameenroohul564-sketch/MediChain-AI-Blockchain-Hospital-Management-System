import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface User {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  role: "patient" | "doctor" | "admin";
}

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  role: "doctor";
  specialization?: string;
  createdAt?: string;
}

interface ToastState {
  type: "success" | "error";
  text: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<User | null>(null);

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [specialization, setSpecialization] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  // ======================================================
  // TOAST
  // ======================================================

  const showToast = (
    type: "success" | "error",
    text: string
  ) => {
    setToast({
      type,
      text,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ======================================================
  // LOAD ADMIN USER
  // ======================================================

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      const parsedUser: User =
        JSON.parse(storedUser);

      if (parsedUser.role !== "admin") {
        if (parsedUser.role === "doctor") {
          navigate(
            "/doctor-dashboard",
            {
              replace: true,
            }
          );

          return;
        }

        if (parsedUser.role === "patient") {
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

        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "ADMIN USER PARSE ERROR:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // ======================================================
  // FETCH DOCTORS
  // ======================================================

  const fetchDoctors =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/admin/doctors"
          );

        const data =
          Array.isArray(response.data)
            ? response.data
            : response.data.doctors || [];

        setDoctors(data);
      } catch (error: any) {
        console.error(
          "FETCH DOCTORS ERROR:",
          error
        );

        showToast(
          "error",
          error?.response?.data?.message ||
            "Unable to load doctors."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (!user) return;

    fetchDoctors();
  }, [
    user,
    fetchDoctors,
  ]);

  // ======================================================
  // CREATE DOCTOR
  // ======================================================

  const handleCreateDoctor = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !email.trim() ||
      !specialization.trim() ||
      !password
    ) {
      showToast(
        "error",
        "Please complete all doctor details."
      );

      return;
    }

    if (password.length < 6) {
      showToast(
        "error",
        "Password must be at least 6 characters."
      );

      return;
    }

    try {
      setCreating(true);

      await api.post(
        "/admin/doctors",
        {
          fullName:
            fullName.trim(),

          email:
            email
              .trim()
              .toLowerCase(),

          specialization:
            specialization.trim(),

          password,
        }
      );

      setFullName("");
      setEmail("");
      setSpecialization("");
      setPassword("");

      showToast(
        "success",
        "Doctor account created successfully."
      );

      await fetchDoctors();
    } catch (error: any) {
      console.error(
        "CREATE DOCTOR ERROR:",
        error
      );

      showToast(
        "error",
        error?.response?.data?.message ||
          "Unable to create doctor."
      );
    } finally {
      setCreating(false);
    }
  };

  // ======================================================
  // DELETE DOCTOR
  // ======================================================

  const handleDeleteDoctor = async (
    doctorId: string,
    doctorName: string
  ) => {
    const confirmed =
      window.confirm(
        `Remove Dr. ${doctorName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        doctorId
      );

      await api.delete(
        `/admin/doctors/${doctorId}`
      );

      showToast(
        "success",
        "Doctor removed successfully."
      );

      await fetchDoctors();
    } catch (error: any) {
      console.error(
        "DELETE DOCTOR ERROR:",
        error
      );

      showToast(
        "error",
        error?.response?.data?.message ||
          "Unable to remove doctor."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // FILTER
  // ======================================================

  const filteredDoctors =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      if (!search) {
        return doctors;
      }

      return doctors.filter(
        (doctor) => {
          const name =
            doctor.fullName
              ?.toLowerCase() || "";

          const doctorEmail =
            doctor.email
              ?.toLowerCase() || "";

          const doctorSpecialization =
            doctor.specialization
              ?.toLowerCase() || "";

          return (
            name.includes(search) ||
            doctorEmail.includes(search) ||
            doctorSpecialization.includes(
              search
            )
          );
        }
      );
    }, [
      doctors,
      searchText,
    ]);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/", {
      replace: true,
    });
  };

  if (!user) {
    return (
      <div className="app-page admin-page">
        <div className="doctor-loading-box">
          <div className="loading-spinner"></div>

          <h3>
            Loading Admin Portal
          </h3>

          <p>
            Preparing doctor management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page admin-page">
      {toast && (
        <div
          className={`floating-toast ${
            toast.type === "success"
              ? "floating-toast-success"
              : "floating-toast-error"
          }`}
        >
          <div className="toast-icon">
            {toast.type === "success"
              ? "✓"
              : "!"}
          </div>

          <p>
            {toast.text}
          </p>

          <button
            type="button"
            onClick={() =>
              setToast(null)
            }
          >
            ×
          </button>
        </div>
      )}

      <div className="app-container">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="admin-hero-header">
          <div>
            <div className="admin-badge">
              ADMIN CONTROL CENTER
            </div>

            <h1>
              Welcome, {user.fullName}
            </h1>

            <p>
              Manage registered doctors
              and healthcare access
              from the MediChain AI
              administration portal.
            </p>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>
        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="admin-stat-grid">
          <div className="admin-stat-card">
            <span>
              REGISTERED DOCTORS
            </span>

            <strong>
              {doctors.length}
            </strong>

            <p>
              Active doctor accounts
            </p>
          </div>

          <div className="admin-stat-card">
            <span>
              ACCESS CONTROL
            </span>

            <strong>
              ADMIN
            </strong>

            <p>
              Doctor creation restricted
            </p>
          </div>

          <div className="admin-stat-card">
            <span>
              SYSTEM STATUS
            </span>

            <strong>
              ONLINE
            </strong>

            <p>
              Doctor management available
            </p>
          </div>
        </div>

        {/* ==================================================
            ADD DOCTOR
        ================================================== */}

        <div className="admin-doctor-form-card">
          <div className="admin-section-header">
            <span>
              DOCTOR ONBOARDING
            </span>

            <h2>
              Add New Doctor
            </h2>

            <p>
              Create a secure doctor
              account for the hospital.
            </p>
          </div>

          <form
            onSubmit={
              handleCreateDoctor
            }
          >
            <div className="admin-form-grid">
              <div className="form-group">
                <label className="form-label">
                  Doctor Name
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
                  placeholder="Dr. Arun Kumar"
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
                  placeholder="doctor@hospital.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Specialization
                </label>

                <select
                  className="form-control"
                  value={specialization}
                  onChange={(event) =>
                    setSpecialization(
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select specialization
                  </option>

                  <option value="General Medicine">
                    General Medicine
                  </option>

                  <option value="Cardiology">
                    Cardiology
                  </option>

                  <option value="Dermatology">
                    Dermatology
                  </option>

                  <option value="Orthopedics">
                    Orthopedics
                  </option>

                  <option value="Neurology">
                    Neurology
                  </option>

                  <option value="Pediatrics">
                    Pediatrics
                  </option>

                  <option value="ENT">
                    ENT
                  </option>

                  <option value="Gynecology">
                    Gynecology
                  </option>

                  <option value="Psychiatry">
                    Psychiatry
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Temporary Password
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
                  required
                />
              </div>
            </div>

            <div className="admin-form-footer">
              <p>
                Only administrators can
                create doctor accounts.
              </p>

              <button
                type="submit"
                className="admin-create-btn"
                disabled={creating}
              >
                {creating
                  ? "Creating Doctor..."
                  : "Create Doctor Account"}
              </button>
            </div>
          </form>
        </div>

        {/* ==================================================
            DOCTOR DIRECTORY
        ================================================== */}

        <div className="admin-directory-card">
          <div className="admin-directory-header">
            <div>
              <span>
                DOCTOR DIRECTORY
              </span>

              <h2>
                Registered Doctors
              </h2>
            </div>

            <div className="admin-doctor-count">
              {
                filteredDoctors.length
              }
            </div>
          </div>

          <div className="admin-search-box">
            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search doctor name, email or specialization..."
            />

            {searchText && (
              <button
                type="button"
                onClick={() =>
                  setSearchText("")
                }
              >
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="admin-empty-state">
              Loading doctors...
            </div>
          ) : filteredDoctors.length ===
            0 ? (
            <div className="admin-empty-state">
              <h3>
                No Doctors Found
              </h3>

              <p>
                Add a doctor account
                using the form above.
              </p>
            </div>
          ) : (
            <div className="admin-doctor-list">
              {filteredDoctors.map(
                (
                  doctor,
                  index
                ) => (
                  <div
                    key={
                      doctor._id
                    }
                    className="admin-doctor-card"
                  >
                    <div className="admin-doctor-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="admin-doctor-info">
                      <span>
                        {
                          doctor.specialization ||
                          "General Medicine"
                        }
                      </span>

                      <h3>
                        Dr.{" "}
                        {
                          doctor.fullName
                        }
                      </h3>

                      <p>
                        {
                          doctor.email
                        }
                      </p>

                      {doctor.createdAt && (
                        <small>
                          Added{" "}
                          {new Date(
                            doctor.createdAt
                          ).toLocaleDateString()}
                        </small>
                      )}
                    </div>

                    <div className="admin-doctor-actions">
                      <div className="admin-active-badge">
                        <span></span>
                        ACTIVE
                      </div>

                      <button
                        type="button"
                        className="admin-delete-btn"
                        disabled={
                          deletingId ===
                          doctor._id
                        }
                        onClick={() =>
                          handleDeleteDoctor(
                            doctor._id,
                            doctor.fullName
                          )
                        }
                      >
                        {deletingId ===
                        doctor._id
                          ? "Removing..."
                          : "Remove Doctor"}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;