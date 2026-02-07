-- Add use_shared_key column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS use_shared_key boolean NOT NULL DEFAULT false;

-- Update RLS policies to allow admins to update this column
-- (Existing policies "Admins can update all profiles" should cover this if they allow UPDATE on the table)
