"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

interface CaseStudy {
  id: string;
  title: string;
  summary: string | null;
  metrics: any;
  content: string | null;
  service: { name: string } | null;
}

export default function CaseStudyManager({ caseStudies: initial }: { caseStudies: CaseStudy[] }) {
  const router = useRouter();
  const [caseStudies, setCaseStudies] = useState(initial);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => { data[key] = value; });

    // Parse metrics from JSON string
    if (data.metrics) {
      try {
        data.metrics = JSON.parse(data.metrics);
      } catch {
        data.metrics = {};
      }
    }

    if (editing) {
      await fetch(`/api/case-studies/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setLoading(false);
    setShowForm(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this case study?")) return;
    await fetch(`/api/case-studies/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add Case Study
        </Button>
      </div>

      <div className="space-y-4">
        {caseStudies.map((cs) => (
          <Card key={cs.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-brand-black">{cs.title}</h3>
                {cs.summary && (
                  <p className="text-sm text-brand-neutral mt-1">{cs.summary}</p>
                )}
                {cs.metrics && (
                  <div className="flex gap-3 mt-2">
                    {Object.entries(cs.metrics).map(([key, value]) => (
                      <span key={key} className="text-xs bg-brand-cream px-2 py-0.5 rounded-full text-brand-green">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
                {cs.service && (
                  <p className="text-xs text-brand-neutral mt-1">
                    Service: {cs.service.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(cs); setShowForm(true); }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-brand-danger" onClick={() => handleDelete(cs.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? "Edit Case Study" : "Add Case Study"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="title" label="Title" defaultValue={editing?.title} required />
          <Textarea name="summary" label="Summary" defaultValue={editing?.summary || ""} rows={2} />
          <Textarea name="content" label="Full Content" defaultValue={editing?.content || ""} rows={4} />
          <Textarea
            name="metrics"
            label="Metrics (JSON)"
            defaultValue={editing?.metrics ? JSON.stringify(editing.metrics, null, 2) : "{}"}
            rows={3}
            placeholder='{"conversionIncrease": "340%", "roi": "5.2x"}'
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editing ? "Save Changes" : "Add Case Study"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
