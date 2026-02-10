/*
  # Fix Admin Policies Across All Tables

  1. Problem
    - Multiple policies check admin role by querying profiles table
    - This can cause recursion and performance issues

  2. Solution
    - Replace all admin checks with JWT metadata checks
    - Use (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'

  3. Tables Updated
    - services
    - projects
    - messages
    - infoproducts
    - quote_requests

  4. Security
    - All policies maintain same security level
    - Better performance using JWT metadata
    - No recursion issues
*/

-- SERVICES POLICIES
DROP POLICY IF EXISTS "Admins can manage services" ON services;

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- PROJECTS POLICIES
DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view messages from their projects" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their projects" ON messages;
DROP POLICY IF EXISTS "Admins can update message read status" ON messages;

CREATE POLICY "Users can view own project messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = messages.project_id
        AND projects.client_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins and users can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
    sender_id = auth.uid()
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
    sender_id = auth.uid()
  );

-- INFOPRODUCTS POLICIES
DROP POLICY IF EXISTS "Admins can manage infoproducts" ON infoproducts;

CREATE POLICY "Admins can manage infoproducts"
  ON infoproducts FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- QUOTE_REQUESTS POLICIES
DROP POLICY IF EXISTS "Admins can view all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can update quote requests" ON quote_requests;

CREATE POLICY "Admins can view quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete quote requests"
  ON quote_requests FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');