# SECURITY INCIDENT RESPONSE - CREDENTIAL EXPOSURE

## ⚠️ CRITICAL: Immediate Action Required

Your `.env.production` file was accidentally committed to GitHub, exposing sensitive credentials including passwords, database connection strings, and API keys.

---

## 🔴 EXPOSED CREDENTIALS

The following credentials were exposed in git commit `f57de32`:

1. **Admin Password:** `ak@123!`
2. **Admin Username:** `admin`
3. **Database URL:** PostgreSQL connection string with credentials
4. **Prisma Database URL:** API key and connection details
5. **Session Secret:** (placeholder)
6. **Vercel OIDC Token:** JWT token

---

## ✅ COMPLETED STEPS

- [x] Added `.env.production` to `.gitignore`
- [x] Removed `.env.production` from git tracking
- [x] Committed and pushed security fix

---

## 🚨 URGENT STEPS REQUIRED (DO NOW)

### Step 1: Remove File from Git History

The file still exists in git history and can be accessed. You need to completely remove it:

**Option A: Using BFG Repo-Cleaner (Recommended - Faster)**
```bash
# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
cd /tmp
git clone --mirror https://github.com/yaakov1565/AK.git

# Remove the file from history
bfg --delete-files .env.production AK.git

# Clean up
cd AK.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history)
git push --force
```

**Option B: Using git filter-branch**
```bash
cd /Users/yaakovgreenberg/WebApps/AK\ Spin

# Remove file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.production" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history)
git push origin --force --all
git push origin --force --tags
```

### Step 2: Change Admin Password Immediately

1. Go to Vercel Dashboard: https://vercel.com/jacob-greenbergs-projects/ateres_kallah/settings/environment-variables
2. Find `ADMIN_PASSWORD` environment variable
3. Click "Edit" and change it to a strong password
4. Use a password manager to generate a secure password (at least 16 characters)
5. **Recommended new password format:** Use `openssl rand -base64 32` to generate

### Step 3: Rotate Database Credentials

**Prisma Accelerate:**
1. Go to https://console.prisma.io
2. Navigate to your project
3. Generate a new API key
4. Update `PRISMA_DATABASE_URL` in Vercel with the new connection string

**PostgreSQL Database:**
1. Access your Prisma database console
2. Rotate the database password
3. Update `DATABASE_URL` and `POSTGRES_URL` in Vercel with new credentials

### Step 4: Rotate Session Secret

```bash
# Generate a new session secret
openssl rand -base64 32
```

Update `SESSION_SECRET` in Vercel environment variables with the generated value.

### Step 5: Update All Environment Variables in Vercel

Go to: https://vercel.com/jacob-greenbergs-projects/ateres_kallah/settings/environment-variables

Update these variables with new secure values:
- ✅ `ADMIN_PASSWORD` - New strong password
- ✅ `SESSION_SECRET` - New random secret
- ✅ `DATABASE_URL` - New database credentials
- ✅ `POSTGRES_URL` - New database credentials  
- ✅ `PRISMA_DATABASE_URL` - New Prisma API key

### Step 6: Redeploy Application

After updating all environment variables:
```bash
cd /Users/yaakovgreenberg/WebApps/AK\ Spin
vercel --prod
```

---

## 📋 VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] `.env.production` is in `.gitignore`
- [ ] `.env.production` removed from git history (verify with: `git log --all --full-history -- .env.production`)
- [ ] Old admin password no longer works
- [ ] New admin password works
- [ ] Application connects to database successfully
- [ ] No errors in Vercel deployment logs
- [ ] GitGuardian alert is resolved

---

## 🛡️ PREVENTIVE MEASURES

### For This Repository:

1. **Never commit `.env` files** - They are now in `.gitignore`
2. **Use Vercel environment variables** - Set secrets directly in Vercel dashboard
3. **Use git hooks** - Add pre-commit hooks to prevent accidental commits:
   ```bash
   # Install git-secrets
   brew install git-secrets
   git secrets --install
   git secrets --register-aws
   ```

### Security Best Practices:

1. **Use strong passwords:** Minimum 16 characters, random
2. **Rotate credentials regularly:** Every 90 days
3. **Use different passwords:** Never reuse passwords
4. **Enable 2FA:** On GitHub, Vercel, and database providers
5. **Monitor alerts:** Respond to GitGuardian alerts immediately

---

## 🆘 SUPPORT

If you need help:
1. Contact Vercel Support: https://vercel.com/support
2. Contact Prisma Support: https://www.prisma.io/support
3. GitHub Security: https://github.com/security

---

## 📝 INCIDENT LOG

- **Incident Detected:** January 2, 2026, 02:07 UTC
- **Initial Response:** January 2, 2026, 02:09 UTC
- **File Removed from Tracking:** January 2, 2026, 02:09 UTC
- **Awaiting:** Full history removal and credential rotation

**Status:** 🟡 Partially Mitigated - Credentials still need rotation
