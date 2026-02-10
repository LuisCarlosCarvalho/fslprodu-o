/*
  # Fix Portfolio RLS Policies

  1. Problem
    - Portfolio policies query profiles table during authentication
    - This causes "Database error querying schema" errors
    - Policies should check JWT metadata instead

  2. Solution
    - Drop all portfolio admin policies that query profiles
    - Create new policies using JWT metadata
    - No recursion or complex queries during auth

  3. Security
    - Maintains same security level
    - Better performance
    - No authentication issues
*/

-- Drop old policies that query profiles table
DROP POLICY IF EXISTS "Admins can view all portfolio items" ON portfolio;
DROP POLICY IF EXISTS "Admins can insert portfolio items" ON portfolio;
DROP POLICY IF EXISTS "Admins can update portfolio items" ON portfolio;
DROP POLICY IF EXISTS "Admins can delete portfolio items" ON portfolio;

-- Create new policies using JWT metadata
CREATE POLICY "Admins can view all portfolio via metadata"
  ON portfolio FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert portfolio via metadata"
  ON portfolio FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update portfolio via metadata"
  ON portfolio FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete portfolio via metadata"
  ON portfolio FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');