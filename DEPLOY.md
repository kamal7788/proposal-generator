# BrandAid Proposal Generator — Coolify Deployment Guide

## Prerequisites

- A Coolify instance (self-hosted or Cloud)
- A GitHub repository with the code pushed
- A domain or subdomain pointed at your Coolify server (e.g. `proposals.yourdomain.com`)
- An OpenAI API key (for AI generation features)

---

## Quick Start (Single Command)

Everything spins up together — PostgreSQL, migrations, seed data, and the app:

```bash
# Clone and configure
git clone https://github.com/kamal7788/proposal-generator.git
cd proposal-generator
cp .env.example .env

# Edit .env with your values
# Generate AUTH_SECRET with: openssl rand -base64 32

# Start everything
docker compose up -d
```

That's it. The `start.sh` entrypoint handles:
1. Waiting for PostgreSQL to be healthy
2. Running `prisma db push` (schema migrations)
3. Seeding the database (services, sections, case studies, testimonials)
4. Creating the admin user
5. Starting the Next.js server

---

## Coolify Deployment

### Step 1: Create a Docker Compose Application

In Coolify:

1. Go to **Applications** → **New Application** → **Docker Compose**
2. Paste this compose configuration:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-brandid}:${POSTGRES_PASSWORD:-brandid_secret}@db:5432/${POSTGRES_DB:-brandid_proposals}
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ADMIN_EMAIL=${ADMIN_EMAIL:-admin@brandid.com}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
    volumes:
      - uploads:/app/public/uploads
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER:-brandid}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-brandid_secret}
      - POSTGRES_DB=${POSTGRES_DB:-brandid_proposals}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-brandid}"]
      interval: 5s
      timeout: 5s
      retries: 10
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```

3. Or connect your GitHub repo and set **Build Pack** to `Dockerfile` — Coolify will use the `docker-compose.yml` from the repo root.

---

### Step 2: Set Environment Variables

In the application's **Environment Variables** tab, add all of these:

| Variable | Value | Notes |
|----------|-------|-------|
| `POSTGRES_USER` | `brandid` | Database username |
| `POSTGRES_PASSWORD` | `<generate a strong password>` | Database password |
| `POSTGRES_DB` | `brandid_proposals` | Database name |
| `AUTH_SECRET` | `<generate with: openssl rand -base64 32>` | Session encryption key |
| `NEXTAUTH_URL` | `https://proposals.yourdomain.com` | Must match your domain exactly |
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
| `ADMIN_EMAIL` | `admin@brandid.com` | Default admin login |
| `ADMIN_PASSWORD` | `<choose a strong password>` | Default admin password |

**Important:** Do NOT use quotes around values in Coolify's env editor.

---

### Step 3: Configure Volumes

In your application settings → **Volumes**, add:

| Source | Destination | Purpose |
|--------|-------------|---------|
| Persistent volume (e.g. `brandid-postgres`) | `/var/lib/postgresql/data` | Database storage |
| Persistent volume (e.g. `brandid-uploads`) | `/app/public/uploads` | Uploaded files |

---

### Step 4: Deploy

1. Click **Deploy** on your application.
2. Watch the build logs — you should see:
   ```
   ==> BrandAid Proposal Generator — Starting up...
   ==> Waiting for PostgreSQL to be ready...
   ==> PostgreSQL is ready.
   ==> Applying database schema...
   ==> Seeding database...
   ==> Starting Next.js server on port 3000...
   ```
3. First deployment takes 2-4 minutes (installs Chromium for PDF export).
4. All services spin up together — no manual migration steps needed.

---

### Step 5: Configure Domain & SSL

1. In your application → **General** → **Domains**
2. Add your domain: `https://proposals.yourdomain.com`
3. Coolify auto-provisions SSL via Let's Encrypt.
4. Ensure DNS has an A or CNAME record pointing to your Coolify server.

---

## What Happens on Startup

The `start.sh` entrypoint runs automatically when the container starts:

