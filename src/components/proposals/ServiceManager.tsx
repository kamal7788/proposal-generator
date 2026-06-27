"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
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

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => { data[key] = value; });

    if (editing) {
      await fetch(`/api/services/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/services", {
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
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add Service
        </Button>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service.id}>
            <div className="flex items-start justify-between">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditing(service); setShowForm(true); }}
                >
                  Edit
                </Button>
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
          <Input
            name="name"
            label="Service Name"
            defaultValue={editing?.name}
            required
          />
          <Input
            name="shortDescription"
            label="Short Description"
            defaultValue={editing?.shortDescription || ""}
          />
          <Textarea
            name="description"
            label="Detailed Description"
            defaultValue={editing?.description || ""}
            rows={3}
          />
          <Textarea
            name="outcomes"
            label="Key Outcomes"
            defaultValue={editing?.outcomes || ""}
            rows={2}
          />
          <Textarea
            name="deliverables"
            label="Deliverables"
            defaultValue={editing?.deliverables || ""}
            rows={2}
          />
          <Input
            name="pricingNotes"
            label="Pricing Notes"
            defaultValue={editing?.pricingNotes || ""}
          />
          <Input
            name="proofPoints"
            label="Proof Points / Metrics"
            defaultValue={editing?.proofPoints || ""}
          />
          <Input
            name="timeline"
            label="Timeline"
            defaultValue={editing?.timeline || ""}
          />
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
