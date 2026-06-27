export default function CoverHero({
  businessName,
  contactName,
}: {
  businessName: string;
  contactName: string | null;
}) {
  return (
    <div className="bg-gradient-to-br from-[#004527] to-[#003019] text-white py-24 px-8 text-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-white rounded-full" />
      </div>

      <div className="relative z-10">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <span className="text-white font-bold text-2xl font-[family-name:var(--font-display)]">BA</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-display)]">{businessName}</h1>
        <p className="text-xl text-white/90">Growth Strategy & Implementation Proposal</p>
        {contactName && (
          <p className="text-sm text-white/60 mt-6">
            Prepared for {contactName}
          </p>
        )}
        <p className="text-sm text-white/60 mt-1">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
