"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";

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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Business Details */}
      <Card>
        <CardTitle>Business Details</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input name="businessName" label="Business Name *" required />
          <Input name="contactName" label="Contact Person" />
          <Input name="contactEmail" label="Email" type="email" />
          <Input name="contactPhone" label="Phone" />
          <Input name="websiteUrl" label="Website URL" placeholder="https://" />
          <Select name="industry" label="Industry" options={INDUSTRIES} />
          <Input name="address" label="Business Address" className="md:col-span-2" />
          <Input name="serviceArea" label="Service Area / Locations" />
          <Input name="googleMapsLink" label="Google Maps Link" />
          <Input name="googleBusinessProfile" label="Google Business Profile Link" />
        </div>
      </Card>

      {/* Discovery */}
      <Card>
        <CardTitle>Discovery & Goals</CardTitle>
        <div className="space-y-4 mt-4">
          <Textarea name="discoveryNotes" label="Discovery Notes" rows={3} />
          <Textarea name="painPoints" label="Client Pain Points" rows={3} />
          <Textarea name="goals" label="Client Goals" rows={3} />
          <Textarea name="brandNotes" label="Brand Notes" rows={2} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input name="currentLeadVolume" label="Current Lead Volume" placeholder="e.g. 50/month" />
            <Input name="currentMonthlyTraffic" label="Monthly Website Traffic" placeholder="e.g. 2000" />
            <Input name="approximateRevenue" label="Approximate Revenue" placeholder="e.g. $500K" />
          </div>
          <Input name="existingCrm" label="Existing CRM / Tools" />
          <Textarea name="competitors" label="Competitors (URLs)" rows={2} />
        </div>
      </Card>

      {/* Service Selection */}
      <Card>
        <CardTitle>Select Services to Pitch</CardTitle>
        <p className="text-sm text-brand-neutral mb-4">
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
                  ? "border-brand-green bg-brand-green/5 ring-1 ring-brand-green"
                  : "border-brand-border hover:border-brand-green/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedServices.includes(service.id)
                      ? "bg-brand-green border-brand-green"
                      : "border-brand-border"
                  }`}
                >
                  {selectedServices.includes(service.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-brand-black">{service.name}</p>
                  {service.shortDescription && (
                    <p className="text-xs text-brand-neutral mt-0.5">
                      {service.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Section Selection */}
      <Card>
        <CardTitle>Proposal Sections</CardTitle>
        <p className="text-sm text-brand-neutral mb-4">
          Choose which reusable sections to include
        </p>
        <div className="space-y-2">
          {sections.map((section) => (
            <label
              key={section.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-brand-border hover:bg-brand-surface cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSections.includes(section.id)}
                onChange={() => toggleSection(section.id)}
                className="w-4 h-4 rounded border-brand-border text-brand-green focus:ring-brand-green"
              />
              <div>
                <p className="text-sm font-medium text-brand-black">{section.title}</p>
                {section.category && (
                  <p className="text-xs text-brand-neutral">{section.category}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-3">
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
