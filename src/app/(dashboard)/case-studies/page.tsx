import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import CaseStudyManager from "@/components/proposals/CaseStudyManager";

export const dynamic = "force-dynamic";

export default async function CaseStudiesPage() {
  const caseStudies = await db.caseStudy.findMany({
    orderBy: { createdAt: "desc" },
    include: { service: true },
  });

  return (
    <div>
      <Header title="Case Studies" subtitle="Manage proof points and success stories" />
      <CaseStudyManager caseStudies={caseStudies} />
    </div>
  );
}
