export default function CoverHero({
  businessName,
  contactName,
}: {
  businessName: string;
  contactName: string | null;
}) {
  return (
    <div className="bg-gradient-to-br from-brand-green to-brand-green-dark text-white py-24 px-8 text-center">
      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span className="text-white font-bold text-2xl">BA</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">{businessName}</h1>
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
  );
}
