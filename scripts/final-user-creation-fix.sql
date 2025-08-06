-- FINAL COMPREHENSIVE FIX FOR USER CREATION
-- This will handle all possible edge cases and provide detailed logging

-- First, let's completely recreate the referral code generation function with better error handling
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  attempts INTEGER := 0;
  max_attempts INTEGER := 50;
BEGIN
  LOOP
    attempts := attempts + 1;
    
    -- Generate a random 8-character code using multiple entropy sources
    new_code := UPPER(
      SUBSTRING(
        MD5(
          RANDOM()::TEXT || 
          CLOCK_TIMESTAMP()::TEXT || 
          attempts::TEXT ||
          EXTRACT(MICROSECONDS FROM CLOCK_TIMESTAMP())::TEXT
        ) 
        FROM 1 FOR 8
      )
    );
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM public.users WHERE referral_code = new_code
    ) INTO code_exists;
    
    -- If unique or max attempts reached, exit
    IF NOT code_exists OR attempts >= max_attempts THEN
      EXIT;
    END IF;
  END LOOP;
  
  -- If still not unique after max attempts, append timestamp
  IF code_exists THEN
    new_code := new_code || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
  END IF;
  
  RETURN new_code;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: use UUID-based code if everything fails
    RETURN UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the user creation function with comprehensive error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
  insert_attempts INTEGER := 0;
  max_insert_attempts INTEGER := 5;
BEGIN
  -- Log the attempt
  RAISE LOG 'Starting user creation for email: %', NEW.email;
  
  LOOP
    insert_attempts := insert_attempts + 1;
    
    BEGIN
      -- Generate referral code
      new_referral_code := generate_referral_code();
      
      -- Validate the generated code
      IF new_referral_code IS NULL OR LENGTH(new_referral_code) < 6 THEN
        RAISE EXCEPTION 'Invalid referral code generated: %', new_referral_code;
      END IF;
      
      -- Insert user record
      INSERT INTO public.users (
        id, 
        email, 
        referral_code,
        role,
        payout_method,
        site_credit,
        total_spent,
        total_dividends,
        total_referral_earnings,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        new_referral_code,
        'user'::user_role,
        'site_credit'::payout_method,
        0,
        0,
        0,
        0,
        NOW(),
        NOW()
      );
      
      -- If we get here, success!
      RAISE LOG 'Successfully created user profile for: % with referral code: % (attempt %)', 
        NEW.email, new_referral_code, insert_attempts;
      
      RETURN NEW;
      
    EXCEPTION
      WHEN unique_violation THEN
        -- Referral code collision - try again
        RAISE LOG 'Referral code collision for %: % (attempt %)', NEW.email, new_referral_code, insert_attempts;
        
        IF insert_attempts >= max_insert_attempts THEN
          -- Final attempt with guaranteed unique code
          new_referral_code := 'U' || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT || 
                              SUBSTRING(NEW.id::TEXT FROM 1 FOR 6);
          
          INSERT INTO public.users (
            id, email, referral_code, role, payout_method,
            site_credit, total_spent, total_dividends, total_referral_earnings,
            created_at, updated_at
          ) VALUES (
            NEW.id, NEW.email, new_referral_code, 'user'::user_role, 'site_credit'::payout_method,
            0, 0, 0, 0, NOW(), NOW()
          );
          
          RAISE LOG 'Created user with fallback referral code: %', new_referral_code;
          RETURN NEW;
        END IF;
        
      WHEN foreign_key_violation THEN
        RAISE LOG 'Foreign key violation for %: %', NEW.email, SQLERRM;
        RAISE EXCEPTION 'Database constraint error: %', SQLERRM;
        
      WHEN check_violation THEN
        RAISE LOG 'Check constraint violation for %: %', NEW.email, SQLERRM;
        RAISE EXCEPTION 'Data validation error: %', SQLERRM;
        
      WHEN OTHERS THEN
        RAISE LOG 'Unexpected error for % (attempt %): % - %', NEW.email, insert_attempts, SQLSTATE, SQLERRM;
        
        IF insert_attempts >= max_insert_attempts THEN
          RAISE EXCEPTION 'Failed to create user profile after % attempts: % (SQLSTATE: %)', 
            max_insert_attempts, SQLERRM, SQLSTATE;
        END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it's fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the complete setup
DO $$
DECLARE
  test_codes TEXT[];
  i INTEGER;
BEGIN
  -- Test referral code generation
  FOR i IN 1..5 LOOP
    test_codes := array_append(test_codes, generate_referral_code());
  END LOOP;
  
  RAISE NOTICE 'Generated test codes: %', test_codes;
  
  -- Verify all components exist
  IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') AND
     EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') AND
     EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_referral_code') THEN
    RAISE NOTICE '🎉 ALL COMPONENTS READY!';
    RAISE NOTICE '✅ Trigger: Active';
    RAISE NOTICE '✅ Handler Function: Ready';
    RAISE NOTICE '✅ Code Generator: Working';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Try registering now - it should work!';
  ELSE
    RAISE NOTICE '❌ Some components are missing - check the setup';
  END IF;
END $$;
