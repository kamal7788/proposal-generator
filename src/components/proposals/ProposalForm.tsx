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

function extractPlaceFromMapsUrl(url: string): string | null {
  try {
    if (url.includes("/maps/place/")) {
      const match = url.match(/\/maps\/place\/([^/@]+)/);
      if (match) return decodeURIComponent(match[1].replace(/\+/g, " "));
    }
    if (url.includes("/maps/search/")) {
      const match = url.match(/\/maps\/search\/([^/@]+)/);
      if (match) return decodeURIComponent(match[1].replace(/\+/g, " "));
    }
  } catch {}
  return null;
}

export default function ProposalForm({ services, sections, onSubmit, initialData, isEdit }: ProposalFormProps) {
  const router = useRouter();
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
  const [fetchingScores, setFetchingScores] = useState(false);
  const [fetchingPlaces, setFetchingPlaces] = useState(false);
  const [assessmentFetched, setAssessmentFetched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(initialData?.googleBusinessData || null);
  const [hasWebsite, setHasWebsite] = useState(initialData?.hasWebsite !== false);
  const [fetchingMaps, setFetchingMaps] = useState(false);
  const [mapsFetched, setMapsFetched] = useState(false);

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
  }, [form.websiteUrl, form.lighthousePerformance, hasWebsite, assessmentFetched]);

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
      sectionIds: selectedSections,
      googleBusinessData: selectedPlace,
      hasWebsite,
    };
  }

  async function autoSave(): Promise<string | null> {
    setSaving(true);
    try {
      const data = buildSubmitData();
      let res;
      if (proposalId) {
        res = await fetch(`/api/proposals/${proposalId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch("/api/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      if (res?.ok) {
        const result = await res.json();
        if (!proposalId && result.id) {
          setProposalId(result.id);
          setSaving(false);
          return result.id;
        }
        setSaving(false);
        return proposalId;
      }
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
    setSaving(false);
    return null;
  }

  async function handleNext() {
    const id = await autoSave();
    if (id) {
      if (!isEdit) {
        router.replace(`/proposals/${id}/edit`);
      } else {
        setActiveTab(prev => Math.min(prev + 1, TABS.length - 1));
      }
    }
  }

  async function handleInformationComplete() {
    const id = await autoSave();
    if (id) {
      router.push(`/proposals/${id}`);
    }
  }

  async function fetchFromGoogleMaps() {
    const url = form.googleMapsLink?.trim();
    if (!url) return;

    setFetchingMaps(true);
    try {
      const placeName = extractPlaceFromMapsUrl(url);
      if (!placeName) {
        alert("Could not extract business name from this Google Maps link. Try a link that contains '/maps/place/...'.");
        setFetchingMaps(false);
        return;
      }

      const res = await fetch("/api/google-places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: placeName }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setFetchingMaps(false);
        return;
      }

      if (data.results?.length > 0) {
        const detailRes = await fetch("/api/google-places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeId: data.results[0].placeId }),
        });
        const detail = await detailRes.json();

        if (!detail.error) {
          setSelectedPlace(detail);

          setForm(prev => ({
            ...prev,
            businessName: prev.businessName || detail.name || "",
            address: prev.address || detail.address || "",
            contactPhone: prev.contactPhone || detail.phone || "",
            websiteUrl: prev.websiteUrl || detail.website || "",
            googleProfileScore: detail.totalScore || prev.googleProfileScore,
          }));

          if (detail.website && !form.websiteUrl) {
            setHasWebsite(true);
          }
        }
      } else {
        alert("No matching business found. Try entering the business name manually.");
      }
    } catch (e) {
      console.error("Google Maps fetch failed:", e);
      alert("Failed to fetch business details from Google Maps");
    }
    setFetchingMaps(false);
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

  function toggleService(id: string) {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  function toggleSection(id: string) {
    setSelectedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  return (
    <form onSubmit={e => { e.preventDefault(); }} className="space-y-5">
      <div className="flex items-center gap-1 bg-white rounded-lg border border-[#c3cdd8]/50 p-1 mb-6 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} type="button" onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeTab === i ? "bg-[#004527] text-white" : "text-on-surface-variant hover:bg-surface"
            }`}>
            {tab}
          </button>
        ))}
        {saving && <span className="text-[11px] text-on-surface-variant ml-2 flex items-center gap-1"><span className="material-symbols-outlined text-[12px] animate-spin">progress_activity</span> Saving...</span>}
      </div>

      {/* Tab 0: Business Basics + Google Maps auto-fetch */}
      {activeTab === 0 && (
        <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-[#004527]">business</span>
            <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Business Basics</h3>
          </div>

          {/* Google Maps Link - Primary input */}
          <div className="mb-5 p-4 bg-[#004527]/5 rounded-lg border border-[#004527]/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-[#004527]">map</span>
              <p className="text-[13px] font-semibold text-on-surface">Start with Google Maps Link</p>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-3">Paste the Google Maps link to auto-fill business name, address, phone, and website</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="url"
                  value={form.googleMapsLink}
                  onChange={e => updateField("googleMapsLink", e.target.value)}
                  placeholder="https://www.google.com/maps/place/..."
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]"
                />
              </div>
              <Button type="button" size="sm" loading={fetchingMaps} onClick={fetchFromGoogleMaps}>
                {fetchingMaps ? "Fetching..." : "Fetch Details"}
              </Button>
            </div>
            {selectedPlace && (
              <div className="mt-3 flex items-center gap-2 text-[12px] text-[#15803d]">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Auto-filled from: {selectedPlace.name}
              </div>
            )}
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
                    <p className="text-[12px] text-orange-700 mt-1">The proposal will focus on missed opportunities and the revenue gap from not having an online presence.</p>
                  </div>
                </div>
              </div>
            )}
            <Select name="industry" label="Industry" options={INDUSTRIES} value={form.industry} onChange={e => updateField("industry", e.target.value)} />
            <Input name="existingCrm" label="Existing CRM / Tools" value={form.existingCrm} onChange={e => updateField("existingCrm", e.target.value)} icon="hub" />
            <Input name="address" label="Business Address" value={form.address} onChange={e => updateField("address", e.target.value)} className="md:col-span-2" icon="location_on" />
            <Input name="serviceArea" label="Service Area / Locations" value={form.serviceArea} onChange={e => updateField("serviceArea", e.target.value)} icon="map" />
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

      {/* Tab 1: Online Presence + Revenue Baseline (no GBP lookup - done in step 1) */}
      {activeTab === 1 && (
        <>
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">calculate</span>
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
                    <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Fetching...
                  </span>
                ) : form.lighthousePerformance ? (
                  <span className="text-[12px] text-[#15803d] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Auto-fetched
                  </span>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={fetchPageSpeed}>Fetch Now</Button>
                )
              ) : (
                <span className="text-[12px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span> Skipped - No website
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
            {/* Agentic Browsing - pass ratio, not 0-100 score */}
            <div className="mt-4 p-4 bg-surface rounded-lg border border-[#c3cdd8]/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[16px] text-[#004527]">smart_toy</span>
                <label className="text-[13px] font-medium text-on-surface">Agentic Browsing Readiness</label>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3">Measures how well your site works for AI agents. Score is a pass ratio (e.g. 3/5 checks passed), not a percentage.</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.lighthouseAgenticBrowsing}
                  onChange={e => updateField("lighthouseAgenticBrowsing", e.target.value)}
                  placeholder="e.g. 3/5"
                  className={`w-32 px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={!hasWebsite}
                />
                <span className="text-[12px] text-on-surface-variant">pass ratio (checks passed / total)</span>
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
            <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Select Services</h3>
          </div>
          <p className="text-[12px] text-on-surface-variant mb-4">Choose which services to include in this proposal</p>
          <div className="space-y-2">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <label key={service.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected ? "border-[#004527] bg-[#004527]/5" : "border-[#c3cdd8]/50 hover:bg-surface"
                }`}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleService(service.id)}
                    className="w-4 h-4 rounded border-[#c3cdd8] text-[#004527] focus:ring-[#004527]" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-on-surface">{service.name}</p>
                    {service.shortDescription && <p className="text-[11px] text-on-surface-variant">{service.shortDescription}</p>}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Section Selection + Information Complete */}
      {activeTab === 4 && (
        <>
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

          {/* Information Complete Card */}
          <div className="bg-[#004527]/5 rounded-xl border border-[#004527]/15 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">check_circle</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Information Complete</h3>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-4">All proposal information has been gathered. Click below to save and view the extended proposal.</p>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-2">
        <div>{activeTab > 0 && <Button type="button" variant="outline" onClick={() => setActiveTab(prev => prev - 1)}>Previous</Button>}</div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
          {activeTab < TABS.length - 1 ? (
            <Button type="button" loading={saving} onClick={handleNext}>Save & Next</Button>
          ) : (
            <Button type="button" loading={saving} onClick={handleInformationComplete} size="lg">
              Information Complete
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
