/*
  # Add Wine Memories and Adventurousness

  1. New Tables
    - `wine_memories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - wine name
      - `producer` (text) - winery/producer
      - `vintage` (text) - vintage year
      - `type` (text) - red, white, rosé, etc.
      - `region` (text) - origin region
      - `rating` (integer, 1-5) - user's rating
      - `notes` (text) - user's tasting notes or comments
      - `price` (numeric) - price paid
      - `created_at` (timestamptz)

  2. Modified Tables
    - `user_preferences`
      - Added `adventurousness` (text) - low, medium, or high

  3. Security
    - Enable RLS on `wine_memories`
    - Users can only CRUD their own wine memories
*/

CREATE TABLE IF NOT EXISTS wine_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  producer text DEFAULT '',
  vintage text DEFAULT '',
  type text DEFAULT '',
  region text DEFAULT '',
  rating integer DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  notes text DEFAULT '',
  price numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wine_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own memories"
  ON wine_memories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON wine_memories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON wine_memories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON wine_memories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wine_memories_user_id ON wine_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_wine_memories_created_at ON wine_memories(created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'adventurousness'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN adventurousness text DEFAULT 'medium';
  END IF;
END $$;