export default function WhyBrandAid() {
  return (
    <div className="py-16 px-8 border-b border-[#c3cdd8]/30">
      <h2 className="text-2xl font-bold text-on-surface mb-6 font-[family-name:var(--font-display)]">Why BrandAid</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#004527]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px] text-[#004527]">verified</span>
          </div>
          <h3 className="font-semibold text-on-surface mb-1 font-[family-name:var(--font-display)]">Results-Driven</h3>
          <p className="text-[13px] text-on-surface-variant">
            Every recommendation is backed by data and designed to deliver measurable ROI.
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-[#004527]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px] text-[#004527]">bolt</span>
          </div>
          <h3 className="font-semibold text-on-surface mb-1 font-[family-name:var(--font-display)]">Systems, Not Campaigns</h3>
          <p className="text-[13px] text-on-surface-variant">
            We build growth engines that generate revenue long after our engagement ends.
          </p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-[#004527]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px] text-[#004527]">groups</span>
          </div>
          <h3 className="font-semibold text-on-surface mb-1 font-[family-name:var(--font-display)]">Strategic Partner</h3>
          <p className="text-[13px] text-on-surface-variant">
            We become an extension of your team, invested in your long-term success.
          </p>
        </div>
      </div>
    </div>
  );
}
