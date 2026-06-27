"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: { proposals: number };
}

export default function UserManager({ users: initial }: { users: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [editing, setEditing] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => { if (value) data[key] = value; });

    try {
      if (editing) {
        if (!data.password) delete data.password;
        const res = await fetch(`/api/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setUsers(users.map(u => u.id === editing.id ? { ...u, ...updated } : u));
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const created = await res.json();
        if (created.error) {
          alert(created.error);
        } else {
          setUsers([{ ...created, _count: { proposals: 0 } }, ...users]);
        }
      }
    } catch (err) {
      console.error("Failed to save user:", err);
    }
    setLoading(false);
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      setUsers(users.filter(u => u.id !== id));
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          + Add User
        </Button>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-brand-black">{user.name || "Unnamed"}</h3>
                  <Badge variant={user.role === "admin" ? "success" : "default"}>
                    {user.role}
                  </Badge>
                  <span className="text-xs text-brand-neutral">
                    {user._count.proposals} proposals
                  </span>
                </div>
                <p className="text-sm text-brand-neutral mt-1">{user.email}</p>
                <p className="text-xs text-brand-neutral mt-0.5">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(user); setShowForm(true); }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-brand-danger" onClick={() => handleDelete(user.id)}>
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
        title={editing ? "Edit User" : "Add User"}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input name="name" label="Full Name" defaultValue={editing?.name || ""} required />
          <Input name="email" label="Email" type="email" defaultValue={editing?.email || ""} required />
          <Input
            name="password"
            label={editing ? "New Password (leave blank to keep)" : "Password"}
            type="password"
            required={!editing}
          />
          <div>
            <label className="block text-[13px] font-medium text-on-surface mb-1.5">Role</label>
            <select
              name="role"
              defaultValue={editing?.role || "admin"}
              className="w-full px-3 py-2.5 border border-[#c3cdd8] rounded-lg text-[13px] bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-[#004527]/15 focus:border-[#004527]"
            >
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editing ? "Save Changes" : "Add User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
