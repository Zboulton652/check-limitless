-- MAKE USER ADMIN
-- Replace the email below with your account email and run this script

DO $$
DECLARE
    admin_email TEXT := 'your-email@example.com'; -- 👈 CHANGE THIS EMAIL
    user_exists BOOLEAN;
    user_id UUID;
BEGIN
    -- Check if user exists and get their ID
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = admin_email), 
           id INTO user_exists, user_id
    FROM public.users WHERE email = admin_email;
    
    IF user_exists THEN
        -- Update existing user to admin
        UPDATE public.users 
        SET role = 'admin' 
        WHERE email = admin_email;
        
        RAISE NOTICE '🎉 SUCCESS: User % is now an admin!', admin_email;
        RAISE NOTICE 'User ID: %', user_id;
        RAISE NOTICE 'You can now access the admin panel at /admin';
    ELSE
        RAISE NOTICE '❌ ERROR: User with email % not found.', admin_email;
        RAISE NOTICE 'Please:';
        RAISE NOTICE '1. Sign up for an account first';
        RAISE NOTICE '2. Update the email in this script';
        RAISE NOTICE '3. Run this script again';
    END IF;
END $$;
