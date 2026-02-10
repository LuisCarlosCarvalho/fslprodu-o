/*
  # Documentação de Troubleshooting - Erro de Login
  
  ## Problema Identificado
  Erro "database error querying schema" ao tentar fazer login
  
  ## Estado Atual do Sistema
  1. Tabelas
     - profiles: existe com RLS habilitado
     - auth.users: funcional
  
  2. Políticas RLS Ativas
     - "Enable read for authenticated users": permite usuários lerem próprio perfil
     - "Enable update for users and admins": permite atualização
     - "Enable delete for admins only": apenas admins podem deletar
  
  3. Triggers Ativos
     - on_auth_user_created: cria perfil automaticamente após signup
     - update_profiles_updated_at: atualiza timestamp
  
  4. Usuário Admin
     - Email: brasilviptv@gmail.com
     - ID: bb5ebfb7-98b0-4600-93ad-12a1750175c2
     - Role: admin (em app_metadata e profiles)
  
  ## Possíveis Causas do Erro
  1. Política RLS muito restritiva durante o login
  2. Race condition ao carregar perfil
  3. Problema com auth.jwt() durante autenticação inicial
  
  ## Soluções para Testar
  Opção A: Criar política temporária mais permissiva para SELECT
  Opção B: Modificar AuthContext para handle de erro mais robusto
  Opção C: Adicionar delay no loadProfile após login
*/

-- Criar uma view para debug
CREATE OR REPLACE VIEW profiles_debug AS
SELECT 
  p.id,
  p.role,
  p.full_name,
  p.phone,
  u.email,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id;

-- Comentário: Esta view pode ser usada para verificar dados sem RLS
COMMENT ON VIEW profiles_debug IS 'View para debug - mostra profiles com emails (sem RLS)';