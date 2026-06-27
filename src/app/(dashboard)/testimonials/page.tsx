import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import TestimonialManager from "@/components/proposals/TestimonialManager";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Header title="Testimonials" subtitle="Manage client testimonials and proof points" />
      <TestimonialManager testimonials={testimonials} />
    </div>
  );
}
