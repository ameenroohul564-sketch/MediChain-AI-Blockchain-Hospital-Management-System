import mongoose, {
  Schema,
  type Types,
} from "mongoose";

export type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Completed"
  | "Cancelled";

export type AppointmentPriority =
  | "Low"
  | "Medium"
  | "High";

export type SymptomProgress =
  | "Better"
  | "Worse"
  | "No change";

export interface IAppointment {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;

  appointmentDate: Date;
  reason: string;

  status: AppointmentStatus;

  // ======================================================
  // AI PRE-CONSULTATION
  // ======================================================

  mainConcern: string;

  symptoms: string[];

  symptomDuration: string;

  painLevel: number;

  severity: number;

  additionalSymptoms: string[];

  symptomProgress: SymptomProgress;

  existingConditions: string;

  currentMedications: string;

  allergies: string;

  emergencySymptoms: string[];

  followUpAnswers: Record<
    string,
    string | string[] | boolean | number
  >;

  aiSummary: string;

  suggestedDepartment: string;

  priority: AppointmentPriority;

  urgentCareRequired: boolean;

  aiAssessmentCompleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const appointmentSchema =
  new Schema<IAppointment>(
    {
      patient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      doctor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      appointmentDate: {
        type: Date,
        required: true,
        index: true,
      },

      reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
      },

      status: {
        type: String,
        enum: [
          "Pending",
          "Approved",
          "Completed",
          "Cancelled",
        ],
        default: "Pending",
        required: true,
        index: true,
      },

      // ==================================================
      // AI PRE-CONSULTATION FIELDS
      // ==================================================

      mainConcern: {
        type: String,
        default: "",
        trim: true,
      },

      symptoms: {
        type: [String],
        default: [],
      },

      symptomDuration: {
        type: String,
        default: "",
        trim: true,
      },

      painLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },

      severity: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },

      additionalSymptoms: {
        type: [String],
        default: [],
      },

      symptomProgress: {
        type: String,
        enum: [
          "Better",
          "Worse",
          "No change",
        ],
        default: "No change",
      },

      existingConditions: {
        type: String,
        default: "",
        trim: true,
      },

      currentMedications: {
        type: String,
        default: "",
        trim: true,
      },

      allergies: {
        type: String,
        default: "",
        trim: true,
      },

      emergencySymptoms: {
        type: [String],
        default: [],
      },

      followUpAnswers: {
        type: Schema.Types.Mixed,
        default: {},
      },

      aiSummary: {
        type: String,
        default: "",
        trim: true,
      },

      suggestedDepartment: {
        type: String,
        default: "General Medicine",
        trim: true,
      },

      priority: {
        type: String,
        enum: [
          "Low",
          "Medium",
          "High",
        ],
        default: "Low",
        index: true,
      },

      urgentCareRequired: {
        type: Boolean,
        default: false,
      },

      aiAssessmentCompleted: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>(
    "Appointment",
    appointmentSchema
  );

export default Appointment;