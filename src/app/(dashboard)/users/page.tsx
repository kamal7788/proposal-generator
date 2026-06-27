import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import UserManager from "@/components/proposals/UserManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== "admin") {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Access denied. Admin only.</p>
      </div>
    );
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { proposals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div>
      <Header
        title="Users"
        subtitle="Manage team members and access"
      />
      <UserManager users={serialized as any} />
    </div>
  );
}
