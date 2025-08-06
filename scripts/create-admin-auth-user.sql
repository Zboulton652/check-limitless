-- This script helps you create the authentication user for the admin account
-- Since admin@limitlessx.com is not a real email, we need to create it manually

-- First, let's check what admin users exist in our public.users table
SELECT id, email, role, referral_code 
FROM public.users 
WHERE role = 'admin';

-- Instructions to create the auth user:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Fill in the form:
--    - Email: admin@limitlessx.com
--    - Password: [choose a secure password]
--    - User ID: 1b93433d-695a-42a8-86cb-a15246bb533 (copy from the query result above)
--    - Email Confirm: TRUE (important - check this box)
-- 4. Click "Create User"

-- The User ID must match exactly with the ID from public.users table
-- This links the authentication user to the existing database record

-- After creating the auth user, you can log in with:
-- Email: admin@limitlessx.com  
-- Password: [whatever you set above]
