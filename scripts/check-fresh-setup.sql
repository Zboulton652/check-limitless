-- Verify the fresh setup worked
SELECT 
  'Tables created' as check_type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'competitions', 'entries', 'dividends', 'referrals');

SELECT 
  'Demo competitions' as check_type,
  COUNT(*) as count
FROM public.competitions;

SELECT 
  'Users created' as check_type,
  COUNT(*) as count
FROM public.users;

SELECT 
  'RLS policies' as check_type,
  COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

-- Show competitions
SELECT 
  title,
  entry_price,
  status,
  is_featured
FROM public.competitions
ORDER BY created_at;

DO $$
BEGIN
  RAISE NOTICE '🔍 FRESH SETUP VERIFICATION COMPLETE';
  RAISE NOTICE 'Check the results above to confirm everything is ready';
END $$;
