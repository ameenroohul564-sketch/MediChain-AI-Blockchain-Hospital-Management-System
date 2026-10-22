type GlassCardProps = {
  children: React.ReactNode;
};

const GlassCard = ({ children }: GlassCardProps) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
      {children}
    </div>
  );
};

export default GlassCard;
