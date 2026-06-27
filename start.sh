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
DB_USER="${POSTGRES_USER:-brandid}"

# Extract DB name from DATABASE_URL (handles any naming)
if [ -n "$DATABASE_URL" ]; then
  DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
else
  DB_NAME="${POSTGRES_DB:-brandid_proposals}"
fi
echo "==> Checking if database '$DB_NAME' exists..."
if psql -h db -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  echo "    Database '$DB_NAME' already exists."
else
  echo "    Creating database '$DB_NAME'..."
  psql -h db -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\""
  echo "    Database '$DB_NAME' created."
fi

# ─── Run database migrations ──────────────────────────────────────────
echo "==> Applying database schema..."
npx prisma db push --accept-data-loss || echo "    Schema apply failed, retrying..."
npx prisma db push --accept-data-loss || echo "    Schema apply failed again."
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
