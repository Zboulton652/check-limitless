-- COMPREHENSIVE DEBUG SCRIPT FOR USER CREATION ISSUE
-- Run this to identify what's wrong with user registration

-- 1. Check if the users table exists and has correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check if the trigger function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
  AND routine_schema = 'public';

-- 4. Check if the referral code generation function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'generate_referral_code' 
  AND routine_schema = 'public';

-- 5. Check recent auth.users (to see if Supabase auth is working)
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check recent public.users (to see if trigger is working)
SELECT 
  id, 
  email, 
  referral_code,
  created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check for any orphaned auth users (in auth.users but not public.users)
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  pu.id as public_user_id
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- 8. Test the referral code generation function manually
SELECT generate_referral_code() as test_referral_code;

-- 9. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- 10. Check if there are any constraint violations
SELECT 
  conname,
  contype,
  confupdtype,
  confdeltype
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;
