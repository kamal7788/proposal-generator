# BrandAid Proposal Generator — Source of Truth

> **Last audited**: 2026-06-27  
> **Codebase version**: Next.js 16.2.9, React 19, Prisma 5, NextAuth v5 beta  
> **Status**: ~35% complete. Core CRUD scaffolding exists but critical features, security, and polish are missing.

---

## 1. What This App Is

An internal, multi-user sales enablement web application for BrandAid. It generates premium proposal microsites + matching A4 landscape PDFs for Nepali businesses. Only BrandAid staff log in and build proposals. Prospects see read-only public preview links.

**Primary goals**: Faster proposal creation, higher close rate, higher average deal size, more consistent sales messaging, stronger perceived value.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, standalone) | 16.2.9 |
| Language | TypeScript | ^5 |
| React | React + React DOM | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| Icons | Material Symbols | ^0.45.4 |
| Database | PostgreSQL | 16 |
| ORM | Prisma | ^5.22.0 |
| Auth | NextAuth.js (Auth.js) | ^5.0.0-beta.31 |
| AI | OpenAI API (GPT-4o) | ^6.45.0 |
| PDF | Puppeteer | ^25.2.1 |
| Charts | Recharts | ^3.9.0 (installed, UNUSED) |
| Validation | Zod | ^4.4.3 (installed, UNUSED in API routes) |
| Password Hashing | bcryptjs | ^3.0.3 |
| Deployment | Docker (Coolify-ready) | Node 20-slim |

---

## 3. Brand & Design

| Token | Value |
|---|---|
| Primary green | `#1b5e3b` |
| Primary cream | `#efe8db` |
| White | `#ffffff` |
| Black | `#000000` |
| Fonts | DM Sans (body), Hanken Grotesk (headings) |
| Theme | Light only |
| Aesthetic | Premium agency pitch — clean, modern, consulting-grade |

---

## 4. Feature Status Audit

### BUILT (7 features — working)

| # | Feature | Notes |
|---|---------|-------|
| 1 | Auto-fetch from GBP/website | Google Places + PageSpeed APIs integrated |
| 2 | ROI/revenue growth model | `revenue-engine.ts` with 6 assumption types |
| 3 | Section toggles (show/hide) | `isVisible` flag on ProposalSection |
| 4 | Public read-only URL via token | `/p/[slug]` route works |
| 5 | 3 placeholder case studies | Seeded: HVAC, Dental, Restaurant |
| 6 | Brand colors implemented | Green + cream in CSS and components |
| 7 | Assumptions visible in proposal | Assumption model + table renderer |

### PARTIALLY BUILT (10 features — exist but incomplete)

| # | Feature | What Exists | What's Missing |
|---|---------|-------------|----------------|
| 1 | Auth (registration, login) | Login works, user CRUD exists | No admin-only guard on user creation, defaults role to "admin", no password reset |
| 2 | Business input form | Most fields present | Missing: social links, team_size, num_locations fields |
| 3 | Audit/diagnostics engine | AuditItem model + manual CRUD | No automated audit engine — no code generates audits from assessment data |
| 4 | AI generation | Generates 15+ sections | Monolithic prompt (not modular), missing per-service explanations, recommendation copy, cover letter |
| 5 | PDF export | Puppeteer rendering works | A4 portrait (should be landscape), basic template, no charts |
| 6 | Responsive public pages | Uses Tailwind | Not thoroughly responsive — nav overflow on mobile, fixed grids |
| 7 | Default modules | 8 of 10 seeded | Missing: Business Data Intelligence, Customer Reactivation |
| 8 | Default sections | 6 of 7 seeded | Missing: Terms & Conditions |
| 9 | Premium aesthetic | Clean UI, glass morphism | Not polished enough for "premium agency pitch" — needs more motion, depth, hierarchy |
| 10 | "Cost of doing nothing" | Function exists in revenue-engine.ts | NOT rendered in any UI component |

### NOT BUILT (15 features — completely missing)

| # | Feature | Priority | Complexity |
|---|---------|----------|------------|
| 1 | Password reset flow | High | Medium |
| 2 | Proposal statuses (draft/complete) | High | Low — currently uses draft/published |
| 3 | Versioning (up to 3 snapshots) | Medium | High |
| 4 | Competitor analysis engine | High | High — auto-suggest, scorecards, 5 competitors |
| 5 | Inline editing (WYSIWYG) | High | High |
| 6 | Internal notes per proposal | Medium | Low |
| 7 | 3-tier pricing (Starter/Growth/Scale) | High | Medium |
| 8 | Case studies selection per proposal | High | Low — needs junction table |
| 9 | Testimonials by service area | Medium | Low |
| 10 | Charts (Recharts) in proposals | High | Medium |
| 11 | Disclaimers near ROI visuals | Medium | Low |
| 12 | Multi-location business support | Low | Medium |
| 13 | Social links in business form | Medium | Low |
| 14 | Recommendation copy (AI section) | Medium | Low |
| 15 | Cover letter/intro (AI-generated) | Medium | Low |

