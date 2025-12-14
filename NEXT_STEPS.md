# 🎯 Next Steps - Complete Deployment Checklist

## ✅ What's Already Done
- [x] Logged in to Vercel
- [x] PostgreSQL client (`pg`) installed
- [x] Prisma schema configured for PostgreSQL
- [x] Project is ready for deployment

---

## 🚀 Follow These Steps in Order

### Step 1: Create Vercel Postgres Database (5 minutes)

**Do this in your browser:**

1. Go to: **https://vercel.com/dashboard**
2. Click **"Add New..."** → **"Project"**
3. Click **"Continue with Git"** or **"Import Repository"**
   - If using Git: Connect your GitHub/GitLab/Bitbucket
   - If not using Git: You can deploy from CLI (we'll do this)
4. **Before deploying**, go to the **Storage** tab (or create project first)
5. Click **"Create Database"** → **"Postgres"**
6. Configure:
   - Database Name: `ak-spin-db`
   - Region: Choose closest to you (e.g., `us-east-1` for US, `fra1` for Europe)
7. Click **"Create"**
8. ✅ **Database created!** Vercel automatically adds environment variables

---

### Step 2: Set Environment Variables in Vercel (3 minutes)

**In your Vercel project dashboard:**

1. Go to **Settings** → **Environment Variables**
2. Add these variables (for **Production**, **Preview**, and **Development**):

#### Required Variables:

**ADMIN_PASSWORD**
```
Value: YourSecurePassword123!
```
(Change this to your own secure password)

**SESSION_SECRET**
```
Generate by running in terminal: openssl rand -base64 32
Then paste the output here
```

The `DATABASE_URL` should already be set automatically by Vercel Postgres.

#### Optional (Email notifications):
- `SMTP_HOST`: smtp.gmail.com
- `SMTP_PORT`: 587
- `SMTP_USER`: your-email@gmail.com
- `SMTP_PASSWORD`: your-gmail-app-password
- `ADMIN_EMAIL`: admin@example.com

**Save all variables!**

---

### Step 3: Generate SESSION_SECRET (30 seconds)

Run this in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and add it as the `SESSION_SECRET` environment variable in Vercel.

---

### Step 4: Set Up Production Database (2 minutes)

Run this automated script:
```bash
./deploy-setup.sh
```

This will:
- Pull environment variables from Vercel
- Generate Prisma Client
- Create all database tables
- Seed with sample prizes

**OR run manually:**
```bash
# Pull environment variables
vercel env pull .env.production

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed
```

---

### Step 5: Deploy to Vercel (3 minutes)

Run:
```bash
vercel --prod
```

This will:
- Build your Next.js app
- Deploy to production
- Give you a live URL

**You'll see output like:**
```
✅ Production: https://ak-spin-xyz123.vercel.app [ready] [3m]
```

---

### Step 6: Verify Deployment (2 minutes)

1. **Visit your deployment URL**
   - You should see the spin wheel entry screen

2. **Test admin login**
   - Go to: `https://your-url.vercel.app/admin/login`
   - Enter your `ADMIN_PASSWORD`
   - You should see the admin dashboard

3. **Check database connection**
   - In admin panel, go to Prizes
   - You should see the seeded prizes
   - Go to Codes section
   - Try generating a test code

4. **Test the wheel**
   - Use a generated code on the main page
   - Spin the wheel
   - Verify winner is recorded in admin panel

---

## 🔧 Troubleshooting

### Issue: "Can't reach database server"
**Solution:** 
- Check that Vercel Postgres database is created
- Verify `POSTGRES_PRISMA_URL` is in environment variables
- Re-pull env variables: `vercel env pull .env.production`

### Issue: "No prizes available"
**Solution:**
- Run: `npx prisma db seed` with production DATABASE_URL
- Or upload prizes via CSV in admin panel

### Issue: Admin login fails
**Solution:**
- Check `ADMIN_PASSWORD` is set in Vercel environment variables
- Verify `SESSION_SECRET` is set (32+ characters)
- Redeploy: `vercel --prod`

### Issue: Build fails
**Solution:**
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `postinstall` script exists: `"postinstall": "prisma generate"`

---

## 📋 Quick Command Reference

```bash
# Generate SESSION_SECRET
openssl rand -base64 32

# Pull environment variables
vercel env pull .env.production

# Set up database (automated)
./deploy-setup.sh

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Open project in browser
vercel open

# View project info
vercel inspect
```

---

## 🎉 After Successful Deployment

### Customize Your Prizes
1. Go to `/admin/prizes`
2. Click "Upload CSV"
3. Use the template or create your own
4. Upload your actual prize list

### Generate Real Codes
1. Go to `/admin/codes`
2. Generate as many codes as needed
3. Download the CSV
4. Distribute to participants

### Monitor Winners
1. Check `/admin/winners` for real-time winner tracking
2. Mark prizes as fulfilled
3. Export data for records

---

## 🔐 Security Reminders

- ✅ Changed `ADMIN_PASSWORD` from default
- ✅ Generated secure `SESSION_SECRET`
- ✅ All sensitive data in environment variables (not in code)
- ✅ Rate limiting enabled (prevents code brute-forcing)
- ✅ PostgreSQL database secured by Vercel

---

## 🚀 You're Ready!

Follow the steps above and you'll have a fully deployed, production-ready Spin to Win application with a PostgreSQL database!

**Any issues?** Check the troubleshooting section or the detailed guides:
- [`COMPLETE_DEPLOYMENT_GUIDE.md`](COMPLETE_DEPLOYMENT_GUIDE.md)
- [`VERCEL_DEPLOYMENT_STEPS.md`](VERCEL_DEPLOYMENT_STEPS.md)
- [`DEPLOYMENT.md`](DEPLOYMENT.md)
