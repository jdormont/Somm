/*
  # Optimize RLS Policies for Performance

  ## Overview
  This migration optimizes Row Level Security policies by wrapping auth.uid() 
  in SELECT statements to prevent re-evaluation for each row, which significantly 
  improves query performance at scale.

  ## Changes Made

  ### 1. user_preferences table
  - Drop and recreate all 4 policies (SELECT, INSERT, UPDATE, DELETE)
  - Replace `auth.uid()` with `(select auth.uid())`

  ### 2. scan_sessions table
  - Drop and recreate 3 policies (SELECT, INSERT, DELETE)
  - Replace `auth.uid()` with `(select auth.uid())`

  ### 3. wine_memories table
  - Drop and recreate all 4 policies (SELECT, INSERT, UPDATE, DELETE)
  - Replace `auth.uid()` with `(select auth.uid())`

  ### 4. user_profiles table
  - Combine two SELECT policies into one optimized policy
  - Replace `auth.uid()` with `(select auth.uid())`
  - Optimize admin check by wrapping in SELECT

  ## Security
  All policies maintain the same security guarantees:
  - Users can only access their own data
  - Admins can access all profiles
  - RLS remains enabled on all tables

  ## Performance Impact
  These changes prevent the database from re-evaluating auth.uid() for every 
  row in result sets, which can cause significant performance degradation 
  with large datasets.
*/

-- ============================================================================
-- user_preferences policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- scan_sessions policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own scans" ON scan_sessions;
DROP POLICY IF EXISTS "Users can insert own scans" ON scan_sessions;
DROP POLICY IF EXISTS "Users can delete own scans" ON scan_sessions;

CREATE POLICY "Users can read own scans"
  ON scan_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own scans"
  ON scan_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own scans"
  ON scan_sessions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- wine_memories policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own memories" ON wine_memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON wine_memories;
DROP POLICY IF EXISTS "Users can update own memories" ON wine_memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON wine_memories;

CREATE POLICY "Users can read own memories"
  ON wine_memories FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own memories"
  ON wine_memories FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own memories"
  ON wine_memories FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own memories"
  ON wine_memories FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- user_profiles policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Combine the two SELECT policies into one optimized policy
-- This also resolves the "Multiple Permissive Policies" warning
CREATE POLICY "Users can read profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = (select auth.uid()) AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = (select auth.uid()) AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = (select auth.uid()) AND up.role = 'admin'
    )
  );