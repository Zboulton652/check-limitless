-- If the trigger still doesn't work, let's test manually
-- First, check what's in auth.users (you might need to register first)
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check what's in public.users
SELECT id, email, referral_code, created_at FROM public.users ORDER BY created_at DESC LIMIT 5;

-- If you see users in auth.users but not in public.users, 
-- the trigger isn't working and we need to create them manually
