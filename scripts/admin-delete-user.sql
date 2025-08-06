-- Admin function to safely delete a user and all related data
-- This should be run by an admin user only

-- Function to delete a user and cascade to related tables
CREATE OR REPLACE FUNCTION admin_delete_user(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    -- Find the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    -- Delete from related tables first (to avoid foreign key constraints)
    DELETE FROM entries WHERE user_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % entries for user %', deleted_count, user_email;
    
    DELETE FROM dividends WHERE user_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % dividends for user %', deleted_count, user_email;
    
    DELETE FROM referrals WHERE referrer_id = user_id OR referee_id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % referrals for user %', deleted_count, user_email;
    
    -- Delete from public.users table
    DELETE FROM public.users WHERE id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % user profile for user %', deleted_count, user_email;
    
    -- Finally delete from auth.users (this will cascade to other auth tables)
    DELETE FROM auth.users WHERE id = user_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % auth record for user %', deleted_count, user_email;
    
    RAISE NOTICE 'Successfully deleted user % and all related data', user_email;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting user %: %', user_email, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- SELECT admin_delete_user('user@example.com');

-- To delete multiple users by pattern:
-- SELECT admin_delete_user(email) FROM auth.users WHERE email LIKE '%@example.com';
