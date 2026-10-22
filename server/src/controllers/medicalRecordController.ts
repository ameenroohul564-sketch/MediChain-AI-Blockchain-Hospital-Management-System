import type {
  Response,
} from "express";

import crypto from "crypto";
import mongoose from "mongoose";

import MedicalRecord from "../models/MedicalRecord.js";
import User from "../models/User.js";

import type {
  AuthRequest,
} from "../middleware/authMiddleware.js";

import {
  storeRecordHashOnBlockchain,
  verifyRecordHashOnBlockchain,
  getRecordBlockchainHistory,
} from "../services/blockchainService.js";

// ======================================================
// GENERATE SHA-256 HASH
// ======================================================

const generateMedicalRecordHash = (
  patientId: string,
  doctorId: string,
  diagnosis: string,
  prescription: string,
  notes: string
): string => {
  const data = [
    patientId.trim(),
    doctorId.trim(),
    diagnosis.trim(),
    prescription.trim(),
    notes.trim(),
  ].join("|");

  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
};

// ======================================================
// NORMALIZE ROUTE PARAM
// ======================================================

const normalizeParam = (
  value: string | string[] | undefined
): string => {
  if (!value) {
    return "";
  }

  return Array.isArray(value)
    ? value[0] || ""
    : value;
};

// ======================================================
// CREATE MEDICAL RECORD
// ======================================================

export const createMedicalRecord =
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
            "Only doctors can create medical records.",
        });
      }

      const {
        patient,
        diagnosis,
        prescription,
        notes,
      } = req.body ?? {};

      if (
        !patient ||
        !mongoose.Types.ObjectId.isValid(
          String(patient)
        )
      ) {
        return res.status(400).json({
          message:
            "Valid patient ID is required.",
        });
      }

      if (
        !diagnosis ||
        !String(
          diagnosis
        ).trim()
      ) {
        return res.status(400).json({
          message:
            "Diagnosis is required.",
        });
      }

      if (
        !prescription ||
        !String(
          prescription
        ).trim()
      ) {
        return res.status(400).json({
          message:
            "Prescription is required.",
        });
      }

      const patientId =
        String(patient).trim();

      const doctorId =
        req.user.id;

      const cleanDiagnosis =
        String(
          diagnosis
        ).trim();

      const cleanPrescription =
        String(
          prescription
        ).trim();

      const cleanNotes =
        notes
          ? String(
              notes
            ).trim()
          : "";

      const patientUser =
        await User.findOne({
          _id: patientId,
          role: "patient",
        }).select(
          "_id fullName email role"
        );

      if (!patientUser) {
        return res.status(404).json({
          message:
            "Patient account not found.",
        });
      }

      const recordHash =
        generateMedicalRecordHash(
          patientId,
          doctorId,
          cleanDiagnosis,
          cleanPrescription,
          cleanNotes
        );

      const medicalRecord =
        await MedicalRecord.create({
          patient:
            patientId,

          doctor:
            doctorId,

          diagnosis:
            cleanDiagnosis,

          prescription:
            cleanPrescription,

          notes:
            cleanNotes,

          recordHash,

          auditHistory: [],
        });

      try {
        const blockchainResult =
          await storeRecordHashOnBlockchain(
            medicalRecord._id.toString(),
            recordHash
          );

        const populatedRecord =
          await MedicalRecord.findById(
            medicalRecord._id
          )
            .populate(
              "patient",
              "_id fullName email role"
            )
            .populate(
              "doctor",
              "_id fullName email role specialization"
            );

        return res.status(201).json({
          message:
            "Medical record created and secured on blockchain successfully.",

          medicalRecord:
            populatedRecord,

          blockchain: {
            secured: true,

            transactionHash:
              blockchainResult.transactionHash,

            blockNumber:
              blockchainResult.blockNumber,

            version: 1,
          },
        });
      } catch (
        blockchainError
      ) {
        console.error(
          "BLOCKCHAIN STORE ERROR:",
          blockchainError
        );

        await MedicalRecord.findByIdAndDelete(
          medicalRecord._id
        );

        return res.status(503).json({
          message:
            "Blockchain ledger is unavailable. Medical record was not saved.",
        });
      }
    } catch (error) {
      console.error(
        "CREATE MEDICAL RECORD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to create medical record.",
      });
    }
  };

// ======================================================
// GET MEDICAL RECORDS
// ======================================================

