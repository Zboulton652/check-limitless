-- Run this BEFORE attempting registration to monitor what happens
-- This will help us see if the trigger fires correctly

-- Check current state
SELECT 
  'Before registration attempt' as status,
  COUNT(*) as auth_users_count
FROM auth.users;

SELECT 
  'Before registration attempt' as status,
  COUNT(*) as public_users_count  
FROM public.users;

-- This query will help us see what happens after registration
-- Run this AFTER attempting registration
