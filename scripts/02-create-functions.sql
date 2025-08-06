-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    generate_referral_code()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update competition entry count and user stats
CREATE OR REPLACE FUNCTION update_competition_entries()
RETURNS TRIGGER AS $$
BEGIN
  -- Update competition entry count
  UPDATE public.competitions
  SET current_entries = current_entries + 1,
      updated_at = NOW()
  WHERE id = NEW.competition_id;
  
  -- Update user total spent
  UPDATE public.users
  SET total_spent = total_spent + NEW.amount_paid,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Update referrer earnings if user has a referrer
  UPDATE public.referrals
  SET total_earned = total_earned + (NEW.amount_paid * earnings_percentage / 100)
  WHERE referee_id = NEW.user_id;
  
  -- Update referrer's total referral earnings
  UPDATE public.users
  SET total_referral_earnings = total_referral_earnings + (NEW.amount_paid * 0.10),
      updated_at = NOW()
  WHERE id IN (
    SELECT referrer_id FROM public.referrals WHERE referee_id = NEW.user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_entry_created ON public.entries;

-- Create trigger for new entry
CREATE TRIGGER on_entry_created
  AFTER INSERT ON public.entries
  FOR EACH ROW EXECUTE FUNCTION update_competition_entries();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for tables with updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitions_updated_at ON public.competitions;
CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
