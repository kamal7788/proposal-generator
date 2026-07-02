"use client";

import PricingManager from "./PricingManager";

interface ProposalPricingSectionProps {
  proposalId: string;
  currency: string;
  services?: { id: string; name: string; pricingPackages: any }[];
}

export default function ProposalPricingSection({ proposalId, currency, services }: ProposalPricingSectionProps) {
  return <PricingManager proposalId={proposalId} currency={currency} services={services} />;
}
