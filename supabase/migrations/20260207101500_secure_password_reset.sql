-- Migração para tornar o reset de senha seguro
-- Remove a coluna temp_password que armazenava senhas em texto claro

ALTER TABLE password_reset_tokens DROP COLUMN IF EXISTS temp_password;

-- Adiciona um campo para rastrear o status do reset (opcional, se quiser mais controle)
-- ALTER TABLE password_reset_tokens ADD COLUMN status text DEFAULT 'pending';
