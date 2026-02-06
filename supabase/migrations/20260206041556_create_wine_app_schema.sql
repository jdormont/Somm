/*
  # Wine Advisor App - Initial Schema

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `wine_types` (text array) - preferred wine types (red, white, rosé, sparkling, dessert)
      - `regions` (text array) - preferred wine regions
      - `flavor_profiles` (text array) - preferred flavor profiles (bold, fruity, dry, etc.)
      - `avoidances` (text array) - things to avoid (sulfites, tannins, etc.)
      - `default_budget_min` (numeric) - default minimum budget
      - `default_budget_max` (numeric) - default maximum budget
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `scan_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `budget_min` (numeric) - budget range min for this scan
      - `budget_max` (numeric) - budget range max for this scan
      - `notes` (text) - additional notes like food pairing
      - `wines_detected` (jsonb) - wines found in the image
      - `recommendations` (jsonb) - AI recommendations
      - `summary` (text) - AI summary of recommendations
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only CRUD their own preferences
    - Users can only CRUD their own scan sessions
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_types text[] DEFAULT '{}',
  regions text[] DEFAULT '{}',
  flavor_profiles text[] DEFAULT '{}',
  avoidances text[] DEFAULT '{}',
  default_budget_min numeric DEFAULT 15,
  default_budget_max numeric DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS scan_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_min numeric DEFAULT 0,
  budget_max numeric DEFAULT 100,
  notes text DEFAULT '',
  wines_detected jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scan_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scans"
  ON scan_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON scan_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON scan_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_scan_sessions_user_id ON scan_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_sessions_created_at ON scan_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);