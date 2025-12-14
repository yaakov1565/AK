# Deployment Guide

## Option 1: Vercel (Recommended)

### Prerequisites
1. Create a [Vercel account](https://vercel.com)
2. Create a PostgreSQL database (choose one):
   - **Vercel Postgres** (easiest)
   - **Supabase** (free tier available)
   - **Neon** (serverless PostgreSQL)

### Step 1: Migrate Database to PostgreSQL

1. **Update `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Install PostgreSQL client:**
```bash
npm install pg
```

3. **Update your `.env` file:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Set environment variables in Vercel dashboard:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `ADMIN_USERNAME` - Admin username
   - `ADMIN_PASSWORD` - Admin password
   - `SESSION_SECRET` - Random secure string
   - `EMAIL_FROM`, `EMAIL_TO`, `SMTP_*` (optional, for email notifications)

4. **Run database migrations:**
```bash
npx prisma migrate deploy
npx prisma db seed
```

5. **Deploy to production:**
```bash
vercel --prod
```

---

## Option 2: Railway

Railway supports both SQLite (with persistent volumes) and PostgreSQL.

### Steps:
1. Create account at [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add PostgreSQL database from Railway dashboard
4. Set environment variables
5. Deploy automatically on push

**Cost:** ~$5-10/month with database

---

## Option 3: DigitalOcean App Platform

### Steps:
1. Create [DigitalOcean account](https://www.digitalocean.com)
2. Create a Managed PostgreSQL database
3. Deploy from GitHub
4. Set environment variables
5. Configure build command: `npm run build`
6. Configure run command: `npm start`

**Cost:** ~$12/month (app + database)

---

## Option 4: VPS (DigitalOcean Droplet, Linode, etc.)

**Use this if:** You want full control and keep SQLite

### Steps:
1. Create a VPS ($6-12/month)
2. SSH into server
3. Install Node.js, npm, and git
4. Clone repository
5. Install dependencies: `npm install`
6. Build: `npm run build`
7. Use PM2 to keep app running:
```bash
npm install -g pm2
pm2 start npm --name "spin-to-win" -- start
pm2 save
pm2 startup
```
8. Configure Nginx as reverse proxy
9. Set up SSL with Let's Encrypt

**Cost:** $6-12/month
**Complexity:** High (requires server management)

---

## Pre-Deployment Checklist

### Security
- [ ] Change `ADMIN_USERNAME` and `ADMIN_PASSWORD` from defaults
- [ ] Generate strong `SESSION_SECRET` (use: `openssl rand -base64 32`)
- [ ] Review all environment variables
- [ ] Ensure rate limiting is enabled
- [ ] Test admin authentication

### Database
- [ ] Back up current SQLite database if you have data
- [ ] Migrate schema to PostgreSQL
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed initial data: `npx prisma db seed`

### Testing
- [ ] Test code validation flow
- [ ] Test wheel spinning
- [ ] Test admin panel
- [ ] Test prize management
- [ ] Test winner tracking

### Environment Variables
Required for production:
```env
DATABASE_URL="postgresql://..."
ADMIN_USERNAME="your_admin_username"
ADMIN_PASSWORD="your_secure_password"
SESSION_SECRET="your_random_32_char_string"

# Optional - Email notifications
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_TO="admin@yourdomain.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="your_app_password"
```

---

## Recommended: Vercel + Vercel Postgres

### Quick Start:
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link project
vercel link

# 4. Add Vercel Postgres from dashboard
# (https://vercel.com/dashboard -> Storage -> Create Database -> Postgres)

# 5. Pull environment variables
vercel env pull .env.local

# 6. Update Prisma schema to use PostgreSQL
# Edit prisma/schema.prisma as shown above

# 7. Generate Prisma client
npx prisma generate

# 8. Push schema to database
npx prisma db push

# 9. Seed database
npx prisma db seed

# 10. Deploy
vercel --prod
```

**Total cost:** FREE (Vercel Hobby plan + Vercel Postgres free tier)

---

## Migration Script (SQLite → PostgreSQL)

If you have existing data in SQLite:

```bash
# Export data from SQLite
npx prisma db execute --file=export.sql --schema=prisma/schema.prisma

# Then manually import to PostgreSQL or use a tool like:
# https://github.com/prisma/prisma/tree/main/packages/migrate
```

---

## Need Help?

- Vercel docs: https://vercel.com/docs
- Prisma migration guide: https://www.prisma.io/docs/guides/migrate
- Next.js deployment: https://nextjs.org/docs/deployment
