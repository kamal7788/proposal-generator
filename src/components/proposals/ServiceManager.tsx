"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface Service {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  outcomes: string | null;
  deliverables: string | null;
  pricingNotes: string | null;
  pricingPackages: any;
  imageUrl: string | null;
  proofPoints: string | null;
  timeline: string | null;
  isActive: boolean;
  _count: { proposals: number };
}

export default function ServiceManager({ services: initialServices }: { services: Service[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<Service | null>(null);
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

    // Parse pricing packages
    if (data.pricingPackages) {
      try { data.pricingPackages = JSON.parse(data.pricingPackages); } catch { data.pricingPackages = null; }
    }
    data.imageUrl = imageUrl || null;

    try {
      if (editing) {
        const res = await fetch(`/api/services/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setServices(services.map(s => s.id === editing.id ? { ...s, ...updated } : s));
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const created = await res.json();
        setServices([{ ...created, _count: { proposals: 0 } }, ...services]);
      }
    } catch (err) {
      console.error("Failed to save service:", err);
    }
    setLoading(false);
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setServices(services.filter(s => s.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing(null); setImageUrl(""); setShowForm(true); }}>
          + Add Service
        </Button>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service.id}>
            <div className="flex items-start gap-4">
              {service.imageUrl && <img src={service.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-brand-black">{service.name}</h3>
                  <Badge variant={service.isActive ? "success" : "default"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-brand-neutral">
                    Used in {service._count.proposals} proposals
                  </span>
                </div>
                {service.shortDescription && (
                  <p className="text-sm text-brand-neutral mt-1">{service.shortDescription}</p>
                )}
                {service.pricingNotes && (
                  <p className="text-xs text-brand-green mt-1">{service.pricingNotes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(service); setImageUrl(service.imageUrl || ""); setShowForm(true); }}>Edit</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand-danger"
                  onClick={() => handleDelete(service.id)}
                >
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
        title={editing ? "Edit Service" : "Add Service"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="name" label="Service Name" defaultValue={editing?.name} required />
          <Input name="shortDescription" label="Short Description" defaultValue={editing?.shortDescription || ""} />
          <Textarea name="description" label="Detailed Description" defaultValue={editing?.description || ""} rows={3} />
          <Textarea name="outcomes" label="Key Outcomes" defaultValue={editing?.outcomes || ""} rows={2} />
          <Textarea name="deliverables" label="Deliverables" defaultValue={editing?.deliverables || ""} rows={2} />
          <Input name="pricingNotes" label="Pricing Notes" defaultValue={editing?.pricingNotes || ""} />
          <Input name="proofPoints" label="Proof Points / Metrics" defaultValue={editing?.proofPoints || ""} />
          <Input name="timeline" label="Timeline" defaultValue={editing?.timeline || ""} />
          <Textarea
            name="pricingPackages"
            label="Pricing Packages (JSON)"
            defaultValue={editing?.pricingPackages ? JSON.stringify(editing.pricingPackages, null, 2) : ""}
            rows={4}
            placeholder='[{"name": "Starter", "price": 2500, "features": ["Feature 1"]}, {"name": "Premium", "price": 5000, "features": ["Feature 1", "Feature 2"]}]'
          />
          <div>
            <label className="block text-[13px] font-medium text-on-surface mb-1.5">Service Image</label>
            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const url = await uploadImage(file); if (url) setImageUrl(url);
              }} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Upload Image</Button>
              <Input name="imageUrl" label="" placeholder="Or paste image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1" />
            </div>
            {imageUrl && <img src={imageUrl} alt="" className="mt-2 h-16 rounded-lg object-cover" />}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editing ? "Save Changes" : "Add Service"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
