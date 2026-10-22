import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="flex min-h-[90vh] items-center justify-center px-6">
      <div className="max-w-5xl text-center">
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
          Blockchain • AI • Healthcare
        </span>

        <h1 className="mt-8 text-6xl font-extrabold leading-tight text-white">
          Building the Future of
          <span className="block text-cyan-400">
            Transparent Healthcare
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-400">
          MediChain AI provides secure, transparent, and tamper-resistant
          hospital management with blockchain-based medical record integrity.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-5">
          <Link
            to="/login"
            className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950 transition hover:scale-105 hover:bg-cyan-400"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl border border-white/20 px-8 py-4 font-semibold text-white transition hover:scale-105 hover:bg-white/10"
          >
            Register
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;