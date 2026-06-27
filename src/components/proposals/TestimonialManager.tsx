"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string | null;
  company: string | null;
  imageUrl: string | null;
}

export default function TestimonialManager({ testimonials: initial }: { testimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState(initial);
  const [editing, setEditing] = useState<Testimonial | null>(null);
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
    data.imageUrl = imageUrl || null;

    try {
      if (editing) {
        const res = await fetch(`/api/testimonials/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        const updated = await res.json();
        setTestimonials(testimonials.map(t => t.id === editing.id ? { ...t, ...updated } : t));
      } else {
        const res = await fetch("/api/testimonials", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        const created = await res.json();
        setTestimonials([created, ...testimonials]);
      }
    } catch (err) { console.error("Failed to save testimonial:", err); }
    setLoading(false);
    setShowForm(false);
    setEditing(null);
    setImageUrl("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    setTestimonials(testimonials.filter(t => t.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing(null); setImageUrl(""); setShowForm(true); }}>+ Add Testimonial</Button>
      </div>
      <div className="space-y-4">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <div className="flex items-start gap-4">
              {t.imageUrl && <img src={t.imageUrl} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm text-brand-black italic">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-xs text-brand-neutral mt-2">
                  — {t.authorName}{t.authorRole ? `, ${t.authorRole}` : ""}{t.company ? ` @ ${t.company}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(t); setImageUrl(t.imageUrl || ""); setShowForm(true); }}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-brand-danger" onClick={() => handleDelete(t.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); setImageUrl(""); }} title={editing ? "Edit Testimonial" : "Add Testimonial"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Textarea name="quote" label="Quote" defaultValue={editing?.quote} rows={3} required />
          <Input name="authorName" label="Author Name" defaultValue={editing?.authorName} required />
          <Input name="authorRole" label="Role" defaultValue={editing?.authorRole || ""} />
          <Input name="company" label="Company" defaultValue={editing?.company || ""} />
          <div>
            <label className="block text-[13px] font-medium text-on-surface mb-1.5">Author Photo</label>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const url = await uploadImage(file); if (url) setImageUrl(url);
              }} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Upload Photo</Button>
              <Input name="imageUrl" label="" placeholder="Or paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1" />
            </div>
            {imageUrl && <img src={imageUrl} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" />}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); setImageUrl(""); }}>Cancel</Button>
            <Button type="submit" loading={loading}>{editing ? "Save Changes" : "Add Testimonial"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
