/*
  # Fix Infinite Recursion in Profiles RLS Policies

  1. Problem
    - The "Admins can view all profiles" policy causes infinite recursion
    - It queries the profiles table to check if user is admin, which triggers the same policy again

  2. Solution
    - Drop the problematic policy
    - Create a new policy that checks admin role from auth.jwt() metadata
    - Update the user's metadata to include the role

  3. Security
    - Users can still view their own profile
    - Admins can view all profiles using metadata check (no recursion)
    - Maintains all other security policies
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Update the admin user's metadata to include role
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'brasilviptv@gmail.com';

-- Create new policy using JWT metadata (no recursion)
CREATE POLICY "Admins can view all profiles via metadata"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Create function to sync role to metadata when profile is updated
CREATE OR REPLACE FUNCTION sync_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(NEW.role)
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to keep metadata in sync
DROP TRIGGER IF EXISTS sync_profile_role_to_metadata ON profiles;
CREATE TRIGGER sync_profile_role_to_metadata
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_metadata();