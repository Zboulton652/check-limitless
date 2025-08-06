-- Check the current status of everything
SELECT 
  'Database Component Status' as check_type,
  'Status' as result;

-- Check users table structure
SELECT 
  'Users table columns' as check_type,
  string_agg(column_name || ' (' || data_type || ')', ', ') as result
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users';

-- Check if trigger exists
SELECT 
  'User creation trigger' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ ACTIVE'
    ELSE '❌ MISSING'
  END as result;

-- Check if functions exist
SELECT 
  'Required functions' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user')
     AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_referral_code')
    THEN '✅ ALL INSTALLED'
    ELSE '❌ SOME MISSING'
  END as result;

-- Check current user count
SELECT 
  'Current users' as check_type,
  COUNT(*)::TEXT || ' users in database' as result
FROM public.users;

-- Final status
SELECT 
  'Overall Status' as check_type,
  '🎯 Ready for registration testing' as result;
