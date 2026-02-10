/*
  # Complete Database Schema for Agency Platform
  
  ## New Tables
  
  ### 1. profiles
  Stores user profile information linked to auth.users
  - `id` (uuid, PK) - References auth.users.id
  - `role` (text) - User role: 'client' or 'admin'
  - `full_name` (text) - User's full name
  - `phone` (text, nullable) - Contact phone number
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. services
  Available agency services
  - `id` (uuid, PK)
  - `name` (text) - Service name
  - `description` (text) - Detailed description
  - `base_price` (numeric) - Base price
  - `created_at` (timestamptz)
  
  ### 3. projects
  Client projects tracking
  - `id` (uuid, PK)
  - `client_id` (uuid, FK) - References profiles
  - `service_id` (uuid, FK) - References services
  - `project_name` (text) - Project name
  - `status` (text) - Project status
  - `progress_percentage` (integer) - Completion percentage
  - `start_date` (timestamptz)
  - `end_date` (timestamptz, nullable)
  - `notes` (text)
  - `created_at`, `updated_at` (timestamptz)
  
  ### 4. messages
  Project communication messages
  - `id` (uuid, PK)
  - `project_id` (uuid, FK) - References projects
  - `sender_id` (uuid, FK) - References profiles
  - `message` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)
  
  ### 5. infoproducts
  Digital products for sale
  - `id` (uuid, PK)
  - `name` (text)
  - `description` (text)
  - `price` (numeric)
  - `image_url` (text)
  - `purchase_link` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ### 6. quote_requests
  Contact form submissions
  - `id` (uuid, PK)
  - `name`, `email`, `phone`, `service_type`, `message` (text)
  - `status` (text) - Request status
  - `created_at` (timestamptz)
  
  ### 7. portfolio
  Portfolio showcase items
  - `id` (uuid, PK)
  - `title` (text) - Project title
  - `category` (text) - Project category
  - `image_url` (text) - Preview image
  - `project_url` (text, nullable) - Live project URL
  - `description` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  
  ### 8. site_visits
  Website analytics counter
  - `id` (bigint, PK)
  - `page` (text) - Page identifier
  - `visit_count` (integer) - Total visits
  - `last_visit` (timestamptz)
  - `created_at`, `updated_at` (timestamptz)
  
  ## Security
  
  All tables have RLS enabled with appropriate policies:
  - Public read access where appropriate (services, portfolio, infoproducts)
  - Users can only access their own data
  - Admins have full access to all data
  - Admin checks use JWT metadata to prevent recursion
  
  ## Triggers & Functions
  
  - `handle_new_user()` - Auto-creates profile when user signs up
  - `update_updated_at_column()` - Auto-updates updated_at timestamps
  - `increment_visit_count()` - Increments page visit counters
*/

-- ==========================================
-- CREATE TABLES
-- ==========================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  full_name text NOT NULL,
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  project_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. Infoproducts table
CREATE TABLE IF NOT EXISTS infoproducts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  image_url text DEFAULT '',
  purchase_link text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 6. Quote requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  service_type text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- 7. Portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  project_url text,
  description text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 8. Site visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id bigserial PRIMARY KEY,
  page text UNIQUE NOT NULL DEFAULT 'home',
  visit_count integer DEFAULT 0,
  last_visit timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- ENABLE RLS ON ALL TABLES
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE infoproducts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES - PROFILES
-- ==========================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ==========================================
-- RLS POLICIES - SERVICES
-- ==========================================

CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ==========================================
-- RLS POLICIES - PROJECTS
-- ==========================================

CREATE POLICY "Clients can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

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

-- ==========================================
-- RLS POLICIES - MESSAGES
-- ==========================================

CREATE POLICY "Users can view messages from their projects"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.client_id = auth.uid()
    ) OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users can send messages to their projects"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = messages.project_id
        AND projects.client_id = auth.uid()
      ) OR
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
  );

CREATE POLICY "Admins can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ==========================================
-- RLS POLICIES - INFOPRODUCTS
-- ==========================================

CREATE POLICY "Anyone can view active infoproducts"
  ON infoproducts FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage infoproducts"
  ON infoproducts FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ==========================================
-- RLS POLICIES - QUOTE_REQUESTS
-- ==========================================

CREATE POLICY "Anyone can create quote requests"
  ON quote_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ==========================================
-- RLS POLICIES - PORTFOLIO
-- ==========================================

CREATE POLICY "Anyone can view active portfolio"
  ON portfolio FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all portfolio"
  ON portfolio FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can manage portfolio"
  ON portfolio FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ==========================================
-- RLS POLICIES - SITE_VISITS
-- ==========================================

CREATE POLICY "Anyone can view visits"
  ON site_visits FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "System can update visits"
  ON site_visits FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can insert visits"
  ON site_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ==========================================
-- FUNCTIONS
-- ==========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    RAISE WARNING 'Failed to create profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to increment visit count
CREATE OR REPLACE FUNCTION increment_visit_count(page_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO site_visits (page, visit_count, last_visit, updated_at)
  VALUES (page_name, 1, now(), now())
  ON CONFLICT (page)
  DO UPDATE SET
    visit_count = site_visits.visit_count + 1,
    last_visit = now(),
    updated_at = now();
END;
$$;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_is_active ON portfolio(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- ==========================================
-- DEFAULT DATA
-- ==========================================

-- Insert default services
INSERT INTO services (name, description, base_price) VALUES
  ('Criação de Sites', 'Desenvolvimento completo de sites responsivos e modernos', 2500.00),
  ('Criação de Logos', 'Design profissional de identidade visual e logotipos', 800.00),
  ('Gerenciamento de Tráfego', 'Gestão de campanhas de tráfego pago e marketing digital', 1500.00),
  ('Infoprodutos', 'Desenvolvimento e estruturação de infoprodutos digitais', 3000.00)
ON CONFLICT DO NOTHING;

-- Insert initial visit counter
INSERT INTO site_visits (page, visit_count)
VALUES ('home', 0)
ON CONFLICT (page) DO NOTHING;