/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Changes
    - Drop existing admin policies that cause infinite recursion
    - Create a helper function `is_admin()` with SECURITY DEFINER to bypass RLS
    - Recreate admin policies using the helper function
  
  2. Security
    - The helper function safely checks admin status without RLS recursion
    - Maintains same security model: users read own data, admins read/update all
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Create a helper function to check if current user is admin
-- SECURITY DEFINER allows it to bypass RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin' AND approved = true
  );
END;
$$;

-- Recreate admin policies using the helper function
CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());