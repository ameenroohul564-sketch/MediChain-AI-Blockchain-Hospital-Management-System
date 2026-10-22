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

import MedicalRecordAuditPanel from "../components/MedicalRecordAuditPanel";

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

interface Patient {
  _id: string;
  fullName: string;
  email: string;
}

interface Appointment {
  _id: string;

  patient: Patient;

  appointmentDate: string;

  status: string;

  reason?: string;
}

interface DoctorInfo {
  _id: string;

  fullName: string;

  email: string;

  specialization?: string;
}

interface MedicalRecord {
  _id: string;

  patient: Patient;

  doctor: DoctorInfo;

  diagnosis: string;

  prescription: string;

  notes?: string;

  recordHash?: string;

  createdAt?: string;

  updatedAt?: string;
}

interface ToastState {
  type:
    | "success"
    | "error";

  text: string;
}

interface VerificationResult {
  verified: boolean;

  integrityStatus?: string;

  message: string;

  currentHash?: string;

  blockchainHash?: string;

  blockchain?: {
    timestamp?: number;

    storedBy?: string;

    versionCount?: number;
  };
}

// ======================================================
// COMPONENT
// ======================================================

const DoctorMedicalRecords = () => {
  const navigate =
    useNavigate();

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    appointments,
    setAppointments,
  ] =
    useState<Appointment[]>(
      []
    );

  const [
    records,
    setRecords,
  ] =
    useState<MedicalRecord[]>(
      []
    );

  const [
    selectedPatient,
    setSelectedPatient,
  ] =
    useState<Patient | null>(
      null
    );

  const [
    selectedRecord,
    setSelectedRecord,
  ] =
    useState<MedicalRecord | null>(
      null
    );

  const [
    diagnosis,
    setDiagnosis,
  ] =
    useState("");

  const [
    prescription,
    setPrescription,
  ] =
    useState("");

  const [
    notes,
    setNotes,
  ] =
    useState("");

  const [
    searchText,
    setSearchText,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    openingRecordId,
    setOpeningRecordId,
  ] =
    useState<string | null>(
      null
    );

  const [
    verifyingId,
    setVerifyingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    verification,
    setVerification,
  ] =
    useState<VerificationResult | null>(
      null
    );

  const [
    toast,
    setToast,
  ] =
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
      3000
    );
  };

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
  // LOAD DATA
  //
  // IMPORTANT:
  // selectedRecord is NOT a dependency.
  // Prevents modal blinking / reload loop.
  // ======================================================

  const loadData =
    useCallback(
      async (
        initialLoad = false
      ) => {
        try {
          if (
            initialLoad
          ) {
            setLoading(
              true
            );
          } else {
            setRefreshing(
              true
            );
          }

          const [
            appointmentResponse,
            recordResponse,
          ] =
            await Promise.all([
              api.get(
                "/appointments"
              ),

              api.get(
                "/medical-records"
              ),
            ]);

          const appointmentData =
            Array.isArray(
              appointmentResponse.data
            )
              ? appointmentResponse.data
              : appointmentResponse
                  .data
                  ?.appointments ||
                [];

          const recordData =
            Array.isArray(
              recordResponse.data
            )
              ? recordResponse.data
              : recordResponse
                  .data
                  ?.medicalRecords ||
                [];

          setAppointments(
            appointmentData
          );

          setRecords(
            recordData
          );
        } catch (
          error: any
        ) {
          console.error(
            "LOAD MEDICAL DATA ERROR:",
            error
          );

          showToast(
            "error",
            error?.response
              ?.data
              ?.message ||
              "Unable to load medical records."
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    loadData(true);
  }, [
    user,
    loadData,
  ]);

  // ======================================================
  // PATIENT DIRECTORY
  // ======================================================

  const patients =
    useMemo(() => {
      const map =
        new Map<
          string,
          Patient
        >();

      for (
        const appointment of appointments
      ) {
        if (
          appointment.patient
            ?._id
        ) {
          map.set(
            appointment
              .patient._id,
            appointment.patient
          );
        }
      }

      for (
        const record of records
      ) {
        if (
          record.patient
            ?._id
        ) {
          map.set(
            record.patient
              ._id,
            record.patient
          );
        }
      }

      return Array.from(
        map.values()
      );
    }, [
      appointments,
      records,
    ]);

  // ======================================================
  // FILTER PATIENTS
  // ======================================================

  const filteredPatients =
    useMemo(() => {
      const search =
        searchText
          .trim()
          .toLowerCase();

      if (!search) {
        return patients;
      }

      return patients.filter(
        (patient) => {
          const name =
            patient.fullName
              ?.toLowerCase() ||
            "";

          const email =
            patient.email
              ?.toLowerCase() ||
            "";

          return (
            name.includes(
              search
            ) ||
            email.includes(
              search
            )
          );
        }
      );
    }, [
      patients,
      searchText,
    ]);

  // ======================================================
  // RECORDS FOR SELECTED PATIENT
  // ======================================================

  const patientRecords =
    useMemo(() => {
      if (
        !selectedPatient
      ) {
        return [];
      }

      return records.filter(
        (record) =>
          record.patient
            ?._id ===
          selectedPatient._id
      );
    }, [
      records,
      selectedPatient,
    ]);

  // ======================================================
  // CREATE MEDICAL RECORD
  // ======================================================

  const handleCreateRecord =
    async (
      event:
        React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        !selectedPatient
      ) {
        showToast(
          "error",
          "Please select a patient."
        );

        return;
      }

      if (
        !diagnosis.trim()
      ) {
        showToast(
          "error",
          "Diagnosis is required."
        );

        return;
      }

      if (
        !prescription.trim()
      ) {
        showToast(
          "error",
          "Prescription is required."
        );

        return;
      }

      try {
        setCreating(
          true
        );

        const response =
          await api.post(
            "/medical-records",
            {
              patient:
                selectedPatient._id,

              diagnosis:
                diagnosis.trim(),

              prescription:
                prescription.trim(),

              notes:
                notes.trim(),
            }
          );

        showToast(
          "success",
          response.data
            ?.message ||
            "Medical record created successfully."
        );

        setDiagnosis("");
        setPrescription("");
        setNotes("");

        await loadData();
      } catch (
        error: any
      ) {
        console.error(
          "CREATE MEDICAL RECORD ERROR:",
          error
        );

        showToast(
          "error",
          error?.response
            ?.data
            ?.message ||
            "Unable to create medical record."
        );
      } finally {
        setCreating(
          false
        );
      }
    };

  // ======================================================
  // OPEN MEDICAL RECORD
  //
  // This endpoint:
  // - checks patient consent
  // - logs doctor access
  // - returns medical record
  // ======================================================

  const openRecord =
    async (
      recordId: string
    ) => {
      try {
        setOpeningRecordId(
          recordId
        );

        setVerification(
          null
        );

        const response =
          await api.get(
            `/record-access/records/${recordId}`
          );

        const record =
          response.data
            ?.medicalRecord;

        if (!record) {
          showToast(
            "error",
            "Medical record not found."
          );

          return;
        }

        setSelectedRecord(
          record
        );
      } catch (
        error: any
      ) {
        console.error(
          "OPEN RECORD ERROR:",
          error
        );

        if (
          error?.response
            ?.data
            ?.consentRequired
        ) {
          showToast(
            "error",
            "Patient consent is required before viewing this medical record."
          );

          return;
        }

        showToast(
          "error",
          error?.response
            ?.data
            ?.message ||
            "Unable to open medical record."
        );
      } finally {
        setOpeningRecordId(
          null
        );
      }
    };

  // ======================================================
  // VERIFY MEDICAL RECORD
  //
  // Correct backend route:
  // GET /api/medical-records/:id/verify
  // ======================================================

  const verifyRecord =
    async (
      recordId: string
    ) => {
      try {
        setVerifyingId(
          recordId
        );

        setVerification(
          null
        );

        const response =
          await api.get(
            `/medical-records/${recordId}/verify`
          );

        const result =
          response.data as VerificationResult;

        setVerification(
          result
        );

        if (
          result.verified
        ) {
          showToast(
            "success",
            "Medical record verified successfully."
          );
        } else {
          showToast(
            "error",
            result.message ||
              "Medical record verification failed."
          );
        }
      } catch (
        error: any
      ) {
        console.error(
          "VERIFY RECORD ERROR:",
          error
        );

        const message =
          error?.response
            ?.data
            ?.message ||
          "Unable to verify medical record.";

        setVerification({
          verified:
            false,

          message,
        });

        showToast(
          "error",
          message
        );
      } finally {
        setVerifyingId(
          null
        );
      }
    };

  // ======================================================
  // RECORD UPDATED FROM AUDIT PANEL
  // ======================================================

  const handleRecordUpdated =
    async () => {
      if (
        !selectedRecord
      ) {
        return;
      }

      const currentRecordId =
        selectedRecord._id;

      try {
        await loadData();

        // Reload the exact record
        // through consent-aware endpoint
        const response =
          await api.get(
            `/record-access/records/${currentRecordId}`
          );

        if (
          response.data
            ?.medicalRecord
        ) {
          setSelectedRecord(
            response.data
              .medicalRecord
          );
        }

        setVerification(
          null
        );
      } catch (
        error
      ) {
        console.error(
          "REFRESH UPDATED RECORD ERROR:",
          error
        );
      }
    };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeRecordModal =
    () => {
      setSelectedRecord(
        null
      );

      setVerification(
        null
      );

      setVerifyingId(
        null
      );
    };

  // ======================================================
  // INITIAL LOADING
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
            Loading Medical Records
          </h3>

          <p>
            Preparing secure
            patient information...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="app-page doctor-portal-page">
      {/* ==================================================
          TOAST
      ================================================== */}

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

        <div className="medical-page-header">
          <div>
            <div className="doctor-badge">
              SECURE MEDICAL
              RECORDS
            </div>

            <h1>
              Patient Medical
              Records
            </h1>

            <p>
              Create, access,
              verify and maintain
              blockchain-secured
              medical records.
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
              disabled={
                refreshing
              }
              onClick={() =>
                loadData()
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
                  "/doctor-dashboard"
                )
              }
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* ==================================================
            CONSENT INFO
        ================================================== */}

        <div className="doctor-consent-info-box">
          <div className="doctor-consent-icon">
            🔐
          </div>

          <div>
            <span>
              PATIENT CONSENT
            </span>

            <h3>
              Permission-controlled
              medical records
            </h3>

            <p>
              Patient consent is
              checked before a
              doctor opens an
              existing medical
              record. Successful
              record access is
              logged.
            </p>
          </div>
        </div>

        {/* ==================================================
            WORKSPACE
        ================================================== */}

        <div className="doctor-record-workspace">
          {/* ==================================================
              PATIENT DIRECTORY
          ================================================== */}

          <div className="doctor-patient-directory">
            <div className="doctor-record-section-title">
              <span>
                PATIENT DIRECTORY
              </span>

              <h2>
                Select Patient
              </h2>
            </div>

            <input
              type="text"
              className="doctor-patient-search"
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target
                    .value
                )
              }
              placeholder="Search patient..."
            />

            <div className="doctor-patient-directory-list">
              {filteredPatients.length ===
              0 ? (
                <div className="doctor-record-empty-small">
                  No patients
                  found.
                </div>
              ) : (
                filteredPatients.map(
                  (
                    patient
                  ) => (
                    <button
                      type="button"
                      key={
                        patient._id
                      }
                      className={
                        selectedPatient
                          ?._id ===
                        patient._id
                          ? "doctor-patient-directory-item doctor-patient-directory-item-active"
                          : "doctor-patient-directory-item"
                      }
                      onClick={() => {
                        setSelectedPatient(
                          patient
                        );

                        setSelectedRecord(
                          null
                        );

                        setVerification(
                          null
                        );
                      }}
                    >
                      <div className="doctor-directory-avatar">
                        +
                      </div>

                      <div>
                        <strong>
                          {
                            patient.fullName
                          }
                        </strong>

                        <span>
                          {
                            patient.email
                          }
                        </span>
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </div>

          {/* ==================================================
              MAIN AREA
          ================================================== */}

          <div className="doctor-record-main-area">
            {!selectedPatient ? (
              <div className="doctor-record-no-patient">
                <div>
                  👤
                </div>

                <h3>
                  Select a Patient
                </h3>

                <p>
                  Choose a patient
                  from the directory
                  to manage medical
                  records.
                </p>
              </div>
            ) : (
              <>
                {/* ==================================================
                    SELECTED PATIENT
                ================================================== */}

                <div className="doctor-selected-patient">
                  <div>
                    <span>
                      SELECTED PATIENT
                    </span>

                    <h2>
                      {
                        selectedPatient.fullName
                      }
                    </h2>

                    <p>
                      {
                        selectedPatient.email
                      }
                    </p>
                  </div>

                  <div className="doctor-record-count">
                    <strong>
                      {
                        patientRecords.length
                      }
                    </strong>

                    <span>
                      Records
                    </span>
                  </div>
                </div>

                {/* ==================================================
                    CREATE RECORD
                ================================================== */}

                <form
                  className="doctor-create-record-card"
                  onSubmit={
                    handleCreateRecord
                  }
                >
                  <div className="doctor-record-section-title">
                    <span>
                      NEW MEDICAL RECORD
                    </span>

                    <h2>
                      Create Record
                    </h2>

                    <p>
                      Medical data is
                      stored in MongoDB.
                      The SHA-256 hash is
                      anchored to the
                      blockchain ledger.
                    </p>
                  </div>

                  <div className="doctor-create-record-grid">
                    <div className="form-group">
                      <label className="form-label">
                        Diagnosis
                      </label>

                      <textarea
                        className="form-control"
                        value={
                          diagnosis
                        }
                        onChange={(
                          event
                        ) =>
                          setDiagnosis(
                            event.target
                              .value
                          )
                        }
                        placeholder="Enter diagnosis"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Prescription
                      </label>

                      <textarea
                        className="form-control"
                        value={
                          prescription
                        }
                        onChange={(
                          event
                        ) =>
                          setPrescription(
                            event.target
                              .value
                          )
                        }
                        placeholder="Enter prescription"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Notes
                    </label>

                    <textarea
                      className="form-control"
                      value={
                        notes
                      }
                      onChange={(
                        event
                      ) =>
                        setNotes(
                          event.target
                            .value
                        )
                      }
                      placeholder="Optional medical notes"
                    />
                  </div>

                  <button
                    type="submit"
                    className="doctor-create-record-btn"
                    disabled={
                      creating
                    }
                  >
                    {creating
                      ? "Securing Record..."
                      : "Create & Secure Record"}
                  </button>
                </form>

                {/* ==================================================
                    EXISTING RECORDS
                ================================================== */}

                <div className="doctor-record-history-card">
                  <div className="doctor-record-section-title">
                    <span>
                      MEDICAL HISTORY
                    </span>

                    <h2>
                      Existing Records
                    </h2>
                  </div>

                  {patientRecords.length ===
                  0 ? (
                    <div className="doctor-record-empty-small">
                      No medical
                      records created
                      yet.
                    </div>
                  ) : (
                    <div className="doctor-record-history-list">
                      {patientRecords.map(
                        (
                          record
                        ) => (
                          <div
                            key={
                              record._id
                            }
                            className="doctor-secure-record-card"
                          >
                            <div>
                              <span>
                                DIAGNOSIS
                              </span>

                              <h3>
                                {
                                  record.diagnosis
                                }
                              </h3>

                              <p>
                                {record.createdAt
                                  ? new Date(
                                      record.createdAt
                                    ).toLocaleString()
                                  : "Date unavailable"}
                              </p>
                            </div>

                            <button
                              type="button"
                              className="doctor-open-secure-record-btn"
                              disabled={
                                openingRecordId ===
                                record._id
                              }
                              onClick={() =>
                                openRecord(
                                  record._id
                                )
                              }
                            >
                              {openingRecordId ===
                              record._id
                                ? "Checking Access..."
                                : "View Record"}
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          MEDICAL RECORD MODAL
      ================================================== */}

      {selectedRecord && (
        <div
          className="doctor-record-modal-overlay"
          onClick={
            closeRecordModal
          }
        >
          <div
            className="doctor-record-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="doctor-record-modal-header">
              <div>
                <span>
                  CONSENT-AUTHORIZED
                  MEDICAL RECORD
                </span>

                <h2>
                  {
                    selectedRecord
                      .patient
                      ?.fullName
                  }
                </h2>

                <p>
                  {
                    selectedRecord
                      .patient
                      ?.email
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeRecordModal
                }
              >
                ×
              </button>
            </div>

            {/* ==================================================
                CONSENT STATUS
            ================================================== */}

            <div className="doctor-record-access-success">
              ✓ Patient consent
              verified. Access has
              been logged.
            </div>

            {/* ==================================================
                RECORD DETAILS
            ================================================== */}

            <div className="doctor-record-detail-grid">
              <div>
                <span>
                  DIAGNOSIS
                </span>

                <p>
                  {
                    selectedRecord.diagnosis
                  }
                </p>
              </div>

              <div>
                <span>
                  PRESCRIPTION
                </span>

                <p>
                  {
                    selectedRecord.prescription
                  }
                </p>
              </div>
            </div>

            <div className="doctor-record-detail-box">
              <span>
                NOTES
              </span>

              <p>
                {selectedRecord.notes ||
                  "No additional notes."}
              </p>
            </div>

            <div className="doctor-record-detail-box">
              <span>
                RECORD CREATED
              </span>

              <p>
                {selectedRecord.createdAt
                  ? new Date(
                      selectedRecord.createdAt
                    ).toLocaleString()
                  : "Unavailable"}
              </p>
            </div>

            {/* ==================================================
                BLOCKCHAIN VERIFY
            ================================================== */}

            <div className="doctor-blockchain-verify-box">
              <div>
                <span>
                  BLOCKCHAIN
                  INTEGRITY
                </span>

                <h3>
                  Verify Medical
                  Record
                </h3>

                <p>
                  Recalculate the
                  current SHA-256
                  hash and compare
                  it with the latest
                  hash stored on the
                  blockchain.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  verifyingId ===
                  selectedRecord._id
                }
                onClick={() =>
                  verifyRecord(
                    selectedRecord._id
                  )
                }
              >
                {verifyingId ===
                selectedRecord._id
                  ? "Verifying..."
                  : "Verify Integrity"}
              </button>
            </div>

            {/* ==================================================
                VERIFICATION RESULT
            ================================================== */}

            {verification && (
              <div
                className={
                  verification.verified
                    ? "doctor-verification-result doctor-verification-success"
                    : "doctor-verification-result doctor-verification-danger"
                }
              >
                <strong>
                  {verification.verified
                    ? "✓ VERIFIED — RECORD UNCHANGED"
                    : verification.integrityStatus ===
                        "TAMPER_DETECTED"
                      ? "⚠ TAMPER DETECTED"
                      : "⚠ VERIFICATION FAILED"}
                </strong>

                <p>
                  {
                    verification.message
                  }
                </p>

                {verification
                  .blockchain
                  ?.versionCount !==
                  undefined && (
                  <p>
                    Blockchain
                    Versions:{" "}
                    {
                      verification
                        .blockchain
                        .versionCount
                    }
                  </p>
                )}

                {verification
                  .blockchainHash &&
                  verification
                    .currentHash && (
                    <div className="doctor-hash-comparison">
                      <div>
                        <span>
                          BLOCKCHAIN
                          HASH
                        </span>

                        <code>
                          {
                            verification.blockchainHash
                          }
                        </code>
                      </div>

                      <div>
                        <span>
                          CURRENT HASH
                        </span>

                        <code>
                          {
                            verification.currentHash
                          }
                        </code>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* ==================================================
                AUDIT / VERSION HISTORY
            ================================================== */}

            <MedicalRecordAuditPanel
              record={
                selectedRecord
              }
              onUpdated={
                handleRecordUpdated
              }
            />

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="doctor-record-modal-footer">
              <button
                type="button"
                onClick={
                  closeRecordModal
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMedicalRecords;