-- ==========================================
-- SCRIPT DE OTIMIZAÇÃO DE BANCO DE DADOS (SUPABASE)
-- ==========================================
-- Rode este script no "SQL Editor" do seu painel Supabase.

-- 1. CRIAÇÃO DE ÍNDICES (INDEXES)
-- Índices B-Tree tornam a busca por categorias, status e ordenação por data infinitamente mais rápidas,
-- evitando que o banco faça um "Full Table Scan" (ler a tabela inteira linha por linha).

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

-- PAINEL ADMIN (PROJETOS E CLIENTES)
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);


-- 2. OTIMIZAÇÃO DE RLS (Row Level Security)
-- Garantindo que as consultas "auth.uid()" processem relacionamentos rapidamente.
-- Para que o RLS não trave, as chaves estrangeiras que ligam tabelas a usuários precisam ser velozes.
-- (Verifique se sua tabela clients tem a coluna user_id mapeada para auth.users)
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);


-- 3. RECONSTRUÇÃO DE ESTATÍSTICAS (VACUUM ANALYZE)
-- O PostgreSQL precisa saber que você acabou de criar índices para começar a usá-los nas próximas requisições.
VACUUM ANALYZE portfolio;
VACUUM ANALYZE blog_posts;
VACUUM ANALYZE marketing_products;
VACUUM ANALYZE projects;
VACUUM ANALYZE clients;

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
