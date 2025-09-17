-- Monthly Money Manager - Row Level Security Policies
-- Run this script after schema.sql

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_digest_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER SETTINGS POLICIES
-- =====================================================
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- EXPENSES POLICIES
-- =====================================================
CREATE POLICY "Users can view own expenses" ON expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- BUDGETS POLICIES
-- =====================================================
CREATE POLICY "Users can view own budgets" ON budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- BUDGET ALERTS POLICIES
-- =====================================================
CREATE POLICY "Users can view own budget alerts" ON budget_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget alerts" ON budget_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget alerts" ON budget_alerts
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role can update alert status for email sending
CREATE POLICY "Service role can update alert status" ON budget_alerts
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- WEEKLY DIGEST QUEUE POLICIES
-- =====================================================
CREATE POLICY "Users can view own digest queue" ON weekly_digest_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own digest queue" ON weekly_digest_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can update digest status for email sending
CREATE POLICY "Service role can update digest status" ON weekly_digest_queue
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can view all digest queue" ON weekly_digest_queue
    FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

