"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface PricingTier {
  name: string;
  monthlyPrice: number;
  setupFee: number;
  features: string[];
}

interface Service {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  outcomes: string | null;
  deliverables: string | null;
  pricingNotes: string | null;
  pricingPackages: PricingTier[] | null;
  imageUrl: string | null;
  proofPoints: string | null;
  timeline: string | null;
  isActive: boolean;
  _count: { proposals: number };
}

const DEFAULT_TIERS: PricingTier[] = [
  { name: "Starter", monthlyPrice: 0, setupFee: 0, features: [] },
  { name: "Growth", monthlyPrice: 0, setupFee: 0, features: [] },
  { name: "Scale", monthlyPrice: 0, setupFee: 0, features: [] },
];

export default function ServiceManager({ services: initialServices }: { services: Service[] }) {
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [tiers, setTiers] = useState<PricingTier[]>(DEFAULT_TIERS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openForm(service?: Service) {
    if (service) {
      setEditing(service);
      setImageUrl(service.imageUrl || "");
      const pkgs = service.pricingPackages;
      if (Array.isArray(pkgs) && pkgs.length > 0) {
        setTiers(pkgs.map(t => ({
          name: t.name || "Tier",
          monthlyPrice: t.monthlyPrice || 0,
          setupFee: t.setupFee || 0,
          features: Array.isArray(t.features) ? t.features : [],
        })));
      } else {
        setTiers([...DEFAULT_TIERS]);
      }
    } else {
      setEditing(null);
      setImageUrl("");
      setTiers([...DEFAULT_TIERS]);
    }
    setShowForm(true);
  }

  function updateTier(index: number, field: keyof PricingTier, value: any) {
    setTiers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  }

  function addTierFeature(tierIndex: number) {
    setTiers(prev => prev.map((t, i) => i === tierIndex ? { ...t, features: [...t.features, ""] } : t));
  }

  function updateTierFeature(tierIndex: number, featureIndex: number, value: string) {
    setTiers(prev => prev.map((t, i) => {
      if (i !== tierIndex) return t;
      const features = [...t.features];
      features[featureIndex] = value;
      return { ...t, features };
    }));
  }

  function removeTierFeature(tierIndex: number, featureIndex: number) {
    setTiers(prev => prev.map((t, i) => {
      if (i !== tierIndex) return t;
      return { ...t, features: t.features.filter((_, fi) => fi !== featureIndex) };
    }));
  }

  function addTier() {
    setTiers(prev => [...prev, { name: "New Tier", monthlyPrice: 0, setupFee: 0, features: [] }]);
  }

  function removeTier(index: number) {
    setTiers(prev => prev.filter((_, i) => i !== index));
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || null;
    } catch { return null; }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => { data[key] = value; });

    data.pricingPackages = tiers.filter(t => t.name && t.monthlyPrice > 0);
    data.imageUrl = imageUrl || null;

    try {
      if (editing) {
        const res = await fetch(`/api/services/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setServices(services.map(s => s.id === editing.id ? { ...s, ...updated } : s));
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const created = await res.json();
        setServices([{ ...created, _count: { proposals: 0 } }, ...services]);
      }
    } catch (err) {
      console.error("Failed to save service:", err);
    }
    setLoading(false);
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setServices(services.filter(s => s.id !== id));
  }

  function getPricingSummary(service: Service) {
    const pkgs = service.pricingPackages;
    if (!Array.isArray(pkgs) || pkgs.length === 0) return null;
    return pkgs.filter(p => p.monthlyPrice > 0).map(p => `NPR ${p.monthlyPrice.toLocaleString()}/mo`).join(" | ");
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => openForm()}>+ Add Service</Button>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service.id}>
            <div className="flex items-start gap-4">
              {service.imageUrl && <img src={service.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-brand-black">{service.name}</h3>
                  <Badge variant={service.isActive ? "success" : "default"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-brand-neutral">
                    Used in {service._count.proposals} proposals
                  </span>
                </div>
                {service.shortDescription && (
                  <p className="text-sm text-brand-neutral mt-1">{service.shortDescription}</p>
                )}
                {getPricingSummary(service) && (
                  <p className="text-xs text-[#004527] font-medium mt-1">{getPricingSummary(service)}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openForm(service)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-brand-danger" onClick={() => handleDelete(service.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? "Edit Service" : "Add Service"} maxWidth="lg">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" label="Service Name" defaultValue={editing?.name} required />
            <Input name="shortDescription" label="Short Description" defaultValue={editing?.shortDescription || ""} />
          </div>
          <Textarea name="description" label="Detailed Description" defaultValue={editing?.description || ""} rows={3} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea name="outcomes" label="Key Outcomes" defaultValue={editing?.outcomes || ""} rows={2} />
            <Textarea name="deliverables" label="Deliverables" defaultValue={editing?.deliverables || ""} rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="proofPoints" label="Proof Points / Metrics" defaultValue={editing?.proofPoints || ""} />
            <Input name="timeline" label="Timeline" defaultValue={editing?.timeline || ""} />
          </div>
          <Input name="pricingNotes" label="Pricing Notes" defaultValue={editing?.pricingNotes || ""} placeholder="e.g. Custom pricing available for enterprise" />

          {/* Pricing Tiers */}
          <div className="border border-[#c3cdd8]/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[13px] font-semibold text-on-surface">Pricing Tiers</h4>
              <Button type="button" variant="outline" size="sm" onClick={addTier}>+ Add Tier</Button>
            </div>
            <p className="text-[11px] text-on-surface-variant mb-4">Set monthly pricing and optional one-time setup fees for each tier</p>
            <div className="space-y-4">
              {tiers.map((tier, ti) => (
                <div key={ti} className="bg-surface rounded-lg p-4 border border-[#c3cdd8]/30">
                  <div className="flex items-center justify-between mb-3">
                    <input value={tier.name} onChange={e => updateTier(ti, "name", e.target.value)}
                      className="text-[13px] font-bold text-on-surface bg-transparent border-none outline-none" placeholder="Tier name" />
                    {tiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(ti)} className="text-on-surface-variant hover:text-red-500">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[11px] text-on-surface-variant mb-1">Monthly Price (NPR)</label>
                      <input type="number" value={tier.monthlyPrice || ""} onChange={e => updateTier(ti, "monthlyPrice", Number(e.target.value))}
                        className="w-full px-3 py-2 border border-[#c3cdd8] rounded-lg text-[13px] bg-white" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-on-surface-variant mb-1">One-time Setup Fee (NPR)</label>
                      <input type="number" value={tier.setupFee || ""} onChange={e => updateTier(ti, "setupFee", Number(e.target.value))}
                        className="w-full px-3 py-2 border border-[#c3cdd8] rounded-lg text-[13px] bg-white" placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-on-surface-variant mb-1">Included Features</label>
                    <div className="space-y-1.5">
                      {tier.features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-[#004527]">check</span>
                          <input value={feature} onChange={e => updateTierFeature(ti, fi, e.target.value)}
                            className="flex-1 text-[12px] bg-transparent border-none outline-none" placeholder="Feature" />
                          <button type="button" onClick={() => removeTierFeature(ti, fi)} className="text-on-surface-variant hover:text-red-500">
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addTierFeature(ti)} className="text-[11px] text-[#004527] hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">add</span> Add feature
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-[13px] font-medium text-on-surface mb-1.5">Service Image</label>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const url = await uploadImage(file); if (url) setImageUrl(url);
              }} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Upload Image</Button>
              <Input name="imageUrl" label="" placeholder="Or paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1" />
            </div>
            {imageUrl && <img src={imageUrl} alt="" className="mt-2 h-16 rounded-lg object-cover" />}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
            <Button type="submit" loading={loading}>{editing ? "Save Changes" : "Add Service"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
