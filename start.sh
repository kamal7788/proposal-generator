#!/bin/sh

echo "==> BrandAid Proposal Generator — Starting up..."

# ─── Wait for PostgreSQL ──────────────────────────────────────────────
echo "==> Waiting for PostgreSQL to be ready..."
until pg_isready -h db -p 5432 2>/dev/null; do
  echo "    PostgreSQL not ready yet, retrying in 3s..."
  sleep 3
done
echo "==> PostgreSQL is ready."

# ─── Ensure database exists ───────────────────────────────────────────
export PGPASSWORD="${POSTGRES_PASSWORD:-brandid_secret}"
DB_HOST="db"
DB_USER="${POSTGRES_USER:-brandid}"

if [ -n "$DATABASE_URL" ]; then
  DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
else
  DB_NAME="${POSTGRES_DB:-brandid}"
fi
echo "==> Database: '$DB_NAME' on '$DB_HOST' as '$DB_USER'"

echo "==> Checking if database '$DB_NAME' exists..."
if psql -h "$DB_HOST" -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  echo "    Database exists."
else
  echo "    Creating database '$DB_NAME'..."
  psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\""
  echo "    Database created."
fi

# ─── Apply schema via psql ───────────────────────────────────────────
echo "==> Applying database schema..."
TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null || echo "0")
if [ "$TABLE_COUNT" = "0" ]; then
  if [ -f prisma/schema.sql ]; then
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f prisma/schema.sql
    echo "==> Schema applied via SQL."
  else
    echo "    ERROR: prisma/schema.sql not found!"
  fi
else
  echo "==> Schema already exists ($TABLE_COUNT tables), running migrations..."
fi

# ─── Add missing columns (idempotent migrations) ──────────────────────
echo "==> Running column migrations..."

for MIGRATION in \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='currency') THEN ALTER TABLE proposals ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD'; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='websiteSpeedScore') THEN ALTER TABLE proposals ADD COLUMN \"websiteSpeedScore\" INTEGER; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='lighthousePerformance') THEN ALTER TABLE proposals ADD COLUMN \"lighthousePerformance\" INTEGER; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='lighthouseAccessibility') THEN ALTER TABLE proposals ADD COLUMN \"lighthouseAccessibility\" INTEGER; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='lighthouseSeo') THEN ALTER TABLE proposals ADD COLUMN \"lighthouseSeo\" INTEGER; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='lighthouseBestPractices') THEN ALTER TABLE proposals ADD COLUMN \"lighthouseBestPractices\" INTEGER; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='googleProfileScore') THEN ALTER TABLE proposals ADD COLUMN \"googleProfileScore\" INTEGER; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='localSeoScore') THEN ALTER TABLE proposals ADD COLUMN \"localSeoScore\" INTEGER; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='deletionRequested') THEN ALTER TABLE proposals ADD COLUMN \"deletionRequested\" BOOLEAN NOT NULL DEFAULT false; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='deletionReason') THEN ALTER TABLE proposals ADD COLUMN \"deletionReason\" TEXT; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposals' AND column_name='discoveryNotes') THEN ALTER TABLE proposals ADD COLUMN \"discoveryNotes\" TEXT; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='pricingPackages') THEN ALTER TABLE services ADD COLUMN \"pricingPackages\" JSONB; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposal_services' AND column_name='packageName') THEN ALTER TABLE proposal_services ADD COLUMN \"packageName\" TEXT; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposal_services' AND column_name='packagePrice') THEN ALTER TABLE proposal_services ADD COLUMN \"packagePrice\" TEXT; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposal_services' AND column_name='customPrice') THEN ALTER TABLE proposal_services ADD COLUMN \"customPrice\" TEXT; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$" \
  "DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='proposal_services' AND column_name='notes') THEN ALTER TABLE proposal_services ADD COLUMN notes TEXT; END IF; EXCEPTION WHEN OTHERS THEN NULL; END \$\$"
do
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "$MIGRATION" 2>&1 || true
done

echo "==> Column migrations complete."

