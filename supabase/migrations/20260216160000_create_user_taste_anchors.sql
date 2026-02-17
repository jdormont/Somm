/*
  # Create User Taste Anchors Table

  1. New Table
    - `user_taste_anchors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `wine_name` (text)
      - `producer` (text)
      - `vintage` (text)
      - `profile_data` (jsonb) - Stores the extracted 1-10 stats: { body: 8, tannin: 6, ... }
      - `data_source` (text) - e.g., "tavily_search"
      - `source_url` (text) - URL of the tech sheet/review found
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_taste_anchors`
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS user_taste_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  wine_name text NOT NULL,
  producer text NOT NULL,
  vintage text,
  profile_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_source text,
  source_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_taste_anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own taste anchors"
  ON user_taste_anchors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own taste anchors"
  ON user_taste_anchors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own taste anchors"
  ON user_taste_anchors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own taste anchors"
  ON user_taste_anchors
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
