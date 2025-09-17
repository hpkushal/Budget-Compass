# Settings Page Database Update

## Quick Setup

To enable the new Settings page functionality, you need to add notification columns to your database.

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL:

```sql
-- Add notification settings columns to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS budget_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weekly_digest BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS budget_threshold INTEGER DEFAULT 80 CHECK (budget_threshold >= 50 AND budget_threshold <= 100);

-- Update existing users to have default notification settings
UPDATE user_settings 
SET 
  email_notifications = COALESCE(email_notifications, true),
  budget_alerts = COALESCE(budget_alerts, true),
  weekly_digest = COALESCE(weekly_digest, true),
  budget_threshold = COALESCE(budget_threshold, 80)
WHERE 
  email_notifications IS NULL 
  OR budget_alerts IS NULL 
  OR weekly_digest IS NULL 
  OR budget_threshold IS NULL;
```

4. Click **Run** to execute the SQL

### Option 2: Using psql (if available)

```bash
psql "postgresql://postgres.fiswiqyybmoycrsykrxw:[Halifax&95]@aws-1-ca-central-1.pooler.supabase.com:6543/postgres" -f update-user-settings.sql
```

## What This Adds

The settings page now includes:

- **User Preferences**: Currency and timezone settings
- **Category Management**: Add, edit, and delete custom categories
- **Notification Settings**: Email preferences and budget alert thresholds

Once the database is updated, your settings page will be fully functional!
