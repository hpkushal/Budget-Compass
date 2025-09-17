-- Monthly Money Manager - Seed Data
-- Run this script after views.sql
-- This script creates test data for development and testing

-- =====================================================
-- SEED DATA SETUP
-- =====================================================

-- Note: This assumes you have at least one test user created via Supabase Auth
-- Replace 'YOUR_TEST_USER_ID' with an actual user ID from auth.users

-- First, let's create a function to safely insert seed data
CREATE OR REPLACE FUNCTION insert_seed_data(test_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    category_food UUID;
    category_transport UUID;
    category_shopping UUID;
    category_entertainment UUID;
    category_bills UUID;
    result_message TEXT := '';
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN
        RETURN 'Error: User ID ' || test_user_id || ' does not exist in auth.users';
    END IF;

    -- Get category IDs for the test user
    SELECT id INTO category_food FROM categories WHERE user_id = test_user_id AND name = 'Food & Dining';
    SELECT id INTO category_transport FROM categories WHERE user_id = test_user_id AND name = 'Transportation';
    SELECT id INTO category_shopping FROM categories WHERE user_id = test_user_id AND name = 'Shopping';
    SELECT id INTO category_entertainment FROM categories WHERE user_id = test_user_id AND name = 'Entertainment';
    SELECT id INTO category_bills FROM categories WHERE user_id = test_user_id AND name = 'Bills & Utilities';

    -- Insert budgets for current month
    INSERT INTO budgets (user_id, category_id, amount, currency, month, year) VALUES
    (test_user_id, category_food, 800.00, 'CAD', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (test_user_id, category_transport, 300.00, 'CAD', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (test_user_id, category_shopping, 400.00, 'CAD', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (test_user_id, category_entertainment, 200.00, 'CAD', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    (test_user_id, category_bills, 1200.00, 'CAD', EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
    ON CONFLICT (user_id, category_id, month, year) DO NOTHING;

    -- Insert sample expenses for current month
    INSERT INTO expenses (user_id, category_id, amount, currency, description, expense_date) VALUES
    -- Food & Dining expenses (should trigger 80% alert: 800 * 0.8 = 640)
    (test_user_id, category_food, 45.67, 'CAD', 'Grocery shopping at Metro', CURRENT_DATE - INTERVAL '1 day'),
    (test_user_id, category_food, 23.45, 'CAD', 'Coffee and pastry', CURRENT_DATE - INTERVAL '2 days'),
    (test_user_id, category_food, 78.90, 'CAD', 'Dinner at restaurant', CURRENT_DATE - INTERVAL '3 days'),
    (test_user_id, category_food, 156.78, 'CAD', 'Weekly groceries', CURRENT_DATE - INTERVAL '5 days'),
    (test_user_id, category_food, 89.34, 'CAD', 'Lunch with colleagues', CURRENT_DATE - INTERVAL '7 days'),
    (test_user_id, category_food, 234.56, 'CAD', 'Costco bulk shopping', CURRENT_DATE - INTERVAL '10 days'),
    (test_user_id, category_food, 67.89, 'CAD', 'Pizza night', CURRENT_DATE - INTERVAL '12 days'),
    
    -- Transportation expenses
    (test_user_id, category_transport, 89.50, 'CAD', 'Gas fill-up', CURRENT_DATE - INTERVAL '1 day'),
    (test_user_id, category_transport, 12.75, 'CAD', 'Parking downtown', CURRENT_DATE - INTERVAL '4 days'),
    (test_user_id, category_transport, 45.00, 'CAD', 'Uber ride', CURRENT_DATE - INTERVAL '8 days'),
    (test_user_id, category_transport, 95.00, 'CAD', 'Monthly transit pass', CURRENT_DATE - INTERVAL '15 days'),
    
    -- Shopping expenses  
    (test_user_id, category_shopping, 156.99, 'CAD', 'New winter jacket', CURRENT_DATE - INTERVAL '2 days'),
    (test_user_id, category_shopping, 78.45, 'CAD', 'Books from Amazon', CURRENT_DATE - INTERVAL '6 days'),
    (test_user_id, category_shopping, 234.67, 'CAD', 'Electronics store', CURRENT_DATE - INTERVAL '9 days'),
    
    -- Entertainment expenses
    (test_user_id, category_entertainment, 45.00, 'CAD', 'Movie tickets', CURRENT_DATE - INTERVAL '3 days'),
    (test_user_id, category_entertainment, 89.99, 'CAD', 'Concert tickets', CURRENT_DATE - INTERVAL '7 days'),
    (test_user_id, category_entertainment, 23.50, 'CAD', 'Streaming service', CURRENT_DATE - INTERVAL '14 days'),
    
    -- Bills & Utilities expenses
    (test_user_id, category_bills, 145.67, 'CAD', 'Electricity bill', CURRENT_DATE - INTERVAL '5 days'),
    (test_user_id, category_bills, 89.99, 'CAD', 'Internet bill', CURRENT_DATE - INTERVAL '10 days'),
    (test_user_id, category_bills, 234.56, 'CAD', 'Phone bill', CURRENT_DATE - INTERVAL '12 days');

    -- Insert some expenses for previous month for comparison
    INSERT INTO expenses (user_id, category_id, amount, currency, description, expense_date) VALUES
    (test_user_id, category_food, 567.89, 'CAD', 'Previous month groceries', CURRENT_DATE - INTERVAL '1 month'),
    (test_user_id, category_transport, 123.45, 'CAD', 'Previous month gas', CURRENT_DATE - INTERVAL '1 month'),
    (test_user_id, category_shopping, 345.67, 'CAD', 'Previous month shopping', CURRENT_DATE - INTERVAL '1 month');

    result_message := 'Successfully inserted seed data for user ' || test_user_id;
    RETURN result_message;

EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error inserting seed data: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTRUCTIONS FOR RUNNING SEED DATA
-- =====================================================

-- To use this seed data function:
-- 1. First create a test user via Supabase Auth UI or API
-- 2. Get the user ID from auth.users table
-- 3. Run: SELECT insert_seed_data('YOUR_ACTUAL_USER_ID_HERE');

-- Example query to get existing user IDs:
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Example usage (replace with actual user ID):
-- SELECT insert_seed_data('12345678-1234-1234-1234-123456789012');

-- =====================================================
-- SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Test monthly budget overview
-- SELECT * FROM monthly_budget_overview WHERE user_id = 'YOUR_USER_ID' AND month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER AND year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

-- Test dashboard view
-- SELECT * FROM user_dashboard_current_month WHERE user_id = 'YOUR_USER_ID';

-- Test budget alerts (should show alerts for food category if seed data loaded correctly)
-- SELECT * FROM budget_alerts_detailed WHERE user_id = 'YOUR_USER_ID';

-- Test monthly summary function
-- SELECT * FROM get_monthly_summary('YOUR_USER_ID');

-- Test recent expenses function  
-- SELECT * FROM get_recent_expenses('YOUR_USER_ID', 10);

