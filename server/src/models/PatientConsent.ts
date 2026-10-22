import mongoose, {
  Schema,
  type HydratedDocument,
} from "mongoose";

// ======================================================
// INTERFACE
// ======================================================

export interface IPatientConsent {
  patient: mongoose.Types.ObjectId;

  doctor: mongoose.Types.ObjectId;

  granted: boolean;

  grantedAt?: Date;

  revokedAt?: Date | null;

  createdAt?: Date;

  updatedAt?: Date;
}

export type PatientConsentDocument =
  HydratedDocument<IPatientConsent>;

// ======================================================
// SCHEMA
// ======================================================

const patientConsentSchema =
  new Schema<IPatientConsent>(
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

      granted: {
        type: Boolean,

        default: true,

        required: true,
      },

      grantedAt: {
        type: Date,

        default: Date.now,
      },

      revokedAt: {
        type: Date,

        default: null,
      },
    },
    {
      timestamps: true,

      versionKey: false,
    }
  );

// One consent record per patient + doctor
patientConsentSchema.index(
  {
    patient: 1,
    doctor: 1,
  },
  {
    unique: true,
  }
);

const PatientConsent =
  mongoose.models.PatientConsent ||
  mongoose.model<IPatientConsent>(
    "PatientConsent",
    patientConsentSchema
  );

export default PatientConsent;