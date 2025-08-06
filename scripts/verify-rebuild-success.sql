-- VERIFY DATABASE REBUILD SUCCESS
-- Run this to confirm everything was created properly

-- Check if all tables exist
SELECT 
  'Tables Created' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ SUCCESS' 
    ELSE '❌ MISSING TABLES' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'competitions', 'entries', 'dividends', 'referrals');

-- Check admin user
SELECT 
  'Admin User' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ ADMIN EXISTS' 
    ELSE '❌ NO ADMIN' 
  END as status
FROM public.users 
WHERE role = 'admin';

-- Check demo competitions
SELECT 
  'Demo Competitions' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ COMPETITIONS LOADED' 
    ELSE '❌ NO COMPETITIONS' 
  END as status
FROM public.competitions;

-- Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ POLICIES ACTIVE' 
    ELSE '❌ MISSING POLICIES' 
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- Show admin user details for auth setup
SELECT 
  '🎯 ADMIN USER DETAILS FOR AUTH SETUP:' as info,
  '' as spacer;

SELECT 
  'Email: ' || email as admin_email,
  'User ID: ' || id as admin_user_id,
  'Referral Code: ' || referral_code as admin_referral_code
FROM public.users 
WHERE role = 'admin' 
LIMIT 1;

-- Show next steps
SELECT 
  '📋 NEXT STEPS:' as next_steps,
  '' as step_1,
  '1. Go to Supabase Dashboard > Authentication > Users' as step_2,
  '2. Click "Add User"' as step_3,
  '3. Use the Email and User ID shown above' as step_4,
  '4. Set a password of your choice' as step_5,
  '5. Set "Email Confirm" to TRUE' as step_6,
  '6. Save and you can log in immediately!' as step_7;
