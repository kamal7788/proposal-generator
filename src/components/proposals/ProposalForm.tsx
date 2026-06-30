"use client";

import { useState, useEffect, useCallback } from "react";
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

  // All form state lifted up here so it persists across tab switches
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
    googleBusinessProfile: initialData?.googleBusinessProfile || "",
    currentLeadVolume: initialData?.currentLeadVolume || "",
    currentMonthlyTraffic: initialData?.currentMonthlyTraffic || "",
    approximateRevenue: initialData?.approximateRevenue || "",
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
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(initialData?.googleBusinessData || null);
  const [localSeoGrid, setLocalSeoGrid] = useState<any[]>(initialData?.localSeoGrid || []);
  const [hasWebsite, setHasWebsite] = useState(initialData?.hasWebsite !== false);

  // Auto-fetch assessment data when navigating to Assessment tab
  const autoFetchAssessment = useCallback(async () => {
    if (assessmentFetched) return;
    setAssessmentFetched(true);

    // Auto-fetch PageSpeed if website URL is set and scores are empty
    if (hasWebsite && form.websiteUrl && !form.lighthousePerformance) {
      setFetchingScores(true);
      try {
        const res = await fetch("/api/page-speed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: form.websiteUrl }),
        });
        const data = await res.json();
        if (!data.error) {
          setForm(prev => ({
            ...prev,
            websiteSpeedScore: data.scores.performance,
            lighthousePerformance: data.scores.performance,
            lighthouseAccessibility: data.scores.accessibility,
            lighthouseSeo: data.scores.seo,
            lighthouseBestPractices: data.scores.bestPractices,
          }));
        }
      } catch {}
      setFetchingScores(false);
    }

    // Auto-search Google Places if business name is set and no place selected
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
          // Auto-select first result
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

    // Auto-init empty grid if none exists
    if (localSeoGrid.length === 0) {
      initEmptyGrid();
    }
  }, [form.websiteUrl, form.businessName, form.address, form.lighthousePerformance, selectedPlace, localSeoGrid.length, assessmentFetched]);

  useEffect(() => {
    if (activeTab === 2) autoFetchAssessment();
  }, [activeTab, autoFetchAssessment]);

  function updateField(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function fetchPageSpeed() {
    if (!form.websiteUrl) { alert("Please enter a Website URL first"); return; }
    setFetchingScores(true);
    try {
      const res = await fetch("/api/page-speed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.websiteUrl }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setForm(prev => ({
        ...prev,
        websiteSpeedScore: data.scores.performance,
        lighthousePerformance: data.scores.performance,
        lighthouseAccessibility: data.scores.accessibility,
        lighthouseSeo: data.scores.seo,
        lighthouseBestPractices: data.scores.bestPractices,
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
      setForm(prev => ({ ...prev, googleProfileScore: data.totalScore || "" }));
    } catch { alert("Failed to fetch place details"); }
    setFetchingPlaces(false);
  }

  function handleGridCellClick(row: number, col: number) {
    const rank = prompt("Enter ranking position (1-21, or leave empty for NF):");
    if (rank === null) return;
    const rankNum = rank === "" ? null : parseInt(rank);
    if (rankNum !== null && (isNaN(rankNum) || rankNum < 1)) return;
    setLocalSeoGrid(prev => {
      const existing = prev.find((g: any) => g.row === row && g.col === col);
      if (existing) return prev.map((g: any) => g.row === row && g.col === col ? { ...g, rank: rankNum } : g);
      return [...prev, { row, col, lat: 0, lng: 0, rank: rankNum }];
    });
  }

  function initEmptyGrid() {
    const grid = [];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) grid.push({ row: r, col: c, lat: 0, lng: 0, rank: null });
    setLocalSeoGrid(grid);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const data = { ...form, serviceIds: selectedServices, sectionIds: selectedSections, localSeoGrid, googleBusinessData: selectedPlace, hasWebsite };
    await onSubmit(data);
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
            <Input name="websiteUrl" label="Website URL" value={form.websiteUrl} onChange={e => updateField("websiteUrl", e.target.value)} placeholder="https://" icon="language" />
            <Select name="industry" label="Industry" options={INDUSTRIES} value={form.industry} onChange={e => updateField("industry", e.target.value)} />
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
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Online Presence</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-[#c3cdd8]/50">
                <button
                  type="button"
                  onClick={() => setHasWebsite(!hasWebsite)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${hasWebsite ? "bg-[#004527]" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasWebsite ? "translate-x-5" : ""}`} />
                </button>
                <div>
                  <p className="text-[13px] font-medium text-on-surface">Client has a website</p>
                  <p className="text-[11px] text-on-surface-variant">Toggle off if the business doesn't have a website yet</p>
                </div>
              </div>
              {hasWebsite ? (
                <Input name="websiteUrl" label="Website URL" value={form.websiteUrl} onChange={e => updateField("websiteUrl", e.target.value)} placeholder="https://" icon="language" />
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-orange-600 mt-0.5">info</span>
                    <div>
                      <p className="text-[13px] font-medium text-orange-800">No Website Detected</p>
                      <p className="text-[12px] text-orange-700 mt-1">The proposal will focus on missed opportunities and the revenue gap from not having an online presence. Website performance scores will be skipped.</p>
                    </div>
                  </div>
                </div>
              )}
              <Input name="googleBusinessProfile" label="Google Business Profile Link" value={form.googleBusinessProfile} onChange={e => updateField("googleBusinessProfile", e.target.value)} icon="business_center" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="currentLeadVolume" label="Current Lead Volume" value={form.currentLeadVolume} onChange={e => updateField("currentLeadVolume", e.target.value)} placeholder="e.g. 50/month" icon="trending_up" />
                <Input 
                  name="currentMonthlyTraffic" 
                  label="Monthly Website Traffic" 
                  value={form.currentMonthlyTraffic} 
                  onChange={e => updateField("currentMonthlyTraffic", e.target.value)} 
                  placeholder={hasWebsite ? "e.g. 2000" : "No website - not applicable"} 
                  icon="bar_chart"
                  disabled={!hasWebsite}
                  className={!hasWebsite ? "opacity-50 cursor-not-allowed" : ""}
                />
                <Input name="approximateRevenue" label="Approximate Revenue" value={form.approximateRevenue} onChange={e => updateField("approximateRevenue", e.target.value)} placeholder="e.g. NPR 500,000/mo" icon="payments" />
              </div>
              <Input name="existingCrm" label="Existing CRM / Tools" value={form.existingCrm} onChange={e => updateField("existingCrm", e.target.value)} icon="hub" />
            </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Speed Score</label>
                <input type="number" name="websiteSpeedScore" min="0" max="100" value={form.websiteSpeedScore} onChange={e => updateField("websiteSpeedScore", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Performance</label>
                <input type="number" name="lighthousePerformance" min="0" max="100" value={form.lighthousePerformance} onChange={e => updateField("lighthousePerformance", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Accessibility</label>
                <input type="number" name="lighthouseAccessibility" min="0" max="100" value={form.lighthouseAccessibility} onChange={e => updateField("lighthouseAccessibility", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">SEO</label>
                <input type="number" name="lighthouseSeo" min="0" max="100" value={form.lighthouseSeo} onChange={e => updateField("lighthouseSeo", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Best Practices</label>
                <input type="number" name="lighthouseBestPractices" min="0" max="100" value={form.lighthouseBestPractices} onChange={e => updateField("lighthouseBestPractices", Number(e.target.value))} className={`w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] ${!hasWebsite ? "bg-gray-100 cursor-not-allowed" : ""}`} placeholder="0-100" disabled={!hasWebsite} />
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
                <input type="number" name="googleProfileScore" min="0" max="100" value={form.googleProfileScore} onChange={e => updateField("googleProfileScore", Number(e.target.value))} className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Local SEO Score</label>
                <input type="number" name="localSeoScore" min="0" max="100" value={form.localSeoScore} onChange={e => updateField("localSeoScore", Number(e.target.value))} className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#004527]">grid_view</span>
                <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Local SEO Grid</h3>
              </div>
              {localSeoGrid.length === 0 && !fetchingPlaces && (
                <Button type="button" variant="outline" size="sm" onClick={initEmptyGrid}>Initialize 7x7 Grid</Button>
              )}
              {fetchingPlaces && (
                <span className="text-[12px] text-[#004527] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                  Fetching Google data...
                </span>
              )}
            </div>
            {localSeoGrid.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, minmax(40px, 1fr))" }}>
                  {Array.from({ length: 49 }, (_, i) => {
                    const row = Math.floor(i / 7), col = i % 7;
                    const cell = localSeoGrid.find((g: any) => g.row === row && g.col === col);
                    const rank = cell?.rank;
                    const isCenter = row === 3 && col === 3;
                    let bg = "#6b7280";
                    if (rank != null) { if (rank <= 3) bg = "#15803d"; else if (rank <= 5) bg = "#f59e0b"; else if (rank <= 10) bg = "#f97316"; else bg = "#dc2626"; }
                    return (
                      <button key={i} type="button" onClick={() => handleGridCellClick(row, col)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white cursor-pointer hover:scale-110 transition-transform ${isCenter ? "ring-2 ring-offset-1 ring-[#004527]" : ""}`}
                        style={{ backgroundColor: bg }}>
                        {rank != null ? (rank >= 21 ? "21+" : rank) : "NF"}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2">Click any cell to set ranking position. Center = business location.</p>
              </div>
            ) : <p className="text-[12px] text-on-surface-variant">Click &ldquo;Initialize 7x7 Grid&rdquo; to start mapping local search rankings.</p>}
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
          <p className="text-[12px] text-on-surface-variant mb-4">Choose services and optionally set per-proposal pricing</p>
          <div className="space-y-3">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const packages = service.pricingPackages as any[] || [];
              return (
                <div key={service.id} className={`rounded-lg border transition-all ${isSelected ? "border-[#004527] bg-[#004527]/5" : "border-[#c3cdd8]/50 hover:border-[#004527]/30"}`}>
                  <button type="button" onClick={() => toggleService(service.id)} className="w-full p-4 text-left">
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
            <Button type="button" onClick={() => setActiveTab(activeTab + 1)}>Next</Button>
          ) : (
            <Button type="submit" loading={loading} size="lg">{isEdit ? "Save Changes" : "Create Proposal"}</Button>
          )}
        </div>
      </div>
    </form>
  );
}
