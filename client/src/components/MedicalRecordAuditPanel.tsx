import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

// ======================================================
// TYPES
// ======================================================

interface MedicalRecord {
  _id: string;

  diagnosis: string;

  prescription: string;

  notes?: string;
}

interface BlockchainVersion {
  version: number;

  recordHash: string;

  timestamp: number;

  storedBy: string;
}

interface ChangedByUser {
  _id?: string;

  fullName?: string;

  email?: string;

  role?: string;
}

interface AuditEntry {
  oldHash: string;

  newHash: string;

  changedAt: string;

  reason?: string;

  changedBy?:
    | ChangedByUser
    | string;
}

interface HistoryResponse {
  medicalRecordId: string;

  currentHash: string;

  totalVersions: number;

  blockchainHistory:
    BlockchainVersion[];

  mongoAuditHistory:
    AuditEntry[];
}

interface Props {
  record: MedicalRecord;

  onUpdated?: () =>
    void | Promise<void>;
}

// ======================================================
// COMPONENT
// ======================================================

const MedicalRecordAuditPanel = ({
  record,
  onUpdated,
}: Props) => {
  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    diagnosis,
    setDiagnosis,
  ] =
    useState(
      record.diagnosis
    );

  const [
    prescription,
    setPrescription,
  ] =
    useState(
      record.prescription
    );

  const [
    notes,
    setNotes,
  ] =
    useState(
      record.notes || ""
    );

  const [
    reason,
    setReason,
  ] =
    useState(
      "Follow-up consultation"
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    loadingHistory,
    setLoadingHistory,
  ] =
    useState(false);

  const [
    history,
    setHistory,
  ] =
    useState<
      HistoryResponse | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    messageType,
    setMessageType,
  ] =
    useState<
      "success" | "error" | ""
    >("");

  // ======================================================
  // SYNC WHEN RECORD CHANGES
  // ======================================================

  useEffect(() => {
    setDiagnosis(
      record.diagnosis
    );

    setPrescription(
      record.prescription
    );

    setNotes(
      record.notes || ""
    );

    setReason(
      "Follow-up consultation"
    );

    setEditing(false);

    setHistory(null);

    setMessage("");

    setMessageType("");
  }, [record]);

  // ======================================================
  // HELPER
  // ======================================================

  const getChangedByName = (
    changedBy:
      AuditEntry["changedBy"]
  ) => {
    if (!changedBy) {
      return "Doctor";
    }

    if (
      typeof changedBy ===
      "string"
    ) {
      return "Doctor";
    }

    return (
      changedBy.fullName ||
      changedBy.email ||
      "Doctor"
    );
  };

  // ======================================================
  // LOAD HISTORY
  // ======================================================

  const loadHistory =
    async () => {
      try {
        setLoadingHistory(
          true
        );

        setMessage("");

        setMessageType("");

        const response =
          await api.get(
            `/medical-records/${record._id}/history`
          );

        const data =
          response.data as HistoryResponse;

        setHistory({
          medicalRecordId:
            data.medicalRecordId,

          currentHash:
            data.currentHash,

          totalVersions:
            data.totalVersions || 0,

          blockchainHistory:
            Array.isArray(
              data.blockchainHistory
            )
              ? data.blockchainHistory
              : [],

          mongoAuditHistory:
            Array.isArray(
              data.mongoAuditHistory
            )
              ? data.mongoAuditHistory
              : [],
        });

        setMessage(
          "Audit history loaded successfully."
        );

        setMessageType(
          "success"
        );
      } catch (
        error: any
      ) {
        console.error(
          "LOAD HISTORY ERROR:",
          error
        );

        setHistory(null);

        setMessage(
          error?.response
            ?.data
            ?.message ||
            "Unable to load audit history."
        );

        setMessageType(
          "error"
        );
      } finally {
        setLoadingHistory(
          false
        );
      }
    };

  // ======================================================
  // UPDATE RECORD
  // ======================================================

  const updateRecord =
    async () => {
      const cleanDiagnosis =
        diagnosis.trim();

      const cleanPrescription =
        prescription.trim();

      const cleanNotes =
        notes.trim();

      const cleanReason =
        reason.trim();

      if (
        !cleanDiagnosis
      ) {
        setMessage(
          "Diagnosis is required."
        );

        setMessageType(
          "error"
        );

        return;
      }

      if (
        !cleanPrescription
      ) {
        setMessage(
          "Prescription is required."
        );

        setMessageType(
          "error"
        );

        return;
      }

      try {
        setSaving(true);

        setMessage("");

        setMessageType("");

        const response =
          await api.patch(
            `/medical-records/${record._id}`,
            {
              diagnosis:
                cleanDiagnosis,

              prescription:
                cleanPrescription,

              notes:
                cleanNotes,

              reason:
                cleanReason ||
                "Medical record updated by doctor.",
            }
          );

        setMessage(
          response.data
            ?.message ||
            "Medical record updated successfully."
        );

        setMessageType(
          "success"
        );

        setEditing(false);

        // Load latest blockchain
        // + MongoDB audit history
        await loadHistory();

        // Refresh parent component
        if (onUpdated) {
          await onUpdated();
        }
      } catch (
        error: any
      ) {
        console.error(
          "UPDATE MEDICAL RECORD ERROR:",
          error
        );

        setMessage(
          error?.response
            ?.data
            ?.message ||
            "Unable to update medical record."
        );

        setMessageType(
          "error"
        );
      } finally {
        setSaving(false);
      }
    };

  // ======================================================
  // CANCEL EDIT
  // ======================================================

  const cancelEdit = () => {
    setDiagnosis(
      record.diagnosis
    );

    setPrescription(
      record.prescription
    );

    setNotes(
      record.notes || ""
    );

    setReason(
      "Follow-up consultation"
    );

    setEditing(false);

    setMessage("");

    setMessageType("");
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="audit-panel">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="audit-panel-header">
        <div>
          <span>
            TAMPER HISTORY /
            AUDIT TRAIL
          </span>

          <h3>
            Medical Record
            Version Control
          </h3>

          <p>
            Authorized updates create
            a new SHA-256 hash version
            on the blockchain while
            previous versions remain
            available in the audit
            history.
          </p>
        </div>

        <div className="audit-panel-actions">
          <button
            type="button"
            onClick={() => {
              if (editing) {
                cancelEdit();
              } else {
                setEditing(
                  true
                );

                setMessage("");

                setMessageType(
                  ""
                );
              }
            }}
          >
            {editing
              ? "Cancel Edit"
              : "Edit Record"}
          </button>

          <button
            type="button"
            onClick={
              loadHistory
            }
            disabled={
              loadingHistory
            }
          >
            {loadingHistory
              ? "Loading..."
              : "View History"}
          </button>
        </div>
      </div>

      {/* ==================================================
          EDIT FORM
      ================================================== */}

      {editing && (
        <div className="audit-edit-box">
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
                  event
                    .target
                    .value
                )
              }
              placeholder="Enter updated diagnosis"
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
                  event
                    .target
                    .value
                )
              }
              placeholder="Enter updated prescription"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Notes
            </label>

            <textarea
              className="form-control"
              value={notes}
              onChange={(
                event
              ) =>
                setNotes(
                  event
                    .target
                    .value
                )
              }
              placeholder="Optional updated notes"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Reason for Update
            </label>

            <input
              type="text"
              className="form-control"
              value={reason}
              onChange={(
                event
              ) =>
                setReason(
                  event
                    .target
                    .value
                )
              }
              placeholder="Example: Follow-up consultation"
            />
          </div>

          <button
            type="button"
            className="audit-save-btn"
            disabled={saving}
            onClick={
              updateRecord
            }
          >
            {saving
              ? "Securing New Version..."
              : "Save New Blockchain Version"}
          </button>
        </div>
      )}

      {/* ==================================================
          MESSAGE
      ================================================== */}

      {message && (
        <div
          className={
            messageType ===
            "error"
              ? "audit-message audit-message-error"
              : "audit-message audit-message-success"
          }
        >
          {message}
        </div>
      )}

      {/* ==================================================
          HISTORY
      ================================================== */}

      {history && (
        <div className="audit-history-box">
          {/* SUMMARY */}

          <div className="audit-history-summary">
            <div>
              <span>
                TOTAL BLOCKCHAIN
                VERSIONS
              </span>

              <strong>
                {
                  history.totalVersions
                }
              </strong>
            </div>

            <div>
              <span>
                CURRENT MONGODB
                HASH
              </span>

              <code>
                {
                  history.currentHash
                }
              </code>
            </div>
          </div>

          {/* ==================================================
              BLOCKCHAIN HISTORY
          ================================================== */}

          <h4>
            Blockchain Versions
          </h4>

          {history
            .blockchainHistory
            .length === 0 ? (
            <div className="audit-empty">
              No blockchain
              versions found for
              this record.
            </div>
          ) : (
            <div className="audit-version-list">
              {history.blockchainHistory.map(
                (
                  version
                ) => (
                  <div
                    key={
                      version.version
                    }
                    className="audit-version-item"
                  >
                    <div>
                      <strong>
                        Version{" "}
                        {
                          version.version
                        }
                      </strong>

                      <span>
                        {version.timestamp
                          ? new Date(
                              version.timestamp *
                                1000
                            ).toLocaleString()
                          : "Timestamp unavailable"}
                      </span>
                    </div>

                    <div>
                      <small>
                        Blockchain
                        Hash
                      </small>

                      <code>
                        {
                          version.recordHash
                        }
                      </code>

                      <small>
                        Stored By
                      </small>

                      <code>
                        {
                          version.storedBy
                        }
                      </code>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ==================================================
              MONGODB MODIFICATION AUDIT
          ================================================== */}

          <h4>
            Modification Audit
          </h4>

          {history
            .mongoAuditHistory
            .length === 0 ? (
            <div className="audit-empty">
              This is the original
              record. No authorized
              modifications have
              been made yet.
            </div>
          ) : (
            <div className="audit-version-list">
              {history.mongoAuditHistory.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${item.newHash}-${index}`}
                    className="audit-change-item"
                  >
                    <strong>
                      Updated by{" "}
                      {getChangedByName(
                        item.changedBy
                      )}
                    </strong>

                    <span>
                      {item.changedAt
                        ? new Date(
                            item.changedAt
                          ).toLocaleString()
                        : "Time unavailable"}
                    </span>

                    <p>
                      <b>
                        Reason:
                      </b>{" "}
                      {item.reason ||
                        "Not specified"}
                    </p>

                    <small>
                      Previous Hash
                    </small>

                    <code>
                      {
                        item.oldHash
                      }
                    </code>

                    <small>
                      New Hash
                    </small>

                    <code>
                      {
                        item.newHash
                      }
                    </code>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalRecordAuditPanel;