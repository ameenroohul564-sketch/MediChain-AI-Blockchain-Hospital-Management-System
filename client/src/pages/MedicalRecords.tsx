import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

interface Doctor {
  _id: string;
  fullName: string;
  email?: string;
  specialization?: string;
}

interface MedicalRecord {
  _id: string;

  doctor: Doctor;

  patient?: {
    _id: string;
    fullName?: string;
    email?: string;
  };

  diagnosis: string;
  prescription: string;
  notes?: string;

  recordHash?: string;

  createdAt?: string;
  updatedAt?: string;
}

interface VerificationResult {
  verified: boolean;

  message?: string;

  integrityStatus?: string;

  blockchainHash?: string;

  currentHash?: string;

  blockchain?: {
    timestamp?: number;
    storedBy?: string;
    versionCount?: number;
  };
}

const MedicalRecords = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const [verificationResults, setVerificationResults] = useState<
    Record<string, VerificationResult>
  >({});

  // ======================================================
  // LOAD PATIENT MEDICAL RECORDS
  // ======================================================

  const loadRecords = useCallback(async (initialLoad = false) => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/medical-records");

      console.log(
        "PATIENT MEDICAL RECORD RESPONSE:",
        response.data
      );

      // ==================================================
      // IMPORTANT FIX
      //
      // Backend returns:
      //
      // {
      //   medicalRecords: [...]
      // }
      //
      // But this also supports direct array response.
      // ==================================================

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.medicalRecords || [];

      console.log(
        "PATIENT MEDICAL RECORDS:",
        data
      );

      setRecords(data);
    } catch (error: any) {
      console.error(
        "LOAD PATIENT MEDICAL RECORDS ERROR:",
        error
      );

      setRecords([]);

      setError(
        error?.response?.data?.message ||
          "Unable to load medical records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadRecords(true);
  }, [loadRecords]);

  // ======================================================
  // VERIFY RECORD
  // ======================================================

  const verifyRecord = async (recordId: string) => {
    try {
      setVerifyingId(recordId);

      setVerificationResults((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[recordId];

        return updated;
      });

      const response = await api.get(
        `/medical-records/${recordId}/verify`
      );

      const result = response.data as VerificationResult;

      setVerificationResults((previous) => ({
        ...previous,
        [recordId]: result,
      }));
    } catch (error: any) {
      console.error(
        "PATIENT VERIFY RECORD ERROR:",
        error
      );

      setVerificationResults((previous) => ({
        ...previous,

        [recordId]: {
          verified: false,

          message:
            error?.response?.data?.message ||
            "Unable to verify medical record.",
        },
      }));
    } finally {
      setVerifyingId(null);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="app-page">
        <div className="app-container">
          <div
            style={{
              minHeight: "60vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h2>Loading Medical Records...</h2>

            <p>
              Retrieving your secured medical history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="app-page">
      <div className="app-container">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1px",
                opacity: 0.7,
              }}
            >
              BLOCKCHAIN-SECURED HEALTH RECORDS
            </span>

            <h1
              style={{
                marginTop: "8px",
                marginBottom: "8px",
              }}
            >
              My Medical Records
            </h1>

            <p>
              View and verify your medical records securely.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              disabled={refreshing}
              onClick={() => loadRecords()}
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "25px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              opacity: 0.7,
            }}
          >
            TOTAL MEDICAL RECORDS
          </span>

          <h2
            style={{
              marginTop: "8px",
            }}
          >
            {records.length}
          </h2>

          <p>
            Your medical history is stored securely. Record
            integrity can be checked against the blockchain
            ledger.
          </p>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "1px solid #ff6b6b",
            }}
          >
            <strong>Unable to load records</strong>

            <p
              style={{
                marginTop: "6px",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!error && records.length === 0 && (
          <div
            style={{
              padding: "50px 25px",
              textAlign: "center",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "15px",
              }}
            >
              📋
            </div>

            <h2>No Medical Records Yet</h2>

            <p>
              Medical records created by your doctor will
              appear here.
            </p>
          </div>
        )}

        {/* ==================================================
            RECORDS
        ================================================== */}

        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          {records.map((record) => {
            const verification =
              verificationResults[record._id];

            return (
              <div
                key={record._id}
                style={{
                  padding: "24px",
                  borderRadius: "18px",
                  background:
                    "rgba(255,255,255,0.05)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* ==========================================
                    DOCTOR
                ========================================== */}

                <div
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    DOCTOR
                  </span>

                  <h3
                    style={{
                      marginTop: "5px",
                      marginBottom: "4px",
                    }}
                  >
                    {record.doctor?.fullName ||
                      "Doctor"}
                  </h3>

                  {record.doctor?.specialization && (
                    <p>
                      {record.doctor.specialization}
                    </p>
                  )}
                </div>

                {/* ==========================================
                    DIAGNOSIS
                ========================================== */}

                <div
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    DIAGNOSIS
                  </span>

                  <p
                    style={{
                      marginTop: "6px",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    {record.diagnosis}
                  </p>
                </div>

                {/* ==========================================
                    PRESCRIPTION
                ========================================== */}

                <div
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    PRESCRIPTION
                  </span>

                  <p
                    style={{
                      marginTop: "6px",
                    }}
                  >
                    {record.prescription}
                  </p>
                </div>

                {/* ==========================================
                    NOTES
                ========================================== */}

                <div
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    NOTES
                  </span>

                  <p
                    style={{
                      marginTop: "6px",
                    }}
                  >
                    {record.notes ||
                      "No additional notes."}
                  </p>
                </div>

                {/* ==========================================
                    DATE
                ========================================== */}

                <div
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                    }}
                  >
                    CREATED
                  </span>

                  <p
                    style={{
                      marginTop: "6px",
                    }}
                  >
                    {record.createdAt
                      ? new Date(
                          record.createdAt
                        ).toLocaleString()
                      : "Date unavailable"}
                  </p>
                </div>

                {/* ==========================================
                    HASH
                ========================================== */}

                {record.recordHash && (
                  <div
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        opacity: 0.7,
                      }}
                    >
                      SHA-256 RECORD HASH
                    </span>

                    <code
                      style={{
                        display: "block",
                        marginTop: "8px",
                        padding: "12px",
                        borderRadius: "8px",
                        overflowWrap: "anywhere",
                        background:
                          "rgba(0,0,0,0.25)",
                      }}
                    >
                      {record.recordHash}
                    </code>
                  </div>
                )}

                {/* ==========================================
                    VERIFY
                ========================================== */}

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    verifyingId === record._id
                  }
                  onClick={() =>
                    verifyRecord(record._id)
                  }
                >
                  {verifyingId === record._id
                    ? "Verifying..."
                    : "Verify Integrity"}
                </button>

                {/* ==========================================
                    VERIFICATION RESULT
                ========================================== */}

                {verification && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "16px",
                      borderRadius: "12px",
                      border: verification.verified
                        ? "1px solid #46d39a"
                        : "1px solid #ff6b6b",
                    }}
                  >
                    <strong>
                      {verification.verified
                        ? "✓ VERIFIED — RECORD UNCHANGED"
                        : "⚠ VERIFICATION FAILED"}
                    </strong>

                    <p
                      style={{
                        marginTop: "8px",
                      }}
                    >
                      {verification.message ||
                        (verification.verified
                          ? "Medical record integrity verified successfully."
                          : "Medical record integrity verification failed.")}
                    </p>

                    {verification.blockchain
                      ?.versionCount !== undefined && (
                      <p
                        style={{
                          marginTop: "8px",
                        }}
                      >
                        Blockchain Versions:{" "}
                        {
                          verification.blockchain
                            .versionCount
                        }
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;