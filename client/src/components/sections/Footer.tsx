const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">

          <div>
            <h2 className="text-2xl font-bold text-cyan-400">
              MediChain AI
            </h2>

            <p className="mt-4 text-slate-400">
              AI-powered Blockchain Hospital Management System built for secure,
              transparent and modern healthcare.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Platform
            </h3>

            <ul className="space-y-2 text-slate-400">
              <li>Doctor Portal</li>
              <li>Patient Portal</li>
              <li>Hospital Dashboard</li>
              <li>Admin Panel</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Technologies
            </h3>

            <ul className="space-y-2 text-slate-400">
              <li>React</li>
              <li>Node.js</li>
              <li>MongoDB</li>
              <li>Blockchain</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Contact
            </h3>

            <ul className="space-y-2 text-slate-400">
              <li>Email: support@medichainai.com</li>
              <li>Phone: +91 XXXXX XXXXX</li>
              <li>Location: India</li>
            </ul>
          </div>

        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-slate-500">
          © 2026 MediChain AI. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;