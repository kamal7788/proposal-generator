"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface PricingPackage {
  id?: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: string;
  isDefault: boolean;
  features: string[];
}

interface PricingAddon {
  id?: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: string;
}

interface PricingManagerProps {
  proposalId: string;
  currency?: string;
  services?: { id: string; name: string; pricingPackages: any }[];
}

function getDefaultPackages(services?: { id: string; name: string; pricingPackages: any }[]): PricingPackage[] {
  // If services have pricing tiers, use them to create default packages
  if (services && services.length > 0) {
    const tierMap: Record<string, { price: number; features: string[] }> = {};

    for (const service of services) {
      if (!service.pricingPackages || !Array.isArray(service.pricingPackages)) continue;
      for (const tier of service.pricingPackages) {
        const name = tier.name || "Tier";
        if (!tierMap[name]) tierMap[name] = { price: 0, features: [] };
        tierMap[name].price += tier.monthlyPrice || 0;
        if (tier.features?.length) {
          tierMap[name].features.push(`${service.name}: ${tier.features.join(", ")}`);
        }
      }
    }

    const tierNames = Object.keys(tierMap);
    if (tierNames.length > 0) {
      return tierNames.map((name, i) => ({
        name,
        description: name === "Growth" ? "Accelerated scaling package" : name === "Scale" ? "Full-market dominance" : "Essential growth foundation",
        price: tierMap[name].price,
        billingPeriod: "monthly",
        isDefault: name === "Growth",
        features: tierMap[name].features,
      }));
    }
  }

  // Fallback defaults
  return [
    { name: "Starter", description: "Essential growth foundation", price: 0, billingPeriod: "monthly", isDefault: false, features: [] },
    { name: "Growth", description: "Accelerated scaling package", price: 0, billingPeriod: "monthly", isDefault: true, features: [] },
    { name: "Scale", description: "Full-market dominance", price: 0, billingPeriod: "monthly", isDefault: false, features: [] },
  ];
}

export default function PricingManager({ proposalId, currency = "NPR", services }: PricingManagerProps) {
  const [packages, setPackages] = useState<PricingPackage[]>(() => getDefaultPackages(services));
  const [addons, setAddons] = useState<PricingAddon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPricing();
  }, [proposalId]);

  async function loadPricing() {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/pricing`);
      if (res.ok) {
        const data = await res.json();
        if (data.packages?.length > 0) {
          setPackages(data.packages.map((p: any) => ({
            ...p,
            features: Array.isArray(p.includedServiceIds) ? p.includedServiceIds : [],
          })));
        }
      }
    } catch {}
  }

  function updatePackage(index: number, field: keyof PricingPackage, value: any) {
    setPackages(prev => prev.map((pkg, i) => i === index ? { ...pkg, [field]: value } : pkg));
  }

  function addFeatureToPackage(pkgIndex: number) {
    setPackages(prev => prev.map((pkg, i) => i === pkgIndex ? { ...pkg, features: [...pkg.features, ""] } : pkg));
  }

  function updateFeature(pkgIndex: number, featureIndex: number, value: string) {
    setPackages(prev => prev.map((pkg, i) => {
      if (i !== pkgIndex) return pkg;
      const features = [...pkg.features];
      features[featureIndex] = value;
      return { ...pkg, features };
    }));
  }

  function removeFeature(pkgIndex: number, featureIndex: number) {
    setPackages(prev => prev.map((pkg, i) => {
      if (i !== pkgIndex) return pkg;
      return { ...pkg, features: pkg.features.filter((_, fi) => fi !== featureIndex) };
    }));
  }

  function setRecommended(index: number) {
    setPackages(prev => prev.map((pkg, i) => ({ ...pkg, isDefault: i === index })));
  }

  async function savePricing() {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages, addons }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Failed to save pricing");
      }
    } catch { alert("Failed to save pricing"); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#004527]">payments</span>
          <h3 className="text-[13px] font-semibold text-on-surface font-[family-name:var(--font-display)]">Pricing Packages</h3>
        </div>
        <Button size="sm" loading={loading} onClick={savePricing}>
          {saved ? "Saved!" : "Save Pricing"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg, i) => (
          <div key={i} className={`rounded-xl border p-4 ${pkg.isDefault ? "border-[#004527] bg-[#004527]/5" : "border-[#c3cdd8]/50 bg-white"}`}>
            <div className="flex items-center justify-between mb-3">
              <input
                value={pkg.name}
                onChange={e => updatePackage(i, "name", e.target.value)}
                className="text-[14px] font-bold text-on-surface bg-transparent border-none outline-none w-full"
                placeholder="Package name"
              />
              <button
                type="button"
                onClick={() => setRecommended(i)}
                className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${pkg.isDefault ? "bg-[#004527] text-white" : "bg-surface text-on-surface-variant hover:bg-[#004527]/10"}`}
              >
                {pkg.isDefault ? "Recommended" : "Set Recommended"}
              </button>
            </div>
            <textarea
              value={pkg.description}
              onChange={e => updatePackage(i, "description", e.target.value)}
              className="w-full text-[12px] text-on-surface-variant bg-transparent border-none outline-none resize-none mb-3"
              rows={2}
              placeholder="Package description"
            />
            <div className="flex items-end gap-1 mb-3">
              <span className="text-[14px] font-medium text-[#004527] pb-1">{currency}</span>
              <input
                type="number"
                value={pkg.price || ""}
                onChange={e => updatePackage(i, "price", Number(e.target.value))}
                className="text-[24px] font-bold text-[#004527] bg-transparent border-none outline-none w-full"
                placeholder="0"
              />
            </div>

            {/* Features */}
            <div className="space-y-1.5 mb-3">
              {pkg.features.map((feature, fi) => (
                <div key={fi} className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-[#004527]">check</span>
                  <input
                    value={feature}
                    onChange={e => updateFeature(i, fi, e.target.value)}
                    className="flex-1 text-[11px] bg-transparent border-none outline-none"
                    placeholder="Feature"
                  />
                  <button type="button" onClick={() => removeFeature(i, fi)} className="text-on-surface-variant hover:text-red-500">
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addFeatureToPackage(i)} className="text-[11px] text-[#004527] hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">add</span> Add feature
              </button>
            </div>

            <select
              value={pkg.billingPeriod}
              onChange={e => updatePackage(i, "billingPeriod", e.target.value)}
              className="w-full text-[11px] border border-[#c3cdd8] rounded px-2 py-1 bg-white"
            >
              <option value="monthly">Monthly</option>
              <option value="one-time">One-time</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
