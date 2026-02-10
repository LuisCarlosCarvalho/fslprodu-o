-- Integração Google Search Console (OAuth2)
-- Data: 2026-02-09

-- 1. Tabela para Armazenamento de Tokens OAuth
CREATE TABLE IF NOT EXISTS public.google_integrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text, -- E-mail da conta Google vinculada
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    expires_at timestamptz NOT NULL,
    scopes text[] DEFAULT '{webmasters.readonly}',
    site_url_list text[] DEFAULT '{}', -- Listagem de sites autorizados no GSC
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Habilitar RLS
ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
-- Usuários podem ver apenas suas próprias integrações
CREATE POLICY "Users can view own google integration"
    ON public.google_integrations FOR SELECT
    USING (auth.uid() = user_id);

-- Somente o próprio usuário ou uma Edge Function (service_role) pode gerenciar
CREATE POLICY "Users can manage own google integration"
    ON public.google_integrations FOR ALL
    USING (auth.uid() = user_id);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_google_integrations_user_id ON public.google_integrations(user_id);

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_integrations_updated_at
BEFORE UPDATE ON public.google_integrations
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
