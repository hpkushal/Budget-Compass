# 🔌 Budget Compass API Documentation

This document outlines the database schema, API patterns, and data flow for the Budget Compass application.

## 📊 Database Schema

### Core Tables

#### `user_settings`
User preferences and configuration.

```sql
CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    timezone TEXT DEFAULT 'America/Halifax',
    currency TEXT DEFAULT 'CAD',
    email_notifications BOOLEAN DEFAULT true,
    budget_alerts BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT true,
    budget_threshold INTEGER DEFAULT 80,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `categories`
Expense categories with customization options.

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280',
    icon TEXT DEFAULT 'tag',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);
```

#### `expenses`
Individual expense records.

```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    notes TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `budgets`
Monthly budget allocations per category.

```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_id, month, year)
);
```

#### `budget_alerts`
Budget threshold notifications.

```sql
CREATE TABLE budget_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    threshold_percentage INTEGER NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_id, month, year, threshold_percentage)
);
```

## 🔒 Row Level Security (RLS) Policies

All tables implement RLS to ensure data isolation:

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON table_name
    FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## 📈 Database Views

### `dashboard_stats`
Optimized view for dashboard statistics.

```sql
CREATE VIEW dashboard_stats AS
SELECT 
    u.user_id,
    u.timezone,
    u.currency,
    COALESCE(current_month_spending, 0) as current_spending,
    COALESCE(current_month_budget, 0) as current_budget,
    COALESCE(expense_count, 0) as expense_count,
    COALESCE(category_count, 0) as category_count
FROM user_settings u
LEFT JOIN (
    -- Current month spending aggregation
    SELECT user_id, SUM(amount) as current_month_spending
    FROM expenses 
    WHERE EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY user_id
) spending ON u.user_id = spending.user_id
-- ... additional JOINs for other metrics
```

## 🔧 Supabase Client Configuration

### Server-Side Client (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### Client-Side Client (`lib/supabase.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## 🔍 Common Query Patterns

### Fetch User Expenses

```typescript
const { data: expenses, error } = await supabase
  .from('expenses')
  .select(`
    *,
    categories (
      name,
      color,
      icon
    )
  `)
  .eq('user_id', user.id)
  .order('expense_date', { ascending: false })
  .limit(50)
```

### Get Budget vs Spending

```typescript
const { data, error } = await supabase
  .from('budgets')
  .select(`
    *,
    categories (
      name,
      color,
      icon
    )
  `)
  .eq('user_id', user.id)
  .eq('month', currentMonth)
  .eq('year', currentYear)
```

### Dashboard Statistics

```typescript
const { data: stats, error } = await supabase
  .from('dashboard_stats')
  .select('*')
  .eq('user_id', user.id)
  .single()
```

## 🔐 Authentication Flow

### 1. User Signup

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${origin}/auth/callback`
  }
})
```

### 2. User Login

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### 3. Session Management

```typescript
// Check current session
const { data: { session } } = await supabase.auth.getSession()

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
  } else if (event === 'SIGNED_OUT') {
    // Handle sign out
  }
})
```

## 🚀 Database Triggers

### User Setup Trigger

Automatically creates default categories and settings for new users:

```sql
CREATE OR REPLACE FUNCTION create_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default user settings
    INSERT INTO public.user_settings (user_id, timezone, currency)
    VALUES (NEW.id, 'America/Halifax', 'CAD')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert default categories
    INSERT INTO public.categories (user_id, name, color, icon, is_default) VALUES
    (NEW.id, 'Food & Dining', '#EF4444', 'utensils', true),
    (NEW.id, 'Transportation', '#3B82F6', 'car', true),
    -- ... more default categories
    ON CONFLICT (user_id, name) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_defaults();
```

### Budget Alert Trigger

Sends alerts when spending reaches threshold:

```sql
CREATE OR REPLACE FUNCTION check_budget_alert()
RETURNS TRIGGER AS $$
DECLARE
    current_spending DECIMAL;
    budget_amount DECIMAL;
    threshold_percentage INTEGER;
BEGIN
    -- Get user's budget threshold
    SELECT budget_threshold INTO threshold_percentage
    FROM user_settings 
    WHERE user_id = NEW.user_id;
    
    -- Calculate current month spending for category
    SELECT COALESCE(SUM(amount), 0) INTO current_spending
    FROM expenses
    WHERE user_id = NEW.user_id 
    AND category_id = NEW.category_id
    AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM NEW.expense_date)
    AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM NEW.expense_date);
    
    -- Get budget for this category/month
    SELECT amount INTO budget_amount
    FROM budgets
    WHERE user_id = NEW.user_id
    AND category_id = NEW.category_id
    AND month = EXTRACT(MONTH FROM NEW.expense_date)
    AND year = EXTRACT(YEAR FROM NEW.expense_date);
    
    -- Check if alert should be sent
    IF budget_amount IS NOT NULL AND 
       current_spending >= (budget_amount * threshold_percentage / 100) THEN
        
        INSERT INTO budget_alerts (
            user_id, category_id, month, year, threshold_percentage
        ) VALUES (
            NEW.user_id, NEW.category_id, 
            EXTRACT(MONTH FROM NEW.expense_date),
            EXTRACT(YEAR FROM NEW.expense_date),
            threshold_percentage
        ) ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER expense_budget_check
    AFTER INSERT OR UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION check_budget_alert();
```

## 💱 Currency Support

Supported currencies with their formatting:

```typescript
export const SUPPORTED_CURRENCIES = {
  CAD: { symbol: '$', name: 'Canadian Dollar', locale: 'en-CA' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  AUD: { symbol: '$', name: 'Australian Dollar', locale: 'en-AU' },
} as const
```

## 🌍 Timezone Handling

All dates are stored in UTC and converted to user timezone for display:

```typescript
import { formatInTimeZone } from 'date-fns-tz'

export function formatDateInUserTimezone(
  date: Date | string,
  timezone: string,
  format: string = 'PPP'
) {
  return formatInTimeZone(date, timezone, format)
}
```

## 📊 Excel Export

Export functionality using XLSX library:

```typescript
import * as XLSX from 'xlsx'

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
```

## 🔧 Environment Variables

Required environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Email Configuration (for future features)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

## 🚦 Error Handling

Standard error handling patterns:

```typescript
try {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expenseData)
  
  if (error) throw error
  
  return { success: true, data }
} catch (error) {
  console.error('Error creating expense:', error)
  return { success: false, error: error.message }
}
```

## 📝 Form Validation

Using Zod schemas for validation:

```typescript
import { z } from 'zod'

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().uuid('Invalid category'),
  description: z.string().min(1, 'Description is required'),
  expenseDate: z.date(),
  notes: z.string().optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>
```

---

This API documentation provides a comprehensive overview of the Budget Compass data layer and common patterns used throughout the application.
