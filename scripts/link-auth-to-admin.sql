-- After creating the auth user, run this to link them
-- Replace 'AUTH_USER_ID_HERE' with the ID from the auth user you just created

-- Step 1: First, find the auth user ID
-- Go to Supabase Dashboard > Authentication > Users
-- Click on admin@limitlessx.com and copy the ID

-- Step 2: Update the public.users record to match the auth ID
UPDATE public.users 
SET id = 'AUTH_USER_ID_HERE'  -- Replace with actual auth user ID
WHERE email = 'admin@limitlessx.com' AND role = 'admin';

-- Step 3: Verify the link worked
SELECT id, email, role 
FROM public.users 
WHERE email = 'admin@limitlessx.com';
