# Sistema de Aprovação e Recuperação de Senha

## Visão Geral

Sistema completo de aprovação de novos usuários e recuperação de senha com notificações por email para o administrador (brasilviptv@gmail.com).

## Fluxo de Aprovação de Novos Usuários

### 1. Registro do Usuário
Quando um novo usuário se registra:
1. Uma conta é criada no Supabase Auth
2. Um perfil é criado na tabela `profiles` com role 'client'
3. Uma solicitação de aprovação é criada na tabela `user_approvals`
4. Uma notificação é enviada para brasilviptv@gmail.com (via Edge Function)

### 2. Aprovação pelo Admin
O administrador pode:
1. Acessar `/approvals` no painel administrativo
2. Visualizar todas as solicitações pendentes
3. Aprovar ou rejeitar cada solicitação
4. Ver histórico de todas as aprovações

### 3. Email de Aprovação
O email enviado contém:
- Nome completo do usuário
- Email
- Telefone (se fornecido)
- Link para o painel administrativo

**Nota:** Atualmente o sistema registra as aprovações mas o envio real de email precisa ser configurado com um serviço de email (SendGrid, Resend, etc.)

## Fluxo de Recuperação de Senha

### 1. Solicitação do Usuário
Quando um usuário esquece a senha:
1. Clica em "Esqueceu a senha?" na página de login
2. Informa o email
3. O sistema gera uma senha temporária aleatória
4. A senha temporária é salva na tabela `password_reset_tokens`
5. Uma notificação é enviada para brasilviptv@gmail.com

### 2. Reset pelo Admin
O administrador pode:
1. Acessar `/approvals` no painel administrativo
2. Visualizar todas as solicitações de reset pendentes
3. Ver a senha temporária gerada
4. Clicar em "Resetar Senha" para aplicar a mudança
5. Copiar a senha temporária e enviar para o usuário

### 3. Email de Reset
O email enviado ao admin contém:
- Email do usuário
- Senha temporária gerada
- Botão para confirmar o reset
- Data de expiração (24 horas)

**Importante:** O usuário deve mudar a senha após o primeiro acesso.

## Estrutura do Banco de Dados

### Tabela: user_approvals
```sql
- id: uuid (PK)
- user_id: uuid (FK para auth.users)
- email: text
- full_name: text
- phone: text
- status: 'pending' | 'approved' | 'rejected'
- approved_by: uuid (FK para profiles)
- approved_at: timestamptz
- rejection_reason: text
- created_at: timestamptz
```

### Tabela: password_reset_tokens
```sql
- id: uuid (PK)
- user_id: uuid (FK para auth.users)
- email: text
- token: text (único)
- temp_password: text
- used: boolean
- expires_at: timestamptz (24 horas)
- created_at: timestamptz
```

## Edge Functions

### send-approval-email
**Endpoint:** `/functions/v1/send-approval-email`
**Método:** POST
**Autenticação:** Requerida (JWT)

**Payload:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "fullName": "Nome do Usuário",
  "phone": "11999999999"
}
```

### send-password-reset
**Endpoint:** `/functions/v1/send-password-reset`
**Método:** POST
**Autenticação:** Não requerida

**Payload:**
```json
{
  "email": "user@example.com"
}
```

## Acesso à Página de Administração

1. Fazer login como admin (brasilviptv@gmail.com)
2. No painel administrativo, clicar em "Aprovações e Recuperação de Senha"
3. Ou acessar diretamente: `/approvals`

## Segurança

### Políticas RLS (Row Level Security)

**user_approvals:**
- Apenas admins podem visualizar e gerenciar aprovações
- INSERT permitido para sistema criar registros

**password_reset_tokens:**
- Nenhum acesso direto permitido (apenas via Edge Functions com service role)

### Proteção de Rotas
- A página `/approvals` só é acessível para usuários com role 'admin'
- Redirecionamento automático para home se não autorizado

## Configuração de Email (Próximos Passos)

Para ativar o envio real de emails:

1. Escolher um serviço de email (recomendado: Resend ou SendGrid)
2. Obter API key do serviço
3. Configurar variáveis de ambiente no Supabase:
   - `EMAIL_API_KEY`
   - `EMAIL_FROM` (brasilviptv@gmail.com)
4. Atualizar as Edge Functions para usar o serviço de email

### Exemplo com Resend:
```typescript
import { Resend } from 'npm:resend';

const resend = new Resend(Deno.env.get('EMAIL_API_KEY'));

await resend.emails.send({
  from: 'noreply@seudominio.com',
  to: 'brasilviptv@gmail.com',
  subject: 'Nova solicitação de aprovação',
  html: emailContent,
});
```

## Teste do Sistema

### Testar Aprovação:
1. Fazer logout
2. Criar um novo usuário em `/register`
3. Verificar se aparece na lista de aprovações pendentes
4. Aprovar o usuário
5. Verificar se status mudou para 'approved'

### Testar Recuperação de Senha:
1. Na página de login, clicar em "Esqueceu a senha?"
2. Informar um email existente
3. Verificar se aparece na lista de recuperações pendentes
4. Clicar em "Resetar Senha"
5. Testar login com a senha temporária
6. Usuário deve alterar a senha após primeiro acesso

## Arquivos Modificados/Criados

### Criados:
- `/src/pages/ApprovalsPage.tsx` - Página de administração
- `/supabase/functions/send-approval-email/index.ts` - Edge Function
- `/supabase/functions/send-password-reset/index.ts` - Edge Function
- Migration: `create_user_approvals_table.sql`

### Modificados:
- `/src/contexts/AuthContext.tsx` - Integração com Edge Functions
- `/src/App.tsx` - Adicionada rota `/approvals`
- `/src/pages/AdminDashboard.tsx` - Botão para página de aprovações

## Suporte

Para dúvidas ou problemas:
1. Verificar logs no console do navegador (F12)
2. Verificar logs das Edge Functions no Dashboard do Supabase
3. Verificar políticas RLS e permissões no banco de dados
