import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.js";

// ======================================================
// LOAD ENV
// ======================================================

dotenv.config();

// ======================================================
// CREATE DEMO DOCTOR
// ======================================================

const createDoctor = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is not configured in .env"
      );
    }

    console.log(
      "Connecting to MongoDB..."
    );

    await mongoose.connect(
      mongoUri
    );

    console.log(
      "MongoDB connected successfully."
    );

    // ==================================================
    // DEMO DOCTOR DETAILS
    // ==================================================

    const doctorEmail =
      "doctor@gmail.com";

    const doctorPassword =
      "doctor123";

    const doctorName =
      "Demo Doctor";

    // ==================================================
    // CHECK EXISTING DOCTOR
    // ==================================================

    const existingDoctor =
      await User.findOne({
        email:
          doctorEmail.toLowerCase(),
      });

    if (existingDoctor) {
      console.log(
        "Doctor account already exists."
      );

      console.log(
        "Email:",
        existingDoctor.email
      );

      console.log(
        "Role:",
        existingDoctor.role
      );

      console.log(
        "No new doctor created."
      );

      await mongoose.disconnect();

      process.exit(0);
    }

    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        doctorPassword,
        salt
      );

    // ==================================================
    // CREATE DOCTOR
    // ==================================================

    const doctor =
      await User.create({
        fullName:
          doctorName,

        email:
          doctorEmail.toLowerCase(),

        password:
          hashedPassword,

        role:
          "doctor",
      });

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "========================================"
    );

    console.log(
      "Demo doctor created successfully."
    );

    console.log(
      "========================================"
    );

    console.log(
      "Doctor ID:",
      doctor._id.toString()
    );

    console.log(
      "Name:",
      doctor.fullName
    );

    console.log(
      "Email:",
      doctor.email
    );

    console.log(
      "Password:",
      doctorPassword
    );

    console.log(
      "Role:",
      doctor.role
    );

    console.log(
      "========================================"
    );

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "CREATE DOCTOR ERROR:",
      error
    );

    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect error
    }

    process.exit(1);
  }
};

// ======================================================
// RUN SCRIPT
// ======================================================

createDoctor();