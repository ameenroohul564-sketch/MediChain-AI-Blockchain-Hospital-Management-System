import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

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

interface Doctor {
  _id: string;

  fullName: string;
  email: string;

  specialization?: string;
}

interface Consent {
  _id: string;

  patient: string;

  doctor: Doctor;

  granted: boolean;

  grantedAt?: string;

  revokedAt?: string | null;

  createdAt?: string;

  updatedAt?: string;
}

interface AccessLog {
  _id: string;

  doctor: Doctor;

  medicalRecord?: {
    _id: string;
    diagnosis?: string;
    createdAt?: string;
  };

  action:
    | "VIEW_RECORD"
    | "VERIFY_RECORD";

  accessedAt: string;
}

interface ToastState {
  type:
    | "success"
    | "error";

  text: string;
}

// ======================================================
// COMPONENT
// ======================================================

const RecordAccess = () => {
  const navigate =
    useNavigate();

  const [user, setUser] =
    useState<User | null>(
      null
    );

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [consents, setConsents] =
    useState<Consent[]>([]);

  const [accessLogs, setAccessLogs] =
    useState<AccessLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    updatingDoctorId,
    setUpdatingDoctorId,
  ] = useState<string | null>(
    null
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

    window.setTimeout(
      () => {
        setToast(null);
      },
      3200
    );
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
        "patient"
      ) {
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
        "USER PARSE ERROR:",
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
  // LOAD DATA
  // ======================================================

  const loadData =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const [
            doctorResponse,
            consentResponse,
            logsResponse,
          ] = await Promise.all([
            api.get(
              "/auth/doctors"
            ),

            api.get(
              "/record-access/consents"
            ),

            api.get(
              "/record-access/logs"
            ),
          ]);

          const doctorData =
            Array.isArray(
              doctorResponse.data
            )
              ? doctorResponse.data
              : doctorResponse.data
                  ?.doctors || [];

          const consentData =
            Array.isArray(
              consentResponse.data
            )
              ? consentResponse.data
              : consentResponse.data
                  ?.consents || [];

          const logsData =
            Array.isArray(
              logsResponse.data
            )
              ? logsResponse.data
              : logsResponse.data
                  ?.accessLogs || [];

          setDoctors(
            doctorData
          );

          setConsents(
            consentData
          );

          setAccessLogs(
            logsData
          );
        } catch (error: any) {
          console.error(
            "LOAD RECORD ACCESS ERROR:",
            error
          );

          showToast(
            "error",
            error?.response?.data
              ?.message ||
              "Unable to load privacy settings."
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

    loadData();
  }, [
    user,
    loadData,
  ]);

  // ======================================================
  // CONSENT MAP
  // ======================================================

  const consentMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          Consent
        >();

      for (
        const consent of consents
      ) {
        if (
          consent.doctor?._id
        ) {
          map.set(
            consent.doctor._id,
            consent
          );
        }
      }

      return map;
    }, [consents]);

  // ======================================================
  // FILTERED DOCTORS
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
              ?.toLowerCase() ||
            "";

          const email =
            doctor.email
              ?.toLowerCase() ||
            "";

          const specialization =
            doctor.specialization
              ?.toLowerCase() ||
            "";

          return (
            name.includes(
              search
            ) ||
            email.includes(
              search
            ) ||
            specialization.includes(
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
  // GRANT ACCESS
  // ======================================================

  const grantAccess =
    async (
      doctorId: string
    ) => {
      try {
        setUpdatingDoctorId(
          doctorId
        );

        const response =
          await api.post(
            "/record-access/consents",
            {
              doctorId,
            }
          );

        showToast(
          "success",
          response.data
            ?.message ||
            "Doctor access granted."
        );

        await loadData();
      } catch (error: any) {
        console.error(
          "GRANT ACCESS ERROR:",
          error
        );

        showToast(
          "error",
          error?.response?.data
            ?.message ||
            "Unable to grant access."
        );
      } finally {
        setUpdatingDoctorId(
          null
        );
      }
    };

  // ======================================================
  // REVOKE ACCESS
  // ======================================================

  const revokeAccess =
    async (
      doctorId: string
    ) => {
      const confirmed =
        window.confirm(
          "Revoke this doctor's access to your medical records?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingDoctorId(
          doctorId
        );

        const response =
          await api.patch(
            `/record-access/consents/${doctorId}/revoke`
          );

        showToast(
          "success",
          response.data
            ?.message ||
            "Doctor access revoked."
        );

        await loadData();
      } catch (error: any) {
        console.error(
          "REVOKE ACCESS ERROR:",
          error
        );

        showToast(
          "error",
          error?.response?.data
            ?.message ||
            "Unable to revoke access."
        );
      } finally {
        setUpdatingDoctorId(
          null
        );
      }
    };

  // ======================================================
  // FORMAT ACTION
  // ======================================================

  const getActionText = (
    action: AccessLog["action"]
  ) => {
    if (
      action ===
      "VERIFY_RECORD"
    ) {
      return "verified your medical record";
    }

    return "viewed your medical record";
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (
    !user ||
    loading
  ) {
    return (
      <div className="app-page patient-portal-page">
        <div className="doctor-loading-box">
          <div className="loading-spinner"></div>

          <h3>
            Loading Privacy Settings
          </h3>

          <p>
            Preparing consent and
            access history...
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
        {/* HEADER */}

        <div className="medical-page-header">
          <div>
            <div className="patient-badge">
              PRIVACY & ACCESS
            </div>

            <h1>
              Record Access Control
            </h1>

            <p>
              Control which doctors can
              access your medical records
              and review recent access
              activity.
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
                loadData
              }
            >
              Refresh
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
            PRIVACY INFO
        ================================================== */}

        <div className="privacy-info-card">
          <div className="privacy-info-icon">
            🔐
          </div>

          <div>
            <span>
              PATIENT CONTROL
            </span>

            <h3>
              You control access to your
              medical records
            </h3>

            <p>
              Grant access only to doctors
              you trust. You can revoke
              access at any time.
            </p>
          </div>
        </div>

        {/* ==================================================
            DOCTOR ACCESS
        ================================================== */}

        <div className="privacy-section-card">
          <div className="privacy-section-header">
            <div>
              <span>
                DOCTOR PERMISSIONS
              </span>

              <h2>
                Manage Doctor Access
              </h2>

              <p>
                Select which doctors can
                view your protected medical
                records.
              </p>
            </div>

            <div className="privacy-search-box">
              <input
                type="text"
                value={
                  searchText
                }
                onChange={(
                  event
                ) =>
                  setSearchText(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Search doctor or specialization..."
              />
            </div>
          </div>

          {filteredDoctors.length ===
          0 ? (
            <div className="privacy-empty-state">
              <h3>
                No Doctors Found
              </h3>

              <p>
                No doctor matches your
                search.
              </p>
            </div>
          ) : (
            <div className="privacy-doctor-grid">
              {filteredDoctors.map(
                (
                  doctor
                ) => {
                  const consent =
                    consentMap.get(
                      doctor._id
                    );

                  const hasAccess =
                    Boolean(
                      consent?.granted
                    );

                  return (
                    <div
                      className="privacy-doctor-card"
                      key={
                        doctor._id
                      }
                    >
                      <div className="privacy-doctor-avatar">
                        +
                      </div>

                      <div className="privacy-doctor-main">
                        <span>
                          DOCTOR
                        </span>

                        <h3>
                          Dr.{" "}
                          {
                            doctor.fullName
                          }
                        </h3>

                        <p>
                          {doctor.specialization ||
                            "General Medicine"}
                        </p>

                        <small>
                          {
                            doctor.email
                          }
                        </small>
                      </div>

                      <div className="privacy-doctor-access-area">
                        <div
                          className={
                            hasAccess
                              ? "privacy-access-badge privacy-access-granted"
                              : "privacy-access-badge privacy-access-revoked"
                          }
                        >
                          {hasAccess
                            ? "Access Granted"
                            : "No Access"}
                        </div>

                        {hasAccess ? (
                          <button
                            type="button"
                            className="privacy-revoke-btn"
                            disabled={
                              updatingDoctorId ===
                              doctor._id
                            }
                            onClick={() =>
                              revokeAccess(
                                doctor._id
                              )
                            }
                          >
                            {updatingDoctorId ===
                            doctor._id
                              ? "Updating..."
                              : "Revoke Access"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="privacy-grant-btn"
                            disabled={
                              updatingDoctorId ===
                              doctor._id
                            }
                            onClick={() =>
                              grantAccess(
                                doctor._id
                              )
                            }
                          >
                            {updatingDoctorId ===
                            doctor._id
                              ? "Updating..."
                              : "Grant Access"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* ==================================================
            ACCESS HISTORY
        ================================================== */}

        <div className="privacy-section-card">
          <div className="privacy-section-header">
            <div>
              <span>
                ACCESS HISTORY
              </span>

              <h2>
                Who Accessed My Records?
              </h2>

              <p>
                Recent doctor activity on
                your medical records.
              </p>
            </div>
          </div>

          {accessLogs.length ===
          0 ? (
            <div className="privacy-empty-state">
              <h3>
                No Access Activity Yet
              </h3>

              <p>
                Doctor record access will
                appear here.
              </p>
            </div>
          ) : (
            <div className="privacy-access-log-list">
              {accessLogs.map(
                (
                  log
                ) => (
                  <div
                    key={
                      log._id
                    }
                    className="privacy-access-log-item"
                  >
                    <div className="privacy-log-icon">
                      👁
                    </div>

                    <div className="privacy-log-content">
                      <span>
                        RECORD ACCESS
                      </span>

                      <h4>
                        Dr.{" "}
                        {
                          log.doctor
                            ?.fullName
                        }{" "}
                        {getActionText(
                          log.action
                        )}
                      </h4>

                      <p>
                        {log.doctor
                          ?.specialization ||
                          "Doctor"}

                        {log.medicalRecord
                          ?.diagnosis
                          ? ` • ${log.medicalRecord.diagnosis}`
                          : ""}
                      </p>
                    </div>

                    <div className="privacy-log-time">
                      <strong>
                        {new Date(
                          log.accessedAt
                        ).toLocaleDateString()}
                      </strong>

                      <span>
                        {new Date(
                          log.accessedAt
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </span>
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

export default RecordAccess;