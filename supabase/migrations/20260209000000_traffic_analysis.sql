-- Migração para Análise de Tráfego de Sites
-- Data: 2026-02-09

-- 1. Tabela para Cache de Tráfego de Domínios
-- Evita chamadas excessivas a APIs externas (SEMrush/SimilarWeb)
CREATE TABLE IF NOT EXISTS public.domain_traffic_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    domain text UNIQUE NOT NULL,
    country text NOT NULL DEFAULT 'Global',
    data jsonb NOT NULL, -- Contém métricas como visits, bounce_rate, channels, etc.
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- 2. Tabela para Relatórios de Tráfego Gerados
CREATE TABLE IF NOT EXISTS public.traffic_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    main_domain text NOT NULL,
    competitors text[] DEFAULT '{}',
    country text NOT NULL,
    time_range text NOT NULL, -- 7d, 30d, 90d, custom
    report_data jsonb NOT NULL, -- Dados completos consolidados para o relatório
    insights jsonb, -- Recomendações e camada de inteligência
    created_at timestamptz DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE public.domain_traffic_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_reports ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para domain_traffic_cache
-- Qualquer pessoa autenticada pode ler o cache (admins e clientes se permitirmos)
CREATE POLICY "Allow authenticated users to read domain cache"
    ON public.domain_traffic_cache FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admins podem gerenciar o cache
CREATE POLICY "Allow admins to manage domain cache"
    ON public.domain_traffic_cache FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 5. Políticas RLS para traffic_reports
-- Usuários podem ver apenas seus próprios relatórios
CREATE POLICY "Users can view own traffic reports"
    ON public.traffic_reports FOR SELECT
    USING (auth.uid() = user_id);

-- Admins podem ver todos os relatórios
CREATE POLICY "Admins can view all traffic reports"
    ON public.traffic_reports FOR SELECT
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Usuários podem criar seus relatórios
CREATE POLICY "Users can create own traffic reports"
    ON public.traffic_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_traffic_reports_user_id ON public.traffic_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_traffic_cache_domain ON public.domain_traffic_cache(domain);

-- 7. Função para limpeza de cache antigo (opcional, expirando após 30 dias)
CREATE OR REPLACE FUNCTION delete_old_traffic_cache() RETURNS void AS $$
BEGIN
    DELETE FROM public.domain_traffic_cache WHERE last_updated < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;