export const getMedicalRecords =
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

      const filter:
        Record<string, unknown> =
          {};

      if (
        req.user.role ===
        "patient"
      ) {
        filter.patient =
          req.user.id;
      }

      if (
        req.user.role ===
        "doctor"
      ) {
        filter.doctor =
          req.user.id;
      }

      const records =
        await MedicalRecord.find(
          filter
        )
          .populate(
            "patient",
            "_id fullName email role"
          )
          .populate(
            "doctor",
            "_id fullName email role specialization"
          )
          .populate(
            "auditHistory.changedBy",
            "_id fullName email role"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        medicalRecords:
          records,
      });
    } catch (error) {
      console.error(
        "GET MEDICAL RECORDS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load medical records.",
      });
    }
  };

// ======================================================
// UPDATE MEDICAL RECORD
// ======================================================

export const updateMedicalRecord =
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
            "Only doctors can update medical records.",
        });
      }

      const recordId =
        normalizeParam(
          req.params.id
        );

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

      const record =
        await MedicalRecord.findById(
          recordId
        );

      if (!record) {
        return res.status(404).json({
          message:
            "Medical record not found.",
        });
      }

      // Only the doctor who created it can update it
      if (
        record.doctor.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You can only update medical records created by you.",
        });
      }

      const {
        diagnosis,
        prescription,
        notes,
        reason,
      } = req.body ?? {};

      const nextDiagnosis =
        diagnosis !== undefined
          ? String(
              diagnosis
            ).trim()
          : record.diagnosis;

      const nextPrescription =
        prescription !== undefined
          ? String(
              prescription
            ).trim()
          : record.prescription;

      const nextNotes =
        notes !== undefined
          ? String(
              notes
            ).trim()
          : record.notes || "";

      const changeReason =
        reason
          ? String(
              reason
            ).trim()
          : "Medical record updated by doctor.";

      if (!nextDiagnosis) {
        return res.status(400).json({
          message:
            "Diagnosis cannot be empty.",
        });
      }

      if (!nextPrescription) {
        return res.status(400).json({
          message:
            "Prescription cannot be empty.",
        });
      }

      const patientId =
        record.patient.toString();

      const doctorId =
        record.doctor.toString();

      const oldHash =
        record.recordHash;

      const newHash =
        generateMedicalRecordHash(
          patientId,
          doctorId,
          nextDiagnosis,
          nextPrescription,
          nextNotes
        );

      // Nothing actually changed
      if (
        oldHash === newHash
      ) {
        return res.status(400).json({
          message:
            "No changes were detected in the medical record.",
        });
      }

      // ==================================================
      // FIRST STORE NEW VERSION ON BLOCKCHAIN
      // ==================================================

      let blockchainResult;

      try {
        blockchainResult =
          await storeRecordHashOnBlockchain(
            recordId,
            newHash
          );
      } catch (
        blockchainError
      ) {
        console.error(
          "BLOCKCHAIN UPDATE ERROR:",
          blockchainError
        );

        return res.status(503).json({
          message:
            "Blockchain ledger is unavailable. Medical record update was cancelled.",
        });
      }

      // ==================================================
      // THEN UPDATE MONGODB + AUDIT HISTORY
      // ==================================================

      record.diagnosis =
        nextDiagnosis;

      record.prescription =
        nextPrescription;

      record.notes =
        nextNotes;

      record.recordHash =
        newHash;

      record.auditHistory.push({
        oldHash,

        newHash,

        changedBy:
          new mongoose.Types.ObjectId(
            req.user.id
          ),

        changedAt:
          new Date(),

        reason:
          changeReason,
      });

      await record.save();

      const updatedRecord =
        await MedicalRecord.findById(
          recordId
        )
          .populate(
            "patient",
            "_id fullName email role"
          )
          .populate(
            "doctor",
            "_id fullName email role specialization"
          )
          .populate(
            "auditHistory.changedBy",
            "_id fullName email role"
          );

      const blockchainHistory =
        await getRecordBlockchainHistory(
          recordId
        );

      return res.status(200).json({
        message:
          "Medical record updated and new blockchain version stored successfully.",

        medicalRecord:
          updatedRecord,

        blockchain: {
          transactionHash:
            blockchainResult.transactionHash,

          blockNumber:
            blockchainResult.blockNumber,

          version:
            blockchainHistory.length,
        },
      });
    } catch (error) {
      console.error(
        "UPDATE MEDICAL RECORD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update medical record.",
      });
    }
  };

// ======================================================
// VERIFY MEDICAL RECORD
// ======================================================

