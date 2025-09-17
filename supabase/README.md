# Monthly Money Manager - Supabase Database Setup

This directory contains all the SQL scripts needed to set up the Supabase database for the Monthly Money Manager application.

## 🗂️ File Structure

```
supabase/
├── README.md              # This file
├── schema.sql             # Core database schema (tables, indexes, types)
├── rls_policies.sql       # Row Level Security policies
├── triggers_functions.sql # Database triggers and utility functions
├── views.sql             # Database views for complex queries
└── seed_data.sql         # Sample data for development/testing
```

## 🚀 Setup Instructions

### Prerequisites
- Supabase project created
- Database connection details available
- `psql` installed (optional, can use Supabase SQL Editor)

### Method 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard/project/fiswiqyybmoycrsykrxw
   - Navigate to "SQL Editor" in the left sidebar

2. **Run Scripts in Order** (IMPORTANT: Run in this exact order)
   
   **Step 1: Core Schema**
   ```sql
   -- Copy and paste contents of schema.sql
   -- This creates tables, types, indexes, and basic triggers
   ```
   
   **Step 2: RLS Policies**
   ```sql
   -- Copy and paste contents of rls_policies.sql
   -- This sets up Row Level Security for data isolation
   ```
   
   **Step 3: Functions & Triggers**
   ```sql
   -- Copy and paste contents of triggers_functions.sql
   -- This creates business logic functions and triggers
   ```
   
   **Step 4: Views**
   ```sql
   -- Copy and paste contents of views.sql
   -- This creates optimized views for dashboard queries
   ```
   
   **Step 5: Seed Data (Optional)**
   ```sql
   -- Copy and paste contents of seed_data.sql
   -- This creates sample data for development
   ```

### Method 2: Using psql Command Line

```bash
# Connect to your Supabase database
psql "postgresql://postgres.fiswiqyybmoycrsykrxw:[Halifax&95]@aws-1-ca-central-1.pooler.supabase.com:6543/postgres"

# Run scripts in order
\i supabase/schema.sql
\i supabase/rls_policies.sql
\i supabase/triggers_functions.sql
\i supabase/views.sql
\i supabase/seed_data.sql
```

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `user_settings` | User preferences (timezone, currency) | Auto-created on signup |
| `categories` | Expense categories | Default categories created automatically |
| `expenses` | Individual expense records | Triggers budget alerts |
| `budgets` | Monthly budget allocations | Per category, per month |
| `budget_alerts` | 80% budget warning system | Prevents duplicate alerts |
| `weekly_digest_queue` | Email digest scheduling | Automated weekly summaries |

### Key Features

- **🔒 Row Level Security**: Users can only access their own data
- **⚡ Automatic Triggers**: 
  - Default categories/settings created on user signup
  - Budget alerts triggered when expenses added
- **📈 Optimized Views**: Pre-computed dashboard data
- **🌍 Timezone Support**: Configurable per user (default: America/Halifax)
- **💱 Multi-Currency**: Supports CAD, USD, EUR, GBP, JPY, AUD

## 🧪 Testing the Setup

### 1. Create a Test User
First, create a test user through Supabase Auth (Dashboard > Authentication > Users > Invite User)

### 2. Load Seed Data
```sql
-- Get your test user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Insert seed data (replace with actual user ID)
SELECT insert_seed_data('your-user-id-here');
```

### 3. Verify Data
```sql
-- Check dashboard data
SELECT * FROM user_dashboard_current_month WHERE user_id = 'your-user-id';

-- Check budget overview
SELECT * FROM monthly_budget_overview 
WHERE user_id = 'your-user-id' 
  AND month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;

-- Check if budget alerts were created
SELECT * FROM budget_alerts_detailed WHERE user_id = 'your-user-id';
```

## 🔧 Utility Functions

### Dashboard Functions
- `get_monthly_summary(user_id, month, year)` - Complete monthly breakdown
- `get_recent_expenses(user_id, limit)` - Latest expense entries

### Admin Functions  
- `queue_weekly_digest(date)` - Queue weekly email digests
- `insert_seed_data(user_id)` - Load test data for development

## 📋 Views Available

- `monthly_budget_overview` - Budget vs actual spending by category
- `monthly_expense_summary` - Monthly spending statistics  
- `weekly_expense_summary` - Weekly spending patterns
- `budget_alerts_detailed` - Alert details with category info
- `user_dashboard_current_month` - Complete dashboard data

## 🚨 Important Notes

1. **Script Order Matters**: Always run scripts in the order listed above
2. **RLS is Enabled**: All tables have Row Level Security - users see only their data
3. **Default Categories**: 10 default categories are created for each new user
4. **Budget Alerts**: Automatically triggered when expenses reach 80% of budget
5. **Timezone Handling**: All dates stored in UTC, converted using user's timezone setting

## 🐛 Troubleshooting

### Common Issues

**"relation does not exist" error**
- Make sure you ran `schema.sql` first

**"permission denied" error**  
- Check that RLS policies were applied correctly with `rls_policies.sql`

**Functions not working**
- Verify `triggers_functions.sql` ran without errors
- Check function exists: `\df function_name` in psql

**No data showing**
- Ensure you're testing with the correct user ID
- Verify RLS policies allow the user to see their data

### Verification Queries

```sql
-- Check if all tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check if functions exist  
SELECT proname FROM pg_proc WHERE proname LIKE '%monthly%' OR proname LIKE '%budget%';

-- Check if views exist
SELECT viewname FROM pg_views WHERE schemaname = 'public';
```

## 🔄 Next Steps

After setting up the database:

1. **Configure Supabase Auth** - Set up email templates and providers
2. **Set up Edge Functions** - For email notifications and scheduled tasks  
3. **Initialize Next.js App** - Connect to this database schema
4. **Test Authentication Flow** - Ensure user creation triggers work properly

---

**Need Help?** Check the troubleshooting section above or review the SQL scripts for detailed comments explaining each component.
