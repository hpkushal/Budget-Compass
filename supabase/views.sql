-- Monthly Money Manager - Database Views
-- Run this script after triggers_functions.sql

-- =====================================================
-- VIEW: MONTHLY BUDGET OVERVIEW
-- =====================================================
CREATE OR REPLACE VIEW monthly_budget_overview AS
SELECT 
    b.user_id,
    b.month,
    b.year,
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    b.amount as budget_amount,
    b.currency,
    COALESCE(spent.total_spent, 0) as spent_amount,
    GREATEST(b.amount - COALESCE(spent.total_spent, 0), 0) as remaining_amount,
    CASE 
        WHEN b.amount > 0 
        THEN ROUND((COALESCE(spent.total_spent, 0) / b.amount * 100)::numeric, 2)
        ELSE 0 
    END as percentage_used,
    CASE
        WHEN COALESCE(spent.total_spent, 0) > b.amount THEN true
        ELSE false
    END as is_over_budget,
    b.created_at as budget_created_at,
    b.updated_at as budget_updated_at
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN (
    SELECT 
        user_id,
        category_id,
        EXTRACT(MONTH FROM expense_date)::INTEGER as month,
        EXTRACT(YEAR FROM expense_date)::INTEGER as year,
        SUM(amount) as total_spent,
        COUNT(*) as expense_count
    FROM expenses
    GROUP BY user_id, category_id, 
             EXTRACT(MONTH FROM expense_date)::INTEGER,
             EXTRACT(YEAR FROM expense_date)::INTEGER
) spent ON (
    b.user_id = spent.user_id 
    AND b.category_id = spent.category_id 
    AND b.month = spent.month 
    AND b.year = spent.year
);

-- =====================================================
-- VIEW: EXPENSE SUMMARY BY MONTH
-- =====================================================
CREATE OR REPLACE VIEW monthly_expense_summary AS
SELECT 
    e.user_id,
    EXTRACT(YEAR FROM e.expense_date)::INTEGER as year,
    EXTRACT(MONTH FROM e.expense_date)::INTEGER as month,
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    COUNT(e.id) as expense_count,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as average_amount,
    MIN(e.amount) as min_amount,
    MAX(e.amount) as max_amount,
    e.currency
FROM expenses e
JOIN categories c ON e.category_id = c.id
GROUP BY 
    e.user_id, 
    EXTRACT(YEAR FROM e.expense_date)::INTEGER,
    EXTRACT(MONTH FROM e.expense_date)::INTEGER,
    c.id, c.name, c.color, c.icon, e.currency
ORDER BY year DESC, month DESC, total_amount DESC;

-- =====================================================
-- VIEW: WEEKLY EXPENSE SUMMARY
-- =====================================================
CREATE OR REPLACE VIEW weekly_expense_summary AS
SELECT 
    e.user_id,
    DATE_TRUNC('week', e.expense_date)::DATE as week_start,
    DATE_TRUNC('week', e.expense_date)::DATE + INTERVAL '6 days' as week_end,
    EXTRACT(YEAR FROM e.expense_date)::INTEGER as year,
    EXTRACT(WEEK FROM e.expense_date)::INTEGER as week_number,
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    COUNT(e.id) as expense_count,
    SUM(e.amount) as total_amount,
    AVG(e.amount) as average_amount,
    e.currency
FROM expenses e
JOIN categories c ON e.category_id = c.id
GROUP BY 
    e.user_id,
    DATE_TRUNC('week', e.expense_date)::DATE,
    EXTRACT(YEAR FROM e.expense_date)::INTEGER,
    EXTRACT(WEEK FROM e.expense_date)::INTEGER,
    c.id, c.name, c.color, e.currency
ORDER BY week_start DESC, total_amount DESC;

