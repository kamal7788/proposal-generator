"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";

interface Service {
  id: string;
  name: string;
  shortDescription: string | null;
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

export default function ProposalForm({ services, sections, onSubmit }: ProposalFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>(
    sections.map((s) => s.id)
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
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleSection(id: string) {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Section nav */}
      <div className="flex items-center gap-1 bg-white rounded-lg border border-[#c3cdd8]/50 p-1 mb-6">
        <button type="button" className="px-4 py-1.5 rounded-md text-[13px] font-medium bg-[#004527] text-white">
          Business Info
        </button>
        <button type="button" className="px-4 py-1.5 rounded-md text-[13px] font-medium text-on-surface-variant hover:bg-surface transition-colors">
          Services
        </button>
        <button type="button" className="px-4 py-1.5 rounded-md text-[13px] font-medium text-on-surface-variant hover:bg-surface transition-colors">
          Audit
        </button>
        <button type="button" className="px-4 py-1.5 rounded-md text-[13px] font-medium text-on-surface-variant hover:bg-surface transition-colors">
          ROI
        </button>
      </div>

      {/* Business Basics */}
      <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-[#004527]">business</span>
          <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Business Basics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="businessName" label="Business Name" required icon="store" />
          <Input name="contactName" label="Contact Person" icon="person" />
          <Input name="contactEmail" label="Email" type="email" icon="mail" />
          <Input name="contactPhone" label="Phone" icon="call" />
          <Input name="websiteUrl" label="Website URL" placeholder="https://" icon="language" />
          <Select name="industry" label="Industry" options={INDUSTRIES} />
          <Input name="address" label="Business Address" className="md:col-span-2" icon="location_on" />
          <Input name="serviceArea" label="Service Area / Locations" icon="map" />
          <Input name="googleMapsLink" label="Google Maps Link" icon="place" />
        </div>
      </div>

      {/* Online Presence */}
      <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-[#004527]">public</span>
          <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Online Presence</h3>
        </div>
        <div className="space-y-4">
          <Input name="googleBusinessProfile" label="Google Business Profile Link" icon="business_center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input name="currentLeadVolume" label="Current Lead Volume" placeholder="e.g. 50/month" icon="trending_up" />
            <Input name="currentMonthlyTraffic" label="Monthly Website Traffic" placeholder="e.g. 2000" icon="bar_chart" />
            <Input name="approximateRevenue" label="Approximate Revenue" placeholder="e.g. $500K" icon="payments" />
          </div>
          <Input name="existingCrm" label="Existing CRM / Tools" icon="hub" />
        </div>
      </div>

      {/* Discovery */}
      <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-[#004527]">discovery</span>
          <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Discovery & Goals</h3>
        </div>
        <div className="space-y-4">
          <Textarea name="discoveryNotes" label="Discovery Notes" rows={3} />
          <Textarea name="painPoints" label="Client Pain Points" rows={3} />
          <Textarea name="goals" label="Client Goals" rows={3} />
          <Textarea name="brandNotes" label="Brand Notes" rows={2} />
          <Textarea name="competitors" label="Competitors (URLs)" rows={2} />
        </div>
      </div>

      {/* Service Selection */}
      <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[18px] text-[#004527]">widgets</span>
          <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Select Services to Pitch</h3>
        </div>
        <p className="text-[12px] text-on-surface-variant mb-4">
          Choose which services this proposal will include
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedServices.includes(service.id)
                  ? "border-[#004527] bg-[#004527]/5 ring-1 ring-[#004527]"
                  : "border-[#c3cdd8]/50 hover:border-[#004527]/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedServices.includes(service.id)
                      ? "bg-[#004527] border-[#004527]"
                      : "border-[#c3cdd8]"
                  }`}
                >
                  {selectedServices.includes(service.id) && (
                    <span className="material-symbols-outlined text-[12px] text-white">check</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-[13px] text-on-surface">{service.name}</p>
                  {service.shortDescription && (
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {service.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Selection */}
      <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[18px] text-[#004527]">view_list</span>
          <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Proposal Sections</h3>
        </div>
        <p className="text-[12px] text-on-surface-variant mb-4">
          Choose which reusable sections to include
        </p>
        <div className="space-y-2">
          {sections.map((section) => (
            <label
              key={section.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#c3cdd8]/50 hover:bg-surface cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSections.includes(section.id)}
                onChange={() => toggleSection(section.id)}
                className="w-4 h-4 rounded border-[#c3cdd8] text-[#004527] focus:ring-[#004527]"
              />
              <div>
                <p className="text-[13px] font-medium text-on-surface">{section.title}</p>
                {section.category && (
                  <p className="text-[11px] text-on-surface-variant">{section.category}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} size="lg">
          Create Proposal
        </Button>
      </div>
    </form>
  );
}
