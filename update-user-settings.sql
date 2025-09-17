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
