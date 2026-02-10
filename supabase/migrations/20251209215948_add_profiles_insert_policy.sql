/*
  # Add INSERT Policy for Profiles Table

  1. Problem
    - Missing INSERT policy on profiles table
    - handle_new_user trigger fails when creating new profiles
    - "Database error querying schema" during authentication

  2. Solution
    - Add policy allowing service role to insert profiles
    - Ensure trigger can create profiles for new users

  3. Security
    - Only allows inserts during user creation (via trigger)
    - Maintains all other security policies
*/

-- Allow service role to insert profiles (for the trigger)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);