/*
  # Fix user_profiles RLS Performance Without Breaking Auth

  ## Overview
  This migration fixes the RLS performance issues on user_profiles while 
  avoiding the infinite recursion problem.

  ## Changes Made
  1. Drop all existing user_profiles policies
  2. Recreate two separate SELECT policies (not combined)
  3. Recreate UPDATE policy for admins
  4. Optimize the "Users can read own profile" policy with (select auth.uid())
  5. Keep admin policies using the is_admin() helper function to avoid recursion
  6. Update is_admin() function to use (select auth.uid()) for consistency

  ## Security
  - Users can only read their own profile
  - Admins can read and update all profiles
  - No infinite recursion in policy checks
*/

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users can read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Recreate the two separate SELECT policies with optimizations
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Recreate the UPDATE policy for admins
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Update the is_admin() function to use (select auth.uid()) for consistency
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = (select auth.uid()) AND role = 'admin' AND approved = true
  );
END;
$$;