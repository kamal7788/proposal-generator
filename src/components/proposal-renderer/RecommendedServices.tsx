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
    <div className="py-16 px-8 border-b border-brand-border">
      <h2 className="text-2xl font-bold text-brand-green mb-6">Recommended Services</h2>
      <div className="space-y-4">
        {services.map((service, i) => (
          <div
            key={i}
            className="bg-white border border-brand-border rounded-xl p-6"
          >
            <h3 className="font-semibold text-brand-black text-lg mb-2">
              {service.name}
            </h3>
            <p className="text-sm text-brand-neutral mb-3">
              {service.description || service.shortDescription || ""}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {service.outcomes && (
                <div>
                  <p className="font-medium text-brand-black mb-1">Key Outcomes</p>
                  <p className="text-brand-neutral">{service.outcomes}</p>
                </div>
              )}
              {service.deliverables && (
                <div>
                  <p className="font-medium text-brand-black mb-1">Deliverables</p>
                  <p className="text-brand-neutral">{service.deliverables}</p>
                </div>
              )}
              {service.proofPoints && (
                <div>
                  <p className="font-medium text-brand-black mb-1">Proof Points</p>
                  <p className="text-brand-neutral">{service.proofPoints}</p>
                </div>
              )}
              {service.timeline && (
                <div>
                  <p className="font-medium text-brand-black mb-1">Timeline</p>
                  <p className="text-brand-neutral">{service.timeline}</p>
                </div>
              )}
            </div>
            {service.pricingNotes && (
              <p className="mt-3 text-sm font-medium text-brand-green">
                {service.pricingNotes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
