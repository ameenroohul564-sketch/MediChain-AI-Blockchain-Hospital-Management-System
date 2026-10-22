import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto mt-5 flex w-[92%] max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl">
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide text-cyan-400"
        >
          MediChain AI
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <button className="rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400">
          Get Started
        </button>
      </nav>
    </header>
  );
};

export default Navbar;