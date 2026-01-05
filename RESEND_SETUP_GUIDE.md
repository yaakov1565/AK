# Resend Email Integration Setup Guide

## ✅ Completed Steps

1. ✅ Installed Resend SDK (`npm install resend`)
2. ✅ Updated `lib/email.ts` to use Resend API
3. ✅ Removed old nodemailer dependency
4. ✅ Updated `.env` and `.env.example` files

## 📋 Required Configuration

### Step 1: Get Your Resend API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key (or use existing one)
3. Copy the API key (starts with `re_...`)

### Step 2: Configure Your Domain

🔴 **IMPORTANT:** You mentioned your domain is verified in Resend. Make sure you know:
- Your verified domain name (e.g., `atereskallah.com`)
- The email address you want to send FROM (e.g., `noreply@atereskallah.com`)

### Step 3: Update Your `.env` File

Open your `.env` file and fill in these values:

```env
# Email Configuration - Resend
RESEND_API_KEY="re_YOUR_ACTUAL_API_KEY_HERE"
EMAIL_FROM="Ateres Kallah <noreply@yourdomain.com>"  # Replace yourdomain.com with your actual domain
ADMIN_EMAIL="your-email@example.com"  # Where YOU want to receive notifications
```

**Example:**
```env
RESEND_API_KEY="re_abc123xyz789..."
EMAIL_FROM="Ateres Kallah <noreply@atereskallah.com>"
ADMIN_EMAIL="admin@gmail.com"
```

### Step 4: Verify Domain in Resend (Skip if Already Done)

If you haven't verified your domain yet:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain name
4. Copy the DNS records provided by Resend
5. Add them to your Cloudflare DNS settings:
   - Go to Cloudflare Dashboard → Your Domain → DNS
   - Add each record exactly as shown in Resend
6. Wait for verification (usually 5-15 minutes)

### Step 5: Test Email Sending

After updating your `.env` file, test the email functionality:

1. Restart your development server:
   ```bash
   # Stop the current server (Ctrl+C in the terminal)
   # Then restart:
   npm run dev
   ```

2. Perform a spin that wins a prize

3. Check your admin email inbox for the notification

4. Check Resend Dashboard → Logs to see if the email was sent

## 🎨 Email Features

Your new email notifications include:

- ✨ Beautiful HTML email template with Ateres Kallah branding
- 📧 Winner information (name and email if provided)
- 🔗 Direct link to admin panel to view winners
- 📊 Email tracking and analytics in Resend dashboard
- 🚀 Better deliverability than SMTP

## 📝 Email Template Preview

When someone wins a prize, the admin will receive an email with:
- **Subject:** 🎉 New Prize Won - [Prize Name]
- **Content:**
  - Prize name (highlighted in gold)
  - Code used
  - Winner's name (if available)
  - Winner's email (if available)
  - Timestamp
  - Link to view in admin panel

## 🔧 For Production Deployment (Vercel)

When deploying to Vercel, you need to add these environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   ```
   RESEND_API_KEY = re_your_api_key
   EMAIL_FROM = Ateres Kallah <noreply@yourdomain.com>
   ADMIN_EMAIL = your-admin-email@example.com
   ```

## 🚨 Troubleshooting

### Email not sending?

1. **Check logs in terminal** - Look for error messages
2. **Verify API key** - Make sure it's correctly copied in `.env`
3. **Check Resend dashboard** - Go to Logs section to see errors
4. **Verify domain** - Ensure your domain is verified in Resend
5. **Check EMAIL_FROM** - Must match your verified domain

### Common Issues

**Error: "Email not verified"**
- Solution: Use an email address from your verified domain

**Error: "Invalid API key"**
- Solution: Check that RESEND_API_KEY is correctly set in `.env`

**No email received:**
- Check spam folder
- Verify ADMIN_EMAIL is correct
- Check Resend dashboard logs

## 📊 Resend Free Tier Limits

- ✅ 3,000 emails per month FREE
- ✅ 100 emails per day
- ✅ Perfect for your spin-to-win app

## 🎯 What's Different from SMTP?

| Feature | Old (SMTP) | New (Resend) |
|---------|-----------|--------------|
| Security | Password in .env | API key (more secure) |
| Setup | Complex SMTP config | Simple API |
| Deliverability | Can go to spam | Better inbox delivery |
| Tracking | None | Full analytics |
| Speed | Slower | Faster |
| Errors | Hard to debug | Clear error messages |

## ✅ Next Steps

1. Add your Resend API key to `.env`
2. Update EMAIL_FROM with your domain
3. Add your admin email to ADMIN_EMAIL
4. Restart the dev server
5. Test by spinning the wheel
6. Check your email!

---

**Need Help?** Check the [Resend Documentation](https://resend.com/docs/introduction)
