-- ==========================================
-- SCRIPT DE OTIMIZAÇÃO DE BANCO DE DADOS (SUPABASE) - CORRIGIDO
-- ==========================================
-- Rode este script no "SQL Editor" do seu painel Supabase.

-- 1. CRIAÇÃO DE ÍNDICES (INDEXES)
-- Índices B-Tree tornam a busca por categorias, status e ordenação por data infinitamente mais rápidas.

-- PORTFÓLIO
CREATE INDEX IF NOT EXISTS idx_portfolio_is_active ON portfolio(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio(created_at DESC);

-- BLOG
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- SEO DE GESTÃO (INFOPRODUCTS)
CREATE INDEX IF NOT EXISTS idx_marketing_products_status ON marketing_products(status);
CREATE INDEX IF NOT EXISTS idx_marketing_products_created_at ON marketing_products(created_at DESC);

-- PAINEL ADMIN E RELACIONAMENTOS (PROJETOS)
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- CLIENTES (Na verdade é a tabela "profiles" de acordo com o seu código)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role); -- Ajuda a filtrar admins vs clients
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- SOLICITAÇÕES DE ORÇAMENTO
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
