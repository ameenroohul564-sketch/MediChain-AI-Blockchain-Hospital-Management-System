import mongoose, {
  Schema,
  type HydratedDocument,
} from "mongoose";

// ======================================================
// TYPES
// ======================================================

export type AccessAction =
  | "VIEW_RECORD"
  | "VERIFY_RECORD";

// ======================================================
// INTERFACE
// ======================================================

export interface IRecordAccessLog {
  patient:
    mongoose.Types.ObjectId;

  doctor:
    mongoose.Types.ObjectId;

  medicalRecord:
    mongoose.Types.ObjectId;

  action: AccessAction;

  accessedAt: Date;

  createdAt?: Date;

  updatedAt?: Date;
}

export type RecordAccessLogDocument =
  HydratedDocument<IRecordAccessLog>;

// ======================================================
// SCHEMA
// ======================================================

const recordAccessLogSchema =
  new Schema<IRecordAccessLog>(
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

      medicalRecord: {
        type:
          Schema.Types.ObjectId,

        ref:
          "MedicalRecord",

        required: true,

        index: true,
      },

      action: {
        type: String,

        enum: [
          "VIEW_RECORD",
          "VERIFY_RECORD",
        ],

        default:
          "VIEW_RECORD",

        required: true,
      },

      accessedAt: {
        type: Date,

        default: Date.now,

        required: true,

        index: true,
      },
    },
    {
      timestamps: true,

      versionKey: false,
    }
  );

const RecordAccessLog =
  mongoose.models
    .RecordAccessLog ||
  mongoose.model<IRecordAccessLog>(
    "RecordAccessLog",
    recordAccessLogSchema
  );

export default RecordAccessLog;