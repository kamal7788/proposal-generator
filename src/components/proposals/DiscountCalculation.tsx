"use client";

import { useState, useEffect } from "react";

interface DiscountCalculationProps {
  proposalId: string;
  currency?: string;
  services: { id: string; name: string; pricingPackages: any }[];
  packages: { name: string; price: number; billingPeriod: string; isDefault: boolean }[];
}

export default function DiscountCalculation({ proposalId, currency = "NPR", services, packages }: DiscountCalculationProps) {
  // Calculate sum of individual service tier prices (use the default/selected tier for each service)
  const individualTotal = services.reduce((sum, service) => {
    if (!service.pricingPackages || !Array.isArray(service.pricingPackages)) return sum;
    // Use the first tier (typically Starter) or the default tier price
    const defaultTier = service.pricingPackages.find((t: any) => t.isDefault) || service.pricingPackages[0];
    return sum + (defaultTier?.monthlyPrice || 0);
  }, 0);

  // Get the default bundled package price
  const defaultPackage = packages.find(p => p.isDefault) || packages[0];
  const bundledPrice = defaultPackage?.price || 0;

  // Calculate discount
  const discountAmount = individualTotal - bundledPrice;
  const discountPercent = individualTotal > 0 ? Math.round((discountAmount / individualTotal) * 100) : 0;

  if (individualTotal === 0 || bundledPrice === 0) return null;

  return (
    <div className="mt-4 p-3 bg-[#004527]/5 rounded-lg border border-[#004527]/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-[14px] text-[#004527]">savings</span>
        <span className="text-[12px] font-semibold text-[#004527]">Bundle Discount</span>
      </div>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Individual services total:</span>
          <span className="text-on-surface">{currency} {individualTotal.toLocaleString()}/mo</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Bundled package price:</span>
          <span className="text-on-surface font-medium">{currency} {bundledPrice.toLocaleString()}/mo</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between pt-1 border-t border-[#004527]/10">
            <span className="text-[#004527] font-semibold">You save:</span>
            <span className="text-[#004527] font-bold">
              {currency} {discountAmount.toLocaleString()}/mo ({discountPercent}% off)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
