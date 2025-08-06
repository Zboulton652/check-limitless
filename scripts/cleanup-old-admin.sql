-- Step 1: Remove the old admin record first
DELETE FROM public.users WHERE id = '1b93433d-695a-42a8-86cb-a15246bb533';

-- Step 2: Verify it's gone
SELECT id, email, role, referral_code 
FROM public.users 
WHERE role = 'admin';
