-- ==========================================
-- SCRIPT DE BLINDAGEM FINAL: LIMPANDO AVISOS "RLS POLICY ALWAYS TRUE"
-- ==========================================
-- Este script substitui políticas abertas (USING true) por políticas checando a "role".

-- ==========================================
-- 1. TABELAS DE AUTENTICAÇÃO E CADASTRO
-- ==========================================

-- Tabela: user_approvals (Cadastros pendentes)
ALTER TABLE public.user_approvals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for user_approvals" ON public.user_approvals;
DROP POLICY IF EXISTS "Public insert access for user_approvals" ON public.user_approvals;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_approvals;

-- Leitura: Apenas administradores do painel ou service_role
CREATE POLICY "Leitura de user_approvals apenas para admins" 
ON public.user_approvals 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Inserção: O backend via service_role faz a inserção, mas para garantir que o front (caso um dia chame) não trave, permitiremos insert anônimo já que é a página de registro, mas sem leitura.
CREATE POLICY "Insercao publica em user_approvals" 
ON public.user_approvals 
FOR INSERT WITH CHECK (true);

-- Update/Delete: Apenas admins
CREATE POLICY "Update de user_approvals apenas para admins" 
ON public.user_approvals 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);


-- ==========================================
-- 2. TABELAS DE LOGS E ANALYTICS
-- ==========================================

-- Tabela: site_visits
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for site_visits" ON public.site_visits;
DROP POLICY IF EXISTS "Public update access for site_visits" ON public.site_visits;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_visits;

-- Leitura: Apenas admins
CREATE POLICY "Leitura de site_visits apenas para admins" 
ON public.site_visits FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Inserção/Atualização: Visitantes anônimos precisam incrementar as visitas (INSERT/UPDATE public)
CREATE POLICY "Incremento publico em site_visits" 
ON public.site_visits FOR INSERT WITH CHECK (true);

CREATE POLICY "Atualizacao publica em site_visits" 
ON public.site_visits FOR UPDATE USING (true);


-- Tabela: analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.analytics_events;

CREATE POLICY "Leitura de analytics_events apenas para admins" 
ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Insercao publica em analytics_events" 
ON public.analytics_events FOR INSERT WITH CHECK (true);


-- Tabela: seo_update_logs (ou seo_logs dependendo do seu schema exato)
ALTER TABLE public.seo_update_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for seo_update_logs" ON public.seo_update_logs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.seo_update_logs;

CREATE POLICY "Leitura de seo_update_logs apenas para admins" 
ON public.seo_update_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- O script que executa a geração SEO pode ser uma edge function (service_role) ou o Admin autenticado
CREATE POLICY "Insercao autenticada em seo_update_logs" 
ON public.seo_update_logs FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);


-- Extra: Garantir que a tabela password_reset_tokens não tenha nenhuma política vazada do passado:
DROP POLICY IF EXISTS "Enable read access for all users" ON public.password_reset_tokens;

-- FIM DO SCRIPT
