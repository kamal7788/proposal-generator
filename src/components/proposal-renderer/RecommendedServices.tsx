interface Service {
  name: string;
  description: string | null;
  shortDescription: string | null;
  pricingNotes: string | null;
  outcomes: string | null;
  deliverables: string | null;
  proofPoints: string | null;
  timeline: string | null;
}

export default function RecommendedServices({ services }: { services: Service[] }) {
  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
      <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Recommended Services</h2>
      <div className="space-y-4">
        {services.map((service, i) => (
          <div
            key={i}
            className="bg-white border border-[#c3cdd8]/50 rounded-xl p-6 card-hover"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#004527]/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-[#004527]">
                  {i === 0 ? "language" : i === 1 ? "campaign" : i === 2 ? "analytics" : "settings"}
                </span>
              </div>
              <h3 className="font-semibold text-on-surface text-[15px] font-[family-name:var(--font-display)]">
                {service.name}
              </h3>
            </div>
            <p className="text-[13px] text-on-surface-variant mb-4">
              {service.description || service.shortDescription || ""}
            </p>
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              {service.outcomes && (
                <div className="bg-surface rounded-lg p-3">
                  <p className="font-medium text-on-surface mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#004527]">flag</span>
                    Key Outcomes
                  </p>
                  <p className="text-on-surface-variant">{service.outcomes}</p>
                </div>
              )}
              {service.deliverables && (
                <div className="bg-surface rounded-lg p-3">
                  <p className="font-medium text-on-surface mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#004527]">inventory_2</span>
                    Deliverables
                  </p>
                  <p className="text-on-surface-variant">{service.deliverables}</p>
                </div>
              )}
              {service.proofPoints && (
                <div className="bg-surface rounded-lg p-3">
                  <p className="font-medium text-on-surface mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#004527]">verified</span>
                    Proof Points
                  </p>
                  <p className="text-on-surface-variant">{service.proofPoints}</p>
                </div>
              )}
              {service.timeline && (
                <div className="bg-surface rounded-lg p-3">
                  <p className="font-medium text-on-surface mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#004527]">schedule</span>
                    Timeline
                  </p>
                  <p className="text-on-surface-variant">{service.timeline}</p>
                </div>
              )}
            </div>
            {service.pricingNotes && (
              <p className="mt-3 text-[13px] font-medium text-[#004527] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">payments</span>
                {service.pricingNotes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
