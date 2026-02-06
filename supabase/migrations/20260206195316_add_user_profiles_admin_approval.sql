/*
  # Add user profiles with admin approval system

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references auth.users)
      - `email` (text, stores user email for admin visibility)
      - `role` (text, 'admin' or 'user', default 'user')
      - `approved` (boolean, default false - new users must be approved)
      - `created_at` (timestamptz)

  2. Trigger
    - `handle_new_user` auto-creates a profile row when a user signs up
    - New signups default to role='user', approved=false

  3. Seed
    - All existing auth users are marked as admin + approved

  4. Security
    - RLS enabled on user_profiles
    - Users can read their own profile
    - Admins can read all profiles
    - Admins can update all profiles (approve/reject, change roles)
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id),
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role, approved)
  VALUES (NEW.id, NEW.email, 'user', false);
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

INSERT INTO user_profiles (user_id, email, role, approved)
SELECT id, email, 'admin', true FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);