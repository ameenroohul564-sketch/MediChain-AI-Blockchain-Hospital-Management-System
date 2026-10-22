const technologies = [
  "React + TypeScript",
  "Node.js + Express",
  "MongoDB",
  "Blockchain",
  "Artificial Intelligence",
  "JWT Authentication",
];

const Technology = () => {
  return (
    <section className="bg-slate-950 py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-5xl font-bold text-white">
          Technology <span className="text-cyan-400">Stack</span>
        </h2>

        <p className="mt-4 text-center text-slate-400">
          Built using modern enterprise technologies.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech) => (
            <div
              key={tech}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-cyan-400 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-white">{tech}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Technology;