import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import ServiceManager from "@/components/proposals/ServiceManager";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await db.service.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { proposals: true } } },
  });

  return (
    <div>
      <Header title="Service Library" subtitle="Manage your service offerings" />
      <ServiceManager services={services} />
    </div>
  );
}
