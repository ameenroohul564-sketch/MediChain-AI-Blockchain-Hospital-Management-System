import type { Response } from "express";

import type {
  AuthRequest,
} from "../middleware/authMiddleware.js";

// ======================================================
// TYPES
// ======================================================

type Priority =
  | "Low"
  | "Medium"
  | "High";

type SymptomProgress =
  | "Better"
  | "Worse"
  | "No change";

interface AssessmentRequest {
  mainConcern?: string;

  symptomDuration?: string;

  severity?: number;

  additionalSymptoms?: string[];

  symptomProgress?: SymptomProgress;

  existingConditions?: string[];

  currentMedications?: string;

  allergies?: string;

  emergencySymptoms?: string[];

  followUpAnswers?: Record<
    string,
    string | string[] | boolean | number
  >;
}

// ======================================================
// SPELLING / NORMALIZATION
// ======================================================

const normalizeText = (
  value: string
): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeConcern = (
  value: string
): string => {
  const text =
    normalizeText(value);

  const mappings: Array<{
    words: string[];
    value: string;
  }> = [
    {
      words: [
        "fever",
        "fevr",
        "fewer",
        "temperature",
      ],
      value: "Fever",
    },

    {
      words: [
        "cough",
        "cuf",
        "coughing",
        "cold",
        "sneezing",
      ],
      value: "Cough / Cold",
    },

    {
      words: [
        "headache",
        "head ache",
        "hedache",
        "head pain",
        "migraine",
      ],
      value: "Headache",
    },

    {
      words: [
        "stomach",
        "stomak",
        "stomach pain",
        "abdomen",
        "abdominal",
        "gastric",
      ],
      value: "Stomach Problem",
    },

    {
      words: [
        "chest",
        "chest pain",
        "heart",
        "palpitation",
      ],
      value: "Chest Problem",
    },

    {
      words: [
        "skin",
        "rash",
        "itch",
        "itching",
        "redness",
      ],
      value: "Skin Problem",
    },

    {
      words: [
        "joint",
        "joint pain",
        "body pain",
        "back pain",
        "knee",
        "bone",
        "injury",
      ],
      value: "Joint / Body Pain",
    },

    {
      words: [
        "ear",
        "nose",
        "throat",
        "ent",
      ],
      value: "ENT Problem",
    },

    {
      words: [
        "stress",
        "anxiety",
        "depression",
        "sleep",
        "mental",
      ],
      value: "Mental Health Concern",
    },
  ];

  for (
    const mapping of mappings
  ) {
    if (
      mapping.words.some(
        (word) =>
          text.includes(word)
      )
    ) {
      return mapping.value;
    }
  }

  return value.trim();
};

// ======================================================
// DEPARTMENT
// ======================================================

const determineDepartment = (
  mainConcern: string,
  additionalSymptoms: string[]
): string => {
  const text = normalizeText(
    [
      mainConcern,
      ...additionalSymptoms,
    ].join(" ")
  );

  if (
    text.includes("chest") ||
    text.includes("heart")
  ) {
    return "Cardiology";
  }

  if (
    text.includes("skin") ||
    text.includes("rash") ||
    text.includes("itch")
  ) {
    return "Dermatology";
  }

  if (
    text.includes("joint") ||
    text.includes("body pain") ||
    text.includes("back pain") ||
    text.includes("knee") ||
    text.includes("injury")
  ) {
    return "Orthopedics";
  }

  if (
    text.includes("headache") ||
    text.includes("migraine") ||
    text.includes("numbness")
  ) {
    return "Neurology";
  }

  if (
    text.includes("ear") ||
    text.includes("nose") ||
    text.includes("throat")
  ) {
    return "ENT";
  }

  if (
    text.includes("stress") ||
    text.includes("anxiety") ||
    text.includes("depression") ||
    text.includes("mental")
  ) {
    return "Psychiatry";
  }

  return "General Medicine";
};

// ======================================================
// PRIORITY
// ======================================================

