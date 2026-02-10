/*
  # Create Portfolio Table

  1. New Tables
    - `portfolio`
      - `id` (uuid, primary key)
      - `title` (text) - Nome do projeto
      - `category` (text) - Categoria do projeto (Design Gráfico, Easy Colour, etc)
      - `image_url` (text) - URL da imagem do projeto
      - `project_url` (text, nullable) - URL do projeto online
      - `description` (text) - Descrição do projeto
      - `is_active` (boolean) - Se o projeto está ativo para exibição
      - `created_at` (timestamptz) - Data de criação

  2. Security
    - Enable RLS on `portfolio` table
    - Add policy for public read access (portfolio is public)
    - Add policy for authenticated admins to manage portfolio items
*/

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

ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active portfolio items"
  ON portfolio
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all portfolio items"
  ON portfolio
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert portfolio items"
  ON portfolio
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update portfolio items"
  ON portfolio
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete portfolio items"
  ON portfolio
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_is_active ON portfolio(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio(created_at DESC);
