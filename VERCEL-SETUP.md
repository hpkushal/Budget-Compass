# 🚀 Vercel Deployment Setup for Budget Compass

This guide will help you configure the environment variables in Vercel for successful deployment.

## 📋 Required Environment Variables

You need to add these environment variables in your Vercel project settings:

### 🔑 Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=https://fiswiqyybmoycrsykrxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpc3dpcXl5Ym1veWNyc3lrcnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjg4MTMsImV4cCI6MjA3MzYwNDgxM30.qN5zyLKjQYXxX9Ko1hqkd9tdsrpZq03E96SdWSm_-W4
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 📱 App Configuration

```bash
NEXT_PUBLIC_APP_NAME=Budget Compass
NEXT_PUBLIC_DEFAULT_TIMEZONE=America/Halifax
NEXT_PUBLIC_DEFAULT_CURRENCY=CAD
```

### 📧 Email Configuration (Optional)

```bash
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
```

## 🛠️ How to Add Environment Variables in Vercel

### Method 1: Vercel Dashboard

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your Budget-Compass project

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the sidebar

3. **Add each variable**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://fiswiqyybmoycrsykrxw.supabase.co`
   - Environment: Select "Production", "Preview", and "Development"
   - Click "Save"

4. **Repeat for all variables** listed above

### Method 2: Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter the value when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter the value when prompted

# Continue for all required variables...
```

## 🔄 Redeploy After Adding Variables

After adding all environment variables:

1. **Trigger a new deployment**
   - Go to your Vercel project dashboard
   - Click "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger automatic deployment

## ✅ Verification

After successful deployment, your app should:

- ✅ Build without errors
- ✅ Load the landing page
- ✅ Connect to Supabase database
- ✅ Allow user authentication
- ✅ Display dashboard and other features

## 🔍 Troubleshooting

### Build Still Failing?

1. **Check all environment variables are set**
   - Verify each variable name is exactly correct
   - Ensure no extra spaces in values
   - Confirm variables are enabled for "Production"

2. **Check Supabase URLs**
   - Ensure the Supabase URL is accessible
   - Verify the anon key is valid
   - Test the service role key if needed

3. **View build logs**
   - Check the Vercel deployment logs for specific errors
   - Look for any missing environment variable messages

### Runtime Issues?

1. **Database Connection**
   - Verify Supabase project is active
   - Check RLS policies are properly set
   - Ensure database tables exist

2. **Authentication Issues**
   - Update Supabase Auth settings with your Vercel domain
   - Add your production URL to allowed redirect URLs

## 🌐 Production URLs

Once deployed, update these in Supabase:

1. **Go to Supabase Dashboard** → Authentication → URL Configuration
2. **Site URL**: `https://your-app-name.vercel.app`
3. **Redirect URLs**: 
   - `https://your-app-name.vercel.app/auth/callback`
   - `https://your-app-name.vercel.app/auth/login`

## 🎉 You're Ready!

Your Budget Compass app should now be successfully deployed on Vercel with all features working correctly!

---

**Need help?** Check the Vercel documentation or the main README.md for additional troubleshooting steps.
