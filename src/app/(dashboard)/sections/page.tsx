import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import SectionManager from "@/components/proposals/SectionManager";

export const dynamic = "force-dynamic";

export default async function SectionsPage() {
  const sections = await db.reusableSection.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <Header title="Sections" subtitle="Manage reusable proposal content blocks" />
      <SectionManager sections={sections} />
    </div>
  );
}
