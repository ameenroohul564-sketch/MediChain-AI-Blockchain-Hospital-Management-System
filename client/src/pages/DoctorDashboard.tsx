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

interface Person {
  _id: string;
  fullName: string;
  email: string;
}

interface Appointment {
  _id: string;
  patient: Person;
  doctor: Person;
  appointmentDate: string;
  reason: string;
  status:
    | "Pending"
    | "Approved"
    | "Completed"
    | "Cancelled";
  createdAt?: string;
}

interface ToastState {
  type: "success" | "error";
  text: string;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<User | null>(null);

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

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
    }, 3000);
  };

  // ======================================================
  // USER
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

      if (
        parsedUser.role !==
        "doctor"
      ) {
        if (
          parsedUser.role ===
          "patient"
        ) {
          navigate("/dashboard", {
            replace: true,
          });
        } else {
          navigate("/", {
            replace: true,
          });
        }

        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "DOCTOR USER ERROR:",
        error
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // ======================================================
  // FETCH
  // ======================================================

  const fetchAppointments =
    useCallback(
      async (
        manualRefresh = false
      ) => {
        try {
          if (manualRefresh) {
            setRefreshing(true);
          }

          const response =
            await api.get(
              "/appointments"
            );

          const data =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data
                  .appointments || [];

          setAppointments(data);

          if (manualRefresh) {
            showToast(
              "success",
              "Dashboard refreshed successfully."
            );
          }
        } catch (error: any) {
          console.error(
            "DOCTOR DASHBOARD ERROR:",
            error
          );

          showToast(
            "error",
            error?.response?.data
              ?.message ||
              "Unable to load dashboard data."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    if (!user) return;

    fetchAppointments();

    const interval =
      window.setInterval(() => {
        fetchAppointments();
      }, 7000);

    const handleFocus = () =>
      fetchAppointments();

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [
    user,
    fetchAppointments,
  ]);

  // ======================================================
  // STATS
  // ======================================================

  const stats = useMemo(() => {
    const patientIds =
      new Set<string>();

    appointments.forEach(
      (item) => {
        if (
          item.patient?._id
        ) {
          patientIds.add(
            item.patient._id
          );
        }
      }
    );

    return {
      total:
        appointments.length,

      pending:
        appointments.filter(
          (item) =>
            item.status ===
            "Pending"
        ).length,

      approved:
        appointments.filter(
          (item) =>
            item.status ===
            "Approved"
        ).length,

      completed:
        appointments.filter(
          (item) =>
            item.status ===
            "Completed"
        ).length,

      cancelled:
        appointments.filter(
          (item) =>
            item.status ===
            "Cancelled"
        ).length,

      patients:
        patientIds.size,
    };
  }, [appointments]);

  // ======================================================
  // NEXT CONSULTATION
  // ======================================================

  const nextConsultation =
    useMemo(() => {
      const now =
        Date.now();

      return appointments
        .filter((item) => {
          return (
            item.status ===
              "Approved" &&
            new Date(
              item.appointmentDate
            ).getTime() > now
          );
        })
        .sort(
          (a, b) =>
            new Date(
              a.appointmentDate
            ).getTime() -
            new Date(
              b.appointmentDate
            ).getTime()
        )[0];
    }, [appointments]);

  // ======================================================
  // RECENT REQUESTS
  // ======================================================

  const recentAppointments =
    useMemo(() => {
      return [...appointments]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt ||
                b.appointmentDate
            ).getTime() -
            new Date(
              a.createdAt ||
                a.appointmentDate
            ).getTime()
        )
        .slice(0, 5);
    }, [appointments]);

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/", {
      replace: true,
    });
  };

  if (!user || loading) {
    return (
      <div className="app-page doctor-portal-page">
        <div className="doctor-loading-box">
          <div className="loading-spinner"></div>

          <h3>
            Preparing Doctor Portal
          </h3>

          <p>
            Loading consultation information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page doctor-portal-page">
      {toast && (
        <div
          className={`floating-toast ${
            toast.type ===
            "success"
              ? "floating-toast-success"
              : "floating-toast-error"
          }`}
        >
          <div className="toast-icon">
            {toast.type ===
            "success"
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
        {/* HEADER */}

        <div className="doctor-hero-header">
          <div>
            <div className="doctor-badge">
              DOCTOR PORTAL
            </div>

            <h1>
              Welcome, Dr.{" "}
              {user.fullName}
            </h1>

            <p>
              Manage patient
              appointments,
              consultations and
              medical records.
            </p>
          </div>

          <div className="doctor-header-actions">
            <button
              type="button"
              className="doctor-refresh-btn"
              disabled={refreshing}
              onClick={() =>
                fetchAppointments(
                  true
                )
              }
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="doctor-logout-btn"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className="doctor-section-heading">
          <span>
            LIVE CLINICAL OVERVIEW
          </span>

          <h2>
            Practice Statistics
          </h2>
        </div>

        <div className="doctor-stat-grid">
          {[
            [
              "01",
              stats.total,
              "Total Appointments",
            ],
            [
              "02",
              stats.pending,
              "Pending",
            ],
            [
              "03",
              stats.approved,
              "Approved",
            ],
            [
              "04",
              stats.completed,
              "Completed",
            ],
            [
              "05",
              stats.patients,
              "Unique Patients",
            ],
            [
              "06",
              stats.cancelled,
              "Cancelled",
            ],
          ].map(
            (item) => (
              <div
                key={
                  item[0]
                }
                className="doctor-stat-card"
              >
                <div className="doctor-stat-code">
                  {
                    item[0]
                  }
                </div>

                <div>
                  <strong className="doctor-stat-number">
                    {
                      item[1]
                    }
                  </strong>

                  <span>
                    {
                      item[2]
                    }
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        {/* NEXT + RECENT */}

        <div className="dashboard-highlight-grid">
          <div className="dashboard-upcoming-card doctor-highlight-card">
            <div className="dashboard-highlight-header">
              <div>
                <span>
                  NEXT CONSULTATION
                </span>

                <h2>
                  Upcoming Patient
                </h2>
              </div>

              <div className="dashboard-live-dot">
                <span></span>
                LIVE
              </div>
            </div>

            {nextConsultation ? (
              <>
                <div className="dashboard-upcoming-main">
                  <div className="dashboard-upcoming-icon">
                    +
                  </div>

                  <div>
                    <span>
                      PATIENT
                    </span>

                    <h3>
                      {
                        nextConsultation
                          .patient
                          ?.fullName
                      }
                    </h3>

                    <p>
                      {
                        nextConsultation.reason
                      }
                    </p>
                  </div>
                </div>

                <div className="dashboard-upcoming-details">
                  <div>
                    <span>
                      DATE & TIME
                    </span>

                    <strong>
                      {new Date(
                        nextConsultation.appointmentDate
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      STATUS
                    </span>

                    <strong>
                      Approved
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="dashboard-highlight-btn"
                  onClick={() =>
                    navigate(
                      "/doctor-appointments"
                    )
                  }
                >
                  Manage Consultation →
                </button>
              </>
            ) : (
              <div className="dashboard-no-upcoming">
                <div>
                  +
                </div>

                <h3>
                  No Upcoming Consultation
                </h3>

                <p>
                  Approved patient
                  appointments will
                  appear here.
                </p>
              </div>
            )}
          </div>

          {/* RECENT */}

          <div className="dashboard-recent-card">
            <div className="dashboard-highlight-header">
              <div>
                <span>
                  RECENT REQUESTS
                </span>

                <h2>
                  Patient Activity
                </h2>
              </div>
            </div>

            {recentAppointments.length ===
            0 ? (
              <div className="dashboard-no-activity">
                No recent appointment activity.
              </div>
            ) : (
              <div className="dashboard-activity-list">
                {recentAppointments.map(
                  (
                    appointment
                  ) => (
                    <div
                      key={
                        appointment._id
                      }
                      className="dashboard-activity-item"
                    >
                      <div className="dashboard-activity-icon">
                        A
                      </div>

                      <div className="dashboard-activity-content">
                        <strong>
                          {
                            appointment
                              .patient
                              ?.fullName
                          }
                        </strong>

                        <p>
                          {
                            appointment.reason
                          }
                        </p>

                        <span>
                          {
                            appointment.status
                          }{" "}
                          •{" "}
                          {new Date(
                            appointment.appointmentDate
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* MODULES */}

        <div className="doctor-section-heading">
          <span>
            CLINICAL MODULES
          </span>

          <h2>
            Doctor Workspace
          </h2>
        </div>

        <div className="doctor-module-grid">
          <div
            className="doctor-module-card"
            onClick={() =>
              navigate(
                "/doctor-appointments"
              )
            }
          >
            <div className="doctor-module-icon">
              01
            </div>

            <div>
              <h2>
                Manage Appointments
              </h2>

              <p>
                Approve, complete
                and manage patient
                consultation requests.
              </p>
            </div>

            <div className="doctor-module-footer">
              <div>
                <strong>
                  {stats.pending}
                </strong>

                <span>
                  Pending Requests
                </span>
              </div>

              <button
                type="button"
                className="doctor-module-btn"
                onClick={(event) => {
                  event.stopPropagation();

                  navigate(
                    "/doctor-appointments"
                  );
                }}
              >
                Open Appointments →
              </button>
            </div>
          </div>

          <div
            className="doctor-module-card"
            onClick={() =>
              navigate(
                "/doctor-medical-records"
              )
            }
          >
            <div className="doctor-module-icon">
              02
            </div>

            <div>
              <h2>
                Medical Records
              </h2>

              <p>
                Create diagnosis,
                prescription,
                clinical notes and
                verify record integrity.
              </p>
            </div>

            <div className="doctor-module-footer">
              <div>
                <strong>
                  {stats.patients}
                </strong>

                <span>
                  Patient Profiles
                </span>
              </div>

              <button
                type="button"
                className="doctor-module-btn"
                onClick={(event) => {
                  event.stopPropagation();

                  navigate(
                    "/doctor-medical-records"
                  );
                }}
              >
                Open Records →
              </button>
            </div>
          </div>
        </div>

        {/* WORKFLOW */}

        <div className="doctor-workflow-card">
          <div>
            <span>01</span>
            <h4>Review</h4>
            <p>
              Review requests.
            </p>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div>
            <span>02</span>
            <h4>Approve</h4>
            <p>
              Approve schedule.
            </p>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div>
            <span>03</span>
            <h4>Consult</h4>
            <p>
              Complete visit.
            </p>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div>
            <span>04</span>
            <h4>Record</h4>
            <p>
              Add medical data.
            </p>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div>
            <span>05</span>
            <h4>Verify</h4>
            <p>
              Verify SHA-256.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;