const determinePriority = (
  severity: number,
  symptomProgress: SymptomProgress,
  additionalSymptoms: string[],
  emergencySymptoms: string[]
): Priority => {
  const urgentSymptoms =
    emergencySymptoms.filter(
      (item) =>
        normalizeText(item) !==
        "none"
    );

  if (
    urgentSymptoms.length > 0
  ) {
    return "High";
  }

  const symptomText =
    normalizeText(
      additionalSymptoms.join(
        " "
      )
    );

  if (
    severity >= 8 ||
    symptomText.includes(
      "breathing difficulty"
    ) ||
    symptomText.includes(
      "chest discomfort"
    )
  ) {
    return "High";
  }

  if (
    severity >= 5 ||
    symptomProgress ===
      "Worse" ||
    symptomText.includes(
      "fever"
    ) ||
    symptomText.includes(
      "vomiting"
    ) ||
    symptomText.includes(
      "dizziness"
    )
  ) {
    return "Medium";
  }

  return "Low";
};

// ======================================================
// SIMPLE SUMMARY
// ======================================================

const generateSummary = (
  mainConcern: string,
  symptomDuration: string,
  severity: number,
  additionalSymptoms: string[],
  symptomProgress: SymptomProgress,
  existingConditions: string[],
  currentMedications: string,
  allergies: string
): string => {
  const symptoms =
    additionalSymptoms.length > 0
      ? additionalSymptoms.join(
          ", "
        )
      : "No additional symptoms";

  const conditions =
    existingConditions.length > 0
      ? existingConditions.join(
          ", "
        )
      : "None reported";

  return [
    `Main concern: ${mainConcern}.`,
    `Duration: ${symptomDuration}.`,
    `Severity: ${severity}/10.`,
    `Additional symptoms: ${symptoms}.`,
    `Progress: ${symptomProgress}.`,
    `Existing conditions: ${conditions}.`,
    `Current medicines: ${
      currentMedications ||
      "None reported"
    }.`,
    `Allergies: ${
      allergies ||
      "None reported"
    }.`,
  ].join(" ");
};

// ======================================================
// GET QUESTIONNAIRE
// ======================================================

export const getQuestionnaire =
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

      return res.status(200).json({
        title:
          "AI Pre-Consultation Assistant",

        description:
          "Select the options that best describe your current health problem.",

        mainConcernOptions: [
          "Fever",
          "Cough / Cold",
          "Headache",
          "Stomach Problem",
          "Chest Problem",
          "Skin Problem",
          "Joint / Body Pain",
          "ENT Problem",
          "Mental Health Concern",
          "Other",
        ],

        durationOptions: [
          "Today",
          "1–3 days",
          "4–7 days",
          "More than 1 week",
          "Long-term",
        ],

        severityOptions: [
          {
            label: "Mild",
            value: 3,
          },
          {
            label: "Moderate",
            value: 6,
          },
          {
            label: "Severe",
            value: 9,
          },
        ],

        progressOptions: [
          "Better",
          "No change",
          "Worse",
        ],

        additionalSymptomOptions: [
          "Fever",
          "Cough",
          "Vomiting",
          "Dizziness",
          "Weakness",
          "Breathing difficulty",
          "Chest discomfort",
          "Swelling",
          "Skin rash",
          "Body pain",
          "Loss of appetite",
          "None",
        ],

        conditionOptions: [
          "Diabetes",
          "High Blood Pressure",
          "Asthma",
          "Heart Condition",
          "Thyroid",
          "None",
        ],

        emergencyOptions: [
          "Severe breathing difficulty",
          "Severe chest pain",
          "Heavy bleeding",
          "Fainting",
          "Loss of consciousness",
          "Sudden weakness or numbness",
          "None",
        ],

        disclaimer:
          "This assistant supports pre-consultation only and does not provide a medical diagnosis.",
      });
    } catch (error) {
      console.error(
        "GET AI QUESTIONNAIRE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to load questionnaire.",
      });
    }
  };

