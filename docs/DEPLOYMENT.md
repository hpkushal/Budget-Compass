# 🚀 Budget Compass - Deployment Guide

This guide covers deploying Budget Compass to various platforms with production-ready configurations.

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] ✅ Database schema deployed to production Supabase
- [ ] ✅ Environment variables configured
- [ ] ✅ Authentication settings updated for production domain
- [ ] ✅ RLS policies tested and working
- [ ] ✅ Email templates configured (if using email features)
- [ ] ✅ SSL certificate ready for custom domain
- [ ] ✅ Error tracking configured (optional)

## 🌐 Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications.

### 1. Connect Repository

1. Visit [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `monthly-money-manager` directory as root

### 2. Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

```bash
# Build Command (auto-detected)
npm run build

# Output Directory (auto-detected)  
.next

# Install Command (auto-detected)
npm install

# Root Directory
monthly-money-manager
```

### 3. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Optional: Email Configuration
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

### 4. Deploy

Click "Deploy" - Vercel will build and deploy automatically.

### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Supabase Auth URLs (see below)

## 🐳 Docker Deployment

For self-hosted deployments using Docker.

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  budget-compass:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - budget-compass
    restart: unless-stopped
```

### 3. Build and Run

```bash
# Build the image
docker build -t budget-compass .

# Run with Docker Compose
docker-compose up -d
```

## ☁️ Railway Deployment

Railway offers simple deployment with automatic HTTPS.

### 1. Connect Repository

1. Visit [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

### 2. Configure Environment

Add environment variables in Railway dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### 3. Deploy

Railway will automatically deploy on every push to main branch.

## 🌊 DigitalOcean App Platform

### 1. Create App

1. Visit DigitalOcean Control Panel
2. Create → Apps
3. Connect your GitHub repository

### 2. Configure App Spec

```yaml
name: budget-compass
services:
- name: web
  source_dir: /
  github:
    repo: your-username/Budget-Compass
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NEXT_PUBLIC_SUPABASE_URL
    value: your_production_supabase_url
  - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
    value: your_production_anon_key
  - key: SUPABASE_SERVICE_ROLE_KEY
    value: your_production_service_role_key
    type: SECRET
```

## 🔧 Supabase Production Configuration

### 1. Update Authentication URLs

In Supabase Dashboard → Authentication → URL Configuration:

```bash
# Site URL
https://your-production-domain.com

# Redirect URLs
https://your-production-domain.com/auth/callback
https://your-production-domain.com/auth/login
```

### 2. Configure Email Templates

In Supabase Dashboard → Authentication → Email Templates:

- Customize confirmation email template
- Update magic link template
- Set your domain and branding

### 3. Set up Custom SMTP (Optional)

For better email deliverability:

1. Go to Authentication → Settings
2. Enable "Custom SMTP"
3. Configure with your email provider

## 📊 Monitoring & Analytics

### Error Tracking with Sentry

1. Install Sentry:

```bash
npm install @sentry/nextjs
```

2. Configure `sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

3. Add to environment variables:

```bash
SENTRY_DSN=your_sentry_dsn
```

### Performance Monitoring

Consider adding:

- [Vercel Analytics](https://vercel.com/analytics)
- [Google Analytics](https://analytics.google.com)
- [PostHog](https://posthog.com) for product analytics

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit `.env.local` to version control
- Use platform-specific secret management
- Rotate keys regularly

### 2. HTTPS Configuration

Ensure HTTPS is enforced:

```typescript
// middleware.ts
if (process.env.NODE_ENV === 'production' && 
    !request.url.startsWith('https://')) {
  return NextResponse.redirect(
    `https://${request.nextUrl.host}${request.nextUrl.pathname}`
  )
}
```

### 3. Content Security Policy

Add CSP headers for security:

```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

## 🚀 Performance Optimization

### 1. Enable Next.js Optimizations

```typescript
// next.config.ts
const nextConfig = {
  // Enable experimental features
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Enable compression
  compress: true,
  // Enable PWA (if implemented)
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
}
```

### 2. Database Optimization

- Enable connection pooling in Supabase
- Use database indexes on frequently queried columns
- Implement query caching where appropriate

### 3. CDN Configuration

Configure CDN for static assets:

- Use Vercel's built-in CDN
- Or configure Cloudflare for additional optimization

## 📝 Deployment Scripts

### Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# Run tests (if available)
echo "🧪 Running tests..."
npm run test

# Type check
echo "🔍 Type checking..."
npm run type-check

# Lint
echo "🔧 Linting..."
npm run lint

echo "✅ Deployment checks passed!"
echo "🌐 Ready for production deployment"
```

### Health Check Endpoint

Create a health check endpoint:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('user_settings').select('count').limit(1)
    
    if (error) throw error
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Type check
      run: npm run type-check
    
    - name: Lint
      run: npm run lint
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build Errors**
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed
   - Ensure environment variables are set

2. **Database Connection Issues**
   - Verify Supabase URLs and keys
   - Check RLS policies are enabled
   - Ensure database triggers are created

3. **Authentication Problems**
   - Update redirect URLs in Supabase
   - Verify site URL configuration
   - Check middleware configuration

4. **Performance Issues**
   - Enable Next.js optimizations
   - Configure CDN properly
   - Optimize database queries

### Rollback Strategy

If deployment fails:

1. Use platform rollback features (Vercel, Railway)
2. Or redeploy previous working commit
3. Monitor error logs and user reports

## 📞 Support

For deployment support:

- Check platform documentation (Vercel, Railway, etc.)
- Review Supabase deployment guides
- Monitor application logs for errors

---

This deployment guide ensures your Budget Compass application runs smoothly in production with proper security, performance, and monitoring configurations.
