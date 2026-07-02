"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ProposalActionsProps {
  proposalId: string;
  status: string;
  shareSlug: string;
  hasGeneratedContent?: boolean;
}

const GENERATION_STEPS = [
  "Saving proposal data...",
  "Sending prompts to AI...",
  "Generating section content...",
  "Almost ready...",
];

export default function ProposalActions({
  proposalId,
  status,
  shareSlug,
  hasGeneratedContent,
}: ProposalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    await fetch(`/api/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);
    router.refresh();
  }

  async function generatePdf() {
    setLoading("pdf");
    const res = await fetch(`/api/proposals/${proposalId}/pdf`, {
      method: "POST",
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${proposalId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setLoading(null);
  }

  async function generateProposal() {
    setGenerating(true);
    setGenerationStep(0);

    try {
      setGenerationStep(1);
      await new Promise(r => setTimeout(r, 500));

      setGenerationStep(2);
      const res = await fetch(`/api/proposals/${proposalId}/generate`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "AI generation failed");
      }

      setGenerationStep(3);
      await new Promise(r => setTimeout(r, 800));

      router.refresh();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
    setGenerating(false);
    setGenerationStep(0);
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/p/${shareSlug}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied!");
  }

  if (generating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="bg-white rounded-2xl border border-[#c3cdd8]/50 shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#004527]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-[#004527] animate-pulse">auto_awesome</span>
            </div>
            <h2 className="text-lg font-semibold text-on-surface font-[family-name:var(--font-display)]">Generating Your Proposal</h2>
            <p className="text-[13px] text-on-surface-variant mt-1">AI is crafting custom content for each section</p>
          </div>
          <div className="space-y-3">
            {GENERATION_STEPS.map((step, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                i < generationStep ? "bg-[#004527]/5" :
                i === generationStep ? "bg-[#004527]/10 ring-1 ring-[#004527]/20" :
                "bg-surface"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium ${
                  i < generationStep ? "bg-[#004527] text-white" :
                  i === generationStep ? "bg-[#004527] text-white animate-pulse" :
                  "bg-[#c3cdd8]/50 text-on-surface-variant"
                }`}>
                  {i < generationStep ? "✓" : i + 1}
                </div>
                <span className={`text-[13px] ${
                  i <= generationStep ? "text-on-surface font-medium" : "text-on-surface-variant"
                }`}>{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="h-1.5 bg-[#c3cdd8]/30 rounded-full overflow-hidden">
              <div className="h-full bg-[#004527] rounded-full transition-all duration-500" style={{ width: `${((generationStep + 1) / GENERATION_STEPS.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        size="sm"
        loading={loading === "ai"}
        onClick={generateProposal}
      >
        Generate Proposal
      </Button>
      {hasGeneratedContent && (
        <>
          <Button variant="outline" size="sm" onClick={copyShareLink}>
            Copy Share Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={loading === "pdf"}
            onClick={generatePdf}
          >
            Export PDF
          </Button>
        </>
      )}
      {status === "draft" && (
        <Button
          variant="outline"
          size="sm"
          loading={loading === "complete"}
          onClick={() => updateStatus("complete")}
        >
          Mark Complete
        </Button>
      )}
      {status === "complete" && (
        <Button
          variant="secondary"
          size="sm"
          loading={loading === "draft"}
          onClick={() => updateStatus("draft")}
        >
          Revert to Draft
        </Button>
      )}
    </div>
  );
}
