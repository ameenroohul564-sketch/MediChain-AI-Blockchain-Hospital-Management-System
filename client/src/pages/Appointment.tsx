import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

// ======================================================
// TYPES
// ======================================================

interface User {
  _id?: string;
  id?: string;

  fullName: string;
  email: string;

  role:
    | "patient"
    | "doctor"
    | "admin";
}

interface Doctor {
  _id: string;

  fullName: string;
  email: string;

  role: "doctor";

  specialization?: string;
}

type SymptomProgress =
  | "Better"
  | "Worse"
  | "No change";

type Priority =
  | "Low"
  | "Medium"
  | "High";

interface AssessmentResult {
  mainConcern: string;

  symptomDuration: string;

  severity: number;

  additionalSymptoms: string[];

  symptomProgress:
    SymptomProgress;

  existingConditions: string[];

  currentMedications: string;

  allergies: string;

  emergencySymptoms: string[];

  aiSummary: string;

  suggestedDepartment: string;

  priority: Priority;

  urgentCareRequired: boolean;

  aiAssessmentCompleted: boolean;
}

interface ToastState {
  type:
    | "success"
    | "error";

  text: string;
}

// ======================================================
// OPTIONS
// ======================================================

const concernOptions = [
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
];

const durationOptions = [
  "Today",
  "1–3 days",
  "4–7 days",
  "More than 1 week",
  "Long-term",
];

const severityOptions = [
  {
    label: "Mild",
    value: 3,
    text: "Small discomfort",
  },

  {
    label: "Moderate",
    value: 6,
    text: "Noticeable discomfort",
  },

  {
    label: "Severe",
    value: 9,
    text: "Very difficult to manage",
  },
];

const additionalSymptomOptions = [
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
];

const progressOptions:
  SymptomProgress[] = [
    "Better",
    "No change",
    "Worse",
  ];

const conditionOptions = [
  "Diabetes",
  "High Blood Pressure",
  "Asthma",
  "Heart Condition",
  "Thyroid",
  "None",
];

const emergencyOptions = [
  "Severe breathing difficulty",
  "Severe chest pain",
  "Heavy bleeding",
  "Fainting",
  "Loss of consciousness",
  "Sudden weakness or numbness",
  "None",
];

// ======================================================
// COMPONENT
// ======================================================