// ======================================================
// ASSESS SYMPTOMS
// ======================================================

export const assessSymptoms =
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

      const body =
        req.body as AssessmentRequest;

      const rawMainConcern =
        typeof body.mainConcern ===
        "string"
          ? body.mainConcern.trim()
          : "";

      if (!rawMainConcern) {
        return res.status(400).json({
          message:
            "Please select your main health problem.",
        });
      }

      const mainConcern =
        normalizeConcern(
          rawMainConcern
        );

      const symptomDuration =
        typeof body.symptomDuration ===
        "string"
          ? body.symptomDuration.trim()
          : "";

      if (!symptomDuration) {
        return res.status(400).json({
          message:
            "Please select when the problem started.",
        });
      }

      const rawSeverity =
        Number(
          body.severity ?? 3
        );

      const severity =
        Number.isFinite(
          rawSeverity
        )
          ? Math.min(
              10,
              Math.max(
                0,
                rawSeverity
              )
            )
          : 3;

      const additionalSymptoms =
        Array.isArray(
          body.additionalSymptoms
        )
          ? body.additionalSymptoms
              .filter(
                (item) =>
                  typeof item ===
                  "string"
              )
              .map(
                (item) =>
                  item.trim()
              )
              .filter(Boolean)
          : [];

      const symptomProgress:
        SymptomProgress =
          body.symptomProgress ===
            "Better" ||
          body.symptomProgress ===
            "Worse" ||
          body.symptomProgress ===
            "No change"
            ? body.symptomProgress
            : "No change";

      const existingConditions =
        Array.isArray(
          body.existingConditions
        )
          ? body.existingConditions
              .filter(
                (item) =>
                  typeof item ===
                  "string"
              )
              .map(
                (item) =>
                  item.trim()
              )
              .filter(
                (item) =>
                  item.toLowerCase() !==
                  "none"
              )
          : [];

      const currentMedications =
        typeof body.currentMedications ===
        "string"
          ? body.currentMedications.trim()
          : "";

      const allergies =
        typeof body.allergies ===
        "string"
          ? body.allergies.trim()
          : "";

      const emergencySymptoms =
        Array.isArray(
          body.emergencySymptoms
        )
          ? body.emergencySymptoms
              .filter(
                (item) =>
                  typeof item ===
                  "string"
              )
              .map(
                (item) =>
                  item.trim()
              )
              .filter(Boolean)
          : ["None"];

      // ==================================================
      // SAFETY
      // ==================================================

      const urgentSymptoms =
        emergencySymptoms.filter(
          (item) =>
            normalizeText(item) !==
            "none"
        );

      const urgentCareRequired =
        urgentSymptoms.length > 0;

      // ==================================================
      // RESULT
      // ==================================================

      const suggestedDepartment =
        determineDepartment(
          mainConcern,
          additionalSymptoms
        );

      const priority =
        determinePriority(
          severity,
          symptomProgress,
          additionalSymptoms,
          emergencySymptoms
        );

      const aiSummary =
        generateSummary(
          mainConcern,
          symptomDuration,
          severity,
          additionalSymptoms,
          symptomProgress,
          existingConditions,
          currentMedications,
          allergies
        );

      return res.status(200).json({
        assessment: {
          mainConcern,

          symptomDuration,

          severity,

          additionalSymptoms,

          symptomProgress,

          existingConditions,

          currentMedications,

          allergies,

          emergencySymptoms,

          aiSummary,

          suggestedDepartment,

          priority,

          urgentCareRequired,

          aiAssessmentCompleted:
            true,
        },

        safetyMessage:
          urgentCareRequired
            ? "The selected warning signs may require urgent medical attention. Please seek immediate professional medical care."
            : "No urgent warning signs were selected.",

        disclaimer:
          "This assessment supports pre-consultation only and is not a medical diagnosis.",
      });
    } catch (error) {
      console.error(
        "AI ASSESSMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to complete the pre-consultation assessment.",
      });
    }
  };