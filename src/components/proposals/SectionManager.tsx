"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

interface Section {
  id: string;
  title: string;
  content: string;
  category: string | null;
  sortOrder: number;
}

export default function SectionManager({ sections: initialSections }: { sections: Section[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [editing, setEditing] = useState<Section | null>(null);
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
        const res = await fetch(`/api/sections/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setSections(sections.map(s => s.id === editing.id ? { ...s, ...updated } : s));
      } else {
        const res = await fetch("/api/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, sortOrder: sections.length }),
        });
        const created = await res.json();
        setSections([...sections, created]);
      }
    } catch (err) {
      console.error("Failed to save section:", err);
    }
    setLoading(false);
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this section?")) return;
    await fetch(`/api/sections/${id}`, { method: "DELETE" });
    setSections(sections.filter(s => s.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add Section
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-brand-black">{section.title}</h3>
                  {section.category && (
                    <span className="text-xs bg-brand-cream px-2 py-0.5 rounded-full text-brand-green">
                      {section.category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-brand-neutral mt-1 line-clamp-2">
                  {section.content}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(section); setShowForm(true); }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-brand-danger" onClick={() => handleDelete(section.id)}>
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
        title={editing ? "Edit Section" : "Add Section"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="title" label="Section Title" defaultValue={editing?.title} required />
          <Input name="category" label="Category" defaultValue={editing?.category || ""} placeholder="e.g. company, process, cta" />
          <Textarea name="content" label="Content" defaultValue={editing?.content} rows={8} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editing ? "Save Changes" : "Add Section"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