const Appointment = () => {
  const navigate =
    useNavigate();

  const [user, setUser] =
    useState<User | null>(
      null
    );

  const [doctors, setDoctors] =
    useState<Doctor[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ====================================================
  // QUESTION FLOW
  // ====================================================

  const [step, setStep] =
    useState(1);

  const [
    mainConcern,
    setMainConcern,
  ] = useState("");

  const [
    otherConcern,
    setOtherConcern,
  ] = useState("");

  const [
    symptomDuration,
    setSymptomDuration,
  ] = useState("");

  const [
    severity,
    setSeverity,
  ] =
    useState<number | null>(
      null
    );

  const [
    additionalSymptoms,
    setAdditionalSymptoms,
  ] = useState<string[]>([]);

  const [
    symptomProgress,
    setSymptomProgress,
  ] =
    useState<SymptomProgress | null>(
      null
    );

  const [
    existingConditions,
    setExistingConditions,
  ] = useState<string[]>([]);

  const [
    takesMedication,
    setTakesMedication,
  ] = useState<
    "Yes" | "No" | ""
  >("");

  const [
    currentMedications,
    setCurrentMedications,
  ] = useState("");

  const [
    hasAllergies,
    setHasAllergies,
  ] = useState<
    | "Yes"
    | "No"
    | "Not sure"
    | ""
  >("");

  const [
    allergies,
    setAllergies,
  ] = useState("");

  const [
    emergencySymptoms,
    setEmergencySymptoms,
  ] = useState<string[]>([]);

  // ====================================================
  // ASSESSMENT
  // ====================================================

  const [
    assessment,
    setAssessment,
  ] =
    useState<AssessmentResult | null>(
      null
    );

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  // ====================================================
  // DOCTOR RECOMMENDATION
  // ====================================================

  const [
    selectedDoctor,
    setSelectedDoctor,
  ] = useState("");

  const [
    showDoctorSelector,
    setShowDoctorSelector,
  ] = useState(false);

  // ====================================================
  // BOOKING
  // ====================================================

  const [
    appointmentDate,
    setAppointmentDate,
  ] = useState("");

  const [
    booking,
    setBooking,
  ] = useState(false);

  const [
    toast,
    setToast,
  ] =
    useState<ToastState | null>(
      null
    );

  const totalSteps = 9;

  // ======================================================
  // TOAST
  // ======================================================

  const showToast = (
    type:
      | "success"
      | "error",
    text: string
  ) => {
    setToast({
      type,
      text,
    });

    window.setTimeout(
      () => {
        setToast(null);
      },
      3200
    );
  };

  // ======================================================
  // LOAD USER
  // ======================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    const storedUser =
      localStorage.getItem(
        "user"
      );

    if (
      !token ||
      !storedUser
    ) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }

    try {
      const parsedUser: User =
        JSON.parse(
          storedUser
        );

      if (
        parsedUser.role !==
        "patient"
      ) {
        if (
          parsedUser.role ===
          "doctor"
        ) {
          navigate(
            "/doctor-dashboard",
            {
              replace: true,
            }
          );

          return;
        }

        if (
          parsedUser.role ===
          "admin"
        ) {
          navigate(
            "/admin-dashboard",
            {
              replace: true,
            }
          );

          return;
        }
      }

      setUser(
        parsedUser
      );
    } catch (error) {
      console.error(
        "USER ERROR:",
        error
      );

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    }
  }, [navigate]);

  // ======================================================
  // LOAD DOCTORS
  // ======================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchDoctors =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              "/auth/doctors"
            );

          const doctorData =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data
                  .doctors || [];

          setDoctors(
            doctorData
          );
        } catch (error: any) {
          console.error(
            "GET DOCTORS ERROR:",
            error
          );

          showToast(
            "error",
            error?.response?.data
              ?.message ||
              "Unable to load doctors."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchDoctors();
  }, [user]);

  // ======================================================
  // MATCH DOCTORS WITH AI DEPARTMENT
  // ======================================================

  const matchingDoctors =
    useMemo(() => {
      if (!assessment) {
        return [];
      }

      const department =
        assessment
          .suggestedDepartment
          .trim()
          .toLowerCase();

      return doctors.filter(
        (doctor) => {
          const specialization =
            doctor.specialization
              ?.trim()
              .toLowerCase() ||
            "";

          return (
            specialization ===
            department
          );
        }
      );
    }, [
      assessment,
      doctors,
    ]);

  // ======================================================
  // RECOMMENDED DOCTOR
  // ======================================================

  const recommendedDoctor =
    useMemo(() => {
      if (!assessment) {
        return null;
      }

      if (
        matchingDoctors.length >
        0
      ) {
        return matchingDoctors[0];
      }

      if (
        doctors.length > 0
      ) {
        return doctors[0];
      }

      return null;
    }, [
      assessment,
      matchingDoctors,
      doctors,
    ]);

  // ======================================================
  // AUTO SELECT RECOMMENDED DOCTOR
  // ======================================================

  useEffect(() => {
    if (
      !assessment ||
      !recommendedDoctor
    ) {
      return;
    }

    setSelectedDoctor(
      recommendedDoctor._id
    );

    setShowDoctorSelector(
      false
    );
  }, [
    assessment,
    recommendedDoctor,
  ]);

  // ======================================================
  // PROGRESS
  // ======================================================

  const progress =
    Math.round(
      (step / totalSteps) *
        100
    );

  // ======================================================
  // MULTI SELECT
  // ======================================================

  const toggleItem = (
    value: string,
    _list: string[],
    setter: React.Dispatch<
      React.SetStateAction<
        string[]
      >
    >
  ) => {
    setter(
      (previous) => {
        if (
          value === "None"
        ) {
          return previous.includes(
            "None"
          )
            ? []
            : ["None"];
        }

        const withoutNone =
          previous.filter(
            (item) =>
              item !== "None"
          );

        if (
          withoutNone.includes(
            value
          )
        ) {
          return withoutNone.filter(
            (item) =>
              item !== value
          );
        }

        return [
          ...withoutNone,
          value,
        ];
      }
    );

    setAssessment(null);
  };

  // ======================================================
  // STEP VALIDATION
  // ======================================================

  const canContinue =
    (): boolean => {
      if (step === 1) {
        if (
          mainConcern ===
            "Other" &&
          !otherConcern.trim()
        ) {
          return false;
        }

        return Boolean(
          mainConcern
        );
      }

      if (step === 2) {
        return Boolean(
          symptomDuration
        );
      }

      if (step === 3) {
        return (
          severity !== null
        );
      }

      if (step === 4) {
        return (
          additionalSymptoms
            .length > 0
        );
      }

      if (step === 5) {
        return Boolean(
          symptomProgress
        );
      }

      if (step === 6) {
        return (
          existingConditions
            .length > 0
        );
      }

      if (step === 7) {
        if (
          takesMedication ===
          "Yes"
        ) {
          return Boolean(
            currentMedications.trim()
          );
        }

        return Boolean(
          takesMedication
        );
      }

      if (step === 8) {
        if (
          hasAllergies ===
          "Yes"
        ) {
          return Boolean(
            allergies.trim()
          );
        }

        return Boolean(
          hasAllergies
        );
      }

      if (step === 9) {
        return (
          emergencySymptoms
            .length > 0
        );
      }

      return false;
    };

  // ======================================================
  // NEXT
  // ======================================================

  const handleNext =
    async () => {
      if (
        !canContinue()
      ) {
        showToast(
          "error",
          "Please select an answer to continue."
        );

        return;
      }

      if (
        step < totalSteps
      ) {
        setStep(
          (previous) =>
            previous + 1
        );

        return;
      }

      await runAssessment();
    };

  // ======================================================
  // BACK
  // ======================================================

  const handleBack = () => {
    if (step > 1) {
      setStep(
        (previous) =>
          previous - 1
      );

      return;
    }

    navigate(
      "/dashboard"
    );
  };

  // ======================================================
  // AI ASSESSMENT
  // ======================================================

  const runAssessment =
    async () => {
      try {
        setAnalyzing(true);

        const finalConcern =
          mainConcern ===
          "Other"
            ? otherConcern.trim()
            : mainConcern;

        const medicationText =
          takesMedication ===
          "Yes"
            ? currentMedications.trim()
            : "None";

        const allergyText =
          hasAllergies ===
          "Yes"
            ? allergies.trim()
            : hasAllergies ===
                "Not sure"
              ? "Not sure"
              : "None";

        const response =
          await api.post(
            "/ai/assess",
            {
              mainConcern:
                finalConcern,

              symptomDuration,

              severity,

              additionalSymptoms,

              symptomProgress,

              existingConditions,

              currentMedications:
                medicationText,

              allergies:
                allergyText,

              emergencySymptoms,
            }
          );

        setAssessment(
          response.data
            .assessment
        );

        showToast(
          "success",
          "Pre-consultation assessment completed."
        );
      } catch (error: any) {
        console.error(
          "AI ASSESSMENT ERROR:",
          error
        );

        showToast(
          "error",
          error?.response?.data
            ?.message ||
            "Unable to analyze your responses."
        );
      } finally {
        setAnalyzing(false);
      }
    };

  // ======================================================
  // MINIMUM DATE
  // ======================================================

  const minimumDate =
    useMemo(() => {
      const now =
        new Date();

      now.setMinutes(
        now.getMinutes() -
          now.getTimezoneOffset()
      );

      return now
        .toISOString()
        .slice(0, 16);
    }, []);

  // ======================================================
  // SELECTED DOCTOR OBJECT
  // ======================================================

  const selectedDoctorData =
    useMemo(() => {
      return (
        doctors.find(
          (doctor) =>
            doctor._id ===
            selectedDoctor
        ) || null
      );
    }, [
      doctors,
      selectedDoctor,
    ]);

  // ======================================================
  // BOOK APPOINTMENT
  // ======================================================

  const bookAppointment =
    async (
      event: React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (!assessment) {
        return;
      }

      if (
        assessment
          .urgentCareRequired
      ) {
        showToast(
          "error",
          "Please seek immediate professional medical attention."
        );

        return;
      }

      if (
        !selectedDoctor
      ) {
        showToast(
          "error",
          "No doctor is available for this appointment."
        );

        return;
      }

      if (
        !appointmentDate
      ) {
        showToast(
          "error",
          "Please select appointment date and time."
        );

        return;
      }

      try {
        setBooking(true);

        await api.post(
          "/appointments",
          {
            doctor:
              selectedDoctor,

            appointmentDate,

            reason:
              assessment
                .mainConcern,

            mainConcern:
              assessment
                .mainConcern,

            symptoms:
              assessment
                .additionalSymptoms,

            symptomDuration:
              assessment
                .symptomDuration,

            painLevel:
              assessment
                .severity,

            severity:
              assessment
                .severity,

            additionalSymptoms:
              assessment
                .additionalSymptoms,

            symptomProgress:
              assessment
                .symptomProgress,

            existingConditions:
              assessment
                .existingConditions
                .length > 0
                ? assessment
                    .existingConditions
                    .join(", ")
                : "None",

            currentMedications:
              assessment
                .currentMedications,

            allergies:
              assessment
                .allergies,

            emergencySymptoms:
              assessment
                .emergencySymptoms,

            aiSummary:
              assessment
                .aiSummary,

            suggestedDepartment:
              assessment
                .suggestedDepartment,

            priority:
              assessment
                .priority,

            urgentCareRequired:
              assessment
                .urgentCareRequired,

            aiAssessmentCompleted:
              true,
          }
        );

        showToast(
          "success",
          "Appointment booked successfully."
        );

        window.setTimeout(
          () => {
            navigate(
              "/my-appointments"
            );
          },
          900
        );
      } catch (error: any) {
        console.error(
          "BOOK ERROR:",
          error
        );

        showToast(
          "error",
          error?.response?.data
            ?.message ||
            "Unable to book appointment."
        );
      } finally {
        setBooking(false);
      }
    };

  // ======================================================
  // LOADING
  // ======================================================

  if (
    !user ||
    loading
  ) {
    return (
      <div className="app-page patient-portal-page">
        <div className="doctor-loading-box">
          <div className="loading-spinner"></div>

          <h3>
            Preparing Assistant
          </h3>

          <p>
            Loading appointment
            services...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // QUESTION VIEW
  // ======================================================

  const renderQuestion =
    () => {
      if (step === 1) {
        return (
          <>
            <span className="ai-simple-category">
              MAIN PROBLEM
            </span>

            <h2>
              What health problem
              are you having today?
            </h2>

            <p className="ai-simple-help">
              Select the option that
              best matches your
              problem.
            </p>

            <div className="ai-simple-option-grid">
              {concernOptions.map(
                (option) => (
                  <button
                    type="button"
                    key={option}
                    className={
                      mainConcern ===
                      option
                        ? "ai-simple-option ai-simple-option-active"
                        : "ai-simple-option"
                    }
                    onClick={() => {
                      setMainConcern(
                        option
                      );

                      setAssessment(
                        null
                      );
                    }}
                  >
                    {option}
                  </button>
                )
              )}
            </div>

            {mainConcern ===
              "Other" && (
              <div className="ai-simple-other">
                <label>
                  Tell us briefly
                  what problem you
                  have
                </label>

                <input
                  className="form-control"
                  value={
                    otherConcern
                  }
                  onChange={(
                    event
                  ) =>
                    setOtherConcern(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Example: eye pain"
                />
              </div>
            )}
          </>
        );
      }

      if (step === 2) {
        return (
          <>
            <span className="ai-simple-category">
              DURATION
            </span>

            <h2>
              When did the problem
              start?
            </h2>

            <div className="ai-simple-option-grid">
              {durationOptions.map(
                (option) => (
                  <button
                    type="button"
                    key={option}
                    className={
                      symptomDuration ===
                      option
                        ? "ai-simple-option ai-simple-option-active"
                        : "ai-simple-option"
                    }
                    onClick={() =>
                      setSymptomDuration(
                        option
                      )
                    }
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </>
        );
      }

      if (step === 3) {
        return (
          <>
            <span className="ai-simple-category">
              SEVERITY
            </span>

            <h2>
              How bad is the
              problem now?
            </h2>

            <p className="ai-simple-help">
              Choose the closest
              option.
            </p>

            <div className="ai-severity-option-grid">
              {severityOptions.map(
                (option) => (
                  <button
                    type="button"
                    key={
                      option.label
                    }
                    className={
                      severity ===
                      option.value
                        ? "ai-severity-option ai-severity-option-active"
                        : "ai-severity-option"
                    }
                    onClick={() =>
                      setSeverity(
                        option.value
                      )
                    }
                  >
                    <strong>
                      {
                        option.label
                      }
                    </strong>

                    <span>
                      {
                        option.text
                      }
                    </span>
                  </button>
                )
              )}
            </div>
          </>
        );
      }

      if (step === 4) {
        return (
          <>
            <span className="ai-simple-category">
              OTHER SYMPTOMS
            </span>

            <h2>
              Do you have any of
              these symptoms?
            </h2>

            <p className="ai-simple-help">
              You can select more
              than one.
            </p>

            <div className="ai-simple-option-grid">
              {additionalSymptomOptions.map(
                (option) => (
                  <button
                    type="button"
                    key={option}
                    className={
                      additionalSymptoms.includes(
                        option
                      )
                        ? "ai-simple-option ai-simple-option-active"
                        : "ai-simple-option"
                    }
                    onClick={() =>
                      toggleItem(
                        option,
                        additionalSymptoms,
                        setAdditionalSymptoms
                      )
                    }
                  >
                    {additionalSymptoms.includes(
                      option
                    )
                      ? "✓ "
                      : ""}

                    {option}
                  </button>
                )
              )}
            </div>
          </>
        );
      }

      if (step === 5) {
        return (
          <>
            <span className="ai-simple-category">
              PROGRESS
            </span>

            <h2>
              Is your problem
              getting better or
              worse?
            </h2>

            <div className="ai-simple-option-grid ai-three-grid">
              {progressOptions.map(
                (option) => (
                  <button
                    type="button"
                    key={option}
                    className={
                      symptomProgress ===
                      option
                        ? "ai-simple-option ai-simple-option-active"
                        : "ai-simple-option"
                    }
                    onClick={() =>
                      setSymptomProgress(
                        option
                      )
                    }
                  >
                    {option}
                  </button>
                )
              )}
            </div>
          </>
        );
      }

      if (step === 6) {
        return (
          <>
            <span className="ai-simple-category">
              MEDICAL HISTORY
            </span>

            <h2>
              Do you already have
              any health condition?
            </h2>

            <p className="ai-simple-help">
              Select all that apply.
            </p>

            <div className="ai-simple-option-grid">
              {conditionOptions.map(
                (option) => (
                  <button
                    type="button"
                    key={option}
                    className={
                      existingConditions.includes(
                        option
                      )
                        ? "ai-simple-option ai-simple-option-active"
                        : "ai-simple-option"
                    }
                    onClick={() =>
                      toggleItem(
                        option,
                        existingConditions,
                        setExistingConditions
                      )
                    }
                  >
                    {existingConditions.includes(
                      option
                    )
                      ? "✓ "
                      : ""}

                    {option}
                  </button>
                )
              )}
            </div>
          </>
        );
      }

      if (step === 7) {
        return (
          <>
            <span className="ai-simple-category">
              MEDICINES
            </span>

            <h2>
              Are you taking any
              medicines now?
            </h2>

            <div className="ai-simple-option-grid ai-two-grid">
              {[
                "No",
                "Yes",
              ].map(
                (option) => (
                  <button
                    type="button"
                    key={option}
                    className={
                      takesMedication ===
                      option
                        ? "ai-simple-option ai-simple-option-active"
                        : "ai-simple-option"
                    }
                    onClick={() =>
                      setTakesMedication(
                        option as
                          | "Yes"
                          | "No"
                      )
                    }
                  >
                    {option}
                  </button>
                )
              )}
            </div>

            {takesMedication ===
              "Yes" && (
              <div className="ai-simple-other">
                <label>
                  Medicine name
                </label>

                <input
                  className="form-control"
                  value={
                    currentMedications
                  }
                  onChange={(
                    event
                  ) =>
                    setCurrentMedications(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Example: BP tablet"
                />
              </div>
            )}
          </>
        );
      }

      if (step === 8) {
        return (
          <>
            <span className="ai-simple-category">
              ALLERGY
            </span>

            <h2>
              Do you have any
              medicine or food
              allergy?
            </h2>

            <div className="ai-simple-option-grid ai-three-grid">
              {[
                "No",
                "Yes",
                "Not sure",
              ].map(
                (option) => (
                  <button
                    type="button"
                    key={option}
                    className={
                      hasAllergies ===
                      option
                        ? "ai-simple-option ai-simple-option-active"
                        : "ai-simple-option"
                    }
                    onClick={() =>
                      setHasAllergies(
                        option as
                          | "Yes"
                          | "No"
                          | "Not sure"
                      )
                    }
                  >
                    {option}
                  </button>
                )
              )}
            </div>

            {hasAllergies ===
              "Yes" && (
              <div className="ai-simple-other">
                <label>
                  Allergy details
                </label>

                <input
                  className="form-control"
                  value={
                    allergies
                  }
                  onChange={(
                    event
                  ) =>
                    setAllergies(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Example: Penicillin"
                />
              </div>
            )}
          </>
        );
      }

      return (
        <>
          <span className="ai-simple-category ai-safety-text">
            IMPORTANT SAFETY CHECK
          </span>

          <h2>
            Are you having any of
            these serious problems
            now?
          </h2>

          <p className="ai-simple-help">
            Please select carefully.
          </p>

          <div className="ai-simple-option-grid">
            {emergencyOptions.map(
              (option) => (
                <button
                  type="button"
                  key={option}
                  className={
                    emergencySymptoms.includes(
                      option
                    )
                      ? option ===
                        "None"
                        ? "ai-simple-option ai-safe-option-active"
                        : "ai-simple-option ai-danger-option-active"
                      : "ai-simple-option"
                  }
                  onClick={() =>
                    toggleItem(
                      option,
                      emergencySymptoms,
                      setEmergencySymptoms
                    )
                  }
                >
                  {emergencySymptoms.includes(
                    option
                  )
                    ? "✓ "
                    : ""}

                  {option}
                </button>
              )
            )}
          </div>
        </>
      );
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="app-page patient-portal-page">
      {/* TOAST */}

      {toast && (
        <div
          className={`floating-toast ${
            toast.type ===
            "success"
              ? "floating-toast-success"
              : "floating-toast-error"
          }`}
        >
          <div className="toast-icon">
            {toast.type ===
            "success"
              ? "✓"
              : "!"}
          </div>

          <p>
            {toast.text}
          </p>

          <button
            type="button"
            onClick={() =>
              setToast(null)
            }
          >
            ×
          </button>
        </div>
      )}

      <div className="app-container">
        {/* HEADER */}

        <div className="patient-appointment-header">
          <div>
            <div className="patient-badge">
              AI PRE-CONSULTATION
            </div>

            <h1>
              Smart Appointment
            </h1>

            <p>
              Answer a few simple
              questions before booking.
            </p>
          </div>

          <div
            className="button-row"
            style={{
              position:
                "relative",
              zIndex: 5,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* QUESTION FLOW */}

        {!assessment && (
          <div className="ai-simple-shell">
            <div className="ai-simple-assistant">
              <div className="ai-simple-ai-avatar">
                AI
              </div>

              <div>
                <span>
                  MEDICHAIN ASSISTANT
                </span>

                <strong>
                  Hi{" "}
                  {
                    user.fullName.split(
                      " "
                    )[0]
                  }
                  , I will ask you
                  a few simple
                  questions.
                </strong>

                <p>
                  You can mostly
                  answer by selecting
                  an option.
                </p>
              </div>
            </div>

            <div className="ai-simple-progress-header">
              <span>
                Question {step} of{" "}
                {totalSteps}
              </span>

              <strong>
                {progress}%
              </strong>
            </div>

            <div className="ai-simple-progress-track">
              <div
                className="ai-simple-progress-value"
                style={{
                  width:
                    `${progress}%`,
                }}
              ></div>
            </div>

            <div className="ai-simple-question-box">
              {renderQuestion()}
            </div>

            <div className="ai-simple-navigation">
              <button
                type="button"
                className="ai-simple-back-btn"
                onClick={
                  handleBack
                }
              >
                ← Back
              </button>

              <button
                type="button"
                className="ai-simple-next-btn"
                disabled={
                  analyzing
                }
                onClick={
                  handleNext
                }
              >
                {analyzing
                  ? "Analyzing..."
                  : step ===
                      totalSteps
                    ? "Get My Summary →"
                    : "Next →"}
              </button>
            </div>

            <div className="ai-simple-disclaimer">
              This assistant helps
              prepare information for
              your doctor. It does not
              provide a medical
              diagnosis.
            </div>
          </div>
        )}

        {/* ==================================================
            ASSESSMENT RESULT
        ================================================== */}

        {assessment && (
          <>
            <div
              className={`ai-simple-result ${
                assessment
                  .urgentCareRequired
                  ? "ai-simple-result-danger"
                  : ""
              }`}
            >
              <div className="ai-simple-result-heading">
                <div>
                  <span>
                    PRE-CONSULTATION
                    COMPLETE
                  </span>

                  <h2>
                    Your Health Summary
                  </h2>
                </div>

                <div
                  className={`ai-priority-badge ai-priority-${assessment.priority.toLowerCase()}`}
                >
                  {
                    assessment.priority
                  }{" "}
                  PRIORITY
                </div>
              </div>

              {assessment
                .urgentCareRequired ? (
                <div className="ai-simple-emergency-warning">
                  <strong>
                    Urgent medical
                    attention may be
                    required.
                  </strong>

                  <p>
                    Based on the
                    warning signs you
                    selected, please
                    seek immediate
                    professional
                    medical care.
                  </p>
                </div>
              ) : (
                <>
                  <div className="ai-simple-summary-grid">
                    <div>
                      <span>
                        MAIN PROBLEM
                      </span>

                      <strong>
                        {
                          assessment.mainConcern
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        DURATION
                      </span>

                      <strong>
                        {
                          assessment.symptomDuration
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        SUGGESTED DEPARTMENT
                      </span>

                      <strong>
                        {
                          assessment.suggestedDepartment
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        SEVERITY
                      </span>

                      <strong>
                        {
                          assessment.severity
                        }
                        /10
                      </strong>
                    </div>
                  </div>

                  <div className="ai-simple-summary-text">
                    <span>
                      SUMMARY FOR DOCTOR
                    </span>

                    <p>
                      {
                        assessment.aiSummary
                      }
                    </p>
                  </div>
                </>
              )}

              <button
                type="button"
                className="ai-simple-edit-btn"
                onClick={() => {
                  setAssessment(
                    null
                  );

                  setStep(1);

                  setSelectedDoctor(
                    ""
                  );

                  setShowDoctorSelector(
                    false
                  );
                }}
              >
                ← Change My Answers
              </button>
            </div>

            {/* ==================================================
                BOOKING
            ================================================== */}

            {!assessment
              .urgentCareRequired && (
              <div className="appointment-booking-card">
                <div className="ai-result-section-title">
                  <span>
                    DOCTOR RECOMMENDATION
                  </span>

                  <h2>
                    Recommended Doctor
                  </h2>

                  <p>
                    Based on the
                    suggested department,
                    the system matched a
                    doctor with the same
                    specialization.
                  </p>
                </div>

                {/* ==================================================
                    RECOMMENDED DOCTOR
                ================================================== */}

                {recommendedDoctor ? (
                  <div className="ai-recommended-doctor-card">
                    <div className="ai-recommended-doctor-icon">
                      +
                    </div>

                    <div className="ai-recommended-doctor-info">
                      <div className="ai-recommended-label">
                        RECOMMENDED
                      </div>

                      <h3>
                        Dr.{" "}
                        {
                          recommendedDoctor.fullName
                        }
                      </h3>

                      <p>
                        {recommendedDoctor.specialization ||
                          "General Medicine"}
                      </p>

                      <small>
                        Suggested department:{" "}
                        <strong>
                          {
                            assessment.suggestedDepartment
                          }
                        </strong>
                      </small>
                    </div>

                    <div className="ai-recommended-check">
                      ✓ Selected
                    </div>
                  </div>
                ) : (
                  <div className="ai-no-doctor-warning">
                    No doctor is currently
                    available.
                  </div>
                )}

                {/* ==================================================
                    MATCH INFO
                ================================================== */}

                {matchingDoctors.length >
                0 ? (
                  <div className="ai-match-success">
                    ✓{" "}
                    {
                      matchingDoctors.length
                    }{" "}
                    doctor
                    {matchingDoctors.length >
                    1
                      ? "s"
                      : ""}{" "}
                    found for{" "}
                    <strong>
                      {
                        assessment.suggestedDepartment
                      }
                    </strong>
                  </div>
                ) : (
                  <div className="ai-match-fallback">
                    No exact{" "}
                    <strong>
                      {
                        assessment.suggestedDepartment
                      }
                    </strong>{" "}
                    specialist was found.
                    A currently available
                    doctor has been
                    suggested instead.
                  </div>
                )}

                {/* ==================================================
                    CHANGE DOCTOR
                ================================================== */}

                {doctors.length >
                  1 && (
                  <div className="ai-change-doctor-area">
                    <button
                      type="button"
                      className="ai-change-doctor-btn"
                      onClick={() =>
                        setShowDoctorSelector(
                          (
                            previous
                          ) =>
                            !previous
                        )
                      }
                    >
                      {showDoctorSelector
                        ? "Keep Recommended Doctor"
                        : "Choose Another Doctor"}
                    </button>

                    {showDoctorSelector && (
                      <div className="ai-doctor-selector-box">
                        <label>
                          Select another
                          doctor
                        </label>

                        <select
                          className="form-control"
                          value={
                            selectedDoctor
                          }
                          onChange={(
                            event
                          ) =>
                            setSelectedDoctor(
                              event
                                .target
                                .value
                            )
                          }
                        >
                          {doctors.map(
                            (
                              doctor
                            ) => (
                              <option
                                key={
                                  doctor._id
                                }
                                value={
                                  doctor._id
                                }
                              >
                                Dr.{" "}
                                {
                                  doctor.fullName
                                }
                                {doctor.specialization
                                  ? ` - ${doctor.specialization}`
                                  : ""}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* ==================================================
                    SELECTED DOCTOR CONFIRMATION
                ================================================== */}

                {selectedDoctorData && (
                  <div className="ai-final-doctor-confirmation">
                    <span>
                      APPOINTMENT WILL BE
                      BOOKED WITH
                    </span>

                    <strong>
                      Dr.{" "}
                      {
                        selectedDoctorData.fullName
                      }
                    </strong>

                    <p>
                      {selectedDoctorData.specialization ||
                        "Doctor"}
                    </p>
                  </div>
                )}

                {/* ==================================================
                    DATE & BOOK
                ================================================== */}

                <form
                  onSubmit={
                    bookAppointment
                  }
                >
                  <div className="appointment-booking-grid">
                    <div className="form-group">
                      <label className="form-label">
                        Recommended
                        Department
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        value={
                          assessment.suggestedDepartment
                        }
                        readOnly
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Appointment Date
                        & Time
                      </label>

                      <input
                        type="datetime-local"
                        className="form-control"
                        min={
                          minimumDate
                        }
                        value={
                          appointmentDate
                        }
                        onChange={(
                          event
                        ) =>
                          setAppointmentDate(
                            event
                              .target
                              .value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="appointment-booking-footer">
                    <div>
                      <span>
                        AI SUMMARY ATTACHED
                      </span>

                      <p>
                        Your doctor can
                        review your
                        pre-consultation
                        information before
                        consultation.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="appointment-final-book-btn"
                      disabled={
                        booking ||
                        !selectedDoctor
                      }
                    >
                      {booking
                        ? "Booking..."
                        : "Confirm Appointment"}
                    </button>
                  </div>
                </form>

                <div className="ai-doctor-disclaimer">
                  Doctor recommendation
                  is based on department
                  and specialization
                  matching. It is not a
                  medical diagnosis or
                  ranking of doctors.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Appointment;