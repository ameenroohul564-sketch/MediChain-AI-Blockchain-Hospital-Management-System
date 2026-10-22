const Stats = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-4xl font-bold text-cyan-400">10M+</h2>
          <p className="mt-2 text-slate-400">Patient Records</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-4xl font-bold text-cyan-400">500+</h2>
          <p className="mt-2 text-slate-400">Hospitals</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-4xl font-bold text-cyan-400">99.99%</h2>
          <p className="mt-2 text-slate-400">Data Security</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h2 className="text-4xl font-bold text-cyan-400">24/7</h2>
          <p className="mt-2 text-slate-400">AI Monitoring</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;