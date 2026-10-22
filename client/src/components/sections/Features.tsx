const features = [
  {
    title: "Blockchain Security",
    description:
      "Medical records are secured with blockchain technology, ensuring data integrity and transparency.",
  },
  {
    title: "AI Powered Analytics",
    description:
      "Artificial Intelligence helps hospitals make faster and smarter healthcare decisions.",
  },
  {
    title: "Real-Time Monitoring",
    description:
      "Track patients, doctors, appointments and hospital activities instantly.",
  },
];

const Features = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-white">
          Why Choose{" "}
          <span className="text-cyan-400">MediChain AI?</span>
        </h2>

        <p className="mt-4 text-slate-400">
          Enterprise-grade technology designed for modern healthcare.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-300 hover:-translate-y-2 hover:border-cyan-400/40"
          >
            <h3 className="mb-4 text-2xl font-semibold text-cyan-400">
              {feature.title}
            </h3>

            <p className="text-slate-300 leading-7">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;