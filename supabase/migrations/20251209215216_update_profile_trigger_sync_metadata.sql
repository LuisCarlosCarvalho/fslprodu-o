/*
  # Update Profile Creation Trigger to Sync Metadata

  1. Changes
    - Update handle_new_user function to sync role to JWT metadata
    - Ensures new users have their role in app_metadata for RLS policies

  2. Security
    - Maintains existing RLS policies
    - Ensures consistent role data between profiles and auth metadata
*/

-- Update function to sync role to metadata on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'client'
  );
  
  -- Sync role to metadata
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"client"'
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;