# BrandAid Proposal Generator

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
# Edit .env with your database URL, AUTH_SECRET, and OPENAI_API_KEY

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
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Auth.js (NextAuth)
- OpenAI GPT-4o
- Puppeteer (PDF)
- Recharts (charts)

## Deployment (Coolify)
See full deployment instructions in the main plan file.

## Environment Variables
See .env.example for all required variables.
