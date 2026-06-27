"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
}

export default function TestimonialManager({ testimonials: initial }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState(initial);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => { data[key] = value; });

    try {
      if (editing) {
        const res = await fetch(`/api/testimonials/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setTestimonials(testimonials.map(t => t.id === editing.id ? { ...t, ...updated } : t));
      } else {
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const created = await res.json();
        setTestimonials([created, ...testimonials]);
      }
    } catch (err) {
      console.error("Failed to save testimonial:", err);
    }
    setLoading(false);
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    setTestimonials(testimonials.filter(t => t.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add Testimonial
        </Button>
      </div>

      <div className="space-y-4">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-brand-black italic">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-xs text-brand-neutral mt-2">
                  — {t.authorName}{t.authorRole ? `, ${t.authorRole}` : ""}{t.company ? ` @ ${t.company}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(t); setShowForm(true); }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-brand-danger" onClick={() => handleDelete(t.id)}>
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
        title={editing ? "Edit Testimonial" : "Add Testimonial"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Textarea name="quote" label="Quote" defaultValue={editing?.quote} rows={3} required />
          <Input name="authorName" label="Author Name" defaultValue={editing?.authorName} required />
          <Input name="authorRole" label="Role" defaultValue={editing?.authorRole || ""} />
          <Input name="company" label="Company" defaultValue={editing?.company || ""} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editing ? "Save Changes" : "Add Testimonial"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
