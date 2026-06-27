# BrandAid Proposal Generator

Premium client proposal generation platform for BrandAid strategic growth consultancy.

## Quick Start

### Prerequisites
- Node.js 20.9+
- PostgreSQL database
- OpenAI API key

### Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npx prisma migrate dev --name init

# Seed demo data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

### Default Admin Login
- Email: admin@brandid.com
- Password: admin123

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** Auth.js (NextAuth)
- **AI:** OpenAI GPT-4o
- **PDF:** Puppeteer
- **Charts:** Recharts

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | Secret for auth sessions | Yes |
| `NEXTAUTH_URL` | App URL (e.g., http://localhost:3000) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI generation | Yes |
| `ADMIN_EMAIL` | Default admin email | No |
| `ADMIN_PASSWORD` | Default admin password | No |

## Docker Deployment (Coolify)

```bash
# Build and start
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy

# Seed data
docker compose exec app npx tsx prisma/seed.ts
```

## Features

### Proposal Builder
- Multi-step form for business details
- Service selection from library
- Reusable section management
- Audit item editor
- Revenue opportunity engine
- AI-powered content generation

### Proposal Rendering
- Premium microsite design
- Inline editing
- Section toggle/reorder
- Responsive layout
- Print-optimized

### Export & Sharing
- PDF export via Puppeteer
- Unique share URLs
- Draft/published states

## Extending

### Adding Services
Navigate to Services in the admin panel to add, edit, or remove service offerings.

### Adding Reusable Sections
Navigate to Sections to create content blocks that can be reused across proposals.

### Customizing AI Prompts
Edit `src/lib/ai.ts` to modify the generation prompts and output structure.

### Adding Audit Categories
Audit items support categories like: website, SEO, listings, reputation, social, lead-capture, CRM, competitor.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities, auth, AI, DB
├── hooks/            # Custom React hooks
└── styles/           # Global styles
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Seed data
```

## License

Proprietary - BrandAid
