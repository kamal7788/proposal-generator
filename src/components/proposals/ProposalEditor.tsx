"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface Proposal {
  id: string;
  businessName: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  websiteUrl: string | null;
  industry: string | null;
  serviceArea: string | null;
  googleMapsLink: string | null;
  googleBusinessProfile: string | null;
  currentLeadVolume: string | null;
  currentMonthlyTraffic: string | null;
  approximateRevenue: string | null;
  existingCrm: string | null;
  competitors: string | null;
  discoveryNotes: string | null;
  painPoints: string | null;
  goals: string | null;
  brandNotes: string | null;
}

const INDUSTRIES = [
  "Healthcare", "Home Services", "Professional Services", "Hospitality",
  "Real Estate", "Legal", "Financial Services", "Automotive",
  "Retail", "Education", "Technology", "Other",
];

export default function ProposalEditor({ proposal }: { proposal: Proposal }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Proposal>(proposal);

  function handleChange(field: keyof Proposal, value: string) {
    setForm(prev => ({ ...prev, [field]: value || null }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setLoading(false);
  }

  if (!editing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        <span className="material-symbols-outlined text-[14px] mr-1">edit</span>
        Edit Proposal
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Edit Proposal</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setForm(proposal); setEditing(false); }}>
            Cancel
          </Button>
          <Button size="sm" loading={loading} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Business Name" value={form.businessName} onChange={e => handleChange("businessName", e.target.value)} required />
        <Input label="Contact Name" value={form.contactName || ""} onChange={e => handleChange("contactName", e.target.value)} />
        <Input label="Contact Email" type="email" value={form.contactEmail || ""} onChange={e => handleChange("contactEmail", e.target.value)} />
        <Input label="Phone" value={form.contactPhone || ""} onChange={e => handleChange("contactPhone", e.target.value)} />
        <Input label="Website" value={form.websiteUrl || ""} onChange={e => handleChange("websiteUrl", e.target.value)} />
        <div>
          <label className="block text-[13px] font-medium text-on-surface mb-1.5">Industry</label>
          <select
            value={form.industry || ""}
            onChange={e => handleChange("industry", e.target.value)}
            className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]"
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <Input label="Address" value={form.address || ""} onChange={e => handleChange("address", e.target.value)} />
        <Input label="Service Area" value={form.serviceArea || ""} onChange={e => handleChange("serviceArea", e.target.value)} />
        <Input label="Google Maps Link" value={form.googleMapsLink || ""} onChange={e => handleChange("googleMapsLink", e.target.value)} />
        <Input label="Google Business Profile" value={form.googleBusinessProfile || ""} onChange={e => handleChange("googleBusinessProfile", e.target.value)} />
        <Input label="Current Lead Volume" value={form.currentLeadVolume || ""} onChange={e => handleChange("currentLeadVolume", e.target.value)} />
        <Input label="Monthly Traffic" value={form.currentMonthlyTraffic || ""} onChange={e => handleChange("currentMonthlyTraffic", e.target.value)} />
        <Input label="Approximate Revenue" value={form.approximateRevenue || ""} onChange={e => handleChange("approximateRevenue", e.target.value)} />
        <Input label="Existing CRM" value={form.existingCrm || ""} onChange={e => handleChange("existingCrm", e.target.value)} />
      </div>

      <Textarea label="Competitors" value={form.competitors || ""} onChange={e => handleChange("competitors", e.target.value)} rows={2} />
      <Textarea label="Discovery Notes" value={form.discoveryNotes || ""} onChange={e => handleChange("discoveryNotes", e.target.value)} rows={3} />
      <Textarea label="Pain Points" value={form.painPoints || ""} onChange={e => handleChange("painPoints", e.target.value)} rows={3} />
      <Textarea label="Goals" value={form.goals || ""} onChange={e => handleChange("goals", e.target.value)} rows={3} />
      <Textarea label="Brand Notes" value={form.brandNotes || ""} onChange={e => handleChange("brandNotes", e.target.value)} rows={2} />
    </div>
  );
}
