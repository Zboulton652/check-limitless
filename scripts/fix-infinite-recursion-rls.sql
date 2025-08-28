-- Fix infinite recursion in RLS policies
-- This script will drop and recreate all RLS policies to eliminate circular references

-- Temporarily disable RLS to allow policy updates
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (including any that might exist)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on users table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.users';
    END LOOP;
    
    -- Drop all policies on entries table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'entries') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.entries';
    END LOOP;
    
    -- Drop all policies on dividends table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dividends') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.dividends';
    END LOOP;
    
    -- Drop all policies on referrals table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'referrals') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.referrals';
    END LOOP;
    
    -- Drop all policies on competitions table
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'competitions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.competitions';
    END LOOP;
END $$;

-- Create simple, non-recursive policies for users table
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies for users (check role directly without recursion)
CREATE POLICY "admin_users_all" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Entries policies
CREATE POLICY "entries_select_own" ON public.entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "entries_insert_own" ON public.entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_entries_all" ON public.entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Dividends policies
CREATE POLICY "dividends_select_own" ON public.dividends
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_dividends_all" ON public.dividends
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Referrals policies
CREATE POLICY "referrals_select_own" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "referrals_insert_own" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "admin_referrals_all" ON public.referrals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Competitions policies (public read, admin write)
CREATE POLICY "competitions_select_all" ON public.competitions
    FOR SELECT USING (true);

CREATE POLICY "admin_competitions_all" ON public.competitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'admin'
        )
    );

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Verify policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
