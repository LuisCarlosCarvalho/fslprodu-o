-- ==========================================
-- SCRIPT DE SEGURANÇA: ATIVAÇÃO DE RLS (Row Level Security)
-- ==========================================
-- Rode este script no "SQL Editor" do seu painel Supabase.

-- 1. ATIVAR RLS NAS TABELAS PRINCIPAIS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_products ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICAS DE LEITURA PÚBLICA (Todos podem ver o site)
-- Isso garante que os visitantes acessem as fotos, posts e produtos sem precisarem de login.
CREATE POLICY "Public read access for configuracoes" ON configuracoes FOR SELECT USING (true);
CREATE POLICY "Public read access for portfolio" ON portfolio FOR SELECT USING (true);
CREATE POLICY "Public read access for blog_posts" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Public read access for marketing_products" ON marketing_products FOR SELECT USING (true);

-- 3. CRIAR POLÍTICAS DE ESCRITA RESTRITA (Apenas Admins logados)
-- Isso garante que APENAS você (ou quem tiver feito login no painel / tiver JWT válido) possa alterar o banco.
-- auth.role() = 'authenticated' garante que o usuário possui um token JWT válido emitido pelo Supabase Auth.

-- Configuracoes
CREATE POLICY "Authenticated users can insert configuracoes" ON configuracoes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update configuracoes" ON configuracoes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete configuracoes" ON configuracoes FOR DELETE USING (auth.role() = 'authenticated');

-- Portfolio
CREATE POLICY "Authenticated users can insert portfolio" ON portfolio FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update portfolio" ON portfolio FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete portfolio" ON portfolio FOR DELETE USING (auth.role() = 'authenticated');

-- Blog Posts
CREATE POLICY "Authenticated users can insert blog_posts" ON blog_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update blog_posts" ON blog_posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete blog_posts" ON blog_posts FOR DELETE USING (auth.role() = 'authenticated');

-- Marketing Products (Infoproducts)
CREATE POLICY "Authenticated users can insert marketing_products" ON marketing_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update marketing_products" ON marketing_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete marketing_products" ON marketing_products FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
