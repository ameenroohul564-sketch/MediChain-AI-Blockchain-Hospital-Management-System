import mongoose, {
  Schema,
  type HydratedDocument,
} from "mongoose";

export type UserRole =
  | "patient"
  | "doctor"
  | "admin";

export interface IUser {
  fullName: string;
  email: string;
  password: string;

  role: UserRole;

  specialization?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument =
  HydratedDocument<IUser>;

const userSchema =
  new Schema<IUser>(
    {
      fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
      },

      password: {
        type: String,
        required: true,
        minlength: 6,
      },

      role: {
        type: String,
        enum: [
          "patient",
          "doctor",
          "admin",
        ],
        default: "patient",
        required: true,
        index: true,
      },

      specialization: {
        type: String,
        trim: true,
        default: "",
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

const User =
  mongoose.models.User ||
  mongoose.model<IUser>(
    "User",
    userSchema
  );

export default User;