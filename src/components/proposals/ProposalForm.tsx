"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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

const DEFAULT_SERVICE_PACKAGES = [
  { name: "Starter", price: 20000, features: [] },
  { name: "Growth", price: 30000, features: [] },
  { name: "Scale", price: 50000, features: [] },
];

export default function ProposalForm({ services, sections, onSubmit, initialData, isEdit }: ProposalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [proposalId, setProposalId] = useState<string | null>(initialData?.id || null);

  const [form, setForm] = useState({
    businessName: initialData?.businessName || "",
    contactName: initialData?.contactName || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    websiteUrl: initialData?.websiteUrl || "",
    industry: initialData?.industry || "",
    address: initialData?.address || "",
    serviceArea: initialData?.serviceArea || "",
    googleMapsLink: initialData?.googleMapsLink || "",
    currency: initialData?.currency || "NPR",
    currentLeadVolume: initialData?.currentLeadVolume || "",
    currentMonthlyTraffic: initialData?.currentMonthlyTraffic || "",
    approximateRevenue: initialData?.approximateRevenue || "",
    avgCustomerSpend: initialData?.avgCustomerSpend || "",
    customersPerDay: initialData?.customersPerDay || "",
    workingDaysPerMonth: initialData?.workingDaysPerMonth || 26,
    existingCrm: initialData?.existingCrm || "",
    discoveryNotes: initialData?.discoveryNotes || "",
    painPoints: initialData?.painPoints || "",
    goals: initialData?.goals || "",
    brandNotes: initialData?.brandNotes || "",
    competitors: initialData?.competitors || "",
    websiteSpeedScore: initialData?.websiteSpeedScore || "",
    lighthousePerformance: initialData?.lighthousePerformance || "",
    lighthouseAccessibility: initialData?.lighthouseAccessibility || "",
    lighthouseSeo: initialData?.lighthouseSeo || "",
    lighthouseBestPractices: initialData?.lighthouseBestPractices || "",
    lighthouseAgenticBrowsing: initialData?.lighthouseAgenticBrowsing || "",
    googleProfileScore: initialData?.googleProfileScore || "",
    localSeoScore: initialData?.localSeoScore || "",
  });

  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialData?.serviceIds || initialData?.services?.map((s: any) => s.serviceId || s.id) || []
  );
  const [selectedSections, setSelectedSections] = useState<string[]>(
    initialData?.sectionIds || initialData?.sections?.map((s: any) => s.reusableSectionId || s.id) || sections.map((s) => s.id)
  );
  const [servicePricing, setServicePricing] = useState<Record<string, any>>(initialData?.servicePricing || {});
  const [fetchingScores, setFetchingScores] = useState(false);
  const [fetchingPlaces, setFetchingPlaces] = useState(false);
  const [assessmentFetched, setAssessmentFetched] = useState(false);
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(initialData?.googleBusinessData || null);
  const [hasWebsite, setHasWebsite] = useState(initialData?.hasWebsite !== false);

  // Auto-fetch assessment data when navigating to Assessment tab
  const autoFetchAssessment = useCallback(async () => {
    if (assessmentFetched) return;
    setAssessmentFetched(true);

    const normalizedUrl = normalizeUrl(form.websiteUrl);
    if (hasWebsite && normalizedUrl && !form.lighthousePerformance) {
      setFetchingScores(true);
      try {
        const res = await fetch("/api/page-speed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        });
        const data = await res.json();
        if (!data.error) {
          setForm(prev => ({
            ...prev,
            websiteUrl: normalizedUrl,
            websiteSpeedScore: data.scores.performance,
            lighthousePerformance: data.scores.performance,
            lighthouseAccessibility: data.scores.accessibility,
            lighthouseSeo: data.scores.seo,
            lighthouseBestPractices: data.scores.bestPractices,
            lighthouseAgenticBrowsing: data.scores.agenticBrowsing || "",
          }));
        }
      } catch {}
      setFetchingScores(false);
    }

    if (form.businessName && !selectedPlace) {
      setFetchingPlaces(true);
      try {
        const res = await fetch("/api/google-places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: `${form.businessName} ${form.address}` }),
        });
        const data = await res.json();
        if (!data.error && data.results?.length > 0) {
          setPlacesResults(data.results);
          const detailRes = await fetch("/api/google-places", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ placeId: data.results[0].placeId }),
          });
          const detail = await detailRes.json();
          if (!detail.error) {
            setSelectedPlace(detail);
            setForm(prev => ({ ...prev, googleProfileScore: detail.totalScore || "" }));
          }
        }
      } catch {}
      setFetchingPlaces(false);
    }
  }, [form.websiteUrl, form.businessName, form.address, form.lighthousePerformance, selectedPlace, assessmentFetched]);

  useEffect(() => {
    if (activeTab === 2) autoFetchAssessment();
  }, [activeTab, autoFetchAssessment]);

  function updateField(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function normalizeUrl(url: string): string {
    if (!url) return url;
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  function buildSubmitData() {
    return {
      ...form,
      avgCustomerSpend: form.avgCustomerSpend ? Number(form.avgCustomerSpend) : null,
      customersPerDay: form.customersPerDay ? Number(form.customersPerDay) : null,
      workingDaysPerMonth: form.workingDaysPerMonth ? Number(form.workingDaysPerMonth) : 26,
      serviceIds: selectedServices,
      servicePricing,
      sectionIds: selectedSections,
      googleBusinessData: selectedPlace,
      hasWebsite,
    };
  }

  async function autoSave(): Promise<string | null> {
    setSaving(true);
    try {
      const data = buildSubmitData();
      if (proposalId) {
        const res = await fetch(`/api/proposals/${proposalId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) return proposalId;
      } else {
        const res = await fetch("/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const proposal = await res.json();
          setProposalId(proposal.id);
          return proposal.id;
        }
      }
    } catch {}
    setSaving(false);
    return null;
  }

  async function handleNext() {
    const id = await autoSave();
    if (id && activeTab < TABS.length - 1) {
      setActiveTab(activeTab + 1);
      if (!isEdit) {
        router.replace(`/proposals/${id}/edit`);
      }
    }
    setSaving(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = buildSubmitData();
    await onSubmit(data);
    setLoading(false);
  }

  async function fetchPageSpeed() {
    const url = normalizeUrl(form.websiteUrl);
    if (!url) { alert("Please enter a Website URL first"); return; }
    setFetchingScores(true);
    try {
      const res = await fetch("/api/page-speed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setForm(prev => ({
        ...prev,
        websiteUrl: url,
        websiteSpeedScore: data.scores.performance,
        lighthousePerformance: data.scores.performance,
        lighthouseAccessibility: data.scores.accessibility,
        lighthouseSeo: data.scores.seo,
        lighthouseBestPractices: data.scores.bestPractices,
        lighthouseAgenticBrowsing: data.scores.agenticBrowsing || "",
      }));
    } catch { alert("Failed to fetch PageSpeed scores"); }
    setFetchingScores(false);
  }

  async function searchGooglePlaces() {
    const query = `${form.businessName} ${form.address}`.trim();
    if (!query) { alert("Please enter a business name and address first"); return; }
    setFetchingPlaces(true);
    try {
      const res = await fetch("/api/google-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setPlacesResults(data.results || []);
    } catch { alert("Failed to search Google Places"); }
    setFetchingPlaces(false);
  }

  async function selectPlace(placeId: string) {
    setFetchingPlaces(true);
    try {
      const res = await fetch("/api/google-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setSelectedPlace(data);
      let profileScore = 0;
      if (data.name) profileScore += 20;
      if (data.address) profileScore += 20;
      if (data.phone) profileScore += 15;
      if (data.website) profileScore += 15;
      if (data.reviewCount > 0) profileScore += 15;
      if (data.photos && data.photos.length > 0) profileScore += 15;

      let localSeoScore = 0;
      if (data.name) localSeoScore += 30;
      if (data.rating >= 4.0) localSeoScore += 20;
      else if (data.rating >= 3.0) localSeoScore += 10;
      if (data.reviewCount >= 10) localSeoScore += 15;
      else if (data.reviewCount >= 1) localSeoScore += 5;
      if (data.photos && data.photos.length >= 3) localSeoScore += 10;
      if (data.openingHours) localSeoScore += 10;
      if (data.types && data.types.length > 0) localSeoScore += 5;

      setForm(prev => ({
        ...prev,
        googleProfileScore: profileScore,
        localSeoScore: localSeoScore,
      }));
    } catch { alert("Failed to fetch place details"); }
    setFetchingPlaces(false);
  }

  function toggleService(id: string) {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  function toggleSection(id: string) {
    setSelectedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-1 bg-white rounded-lg border border-[#c3cdd8]/50 p-1 mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} type="button" onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeTab === i ? "bg-[#004527] text-white" : "text-on-surface-variant hover:bg-surface"
            }`}>
            {tab}
          </button>
        ))}
        {saving && <span className="text-[11px] text-on-surface-variant ml-2">Saving...</span>}
      </div>

      {/* Tab 0: Business Basics */}
      {activeTab === 0 && (
        <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-[#004527]">business</span>
            <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Business Basics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="businessName" label="Business Name" value={form.businessName} onChange={e => updateField("businessName", e.target.value)} required icon="store" />
            <Input name="contactName" label="Contact Person" value={form.contactName} onChange={e => updateField("contactName", e.target.value)} icon="person" />
            <Input name="contactEmail" label="Email" type="email" value={form.contactEmail} onChange={e => updateField("contactEmail", e.target.value)} icon="mail" />
            <Input name="contactPhone" label="Phone" value={form.contactPhone} onChange={e => updateField("contactPhone", e.target.value)} icon="call" />
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-[#c3cdd8]/50">
                <button type="button" onClick={() => setHasWebsite(!hasWebsite)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${hasWebsite ? "bg-[#004527]" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasWebsite ? "translate-x-5" : ""}`} />
                </button>
                <div>
                  <p className="text-[13px] font-medium text-on-surface">Client has a website</p>
                  <p className="text-[11px] text-on-surface-variant">Toggle off if the business doesn't have a website yet</p>
                </div>
              </div>
            </div>
            {hasWebsite ? (
              <Input name="websiteUrl" label="Website URL" value={form.websiteUrl} onChange={e => updateField("websiteUrl", e.target.value)} placeholder="https://" icon="language" />
            ) : (
              <div className="md:col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-orange-600 mt-0.5">info</span>
                  <div>
                    <p className="text-[13px] font-medium text-orange-800">No Website Detected</p>
                    <p className="text-[12px] text-orange-700 mt-1">The proposal will focus on missed opportunities and the revenue gap from not having an online presence. Website performance scores will be skipped.</p>
                  </div>
                </div>
              </div>
            )}
            <Select name="industry" label="Industry" options={INDUSTRIES} value={form.industry} onChange={e => updateField("industry", e.target.value)} />
            <Input name="existingCrm" label="Existing CRM / Tools" value={form.existingCrm} onChange={e => updateField("existingCrm", e.target.value)} icon="hub" />
            <Input name="address" label="Business Address" value={form.address} onChange={e => updateField("address", e.target.value)} className="md:col-span-2" icon="location_on" />
            <Input name="serviceArea" label="Service Area / Locations" value={form.serviceArea} onChange={e => updateField("serviceArea", e.target.value)} icon="map" />
            <Input name="googleMapsLink" label="Google Maps Link" value={form.googleMapsLink} onChange={e => updateField("googleMapsLink", e.target.value)} icon="place" />
            <div>
              <label className="block text-[13px] font-medium text-on-surface mb-1.5">Currency</label>
              <select name="currency" value={form.currency} onChange={e => updateField("currency", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]">
                {CURRENCIES.map(c => (<option key={c.code} value={c.code}>{c.symbol} {c.name}</option>))}
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
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Revenue Baseline</h3>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-4">Set baseline metrics to calculate ROI projections for this proposal.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="currentLeadVolume" label="Current Lead Volume" value={form.currentLeadVolume} onChange={e => updateField("currentLeadVolume", e.target.value)} placeholder="e.g. 50/month" icon="trending_up" />
              <Input name="currentMonthlyTraffic" label="Monthly Website Traffic" value={form.currentMonthlyTraffic} onChange={e => updateField("currentMonthlyTraffic", e.target.value)} placeholder={hasWebsite ? "e.g. 2000" : "No website"} icon="bar_chart" disabled={!hasWebsite} className={!hasWebsite ? "opacity-50 cursor-not-allowed" : ""} />
              <Input name="approximateRevenue" label="Approximate Revenue" value={form.approximateRevenue} onChange={e => updateField("approximateRevenue", e.target.value)} placeholder="e.g. NPR 500,000/mo" icon="payments" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input name="avgCustomerSpend" label="Avg Customer Spend" value={form.avgCustomerSpend} onChange={e => updateField("avgCustomerSpend", e.target.value)} placeholder="e.g. 2000" icon="payments" />
              <Input name="customersPerDay" label="Customers per Day" value={form.customersPerDay} onChange={e => updateField("customersPerDay", e.target.value)} placeholder="e.g. 10" icon="group" />
              <Input name="workingDaysPerMonth" label="Working Days/Month" value={form.workingDaysPerMonth} onChange={e => updateField("workingDaysPerMonth", e.target.value)} placeholder="e.g. 26" icon="calendar_month" />
            </div>
            {form.avgCustomerSpend && form.customersPerDay && (
              <div className="mt-4 p-3 bg-[#004527]/5 rounded-lg border border-[#004527]/10">
                <p className="text-[12px] text-on-surface-variant">Monthly Revenue Baseline:</p>
                <p className="text-lg font-bold text-[#004527] font-[family-name:var(--font-display)]">
                  {parseInt(form.avgCustomerSpend || "0") * parseInt(form.customersPerDay || "0") * parseInt(form.workingDaysPerMonth || "26")} {form.currency}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">search</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Google Business Profile Lookup</h3>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-3">Auto-fetch business details, reviews, and photos from Google</p>
            <Button type="button" variant="outline" size="sm" loading={fetchingPlaces} onClick={searchGooglePlaces}>Search Google Places</Button>
            {placesResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {placesResults.map((p: any) => (
                  <button key={p.placeId} type="button" onClick={() => selectPlace(p.placeId)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPlace?.placeId === p.placeId ? "border-[#004527] bg-[#004527]/5" : "border-[#c3cdd8]/50 hover:bg-surface"
                    }`}>
                    <p className="text-[13px] font-medium text-on-surface">{p.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{p.address}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedPlace && (
              <div className="mt-3 p-3 bg-[#004527]/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#004527]">check_circle</span>
                  <span className="text-[13px] font-medium text-on-surface">{selectedPlace.name}</span>
                </div>
                <div className="flex gap-4 mt-1 text-[11px] text-on-surface-variant">
                  <span>Rating: {selectedPlace.rating} ({selectedPlace.reviewCount} reviews)</span>
                  <span>{selectedPlace.photos?.length || 0} photos</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">discovery</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Discovery & Goals</h3>
            </div>
            <div className="space-y-4">
              <Textarea name="discoveryNotes" label="Discovery Notes" value={form.discoveryNotes} onChange={e => updateField("discoveryNotes", e.target.value)} rows={3} />
              <Textarea name="painPoints" label="Client Pain Points" value={form.painPoints} onChange={e => updateField("painPoints", e.target.value)} rows={3} />
              <Textarea name="goals" label="Client Goals" value={form.goals} onChange={e => updateField("goals", e.target.value)} rows={3} />
              <Textarea name="brandNotes" label="Brand Notes" value={form.brandNotes} onChange={e => updateField("brandNotes", e.target.value)} rows={2} />
              <Textarea name="competitors" label="Competitors (URLs)" value={form.competitors} onChange={e => updateField("competitors", e.target.value)} rows={2} />
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Assessment */}
      {activeTab === 2 && (
        <>
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#004527]">speed</span>
                <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Website Speed & Lighthouse Scores</h3>
              </div>
              {hasWebsite ? (
                fetchingScores ? (
                  <span className="text-[12px] text-[#004527] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    Fetching...
                  </span>
                ) : form.lighthousePerformance ? (
                  <span className="text-[12px] text-[#15803d] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Auto-fetched
                  </span>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={fetchPageSpeed}>Fetch Now</Button>
                )
              ) : (
                <span className="text-[12px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Skipped - No website
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Performance</label>
                <input type="number" min="0" max="100" value={form.lighthousePerformance} onChange={e => updateField("lighthousePerformance", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Accessibility</label>
                <input type="number" min="0" max="100" value={form.lighthouseAccessibility} onChange={e => updateField("lighthouseAccessibility", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Best Practices</label>
                <input type="number" min="0" max="100" value={form.lighthouseBestPractices} onChange={e => updateField("lighthouseBestPractices", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">SEO</label>
                <input type="number" min="0" max="100" value={form.lighthouseSeo} onChange={e => updateField("lighthouseSeo", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Agentic Browsing</label>
                <input type="number" min="0" max="100" value={form.lighthouseAgenticBrowsing} onChange={e => updateField("lighthouseAgenticBrowsing", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">business</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Google Business Profile Assessment</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Google Profile Score</label>
                <input type="number" min="0" max="100" value={form.googleProfileScore} onChange={e => updateField("googleProfileScore", Number(e.target.value))} className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Local SEO Score</label>
                <input type="number" min="0" max="100" value={form.localSeoScore} onChange={e => updateField("localSeoScore", Number(e.target.value))} className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab 3: Service Selection */}
      {activeTab === 3 && (
        <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[18px] text-[#004527]">widgets</span>
            <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Select Services & Pricing</h3>
          </div>
          <p className="text-[12px] text-on-surface-variant mb-4">Choose services and select a pricing tier for each</p>
          <div className="space-y-3">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const servicePkgs = (service.pricingPackages as any[] || []);
              const packages = servicePkgs.length > 0 ? servicePkgs : DEFAULT_SERVICE_PACKAGES;
              return (
                <div key={service.id} className={`rounded-lg border transition-all ${isSelected ? "border-[#004527] bg-[#004527]/5" : "border-[#c3cdd8]/50 hover:border-[#004527]/30"}`}>
                  <button type="button" onClick={() => toggleService(service.id)} className="w-full p-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? "bg-[#004527] border-[#004527]" : "border-[#c3cdd8]"}`}>
                        {isSelected && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[13px] text-on-surface">{service.name}</p>
                        {service.shortDescription && <p className="text-[11px] text-on-surface-variant mt-0.5">{service.shortDescription}</p>}
                      </div>
                      {isSelected && servicePricing[service.id] && (
                        <span className="text-[12px] font-semibold text-[#004527]">{form.currency} {servicePricing[service.id].price?.toLocaleString()}</span>
                      )}
                    </div>
                  </button>
                  {isSelected && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-[11px] font-medium text-on-surface-variant mb-2">Select pricing tier:</p>
                      <div className="flex gap-2 flex-wrap">
                        {packages.map((pkg: any, i: number) => (
                          <label key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] cursor-pointer transition-colors ${
                            servicePricing[service.id]?.name === pkg.name 
                              ? "border-[#004527] bg-[#004527]/5" 
                              : "border-[#c3cdd8]/50 bg-white hover:bg-surface"
                          }`}>
                            <input 
                              type="radio" 
                              name={`pricing_${service.id}`} 
                              checked={servicePricing[service.id]?.name === pkg.name}
                              onChange={() => setServicePricing(prev => ({ ...prev, [service.id]: pkg }))}
                              className="text-[#004527]" 
                            />
                            <span className="font-medium">{pkg.name}</span>
                            <span className="text-[#004527]">{form.currency} {(pkg.price || 0).toLocaleString()}/mo</span>
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
          <p className="text-[12px] text-on-surface-variant mb-4">Choose which sections to include in this proposal</p>
          <div className="space-y-2">
            {sections.map((section) => (
              <label key={section.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#c3cdd8]/50 hover:bg-surface cursor-pointer transition-colors">
                <input type="checkbox" checked={selectedSections.includes(section.id)} onChange={() => toggleSection(section.id)}
                  className="w-4 h-4 rounded border-[#c3cdd8] text-[#004527] focus:ring-[#004527]" />
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
        <div>{activeTab > 0 && <Button type="button" variant="outline" onClick={() => setActiveTab(activeTab - 1)}>Previous</Button>}</div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
          {activeTab < TABS.length - 1 ? (
            <Button type="button" loading={saving} onClick={handleNext}>Save & Next</Button>
          ) : (
            <Button type="submit" loading={loading} size="lg">{isEdit ? "Save Changes" : "Create Proposal"}</Button>
          )}
        </div>
      </div>
    </form>
  );
}
