/*
  # Remove Unnecessary INSERT Policy on Profiles

  1. Problem
    - INSERT policy on profiles may interfere with trigger
    - SECURITY DEFINER should bypass RLS anyway
    - Policy may be causing "Database error querying schema"

  2. Solution
    - Drop the INSERT policy completely
    - Let SECURITY DEFINER handle inserts via trigger
    - Users don't need direct INSERT access to profiles

  3. Security
    - Only the trigger can create profiles (via SECURITY DEFINER)
    - Users can still view and update their own profiles
    - Admins can view all profiles
*/

DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;