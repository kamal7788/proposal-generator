"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { CURRENCIES } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  shortDescription: string | null;
  pricingPackages: any;
}

interface ReusableSection {
  id: string;
  title: string;
  category: string | null;
}

interface ProposalFormProps {
  services: Service[];
  sections: ReusableSection[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEdit?: boolean;
}

const INDUSTRIES = [
  { value: "", label: "Select industry..." },
  { value: "home-services", label: "Home Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "dental", label: "Dental" },
  { value: "legal", label: "Legal" },
  { value: "real-estate", label: "Real Estate" },
  { value: "hospitality", label: "Hospitality" },
  { value: "automotive", label: "Automotive" },
  { value: "fitness", label: "Fitness & Wellness" },
  { value: "restaurant", label: "Restaurant & Food" },
  { value: "professional-services", label: "Professional Services" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

const TABS = ["Business Info", "Online Presence", "Assessment", "Services", "Sections"];

export default function ProposalForm({ services, sections, onSubmit, initialData, isEdit }: ProposalFormProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialData?.serviceIds || initialData?.services?.map((s: any) => s.serviceId || s.id) || []
  );
  const [selectedSections, setSelectedSections] = useState<string[]>(
    initialData?.sectionIds || initialData?.sections?.map((s: any) => s.reusableSectionId || s.id) || sections.map((s) => s.id)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    data.serviceIds = selectedServices;
    data.sectionIds = selectedSections;
    await onSubmit(data);
  }

  function toggleService(id: string) {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  function toggleSection(id: string) {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Section nav */}
      <div className="flex items-center gap-1 bg-white rounded-lg border border-[#c3cdd8]/50 p-1 mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeTab === i ? "bg-[#004527] text-white" : "text-on-surface-variant hover:bg-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 0: Business Basics */}
      {activeTab === 0 && (
        <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-[#004527]">business</span>
            <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Business Basics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="businessName" label="Business Name" defaultValue={initialData?.businessName} required icon="store" />
            <Input name="contactName" label="Contact Person" defaultValue={initialData?.contactName} icon="person" />
            <Input name="contactEmail" label="Email" type="email" defaultValue={initialData?.contactEmail} icon="mail" />
            <Input name="contactPhone" label="Phone" defaultValue={initialData?.contactPhone} icon="call" />
            <Input name="websiteUrl" label="Website URL" defaultValue={initialData?.websiteUrl} placeholder="https://" icon="language" />
            <Select name="industry" label="Industry" options={INDUSTRIES} defaultValue={initialData?.industry || ""} />
            <Input name="address" label="Business Address" defaultValue={initialData?.address} className="md:col-span-2" icon="location_on" />
            <Input name="serviceArea" label="Service Area / Locations" defaultValue={initialData?.serviceArea} icon="map" />
            <Input name="googleMapsLink" label="Google Maps Link" defaultValue={initialData?.googleMapsLink} icon="place" />
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">Currency</label>
              <select
                name="currency"
                defaultValue={initialData?.currency || "USD"}
                className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Online Presence + Discovery */}
      {activeTab === 1 && (
        <>
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">public</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Online Presence</h3>
            </div>
            <div className="space-y-4">
              <Input name="googleBusinessProfile" label="Google Business Profile Link" defaultValue={initialData?.googleBusinessProfile} icon="business_center" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="currentLeadVolume" label="Current Lead Volume" defaultValue={initialData?.currentLeadVolume} placeholder="e.g. 50/month" icon="trending_up" />
                <Input name="currentMonthlyTraffic" label="Monthly Website Traffic" defaultValue={initialData?.currentMonthlyTraffic} placeholder="e.g. 2000" icon="bar_chart" />
                <Input name="approximateRevenue" label="Approximate Revenue" defaultValue={initialData?.approximateRevenue} placeholder="e.g. $500K" icon="payments" />
              </div>
              <Input name="existingCrm" label="Existing CRM / Tools" defaultValue={initialData?.existingCrm} icon="hub" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">discovery</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Discovery & Goals</h3>
            </div>
            <div className="space-y-4">
              <Textarea name="discoveryNotes" label="Discovery Notes" defaultValue={initialData?.discoveryNotes} rows={3} />
              <Textarea name="painPoints" label="Client Pain Points" defaultValue={initialData?.painPoints} rows={3} />
              <Textarea name="goals" label="Client Goals" defaultValue={initialData?.goals} rows={3} />
              <Textarea name="brandNotes" label="Brand Notes" defaultValue={initialData?.brandNotes} rows={2} />
              <Textarea name="competitors" label="Competitors (URLs)" defaultValue={initialData?.competitors} rows={2} />
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Assessment (Speed, Google Profile, LocalSEO) */}
      {activeTab === 2 && (
        <>
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">speed</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Website Speed & Lighthouse Scores</h3>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-4">Enter scores from Lighthouse audit (0-100)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input name="websiteSpeedScore" label="Speed Score" type="number" min="0" max="100" defaultValue={initialData?.websiteSpeedScore || ""} placeholder="0-100" icon="speed" />
              <Input name="lighthousePerformance" label="Performance" type="number" min="0" max="100" defaultValue={initialData?.lighthousePerformance || ""} placeholder="0-100" icon="equalizer" />
              <Input name="lighthouseAccessibility" label="Accessibility" type="number" min="0" max="100" defaultValue={initialData?.lighthouseAccessibility || ""} placeholder="0-100" icon="accessibility_new" />
              <Input name="lighthouseSeo" label="SEO" type="number" min="0" max="100" defaultValue={initialData?.lighthouseSeo || ""} placeholder="0-100" icon="search" />
              <Input name="lighthouseBestPractices" label="Best Practices" type="number" min="0" max="100" defaultValue={initialData?.lighthouseBestPractices || ""} placeholder="0-100" icon="verified" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">business</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Google Business Profile Assessment</h3>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-4">Rate the Google Business Profile completeness (0-100)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="googleProfileScore" label="Google Profile Score" type="number" min="0" max="100" defaultValue={initialData?.googleProfileScore || ""} placeholder="0-100" icon="business_center" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">grid_view</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Local SEO Assessment</h3>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-4">Rate local SEO readiness (0-100)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="localSeoScore" label="Local SEO Score" type="number" min="0" max="100" defaultValue={initialData?.localSeoScore || ""} placeholder="0-100" icon="location_on" />
            </div>
          </div>
        </>
      )}

      {/* Tab 3: Service Selection with Pricing */}
      {activeTab === 3 && (
        <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[18px] text-[#004527]">widgets</span>
            <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Select Services & Pricing</h3>
          </div>
          <p className="text-[12px] text-on-surface-variant mb-4">
            Choose services and optionally set per-proposal pricing
          </p>
          <div className="space-y-3">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const packages = service.pricingPackages as any[] || [];
              return (
                <div key={service.id} className={`rounded-lg border transition-all ${isSelected ? "border-[#004527] bg-[#004527]/5" : "border-[#c3cdd8]/50 hover:border-[#004527]/30"}`}>
                  <button
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? "bg-[#004527] border-[#004527]" : "border-[#c3cdd8]"}`}>
                        {isSelected && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                      </div>
                      <div>
                        <p className="font-medium text-[13px] text-on-surface">{service.name}</p>
                        {service.shortDescription && <p className="text-[11px] text-on-surface-variant mt-0.5">{service.shortDescription}</p>}
                      </div>
                    </div>
                  </button>
                  {isSelected && packages.length > 0 && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-[11px] font-medium text-on-surface-variant mb-2">Select pricing package:</p>
                      <div className="flex gap-2 flex-wrap">
                        {packages.map((pkg: any, i: number) => (
                          <label key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#c3cdd8]/50 bg-white text-[12px] cursor-pointer hover:bg-surface">
                            <input type="radio" name={`pricing_${service.id}`} value={JSON.stringify(pkg)} className="text-[#004527]" />
                            <span className="font-medium">{pkg.name}</span>
                            <span className="text-[#004527]">{pkg.price}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Section Selection */}
      {activeTab === 4 && (
        <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[18px] text-[#004527]">view_list</span>
            <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Proposal Sections</h3>
          </div>
          <p className="text-[12px] text-on-surface-variant mb-4">Choose which reusable sections to include</p>
          <div className="space-y-2">
            {sections.map((section) => (
              <label key={section.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#c3cdd8]/50 hover:bg-surface cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedSections.includes(section.id)}
                  onChange={() => toggleSection(section.id)}
                  className="w-4 h-4 rounded border-[#c3cdd8] text-[#004527] focus:ring-[#004527]"
                />
                <div>
                  <p className="text-[13px] font-medium text-on-surface">{section.title}</p>
                  {section.category && <p className="text-[11px] text-on-surface-variant">{section.category}</p>}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-2">
        <div>
          {activeTab > 0 && (
            <Button type="button" variant="outline" onClick={() => setActiveTab(activeTab - 1)}>
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Cancel
          </Button>
          {activeTab < TABS.length - 1 ? (
            <Button type="button" onClick={() => setActiveTab(activeTab + 1)}>
              Next
            </Button>
          ) : (
            <Button type="submit" loading={loading} size="lg">
              {isEdit ? "Save Changes" : "Create Proposal"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
