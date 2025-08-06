-- Verify everything is working
SELECT 'Tables' as type, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT 'Competitions' as type, COUNT(*) as count
FROM public.competitions;

SELECT 'Users' as type, COUNT(*) as count
FROM public.users;

SELECT 'Policies' as type, COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- Show your admin user
SELECT 
  email,
  role,
  referral_code,
  'Ready for Supabase Auth setup' as status
FROM public.users 
WHERE role = 'admin';

-- Show competitions
SELECT 
  title,
  entry_price,
  status,
  is_featured
FROM public.competitions;

DO $$
BEGIN
  RAISE NOTICE '✅ VERIFICATION COMPLETE';
  RAISE NOTICE 'Database is clean and ready!';
END $$;
