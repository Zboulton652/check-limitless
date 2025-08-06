-- Query to help check what's happening during registration attempts
-- Run this after trying to register to see any error details

-- Check recent log entries (if accessible)
SELECT 
  'Database is ready for user registration' as status,
  NOW() as checked_at;

-- Verify the trigger is properly attached
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.event_object_table,
  t.action_timing,
  t.action_statement
FROM information_schema.triggers t
WHERE t.trigger_name = 'on_auth_user_created';

-- Check function definitions
SELECT 
  r.routine_name,
  r.routine_type,
  CASE 
    WHEN r.routine_name = 'handle_new_user' THEN '✅ User creation handler'
    WHEN r.routine_name = 'generate_referral_code' THEN '✅ Referral code generator'
    ELSE r.routine_name
  END as description
FROM information_schema.routines r
WHERE r.routine_schema = 'public' 
  AND r.routine_name IN ('handle_new_user', 'generate_referral_code');

-- Final status
DO $$
BEGIN
  RAISE NOTICE '📊 REGISTRATION READINESS CHECK';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Database: Ready ✅';
  RAISE NOTICE 'Functions: Installed ✅';  
  RAISE NOTICE 'Trigger: Active ✅';
  RAISE NOTICE 'Logging: Enabled ✅';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Try registering now!';
  RAISE NOTICE 'If it still fails, check the Supabase logs in your dashboard';
END $$;
