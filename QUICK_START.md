# Quick Start Guide

## Get the App Running in 5 Minutes

### Step 1: Stop Current Server
Press `Ctrl+C` in the terminal running `npm run dev`

### Step 2: Install a Simple Database (SQLite for Testing)

Since PostgreSQL setup can be complex, let's use SQLite for initial testing:

Update your `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Then update your `.env`:
```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and tables
npx prisma db push

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Access the App

Open your browser to: **http://localhost:3000**

### Step 6: Set Up Test Data

1. Go to **http://localhost:3000/admin**
2. Login with password: `admin123`
3. Add a few test prizes:
   - Click "Prizes"
   - Click "+ Add Prize"
   - Enter: Title, Quantity (e.g., 5), Weight (e.g., 10)
   - Click Save

4. Generate test codes:
   - Click "Codes"
   - Enter quantity: 10
   - Click "Generate Codes"

5. Test the spin:
   - Copy one of the generated codes
   - Go to homepage (http://localhost:3000)
   - Enter the code
   - Click "Spin the Wheel"

---

## Alternative: Use PostgreSQL (Production Ready)

If you want to use PostgreSQL (recommended for production):

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb ateres_kallah_spin

# Update .env
DATABASE_URL="postgresql://localhost:5432/ateres_kallah_spin"

# Run migrations
npx prisma migrate dev --name init
```

### Option B: Free Cloud Database (Supabase)

1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Copy the "Connection string" from Settings > Database
5. Paste into `.env` as `DATABASE_URL`
6. Run: `npx prisma db push`

---

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in root directory
- Restart the dev server (`Ctrl+C` then `npm run dev`)
- Don't commit `.env` to git (it's in `.gitignore`)

### "Can't connect to database"
- Check DATABASE_URL is correct
- For SQLite: Make sure path is `file:./dev.db`
- For PostgreSQL: Make sure PostgreSQL is running

### Page shows "Loading prizes..."
- Check browser console for errors
- Make sure database has prizes (add via admin panel)
- Check terminal for API errors

### TypeScript errors
```bash
npx prisma generate
rm -rf .next
npm run dev
```

---

## Next Steps

1. ✅ Get server running
2. ✅ Access admin panel
3. ✅ Add prizes
4. ✅ Generate codes
5. ✅ Test full spin flow
6. 📖 Read SETUP.md for production deployment

Enjoy! 🎉
