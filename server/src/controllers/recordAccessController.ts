import type {
  Response,
} from "express";

import mongoose from "mongoose";

import User from "../models/User.js";

import PatientConsent from "../models/PatientConsent.js";

import RecordAccessLog from "../models/RecordAccessLog.js";

import MedicalRecord from "../models/MedicalRecord.js";

import type {
  AuthRequest,
} from "../middleware/authMiddleware.js";

// ======================================================
// GET PATIENT CONSENTS
// PATIENT CAN SEE WHO HAS ACCESS
// ======================================================

export const getMyConsents =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      if (
        req.user.role !==
        "patient"
      ) {
        return res.status(403).json({
          message:
            "Only patients can view consent settings.",
        });
      }

      const consents =
        await PatientConsent.find({
          patient:
            req.user.id,
        })
          .populate(
            "doctor",
            "_id fullName email specialization role"
          )
          .sort({
            updatedAt: -1,
          });

      return res.status(200).json({
        consents,
      });
    } catch (error) {
      console.error(
        "GET CONSENTS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load consent settings.",
      });
    }
  };

// ======================================================
// GRANT DOCTOR ACCESS
// ======================================================

export const grantDoctorConsent =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      if (
        req.user.role !==
        "patient"
      ) {
        return res.status(403).json({
          message:
            "Only patients can grant record access.",
        });
      }

      const {
        doctorId,
      } = req.body ?? {};

      if (
        !doctorId ||
        !mongoose.Types.ObjectId.isValid(
          String(
            doctorId
          )
        )
      ) {
        return res.status(400).json({
          message:
            "Valid doctor ID is required.",
        });
      }

      // ==================================================
      // VERIFY DOCTOR
      // ==================================================

      const doctor =
        await User.findOne({
          _id:
            String(
              doctorId
            ),

          role:
            "doctor",
        }).select(
          "_id fullName email specialization role"
        );

      if (!doctor) {
        return res.status(404).json({
          message:
            "Doctor not found.",
        });
      }

      // ==================================================
      // CREATE / UPDATE CONSENT
      // ==================================================

      const consent =
        await PatientConsent.findOneAndUpdate(
          {
            patient:
              req.user.id,

            doctor:
              doctor._id,
          },

          {
            $set: {
              granted: true,

              grantedAt:
                new Date(),

              revokedAt:
                null,
            },
          },

          {
            new: true,

            upsert: true,

            runValidators:
              true,

            setDefaultsOnInsert:
              true,
          }
        ).populate(
          "doctor",
          "_id fullName email specialization role"
        );

      return res.status(200).json({
        message:
          "Doctor access granted successfully.",

        consent,
      });
    } catch (error: any) {
      console.error(
        "GRANT CONSENT ERROR:",
        error
      );

      if (
        error?.code === 11000
      ) {
        return res.status(409).json({
          message:
            "Consent already exists for this doctor.",
        });
      }

      return res.status(500).json({
        message:
          "Unable to grant doctor access.",
      });
    }
  };

// ======================================================
// REVOKE DOCTOR ACCESS
// ======================================================

export const revokeDoctorConsent =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      if (
        req.user.role !==
        "patient"
      ) {
        return res.status(403).json({
          message:
            "Only patients can revoke record access.",
        });
      }

      const rawDoctorId =
        req.params.doctorId;

      const doctorId =
        Array.isArray(
          rawDoctorId
        )
          ? rawDoctorId[0]
          : rawDoctorId;

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

      const consent =
        await PatientConsent.findOneAndUpdate(
          {
            patient:
              req.user.id,

            doctor:
              doctorId,
          },

          {
            $set: {
              granted: false,

              revokedAt:
                new Date(),
            },
          },

          {
            new: true,
          }
        ).populate(
          "doctor",
          "_id fullName email specialization role"
        );

      if (!consent) {
        return res.status(404).json({
          message:
            "Consent record not found.",
        });
      }

      return res.status(200).json({
        message:
          "Doctor access revoked successfully.",

        consent,
      });
    } catch (error) {
      console.error(
        "REVOKE CONSENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to revoke doctor access.",
      });
    }
  };

