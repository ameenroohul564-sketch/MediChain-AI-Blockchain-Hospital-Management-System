import mongoose, {
  Schema,
  type HydratedDocument,
} from "mongoose";

// ======================================================
// AUDIT HISTORY TYPE
// ======================================================

export interface IMedicalRecordAuditEntry {
  oldHash: string;

  newHash: string;

  changedBy:
    mongoose.Types.ObjectId;

  changedAt: Date;

  reason?: string;
}

// ======================================================
// MAIN INTERFACE
// ======================================================

export interface IMedicalRecord {
  patient:
    mongoose.Types.ObjectId;

  doctor:
    mongoose.Types.ObjectId;

  diagnosis: string;

  prescription: string;

  notes?: string;

  recordHash: string;

  auditHistory:
    IMedicalRecordAuditEntry[];

  createdAt?: Date;

  updatedAt?: Date;
}

export type MedicalRecordDocument =
  HydratedDocument<IMedicalRecord>;

// ======================================================
// AUDIT SUB-SCHEMA
// ======================================================

const auditEntrySchema =
  new Schema<IMedicalRecordAuditEntry>(
    {
      oldHash: {
        type: String,

        required: true,

        trim: true,
      },

      newHash: {
        type: String,

        required: true,

        trim: true,
      },

      changedBy: {
        type:
          Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      changedAt: {
        type: Date,

        default: Date.now,

        required: true,
      },

      reason: {
        type: String,

        trim: true,

        default: "",
      },
    },
    {
      _id: false,
      versionKey: false,
    }
  );

// ======================================================
// MAIN SCHEMA
// ======================================================

const medicalRecordSchema =
  new Schema<IMedicalRecord>(
    {
      patient: {
        type:
          Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      doctor: {
        type:
          Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      diagnosis: {
        type: String,

        required: true,

        trim: true,
      },

      prescription: {
        type: String,

        required: true,

        trim: true,
      },

      notes: {
        type: String,

        trim: true,

        default: "",
      },

      recordHash: {
        type: String,

        required: true,

        trim: true,

        index: true,
      },

      auditHistory: {
        type: [
          auditEntrySchema,
        ],

        default: [],
      },
    },
    {
      timestamps: true,

      versionKey: false,
    }
  );

// ======================================================
// INDEXES
// ======================================================

medicalRecordSchema.index({
  patient: 1,
  createdAt: -1,
});

medicalRecordSchema.index({
  doctor: 1,
  createdAt: -1,
});

// ======================================================
// MODEL
// ======================================================

const MedicalRecord =
  mongoose.models
    .MedicalRecord ||
  mongoose.model<IMedicalRecord>(
    "MedicalRecord",
    medicalRecordSchema
  );

export default MedicalRecord;