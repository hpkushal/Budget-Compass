-- Monthly Money Manager - Triggers and Functions
-- Run this script after rls_policies.sql

-- =====================================================
-- FUNCTION: CREATE DEFAULT USER SETUP
-- =====================================================
CREATE OR REPLACE FUNCTION create_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default user settings
    INSERT INTO user_settings (user_id, timezone, currency)
    VALUES (NEW.id, 'America/Halifax', 'CAD');
    
    -- Insert default categories
    INSERT INTO categories (user_id, name, color, icon, is_default) VALUES
    (NEW.id, 'Food & Dining', '#EF4444', 'utensils', true),
    (NEW.id, 'Transportation', '#3B82F6', 'car', true),
    (NEW.id, 'Shopping', '#8B5CF6', 'shopping-bag', true),
    (NEW.id, 'Entertainment', '#F59E0B', 'film', true),
    (NEW.id, 'Bills & Utilities', '#10B981', 'receipt', true),
    (NEW.id, 'Healthcare', '#EF4444', 'heart', true),
    (NEW.id, 'Education', '#6366F1', 'book-open', true),
    (NEW.id, 'Personal Care', '#EC4899', 'sparkles', true),
    (NEW.id, 'Travel', '#06B6D4', 'plane', true),
    (NEW.id, 'Other', '#6B7280', 'more-horizontal', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create defaults when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_defaults();

-- =====================================================
-- FUNCTION: CHECK BUDGET ALERTS
-- =====================================================
CREATE OR REPLACE FUNCTION check_budget_alerts()
RETURNS TRIGGER AS $$
DECLARE
    budget_record RECORD;
    total_spent DECIMAL(12,2);
    budget_percentage DECIMAL(5,2);
    current_month INTEGER;
    current_year INTEGER;
BEGIN
    -- Get current month/year from expense date
    current_month := EXTRACT(MONTH FROM NEW.expense_date);
    current_year := EXTRACT(YEAR FROM NEW.expense_date);
    
    -- Get the budget for this category/month/year
    SELECT * INTO budget_record
    FROM budgets 
    WHERE user_id = NEW.user_id 
      AND category_id = NEW.category_id 
      AND month = current_month 
      AND year = current_year;
    
    -- If no budget exists, skip alert check
    IF budget_record IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Calculate total spent in this category for this month
    SELECT COALESCE(SUM(amount), 0) INTO total_spent
    FROM expenses
    WHERE user_id = NEW.user_id
      AND category_id = NEW.category_id
      AND EXTRACT(MONTH FROM expense_date) = current_month
      AND EXTRACT(YEAR FROM expense_date) = current_year;
    
    -- Calculate percentage of budget used
    IF budget_record.amount > 0 THEN
        budget_percentage := (total_spent / budget_record.amount) * 100;
        
        -- Check if we need to create an 80% alert
        IF budget_percentage >= 80 THEN
            INSERT INTO budget_alerts (
                user_id, 
                category_id, 
                budget_id, 
                alert_type, 
                month, 
                year
            ) VALUES (
                NEW.user_id,
                NEW.category_id,
                budget_record.id,
                'budget_80_percent',
                current_month,
                current_year
            ) ON CONFLICT (user_id, category_id, alert_type, month, year) 
              DO NOTHING; -- Don't create duplicate alerts
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check budget alerts when expense is added/updated
CREATE OR REPLACE TRIGGER check_budget_alerts_trigger
    AFTER INSERT OR UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION check_budget_alerts();

-- =====================================================
-- FUNCTION: QUEUE WEEKLY DIGEST
-- =====================================================
CREATE OR REPLACE FUNCTION queue_weekly_digest(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    user_record RECORD;
    week_start DATE;
    week_end DATE;
    inserted_count INTEGER := 0;
BEGIN
    -- Calculate week boundaries (Monday to Sunday)
    week_start := target_date - INTERVAL '1 day' * (EXTRACT(DOW FROM target_date)::INTEGER - 1);
    week_end := week_start + INTERVAL '6 days';
    
    -- Queue digest for users who have weekly digest enabled
    FOR user_record IN 
        SELECT DISTINCT us.user_id
        FROM user_settings us
        WHERE us.weekly_digest_enabled = true
          AND us.weekly_digest_day = EXTRACT(DOW FROM target_date)::INTEGER
    LOOP
        INSERT INTO weekly_digest_queue (user_id, week_start_date, week_end_date)
        VALUES (user_record.user_id, week_start, week_end)
        ON CONFLICT (user_id, week_start_date) DO NOTHING;
        
        IF FOUND THEN
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UTILITY FUNCTIONS FOR DASHBOARD
-- =====================================================

-- Function to get monthly spending summary
CREATE OR REPLACE FUNCTION get_monthly_summary(
    p_user_id UUID,
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_color TEXT,
    budget_amount DECIMAL(12,2),
    spent_amount DECIMAL(12,2),
    remaining_amount DECIMAL(12,2),
    percentage_used DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        COALESCE(b.amount, 0) as budget_amount,
        COALESCE(spent.total, 0) as spent_amount,
        GREATEST(COALESCE(b.amount, 0) - COALESCE(spent.total, 0), 0) as remaining_amount,
        CASE 
            WHEN COALESCE(b.amount, 0) > 0 
            THEN (COALESCE(spent.total, 0) / b.amount * 100)
            ELSE 0 
        END as percentage_used
    FROM categories c
    LEFT JOIN budgets b ON (
        c.id = b.category_id 
        AND b.user_id = p_user_id 
        AND b.month = p_month 
        AND b.year = p_year
    )
    LEFT JOIN (
        SELECT 
            category_id,
            SUM(amount) as total
        FROM expenses
        WHERE user_id = p_user_id
          AND EXTRACT(MONTH FROM expense_date) = p_month
          AND EXTRACT(YEAR FROM expense_date) = p_year
        GROUP BY category_id
    ) spent ON c.id = spent.category_id
    WHERE c.user_id = p_user_id
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent expenses
CREATE OR REPLACE FUNCTION get_recent_expenses(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    category_name TEXT,
    category_color TEXT,
    amount DECIMAL(12,2),
    currency currency_code,
    description TEXT,
    expense_date DATE,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        c.name as category_name,
        c.color as category_color,
        e.amount,
        e.currency,
        e.description,
        e.expense_date,
        e.created_at
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = p_user_id
    ORDER BY e.expense_date DESC, e.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

