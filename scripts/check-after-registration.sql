-- Run this AFTER attempting registration to see what happened

-- Check if new auth user was created
SELECT 
  'Auth users' as table_name,
  COUNT(*) as total_count,
  MAX(created_at) as latest_created
FROM auth.users;

-- Check if corresponding public user was created
SELECT 
  'Public users' as table_name,
  COUNT(*) as total_count,
  MAX(created_at) as latest_created
FROM public.users;

-- Check for any orphaned auth users (created but no public.users record)
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  CASE 
    WHEN pu.id IS NOT NULL THEN '✅ Has public.users record'
    ELSE '❌ ORPHANED - Missing public.users record'
  END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC
LIMIT 5;

-- Show the most recent public.users records
SELECT 
  id,
  email,
  referral_code,
  created_at,
  '✅ Successfully created' as status
FROM public.users
ORDER BY created_at DESC
LIMIT 3;
