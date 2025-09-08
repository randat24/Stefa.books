-- ============================================================================
-- FIX SUBSCRIPTION REQUESTS COLUMNS
-- ============================================================================
-- This script fixes the column naming issue in subscription_requests table

-- Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscription_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Fix the columns issue
DO $$ 
BEGIN
    -- If both plan and subscription_type exist, drop plan
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscription_requests' 
               AND column_name = 'plan' 
               AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'subscription_requests' 
                AND column_name = 'subscription_type' 
                AND table_schema = 'public') THEN
        RAISE NOTICE 'Both plan and subscription_type columns exist. Dropping plan column.';
        ALTER TABLE public.subscription_requests DROP COLUMN plan;
    END IF;
    
    -- If only plan exists, rename it to subscription_type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscription_requests' 
               AND column_name = 'plan' 
               AND table_schema = 'public')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'subscription_requests' 
                    AND column_name = 'subscription_type' 
                    AND table_schema = 'public') THEN
        RAISE NOTICE 'Only plan column exists. Renaming to subscription_type.';
        ALTER TABLE public.subscription_requests RENAME COLUMN plan TO subscription_type;
    END IF;
    
    -- If only subscription_type exists, do nothing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_requests' 
                   AND column_name = 'plan' 
                   AND table_schema = 'public')
    AND EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'subscription_requests' 
                AND column_name = 'subscription_type' 
                AND table_schema = 'public') THEN
        RAISE NOTICE 'Only subscription_type column exists. No changes needed.';
    END IF;
END $$;

-- Check if payment_method column exists and add it if needed
DO $$ 
BEGIN
    -- If payment_method column doesn't exist, add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscription_requests' 
                   AND column_name = 'payment_method' 
                   AND table_schema = 'public') THEN
        RAISE NOTICE 'Adding missing payment_method column.';
        ALTER TABLE public.subscription_requests ADD COLUMN payment_method TEXT;
    END IF;
END $$;

-- Add payment_method constraint if column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'subscription_requests' 
               AND column_name = 'payment_method' 
               AND table_schema = 'public') THEN
        -- Drop existing constraint if it exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'subscription_requests' 
                   AND constraint_name = 'subscription_requests_payment_method_check'
                   AND table_schema = 'public') THEN
            ALTER TABLE public.subscription_requests DROP CONSTRAINT subscription_requests_payment_method_check;
        END IF;
        
        -- Add new constraint
        ALTER TABLE public.subscription_requests ADD CONSTRAINT subscription_requests_payment_method_check 
            CHECK (payment_method IN ('Онлайн оплата', 'Переказ на карту'));
    END IF;
END $$;

-- Verify the fix
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscription_requests' 
AND table_schema = 'public'
ORDER BY ordinal_position;
