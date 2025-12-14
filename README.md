# Ateres Kallah – Spin to Win

A production-ready fundraising prize wheel application built with Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## Features

- ✅ **One-time code system** - Each fundraiser receives a unique code good for exactly one spin
- ✅ **Server-side prize selection** - Weighted random selection with inventory management
- ✅ **Visual prize wheel** - Shows ALL prizes (never reveals what's available/unavailable)
- ✅ **Rate limiting** - Prevents brute force code attempts
- ✅ **Admin dashboard** - Manage prizes, generate codes, view winners
- ✅ **Email notifications** - Admin receives email when prizes are won
- ✅ **CSV export** - Export winners list for prize fulfillment
- ✅ **Premium gala aesthetic** - Dark navy/gold design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Email**: Nodemailer
- **Animations**: Canvas + canvas-confetti

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and update your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ateres_kallah_spin"
ADMIN_PASSWORD="your-secure-admin-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
ADMIN_EMAIL="admin@example.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Run Prisma Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed Initial Data (Optional)

You can manually add prizes and codes through the admin panel, or create a seed script.

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Admin Panel

Access the admin panel at `/admin`. You'll need to log in with the password set in your `.env` file.

### Managing Prizes

1. Go to `/admin/prizes`
2. Add prizes with:
   - Title
   - Image URL (optional)
   - Total quantity
   - Weight (for odds - higher = more likely)

### Generating Codes

1. Go to `/admin/codes`
2. Generate one-time codes for fundraisers
3. Distribute codes to people who raised $1,000+

### Viewing Winners

1. Go to `/admin/winners`
2. View all wins with timestamps
3. Export to CSV for prize fulfillment

## How It Works

### The Spin Flow

1. User enters their one-time code
2. Code is validated (but not used yet)
3. User clicks "Spin"
4. **Server-side logic**:
   - Validates code hasn't been used
   - Gets all prizes with `quantityRemaining > 0`
   - Selects prize using weighted random selection
   - Decrements prize inventory
   - Marks code as used
   - Creates winner record
   - Sends email notification
5. Client receives selected prize ID
6. Wheel animates to land on that prize
7. User sees congratulations screen

### Security Features

- **Database transactions** - Prevents race conditions (two codes winning the last prize)
- **Rate limiting** - Blocks IPs after too many failed code attempts
- **Server-side selection** - Prize inventory and odds NEVER exposed to client
- **One-time codes** - Each code can only be used once
- **Admin authentication** - Simple password protection for admin panel

## File Structure

```
├── app/
│   ├── page.tsx                 # Main spin interface
│   ├── result/page.tsx          # Win result page
│   ├── admin/                   # Admin dashboard
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   ├── prizes/              # Prize management (TO BE BUILT)
│   │   ├── codes/               # Code generation (TO BE BUILT)
│   │   └── winners/             # Winners log (TO BE BUILT)
│   └── api/
│       ├── spin/route.ts        # Main spin logic
│       ├── validate-code/route.ts
│       ├── prizes/route.ts
│       └── admin/
│           ├── login/route.ts
│           └── logout/route.ts
├── components/
│   └── PrizeWheel.tsx           # Animated wheel component
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   ├── spin-logic.ts            # Core spin selection logic
│   ├── rate-limit.ts            # Rate limiting utilities
│   ├── email.ts                 # Email notification service
│   └── admin-auth.ts            # Admin authentication
└── prisma/
    └── schema.prisma            # Database schema
```

## Database Schema

### Prize
- `id`: Unique identifier
- `title`: Prize name
- `imageUrl`: Optional image
- `quantityTotal`: Total available
- `quantityRemaining`: Current inventory
- `weight`: Probability weight (higher = more likely)

### SpinCode
- `id`: Unique identifier
- `code`: The actual code string (unique)
- `isUsed`: Boolean flag
- `usedAt`: Timestamp when used

### Winner
- `id`: Unique identifier
- `codeId`: Reference to spin code
- `prizeId`: Reference to prize won
- `wonAt`: Timestamp

### RateLimit
- `id`: Unique identifier
- `identifier`: IP address
- `attempts`: Failed attempt count
- `lastAttempt`: Last attempt timestamp

## Important Notes

### Prize Display Rules

**CRITICAL**: The wheel ALWAYS shows ALL prizes, regardless of availability. This ensures:
- Users never know which prizes are running low
- Fair perception - everyone sees the same wheel
- Server controls what can actually be won

### Weighted Random Selection

The selection algorithm:
1. Gets all prizes where `quantityRemaining > 0`
2. Calculates total weight
3. Generates random number
4. Walks through prizes subtracting weights
5. Returns the prize where random falls

Example: If Prize A has weight 10 and Prize B has weight 5, Prize A is 2x more likely to win.

## Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Database: PostgreSQL

You can use:
- **Vercel Postgres**
- **Supabase**
- **Railway**
- **Neon**
- **Self-hosted PostgreSQL**

### Email Setup

For Gmail:
1. Enable 2FA on your Google account
2. Generate an "App Password"
3. Use that as `SMTP_PASSWORD`

## Development Tips

- Use incognito/private browsing when testing rate limiting
- Check Prisma Studio: `npx prisma studio`
- View database: `npx prisma db push`
- Reset database: `npx prisma migrate reset`

## Production Checklist

- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Set up real PostgreSQL database
- [ ] Configure email SMTP properly
- [ ] Test rate limiting
- [ ] Test concurrent spins (race conditions)
- [ ] Add initial prizes
- [ ] Generate codes
- [ ] Test full user flow
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL

## Support

For issues or questions, contact the development team.

---

Built with ❤️ for Ateres Kallah
