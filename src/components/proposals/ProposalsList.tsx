"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface Proposal {
  id: string;
  businessName: string;
  contactName: string | null;
  status: string;
  updatedAt: string;
  services: { service: { name: string } }[];
}

export default function ProposalsList({ proposals: initial }: { proposals: Proposal[] }) {
  const [filter, setFilter] = useState<"all" | "draft" | "complete">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "businessName" | "status">("updatedAt");

  const filtered = useMemo(() => {
    let result = [...initial];

    if (filter !== "all") {
      result = result.filter(p => p.status === filter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.businessName.toLowerCase().includes(q) ||
        p.contactName?.toLowerCase().includes(q) ||
        p.services.some(ps => ps.service.name.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "businessName") return a.businessName.localeCompare(b.businessName);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [initial, filter, search, sortBy]);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1 bg-white rounded-lg border border-[#c3cdd8]/50 p-1 w-fit">
          {(["all", "draft", "complete"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                filter === f ? "bg-[#004527] text-white" : "text-on-surface-variant hover:bg-surface"
              }`}
            >
              {f === "all" ? "All" : f === "draft" ? "Draft" : "Complete"}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-1.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004527]/15"
        >
          <option value="updatedAt">Last Updated</option>
          <option value="businessName">Name</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          placeholder="Search proposals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527] transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-3 block">description</span>
          <p className="text-on-surface-variant text-[13px] mb-4">
            {initial.length === 0 ? "No proposals yet" : "No proposals match your filters"}
          </p>
          {initial.length === 0 && (
            <Link href="/proposals/new">
              <button className="bg-[#004527] text-white px-5 py-2 rounded-lg text-[13px] font-medium hover:bg-[#006B3F] transition-colors">
                Create Your First Proposal
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((proposal) => (
            <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
              <div className="bg-white rounded-xl border border-[#c3cdd8]/50 shadow-sm p-5 card-hover cursor-pointer h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
                    {proposal.businessName}
                  </p>
                  <Badge
                    variant={
                      proposal.status === "complete"
                        ? "good"
                        : "warning"
                    }
                  >
                    {proposal.status === "complete" ? "Complete" : "Draft"}
                  </Badge>
                </div>
                <h3 className="text-[15px] font-semibold text-on-surface mb-1 line-clamp-1 font-[family-name:var(--font-display)]">
                  {proposal.contactName ? `Proposal for ${proposal.contactName}` : "Growth Strategy Proposal"}
                </h3>
                <p className="text-[13px] text-on-surface-variant mb-4 line-clamp-2 flex-1">
                  {proposal.services.length} services included
                </p>
                {proposal.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proposal.services.slice(0, 3).map((ps, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-surface px-2 py-0.5 rounded-full text-on-surface-variant border border-[#c3cdd8]/50"
                      >
                        {ps.service.name}
                      </span>
                    ))}
                    {proposal.services.length > 3 && (
                      <span className="text-[11px] text-on-surface-variant">
                        +{proposal.services.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-[#c3cdd8]/30">
                  <span className="text-[11px] text-on-surface-variant">
                    Updated {new Date(proposal.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    chevron_right
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
