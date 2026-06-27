#!/bin/sh
set -e

echo "==> BrandAid Proposal Generator — Starting up..."

# ─── Wait for PostgreSQL ──────────────────────────────────────────────
echo "==> Waiting for PostgreSQL to be ready..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "    PostgreSQL not ready yet, retrying in 3s..."
  sleep 3
done
echo "==> PostgreSQL is ready."

# ─── Run database migrations ──────────────────────────────────────────
echo "==> Applying database schema..."
npx prisma db push --accept-data-loss
echo "==> Schema applied."

# ─── Seed database (idempotent — skips if data exists) ───────────────
echo "==> Seeding database..."
npx prisma db seed || echo "    Seed skipped or already populated."
echo "==> Seed complete."

# ─── Create admin user if it doesn't exist ────────────────────────────
echo "==> Ensuring admin user exists..."
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@brandid.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const prisma = new PrismaClient();
  const existing = await prisma.user.findUnique({ where: { email: '${ADMIN_EMAIL}' } });
  if (!existing) {
    const hash = await bcrypt.hash('${ADMIN_PASSWORD}', 10);
    await prisma.user.create({
      data: { name: 'Admin', email: '${ADMIN_EMAIL}', passwordHash: hash, role: 'admin' }
    });
    console.log('    Created admin user: ${ADMIN_EMAIL}');
  } else {
    console.log('    Admin user already exists: ${ADMIN_EMAIL}');
  }
  await prisma.\$disconnect();
})();
" 2>&1 || echo "    Admin user setup skipped."

# ─── Start the Next.js server ────────────────────────────────────────
echo "==> Starting Next.js server on port ${PORT:-3000}..."
exec node server.js
