export default function WhyBrandAid() {
  return (
    <div className="py-16 px-8 border-b border-brand-border">
      <h2 className="text-2xl font-bold text-brand-green mb-6">Why BrandAid</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-black mb-1">Results-Driven</h3>
          <p className="text-sm text-brand-neutral">
            Every recommendation is backed by data and designed to deliver measurable ROI.
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-black mb-1">Systems, Not Campaigns</h3>
          <p className="text-sm text-brand-neutral">
            We build growth engines that generate revenue long after our engagement ends.
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-cream rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-black mb-1">Strategic Partner</h3>
          <p className="text-sm text-brand-neutral">
            We become an extension of your team, invested in your long-term success.
          </p>
        </div>
      </div>
    </div>
  );
}
