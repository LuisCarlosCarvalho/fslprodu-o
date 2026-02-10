/*
  # Criar Sistema de Aprovação de Usuários

  1. Nova Tabela
    - `user_approvals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência para auth.users)
      - `email` (text)
      - `full_name` (text)
      - `phone` (text)
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `approved_by` (uuid, referência para profiles)
      - `approved_at` (timestamptz)
      - `rejection_reason` (text)
      - `created_at` (timestamptz)

  2. Segurança
    - Habilitar RLS
    - Apenas admins podem visualizar e gerenciar aprovações
*/

CREATE TABLE IF NOT EXISTS user_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all approvals"
  ON user_approvals FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update approvals"
  ON user_approvals FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "System can insert approvals"
  ON user_approvals FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_approvals_status ON user_approvals(status);
CREATE INDEX IF NOT EXISTS idx_user_approvals_user_id ON user_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_approvals_created_at ON user_approvals(created_at DESC);

-- Tabela para armazenar tokens de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  temp_password text NOT NULL,
  used boolean DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to reset tokens"
  ON password_reset_tokens FOR SELECT
  TO authenticated
  USING (false);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);