```
Container Start
     │
     ▼
Wait for PostgreSQL ──► PostgreSQL not ready? ──► Retry in 3s
     │
     ▼ (PostgreSQL ready)
Run prisma db push ──► Syncs schema (idempotent, safe to re-run)
     │
     ▼
Run prisma db seed ──► Inserts services, sections, case studies, testimonials
     │                  (skips if data already exists)
     ▼
Create admin user ──► Creates admin account from ADMIN_EMAIL/ADMIN_PASSWORD
     │                (skips if user already exists)
     ▼
Start Next.js ──► node server.js on port 3000
```

**Every restart** follows this same flow. Migrations and seeding are idempotent — they won't duplicate data or break existing data.

---

## Verify Deployment

1. Visit `https://proposals.yourdomain.com/login`
2. Log in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`
3. You should see the Proposals dashboard with seed data loaded
4. Create a new proposal to verify the full flow

---

## Post-Deployment Checklist

- [ ] Application accessible at your domain
- [ ] Login works with admin credentials
- [ ] Services list populated (8 services from seed)
- [ ] Reusable sections populated (6 sections from seed)
- [ ] Case studies populated (3 case studies from seed)
- [ ] Can create and edit proposals
- [ ] PDF export works (Chromium in container)
- [ ] AI generation works (OpenAI API key valid)
- [ ] File uploads persist across restarts (volume configured)

---

## Updating the Application

When you push new code to `main`:

1. Coolify auto-redeploys (if auto-deploy enabled)
2. Or click **Redeploy** manually
3. `start.sh` re-runs migrations on every start — schema changes are applied automatically
4. Seed data is idempotent — new items are added, existing ones are preserved

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                     Coolify                           │
│                                                       │
│  ┌───────────────┐         ┌──────────────────────┐  │
│  │   Next.js App  │────────▶│    PostgreSQL         │  │
│  │   (port 3000)  │  wait   │    (port 5432)        │  │
│  │                │─────────▶│                      │  │
│  │  start.sh:     │         │  brandid_proposals    │  │
│  │  1. wait for DB│         │                      │  │
│  │  2. db push    │         │  persistent volume:   │  │
│  │  3. db seed    │         │  postgres_data        │  │
│  │  4. admin user │         └──────────────────────┘  │
│  │  5. serve app  │                                   │
│  │                │         persistent volume:         │
│  │  Chromium ✓    │         uploads                   │
│  └───────────────┘                                   │
│        ▲                                              │
│        │ HTTPS                                        │
│        ▼                                              │
│  ┌───────────────┐                                   │
│  │  Your Domain   │                                  │
│  │  + SSL (LE)    │                                  │
│  └───────────────┘                                   │
└──────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Container exits immediately
Check logs: `docker compose logs app`. Common causes:
- `DATABASE_URL` wrong — ensure it uses `db` as hostname (not `localhost`)
- PostgreSQL not healthy — check `docker compose logs db`

### "Puppeteer failed to launch"
The Dockerfile installs Chromium. Ensure the build completed and `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` is set.

### Database connection refused
- Use `db` as the hostname in `DATABASE_URL` (Docker service name)
- Verify PostgreSQL is healthy: `docker compose ps`
- Check password matches `POSTGRES_PASSWORD`

### "NEXTAUTH_URL mismatch" / Session errors
- Must exactly match your URL: `https://proposals.yourdomain.com`
- No trailing slash

### Seed data not appearing
Check logs for seed output. If it says "Seed skipped or already populated", the data exists. To re-seed, delete the `postgres_data` volume and redeploy.

### Uploads disappear after restart
Ensure the `uploads` volume is configured in Coolify.

---

## Environment Variable Reference

```env
# Database
POSTGRES_USER=brandid
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=brandid_proposals

# App
AUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-domain.com
OPENAI_API_KEY=sk-your-key
ADMIN_EMAIL=admin@brandid.com
ADMIN_PASSWORD=your-strong-password
```

Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```
