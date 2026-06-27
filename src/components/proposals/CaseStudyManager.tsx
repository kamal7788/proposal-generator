"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

interface CaseStudy {
  id: string;
  title: string;
  summary: string | null;
  metrics: any;
  content: string | null;
  imageUrl: string | null;
  service: { name: string } | null;
}

export default function CaseStudyManager({ caseStudies: initial }: { caseStudies: CaseStudy[] }) {
  const [caseStudies, setCaseStudies] = useState(initial);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || null;
    } catch { return null; }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => { data[key] = value; });
    if (data.metrics) { try { data.metrics = JSON.parse(data.metrics); } catch { data.metrics = {}; } }
    data.imageUrl = imageUrl || null;

    try {
      if (editing) {
        const res = await fetch(`/api/case-studies/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        const updated = await res.json();
        setCaseStudies(caseStudies.map(cs => cs.id === editing.id ? { ...cs, ...updated } : cs));
      } else {
        const res = await fetch("/api/case-studies", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        const created = await res.json();
        setCaseStudies([{ ...created, service: null }, ...caseStudies]);
      }
    } catch (err) { console.error("Failed to save case study:", err); }
    setLoading(false);
    setShowForm(false);
    setEditing(null);
    setImageUrl("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this case study?")) return;
    await fetch(`/api/case-studies/${id}`, { method: "DELETE" });
    setCaseStudies(caseStudies.filter(cs => cs.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing(null); setImageUrl(""); setShowForm(true); }}>+ Add Case Study</Button>
      </div>
      <div className="space-y-4">
        {caseStudies.map((cs) => (
          <Card key={cs.id}>
            <div className="flex items-start gap-4">
              {cs.imageUrl && <img src={cs.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1">
                <h3 className="font-semibold text-brand-black">{cs.title}</h3>
                {cs.summary && <p className="text-sm text-brand-neutral mt-1">{cs.summary}</p>}
                {cs.metrics && Object.keys(cs.metrics).length > 0 && (
                  <div className="flex gap-3 mt-2">
                    {Object.entries(cs.metrics).map(([key, value]) => (
                      <span key={key} className="text-xs bg-brand-cream px-2 py-0.5 rounded-full text-brand-green">{key}: {String(value)}</span>
                    ))}
                  </div>
                )}
                {cs.service && <p className="text-xs text-brand-neutral mt-1">Service: {cs.service.name}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(cs); setImageUrl(cs.imageUrl || ""); setShowForm(true); }}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-brand-danger" onClick={() => handleDelete(cs.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); setImageUrl(""); }} title={editing ? "Edit Case Study" : "Add Case Study"} maxWidth="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="title" label="Title" defaultValue={editing?.title} required />
          <Textarea name="summary" label="Summary" defaultValue={editing?.summary || ""} rows={2} />
          <Textarea name="content" label="Full Content" defaultValue={editing?.content || ""} rows={4} />
          <Textarea name="metrics" label="Metrics (JSON)" defaultValue={editing?.metrics ? JSON.stringify(editing.metrics, null, 2) : "{}"} rows={3} placeholder='{"conversionIncrease": "340%", "roi": "5.2x"}' />
          <div>
            <label className="block text-[13px] font-medium text-on-surface mb-1.5">Image</label>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const url = await uploadImage(file); if (url) setImageUrl(url);
              }} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Upload Image</Button>
              <Input name="imageUrl" label="" placeholder="Or paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1" />
            </div>
            {imageUrl && <img src={imageUrl} alt="" className="mt-2 h-20 rounded-lg object-cover" />}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setImageUrl(""); }}>Cancel</Button>
            <Button type="submit" loading={loading}>{editing ? "Save Changes" : "Add Case Study"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
