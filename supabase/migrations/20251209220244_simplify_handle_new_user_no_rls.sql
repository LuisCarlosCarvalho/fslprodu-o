/*
  # Simplify handle_new_user - Remove RLS Check

  1. Problem
    - Setting JWT claims in trigger may cause authentication issues
    - "Database error querying schema" during login

  2. Solution
    - Simplify handle_new_user to do basic insert
    - Remove set_config and just rely on SECURITY DEFINER
    - Add better error handling

  3. Security
    - SECURITY DEFINER bypasses RLS automatically
    - Only executes on new user creation
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple insert - SECURITY DEFINER bypasses RLS
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
    -- Don't fail user creation if profile creation fails
    RAISE WARNING 'Failed to create profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;