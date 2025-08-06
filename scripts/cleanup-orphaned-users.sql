-- Optional: Clean up any orphaned auth users that don't have public.users records
-- Run this ONLY if you want to clean up test accounts that failed to create properly

-- First, let's see if there are any orphaned users
SELECT 
  au.id,
  au.email,
  au.created_at,
  'ORPHANED - No public.users record' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- If you want to create public.users records for existing auth.users, uncomment and run this:
/*
INSERT INTO public.users (id, email, referral_code)
SELECT 
  au.id,
  au.email,
  generate_referral_code()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
*/

-- Or if you want to delete the orphaned auth users (BE CAREFUL!), uncomment this:
/*
DELETE FROM auth.users 
WHERE id IN (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
);
*/

-- Status message
DO $$
BEGIN
  RAISE NOTICE 'Orphaned users check complete. Review the results above.';
END $$;
