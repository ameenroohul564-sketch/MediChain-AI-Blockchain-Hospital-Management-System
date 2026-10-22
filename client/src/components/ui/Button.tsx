type ButtonProps = {
  children: React.ReactNode;
};

const Button = ({ children }: ButtonProps) => {
  return (
    <button className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-cyan-400 active:scale-95">
      {children}
    </button>
  );
};

export default Button;