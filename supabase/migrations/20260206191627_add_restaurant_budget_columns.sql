/*
  # Add Restaurant Budget Preferences

  1. Modified Tables
    - `user_preferences`
      - Added `restaurant_budget_min` (numeric) - default minimum budget for restaurant wines
      - Added `restaurant_budget_max` (numeric) - default maximum budget for restaurant wines

    - `scan_sessions`
      - Added `context` (text) - whether the scan was for a 'store' or 'restaurant' setting

  2. Notes
    - Restaurant budgets default to ~2.5x the store defaults ($38 and $125)
    - Existing users will get sensible restaurant defaults
    - Context defaults to 'store' for backwards compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'restaurant_budget_min'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN restaurant_budget_min numeric DEFAULT 38;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'restaurant_budget_max'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN restaurant_budget_max numeric DEFAULT 125;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scan_sessions' AND column_name = 'context'
  ) THEN
    ALTER TABLE scan_sessions ADD COLUMN context text DEFAULT 'store';
  END IF;
END $$;
