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
  role?: string;
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

  symptoms?: string[];

  symptomDuration?: string;

  painLevel?: number;

  severity?: number;

  additionalSymptoms?: string[];

  symptomProgress?: string;

  existingConditions?: string;

  currentMedications?: string;

  allergies?: string;

  emergencySymptoms?: string[];

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

type StatusFilter =
  | "All"
  | AppointmentStatus;

// ======================================================
// COMPONENT
// ======================================================

const DoctorAppointments = () => {
  const navigate =
    useNavigate();

  const [user, setUser] =
    useState<User | null>(
      null
    );

  const [
    appointments,
    setAppointments,
  ] = useState<Appointment[]>(
    []
  );

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] =
    useState<Appointment | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState<string | null>(
    null
  );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "All"
    );

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [toast, setToast] =
    useState<ToastState | null>(
      null
    );

  // ======================================================
  // TOAST
  // ======================================================

  const showToast = (
    type:
      | "success"
      | "error",
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

      if (
        parsedUser.role !==
        "doctor"
      ) {
        if (
          parsedUser.role ===
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

        navigate("/", {
          replace: true,
        });

        return;
      }

      setUser(
        parsedUser
      );
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

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }
  }, [navigate]);

  // ======================================================
  // FETCH APPOINTMENTS
  // ======================================================

  const fetchAppointments =
    useCallback(
      async () => {
        try {
          setLoading(true);

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

          setAppointments(
            data
          );
        } catch (error: any) {
          console.error(
            "GET DOCTOR APPOINTMENTS ERROR:",
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
        }
      },
      []
    );

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchAppointments();
  }, [
    user,
    fetchAppointments,
  ]);

  // ======================================================
  // STATS
  // ======================================================

  const stats =
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
  // FILTER
  // ======================================================

  const filteredAppointments =
    useMemo(() => {
      let result =
        [...appointments];

      if (
        statusFilter !==
        "All"
      ) {
        result =
          result.filter(
            (item) =>
              item.status ===
              statusFilter
          );
      }

      const search =
        searchText
          .trim()
          .toLowerCase();

      if (search) {
        result =
          result.filter(
            (item) => {
              const patient =
                item.patient
                  ?.fullName
                  ?.toLowerCase() ||
                "";

              const email =
                item.patient
                  ?.email
                  ?.toLowerCase() ||
                "";

              const reason =
                item.reason
                  ?.toLowerCase() ||
                "";

              const concern =
                item.mainConcern
                  ?.toLowerCase() ||
                "";

              const department =
                item.suggestedDepartment
                  ?.toLowerCase() ||
                "";

              return (
                patient.includes(
                  search
                ) ||
                email.includes(
                  search
                ) ||
                reason.includes(
                  search
                ) ||
                concern.includes(
                  search
                ) ||
                department.includes(
                  search
                )
              );
            }
          );
      }

      return result.sort(
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
      statusFilter,
      searchText,
    ]);

  // ======================================================
  // UPDATE STATUS
  // ======================================================

  const updateStatus =
    async (
      appointmentId: string,
      status:
        | "Approved"
        | "Completed"
        | "Cancelled"
    ) => {
      try {
        setUpdatingId(
          appointmentId
        );

        const response =
          await api.patch(
            `/appointments/${appointmentId}/status`,
            {
              status,
            }
          );

        showToast(
          "success",
          response.data
            ?.message ||
            `Appointment updated to ${status}.`
        );

        setSelectedAppointment(
          null
        );

        await fetchAppointments();
      } catch (error: any) {
        console.error(
          "UPDATE APPOINTMENT ERROR:",
          error
        );

        showToast(
          "error",
          error?.response?.data
            ?.message ||
            "Unable to update appointment."
        );
      } finally {
        setUpdatingId(null);
      }
    };

  // ======================================================
  // STATUS ACTIONS
  // ======================================================

  const renderActions = (
    appointment: Appointment
  ) => {
    if (
      appointment.status ===
      "Pending"
    ) {
      return (
        <div className="doctor-appointment-actions">
          <button
            type="button"
            className="doctor-action-approve"
            disabled={
              updatingId ===
              appointment._id
            }
            onClick={() =>
              updateStatus(
                appointment._id,
                "Approved"
              )
            }
          >
            Approve
          </button>

          <button
            type="button"
            className="doctor-action-cancel"
            disabled={
              updatingId ===
              appointment._id
            }
            onClick={() =>
              updateStatus(
                appointment._id,
                "Cancelled"
              )
            }
          >
            Cancel
          </button>
        </div>
      );
    }

    if (
      appointment.status ===
      "Approved"
    ) {
      return (
        <div className="doctor-appointment-actions">
          <button
            type="button"
            className="doctor-action-complete"
            disabled={
              updatingId ===
              appointment._id
            }
            onClick={() =>
              updateStatus(
                appointment._id,
                "Completed"
              )
            }
          >
            Complete
          </button>

          <button
            type="button"
            className="doctor-action-cancel"
            disabled={
              updatingId ===
              appointment._id
            }
            onClick={() =>
              updateStatus(
                appointment._id,
                "Cancelled"
              )
            }
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div
        className={`doctor-status-final doctor-status-${appointment.status.toLowerCase()}`}
      >
        {appointment.status}
      </div>
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (
    !user ||
    loading
  ) {
    return (
      <div className="app-page doctor-portal-page">
        <div className="doctor-loading-box">
          <div className="loading-spinner"></div>

          <h3>
            Loading Appointments
          </h3>

          <p>
            Preparing patient
            consultation requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page doctor-portal-page">
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

        <div className="doctor-appointments-header">
          <div>
            <div className="doctor-badge">
              DOCTOR APPOINTMENTS
            </div>

            <h1>
              Manage Appointments
            </h1>

            <p>
              Review patient requests,
              AI pre-consultation
              summaries and consultation
              status.
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
                fetchAppointments
              }
            >
              Refresh
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate(
                  "/doctor-dashboard"
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

        <div className="doctor-appointment-stat-grid">
          <div>
            <strong>
              {stats.total}
            </strong>

            <span>
              Total
            </span>
          </div>

          <div>
            <strong>
              {stats.pending}
            </strong>

            <span>
              Pending
            </span>
          </div>

          <div>
            <strong>
              {stats.approved}
            </strong>

            <span>
              Approved
            </span>
          </div>

          <div>
            <strong>
              {stats.completed}
            </strong>

            <span>
              Completed
            </span>
          </div>

          <div>
            <strong>
              {stats.cancelled}
            </strong>

            <span>
              Cancelled
            </span>
          </div>
        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="doctor-appointment-toolbar">
          <div className="doctor-appointment-search">
            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search patient, problem or department..."
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

          <div className="doctor-appointment-filter">
            {[
              "All",
              "Pending",
              "Approved",
              "Completed",
              "Cancelled",
            ].map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  className={
                    statusFilter ===
                    filter
                      ? "doctor-filter-active"
                      : ""
                  }
                  onClick={() =>
                    setStatusFilter(
                      filter as StatusFilter
                    )
                  }
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </div>

        {/* ==================================================
            APPOINTMENTS
        ================================================== */}

        {filteredAppointments.length ===
        0 ? (
          <div className="doctor-empty-appointments">
            <h3>
              No Appointments Found
            </h3>

            <p>
              There are no appointments
              matching the selected
              filter.
            </p>
          </div>
        ) : (
          <div className="doctor-appointment-list">
            {filteredAppointments.map(
              (
                appointment
              ) => (
                <div
                  key={
                    appointment._id
                  }
                  className="doctor-appointment-card"
                >
                  {/* TOP */}

                  <div className="doctor-appointment-card-top">
                    <div className="doctor-patient-area">
                      <div className="doctor-patient-avatar">
                        +
                      </div>

                      <div>
                        <span>
                          PATIENT
                        </span>

                        <h3>
                          {
                            appointment
                              .patient
                              ?.fullName
                          }
                        </h3>

                        <p>
                          {
                            appointment
                              .patient
                              ?.email
                          }
                        </p>
                      </div>
                    </div>

                    <div className="doctor-appointment-status-area">
                      {appointment
                        .aiAssessmentCompleted && (
                        <span className="doctor-ai-ready-badge">
                          AI SUMMARY
                        </span>
                      )}

                      <span
                        className={`doctor-status-badge doctor-status-${appointment.status.toLowerCase()}`}
                      >
                        {
                          appointment.status
                        }
                      </span>
                    </div>
                  </div>

                  {/* INFO */}

                  <div className="doctor-appointment-info-grid">
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
                        REASON
                      </span>

                      <strong>
                        {
                          appointment.reason
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        AI PRIORITY
                      </span>

                      <strong
                        className={`doctor-priority-text doctor-priority-${(
                          appointment.priority ||
                          "Low"
                        ).toLowerCase()}`}
                      >
                        {appointment.priority ||
                          "Not assessed"}
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
                  </div>

                  {/* AI PREVIEW */}

                  {appointment
                    .aiAssessmentCompleted &&
                    appointment.aiSummary && (
                      <div className="doctor-ai-preview">
                        <div>
                          <span>
                            AI PRE-CONSULTATION
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
                          View Full Assessment
                        </button>
                      </div>
                    )}

                  {/* NO AI */}

                  {!appointment
                    .aiAssessmentCompleted && (
                    <div className="doctor-no-ai-summary">
                      No AI
                      pre-consultation
                      assessment was
                      attached to this
                      appointment.
                    </div>
                  )}

                  {/* FOOTER */}

                  <div className="doctor-appointment-footer">
                    <button
                      type="button"
                      className="doctor-view-patient-btn"
                      onClick={() =>
                        setSelectedAppointment(
                          appointment
                        )
                      }
                    >
                      View Patient Details
                    </button>

                    {renderActions(
                      appointment
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ==================================================
          DETAIL MODAL
      ================================================== */}

      {selectedAppointment && (
        <div
          className="doctor-ai-modal-overlay"
          onClick={() =>
            setSelectedAppointment(
              null
            )
          }
        >
          <div
            className="doctor-ai-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="doctor-ai-modal-header">
              <div>
                <span>
                  AI PRE-CONSULTATION
                  REPORT
                </span>

                <h2>
                  {
                    selectedAppointment
                      .patient
                      ?.fullName
                  }
                </h2>

                <p>
                  {
                    selectedAppointment
                      .patient
                      ?.email
                  }
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

            {/* PRIORITY */}

            <div className="doctor-ai-summary-top">
              <div>
                <span>
                  PRIORITY
                </span>

                <strong
                  className={`doctor-priority-text doctor-priority-${(
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

              <div>
                <span>
                  SEVERITY
                </span>

                <strong>
                  {selectedAppointment.severity ??
                    selectedAppointment.painLevel ??
                    0}
                  /10
                </strong>
              </div>

              <div>
                <span>
                  DURATION
                </span>

                <strong>
                  {selectedAppointment.symptomDuration ||
                    "Not provided"}
                </strong>
              </div>
            </div>

            {/* MAIN CONCERN */}

            <div className="doctor-ai-detail-section">
              <span>
                MAIN HEALTH PROBLEM
              </span>

              <h3>
                {selectedAppointment.mainConcern ||
                  selectedAppointment.reason}
              </h3>
            </div>

            {/* ADDITIONAL SYMPTOMS */}

            <div className="doctor-ai-detail-section">
              <span>
                ADDITIONAL SYMPTOMS
              </span>

              {selectedAppointment
                .additionalSymptoms &&
              selectedAppointment
                .additionalSymptoms
                .length > 0 ? (
                <div className="doctor-ai-chip-list">
                  {selectedAppointment.additionalSymptoms.map(
                    (
                      symptom
                    ) => (
                      <div
                        key={
                          symptom
                        }
                        className="doctor-ai-chip"
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
                  None reported.
                </p>
              )}
            </div>

            {/* PROGRESS */}

            <div className="doctor-ai-detail-grid">
              <div>
                <span>
                  SYMPTOM PROGRESS
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
                  CURRENT MEDICATIONS
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

            {/* SAFETY */}

            {selectedAppointment
              .urgentCareRequired && (
              <div className="doctor-ai-urgent-box">
                <strong>
                  Urgent warning signs
                  were reported.
                </strong>

                <p>
                  This patient selected
                  one or more symptoms
                  that may require urgent
                  medical attention.
                </p>
              </div>
            )}

            {/* AI SUMMARY */}

            <div className="doctor-ai-full-summary">
              <span>
                STRUCTURED SUMMARY
              </span>

              <p>
                {selectedAppointment.aiSummary ||
                  "No AI summary available."}
              </p>
            </div>

            {/* APPOINTMENT */}

            <div className="doctor-ai-appointment-info">
              <div>
                <span>
                  APPOINTMENT DATE
                </span>

                <strong>
                  {new Date(
                    selectedAppointment.appointmentDate
                  ).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>
                  STATUS
                </span>

                <strong>
                  {
                    selectedAppointment.status
                  }
                </strong>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="doctor-ai-modal-footer">
              <button
                type="button"
                className="doctor-view-patient-btn"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
              >
                Close
              </button>

              {renderActions(
                selectedAppointment
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;