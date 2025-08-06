-- Test script to verify everything is working
-- Run this AFTER running the fix script

-- 1. Test referral code generation
SELECT 
  generate_referral_code() as code1,
  generate_referral_code() as code2,
  generate_referral_code() as code3;

-- 2. Check if trigger exists
SELECT 
  'Trigger exists: ' || CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN 'YES ✅' 
    ELSE 'NO ❌' 
  END as trigger_status;

-- 3. Check if function exists
SELECT 
  'Function exists: ' || CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user'
    ) THEN 'YES ✅' 
    ELSE 'NO ❌' 
  END as function_status;

-- 4. Check users table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 5. Show any existing users
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN referral_code IS NOT NULL THEN 1 END) as users_with_referral_codes
FROM public.users;

-- Final status
DO $$
BEGIN
  RAISE NOTICE '🔧 Database setup verification complete';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Try registering a new account';
  RAISE NOTICE '2. Check the browser console for any errors';
  RAISE NOTICE '3. If it still fails, check Supabase logs for detailed error messages';
END $$;
