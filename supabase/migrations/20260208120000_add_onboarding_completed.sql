-- Add onboarding_completed column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Update RLS policies to allow users to update their own onboarding status
-- (Existing policies "Users can update own profile" should cover this if they allow UPDATE on the table)