export const verifyMedicalRecord =
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

      const recordId =
        normalizeParam(
          req.params.id
        );

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

      const record =
        await MedicalRecord.findById(
          recordId
        );

      if (!record) {
        return res.status(404).json({
          message:
            "Medical record not found.",
        });
      }

      const patientId =
        record.patient.toString();

      const doctorId =
        record.doctor.toString();

      if (
        req.user.role ===
          "patient" &&
        patientId !==
          req.user.id
      ) {
        return res.status(403).json({
          message:
            "You cannot verify another patient's medical record.",
        });
      }

      if (
        req.user.role ===
          "doctor" &&
        doctorId !==
          req.user.id
      ) {
        return res.status(403).json({
          message:
            "You cannot verify a medical record created by another doctor.",
        });
      }

      const currentHash =
        generateMedicalRecordHash(
          patientId,
          doctorId,
          record.diagnosis,
          record.prescription,
          record.notes || ""
        );

      try {
        const blockchainResult =
          await verifyRecordHashOnBlockchain(
            recordId,
            currentHash
          );

        if (
          blockchainResult.verified
        ) {
          return res.status(200).json({
            verified: true,

            message:
              "Medical record integrity verified successfully.",

            integrityStatus:
              "UNCHANGED",

            currentHash:
              blockchainResult.currentHash,

            blockchainHash:
              blockchainResult.blockchainHash,

            blockchain: {
              timestamp:
                blockchainResult.timestamp,

              storedBy:
                blockchainResult.storedBy,

              versionCount:
                blockchainResult.versionCount,
            },
          });
        }

        return res.status(200).json({
          verified: false,

          message:
            blockchainResult.reason,

          integrityStatus:
            "TAMPER_DETECTED",

          currentHash:
            blockchainResult.currentHash,

          blockchainHash:
            blockchainResult.blockchainHash,

          blockchain: {
            timestamp:
              blockchainResult.timestamp,

            storedBy:
              blockchainResult.storedBy,

            versionCount:
              blockchainResult.versionCount,
          },
        });
      } catch (
        blockchainError
      ) {
        console.error(
          "BLOCKCHAIN VERIFY ERROR:",
          blockchainError
        );

        return res.status(503).json({
          verified: false,

          message:
            "Blockchain ledger is currently unavailable. Integrity verification could not be completed.",
        });
      }
    } catch (error) {
      console.error(
        "VERIFY MEDICAL RECORD ERROR:",
        error
      );

      return res.status(500).json({
        verified: false,

        message:
          "Unable to verify medical record integrity.",
      });
    }
  };

// ======================================================
// GET AUDIT / VERSION HISTORY
// ======================================================

export const getMedicalRecordHistory =
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

      const recordId =
        normalizeParam(
          req.params.id
        );

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

      const record =
        await MedicalRecord.findById(
          recordId
        )
          .populate(
            "patient",
            "_id fullName email role"
          )
          .populate(
            "doctor",
            "_id fullName email role specialization"
          )
          .populate(
            "auditHistory.changedBy",
            "_id fullName email role"
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
        "_id" in record.patient
          ? String(
              record.patient._id
            )
          : String(
              record.patient
            );

      const doctorId =
        typeof record.doctor ===
          "object" &&
        "_id" in record.doctor
          ? String(
              record.doctor._id
            )
          : String(
              record.doctor
            );

      if (
        req.user.role ===
          "patient" &&
        patientId !==
          req.user.id
      ) {
        return res.status(403).json({
          message:
            "You cannot view another patient's audit history.",
        });
      }

      if (
        req.user.role ===
          "doctor" &&
        doctorId !==
          req.user.id
      ) {
        return res.status(403).json({
          message:
            "You cannot view audit history for another doctor's record.",
        });
      }

      let blockchainHistory = [];

      try {
        blockchainHistory =
          await getRecordBlockchainHistory(
            recordId
          );
      } catch (
        blockchainError
      ) {
        console.error(
          "BLOCKCHAIN HISTORY ERROR:",
          blockchainError
        );

        return res.status(503).json({
          message:
            "Blockchain history is currently unavailable.",
        });
      }

      return res.status(200).json({
        medicalRecordId:
          recordId,

        mongoAuditHistory:
          record.auditHistory,

        blockchainHistory,

        currentHash:
          record.recordHash,

        totalVersions:
          blockchainHistory.length,
      });
    } catch (error) {
      console.error(
        "GET RECORD HISTORY ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load medical record history.",
      });
    }
  };

// ======================================================
// COMPATIBILITY ALIAS
// ======================================================

export const verifyMedicalRecordIntegrity =
  verifyMedicalRecord;