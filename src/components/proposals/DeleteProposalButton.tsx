"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function DeleteProposalButton({
  proposalId,
  isAdmin,
  isOwner,
}: {
  proposalId: string;
  isAdmin: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (isAdmin) {
      if (!confirm("Are you sure you want to permanently delete this proposal?")) return;
      setLoading(true);
      await fetch(`/api/proposals/${proposalId}`, { method: "DELETE" });
      router.push("/proposals");
    } else {
      const reason = prompt("Please provide a reason for the deletion request:");
      if (!reason) return;
      setLoading(true);
      await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletionRequested: true, deletionReason: reason }),
      });
      alert("Deletion request submitted. An admin will review it.");
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={loading}
      onClick={handleDelete}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <span className="material-symbols-outlined text-[14px]">delete</span>
      {isAdmin ? "Delete" : "Request Delete"}
    </Button>
  );
}
