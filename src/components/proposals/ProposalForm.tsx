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

  const [fetchingScores, setFetchingScores] = useState(false);
  const [scores, setScores] = useState({
    websiteSpeedScore: initialData?.websiteSpeedScore || "",
    lighthousePerformance: initialData?.lighthousePerformance || "",
    lighthouseAccessibility: initialData?.lighthouseAccessibility || "",
    lighthouseSeo: initialData?.lighthouseSeo || "",
    lighthouseBestPractices: initialData?.lighthouseBestPractices || "",
    googleProfileScore: initialData?.googleProfileScore || "",
    localSeoScore: initialData?.localSeoScore || "",
  });

  const [fetchingPlaces, setFetchingPlaces] = useState(false);
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [localSeoGrid, setLocalSeoGrid] = useState<any[]>(initialData?.localSeoGrid || []);

  async function fetchPageSpeed() {
    const urlInput = document.querySelector<HTMLInputElement>('input[name="websiteUrl"]');
    const url = urlInput?.value;
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
      setScores({
        websiteSpeedScore: data.scores.performance,
        lighthousePerformance: data.scores.performance,
        lighthouseAccessibility: data.scores.accessibility,
        lighthouseSeo: data.scores.seo,
        lighthouseBestPractices: data.scores.bestPractices,
        googleProfileScore: scores.googleProfileScore,
        localSeoScore: scores.localSeoScore,
      });
    } catch (err) {
      alert("Failed to fetch PageSpeed scores");
    }
    setFetchingScores(false);
  }

  async function searchGooglePlaces() {
    const nameInput = document.querySelector<HTMLInputElement>('input[name="businessName"]');
    const addressInput = document.querySelector<HTMLInputElement>('input[name="address"]');
    const query = `${nameInput?.value || ""} ${addressInput?.value || ""}`.trim();
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
    } catch (err) {
      alert("Failed to search Google Places");
    }
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
      setScores(prev => ({
        ...prev,
        googleProfileScore: data.totalScore || "",
      }));
    } catch (err) {
      alert("Failed to fetch place details");
    }
    setFetchingPlaces(false);
  }

  function handleGridCellClick(row: number, col: number) {
    const rank = prompt("Enter ranking position (1-21, or leave empty for NF):");
    if (rank === null) return;
    const rankNum = rank === "" ? null : parseInt(rank);
    if (rankNum !== null && (isNaN(rankNum) || rankNum < 1)) return;
    setLocalSeoGrid(prev => {
      const existing = prev.find((g: any) => g.row === row && g.col === col);
      if (existing) {
        return prev.map((g: any) => g.row === row && g.col === col ? { ...g, rank: rankNum } : g);
      }
      return [...prev, { row, col, lat: 0, lng: 0, rank: rankNum }];
    });
  }

  function initEmptyGrid() {
    const grid = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        grid.push({ row: r, col: c, lat: 0, lng: 0, rank: null });
      }
    }
    setLocalSeoGrid(grid);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => { data[key] = value; });
    data.serviceIds = selectedServices;
    data.sectionIds = selectedSections;
    data.localSeoGrid = localSeoGrid;
    data.googleBusinessData = selectedPlace;
    Object.assign(data, scores);
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
              <select name="currency" defaultValue={initialData?.currency || "USD"}
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
              <Input name="googleBusinessProfile" label="Google Business Profile Link" defaultValue={initialData?.googleBusinessProfile} icon="business_center" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="currentLeadVolume" label="Current Lead Volume" defaultValue={initialData?.currentLeadVolume} placeholder="e.g. 50/month" icon="trending_up" />
                <Input name="currentMonthlyTraffic" label="Monthly Website Traffic" defaultValue={initialData?.currentMonthlyTraffic} placeholder="e.g. 2000" icon="bar_chart" />
                <Input name="approximateRevenue" label="Approximate Revenue" defaultValue={initialData?.approximateRevenue} placeholder="e.g. $500K" icon="payments" />
              </div>
              <Input name="existingCrm" label="Existing CRM / Tools" defaultValue={initialData?.existingCrm} icon="hub" />
            </div>
          </div>

          {/* Google Business Profile Lookup */}
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-[#004527]">search</span>
              <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Google Business Profile Lookup</h3>
            </div>
            <p className="text-[12px] text-on-surface-variant mb-3">Auto-fetch business details, reviews, and photos from Google</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" loading={fetchingPlaces} onClick={searchGooglePlaces}>
                Search Google Places
              </Button>
            </div>
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
              <Textarea name="discoveryNotes" label="Discovery Notes" defaultValue={initialData?.discoveryNotes} rows={3} />
              <Textarea name="painPoints" label="Client Pain Points" defaultValue={initialData?.painPoints} rows={3} />
              <Textarea name="goals" label="Client Goals" defaultValue={initialData?.goals} rows={3} />
              <Textarea name="brandNotes" label="Brand Notes" defaultValue={initialData?.brandNotes} rows={2} />
              <Textarea name="competitors" label="Competitors (URLs)" defaultValue={initialData?.competitors} rows={2} />
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
              <Button type="button" variant="outline" size="sm" loading={fetchingScores} onClick={fetchPageSpeed}>
                Auto-fetch from PageSpeed
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Speed Score</label>
                <input type="number" name="websiteSpeedScore" min="0" max="100" value={scores.websiteSpeedScore}
                  onChange={e => setScores(s => ({ ...s, websiteSpeedScore: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Performance</label>
                <input type="number" name="lighthousePerformance" min="0" max="100" value={scores.lighthousePerformance}
                  onChange={e => setScores(s => ({ ...s, lighthousePerformance: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Accessibility</label>
                <input type="number" name="lighthouseAccessibility" min="0" max="100" value={scores.lighthouseAccessibility}
                  onChange={e => setScores(s => ({ ...s, lighthouseAccessibility: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">SEO</label>
                <input type="number" name="lighthouseSeo" min="0" max="100" value={scores.lighthouseSeo}
                  onChange={e => setScores(s => ({ ...s, lighthouseSeo: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Best Practices</label>
                <input type="number" name="lighthouseBestPractices" min="0" max="100" value={scores.lighthouseBestPractices}
                  onChange={e => setScores(s => ({ ...s, lighthouseBestPractices: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
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
                <input type="number" name="googleProfileScore" min="0" max="100" value={scores.googleProfileScore}
                  onChange={e => setScores(s => ({ ...s, googleProfileScore: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">Local SEO Score</label>
                <input type="number" name="localSeoScore" min="0" max="100" value={scores.localSeoScore}
                  onChange={e => setScores(s => ({ ...s, localSeoScore: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px]" placeholder="0-100" />
              </div>
            </div>
          </div>

          {/* Local SEO Grid */}
          <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#004527]">grid_view</span>
                <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Local SEO Grid</h3>
              </div>
              {localSeoGrid.length === 0 && (
                <Button type="button" variant="outline" size="sm" onClick={initEmptyGrid}>
                  Initialize 7x7 Grid
                </Button>
              )}
            </div>
            {localSeoGrid.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, minmax(40px, 1fr))" }}>
                  {Array.from({ length: 49 }, (_, i) => {
                    const row = Math.floor(i / 7);
                    const col = i % 7;
                    const cell = localSeoGrid.find((g: any) => g.row === row && g.col === col);
                    const rank = cell?.rank;
                    const isCenter = row === 3 && col === 3;
                    let bg = "#6b7280";
                    if (rank != null) {
                      if (rank <= 3) bg = "#15803d";
                      else if (rank <= 5) bg = "#f59e0b";
                      else if (rank <= 10) bg = "#f97316";
                      else bg = "#dc2626";
                    }
                    return (
                      <button key={i} type="button" onClick={() => handleGridCellClick(row, col)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white cursor-pointer hover:scale-110 transition-transform ${
                          isCenter ? "ring-2 ring-offset-1 ring-[#004527]" : ""
                        }`} style={{ backgroundColor: bg }}>
                        {rank != null ? (rank >= 21 ? "21+" : rank) : "NF"}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2">Click any cell to set ranking position. Center = business location.</p>
              </div>
            ) : (
              <p className="text-[12px] text-on-surface-variant">Click &ldquo;Initialize 7x7 Grid&rdquo; to start mapping local search rankings.</p>
            )}
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
          <p className="text-[12px] text-on-surface-variant mb-4">Choose which reusable sections to include</p>
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
        <div>
          {activeTab > 0 && (
            <Button type="button" variant="outline" onClick={() => setActiveTab(activeTab - 1)}>Previous</Button>
          )}
        </div>
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
