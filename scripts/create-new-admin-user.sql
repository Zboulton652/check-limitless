-- Create a new admin user with a fresh UUID
-- This avoids conflicts with the existing admin record

-- Step 1: Generate a new UUID for the admin user
-- Copy this UUID - you'll need it when creating the auth user
SELECT gen_random_uuid() as new_admin_id;

-- Step 2: Insert the new admin user into public.users
-- Replace 'YOUR_NEW_UUID_HERE' with the UUID from step 1
INSERT INTO public.users (
  id,
  email,
  role,
  referral_code,
  payout_method,
  site_credit,
  total_spent,
  total_dividends,
  total_referral_earnings
) VALUES (
  'YOUR_NEW_UUID_HERE', -- Replace with the UUID from step 1
  'admin@limitlessx.com',
  'admin',
  'LXC-ADMIN',
  'site_credit',
  0,
  0,
  0,
  0
);

-- Step 3: Verify the user was created
SELECT id, email, role, referral_code 
FROM public.users 
WHERE email = 'admin@limitlessx.com' AND role = 'admin';
