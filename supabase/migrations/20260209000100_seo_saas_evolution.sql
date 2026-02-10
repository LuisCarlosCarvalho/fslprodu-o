-- Evolução do Módulo de Tráfego para SaaS
-- Data: 2026-02-09

-- 1. Tabela de Planos e Limites
CREATE TABLE IF NOT EXISTS public.user_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan_type text NOT NULL DEFAULT 'FREE', -- FREE, PRO, BUSINESS, ENTERPRISE
    analyses_limit int NOT NULL DEFAULT 3,
    analyses_used int NOT NULL DEFAULT 0,
    features_unlocked text[] DEFAULT '{}', -- ['export_pdf', 'competitive_comparison', 'gsc_integration']
    next_reset_date timestamptz DEFAULT (now() + interval '1 month'),
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- 2. Tabela de Logs de Uso de API (Monitoramento de Custo)
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    service_name text NOT NULL, -- 'SEMrush', 'SimilarWeb', 'GSC'
    endpoint text NOT NULL,
    cost_estimated float DEFAULT 0.0, -- Custo estimado em USD por chamada
    status_code int,
    request_payload jsonb,
    created_at timestamptz DEFAULT now()
);

-- 3. Atualização da Tabela traffic_reports
ALTER TABLE public.traffic_reports 
ADD COLUMN IF NOT EXISTS opportunity_score int DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_trust_level text DEFAULT 'Estimated', -- High, Medium, Estimated
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS share_token text UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex');

-- 4. Habilitar RLS e Políticas
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seu próprio plano
CREATE POLICY "Users can view own plan"
    ON public.user_plans FOR SELECT
    USING (auth.uid() = user_id);

-- Admins podem gerenciar planos
CREATE POLICY "Admins can manage all plans"
    ON public.user_plans FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Apenas Admins podem ver logs de API
CREATE POLICY "Only admins can view api logs"
    ON public.api_usage_logs FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_service ON public.api_usage_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_traffic_reports_share_token ON public.traffic_reports(share_token);
