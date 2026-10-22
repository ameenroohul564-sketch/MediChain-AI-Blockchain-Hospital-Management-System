const CTA = () => {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-12 text-center">
        <h2 className="text-5xl font-bold text-white">
          Ready to Transform Healthcare?
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300">
          Join the next generation of hospitals with AI-powered and
          blockchain-secured healthcare management.
        </p>

        <div className="mt-10 flex justify-center gap-5">
          <button className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-black transition hover:bg-cyan-400">
            Get Started
          </button>

          <button className="rounded-xl border border-white/20 px-8 py-4 font-semibold text-white transition hover:bg-white/10">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;