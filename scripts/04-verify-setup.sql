-- Verification script to check if everything is set up correctly

DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    trigger_count INTEGER;
    policy_count INTEGER;
    competition_count INTEGER;
    admin_count INTEGER;
BEGIN
    -- Check tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'competitions', 'entries', 'dividends', 'referrals');
    
    -- Check functions
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('generate_referral_code', 'handle_new_user', 'update_competition_entries');
    
    -- Check triggers
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' 
    AND trigger_name IN ('on_auth_user_created', 'on_entry_created');
    
    -- Check RLS policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Check demo data
    SELECT COUNT(*) INTO competition_count FROM public.competitions;
    SELECT COUNT(*) INTO admin_count FROM public.users WHERE role = 'admin';
    
    -- Report results
    RAISE NOTICE '=== SUPABASE DATABASE SETUP VERIFICATION ===';
    RAISE NOTICE 'Tables created: % of 5', table_count;
    RAISE NOTICE 'Functions created: % of 3', function_count;
    RAISE NOTICE 'Triggers created: % of 2', trigger_count;
    RAISE NOTICE 'RLS policies created: %', policy_count;
    RAISE NOTICE 'Demo competitions: %', competition_count;
    RAISE NOTICE 'Admin users: %', admin_count;
    
    IF table_count = 5 AND function_count = 3 AND trigger_count >= 2 THEN
        RAISE NOTICE '✅ Database setup is COMPLETE and ready to use!';
    ELSE
        RAISE NOTICE '❌ Database setup is INCOMPLETE. Please run the setup scripts.';
    END IF;
    
    RAISE NOTICE '=== NEXT STEPS ===';
    RAISE NOTICE '1. Sign up for an account in the app';
    RAISE NOTICE '2. Update the email in script 03 and run it to become admin';
    RAISE NOTICE '3. Use the admin panel to create more competitions';
    RAISE NOTICE '4. Set up Stripe for payment processing';
END $$;

-- Show basic table information
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'competitions', 'entries', 'dividends', 'referrals')
ORDER BY table_name, ordinal_position;
