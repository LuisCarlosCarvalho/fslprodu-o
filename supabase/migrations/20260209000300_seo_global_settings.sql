-- Configurações Globais do Módulo SEO
-- Data: 2026-02-09

CREATE TABLE IF NOT EXISTS public.seo_global_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_pdf_export_enabled boolean DEFAULT true,
    feature_gsc_integration_enabled boolean DEFAULT true,
    feature_competitor_comparison_enabled boolean DEFAULT true,
    global_override_disabled boolean DEFAULT false,
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Inserir registro inicial se não existir
INSERT INTO public.seo_global_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.seo_global_settings);

-- Habilitar RLS
ALTER TABLE public.seo_global_settings ENABLE ROW LEVEL SECURITY;

-- Apenas Admins podem ver e editar configurações globais
CREATE POLICY "Only admins can manage global seo settings"
    ON public.seo_global_settings FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Qualquer usuário autenticado pode ler (para respeitar o feature gating no frontend)
CREATE POLICY "Authenticated users can read global seo settings"
    ON public.seo_global_settings FOR SELECT
    USING (auth.role() = 'authenticated');
