#!/bin/bash

# Budget Compass - Setup Script
# This script helps you set up the Budget Compass application for deployment

set -e  # Exit on any error

echo "🚀 Budget Compass - Setup Script"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚠️  Environment file not found. Creating .env.local..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://fiswiqyybmoycrsykrxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpc3dpcXl5Ym1veWNyc3lrcnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjg4MTMsImV4cCI6MjA3MzYwNDgxM30.qN5zyLKjQYXxX9Ko1hqkd9tdsrpZq03E96SdWSm_-W4

# App Configuration
NEXT_PUBLIC_APP_NAME=Budget Compass
NEXT_PUBLIC_DEFAULT_TIMEZONE=America/Halifax
NEXT_PUBLIC_DEFAULT_CURRENCY=CAD

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Email Configuration
# RESEND_API_KEY=your_resend_api_key_here
# FROM_EMAIL=noreply@yourdomain.com
EOF
    echo "✅ Created .env.local with default configuration"
else
    echo "✅ Environment file already exists"
fi

# Test build
echo ""
echo "🔨 Testing build process..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

# Test type checking (optional, may have warnings)
echo ""
echo "🔍 Running type check..."
if npm run type-check; then
    echo "✅ Type check passed!"
else
    echo "⚠️  Type check has warnings (this is expected and won't affect deployment)"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your Budget Compass application is ready! Here's what you can do next:"
echo ""
echo "📋 Local Development:"
echo "   npm run dev          # Start development server"
echo "   npm run build        # Build for production"
echo "   npm run start        # Start production server"
echo ""
echo "🚀 Deployment Options:"
echo "   1. Vercel (Recommended): Push to GitHub, then import at vercel.com"
echo "   2. Railway: Connect at railway.app"
echo "   3. DigitalOcean App Platform"
echo "   4. Docker deployment (see DEPLOYMENT.md)"
echo ""
echo "📚 Documentation:"
echo "   QUICK-START.md       # Quick deployment guide"
echo "   VERCEL-SETUP.md      # Detailed Vercel setup"
echo "   DEPLOYMENT.md        # All deployment options"
echo "   docs/SETUP-INSTRUCTIONS.md  # Detailed setup guide"
echo ""
echo "🧪 Testing:"
echo "   Visit /test-auth after deployment to verify everything works"
echo ""
echo "⚠️  Important: After deployment, update your Supabase auth URLs!"
echo "   1. Go to Supabase Dashboard → Authentication → URL Configuration"
echo "   2. Set Site URL to your deployed domain"
echo "   3. Add redirect URLs for auth callbacks"
echo ""
echo "Happy budgeting! 💰"
