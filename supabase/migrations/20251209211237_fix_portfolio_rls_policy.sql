/*
  # Corrigir Política RLS do Portfolio

  1. Alterações
    - Remove política antiga que usa 'public'
    - Cria nova política correta usando 'anon' e 'authenticated'
    
  2. Segurança
    - Permite acesso público de leitura aos portfolios ativos
    - Mantém restrições para admins em outras operações
*/

-- Remover política antiga
DROP POLICY IF EXISTS "Anyone can view active portfolio items" ON portfolio;

-- Criar política correta
CREATE POLICY "Public can view active portfolio items"
  ON portfolio
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