---

## 5. Security Audit

### CRITICAL (6 issues)

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | Middleware only checks cookie existence, not validity | `src/proxy.ts:12` | Validate JWT in middleware or use NextAuth middleware |
| 2 | Any user can create admin accounts | `src/app/api/users/route.ts:42` | Add admin-only guard, fix default role to "user" |
| 3 | No authorization on user PATCH/DELETE | `src/app/api/users/[id]/route.ts` | Admin-only guard + ownership check |
| 4 | `.env` with weak secrets | `.env:2-6` | Rotate secrets, remove from git, use strong AUTH_SECRET |
| 5 | SSRF via PageSpeed URL param | `src/app/api/page-speed/route.ts:8` | Validate URL against allowlist, block internal IPs |
| 6 | SSRF via Google Places params | `src/app/api/google-places/route.ts` | Sanitize inputs |

### HIGH (8 issues)

| # | Issue | Location |
|---|-------|----------|
| 7 | Unauthenticated audit/assumptions GET | `audit/route.ts:5`, `assumptions/route.ts:5` |
| 8 | Unauthenticated assets listing | `assets/route.ts:7` |
| 9 | No ownership check on proposal PATCH | `proposals/[id]/route.ts:31` |
| 10 | No role checks on resource CRUD | testimonials, case-studies, sections, services |
| 11 | Public page leaks full proposal data | `p/[slug]/page.tsx:14` |
| 12 | Stored XSS in PDF HTML generation | `pdf/route.ts:69` |
| 13 | File upload — no type/size/path validation | `upload/route.ts`, `assets/route.ts` |
| 14 | No rate limiting on any endpoint | All API routes |

### MEDIUM (6 issues)

| # | Issue | Location |
|---|-------|----------|
| 15 | No CSRF protection | All state-changing routes |
| 16 | Error messages leak internals | page-speed, google-places routes |
| 17 | Puppeteer --no-sandbox | `pdf/route.ts:31` |
| 18 | Low bcrypt salt rounds (10) | users route, auth.ts |
| 19 | No input validation / mass assignment | All API routes |
| 20 | Wildcard image domain | `next.config.ts:7` |

### LOW (4 issues)

| # | Issue | Location |
|---|-------|----------|
| 21 | Weak admin password in .env.example | `.env.example:11` |
| 22 | No password reset flow | N/A |
| 23 | Weak AUTH_SECRET enables token forgery | `.env:2` |
| 24 | No explicit SameSite cookie config | `src/lib/auth.ts` |

---

## 6. Data Model (Prisma Schema)

```
User           — id, name, email, passwordHash, role (admin/user)
Account        — OAuth linking (Auth.js)
Session        — JWT sessions
VerificationToken — Email verification
Proposal       — Core entity with 30+ fields including business data, scores, generatedContent (JSONB)
Service        — Service/module catalog with pricingPackages (JSONB)
ProposalService — Junction: proposal ↔ service with custom pricing
ReusableSection — Reusable content blocks
ProposalSection — Sections attached to proposals with visibility
CaseStudy      — Proof points with metrics (JSONB)
Testimonial    — Client quotes
AuditItem      — Audit findings per proposal
Assumption     — Revenue projection assumptions per proposal
UploadedAsset  — File attachments
```

**Missing from brief**: CompetitorSnapshot, PricingPackage (separate), PricingAddon, ProposalVersion, internalNotes field.

---

## 7. Seed Data

| Entity | Count | Items |
|---|---|---|
| Admin user | 1 | admin@brandid.com / admin123 |
| Services | 8 | Website/CRO, CRM, Automation, Retention, Marketing, Social, Reputation, Competitor Analysis |
| Sections | 6 | About BrandAid, Why BrandAid, Our Process, Testimonials, Next Steps, FAQ |
| Case Studies | 3 | HVAC growth, Dental retention, Restaurant reputation |
| Testimonials | 3 | Sarah Mitchell, Dr. James Park, Maria Rodriguez |

**Missing**: Business Data Intelligence service, Customer Reactivation service, Terms & Conditions section.

---

