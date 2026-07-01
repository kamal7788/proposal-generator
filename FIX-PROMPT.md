# BrandAid Proposal Generator — Comprehensive Fix Prompt

> **Read `SOURCE-OF-TRUTH.md` first.** It contains the full audit, feature status, security issues, and file structure.

---

## Context

You are fixing a partially-built Next.js 16 (App Router) sales enablement app for BrandAid. The app generates premium proposal microsites and A4 landscape PDFs for Nepali businesses. It's deployed on Coolify with Docker + PostgreSQL + Supabase Storage.

**Current state**: ~35% complete. Core CRUD scaffolding exists but has critical security vulnerabilities, missing features, wrong statuses, and no inline editing. The UI needs to be elevated to a "premium agency pitch" standard.

**Tech**: Next.js 16.2.9, React 19, TypeScript, Tailwind CSS v4, Prisma 5, NextAuth v5 beta, OpenAI GPT-4o, Puppeteer, Recharts (installed but unused), Zod (installed but unused).

**IMPORTANT**: This is Next.js 16 with breaking changes. Read `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

## What You Must Fix

### PHASE 1: SECURITY (Critical — do first)

**1.1 Fix middleware route protection**
- File: `src/proxy.ts`
- Problem: Only checks if cookie exists, not if it's valid JWT
- Fix: Use NextAuth's `auth()` wrapper or validate the JWT in middleware. All protected routes must verify the session, not just cookie presence.

**1.2 Fix user management authorization**
- File: `src/app/api/users/route.ts`
- Problem: Any logged-in user can create users, defaults role to "admin"
- Fix: 
  - Only admins can create/list users
  - Default new users to role "user"
  - Add admin check before creating

- File: `src/app/api/users/[id]/route.ts`
- Problem: Any user can PATCH/DELETE any other user
- Fix: Only admins can modify users. Add `if (session.user.role !== 'admin') return 403`.

**1.3 Fix proposal authorization**
- File: `src/app/api/proposals/[id]/route.ts`
- Problem: No ownership check on PATCH — any logged-in user can edit any proposal
- Fix: Verify `proposal.userId === session.user.id` (or admin) before allowing PATCH/DELETE

**1.4 Fix unauthenticated API endpoints**
- Files: `src/app/api/proposals/[id]/audit/route.ts`, `assumptions/route.ts`, `assets/route.ts`
- Problem: GET endpoints have no `auth()` call
- Fix: Add `const session = await auth(); if (!session) return 401;` to all GET handlers

**1.5 Fix SSRF vulnerabilities**
- File: `src/app/api/page-speed/route.ts`
- Problem: URL param passed directly to Google API with no validation
- Fix: Validate URL is a valid public HTTP/HTTPS URL. Block internal IPs (127.x, 10.x, 192.168.x, 169.254.x, localhost).

- File: `src/app/api/google-places/route.ts`
- Problem: Inputs passed without sanitization
- Fix: Sanitize query and placeId inputs.

**1.6 Fix file upload security**
- Files: `src/app/api/upload/route.ts`, `src/app/api/proposals/[id]/assets/route.ts`
- Problem: No file type validation, no size limit, no filename sanitization
- Fix:
  - Allow only: jpg, jpeg, png, gif, svg, webp, pdf
  - Max file size: 10MB
  - Sanitize filename (strip path traversal chars)
  - Store with UUID prefix to prevent collisions

**1.7 Fix XSS in PDF generation**
- File: `src/app/api/proposals/[id]/pdf/route.ts`
- Problem: User data interpolated into HTML without escaping
- Fix: Create an `escapeHtml()` utility and apply it to all user-controlled data in `generateProposalHtml()`.

**1.8 Add rate limiting**
- Add rate limiting to: login, user creation, AI generation, PageSpeed, Google Places, file upload
- Use a simple in-memory rate limiter or Next.js middleware approach

**1.9 Fix environment security**
- `.env`: Rotate `AUTH_SECRET` to a strong random value (32+ chars). Remove `.env` from git tracking.
- `.env.example`: Change default password to placeholder, add warning comment
- `next.config.ts`: Restrict image domains to specific patterns, not wildcard `**`

**1.10 Add input validation**
- Add Zod schemas for all API route request bodies
- Validate required fields, types, and lengths before passing to Prisma

### PHASE 2: CORE MISSING FEATURES

**2.1 Fix proposal statuses**
- Brief requires: `draft` and `complete` only
- Current: `draft` and `published`
- Changes needed:
  - Update Prisma enum: `status String @default("draft")` (remove "published", "archived")
  - Update all UI references: "Published" → "Complete", "Archived" → remove
  - Update `ProposalsList.tsx` filter tabs
  - Update `ProposalActions.tsx` buttons
  - Update `ProposalForm.tsx` status logic
  - Update PDF route to use `status: "complete"` for public access
  - Update public page to check `status: "complete"`

**2.2 Add password reset flow**
- Create `forgot-password` page with email input
- Create `reset-password` page with token + new password
- Add `PasswordResetToken` model to Prisma (token, userId, expires)
- Add API routes: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- Add link to login page

**2.3 Add 3-tier pricing system**
- Add `PricingPackage` model: id, proposalId, name (Starter/Growth/Scale), description, price, billingPeriod, includedServiceIds (JSON), isDefault
- Add `PricingAddon` model: id, proposalId, name, description, price, billingPeriod
- Add API routes for CRUD
- Create pricing UI in proposal editor with 3 side-by-side cards + add-ons section
- Seed default pricing structure

**2.4 Add case studies selection per proposal**
- Add `ProposalCaseStudy` junction table: id, proposalId, caseStudyId, overriddenFields (JSON)
- Add API route for attaching/detaching case studies
- Add case study picker UI in proposal editor
- Update proposal renderer to show selected case studies

**2.5 Build competitor analysis engine**
- Add `CompetitorSnapshot` model: id, proposalId, name, websiteUrl, metrics (JSON), relativeScores (JSON)
- Build auto-suggest logic (Google Places search by category + location)
- Build scorecard comparison (website quality, SEO, reviews, social, ads, messaging, lead capture)
- Create competitor analysis UI section in proposal
- Limit to 5 competitors per proposal

**2.6 Add charts (Recharts)**
- Recharts is installed but never used
- Add charts to:
  - Audit findings (score distribution bar chart)
  - Revenue opportunity (uplift breakdown bar chart)
  - Competitor comparison (radar chart)
  - Website performance (speed comparison)
- Ensure charts render correctly in PDF export

**2.7 Add internal notes per proposal**
- Add `internalNotes` text field to Proposal model (or a separate InternalNote model)
- Add notes textarea in proposal editor (visible only to logged-in users)
- Hide from public view and PDF export

**2.8 Add missing seed data**
- Add 2 services: Business Data Intelligence, Customer Reactivation
- Add 1 section: Terms & Conditions
- Update `prisma/seed.ts` and `start.sh`

**2.9 Render "Cost of Doing Nothing"**
- The function `calculateCostOfDoingNothing()` exists in `revenue-engine.ts` but is never rendered
- Add a "Cost of Doing Nothing" card in `RevenueOpportunity.tsx` with red accent

### PHASE 3: AI & CONTENT IMPROVEMENTS

**3.1 Make AI prompts modular**
- Current: Single monolithic `buildGenerationPrompt()` function
- Refactor into: `generateExecutiveSummary()`, `generateOpportunityNarrative()`, `generateServiceExplanations()`, `generateRecommendations()`, `generateRevenueNarrative()`, `generateCoverLetter()`, `generateNextSteps()`
- Each function takes structured inputs and returns structured outputs

**3.2 Add per-service AI explanations**
- Generate contextual explanation for each selected service module
- Must NOT overwrite default module descriptions — only augment for this proposal's context

**3.3 Add recommendation copy**
- AI should generate a "What We Recommend and Why" section
- Based on audit findings, selected services, and ROI projections

**3.4 Add cover letter/intro generation**
- AI generates a personalized opening for the proposal
- Uses business name, industry, key pain points

### PHASE 4: PDF EXPORT FIXES

**4.1 Change PDF to A4 landscape**
- File: `src/app/api/proposals/[id]/pdf/route.ts`
- Change Puppeteer settings from `format: "A4", printBackground: true` to include `landscape: true`
- Update HTML template for landscape layout

**4.2 Improve PDF template**
- Match the web renderer's visual quality
- Add cover page with business name and BrandAid branding
- Add footer with BrandAid contact details and page numbers
- Add intelligent page breaks at section boundaries
- Ensure charts render as SVG/canvas in PDF

### PHASE 5: INLINE EDITING

**5.1 Build inline editing system**
- When logged in and viewing preview, make text sections editable
- Implement `contenteditable` on text blocks
- On blur/click-outside, save changes via API
- Add edit indicators (subtle border/overlay on editable sections)
- Support editing: headings, paragraphs, bullet points, pricing text
- Public view remains read-only

### PHASE 6: UI/UX POLISH

**6.1 Make public pages fully responsive**
- Fix nav overflow on mobile (hamburger menu)
- Make grid layouts responsive (stack on mobile)
- Make charts full-width on mobile
- Test all sections at 320px, 768px, 1024px, 1440px

**6.2 Elevate premium aesthetic**
- Add subtle card hover animations
- Add smooth section transitions
- Improve typography hierarchy
- Add depth via layered shadows
- Polish the proposal renderer to feel like a premium microsite

**6.3 Add ROI disclaimers**
- Add specific disclaimers near each ROI chart/number
- State: "Projections are estimates based on industry research and assumed improvements. Actual results may vary."

**6.4 Add empty states**
- No proposals yet → friendly illustration + CTA
- No audits run → prompt to run assessment
- No competitors found → suggestion to add manually
- No case studies selected → prompt to choose from library

**6.5 Add loading states**
- PDF generation loading overlay
- Audit scanning progress indicator
- AI generation streaming feedback

### PHASE 7: DEPLOYMENT & POLISH

**7.1 Verify Docker build**
- Ensure `docker-compose.yml` works with fresh database
- Verify `start.sh` applies all migrations and seeds correctly
- Test PDF generation in Docker container

**7.2 Update documentation**
- Update `README.md` with new features and env vars
- Update `DEPLOY.md` if needed
- Document where ROI assumptions are configured
- Document where AI prompts are managed
- Document where default modules/sections are seeded

---

## Key Files to Reference

| File | Why |
|------|-----|
| `SOURCE-OF-TRUTH.md` | Full audit, feature list, security issues |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Seed data |
| `src/lib/auth.ts` | Auth configuration |
| `src/lib/ai.ts` | AI generation logic |
| `src/lib/revenue-engine.ts` | Revenue calculation |
| `src/proxy.ts` | Route protection |
| `src/app/api/proposals/[id]/pdf/route.ts` | PDF generation |
| `src/components/proposal-renderer/` | All 16 public proposal section components |
| `src/components/proposals/ProposalForm.tsx` | Proposal creation form |
| `src/app/p/[slug]/page.tsx` | Public proposal page |
| `AGENTS.md` | Next.js 16 breaking changes warning |

---

## Constraints

1. **Do NOT overwrite default module descriptions** — AI augments context, defaults stay
2. **Always show 3 pricing tiers** — never auto-select a package
3. **Internal notes must never appear in public view or PDF**
4. **Public proposals must be responsive** — mobile, tablet, desktop
5. **All proposal content must be editable** — down to sentence level
6. **Charts must work in both web and PDF**
7. **Follow existing code conventions** — check neighboring files before writing new ones
8. **Run `npm run lint` and `npm run typecheck` after changes**
9. **Never commit secrets** — check `.env` is gitignored
10. **Keep the app deployable** — verify Docker build after significant changes

---

## Definition of Done

The app is complete when:
- All security issues are resolved
- A logged-in user can create a proposal, fill in business data, run audits, select services, edit content inline, set pricing, preview the microsite, and export a polished A4 landscape PDF
- Public proposal links render a responsive, premium microsite
- AI generates contextual content for each section
- Charts visualize audit scores, revenue projections, and competitor comparisons
- The app deploys cleanly on Coolify via Docker
