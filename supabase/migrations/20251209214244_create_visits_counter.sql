/*
  # Create Visits Counter Table

  1. New Tables
    - `site_visits`
      - `id` (bigint, primary key)
      - `visit_count` (integer) - Total number of visits
      - `last_visit` (timestamptz) - Last visit timestamp
      - `page` (text) - Page identifier
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `site_visits` table
    - Add policy for public read access
    - Add policy for authenticated users to update
  
  3. Initial Data
    - Insert initial counter for homepage
*/

CREATE TABLE IF NOT EXISTS site_visits (
  id bigserial PRIMARY KEY,
  page text UNIQUE NOT NULL DEFAULT 'home',
  visit_count integer DEFAULT 0,
  last_visit timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visit counts"
  ON site_visits
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can update visit counts"
  ON site_visits
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can insert visit counts"
  ON site_visits
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert initial counter
INSERT INTO site_visits (page, visit_count)
VALUES ('home', 0)
ON CONFLICT (page) DO NOTHING;

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