-- =====================================================
-- VIEW: BUDGET ALERTS WITH DETAILS
-- =====================================================
CREATE OR REPLACE VIEW budget_alerts_detailed AS
SELECT 
    ba.id,
    ba.user_id,
    ba.alert_type,
    ba.status,
    ba.month,
    ba.year,
    ba.sent_at,
    ba.error_message,
    ba.created_at,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    b.amount as budget_amount,
    b.currency,
    COALESCE(spent.total_spent, 0) as current_spent,
    CASE 
        WHEN b.amount > 0 
        THEN ROUND((COALESCE(spent.total_spent, 0) / b.amount * 100)::numeric, 2)
        ELSE 0 
    END as current_percentage,
    us.timezone as user_timezone
FROM budget_alerts ba
JOIN categories c ON ba.category_id = c.id
JOIN budgets b ON ba.budget_id = b.id
JOIN user_settings us ON ba.user_id = us.user_id
LEFT JOIN (
    SELECT 
        user_id,
        category_id,
        EXTRACT(MONTH FROM expense_date)::INTEGER as month,
        EXTRACT(YEAR FROM expense_date)::INTEGER as year,
        SUM(amount) as total_spent
    FROM expenses
    GROUP BY user_id, category_id, 
             EXTRACT(MONTH FROM expense_date)::INTEGER,
             EXTRACT(YEAR FROM expense_date)::INTEGER
) spent ON (
    ba.user_id = spent.user_id 
    AND ba.category_id = spent.category_id 
    AND ba.month = spent.month 
    AND ba.year = spent.year
);

-- =====================================================
-- VIEW: USER DASHBOARD DATA
-- =====================================================
CREATE OR REPLACE VIEW user_dashboard_current_month AS
SELECT 
    us.user_id,
    us.timezone,
    us.currency,
    EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER as current_month,
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as current_year,
    
    -- Total budget for current month
    COALESCE(budget_totals.total_budget, 0) as total_monthly_budget,
    
    -- Total spent for current month  
    COALESCE(expense_totals.total_spent, 0) as total_monthly_spent,
    
    -- Remaining budget
    GREATEST(
        COALESCE(budget_totals.total_budget, 0) - COALESCE(expense_totals.total_spent, 0), 
        0
    ) as total_remaining_budget,
    
    -- Overall percentage used
    CASE 
        WHEN COALESCE(budget_totals.total_budget, 0) > 0 
        THEN ROUND((COALESCE(expense_totals.total_spent, 0) / budget_totals.total_budget * 100)::numeric, 2)
        ELSE 0 
    END as overall_percentage_used,
    
    -- Number of categories with budgets
    COALESCE(budget_totals.categories_with_budget, 0) as categories_with_budget,
    
    -- Number of categories over budget
    COALESCE(over_budget.categories_over_budget, 0) as categories_over_budget,
    
    -- Expense count this month
    COALESCE(expense_totals.expense_count, 0) as monthly_expense_count

FROM user_settings us

LEFT JOIN (
    SELECT 
        user_id,
        SUM(amount) as total_budget,
        COUNT(*) as categories_with_budget
    FROM budgets
    WHERE month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
      AND year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
    GROUP BY user_id
) budget_totals ON us.user_id = budget_totals.user_id

LEFT JOIN (
    SELECT 
        user_id,
        SUM(amount) as total_spent,
        COUNT(*) as expense_count
    FROM expenses
    WHERE EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
      AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
    GROUP BY user_id
) expense_totals ON us.user_id = expense_totals.user_id

LEFT JOIN (
    SELECT 
        mbo.user_id,
        COUNT(*) as categories_over_budget
    FROM monthly_budget_overview mbo
    WHERE mbo.month = EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
      AND mbo.year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
      AND mbo.is_over_budget = true
    GROUP BY mbo.user_id
) over_budget ON us.user_id = over_budget.user_id;

-- =====================================================
-- GRANTS FOR AUTHENTICATED USERS
-- =====================================================
GRANT SELECT ON monthly_budget_overview TO authenticated;
GRANT SELECT ON monthly_expense_summary TO authenticated;
GRANT SELECT ON weekly_expense_summary TO authenticated;
GRANT SELECT ON budget_alerts_detailed TO authenticated;
GRANT SELECT ON user_dashboard_current_month TO authenticated;

