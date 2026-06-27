"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ProposalActionsProps {
  proposalId: string;
  status: string;
  shareSlug: string;
}

export default function ProposalActions({
  proposalId,
  status,
  shareSlug,
}: ProposalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

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

  async function generateAI() {
    setLoading("ai");
    const res = await fetch(`/api/proposals/${proposalId}/generate`, {
      method: "POST",
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "AI generation failed");
    }
    setLoading(null);
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/p/${shareSlug}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied!");
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
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
      <Button
        variant="outline"
        size="sm"
        loading={loading === "ai"}
        onClick={generateAI}
      >
        Generate AI Content
      </Button>
      {status === "draft" && (
        <Button
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
