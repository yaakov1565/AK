# Complete Vercel Deployment & Database Setup Guide

## ✅ Completed Steps
- [x] Logged in to Vercel successfully

---

## 🚀 Next Steps to Complete Deployment with Database

### Step 1: Create Vercel Project & Postgres Database

#### Option A: Via Vercel Dashboard (Recommended - Do This First)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..."** → **Project**
3. **Import Git Repository** or **Continue with other methods**
4. **Configure Project:**
   - Project Name: `ak-spin` (or your preferred name)
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   
5. **Do NOT deploy yet!** Click on **Settings** first

6. **Create PostgreSQL Database:**
   - In your project dashboard, go to **Storage** tab
   - Click **Create Database**
   - Select **Postgres**
   - Name it: `ak-spin-db` (or your choice)
   - Region: Choose closest to your users (e.g., `us-east-1`, `eu-central-1`)
   - Click **Create**
   
7. **Database is now created!** Vercel will automatically add these environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` ← **This is what we need for DATABASE_URL**
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

---

### Step 2: Configure Environment Variables in Vercel

Go to **Project Settings** → **Environment Variables** and add these:

#### Required Variables:

1. **DATABASE_URL** (Auto-created, but verify):
   - Value: Should already be set to the Postgres connection string
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **ADMIN_PASSWORD**:
   - Value: Create a strong password (e.g., `YourSecurePassword123!`)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **SESSION_SECRET**:
   - Generate with: `openssl rand -base64 32` (run this in your terminal)
   - Value: Paste the generated string
   - Environments: ✅ Production, ✅ Preview, ✅ Development

#### Optional Email Variables (can add later):
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_USER`: `your-email@gmail.com`
- `SMTP_PASSWORD`: Your Gmail app password
- `ADMIN_EMAIL`: `admin@example.com`

---

### Step 3: Install PostgreSQL Client Library

Before deploying, ensure the `pg` package is installed:

```bash
npm install pg
```

Then commit the change:
```bash
git add package.json package-lock.json
git commit -m "Add PostgreSQL client"
git push
```

---

### Step 4: Deploy to Vercel

#### Option A: Deploy via Dashboard
1. Go to your project in Vercel Dashboard
2. Click **Deployments** tab
3. Click **Deploy** button
4. Wait for build to complete

#### Option B: Deploy via CLI (What we'll do now)
Run this command:
```bash
vercel --prod
```

This will:
- Build your Next.js application
- Deploy it to production
- Use the environment variables you set

---

### Step 5: Set Up Production Database

After successful deployment, you need to initialize the database. You have two options:

#### Option A: Via Vercel CLI (Recommended)

1. **Pull environment variables locally:**
```bash
vercel env pull .env.production
```

2. **Generate Prisma Client:**
```bash
npx prisma generate
```

3. **Push database schema:**
```bash
DATABASE_URL="$(grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2-)" npx prisma db push
```

4. **Seed the database:**
```bash
DATABASE_URL="$(grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2-)" npx prisma db seed
```

#### Option B: Via Vercel Postgres Dashboard

1. Go to **Storage** → Your Postgres database
2. Click **Query** tab
3. Run the Prisma schema manually or use the **Data** tab to import

---

### Step 6: Alternative - Use Migration Files

Create a migration file for production:

```bash
# Create migration
npx prisma migrate dev --name init

# After deployment, run migrations on production
vercel env pull .env.production
DATABASE_URL="$(grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

---

### Step 7: Verify Deployment

1. **Check deployment URL** (shown after `vercel` command completes)
   - Example: `https://ak-spin-xxx.vercel.app`

2. **Test the application:**
   - Visit the main page
   - Go to `/admin/login`
   - Login with your `ADMIN_PASSWORD`
   - Check if prizes are loaded (if you seeded the database)

3. **Common issues & fixes:**

   **Issue: "Can't reach database server"**
   - Check database URL in environment variables
   - Ensure `DATABASE_URL` or `POSTGRES_PRISMA_URL` is set
   - Verify database is in the same region

   **Issue: "Prisma Client not generated"**
   - Add to `package.json` scripts:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

   **Issue: Tables don't exist**
   - Run `npx prisma db push` with production DATABASE_URL
   - Then run seed script

---

## 📋 Quick Commands Reference

```bash
# Login to Vercel (already done ✅)
vercel login

# Deploy to production
vercel --prod

# Pull environment variables
vercel env pull .env.production

# Generate Prisma client
npx prisma generate

# Push schema to production database
DATABASE_URL="your-prod-url" npx prisma db push

# Seed production database
DATABASE_URL="your-prod-url" npx prisma db seed

# View logs
vercel logs

# Open project in browser
vercel open
```

---

## 🔐 Security Checklist

Before going live:

- [ ] Changed `ADMIN_PASSWORD` from default
- [ ] Generated secure `SESSION_SECRET` (32+ characters)
- [ ] Reviewed all environment variables
- [ ] Tested admin login on production
- [ ] Verified rate limiting works
- [ ] Tested code validation flow
- [ ] Confirmed prize inventory updates correctly

---

## 📊 Post-Deployment Tasks

### Upload Actual Prizes
1. Go to `/admin/prizes` in your production deployment
2. Click **Upload CSV**
3. Use the provided template or create your own
4. Upload your prize list

### Generate Spin Codes
1. Go to `/admin/codes`
2. Enter number of codes to generate
3. Optionally add batch information
4. Download the generated codes CSV
5. Distribute codes to participants

### Monitor Winners
1. Track winners at `/admin/winners`
2. Mark prizes as sent/fulfilled
3. Export winner data for records

---

## 🎯 Database Connection String Format

Your `DATABASE_URL` should look like:
```
postgresql://user:password@host:5432/database?sslmode=require&pgbouncer=true
```

Or use the Vercel-provided `POSTGRES_PRISMA_URL` which is optimized for Prisma.

---

## 🔄 Future Deployments

After initial setup, deploying updates is simple:

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push

# Deploy
vercel --prod
```

Or connect your Git repository to auto-deploy on every push!

---

## 📞 Need Help?

- **Vercel Support**: https://vercel.com/support
- **Vercel Postgres Docs**: https://vercel.com/docs/storage/vercel-postgres
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## 🎉 You're Almost Done!

Follow the steps above and your Spin to Win application will be live with a fully-configured PostgreSQL database!