// ======================================================
// CHECK DOCTOR CONSENT
// Used before doctor views patient's medical record
// ======================================================

export const checkDoctorConsent =
  async (
    patientId: string,
    doctorId: string
  ): Promise<boolean> => {
    const consent =
      await PatientConsent.findOne({
        patient:
          patientId,

        doctor:
          doctorId,

        granted:
          true,
      });

    return Boolean(
      consent
    );
  };

// ======================================================
// LOG RECORD ACCESS
// ======================================================

export const logRecordAccess =
  async (
    patientId: string,
    doctorId: string,
    medicalRecordId: string,
    action:
      | "VIEW_RECORD"
      | "VERIFY_RECORD" =
      "VIEW_RECORD"
  ) => {
    await RecordAccessLog.create({
      patient:
        patientId,

      doctor:
        doctorId,

      medicalRecord:
        medicalRecordId,

      action,

      accessedAt:
        new Date(),
    });
  };

// ======================================================
// PATIENT ACCESS HISTORY
// ======================================================

export const getMyAccessLogs =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      if (
        req.user.role !==
        "patient"
      ) {
        return res.status(403).json({
          message:
            "Only patients can view record access history.",
        });
      }

      const logs =
        await RecordAccessLog.find({
          patient:
            req.user.id,
        })
          .populate(
            "doctor",
            "_id fullName email specialization"
          )
          .populate(
            "medicalRecord",
            "_id diagnosis createdAt"
          )
          .sort({
            accessedAt: -1,
          })
          .limit(100);

      return res.status(200).json({
        accessLogs:
          logs,
      });
    } catch (error) {
      console.error(
        "GET ACCESS LOGS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load record access history.",
      });
    }
  };

// ======================================================
// DOCTOR OPEN MEDICAL RECORD
// CONSENT REQUIRED
// ======================================================

export const doctorOpenMedicalRecord =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required.",
        });
      }

      if (
        req.user.role !==
        "doctor"
      ) {
        return res.status(403).json({
          message:
            "Only doctors can access this feature.",
        });
      }

      const rawRecordId =
        req.params.recordId;

      const recordId =
        Array.isArray(
          rawRecordId
        )
          ? rawRecordId[0]
          : rawRecordId;

      if (
        !recordId ||
        !mongoose.Types.ObjectId.isValid(
          recordId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid medical record ID.",
        });
      }

      // ==================================================
      // FIND RECORD
      // ==================================================

      const record =
        await MedicalRecord.findById(
          recordId
        )
          .populate(
            "patient",
            "_id fullName email"
          )
          .populate(
            "doctor",
            "_id fullName email specialization"
          );

      if (!record) {
        return res.status(404).json({
          message:
            "Medical record not found.",
        });
      }

      const patientId =
        typeof record.patient ===
        "object" &&
        "_id" in
          record.patient
          ? String(
              record.patient._id
            )
          : String(
              record.patient
            );

      // ==================================================
      // CHECK CONSENT
      // ==================================================

      const hasConsent =
        await checkDoctorConsent(
          patientId,
          req.user.id
        );

      if (!hasConsent) {
        return res.status(403).json({
          message:
            "Patient consent is required before viewing this medical record.",

          consentRequired:
            true,
        });
      }

      // ==================================================
      // LOG ACCESS
      // ==================================================

      await logRecordAccess(
        patientId,
        req.user.id,
        recordId,
        "VIEW_RECORD"
      );

      return res.status(200).json({
        message:
          "Medical record accessed successfully.",

        medicalRecord:
          record,
      });
    } catch (error) {
      console.error(
        "DOCTOR OPEN RECORD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to open medical record.",
      });
    }
  };