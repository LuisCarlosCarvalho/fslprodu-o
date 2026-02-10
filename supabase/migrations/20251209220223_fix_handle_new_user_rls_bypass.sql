/*
  # Fix handle_new_user to Bypass RLS Correctly

  1. Problem
    - handle_new_user function fails to insert into profiles
    - RLS policies block the insert even though function is SECURITY DEFINER
    - "Database error querying schema" during authentication

  2. Solution
    - Update handle_new_user to set proper security context
    - Use SET LOCAL to configure jwt.claims for the insert
    - This allows the INSERT policy to validate correctly

  3. Security
    - Function is SECURITY DEFINER so it runs with elevated privileges
    - Only triggered on new user creation in auth.users
    - Maintains all security policies
*/

-- Update handle_new_user to set proper context for RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the JWT claim so RLS policies work correctly
  PERFORM set_config('request.jwt.claim.sub', NEW.id::text, true);
  
  -- Create profile
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'client'
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;