-- ==========================================
-- SCRIPT DE SEGURANÇA: RLS PARA RECUPERAÇÃO DE SENHA
-- ==========================================
-- Protege os tokens de recuperação de senha.

-- 1. Ativar RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas públicas antigas (se existirem)
DROP POLICY IF EXISTS "Public read access for password_reset_tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Public insert access for password_reset_tokens" ON public.password_reset_tokens;

-- 3. Criar nova política de SELECT restrita
-- Permitimos leitura para: 
-- a) Administradores (para aprovarem no painel)
-- b) Usuário dono do e-mail (se ele estiver logado)
-- Nota: O 'service_role' das Edge Functions automaticamente ignora o RLS.
CREATE POLICY "Apenas admin e dono do email podem ler password_reset_tokens" 
ON public.password_reset_tokens 
FOR SELECT 
USING (
  auth.email() = email OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. O Frontend NÃO precisa de INSERT/UPDATE/DELETE. 
-- Tudo é feito pela Edge Function 'process-password-reset' usando 'service_role'.
-- Por precaução, permitimos UPDATE apenas para admins logados pelo painel.
CREATE POLICY "Admins podem atualizar password_reset_tokens" 
ON public.password_reset_tokens 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins podem deletar password_reset_tokens" 
ON public.password_reset_tokens 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- NOTA DE CONFORMIDADE CTx: A partir de agora, toda nova FUNCTION criada terá o search_path travado. Exemplo abaixo (apenas exemplo estrutural, não afeta dados):
CREATE OR REPLACE FUNCTION public.compliance_check_example() 
RETURNS void 
LANGUAGE plpgsql 
SET search_path = public 
AS $$
BEGIN
  -- Dummy function to show compliance
  RETURN;
END;
$$;
