import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ======================================================
// TYPES
// ======================================================

interface Person {
  _id: string;
  fullName: string;
  email: string;
  specialization?: string;
}

type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Completed"
  | "Cancelled";

type Priority =
  | "Low"
  | "Medium"
  | "High";

interface Appointment {
  _id: string;

  patient: Person;
  doctor: Person;

  appointmentDate: string;
  reason: string;

  status: AppointmentStatus;

  mainConcern?: string;

  symptomDuration?: string;

  severity?: number;

  additionalSymptoms?: string[];

  symptomProgress?: string;

  existingConditions?: string;

  currentMedications?: string;

  allergies?: string;

  aiSummary?: string;

  suggestedDepartment?: string;

  priority?: Priority;

  urgentCareRequired?: boolean;

  aiAssessmentCompleted?: boolean;

  createdAt?: string;
}

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

interface ToastState {
  type:
    | "success"
    | "error";

  text: string;
}

type FilterStatus =
  | "All"
  | AppointmentStatus;

// ======================================================
// COMPONENT
// ======================================================

const MyAppointments = () => {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<User | null>(null);

  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [
    cancellingId,
    setCancellingId,
  ] = useState<string | null>(null);

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] =
    useState<Appointment | null>(
      null
    );

  const [
    filterStatus,
    setFilterStatus,
  ] =
    useState<FilterStatus>("All");

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
    }, 3200);
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
        parsedUser.role !== "patient"
      ) {
        if (
          parsedUser.role === "doctor"
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
          parsedUser.role === "admin"
        ) {
          navigate(
            "/admin-dashboard",
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
        "PATIENT USER ERROR:",
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
  // FETCH APPOINTMENTS
  // ======================================================

  const fetchAppointments =
    useCallback(
      async (
        manual = false
      ) => {
        try {
          if (manual) {
            setRefreshing(true);
          } else {
            setLoading(true);
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

          if (manual) {
            showToast(
              "success",
              "Appointments refreshed."
            );
          }
        } catch (error: any) {
          console.error(
            "GET APPOINTMENTS ERROR:",
            error
          );

          showToast(
            "error",
            error?.response?.data
              ?.message ||
              "Unable to load appointments."
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
  }, [
    user,
    fetchAppointments,
  ]);

  // ======================================================
  // FILTER
  // ======================================================

  const filteredAppointments =
    useMemo(() => {
      const list =
        filterStatus === "All"
          ? appointments
          : appointments.filter(
              (appointment) =>
                appointment.status ===
                filterStatus
            );

      return [...list].sort(
        (a, b) =>
          new Date(
            b.appointmentDate
          ).getTime() -
          new Date(
            a.appointmentDate
          ).getTime()
      );
    }, [
      appointments,
      filterStatus,
    ]);

  // ======================================================
  // COUNTS
  // ======================================================

  const counts =
    useMemo(() => {
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
      };
    }, [appointments]);

  // ======================================================
  // CANCEL APPOINTMENT
  // ======================================================

  const handleCancel = async (
    appointmentId: string
  ) => {
    const confirmed =
      window.confirm(
        "Cancel this appointment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(
        appointmentId
      );

      const response =
        await api.patch(
          `/appointments/${appointmentId}/cancel`
        );

      showToast(
        "success",
        response.data?.message ||
          "Appointment cancelled successfully."
      );

      setSelectedAppointment(
        null
      );

      await fetchAppointments();
    } catch (error: any) {
      console.error(
        "CANCEL APPOINTMENT ERROR:",
        error
      );

      showToast(
        "error",
        error?.response?.data
          ?.message ||
          "Unable to cancel appointment."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ======================================================
  // CAN CANCEL
  // ======================================================

  const canCancel = (
    appointment: Appointment
  ) => {
    return (
      appointment.status ===
        "Pending" ||
      appointment.status ===
        "Approved"
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (!user || loading) {
    return (
      <div className="app-page patient-portal-page">
        <div className="doctor-loading-box">
          <div className="loading-spinner"></div>

          <h3>
            Loading Appointments
          </h3>

          <p>
            Preparing your consultation
            history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page patient-portal-page">
      {/* TOAST */}

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
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="patient-appointments-header">
          <div>
            <div className="patient-badge">
              PATIENT APPOINTMENTS
            </div>

            <h1>
              My Appointments
            </h1>

            <p>
              Track your appointment
              requests and review your
              AI-assisted pre-consultation
              summaries.
            </p>
          </div>

          <div
            className="button-row"
            style={{
              position: "relative",
              zIndex: 5,
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/appointment"
                )
              }
            >
              + New Appointment
            </button>

            <button
              type="button"
              className="btn btn-secondary"
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
              className="btn btn-secondary"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="patient-appointment-summary-grid">
          <div>
            <strong>
              {counts.total}
            </strong>

            <span>
              Total
            </span>
          </div>

          <div>
            <strong>
              {counts.pending}
            </strong>

            <span>
              Pending
            </span>
          </div>

          <div>
            <strong>
              {counts.approved}
            </strong>

            <span>
              Approved
            </span>
          </div>

          <div>
            <strong>
              {counts.completed}
            </strong>

            <span>
              Completed
            </span>
          </div>

          <div>
            <strong>
              {counts.cancelled}
            </strong>

            <span>
              Cancelled
            </span>
          </div>
        </div>

        {/* ==================================================
            FILTER
        ================================================== */}

        <div className="patient-appointment-filter">
          {[
            "All",
            "Pending",
            "Approved",
            "Completed",
            "Cancelled",
          ].map(
            (filter) => (
              <button
                type="button"
                key={filter}
                className={
                  filterStatus ===
                  filter
                    ? "patient-appointment-filter-active"
                    : ""
                }
                onClick={() =>
                  setFilterStatus(
                    filter as FilterStatus
                  )
                }
              >
                {filter}
              </button>
            )
          )}
        </div>

        {/* ==================================================
            LIST
        ================================================== */}

        {filteredAppointments.length ===
        0 ? (
          <div className="patient-appointment-empty">
            <h3>
              No Appointments Found
            </h3>

            <p>
              There are no appointments
              under this category.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/appointment"
                )
              }
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="patient-appointment-list">
            {filteredAppointments.map(
              (
                appointment
              ) => (
                <div
                  key={
                    appointment._id
                  }
                  className="patient-ai-appointment-card"
                >
                  {/* TOP */}

                  <div className="patient-ai-appointment-top">
                    <div className="patient-ai-doctor">
                      <div className="patient-ai-doctor-icon">
                        +
                      </div>

                      <div>
                        <span>
                          CONSULTING DOCTOR
                        </span>

                        <h3>
                          Dr.{" "}
                          {
                            appointment
                              .doctor
                              ?.fullName
                          }
                        </h3>

                        <p>
                          {appointment.doctor
                            ?.specialization ||
                            appointment.suggestedDepartment ||
                            "Doctor"}
                        </p>
                      </div>
                    </div>

                    <div className="patient-ai-status-group">
                      {appointment
                        .aiAssessmentCompleted && (
                        <span className="patient-ai-badge">
                          AI ASSESSED
                        </span>
                      )}

                      <span
                        className={`patient-status-badge patient-status-${appointment.status.toLowerCase()}`}
                      >
                        {
                          appointment.status
                        }
                      </span>
                    </div>
                  </div>

                  {/* APPOINTMENT INFORMATION */}

                  <div className="patient-ai-appointment-info">
                    <div>
                      <span>
                        DATE & TIME
                      </span>

                      <strong>
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span>
                        MAIN PROBLEM
                      </span>

                      <strong>
                        {appointment.mainConcern ||
                          appointment.reason}
                      </strong>
                    </div>

                    <div>
                      <span>
                        SUGGESTED DEPARTMENT
                      </span>

                      <strong>
                        {appointment.suggestedDepartment ||
                          "General Medicine"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        PRIORITY
                      </span>

                      <strong
                        className={`patient-priority patient-priority-${(
                          appointment.priority ||
                          "Low"
                        ).toLowerCase()}`}
                      >
                        {appointment.priority ||
                          "Not assessed"}
                      </strong>
                    </div>
                  </div>

                  {/* AI SUMMARY */}

                  {appointment
                    .aiAssessmentCompleted &&
                    appointment.aiSummary && (
                      <div className="patient-ai-summary-preview">
                        <div>
                          <span>
                            AI PRE-CONSULTATION
                            SUMMARY
                          </span>

                          <p>
                            {
                              appointment.aiSummary
                            }
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAppointment(
                              appointment
                            )
                          }
                        >
                          View Details
                        </button>
                      </div>
                    )}

                  {/* FOOTER */}

                  <div className="patient-ai-appointment-footer">
                    <button
                      type="button"
                      className="patient-ai-details-btn"
                      onClick={() =>
                        setSelectedAppointment(
                          appointment
                        )
                      }
                    >
                      View Appointment
                    </button>

                    {canCancel(
                      appointment
                    ) && (
                      <button
                        type="button"
                        className="patient-ai-cancel-btn"
                        disabled={
                          cancellingId ===
                          appointment._id
                        }
                        onClick={() =>
                          handleCancel(
                            appointment._id
                          )
                        }
                      >
                        {cancellingId ===
                        appointment._id
                          ? "Cancelling..."
                          : "Cancel Appointment"}
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ==================================================
          PATIENT DETAIL MODAL
      ================================================== */}

      {selectedAppointment && (
        <div
          className="patient-ai-modal-overlay"
          onClick={() =>
            setSelectedAppointment(
              null
            )
          }
        >
          <div
            className="patient-ai-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="patient-ai-modal-header">
              <div>
                <span>
                  APPOINTMENT DETAILS
                </span>

                <h2>
                  Dr.{" "}
                  {
                    selectedAppointment
                      .doctor
                      ?.fullName
                  }
                </h2>

                <p>
                  {selectedAppointment
                    .doctor
                    ?.specialization ||
                    selectedAppointment
                      .suggestedDepartment ||
                    "Medical Consultation"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            {/* STATUS */}

            <div className="patient-ai-modal-top-grid">
              <div>
                <span>
                  APPOINTMENT STATUS
                </span>

                <strong>
                  {
                    selectedAppointment.status
                  }
                </strong>
              </div>

              <div>
                <span>
                  DATE & TIME
                </span>

                <strong>
                  {new Date(
                    selectedAppointment.appointmentDate
                  ).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>
                  PRIORITY
                </span>

                <strong
                  className={`patient-priority patient-priority-${(
                    selectedAppointment.priority ||
                    "Low"
                  ).toLowerCase()}`}
                >
                  {selectedAppointment.priority ||
                    "Not assessed"}
                </strong>
              </div>

              <div>
                <span>
                  DEPARTMENT
                </span>

                <strong>
                  {selectedAppointment.suggestedDepartment ||
                    "General Medicine"}
                </strong>
              </div>
            </div>

            {/* MAIN PROBLEM */}

            <div className="patient-ai-modal-section">
              <span>
                MAIN HEALTH PROBLEM
              </span>

              <h3>
                {selectedAppointment.mainConcern ||
                  selectedAppointment.reason}
              </h3>
            </div>

            {/* DETAILS */}

            <div className="patient-ai-modal-detail-grid">
              <div>
                <span>
                  DURATION
                </span>

                <strong>
                  {selectedAppointment.symptomDuration ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>
                  SEVERITY
                </span>

                <strong>
                  {selectedAppointment.severity ??
                    0}
                  /10
                </strong>
              </div>

              <div>
                <span>
                  PROGRESS
                </span>

                <strong>
                  {selectedAppointment.symptomProgress ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>
                  EXISTING CONDITIONS
                </span>

                <strong>
                  {selectedAppointment.existingConditions ||
                    "None reported"}
                </strong>
              </div>

              <div>
                <span>
                  CURRENT MEDICINES
                </span>

                <strong>
                  {selectedAppointment.currentMedications ||
                    "None reported"}
                </strong>
              </div>

              <div>
                <span>
                  ALLERGIES
                </span>

                <strong>
                  {selectedAppointment.allergies ||
                    "None reported"}
                </strong>
              </div>
            </div>

            {/* SYMPTOMS */}

            <div className="patient-ai-modal-section">
              <span>
                REPORTED SYMPTOMS
              </span>

              {selectedAppointment
                .additionalSymptoms &&
              selectedAppointment
                .additionalSymptoms
                .length > 0 ? (
                <div className="patient-ai-symptom-chips">
                  {selectedAppointment.additionalSymptoms.map(
                    (
                      symptom
                    ) => (
                      <div
                        key={
                          symptom
                        }
                      >
                        {
                          symptom
                        }
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p>
                  No additional symptoms
                  reported.
                </p>
              )}
            </div>

            {/* SUMMARY */}

            {selectedAppointment
              .aiAssessmentCompleted && (
              <div className="patient-ai-full-summary">
                <span>
                  AI PRE-CONSULTATION
                  SUMMARY
                </span>

                <p>
                  {selectedAppointment.aiSummary ||
                    "Summary unavailable."}
                </p>
              </div>
            )}

            <div className="patient-ai-disclaimer">
              The AI pre-consultation
              assessment helps organize
              information for the doctor.
              It is not a medical
              diagnosis.
            </div>

            {/* FOOTER */}

            <div className="patient-ai-modal-footer">
              <button
                type="button"
                className="patient-ai-details-btn"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >
                Close
              </button>

              {canCancel(
                selectedAppointment
              ) && (
                <button
                  type="button"
                  className="patient-ai-cancel-btn"
                  disabled={
                    cancellingId ===
                    selectedAppointment._id
                  }
                  onClick={() =>
                    handleCancel(
                      selectedAppointment._id
                    )
                  }
                >
                  {cancellingId ===
                  selectedAppointment._id
                    ? "Cancelling..."
                    : "Cancel Appointment"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;