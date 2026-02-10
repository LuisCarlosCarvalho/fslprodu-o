/*
  # Remove Problematic Triggers that Interfere with Auth

  1. Problem
    - Triggers that update auth.users during authentication cause errors
    - "Database error querying schema" during login

  2. Solution
    - Drop trigger that syncs role to metadata during profile changes
    - Drop trigger on auth.users that updates auth.users (causes recursion)
    - Keep metadata sync only in handle_new_user for new signups
    - Manually sync existing users' metadata

  3. Security
    - Existing users already have metadata set
    - New users will get metadata set on signup
    - Admin can update metadata manually if needed
*/

-- Drop the problematic sync trigger
DROP TRIGGER IF EXISTS sync_profile_role_to_metadata ON profiles;
DROP FUNCTION IF EXISTS sync_role_to_metadata();

-- Simplify handle_new_user to not update auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Just create profile, don't touch auth.users
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'client'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a separate function to sync roles (to be called manually by admin)
CREATE OR REPLACE FUNCTION sync_user_role_to_metadata(user_id uuid)
RETURNS void AS $$
DECLARE
  user_role text;
BEGIN
  -- Get role from profiles
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(user_role)
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all existing users have their role synced
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id, role FROM profiles
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(profile_record.role)
    )
    WHERE id = profile_record.id;
  END LOOP;
END $$;