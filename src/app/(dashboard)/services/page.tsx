import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import ServiceManager from "@/components/proposals/ServiceManager";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await db.service.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { proposals: true } } },
  });

  const mappedServices = services.map(s => ({
    ...s,
    pricingPackages: Array.isArray(s.pricingPackages) ? s.pricingPackages as any : null,
  }));

  return (
    <div>
      <Header title="Modules" subtitle="Manage your service offerings and bundles" />
      <ServiceManager services={mappedServices} />
    </div>
  );
}
