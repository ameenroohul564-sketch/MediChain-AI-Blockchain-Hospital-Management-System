const modules = [
  {
    title: "Doctor Portal",
    icon: "👨‍⚕️",
    desc: "Manage patients, appointments and AI-assisted treatment."
  },
  {
    title: "Patient Portal",
    icon: "🧑‍⚕️",
    desc: "Book appointments, access reports and medical history."
  },
  {
    title: "Hospital Dashboard",
    icon: "🏥",
    desc: "Monitor departments, doctors and hospital analytics."
  },
  {
    title: "Blockchain Ledger",
    icon: "⛓️",
    desc: "Immutable medical records with complete transparency."
  },
  {
    title: "AI Assistant",
    icon: "🤖",
    desc: "Smart diagnosis support and report summarization."
  },
  {
    title: "Admin Panel",
    icon: "🛡️",
    desc: "Manage users, hospitals, permissions and system settings."
  }
];

const Modules = () => {
  return (
    <section className="py-24 px-6 bg-[#05081a]">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-bold text-center text-white">
          Platform <span className="text-cyan-400">Modules</span>
        </h2>

        <p className="text-center text-gray-400 mt-4 mb-16 text-lg">
          Everything required for a modern AI powered hospital ecosystem.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {modules.map((item, index) => (

            <div
              key={index}
              className="rounded-3xl bg-[#101426] border border-cyan-500/20 p-8 hover:border-cyan-400 hover:-translate-y-2 transition-all duration-300"
            >

              <div className="text-5xl mb-6">
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                {item.title}
              </h3>

              <p className="text-gray-400 leading-8">
                {item.desc}
              </p>

              <button
                className="mt-8 px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
              >
                Explore
              </button>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
};

export default Modules;