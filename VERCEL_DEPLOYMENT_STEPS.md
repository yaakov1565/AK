# Vercel Deployment - Step-by-Step Guide

## Current Status
Your project is configured for PostgreSQL and ready to deploy to Vercel.

---

## Step 1: Complete Vercel Link
The `vercel link` command is currently running in Terminal 5. 

**Check the terminal output** and follow the prompts:
- Select your Vercel scope (your account or team)
- Choose to create a new project or link to existing
- Confirm the project settings

Once complete, you should see a success message and a `.vercel` directory will be created.

---

## Step 2: Create Vercel Postgres Database

### Option A: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click on the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a database name (e.g., `ak-spin-db`)
7. Select a region (choose one close to your users)
8. Click **Create**

### Option B: Via CLI
```bash
vercel env pull
```
This will prompt you to create a database if needed.

---

## Step 3: Connect Database to Project

After creating the database, Vercel automatically adds environment variables. Pull them locally:

```bash
vercel env pull .env.local
```

This creates a `.env.local` file with the `DATABASE_URL` and other Postgres-specific variables.

---

## Step 4: Set Required Environment Variables in Vercel

Go to your project settings in Vercel Dashboard → Settings → Environment Variables

Add the following variables for **Production**, **Preview**, and **Development**:

### Required Variables:

```
ADMIN_PASSWORD=your-secure-password-here
SESSION_SECRET=generate-with-command-below
```

Generate a secure SESSION_SECRET:
```bash
openssl rand -base64 32
```

### Optional Email Variables (for notifications):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@example.com
```

### App URL (will be auto-generated):
```
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

---

## Step 5: Generate Prisma Client

Make sure you're using the Vercel database URL locally (from `.env.local`):

```bash
npx prisma generate
```

---

## Step 6: Push Database Schema

Push the Prisma schema to your Vercel Postgres database:

```bash
npx prisma db push
```

This creates all the tables (Prize, SpinCode, Winner, RateLimit) in your database.

---

## Step 7: Seed the Database

Populate the database with initial prize data:

```bash
npx prisma db seed
```

Or if that fails:
```bash
npx tsx prisma/seed.ts
```

---

## Step 8: Install PostgreSQL Client (if not already installed)

```bash
npm install pg
```

Commit this change if needed:
```bash
git add package.json package-lock.json
git commit -m "Add pg dependency for PostgreSQL"
```

---

## Step 9: Deploy to Vercel

### First Deployment:
```bash
vercel
```

This deploys to a preview environment. Test it thoroughly.

### Deploy to Production:
Once you've tested the preview:
```bash
vercel --prod
```

---

## Step 10: Verify Deployment

1. **Check the deployment URL** (shown in terminal after deploy)
2. **Test the main page**: Should show the spin wheel entry form
3. **Test admin login**: Go to `/admin/login` and login with your ADMIN_PASSWORD
4. **Check database connection**: Admin panel should show prizes

---

## Troubleshooting

### Issue: "Can't reach database server"
- Verify DATABASE_URL is set in Vercel environment variables
- Make sure you pulled the environment variables: `vercel env pull`

### Issue: "Prisma Client not found"
- Run `npx prisma generate` before deploying
- Make sure `postinstall` script is in package.json

### Issue: Database is empty
- Run migrations on production:
```bash
vercel env pull .env.production
npx prisma db push
npx prisma db seed
```

### Issue: Admin login fails
- Check ADMIN_PASSWORD environment variable in Vercel
- Generate SESSION_SECRET: `openssl rand -base64 32`
- Add both to Vercel environment variables

---

## Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] Can access admin panel at `/admin/login`
- [ ] Admin panel shows prizes
- [ ] Can generate spin codes in admin
- [ ] Spin wheel works with a test code
- [ ] Winner tracking works
- [ ] Prize inventory decrements correctly

---

## Quick Commands Reference

```bash
# Link to Vercel (already running in Terminal 5)
vercel link --yes

# Pull environment variables
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Open project in browser
vercel open
```

---

## Environment Variables Summary

Create a `.env.production` file locally for reference (don't commit):

```env
# Vercel Postgres (auto-generated when you create database)
DATABASE_URL="postgres://..."
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."

# Required - Set manually in Vercel
ADMIN_PASSWORD="your-secure-password"
SESSION_SECRET="generated-with-openssl-rand"

# Optional - Email notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
ADMIN_EMAIL="admin@example.com"

# Auto-set by Vercel
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
```

---

## Next Steps After Deployment

1. **Test thoroughly** with real spin codes
2. **Update the prize list** via CSV upload in admin panel
3. **Generate real spin codes** for your event
4. **Set up custom domain** (optional) in Vercel project settings
5. **Monitor usage** via Vercel dashboard
6. **Backup database** regularly via Vercel dashboard

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Postgres Docs: https://vercel.com/docs/storage/vercel-postgres
- Prisma Docs: https://www.prisma.io/docs
