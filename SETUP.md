# Ateres Kallah – Spin to Win Setup Guide

Complete setup instructions for getting the application running in development and production.

## Prerequisites

- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **npm**: 9.x or higher

## Quick Start (Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database - Use your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/ateres_kallah_spin"

# Admin Authentication
ADMIN_PASSWORD="YourSecurePasswordHere123!"

# Email Configuration (Optional for testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
ADMIN_EMAIL="admin@example.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb ateres_kallah_spin

# Update .env with your database URL
DATABASE_URL="postgresql://localhost:5432/ateres_kallah_spin"
```

#### Option B: Cloud Database (Recommended for Production)

**Supabase** (Free tier available):
1. Go to https://supabase.com
2. Create a new project
3. Copy the PostgreSQL connection string
4. Paste it into your `.env` as `DATABASE_URL`

**Neon** (Free tier available):
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Paste it into your `.env` as `DATABASE_URL`

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all necessary tables
- Generate Prisma Client
- Set up the database schema

### 5. (Optional) View Database with Prisma Studio

```bash
npx prisma studio
```

Opens a visual database editor at http://localhost:5555

### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Email Setup (Gmail)

For email notifications when prizes are won:

### 1. Enable 2-Factor Authentication

Go to your Google Account settings and enable 2FA.

### 2. Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Ateres Kallah Spin"
4. Copy the 16-character password

### 3. Update .env

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password-here"
ADMIN_EMAIL="where-to-receive-notifications@gmail.com"
```

## Initial Admin Setup

### 1. Access Admin Panel

Go to http://localhost:3000/admin

### 2. Login

Use the password you set in `.env` as `ADMIN_PASSWORD`

### 3. Add Prizes

1. Go to "Prizes" section
2. Click "Add Prize"
3. Fill in:
   - **Title**: e.g., "Weekend Getaway"
   - **Image URL**: Direct link to prize image (optional)
   - **Total Quantity**: e.g., 5
   - **Weight**: e.g., 10 (higher = more likely to win)

**Weight Examples**:
- Grand Prize (rare): weight = 1
- Mid-tier prizes: weight = 5
- Common prizes: weight = 10

The system will select prizes proportionally. For example:
- Prize A (weight 1) = 1/(1+5+10) = 6.25% chance
- Prize B (weight 5) = 5/(1+5+10) = 31.25% chance
- Prize C (weight 10) = 10/(1+5+10) = 62.5% chance

### 4. Generate Codes

1. Go to "Codes" section
2. Enter number of codes to generate (e.g., 100)
3. Click "Generate Codes"
4. Distribute codes to fundraisers who raised $1,000

### 5. Test the Flow

1. Copy one of the generated codes
2. Open homepage (http://localhost:3000) in incognito window
3. Enter the code
4. Spin the wheel
5. Check admin panel for the winner record
6. Check email for notification (if configured)

## Production Deployment

### Option 1: Vercel (Recommended)

#### 1. Prepare Code

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a repository on GitHub and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ateres-kallah-spin.git
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

#### 3. Add Environment Variables

In Vercel dashboard, add all variables from your `.env`:
- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)

#### 4. Deploy

Click "Deploy". Vercel will build and deploy your app.

#### 5. Run Migrations

After first deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run migration
vercel env pull .env.local
npx prisma migrate deploy
```

### Option 2: Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL database from plugins
6. Railway will auto-detect Next.js and deploy
7. Add environment variables in dashboard
8. Railway will auto-deploy on git push

### Option 3: Self-Hosted

#### Requirements
- Linux server (Ubuntu 22.04 recommended)
- Node.js 18+
- PostgreSQL 14+
- Nginx (for reverse proxy)
- PM2 (for process management)

#### Steps

```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Clone repo
git clone https://github.com/YOUR_REPO/ateres-kallah-spin.git
cd ateres-kallah-spin

# Install packages
npm install

# Create .env file with production values
nano .env

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "ateres-kallah" -- start
pm2 save
pm2 startup

# Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/ateres-kallah

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ateres-kallah /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db push

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### TypeScript Errors

```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Rate Limiting Not Working

Rate limiting uses IP addresses. In development with localhost, all requests appear from the same IP. Test with different browsers/incognito windows.

### Email Not Sending

- Check SMTP credentials
- Verify 2FA is enabled (for Gmail)
- Check spam folder
- View server logs for errors

### Wheel Animation Issues

- Ensure JavaScript is enabled in browser
- Check browser console for errors
- Try different browsers (Chrome recommended)

## Maintenance

### Backup Database

```bash
# Export database
pg_dump -h your-host -U your-user -d ateres_kallah_spin > backup.sql

# Or with Prisma
npx prisma db pull
```

### View Logs (PM2)

```bash
pm2 logs ateres-kallah
pm2 monit
```

### Update Application

```bash
git pull origin main
npm install
npm run build
pm2 restart ateres-kallah
```

## Security Checklist

- [ ] Strong `ADMIN_PASSWORD` (12+ characters, mixed case, numbers, symbols)
- [ ] Database password is strong and unique
- [ ] `.env` is in `.gitignore` (never committed to git)
- [ ] HTTPS enabled in production (via Cloudflare, Let's Encrypt, or Vercel)
- [ ] `NEXT_PUBLIC_APP_URL` matches your actual domain
- [ ] Email SMTP credentials are app passwords, not main account password
- [ ] Regular database backups configured
- [ ] PostgreSQL is not publicly accessible (firewall rules)

## Performance Tips

- Use a CDN (Vercel includes this automatically)
- Enable PostgreSQL connection pooling (included in Prisma)
- Monitor database query performance with Prisma logs
- Keep prize images optimized (< 500KB each)
- Consider adding Redis for rate limiting in high-traffic scenarios

## Support & Contact

For technical issues:
1. Check logs: `pm2 logs` or Vercel logs
2. Check Prisma Studio: `npx prisma studio`
3. Review this guide's troubleshooting section

---

Built for Ateres Kallah with ❤️
