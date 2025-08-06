-- Enable detailed logging to help debug any remaining issues
-- This will help us see exactly what's happening during registration

-- Enable logging for our functions
ALTER FUNCTION handle_new_user() SET log_min_messages = 'log';
ALTER FUNCTION generate_referral_code() SET log_min_messages = 'log';

-- Check current log settings
SHOW log_min_messages;
SHOW log_statement;

-- Create a simple test to verify everything works
DO $$
BEGIN
  RAISE NOTICE '🔍 Testing user creation components...';
  
  -- Test 1: Referral code generation
  PERFORM generate_referral_code();
  RAISE NOTICE '✅ Test 1 passed: Referral code generation works';
  
  -- Test 2: Check if users table is accessible
  PERFORM COUNT(*) FROM public.users;
  RAISE NOTICE '✅ Test 2 passed: Users table is accessible';
  
  -- Test 3: Check if auth.users table is accessible (this might fail in some environments)
  BEGIN
    PERFORM COUNT(*) FROM auth.users;
    RAISE NOTICE '✅ Test 3 passed: Auth users table is accessible';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE '⚠️  Test 3 warning: Limited access to auth.users (this is normal)';
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Test 3 failed: %', SQLERRM;
  END;
  
  RAISE NOTICE '🎯 Component testing complete!';
END $$;
