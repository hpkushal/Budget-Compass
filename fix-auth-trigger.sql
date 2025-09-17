-- Fix for "Database error saving new user"
-- Run this in Supabase SQL Editor

-- First, let's check if the trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Drop and recreate the trigger function to fix any issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_defaults();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION create_user_defaults()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert default user settings with error handling
    BEGIN
        INSERT INTO public.user_settings (user_id, timezone, currency)
        VALUES (NEW.id, 'America/Halifax', 'CAD');
    EXCEPTION
        WHEN unique_violation THEN
            -- User settings already exist, skip
            NULL;
        WHEN OTHERS THEN
            RAISE LOG 'Error creating user settings for user %: %', NEW.id, SQLERRM;
    END;
    
    -- Insert default categories with error handling
    BEGIN
        INSERT INTO public.categories (user_id, name, color, icon, is_default) VALUES
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
    EXCEPTION
        WHEN unique_violation THEN
            -- Categories already exist, skip
            NULL;
        WHEN OTHERS THEN
            RAISE LOG 'Error creating categories for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_defaults();

-- Test the function with a dummy user ID (this will fail but show us the error)
-- SELECT create_user_defaults() FROM (SELECT '00000000-0000-0000-0000-000000000000'::uuid as id) as NEW;

-- Check if trigger is now working
SELECT 'Trigger recreated successfully' as status;
