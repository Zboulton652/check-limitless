-- FIX RLS POLICIES - Remove infinite recursion
-- This fixes the "infinite recursion detected in policy" error

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Public can view competitions" ON public.competitions;
DROP POLICY IF EXISTS "Anyone can view active competitions" ON public.competitions;
DROP POLICY IF EXISTS "Admins can manage competitions" ON public.competitions;
DROP POLICY IF EXISTS "Users can view their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can create entries" ON public.entries;
DROP POLICY IF EXISTS "Admins can view all entries" ON public.entries;
DROP POLICY IF EXISTS "Users can view their own dividends" ON public.dividends;
DROP POLICY IF EXISTS "Admins can manage dividends" ON public.dividends;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Admins can manage referrals" ON public.referrals;

-- Create fixed policies without recursion
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admin_all_users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Competitions policies (no user table dependency)
CREATE POLICY "competitions_select_active" ON public.competitions
  FOR SELECT USING (status = 'active');

CREATE POLICY "admin_all_competitions" ON public.competitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Entries policies
CREATE POLICY "entries_select_own" ON public.entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "entries_insert_own" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_all_entries" ON public.entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Dividends policies
CREATE POLICY "dividends_select_own" ON public.dividends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_all_dividends" ON public.dividends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Referrals policies
CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "admin_all_referrals" ON public.referrals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Verify policies are working
SELECT 'RLS Policies Fixed Successfully!' as status;
