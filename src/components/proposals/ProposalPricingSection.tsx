"use client";

import PricingManager from "./PricingManager";

interface ProposalPricingSectionProps {
  proposalId: string;
  currency: string;
}

export default function ProposalPricingSection({ proposalId, currency }: ProposalPricingSectionProps) {
  return <PricingManager proposalId={proposalId} currency={currency} />;
}
