import type {
  Request,
  Response,
} from "express";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/User.js";

// ======================================================
// GET ALL DOCTORS
// ======================================================

export const getAllDoctors = async (
  req: Request,
  res: Response
) => {
  try {
    const doctors =
      await User.find({
        role: "doctor",
      })
        .select(
          "_id fullName email role specialization createdAt"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      doctors,
    });
  } catch (error) {
    console.error(
      "GET DOCTORS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load doctors.",
    });
  }
};

// ======================================================
// CREATE DOCTOR
// ======================================================

export const createDoctor = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      fullName,
      email,
      password,
      specialization,
    } = req.body ?? {};

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !fullName ||
      !email ||
      !password ||
      !specialization
    ) {
      return res.status(400).json({
        message:
          "Full name, email, password and specialization are required.",
      });
    }

    const cleanFullName =
      String(fullName).trim();

    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase();

    const cleanPassword =
      String(password);

    const cleanSpecialization =
      String(
        specialization
      ).trim();

    // ==================================================
    // NAME VALIDATION
    // ==================================================

    if (
      cleanFullName.length < 2
    ) {
      return res.status(400).json({
        message:
          "Doctor name must contain at least 2 characters.",
      });
    }

    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid email address.",
      });
    }

    // ==================================================
    // PASSWORD VALIDATION
    // ==================================================

    if (
      cleanPassword.length < 6
    ) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters.",
      });
    }

    // ==================================================
    // SPECIALIZATION VALIDATION
    // ==================================================

    if (
      cleanSpecialization.length <
      2
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid specialization.",
      });
    }

    // ==================================================
    // CHECK EXISTING EMAIL
    // ==================================================

    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    // ==================================================
    // HASH PASSWORD
    // ==================================================

    const hashedPassword =
      await bcrypt.hash(
        cleanPassword,
        10
      );

    // ==================================================
    // CREATE DOCTOR
    // ==================================================

    const doctor =
      await User.create({
        fullName:
          cleanFullName,

        email:
          cleanEmail,

        password:
          hashedPassword,

        role:
          "doctor",

        specialization:
          cleanSpecialization,
      });

    return res.status(201).json({
      message:
        "Doctor account created successfully.",

      doctor: {
        _id:
          doctor._id,

        fullName:
          doctor.fullName,

        email:
          doctor.email,

        role:
          doctor.role,

        specialization:
          doctor.specialization,

        createdAt:
          doctor.createdAt,
      },
    });
  } catch (error: any) {
    console.error(
      "CREATE DOCTOR ERROR:",
      error
    );

    // ==================================================
    // DUPLICATE EMAIL
    // ==================================================

    if (
      error?.code === 11000
    ) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    // ==================================================
    // MONGOOSE VALIDATION ERROR
    // ==================================================

    if (
      error?.name ===
      "ValidationError"
    ) {
      const messages =
        Object.values(
          error.errors || {}
        )
          .map(
            (item: any) =>
              item.message
          )
          .filter(Boolean);

      return res.status(400).json({
        message:
          messages.join(", ") ||
          "Invalid doctor information.",
      });
    }

    return res.status(500).json({
      message:
        "Unable to create doctor account.",
    });
  }
};

// ======================================================
// DELETE DOCTOR
// ======================================================

export const deleteDoctor = async (
  req: Request,
  res: Response
) => {
  try {
    const rawDoctorId =
      req.params.id;

    const doctorId =
      Array.isArray(rawDoctorId)
        ? rawDoctorId[0]
        : rawDoctorId;

    // ==================================================
    // VALIDATE DOCTOR ID
    // ==================================================

    if (
      !doctorId ||
      !mongoose.Types.ObjectId.isValid(
        doctorId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid doctor ID.",
      });
    }

    // ==================================================
    // FIND DOCTOR
    // ==================================================

    const doctor =
      await User.findOne({
        _id: doctorId,
        role: "doctor",
      });

    if (!doctor) {
      return res.status(404).json({
        message:
          "Doctor not found.",
      });
    }

    // ==================================================
    // DELETE DOCTOR
    // ==================================================

    await User.deleteOne({
      _id: doctorId,
    });

    return res.status(200).json({
      message:
        "Doctor deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE DOCTOR ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to delete doctor.",
    });
  }
};