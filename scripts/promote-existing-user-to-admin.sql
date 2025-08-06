-- PROMOTE EXISTING USER TO ADMIN
-- Replace the email below with your actual account email and run this script

DO $$
DECLARE
    user_email TEXT := 'your-actual-email@example.com'; -- 👈 CHANGE THIS TO YOUR EMAIL
    user_exists BOOLEAN;
    user_id UUID;
BEGIN
    -- Check if user exists and get their ID
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = user_email), 
           id INTO user_exists, user_id
    FROM public.users WHERE email = user_email;
    
    IF user_exists THEN
        -- Update existing user to admin
        UPDATE public.users 
        SET role = 'admin' 
        WHERE email = user_email;
        
        RAISE NOTICE '🎉 SUCCESS: User % is now an admin!', user_email;
        RAISE NOTICE 'User ID: %', user_id;
        RAISE NOTICE 'You can now access the admin panel at /admin';
        
        -- Verify the update worked
        PERFORM id, email, role 
        FROM public.users 
        WHERE email = user_email;
    ELSE
        RAISE NOTICE '❌ ERROR: User with email % not found.', user_email;
        RAISE NOTICE 'Please:';
        RAISE NOTICE '1. Sign up for an account first at /auth/register';
        RAISE NOTICE '2. Update the email in this script';
        RAISE NOTICE '3. Run this script again';
    END IF;
END $$;