# ─── Seed + admin user ────────────────────────────────────────────────
echo "==> Seeding database..."
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@brandid.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();

  // Admin user — always sync password from env
  const hash = await bcrypt.hash('${ADMIN_PASSWORD}', 10);
  const existing = await prisma.user.findUnique({ where: { email: '${ADMIN_EMAIL}' } });
  if (!existing) {
    await prisma.user.create({
      data: { name: 'Admin', email: '${ADMIN_EMAIL}', passwordHash: hash, role: 'admin' }
    });
    console.log('    Created admin user: ${ADMIN_EMAIL}');
  } else {
    await prisma.user.update({
      where: { email: '${ADMIN_EMAIL}' },
      data: { passwordHash: hash }
    });
    console.log('    Admin user password synced: ${ADMIN_EMAIL}');
  }

  // Seed services
  const services = [
    { name: 'Website Build / CRO', shortDescription: 'Conversion-focused web design and development', description: 'We build high-performance websites engineered to convert visitors into clients.', outcomes: 'Increased conversions, reduced bounce rates', deliverables: 'Custom website, conversion analytics, A/B testing setup', useCases: 'Outdated sites, low conversion rates', pricingNotes: 'Starting from \$4,500', proofPoints: 'Average 47% increase in conversion rates', timeline: '6-10 weeks', sortOrder: 1 },
    { name: 'CRM System', shortDescription: 'Client relationship management that drives retention', description: 'We implement CRM systems that give you a 360-degree view of every client relationship.', outcomes: 'Improved client retention, better lead management', deliverables: 'CRM setup, custom workflows, team training', useCases: 'Losing leads, poor client tracking', pricingNotes: 'From \$3,500', proofPoints: '35% improvement in lead-to-client conversion', timeline: '3-6 weeks', sortOrder: 2 },
    { name: 'Automation', shortDescription: 'Streamline repetitive tasks with intelligent workflows', description: 'We build automation systems that eliminate manual busywork.', outcomes: 'Time savings, consistent follow-up', deliverables: 'Workflow design, automation setup', useCases: 'Repetitive tasks, missed follow-ups', pricingNotes: 'From \$2,000', proofPoints: '15 hours per week saved', timeline: '2-4 weeks per workflow', sortOrder: 3 },
    { name: 'Long-Term Client Retention', shortDescription: 'Systems that keep clients coming back', description: 'We design retention strategies that turn one-time buyers into lifelong clients.', outcomes: 'Higher lifetime value, reduced churn', deliverables: 'Retention strategy, automated touchpoints', useCases: 'High churn, low repeat business', pricingNotes: 'From \$3,000', proofPoints: '40% reduction in churn within 6 months', timeline: '4-8 weeks', sortOrder: 4 },
    { name: 'Marketing', shortDescription: 'Strategic marketing that drives measurable growth', description: 'We create data-driven marketing strategies that reach your ideal clients.', outcomes: 'Increased awareness, qualified leads', deliverables: 'Marketing strategy, campaign management', useCases: 'Need consistent lead generation', pricingNotes: 'Monthly from \$2,500', proofPoints: '3.2x return on marketing investment', timeline: 'Strategy in 2 weeks', sortOrder: 5 },
    { name: 'Social Management', shortDescription: 'Professional social media presence', description: 'We manage your social media to build authority and drive results.', outcomes: 'Stronger brand presence, engagement', deliverables: 'Content calendar, post creation', useCases: 'Inconsistent social presence', pricingNotes: 'Monthly from \$1,500', proofPoints: '280% increase in engagement', timeline: 'Setup in 1 week', sortOrder: 6 },
    { name: 'Reputation Management', shortDescription: 'Build and protect your online reputation', description: 'We monitor and improve your online reputation across all platforms.', outcomes: 'Higher star ratings, more positive reviews', deliverables: 'Review monitoring, response templates', useCases: 'Poor ratings, negative reviews', pricingNotes: 'Monthly from \$800', proofPoints: '3.8 to 4.6 stars in 6 months', timeline: 'Setup in 1 week', sortOrder: 7 },
    { name: 'Competitor Analysis', shortDescription: 'Know your competition and outperform them', description: 'We conduct deep competitive analysis to identify gaps and opportunities.', outcomes: 'Competitive advantages, market insights', deliverables: 'Competitive report, gap analysis', useCases: 'Entering new markets, losing share', pricingNotes: 'From \$2,000', proofPoints: '5.3 untapped opportunities per analysis', timeline: '2-3 weeks', sortOrder: 8 },
  ];
  for (const s of services) {
    const id = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const found = await prisma.service.findUnique({ where: { id } });
    if (!found) await prisma.service.create({ data: { id, ...s } });
  }
  console.log('    Services seeded.');

  // Seed sections
  const sections = [
    { title: 'About BrandAid', content: 'BrandAid is a strategic growth consultancy that helps businesses unlock their full potential.', category: 'company', sortOrder: 1 },
    { title: 'Why BrandAid', content: 'We focus on building systems that generate revenue long after our engagement ends.', category: 'differentiation', sortOrder: 2 },
    { title: 'Our Process', content: '1. Discovery & Audit\n2. Strategy Design\n3. Implementation\n4. Optimization', category: 'process', sortOrder: 3 },
    { title: 'Testimonials', content: 'Our clients consistently report measurable improvements in leads, revenue, and retention.', category: 'social-proof', sortOrder: 4 },
    { title: 'Next Steps', content: '1. Schedule a strategy call\n2. Complimentary audit\n3. Customized proposal\n4. Begin your growth journey', category: 'cta', sortOrder: 5 },
    { title: 'Frequently Asked Questions', content: 'Q: How long does a typical engagement? A: 6-12 weeks.\nQ: What industries? A: Healthcare, home services, professional services.', category: 'faq', sortOrder: 6 },
  ];
  for (const s of sections) {
    const found = await prisma.reusableSection.findFirst({ where: { title: s.title } });
    if (!found) await prisma.reusableSection.create({ data: s });
  }
  console.log('    Sections seeded.');

  // Seed case studies
  const caseStudies = [
    { title: 'From Website Overhaul to Full-Stack Growth', summary: 'An HVAC company rebuilt their website, implemented CRM, and created automated follow-up.', metrics: { conversionIncrease: '340%', leadGrowth: '185%', roi: '5.2x' }, content: 'Starting with a website redesign, we expanded into CRM, lead nurturing, and reputation management.' },
    { title: 'Automating Client Retention for a Dental Practice', summary: 'Reduced churn and increased lifetime value through automated follow-up.', metrics: { retentionImprovement: '67%', revenueGrowth: '42%' }, content: 'Automated appointment reminders, post-visit follow-ups, and reactivation campaigns.' },
    { title: 'Reputation Recovery & Lead Generation', summary: 'Transformed online presence from 4.2 to 4.8 stars.', metrics: { ratingImprovement: '4.2 to 4.8', newReviews: '+340%' }, content: 'Systematic review generation, response management, and social media strategy.' },
  ];
  for (const cs of caseStudies) {
    const found = await prisma.caseStudy.findFirst({ where: { title: cs.title } });
    if (!found) await prisma.caseStudy.create({ data: cs });
  }
  console.log('    Case studies seeded.');

  // Seed testimonials
  const testimonials = [
    { quote: 'BrandAid built us a client acquisition machine. Leads increased 200%.', authorName: 'Sarah Mitchell', authorRole: 'Owner', company: 'Mitchell Home Services' },
    { quote: 'The CRM implementation changed everything. We have full pipeline visibility.', authorName: 'Dr. James Park', authorRole: 'Managing Partner', company: 'Coastal Dental Group' },
    { quote: 'From 3.5 to 4.8 stars in six months. Transformational.', authorName: 'Maria Rodriguez', authorRole: 'General Manager', company: 'Bella Vista Restaurant' },
  ];
  for (const t of testimonials) {
    const found = await prisma.testimonial.findFirst({ where: { authorName: t.authorName } });
    if (!found) await prisma.testimonial.create({ data: t });
  }
  console.log('    Testimonials seeded.');

  await prisma.\$disconnect();
})();
" 2>&1 || echo "    Seed had errors (non-fatal)."

# ─── Start the Next.js server ────────────────────────────────────────
echo "==> Starting Next.js server on port ${PORT:-3000}..."
exec node server.js
