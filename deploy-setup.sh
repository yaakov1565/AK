#!/bin/bash
# Deployment Setup Script for Vercel + PostgreSQL
# Run this after setting up Vercel Postgres database

set -e

echo "🚀 AK Spin - Vercel Deployment Setup"
echo "======================================"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  No .env.production file found!"
    echo "📥 Pulling environment variables from Vercel..."
    vercel env pull .env.production
    echo "✅ Environment variables downloaded"
else
    echo "✅ Using existing .env.production file"
fi

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "📊 Pushing database schema to production..."
echo "   (This will create all tables in your Postgres database)"

# Extract DATABASE_URL from .env.production
if grep -q "POSTGRES_PRISMA_URL" .env.production; then
    export DATABASE_URL=$(grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    echo "   Using POSTGRES_PRISMA_URL from Vercel"
elif grep -q "DATABASE_URL" .env.production; then
    export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    echo "   Using DATABASE_URL from Vercel"
else
    echo "❌ No DATABASE_URL found in .env.production!"
    echo "   Please create a Vercel Postgres database first"
    exit 1
fi

npx prisma db push --accept-data-loss

echo ""
echo "🌱 Seeding production database with sample prizes..."
npx prisma db seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Verify environment variables in Vercel dashboard"
echo "   2. Deploy with: vercel --prod"
echo "   3. Test your deployment at the provided URL"
echo ""
echo "🔐 Don't forget to set these environment variables in Vercel:"
echo "   - ADMIN_PASSWORD (your admin password)"
echo "   - SESSION_SECRET (run: openssl rand -base64 32)"
echo ""
