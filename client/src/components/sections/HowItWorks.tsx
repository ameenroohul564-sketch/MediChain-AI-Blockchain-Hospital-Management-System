const steps = [
  {
    number: "01",
    title: "Patient Registration",
    description:
      "Patients are securely registered and their identity is verified.",
  },
  {
    number: "02",
    title: "Medical Records",
    description:
      "Doctors update medical records, which are stored securely and cannot be tampered with.",
  },
  {
    number: "03",
    title: "Blockchain Verification",
    description:
      "Every update is verified and recorded on the blockchain for complete transparency.",
  },
  {
    number: "04",
    title: "AI Insights",
    description:
      "AI analyzes hospital data to improve healthcare decisions and efficiency.",
  },
];

const HowItWorks = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-white">
          How <span className="text-cyan-400">MediChain AI</span> Works
        </h2>

        <p className="mt-4 text-slate-400">
          Four simple steps to ensure secure and transparent healthcare.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2">
        {steps.map((step) => (
          <div
            key={step.number}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <div className="mb-4 text-4xl font-bold text-cyan-400">
              {step.number}
            </div>

            <h3 className="mb-3 text-2xl font-semibold text-white">
              {step.title}
            </h3>

            <p className="text-slate-300">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;