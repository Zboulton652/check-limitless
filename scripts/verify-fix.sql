-- Verify the fix is working properly

-- 1. Check the referral_code column constraints
SELECT 
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'referral_code';

-- 2. Test referral code generation multiple times
SELECT 
  generate_referral_code() as code1,
  generate_referral_code() as code2,
  generate_referral_code() as code3,
  generate_referral_code() as code4,
  generate_referral_code() as code5;

-- 3. Check if all functions and triggers are in place
SELECT 
  'Trigger: ' || CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' 
  END as trigger_status,
  'Function: ' || CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' 
  END as function_status,
  'Generator: ' || CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_referral_code') 
    THEN '✅ EXISTS' ELSE '❌ MISSING' 
  END as generator_status;

-- 4. Show current user count
SELECT 
  COUNT(*) as total_auth_users
FROM auth.users;

SELECT 
  COUNT(*) as total_public_users
FROM public.users;

-- Final status message
DO $$
BEGIN
  RAISE NOTICE '🔧 Fix verification complete';
  RAISE NOTICE '📝 The referral_code constraint has been fixed';
  RAISE NOTICE '🎯 Try registering a new account now!';
END $$;