## 8. File Structure Reference

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (redirects to /proposals)
│   │   ├── dashboard/page.tsx
│   │   ├── proposals/
│   │   │   ├── page.tsx (list)
│   │   │   ├── new/page.tsx (create)
│   │   │   └── [id]/
│   │   │       ├── page.tsx (detail)
│   │   │       ├── edit/page.tsx
│   │   │       └── preview/page.tsx
│   │   ├── services/page.tsx
│   │   ├── sections/page.tsx
│   │   ├── case-studies/page.tsx
│   │   ├── testimonials/page.tsx
│   │   └── users/page.tsx
│   ├── p/[slug]/page.tsx (public proposal)
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── proposals/ (CRUD + generate/pdf/audit/assumptions/assets)
│       ├── services/, sections/, case-studies/, testimonials/, users/
│       ├── google-places/route.ts
│       ├── page-speed/route.ts
│       └── upload/route.ts
├── components/
│   ├── ui/ (Button, Input, Modal, Badge, Card, LoadingSpinner)
│   ├── layout/ (Sidebar, Header)
│   ├── proposals/ (ProposalsList, ProposalForm, ProposalEditor, ProposalActions, ServiceManager, SectionManager, CaseStudyManager, TestimonialManager, UserManager)
│   └── proposal-renderer/ (16 section components for public view)
├── lib/
│   ├── auth.ts, db.ts, ai.ts, utils.ts, cn.ts
│   ├── google-places.ts, revenue-engine.ts
│   └── proxy.ts
```

---

## 9. API Endpoints

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET/POST | `/api/auth/*` | N/A | NextAuth handler |
| GET/POST | `/api/proposals` | Yes | List/create proposals |
| GET/PATCH/DELETE | `/api/proposals/[id]` | Yes | CRUD proposal |
| POST | `/api/proposals/[id]/generate` | Yes | AI content generation |
| POST | `/api/proposals/[id]/pdf` | Yes | PDF export |
| GET/POST | `/api/proposals/[id]/audit` | POST only | Audit items |
| GET/POST | `/api/proposals/[id]/assumptions` | POST only | Revenue assumptions |
| GET/POST | `/api/proposals/[id]/assets` | POST only | File assets |
| GET/POST | `/api/services` | POST only | Service CRUD |
| PATCH/DELETE | `/api/services/[id]` | Yes | Service update/delete |
| GET/POST | `/api/sections` | POST only | Section CRUD |
| PATCH/DELETE | `/api/sections/[id]` | Yes | Section update/delete |
| GET/POST | `/api/case-studies` | POST only | Case study CRUD |
| PATCH/DELETE | `/api/case-studies/[id]` | Yes | Case study update/delete |
| GET/POST | `/api/testimonials` | POST only | Testimonial CRUD |
| PATCH/DELETE | `/api/testimonials/[id]` | Yes | Testimonial update/delete |
| GET/POST | `/api/users` | Yes | User CRUD |
| PATCH/DELETE | `/api/users/[id]` | Yes | User update/delete |
| POST | `/api/google-places` | **NO** | Google Places search |
| POST | `/api/page-speed` | **NO** | PageSpeed Insights |
| POST | `/api/upload` | Yes | File upload |

---

## 10. Deployment

- **Docker**: Multi-stage Dockerfile (Node 20-slim + Chromium + PostgreSQL client)
- **docker-compose.yml**: app + db services with persistent volumes
- **start.sh**: Entrypoint that waits for DB, applies schema, runs migrations, seeds data, starts Next.js
- **Target**: Coolify deployment on `proposals.brandaid.au`
- **Docs**: `DEPLOY.md` (287 lines, detailed)

---

## 11. What Needs to Happen (Priority Order)

### Phase 1: Security & Foundation (MUST FIX)
1. Fix all 6 Critical security issues
2. Fix all 8 High security issues
3. Fix proposal statuses to draft/complete
4. Add admin-only guards to user management
5. Add authorization checks to all API routes
6. Sanitize file uploads
7. Add rate limiting

### Phase 2: Core Missing Features
1. Password reset flow
2. 3-tier pricing system (Starter/Growth/Scale + add-ons)
3. Case studies selection per proposal (junction table)
4. Competitor analysis engine (auto-suggest, scorecards)
5. Charts in proposals (Recharts — already installed)
6. Internal notes per proposal
7. Missing seed data (2 services, 1 section)

### Phase 3: AI & Content
1. Modular AI prompt functions (per section)
2. Per-service AI explanations
3. Recommendation copy section
4. Cover letter/intro generation
5. Render "Cost of Doing Nothing" in UI

### Phase 4: Editing & UX
1. Inline editing (WYSIWYG) in preview
2. A4 landscape PDF export
3. Responsive public pages
4. Version snapshots (up to 3)
5. Testimonials by service area
6. Social links in business form

### Phase 5: Polish
1. Premium agency pitch aesthetic refinement
2. ROI disclaimers
3. Motion/animation polish
4. Empty states
5. Loading states
