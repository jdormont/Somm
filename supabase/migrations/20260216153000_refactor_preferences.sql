/*
  # Refactor Preferences Schema

  1. New Columns
    - Adds spectrum range columns (min/max 1-10) for:
      - Body
      - Sweetness
      - Tannins
      - Acidity
      - Earthiness
    - Adds `varietal_preferences` as JSONB to store granular Love/Neutral/Avoid status per varietal.

  2. Defaults
    - Ranges default to 1-10 (full spectrum).
    - varietal_preferences defaults to empty object.
*/

ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS body_min integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS body_max integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS sweetness_min integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS sweetness_max integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS tannins_min integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS tannins_max integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS acidity_min integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS acidity_max integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS earthiness_min integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS earthiness_max integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS varietal_preferences jsonb DEFAULT '{}'::jsonb;
