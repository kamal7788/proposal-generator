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

  async function copyShareLink() {
    const url = `${window.location.origin}/p/${shareSlug}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied!");
  }

  return (
    <div className="flex items-center gap-2">
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
      {status === "draft" && (
        <Button
          size="sm"
          loading={loading === "published"}
          onClick={() => updateStatus("published")}
        >
          Publish
        </Button>
      )}
      {status === "published" && (
        <Button
          variant="secondary"
          size="sm"
          loading={loading === "draft"}
          onClick={() => updateStatus("draft")}
        >
          Unpublish
        </Button>
      )}
    </div>
  );
}
